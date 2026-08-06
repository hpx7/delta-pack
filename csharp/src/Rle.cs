namespace DeltaPack;

/// <summary>
/// Streaming RLE writer - encodes bits on-the-fly without buffering.
/// </summary>
public class RleWriter
{
    private byte[] _bytes = new byte[64];
    private int _bytesLen;
    private int _currentByte;
    private int _bitPos;
    private int _totalBits;
    private int _runValue = -1;
    private int _runCount;

    public void Reset()
    {
        _bytesLen = 0;
        _currentByte = 0;
        _bitPos = 0;
        _totalBits = 0;
        _runValue = -1;
        _runCount = 0;
    }

    private void AppendByte(byte b)
    {
        if (_bytesLen == _bytes.Length)
            Array.Resize(ref _bytes, _bytes.Length * 2);
        _bytes[_bytesLen++] = b;
    }

    public void PushBit(bool val)
    {
        var bit = val ? 1 : 0;
        if (_runValue == -1)
        {
            _runValue = bit;
            _runCount = 1;
            WriteBit(bit);
        }
        else if (bit == _runValue)
        {
            _runCount++;
        }
        else
        {
            EmitRunLength(_runCount);
            _runValue = bit;
            _runCount = 1;
        }
    }

    public void PushBits(int val, int numBits)
    {
        for (var i = numBits - 1; i >= 0; i--)
            PushBit(((val >> i) & 1) == 1);
    }

    public int WriteToBuffer(byte[] output, int startPos)
    {
        if (_runValue == -1)
        {
            // No bits written
            return WriteReverseUVarint(output, startPos, 0);
        }

        EmitRunLength(_runCount);
        _runValue = -1; // Mark as flushed

        // Flush remaining bits in current byte
        if (_bitPos > 0)
            AppendByte((byte)_currentByte);

        // Copy RLE bytes to output
        Buffer.BlockCopy(_bytes, 0, output, startPos, _bytesLen);
        var pos = startPos + _bytesLen;

        // Write reverse varint for total bits
        return WriteReverseUVarint(output, pos, _totalBits);
    }

    private void WriteBit(int bit)
    {
        if (bit == 1)
            _currentByte |= 1 << _bitPos;

        _bitPos++;
        _totalBits++;

        if (_bitPos == 8)
        {
            AppendByte((byte)_currentByte);
            _currentByte = 0;
            _bitPos = 0;
        }
    }

    private void WriteBits(int val, int numBits)
    {
        for (var i = numBits - 1; i >= 0; i--)
            WriteBit((val >> i) & 1);
    }

    // Tier 5 payload is 8 bits (values 0-255), mapping to counts 14-269. Value 255 is
    // reserved as an escape sentinel so counts >= 269 stay representable: the true count
    // is `269 + varint`, keeping the byte cost for the common 14-268 range unchanged.
    private const int RunLengthEscape = 269;
    private const int RunLengthEscapeSentinel = 255;

    private void EmitRunLength(int count)
    {
        if (count == 1)
        {
            WriteBit(0);
        }
        else if (count <= 3)
        {
            WriteBits(0b100 | (count - 2), 3);
        }
        else if (count <= 5)
        {
            WriteBits(0b1100 | (count - 4), 4);
        }
        else if (count <= 13)
        {
            WriteBits((0b1110 << 3) | (count - 6), 7);
        }
        else if (count < RunLengthEscape)
        {
            WriteBits((0b1111 << 8) | (count - 14), 12);
        }
        else
        {
            WriteBits((0b1111 << 8) | RunLengthEscapeSentinel, 12);
            WriteUVarintBits((uint)(count - RunLengthEscape));
        }
    }

    private void WriteUVarintBits(uint val)
    {
        while (val >= 0x80)
        {
            WriteBits((int)((val & 0x7F) | 0x80), 8);
            val >>= 7;
        }
        WriteBits((int)val, 8);
    }

    private static int WriteReverseUVarint(byte[] output, int pos, int val)
    {
        if (val < 0x80)
        {
            output[pos++] = (byte)val;
        }
        else
        {
            pos = WriteReverseUVarint(output, pos, val >> 7);
            output[pos++] = (byte)((val & 0x7F) | 0x80);
        }
        return pos;
    }
}

