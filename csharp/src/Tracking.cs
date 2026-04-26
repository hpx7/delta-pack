using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Threading;

namespace DeltaPack;

/// <summary>
/// Base contract for types that participate in delta-pack's dirty-tracking graph. Exposes
/// parent-chain wiring (for propagation) and the <see cref="Tracker"/> reference (for
/// per-domain baselines / pruning). Implementers fall into two narrower categories —
/// <see cref="ITrackedObject"/> for <c>[DeltaPack]</c> classes that have at least one
/// <c>partial</c> property (slot-keyed dirty storage), and <see cref="ITrackedContainer"/>
/// for <see cref="DPList{T}"/> / <see cref="DPDict{TKey, TValue}"/> (key-keyed dirty
/// storage).
/// <para>
/// This is source-generator plumbing — user code never needs to touch it. The tracked
/// types implement the interface's members <em>explicitly</em> so they do not clutter the
/// concrete type's surface.
/// </para>
/// </summary>
[EditorBrowsable(EditorBrowsableState.Never)]
public interface IDirtyTracked
{
    /// <summary>Per-domain tracker this instance is bound to. Determines which baselines apply.</summary>
    Tracker Tracker { get; set; }

    /// <summary>Parent container this instance is reachable from, or null if root / detached.</summary>
    IDirtyTracked? Parent { get; set; }

    /// <summary>Key identifying this instance in its parent when the parent is an <see cref="ITrackedContainer"/>.</summary>
    object? ParentKey { get; set; }

    /// <summary>Slot index identifying this instance's field on its parent when the parent is an <see cref="ITrackedObject"/>.</summary>
    int ParentSlot { get; set; }
}

/// <summary>
/// Implemented by <c>[DeltaPack]</c> classes that have at least one <c>partial</c>
/// property. Dirty storage is slot-based — one <c>long</c> per <c>partial</c> field,
/// indexed by the compile-time slot assigned by the source generator. Non-partial
/// auto-properties have no slot and contribute no dirty bits.
/// </summary>
[EditorBrowsable(EditorBrowsableState.Never)]
public interface ITrackedObject : IDirtyTracked
{
    /// <summary>
    /// Records dirty at <paramref name="slot"/> with <paramref name="version"/>. Returns true if
    /// the stored version actually advanced — callers use this to decide whether to keep walking
    /// up the parent chain.
    /// </summary>
    bool MarkDirty(int slot, long version);

    /// <summary>Version recorded at <paramref name="slot"/>, or -1 if never dirtied.</summary>
    long GetDirtyVersion(int slot);

    /// <summary>True if any tracked field has a recorded version strictly greater than <paramref name="version"/>.</summary>
    bool IsAnyDirtyAfter(long version);
}

/// <summary>
/// Implemented by tracked container types whose dirty storage is keyed by user-supplied
/// index / key rather than by a compile-time slot.
/// </summary>
[EditorBrowsable(EditorBrowsableState.Never)]
public interface ITrackedContainer : IDirtyTracked
{
    /// <summary>
    /// Records dirty at <paramref name="key"/> with <paramref name="version"/>. Returns true if
    /// the stored version actually advanced.
    /// </summary>
    bool MarkDirty(object key, long version);
}

/// <summary>
/// Mutable long container held weakly in <see cref="Tracker"/>'s registry. One handle
/// per distinct snapshot object — <see cref="ConditionalWeakTable{TKey, TValue}"/> auto-clears
/// the entry when the snapshot is GC'd.
/// </summary>
internal sealed class SnapshotHandle
{
    internal long Version;
}

/// <summary>
/// Internal hook for tracked containers that maintain tombstone (deleted) maps.
/// Invoked during snapshot registration to drop entries older than the oldest
/// surviving snapshot. Not part of the public API surface.
/// </summary>
internal interface IPruneable
{
    bool PruneDeletedBefore(long minVersion);
}

/// <summary>
/// A per-domain tracking scope. Owns the snapshot handle table, baseline cache, and
/// tombstone registry — i.e. all the state that a single sync domain (a game room, a
/// tenant, a parallel test) needs to keep isolated from any other domain.
/// <para>
/// Construct one <see cref="Tracker"/> per domain and pass it to the <c>Default(Tracker)</c>
/// factory of your top-level tracked class. Use <see cref="Tracker.Default"/> when isolation
/// isn't needed (single-domain apps, scripts, demos).
/// </para>
/// <para>
/// The version clock itself is process-global — see <see cref="NextVersion"/>. Dirty stamps
/// are universally comparable, so attaching a child across trackers is a non-event for
/// correctness; the cross-tracker check in setters/containers is enforcement of isolation
/// (a tree should belong to exactly one tracker), not safety.
/// </para>
/// </summary>
public sealed class Tracker
{
    /// <summary>Process-wide default tracker. Use only when domain isolation isn't required.</summary>
    public static readonly Tracker Default = new();

