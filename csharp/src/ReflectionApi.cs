using System.Collections;
using System.Reflection;

namespace DeltaPack;

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
/// Marks a property/field as unsigned integer.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class DeltaPackUnsignedAttribute : Attribute { }

/// <summary>
/// Marks a type as a union variant. Apply to the base class/interface.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface)]
public sealed class DeltaPackUnionAttribute : Attribute
{
    public Type[] Variants { get; }
    public DeltaPackUnionAttribute(params Type[] variants) => Variants = variants;
}

/// <summary>
/// Unity-friendly codec for encoding/decoding C# types.
/// Create once during initialization, reuse in hot paths.
/// </summary>
/// <example>
/// // During loading/initialization
/// var playerCodec = new DeltaPackCodec&lt;Player&gt;();
///
/// // In game loop - no reflection, no allocations
/// byte[] encoded = playerCodec.Encode(player);
/// Player decoded = playerCodec.Decode(encoded);
/// </example>
public sealed class DeltaPackCodec<T> where T : class
{
    private readonly IDeltaPackApi<object?> _api;
    private readonly TypeMapping _rootMapping;
    private readonly Func<T> _factory;

    /// <summary>
    /// Creates a new codec for type T.
    /// Call this during initialization (e.g., loading screen), not in hot paths.
    /// </summary>
    public DeltaPackCodec() : this(null) { }

    /// <summary>
    /// Creates a new codec with a custom factory for creating instances.
    /// Useful for types without parameterless constructors.
    /// </summary>
    public DeltaPackCodec(Func<T>? factory)
    {
        var builder = new SchemaBuilder();
        _rootMapping = builder.BuildMapping(typeof(T));
        var schema = builder.GetSchema();
        _api = Interpreter.Load<object?>(schema, typeof(T).Name);
        _factory = factory ?? CreateDefaultFactory();
    }

    private static Func<T> CreateDefaultFactory()
    {
        var type = typeof(T);
        var ctor = type.GetConstructor(Type.EmptyTypes);
        if (ctor is null)
            throw new InvalidOperationException(
                $"Type '{type.Name}' must have a parameterless constructor, or provide a factory to DeltaPackCodec<{type.Name}>");
        return () => (T)ctor.Invoke(null);
    }

    public byte[] Encode(T obj) => _api.Encode(ToUntyped(obj, _rootMapping));

    public T Decode(byte[] buf) => ToTyped(_api.Decode(buf), _rootMapping);

    public byte[] EncodeDiff(T a, T b) =>
        _api.EncodeDiff(ToUntyped(a, _rootMapping), ToUntyped(b, _rootMapping));

    public T DecodeDiff(T a, byte[] diff) =>
        ToTyped(_api.DecodeDiff(ToUntyped(a, _rootMapping), diff), _rootMapping);

    public bool Equals(T a, T b) =>
        _api.Equals(ToUntyped(a, _rootMapping), ToUntyped(b, _rootMapping));

    public T Clone(T obj) => ToTyped(_api.Clone(ToUntyped(obj, _rootMapping)), _rootMapping);

    private object? ToUntyped(object? obj, TypeMapping mapping)
    {
        if (obj is null)
            return null;

        return mapping switch
        {
            PrimitiveMapping => obj,
            EnumMapping em => Enum.GetName(em.EnumType, obj),
            ObjectMapping om => ToUntypedObject(obj, om),
            ArrayMapping am => ToUntypedArray((IList)obj, am),
            DictionaryMapping dm => ToUntypedDictionary((IDictionary)obj, dm),
            OptionalMapping optm => ToUntyped(obj, optm.Inner),
            UnionMapping um => ToUntypedUnion(obj, um),
            _ => throw new InvalidOperationException($"Unknown mapping: {mapping}")
        };
    }

    private Dictionary<string, object?> ToUntypedObject(object obj, ObjectMapping mapping)
    {
        var result = new Dictionary<string, object?>();
        foreach (var (name, member, memberMapping) in mapping.Members)
        {
            var value = member switch
            {
                PropertyInfo prop => prop.GetValue(obj),
                FieldInfo field => field.GetValue(obj),
                _ => throw new InvalidOperationException()
            };
            result[name] = ToUntyped(value, memberMapping);
        }
        return result;
    }

    private List<object?> ToUntypedArray(IList list, ArrayMapping mapping)
    {
        var result = new List<object?>(list.Count);
        foreach (var item in list)
            result.Add(ToUntyped(item, mapping.Element));
        return result;
    }

    private Dictionary<string, object?> ToUntypedDictionary(IDictionary dict, DictionaryMapping mapping)
    {
        var result = new Dictionary<string, object?>();
        foreach (DictionaryEntry entry in dict)
            result[(string)entry.Key] = ToUntyped(entry.Value, mapping.Value);
        return result;
    }

