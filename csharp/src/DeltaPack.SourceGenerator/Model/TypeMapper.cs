using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using Microsoft.CodeAnalysis;

namespace DeltaPack.SourceGenerator.Model;

internal static class TypeMapper
{
    public const string DeltaPackAttributeFullName = "DeltaPack.DeltaPackAttribute";
    public const string DeltaPackIgnoreAttributeFullName = "DeltaPack.DeltaPackIgnoreAttribute";
    public const string DeltaPackPrecisionAttributeFullName = "DeltaPack.DeltaPackPrecisionAttribute";
    public const string DeltaPackRangeAttributeFullName = "DeltaPack.DeltaPackRangeAttribute";
    public const string DeltaPackUnionAttributeFullName = "DeltaPack.DeltaPackUnionAttribute";

    public readonly record struct FieldMapResult(FieldModel? Field, Diagnostic? Diagnostic);

    public static FieldMapResult MapField(ISymbol member, ITypeSymbol memberType, Location location)
    {
        // Honor DeltaPackPrecision / DeltaPackRange on the member.
        float? precision = null;
        long? rangeMin = null;
        long? rangeMax = null;

        foreach (var attr in member.GetAttributes())
        {
            var attrName = attr.AttributeClass?.ToDisplayString();
            if (attrName == DeltaPackPrecisionAttributeFullName && attr.ConstructorArguments.Length == 1)
            {
                var val = attr.ConstructorArguments[0].Value;
                if (val is double d) precision = (float)d;
                else if (val is float f) precision = f;
            }
            else if (attrName == DeltaPackRangeAttributeFullName)
            {
                if (attr.ConstructorArguments.Length >= 1 && attr.ConstructorArguments[0].Value is long minL)
                    rangeMin = minL;
                if (attr.ConstructorArguments.Length == 2 && attr.ConstructorArguments[1].Value is long maxL)
                    rangeMax = maxL;
            }
        }

        var isReferenceNullable = memberType.NullableAnnotation == NullableAnnotation.Annotated
                                  && memberType.IsReferenceType;

        // Nullable<T> already flattens via SpecialType + TypeArguments; we match it explicitly below.
        var mapped = MapType(memberType, precision, rangeMin, rangeMax, location);
        if (mapped.Diagnostic is not null || mapped.Type is null)
            return new FieldMapResult(null, mapped.Diagnostic);

        var typeRef = mapped.Type;
        if (isReferenceNullable && typeRef.Kind != TypeKind.Optional)
            typeRef = TypeRef.Optional(typeRef);

        var name = member.Name;
        var jsonName = ToCamelCase(name);
        var initOnly = member is IPropertySymbol prop && prop.SetMethod?.IsInitOnly == true;

        return new FieldMapResult(new FieldModel(name, jsonName, typeRef, initOnly), null);
    }

    public readonly record struct TypeMapResult(TypeRef? Type, Diagnostic? Diagnostic);

