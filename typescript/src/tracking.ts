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

/**
 * WeakRef registry for snapshot auto-pruning. The FinalizationRegistry below
 * removes the entry when its target is GC'd — without it, every encode adds a
 * new WeakRef and stale refs only get cleaned up the next time
 * `pruneDeletedEntries` runs (which is gated on `liveTombstones > 0`). Long
 * idle/mutation runs would silently bloat this Set and pay for the iteration
 * later when a tombstone-producing workload starts.
 */
const snapshotRefs = new Set<WeakRef<object>>();
const snapshotFinalizer = new FinalizationRegistry<WeakRef<object>>((ref) => {
  snapshotRefs.delete(ref);
});

/**
 * Cached lower bound on the oldest surviving snapshot version. Mirrors C#'s
 * `_oldestVersionCached`: registrations only lower it; periodic rebuilds raise
 * it (entries whose snapshot was GC'd disappear from `snapshotRefs`, so the
 * rebuild picks up the new floor). Between rebuilds, the cache is a safe lower
 * bound — never prunes tombstones too aggressively, only retains them slightly
 * longer than strictly necessary.
 */
let oldestVersionCached = Infinity;
let encodesSinceRebuild = 0;
const REBUILD_INTERVAL = 1024;

/**
 * Per-snapshot baseline version. Keyed by the snapshot ROOT only — nested nodes
 * are not stamped. Encoders thread this value down via `DiffEncoder.minVersion`,
 * matching the C# implementation's `Tracker.GetBaselineFor`. This avoids the
 * O(tree size) `Object.defineProperty` walk that the previous per-node stamping
 * scheme paid on every encode.
 */
const snapshotVersions = new WeakMap<object, number>();

/**
 * Live tombstone counter (sum of entries across every tracked map's DELETED
 * map in the process). `pruneDeletedEntries` short-circuits when this is zero,
 * which is the common case for idle ticks and pure-value-mutation workloads.
 */
let liveTombstones = 0;

/**
 * Stamp `snapshot` as a baseline against a tracked `source`. Records the
 * current global version against `snapshot` in a WeakMap (root-keyed), then
 * prunes deleted-key tombstones on `source` that are older than the oldest
 * surviving snapshot.
 *
 * This is what gives `encodeDiff(snapshot, source)` its version-based filter:
 * only mutations with a version greater than the registered version are
 * included. No-op when `source` is not tracked (plain objects fall through to
 * the value-comparison path automatically).
 *
 * {@link SyncSession} calls this for you after each encode. Call it directly
 * only when using the raw `encodeDiff` API with a tracked source.
 */