    private UnionValue ToUntypedUnion(object obj, UnionMapping mapping)
    {
        var objType = obj.GetType();
        if (!mapping.Options.TryGetValue(objType, out var optionMapping))
            throw new InvalidOperationException($"Unknown union variant: {objType.Name}");

        return new UnionValue(objType.Name, ToUntyped(obj, optionMapping));
    }

    private T ToTyped(object? obj, TypeMapping mapping) =>
        (T)ToTypedInternal(obj, mapping, typeof(T))!;

    private object? ToTypedInternal(object? obj, TypeMapping mapping, Type targetType)
    {
        if (obj is null)
            return null;

        return mapping switch
        {
            PrimitiveMapping pm => ConvertPrimitive(obj, pm.TargetType),
            EnumMapping em => Enum.Parse(em.EnumType, (string)obj),
            ObjectMapping om => ToTypedObject((Dictionary<string, object?>)obj, om),
            ArrayMapping am => ToTypedArray((List<object?>)obj, am),
            DictionaryMapping dm => ToTypedDictionary((Dictionary<string, object?>)obj, dm),
            OptionalMapping optm => ToTypedInternal(obj, optm.Inner, targetType),
            UnionMapping um => ToTypedUnion((UnionValue)obj, um),
            _ => throw new InvalidOperationException($"Unknown mapping: {mapping}")
        };
    }

    private static object ConvertPrimitive(object obj, Type targetType)
    {
        if (targetType == typeof(int))
            return Convert.ToInt32(obj);
        if (targetType == typeof(long))
            return Convert.ToInt64(obj);
        if (targetType == typeof(uint))
            return Convert.ToUInt32(obj);
        if (targetType == typeof(ulong))
            return Convert.ToUInt64(obj);
        if (targetType == typeof(float))
            return Convert.ToSingle(obj);
        if (targetType == typeof(double))
            return Convert.ToDouble(obj);
        if (targetType == typeof(short))
            return Convert.ToInt16(obj);
        if (targetType == typeof(ushort))
            return Convert.ToUInt16(obj);
        if (targetType == typeof(byte))
            return Convert.ToByte(obj);
        if (targetType == typeof(sbyte))
            return Convert.ToSByte(obj);
        return obj;
    }

    private object ToTypedObject(Dictionary<string, object?> dict, ObjectMapping mapping)
    {
        object obj;

        // Check if this is the root type or a nested type
        if (mapping.Type == typeof(T))
            obj = _factory();
        else
            obj = CreateInstance(mapping.Type);

        foreach (var (name, member, memberMapping) in mapping.Members)
        {
            if (!dict.TryGetValue(name, out var value))
                continue;

            var memberType = member switch
            {
                PropertyInfo prop => prop.PropertyType,
                FieldInfo field => field.FieldType,
                _ => typeof(object)
            };

            var typedValue = ToTypedInternal(value, memberMapping, memberType);
            switch (member)
            {
                case PropertyInfo prop:
                    prop.SetValue(obj, typedValue);
                    break;
                case FieldInfo field:
                    field.SetValue(obj, typedValue);
                    break;
            }
        }
        return obj;
    }

    private static object CreateInstance(Type type)
    {
        var ctor = type.GetConstructor(Type.EmptyTypes);
        if (ctor is null)
            throw new InvalidOperationException(
                $"Type '{type.Name}' must have a parameterless constructor");
        return ctor.Invoke(null);
    }

    private object ToTypedArray(List<object?> list, ArrayMapping mapping)
    {
        var elementType = GetElementType(mapping.Element);
        var typedList = (IList)Activator.CreateInstance(typeof(List<>).MakeGenericType(elementType))!;
        foreach (var item in list)
            typedList.Add(ToTypedInternal(item, mapping.Element, elementType));
        return typedList;
    }

    private static Type GetElementType(TypeMapping mapping) => mapping switch
    {
        PrimitiveMapping pm => pm.TargetType,
        EnumMapping em => em.EnumType,
        ObjectMapping om => om.Type,
        UnionMapping => typeof(object),
        OptionalMapping opt => GetElementType(opt.Inner),
        _ => typeof(object)
    };

    private object ToTypedDictionary(Dictionary<string, object?> dict, DictionaryMapping mapping)
    {
        var valueType = GetElementType(mapping.Value);
        var typedDict = (IDictionary)Activator.CreateInstance(
            typeof(Dictionary<,>).MakeGenericType(typeof(string), valueType))!;
        foreach (var (key, value) in dict)
            typedDict[key] = ToTypedInternal(value, mapping.Value, valueType);
        return typedDict;
    }

