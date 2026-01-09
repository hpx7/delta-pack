namespace DeltaPack;

/// <summary>
/// Streaming RLE writer - encodes bits on-the-fly without buffering.
/// </summary>
public class RleWriter
{
    private readonly List<byte> _bytes = new(64);
    private int _currentByte;
    private int _bitPos;
    private int _totalBits;
    private int _runValue = -1;
    private int _runCount;

    public void Reset()
    {
        _bytes.Clear();
        _currentByte = 0;
        _bitPos = 0;
        _totalBits = 0;
        _runValue = -1;
        _runCount = 0;
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
            _bytes.Add((byte)_currentByte);

        // Copy RLE bytes to output
        var pos = startPos;
        foreach (var b in _bytes)
            output[pos++] = b;

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
            _bytes.Add((byte)_currentByte);
            _currentByte = 0;
            _bitPos = 0;
        }
    }

    private void WriteBits(int val, int numBits)
    {
        for (var i = numBits - 1; i >= 0; i--)
            WriteBit((val >> i) & 1);
    }

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
        else if (count <= 269)
        {
            WriteBits((0b1111 << 8) | (count - 14), 12);
        }
        else
        {
            throw new InvalidOperationException($"RLE count too large: {count}");
        }
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
    private byte[] _buf = null!;
    private int _bytePos;
    private int _currentByte;
    private int _bitPos;
    private bool _value;
    private int _remaining;
    private bool _initialized;

    public void Reset(byte[] buf)
    {
        _buf = buf;
        _currentByte = 0;
        _bitPos = 8;

        var (numBits, varintLen) = ReadReverseUVarint(buf);
        if (numBits == 0)
        {
            _initialized = false;
            return;
        }

        var numRleBytes = (numBits + 7) / 8;
        _bytePos = buf.Length - varintLen - numRleBytes;
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
        return ReadBits(8) + 14;
    }

    private static (int value, int bytesRead) ReadReverseUVarint(byte[] buf)
    {
        var value = 0;
        for (var i = 0; i < buf.Length; i++)
        {
            var b = buf[buf.Length - 1 - i];
            value |= (b & 0x7F) << (i * 7);
            if (b < 0x80)
                return (value, i + 1);
        }
        throw new InvalidOperationException("Invalid varint");
    }
}
