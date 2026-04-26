using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DeltaPack.SourceGenerator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CodeActions;
using Microsoft.CodeAnalysis.CodeFixes;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Text;
using Xunit;

namespace DeltaPack.Tests.SourceGenerator;

public class CodeFixTests
{
    [Fact]
    public async Task DP001_AddsPartialModifier()
    {
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public class Foo {
        public string X { get; set; } = """";
    }
}";
        var fixedSource = await ApplyCodeFixAsync(source, "DP001", ForClass);
        Assert.Contains("public partial class Foo", fixedSource);
    }

    [Fact]
    public async Task DP001_PreservesOtherModifiers()
    {
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public abstract class Bar {
    }
}";
        var fixedSource = await ApplyCodeFixAsync(source, "DP001", ForClass);
        Assert.Contains("public abstract partial class Bar", fixedSource);
    }

    [Fact]
    public async Task DP012_SwapsListToDPList()
    {
        const string source = @"
using DeltaPack;
using System.Collections.Generic;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public List<int> Items { get; set; } = new();
    }
}";
        var fixedSource = await ApplyCodeFixAsync(source, "DP012", ForPropertyType);
        Assert.Contains("DeltaPack.DPList<int> Items", fixedSource);
    }

    [Fact]
    public async Task DP003_SwapsDictionaryToDPDict()
    {
        const string source = @"
using DeltaPack;
using System.Collections.Generic;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public Dictionary<string, int> Stats { get; set; } = new();
    }
}";
        var fixedSource = await ApplyCodeFixAsync(source, "DP003", ForPropertyType);
        Assert.Contains("DeltaPack.DPDict<string, int> Stats", fixedSource);
    }

    [Fact]
    public async Task DP013_AddsSetterToGetOnlyPartial()
    {
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public partial class Foo {
        public partial int Score { get; }
    }
}";
        var fixedSource = await ApplyCodeFixAsync(source, "DP013", ForProperty);
        Assert.Contains("public partial int Score { get; set; }", fixedSource);
    }

    // ===== Helpers =====

    private delegate Location LocationPicker(SyntaxNode root);

    private static Location ForClass(SyntaxNode root)
    {
        var classDecl = root.DescendantNodes().OfType<Microsoft.CodeAnalysis.CSharp.Syntax.ClassDeclarationSyntax>().First();
        return Location.Create(root.SyntaxTree, classDecl.Identifier.Span);
    }

    private static Location ForProperty(SyntaxNode root)
    {
        var propDecl = root.DescendantNodes().OfType<Microsoft.CodeAnalysis.CSharp.Syntax.PropertyDeclarationSyntax>().First();
        return Location.Create(root.SyntaxTree, propDecl.Identifier.Span);
    }

    private static Location ForPropertyType(SyntaxNode root)
    {
        var propDecl = root.DescendantNodes().OfType<Microsoft.CodeAnalysis.CSharp.Syntax.PropertyDeclarationSyntax>().First();
        return Location.Create(root.SyntaxTree, propDecl.Type.Span);
    }

    private static async Task<string> ApplyCodeFixAsync(string source, string diagnosticId, LocationPicker pickLocation)
    {
        var workspace = new AdhocWorkspace();
        var projectId = ProjectId.CreateNewId();
        var projectInfo = ProjectInfo.Create(
            projectId,
            VersionStamp.Create(),
            "Test",
            "Test",
            LanguageNames.CSharp,
            metadataReferences: new[]
            {
                MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(DeltaPack.DeltaPackAttribute).Assembly.Location),
            });
        var project = workspace.AddProject(projectInfo);
        var document = workspace.AddDocument(project.Id, "Test.cs", SourceText.From(source));

        // Synthesize a diagnostic matching the generator's descriptor so the code-fix
        // provider can register an action. (Running the real generator here would require
        // C# 13 LangVersion on the ad-hoc project; synthesizing keeps the test focused.)
        var root = await document.GetSyntaxRootAsync();
        var descriptor = new DiagnosticDescriptor(
            diagnosticId,
            "synthetic",
            "synthetic {0}",
            "DeltaPack",
            DiagnosticSeverity.Error,
            isEnabledByDefault: true);
        var diagnostic = Diagnostic.Create(descriptor, pickLocation(root!), "synth");

        var provider = new DeltaPackCodeFixProvider();
        CodeAction? action = null;
        var context = new CodeFixContext(
            document,
            diagnostic,
            (a, _) => action = a,
            CancellationToken.None);
        await provider.RegisterCodeFixesAsync(context);

        Assert.NotNull(action);
        var operations = await action!.GetOperationsAsync(CancellationToken.None);
        var applyOp = operations.OfType<ApplyChangesOperation>().Single();
        var changedDoc = applyOp.ChangedSolution.GetDocument(document.Id)!;
        var changedText = await changedDoc.GetTextAsync();
        return changedText.ToString();
    }
}
