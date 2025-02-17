import { Writer, Reader } from "bin-serde";

export { Writer, Reader };

export const NO_DIFF = Symbol("NODIFF");
export const DELETED = Symbol("DELETED");
export type DeepPartial<T> = T extends string | number | boolean | undefined
  ? T
  : T extends Array<infer ArrayType>
  ? Array<DeepPartial<ArrayType> | typeof NO_DIFF> | typeof NO_DIFF
  : T extends { type: string; val: any }
  ? { type: T["type"]; val: DeepPartial<T["val"] | typeof NO_DIFF> }
  : T extends Map<infer K, infer V>
  ? Map<K, DeepPartial<V> | typeof DELETED>
  : { [K in keyof T]: DeepPartial<T[K]> | typeof NO_DIFF };

export class Tracker {
  private bits: boolean[];
  private idx = 0;
  constructor(reader?: Reader) {
    this.bits = reader !== undefined ? reader.readBits(reader.readUVarint()) : [];
  }
  push(val: boolean) {
    this.bits.push(val);
  }
  next() {
    return this.bits[this.idx++];
  }
  encode(buf: Writer) {
    buf.writeUVarint(this.bits.length);
    buf.writeBits(this.bits);
  }
}

export function validatePrimitive(isValid: boolean, errorMessage: string) {
  return isValid ? [] : [errorMessage];
}
export function validateOptional<T>(val: T | undefined, innerValidate: (x: T) => string[]) {
  if (val !== undefined) {
    return innerValidate(val);
  }
  return [];
}
export function validateArray<T>(arr: T[], innerValidate: (x: T) => string[]) {
  if (!Array.isArray(arr)) {
    return ["Invalid array: " + arr];
  }
  for (let i = 0; i < arr.length; i++) {
    const validationErrors = innerValidate(arr[i]);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid array item at index " + i);
    }
  }
  return [];
}
export function validateRecord<K, T>(
  obj: Map<K, T>,
  innerKeyValidate: (x: K) => string[],
  innerValueValidate: (x: T) => string[],
) {
  if (!(obj instanceof Map)) {
    return ["Invalid record: " + obj];
  }
  for (const [key, val] of obj) {
    const keyValidationErrors = innerKeyValidate(key);
    if (keyValidationErrors.length > 0) {
      return keyValidationErrors.concat("Invalid record key " + key);
    }
    const valueValidationErrors = innerValueValidate(val);
    if (valueValidationErrors.length > 0) {
      return valueValidationErrors.concat("Invalid record value " + val + " for key " + key);
    }
  }
  return [];
}

