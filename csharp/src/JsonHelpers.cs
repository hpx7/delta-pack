using System.Text.Json;

namespace DeltaPack;

public static class JsonHelpers
{
    public static bool IsNullOrEmpty(JsonElement json) =>
        json.ValueKind == JsonValueKind.Null ||
        (json.ValueKind == JsonValueKind.String && json.GetString() == "");

    public static string ParseString(JsonElement json)
    {
        return json.ValueKind switch
        {
            JsonValueKind.String => json.GetString()!,
            JsonValueKind.Number => json.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => throw new ArgumentException($"Invalid string: {json}")
        };
    }

    public static bool ParseBoolean(JsonElement json)
    {
        return json.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Number => json.TryGetInt64(out var num)
                ? num switch { 1 => true, 0 => false, _ => throw new ArgumentException($"Invalid boolean: {json}") }
                : throw new ArgumentException($"Invalid boolean: {json}"),
            JsonValueKind.String => json.GetString()?.ToLowerInvariant() switch
            {
                "true" or "1" => true,
                "false" or "0" => false,
                _ => throw new ArgumentException($"Invalid boolean: {json}")
            },
            _ => throw new ArgumentException($"Invalid boolean: {json}")
        };
    }

    public static T ParseEnum<T>(JsonElement json) where T : struct, Enum
    {
        if (json.ValueKind == JsonValueKind.String)
        {
            var value = json.GetString()!;
            // Try string name first (case-insensitive)
            if (Enum.TryParse<T>(value, ignoreCase: true, out var result))
                return result;
            // Try numeric string as index
            if (int.TryParse(value, out var idx) && Enum.IsDefined(typeof(T), idx))
                return (T)(object)idx;
            throw new ArgumentException($"Invalid enum value: {value}");
        }
        if (json.ValueKind == JsonValueKind.Number && json.TryGetInt32(out var index))
        {
            if (Enum.IsDefined(typeof(T), index))
                return (T)(object)index;
            throw new ArgumentException($"Invalid enum index: {index}");
        }
        throw new ArgumentException($"Invalid enum: {json}");
    }

    public static string ParseEnum(JsonElement json, IReadOnlyList<string> options)
    {
        if (json.ValueKind == JsonValueKind.String)
        {
            var value = json.GetString()!;
            // Exact match first
            if (options.Contains(value)) return value;
            // Case-insensitive fallback
            var match = options.FirstOrDefault(opt =>
                string.Equals(opt, value, StringComparison.OrdinalIgnoreCase));
            if (match != null) return match;
            // Numeric string index
            if (int.TryParse(value, out var idx) && idx >= 0 && idx < options.Count)
                return options[idx];
            throw new ArgumentException($"Invalid enum value: {value}");
        }
        if (json.ValueKind == JsonValueKind.Number && json.TryGetInt32(out var index))
        {
            if (index >= 0 && index < options.Count)
                return options[index];
            throw new ArgumentException($"Invalid enum index: {index}");
        }
        throw new ArgumentException($"Invalid enum: {json}");
    }

    public static string? FindVariant(string name, params string[] variants)
    {
        // Exact match first
        foreach (var v in variants)
        {
            if (v == name) return v;
        }
        // Case-insensitive fallback
        foreach (var v in variants)
        {
            if (string.Equals(v, name, StringComparison.OrdinalIgnoreCase)) return v;
        }
        return null;
    }

    public static float ParseFloatQuantized(JsonElement json, float precision) =>
        (float)(Math.Round(json.GetSingle() / precision) * precision);
}