    public static TypeMapResult MapType(
        ITypeSymbol type,
        float? precision,
        long? rangeMin,
        long? rangeMax,
        Location location)
    {
        // Unwrap Nullable<T> (e.g. int?, Color?) to Optional(inner)
        if (type is INamedTypeSymbol named && named.IsGenericType && named.ConstructedFrom?.SpecialType == SpecialType.System_Nullable_T)
        {
            var inner = MapType(named.TypeArguments[0], precision, rangeMin, rangeMax, location);
            if (inner.Type is null) return inner;
            return new TypeMapResult(TypeRef.Optional(inner.Type), null);
        }

        // Strip outer annotation for the rest of matching.
        var bare = type.WithNullableAnnotation(NullableAnnotation.NotAnnotated);

        switch (bare.SpecialType)
        {
            case SpecialType.System_String:
                return new TypeMapResult(TypeRef.String(), null);
            case SpecialType.System_Boolean:
                return new TypeMapResult(TypeRef.Boolean(), null);
            case SpecialType.System_Single:
                return new TypeMapResult(TypeRef.Float(precision), null);
            case SpecialType.System_Double:
                return new TypeMapResult(null, Diagnostic.Create(
                    Diagnostics.DoubleNotSupported, location, type.ToDisplayString()));
            case SpecialType.System_SByte:
                return IntType(IntStorage.SByte, rangeMin, rangeMax);
            case SpecialType.System_Int16:
                return IntType(IntStorage.Short, rangeMin, rangeMax);
            case SpecialType.System_Int32:
                return IntType(IntStorage.Int, rangeMin, rangeMax);
            case SpecialType.System_Int64:
                return IntType(IntStorage.Long, rangeMin, rangeMax);
            // Unsigned C# types imply min=0 when no explicit range attribute is present.
            case SpecialType.System_Byte:
                return IntType(IntStorage.Byte, rangeMin ?? 0, rangeMax);
            case SpecialType.System_UInt16:
                return IntType(IntStorage.UShort, rangeMin ?? 0, rangeMax);
            case SpecialType.System_UInt32:
                return IntType(IntStorage.UInt, rangeMin ?? 0, rangeMax);
            case SpecialType.System_UInt64:
                return IntType(IntStorage.ULong, rangeMin ?? 0, rangeMax);
        }

        // Enum → Reference (the enum TypeDef is registered separately)
        if (bare.TypeKind == Microsoft.CodeAnalysis.TypeKind.Enum)
            return new TypeMapResult(TypeRef.Reference(GlobalFqn(bare)), null);

        // T[]
        if (bare is IArrayTypeSymbol arr)
        {
            var elem = MapType(arr.ElementType, null, null, null, location);
            if (elem.Type is null) return elem;
            return new TypeMapResult(TypeRef.Array(elem.Type), null);
        }

        if (bare is INamedTypeSymbol n && n.IsGenericType)
        {
            var constructedFrom = n.ConstructedFrom;
            var constructedMetadata = constructedFrom?.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat);

            // System.Collections.Generic.List<T> — error: must use DPList<T>
            if (constructedMetadata == "global::System.Collections.Generic.List<T>")
            {
                return new TypeMapResult(null, Diagnostic.Create(
                    Diagnostics.UseDPList, location, "<field>", type.ToDisplayString()));
            }

            // DeltaPack.DPList<T>
            if (constructedMetadata == "global::DeltaPack.DPList<T>")
            {
                var elem = MapType(n.TypeArguments[0], null, null, null, location);
                if (elem.Type is null) return elem;
                return new TypeMapResult(TypeRef.Array(elem.Type), null);
            }

            // System.Collections.Generic.IList<T> — sugar for DPList<T>. Honored only on partial
            // properties (BuildObjectDef enforces this with DP016); the source generator emits
            // a setter that wraps non-tracked assignments into a fresh DPList<T> so the backing
            // store remains the always-tracking container.
            if (constructedMetadata == "global::System.Collections.Generic.IList<T>")
            {
                var elem = MapType(n.TypeArguments[0], null, null, null, location);
                if (elem.Type is null) return elem;
                return new TypeMapResult(TypeRef.Array(elem.Type), null);
            }

            // DeltaPack.DPDict<K,V>
            if (constructedMetadata == "global::DeltaPack.DPDict<TKey, TValue>")
            {
                var k = MapType(n.TypeArguments[0], null, null, null, location);
                var v = MapType(n.TypeArguments[1], null, null, null, location);
                if (k.Type is null) return k;
                if (v.Type is null) return v;
                return new TypeMapResult(TypeRef.Record(k.Type, v.Type), null);
            }

            // System.Collections.Generic.IDictionary<K, V> — sugar for DPDict<K, V>. Same partial-
            // property requirement as IList<T>; setter wraps incoming dictionaries into DPDict
            // to preserve the insertion-order guarantee that record diffs depend on.
            if (constructedMetadata == "global::System.Collections.Generic.IDictionary<TKey, TValue>")
            {
                var k = MapType(n.TypeArguments[0], null, null, null, location);
                var v = MapType(n.TypeArguments[1], null, null, null, location);
                if (k.Type is null) return k;
                if (v.Type is null) return v;
                return new TypeMapResult(TypeRef.Record(k.Type, v.Type), null);
            }

            // Dictionary<,> / OrderedDictionary<,> → error: must use DPDict<,>
            if (constructedMetadata == "global::System.Collections.Generic.Dictionary<TKey, TValue>"
                || constructedMetadata == "global::System.Collections.Generic.OrderedDictionary<TKey, TValue>")
            {
                return new TypeMapResult(null, Diagnostic.Create(
                    Diagnostics.UseDPDict, location, "<field>", type.ToDisplayString()));
            }
        }

