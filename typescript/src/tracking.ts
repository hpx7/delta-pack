/** Keys of T excluding _dirty */
type DataKeys<T> = Exclude<keyof T, "_dirty">;

/** Tracked Map with modified set() to accept plain values */
type TrackedMap<K, V> = Omit<Map<K, Tracked<V>>, "set" | "get"> & {
  _dirty?: Set<K>;
  set(key: K, value: V): TrackedMap<K, V>;
  get(key: K): Tracked<V> | undefined;
};

/** Recursively add dirty tracking to an object and its nested containers */
export type Tracked<T> =
  T extends Map<infer K, infer V>
    ? TrackedMap<K, V>
    : T extends Array<infer U>
      ? Array<Tracked<U>> & { _dirty?: Set<number> }
      : T extends object
        ? { [P in DataKeys<T>]: Tracked<T[P]> } & { _dirty?: Set<DataKeys<T>> }
        : T;

/** Callback to propagate dirty marking up the parent chain */
type PropagateCallback = () => void;

/** Fallback handler for unknown properties - binds methods to target */
function getFallback<T extends object>(target: T, prop: string | symbol): unknown {
  const value = (target as Record<string | symbol, unknown>)[prop];
  return typeof value === "function" ? value.bind(target) : value;
}

/**
 * Wraps an object with deep tracking. Property changes are automatically
 * tracked, and changes to nested objects/arrays/maps propagate up to parents.
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
 * state.player.x = 100;            // Marks "x" on player, "player" on state
 * state.players.get("p1")!.x = 50; // Marks "x" on player, "p1" on players, "players" on state
 *
 * const diff = api.encodeDiff(oldState, state);
 * clearTracking(state);  // Reset for next frame
 * ```
 */
export function track<T extends object>(obj: T): Tracked<T> {
  return trackWithParent(deepClone(obj), () => {}) as Tracked<T>;
}

/**
 * Clear dirty tracking recursively on an object and all its tracked children.
 */
export function clearTracking(obj: unknown): void {
  if (obj == null || typeof obj !== "object") {
    return;
  }

  const record = obj as { _dirty?: Set<unknown> } & Record<string, unknown>;
  record._dirty?.clear();

  if (obj instanceof Map) {
    for (const value of obj.values()) {
      clearTracking(value);
    }
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      clearTracking(obj[i]);
    }
  } else {
    for (const key of Object.keys(record)) {
      if (key !== "_dirty") {
        clearTracking(record[key]);
      }
    }
  }
}

function trackWithParent<T>(obj: T, propagateToParent: PropagateCallback): T {
  if (obj == null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Map) {
    return trackMap(obj as Map<unknown, unknown>, propagateToParent) as T;
  }

  if (Array.isArray(obj)) {
    return trackArray(obj, propagateToParent) as T;
  }

  return trackObject(obj as Record<string, unknown>, propagateToParent) as T;
}

function trackObject<T extends Record<string, unknown>>(obj: T, propagateToParent: PropagateCallback): Tracked<T> {
  const dirty = new Set<keyof T>();

  // Recursively track all nested values
  const trackedChildren: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (key !== "_dirty") {
      const fieldKey = key as keyof T;
      trackedChildren[key] = trackWithParent(obj[key], () => {
        dirty.add(fieldKey);
        propagateToParent();
      });
    }
  }

  const proxy = new Proxy(obj, {
    set(target, prop, value) {
      if (prop === "_dirty" || typeof prop === "symbol") {
        return true;
      }
      const key = prop as keyof T;
      if (target[key] !== value) {
        dirty.add(key);
        propagateToParent();
        // Track the new value with propagation
        trackedChildren[prop] = trackWithParent(value, () => {
          dirty.add(key);
          propagateToParent();
        });
      }
      (target as Record<string, unknown>)[prop] = value;
      return true;
    },
    get(target, prop) {
      if (prop === "_dirty") {
        return dirty;
      }
      if (typeof prop === "symbol") {
        return target[prop as unknown as string];
      }
      const tracked = trackedChildren[prop];
      if (tracked != null) {
        return tracked;
      }
      return target[prop];
    },
  }) as Tracked<T>;

  return proxy;
}

