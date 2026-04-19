using System.Collections.Generic;
using DeltaPack.Tests.Derive.Models;
using Xunit;

namespace DeltaPack.Tests.Derive;

public class TestDeriveTests
{
    [Fact]
    public void Test_Nested_Encode_MatchesCliGenerated()
    {
        var cli = new Generated.Examples.Test
        {
            String = "nested",
            Uint32 = 42,
            Inner = new Generated.Examples.Inner
            {
                Int32 = -1,
                InnerInner = new Generated.Examples.InnerInner
                {
                    Long = 1000,
                    Enum = Generated.Examples.Enum.THREE,
                    Sint32 = -7,
                },
                Outer = new Generated.Examples.Outer
                {
                    Bool = new List<bool> { true, false, true },
                    Double = 2.5f,
                },
            },
            Float = 3.14f,
            BoundedInt = 4,
        };
        var der = new TestDerive
        {
            String = "nested",
            Uint32 = 42,
            Inner = new InnerDerive
            {
                Int32 = -1,
                InnerInner = new InnerInnerDerive
                {
                    Long = 1000,
                    Enum = TestEnumDerive.THREE,
                    Sint32 = -7,
                },
                Outer = new OuterDerive
                {
                    Bool = new List<bool> { true, false, true },
                    Double = 2.5f,
                },
            },
            Float = 3.14f,
            BoundedInt = 4,
        };

        var cliBytes = Generated.Examples.Test.Encode(cli);
        var derBytes = TestDerive.Encode(der);
        Assert.Equal(cliBytes, derBytes);
    }

    [Fact]
    public void Test_Diff_MatchesCliGenerated()
    {
        var cliA = BuildCli(1);
        var cliB = BuildCli(2);
        var derA = BuildDer(1);
        var derB = BuildDer(2);

        var cliDiff = Generated.Examples.Test.EncodeDiff(cliA, cliB);
        var derDiff = TestDerive.EncodeDiff(derA, derB);
        Assert.Equal(cliDiff, derDiff);
    }

    private static Generated.Examples.Test BuildCli(int n) => new()
    {
        String = $"s{n}",
        Uint32 = n * 10,
        Inner = new Generated.Examples.Inner
        {
            Int32 = n,
            InnerInner = new Generated.Examples.InnerInner { Long = n, Enum = (Generated.Examples.Enum)((n - 1) % 5), Sint32 = -n },
            Outer = new Generated.Examples.Outer { Bool = new List<bool> { n % 2 == 0 }, Double = n * 0.5f },
        },
        Float = n * 1.0f,
        BoundedInt = n,
    };

    private static TestDerive BuildDer(int n) => new()
    {
        String = $"s{n}",
        Uint32 = n * 10,
        Inner = new InnerDerive
        {
            Int32 = n,
            InnerInner = new InnerInnerDerive { Long = n, Enum = (TestEnumDerive)((n - 1) % 5), Sint32 = -n },
            Outer = new OuterDerive { Bool = new List<bool> { n % 2 == 0 }, Double = n * 0.5f },
        },
        Float = n * 1.0f,
        BoundedInt = n,
    };
}
