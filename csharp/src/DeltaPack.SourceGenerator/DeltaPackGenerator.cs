using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using DeltaPack.SourceGenerator.Emit;
using DeltaPack.SourceGenerator.Model;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace DeltaPack.SourceGenerator;

[Generator(LanguageNames.CSharp)]
public sealed class DeltaPackGenerator : IIncrementalGenerator
{
    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        // Manual attribute walker. `ForAttributeWithMetadataName` (Roslyn 4.4+) would be
        // faster but excludes Unity 2021.3 LTS / 2022.3 LTS which ship with Roslyn 4.0/4.1.
        var annotated = context.SyntaxProvider
            .CreateSyntaxProvider(
                predicate: static (node, _) =>
                    (node is ClassDeclarationSyntax c && c.AttributeLists.Count > 0) ||
                    (node is StructDeclarationSyntax s && s.AttributeLists.Count > 0),
                transform: static (ctx, _) =>
                {
                    var decl = (TypeDeclarationSyntax)ctx.Node;
                    var sym = ctx.SemanticModel.GetDeclaredSymbol(decl) as INamedTypeSymbol;
                    if (sym is null) return null;
                    return TypeMapper.HasDeltaPackAttribute(sym) ? sym : null;
                })
            .Where(static sym => sym is not null)
            .Select(static (sym, _) => sym!)
            .Collect();