export function registerSnapshot(snapshot: object, source: object): void {
  if (!isTracked(source)) return;

  const version = currentVersion();
  snapshotVersions.set(snapshot, version);
  const ref = new WeakRef(snapshot);
  snapshotRefs.add(ref);
  snapshotFinalizer.register(snapshot, ref);
  // Registrations only ever lower the cached floor — never raise it. Rebuilds
  // (below) are what raise it back up after old snapshots are GC'd.
  if (oldestVersionCached > version) oldestVersionCached = version;

  pruneDeletedEntries();
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

/** Check if an object is tracked (has dirty version map) */
function isTracked(obj: object): boolean {
  return (obj as any)[DIRTY] != null;
}

/**
 * Tracked maps that currently hold ≥1 tombstone, registered the first time they
 * produce one. Mirrors C#'s `_tombstoneBearers` set: prune iterates this set
 * directly instead of walking the source tree, and entries are removed when
 * their map drops back to zero tombstones (or is GC'd).
 */
const tombstoneBearers = new Set<WeakRef<Map<unknown, unknown>>>();

/** Prune deleted map entries that are older than the oldest surviving snapshot */
function pruneDeletedEntries(): void {
  // Fast path: no tombstones live anywhere. Idle ticks and pure-value
  // mutations fall through here with one variable read.
  if (liveTombstones === 0) return;

  // Periodically rebuild the cached floor — registrations only lower it, so
  // when old snapshots get GC'd we'd retain tombstones unnecessarily until the
  // next rebuild raises the floor back up.
  if (++encodesSinceRebuild >= REBUILD_INTERVAL) {
    encodesSinceRebuild = 0;
    rebuildOldestVersion();
  }

  const cutoff = oldestVersionCached;

  // Walk only the tracked maps that hold tombstones. Containers that drop to
  // zero tombstones (or have been GC'd) are removed from the set as we go.
  for (const ref of tombstoneBearers) {
    const map = ref.deref();
    if (map == null) {
      tombstoneBearers.delete(ref);
      continue;
    }
    const deleted = (map as any)[DELETED] as Map<unknown, number> | undefined;
    if (deleted == null || deleted.size === 0) {
      tombstoneBearers.delete(ref);
      continue;
    }
    for (const [key, version] of deleted) {
      if (version < cutoff) {
        deleted.delete(key);
        liveTombstones--;
      }
    }
    if (deleted.size === 0) tombstoneBearers.delete(ref);
  }
}

function rebuildOldestVersion(): void {
  let newMin = Infinity;
  for (const ref of snapshotRefs) {
    const snap = ref.deref();
    if (snap == null) {
      snapshotRefs.delete(ref);
    } else {
      const v = snapshotVersions.get(snap);
      if (v != null && v < newMin) newMin = v;
    }
  }
  oldestVersionCached = newMin;
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
  return (obj as any)?.[CREATED];
}

/**
 * Get the deleted version map for a tracked map (Map<K, version>).
 * @internal Used by encoder for optimization
 */
export function getDeletedVersions<K>(obj: Map<K, unknown>): Map<K, number> | undefined {
  return (obj as any)?.[DELETED];
}

// ============ Type Definitions ============

/** Tracked Map with modified set() to accept plain values */
type TrackedMap<K, V> = Omit<Map<K, Tracked<V>>, "set" | "get"> & {
  set(key: K, value: V): TrackedMap<K, V>;
  get(key: K): Tracked<V> | undefined;
};

/** Recursively track an object and its nested containers (type is unchanged) */
export type Tracked<T> =
  T extends Map<infer K, infer V>
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
 * Note: The tracking system assumes a tree structure. If the same object
 * is stored in multiple locations (shared references), dirty propagation
 * will only work for the most recent parent assignment.
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
export function track<T extends object>(obj: T): Tracked<T> {
  return trackRecursive(deepClone(obj)) as Tracked<T>;
}

// ============ Internal Implementation ============

/** Fallback handler for unknown properties - binds methods to target */
function getFallback<T extends object>(target: T, prop: string | symbol): unknown {
  const value = (target as Record<string | symbol, unknown>)[prop];
  return typeof value === "function" ? value.bind(target) : value;
}

/** Propagate dirty marking up to parent containers */
function propagateToParent(child: object, version: number): void {
  const parent = (child as any)[PARENT];
  const key = (child as any)[PARENT_KEY];
  if (parent != null && key != null) {
    const parentDirty = getFieldVersions(parent);
    if (parentDirty) {
      const existingVersion = parentDirty.get(key);
      if (existingVersion == null || version > existingVersion) {
        parentDirty.set(key, version);
        propagateToParent(parent, version);
      }
    }
  }
}

/** Set or update parent metadata on a tracked object (only runs on init/reparenting, not hot-path) */
function setParentMeta(target: object, parent: object | undefined, parentKey: string | number | undefined): void {
  if (parent == null || parentKey == null) return;
  // Check if already defined (reparenting case)
  if ((target as any)[PARENT] !== undefined) {
    (target as any)[PARENT] = parent;
    (target as any)[PARENT_KEY] = parentKey;
  } else {
    // Initial definition
    Object.defineProperty(target, PARENT, { value: parent, writable: true });
    Object.defineProperty(target, PARENT_KEY, { value: parentKey, writable: true });
  }
}

/** Normalize array index (handles negative indices) */
function normalizeIndex(idx: number, len: number): number {
  return idx < 0 ? Math.max(len + idx, 0) : Math.min(idx, len);
}

function trackRecursive<T>(obj: T, parent?: object, parentKey?: string | number): T {
  if (obj == null || typeof obj !== "object") {
    return obj;
  }

  // Fast-path: if already tracked, just update parent metadata
  const underlying = getUnderlying(obj as object);
  if (getFieldVersions(underlying) != null) {
    setParentMeta(underlying, parent, parentKey);
    return obj;
  }

  if (obj instanceof Map) {
    return trackMap(obj as Map<unknown, unknown>, parent, parentKey) as T;
  }

  if (Array.isArray(obj)) {
    return trackArray(obj, parent, parentKey) as T;
  }

  return trackObject(obj as Record<string, unknown>, parent, parentKey) as T;
}

function trackObject<T extends Record<string, unknown>>(
  obj: T,
  parent?: object,
  parentKey?: string | number
): Tracked<T> {
  const dirty = new Map<string, number>();
  Object.defineProperty(obj, DIRTY, { value: dirty, writable: true });
  setParentMeta(obj, parent, parentKey);

  // Recursively track all nested values
  const trackedChildren: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    trackedChildren[key] = trackRecursive(obj[key], obj, key);
  }

  const proxy = new Proxy(obj, {
    set(target, prop, value) {
      if (typeof prop === "symbol") {
        return true;
      }
      const key = prop as string;
      if (target[key] !== value) {
        const version = nextVersion();
        dirty.set(key, version);
        propagateToParent(obj, version);
        trackedChildren[key] = trackRecursive(value, obj, key);
      }
      (target as Record<string, unknown>)[key] = value;
      return true;
    },
    get(target, prop) {
      if (prop === UNDERLYING) return target;
      if (typeof prop === "symbol") {
        return (target as any)[prop];
      }
      const tracked = trackedChildren[prop];
      if (tracked != null) {
        return tracked;
      }
      return target[prop];
    },
    deleteProperty(target, prop) {
      if (typeof prop === "symbol") {
        return delete (target as any)[prop];
      }
      const key = prop as string;
      if (key in target) {
        const version = nextVersion();
        dirty.set(key, version);
        propagateToParent(obj, version);
        delete trackedChildren[key];
      }
      return delete (target as Record<string, unknown>)[key];
    },
  }) as Tracked<T>;

  return proxy;
}

