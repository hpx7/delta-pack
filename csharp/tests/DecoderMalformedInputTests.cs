using Xunit;

namespace DeltaPack.Tests;

// A length/count read directly off the wire used to be trusted immediately -- cast to int
// and handed straight to a List<T>/DPDict/DPList/string allocation, with no check that it's
// even plausible given how many bytes actually remain in the buffer. A tiny malicious or
// corrupted buffer could claim an enormous length and trigger a huge upfront allocation
// before any of its (nonexistent) content was ever read. Decoder.ValidateLength closes this
// by rejecting `len < 0 || len > bytes remaining` before any allocation is attempted.
public class DecoderMalformedInputTests
{
    private static byte[] BufferClaimingLength(ulong length)
    {
        var encoder = new Encoder();
        encoder.PushUInt(length);
        return encoder.ToBuffer();
    }

    [Fact]
    public void NextArray_LengthExceedsRemainingBuffer_Throws()
    {
        var decoder = new Decoder(BufferClaimingLength(1_000_000_000));
        Assert.Throws<InvalidOperationException>(() => decoder.NextArray(decoder.NextInt));
    }

    [Fact]
    public void NextRecord_LengthExceedsRemainingBuffer_Throws()
    {
        var decoder = new Decoder(BufferClaimingLength(1_000_000_000));
        Assert.Throws<InvalidOperationException>(() =>
            decoder.NextRecord(decoder.NextString, decoder.NextInt));
    }

    [Fact]
    public void NextArrayDiff_DPList_LengthExceedsRemainingBuffer_Throws()
    {
        var baseline = new DPList<long>(); // long, to match decoder.NextInt()'s return type
        var decoder = new Decoder(BufferClaimingLength(1_000_000_000));
        Assert.Throws<InvalidOperationException>(() =>
            decoder.NextArrayDiff(baseline, decoder.NextInt, _ => decoder.NextInt()));
    }

    [Fact]
    public void NextString_LengthExceedsRemainingBuffer_Throws()
    {
        // NextString's length comes from NextInt (zigzag-decoded), not NextUInt, so build
        // the buffer with PushInt instead.
        var encoder = new Encoder();
        encoder.PushInt(1_000_000_000);
        var decoder = new Decoder(encoder.ToBuffer());

        Assert.Throws<InvalidOperationException>(() => decoder.NextString());
    }
}
