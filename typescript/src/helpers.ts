const FLOAT_EPSILON = 0.001;

export function parseString(x: unknown): string {
  if (typeof x === "string") {
    return x;
  }
  if (typeof x === "number" || typeof x === "boolean") {
    return String(x);
  }
  throw new Error(`Invalid string: ${x}`);
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
  if (typeof x === "boolean") {
    return x;
  }
  if (x === 1 || x === "1") {
    return true;
  }
  if (x === 0 || x === "0") {
    return false;
  }
  if (typeof x === "string") {
    const lower = x.toLowerCase();
    if (lower === "true") {
      return true;
    }
    if (lower === "false") {
      return false;
    }
  }
  throw new Error(`Invalid boolean: ${x}`);
}
export function parseEnum<K, T extends object>(x: unknown, enumObj: T): K {
  if (typeof x === "string") {
    // Exact match first (must be a string key mapping to a number)
    if (x in enumObj && typeof (enumObj as Record<string, unknown>)[x] === "number") {
      return x as K;
    }
    // Case-insensitive fallback
    const lowerInput = x.toLowerCase();
    for (const key of Object.keys(enumObj)) {
      if (typeof (enumObj as Record<string, unknown>)[key] === "number" && key.toLowerCase() === lowerInput) {
        return key as K;
      }
    }
    // Numeric string index lookup
    if (/^-?\d+$/.test(x)) {
      const val = (enumObj as Record<number, string>)[Number(x)];
      if (typeof val === "string") return val as K;
    }
  }
  // Integer index lookup
  if (typeof x === "number" && Number.isInteger(x)) {
    const val = (enumObj as Record<number, string>)[x];
    if (typeof val === "string") return val as K;
  }
  throw new Error(`Invalid enum: ${x}`);
}
export function parseOptional<T>(x: unknown, innerParse: (y: unknown) => T): T | undefined {
  if (x == null || x === "") {
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
export function parseUnion<T extends string>(
  x: unknown,
  variants: readonly T[],
  parsers: Record<T, (val: unknown) => unknown>
): { _type: T } & Record<string, unknown> {
  if (typeof x !== "object" || x == null) {
    throw new Error(`Invalid union: ${JSON.stringify(x)}`);
  }

  const findVariant = (name: string): T | undefined => {
    const exact = variants.find((v) => v === name);
    if (exact) return exact;
    const lower = name.toLowerCase();
    return variants.find((v) => v.toLowerCase() === lower);
  };

  // Delta-pack format: { _type: "TypeName", ...props }
  if ("_type" in x && typeof x._type === "string") {
    const variant = findVariant(x._type);
    if (!variant) {
      throw new Error(`Unknown union type variant: ${x._type}`);
    }
    return { _type: variant, ...(parsers[variant](x) as Record<string, unknown>) };
  }

  // Protobuf format: { TypeName: ... }
  const entries = Object.entries(x);
  if (entries.length === 1) {
    const [fieldName, fieldValue] = entries[0]!;
    const variant = findVariant(fieldName);
    if (!variant) {
      throw new Error(`Unknown union type variant: ${fieldName}`);
    }
    return { _type: variant, ...(parsers[variant](fieldValue) as Record<string, unknown>) };
  }

  throw new Error(`Invalid union: ${JSON.stringify(x)}`);
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
