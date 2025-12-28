using System.Text.Json;

namespace DeltaPack;

public interface IDeltaPackApi<T>
{
    T FromJson(JsonElement json);
    JsonElement ToJson(T obj);
    byte[] Encode(T obj);
    T Decode(byte[] buf);
    byte[] EncodeDiff(T a, T b);
    T DecodeDiff(T a, byte[] diff);
    bool Equals(T a, T b);
    T Clone(T obj);
}

public sealed record UnionValue(string Type, object? Val);

public static class Interpreter
{
    public static IDeltaPackApi<T> Load<T>(IReadOnlyDictionary<string, SchemaType> schema, string typeName)
    {
        if (!schema.TryGetValue(typeName, out var rootType))
            throw new ArgumentException($"Type {typeName} not found in schema");

        if (rootType is not (ObjectType or UnionType or EnumType))
            throw new ArgumentException($"Type {typeName} must be an object, union, or enum type, got {rootType.GetType().Name}");

        return new DeltaPackApi<T>(schema, rootType);
    }

    private sealed class DeltaPackApi<T> : IDeltaPackApi<T>
    {
        private readonly IReadOnlyDictionary<string, SchemaType> _schema;
        private readonly SchemaType _rootType;

        public DeltaPackApi(IReadOnlyDictionary<string, SchemaType> schema, SchemaType rootType)
        {
            _schema = schema;
            _rootType = rootType;
        }

        private SchemaType ResolveRef(string name) =>
            _schema.TryGetValue(name, out var type)
                ? type
                : throw new InvalidOperationException($"Unknown reference type: {name}");

        private static Dictionary<string, int> EnumIndices(IReadOnlyList<string> options) =>
            options.Select((opt, i) => (opt, i)).ToDictionary(x => x.opt, x => x.i);

        private static object? GetProp(object? obj, string key) =>
            obj is Dictionary<string, object?> dict && dict.TryGetValue(key, out var val) ? val : null;

        // === Encode ===

        private void Encode(object? obj, SchemaType type, Encoder encoder)
        {
            switch (type)
            {
                case StringType:
                    encoder.PushString((string)obj!);
                    break;

                case IntType it:
                    var intVal = Convert.ToInt64(obj);
                    if (it.Min.HasValue)
                        encoder.PushBoundedInt(intVal, it.Min.Value);
                    else
                        encoder.PushInt(intVal);
                    break;

                case FloatType ft:
                    var floatVal = Convert.ToSingle(obj);
                    if (ft.Precision.HasValue)
                        encoder.PushFloatQuantized(floatVal, (float)ft.Precision.Value);
                    else
                        encoder.PushFloat(floatVal);
                    break;

                case BooleanType:
                    encoder.PushBoolean((bool)obj!);
                    break;

                case EnumType et:
                    encoder.PushEnum(EnumIndices(et.Options)[(string)obj!], et.NumBits);
                    break;

                case ReferenceType rt:
                    Encode(obj, ResolveRef(rt.Reference), encoder);
                    break;

                case ObjectType ot:
                    foreach (var (key, propType) in ot.Properties)
                        Encode(GetProp(obj, key), propType, encoder);
                    break;

                case ArrayType at:
                    var list = (IList<object?>)obj!;
                    encoder.PushArray(list, item => Encode(item, at.Value, encoder));
                    break;

                case RecordType rt:
                    var dict = (IDictionary<object, object?>)obj!;
                    encoder.PushRecord(
                        dict,
                        key => Encode(key, rt.Key, encoder),
                        val => Encode(val, rt.Value, encoder));
                    break;

                case UnionType ut:
                    var union = (UnionValue)obj!;
                    var variantIndex = ut.Options.Select((o, i) => (o, i))
                        .First(x => x.o.Reference == union.Type).i;
                    encoder.PushEnum(variantIndex, ut.NumBits);
                    Encode(union.Val, ResolveRef(union.Type), encoder);
                    break;

                case OptionalType opt:
                    encoder.PushOptional(obj, o => Encode(o, opt.Value, encoder));
                    break;

                default:
                    throw new InvalidOperationException($"Unknown type: {type}");
            }
        }

        // === Decode ===