    // ---- Process-global clock --------------------------------------------------------------
    // Shared across all trackers. The cost is a single contended atomic, but in exchange dirty
    // stamps are universally comparable — re-binding a tracked subtree to a different tracker
    // is just a reference swap, no re-stamping pass needed.

    private static long s_globalVersion;

    /// <summary>Returns and increments the process-global version counter.</summary>
    [EditorBrowsable(EditorBrowsableState.Never)]
    public static long NextVersion() => Interlocked.Increment(ref s_globalVersion);

    /// <summary>Current process-global version (value of the last <see cref="NextVersion"/>).</summary>
    [EditorBrowsable(EditorBrowsableState.Never)]
    public static long CurrentVersion => Interlocked.Read(ref s_globalVersion);

    // ---- Per-tracker state -----------------------------------------------------------------

    // One SnapshotHandle per registered snapshot. Entries are weak-keyed on the snapshot, so
    // sessions don't need to unregister explicitly — when the snapshot is GC'd, its handle
    // disappears. Iterated only during RebuildOldestVersion (periodic), not on every encode.
    private readonly ConditionalWeakTable<object, SnapshotHandle> _handles = new();

    // All writers to _oldestVersionCached / _latestBaseline serialize on this lock, and rebuild
    // iterates _handles under it. That means any registration that's about to lower the cache
    // either (a) already completed and is visible to a concurrent rebuild's iteration, or
    // (b) is waiting on the lock and will observe the rebuilt cached value before it writes.
    // This is what keeps rebuild from clobbering a concurrent lowering.
    private readonly object _cacheLock = new();

    // Lower bound on the oldest surviving snapshot version; the prune cutoff. Readers
    // (PruneDeleted) use Volatile.Read and accept slight staleness — only retains tombstones
    // longer than necessary, never prunes them too aggressively.
    private long _oldestVersionCached = long.MaxValue;

    // Max baseline ever registered with this tracker. Setter fast paths compare against this:
    // if the slot's dirty stamp is already > _latestBaseline, the field is dirty for every
    // pending diff in this domain and the setter can skip NextVersion / parent walk.
    // Volatile.Read on the read side (a plain load on 64-bit), updated under _cacheLock so it
    // only ever grows.
    private long _latestBaseline = -1;

    // Encodes since last rebuild. When it crosses RebuildInterval, the next prune call rebuilds
    // _oldestVersionCached and resets the counter.
    private int _encodesSinceRebuild;
    private const int RebuildInterval = 1024;

    // Live tombstones in this tracker. When zero, RegisterSnapshot's PruneDeleted skips both
    // the bearer-set walk and the rebuild check entirely — idle ticks fall through with one
    // atomic read.
    private long _tombstoneCount;

    // Containers currently holding tombstones in this tracker — registered the first time a
    // container produces one. Iteration size is bounded by the number of containers that
    // actually have tombstones (typically 0, short-circuited by _tombstoneCount).
    private readonly HashSet<WeakReference<IPruneable>> _tombstoneBearers = new();
    private readonly object _tombstoneBearersLock = new();

    /// <summary>
    /// Registers <paramref name="snapshot"/> as a baseline against <paramref name="source"/>'s
    /// tracker. A subsequent call to <c>EncodeDiff(snapshot, source)</c> will filter to only the
    /// mutations that have happened since this registration. No-op for non-tracked sources.
    /// <para>
    /// The tracker is looked up via <paramref name="source"/> rather than being supplied
    /// explicitly — registering a snapshot in any tracker other than the source's would
    /// silently mismatch baselines. <see cref="SyncSession{T}"/> does this internally; this
    /// static is for raw <c>EncodeDiff</c> flows (e.g. ack-based deltas with multiple
    /// historical snapshots).
    /// </para>
    /// </summary>
    public static void RegisterSnapshot(object snapshot, object source)
    {
        if (source is not IDirtyTracked t) return;
        t.Tracker.RegisterSnapshotInternal(snapshot);
    }

    private void RegisterSnapshotInternal(object snapshot)
    {
        var version = Interlocked.Read(ref s_globalVersion);
        lock (_cacheLock)
        {
            // Insert the handle fully initialized so a concurrent GetBaselineFor reader can't
            // observe a zero Version between insertion and the version write.
            if (_handles.TryGetValue(snapshot, out var handle))
                handle.Version = version;
            else
                _handles.Add(snapshot, new SnapshotHandle { Version = version });
            if (_oldestVersionCached > version) _oldestVersionCached = version;
            // Bump the setter short-circuit ceiling. Never lowers — versions are monotonic
            // globally but a concurrent registration on another thread could observe a higher
            // version first and race us here, so guard with a max.
            if (_latestBaseline < version) _latestBaseline = version;
        }

        PruneDeleted();
    }