        context.RegisterSourceOutput(annotated, Generate);
    }

    private static void Generate(SourceProductionContext ctx, ImmutableArray<INamedTypeSymbol> annotated)
    {
        if (annotated.IsDefaultOrEmpty) return;

        // ========== Validation pass ==========
        // Emit diagnostics for structurally invalid annotations and skip those types.
        var accepted = new List<INamedTypeSymbol>();
        foreach (var sym in annotated.Distinct<INamedTypeSymbol>(SymbolEqualityComparer.Default))
        {
            if (sym.IsGenericType)
            {
                ctx.ReportDiagnostic(Diagnostic.Create(
                    Diagnostics.GenericTypeUnsupported, sym.Locations.FirstOrDefault(), sym.ToDisplayString()));
                continue;
            }
            if (!IsDeclaredPartial(sym))
            {
                ctx.ReportDiagnostic(Diagnostic.Create(
                    Diagnostics.MissingPartial, sym.Locations.FirstOrDefault(), sym.ToDisplayString()));
                continue;
            }
            if (sym.IsAbstract && TypeMapper.GetUnionVariants(sym).Length == 0)
            {
                ctx.ReportDiagnostic(Diagnostic.Create(
                    Diagnostics.AbstractMissingUnion, sym.Locations.FirstOrDefault(), sym.ToDisplayString()));
                continue;
            }
            accepted.Add(sym);
        }

        // ========== Build registry ==========
        // Collect all [DeltaPack] types + transitively referenced enum symbols.
        var registryBuilder = ImmutableDictionary.CreateBuilder<string, TypeDef>();
        var objectDefs = new List<(INamedTypeSymbol Sym, TypeDef Def)>();
        var unionDefs = new List<(INamedTypeSymbol Sym, TypeDef Def)>();
        var enumSymbols = new Dictionary<string, INamedTypeSymbol>();

        foreach (var sym in accepted)
        {
            var variants = TypeMapper.GetUnionVariants(sym);
            if (sym.IsAbstract || variants.Length > 0)
            {
                var def = BuildUnionDef(sym, variants);
                if (def is null) continue;
                registryBuilder[def.FullyQualifiedName] = def;
                unionDefs.Add((sym, def));
            }
            else
            {
                var def = BuildObjectDef(ctx, sym, enumSymbols);
                if (def is null) continue;
                registryBuilder[def.FullyQualifiedName] = def;
                objectDefs.Add((sym, def));
            }
        }

        // Register enum TypeDefs discovered during field mapping.
        foreach (var kvp in enumSymbols)
        {
            var e = kvp.Value;
            registryBuilder[kvp.Key] = new TypeDef(
                Kind: TypeDefKind.Enum,
                FullyQualifiedName: kvp.Key,
                Namespace: GetNamespace(e),
                ContainingTypes: GetContainingTypes(e),
                SimpleName: e.Name,
                Fields: EquatableArray<FieldModel>.Empty,
                UnionVariants: EquatableArray<string>.Empty,
                EnumMembers: new EquatableArray<string>(
                    e.GetMembers().OfType<IFieldSymbol>()
                        .Where(f => f.HasConstantValue)
                        .Select(f => f.Name)
                        .ToImmutableArray()),
                IsAbstract: false);
        }

        var registry = new ModelRegistry(registryBuilder.ToImmutable());

        // ========== Validate union variants are registered ==========
        foreach (var (sym, def) in unionDefs)
        {
            foreach (var variantFqn in def.UnionVariants)
            {
                if (registry.Lookup(variantFqn) is null)
                    ctx.ReportDiagnostic(Diagnostic.Create(
                        Diagnostics.UnionVariantNotRegistered, sym.Locations.FirstOrDefault(), variantFqn, def.FullyQualifiedName));
            }
        }

        // Track which variant symbols derive from a [DeltaPack] union base — those need `new`
        // modifiers on hiding methods to match CLI output shape.
        var variantFqns = new HashSet<string>(unionDefs.SelectMany(u => u.Def.UnionVariants));

        // ========== Emit sources ==========
        foreach (var (_, def) in objectDefs)
        {
            var hidesBase = variantFqns.Contains(def.FullyQualifiedName);
            var source = ObjectEmitter.Emit(def, registry, hidesBase);
            ctx.AddSource(SafeFileName(def.FullyQualifiedName) + ".g.cs", source);
        }
        foreach (var (_, def) in unionDefs)
        {
            var source = UnionEmitter.Emit(def, registry);
            ctx.AddSource(SafeFileName(def.FullyQualifiedName) + ".g.cs", source);
        }
    }

    private static TypeDef? BuildObjectDef(SourceProductionContext ctx, INamedTypeSymbol sym, Dictionary<string, INamedTypeSymbol> enumSink)
    {
        var fieldsBuilder = ImmutableArray.CreateBuilder<FieldModel>();
        foreach (var m in sym.GetMembers())
        {
            if (m is IPropertySymbol prop && !prop.IsStatic && prop.DeclaredAccessibility == Accessibility.Public)
            {
                if (prop.IsIndexer) continue;
                var propLocation = prop.Locations.FirstOrDefault() ?? sym.Locations.FirstOrDefault() ?? Location.None;
                var isPartial = IsDeclaredPartialProperty(prop);

                // A partial property without a setter would fall through silently today
                // (no field, no tracking). The user wrote `partial` expecting tracking;
                // surface the mismatch instead of generating nothing.
                if (prop.SetMethod is null)
                {
                    if (isPartial)
                        ctx.ReportDiagnostic(Diagnostic.Create(
                            Diagnostics.PartialPropertyMissingSetter, propLocation,
                            sym.ToDisplayString(), prop.Name));
                    continue;
                }

                // [DeltaPackIgnore] removes the property from serialization, but `partial`
                // opts into generated tracking. The two attributes contradict each other —
                // catch the conflict at generation time rather than silently honoring ignore.
                if (TypeMapper.HasIgnoreAttribute(prop))
                {
                    if (isPartial)
                        ctx.ReportDiagnostic(Diagnostic.Create(
                            Diagnostics.IgnoreOnPartialProperty, propLocation,
                            sym.ToDisplayString(), prop.Name));
                    continue;
                }

                // The tracking emitter unconditionally produces a `set` accessor; emitting
                // `set` against a defining declaration that uses `init` is a CS-level mismatch.
                // Catch it with a delta-pack-specific diagnostic that points at the fix.
                if (isPartial && prop.SetMethod.IsInitOnly)
                {
                    ctx.ReportDiagnostic(Diagnostic.Create(
                        Diagnostics.PartialPropertyInitOnly, propLocation,
                        sym.ToDisplayString(), prop.Name));
                    continue;
                }

                var r = TypeMapper.MapField(prop, prop.Type, propLocation);
                if (r.Diagnostic is not null) { ctx.ReportDiagnostic(r.Diagnostic); return null; }
                if (r.Field is not null)
                {
                    // Interface collection types are sugar that depends on the partial-property
                    // setter being able to wrap non-tracked assignments. On a non-partial
                    // property the generator never sees the setter, so the user's plain
                    // List<T>/Dictionary<K,V> would land in the field unwrapped — silently
                    // breaking the insertion-order invariant the diff format relies on. Reject
                    // the combination explicitly.
                    var useInterfaceType = TypeMapper.IsInterfaceCollectionType(prop.Type);
                    if (useInterfaceType && !isPartial)
                    {
                        ctx.ReportDiagnostic(Diagnostic.Create(
                            Diagnostics.InterfaceCollectionRequiresPartial, propLocation,
                            sym.ToDisplayString(), prop.Name));
                        continue;
                    }
                    var field = r.Field with { IsDeclaredPartial = isPartial, UseInterfaceType = useInterfaceType };
                    fieldsBuilder.Add(field);
                    CollectEnumsFromType(prop.Type, enumSink);
                }
            }
            else if (m is IFieldSymbol fld && !fld.IsStatic && fld.DeclaredAccessibility == Accessibility.Public && !fld.IsImplicitlyDeclared)
            {
                if (TypeMapper.HasIgnoreAttribute(fld)) continue;
                var r = TypeMapper.MapField(fld, fld.Type, fld.Locations.FirstOrDefault() ?? sym.Locations.FirstOrDefault() ?? Location.None);
                if (r.Diagnostic is not null) { ctx.ReportDiagnostic(r.Diagnostic); return null; }
                if (r.Field is not null)
                {
                    fieldsBuilder.Add(r.Field);
                    CollectEnumsFromType(fld.Type, enumSink);
                }
            }
        }

        // Class participates in tracking when at least one property is declared `partial`.
        // That property gets a generator-emitted dirty-tracking setter; non-partial fields
        // fall back to comparison-based diff.
        var fields = fieldsBuilder.ToImmutable();
        var hasAnyPartial = fields.Any(f => f.IsDeclaredPartial);

        return new TypeDef(
            Kind: TypeDefKind.Object,
            FullyQualifiedName: TypeMapper.GlobalFqn(sym),
            Namespace: GetNamespace(sym),
            ContainingTypes: GetContainingTypes(sym),
            SimpleName: sym.Name,
            Fields: new EquatableArray<FieldModel>(fields),
            UnionVariants: EquatableArray<string>.Empty,
            EnumMembers: EquatableArray<string>.Empty,
            IsAbstract: sym.IsAbstract,
            IsStruct: sym.IsValueType,
            IsTracked: hasAnyPartial);
    }

    private static TypeDef? BuildUnionDef(INamedTypeSymbol sym, ImmutableArray<INamedTypeSymbol> variants)
    {
        var variantNames = variants.Select(TypeMapper.GlobalFqn).ToImmutableArray();
        return new TypeDef(
            Kind: TypeDefKind.Union,
            FullyQualifiedName: TypeMapper.GlobalFqn(sym),
            Namespace: GetNamespace(sym),
            ContainingTypes: GetContainingTypes(sym),
            SimpleName: sym.Name,
            Fields: EquatableArray<FieldModel>.Empty,
            UnionVariants: new EquatableArray<string>(variantNames),
            EnumMembers: EquatableArray<string>.Empty,
            IsAbstract: true);
    }

    /// <summary>
    /// Walks an <see cref="ITypeSymbol"/>, recursing into array/list/record/optional type arguments,
    /// and registers any enum symbols encountered into the sink. Nullable wrappers and other
    /// generic wrappers are unwrapped.
    /// </summary>
    private static void CollectEnumsFromType(ITypeSymbol type, Dictionary<string, INamedTypeSymbol> sink)
    {
        if (type is IArrayTypeSymbol arr)
        {
            CollectEnumsFromType(arr.ElementType, sink);
            return;
        }
        if (type is INamedTypeSymbol named)
        {
            if (named.TypeKind == Microsoft.CodeAnalysis.TypeKind.Enum)
            {
                sink[TypeMapper.GlobalFqn(named)] = named;
                return;
            }
            if (named.IsGenericType)
            {
                foreach (var arg in named.TypeArguments)
                    CollectEnumsFromType(arg, sink);
            }
        }
    }

    private static bool IsDeclaredPartial(INamedTypeSymbol sym)
    {
        foreach (var decl in sym.DeclaringSyntaxReferences)
        {
            if (decl.GetSyntax() is TypeDeclarationSyntax tds
                && tds.Modifiers.Any(m => m.ValueText == "partial"))
                return true;
        }
        return false;
    }

    /// <summary>
    /// True when the property's declaring syntax has the <c>partial</c> modifier. Used in lieu of
    /// <c>IPropertySymbol.IsPartialDefinition</c> which is only available on Roslyn 4.7+; this
    /// project targets 4.0.1 to keep Unity LTS compat.
    /// </summary>
    private static bool IsDeclaredPartialProperty(IPropertySymbol prop)
    {
        foreach (var decl in prop.DeclaringSyntaxReferences)
        {
            if (decl.GetSyntax() is PropertyDeclarationSyntax pds
                && pds.Modifiers.Any(m => m.ValueText == "partial"))
                return true;
        }
        return false;
    }

    private static string? GetNamespace(INamedTypeSymbol sym)
    {
        var ns = sym.ContainingNamespace;
        if (ns is null || ns.IsGlobalNamespace) return null;
        return ns.ToDisplayString();
    }

    private static EquatableArray<string> GetContainingTypes(INamedTypeSymbol sym)
    {
        var stack = new Stack<string>();
        var container = sym.ContainingType;
        while (container is not null)
        {
            stack.Push(container.Name);
            container = container.ContainingType;
        }
        return new EquatableArray<string>(stack.ToImmutableArray());
    }

    private static string SafeFileName(string fqn)
        => fqn.Replace("global::", "").Replace('<', '_').Replace('>', '_').Replace(',', '_').Replace(' ', '_');
}
