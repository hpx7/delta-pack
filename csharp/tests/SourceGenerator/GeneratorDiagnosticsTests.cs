using System.Collections.Immutable;
using System.Linq;
using DeltaPack.SourceGenerator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Xunit;

namespace DeltaPack.Tests.SourceGenerator;

public class GeneratorDiagnosticsTests
{
    [Fact]
    public void DP001_BaselineSanity()
    {
        // Confirms the generator pipeline runs in this harness — emits a
        // known diagnostic when a [DeltaPack] class lacks `partial`. Acts as
        // a canary so a setup regression (refs, parser version) doesn't
        // silently turn DP013/14/15 assertions into trivially-passing checks
        // against an empty diagnostic list.
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public class Foo {
        public int X { get; set; }
    }
}";
        var diags = RunGenerator(source);
        Assert.Contains(diags, d => d.Id == "DP001");
    }

    [Fact]
    public void DP013_FiresOnGetOnlyPartialProperty()
    {
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public partial int Score { get; }
    }
}";
        var diags = RunGenerator(source);
        Assert.Contains(diags, d => d.Id == "DP013" && d.GetMessage().Contains("Score"));
    }

    [Fact]
    public void DP013_DoesNotFireOnNonPartialGetOnly()
    {
        // Plain `int X { get; }` is treated as a non-serialized member — not an error.
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public int Score { get; }
        public partial int X { get; set; }
    }
}";
        var diags = RunGenerator(source);
        Assert.DoesNotContain(diags, d => d.Id == "DP013");
    }

    [Fact]
    public void DP014_FiresOnInitOnlyPartialProperty()
    {
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public partial int Score { get; init; }
    }
}";
        var diags = RunGenerator(source);
        Assert.Contains(diags, d => d.Id == "DP014" && d.GetMessage().Contains("Score"));
    }

    [Fact]
    public void DP014_DoesNotFireOnNonPartialInitOnly()
    {
        // Plain `init` properties are valid (treated as comparison-based) — only
        // contradicts when combined with `partial`.
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public int Score { get; init; }
    }
}";
        var diags = RunGenerator(source);
        Assert.DoesNotContain(diags, d => d.Id == "DP014");
    }

    [Fact]
    public void DP015_FiresOnIgnoredPartialProperty()
    {
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public partial class Foo {
        [DeltaPackIgnore]
        public partial int Scratch { get; set; }
    }
}";
        var diags = RunGenerator(source);
        Assert.Contains(diags, d => d.Id == "DP015" && d.GetMessage().Contains("Scratch"));
    }

    [Fact]
    public void DP015_DoesNotFireOnIgnoredNonPartial()
    {
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public partial class Foo {
        [DeltaPackIgnore]
        public int Scratch { get; set; }
        public partial int X { get; set; }
    }
}";
        var diags = RunGenerator(source);
        Assert.DoesNotContain(diags, d => d.Id == "DP015");
    }

    [Fact]
    public void DP016_FiresOnNonPartialIList()
    {
        // Without `partial`, the generator never sees a setter to wrap the assignment in,
        // so a plain List<T> would land in the field unwrapped — break the insertion-order
        // invariant the diff format depends on. Reject up front.
        const string source = @"
using DeltaPack;
using System.Collections.Generic;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public IList<int> Items { get; set; } = new List<int>();
    }
}";
        var diags = RunGenerator(source);
        Assert.Contains(diags, d => d.Id == "DP016" && d.GetMessage().Contains("Items"));
    }

    [Fact]
    public void DP016_FiresOnNonPartialIDictionary()
    {
        const string source = @"
using DeltaPack;
using System.Collections.Generic;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public IDictionary<string, int> Stats { get; set; } = new Dictionary<string, int>();
    }
}";
        var diags = RunGenerator(source);
        Assert.Contains(diags, d => d.Id == "DP016" && d.GetMessage().Contains("Stats"));
    }

    [Fact]
    public void DP016_DoesNotFireOnPartialIList()
    {
        // Sugar: the generated setter wraps non-tracked assignments into DPList<T>.
        const string source = @"
using DeltaPack;
using System.Collections.Generic;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public partial IList<int> Items { get; set; }
    }
}";
        var diags = RunGenerator(source);
        Assert.DoesNotContain(diags, d => d.Id == "DP016");
    }

    [Fact]
    public void DP016_DoesNotFireOnPartialIDictionary()
    {
        const string source = @"
using DeltaPack;
using System.Collections.Generic;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public partial IDictionary<string, int> Stats { get; set; }
    }
}";
        var diags = RunGenerator(source);
        Assert.DoesNotContain(diags, d => d.Id == "DP016");
    }

    /// <summary>
    /// In-process minimal stand-ins for the runtime attributes the generator
    /// recognizes by their fully-qualified display name. Inlining them sidesteps
    /// having to resolve the multi-targeted DeltaPack.dll across the test
    /// compilation's reference set — only the FQNs need to match.
    /// </summary>
    private const string AttributeStubs = @"
namespace DeltaPack {
    [System.AttributeUsage(System.AttributeTargets.Class | System.AttributeTargets.Struct)]
    public sealed class DeltaPackAttribute : System.Attribute { }
    [System.AttributeUsage(System.AttributeTargets.Property | System.AttributeTargets.Field)]
    public sealed class DeltaPackIgnoreAttribute : System.Attribute { }
}";

    private static (CSharpCompilation, CSharpParseOptions) MakeCompilation(string source)
    {
        var parseOptions = new CSharpParseOptions(LanguageVersion.CSharp13);
        var trees = new[]
        {
            CSharpSyntaxTree.ParseText(source, parseOptions),
            CSharpSyntaxTree.ParseText(AttributeStubs, parseOptions),
        };
        // Pull every assembly the test process has loaded — keeps reference
        // resolution working for `System.Attribute`, value types, etc. without
        // hand-picking the right ref-asm path on each runtime.
        var references = System.AppDomain.CurrentDomain.GetAssemblies()
            .Where(a => !a.IsDynamic && !string.IsNullOrEmpty(a.Location))
            .Select(a => (MetadataReference)MetadataReference.CreateFromFile(a.Location))
            .ToArray();
        var compilation = CSharpCompilation.Create(
            assemblyName: "GeneratorDiagnosticsTestAsm",
            syntaxTrees: trees,
            references: references,
            options: new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));
        return (compilation, parseOptions);
    }

    private static ImmutableArray<Diagnostic> RunGenerator(string source)
    {
        var (compilation, parseOptions) = MakeCompilation(source);
        var driver = CSharpGeneratorDriver.Create(
            generators: new[] { new DeltaPackGenerator().AsSourceGenerator() },
            parseOptions: parseOptions);
        return driver.RunGenerators(compilation).GetRunResult().Diagnostics;
    }
}
