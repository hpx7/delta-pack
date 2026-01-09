using Xunit;

namespace DeltaPack.Tests;

public class RleTests
{
    private static byte[] Encode(List<bool> bits)
    {
        var writer = new RleWriter();
        writer.Reset();
        foreach (var bit in bits)
            writer.PushBit(bit);

        var output = new byte[1024];
        var len = writer.WriteToBuffer(output, 0);
        return output[..len];
    }

    private static List<bool> Decode(byte[] encoded, int expectedBits)
    {
        if (expectedBits == 0)
            return new List<bool>();

        var reader = new RleReader();
        reader.Reset(encoded);

        var bits = new List<bool>(expectedBits);
        for (var i = 0; i < expectedBits; i++)
            bits.Add(reader.NextBit());
        return bits;
    }

    [Fact]
    public void EmptyBits_RoundTrips()
    {
        var bits = new List<bool>();
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Empty(decoded);
    }

    [Fact]
    public void SingleTrue_RoundTrips()
    {
        var bits = new List<bool> { true };
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void SingleFalse_RoundTrips()
    {
        var bits = new List<bool> { false };
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void AlternatingBits_RoundTrips()
    {
        var bits = new List<bool> { true, false, true, false, true, false };
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf2_RoundTrips()
    {
        var bits = new List<bool> { true, true };
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf3_RoundTrips()
    {
        var bits = new List<bool> { false, false, false };
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf5_RoundTrips()
    {
        var bits = new List<bool> { true, true, true, true, true };
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf13_RoundTrips()
    {
        var bits = Enumerable.Repeat(true, 13).ToList();
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf100_RoundTrips()
    {
        var bits = Enumerable.Repeat(false, 100).ToList();
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf269_RoundTrips()
    {
        var bits = Enumerable.Repeat(true, 269).ToList();
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void MixedRuns_RoundTrips()
    {
        // 3 true, 5 false, 1 true, 10 false, 2 true
        var bits = new List<bool>();
        bits.AddRange(Enumerable.Repeat(true, 3));
        bits.AddRange(Enumerable.Repeat(false, 5));
        bits.AddRange(Enumerable.Repeat(true, 1));
        bits.AddRange(Enumerable.Repeat(false, 10));
        bits.AddRange(Enumerable.Repeat(true, 2));

        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void LargeRandomPattern_RoundTrips()
    {
        var random = new Random(42);
        var bits = Enumerable.Range(0, 1000).Select(_ => random.Next(2) == 1).ToList();

        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf270_ThrowsException()
    {
        var writer = new RleWriter();
        writer.Reset();

        // Push 270 identical bits - should throw on WriteToBuffer
        for (var i = 0; i < 270; i++)
            writer.PushBit(true);

        var output = new byte[1024];
        Assert.Throws<InvalidOperationException>(() => writer.WriteToBuffer(output, 0));
    }

    [Fact]
    public void CompressesLongRuns()
    {
        // 100 identical bits should compress well
        var bits = Enumerable.Repeat(true, 100).ToList();
        var output = Encode(bits);

        // Should be much smaller than 100 bits (13 bytes uncompressed)
        Assert.True(output.Length < 10);
    }

    [Fact]
    public void PrefixData_IsPreserved()
    {
        // Simulate encoding RLE after other data
        var bits = new List<bool> { true, false, true, true, false };
        var output = new byte[1024];

        // Add some prefix data (simulating field data before RLE)
        var prefixData = new byte[] { 0x01, 0x02, 0x03, 0x04 };
        Array.Copy(prefixData, output, prefixData.Length);

        var writer = new RleWriter();
        writer.Reset();
        foreach (var bit in bits)
            writer.PushBit(bit);

        var finalLen = writer.WriteToBuffer(output, prefixData.Length);

        // Verify prefix data is preserved
        Assert.Equal(prefixData, output[..prefixData.Length]);

        // Decode should work with the full buffer (reads from end)
        var reader = new RleReader();
        reader.Reset(output[..finalLen]);

        var decoded = new List<bool>();
        for (var i = 0; i < bits.Count; i++)
            decoded.Add(reader.NextBit());

        Assert.Equal(bits, decoded);
    }
}
