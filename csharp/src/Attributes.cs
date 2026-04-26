namespace DeltaPack;

/// <summary>
/// Marks a partial class or struct for compile-time delta-pack code generation.
/// The source generator emits Encode/Decode/EncodeDiff/DecodeDiff/Equals/Clone/Default/
/// FromJson/ToJson methods onto the annotated type.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Struct)]
public sealed class DeltaPackAttribute : Attribute { }

/// <summary>
/// Specifies float precision for quantized encoding.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class DeltaPackPrecisionAttribute : Attribute
{
    public double Precision { get; }
    public DeltaPackPrecisionAttribute(double precision) => Precision = precision;
}

/// <summary>
/// Specifies min/max bounds for integer encoding.
/// Bounded integers are encoded more efficiently when values are constrained.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class DeltaPackRangeAttribute : Attribute
{
    public long Min { get; }
    public long? Max { get; }
    public DeltaPackRangeAttribute(long min) => Min = min;
    public DeltaPackRangeAttribute(long min, long max)
    {
        Min = min;
        Max = max;
    }
}

/// <summary>
/// Excludes a property or field from serialization.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class DeltaPackIgnoreAttribute : Attribute { }

/// <summary>
/// Marks an abstract base class as a union. List its variants as type arguments.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface)]
public sealed class DeltaPackUnionAttribute : Attribute
{
    public Type[] Variants { get; }
    public DeltaPackUnionAttribute(params Type[] variants) => Variants = variants;
}

