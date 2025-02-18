import { Writer, Reader } from "bin-serde";
import { rleDecode, rleEncode } from "./rle";

export { Writer, Reader };

export const NO_DIFF = Symbol("NODIFF");
export type DeepPartial<T> = T extends string | number | boolean | undefined
  ? T
  : T extends Array<infer V>
  ? { additions: Array<V>; updates: Array<DeepPartial<V> | typeof NO_DIFF> }
  : T extends { type: string; val: any }
  ? { type: T["type"]; val: DeepPartial<T["val"] | typeof NO_DIFF> }
  : T extends Map<infer K, infer V>
  ? { deletions: Set<K>; additions: Map<K, V>; updates: Map<K, DeepPartial<V>> }
  : T extends Object
  ? {
      [K in keyof T]: undefined extends T[K]
        ?
            | { type: "partial"; val: NonNullable<DeepPartial<T[K]>> }
            | { type: "full"; val: T[K] | undefined }
            | typeof NO_DIFF
        : DeepPartial<T[K]> | typeof NO_DIFF;
    }
  : never;

export class Tracker {
  private idx = 0;
  constructor(private bits: boolean[] = []) {}
  static parse(reader: Reader) {
    const rleBits = reader.readBits(reader.readUVarint());
    return new Tracker(rleDecode(rleBits));
  }
  push(val: boolean) {
    this.bits.push(val);
  }
  next() {
    return this.bits[this.idx++];
  }
  remaining() {
    return this.bits.length - this.idx;
  }
  encode(buf: Writer) {
    const rleBits = rleEncode(this.bits);
    buf.writeUVarint(rleBits.length);
    buf.writeBits(rleBits);
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
export function writeBoolean(tracker: Tracker, x: boolean) {
  tracker.push(x);
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
export function writeOptional<T>(tracker: Tracker, x: T | undefined, innerWrite: (x: T) => void) {
  tracker.push(x !== undefined);
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
export function writeOptionalDiff<T>(
  tracker: Tracker,
  x: { type: "partial"; val: DeepPartial<T> } | { type: "full"; val: T | undefined },
  innerFullWrite: (x: T) => void,
  innerPartialWrite: (x: DeepPartial<T>) => void,
) {
  tracker.push(x.type === "partial");
  if (x.type === "partial") {
    innerPartialWrite(x.val);
  } else {
    tracker.push(x.val !== undefined);
    if (x.val !== undefined) {
      innerFullWrite(x.val);
    }
  }
}
export function writeArrayDiff<T>(
  buf: Writer,
  tracker: Tracker,
  x: DeepPartial<T[]>,
  innerWrite: (x: T) => void,
  innerUpdateWrite: (x: DeepPartial<T>) => void,
) {
  buf.writeUVarint(x.additions.length);
  x.additions.forEach((val) => {
    innerWrite(val);
  });
  buf.writeUVarint(x.updates.length);
  x.updates.forEach((val) => {
    tracker.push(val !== NO_DIFF);
    if (val !== NO_DIFF) {
      innerUpdateWrite(val);
    }
  });
}
export function writeRecordDiff<K, T>(
  buf: Writer,
  x: DeepPartial<Map<K, T>>,
  innerKeyWrite: (x: K) => void,
  innerValWrite: (x: T) => void,
  innerValUpdateWrite: (x: DeepPartial<T>) => void,
) {
  buf.writeUVarint(x.deletions.size);
  for (const key of x.deletions) {
    innerKeyWrite(key);
  }
  buf.writeUVarint(x.additions.size);
  for (const [key, val] of x.additions) {
    innerKeyWrite(key);
    innerValWrite(val);
  }
  buf.writeUVarint(x.updates.size);
  for (const [key, val] of x.updates) {
    innerKeyWrite(key);
    innerValUpdateWrite(val);
  }
}

export function parseUInt8(buf: Reader): number {
  return buf.readUInt8();
}
export function parseBoolean(tracker: Tracker): boolean {
  return tracker.next();
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
export function parseOptional<T>(tracker: Tracker, innerParse: () => T): T | undefined {
  return tracker.next() ? innerParse() : undefined;
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
export function parseOptionalDiff<T>(
  tracker: Tracker,
  innerFullParse: () => T,
  innerPartialParse: () => DeepPartial<T>,
): typeof NO_DIFF | { type: "partial"; val: DeepPartial<T> } | { type: "full"; val: T | undefined } {
  const isPartial = tracker.next();
  if (isPartial) {
    return { type: "partial", val: innerPartialParse() };
  }
  return { type: "full", val: tracker.next() ? innerFullParse() : undefined };
}
export function parseArrayDiff<T>(
  buf: Reader,
  tracker: Tracker,
  innerParse: () => T,
  innerUpdateParse: () => DeepPartial<T>,
): DeepPartial<T[]> {
  const numAdditions = buf.readUVarint();
  const additions = new Array<T>(numAdditions);
  for (let i = 0; i < numAdditions; i++) {
    additions[i] = innerParse();
  }
  const numUpdates = buf.readUVarint();
  const updates = new Array<DeepPartial<T> | typeof NO_DIFF>(numUpdates);
  for (let i = 0; i < numUpdates; i++) {
    updates[i] = tracker.next() ? innerUpdateParse() : NO_DIFF;
  }
  return { additions, updates };
}
export function parseRecordDiff<K, T>(
  buf: Reader,
  innerKeyParse: () => K,
  innerValParse: () => T,
  innerValUpdateParse: () => DeepPartial<T>,
): DeepPartial<Map<K, T>> {
  const obj: DeepPartial<Map<K, T>> = { deletions: new Set(), additions: new Map(), updates: new Map() };
  const numDeleted = buf.readUVarint();
  for (let i = 0; i < numDeleted; i++) {
    obj.deletions.add(innerKeyParse());
  }
  const numAdded = buf.readUVarint();
  for (let i = 0; i < numAdded; i++) {
    obj.additions.set(innerKeyParse(), innerValParse());
  }
  const numUpdated = buf.readUVarint();
  for (let i = 0; i < numUpdated; i++) {
    obj.updates.set(innerKeyParse(), innerValUpdateParse());
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
): typeof NO_DIFF | { type: "partial"; val: DeepPartial<T> } | { type: "full"; val: T | undefined } {
  if (a !== undefined && b !== undefined) {
    const diff = innerDiff(a, b);
    return diff === NO_DIFF ? NO_DIFF : { type: "partial", val: diff };
  }
  return a === b ? NO_DIFF : { type: "full", val: b };
}
export function diffArray<T>(
  a: T[],
  b: T[],
  innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF,
): DeepPartial<T[]> | typeof NO_DIFF {
  const additions = b.slice(a.length);
  const updates: (DeepPartial<T> | typeof NO_DIFF)[] = [];
  let changed = additions.length > 0 || a.length !== b.length;
  for (let i = 0; i < a.length && i < b.length; i++) {
    const diff = innerDiff(a[i], b[i]);
    updates.push(diff);
    changed ||= diff !== NO_DIFF;
  }
  return changed ? { additions, updates } : NO_DIFF;
}
export function diffRecord<K, T>(
  a: Map<K, T>,
  b: Map<K, T>,
  innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF,
): DeepPartial<Map<K, T>> | typeof NO_DIFF {
  const obj: DeepPartial<Map<K, T>> = { deletions: new Set(), additions: new Map(), updates: new Map() };
  for (const [bKey, bVal] of b) {
    const aVal = a.get(bKey);
    if (aVal === undefined) {
      obj.additions.set(bKey, bVal);
    } else {
      const diff = innerDiff(aVal, bVal);
      if (diff !== NO_DIFF) {
        obj.updates.set(bKey, diff);
      }
    }
  }
  for (const aKey of a.keys()) {
    if (!b.has(aKey)) {
      obj.deletions.add(aKey);
    }
  }
  return obj.deletions.size + obj.additions.size + obj.updates.size > 0 ? obj : NO_DIFF;
}

export function patchOptional<T>(
  obj: T | undefined,
  patch: typeof NO_DIFF | { type: "partial"; val: DeepPartial<T> } | { type: "full"; val: T | undefined },
  innerPatch: (a: T, b: DeepPartial<T>) => T,
): T | undefined {
  if (patch === NO_DIFF) {
    return obj;
  } else if (patch.type === "full") {
    return patch.val;
  }
  return innerPatch(obj!, patch.val);
}
export function patchArray<T>(
  arr: T[],
  patch: DeepPartial<T[]> | typeof NO_DIFF,
  innerPatch: (a: T, b: DeepPartial<T>) => T,
): T[] {
  if (patch === NO_DIFF) {
    return arr;
  }
  patch.updates.forEach((val, i) => {
    if (val !== NO_DIFF) {
      arr[i] = innerPatch(arr[i], val);
    }
  });
  if (patch.updates.length < arr.length) {
    arr.splice(patch.updates.length);
  } else {
    patch.additions.forEach((val) => {
      arr.push(val);
    });
  }
  return arr;
}
export function patchRecord<K, T>(
  obj: Map<K, T>,
  patch: DeepPartial<Map<K, T>> | typeof NO_DIFF,
  innerPatch: (a: T, b: DeepPartial<T>) => T,
): Map<K, T> {
  if (patch === NO_DIFF) {
    return obj;
  }
  for (const key of patch.deletions) {
    obj.delete(key);
  }
  for (const [key, patchVal] of patch.additions) {
    obj.set(key, patchVal);
  }
  for (const [key, patchVal] of patch.updates) {
    obj.set(key, innerPatch(obj.get(key)!, patchVal));
  }
  return obj;
}
