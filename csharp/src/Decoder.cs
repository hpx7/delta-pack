using System.Text;

namespace DeltaPack;

public class Decoder
{
    [ThreadStatic]
    private static RleReader? _sharedRle;

    [ThreadStatic]
    private static List<string>? _sharedDict;

    private readonly byte[] _buffer;
    private int _pos;
    private readonly List<string> _dict;
    private readonly RleReader _rle;

    public Decoder(byte[] buf)
    {
        _buffer = buf;
        _pos = 0;
        _rle = _sharedRle ??= new RleReader();
        _rle.Reset(buf);
        _dict = _sharedDict ??= new List<string>();
        _dict.Clear();
    }

    // Primitive methods

    public string NextString()
    {
        var lenOrIdx = NextInt();
        if (lenOrIdx == 0)
            return "";
        if (lenOrIdx > 0)
        {
            var str = Encoding.UTF8.GetString(_buffer, _pos, (int)lenOrIdx);
            _pos += (int)lenOrIdx;
            _dict.Add(str);
            return str;
        }
        return _dict[(int)(-lenOrIdx - 1)];
    }

    public long NextInt() =>
        Varint.ReadVarint(_buffer, ref _pos);

    public long NextBoundedInt(long min) =>
        (long)NextUInt() + min;

    public ulong NextUInt() =>
        Varint.ReadUVarint(_buffer, ref _pos);

    public float NextFloat()
    {
        var val = BitConverter.ToSingle(_buffer, _pos);
        _pos += 4;
        return val;
    }

    public float NextFloatQuantized(float precision) =>
        NextInt() * precision;

    public bool NextBoolean() =>
        _rle.NextBit();

    public int NextEnum(int numBits) =>
        _rle.NextBits(numBits);

    // Container methods

    public T? NextOptional<T>(Func<T> innerRead) where T : class =>
        NextBoolean() ? innerRead() : null;

    public List<T> NextArray<T>(Func<T> innerRead)
    {
        var len = (int)NextUInt();
        var arr = new List<T>(len);
        for (var i = 0; i < len; i++)
            arr.Add(innerRead());
        return arr;
    }

    public Dictionary<TKey, TValue> NextRecord<TKey, TValue>(
        Func<TKey> innerKeyRead,
        Func<TValue> innerValRead)
        where TKey : notnull
    {
        var len = (int)NextUInt();
        var dict = new Dictionary<TKey, TValue>(len);
        for (var i = 0; i < len; i++)
            dict[innerKeyRead()] = innerValRead();
        return dict;
    }

    // Diff methods

    // Value-only diff methods (caller handles change bit for object fields)

    public string NextStringDiff(string a)
    {
        if (!_dict.Contains(a))
            _dict.Add(a);
        return NextString();
    }

    public long NextIntDiff(long a) =>
        NextInt();

    public long NextBoundedIntDiff(long a, long min) =>
        NextBoundedInt(min);

    public float NextFloatDiff(float a) =>
        NextFloat();

    public float NextFloatQuantizedDiff(float a, float precision) =>
        NextFloatQuantized(precision);

    public bool NextBooleanDiff(bool a)
    {
        var changed = NextBoolean();
        return changed ? !a : a;
    }

    public int NextEnumDiff(int a, int numBits) =>
        NextEnum(numBits);

    // Field diff helper (read change bit, decode if changed)

    public T NextFieldDiff<T>(T a, Func<T, T> decodeDiff)
    {
        var changed = NextBoolean();
        return changed ? decodeDiff(a) : a;
    }

    // Optional diff

    public T? NextOptionalDiff<T>(T? a, Func<T> decode, Func<T, T> decodeDiff) where T : class
    {
        // Optimization: if a was null, we know b must be non-null (else changed would be false)
        // So no present bit in null→value case
        if (a is null)
        {
            return decode(); // null → value (guaranteed non-null by caller)
        }
        else
        {
            var present = NextBoolean();
            return present ? decodeDiff(a) : null;
        }
    }

    public T? NextOptionalDiff<T>(T? a, Func<T> decode, Func<T, T> decodeDiff) where T : struct
    {
        // Optimization: if a was null, we know b must be non-null (else changed would be false)
        // So no present bit in null→value case
        if (a is null)
        {
            return decode(); // null → value (guaranteed non-null by caller)
        }
        else
        {
            var present = NextBoolean();
            return present ? decodeDiff(a.Value) : null;
        }
    }

    public List<T> NextArrayDiff<T>(IList<T> arr, Func<T> decode, Func<T, T> decodeDiff)
    {
        // Caller handles change bit via NextFieldDiff
        var newLen = (int)NextUInt();

        // Start with copy of old array (truncated to new length)
        var newArr = arr.Take(Math.Min(arr.Count, newLen)).ToList();

        // Apply updates (sparse)
        var numUpdates = (int)NextUInt();
        for (var i = 0; i < numUpdates; i++)
        {
            var idx = (int)NextUInt();
            newArr[idx] = decodeDiff(arr[idx]);
        }

        // Read additions
        for (var i = arr.Count; i < newLen; i++)
            newArr.Add(decode());

        return newArr;
    }

    public Dictionary<TKey, TValue> NextRecordDiff<TKey, TValue>(
        IDictionary<TKey, TValue> obj,
        Func<TKey> decodeKey,
        Func<TValue> decodeVal,
        Func<TValue, TValue> decodeDiff)
        where TKey : notnull
    {
        // Caller handles change bit via NextFieldDiff
        var result = new Dictionary<TKey, TValue>(obj);

        if (obj.Count > 0)
        {
            var numDeletions = (int)NextUInt();
            for (var i = 0; i < numDeletions; i++)
            {
                var key = decodeKey();
                result.Remove(key);
            }

            var numUpdates = (int)NextUInt();
            for (var i = 0; i < numUpdates; i++)
            {
                var key = decodeKey();
                result[key] = decodeDiff(result[key]);
            }
        }

        var numAdditions = (int)NextUInt();
        for (var i = 0; i < numAdditions; i++)
        {
            var key = decodeKey();
            var val = decodeVal();
            result[key] = val;
        }

        return result;
    }
}
