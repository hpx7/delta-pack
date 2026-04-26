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
///   DP012 — replace List&lt;T&gt; with DeltaPack.DPList&lt;T&gt;
///   DP003 — replace Dictionary&lt;K, V&gt; / OrderedDictionary&lt;K, V&gt; with DeltaPack.DPDict&lt;K, V&gt;
///   DP013 — add 'set;' accessor to a partial property
/// </summary>
[ExportCodeFixProvider(LanguageNames.CSharp, Name = nameof(DeltaPackCodeFixProvider)), Shared]
public sealed class DeltaPackCodeFixProvider : CodeFixProvider
{
    private const string AddPartialToClassTitle = "Add 'partial' modifier";
    private const string SwapToDPListTitle = "Change to 'DeltaPack.DPList<T>'";
    private const string SwapToDPDictTitle = "Change to 'DeltaPack.DPDict<K, V>'";
    private const string AddSetterTitle = "Add 'set;' accessor";

    public override ImmutableArray<string> FixableDiagnosticIds =>
        ImmutableArray.Create(
            Diagnostics.MissingPartial.Id,
            Diagnostics.UseDPList.Id,
            Diagnostics.UseDPDict.Id,
            Diagnostics.PartialPropertyMissingSetter.Id);

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
            else if (diagnostic.Id == Diagnostics.UseDPList.Id)
            {
                var propDecl = node.AncestorsAndSelf().OfType<PropertyDeclarationSyntax>().FirstOrDefault();
                if (propDecl is null) continue;
                context.RegisterCodeFix(
                    CodeAction.Create(
                        title: SwapToDPListTitle,
                        createChangedDocument: ct => SwapCollectionTypeAsync(
                            context.Document, propDecl, "DeltaPack.DPList", ct),
                        equivalenceKey: "SwapToDPList"),
                    diagnostic);
            }
            else if (diagnostic.Id == Diagnostics.UseDPDict.Id)
            {
                var propDecl = node.AncestorsAndSelf().OfType<PropertyDeclarationSyntax>().FirstOrDefault();
                if (propDecl is null) continue;
                context.RegisterCodeFix(
                    CodeAction.Create(
                        title: SwapToDPDictTitle,
                        createChangedDocument: ct => SwapCollectionTypeAsync(
                            context.Document, propDecl, "DeltaPack.DPDict", ct),
                        equivalenceKey: "SwapToDPDict"),
                    diagnostic);
            }
            else if (diagnostic.Id == Diagnostics.PartialPropertyMissingSetter.Id)
            {
                var propDecl = node.AncestorsAndSelf().OfType<PropertyDeclarationSyntax>().FirstOrDefault();
                if (propDecl is null) continue;
                context.RegisterCodeFix(
                    CodeAction.Create(
                        title: AddSetterTitle,
                        createChangedDocument: ct => AddSetterToPropertyAsync(context.Document, propDecl, ct),
                        equivalenceKey: "AddSetter"),
                    diagnostic);
            }
        }
    }

    private static async Task<Document> AddSetterToPropertyAsync(
        Document document, PropertyDeclarationSyntax propDecl, CancellationToken ct)
    {
        if (propDecl.AccessorList is null) return document;

        var setter = SyntaxFactory.AccessorDeclaration(SyntaxKind.SetAccessorDeclaration)
            .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken));

        var newAccessorList = propDecl.AccessorList.AddAccessors(setter);
        var newPropDecl = propDecl.WithAccessorList(newAccessorList);

        var root = await document.GetSyntaxRootAsync(ct).ConfigureAwait(false);
        if (root is null) return document;
        return document.WithSyntaxRoot(root.ReplaceNode(propDecl, newPropDecl));
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

    /// <summary>
    /// Rewrites the property's declared type by substituting the leftmost identifier
    /// (e.g. <c>List</c> in <c>List&lt;int&gt;</c> or <c>Dictionary</c> in <c>Dictionary&lt;string, int&gt;</c>)
    /// with the fully-qualified DP replacement. Preserves the generic argument list.
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
