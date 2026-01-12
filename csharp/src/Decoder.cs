using System.Text;

namespace DeltaPack;

public class Decoder
{
    [ThreadStatic]
    private static RleReader? _sharedRle;

    [ThreadStatic]
    private static List<string>? _sharedDict;

    private readonly List<string> _dict;
    private readonly RleReader _rle;
    private readonly byte[] _buffer;
    private int _pos;

    public Decoder(byte[] buf)
    {
        _buffer = buf;
        _rle = _sharedRle ??= new RleReader();
        _rle.Reset(buf);
        _dict = _sharedDict ??= new List<string>();
        _dict.Clear();
        _pos = 0;
    }

    // Primitive methods

    public string NextString()
    {
        var lenOrIdx = Varint.ReadVarint(_buffer, ref _pos);

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

    public ulong NextUInt() =>
        Varint.ReadUVarint(_buffer, ref _pos);

    public long NextBoundedInt(long min) =>
        (long)NextUInt() + min;

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

    public string NextStringDiff(string a)
    {
        if (!_dict.Contains(a))
            _dict.Add(a);

        var changed = NextBoolean();
        return changed ? NextString() : a;
    }

    public long NextIntDiff(long a)
    {
        var changed = NextBoolean();
        return changed ? NextInt() : a;
    }

    public long NextBoundedIntDiff(long a, long min)
    {
        var changed = NextBoolean();
        return changed ? NextBoundedInt(min) : a;
    }

    public float NextFloatDiff(float a)
    {
        var changed = NextBoolean();
        return changed ? NextFloat() : a;
    }

    public float NextFloatQuantizedDiff(float a, float precision)
    {
        var changed = NextBoolean();
        return changed ? NextFloatQuantized(precision) : a;
    }

    public bool NextBooleanDiff(bool a)
    {
        var changed = NextBoolean();
        return changed ? !a : a;
    }

    public int NextEnumDiff(int a, int numBits)
    {
        var changed = NextBoolean();
        return changed ? NextEnum(numBits) : a;
    }

    public T? NextOptionalDiffPrimitive<T>(T? a, Func<T> decode) where T : class
    {
        if (a is null)
        {
            var present = NextBoolean();
            return present ? decode() : null;
        }
        else
        {
            var changed = NextBoolean();
            if (!changed)
                return a;

            var present = NextBoolean();
            return present ? decode() : null;
        }
    }

    public T? NextOptionalDiffValue<T>(T? a, Func<T> decode) where T : struct
    {
        if (a is null)
        {
            var present = NextBoolean();
            return present ? decode() : null;
        }
        else
        {
            var changed = NextBoolean();
            if (!changed)
                return a;

            var present = NextBoolean();
            return present ? decode() : null;
        }
    }

    public T? NextOptionalDiff<T>(T? a, Func<T> decode, Func<T, T> decodeDiff) where T : class
    {
        if (a is null)
        {
            var present = NextBoolean();
            return present ? decode() : null;
        }
        else
        {
            var present = NextBoolean();
            return present ? decodeDiff(a) : null;
        }
    }

    public List<T> NextArrayDiff<T>(IList<T> arr, Func<T> decode, Func<T, T> decodeDiff)
    {
        var changed = NextBoolean();
        if (!changed)
            return arr.ToList();

        var newLen = (int)NextUInt();
        var newArr = new List<T>(newLen);
        var minLen = Math.Min(arr.Count, newLen);

        for (var i = 0; i < minLen; i++)
        {
            var elementChanged = NextBoolean();
            newArr.Add(elementChanged ? decodeDiff(arr[i]) : arr[i]);
        }

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
        var changed = NextBoolean();
        if (!changed)
            return new Dictionary<TKey, TValue>(obj);

        var result = new Dictionary<TKey, TValue>(obj);
        // Sort keys for deterministic cross-language ordering
        var orderedKeys = obj.Keys.OrderBy(k => k).ToList();

        if (obj.Count > 0)
        {
            var numDeletions = (int)NextUInt();
            for (var i = 0; i < numDeletions; i++)
            {
                var key = orderedKeys[(int)NextUInt()];
                result.Remove(key);
            }

            var numUpdates = (int)NextUInt();
            for (var i = 0; i < numUpdates; i++)
            {
                var key = orderedKeys[(int)NextUInt()];
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