        private object? Decode(SchemaType type, Decoder decoder)
        {
            return type switch
            {
                StringType => decoder.NextString(),
                IntType it => it.Min.HasValue ? decoder.NextBoundedInt(it.Min.Value) : decoder.NextInt(),
                FloatType ft => ft.Precision.HasValue
                    ? decoder.NextFloatQuantized((float)ft.Precision.Value)
                    : decoder.NextFloat(),
                BooleanType => decoder.NextBoolean(),
                EnumType et => et.Options[decoder.NextEnum(et.NumBits)],
                ReferenceType rt => Decode(ResolveRef(rt.Reference), decoder),
                ObjectType ot => DecodeObject(ot, decoder),
                ArrayType at => DecodeArray(at, decoder),
                RecordType rt => DecodeRecord(rt, decoder),
                UnionType ut => DecodeUnion(ut, decoder),
                OptionalType opt => decoder.NextOptional<object>(() => Decode(opt.Value, decoder)!),
                _ => throw new InvalidOperationException($"Unknown type: {type}")
            };
        }

        private Dictionary<string, object?> DecodeObject(ObjectType ot, Decoder decoder)
        {
            var result = new Dictionary<string, object?>();
            foreach (var (key, propType) in ot.Properties)
                result[key] = Decode(propType, decoder);
            return result;
        }

        private List<object?> DecodeArray(ArrayType at, Decoder decoder) =>
            decoder.NextArray(() => Decode(at.Value, decoder));

        private Dictionary<object, object?> DecodeRecord(RecordType rt, Decoder decoder) =>
            decoder.NextRecord(() => Decode(rt.Key, decoder)!, () => Decode(rt.Value, decoder));

        private UnionValue DecodeUnion(UnionType ut, Decoder decoder)
        {
            var variantIndex = decoder.NextEnum(ut.NumBits);
            var variant = ut.Options[variantIndex];
            return new UnionValue(
                variant.Reference,
                Decode(ResolveRef(variant.Reference), decoder));
        }

        // === Equals ===

        private bool Equals(object? a, object? b, SchemaType type)
        {
            return type switch
            {
                StringType => (string?)a == (string?)b,
                IntType => Convert.ToInt64(a) == Convert.ToInt64(b),
                FloatType ft => ft.Precision.HasValue
                    ? EqualityHelpers.EqualsFloatQuantized(Convert.ToSingle(a), Convert.ToSingle(b), (float)ft.Precision.Value)
                    : EqualityHelpers.EqualsFloat(Convert.ToSingle(a), Convert.ToSingle(b)),
                BooleanType => (bool?)a == (bool?)b,
                EnumType => (string?)a == (string?)b,
                ReferenceType rt => Equals(a, b, ResolveRef(rt.Reference)),
                ObjectType ot => EqualsObject(a, b, ot),
                ArrayType at => EqualsArray(a, b, at),
                RecordType rt => EqualsRecord(a, b, rt),
                UnionType => EqualsUnion(a, b),
                OptionalType opt => EqualsOptional(a, b, opt),
                _ => throw new InvalidOperationException($"Unknown type: {type}")
            };
        }

        private bool EqualsObject(object? a, object? b, ObjectType ot)
        {
            foreach (var (key, propType) in ot.Properties)
            {
                if (!Equals(GetProp(a, key), GetProp(b, key), propType))
                    return false;
            }
            return true;
        }

        private bool EqualsArray(object? a, object? b, ArrayType at)
        {
            if (a is null || b is null)
                return a is null && b is null;
            return EqualityHelpers.EqualsArray(
                (IList<object?>)a,
                (IList<object?>)b,
                (x, y) => Equals(x, y, at.Value));
        }

        private bool EqualsRecord(object? a, object? b, RecordType rt)
        {
            if (a is null || b is null)
                return a is null && b is null;
            return EqualityHelpers.EqualsRecord(
                (IDictionary<object, object?>)a,
                (IDictionary<object, object?>)b,
                (x, y) => x.Equals(y),
                (x, y) => Equals(x, y, rt.Value));
        }

        private bool EqualsUnion(object? a, object? b)
        {
            var unionA = (UnionValue?)a;
            var unionB = (UnionValue?)b;
            if (unionA is null || unionB is null)
                return unionA is null && unionB is null;
            if (unionA.Type != unionB.Type)
                return false;
            return Equals(unionA.Val, unionB.Val, ResolveRef(unionA.Type));
        }

        private bool EqualsOptional(object? a, object? b, OptionalType opt) =>
            EqualityHelpers.EqualsOptional(a, b, (x, y) => Equals(x, y, opt.Value));

        // === Clone ===

