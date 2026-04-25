using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Threading;

namespace DeltaPack;

/// <summary>
/// Base contract for types that participate in delta-pack's dirty-tracking graph. Exposes
/// parent-chain wiring (for propagation). Implementers fall into two narrower categories —
/// <see cref="ITrackedObject"/> for <c>[DeltaPackTracked]</c> classes (slot-keyed dirty
/// storage) and <see cref="ITrackedContainer"/> for <see cref="TrackedList{T}"/> /
/// <see cref="TrackedOrderedDict{TKey, TValue}"/> (key-keyed dirty storage).
/// <para>
/// This is source-generator plumbing — user code never needs to touch it. The tracked
/// types implement the interface's members <em>explicitly</em> so they do not clutter the
/// concrete type's surface (e.g. <c>player.Parent</c> does not exist; casting to
/// <see cref="IDirtyTracked"/> first does).
/// </para>
/// </summary>
[EditorBrowsable(EditorBrowsableState.Never)]
public interface IDirtyTracked
{
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
}

/// <summary>
/// Implemented by <c>[DeltaPackTracked]</c> classes. Dirty storage is slot-based — one
/// <c>long</c> per declared field, indexed by the compile-time slot assigned by the source
/// generator. Avoids the string-hash and dictionary-lookup cost of a keyed scheme.
/// <para>Source-generator plumbing — see <see cref="IDirtyTracked"/>.</para>
/// </summary>
[EditorBrowsable(EditorBrowsableState.Never)]
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
/// <para>Source-generator plumbing — see <see cref="IDirtyTracked"/>.</para>
/// </summary>
[EditorBrowsable(EditorBrowsableState.Never)]
public interface ITrackedContainer : IDirtyTracked
{
    /// <summary>
    /// Records dirty at <paramref name="key"/> with <paramref name="version"/>. Returns true if
    /// the stored version actually advanced, false if it was already &gt;= <paramref name="version"/>.
    /// </summary>
    bool MarkDirty(object key, long version);
}

/// <summary>
/// Mutable long container held weakly in <see cref="DirtyTracking"/>'s registry. One handle
/// per distinct snapshot object — <see cref="ConditionalWeakTable{TKey, TValue}"/> auto-clears
/// the entry when the snapshot is GC'd, so lifetime tracks snapshot lifetime exactly.
/// </summary>
internal sealed class SnapshotHandle
{
    internal long Version;
}

/// <summary>
/// User-facing registry for the delta-pack tracking system. The only member intended for
/// application code is <see cref="RegisterSnapshot"/> (for advanced ack-based diff protocols);
/// <see cref="SyncSession{T}"/> handles that automatically for ordinary sync streams.
/// <para>
/// The source-generator plumbing — version counter, parent-chain walker, reparenting helpers —
/// lives under the nested <see cref="Internal"/> type. Keeps <c>DirtyTracking.</c> IntelliSense
/// clean (one method shows up, not ten) and signals by name that those APIs are not for user code.
/// </para>
/// </summary>
public static class DirtyTracking
{
    private static long s_version;

    // One SnapshotHandle per distinct snapshot object passed to RegisterSnapshot. Entries
    // are keyed weakly on the snapshot, so sessions don't need to unregister explicitly —
    // when the snapshot is GC'd, its handle is gone. Iterated during RebuildOldestVersion
    // (periodically), not on every encode.
    private static readonly ConditionalWeakTable<object, SnapshotHandle> s_handles = new();

    // All writers to s_oldestVersionCached serialize on this lock, and rebuild iterates
    // s_handles under it. That means any handle registered *before* rebuild takes the lock
    // is visible to the iteration, and any handle registered *after* rebuild releases the
    // lock has already written its baseline via the same critical section — so rebuild
    // cannot overwrite a concurrent lowering.
    private static readonly object s_cacheLock = new();