function trackArray<T>(arr: T[], parent?: object, parentKey?: string | number): Tracked<T[]> {
  const dirty = new Map<number, number>();
  const trackedItems: T[] = [];
  Object.defineProperty(trackedItems, DIRTY, { value: dirty, writable: true });
  setParentMeta(trackedItems, parent, parentKey);

  // Track initial items
  for (let i = 0; i < arr.length; i++) {
    trackedItems.push(trackRecursive(arr[i], trackedItems, i) as T);
  }

  const markRangeDirty = (start: number, end: number) => {
    if (start >= end) return;
    const version = nextVersion();
    for (let i = start; i < end; i++) {
      dirty.set(i, version);
    }
    propagateToParent(trackedItems, version);
  };

  // Update PARENT_KEY on elements after reordering
  const updateParentKeys = (start: number, end: number) => {
    for (let i = start; i < end; i++) {
      const elem = trackedItems[i];
      if (elem != null && typeof elem === "object") {
        // Access underlying object to bypass proxy's symbol-ignoring set trap
        const underlying = getUnderlying(elem as object);
        (underlying as any)[PARENT_KEY] = i;
      }
    }
  };

  const proxy = new Proxy(trackedItems, {
    set(target, prop, value) {
      if (typeof prop === "symbol") {
        return true;
      }
      if (prop === "length") {
        const oldLength = target.length;
        (target as unknown as { length: number }).length = value as number;
        const newLength = target.length;
        if (newLength !== oldLength) {
          markRangeDirty(Math.min(oldLength, newLength), Math.max(oldLength, newLength));
        }
        return true;
      }
      const index = Number(prop);
      if (!isNaN(index)) {
        const version = nextVersion();
        dirty.set(index, version);
        propagateToParent(trackedItems, version);
        target[index] = trackRecursive(value, trackedItems, index) as T;
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
          const version = nextVersion();
          for (let i = 0; i < items.length; i++) {
            dirty.set(startIndex + i, version);
            target.push(trackRecursive(items[i], trackedItems, startIndex + i) as T);
          }
          propagateToParent(trackedItems, version);
          return target.length;
        };
      }
      if (prop === "pop") {
        return () => {
          if (target.length > 0) {
            const version = nextVersion();
            dirty.set(target.length - 1, version);
            propagateToParent(trackedItems, version);
          }
          return target.pop();
        };
      }
      if (prop === "shift") {
        return () => {
          if (target.length > 0) {
            markRangeDirty(0, target.length);
            const result = target.shift();
            updateParentKeys(0, target.length);
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
          markRangeDirty(0, target.length + items.length);
          const result = target.unshift(...items.map((item, i) => trackRecursive(item, trackedItems, i) as T));
          updateParentKeys(items.length, target.length);
          return result;
        };
      }
      if (prop === "splice") {
        return (start: number, deleteCount?: number, ...items: T[]) => {
          const len = target.length;
          const actualStart = normalizeIndex(start, len);
          const actualDeleteCount = deleteCount == null ? len - actualStart : Math.min(deleteCount, len - actualStart);
          if (actualDeleteCount > 0 || items.length > 0) {
            markRangeDirty(actualStart, Math.max(len, actualStart + items.length));
          }
          const result = target.splice(
            actualStart,
            actualDeleteCount,
            ...items.map((item, i) => trackRecursive(item, trackedItems, actualStart + i) as T)
          );
          if (actualDeleteCount !== items.length) {
            updateParentKeys(actualStart + items.length, target.length);
          }
          return result;
        };
      }
      if (prop === "sort") {
        return (compareFn?: (a: T, b: T) => number) => {
          target.sort(compareFn);
          markRangeDirty(0, target.length);
          updateParentKeys(0, target.length);
          return proxy;
        };
      }
      if (prop === "reverse") {
        return () => {
          target.reverse();
          markRangeDirty(0, target.length);
          updateParentKeys(0, target.length);
          return proxy;
        };
      }
      if (prop === "fill") {
        return (value: T, start?: number, end?: number) => {
          const len = target.length;
          const actualStart = start == null ? 0 : normalizeIndex(start, len);
          const actualEnd = end == null ? len : normalizeIndex(end, len);
          const version = nextVersion();
          for (let i = actualStart; i < actualEnd; i++) {
            target[i] = trackRecursive(value, trackedItems, i) as T;
            dirty.set(i, version);
          }
          if (actualStart < actualEnd) {
            propagateToParent(trackedItems, version);
          }
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
            const copied = target.slice(from, from + count);
            const version = nextVersion();
            for (let i = 0; i < count; i++) {
              target[to + i] = copied[i]!;
              dirty.set(to + i, version);
            }
            propagateToParent(trackedItems, version);
            updateParentKeys(to, to + count);
          }
          return proxy;
        };
      }
      return getFallback(target, prop);
    },
  }) as Tracked<T[]>;

  return proxy;
}

