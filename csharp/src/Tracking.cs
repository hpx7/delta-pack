using System.Collections.Generic;
using System.Threading;

namespace DeltaPack;

/// <summary>
/// Base contract for types that participate in delta-pack's dirty-tracking graph. Exposes
/// parent-chain wiring (for propagation) and a snapshot-version slot (used at diff-encode
/// time as the baseline). Implementers fall into two narrower categories —
/// <see cref="ITrackedObject"/> for <c>[DeltaPackTracked]</c> classes (slot-keyed dirty
/// storage) and <see cref="ITrackedContainer"/> for <see cref="TrackedList{T}"/> /
/// <see cref="TrackedOrderedDict{TKey, TValue}"/> (key-keyed dirty storage).
/// </summary>
public interface IDirtyTracked
{
    /// <summary>Version of the global counter at the time this instance was registered as a snapshot; -1 if not a snapshot.</summary>
    long SnapshotVersion { get; set; }

    /// <summary>Parent container this instance is reachable from, or null if root / detached.</summary>
    IDirtyTracked? Parent { get; set; }

    /// <summary>
    /// Key identifying this instance in its parent when the parent is an <see cref="ITrackedContainer"/>
    /// (int for list indices, user key for dict entries). Unused when the parent is an <see cref="ITrackedObject"/> —
    /// <see cref="ParentSlot"/> carries the field slot in that case.
    /// </summary>
    object? ParentKey { get; set; }

    /// <summary>
    /// Slot index identifying this instance's field on its parent when the parent is an
    /// <see cref="ITrackedObject"/>. -1 when unused (e.g. the parent is a list/dict).
    /// Stored as an int to avoid boxing on every parent-chain propagation.
    /// </summary>
    int ParentSlot { get; set; }

    /// <summary>
    /// Sets <see cref="SnapshotVersion"/> on this instance and propagates the same value to every
    /// nested <see cref="IDirtyTracked"/> reachable via fields, list elements, or dictionary values.
    /// Called by <see cref="DirtyTracking.RegisterSnapshot"/> to mark the entire snapshot tree.
    /// </summary>
    void SetSnapshotVersionRecursive(long version);
}

/// <summary>
/// Implemented by <c>[DeltaPackTracked]</c> classes. Dirty storage is slot-based — one
/// <c>long</c> per declared field, indexed by the compile-time slot assigned by the source
/// generator. Avoids the string-hash and dictionary-lookup cost of a keyed scheme.
/// </summary>
public interface ITrackedObject : IDirtyTracked
{
    /// <summary>
    /// Records dirty at <paramref name="slot"/> with <paramref name="version"/>. Returns true
    /// if the stored version actually advanced, false if the slot was already &gt;= <paramref name="version"/>.
    /// Callers use the return to decide whether to keep walking up the parent chain.
    /// </summary>
    bool MarkDirty(int slot, long version);

    /// <summary>
    /// Returns the version recorded at <paramref name="slot"/>, or -1 if the slot has never been
    /// marked dirty.
    /// </summary>
    long GetDirtyVersion(int slot);

    /// <summary>
    /// Returns true if any tracked field on this instance has a recorded version strictly greater
    /// than <paramref name="version"/>. Used by <c>PushObjectDiff</c> to decide whether to emit a
    /// "changed" bit without reading every slot individually.
    /// </summary>
    bool IsAnyDirtyAfter(long version);
}

/// <summary>
/// Implemented by tracked container types (<see cref="TrackedList{T}"/>,
/// <see cref="TrackedOrderedDict{TKey, TValue}"/>) whose dirty storage is keyed by user-supplied
/// index / key rather than by a compile-time slot.
/// </summary>
public interface ITrackedContainer : IDirtyTracked
{
    /// <summary>
    /// Records dirty at <paramref name="key"/> with <paramref name="version"/>. Returns true if
    /// the stored version actually advanced, false if it was already &gt;= <paramref name="version"/>.
    /// </summary>
    bool MarkDirty(object key, long version);
}

/// <summary>
/// Monotonic version counter and snapshot registry shared by all tracked
/// instances in the process. Mirrors the TypeScript <c>tracking.ts</c>
/// module.
/// </summary>
public static class DirtyTracking
{
    private static long s_version;

    // Keyed by WeakReference to allow snapshots to be GC'd; guarded by s_snapshotsLock.
    private static readonly HashSet<WeakReference<IDirtyTracked>> s_snapshots = new();
    private static readonly object s_snapshotsLock = new();

    /// <summary>Returns and increments the global version counter.</summary>
    public static long NextVersion() => Interlocked.Increment(ref s_version);

    /// <summary>Current global version (value of the last <see cref="NextVersion"/>).</summary>
    public static long CurrentVersion => Interlocked.Read(ref s_version);