    /// <summary>
    /// Highest baseline version registered with this tracker. Generated tracked-setter bodies
    /// compare against this to short-circuit repeat mutations within a snapshot window.
    /// </summary>
    [EditorBrowsable(EditorBrowsableState.Never)]
    public long LatestBaseline => Volatile.Read(ref _latestBaseline);

    /// <summary>
    /// Returns the baseline version associated with <paramref name="snapshot"/>, or -1 if it was
    /// never registered with this tracker.
    /// </summary>
    [EditorBrowsable(EditorBrowsableState.Never)]
    public long GetBaselineFor(object snapshot)
        => _handles.TryGetValue(snapshot, out var handle) ? handle.Version : -1;

    internal void IncrementTombstones(int n) => Interlocked.Add(ref _tombstoneCount, n);
    internal void DecrementTombstones(int n) => Interlocked.Add(ref _tombstoneCount, -n);

    internal void RegisterTombstoneBearer(IPruneable bearer)
    {
        lock (_tombstoneBearersLock)
        {
            _tombstoneBearers.Add(new WeakReference<IPruneable>(bearer));
        }
    }

    private void PruneDeleted()
    {
        // Fast path: no tombstones in this tracker. Idle ticks and pure-value mutations fall
        // through here with just a single atomic read.
        if (Volatile.Read(ref _tombstoneCount) == 0) return;

        // Periodically raise the cached min to the true current min (entries whose snapshot
        // was GC'd disappear from _handles automatically, so the rebuild picks up the new
        // floor). Between rebuilds, the cached value is only lowered by registrations — a
        // safe lower bound on the real oldest version.
        if (Interlocked.Increment(ref _encodesSinceRebuild) >= RebuildInterval)
        {
            Interlocked.Exchange(ref _encodesSinceRebuild, 0);
            RebuildOldestVersion();
        }

        var cutoff = Volatile.Read(ref _oldestVersionCached);

        // Prune each tombstone-bearing container directly — no tree walk, no duck-typed
        // dispatch. Containers that drop to zero tombstones (or have been GC'd) are removed
        // from the set as we go.
        lock (_tombstoneBearersLock)
        {
            _tombstoneBearers.RemoveWhere(wr =>
            {
                if (!wr.TryGetTarget(out var bearer)) return true;
                return !bearer.PruneDeletedBefore(cutoff);
            });
        }
    }

    private void RebuildOldestVersion()
    {
        // Done under _cacheLock so any registration that's about to lower the cache either
        // (a) already completed and is visible in _handles during our iteration, or
        // (b) is waiting on the lock and will observe the new cached value we write.
        lock (_cacheLock)
        {
            long newMin = long.MaxValue;
            foreach (var kvp in _handles)
            {
                if (kvp.Value.Version < newMin) newMin = kvp.Value.Version;
            }
            _oldestVersionCached = newMin;
        }
    }
}

/// <summary>
/// Tracker-independent helpers for the parent-chain plumbing. These live outside
/// <see cref="Tracker"/> because they operate purely on <see cref="IDirtyTracked"/> pointers
/// and don't read any per-tracker state.
/// <para>Source-generator plumbing — user code should not call these directly.</para>
/// </summary>
[EditorBrowsable(EditorBrowsableState.Never)]
public static class TrackingOps
{
    /// <summary>
    /// Walks up the parent chain, invoking the appropriate <c>MarkDirty</c> overload at each hop.
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
    /// Rewires <paramref name="child"/>'s parent reference to <paramref name="parent"/> /
    /// <paramref name="key"/>, and adopts <paramref name="parent"/>'s tracker if it differs.
    /// </summary>
    public static void Reparent(IDirtyTracked child, IDirtyTracked parent, object key)
    {
        if (!ReferenceEquals(child.Tracker, parent.Tracker)) child.Tracker = parent.Tracker;
        child.Parent = parent;
        child.ParentKey = key;
    }

    /// <summary>
    /// Rewires <paramref name="child"/>'s parent reference to <paramref name="parent"/> at field
    /// <paramref name="slot"/>, and adopts <paramref name="parent"/>'s tracker if it differs.
    /// </summary>
    public static void ReparentToObject(IDirtyTracked child, IDirtyTracked parent, int slot)
    {
        if (!ReferenceEquals(child.Tracker, parent.Tracker)) child.Tracker = parent.Tracker;
        child.Parent = parent;
        child.ParentSlot = slot;
    }

    /// <summary>Clears the parent reference on <paramref name="child"/>.</summary>
    public static void Detach(IDirtyTracked child)
    {
        child.Parent = null;
        child.ParentKey = null;
        child.ParentSlot = -1;
    }
}
