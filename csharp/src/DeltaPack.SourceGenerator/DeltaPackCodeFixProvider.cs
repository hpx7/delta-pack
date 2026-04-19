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
/// Offers one-click fixes for the structural [DeltaPack] diagnostics:
///   DP001 — add 'partial' to the class
///   DP011 — add 'partial' to a property in a [DeltaPackTracked] class
///   DP012 — replace List&lt;T&gt; with DeltaPack.TrackedList&lt;T&gt;
///   DP013 — replace OrderedDict&lt;K, V&gt; with DeltaPack.TrackedOrderedDict&lt;K, V&gt;
/// </summary>
[ExportCodeFixProvider(LanguageNames.CSharp, Name = nameof(DeltaPackCodeFixProvider)), Shared]
public sealed class DeltaPackCodeFixProvider : CodeFixProvider
{
    private const string AddPartialToClassTitle = "Add 'partial' modifier";
    private const string AddPartialToPropertyTitle = "Add 'partial' modifier";
    private const string SwapToTrackedListTitle = "Change to 'DeltaPack.TrackedList<T>'";
    private const string SwapToTrackedOrderedDictTitle = "Change to 'DeltaPack.TrackedOrderedDict<K, V>'";

    public override ImmutableArray<string> FixableDiagnosticIds =>
        ImmutableArray.Create(
            Diagnostics.MissingPartial.Id,
            Diagnostics.TrackedPropertyMustBePartial.Id,
            Diagnostics.TrackedListRequired.Id,
            Diagnostics.TrackedOrderedDictRequired.Id);

    public override FixAllProvider GetFixAllProvider() => WellKnownFixAllProviders.BatchFixer;

    public override async Task RegisterCodeFixesAsync(CodeFixContext context)
    {
        var root = await context.Document.GetSyntaxRootAsync(context.CancellationToken).ConfigureAwait(false);
        if (root is null) return;

        foreach (var diagnostic in context.Diagnostics)
        {
            var node = root.FindNode(diagnostic.Location.SourceSpan);

            if (diagnostic.Id == Diagnostics.MissingPartial.Id)
            {
                var classDecl = node.AncestorsAndSelf().OfType<ClassDeclarationSyntax>().FirstOrDefault();
                if (classDecl is null) continue;
                context.RegisterCodeFix(
                    CodeAction.Create(
                        title: AddPartialToClassTitle,
                        createChangedDocument: ct => AddPartialToClassAsync(context.Document, classDecl, ct),
                        equivalenceKey: "AddPartialToClass"),
                    diagnostic);
            }
            else if (diagnostic.Id == Diagnostics.TrackedPropertyMustBePartial.Id)
            {
                var propDecl = node.AncestorsAndSelf().OfType<PropertyDeclarationSyntax>().FirstOrDefault();
                if (propDecl is null) continue;
                context.RegisterCodeFix(
                    CodeAction.Create(
                        title: AddPartialToPropertyTitle,
                        createChangedDocument: ct => AddPartialToPropertyAsync(context.Document, propDecl, ct),
                        equivalenceKey: "AddPartialToProperty"),
                    diagnostic);
            }
            else if (diagnostic.Id == Diagnostics.TrackedListRequired.Id)
            {
                var propDecl = node.AncestorsAndSelf().OfType<PropertyDeclarationSyntax>().FirstOrDefault();
                if (propDecl is null) continue;
                context.RegisterCodeFix(
                    CodeAction.Create(
                        title: SwapToTrackedListTitle,
                        createChangedDocument: ct => SwapCollectionTypeAsync(
                            context.Document, propDecl, "DeltaPack.TrackedList", ct),
                        equivalenceKey: "SwapToTrackedList"),
                    diagnostic);
            }
            else if (diagnostic.Id == Diagnostics.TrackedOrderedDictRequired.Id)
            {
                var propDecl = node.AncestorsAndSelf().OfType<PropertyDeclarationSyntax>().FirstOrDefault();
                if (propDecl is null) continue;
                context.RegisterCodeFix(
                    CodeAction.Create(
                        title: SwapToTrackedOrderedDictTitle,
                        createChangedDocument: ct => SwapCollectionTypeAsync(
                            context.Document, propDecl, "DeltaPack.TrackedOrderedDict", ct),
                        equivalenceKey: "SwapToTrackedOrderedDict"),
                    diagnostic);
            }
        }
    }

    private static async Task<Document> AddPartialToClassAsync(
        Document document, ClassDeclarationSyntax classDecl, CancellationToken ct)
    {
        var partialToken = SyntaxFactory.Token(SyntaxKind.PartialKeyword)
            .WithTrailingTrivia(SyntaxFactory.Space);
        var newClassDecl = classDecl.WithModifiers(classDecl.Modifiers.Add(partialToken));

        var root = await document.GetSyntaxRootAsync(ct).ConfigureAwait(false);
        if (root is null) return document;
        return document.WithSyntaxRoot(root.ReplaceNode(classDecl, newClassDecl));
    }

    private static async Task<Document> AddPartialToPropertyAsync(
        Document document, PropertyDeclarationSyntax propDecl, CancellationToken ct)
    {
        // Insert `partial` directly before the return type so it lands after any
        // access / static / virtual / override / etc. modifiers and preserves the
        // leading trivia on the first non-modifier token.
        var partialToken = SyntaxFactory.Token(SyntaxKind.PartialKeyword)
            .WithTrailingTrivia(SyntaxFactory.Space);
        var newPropDecl = propDecl.WithModifiers(propDecl.Modifiers.Add(partialToken));

        var root = await document.GetSyntaxRootAsync(ct).ConfigureAwait(false);
        if (root is null) return document;
        return document.WithSyntaxRoot(root.ReplaceNode(propDecl, newPropDecl));
    }

    /// <summary>
    /// Rewrites the property's declared type by substituting the leftmost identifier
    /// (e.g. <c>List</c> in <c>List&lt;int&gt;</c> or <c>OrderedDict</c> in <c>OrderedDict&lt;string, int&gt;</c>)
    /// with the fully-qualified tracked replacement. Preserves the generic argument list.
    /// </summary>
    private static async Task<Document> SwapCollectionTypeAsync(
        Document document, PropertyDeclarationSyntax propDecl, string fullyQualifiedReplacement, CancellationToken ct)
    {
        var originalType = propDecl.Type;
        var generic = originalType.DescendantNodesAndSelf().OfType<GenericNameSyntax>().FirstOrDefault();
        if (generic is null) return document;

        var newName = SyntaxFactory.ParseName(fullyQualifiedReplacement + generic.TypeArgumentList.ToString())
            .WithTriviaFrom(originalType);

        var newPropDecl = propDecl.WithType(newName);
        var root = await document.GetSyntaxRootAsync(ct).ConfigureAwait(false);
        if (root is null) return document;
        return document.WithSyntaxRoot(root.ReplaceNode(propDecl, newPropDecl));
    }
}
