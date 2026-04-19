using DeltaPack.Tests.Derive.Models;
using Xunit;

namespace DeltaPack.Tests.Derive;

/// <summary>
/// Cross-validates that the [DeltaPack] source generator produces byte-identical output
/// to the CLI-emitted code for logically equivalent values. Uses the committed
/// <c>Generated.Examples.*</c> CLI-generated types as the oracle.
/// </summary>
public class DeriveConformanceTests
{
    [Fact]
    public void Primitives_Encode_MatchesCliGenerated()
    {
        var cli = new Generated.Examples.Primitives
        {
            StringField = "hello",
            SignedIntField = -42,
            UnsignedIntField = 7,
            BoundedIntField = 3,
            FloatField = 1.5f,
            BooleanField = true,
        };
        var der = new PrimitivesDerive
        {
            StringField = "hello",
            SignedIntField = -42,
            UnsignedIntField = 7,
            BoundedIntField = 3,
            FloatField = 1.5f,
            BooleanField = true,
        };

        var cliBytes = Generated.Examples.Primitives.Encode(cli);
        var derBytes = PrimitivesDerive.Encode(der);

        Assert.Equal(cliBytes, derBytes);
    }

    [Fact]
    public void Primitives_RoundTrip()
    {
        var der = new PrimitivesDerive
        {
            StringField = "round trip",
            SignedIntField = -100000,
            UnsignedIntField = 42,
            BoundedIntField = -5,
            FloatField = 3.14f,
            BooleanField = false,
        };

        var bytes = PrimitivesDerive.Encode(der);
        var decoded = PrimitivesDerive.Decode(bytes);

        Assert.True(PrimitivesDerive.Equals(der, decoded));
    }

    [Fact]
    public void Primitives_Diff_MatchesCliGenerated()
    {
        var cliA = new Generated.Examples.Primitives { StringField = "a", SignedIntField = 1, UnsignedIntField = 1, BoundedIntField = 1, FloatField = 1.0f, BooleanField = false };
        var cliB = new Generated.Examples.Primitives { StringField = "b", SignedIntField = 2, UnsignedIntField = 2, BoundedIntField = 2, FloatField = 2.0f, BooleanField = true };
        var derA = new PrimitivesDerive { StringField = "a", SignedIntField = 1, UnsignedIntField = 1, BoundedIntField = 1, FloatField = 1.0f, BooleanField = false };
        var derB = new PrimitivesDerive { StringField = "b", SignedIntField = 2, UnsignedIntField = 2, BoundedIntField = 2, FloatField = 2.0f, BooleanField = true };

        var cliDiff = Generated.Examples.Primitives.EncodeDiff(cliA, cliB);
        var derDiff = PrimitivesDerive.EncodeDiff(derA, derB);

        Assert.Equal(cliDiff, derDiff);
    }

    [Fact]
    public void Primitives_ToJson_MatchesCliGenerated()
    {
        var cli = new Generated.Examples.Primitives
        {
            StringField = "hello",
            SignedIntField = -42,
            UnsignedIntField = 7,
            BoundedIntField = 3,
            FloatField = 1.5f,
            BooleanField = true,
        };
        var der = new PrimitivesDerive
        {
            StringField = "hello",
            SignedIntField = -42,
            UnsignedIntField = 7,
            BoundedIntField = 3,
            FloatField = 1.5f,
            BooleanField = true,
        };

        var cliJson = Generated.Examples.Primitives.ToJson(cli).ToJsonString();
        var derJson = PrimitivesDerive.ToJson(der).ToJsonString();

        Assert.Equal(cliJson, derJson);
    }

    [Fact]
    public void Primitives_FromJson_ParsesCliJson()
    {
        var cli = new Generated.Examples.Primitives
        {
            StringField = "x",
            SignedIntField = 1,
            UnsignedIntField = 2,
            BoundedIntField = -3,
            FloatField = 0.25f,
            BooleanField = false,
        };
        var cliJson = Generated.Examples.Primitives.ToJson(cli).ToJsonString();
        var element = System.Text.Json.JsonDocument.Parse(cliJson).RootElement;
        var der = PrimitivesDerive.FromJson(element);

        Assert.Equal("x", der.StringField);
        Assert.Equal(1, der.SignedIntField);
        Assert.Equal(2u, der.UnsignedIntField);
        Assert.Equal(-3, der.BoundedIntField);
        Assert.Equal(0.25f, der.FloatField);
        Assert.False(der.BooleanField);
    }

    [Fact]
    public void Primitives_Diff_RoundTrip()
    {
        var a = new PrimitivesDerive { StringField = "a", SignedIntField = 1, UnsignedIntField = 1, BoundedIntField = 1, FloatField = 1.0f, BooleanField = false };
        var b = new PrimitivesDerive { StringField = "b", SignedIntField = 2, UnsignedIntField = 2, BoundedIntField = 2, FloatField = 2.0f, BooleanField = true };

        var diff = PrimitivesDerive.EncodeDiff(a, b);
        var reconstructed = PrimitivesDerive.DecodeDiff(a, diff);

        Assert.True(PrimitivesDerive.Equals(b, reconstructed));
    }
}
