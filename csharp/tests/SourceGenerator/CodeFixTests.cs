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
    public async Task DP006_AddsPartialModifier()
    {
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public class Foo {
        public string X { get; set; } = """";
    }
}";
        var fixedSource = await ApplyCodeFixAsync(source);
        Assert.Contains("public partial class Foo", fixedSource);
    }

    [Fact]
    public async Task DP006_PreservesOtherModifiers()
    {
        const string source = @"
using DeltaPack;
namespace N {
    [DeltaPack]
    public abstract class Bar {
    }
}";
        var fixedSource = await ApplyCodeFixAsync(source);
        Assert.Contains("public abstract partial class Bar", fixedSource);
    }

    private static async Task<string> ApplyCodeFixAsync(string source)
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

        // Synthesize a DP006 diagnostic on the class declaration (the code-fix does not
        // depend on the generator actually running; it only needs a diagnostic span).
        var root = await document.GetSyntaxRootAsync();
        var classDecl = root!
            .DescendantNodes()
            .OfType<Microsoft.CodeAnalysis.CSharp.Syntax.ClassDeclarationSyntax>()
            .First();
        var descriptor = new DiagnosticDescriptor(
            "DP006",
            "[DeltaPack] types must be declared partial",
            "{0} missing partial",
            "DeltaPack",
            DiagnosticSeverity.Error,
            isEnabledByDefault: true);
        var diagnostic = Diagnostic.Create(
            descriptor,
            Location.Create(root.SyntaxTree, classDecl.Identifier.Span),
            classDecl.Identifier.Text);

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
