using System.Text;

namespace DeltaPack;

public class Encoder
{
    private const int DefaultBufferSize = 4096;
    private const int MaxCachedBufferSize = 65536;

    [ThreadStatic]
    private static byte[]? _sharedBuffer;

    private readonly List<string> _dict = new();
    private readonly List<bool> _bits = new();
    private byte[] _buffer;
    private int _pos;

    public Encoder()
    {
        _buffer = _sharedBuffer ??= new byte[DefaultBufferSize];
        _pos = 0;
    }

    private void EnsureCapacity(int additionalBytes)
    {
        if (_pos + additionalBytes <= _buffer.Length)
            return;

        var newSize = Math.Max(_buffer.Length * 2, _pos + additionalBytes);
        var newBuffer = new byte[newSize];
        Array.Copy(_buffer, newBuffer, _pos);
        _buffer = newBuffer;

        // Update shared buffer if reasonable size
        if (newSize <= MaxCachedBufferSize)
            _sharedBuffer = newBuffer;
    }

    // Primitive methods

    public void PushString(string val)
    {
        if (val.Length == 0)
        {
            PushInt(0);
            return;
        }

        var idx = _dict.IndexOf(val);
        if (idx >= 0)
        {
            PushInt(-idx - 1);
        }
        else
        {
            _dict.Add(val);
            var byteCount = Encoding.UTF8.GetByteCount(val);
            PushInt(byteCount);
            EnsureCapacity(byteCount);
            Encoding.UTF8.GetBytes(val, _buffer.AsSpan(_pos, byteCount));
            _pos += byteCount;
        }
    }

    public void PushInt(long val)
    {
        EnsureCapacity(10);
        Varint.WriteVarint(_buffer, ref _pos, val);
    }

    public void PushBoundedInt(long val, long min)
    {
        EnsureCapacity(10);
        Varint.WriteUVarint(_buffer, ref _pos, (ulong)(val - min));
    }

    public void PushUInt(ulong val)
    {
        EnsureCapacity(10);
        Varint.WriteUVarint(_buffer, ref _pos, val);
    }

    public void PushFloat(float val)
    {
        EnsureCapacity(4);
        BitConverter.TryWriteBytes(_buffer.AsSpan(_pos, 4), val);
        _pos += 4;
    }

    public void PushFloatQuantized(float val, float precision) =>
        PushInt((long)Math.Round(val / precision));

    public void PushBoolean(bool val) =>
        _bits.Add(val);

    public void PushEnum(int val, int numBits)
    {
        // Push bits from most significant to least significant
        for (var i = numBits - 1; i >= 0; i--)
            _bits.Add(((val >> i) & 1) == 1);
    }

    // Container methods

    public void PushOptional<T>(T? val, Action<T> innerWrite) where T : class
    {
        PushBoolean(val is not null);
        if (val is not null)
            innerWrite(val);
    }

    public void PushArray<T>(IList<T> val, Action<T> innerWrite)
    {
        PushUInt((uint)val.Count);
        foreach (var item in val)
            innerWrite(item);
    }

    public void PushRecord<TKey, TValue>(
        IDictionary<TKey, TValue> val,
        Action<TKey> innerKeyWrite,
        Action<TValue> innerValWrite)
        where TKey : notnull
    {
        PushUInt((uint)val.Count);
        foreach (var (key, value) in val)
        {
            innerKeyWrite(key);
            innerValWrite(value);
        }
    }

    // Diff methods

    public void PushStringDiff(string a, string b)
    {
        if (!_dict.Contains(a))
            _dict.Add(a);

        PushBoolean(a != b);
        if (a != b)
            PushString(b);
    }

    public void PushIntDiff(long a, long b)
    {
        PushBoolean(a != b);
        if (a != b)
            PushInt(b);
    }

    public void PushBoundedIntDiff(long a, long b, long min)
    {
        var aOffset = a - min;
        var bOffset = b - min;
        PushBoolean(aOffset != bOffset);
        if (aOffset != bOffset)
            PushUInt((ulong)bOffset);
    }

    public void PushFloatDiff(float a, float b)
    {
        var changed = !EqualityHelpers.EqualsFloat(a, b);
        PushBoolean(changed);
        if (changed)
            PushFloat(b);
    }

