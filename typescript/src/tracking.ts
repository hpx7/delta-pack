// ============ Internal Symbols ============

/** Symbol for fast access to underlying object/array (bypasses proxy for encoding) */
const UNDERLYING = Symbol.for("delta-pack:underlying");

/** Symbol for fast access to dirty version map (Map<key, version>) */
const DIRTY = Symbol.for("delta-pack:dirty");

/** Symbol for parent reference (for dirty propagation) */
const PARENT = Symbol.for("delta-pack:parent");

/** Symbol for key in parent (for dirty propagation) */
const PARENT_KEY = Symbol.for("delta-pack:parentKey");

/** Symbol for created version map (Map<K, version> for maps - tracks new keys) */
const CREATED = Symbol.for("delta-pack:created");

/** Symbol for deleted version map (Map<K, version> for maps - tracks deleted keys) */
const DELETED = Symbol.for("delta-pack:deleted");

/**
 * Symbol for the {@link Tracker} this container belongs to. Set on every
 * tracked container (object, array, map) so `registerSnapshot` / tombstone
 * bookkeeping can route to the right per-domain state. Inherited from parent
 * on `attach`.
 */
const TRACKER = Symbol.for("delta-pack:tracker");

// ============ Version Management ============

/** Global monotonic version counter */
let globalVersion = 0;

/** Get the next version number (monotonically increasing) */
function nextVersion(): number {
  return ++globalVersion;
}

/** Get the current version number */
export function currentVersion(): number {
  return globalVersion;
}

// ============ Snapshot Registry ============

const REBUILD_INTERVAL = 1024;

/**
 * Per-snapshot baseline version. Keyed by the snapshot ROOT only — nested nodes
 * are not stamped. Encoders thread this value down via `DiffEncoder.minVersion`,
 * matching the C# implementation's `Tracker.GetBaselineFor`. This avoids the
 * O(tree size) `Object.defineProperty` walk that the previous per-node stamping
 * scheme paid on every encode.
 *
 * Process-global because snapshot identities are unique — version lookup
 * doesn't need a per-tracker dispatch. The per-tracker `snapshotRefs` set is
 * what scopes the prune cutoff.
 */
const snapshotVersions = new WeakMap<object, number>();

/**
 * A per-domain tracking scope. Owns the snapshot registry, baseline cutoff, and
 * tombstone bookkeeping — i.e. all the state that a single sync domain (a game
 * room, a tenant, a parallel test) needs to keep isolated from any other
 * domain. Mirrors C#'s `Tracker`.
 *
 * Use {@link Tracker.default} for single-domain apps. Construct your own and
 * pass it to {@link track} / {@link SyncSession} when you need isolation —
 * without it, one domain holding an old snapshot would pin every other
 * domain's tombstones in memory until that snapshot is GC'd.
 *
 * The version clock itself is process-global (see {@link currentVersion}) so
 * dirty stamps are universally comparable; only the bookkeeping is partitioned.
 */
export class Tracker {
  /** Process-wide default tracker. Used when no explicit tracker is passed. */
  static readonly default = new Tracker();

  /** @internal */
  readonly snapshotRefs = new Set<WeakRef<object>>();
  /** @internal */
  readonly snapshotFinalizer = new FinalizationRegistry<WeakRef<object>>((ref) => {
    this.snapshotRefs.delete(ref);
  });
  /**
   * Cached lower bound on the oldest surviving snapshot version. Registrations
   * only lower it; periodic rebuilds raise it (entries whose snapshot was GC'd
   * disappear from `snapshotRefs`, so the rebuild picks up the new floor).
   * Between rebuilds, the cache is a safe lower bound — never prunes tombstones
   * too aggressively, only retains them slightly longer than strictly necessary.
   * @internal
   */
  oldestVersionCached = Infinity;
  /** @internal */
  encodesSinceRebuild = 0;
  /**
   * Live tombstone count for this tracker. {@link pruneDeleted} short-circuits
   * when this is zero — the common case for idle ticks and pure-value
   * workloads.
   * @internal
   */
  liveTombstones = 0;
  /**
   * Tracked maps that currently hold ≥1 tombstone in this tracker's domain.
   * Registered lazily the first time a map produces a tombstone; entries are
   * dropped when the map empties or is GC'd.
   * @internal
   */
  readonly tombstoneBearers = new Set<WeakRef<Map<unknown, unknown>>>();

