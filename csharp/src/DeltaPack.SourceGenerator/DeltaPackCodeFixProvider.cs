using System.Collections.Immutable;
using System.Composition;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CodeActions;
using Microsoft.CodeAnalysis.CodeFixes;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace DeltaPack.SourceGenerator;

/// <summary>
/// Offers a one-click fix for DP006 ([DeltaPack] type missing 'partial'): inserts the
/// 'partial' modifier before the 'class' keyword.
/// </summary>
[ExportCodeFixProvider(LanguageNames.CSharp, Name = nameof(DeltaPackCodeFixProvider)), Shared]
public sealed class DeltaPackCodeFixProvider : CodeFixProvider
{
    private const string Title = "Add 'partial' modifier";

    public override ImmutableArray<string> FixableDiagnosticIds =>
        ImmutableArray.Create(Diagnostics.MissingPartial.Id);

    public override FixAllProvider GetFixAllProvider() => WellKnownFixAllProviders.BatchFixer;

    public override async Task RegisterCodeFixesAsync(CodeFixContext context)
    {
        var root = await context.Document.GetSyntaxRootAsync(context.CancellationToken).ConfigureAwait(false);
        if (root is null) return;

        foreach (var diagnostic in context.Diagnostics)
        {
            var node = root.FindNode(diagnostic.Location.SourceSpan);
            var classDecl = node.AncestorsAndSelf().OfType<ClassDeclarationSyntax>().FirstOrDefault();
            if (classDecl is null) continue;

            context.RegisterCodeFix(
                CodeAction.Create(
                    title: Title,
                    createChangedDocument: ct => AddPartialModifierAsync(context.Document, classDecl, ct),
                    equivalenceKey: Title),
                diagnostic);
        }
    }

    private static async Task<Document> AddPartialModifierAsync(
        Document document,
        ClassDeclarationSyntax classDecl,
        CancellationToken ct)
    {
        var partialToken = SyntaxFactory.Token(SyntaxKind.PartialKeyword)
            .WithTrailingTrivia(SyntaxFactory.Space);

        // Insert `partial` immediately before the `class` keyword so it lands after any
        // access / abstract / sealed / static modifiers and preserves leading trivia on
        // the declaration.
        var newModifiers = classDecl.Modifiers.Add(partialToken);
        var newClassDecl = classDecl.WithModifiers(newModifiers);

        var root = await document.GetSyntaxRootAsync(ct).ConfigureAwait(false);
        if (root is null) return document;

        var newRoot = root.ReplaceNode(classDecl, newClassDecl);
        return document.WithSyntaxRoot(newRoot);
    }
}
