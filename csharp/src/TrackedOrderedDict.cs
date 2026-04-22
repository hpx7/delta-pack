using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace DeltaPack;

/// <summary>
/// An insertion-order-preserving dictionary that records per-key version numbers
/// on mutations. Intended as a drop-in replacement for <see cref="OrderedDict{TKey, TValue}"/>
/// on serialized properties of <see cref="DeltaPackTrackedAttribute"/> classes.
/// Tracks three separate maps: updated keys (<c>DirtyKeys</c>), newly inserted
/// keys (<c>CreatedKeys</c>), and removed keys (<c>DeletedKeys</c>) so
/// <c>EncodeDiff</c> can emit only actual changes since the last snapshot.
/// </summary>
public sealed class TrackedOrderedDict<TKey, TValue>
    : IDictionary<TKey, TValue>, IReadOnlyDictionary<TKey, TValue>, ITrackedContainer, IPruneable
    where TKey : notnull
{
    private readonly OrderedDict<TKey, TValue> _inner;

    // All three keyed by TKey but exposed as IReadOnlyDictionary<object, long>.
    // We maintain parallel typed dicts internally for zero-boxing on the tracking fast path.
    private readonly Dictionary<TKey, long> _dirty = new();
    private readonly Dictionary<TKey, long> _created = new();
    private readonly Dictionary<TKey, long> _deleted = new();

    public TrackedOrderedDict() => _inner = new OrderedDict<TKey, TValue>();
    public TrackedOrderedDict(int capacity) => _inner = new OrderedDict<TKey, TValue>(capacity);
    public TrackedOrderedDict(IDictionary<TKey, TValue> source)
    {
        _inner = new OrderedDict<TKey, TValue>(source);
        foreach (var kvp in _inner)
        {
            if (kvp.Value is IDirtyTracked child) DirtyTracking.Reparent(child, this, kvp.Key);
        }
    }

    /// <summary>
    /// Source-generator entry point for snapshot construction. Populates the inner dictionary
    /// directly — skipping the per-entry <c>NextVersion</c>/<c>MarkDirty</c>/<c>PropagateToParent</c>
    /// work that <see cref="Set"/> performs — since a freshly-built snapshot has no history to
    /// track against. The generator uses this in <c>Clone</c> to avoid the cost of going through
    /// the public mutation path. Not intended for user code.
    /// </summary>
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public static TrackedOrderedDict<TKey, TValue> CreateSnapshot(
        TrackedOrderedDict<TKey, TValue> source,
        System.Func<TValue, TValue> cloneValue)
    {
        var result = new TrackedOrderedDict<TKey, TValue>(source._inner.Count);
        foreach (var kvp in source._inner)
        {
            var cloned = cloneValue(kvp.Value);
            result._inner.Add(kvp.Key, cloned);
            if (cloned is IDirtyTracked child) DirtyTracking.Reparent(child, result, kvp.Key);
        }
        return result;
    }

    /// <summary>
    /// Source-generator entry point for snapshot construction of dicts whose values are
    /// reference-immutable (primitives, strings, enums). Copies each entry directly into the
    /// inner dictionary without running the tracking write path.
    /// </summary>
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public static TrackedOrderedDict<TKey, TValue> CreateSnapshot(TrackedOrderedDict<TKey, TValue> source)
    {
        var result = new TrackedOrderedDict<TKey, TValue>(source._inner.Count);
        foreach (var kvp in source._inner)
        {
            result._inner.Add(kvp.Key, kvp.Value);
            if (kvp.Value is IDirtyTracked child) DirtyTracking.Reparent(child, result, kvp.Key);
        }
        return result;
    }

    // ============ IDirtyTracked ============

    /// <summary>Per-key versions for entries updated since the last snapshot.</summary>
    public IReadOnlyDictionary<TKey, long> DirtyKeys => _dirty;
    /// <summary>Per-key versions for entries inserted since the last snapshot.</summary>
    public IReadOnlyDictionary<TKey, long> CreatedKeys => _created;
    /// <summary>Per-key versions for entries removed since the last snapshot.</summary>
    public IReadOnlyDictionary<TKey, long> DeletedKeys => _deleted;

    public long SnapshotVersion { get; set; } = -1;
    public IDirtyTracked? Parent { get; set; }
    public object? ParentKey { get; set; }
    public int ParentSlot { get; set; } = -1;

    bool ITrackedContainer.MarkDirty(object key, long version)
    {
        if (key is not TKey typedKey) return false;
        if (_dirty.TryGetValue(typedKey, out var existing) && existing >= version) return false;
        _dirty[typedKey] = version;
        return true;
    }

    void IDirtyTracked.SetSnapshotVersionRecursive(long version)
    {
        SnapshotVersion = version;
        foreach (var kvp in _inner)
        {
            if (kvp.Value is IDirtyTracked t) t.SetSnapshotVersionRecursive(version);
        }
    }

    void IPruneable.PruneDeletedBefore(long minVersion)
    {
        if (_deleted.Count == 0) return;
        List<TKey>? toRemove = null;
        foreach (var kvp in _deleted)
        {
            if (kvp.Value < minVersion) (toRemove ??= new List<TKey>()).Add(kvp.Key);
        }
        if (toRemove is null) return;
        foreach (var key in toRemove) _deleted.Remove(key);
    }

    // ============ Indexed access ============

    public TValue this[TKey key]
    {
        get => _inner[key];
        set => Set(key, value);
    }

    /// <summary>Delegates to the underlying <see cref="OrderedDict{TKey, TValue}.GetKeyAtIndex"/>.</summary>
    public TKey GetKeyAtIndex(int index) => _inner.GetKeyAtIndex(index);

    /// <summary>Delegates to the underlying <see cref="OrderedDict{TKey, TValue}.TryGetIndex"/>.</summary>
    public bool TryGetIndex(TKey key, out int index) => _inner.TryGetIndex(key, out index);

    /// <summary>Internal accessor used by <c>Encoder.PushRecordDiff</c> — see <see cref="OrderedDict{TKey, TValue}.IndexMap"/>.</summary>
    internal Dictionary<TKey, int> IndexMap => _inner.IndexMap;

    // ============ Mutating operations ============

    private void Set(TKey key, TValue value)
    {
        var isUpdate = _inner.ContainsKey(key);
        if (isUpdate && _inner[key] is IDirtyTracked oldChild && ReferenceEquals(oldChild.Parent, this))
            DirtyTracking.Detach(oldChild);

        _inner[key] = value;
        if (value is IDirtyTracked newChild) DirtyTracking.Reparent(newChild, this, key);

        var v = DirtyTracking.NextVersion();
        if (isUpdate)
        {
            _dirty[key] = v;
        }
        else
        {
            _created[key] = v;
            // Revival of a previously-deleted key: the deletion cleared _inner, so isUpdate is
            // false — but the key may have been in the snapshot. We can't tell from here (the
            // dict doesn't know which keys were in the baseline), so mark _dirty too. At encode
            // time the filters pick exactly one bucket: aIndexMap.TryGetValue gates _dirty to
            // snapshot keys, and !a.ContainsKey gates _created to non-snapshot keys.
            if (_deleted.ContainsKey(key))
                _dirty[key] = v;
        }
        _deleted.Remove(key);
        DirtyTracking.PropagateToParent(this, v);
    }

    public void Add(TKey key, TValue value)
    {
        if (_inner.ContainsKey(key))
            throw new System.ArgumentException($"An item with the same key has already been added. Key: {key}");
        Set(key, value);
    }

    public void Add(KeyValuePair<TKey, TValue> item) => Add(item.Key, item.Value);

    public bool Remove(TKey key)
    {
        if (!_inner.ContainsKey(key)) return false;
        if (_inner[key] is IDirtyTracked child && ReferenceEquals(child.Parent, this))
            DirtyTracking.Detach(child);

        var v = DirtyTracking.NextVersion();
        _deleted[key] = v;
        _dirty.Remove(key);
        _created.Remove(key);
        _inner.Remove(key);
        DirtyTracking.PropagateToParent(this, v);
        return true;
    }

    public bool Remove(KeyValuePair<TKey, TValue> item) =>
        _inner.TryGetValue(item.Key, out var val)
        && EqualityComparer<TValue>.Default.Equals(val, item.Value)
        && Remove(item.Key);

    public void Clear()
    {
        if (_inner.Count == 0) return;

        var v = DirtyTracking.NextVersion();
        foreach (var kvp in _inner)
        {
            if (kvp.Value is IDirtyTracked child && ReferenceEquals(child.Parent, this))
                DirtyTracking.Detach(child);
            // Always mark deleted unconditionally — the encoder filter (a.ContainsKey check)
            // skips spurious deletions for keys that didn't exist in the snapshot. We can't
            // safely use _created.Remove as a short-circuit here because a key may have been
            // "created" before the snapshot, in which case it's part of the snapshot baseline
            // and a deletion must still be emitted.
            _deleted[kvp.Key] = v;
            _dirty.Remove(kvp.Key);
            _created.Remove(kvp.Key);
        }
        _inner.Clear();
        DirtyTracking.PropagateToParent(this, v);
    }

    // ============ Read-only / pass-through ============

    public int Count => _inner.Count;
    public bool IsReadOnly => false;

    public ICollection<TKey> Keys => _inner.Keys;
    public ICollection<TValue> Values => _inner.Values;
    IEnumerable<TKey> IReadOnlyDictionary<TKey, TValue>.Keys => ((IReadOnlyDictionary<TKey, TValue>)_inner).Keys;
    IEnumerable<TValue> IReadOnlyDictionary<TKey, TValue>.Values => ((IReadOnlyDictionary<TKey, TValue>)_inner).Values;

    public bool ContainsKey(TKey key) => _inner.ContainsKey(key);
    public bool Contains(KeyValuePair<TKey, TValue> item) => _inner.Contains(item);
    public bool TryGetValue(TKey key,
#if !NETSTANDARD2_1
        [MaybeNullWhen(false)]
#endif
        out TValue value) => _inner.TryGetValue(key, out value);
    public void CopyTo(KeyValuePair<TKey, TValue>[] array, int arrayIndex) => _inner.CopyTo(array, arrayIndex);
    public IEnumerator<KeyValuePair<TKey, TValue>> GetEnumerator() => _inner.GetEnumerator();
    IEnumerator IEnumerable.GetEnumerator() => _inner.GetEnumerator();
}