function trackMap<K, V>(map: Map<K, V>, parent?: object, parentKey?: string | number): Tracked<Map<K, V>> {
  const dirty = new Map<K, number>();
  const created = new Map<K, number>();
  const deleted = new Map<K, number>();
  const trackedValues = new Map<K, V>();

  Object.defineProperty(trackedValues, DIRTY, { value: dirty, writable: true });
  Object.defineProperty(trackedValues, CREATED, { value: created, writable: true });
  Object.defineProperty(trackedValues, DELETED, { value: deleted, writable: true });
  setParentMeta(trackedValues, parent, parentKey);

  for (const [key, value] of map) {
    trackedValues.set(key, trackRecursive(value, trackedValues, key as string | number) as V);
  }

  const proxy = new Proxy(trackedValues, {
    get(target, prop) {
      if (prop === UNDERLYING) return target;
      if (typeof prop === "symbol") {
        return getFallback(target, prop);
      }
      if (prop === "set") {
        return (key: K, value: V) => {
          const version = nextVersion();
          if (target.has(key)) {
            // Update existing key
            dirty.set(key, version);
          } else {
            // New key. Revival of a previously-deleted key: the deletion cleared `target`,
            // so target.has(key) is false — but the key may have been in the baseline
            // snapshot. We can't tell from here, so mark dirty too. The encoder's filters
            // pick exactly one bucket: !a.has(key) gates `created` to non-snapshot keys,
            // a.has(key) gates `dirty` to snapshot keys.
            created.set(key, version);
            if (deleted.has(key)) dirty.set(key, version);
          }
          if (deleted.delete(key)) liveTombstones--;
          propagateToParent(trackedValues, version);
          target.set(key, trackRecursive(value, trackedValues, key as string | number) as V);
          return proxy;
        };
      }
      if (prop === "delete") {
        return (key: K) => {
          if (target.has(key)) {
            const version = nextVersion();
            const wasEmpty = deleted.size === 0;
            deleted.set(key, version);
            liveTombstones++;
            if (wasEmpty) tombstoneBearers.add(new WeakRef(target as Map<unknown, unknown>));
            dirty.delete(key);
            created.delete(key);
            propagateToParent(trackedValues, version);
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
          for (const key of target.keys()) {
            deleted.set(key, version);
            dirty.delete(key);
            created.delete(key);
          }
          liveTombstones += sizeBefore;
          if (wasEmpty) tombstoneBearers.add(new WeakRef(target as Map<unknown, unknown>));
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
 * Deep clone an object, preserving Maps and Arrays.
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

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = deepClone((obj as Record<string, unknown>)[key]);
  }
  return result as T;
}
