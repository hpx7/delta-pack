using System.Reflection;
using System.Text.Json;
using Avro.Specific;
using AvroNS = Avro;
using AvroSchema = Avro.Schema;
using AvroSchemaType = Avro.Schema.Type;

namespace DeltaPack.Benchmarks;

// Helpers for loading example JSON into Apache.Avro-generated ISpecificRecord
// instances. Example JSON uses a shape close to, but not exactly, Avro's JSON
// encoding — nullable fields can be absent or bare rather than tagged with
// {"<Fullname>": value}. This module walks the schema + JSON together and
// produces a correctly typed tree.
internal static class AvroHelpers
{
    private static readonly Assembly _assembly = typeof(AvroHelpers).Assembly;

    private static Type ResolveType(AvroNS.NamedSchema schema) =>
        _assembly.GetType(schema.Fullname)
        ?? throw new InvalidOperationException($"No .NET type for Avro schema {schema.Fullname}");

    private static Type ItemType(AvroSchema schema) => schema switch
    {
        AvroNS.PrimitiveSchema p => p.Tag switch
        {
            AvroSchemaType.String => typeof(string),
            AvroSchemaType.Int => typeof(int),
            AvroSchemaType.Long => typeof(long),
            AvroSchemaType.Float => typeof(float),
            AvroSchemaType.Double => typeof(double),
            AvroSchemaType.Boolean => typeof(bool),
            AvroSchemaType.Bytes => typeof(byte[]),
            _ => typeof(object),
        },
        AvroNS.EnumSchema es => ResolveType(es),
        AvroNS.RecordSchema rs => ResolveType(rs),
        AvroNS.ArraySchema arrS => typeof(IList<>).MakeGenericType(ItemType(arrS.ItemSchema)),
        AvroNS.MapSchema ms => typeof(IDictionary<,>).MakeGenericType(typeof(string), ItemType(ms.ValueSchema)),
        _ => typeof(object),
    };

    public static object? FromJson(JsonElement json, AvroSchema schema)
    {
        switch (schema)
        {
            case AvroNS.UnionSchema us:
                if (json.ValueKind == JsonValueKind.Null) return null;
                // Tagged form: {"BranchName": value} — common for unions of records.
                if (json.ValueKind == JsonValueKind.Object)
                {
                    var props = json.EnumerateObject().ToList();
                    if (props.Count == 1)
                    {
                        var tag = props[0].Name;
                        var branch = us.Schemas.OfType<AvroNS.NamedSchema>().FirstOrDefault(s => s.Name == tag);
                        if (branch is not null) return FromJson(props[0].Value, branch);
                    }
                }
                // Otherwise: single non-null branch → recurse into it.
                var nonNull = us.Schemas.FirstOrDefault(s => s.Tag != AvroSchemaType.Null);
                return nonNull is null ? null : FromJson(json, nonNull);

            case AvroNS.RecordSchema rs:
                var record = (ISpecificRecord)Activator.CreateInstance(ResolveType(rs))!;
                foreach (var field in rs.Fields)
                {
                    if (json.TryGetProperty(field.Name, out var fieldJson) &&
                        fieldJson.ValueKind != JsonValueKind.Undefined)
                    {
                        record.Put(field.Pos, FromJson(fieldJson, field.Schema));
                    }
                }
                return record;

            case AvroNS.EnumSchema es:
                return Enum.Parse(ResolveType(es), json.GetString()!);

            case AvroNS.ArraySchema arrS:
                var listType = typeof(List<>).MakeGenericType(ItemType(arrS.ItemSchema));
                var list = (System.Collections.IList)Activator.CreateInstance(listType)!;
                foreach (var item in json.EnumerateArray())
                    list.Add(FromJson(item, arrS.ItemSchema));
                return list;

            case AvroNS.MapSchema ms:
                var dictType = typeof(Dictionary<,>).MakeGenericType(typeof(string), ItemType(ms.ValueSchema));
                var dict = (System.Collections.IDictionary)Activator.CreateInstance(dictType)!;
                foreach (var prop in json.EnumerateObject())
                    dict[prop.Name] = FromJson(prop.Value, ms.ValueSchema);
                return dict;

            case AvroNS.PrimitiveSchema p:
                return p.Tag switch
                {
                    AvroSchemaType.String => json.GetString(),
                    AvroSchemaType.Int => json.GetInt32(),
                    AvroSchemaType.Long => json.GetInt64(),
                    AvroSchemaType.Float => (float)json.GetDouble(),
                    AvroSchemaType.Double => json.GetDouble(),
                    AvroSchemaType.Boolean => json.GetBoolean(),
                    AvroSchemaType.Null => null,
                    _ => throw new NotSupportedException($"Unsupported primitive: {p.Tag}"),
                };

            default:
                throw new NotSupportedException($"Unsupported schema: {schema.GetType().Name}");
        }
    }
}
