using System.Collections.Generic;
using System.Threading;

namespace DeltaPack;

/// <summary>
/// Implemented by tracked types to expose per-instance dirty metadata to the
/// encoder. The encoder uses this to skip equality comparisons on fields whose
/// recorded version is &lt;= the snapshot's version.
/// </summary>
public interface IDirtyTracked
{
    /// <summary>Per-field versions, keyed by property name. Non-null on tracked objects; null on lists/dicts.</summary>
    IReadOnlyDictionary<string, long>? DirtyFields { get; }

    /// <summary>Per-index versions. Non-null on <see cref="TrackedList{T}"/>; null elsewhere.</summary>
    IReadOnlyDictionary<int, long>? DirtyIndices { get; }

    /// <summary>Version of the global counter at the time this instance was registered as a snapshot; -1 if not a snapshot.</summary>
    long SnapshotVersion { get; set; }

    /// <summary>Parent container this instance is reachable from, or null if root / detached.</summary>
    IDirtyTracked? Parent { get; set; }

    /// <summary>Key identifying this instance in its parent (string for object fields, int for list indices, user key for dict entries).</summary>
    object? ParentKey { get; set; }

    /// <summary>
    /// Records dirty at <paramref name="key"/> with <paramref name="version"/>. Returns true if
    /// the stored version actually advanced (previous entry was absent or lower), false if it was
    /// already ≥ <paramref name="version"/>. Callers use the return to decide whether to keep
    /// walking up the parent chain.
    /// </summary>
    bool MarkDirty(object key, long version);

    /// <summary>
    /// Sets <see cref="SnapshotVersion"/> on this instance and propagates the same value to every
    /// nested <see cref="IDirtyTracked"/> reachable via fields, list elements, or dictionary values.
    /// Called by <see cref="DirtyTracking.RegisterSnapshot"/> to mark the entire snapshot tree.
    /// </summary>
    void SetSnapshotVersionRecursive(long version);
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
    /// Walks up the parent chain, calling <see cref="IDirtyTracked.MarkDirty"/> at each level with
    /// <paramref name="version"/>. Stops when the parent's existing entry for the relevant key is
    /// already at least <paramref name="version"/> (no more propagation needed).
    /// </summary>
    public static void PropagateToParent(IDirtyTracked child, long version)
    {
        var parent = child.Parent;
        var key = child.ParentKey;
        while (parent is not null && key is not null)
        {
            if (!parent.MarkDirty(key, version)) return;
            var next = parent.Parent;
            key = parent.ParentKey;
            parent = next;
        }
    }

    /// <summary>
    /// Rewires <paramref name="child"/>'s parent reference to <paramref name="parent"/> / <paramref name="key"/>.
    /// Safe to call on a fresh object or on reparenting.
    /// </summary>
    public static void Reparent(IDirtyTracked child, IDirtyTracked parent, object key)
    {
        child.Parent = parent;
        child.ParentKey = key;
    }

    /// <summary>
    /// Clears the parent reference on <paramref name="child"/>. Called when a child is replaced or removed.
    /// </summary>
    public static void Detach(IDirtyTracked child)
    {
        child.Parent = null;
        child.ParentKey = null;
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