    public void PushFloatQuantizedDiff(float a, float b, float precision)
    {
        var aQuantized = (long)Math.Round(a / precision);
        var bQuantized = (long)Math.Round(b / precision);
        PushIntDiff(aQuantized, bQuantized);
    }

    public void PushBooleanDiff(bool a, bool b) =>
        PushBoolean(a != b);

    public void PushEnumDiff(int a, int b, int numBits)
    {
        PushBoolean(a != b);
        if (a != b)
            PushEnum(b, numBits);
    }

    public void PushOptionalDiffPrimitive<T>(T? a, T? b, Action<T> encode) where T : class
    {
        if (a is null)
        {
            PushBoolean(b is not null);
            if (b is not null)
                encode(b); // null → value
            // else null → null
        }
        else
        {
            var changed = b is null || !a.Equals(b);
            PushBoolean(changed);
            if (changed)
            {
                PushBoolean(b is not null);
                if (b is not null)
                    encode(b); // value → value
                // else value → null
            }
        }
    }

    public void PushOptionalDiff<T>(T? a, T? b, Action<T> encode, Action<T, T> encodeDiff) where T : class
    {
        if (a is null)
        {
            PushBoolean(b is not null);
            if (b is not null)
                encode(b); // null → value
            // else null → null
        }
        else
        {
            PushBoolean(b is not null);
            if (b is not null)
                encodeDiff(a, b); // value → value
            // else value → null
        }
    }

    public void PushArrayDiff<T>(
        IList<T> a,
        IList<T> b,
        Func<T, T, bool> equals,
        Action<T> encode,
        Action<T, T> encodeDiff)
    {
        var changed = !EqualityHelpers.EqualsArray(a, b, equals);
        PushBoolean(changed);
        if (!changed)
            return;

        PushUInt((uint)b.Count);
        var minLen = Math.Min(a.Count, b.Count);

        for (var i = 0; i < minLen; i++)
        {
            var elementChanged = !equals(a[i], b[i]);
            PushBoolean(elementChanged);
            if (elementChanged)
                encodeDiff(a[i], b[i]);
        }

        for (var i = a.Count; i < b.Count; i++)
            encode(b[i]);
    }

    public void PushRecordDiff<TKey, TValue>(
        IDictionary<TKey, TValue> a,
        IDictionary<TKey, TValue> b,
        Func<TValue, TValue, bool> valueEquals,
        Action<TKey> encodeKey,
        Action<TValue> encodeVal,
        Action<TValue, TValue> encodeDiff,
        IComparer<TKey>? comparer = null)
        where TKey : notnull
    {
        var changed = !EqualityHelpers.EqualsRecord(a, b, (x, y) => x.Equals(y), valueEquals);
        PushBoolean(changed);
        if (!changed)
            return;

        var orderedKeys = a.Keys.OrderBy(k => k, comparer).ToList();
        var updates = new List<int>();
        var deletions = new List<int>();
        var additions = new List<(TKey key, TValue val)>();

        // Check all keys
        for (var i = 0; i < orderedKeys.Count; i++)
        {
            var aKey = orderedKeys[i];
            if (b.TryGetValue(aKey, out var bVal))
            {
                if (!valueEquals(a[aKey], bVal))
                    updates.Add(i);
            }
            else
            {
                deletions.Add(i);
            }
        }

        foreach (var (bKey, bVal) in b)
        {
            if (!a.ContainsKey(bKey))
                additions.Add((bKey, bVal));
        }

        if (a.Count > 0)
        {
            PushUInt((uint)deletions.Count);
            foreach (var idx in deletions)
                PushUInt((uint)idx);

            PushUInt((uint)updates.Count);
            foreach (var idx in updates)
            {
                PushUInt((uint)idx);
                var key = orderedKeys[idx];
                encodeDiff(a[key], b[key]);
            }
        }

        PushUInt((uint)additions.Count);
        foreach (var (key, val) in additions)
        {
            encodeKey(key);
            encodeVal(val);
        }
    }

    // Output

    public byte[] ToBuffer()
    {
        // Estimate RLE size: bits + varint overhead
        var maxRleSize = (_bits.Count + 7) / 8 + 10;
        EnsureCapacity(maxRleSize);

        var finalPos = Rle.Encode(_bits, _buffer, _pos);

        return _buffer.AsSpan(0, finalPos).ToArray();
    }
}
