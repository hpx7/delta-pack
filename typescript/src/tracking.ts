// ============ Internal Symbols ============

/** Symbol for fast access to underlying object/array (bypasses proxy for encoding) */
const UNDERLYING = Symbol.for("delta-pack:underlying");

/** Symbol for fast access to dirty set */
const DIRTY = Symbol.for("delta-pack:dirty");

/** Symbol for parent reference (for dirty propagation) */
const PARENT = Symbol.for("delta-pack:parent");

/** Symbol for key in parent (for dirty propagation) */
const PARENT_KEY = Symbol.for("delta-pack:parentKey");

/**
 * Get the underlying object/array for a tracked proxy.
 * This bypasses proxy overhead for read-only access during encoding.
 * @internal
 */
export function getUnderlying<T extends object>(obj: T): T {
  return (obj as any)[UNDERLYING] ?? obj;
}

/**
 * Get the dirty set for a tracked object.
 * @internal Used by encoder for optimization - not part of public API
 */
export function getDirty(obj: unknown[]): Set<number> | undefined;
export function getDirty<K>(obj: Map<K, unknown>): Set<K> | undefined;
export function getDirty(obj: object): Set<string> | undefined;
export function getDirty(obj: unknown): Set<string | number> | undefined;
export function getDirty(obj: unknown): Set<string | number> | undefined {
  if (obj == null || typeof obj !== "object") return undefined;
  return (obj as any)[DIRTY];
}

/**
 * Mark a key as dirty on an object for manual dirty tracking without proxies.
 * Uses a Symbol property for fast getDirty() access.
 * Propagates dirty marking up to parent containers if the object is tracked.
 */
export function markDirty(obj: unknown[], key: number): void;
export function markDirty<K>(obj: Map<K, unknown>, key: K): void;
export function markDirty(obj: object, key: string): void;
export function markDirty(obj: object, key: unknown): void {
  let dirty = (obj as any)[DIRTY] as Set<string | number> | undefined;
  if (!dirty) {
    dirty = new Set();
    (obj as any)[DIRTY] = dirty;
  }
  dirty.add(key as string | number);
  propagateToParent(obj);
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
 * tracked at each level, with changes propagating up to parent containers.
 * The encoder checks dirty sets at each level during diff encoding.
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
 * state.tick = 1;                  // Marks "tick" dirty on state
 * state.player.x = 100;            // Marks "x" dirty on player, "player" dirty on state
 * state.players.get("p1")!.x = 50; // Marks "x" dirty on player, "p1" dirty on players, "players" dirty on state
 *
 * const diff = api.encodeDiff(oldState, state);
 * clearTracking(state);  // Reset for next frame
 * ```
 */
export function track<T extends object>(obj: T): Tracked<T> {
  return trackRecursive(deepClone(obj)) as Tracked<T>;
}

/**
 * Clear dirty tracking recursively on an object and all its tracked children.
 */
export function clearTracking(obj: unknown): void {
  if (obj == null || typeof obj !== "object") {
    return;
  }

  const dirty = getDirty(obj);
  if (dirty) {
    dirty.clear();
  }

  if (obj instanceof Map) {
    for (const value of obj.values()) {
      clearTracking(value);
    }
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      clearTracking(obj[i]);
    }
  } else {
    for (const key of Object.keys(obj)) {
      clearTracking((obj as Record<string, unknown>)[key]);
    }
  }
}

// ============ Internal Implementation ============

/** Fallback handler for unknown properties - binds methods to target */
function getFallback<T extends object>(target: T, prop: string | symbol): unknown {
  const value = (target as Record<string | symbol, unknown>)[prop];
  return typeof value === "function" ? value.bind(target) : value;
}

/** Propagate dirty marking up to parent containers */
function propagateToParent(child: object): void {
  const parent = (child as any)[PARENT];
  const key = (child as any)[PARENT_KEY];
  if (parent != null && key != null) {
    const parentDirty = getDirty(parent);
    if (parentDirty && !parentDirty.has(key)) {
      parentDirty.add(key);
      propagateToParent(parent);
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
  if (getDirty(underlying) != null) {
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
  const dirty = new Set<string>();
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
        dirty.add(key);
        propagateToParent(obj);
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
        dirty.add(key);
        propagateToParent(obj);
        delete trackedChildren[key];
      }
      return delete (target as Record<string, unknown>)[key];
    },
  }) as Tracked<T>;

  return proxy;
}

function trackArray<T>(arr: T[], parent?: object, parentKey?: string | number): Tracked<T[]> {
  const dirty = new Set<number>();
  const trackedItems: T[] = [];
  Object.defineProperty(trackedItems, DIRTY, { value: dirty, writable: true });
  setParentMeta(trackedItems, parent, parentKey);

  // Track initial items
  for (let i = 0; i < arr.length; i++) {
    trackedItems.push(trackRecursive(arr[i], trackedItems, i) as T);
  }

  const markRangeDirty = (start: number, end: number) => {
    if (start >= end) return;
    for (let i = start; i < end; i++) {
      dirty.add(i);
    }
    propagateToParent(trackedItems);
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
        dirty.add(index);
        propagateToParent(trackedItems);
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
          for (let i = 0; i < items.length; i++) {
            dirty.add(startIndex + i);
            target.push(trackRecursive(items[i], trackedItems, startIndex + i) as T);
          }
          propagateToParent(trackedItems);
          return target.length;
        };
      }
      if (prop === "pop") {
        return () => {
          if (target.length > 0) {
            dirty.add(target.length - 1);
            propagateToParent(trackedItems);
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
          for (let i = actualStart; i < actualEnd; i++) {
            target[i] = trackRecursive(value, trackedItems, i) as T;
          }
          markRangeDirty(actualStart, actualEnd);
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
            for (let i = 0; i < count; i++) {
              target[to + i] = copied[i]!;
            }
            markRangeDirty(to, to + count);
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
  const dirty = new Set<K>();
  const trackedValues = new Map<K, V>();
  Object.defineProperty(trackedValues, DIRTY, { value: dirty, writable: true });
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
          dirty.add(key);
          propagateToParent(trackedValues);
          target.set(key, trackRecursive(value, trackedValues, key as string | number) as V);
          return proxy;
        };
      }
      if (prop === "delete") {
        return (key: K) => {
          dirty.add(key);
          propagateToParent(trackedValues);
          return target.delete(key);
        };
      }
      if (prop === "clear") {
        return () => {
          for (const key of target.keys()) {
            dirty.add(key);
          }
          propagateToParent(trackedValues);
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