  /** @internal */
  registerSnapshotInternal(snapshot: object): void {
    const version = currentVersion();
    snapshotVersions.set(snapshot, version);
    const ref = new WeakRef(snapshot);
    this.snapshotRefs.add(ref);
    this.snapshotFinalizer.register(snapshot, ref);
    if (this.oldestVersionCached > version) this.oldestVersionCached = version;
    this.pruneDeleted();
  }

  /** @internal */
  pruneDeleted(): void {
    if (this.liveTombstones === 0) return;
    if (++this.encodesSinceRebuild >= REBUILD_INTERVAL) {
      this.encodesSinceRebuild = 0;
      this.rebuildOldestVersion();
    }
    const cutoff = this.oldestVersionCached;
    for (const ref of this.tombstoneBearers) {
      const map = ref.deref();
      if (map == null) {
        this.tombstoneBearers.delete(ref);
        continue;
      }
      const deleted = (map as any)[DELETED] as Map<unknown, number> | undefined;
      if (deleted == null || deleted.size === 0) {
        this.tombstoneBearers.delete(ref);
        continue;
      }
      for (const [key, version] of deleted) {
        if (version < cutoff) {
          deleted.delete(key);
          this.liveTombstones--;
        }
      }
      if (deleted.size === 0) this.tombstoneBearers.delete(ref);
    }
  }

  private rebuildOldestVersion(): void {
    let newMin = Infinity;
    for (const ref of this.snapshotRefs) {
      const snap = ref.deref();
      if (snap == null) {
        this.snapshotRefs.delete(ref);
      } else {
        const v = snapshotVersions.get(snap);
        if (v != null && v < newMin) newMin = v;
      }
    }
    this.oldestVersionCached = newMin;
  }
}

/**
 * Stamp `snapshot` as a baseline against a tracked `source`. Records the
 * current global version against `snapshot`, then prunes deleted-key
 * tombstones on `source`'s tracker that are older than its oldest surviving
 * snapshot.
 *
 * This is what gives `encodeDiff(snapshot, source)` its version-based filter:
 * only mutations with a version greater than the registered version are
 * included. The tracker is looked up via `source` so every snapshot lands in
 * the right per-domain bookkeeping. No-op when `source` is not tracked (plain
 * objects fall through to the value-comparison path automatically).
 *
 * {@link SyncSession} calls this for you after each encode. Call it directly
 * only when using the raw `encodeDiff` API with a tracked source.
 */
export function registerSnapshot(snapshot: object, source: object): void {
  if (getFieldVersions(source) == null) return;
  const tracker = getTracker(source);
  if (tracker == null) return;
  tracker.registerSnapshotInternal(snapshot);
}

/**
 * Get the snapshot version of an object (set by {@link registerSnapshot}, or `undefined`
 * if the object hasn't been stamped as a snapshot of a tracked source).
 * @internal
 */
export function getSnapshotVersion(obj: unknown): number | undefined {
  if (obj == null || typeof obj !== "object") return undefined;
  return snapshotVersions.get(obj as object);
}

/** Get the {@link Tracker} a tracked container belongs to, or `undefined`. @internal */
function getTracker(obj: unknown): Tracker | undefined {
  if (obj == null || typeof obj !== "object") return undefined;
  return (obj as any)[TRACKER];
}

// ============ Internal Accessors for Encoder ============

/**
 * Get the underlying object/array for a tracked proxy.
 * This bypasses proxy overhead for read-only access during encoding.
 * @internal
 */
export function getUnderlying<T extends object>(obj: T): T {
  return (obj as any)[UNDERLYING] ?? obj;
}

/**
 * Get the dirty version map for a tracked object (Map<key, version>).
 * @internal Used by encoder for optimization
 */
export function getFieldVersions(obj: unknown): Map<string | number, number> | undefined {
  if (obj == null || typeof obj !== "object") return undefined;
  return (obj as any)[DIRTY];
}

/**
 * Get the created version map for a tracked map (Map<K, version>).
 * @internal Used by encoder for optimization
 */