/// <summary>
/// Streaming RLE reader - decodes bits lazily on-demand.
/// </summary>
public class RleReader
{
    private const int RunLengthEscape = 269;
    private const int RunLengthEscapeSentinel = 255;

    // LEB128 varints for a 32-bit value never need more than 5 continuation bytes. Capping
    // both varint readers here keeps every shift strictly below 32, so a uint/int shift can
    // never wrap via C#'s "shift count masked to the low 5 bits" rule and silently fold a
    // high byte's bits back onto ones already decoded.
    private const int MaxVarintBytes = 5;

    private byte[] _buf = null!;
    private int _bytePos;
    private int _currentByte;
    private int _bitPos;
    private bool _value;
    private int _remaining;
    private bool _initialized;

    // Ground truth for how many encoded bits this buffer's RLE region contains, taken from
    // the trailing reverse-varint written by the encoder. Every ReadBit() call is checked
    // against it so a corrupted run-length code fails fast instead of silently reading past
    // the end of its own region.
    private int _numBits;
    private int _bitsRead;

    public void Reset(byte[] buf)
    {
        _buf = buf;
        _currentByte = 0;
        _bitPos = 8;
        _bitsRead = 0;

        var (numBits, varintLen) = ReadReverseUVarint(buf);
        if (numBits == 0)
        {
            _initialized = false;
            return;
        }

        if (numBits < 0)
            throw new InvalidOperationException("RLE header declares a negative bit length");

        _numBits = numBits;
        var numRleBytes = (numBits + 7) / 8;
        _bytePos = buf.Length - varintLen - numRleBytes;
        if (_bytePos < 0)
            throw new InvalidOperationException("RLE header declares a bit length larger than the buffer");

        _value = ReadBit() == 1;
        _remaining = DecodeRunLength();
        _initialized = true;
    }

    public bool NextBit()
    {
        if (!_initialized)
            throw new InvalidOperationException("No bits to read");

        if (_remaining == 0)
        {
            _value = !_value;
            _remaining = DecodeRunLength();
        }

        _remaining--;
        return _value;
    }

    public int NextBits(int numBits)
    {
        var val = 0;
        for (var i = numBits - 1; i >= 0; i--)
        {
            if (NextBit())
                val |= 1 << i;
        }
        return val;
    }

    private int ReadBit()
    {
        if (_bitsRead++ >= _numBits)
            throw new InvalidOperationException("RLE stream overran its declared bit length");

        if (_bitPos == 8)
        {
            _currentByte = _buf[_bytePos++];
            _bitPos = 0;
        }
        return (_currentByte >> _bitPos++) & 1;
    }

    private int ReadBits(int numBits)
    {
        var val = 0;
        for (var i = numBits - 1; i >= 0; i--)
        {
            if (ReadBit() == 1)
                val |= 1 << i;
        }
        return val;
    }

    private int DecodeRunLength()
    {
        if (ReadBit() == 0) return 1;
        if (ReadBit() == 0) return ReadBits(1) + 2;
        if (ReadBit() == 0) return ReadBits(1) + 4;
        if (ReadBit() == 0) return ReadBits(3) + 6;

        var payload = ReadBits(8);
        if (payload < RunLengthEscapeSentinel)
            return payload + 14;

        var extra = ReadUVarintBits();
        if (extra > int.MaxValue - RunLengthEscape)
            throw new InvalidOperationException("RLE run length too large");
        return RunLengthEscape + (int)extra;
    }

    private uint ReadUVarintBits()
    {
        uint result = 0;
        var shift = 0;
        for (var group = 0; ; group++)
        {
            if (group >= MaxVarintBytes)
                throw new InvalidOperationException("RLE escape varint too long");

            var b = (uint)ReadBits(8);
            result |= (b & 0x7F) << shift;
            if (b < 0x80)
                return result;
            shift += 7;
        }
    }

    private static (int value, int bytesRead) ReadReverseUVarint(byte[] buf)
    {
        var value = 0;
        for (var i = 0; i < buf.Length && i < MaxVarintBytes; i++)
        {
            var b = buf[buf.Length - 1 - i];
            value |= (b & 0x7F) << (i * 7);
            if (b < 0x80)
                return (value, i + 1);
        }
        throw new InvalidOperationException("Invalid varint");
    }
}
