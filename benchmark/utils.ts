const WARMUP_MS = 100;
const BENCHMARK_MS = 1000;

export function measureOps(fn: () => void): number {
  // Warmup
  const warmupEnd = performance.now() + WARMUP_MS;
  while (performance.now() < warmupEnd) {
    fn();
  }

  // Benchmark
  let ops = 0;
  const benchmarkEnd = performance.now() + BENCHMARK_MS;
  while (performance.now() < benchmarkEnd) {
    fn();
    ops++;
  }

  return ops / (BENCHMARK_MS / 1000);
}

export function formatOps(ops: number): string {
  if (ops >= 1_000_000) {
    return `${(ops / 1_000_000).toFixed(1)}M`;
  } else if (ops >= 1_000) {
    return `${(ops / 1_000).toFixed(1)}K`;
  }
  return `${ops.toFixed(0)}`;
}

// Deep equality comparison with float precision tolerance
export function deepEquals(a: unknown, b: unknown, floatPrecision = 0.01): boolean {
  // Handle primitive types
  if (a === b) return true;

  // Handle null/undefined - treat null and undefined as equivalent
  if (a == null || b == null) return a == b;

  // Handle numbers (floats)
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) <= floatPrecision;
  }

  // Handle different types
  if (typeof a !== typeof b) return false;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => deepEquals(val, b[idx], floatPrecision));
  }

  // Handle Maps
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key)) return false;
      if (!deepEquals(val, b.get(key), floatPrecision)) return false;
    }
    return true;
  }

  // Handle objects
  if (typeof a === "object" && typeof b === "object") {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    const allKeys = new Set([...keysA, ...keysB]);
    return [...allKeys].every((key) => deepEquals(objA[key], objB[key], floatPrecision));
  }

  return false;
}