export function getCreatedVersions<K>(obj: Map<K, unknown>): Map<K, number> | undefined {
  return (obj as any)[CREATED];
}

/**
 * Get the deleted version map for a tracked map (Map<K, version>).
 * @internal Used by encoder for optimization
 */
export function getDeletedVersions<K>(obj: Map<K, unknown>): Map<K, number> | undefined {
  return (obj as any)[DELETED];
}

// ============ Type Definitions ============

/** Tracked Map with modified set() to accept plain values */
type TrackedMap<K, V> = Omit<Map<K, Tracked<V>>, "set" | "get"> & {
  set(key: K, value: V): TrackedMap<K, V>;
  get(key: K): Tracked<V> | undefined;
};

/** Recursively track an object and its nested containers (type is unchanged) */
export type Tracked<T> =
  // Functions/methods pass through unchanged — without this, the mapped type
  // below would strip a function's call signature.
  T extends (...args: never[]) => unknown
    ? T
    : T extends Map<infer K, infer V>
      ? TrackedMap<K, V>
      : T extends Array<infer U>
        ? Array<Tracked<U>>
        : T extends object
          ? { [P in keyof T]: Tracked<T[P]> }
          : T;

// ============ Public API ============

/**
 * Wraps an object with deep tracking. Property changes are automatically
 * tracked at each level with version numbers, enabling efficient diffs
 * from arbitrary baseline snapshots.
 *
 * Note: The tracking system requires a tree structure — every tracked node
 * carries a single parent pointer. Attempting to attach the same node to a
 * second slot throws (mirrors the C# `TrackingEmitter` aliasing guard).
 * Detach first by reassigning the prior slot to a different value, or by
 * removing the node from its container, then reattach.
 *
 * @example
 * ```typescript
 * const state = track({
 *   tick: 0,
 *   player: { x: 0, y: 0 },
 *   players: new Map([["p1", { x: 0, y: 0 }]]),
 * });
 *
 * state.tick = 1;                  // Records version for "tick"
 * state.player.x = 100;            // Records version for "x", propagates to parent
 *
 * // Take a snapshot. `clone` is a pure deep copy; `registerSnapshot` stamps it
 * // with the current version so `encodeDiff` can filter to mutations after
 * // this point. (SyncSession does both steps automatically.)
 * const snapshot1 = api.clone(state);
 * registerSnapshot(snapshot1, state);
 *
 * state.tick = 2;
 * const diff = api.encodeDiff(snapshot1, state);  // Only includes changes since snapshot1
 * ```
 */
export function track<T extends object>(obj: T, tracker: Tracker = Tracker.default): Tracked<T> {
  return attach(deepClone(obj), undefined, undefined, tracker) as Tracked<T>;
}

// ============ Internal Implementation ============

/** Fallback handler for unknown properties - binds methods to target */
function getFallback<T extends object>(target: T, prop: string | symbol): unknown {
  const value = (target as Record<string | symbol, unknown>)[prop];
  return typeof value === "function" ? value.bind(target) : value;
}

/**
 * Compare a stored value to an incoming write, treating tracked-proxy /
 * underlying pairs as the same value. Without the unwrap, common patterns
 * (`arr[i] = arr[i]`, `map.set(k, map.get(k))`) and the asymmetric storage
 * between `trackObject` (raw in target) and `trackArray`/`trackMap` (proxy in
 * target) produce spurious dirty bumps on no-op writes.
 */
function valuesEqual(stored: unknown, incoming: unknown): boolean {
  if (stored === incoming) return true;
  if (stored == null || incoming == null) return false;
  if (typeof stored !== "object" || typeof incoming !== "object") return false;
  return getUnderlying(stored as object) === getUnderlying(incoming as object);
}

/** Propagate dirty marking up to parent containers */
function propagateToParent(child: object, version: number): void {
  let current: object = child;
  while (true) {
    const parent: object | undefined = (current as any)[PARENT];
    const key = (current as any)[PARENT_KEY];
    if (parent == null || key == null) return;
    const parentDirty = getFieldVersions(parent);
    if (!parentDirty) return;
    const existing = parentDirty.get(key);
    // Existing entry already at or above this version — anything further up
    // the chain has also seen it, so the walk can stop here.
    if (existing != null && version <= existing) return;
    parentDirty.set(key, version);
    current = parent;
  }
}

