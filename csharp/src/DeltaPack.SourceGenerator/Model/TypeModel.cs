using System;

namespace DeltaPack.SourceGenerator.Model;

internal enum IntStorage { SByte, Short, Int, Long, Byte, UShort, UInt, ULong }

internal static class IntStorageExtensions
{
    public static bool IsSigned(this IntStorage s) =>
        s is IntStorage.SByte or IntStorage.Short or IntStorage.Int or IntStorage.Long;

    public static string CSharpKeyword(this IntStorage s) => s switch
    {
        IntStorage.SByte => "sbyte",
        IntStorage.Short => "short",
        IntStorage.Int => "int",
        IntStorage.Long => "long",
        IntStorage.Byte => "byte",
        IntStorage.UShort => "ushort",
        IntStorage.UInt => "uint",
        IntStorage.ULong => "ulong",
        _ => throw new ArgumentOutOfRangeException(nameof(s)),
    };
}

internal enum TypeKind
{
    String,
    Int,
    Float,
    Boolean,
    Array,
    Optional,
    Record,
    Reference,
}

/// <summary>
/// Mirrors <c>rust/delta-pack-derive/src/ir.rs::Type</c>. Value-typed for incremental caching.
/// </summary>
internal sealed record TypeRef(
    TypeKind Kind,
    IntStorage IntStorage = default,
    long? IntMin = null,
    long? IntMax = null,
    byte? IntNumBits = null,
    float? FloatPrecision = null,
    TypeRef? ElementType = null,
    TypeRef? KeyType = null,
    TypeRef? ValueType = null,
    string? ReferenceName = null,
    // True when an Array/Record was declared using TrackedList<T> / TrackedOrderedDict<K,V>.
    // Binary format is identical to the untracked variant; this flag only affects the emitted
    // C# concrete type (TrackedList vs List, TrackedOrderedDict vs OrderedDict).
    bool IsTracked = false)
{
    public static TypeRef String() => new(TypeKind.String);
    public static TypeRef Boolean() => new(TypeKind.Boolean);
    public static TypeRef Float(float? precision) => new(TypeKind.Float, FloatPrecision: precision);
    public static TypeRef Int(IntStorage storage, long? min = null, long? max = null, byte? numBits = null)
        => new(TypeKind.Int, IntStorage: storage, IntMin: min, IntMax: max, IntNumBits: numBits);
    public static TypeRef Array(TypeRef element, bool isTracked = false) => new(TypeKind.Array, ElementType: element, IsTracked: isTracked);
    public static TypeRef Optional(TypeRef inner) => new(TypeKind.Optional, ElementType: inner);
    public static TypeRef Record(TypeRef key, TypeRef value, bool isTracked = false) => new(TypeKind.Record, KeyType: key, ValueType: value, IsTracked: isTracked);
    public static TypeRef Reference(string fullyQualifiedName) => new(TypeKind.Reference, ReferenceName: fullyQualifiedName);
}

internal enum IntStrategyKind { Packed, Unsigned, Signed }

internal readonly record struct IntStrategy(IntStrategyKind Kind, long Offset, long Max, byte NumBits);

internal enum FloatStrategyKind { Quantized, Full }

internal readonly record struct FloatStrategy(FloatStrategyKind Kind, float Precision);

internal static class Strategy
{
    public static byte? ComputeNumBits(long min, long max)
    {
        if (max < min) return null;
        var range = (double)((decimal)max - min + 1);
        var bits = range <= 1 ? 1 : (int)Math.Ceiling(Math.Log(range) / Math.Log(2));
        return bits <= 8 ? (byte)bits : (byte?)null;
    }

    public static IntStrategy IntStrategyFor(TypeRef t)
    {
        if (t.IntMin is long min && t.IntMax is long max && t.IntNumBits is byte bits)
            return new IntStrategy(IntStrategyKind.Packed, min, max, bits);
        if (t.IntMin is long m && m >= 0)
            return new IntStrategy(IntStrategyKind.Unsigned, m, 0, 0);
        return new IntStrategy(IntStrategyKind.Signed, 0, 0, 0);
    }

    public static FloatStrategy FloatStrategyFor(TypeRef t)
    {
        if (t.FloatPrecision is float p && p != 0.0f)
            return new FloatStrategy(FloatStrategyKind.Quantized, p);
        return new FloatStrategy(FloatStrategyKind.Full, 0f);
    }
}

internal sealed record FieldModel(
    string Name,              // C# PascalCase (property name)
    string JsonName,          // camelCase for consistency with CLI output
    TypeRef Type,
    bool InitOnly,
    // True when the property was declared with the `partial` modifier in user code.
    // Outside [DeltaPackTracked], the generator still emits a trivial implementing
    // declaration so users can adopt partial-property syntax ahead of enabling tracking.
    bool IsDeclaredPartial = false);

internal enum TypeDefKind { Object, Union, Enum }

/// <summary>
/// A class annotated with [DeltaPack] (or an enum referenced transitively). Emitted as
/// one partial class / one helper per entry.
/// </summary>
internal sealed record TypeDef(
    TypeDefKind Kind,
    string FullyQualifiedName,        // global::Ns.Outer.Inner
    string? Namespace,                // null for global namespace
    EquatableArray<string> ContainingTypes, // outer->inner chain (empty if top-level)
    string SimpleName,                // class name without namespace
    EquatableArray<FieldModel> Fields,       // objects only
    EquatableArray<string> UnionVariants,    // fully-qualified variant names (unions only)
    EquatableArray<string> EnumMembers,      // member names in declaration order (enums only)
    bool IsAbstract,
    bool IsStruct = false,
    bool IsTracked = false);          // true if annotated with [DeltaPackTracked]
