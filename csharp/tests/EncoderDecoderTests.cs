using Xunit;

namespace DeltaPack.Tests;

public class EncoderDecoderTests
{
    // Primitive round-trip tests

    [Theory]
    [InlineData("")]
    [InlineData("hello")]
    [InlineData("hello world")]
    [InlineData("émoji 🎉")]
    public void String_RoundTrips(string value)
    {
        var encoder = new Encoder();
        encoder.PushString(value);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(value, decoder.NextString());
    }

    [Fact]
    public void String_DictionaryCompression_Works()
    {
        var encoder = new Encoder();
        encoder.PushString("repeated");
        encoder.PushString("repeated");
        encoder.PushString("different");
        encoder.PushString("repeated");
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal("repeated", decoder.NextString());
        Assert.Equal("repeated", decoder.NextString());
        Assert.Equal("different", decoder.NextString());
        Assert.Equal("repeated", decoder.NextString());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(-1)]
    [InlineData(127)]
    [InlineData(-128)]
    [InlineData(12345)]
    [InlineData(-12345)]
    [InlineData(int.MaxValue)]
    [InlineData(int.MinValue)]
    public void Int_RoundTrips(int value)
    {
        var encoder = new Encoder();
        encoder.PushInt(value);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(value, decoder.NextInt());
    }

    [Theory]
    [InlineData(0u)]
    [InlineData(1u)]
    [InlineData(127u)]
    [InlineData(128u)]
    [InlineData(12345u)]
    [InlineData(uint.MaxValue)]
    public void UInt_RoundTrips(uint value)
    {
        var encoder = new Encoder();
        encoder.PushUInt(value);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(value, decoder.NextUInt());
    }

    [Theory]
    [InlineData(0f)]
    [InlineData(1.5f)]
    [InlineData(-1.5f)]
    [InlineData(3.14159f)]
    [InlineData(float.MaxValue)]
    [InlineData(float.MinValue)]
    public void Float_RoundTrips(float value)
    {
        var encoder = new Encoder();
        encoder.PushFloat(value);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(value, decoder.NextFloat());
    }

    [Fact]
    public void FloatQuantized_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushFloatQuantized(1.234f, 0.1f);
        encoder.PushFloatQuantized(-5.678f, 0.01f);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(1.2f, decoder.NextFloatQuantized(0.1f), 0.001f);
        Assert.Equal(-5.68f, decoder.NextFloatQuantized(0.01f), 0.001f);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Boolean_RoundTrips(bool value)
    {
        var encoder = new Encoder();
        encoder.PushBoolean(value);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(value, decoder.NextBoolean());
    }

    [Fact]
    public void MultipleBooleans_RoundTrip()
    {
        var encoder = new Encoder();
        encoder.PushBoolean(true);
        encoder.PushBoolean(false);
        encoder.PushBoolean(true);
        encoder.PushBoolean(true);
        encoder.PushBoolean(false);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.True(decoder.NextBoolean());
        Assert.False(decoder.NextBoolean());
        Assert.True(decoder.NextBoolean());
        Assert.True(decoder.NextBoolean());
        Assert.False(decoder.NextBoolean());
    }

    // Container tests