        // Reference to another class (object or union). Cross-reference resolution happens
        // in the registry — here we just record the FQN.
        if (bare is INamedTypeSymbol refType && refType.TypeKind is Microsoft.CodeAnalysis.TypeKind.Class or Microsoft.CodeAnalysis.TypeKind.Interface or Microsoft.CodeAnalysis.TypeKind.Struct)
        {
            if (refType.IsGenericType)
                return new TypeMapResult(null, Diagnostic.Create(
                    Diagnostics.GenericTypeUnsupported, location, type.ToDisplayString()));
            return new TypeMapResult(TypeRef.Reference(GlobalFqn(refType)), null);
        }

        return new TypeMapResult(null, Diagnostic.Create(
            Diagnostics.UnsupportedFieldType, location, "<field>", type.ToDisplayString()));
    }

    private static TypeMapResult IntType(IntStorage storage, long? min, long? max)
    {
        byte? numBits = null;
        if (min is long lo && max is long hi)
            numBits = Strategy.ComputeNumBits(lo, hi);
        return new TypeMapResult(TypeRef.Int(storage, min, max, numBits), null);
    }

    public static string GlobalFqn(ITypeSymbol type)
        => type.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat);

    public static string ToCamelCase(string name)
    {
        if (string.IsNullOrEmpty(name)) return name;
        if (char.IsUpper(name[0]))
            return char.ToLowerInvariant(name[0]) + name.Substring(1);
        return name;
    }

    /// <summary>
    /// True when <paramref name="type"/> is <c>System.Collections.Generic.IList&lt;T&gt;</c> or
    /// <c>IDictionary&lt;K, V&gt;</c> (with or without a nullable annotation). Used by the
    /// generator to decide whether a property declaration is interface-typed sugar — in which
    /// case the partial-property setter wraps non-tracked assignments into a concrete
    /// DPList/DPDict.
    /// </summary>
    public static bool IsInterfaceCollectionType(ITypeSymbol type)
    {
        var bare = type.WithNullableAnnotation(NullableAnnotation.NotAnnotated);
        if (bare is INamedTypeSymbol n && n.IsGenericType)
        {
            var meta = n.ConstructedFrom?.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat);
            return meta == "global::System.Collections.Generic.IList<T>"
                || meta == "global::System.Collections.Generic.IDictionary<TKey, TValue>";
        }
        return false;
    }

    public static bool HasDeltaPackAttribute(INamedTypeSymbol type)
        => type.GetAttributes().Any(a => a.AttributeClass?.ToDisplayString() == DeltaPackAttributeFullName);

    public static bool HasIgnoreAttribute(ISymbol member)
        => member.GetAttributes().Any(a => a.AttributeClass?.ToDisplayString() == DeltaPackIgnoreAttributeFullName);

    public static ImmutableArray<INamedTypeSymbol> GetUnionVariants(INamedTypeSymbol type)
    {
        foreach (var attr in type.GetAttributes())
        {
            if (attr.AttributeClass?.ToDisplayString() != DeltaPackUnionAttributeFullName) continue;
            if (attr.ConstructorArguments.Length != 1) continue;
            var arg = attr.ConstructorArguments[0];
            if (arg.Kind != TypedConstantKind.Array) continue;
            return arg.Values
                .Select(v => v.Value as INamedTypeSymbol)
                .Where(v => v is not null)
                .Select(v => v!)
                .ToImmutableArray();
        }
        return ImmutableArray<INamedTypeSymbol>.Empty;
    }
}
