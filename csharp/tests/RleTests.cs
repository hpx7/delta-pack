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

        var output = new byte[1024 * 1024];
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

    // Independent re-derivation of the writer's bit cost, used to prove the escape-sentinel
    // fix does not change the wire cost for counts 1-268 (the pre-fix representable range)
    // and that counts >= 269 cost exactly "12 bits + one bit-level LEB128 varint".
    private static int ExpectedRunLengthBits(int count)
    {
        if (count == 1) return 1;
        if (count <= 3) return 3;
        if (count <= 5) return 4;
        if (count <= 13) return 7;
        if (count <= 268) return 12;

        var groups = 0;
        var v = (uint)(count - 269);
        do
        {
            groups++;
            v >>= 7;
        } while (v > 0);
        return 12 + groups * 8;
    }

    private static int ExpectedVarintLength(int val)
    {
        var len = 0;
        do
        {
            len++;
            val >>= 7;
        } while (val > 0);
        return len;
    }

    private static int ExpectedEncodedByteLength(int count)
    {
        var totalBits = 1 + ExpectedRunLengthBits(count); // leading value bit + run-length code
        var rleBytes = (totalBits + 7) / 8;
        return rleBytes + ExpectedVarintLength(totalBits);
    }

    private static byte[] EncodeUniformRun(int count, bool value)
        => Encode(Enumerable.Repeat(value, count).ToList());

    // -- Malformed / adversarial input helpers -------------------------------------------
    // These hand-craft raw wire bytes directly (bypassing RleWriter) to simulate a
    // corrupted or hostile buffer reaching RleReader -- something RleWriter itself can
    // never produce, since it never emits values outside these encodings' valid ranges.

    private static void AddByteBitsMsbFirst(List<bool> bits, byte value)
    {
        for (var i = 7; i >= 0; i--)
            bits.Add(((value >> i) & 1) == 1);
    }

    // Bits are packed LSB-first within each byte, matching RleWriter.WriteBit/RleReader.ReadBit.
    private static byte[] PackRleBuffer(List<bool> bits)
    {
        var numBits = bits.Count;
        var numRleBytes = (numBits + 7) / 8;
        var buf = new byte[numRleBytes + 1]; // numBits < 128 so the trailer is a single byte
        for (var i = 0; i < numBits; i++)
            if (bits[i])
                buf[i / 8] |= (byte)(1 << (i % 8));
        buf[numRleBytes] = (byte)numBits;
        return buf;
    }

    // Initial value bit + the 4 bits that fall through tiers 1-4 + an 8-bit payload of 255
    // (the escape sentinel), landing DecodeRunLength() in the varint-escape branch.
    private static List<bool> EscapeRunPrefixBits()
    {
        var bits = new List<bool> { true, true, true, true, true };
        AddByteBitsMsbFirst(bits, 0xFF);
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

    // Was `RunOf270_ThrowsException` before the varint-escape fix: a run of 270 identical
    // bits used to overflow the RLE tier-5 tier (max representable count was 269) and throw
    // InvalidOperationException. The escape sentinel removes that cap, so this must now
    // round-trip like any other run length.
    [Fact]
    public void RunOf270_RoundTrips()
    {
        var bits = Enumerable.Repeat(true, 270).ToList();
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Theory]
    [InlineData(268)] // last count representable without the escape sentinel
    [InlineData(269)] // first count that now requires the escape (payload 255, varint(0))
    [InlineData(270)]
    [InlineData(271)]
    [InlineData(300)]
    [InlineData(396)] // 269 + 127: largest count using a single 7-bit varint group
    [InlineData(397)] // 269 + 128: smallest count needing a second varint group
    [InlineData(5000)] // the exact count that crashed ScaleBenchmark's 5,000-player prime
    [InlineData(16652)] // 269 + 16383: largest count using two varint groups
    [InlineData(16653)] // 269 + 16384: smallest count needing a third varint group
    [InlineData(100_000)]
    [InlineData(1_000_000)]
    [InlineData(5_000_000)]
    public void RunLength_Boundary_RoundTrips(int count)
    {
        var bits = Enumerable.Repeat(true, count).ToList();
        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
    }

    [Fact]
    public void NoRegression_ByteCostUnchangedFor1To268()
    {
        for (var count = 1; count <= 268; count++)
        {
            var output = EncodeUniformRun(count, true);
            Assert.Equal(ExpectedEncodedByteLength(count), output.Length);

            var decoded = Decode(output, count);
            Assert.Equal(Enumerable.Repeat(true, count), decoded);
        }
    }

    [Theory]
    [InlineData(269)]
    [InlineData(270)]
    [InlineData(300)]
    [InlineData(396)]
    [InlineData(397)]
    [InlineData(1000)]
    [InlineData(5000)]
    [InlineData(16652)]
    [InlineData(16653)]
    [InlineData(100_000)]
    [InlineData(1_000_000)]
    public void EscapeCost_MatchesVarintFormula(int count)
    {
        var output = EncodeUniformRun(count, false);
        Assert.Equal(ExpectedEncodedByteLength(count), output.Length);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    public void RandomRunsIncludingOverflow_RoundTrip(int seed)
    {
        var random = new Random(seed);
        var bits = new List<bool>();
        var value = random.Next(2) == 1;

        // Mix short runs (well within the old cap) with long runs that deliberately blow
        // past the old 269-count limit, many times over, in one shared bitstream.
        for (var segment = 0; segment < 200; segment++)
        {
            var runLength = random.Next(100) < 15
                ? random.Next(500, 20_000) // occasionally force a long, escape-tier run
                : random.Next(1, 300);

            bits.AddRange(Enumerable.Repeat(value, runLength));
            value = !value;
        }

        var output = Encode(bits);
        var decoded = Decode(output, bits.Count);
        Assert.Equal(bits, decoded);
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

    // Before this fix, ReadUVarintBits' `shift` had no upper bound. By the 6th continuation
    // group, shift reaches 35, which C# masks to (35 & 31) = 3 for a uint shift -- so group
    // 6's bits silently fold back onto bits group 1 already decoded, with no exception, no
    // matter how far past a sane count the result lands.
    [Fact]
    public void MalformedEscapeVarint_MoreThanFiveContinuationGroups_Throws()
    {
        var bits = EscapeRunPrefixBits();
        byte[] groups = { 0x81, 0x82, 0x84, 0x88, 0x90, 0x7F };
        foreach (var g in groups) AddByteBitsMsbFirst(bits, g);
        var buf = PackRleBuffer(bits);

        var reader = new RleReader();
        Assert.Throws<InvalidOperationException>(() => reader.Reset(buf));
    }

    // Only 5 groups here -- shift never exceeds 28, so this is a well-formed <=5-byte LEB128
    // varint, not a masking artifact. Its value (2^31) still overflows once cast to int,
    // which used to make `_remaining` negative and leave NextBit() stuck: the `_remaining ==
    // 0` refill check can never become true again once _remaining starts negative, so it
    // just returns the same bit forever without ever touching the buffer again.
    [Fact]
    public void MalformedEscapeVarint_ValueOverflowsInt_Throws()
    {
        var bits = EscapeRunPrefixBits();
        byte[] groups = { 0x81, 0x82, 0x84, 0x88, 0x08 };
        foreach (var g in groups) AddByteBitsMsbFirst(bits, g);
        var buf = PackRleBuffer(bits);

        var reader = new RleReader();
        Assert.Throws<InvalidOperationException>(() => reader.Reset(buf));
    }

    // The trailer claims 5 encoded bits, but a 1-byte buffer has no room for both that
    // region and the trailer itself -- `_bytePos` would land at -1.
    [Fact]
    public void MalformedHeader_DeclaredBitLengthExceedsBuffer_Throws()
    {
        var reader = new RleReader();
        Assert.Throws<InvalidOperationException>(() => reader.Reset(new byte[] { 5 }));
    }

    // A 5-byte reverse-varint trailer whose value truncates to exactly int.MinValue (bit 31
    // set, nothing else) once its last group's shift (28) lands within 32-bit width.
    [Fact]
    public void MalformedHeader_NegativeBitLength_Throws()
    {
        var reader = new RleReader();
        Assert.Throws<InvalidOperationException>(() => reader.Reset(new byte[] { 0x08, 0x80, 0x80, 0x80, 0x80 }));
    }
}