        private object? Clone(object? obj, SchemaType type)
        {
            return type switch
            {
                StringType or IntType or FloatType or BooleanType or EnumType => obj,
                ReferenceType rt => Clone(obj, ResolveRef(rt.Reference)),
                ObjectType ot => CloneObject(obj, ot),
                ArrayType at => CloneArray(obj, at),
                RecordType rt => CloneRecord(obj, rt),
                UnionType => CloneUnion(obj),
                OptionalType opt => obj is null ? null : Clone(obj, opt.Value),
                _ => throw new InvalidOperationException($"Unknown type: {type}")
            };
        }

        private Dictionary<string, object?> CloneObject(object? obj, ObjectType ot)
        {
            var result = new Dictionary<string, object?>();
            foreach (var (key, propType) in ot.Properties)
                result[key] = Clone(GetProp(obj, key), propType);
            return result;
        }

        private List<object?> CloneArray(object? obj, ArrayType at)
        {
            var arr = (IList<object?>)obj!;
            return arr.Select(item => Clone(item, at.Value)).ToList();
        }

        private Dictionary<object, object?> CloneRecord(object? obj, RecordType rt)
        {
            var dict = (IDictionary<object, object?>)obj!;
            return dict.ToDictionary(kvp => kvp.Key, kvp => Clone(kvp.Value, rt.Value));
        }

        private UnionValue CloneUnion(object? obj)
        {
            var union = (UnionValue)obj!;
            return new UnionValue(union.Type, Clone(union.Val, ResolveRef(union.Type)));
        }

        // === EncodeDiff ===

        private void EncodeDiff(object? a, object? b, SchemaType type, Encoder encoder)
        {
            switch (type)
            {
                case StringType:
                    encoder.PushStringDiff((string)a!, (string)b!);
                    break;

                case IntType it:
                    var intA = Convert.ToInt64(a);
                    var intB = Convert.ToInt64(b);
                    if (it.Min.HasValue)
                        encoder.PushBoundedIntDiff(intA, intB, it.Min.Value);
                    else
                        encoder.PushIntDiff(intA, intB);
                    break;

                case FloatType ft:
                    var floatA = Convert.ToSingle(a);
                    var floatB = Convert.ToSingle(b);
                    if (ft.Precision.HasValue)
                        encoder.PushFloatQuantizedDiff(floatA, floatB, (float)ft.Precision.Value);
                    else
                        encoder.PushFloatDiff(floatA, floatB);
                    break;

                case BooleanType:
                    encoder.PushBooleanDiff((bool)a!, (bool)b!);
                    break;

                case EnumType et:
                    var indices = EnumIndices(et.Options);
                    encoder.PushEnumDiff(indices[(string)a!], indices[(string)b!], et.NumBits);
                    break;

                case ReferenceType rt:
                    EncodeDiff(a, b, ResolveRef(rt.Reference), encoder);
                    break;

                case ObjectType ot:
                    EncodeDiffObject(a, b, ot, encoder);
                    break;

                case ArrayType at:
                    EncodeDiffArray(a, b, at, encoder);
                    break;

                case RecordType rt:
                    EncodeDiffRecord(a, b, rt, encoder);
                    break;

                case UnionType ut:
                    EncodeDiffUnion(a, b, ut, encoder);
                    break;

                case OptionalType opt:
                    EncodeDiffOptional(a, b, opt, encoder);
                    break;

                default:
                    throw new InvalidOperationException($"Unknown type: {type}");
            }
        }

        private void EncodeDiffObject(object? a, object? b, ObjectType ot, Encoder encoder)
        {
            var changed = !Equals(a, b, ot);
            encoder.PushBoolean(changed);
            if (!changed)
                return;

            foreach (var (key, propType) in ot.Properties)
                EncodeDiff(GetProp(a, key), GetProp(b, key), propType, encoder);
        }

        private void EncodeDiffArray(object? a, object? b, ArrayType at, Encoder encoder)
        {
            var arrA = (IList<object?>)a!;
            var arrB = (IList<object?>)b!;

            encoder.PushArrayDiff(
                arrA, arrB,
                (x, y) => Equals(x, y, at.Value),
                x => Encode(x, at.Value, encoder),
                (x, y) => EncodeDiff(x, y, at.Value, encoder));
        }

        private void EncodeDiffRecord(object? a, object? b, RecordType rt, Encoder encoder) =>
            encoder.PushRecordDiff(
                (IDictionary<object, object?>)a!,
                (IDictionary<object, object?>)b!,
                (x, y) => Equals(x, y, rt.Value),
                key => Encode(key, rt.Key, encoder),
                val => Encode(val, rt.Value, encoder),
                (x, y) => EncodeDiff(x, y, rt.Value, encoder),
                GetKeyComparer(rt.Key));

