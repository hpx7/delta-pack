namespace DeltaPack;

/// <summary>
/// Varint encoding/decoding using protobuf-style LEB128 format.
/// Uses little-endian (lower 7 bits first) with MSB continuation bit.
/// </summary>
internal static class Varint
{
    public static void WriteUVarint(List<byte> output, ulong val)
    {
        // Protobuf-style LEB128: little-endian, 7 bits per byte, MSB is continuation
        while (val >= 0x80)
        {
            output.Add((byte)(val | 0x80));
            val >>= 7;
        }
        output.Add((byte)val);
    }

    public static void WriteVarint(List<byte> output, long val)
    {
        // Zigzag encoding: 0→0, -1→1, 1→2, -2→3, 2→4, ...
        var unsigned = (ulong)((val << 1) ^ (val >> 63));
        WriteUVarint(output, unsigned);
    }

    public static ulong ReadUVarint(byte[] buf, ref int pos)
    {
        // Protobuf-style LEB128: little-endian, 7 bits per byte, MSB is continuation
        ulong result = 0;
        var shift = 0;
        while (true)
        {
            var b = buf[pos++];
            result |= (ulong)(b & 0x7F) << shift;
            if (b < 0x80)
                return result;
            shift += 7;
        }
    }

    public static long ReadVarint(byte[] buf, ref int pos)
    {
        var unsigned = ReadUVarint(buf, ref pos);
        // Zigzag decoding
        return unsigned % 2 == 0 ? (long)(unsigned / 2) : -((long)(unsigned + 1) / 2);
    }
}