    // Lower bound on the oldest surviving snapshot version; used as the prune cutoff.
    // Invariant (established by the s_cacheLock discipline above): after any writer releases
    // the lock, s_oldestVersionCached ≤ min(live handle versions). Readers (PruneDeleted's
    // cutoff fetch) use Volatile.Read and accept slight staleness — which only retains
    // tombstones longer than necessary, never prunes them too aggressively.
    private static long s_oldestVersionCached = long.MaxValue;

    // Max of every baseline version ever registered. Used by tracked-setter fast paths: if a
    // field's dirty slot is already > s_latestBaseline, it's already known-dirty for every
    // pending diff and the setter can skip NextVersion / dirty-slot store / parent propagation
    // on subsequent writes within the same snapshot window. Advanced under s_cacheLock so it
    // only ever grows.
    private static long s_latestBaseline = -1;

    // Encodes since last rebuild. When it crosses REBUILD_INTERVAL, the next prune call
    // rebuilds and resets the counter.
    private static int s_encodesSinceRebuild;
    private const int REBUILD_INTERVAL = 1024;

    // Number of live tombstones across all tracked containers in the process. When zero,
    // RegisterSnapshot can skip both the handle iteration and the source-tree walk entirely.
    // Updated by TrackedOrderedDict (and anything else that produces deletion tombstones).
    private static long s_tombstoneCount;

    internal static void IncrementTombstones(int n) => Interlocked.Add(ref s_tombstoneCount, n);
    internal static void DecrementTombstones(int n) => Interlocked.Add(ref s_tombstoneCount, -n);

    // Flat set of containers currently holding tombstones — registered by each container the
    // first time it produces a tombstone. Replaces the old source-tree walk, which descended
    // via IDictionary / IEnumerable and silently failed to reach tombstone-bearing containers
    // nested inside tracked partial classes. Iteration size is bounded by the number of
    // containers that actually have tombstones (typically 0 — the s_tombstoneCount fast path
    // short-circuits everything else).
    private static readonly HashSet<WeakReference<IPruneable>> s_tombstoneBearers = new();
    private static readonly object s_tombstoneBearersLock = new();

    internal static void RegisterTombstoneBearer(IPruneable bearer)
    {
        lock (s_tombstoneBearersLock)
        {
            s_tombstoneBearers.Add(new WeakReference<IPruneable>(bearer));
        }
    }

    /// <summary>
    /// Registers <paramref name="snapshot"/> as a baseline against <paramref name="source"/>'s
    /// tracking state. A subsequent call to <c>EncodeDiff(snapshot, source)</c> will filter
    /// to only the mutations that have happened since this registration — the library looks
    /// the baseline up implicitly via snapshot identity, so callers don't need to thread it
    /// through. Also contributes to the tombstone-prune cutoff.
    /// <see cref="SyncSession{T}"/> does this internally; direct use is for raw
    /// <c>EncodeDiff</c> flows (e.g. ack-based deltas with multiple historical snapshots).
    /// </summary>
    public static void RegisterSnapshot(object snapshot, object source)
    {
        if (source is not IDirtyTracked) return;

        var version = Interlocked.Read(ref s_version);
        lock (s_cacheLock)
        {
            // Insert the handle fully initialized so a concurrent GetBaselineFor reader can't
            // observe a zero Version between insertion and the version write.
            if (s_handles.TryGetValue(snapshot, out var handle))
                handle.Version = version;
            else
                s_handles.Add(snapshot, new SnapshotHandle { Version = version });
            if (s_oldestVersionCached > version)
                s_oldestVersionCached = version;
            // Bump the setter short-circuit ceiling. Never lowers — versions are monotonic
            // globally but a concurrent registration on another thread could observe a higher
            // CurrentVersion first and race us here, so guard with a max.
            if (s_latestBaseline < version)
                s_latestBaseline = version;
        }

        PruneDeleted();
    }

    /// <summary>
    /// Source-generator plumbing — user code should not call these directly. Exposed because
    /// generated code in user assemblies needs entry points into the runtime; the nested-type
    /// name and <see cref="EditorBrowsableAttribute"/> together signal "do not use" without
    /// the complexity of a Roslyn analyzer or friend-assembly arrangement.
    /// </summary>
    [EditorBrowsable(EditorBrowsableState.Never)]
    public static class Internal
    {
        /// <summary>Returns and increments the global version counter.</summary>
        public static long NextVersion() => Interlocked.Increment(ref s_version);

