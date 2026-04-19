using System.Text;

namespace DeltaPack;

public class Encoder
{
    private const int DefaultBufferSize = 4096;
    private const int MaxCachedBufferSize = 65536;

    [ThreadStatic]
    private static byte[]? _sharedBuffer;

    [ThreadStatic]
    private static RleWriter? _sharedRle;

    [ThreadStatic]
    private static StringInterner? _sharedInterner;

    private byte[] _buffer;
    private int _pos;
    private readonly RleWriter _rle;
    private readonly StringInterner _interner;

    public Encoder()
    {
        _buffer = _sharedBuffer ??= new byte[DefaultBufferSize];
        _pos = 0;
        _rle = _sharedRle ??= new RleWriter();
        _rle.Reset();
        _interner = _sharedInterner ??= new StringInterner();
        _interner.Reset();
    }

    // Primitive methods

    public void PushString(string val)
    {
        if (val.Length == 0)
        {
            PushInt(0);
            return;
        }

        var idx = _interner.Intern(val);
        if (idx >= 0)
        {
            PushInt(-idx - 1);
            return;
        }

        // Fast path: strings ≤21 chars have max 63 UTF-8 bytes, fits in 1-byte zigzag varint
        if (val.Length <= 21)
        {
            EnsureCapacity(1 + val.Length * 3);
            var lengthPos = _pos++;
            var written = Encoding.UTF8.GetBytes(val, _buffer.AsSpan(_pos));
            _buffer[lengthPos] = (byte)(written * 2); // Zigzag encode: positive n → n*2
            _pos += written;
            return;
        }

        // Standard path: compute byte count first for longer strings
        var byteCount = Encoding.UTF8.GetByteCount(val);
        PushInt(byteCount);
        EnsureCapacity(byteCount);
        Encoding.UTF8.GetBytes(val, _buffer.AsSpan(_pos, byteCount));
        _pos += byteCount;
    }

    public void PushInt(long val)
    {
        EnsureCapacity(10);
        Varint.WriteVarint(_buffer, ref _pos, val);
    }

