namespace DeltaPack;

public static class EqualityHelpers
{
    private const float FloatEpsilon = 0.001f;

    public static bool EqualsFloat(float a, float b) =>
        Math.Abs(a - b) < FloatEpsilon;

    public static bool EqualsFloatQuantized(float a, float b, float precision) =>
        (int)Math.Round(a / precision) == (int)Math.Round(b / precision);

    public static bool EqualsOptional<T>(T? a, T? b, Func<T, T, bool> equals)
        where T : class
    {
        if (a is null && b is null)
            return true;
        if (a is not null && b is not null)
            return equals(a, b);
        return false;
    }

    public static bool EqualsArray<T>(IList<T> a, IList<T> b, Func<T, T, bool> equals)
    {
        if (a.Count != b.Count)
            return false;

        for (var i = 0; i < a.Count; i++)
        {
            if (!equals(a[i], b[i]))
                return false;
        }
        return true;
    }

    public static bool EqualsRecord<TKey, TValue>(
        IDictionary<TKey, TValue> a,
        IDictionary<TKey, TValue> b,
        Func<TKey, TKey, bool> keyEquals,
        Func<TValue, TValue, bool> valueEquals)
        where TKey : notnull
    {
        _ = keyEquals; // Keys compared via dictionary lookup

        if (a.Count != b.Count)
            return false;

        foreach (var (key, aVal) in a)
        {
            if (!b.TryGetValue(key, out var bVal))
                return false;
            if (!valueEquals(aVal, bVal))
                return false;
        }
        return true;
    }
}
