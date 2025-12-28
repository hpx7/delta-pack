namespace DeltaPack;

public abstract record SchemaType;

// Primitive types
public sealed record StringType : SchemaType;
public sealed record IntType(long? Min = null, long? Max = null) : SchemaType;
public sealed record FloatType(double? Precision = null) : SchemaType;
public sealed record BooleanType : SchemaType;
public sealed record EnumType(IReadOnlyList<string> Options) : SchemaType
{
    public int NumBits { get; } = Options.Count <= 1 ? 1 : (int)Math.Ceiling(Math.Log(Options.Count, 2));
}

// Reference to another type in the schema
public sealed record ReferenceType(string Reference) : SchemaType;

// Container types
public sealed record ArrayType(SchemaType Value) : SchemaType;
public sealed record OptionalType(SchemaType Value) : SchemaType;
public sealed record RecordType(SchemaType Key, SchemaType Value) : SchemaType;

// Composite types
public sealed record ObjectType(IReadOnlyDictionary<string, SchemaType> Properties) : SchemaType;
public sealed record UnionType(IReadOnlyList<ReferenceType> Options) : SchemaType
{
    public int NumBits { get; } = Options.Count <= 1 ? 1 : (int)Math.Ceiling(Math.Log(Options.Count, 2));
}

public static class Schema
{
    public static bool IsPrimitiveType(SchemaType type, IReadOnlyDictionary<string, SchemaType> schema) =>
        type switch
        {
            ReferenceType refType => schema.TryGetValue(refType.Reference, out var resolved)
                ? IsPrimitiveType(resolved, schema)
                : throw new InvalidOperationException($"Unknown reference type: {refType.Reference}"),
            StringType or IntType or FloatType or BooleanType or EnumType => true,
            _ => false
        };
}
