namespace DeltaPack;

public static class Rle
{
    public static void Encode(List<bool> bits, List<byte> output)
    {
        if (bits.Count == 0)
        {
            WriteReverseUVarint(output, 0);
            return;
        }

        var currentByte = 0;
        var bitPos = 0;
        var totalBits = 0;

        void WriteBit(bool bit)
        {
            if (bit)
                currentByte |= 1 << bitPos;

            bitPos++;
            totalBits++;

            if (bitPos == 8)
            {
                output.Add((byte)currentByte);
                currentByte = 0;
                bitPos = 0;
            }
        }

        void WriteBits(int val, int numBits)
        {
            for (var i = numBits - 1; i >= 0; i--)
                WriteBit((val & (1 << i)) > 0);
        }

        var last = bits[0];
        var count = 1;
        WriteBit(last);

        for (var i = 1; i <= bits.Count; i++)
        {
            if (i < bits.Count && bits[i] == last)
            {
                count++;
            }
            else
            {
                // Variable-length unary coding for run lengths
                if (count == 1)
                {
                    WriteBit(false);
                }
                else if (count <= 3)
                {
                    WriteBit(true);
                    WriteBit(false);
                    WriteBit(count == 3);
                }
                else if (count <= 5)
                {
                    WriteBit(true);
                    WriteBit(true);
                    WriteBit(false);
                    WriteBit(count == 5);
                }
                else if (count <= 13)
                {
                    WriteBit(true);
                    WriteBit(true);
                    WriteBit(true);
                    WriteBit(false);
                    WriteBits(count - 6, 3);
                }
                else if (count <= 269)
                {
                    WriteBit(true);
                    WriteBit(true);
                    WriteBit(true);
                    WriteBit(true);
                    WriteBits(count - 14, 8);
                }
                else
                {
                    throw new InvalidOperationException($"RLE count too large: {count}");
                }

                if (i < bits.Count)
                {
                    last = bits[i];
                    count = 1;
                }
            }
        }

        // Flush remaining bits
        if (bitPos > 0)
            output.Add((byte)currentByte);

        WriteReverseUVarint(output, totalBits);
    }

    public static bool[] Decode(byte[] buf)
    {
        var (numBits, varintLen) = ReadReverseUVarint(buf);
        if (numBits == 0)
            return Array.Empty<bool>();

        var numRleBytes = (numBits + 7) / 8;
        var bytePos = buf.Length - varintLen - numRleBytes;
        var currentByte = 0;
        var bitPos = 8; // Start at 8 to trigger first byte read
        var bitsRead = 0;

        int ReadBit()
        {
            if (bitPos == 8)
            {
                currentByte = buf[bytePos++];
                bitPos = 0;
            }
            bitsRead++;
            return (currentByte >> bitPos++) & 1;
        }

        int ReadBits(int numBitsToRead)
        {
            var val = 0;
            for (var i = numBitsToRead - 1; i >= 0; i--)
            {
                if (ReadBit() == 1)
                    val |= 1 << i;
            }
            return val;
        }

        var bits = new List<bool>();
        var last = ReadBit() == 1;

        while (bitsRead < numBits)
        {
            int count;

            // Variable-length unary decoding
            if (ReadBit() == 0)
            {
                // '0' = run of 1
                count = 1;
            }
            else if (ReadBit() == 0)
            {
                // '10' + 1 bit = run of 2-3
                count = ReadBits(1) + 2;
            }
            else if (ReadBit() == 0)
            {
                // '110' + 1 bit = run of 4-5
                count = ReadBits(1) + 4;
            }
            else if (ReadBit() == 0)
            {
                // '1110' + 3 bits = run of 6-13
                count = ReadBits(3) + 6;
            }
            else
            {
                // '1111' + 8 bits = run of 14-269
                count = ReadBits(8) + 14;
            }

            for (var i = 0; i < count; i++)
                bits.Add(last);

            last = !last;
        }

        return bits.ToArray();
    }

    private static void WriteReverseUVarint(List<byte> output, int val)
    {
        if (val < 0x80)
        {
            output.Add((byte)val);
        }
        else
        {
            WriteReverseUVarint(output, val >> 7);
            output.Add((byte)((val & 0x7F) | 0x80));
        }
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