    [Fact]
    public void Optional_Present_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushOptional("hello", encoder.PushString);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal("hello", decoder.NextOptional(decoder.NextString));
    }

    [Fact]
    public void Optional_Null_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushOptional<string>(null, encoder.PushString);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Null(decoder.NextOptional(decoder.NextString));
    }

    [Fact]
    public void Array_RoundTrips()
    {
        var values = new List<long> { 1, 2, 3, 4, 5 };

        var encoder = new Encoder();
        encoder.PushArray(values, encoder.PushInt);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(values, decoder.NextArray(decoder.NextInt));
    }

    [Fact]
    public void Array_Empty_RoundTrips()
    {
        var values = new List<string>();

        var encoder = new Encoder();
        encoder.PushArray(values, encoder.PushString);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Empty(decoder.NextArray(decoder.NextString));
    }

    [Fact]
    public void Record_RoundTrips()
    {
        var values = new Dictionary<string, long>
        {
            ["one"] = 1,
            ["two"] = 2,
            ["three"] = 3
        };

        var encoder = new Encoder();
        encoder.PushRecord(values, encoder.PushString, encoder.PushInt);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(values, decoder.NextRecord(decoder.NextString, decoder.NextInt));
    }

    // Diff tests

    [Fact]
    public void StringDiff_Changed_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushStringDiff("old", "new");
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal("new", decoder.NextStringDiff("old"));
    }

    [Fact]
    public void StringDiff_Unchanged_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushStringDiff("same", "same");
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal("same", decoder.NextStringDiff("same"));
    }

    [Fact]
    public void IntDiff_Changed_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushIntDiff(10, 20);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(20, decoder.NextIntDiff(10));
    }

    [Fact]
    public void IntDiff_Unchanged_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushIntDiff(42, 42);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(42, decoder.NextIntDiff(42));
    }

    [Fact]
    public void BooleanDiff_Changed_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushBooleanDiff(true, false);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.False(decoder.NextBooleanDiff(true));
    }

    [Fact]
    public void BooleanDiff_Unchanged_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushBooleanDiff(true, true);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.True(decoder.NextBooleanDiff(true));
    }

    [Fact]
    public void ArrayDiff_Changed_RoundTrips()
    {
        var a = new List<long> { 1, 2, 3 };
        var b = new List<long> { 1, 5, 3, 4 };

        var encoder = new Encoder();
        encoder.PushArrayDiff(
            a, b,
            (x, y) => x == y,
            encoder.PushInt,
            (_, y) => encoder.PushInt(y));
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        var result = decoder.NextArrayDiff(
            a,
            decoder.NextInt,
            _ => decoder.NextInt());
        Assert.Equal(b, result);
    }

    [Fact]
    public void ArrayDiff_Unchanged_RoundTrips()
    {
        var a = new List<long> { 1, 2, 3 };

        var encoder = new Encoder();
        encoder.PushArrayDiff(
            a, a,
            (x, y) => x == y,
            encoder.PushInt,
            (_, y) => encoder.PushInt(y));
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        var result = decoder.NextArrayDiff(
            a,
            decoder.NextInt,
            _ => decoder.NextInt());
        Assert.Equal(a, result);
    }

    [Fact]
    public void RecordDiff_WithChanges_RoundTrips()
    {
        var a = new Dictionary<string, long>
        {
            ["one"] = 1,
            ["two"] = 2,
            ["three"] = 3
        };
        var b = new Dictionary<string, long>
        {
            ["one"] = 1,
            ["two"] = 20,  // updated
            // "three" deleted
            ["four"] = 4   // added
        };

        var encoder = new Encoder();
        encoder.PushRecordDiff(
            a, b,
            (x, y) => x == y,
            encoder.PushString,
            encoder.PushInt,
            (_, y) => encoder.PushInt(y));
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        var result = decoder.NextRecordDiff(
            a,
            decoder.NextString,
            decoder.NextInt,
            _ => decoder.NextInt());
        Assert.Equal(b, result);
    }

    [Fact]
    public void OptionalDiffPrimitive_NullToValue_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushOptionalDiffPrimitive<string>(null, "hello", encoder.PushString);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal("hello", decoder.NextOptionalDiffPrimitive<string>(null, decoder.NextString));
    }

    [Fact]
    public void OptionalDiffPrimitive_ValueToNull_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushOptionalDiffPrimitive<string>("hello", null, encoder.PushString);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Null(decoder.NextOptionalDiffPrimitive("hello", decoder.NextString));
    }

    [Fact]
    public void OptionalDiffPrimitive_ValueToValue_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushOptionalDiffPrimitive("old", "new", encoder.PushString);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal("new", decoder.NextOptionalDiffPrimitive("old", decoder.NextString));
    }

    [Fact]
    public void OptionalDiffPrimitive_Unchanged_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushOptionalDiffPrimitive("same", "same", encoder.PushString);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal("same", decoder.NextOptionalDiffPrimitive("same", decoder.NextString));
    }

    [Fact]
    public void OptionalDiffPrimitive_NullToNull_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushOptionalDiffPrimitive<string>(null, null, encoder.PushString);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Null(decoder.NextOptionalDiffPrimitive<string>(null, decoder.NextString));
    }

    [Fact]
    public void OptionalDiffPrimitiveStruct_NullToValue_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushOptionalDiffPrimitive<int>(null, 42, v => encoder.PushInt(v));
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal(42, decoder.NextOptionalDiffPrimitiveStruct<long>(null, decoder.NextInt));
    }

    [Fact]
    public void OptionalDiffPrimitiveStruct_ValueToNull_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushOptionalDiffPrimitive<int>(42, null, v => encoder.PushInt(v));
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Null(decoder.NextOptionalDiffPrimitiveStruct<long>(42, decoder.NextInt));
    }

    [Fact]
    public void OptionalDiff_NullToValue_RoundTrips()
    {
        var a = new List<long> { 1, 2, 3 };

        var encoder = new Encoder();
        encoder.PushOptionalDiff<List<long>>(
            null, a,
            list => encoder.PushArray(list, encoder.PushInt),
            (_, list) => encoder.PushArray(list, encoder.PushInt));
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        var result = decoder.NextOptionalDiff<List<long>>(
            null,
            () => decoder.NextArray(decoder.NextInt),
            _ => decoder.NextArray(decoder.NextInt));
        Assert.Equal(a, result);
    }

    [Fact]
    public void OptionalDiff_ValueToNull_RoundTrips()
    {
        var a = new List<long> { 1, 2, 3 };

        var encoder = new Encoder();
        encoder.PushOptionalDiff<List<long>>(
            a, null,
            list => encoder.PushArray(list, encoder.PushInt),
            (_, list) => encoder.PushArray(list, encoder.PushInt));
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        var result = decoder.NextOptionalDiff<List<long>>(
            a,
            () => decoder.NextArray(decoder.NextInt),
            _ => decoder.NextArray(decoder.NextInt));
        Assert.Null(result);
    }

    [Fact]
    public void OptionalDiff_ValueToValue_RoundTrips()
    {
        var a = new List<long> { 1, 2, 3 };
        var b = new List<long> { 1, 5, 3, 4 };

        var encoder = new Encoder();
        encoder.PushOptionalDiff(
            a, b,
            list => encoder.PushArray(list, encoder.PushInt),
            (_, list) => encoder.PushArray(list, encoder.PushInt));
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        var result = decoder.NextOptionalDiff(
            a,
            () => decoder.NextArray(decoder.NextInt),
            _ => decoder.NextArray(decoder.NextInt));
        Assert.Equal(b, result);
    }

    // Mixed data test

    [Fact]
    public void MixedData_RoundTrips()
    {
        var encoder = new Encoder();
        encoder.PushString("hello");
        encoder.PushInt(-42);
        encoder.PushUInt(100);
        encoder.PushFloat(3.14f);
        encoder.PushBoolean(true);
        encoder.PushBoolean(false);
        encoder.PushArray(new List<string> { "a", "b" }, encoder.PushString);
        var buffer = encoder.ToBuffer();

        var decoder = new Decoder(buffer);
        Assert.Equal("hello", decoder.NextString());
        Assert.Equal(-42, decoder.NextInt());
        Assert.Equal(100u, decoder.NextUInt());
        Assert.Equal(3.14f, decoder.NextFloat(), 0.001f);
        Assert.True(decoder.NextBoolean());
        Assert.False(decoder.NextBoolean());
        Assert.Equal(new List<string> { "a", "b" }, decoder.NextArray(decoder.NextString));
    }
}
