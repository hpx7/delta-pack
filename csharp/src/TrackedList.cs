using System.Collections;
using System.Collections.Generic;

namespace DeltaPack;

/// <summary>
/// A <see cref="List{T}"/>-compatible list that records per-index version numbers
/// on every mutation. Intended as a drop-in replacement for <see cref="List{T}"/>
/// on serialized properties of <see cref="DeltaPackTrackedAttribute"/> classes so
/// <c>EncodeDiff</c> can skip unchanged-index comparisons.
/// </summary>
public sealed class TrackedList<T> : IList<T>, IReadOnlyList<T>, ITrackedContainer
{
    private readonly List<T> _inner;
    private readonly Dictionary<int, long> _dirty = new();

    public TrackedList() => _inner = new List<T>();
    public TrackedList(int capacity) => _inner = new List<T>(capacity);
    public TrackedList(IEnumerable<T> source)
    {
        _inner = new List<T>(source);
        ReparentRange(0, _inner.Count);
    }

    /// <summary>
    /// Source-generator entry point for snapshot construction. Clones each element via
    /// <paramref name="cloneValue"/> and appends directly to the inner list, bypassing the
    /// per-mutation <c>NextVersion</c>/<c>MarkDirty</c>/<c>PropagateToParent</c> work performed
    /// by <see cref="Add"/>. Not intended for user code.
    /// </summary>
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public static TrackedList<T> CreateSnapshot(TrackedList<T> source, System.Func<T, T> cloneValue)
    {
        var result = new TrackedList<T>(source._inner.Count);
        for (int i = 0; i < source._inner.Count; i++)
        {
            var cloned = cloneValue(source._inner[i]);
            result._inner.Add(cloned);
            if (cloned is IDirtyTracked child) DirtyTracking.Internal.Reparent(child, result, i);
        }
        return result;
    }

    /// <summary>
    /// Source-generator entry point for snapshot construction of lists whose elements are
    /// reference-immutable (primitives, strings, enums). Copies elements directly without
    /// running the tracking write path.
    /// </summary>
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public static TrackedList<T> CreateSnapshot(TrackedList<T> source)
    {
        var result = new TrackedList<T>(source._inner.Count);
        for (int i = 0; i < source._inner.Count; i++)
        {
            result._inner.Add(source._inner[i]);
            if (source._inner[i] is IDirtyTracked child) DirtyTracking.Internal.Reparent(child, result, i);
        }
        return result;
    }

    // ============ IDirtyTracked / ITrackedContainer (explicit impl — source-gen plumbing) ============

    private IDirtyTracked? _parent;
    private object? _parentKey;
    private int _parentSlot = -1;

    IDirtyTracked? IDirtyTracked.Parent { get => _parent; set => _parent = value; }
    object? IDirtyTracked.ParentKey { get => _parentKey; set => _parentKey = value; }
    int IDirtyTracked.ParentSlot { get => _parentSlot; set => _parentSlot = value; }

    /// <summary>
    /// Per-index versions of entries mutated since the last snapshot. Encoder-facing plumbing —
    /// not intended for user code. Access via a cast: <c>((TrackedList&lt;T&gt;)list).DirtyIndices</c>
    /// would still work but <see cref="EditorBrowsableAttribute"/> keeps it out of IntelliSense.
    /// </summary>
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public IReadOnlyDictionary<int, long> DirtyIndices => _dirty;

    bool ITrackedContainer.MarkDirty(object key, long version)
    {
        if (key is not int i) return false;
        if (_dirty.TryGetValue(i, out var existing) && existing >= version) return false;
        _dirty[i] = version;
        return true;
    }

    // ============ Mutating operations ============

    public T this[int index]
    {
        get => _inner[index];
        set
        {
            if (EqualityComparer<T>.Default.Equals(_inner[index], value)) return;

            if (_inner[index] is IDirtyTracked oldChild && ReferenceEquals(oldChild.Parent, this))
                DirtyTracking.Internal.Detach(oldChild);

            _inner[index] = value;
            if (value is IDirtyTracked newChild) DirtyTracking.Internal.Reparent(newChild, this, index);

            var v = DirtyTracking.Internal.NextVersion();
            _dirty[index] = v;
            DirtyTracking.Internal.PropagateToParent(this, v);
        }
    }

    public int Count => _inner.Count;
    public bool IsReadOnly => false;

    public void Add(T item)
    {
        var index = _inner.Count;
        _inner.Add(item);
        if (item is IDirtyTracked child) DirtyTracking.Internal.Reparent(child, this, index);
        var v = DirtyTracking.Internal.NextVersion();
        _dirty[index] = v;
        DirtyTracking.Internal.PropagateToParent(this, v);
    }

    public void AddRange(IEnumerable<T> items)
    {
        var v = DirtyTracking.Internal.NextVersion();
        var startIndex = _inner.Count;
        foreach (var item in items)
        {
            var index = _inner.Count;
            _inner.Add(item);
            if (item is IDirtyTracked child) DirtyTracking.Internal.Reparent(child, this, index);
            _dirty[index] = v;
        }
        if (_inner.Count > startIndex) DirtyTracking.Internal.PropagateToParent(this, v);
    }

    public void Insert(int index, T item)
    {
        if (index < 0 || index > _inner.Count) throw new System.ArgumentOutOfRangeException(nameof(index));
        _inner.Insert(index, item);
        if (item is IDirtyTracked child) DirtyTracking.Internal.Reparent(child, this, index);
        UpdateParentKeys(index + 1, _inner.Count);

        var v = DirtyTracking.Internal.NextVersion();
        for (int i = index; i < _inner.Count; i++) _dirty[i] = v;
        DirtyTracking.Internal.PropagateToParent(this, v);
    }