/**
 * Set or update parent metadata on a tracked object. PARENT/PARENT_KEY slots
 * are pre-defined as `undefined` at track-init by `defineMetaSlots`, so this is
 * just a direct assignment — no defineProperty mode-switch needed.
 */
function setParentMeta(target: object, parent: object | undefined, parentKey: string | number | undefined): void {
  if (parent == null || parentKey == null) return;
  (target as any)[PARENT] = parent;
  (target as any)[PARENT_KEY] = parentKey;
}

/**
 * Define non-enumerable PARENT/PARENT_KEY slots on a freshly tracked container.
 * Called once per `trackObject`/`trackArray`/`trackMap` so subsequent attach
 * and detach calls can use plain assignment.
 */
function defineMetaSlots(target: object, tracker: Tracker): void {
  Object.defineProperty(target, PARENT, { value: undefined, writable: true });
  Object.defineProperty(target, PARENT_KEY, { value: undefined, writable: true });
  Object.defineProperty(target, TRACKER, { value: tracker, writable: true });
}

/**
 * Clear `child`'s PARENT/PARENT_KEY pointers iff its current parent is still
 * `expectedParent`. The parent-match guard mirrors the C# `ReferenceEquals(c.Parent, this)`
 * check in `DPList.cs` — without it, detaching a child that has already been
 * re-parented would silently break dirty propagation through the new parent.
 */
function detachChild(child: unknown, expectedParent: object): void {
  if (child == null || typeof child !== "object") return;
  const underlying = getUnderlying(child);
  if ((underlying as any)[PARENT] !== expectedParent) return;
  (underlying as any)[PARENT] = undefined;
  (underlying as any)[PARENT_KEY] = undefined;
}

/**
 * Mint a fresh version, record `key → version` on the dirty/created/deleted
 * tracking map of choice, and walk the parent chain. The triplet was repeated
 * verbatim at every single-key mutation site; pulling it into one helper keeps
 * the order-of-operations consistent and makes call sites read as one
 * statement instead of three.
 */
function bumpAndPropagate(container: object, map: Map<unknown, number>, key: unknown): number {
  const version = nextVersion();
  map.set(key, version);
  propagateToParent(container, version);
  return version;
}

/**
 * Range version of `bumpAndPropagate` for array mutations that touch multiple
 * indices (push, shift, splice, sort, reverse, fill, copyWithin). Mints one
 * version, dirties the half-open range, and propagates once.
 */
function bumpRange(container: object, dirty: Map<number, number>, start: number, end: number): void {
  if (start >= end) return;
  const version = nextVersion();
  for (let i = start; i < end; i++) dirty.set(i, version);
  propagateToParent(container, version);
}

/**
 * Refresh PARENT_KEY on tracked array children whose positions shifted (after
 * shift, unshift, splice non-equal-replace, sort, reverse, copyWithin).
 */
function reparentArrayChildren(items: unknown[], start: number, end: number): void {
  for (let i = start; i < end; i++) {
    const elem = items[i];
    if (elem != null && typeof elem === "object") {
      // Bypass the proxy's set trap (which ignores symbol writes).
      const underlying = getUnderlying(elem as object);
      (underlying as any)[PARENT_KEY] = i;
    }
  }
}

/** Normalize array index (handles negative indices) */
function normalizeIndex(idx: number, len: number): number {
  return idx < 0 ? Math.max(len + idx, 0) : Math.min(idx, len);
}

/**
 * Recursively wrap `obj` (and its children) with tracking, attaching it as
 * `parent`'s child under `parentKey`. Pairs with `detachChild` for ownership
 * transfer at the mutation sites. Returns the input untouched for primitives,
 * or the existing tracked proxy if `obj` is already wrapped.
 */
