// ============ Internal Symbols ============

/** Symbol for fast access to underlying object/array (bypasses proxy for encoding) */
const UNDERLYING = Symbol.for("delta-pack:underlying");

/** Symbol for fast access to dirty version map (Map<key, version>) */
const DIRTY = Symbol.for("delta-pack:dirty");

/** Symbol for parent reference (for dirty propagation) */
const PARENT = Symbol.for("delta-pack:parent");

/** Symbol for key in parent (for dirty propagation) */
const PARENT_KEY = Symbol.for("delta-pack:parentKey");

/** Symbol for snapshot version (set on cloned objects) */
const SNAPSHOT_VERSION = Symbol.for("delta-pack:snapshotVersion");

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

/** WeakRef registry for snapshot auto-pruning */
const snapshotRefs = new Set<WeakRef<object>>();

/**
 * Register a snapshot for version tracking and auto-pruning.
 * Called by clone() to capture the current version.
 * @internal
 */
export function registerSnapshot(snapshot: object, source: object): void {
  if (!isTracked(source)) return;

  const version = currentVersion();
  // Recursively set SNAPSHOT_VERSION on snapshot and all nested containers
  setSnapshotVersionRecursive(snapshot, version);
  snapshotRefs.add(new WeakRef(snapshot));

  // Prune deleted entries on each clone
  pruneDeletedEntries(source);
}

/** Recursively set SNAPSHOT_VERSION on an object and all its nested containers */
function setSnapshotVersionRecursive(obj: unknown, version: number): void {
  if (obj == null || typeof obj !== "object") return;
  Object.defineProperty(obj, SNAPSHOT_VERSION, { value: version });

  if (obj instanceof Map) {
    for (const value of obj.values()) {
      setSnapshotVersionRecursive(value, version);
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      setSnapshotVersionRecursive(item, version);
    }
  } else {
    for (const value of Object.values(obj)) {
      setSnapshotVersionRecursive(value, version);
    }
  }
}

/**
 * Get the snapshot version of an object (if it was created via clone from a tracked source).
 * @internal
 */
export function getSnapshotVersion(obj: unknown): number | undefined {
  if (obj == null || typeof obj !== "object") return undefined;
  return (obj as any)[SNAPSHOT_VERSION];
}

/** Check if an object is tracked (has dirty version map) */
function isTracked(obj: object): boolean {
  return (obj as any)[DIRTY] != null;
}

/** Prune deleted map entries that are older than the oldest surviving snapshot */
function pruneDeletedEntries(obj: object): void {
  // Find oldest surviving snapshot version
  let oldestVersion = Infinity;
  for (const ref of snapshotRefs) {
    const snap = ref.deref();
    if (snap == null) {
      snapshotRefs.delete(ref);
    } else {
      const v = getSnapshotVersion(snap);
      if (v != null) oldestVersion = Math.min(oldestVersion, v);
    }
  }

  // Recursively prune DELETED entries older than oldestVersion
  // When oldestVersion is Infinity (no snapshots), all entries are pruned
  pruneRecursive(obj, oldestVersion);
}

function pruneRecursive(obj: unknown, minVersion: number): void {
  if (obj == null || typeof obj !== "object") return;

  if (obj instanceof Map) {
    const deleted = (obj as any)[DELETED] as Map<unknown, number> | undefined;
    if (deleted) {
      for (const [key, version] of deleted) {
        if (version < minVersion) deleted.delete(key);
      }
    }
    for (const value of obj.values()) pruneRecursive(value, minVersion);
  } else if (Array.isArray(obj)) {
    for (const item of obj) pruneRecursive(item, minVersion);
  } else {
    for (const value of Object.values(obj)) pruneRecursive(value, minVersion);
  }
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
 * const snapshot1 = api.clone(state);  // Captures current version
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
            // New key
            created.set(key, version);
          }
          // Revive if previously deleted
          deleted.delete(key);
          propagateToParent(trackedValues, version);
          target.set(key, trackRecursive(value, trackedValues, key as string | number) as V);
          return proxy;
        };
      }
      if (prop === "delete") {
        return (key: K) => {
          if (target.has(key)) {
            const version = nextVersion();
            deleted.set(key, version);
            dirty.delete(key);
            created.delete(key);
            propagateToParent(trackedValues, version);
          }
          return target.delete(key);
        };
      }
      if (prop === "clear") {
        return () => {
          const version = nextVersion();
          for (const key of target.keys()) {
            deleted.set(key, version);
            dirty.delete(key);
            created.delete(key);
          }
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