    private object ToTypedUnion(UnionValue union, UnionMapping mapping)
    {
        var variantType = mapping.Options.First(kvp => kvp.Key.Name == union.Type).Key;
        var variantMapping = mapping.Options[variantType];
        return ToTypedInternal(union.Val, variantMapping, variantType)!;
    }
}

// Type mappings for conversion between typed and untyped representations
internal abstract record TypeMapping;
internal sealed record PrimitiveMapping(Type TargetType) : TypeMapping;
internal sealed record EnumMapping(Type EnumType) : TypeMapping;
internal sealed record ObjectMapping(Type Type, List<(string Name, MemberInfo Member, TypeMapping Mapping)> Members) : TypeMapping;
internal sealed record ArrayMapping(TypeMapping Element) : TypeMapping;
internal sealed record DictionaryMapping(TypeMapping Value) : TypeMapping;
internal sealed record OptionalMapping(TypeMapping Inner) : TypeMapping;
internal sealed record UnionMapping(Dictionary<Type, TypeMapping> Options) : TypeMapping;

internal sealed class SchemaBuilder
{
    private readonly Dictionary<string, SchemaType> _schema = new();
    private readonly Dictionary<Type, TypeMapping> _mappings = new();
    private readonly HashSet<Type> _processing = new();

    public IReadOnlyDictionary<string, SchemaType> GetSchema() => _schema;

    public TypeMapping BuildMapping(Type type)
    {
        // Check for nullable value types
        var nullableUnderlying = Nullable.GetUnderlyingType(type);
        if (nullableUnderlying is not null)
        {
            var innerMapping = BuildMapping(nullableUnderlying);
            return new OptionalMapping(innerMapping);
        }

        // Primitives
        if (type == typeof(string))
            return new PrimitiveMapping(typeof(string));
        if (type == typeof(bool))
            return new PrimitiveMapping(typeof(bool));
        if (type == typeof(float) || type == typeof(double))
            return new PrimitiveMapping(type);
        if (type == typeof(int) || type == typeof(long) || type == typeof(short) || type == typeof(sbyte))
            return new PrimitiveMapping(type);
        if (type == typeof(uint) || type == typeof(ulong) || type == typeof(ushort) || type == typeof(byte))
            return new PrimitiveMapping(type);

        // Enums
        if (type.IsEnum)
        {
            if (!_schema.ContainsKey(type.Name))
                _schema[type.Name] = new EnumType(Enum.GetNames(type));
            return new EnumMapping(type);
        }

        // Arrays/Lists
        if (type.IsArray)
        {
            var elementType = type.GetElementType()!;
            return new ArrayMapping(BuildMapping(elementType));
        }
        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(List<>))
        {
            var elementType = type.GetGenericArguments()[0];
            return new ArrayMapping(BuildMapping(elementType));
        }