function attach<T>(obj: T, parent: object | undefined, parentKey: string | number | undefined, tracker: Tracker): T {
  if (obj == null || typeof obj !== "object") {
    return obj;
  }

  // Fast-path: if already tracked, just update parent metadata. If grafting
  // into a tree under a different tracker, adopt the new tracker — same
  // policy as C#'s `TrackingOps.Reparent`. This keeps a subtree in exactly
  // one tracker even when moved across domains.
  const underlying = getUnderlying(obj as object);
  if (getFieldVersions(underlying) != null) {
    // Aliasing guard: a tracked node carries exactly one parent pointer, so
    // attaching it to a second slot would silently let the new slot steal
    // ownership — mutations through the held alias would propagate to the
    // wrong key and diverge on the receiver. Mirrors C#'s
    // `TrackingEmitter`-emitted check (csharp/src/.../TrackingEmitter.cs:162).
    // Detach (assigning the prior slot to a different value, or removing it
    // from its container) before reattaching.
    if (parent != null) {
      const currentParent = (underlying as any)[PARENT];
      if (currentParent != null && (currentParent !== parent || (underlying as any)[PARENT_KEY] !== parentKey)) {
        throw new Error(
          "Cannot attach a tracked node that is already attached to another parent or slot — " +
            "aliasing is not supported. Detach it from its current owner first " +
            "(reassign the prior slot to a different value, or remove it from its container). " +
            `(current key: ${String((underlying as any)[PARENT_KEY])}, new key: ${String(parentKey)})`
        );
      }
    }
    setParentMeta(underlying, parent, parentKey);
    if ((underlying as any)[TRACKER] !== tracker) {
      adoptTracker(underlying, tracker);
    }
    return obj;
  }

  if (obj instanceof Map) {
    return trackMap(obj as Map<unknown, unknown>, parent, parentKey, tracker) as T;
  }

  if (Array.isArray(obj)) {
    return trackArray(obj, parent, parentKey, tracker) as T;
  }

  return trackObject(obj as Record<string, unknown>, parent, parentKey, tracker) as T;
}

/**
 * Reparent an already-tracked subtree under a different tracker. Walks the
 * tree to update every container's TRACKER slot. Mirrors C#'s tracker
 * adoption on `Reparent` — without it, mutations through the moved subtree
 * would land in the old tracker's bookkeeping while snapshots from the new
 * tracker would miss them.
 */
function adoptTracker(target: object, tracker: Tracker): void {
  (target as any)[TRACKER] = tracker;
  // Walk children. For objects/arrays, recurse into each entry; for maps,
  // each value. Skip primitives.
  if (target instanceof Map) {
    for (const value of target.values()) {
      if (value != null && typeof value === "object") {
        const u = getUnderlying(value as object);
        if (getFieldVersions(u) != null) adoptTracker(u, tracker);
      }
    }
  } else if (Array.isArray(target)) {
    for (const value of target) {
      if (value != null && typeof value === "object") {
        const u = getUnderlying(value as object);
        if (getFieldVersions(u) != null) adoptTracker(u, tracker);
      }
    }
  } else {
    for (const key of Object.keys(target)) {
      const value = (target as Record<string, unknown>)[key];
      if (value != null && typeof value === "object") {
        const u = getUnderlying(value as object);
        if (getFieldVersions(u) != null) adoptTracker(u, tracker);
      }
    }
  }
}

function trackObject<T extends Record<string, unknown>>(
  obj: T,
  parent: object | undefined,
  parentKey: string | number | undefined,
  tracker: Tracker
): Tracked<T> {
  const dirty = new Map<string, number>();
  Object.defineProperty(obj, DIRTY, { value: dirty, writable: true });
  defineMetaSlots(obj, tracker);
  setParentMeta(obj, parent, parentKey);

  // Replace each child value with its tracked version in-place. Storing the
  // proxy directly in `obj` mirrors `trackArray`/`trackMap` and avoids the
  // parallel side-map; encoders unwrap via `getUnderlying` at each level so
  // the extra proxy hop is bounded.
  const record = obj as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    record[key] = attach(record[key], obj, key, tracker);
  }

  return new Proxy(obj, {
    set(target, prop, value) {
      if (typeof prop === "symbol") {
        // Symbol-keyed writes bypass dirty tracking (dirty is keyed by string)
        // but must still hit the target — silently dropping symbol writes
        // breaks well-known symbols and user metadata.
        (target as Record<string | symbol, unknown>)[prop] = value;
        return true;
      }
      const key = prop as string;
      // Skip the bump only when the property already exists with the same
      // logical value — first-time `obj.foo = undefined` should still mark
      // the field dirty even though `target[key]` reads as `undefined`.
      if (key in target && valuesEqual(target[key], value)) return true;
      bumpAndPropagate(obj, dirty, key);
      // Detach the OLD child before swapping in the new one — otherwise a
      // later mutation through a held reference to the old child still
      // marks this object dirty for `key`.
      detachChild(target[key], obj);
      (target as Record<string, unknown>)[key] = attach(value, obj, key, tracker);
      return true;
    },
    get(target, prop) {
      if (prop === UNDERLYING) return target;
      return (target as any)[prop];
    },
    deleteProperty(target, prop) {
      if (typeof prop === "symbol") {
        return delete (target as any)[prop];
      }
      const key = prop as string;
      if (key in target) {
        bumpAndPropagate(obj, dirty, key);
        detachChild(target[key], obj);
      }
      return delete (target as Record<string, unknown>)[key];
    },
  }) as Tracked<T>;
}