    public void PushBoundedInt(long val, long min)
    {
        if (val < min)
            throw new ArgumentOutOfRangeException(nameof(val));
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

    public void PushFloatQuantized(float val, float precision)
    {
        if (!float.IsFinite(val))
            throw new ArgumentException("Quantized float must be finite", nameof(val));
        PushInt((long)Math.Round(val / precision));
    }

    public void PushBoolean(bool val) =>
        _rle.PushBit(val);

    public void PushEnum(int val, int numBits)
    {
        if (val < 0 || val >= (1L << numBits))
            throw new ArgumentOutOfRangeException(nameof(val));
        _rle.PushBits(val, numBits);
    }

    public void PushBitPackedInt(long val, long min, long max, int numBits)
    {
        if (val < min || val > max)
            throw new ArgumentOutOfRangeException(nameof(val));
        _rle.PushBits((int)(val - min), numBits);
    }

    // Container methods

    public void PushOptional<T>(T? val, Action<T> innerWrite) where T : class
    {
        PushBoolean(val is not null);
        if (val is not null)
            innerWrite(val);
    }

    // Generated code passes concrete List<T>; compile-time overload resolution picks
    // this version and the JIT emits the non-virtual List<T> indexer. The IList<T>
    // overload below is the fallback for callers like the interpreter.
    public void PushArray<T>(List<T> val, Action<T> innerWrite)
    {
        var count = val.Count;
        PushUInt((uint)count);
        for (var i = 0; i < count; i++)
            innerWrite(val[i]);
    }

    public void PushArray<T>(IList<T> val, Action<T> innerWrite)
    {
        var count = val.Count;
        PushUInt((uint)count);
        for (var i = 0; i < count; i++)
            innerWrite(val[i]);
    }

    // Same overload-pair pattern as PushArray: the concrete OrderedDict version
    // uses indexed access; IDictionary is the interpreter fallback.
    public void PushRecord<TKey, TValue>(
        OrderedDict<TKey, TValue> val,
        Action<TKey> innerKeyWrite,
        Action<TValue> innerValWrite)
        where TKey : notnull
    {
        var count = val.Count;
        PushUInt((uint)count);
        for (var i = 0; i < count; i++)
        {
            var key = val.GetKeyAtIndex(i);
            innerKeyWrite(key);
            innerValWrite(val[key]);
        }
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

    // Value-only diff methods (caller handles change bit for object fields)

    public void PushStringDiff(string a, string b)
    {
        _interner.Intern(a);
        PushString(b);
    }

    public void PushIntDiff(long a, long b) =>
        PushInt(b);

    public void PushBoundedIntDiff(long a, long b, long min) =>
        PushBoundedInt(b, min);

    public void PushFloatDiff(float a, float b) =>
        PushFloat(b);

    public void PushFloatQuantizedDiff(float a, float b, float precision) =>
        PushFloatQuantized(b, precision);

    public void PushBooleanDiff(bool a, bool b) =>
        PushBoolean(a != b);

    public void PushEnumDiff(int a, int b, int numBits) =>
        PushEnum(b, numBits);

    public void PushBitPackedIntDiff(long a, long b, long min, long max, int numBits) =>
        PushBitPackedInt(b, min, max, numBits);

    // Object diff helper (wrap object encoding with change bit)

    public void PushObjectDiff<T>(T a, T b, Func<T, T, bool> equals, Action encodeDiff)
    {
        var changed = !equals(a, b);
        PushBoolean(changed);
        if (changed)
            encodeDiff();
    }

    // Field diff helpers (wrap value-only diff with change bit)

    public void PushFieldDiff<T>(T a, T b, Func<T, T, bool> equals, Action<T, T> encodeDiff)
    {
        var changed = !equals(a, b);
        PushBoolean(changed);
        if (changed)
            encodeDiff(a, b);
    }

    // Optional diff

    public void PushOptionalDiff<T>(T? a, T? b, Action<T> encode, Action<T, T> encodeDiff) where T : class
    {
        // Optimization: if a was null, we know b must be non-null (else changed would be false)
        // So skip the present bit in null→value case
        if (a is null)
        {
            encode(b!); // null → value (b guaranteed non-null by caller)
        }
        else
        {
            PushBoolean(b is not null);
            if (b is not null)
                encodeDiff(a, b); // value → value
            // else value → null
        }
    }

    public void PushOptionalDiff<T>(T? a, T? b, Action<T> encode, Action<T, T> encodeDiff) where T : struct
    {
        // Optimization: if a was null, we know b must be non-null (else changed would be false)
        // So skip the present bit in null→value case
        if (a is null)
        {
            encode(b!.Value); // null → value (b guaranteed non-null by caller)
        }
        else
        {
            PushBoolean(b is not null);
            if (b.HasValue)
                encodeDiff(a.Value, b.Value); // value → value
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
        // Caller handles change bit via PushFieldDiff
        PushUInt((uint)b.Count);

        // Collect changed indices (sparse encoding)
        var updates = new List<int>();
        var minLen = Math.Min(a.Count, b.Count);
        for (var i = 0; i < minLen; i++)
        {
            if (!equals(a[i], b[i]))
                updates.Add(i);
        }

        // Write updates (sparse)
        PushUInt((uint)updates.Count);
        foreach (var i in updates)
        {
            PushUInt((uint)i);
            encodeDiff(a[i], b[i]);
        }

        // Write additions
        for (var i = a.Count; i < b.Count; i++)
            encode(b[i]);
    }

    public void PushRecordDiff<TKey, TValue>(
        IDictionary<TKey, TValue> a,
        IDictionary<TKey, TValue> b,
        Func<TValue, TValue, bool> valueEquals,
        Action<TKey> encodeKey,
        Action<TValue> encodeVal,
        Action<TValue, TValue> encodeDiff)
        where TKey : notnull
    {
        // Caller handles change bit via PushFieldDiff
        var updates = new List<(int idx, TKey key)>();
        var deletions = new List<int>();
        var additions = new List<(TKey key, TValue val)>();

        // Check all keys, tracking position for index-based encoding
        var idx = 0;
        foreach (var (aKey, aVal) in a)
        {
            if (b.TryGetValue(aKey, out var bVal))
            {
                if (!valueEquals(aVal, bVal))
                    updates.Add((idx, aKey));
            }
            else
            {
                deletions.Add(idx);
            }
            idx++;
        }

        foreach (var (bKey, bVal) in b)
        {
            if (!a.ContainsKey(bKey))
                additions.Add((bKey, bVal));
        }

        if (a.Count > 0)
        {
            PushUInt((uint)deletions.Count);
            foreach (var delIdx in deletions)
                PushUInt((uint)delIdx);

            PushUInt((uint)updates.Count);
            foreach (var (updIdx, key) in updates)
            {
                PushUInt((uint)updIdx);
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
        // Estimate RLE size: assume worst case expansion
        EnsureCapacity(256);

        var finalPos = _rle.WriteToBuffer(_buffer, _pos);

        return _buffer.AsSpan(0, finalPos).ToArray();
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

}