        private static IComparer<object> GetKeyComparer(SchemaType keyType)
        {
            return keyType switch
            {
                StringType => Comparer<object>.Create((a, b) => string.Compare((string)a, (string)b, StringComparison.Ordinal)),
                IntType => Comparer<object>.Create((a, b) => Convert.ToInt64(a).CompareTo(Convert.ToInt64(b))),
                _ => throw new InvalidOperationException($"Unsupported record key type: {keyType}")
            };
        }

        private void EncodeDiffUnion(object? a, object? b, UnionType ut, Encoder encoder)
        {
            var unionA = (UnionValue)a!;
            var unionB = (UnionValue)b!;

            if (unionA.Type != unionB.Type)
            {
                // Type changed - encode new discriminator and value
                encoder.PushBoolean(false);
                var variantIndex = ut.Options.Select((o, i) => (o, i))
                    .First(x => x.o.Reference == unionB.Type).i;
                encoder.PushEnum(variantIndex, ut.NumBits);
                Encode(unionB.Val, ResolveRef(unionB.Type), encoder);
            }
            else
            {
                // Same type - encode diff
                encoder.PushBoolean(true);
                EncodeDiff(unionA.Val, unionB.Val, ResolveRef(unionA.Type), encoder);
            }
        }

        private void EncodeDiffOptional(object? a, object? b, OptionalType opt, Encoder encoder)
        {
            var valueType = opt.Value;
            if (Schema.IsPrimitiveType(valueType, _schema))
                encoder.PushOptionalDiffPrimitive<object>(a, b, x => Encode(x, valueType, encoder));
            else
                encoder.PushOptionalDiff<object>(a, b, x => Encode(x, valueType, encoder), (x, y) => EncodeDiff(x, y, valueType, encoder));
        }

        // === DecodeDiff ===

        private object? DecodeDiff(object? a, SchemaType type, Decoder decoder)
        {
            return type switch
            {
                StringType => decoder.NextStringDiff((string)a!),
                IntType it => it.Min.HasValue
                    ? decoder.NextBoundedIntDiff(Convert.ToInt64(a), it.Min.Value)
                    : decoder.NextIntDiff(Convert.ToInt64(a)),
                FloatType ft => ft.Precision.HasValue
                    ? decoder.NextFloatQuantizedDiff(Convert.ToSingle(a), (float)ft.Precision.Value)
                    : decoder.NextFloatDiff(Convert.ToSingle(a)),
                BooleanType => decoder.NextBooleanDiff((bool)a!),
                EnumType et => DecodeDiffEnum(a, et, decoder),
                ReferenceType rt => DecodeDiff(a, ResolveRef(rt.Reference), decoder),
                ObjectType ot => DecodeDiffObject(a, ot, decoder),
                ArrayType at => DecodeDiffArray(a, at, decoder),
                RecordType rt => DecodeDiffRecord(a, rt, decoder),
                UnionType ut => DecodeDiffUnion(a, ut, decoder),
                OptionalType opt => DecodeDiffOptional(a, opt, decoder),
                _ => throw new InvalidOperationException($"Unknown type: {type}")
            };
        }

        private string DecodeDiffEnum(object? a, EnumType et, Decoder decoder)
        {
            var indices = EnumIndices(et.Options);
            var newIdx = decoder.NextEnumDiff(indices[(string)a!], et.NumBits);
            return et.Options[newIdx];
        }

        private Dictionary<string, object?> DecodeDiffObject(object? a, ObjectType ot, Decoder decoder)
        {
            var changed = decoder.NextBoolean();
            if (!changed)
            {
                // Return a clone of a
                return CloneObject(a, ot);
            }

            var result = new Dictionary<string, object?>();
            foreach (var (key, propType) in ot.Properties)
                result[key] = DecodeDiff(GetProp(a, key), propType, decoder);
            return result;
        }

        private List<object?> DecodeDiffArray(object? a, ArrayType at, Decoder decoder) =>
            decoder.NextArrayDiff(
                (IList<object?>)a!,
                () => Decode(at.Value, decoder),
                item => DecodeDiff(item, at.Value, decoder));

