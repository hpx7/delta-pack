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

    /// <summary>
    /// Baseline version used by this encoder's diff paths. Fields / entries whose recorded dirty
    /// version is &gt; <see cref="MinVersion"/> are treated as "changed since the baseline" and
    /// included in the diff; everything else is skipped. <see cref="SyncSession{T}"/> sets this
    /// automatically from its per-session scalar; raw <see cref="EncodeDiff"/> callers can leave
    /// it at its default of -1 to include every field.
    /// </summary>
    public long MinVersion { get; set; } = -1;

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
    //
    // Callbacks accept the Encoder as a parameter instead of closing over it. This lets the
    // source generator emit non-capturing lambdas like `(x, encoder) => encoder.PushString(x)`
    // which the C# compiler caches as a static delegate — one allocation per type, not per call.

    public void PushOptional<T>(T? val, Action<T, Encoder> innerWrite) where T : class
    {
        PushBoolean(val is not null);
        if (val is not null)
            innerWrite(val, this);
    }

    public void PushArray<T>(IList<T> val, Action<T, Encoder> innerWrite)
    {
        var count = val.Count;
        PushUInt((uint)count);
        for (var i = 0; i < count; i++)
            innerWrite(val[i], this);
    }

    public void PushRecord<TKey, TValue>(
        OrderedDict<TKey, TValue> val,
        Action<TKey, Encoder> innerKeyWrite,
        Action<TValue, Encoder> innerValWrite)
        where TKey : notnull
    {
        var count = val.Count;
        PushUInt((uint)count);
        for (var i = 0; i < count; i++)
        {
            var key = val.GetKeyAtIndex(i);
            innerKeyWrite(key, this);
            innerValWrite(val[key], this);
        }
    }

    /// <summary>
    /// Tracked-container overload — picked by overload resolution when the generated code
    /// passes a <see cref="TrackedOrderedDict{TKey, TValue}"/>. Same wire format as the
    /// <see cref="OrderedDict{TKey, TValue}"/> path.
    /// </summary>
    public void PushRecord<TKey, TValue>(
        TrackedOrderedDict<TKey, TValue> val,
        Action<TKey, Encoder> innerKeyWrite,
        Action<TValue, Encoder> innerValWrite)
        where TKey : notnull
    {
        var count = val.Count;
        PushUInt((uint)count);
        for (var i = 0; i < count; i++)
        {
            var key = val.GetKeyAtIndex(i);
            innerKeyWrite(key, this);
            innerValWrite(val[key], this);
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

    public void PushObjectDiff<T>(T a, T b, Func<T, T, bool> equals, Action<T, T, Encoder> encodeDiff)
    {
        bool changed;
        if (b is ITrackedObject tb)
        {
            // Tracked fast path: unrolled short-circuit OR over compile-time slot versions,
            // no dictionary walk. Baseline version is carried on the Encoder (set by
            // EncodeDiff's top-level entry point) — see Encoder.MinVersion.
            changed = tb.IsAnyDirtyAfter(MinVersion);
        }
        else
        {
            changed = !equals(a, b);
        }
        PushBoolean(changed);
        if (changed)
            encodeDiff(a, b, this);
    }

    // Field diff helpers (wrap value-only diff with change bit)

    public void PushFieldDiff<T>(T a, T b, Func<T, T, bool> equals, Action<T, T, Encoder> encodeDiff)
    {
        var changed = !equals(a, b);
        PushBoolean(changed);
        if (changed)
            encodeDiff(a, b, this);
    }

    // Optional diff

    public void PushOptionalDiff<T>(T? a, T? b, Action<T, Encoder> encode, Action<T, T, Encoder> encodeDiff) where T : class
    {
        // Optimization: if a was null, we know b must be non-null (else changed would be false)
        // So skip the present bit in null→value case
        if (a is null)
        {
            encode(b!, this); // null → value (b guaranteed non-null by caller)
        }
        else
        {
            PushBoolean(b is not null);
            if (b is not null)
                encodeDiff(a, b, this); // value → value
            // else value → null
        }
    }

    public void PushOptionalDiff<T>(T? a, T? b, Action<T, Encoder> encode, Action<T, T, Encoder> encodeDiff) where T : struct
    {
        // Optimization: if a was null, we know b must be non-null (else changed would be false)
        // So skip the present bit in null→value case
        if (a is null)
        {
            encode(b!.Value, this); // null → value (b guaranteed non-null by caller)
        }
        else
        {
            PushBoolean(b is not null);
            if (b.HasValue)
                encodeDiff(a.Value, b.Value, this); // value → value
            // else value → null
        }
    }

    public void PushArrayDiff<T>(
        IList<T> a,
        IList<T> b,
        Func<T, T, bool> equals,
        Action<T, Encoder> encode,
        Action<T, T, Encoder> encodeDiff)
    {
        // Caller handles change bit via PushFieldDiff
        PushUInt((uint)b.Count);

        // Collect changed indices (sparse encoding)
        var updates = new List<int>();
        var minLen = Math.Min(a.Count, b.Count);

        if (b is TrackedList<T> tb)
        {
            var minVersion = MinVersion;
            foreach (var kvp in tb.DirtyIndices)
            {
                if (kvp.Key < minLen && kvp.Value > minVersion)
                    updates.Add(kvp.Key);
            }
            updates.Sort();
        }
        else
        {
            for (var i = 0; i < minLen; i++)
            {
                if (!equals(a[i], b[i]))
                    updates.Add(i);
            }
        }

        // Write updates (sparse)
        PushUInt((uint)updates.Count);
        foreach (var i in updates)
        {
            PushUInt((uint)i);
            encodeDiff(a[i], b[i], this);
        }

        // Write additions
        for (var i = a.Count; i < b.Count; i++)
            encode(b[i], this);
    }

    public void PushRecordDiff<TKey, TValue>(
        IDictionary<TKey, TValue> a,
        IDictionary<TKey, TValue> b,
        Func<TValue, TValue, bool> valueEquals,
        Action<TKey, Encoder> encodeKey,
        Action<TValue, Encoder> encodeVal,
        Action<TValue, TValue, Encoder> encodeDiff)
        where TKey : notnull
    {
        // Caller handles change bit via PushFieldDiff
        var updates = new List<(int idx, TKey key)>();
        var deletions = new List<int>();
        var additions = new List<(int idx, TKey key, TValue val)>();

        if (b is TrackedOrderedDict<TKey, TValue> tb)
        {
            // Tracked fast path: use per-key change maps instead of scanning both sides.
            var minVersion = MinVersion;

            // Resolve `a`'s key→index lookup once. Common case: a is itself an
            // OrderedDict or TrackedOrderedDict (because the generator always emits the same
            // concrete type on both sides of a record diff), in which case we can reuse the
            // dict's own `_index` map for zero-alloc O(1) lookups. Only fall back to building
            // a fresh keyToIndex when `a` is some other IDictionary.
            Dictionary<TKey, int>? aIndexMap = a switch
            {
                TrackedOrderedDict<TKey, TValue> atkd => atkd.IndexMap,
                OrderedDict<TKey, TValue> aod => aod.IndexMap,
                _ => null,
            };
            if (aIndexMap is null && a.Count > 0 && (tb.DeletedKeys.Count > 0 || tb.DirtyKeys.Count > 0))
            {
                aIndexMap = new Dictionary<TKey, int>(a.Count);
                var pos = 0;
                foreach (var kvp in a) aIndexMap[kvp.Key] = pos++;
            }

            if (aIndexMap is not null && a.Count > 0)
            {
                foreach (var kvp in tb.DeletedKeys)
                {
                    if (kvp.Value > minVersion && aIndexMap.TryGetValue(kvp.Key, out var di))
                        deletions.Add(di);
                }
                deletions.Sort();

                foreach (var kvp in tb.DirtyKeys)
                {
                    if (kvp.Value > minVersion
                        && aIndexMap.TryGetValue(kvp.Key, out var ui)
                        && tb.ContainsKey(kvp.Key))
                        updates.Add((ui, kvp.Key));
                }
                updates.Sort((x, y) => x.idx.CompareTo(y.idx));
            }

            // Additions: skip entirely when no creations since snapshot — this is the common
            // case for stable dicts (e.g. Players in a game tick where nobody joined). When
            // there *are* creations, iterate only the CreatedKeys map (typically 1–3 entries)
            // instead of scanning all of b, then sort by b's insertion index to preserve the
            // wire-format ordering invariant.
            if (tb.CreatedKeys.Count > 0)
            {
                foreach (var kvp in tb.CreatedKeys)
                {
                    if (kvp.Value > minVersion
                        && !a.ContainsKey(kvp.Key)
                        && tb.TryGetIndex(kvp.Key, out var ai))
                        additions.Add((ai, kvp.Key, tb[kvp.Key]));
                }
                additions.Sort((x, y) => x.idx.CompareTo(y.idx));
            }
        }
        else
        {
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

            var bIdx = 0;
            foreach (var (bKey, bVal) in b)
            {
                if (!a.ContainsKey(bKey))
                    additions.Add((bIdx, bKey, bVal));
                bIdx++;
            }
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
                encodeDiff(a[key], b[key], this);
            }
        }

        PushUInt((uint)additions.Count);
        foreach (var (_, key, val) in additions)
        {
            encodeKey(key, this);
            encodeVal(val, this);
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