export function writeUInt8(buf: Writer, x: number) {
  buf.writeUInt8(x);
}
export function writeBoolean(buf: Writer, x: boolean) {
  buf.writeUInt8(x ? 1 : 0);
}
export function writeInt(buf: Writer, x: number) {
  buf.writeVarint(x);
}
export function writeUInt(buf: Writer, x: number) {
  buf.writeUVarint(x);
}
export function writeFloat(buf: Writer, x: number) {
  buf.writeFloat(x);
}
export function writeString(buf: Writer, x: string) {
  buf.writeString(x);
}
export function writeOptional<T>(buf: Writer, x: T | undefined, innerWrite: (x: T) => void) {
  writeBoolean(buf, x !== undefined);
  if (x !== undefined) {
    innerWrite(x);
  }
}
export function writeArray<T>(buf: Writer, x: T[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  for (const val of x) {
    innerWrite(val);
  }
}
export function writeRecord<K, T>(
  buf: Writer,
  x: Map<K, T>,
  innerKeyWrite: (x: K) => void,
  innerValWrite: (x: T) => void,
) {
  buf.writeUVarint(x.size);
  for (const [key, val] of x) {
    innerKeyWrite(key);
    innerValWrite(val);
  }
}
export function writeOptionalDiff<T>(tracker: Tracker, x: T | undefined, innerWrite: (x: T) => void) {
  tracker.push(x !== undefined);
  if (x !== undefined) {
    innerWrite(x);
  }
}
export function writeArrayDiff<T>(
  buf: Writer,
  tracker: Tracker,
  x: (T | typeof NO_DIFF)[],
  innerWrite: (x: T) => void,
) {
  buf.writeUVarint(x.length);
  x.forEach((val) => {
    tracker.push(val !== NO_DIFF);
    if (val !== NO_DIFF) {
      innerWrite(val);
    }
  });
}
export function writeRecordDiff<K, T>(
  buf: Writer,
  x: Map<K, T | typeof DELETED>,
  innerKeyWrite: (x: K) => void,
  innerValWrite: (x: T) => void,
) {
  const deletedKeys = new Set<K>();
  for (const [key, val] of x) {
    if (val === DELETED) {
      deletedKeys.add(key);
    }
  }
  buf.writeUVarint(deletedKeys.size);
  for (const key of deletedKeys) {
    innerKeyWrite(key);
  }
  buf.writeUVarint(x.size - deletedKeys.size);
  for (const [key, val] of x) {
    if (val !== DELETED) {
      innerKeyWrite(key);
      innerValWrite(val);
    }
  }
}

export function parseUInt8(buf: Reader): number {
  return buf.readUInt8();
}
export function parseBoolean(buf: Reader): boolean {
  return buf.readUInt8() > 0;
}
export function parseInt(buf: Reader): number {
  return buf.readVarint();
}
export function parseUInt(buf: Reader): number {
  return buf.readUVarint();
}
export function parseFloat(buf: Reader): number {
  return buf.readFloat();
}
export function parseString(buf: Reader): string {
  return buf.readString();
}
export function parseOptional<T>(buf: Reader, innerParse: (buf: Reader) => T): T | undefined {
  return parseBoolean(buf) ? innerParse(buf) : undefined;
}
export function parseArray<T>(buf: Reader, innerParse: () => T): T[] {
  const len = buf.readUVarint();
  const arr = new Array<T>(len);
  for (let i = 0; i < len; i++) {
    arr[i] = innerParse();
  }
  return arr;
}
export function parseRecord<K, T>(buf: Reader, innerKeyParse: () => K, innerValParse: () => T): Map<K, T> {
  const len = buf.readUVarint();
  const obj: Map<K, T> = new Map();
  for (let i = 0; i < len; i++) {
    obj.set(innerKeyParse(), innerValParse());
  }
  return obj;
}
export function parseOptionalDiff<T>(tracker: Tracker, innerParse: () => T): T | undefined {
  return tracker.next() ? innerParse() : undefined;
}
export function parseArrayDiff<T>(buf: Reader, tracker: Tracker, innerParse: () => T): (T | typeof NO_DIFF)[] {
  const len = buf.readUVarint();
  const arr = new Array<T | typeof NO_DIFF>(len);
  for (let i = 0; i < len; i++) {
    arr[i] = tracker.next() ? innerParse() : NO_DIFF;
  }
  return arr;
}
export function parseRecordDiff<K, T>(
  buf: Reader,
  innerKeyParse: () => K,
  innerValParse: () => T,
): Map<K, T | typeof DELETED> {
  const obj: Map<K, T | typeof DELETED> = new Map();
  const numDeleted = buf.readUVarint();
  for (let i = 0; i < numDeleted; i++) {
    obj.set(innerKeyParse(), DELETED);
  }
  const numAdded = buf.readUVarint();
  for (let i = 0; i < numAdded; i++) {
    obj.set(innerKeyParse(), innerValParse());
  }
  return obj;
}

export function diffPrimitive<T>(a: T, b: T) {
  return a === b ? NO_DIFF : b;
}
export function diffOptional<T>(
  a: T | undefined,
  b: T | undefined,
  innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF,
) {
  if (a !== undefined && b !== undefined) {
    return innerDiff(a, b);
  }
  return a === b ? NO_DIFF : b;
}
export function diffArray<T>(a: T[], b: T[], innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF) {
  let changed = a.length !== b.length;
  const arr = b.map((val, i) => {
    if (i < a.length) {
      const diff = innerDiff(a[i], val);
      changed ||= diff !== NO_DIFF;
      return diff;
    }
    return val;
  });
  return changed ? arr : NO_DIFF;
}
export function diffRecord<K, T>(
  a: Map<K, T>,
  b: Map<K, T>,
  innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF,
) {
  const obj: Map<K, T | DeepPartial<T> | typeof DELETED> = new Map();
  for (const [bKey, bVal] of b) {
    const aVal = a.get(bKey);
    if (aVal === undefined) {
      obj.set(bKey, bVal);
    } else {
      const diff = innerDiff(aVal, bVal);
      if (diff !== NO_DIFF) {
        obj.set(bKey, diff);
      }
    }
  }
  for (const aKey of a.keys()) {
    if (!b.has(aKey)) {
      obj.set(aKey, DELETED);
    }
  }
  return obj.size > 0 ? obj : NO_DIFF;
}

export function patchOptional<T>(obj: T | undefined, patch: unknown, innerPatch: (a: T, b: DeepPartial<T>) => T) {
  if (patch === undefined) {
    return undefined;
  } else if (obj === undefined) {
    return patch as T;
  }
  return innerPatch(obj, patch as DeepPartial<T>);
}
export function patchArray<T>(arr: T[], patch: unknown[], innerPatch: (a: T, b: DeepPartial<T>) => T): T[] {
  patch.forEach((val, i) => {
    if (val !== NO_DIFF) {
      if (i >= arr.length) {
        arr.push(val as T);
      } else {
        arr[i] = innerPatch(arr[i], val as DeepPartial<T>);
      }
    }
  });
  if (patch.length < arr.length) {
    arr.splice(patch.length);
  }
  return arr;
}
export function patchRecord<K, T>(obj: Map<K, T>, patch: Map<K, unknown>, innerPatch: (a: T, b: DeepPartial<T>) => T) {
  for (const [key, patchVal] of patch) {
    if (patchVal === DELETED) {
      obj.delete(key);
    } else {
      const objVal = obj.get(key);
      obj.set(key, objVal === undefined ? (patchVal as T) : innerPatch(objVal, patchVal as DeepPartial<T>));
    }
  }
  return obj;
}