        private Dictionary<object, object?> DecodeDiffRecord(object? a, RecordType rt, Decoder decoder) =>
            decoder.NextRecordDiff(
                (IDictionary<object, object?>)a!,
                () => Decode(rt.Key, decoder)!,
                () => Decode(rt.Value, decoder),
                val => DecodeDiff(val, rt.Value, decoder),
                GetKeyComparer(rt.Key));

        private UnionValue DecodeDiffUnion(object? a, UnionType ut, Decoder decoder)
        {
            var unionA = (UnionValue)a!;
            var sameType = decoder.NextBoolean();

            if (!sameType)
            {
                // Type changed - decode new discriminator and value
                var variantIndex = decoder.NextEnum(ut.NumBits);
                var variant = ut.Options[variantIndex];
                return new UnionValue(
                    variant.Reference,
                    Decode(ResolveRef(variant.Reference), decoder));
            }
            else
            {
                // Same type - decode diff
                return new UnionValue(
                    unionA.Type,
                    DecodeDiff(unionA.Val, ResolveRef(unionA.Type), decoder));
            }
        }

        private object? DecodeDiffOptional(object? a, OptionalType opt, Decoder decoder)
        {
            var valueType = opt.Value;
            if (Schema.IsPrimitiveType(valueType, _schema))
                return decoder.NextOptionalDiffPrimitive<object>(a!, () => Decode(valueType, decoder)!);
            return decoder.NextOptionalDiff<object>(a!, () => Decode(valueType, decoder)!, x => DecodeDiff(x, valueType, decoder)!);
        }

        // === FromJson ===

        private object? FromJson(JsonElement json, SchemaType type)
        {
            return type switch
            {
                StringType => json.GetString(),
                IntType it => ValidateInt(json.GetInt64(), it),
                FloatType => json.GetSingle(),
                BooleanType => json.GetBoolean(),
                EnumType et => ValidateEnum(json.GetString()!, et),
                ReferenceType rt => FromJson(json, ResolveRef(rt.Reference)),
                ObjectType ot => FromJsonObject(json, ot),
                ArrayType at => FromJsonArray(json, at),
                RecordType rt => FromJsonRecord(json, rt),
                UnionType ut => FromJsonUnion(json, ut),
                OptionalType opt => json.ValueKind == JsonValueKind.Null ? null : FromJson(json, opt.Value),
                _ => throw new InvalidOperationException($"Unknown type: {type}")
            };
        }

        private static long ValidateInt(long value, IntType it)
        {
            if (it.Min.HasValue && value < it.Min.Value)
                throw new ArgumentException($"Value {value} below minimum {it.Min.Value}");
            if (it.Max.HasValue && value > it.Max.Value)
                throw new ArgumentException($"Value {value} above maximum {it.Max.Value}");
            return value;
        }

        private static string ValidateEnum(string value, EnumType et)
        {
            if (!et.Options.Contains(value))
                throw new ArgumentException($"Invalid enum value: {value}");
            return value;
        }

        private Dictionary<string, object?> FromJsonObject(JsonElement json, ObjectType ot)
        {
            var result = new Dictionary<string, object?>();
            foreach (var (key, propType) in ot.Properties)
            {
                if (json.TryGetProperty(key, out var prop))
                    result[key] = FromJson(prop, propType);
                else if (propType is OptionalType)
                    result[key] = null;
                else
                    throw new ArgumentException($"Missing required property: {key}");
            }
            return result;
        }

        private List<object?> FromJsonArray(JsonElement json, ArrayType at)
        {
            var result = new List<object?>();
            foreach (var item in json.EnumerateArray())
                result.Add(FromJson(item, at.Value));
            return result;
        }

        private Dictionary<object, object?> FromJsonRecord(JsonElement json, RecordType rt)
        {
            var result = new Dictionary<object, object?>();
            foreach (var prop in json.EnumerateObject())
            {
                var key = ParseRecordKey(prop.Name, rt.Key);
                result[key] = FromJson(prop.Value, rt.Value);
            }
            return result;
        }

        private static object ParseRecordKey(string jsonKey, SchemaType keyType)
        {
            return keyType switch
            {
                StringType => jsonKey,
                IntType => long.Parse(jsonKey),
                _ => throw new InvalidOperationException($"Unsupported record key type: {keyType}")
            };
        }

