using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace DeltaPack;

/// <summary>
/// An insertion-order-preserving dictionary that records per-key version numbers
/// on mutations. The standard delta-pack record/map type — used for all map-typed
/// fields on <see cref="DeltaPackAttribute"/> classes so the encoder can use
/// per-key change maps instead of scanning both sides at diff time.
/// </summary>
public sealed class DPDict<TKey, TValue>
    : IDictionary<TKey, TValue>, IReadOnlyDictionary<TKey, TValue>, ITrackedContainer, IPruneable
    where TKey : notnull
{
    private readonly OrderedDict<TKey, TValue> _inner;
    private Tracker _tracker;

    private readonly Dictionary<TKey, long> _dirty = new();
    private readonly Dictionary<TKey, long> _created = new();
    private readonly Dictionary<TKey, long> _deleted = new();

    private bool _registeredAsTombstoneBearer;

    public DPDict() : this(Tracker.Default) { }
    public DPDict(int capacity) : this(Tracker.Default, capacity) { }
    public DPDict(IDictionary<TKey, TValue> source) : this(Tracker.Default, source) { }

    public DPDict(Tracker tracker)
    {
        _tracker = tracker;
        _inner = new OrderedDict<TKey, TValue>();
    }

    public DPDict(Tracker tracker, int capacity)
    {
        _tracker = tracker;
        _inner = new OrderedDict<TKey, TValue>(capacity);
    }

    public DPDict(Tracker tracker, IDictionary<TKey, TValue> source)
    {
        _tracker = tracker;
        _inner = new OrderedDict<TKey, TValue>(source);
        CheckSourceBatch(_inner);
        foreach (var kvp in _inner)
        {
            if (kvp.Value is IDirtyTracked child) TrackingOps.Reparent(child, this, kvp.Key);
        }
    }

    /// <summary>
    /// Source-generator entry point for snapshot construction with a per-value clone callback.
    /// </summary>
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public static DPDict<TKey, TValue> CreateSnapshot(
        DPDict<TKey, TValue> source,
        System.Func<TValue, TValue> cloneValue)
    {
        var result = new DPDict<TKey, TValue>(source._tracker, source._inner.Count);
        foreach (var kvp in source._inner)
        {
            var cloned = cloneValue(kvp.Value);
            result._inner.Add(kvp.Key, cloned);
            if (cloned is IDirtyTracked child) TrackingOps.Reparent(child, result, kvp.Key);
        }
        return result;
    }

    /// <summary>
    /// Source-generator entry point for snapshot construction of dicts whose values are
    /// reference-immutable. Also used by the decoder to reconstruct diff results.
    /// </summary>
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public static DPDict<TKey, TValue> CreateSnapshot(DPDict<TKey, TValue> source)
    {
        var result = new DPDict<TKey, TValue>(source._tracker, source._inner.Count);
        foreach (var kvp in source._inner)
        {
            result._inner.Add(kvp.Key, kvp.Value);
            if (kvp.Value is IDirtyTracked child) TrackingOps.Reparent(child, result, kvp.Key);
        }
        return result;
    }

    // ============ IDirtyTracked / ITrackedContainer (explicit impl — source-gen plumbing) ============

    private IDirtyTracked? _parent;
    private object? _parentKey;
    private int _parentSlot = -1;

    Tracker IDirtyTracked.Tracker { get => _tracker; set => _tracker = value; }
    IDirtyTracked? IDirtyTracked.Parent { get => _parent; set => _parent = value; }
    object? IDirtyTracked.ParentKey { get => _parentKey; set => _parentKey = value; }
    int IDirtyTracked.ParentSlot { get => _parentSlot; set => _parentSlot = value; }

    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public IReadOnlyDictionary<TKey, long> DirtyKeys => _dirty;
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public IReadOnlyDictionary<TKey, long> CreatedKeys => _created;
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public IReadOnlyDictionary<TKey, long> DeletedKeys => _deleted;

    bool ITrackedContainer.MarkDirty(object key, long version)
    {
        if (key is not TKey typedKey) return false;
        if (_dirty.TryGetValue(typedKey, out var existing) && existing >= version) return false;
        _dirty[typedKey] = version;
        return true;
    }

    bool IPruneable.PruneDeletedBefore(long minVersion)
    {
        if (_deleted.Count == 0)
        {
            _registeredAsTombstoneBearer = false;
            return false;
        }
        List<TKey>? toRemove = null;
        foreach (var kvp in _deleted)
        {
            if (kvp.Value < minVersion) (toRemove ??= new List<TKey>()).Add(kvp.Key);
        }
        if (toRemove is not null)
        {
            foreach (var key in toRemove) _deleted.Remove(key);
            _tracker.DecrementTombstones(toRemove.Count);
        }
        if (_deleted.Count == 0)
        {
            _registeredAsTombstoneBearer = false;
            return false;
        }
        return true;
    }

    // ============ Indexed access ============

    public TValue this[TKey key]
    {
        get => _inner[key];
        set => Set(key, value);
    }

    public TKey GetKeyAtIndex(int index) => _inner.GetKeyAtIndex(index);
    public bool TryGetIndex(TKey key, out int index) => _inner.TryGetIndex(key, out index);

    internal Dictionary<TKey, int> IndexMap => _inner.IndexMap;

    // ============ Mutating operations ============

    private void Set(TKey key, TValue value)
    {
        CheckIncoming(value, key);
        var isUpdate = _inner.ContainsKey(key);
        if (isUpdate && _inner[key] is IDirtyTracked oldChild && ReferenceEquals(oldChild.Parent, this))
            TrackingOps.Detach(oldChild);

        _inner[key] = value;
        if (value is IDirtyTracked newChild) TrackingOps.Reparent(newChild, this, key);

        var v = Tracker.NextVersion();
        if (isUpdate)
        {
            _dirty[key] = v;
        }
        else
        {
            _created[key] = v;
            if (_deleted.ContainsKey(key))
                _dirty[key] = v;
        }
        if (_deleted.Remove(key)) _tracker.DecrementTombstones(1);
        TrackingOps.PropagateToParent(this, v);
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
            TrackingOps.Detach(child);

        var v = Tracker.NextVersion();
        var isNewTombstone = !_deleted.ContainsKey(key);
        _deleted[key] = v;
        _dirty.Remove(key);
        _created.Remove(key);
        _inner.Remove(key);
        if (isNewTombstone)
        {
            _tracker.IncrementTombstones(1);
            EnsureRegisteredAsTombstoneBearer();
        }
        TrackingOps.PropagateToParent(this, v);
        return true;
    }

    public bool Remove(KeyValuePair<TKey, TValue> item) =>
        _inner.TryGetValue(item.Key, out var val)
        && EqualityComparer<TValue>.Default.Equals(val, item.Value)
        && Remove(item.Key);

    public void Clear()
    {
        if (_inner.Count == 0) return;

        var v = Tracker.NextVersion();
        int newTombstones = 0;
        foreach (var kvp in _inner)
        {
            if (kvp.Value is IDirtyTracked child && ReferenceEquals(child.Parent, this))
                TrackingOps.Detach(child);
            if (!_deleted.ContainsKey(kvp.Key)) newTombstones++;
            _deleted[kvp.Key] = v;
            _dirty.Remove(kvp.Key);
            _created.Remove(kvp.Key);
        }
        _inner.Clear();
        if (newTombstones > 0)
        {
            _tracker.IncrementTombstones(newTombstones);
            EnsureRegisteredAsTombstoneBearer();
        }
        TrackingOps.PropagateToParent(this, v);
    }

    private void EnsureRegisteredAsTombstoneBearer()
    {
        if (_registeredAsTombstoneBearer) return;
        _registeredAsTombstoneBearer = true;
        _tracker.RegisterTombstoneBearer(this);
    }

    private void CheckIncoming(TValue value, TKey targetKey)
    {
        if (value is IDirtyTracked child && child.Parent is not null
            && (!ReferenceEquals(child.Parent, this) || !object.Equals(child.ParentKey, targetKey)))
        {
            throw new System.InvalidOperationException(
                "Cannot add a tracked value that is already attached to another parent or key — " +
                "aliasing is not supported. Detach it from its current owner first.");
        }
    }

    private static void CheckSourceBatch(OrderedDict<TKey, TValue> source)
    {
        List<IDirtyTracked>? seen = null;
        foreach (var kvp in source)
        {
            if (kvp.Value is not IDirtyTracked child) continue;
            if (child.Parent is not null)
            {
                throw new System.InvalidOperationException(
                    "Cannot initialize DPDict with a tracked value already attached " +
                    "to another parent — aliasing is not supported.");
            }
            if (seen is null) seen = new List<IDirtyTracked>();
            foreach (var prev in seen)
            {
                if (ReferenceEquals(prev, child))
                {
                    throw new System.InvalidOperationException(
                        "Cannot initialize DPDict with the same tracked value under " +
                        "two keys — aliasing is not supported.");
                }
            }
            seen.Add(child);
        }
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

public static class DPDictExtensions
{
    /// <summary>
    /// Source-generator helper for FromJson — builds a DPDict by streaming a JSON property
    /// enumerator without materializing an intermediate collection.
    /// </summary>
    public static DPDict<TKey, TValue> ToDPDict<TSource, TKey, TValue>(
        this IEnumerable<TSource> source,
        System.Func<TSource, TKey> keySelector,
        System.Func<TSource, TValue> valueSelector) where TKey : notnull
    {
        var dict = new DPDict<TKey, TValue>();
        foreach (var item in source)
            dict[keySelector(item)] = valueSelector(item);
        return dict;
    }
}