function trackArray<T>(
  arr: T[],
  parent: object | undefined,
  parentKey: string | number | undefined,
  tracker: Tracker
): Tracked<T[]> {
  const dirty = new Map<number, number>();
  const trackedItems: T[] = [];
  Object.defineProperty(trackedItems, DIRTY, { value: dirty, writable: true });
  defineMetaSlots(trackedItems, tracker);
  setParentMeta(trackedItems, parent, parentKey);

  // Track initial items
  for (let i = 0; i < arr.length; i++) {
    trackedItems.push(attach(arr[i], trackedItems, i, tracker) as T);
  }

  const proxy = new Proxy(trackedItems, {
    set(target, prop, value) {
      if (typeof prop === "symbol") {
        // Forward symbol-keyed writes to the target without tracking them
        // (the dirty Map keys numeric indices); silently dropping the write
        // would break any symbol-using code attached to the array.
        (target as unknown as Record<string | symbol, unknown>)[prop] = value;
        return true;
      }
      if (prop === "length") {
        const oldLength = target.length;
        const newLength = value as number;
        // Detach any items that fall off the end of the truncated array.
        for (let i = newLength; i < oldLength; i++) {
          detachChild(target[i], trackedItems);
        }
        (target as unknown as { length: number }).length = newLength;
        if (target.length !== oldLength) {
          bumpRange(trackedItems, dirty, Math.min(oldLength, target.length), Math.max(oldLength, target.length));
        }
        return true;
      }
      const index = Number(prop);
      if (!isNaN(index)) {
        // True no-op: same logical value AND no length change. Sparse
        // extensions (`arr[5] = undefined` past current length) still bump
        // because the length grew, even though the value matched the hole.
        if (index < target.length && valuesEqual(target[index], value)) {
          return true;
        }
        bumpAndPropagate(trackedItems, dirty, index);
        // Detach the previous occupant before installing the new one.
        if (index < target.length) detachChild(target[index], trackedItems);
        target[index] = attach(value, trackedItems, index, tracker) as T;
        return true;
      }
      (target as unknown as Record<string, unknown>)[prop] = value;
      return true;
    },
    get(target, prop) {
      if (prop === UNDERLYING) return target;
      if (typeof prop === "symbol") {
        return (target as any)[prop];
      }
      if (prop === "push") {
        return (...items: T[]) => {
          const startIndex = target.length;
          for (let i = 0; i < items.length; i++) {
            target.push(attach(items[i], trackedItems, startIndex + i, tracker) as T);
          }
          bumpRange(trackedItems, dirty, startIndex, target.length);
          return target.length;
        };
      }
      if (prop === "pop") {
        return () => {
          if (target.length > 0) {
            bumpAndPropagate(trackedItems, dirty, target.length - 1);
            detachChild(target[target.length - 1], trackedItems);
          }
          return target.pop();
        };
      }
      if (prop === "shift") {
        return () => {
          if (target.length > 0) {
            bumpRange(trackedItems, dirty, 0, target.length);
            detachChild(target[0], trackedItems);
            const result = target.shift();
            reparentArrayChildren(trackedItems, 0, target.length);
            return result;
          }
          return target.shift();
        };
      }
      if (prop === "unshift") {
        return (...items: T[]) => {
          if (items.length === 0) {
            return target.length;
          }
          bumpRange(trackedItems, dirty, 0, target.length + items.length);
          const result = target.unshift(...items.map((item, i) => attach(item, trackedItems, i, tracker) as T));
          reparentArrayChildren(trackedItems, items.length, target.length);
          return result;
        };
      }
      if (prop === "splice") {
        return (start: number, deleteCount?: number, ...items: T[]) => {
          const len = target.length;
          const actualStart = normalizeIndex(start, len);
          // Clamp to [0, len-actualStart] to match native splice's handling of
          // negative or oversized deleteCount; otherwise a negative count would
          // dirty-bump the tail without removing anything.
          const actualDeleteCount =
            deleteCount == null ? len - actualStart : Math.max(0, Math.min(deleteCount, len - actualStart));
          if (actualDeleteCount > 0 || items.length > 0) {
            bumpRange(trackedItems, dirty, actualStart, Math.max(len, actualStart + items.length));
          }
          // Detach the slice we're about to remove before mutating `target`.
          for (let i = actualStart; i < actualStart + actualDeleteCount; i++) {
            detachChild(target[i], trackedItems);
          }
          const result = target.splice(
            actualStart,
            actualDeleteCount,
            ...items.map((item, i) => attach(item, trackedItems, actualStart + i, tracker) as T)
          );
          if (actualDeleteCount !== items.length) {
            reparentArrayChildren(trackedItems, actualStart + items.length, target.length);
          }
          return result;
        };
      }
      if (prop === "sort") {
        return (compareFn?: (a: T, b: T) => number) => {
          target.sort(compareFn);
          bumpRange(trackedItems, dirty, 0, target.length);
          reparentArrayChildren(trackedItems, 0, target.length);
          return proxy;
        };
      }
      if (prop === "reverse") {
        return () => {
          target.reverse();
          bumpRange(trackedItems, dirty, 0, target.length);
          reparentArrayChildren(trackedItems, 0, target.length);
          return proxy;
        };
      }
      if (prop === "fill") {
        return (value: T, start?: number, end?: number) => {
          // Filling with an object would attach the same reference at every
          // index; PARENT_KEY can only hold one number, so dirty propagation
          // would silently work for one slot and break for the rest. Reject
          // up front rather than ship a partially-broken array.
          if (value != null && typeof value === "object") {
            throw new Error(
              "Tracked array .fill() with an object value is not supported (would create shared references). " +
                "Use a loop with distinct values per index instead."
            );
          }
          const len = target.length;
          const actualStart = start == null ? 0 : normalizeIndex(start, len);
          const actualEnd = end == null ? len : normalizeIndex(end, len);
          for (let i = actualStart; i < actualEnd; i++) {
            detachChild(target[i], trackedItems);
            target[i] = attach(value, trackedItems, i, tracker) as T;
          }
          bumpRange(trackedItems, dirty, actualStart, actualEnd);
          return proxy;
        };
      }
      if (prop === "copyWithin") {
        return (targetIndex: number, start: number, end?: number) => {
          const len = target.length;
          const to = normalizeIndex(targetIndex, len);
          const from = normalizeIndex(start, len);
          const final = end == null ? len : normalizeIndex(end, len);
          const count = Math.min(final - from, len - to);
          if (count > 0) {
            // Snapshot source slice before we start overwriting, otherwise
            // overlapping ranges (e.g. `copyWithin(2, 0, 3)` on len 4) would
            // read already-clobbered slots.
            const copied = target.slice(from, from + count);
            // Items at the source range stay in place — only items that are
            // ONLY at destination (i.e. not also still referenced via source)
            // need detaching. Build the keep set from source positions.
            const keep = new Set<unknown>();
            for (let i = 0; i < count; i++) keep.add(copied[i]);
            for (let i = 0; i < count; i++) {
              const old = target[to + i];
              if (!keep.has(old)) detachChild(old, trackedItems);
              target[to + i] = copied[i]!;
            }
            bumpRange(trackedItems, dirty, to, to + count);
            reparentArrayChildren(trackedItems, to, to + count);
          }
          return proxy;
        };
      }
      return getFallback(target, prop);
    },
  }) as Tracked<T[]>;

  return proxy;
}

