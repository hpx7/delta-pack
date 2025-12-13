using Xunit;

namespace DeltaPack.Tests;

public class RleTests
{
    [Fact]
    public void EmptyBits_RoundTrips()
    {
        var bits = new List<bool>();
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Empty(decoded);
    }

    [Fact]
    public void SingleTrue_RoundTrips()
    {
        var bits = new List<bool> { true };
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void SingleFalse_RoundTrips()
    {
        var bits = new List<bool> { false };
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void AlternatingBits_RoundTrips()
    {
        var bits = new List<bool> { true, false, true, false, true, false };
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf2_RoundTrips()
    {
        var bits = new List<bool> { true, true };
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf3_RoundTrips()
    {
        var bits = new List<bool> { false, false, false };
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf5_RoundTrips()
    {
        var bits = new List<bool> { true, true, true, true, true };
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf13_RoundTrips()
    {
        var bits = Enumerable.Repeat(true, 13).ToList();
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf100_RoundTrips()
    {
        var bits = Enumerable.Repeat(false, 100).ToList();
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf269_RoundTrips()
    {
        var bits = Enumerable.Repeat(true, 269).ToList();
        var output = new List<byte>();

        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

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

        var output = new List<byte>();
        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void LargeRandomPattern_RoundTrips()
    {
        var random = new Random(42);
        var bits = Enumerable.Range(0, 1000).Select(_ => random.Next(2) == 1).ToList();

        var output = new List<byte>();
        Rle.Encode(bits, output);
        var decoded = Rle.Decode(output.ToArray());

        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void RunOf270_ThrowsException()
    {
        var bits = Enumerable.Repeat(true, 270).ToList();
        var output = new List<byte>();

        Assert.Throws<InvalidOperationException>(() => Rle.Encode(bits, output));
    }

    [Fact]
    public void CompressesLongRuns()
    {
        // 100 identical bits should compress well
        var bits = Enumerable.Repeat(true, 100).ToList();
        var output = new List<byte>();

        Rle.Encode(bits, output);

        // Should be much smaller than 100 bits (13 bytes uncompressed)
        Assert.True(output.Count < 10);
    }

    [Fact]
    public void PrefixData_IsPreserved()
    {
        // Simulate encoding RLE after other data
        var bits = new List<bool> { true, false, true, true, false };
        var output = new List<byte>();

        // Add some prefix data (simulating field data before RLE)
        var prefixData = new byte[] { 0x01, 0x02, 0x03, 0x04 };
        output.AddRange(prefixData);

        var rleStartIndex = output.Count;
        Rle.Encode(bits, output);

        // Create buffer with prefix + RLE data
        var fullBuffer = output.ToArray();

        // Decode should work with the full buffer (reads from end)
        var decoded = Rle.Decode(fullBuffer);

        Assert.Equal(bits, decoded);
    }
}