    /// <summary>
    /// Registers <paramref name="snapshot"/> as a baseline against <paramref name="source"/>'s tracking state.
    /// Recursively sets <see cref="IDirtyTracked.SnapshotVersion"/> on <paramref name="snapshot"/> (and nested
    /// tracked containers) to the current global version, and prunes deleted-key tombstones from
    /// <paramref name="source"/> that are older than any surviving snapshot.
    /// </summary>
    public static void RegisterSnapshot(object snapshot, object source)
    {
        if (source is not IDirtyTracked sourceTracked) return;

        if (snapshot is IDirtyTracked snapshotTracked)
        {
            snapshotTracked.SetSnapshotVersionRecursive(CurrentVersion);
            lock (s_snapshotsLock)
            {
                s_snapshots.Add(new WeakReference<IDirtyTracked>(snapshotTracked));
            }
        }

        PruneDeleted(sourceTracked);
    }

    /// <summary>
    /// Walks up the parent chain, invoking the appropriate <c>MarkDirty</c> overload at each hop.
    /// Object parents use the slot-based <see cref="ITrackedObject.MarkDirty(int, long)"/> (read
    /// from the child's <see cref="IDirtyTracked.ParentSlot"/>); container parents use the keyed
    /// <see cref="ITrackedContainer.MarkDirty(object, long)"/> (from <see cref="IDirtyTracked.ParentKey"/>).
    /// Stops as soon as a parent reports its entry was already at or past <paramref name="version"/>.
    /// </summary>
    public static void PropagateToParent(IDirtyTracked child, long version)
    {
        var current = child;
        while (true)
        {
            var parent = current.Parent;
            if (parent is null) return;
            bool advanced;
            if (parent is ITrackedObject tobj)
            {
                advanced = tobj.MarkDirty(current.ParentSlot, version);
            }
            else if (parent is ITrackedContainer tcon)
            {
                var key = current.ParentKey;
                if (key is null) return;
                advanced = tcon.MarkDirty(key, version);
            }
            else
            {
                return;
            }
            if (!advanced) return;
            current = parent;
        }
    }

    /// <summary>
    /// Rewires <paramref name="child"/>'s parent reference to <paramref name="parent"/> / <paramref name="key"/>.
    /// Use when the parent is a tracked container (list / dict) — the child is identified in the
    /// parent by <paramref name="key"/>.
    /// </summary>
    public static void Reparent(IDirtyTracked child, IDirtyTracked parent, object key)
    {
        child.Parent = parent;
        child.ParentKey = key;
    }

    /// <summary>
    /// Rewires <paramref name="child"/>'s parent reference to <paramref name="parent"/> at field <paramref name="slot"/>.
    /// Use when the parent is a tracked object — storing the int slot directly skips the box +
    /// string-switch cost that a keyed reparent would incur on every propagation hop.
    /// </summary>
    public static void ReparentToObject(IDirtyTracked child, IDirtyTracked parent, int slot)
    {
        child.Parent = parent;
        child.ParentSlot = slot;
    }

    /// <summary>
    /// Clears the parent reference on <paramref name="child"/>. Called when a child is replaced or removed.
    /// </summary>
    public static void Detach(IDirtyTracked child)
    {
        child.Parent = null;
        child.ParentKey = null;
        child.ParentSlot = -1;
    }

    private static void PruneDeleted(IDirtyTracked source)
    {
        long oldestVersion = long.MaxValue;
        bool hasSurvivor = false;

        lock (s_snapshotsLock)
        {
            s_snapshots.RemoveWhere(wr => !wr.TryGetTarget(out _));
            foreach (var wr in s_snapshots)
            {
                if (wr.TryGetTarget(out var snap))
                {
                    hasSurvivor = true;
                    if (snap.SnapshotVersion < oldestVersion)
                        oldestVersion = snap.SnapshotVersion;
                }
            }
        }

        // If no snapshots survive, drop all deleted-entry tombstones.
        var cutoff = hasSurvivor ? oldestVersion : long.MaxValue;
        PruneRecursive(source, cutoff);
    }

    private static void PruneRecursive(object? obj, long minVersion)
    {
        if (obj is null) return;

        if (obj is IPruneable p)
            p.PruneDeletedBefore(minVersion);

        if (obj is System.Collections.IDictionary dict)
        {
            foreach (System.Collections.DictionaryEntry entry in dict)
                PruneRecursive(entry.Value, minVersion);
        }
        else if (obj is System.Collections.IEnumerable en && obj is not string)
        {
            foreach (var item in en)
                PruneRecursive(item, minVersion);
        }
    }
}

/// <summary>
/// Internal hook for tracked containers that maintain tombstone (deleted) maps.
/// Invoked during snapshot registration to drop entries older than the oldest
/// surviving snapshot. Not part of the public API surface.
/// </summary>
internal interface IPruneable
{
    void PruneDeletedBefore(long minVersion);
}