function trackMap<K, V>(
  map: Map<K, V>,
  parent: object | undefined,
  parentKey: string | number | undefined,
  tracker: Tracker
): Tracked<Map<K, V>> {
  const dirty = new Map<K, number>();
  const created = new Map<K, number>();
  const deleted = new Map<K, number>();
  const trackedValues = new Map<K, V>();

  Object.defineProperty(trackedValues, DIRTY, { value: dirty, writable: true });
  Object.defineProperty(trackedValues, CREATED, { value: created, writable: true });
  Object.defineProperty(trackedValues, DELETED, { value: deleted, writable: true });
  defineMetaSlots(trackedValues, tracker);
  setParentMeta(trackedValues, parent, parentKey);

  for (const [key, value] of map) {
    trackedValues.set(key, attach(value, trackedValues, key as string | number, tracker) as V);
  }

  const proxy = new Proxy(trackedValues, {
    get(target, prop) {
      if (prop === UNDERLYING) return target;
      if (typeof prop === "symbol") {
        return getFallback(target, prop);
      }
      // Resolve the live tracker on every mutation: an `adoptTracker` walk
      // could have re-bound this container to a different domain since
      // construction. Reading the symbol slot directly is one property hop;
      // capturing the original `tracker` arg in the closure would silently
      // route bookkeeping to the wrong domain after a cross-tracker move.
      const t = (target as any)[TRACKER] as Tracker;
      if (prop === "set") {
        return (key: K, value: V) => {
          if (target.has(key)) {
            const existing = target.get(key);
            if (valuesEqual(existing, value)) return proxy;
            // Update existing key — fits the bumpAndPropagate pattern.
            detachChild(existing, trackedValues);
            bumpAndPropagate(trackedValues, dirty, key);
          } else {
            // New key. Revival of a previously-deleted key needs marks in BOTH
            // `created` and `dirty` because the encoder filters split on a/b
            // membership, not version source — bumpAndPropagate's single-map
            // contract doesn't fit, so the bookkeeping stays inline.
            const version = nextVersion();
            created.set(key, version);
            if (deleted.has(key)) dirty.set(key, version);
            propagateToParent(trackedValues, version);
          }
          if (deleted.delete(key)) t.liveTombstones--;
          target.set(key, attach(value, trackedValues, key as string | number, t) as V);
          return proxy;
        };
      }
      if (prop === "delete") {
        return (key: K) => {
          if (target.has(key)) {
            // Cross-bucket move (dirty/created → deleted) plus tombstone counter
            // upkeep — keep inline for the same reason as the revival branch.
            const version = nextVersion();
            const wasEmpty = deleted.size === 0;
            deleted.set(key, version);
            t.liveTombstones++;
            if (wasEmpty) t.tombstoneBearers.add(new WeakRef(target as Map<unknown, unknown>));
            dirty.delete(key);
            created.delete(key);
            propagateToParent(trackedValues, version);
            detachChild(target.get(key), trackedValues);
          }
          return target.delete(key);
        };
      }
      if (prop === "clear") {
        return () => {
          const sizeBefore = target.size;
          if (sizeBefore === 0) return target.clear();
          const version = nextVersion();
          const wasEmpty = deleted.size === 0;
          for (const [key, val] of target) {
            deleted.set(key, version);
            dirty.delete(key);
            created.delete(key);
            detachChild(val, trackedValues);
          }
          t.liveTombstones += sizeBefore;
          if (wasEmpty) t.tombstoneBearers.add(new WeakRef(target as Map<unknown, unknown>));
          propagateToParent(trackedValues, version);
          return target.clear();
        };
      }
      return getFallback(target, prop);
    },
  }) as Tracked<Map<K, V>>;

  return proxy;
}

/**
 * Deep clone an object, preserving Maps, Arrays, and class prototypes. Matches
 * `interpreter.ts`'s clone strategy so `track(new MyClass())` keeps methods,
 * accessors, and `instanceof` working through the tracked proxy.
 */
function deepClone<T>(obj: T): T {
  if (obj == null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Map) {
    const result = new Map();
    for (const [key, value] of obj) {
      result.set(key, deepClone(value));
    }
    return result as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }

  const result: Record<string, unknown> = Object.create(Object.getPrototypeOf(obj));
  for (const key of Object.keys(obj)) {
    result[key] = deepClone((obj as Record<string, unknown>)[key]);
  }
  return result as T;
}
