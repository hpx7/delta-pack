using System.Text.RegularExpressions;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace DeltaPack;

public static class Parser
{
    public static IReadOnlyDictionary<string, SchemaType> ParseSchemaYml(string yamlContent)
    {
        var deserializer = new DeserializerBuilder()
            .WithNamingConvention(CamelCaseNamingConvention.Instance)
            .Build();

        var schema = deserializer.Deserialize<Dictionary<string, object>>(yamlContent);

        SchemaType ParseType(object value) => value switch
        {
            List<object> list => ParseListType(list, schema),
            Dictionary<object, object> dict => ParseObjectType(dict),
            string str => ParseStringType(str, schema),
            _ => throw new ArgumentException($"Unsupported type format: {value}")
        };

        SchemaType ParseObjectType(Dictionary<object, object> dict)
        {
            var properties = dict.ToDictionary(
                kvp => (string)kvp.Key,
                kvp => ParseType(kvp.Value)
            );
            return new ObjectType(properties);
        }

        return schema.ToDictionary(kvp => kvp.Key, kvp => ParseType(kvp.Value));
    }

    private static SchemaType ParseListType(List<object> list, Dictionary<string, object> schema)
    {
        var values = list.Cast<string>().ToArray();
        // It's a union type if all values are references to other types in the schema
        if (values.All(schema.ContainsKey))
        {
            return new UnionType(values.Select(v => new ReferenceType(v)).ToArray());
        }
        // Otherwise, it's an enum type
        return new EnumType(values);
    }

    private static SchemaType ParseStringType(string str, Dictionary<string, object> schema)
    {
        if (str.EndsWith("[]"))
            return new ArrayType(ParseStringType(str[..^2], schema));

        if (str.EndsWith('?'))
            return new OptionalType(ParseStringType(str[..^1], schema));

        if (str.StartsWith('<') && str.EndsWith('>'))
            return ParseRecordType(str[1..^1]);

        if (str.StartsWith("string"))
            return new StringType();

        if (str.StartsWith("uint"))
            return new UIntType();

        if (str.StartsWith("int"))
            return new IntType();

        if (str.StartsWith("float"))
        {
            var parameters = ParseParams(str, "float");
            var precision = parameters.TryGetValue("precision", out var precisionStr)
                ? double.Parse(precisionStr)
                : (double?)null;
            return new FloatType(precision);
        }

        if (str.StartsWith("boolean"))
            return new BooleanType();

        if (schema.ContainsKey(str))
            return new ReferenceType(str);

        throw new ArgumentException($"Unsupported type format: {str}");

        RecordType ParseRecordType(string inner)
        {
            var commaIdx = inner.IndexOf(',');
            if (commaIdx == -1)
                throw new ArgumentException($"Invalid record type format: <{inner}>");

            var keyTypeStr = inner[..commaIdx].Trim();
            var valueTypeStr = inner[(commaIdx + 1)..].Trim();
            return new RecordType(
                ParseStringType(keyTypeStr, schema),
                ParseStringType(valueTypeStr, schema)
            );
        }
    }

    private static Dictionary<string, string> ParseParams(string value, string typeName)
    {
        if (value == typeName)
            return new Dictionary<string, string>();

        // Expect format: typeName(key=value, key2=value2, ...)
        var regex = typeName switch
        {
            "float" => FloatParamRegex,
            _ => throw new ArgumentException($"Unknown parameterized type: {typeName}")
        };
        var match = regex.Match(value);
        if (!match.Success)
            throw new ArgumentException($"Invalid {typeName} format: {value}");

        var parameters = new Dictionary<string, string>();
        foreach (var part in match.Groups[1].Value.Split(','))
        {
            var eqIdx = part.IndexOf('=');
            if (eqIdx == -1)
                throw new ArgumentException($"Invalid parameter format in {value}");

            var key = part[..eqIdx].Trim();
            var val = part[(eqIdx + 1)..].Trim();

            if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(val))
                throw new ArgumentException($"Invalid parameter format in {value}");

            parameters[key] = val;
        }

        return parameters;
    }

    private static readonly Regex FloatParamRegex = new(@"^float\((.+)\)$", RegexOptions.Compiled);
}