        // Dictionaries
        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Dictionary<,>))
        {
            var args = type.GetGenericArguments();
            if (args[0] != typeof(string))
                throw new ArgumentException($"Dictionary keys must be strings, got {args[0].Name}");
            return new DictionaryMapping(BuildMapping(args[1]));
        }

        // Check for union attribute on abstract/interface types
        if (type.IsAbstract || type.IsInterface)
        {
            var unionAttr = type.GetCustomAttribute<DeltaPackUnionAttribute>();
            if (unionAttr is not null)
                return BuildUnionMapping(type, unionAttr.Variants);

            throw new ArgumentException(
                $"Abstract type {type.Name} must have [DeltaPackUnion(typeof(Variant1), typeof(Variant2), ...)] attribute");
        }

        // Complex objects
        return BuildObjectMapping(type);
    }

    public TypeMapping BuildMappingForMember(MemberInfo member, Type memberType)
    {
        // Check for nullable reference types (property/field can be null)
        var isNullable = IsNullableReference(member);

        var baseMapping = BuildMapping(memberType);

        // Wrap in optional if nullable reference
        if (isNullable && baseMapping is not OptionalMapping)
            return new OptionalMapping(baseMapping);

        return baseMapping;
    }

    private static bool IsNullableReference(MemberInfo member)
    {
#if NET6_0_OR_GREATER
        var nullabilityContext = new NullabilityInfoContext();
        NullabilityInfo? nullability = member switch
        {
            PropertyInfo prop => nullabilityContext.Create(prop),
            FieldInfo field => nullabilityContext.Create(field),
            _ => null
        };
        return nullability?.WriteState == NullabilityState.Nullable;
#else
        // For netstandard2.1, check for nullable attributes manually
        var memberType = member switch
        {
            PropertyInfo prop => prop.PropertyType,
            FieldInfo field => field.FieldType,
            _ => null
        };

        if (memberType is null)
            return false;

        if (Nullable.GetUnderlyingType(memberType) is not null)
            return false;

        var nullableAttr = member.CustomAttributes
            .FirstOrDefault(a => a.AttributeType.FullName == "System.Runtime.CompilerServices.NullableAttribute");

        if (nullableAttr?.ConstructorArguments.Count > 0)
        {
            var arg = nullableAttr.ConstructorArguments[0];
            if (arg.Value is byte b)
                return b == 2;
            if (arg.Value is byte[] bytes && bytes.Length > 0)
                return bytes[0] == 2;
        }

        return false;
#endif
    }

    private TypeMapping BuildObjectMapping(Type type)
    {
        if (_mappings.TryGetValue(type, out var existing))
            return existing;

        if (_processing.Contains(type))
            throw new InvalidOperationException($"Circular reference detected for type {type.Name}");

        _processing.Add(type);

        var members = new List<(string, MemberInfo, TypeMapping)>();
        var properties = new Dictionary<string, SchemaType>();

        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!prop.CanRead || !prop.CanWrite)
                continue;

            var name = ToCamelCase(prop.Name);
            var mapping = BuildMappingForMember(prop, prop.PropertyType);
            members.Add((name, prop, mapping));
            properties[name] = MappingToSchemaType(mapping, prop);
        }

        foreach (var field in type.GetFields(BindingFlags.Public | BindingFlags.Instance))
        {
            var name = ToCamelCase(field.Name);
            var mapping = BuildMappingForMember(field, field.FieldType);
            members.Add((name, field, mapping));
            properties[name] = MappingToSchemaType(mapping, field);
        }

        var objectMapping = new ObjectMapping(type, members);
        _mappings[type] = objectMapping;
        _schema[type.Name] = new ObjectType(properties);

        _processing.Remove(type);
        return objectMapping;
    }

    private TypeMapping BuildUnionMapping(Type baseType, Type[] variants)
    {
        if (_mappings.TryGetValue(baseType, out var existing))
            return existing;

        var options = new Dictionary<Type, TypeMapping>();
        var schemaOptions = new List<ReferenceType>();

        foreach (var variantType in variants)
        {
            if (!baseType.IsAssignableFrom(variantType))
                throw new ArgumentException($"{variantType.Name} is not a subtype of {baseType.Name}");

            var variantMapping = BuildObjectMapping(variantType);
            options[variantType] = variantMapping;
            schemaOptions.Add(new ReferenceType(variantType.Name));
        }

        var unionMapping = new UnionMapping(options);
        _mappings[baseType] = unionMapping;
        _schema[baseType.Name] = new UnionType(schemaOptions);

        return unionMapping;
    }

    private SchemaType MappingToSchemaType(TypeMapping mapping, MemberInfo? member = null)
    {
        var precisionAttr = member?.GetCustomAttribute<DeltaPackPrecisionAttribute>();
        var unsignedAttr = member?.GetCustomAttribute<DeltaPackUnsignedAttribute>();

        return mapping switch
        {
            PrimitiveMapping { TargetType: var t } when t == typeof(string) => new StringType(),
            PrimitiveMapping { TargetType: var t } when t == typeof(bool) => new BooleanType(),
            PrimitiveMapping { TargetType: var t } when t == typeof(float) || t == typeof(double) =>
                new FloatType(precisionAttr?.Precision),
            PrimitiveMapping { TargetType: var t } when IsSignedInt(t) && unsignedAttr is null => new IntType(),
            PrimitiveMapping { TargetType: var t } when IsUnsignedInt(t) || unsignedAttr is not null => new UIntType(),
            EnumMapping em => new ReferenceType(em.EnumType.Name),
            ObjectMapping om => new ReferenceType(om.Type.Name),
            ArrayMapping am => new ArrayType(MappingToSchemaType(am.Element)),
            DictionaryMapping dm => new RecordType(new StringType(), MappingToSchemaType(dm.Value)),
            OptionalMapping optm => new OptionalType(MappingToSchemaType(optm.Inner)),
            UnionMapping um => new ReferenceType(um.Options.First().Key.BaseType?.Name
                ?? um.Options.First().Key.GetInterfaces().First().Name),
            _ => throw new InvalidOperationException($"Unknown mapping: {mapping}")
        };
    }

    private static bool IsSignedInt(Type t) =>
        t == typeof(int) || t == typeof(long) || t == typeof(short) || t == typeof(sbyte);

    private static bool IsUnsignedInt(Type t) =>
        t == typeof(uint) || t == typeof(ulong) || t == typeof(ushort) || t == typeof(byte);

    private static string ToCamelCase(string name) =>
        string.IsNullOrEmpty(name) ? name : char.ToLowerInvariant(name[0]) + name[1..];
}
