using System.Text.RegularExpressions;

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
public sealed record ObjectType : SchemaType
{
    private static readonly Regex ValidPropertyNameRegex = new(@"^[a-zA-Z_][a-zA-Z0-9_]*$", RegexOptions.Compiled);

    public IReadOnlyDictionary<string, SchemaType> Properties { get; }

    public ObjectType(IReadOnlyDictionary<string, SchemaType> Properties)
    {
        foreach (var key in Properties.Keys)
        {
            if (!ValidPropertyNameRegex.IsMatch(key))
                throw new ArgumentException($"Invalid property name \"{key}\": must be a valid identifier");
        }
        this.Properties = Properties;
    }
}
public sealed record UnionType(IReadOnlyList<ReferenceType> Options) : SchemaType
{
    public int NumBits { get; } = Options.Count <= 1 ? 1 : (int)Math.Ceiling(Math.Log(Options.Count, 2));
}

public static class Schema
{
    private static readonly Regex ValidTypeNameRegex = new(@"^[A-Z][A-Za-z0-9_]*$", RegexOptions.Compiled);

    private static readonly HashSet<string> ReservedTypeNames = new()
    {
        "Default",
        "FromJson",
        "ToJson",
        "Clone",
        "Equals",
        "Encode",
        "Decode",
        "EncodeDiff",
        "DecodeDiff",
    };

    public static void AddType(IDictionary<string, SchemaType> schema, string name, SchemaType type)
    {
        if (!ValidTypeNameRegex.IsMatch(name))
            throw new ArgumentException($"Invalid type name \"{name}\": must start with uppercase letter and contain only alphanumeric characters and underscores");
        if (ReservedTypeNames.Contains(name))
            throw new ArgumentException($"Invalid type name \"{name}\": conflicts with generated method name");
        schema[name] = type;
    }

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