        private UnionValue FromJsonUnion(JsonElement json, UnionType ut)
        {
            // Check delta-pack format: { "type": "TypeName", "val": ... }
            if (json.TryGetProperty("type", out var typeProp) &&
                json.TryGetProperty("val", out var valProp))
            {
                var typeName = typeProp.GetString()!;
                var option = ut.Options.FirstOrDefault(o => o.Reference == typeName)
                    ?? throw new ArgumentException($"Unknown union type: {typeName}");
                return new UnionValue(typeName, FromJson(valProp, ResolveRef(option.Reference)));
            }

            // Check protobuf format: { "TypeName": ... }
            if (json.ValueKind == JsonValueKind.Object)
            {
                var props = json.EnumerateObject().ToList();
                if (props.Count == 1)
                {
                    var prop = props[0];
                    var option = ut.Options.FirstOrDefault(o => o.Reference == prop.Name)
                        ?? throw new ArgumentException($"Unknown union type: {prop.Name}");
                    return new UnionValue(prop.Name, FromJson(prop.Value, ResolveRef(option.Reference)));
                }
            }

            throw new ArgumentException($"Invalid union format");
        }

        // === ToJson ===

        private JsonElement ToJson(object? obj, SchemaType type)
        {
            using var stream = new MemoryStream();
            using var writer = new Utf8JsonWriter(stream);
            WriteJson(obj, type, writer);
            writer.Flush();
            stream.Position = 0;
            return JsonDocument.Parse(stream).RootElement.Clone();
        }

        private void WriteJson(object? obj, SchemaType type, Utf8JsonWriter writer)
        {
            switch (type)
            {
                case StringType:
                    writer.WriteStringValue((string?)obj);
                    break;

                case IntType:
                    writer.WriteNumberValue(Convert.ToInt64(obj));
                    break;

                case FloatType:
                    writer.WriteNumberValue(Convert.ToSingle(obj));
                    break;

                case BooleanType:
                    writer.WriteBooleanValue((bool)obj!);
                    break;

                case EnumType:
                    writer.WriteStringValue((string?)obj);
                    break;

                case ReferenceType rt:
                    WriteJson(obj, ResolveRef(rt.Reference), writer);
                    break;

                case ObjectType ot:
                    writer.WriteStartObject();
                    foreach (var (key, propType) in ot.Properties)
                    {
                        var val = GetProp(obj, key);
                        if (propType is OptionalType && val is null)
                            continue;
                        writer.WritePropertyName(key);
                        WriteJson(val, propType, writer);
                    }
                    writer.WriteEndObject();
                    break;

                case ArrayType at:
                    writer.WriteStartArray();
                    foreach (var item in (IList<object?>)obj!)
                        WriteJson(item, at.Value, writer);
                    writer.WriteEndArray();
                    break;

                case RecordType rt:
                    writer.WriteStartObject();
                    foreach (var (key, val) in (IDictionary<object, object?>)obj!)
                    {
                        writer.WritePropertyName(key.ToString()!);
                        WriteJson(val, rt.Value, writer);
                    }
                    writer.WriteEndObject();
                    break;

                case UnionType:
                    var union = (UnionValue)obj!;
                    writer.WriteStartObject();
                    writer.WritePropertyName(union.Type);
                    WriteJson(union.Val, ResolveRef(union.Type), writer);
                    writer.WriteEndObject();
                    break;

                case OptionalType opt:
                    if (obj is null)
                        writer.WriteNullValue();
                    else
                        WriteJson(obj, opt.Value, writer);
                    break;

                default:
                    throw new InvalidOperationException($"Unknown type: {type}");
            }
        }

        // === Public API ===

        public T FromJson(JsonElement json) => (T)FromJson(json, _rootType)!;

        public JsonElement ToJson(T obj) => ToJson(obj, _rootType);

        public byte[] Encode(T obj)
        {
            var encoder = new Encoder();
            Encode(obj, _rootType, encoder);
            return encoder.ToBuffer();
        }

        public T Decode(byte[] buf)
        {
            var decoder = new Decoder(buf);
            return (T)Decode(_rootType, decoder)!;
        }

        public byte[] EncodeDiff(T a, T b)
        {
            var encoder = new Encoder();
            EncodeDiff(a, b, _rootType, encoder);
            return encoder.ToBuffer();
        }

        public T DecodeDiff(T a, byte[] diff)
        {
            var decoder = new Decoder(diff);
            return (T)DecodeDiff(a, _rootType, decoder)!;
        }

        public bool Equals(T a, T b) => Equals(a, b, _rootType);

        public T Clone(T obj) => (T)Clone(obj, _rootType)!;
    }
}