function trackArray<T>(arr: T[], propagateToParent: PropagateCallback): T[] & { _dirty: Set<number> } {
  const dirty = new Set<number>();
  const trackedItems: T[] = [];

  const markDirtyForItem = (trackedValue: T) => {
    let marked = false;
    for (let i = 0; i < trackedItems.length; i++) {
      if (trackedItems[i] === trackedValue) {
        dirty.add(i);
        marked = true;
      }
    }
    if (marked) {
      propagateToParent();
    }
  };

  const trackItem = (item: T): T => {
    let trackedValue: T;
    const markDirty = () => markDirtyForItem(trackedValue);
    trackedValue = trackWithParent(item, markDirty) as T;
    return trackedValue;
  };

  for (const item of arr) {
    trackedItems.push(trackItem(item));
  }

  const markRangeDirty = (start: number, end: number) => {
    if (start >= end) {
      return;
    }
    for (let i = start; i < end; i++) {
      dirty.add(i);
    }
    propagateToParent();
  };

  const markAllDirty = () => {
    markRangeDirty(0, trackedItems.length);
  };

  const normalizeIndex = (index: number, length: number) => {
    if (index < 0) {
      return Math.max(length + index, 0);
    }
    return Math.min(index, length);
  };

  const proxy = new Proxy(trackedItems, {
    set(target, prop, value) {
      if (prop === "_dirty" || typeof prop === "symbol") {
        return true;
      }
      if (prop === "length") {
        const oldLength = target.length;
        (target as unknown as { length: number }).length = value as number;
        const newLength = target.length;
        if (newLength !== oldLength) {
          const start = Math.min(oldLength, newLength);
          const end = Math.max(oldLength, newLength);
          markRangeDirty(start, end);
        }
        return true;
      }
      const index = Number(prop);
      if (!isNaN(index)) {
        dirty.add(index);
        propagateToParent();
        target[index] = trackItem(value as T);
        return true;
      }
      (target as unknown as Record<string, unknown>)[prop] = value;
      return true;
    },
    get(target, prop) {
      if (prop === "_dirty") {
        return dirty;
      }
      if (prop === "push") {
        return (...items: T[]) => {
          const startIndex = target.length;
          const trackedNewItems = items.map((item, i) => {
            const idx = startIndex + i;
            dirty.add(idx);
            return trackItem(item);
          });
          if (trackedNewItems.length > 0) {
            propagateToParent();
          }
          return target.push(...trackedNewItems);
        };
      }
      if (prop === "pop") {
        return () => {
          if (target.length > 0) {
            dirty.add(target.length - 1);
            propagateToParent();
          }
          return target.pop();
        };
      }
      if (prop === "shift") {
        return () => {
          if (target.length > 0) {
            markAllDirty();
          }
          return target.shift();
        };
      }
      if (prop === "unshift") {
        return (...items: T[]) => {
          if (items.length === 0) {
            return target.unshift();
          }
          for (let i = 0; i < target.length + items.length; i++) {
            dirty.add(i);
          }
          const trackedNewItems = items.map((item) => trackItem(item));
          propagateToParent();
          return target.unshift(...trackedNewItems);
        };
      }
      if (prop === "splice") {
        return (start: number, deleteCount?: number, ...items: T[]) => {
          const len = target.length;
          const actualStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
          const actualDeleteCount = deleteCount == null ? len - actualStart : Math.min(deleteCount, len - actualStart);
          const shouldMark = actualDeleteCount > 0 || items.length > 0;
          const didMarkRange = shouldMark && len > 0 && actualStart < len;
          if (didMarkRange) {
            markRangeDirty(actualStart, len);
          }
          if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
              dirty.add(actualStart + i);
            }
            if (!didMarkRange) {
              propagateToParent();
            }
          }
          const trackedNewItems = items.map((item) => trackItem(item));
          return target.splice(actualStart, actualDeleteCount, ...trackedNewItems);
        };
      }
      if (prop === "sort") {
        return (compareFn?: (a: T, b: T) => number) => {
          target.sort(compareFn);
          markAllDirty();
          return proxy;
        };
      }
      if (prop === "reverse") {
        return () => {
          target.reverse();
          markAllDirty();
          return proxy;
        };
      }
      if (prop === "fill") {
        return (value: T, start?: number, end?: number) => {
          const len = target.length;
          const actualStart = start == null ? 0 : normalizeIndex(Number(start), len);
          const actualEnd = end == null ? len : normalizeIndex(Number(end), len);
          for (let i = actualStart; i < actualEnd; i++) {
            target[i] = trackItem(value);
          }
          markRangeDirty(actualStart, actualEnd);
          return proxy;
        };
      }
      if (prop === "copyWithin") {
        return (targetIndex: number, start: number, end?: number) => {
          const len = target.length;
          const to = normalizeIndex(Number(targetIndex), len);
          const from = normalizeIndex(Number(start), len);
          const final = end == null ? len : normalizeIndex(Number(end), len);
          const count = Math.min(final - from, len - to);
          if (count > 0) {
            const copied = target.slice(from, from + count);
            for (let i = 0; i < count; i++) {
              target[to + i] = copied[i]!;
            }
            markRangeDirty(to, to + count);
          }
          return proxy;
        };
      }
      return getFallback(target, prop);
    },
  }) as T[] & { _dirty: Set<number> };

  return proxy;
}

function trackMap<K, V>(map: Map<K, V>, propagateToParent: PropagateCallback): Map<K, V> & { _dirty: Set<K> } {
  const dirty = new Set<K>();

  // Create map of tracked values - proxy this directly so iteration methods work
  const trackedValues = new Map<K, V>();
  for (const [key, value] of map) {
    trackedValues.set(
      key,
      trackWithParent(value, () => {
        dirty.add(key);
        propagateToParent();
      }) as V
    );
  }

  const proxy = new Proxy(trackedValues, {
    get(target, prop) {
      if (prop === "_dirty") {
        return dirty;
      }
      if (prop === "set") {
        return (key: K, value: V) => {
          dirty.add(key);
          propagateToParent();
          target.set(
            key,
            trackWithParent(value, () => {
              dirty.add(key);
              propagateToParent();
            }) as V
          );
          return proxy;
        };
      }
      if (prop === "delete") {
        return (key: K) => {
          dirty.add(key);
          propagateToParent();
          return target.delete(key);
        };
      }
      if (prop === "clear") {
        return () => {
          for (const key of target.keys()) {
            dirty.add(key);
          }
          propagateToParent();
          return target.clear();
        };
      }
      // All other methods (get, values, entries, forEach, etc.) work automatically
      return getFallback(target, prop);
    },
  }) as Map<K, V> & { _dirty: Set<K> };

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
    if (key !== "_dirty") {
      result[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
}
