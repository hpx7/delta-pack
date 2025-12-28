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

  // Create array of tracked items - proxy this directly so native methods work
  const trackedItems: T[] = arr.map((item, i) =>
    trackWithParent(item, () => {
      dirty.add(i);
      propagateToParent();
    })
  );

  const proxy = new Proxy(trackedItems, {
    set(target, prop, value) {
      if (prop === "_dirty" || typeof prop === "symbol") {
        return true;
      }
      const index = Number(prop);
      if (!isNaN(index)) {
        dirty.add(index);
        propagateToParent();
        target[index] = trackWithParent(value, () => {
          dirty.add(index);
          propagateToParent();
        });
        return true;
      }
      // Handle length and other properties
      (target as unknown as Record<string, unknown>)[prop] = value;
      return true;
    },
    get(target, prop) {
      if (prop === "_dirty") {
        return dirty;
      }
      // For mutating methods, wrap to mark dirty
      if (prop === "push") {
        return (...items: T[]) => {
          const startIndex = target.length;
          const trackedItems = items.map((item, i) => {
            const idx = startIndex + i;
            dirty.add(idx);
            return trackWithParent(item, () => {
              dirty.add(idx);
              propagateToParent();
            });
          });
          propagateToParent();
          return target.push(...trackedItems);
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
            // All indices shift, mark all as dirty
            for (let i = 0; i < target.length; i++) {
              dirty.add(i);
            }
            propagateToParent();
          }
          return target.shift();
        };
      }
      if (prop === "unshift") {
        return (...items: T[]) => {
          // All indices shift, mark all as dirty
          for (let i = 0; i < target.length + items.length; i++) {
            dirty.add(i);
          }
          const trackedNewItems = items.map((item, i) =>
            trackWithParent(item, () => {
              dirty.add(i);
              propagateToParent();
            })
          );
          propagateToParent();
          return target.unshift(...trackedNewItems);
        };
      }
      if (prop === "splice") {
        return (start: number, deleteCount?: number, ...items: T[]) => {
          const len = target.length;
          const actualStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
          const actualDeleteCount = deleteCount == null ? len - actualStart : Math.min(deleteCount, len - actualStart);
          // Mark affected indices as dirty
          for (let i = actualStart; i < len; i++) {
            dirty.add(i);
          }
          propagateToParent();
          const trackedNewItems = items.map((item, i) => {
            const idx = actualStart + i;
            return trackWithParent(item, () => {
              dirty.add(idx);
              propagateToParent();
            });
          });
          return target.splice(actualStart, actualDeleteCount, ...trackedNewItems);
        };
      }
      // All other methods work naturally on trackedItems
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
