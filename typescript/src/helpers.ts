const FLOAT_EPSILON = 0.001;

export function parseString(x: unknown): string {
  if (typeof x !== "string") {
    throw new Error(`Invalid string: ${x}`);
  }
  return x;
}
export function parseInt(x: unknown, min?: number, max?: number): number {
  if (typeof x === "string") {
    x = Number(x);
  }
  if (typeof x !== "number" || !Number.isInteger(x)) {
    throw new Error(`Invalid int: ${x}`);
  }
  if (min != null && x < min) {
    throw new Error(`Value ${x} below minimum ${min}`);
  }
  if (max != null && x > max) {
    throw new Error(`Value ${x} above maximum ${max}`);
  }
  return x;
}
export function parseFloat(x: unknown): number {
  if (typeof x === "string") {
    x = Number(x);
  }
  if (typeof x !== "number" || Number.isNaN(x) || !Number.isFinite(x)) {
    throw new Error(`Invalid float: ${x}`);
  }
  return x;
}
export function parseBoolean(x: unknown): boolean {
  if (x === "true") {
    return true;
  }
  if (x === "false") {
    return false;
  }
  if (typeof x !== "boolean") {
    throw new Error(`Invalid boolean: ${x}`);
  }
  return x;
}
export function parseEnum<K, T extends object>(x: unknown, enumObj: T): K {
  if (typeof x !== "string" || !(x in enumObj)) {
    throw new Error(`Invalid enum: ${x}`);
  }
  return x as K;
}
export function parseOptional<T>(x: unknown, innerParse: (y: unknown) => T): T | undefined {
  if (x == null) {
    return undefined;
  }
  try {
    return innerParse(x);
  } catch (err) {
    throw new Error(`Invalid optional: ${x}`, { cause: err });
  }
}
export function parseArray<T>(x: unknown, innerParse: (y: unknown) => T): T[] {
  if (!Array.isArray(x)) {
    throw new Error(`Invalid array, got ${typeof x}`);
  }
  return x.map((y, i) => {
    try {
      return innerParse(y);
    } catch (err) {
      throw new Error(`Invalid array element at index ${i}: ${y}`, { cause: err });
    }
  });
}
export function parseRecord<K, T>(
  x: unknown,
  innerKeyParse: (y: unknown) => K,
  innerValParse: (y: unknown) => T
): Map<K, T> {
  if (typeof x !== "object" || x == null) {
    throw new Error(`Invalid record, got ${typeof x}`);
  }
  const proto = Object.getPrototypeOf(x);
  if (proto === Object.prototype || proto == null) {
    x = new Map(Object.entries(x));
  }
  if (!(x instanceof Map)) {
    throw new Error(`Invalid record, got ${typeof x}`);
  }
  const result: Map<K, T> = new Map();
  for (const [key, val] of x) {
    try {
      result.set(innerKeyParse(key), innerValParse(val));
    } catch (err) {
      throw new Error(`Invalid record element (${key}, ${val})`, { cause: err });
    }
  }
  return result;
}
export function tryParseField<T>(parseFn: () => T, key: string): T {
  try {
    return parseFn();
  } catch (err) {
    throw new Error(`Invalid field ${key}`, { cause: err });
  }
}

export function equalsFloat(a: number, b: number): boolean {
  return Math.abs(a - b) < FLOAT_EPSILON;
}
export function equalsFloatQuantized(a: number, b: number, precision: number): boolean {
  return Math.round(a / precision) === Math.round(b / precision);
}
export function equalsOptional<T>(a: T | undefined, b: T | undefined, equals: (x: T, y: T) => boolean) {
  if (a == null && b == null) {
    return true;
  }
  if (a != null && b != null) {
    return equals(a, b);
  }
  return false;
}
export function equalsArray<T>(a: T[], b: T[], equals: (x: T, y: T) => boolean) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (!equals(a[i]!, b[i]!)) {
      return false;
    }
  }
  return true;
}
export function equalsRecord<K, T>(
  a: Map<K, T>,
  b: Map<K, T>,
  keyEquals: (x: K, y: K) => boolean,
  valueEquals: (x: T, y: T) => boolean
) {
  if (a.size !== b.size) {
    return false;
  }
  for (const [aKey, aVal] of a) {
    let found = false;
    for (const [bKey, bVal] of b) {
      if (keyEquals(aKey, bKey)) {
        if (!valueEquals(aVal, bVal)) {
          return false;
        }
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
}

export function mapValues<T, U>(obj: Record<string, T>, fn: (value: T, key: string) => U): Record<string, U> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value, key)]));
}

export function mapToObject<K, V>(map: Map<K, V>, valueToObject: (x: V) => unknown): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  map.forEach((value, key) => {
    obj[String(key)] = valueToObject(value);
  });
  return obj;
}
