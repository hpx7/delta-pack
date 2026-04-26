using System.Collections;
using System.Diagnostics.CodeAnalysis;

namespace DeltaPack;

/// <summary>
/// Insertion-order-preserving dictionary used internally as the storage layer for
/// <see cref="DPDict{TKey, TValue}"/>. Not part of the public API — use
/// <see cref="DPDict{TKey, TValue}"/> for delta-pack record/map fields.
/// </summary>
internal class OrderedDict<TKey, TValue> : IDictionary<TKey, TValue>, IDictionary, IReadOnlyDictionary<TKey, TValue>
    where TKey : notnull
{
    private readonly List<KeyValuePair<TKey, TValue>> _list;
    private readonly Dictionary<TKey, int> _index;

    public OrderedDict()
    {
        _list = new List<KeyValuePair<TKey, TValue>>();
        _index = new Dictionary<TKey, int>();
    }

    public OrderedDict(int capacity)
    {
        _list = new List<KeyValuePair<TKey, TValue>>(capacity);
        _index = new Dictionary<TKey, int>(capacity);
    }

    public OrderedDict(IDictionary<TKey, TValue> source)
    {
        _list = new List<KeyValuePair<TKey, TValue>>(source.Count);
        _index = new Dictionary<TKey, int>(source.Count);
        foreach (var kvp in source)
        {
            _index[kvp.Key] = _list.Count;
            _list.Add(kvp);
        }
    }

    public TValue this[TKey key]
    {
        get => _list[_index[key]].Value;
        set
        {
            if (_index.TryGetValue(key, out var idx))
            {
                _list[idx] = new KeyValuePair<TKey, TValue>(key, value);
            }
            else
            {
                _index[key] = _list.Count;
                _list.Add(new KeyValuePair<TKey, TValue>(key, value));
            }
        }
    }

    public ICollection<TKey> Keys => _list.Select(kvp => kvp.Key).ToArray();

    public ICollection<TValue> Values => _list.Select(kvp => kvp.Value).ToArray();

    IEnumerable<TKey> IReadOnlyDictionary<TKey, TValue>.Keys => _list.Select(kvp => kvp.Key);

    IEnumerable<TValue> IReadOnlyDictionary<TKey, TValue>.Values => _list.Select(kvp => kvp.Value);

    public int Count => _list.Count;

    public bool IsReadOnly => false;

    public void Add(TKey key, TValue value)
    {
        if (_index.ContainsKey(key))
            throw new ArgumentException($"An item with the same key has already been added. Key: {key}");
        _index[key] = _list.Count;
        _list.Add(new KeyValuePair<TKey, TValue>(key, value));
    }

    public void Add(KeyValuePair<TKey, TValue> item) => Add(item.Key, item.Value);

    public bool Remove(TKey key)
    {
        if (!_index.TryGetValue(key, out var idx))
            return false;

        _list.RemoveAt(idx);
        _index.Remove(key);

        // Shift indices for all entries after the removed one
        for (var i = idx; i < _list.Count; i++)
            _index[_list[i].Key] = i;

        return true;
    }

    public bool Remove(KeyValuePair<TKey, TValue> item)
    {
        if (!_index.TryGetValue(item.Key, out var idx))
            return false;
        if (!EqualityComparer<TValue>.Default.Equals(_list[idx].Value, item.Value))
            return false;
        return Remove(item.Key);
    }

    public bool ContainsKey(TKey key) => _index.ContainsKey(key);

    public bool Contains(KeyValuePair<TKey, TValue> item) =>
        _index.TryGetValue(item.Key, out var idx) &&
        EqualityComparer<TValue>.Default.Equals(_list[idx].Value, item.Value);

    public bool TryGetValue(TKey key,
#if !NETSTANDARD2_1
        [MaybeNullWhen(false)]
#endif
        out TValue value)
    {
        if (_index.TryGetValue(key, out var idx))
        {
            value = _list[idx].Value;
            return true;
        }
        value = default!;
        return false;
    }

    public void Clear()
    {
        _list.Clear();
        _index.Clear();
    }

    public void CopyTo(KeyValuePair<TKey, TValue>[] array, int arrayIndex) =>
        _list.CopyTo(array, arrayIndex);

    public TKey GetKeyAtIndex(int index) => _list[index].Key;

    /// <summary>O(1) lookup of a key's insertion-order index. Returns false if the key is absent.</summary>
    public bool TryGetIndex(TKey key, out int index) => _index.TryGetValue(key, out index);

    /// <summary>
    /// Internal accessor to the raw key→index map. Used by <c>Encoder.PushRecordDiff</c> as a
    /// zero-copy substitute for the dictionary it would otherwise build per call.
    /// </summary>
    internal Dictionary<TKey, int> IndexMap => _index;

    public IEnumerator<KeyValuePair<TKey, TValue>> GetEnumerator() => _list.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

    // IDictionary (non-generic) explicit implementation
    object? IDictionary.this[object key]
    {
        get => this[(TKey)key];
        set => this[(TKey)key] = (TValue)value!;
    }
    bool IDictionary.IsFixedSize => false;
    bool IDictionary.IsReadOnly => false;
    ICollection IDictionary.Keys => _list.Select(kvp => kvp.Key).ToArray();
    ICollection IDictionary.Values => _list.Select(kvp => kvp.Value).ToArray();
    bool ICollection.IsSynchronized => false;
    object ICollection.SyncRoot => this;
    void IDictionary.Add(object key, object? value) => Add((TKey)key, (TValue)value!);
    bool IDictionary.Contains(object key) => key is TKey k && ContainsKey(k);
    void IDictionary.Remove(object key) => Remove((TKey)key);
    IDictionaryEnumerator IDictionary.GetEnumerator() => new DictionaryEnumerator(this);
    void ICollection.CopyTo(Array array, int index) => ((ICollection)_list).CopyTo(array, index);

    private sealed class DictionaryEnumerator : IDictionaryEnumerator
    {
        private readonly IEnumerator<KeyValuePair<TKey, TValue>> _inner;
        public DictionaryEnumerator(OrderedDict<TKey, TValue> dict) => _inner = dict._list.GetEnumerator();
        public DictionaryEntry Entry => new(_inner.Current.Key, _inner.Current.Value);
        public object Key => _inner.Current.Key;
        public object? Value => _inner.Current.Value;
        public object Current => Entry;
        public bool MoveNext() => _inner.MoveNext();
        public void Reset() => _inner.Reset();
    }
}

internal static class OrderedDictExtensions
{
    public static OrderedDict<TKey, TValue> ToOrderedDict<TSource, TKey, TValue>(
        this IEnumerable<TSource> source,
        Func<TSource, TKey> keySelector,
        Func<TSource, TValue> valueSelector) where TKey : notnull
    {
        var dict = new OrderedDict<TKey, TValue>();
        foreach (var item in source)
            dict[keySelector(item)] = valueSelector(item);
        return dict;
    }
}