    public bool Remove(T item)
    {
        var idx = _inner.IndexOf(item);
        if (idx < 0) return false;
        RemoveAt(idx);
        return true;
    }

    public void RemoveAt(int index)
    {
        if (index < 0 || index >= _inner.Count) throw new System.ArgumentOutOfRangeException(nameof(index));

        if (_inner[index] is IDirtyTracked oldChild && ReferenceEquals(oldChild.Parent, this))
            DirtyTracking.Internal.Detach(oldChild);

        _inner.RemoveAt(index);
        UpdateParentKeys(index, _inner.Count);

        var v = DirtyTracking.Internal.NextVersion();
        for (int i = index; i < _inner.Count + 1; i++) _dirty[i] = v;
        DirtyTracking.Internal.PropagateToParent(this, v);
    }

    /// <summary>Removes <paramref name="count"/> elements starting at <paramref name="index"/>.</summary>
    public void RemoveRange(int index, int count)
    {
        if (index < 0 || count < 0 || index + count > _inner.Count)
            throw new System.ArgumentOutOfRangeException();
        if (count == 0) return;

        for (int i = index; i < index + count; i++)
        {
            if (_inner[i] is IDirtyTracked c && ReferenceEquals(c.Parent, this))
                DirtyTracking.Internal.Detach(c);
        }
        var oldCount = _inner.Count;
        _inner.RemoveRange(index, count);
        UpdateParentKeys(index, _inner.Count);

        var v = DirtyTracking.Internal.NextVersion();
        for (int i = index; i < oldCount; i++) _dirty[i] = v;
        DirtyTracking.Internal.PropagateToParent(this, v);
    }

    /// <summary>Inserts each item in <paramref name="items"/> starting at <paramref name="index"/>.</summary>
    public void InsertRange(int index, IEnumerable<T> items)
    {
        if (index < 0 || index > _inner.Count) throw new System.ArgumentOutOfRangeException(nameof(index));

        var materialized = items as IList<T> ?? new List<T>(items);
        if (materialized.Count == 0) return;

        _inner.InsertRange(index, materialized);

        // Reparent the freshly-inserted items, then update keys on everything shifted right.
        for (int i = 0; i < materialized.Count; i++)
        {
            if (_inner[index + i] is IDirtyTracked c) DirtyTracking.Internal.Reparent(c, this, index + i);
        }
        UpdateParentKeys(index + materialized.Count, _inner.Count);

        var v = DirtyTracking.Internal.NextVersion();
        for (int i = index; i < _inner.Count; i++) _dirty[i] = v;
        DirtyTracking.Internal.PropagateToParent(this, v);
    }

    public void Clear()
    {
        if (_inner.Count == 0) return;
        var oldCount = _inner.Count;
        for (int i = 0; i < oldCount; i++)
        {
            if (_inner[i] is IDirtyTracked c && ReferenceEquals(c.Parent, this)) DirtyTracking.Internal.Detach(c);
        }
        _inner.Clear();
        var v = DirtyTracking.Internal.NextVersion();
        for (int i = 0; i < oldCount; i++) _dirty[i] = v;
        DirtyTracking.Internal.PropagateToParent(this, v);
    }

    /// <summary>
    /// Mirrors <see cref="List{T}.Sort(System.Comparison{T})"/>. Marks every index dirty because
    /// element positions may change; updates <see cref="IDirtyTracked.ParentKey"/> on tracked
    /// children to reflect their new indices.
    /// </summary>
    public void Sort(System.Comparison<T> comparison)
    {
        _inner.Sort(comparison);
        MarkAllDirtyAndReparent();
    }

    public void Sort() => Sort(Comparer<T>.Default.Compare);

    public void Reverse()
    {
        _inner.Reverse();
        MarkAllDirtyAndReparent();
    }

    // ============ Read-only / pass-through ============

    public bool Contains(T item) => _inner.Contains(item);
    public int IndexOf(T item) => _inner.IndexOf(item);
    public void CopyTo(T[] array, int arrayIndex) => _inner.CopyTo(array, arrayIndex);
    public List<T>.Enumerator GetEnumerator() => _inner.GetEnumerator();
    IEnumerator<T> IEnumerable<T>.GetEnumerator() => _inner.GetEnumerator();
    IEnumerator IEnumerable.GetEnumerator() => _inner.GetEnumerator();

    // ============ Internal helpers ============

    private void MarkAllDirtyAndReparent()
    {
        var v = DirtyTracking.Internal.NextVersion();
        for (int i = 0; i < _inner.Count; i++) _dirty[i] = v;
        UpdateParentKeys(0, _inner.Count);
        if (_inner.Count > 0) DirtyTracking.Internal.PropagateToParent(this, v);
    }

    private void UpdateParentKeys(int start, int end)
    {
        for (int i = start; i < end; i++)
        {
            if (_inner[i] is IDirtyTracked c && ReferenceEquals(c.Parent, this))
                c.ParentKey = i;
        }
    }

    private void ReparentRange(int start, int end)
    {
        for (int i = start; i < end; i++)
        {
            if (_inner[i] is IDirtyTracked c) DirtyTracking.Internal.Reparent(c, this, i);
        }
    }
}