        /// <summary>Current global version (value of the last <see cref="NextVersion"/>).</summary>
        public static long CurrentVersion => Interlocked.Read(ref s_version);

        /// <summary>
        /// Highest baseline version across all live and past snapshot registrations. Generated
        /// tracked-setter bodies compare against this to short-circuit repeat mutations: if the
        /// field's dirty slot is already past this, the field is dirty for every pending baseline,
        /// so additional bookkeeping on this setter call is wasted work. Monotonically increasing.
        /// <para>
        /// Uses <see cref="Volatile.Read(ref long)"/> instead of <see cref="Interlocked.Read"/>:
        /// the former is a plain load on 64-bit platforms (the only supported targets for
        /// <c>[DeltaPackTracked]</c>), which matters because this is called in the hot setter
        /// path — the full memory barrier that <c>Interlocked.Read</c> emits doubled setter cost
        /// in benchmarks. Stale reads are safe: they can only push a mutation onto the full path
        /// (slower but correct), never incorrectly activate the skip.
        /// </para>
        /// </summary>
        public static long LatestBaseline => Volatile.Read(ref s_latestBaseline);

        /// <summary>
        /// Returns the baseline version associated with <paramref name="snapshot"/> from the most
        /// recent <see cref="RegisterSnapshot(object, object)"/> call, or -1 if the object was never
        /// registered. Generated <c>EncodeDiff</c> methods use this to scope the version-based diff
        /// filter.
        /// </summary>
        public static long GetBaselineFor(object snapshot)
        {
            return s_handles.TryGetValue(snapshot, out var handle) ? handle.Version : -1;
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
    }

    private static void PruneDeleted()
    {
        // Fast path: no tombstones exist anywhere in the process. Idle ticks and pure-value
        // mutations fall through here with just a single atomic read.
        if (Volatile.Read(ref s_tombstoneCount) == 0) return;

        // Periodically raise the cached min to the true current min (entries whose snapshot
        // was GC'd disappear from s_handles automatically, so the rebuild picks up the new
        // floor). Between rebuilds, the cached value is only lowered by registrations — a
        // safe lower bound on the real oldest version.
        if (Interlocked.Increment(ref s_encodesSinceRebuild) >= REBUILD_INTERVAL)
        {
            Interlocked.Exchange(ref s_encodesSinceRebuild, 0);
            RebuildOldestVersion();
        }

        var cutoff = Volatile.Read(ref s_oldestVersionCached);

        // Prune each tombstone-bearing container directly — no tree walk, no duck-typed
        // dispatch. Containers that drop to zero tombstones (or have been GC'd) are removed
        // from the set as we go.
        lock (s_tombstoneBearersLock)
        {
            s_tombstoneBearers.RemoveWhere(wr =>
            {
                if (!wr.TryGetTarget(out var bearer)) return true;
                return !bearer.PruneDeletedBefore(cutoff);
            });
        }
    }

    private static void RebuildOldestVersion()
    {
        // Done under s_cacheLock so any registration that's about to lower the cache either
        // (a) already completed and is visible in s_handles during our iteration, or
        // (b) is waiting on the lock and will observe the new cached value we write.
        // This is what keeps rebuild from clobbering a concurrent Lower.
        lock (s_cacheLock)
        {
            long newMin = long.MaxValue;
            foreach (var kvp in s_handles)
            {
                if (kvp.Value.Version < newMin) newMin = kvp.Value.Version;
            }
            s_oldestVersionCached = newMin;
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
    /// <summary>
    /// Remove tombstones with version less than <paramref name="minVersion"/>. Returns true
    /// if any tombstones remain after pruning; the tombstone-bearer registry uses the return
    /// value to drop empty bearers from its set.
    /// </summary>
    bool PruneDeletedBefore(long minVersion);
}
