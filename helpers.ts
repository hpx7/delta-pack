import { Writer, Reader } from "bin-serde";
import utf8Size from "utf8-buffer-size";
import { rleDecode, rleEncode } from "./rle";

export const NO_DIFF = Symbol("NODIFF");
export type DeepPartial<T> = T extends string | number | boolean | undefined
  ? T
  : T extends Array<infer V>
  ? { additions: Array<V>; updates: Array<DeepPartial<V> | typeof NO_DIFF> }
  : T extends { type: string; val: any }
  ?
    | { partial: true; type: T["type"]; val: DeepPartial<T["val"]> }
    | { partial: false; type: T["type"]; val: T["val"] }
  : T extends Map<infer K, infer V>
  ? { deletions: Set<number>; additions: Map<K, V>; updates: Map<number, DeepPartial<V>> }
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

type PrimitiveValue =
  | { type: "string"; val: string; len: number }
  | { type: "int"; val: number }
  | { type: "uint"; val: number }
  | { type: "float"; val: number };

export class Tracker {
  private bitsIdx = 0;
  private dict: string[] = [];
  private data: PrimitiveValue[] = [];
  constructor(
    private bits: boolean[] = [],
    private reader: Reader = new Reader(new Uint8Array())
  ) {}
  static parse(buf: Uint8Array) {
    const reader = new Reader(buf);

    const numBits = reader.readUVarint();
    const rleBits = reader.readBits(numBits);
    const bits = rleDecode(rleBits);

    return new Tracker(bits, reader);
  }
  pushString(val: string) {
    if (val === "") {
      this.data.push({ type: "int", val: 0 });
      return;
    }
    const idx = this.dict.indexOf(val);
    if (idx < 0) {
      this.dict.push(val);
      const len = utf8Size(val);
      this.data.push({ type: "string", val, len });
    } else {
      this.data.push({ type: "int", val: -idx - 1 });
    }
  }
  pushInt(val: number) {
    this.data.push({ type: "int", val });
  }
  pushUInt(val: number) {
    this.data.push({ type: "uint", val });
  }
  pushFloat(val: number) {
    this.data.push({ type: "float", val });
  }
  pushBoolean(val: boolean) {
    this.bits.push(val);
  }
  pushOptional<T>(val: T | undefined, innerWrite: (x: T) => void) {
    this.pushBoolean(val != null);
    if (val != null) {
      innerWrite(val);
    }
  }
  pushArray<T>(val: T[], innerWrite: (x: T) => void) {
    this.pushUInt(val.length);
    for (const item of val) {
      innerWrite(item);
    }
  }
  pushRecord<K, T>(val: Map<K, T>, innerKeyWrite: (x: K) => void, innerValWrite: (x: T) => void) {
    this.pushUInt(val.size);
    for (const [key, value] of val) {
      innerKeyWrite(key);
      innerValWrite(value);
    }
  }
  pushOptionalDiff<T>(
    val: { type: "partial"; val: DeepPartial<T> } | { type: "full"; val: T | undefined },
    innerFullWrite: (x: T) => void,
    innerPartialWrite: (x: DeepPartial<T>) => void,
  ) {
    this.pushBoolean(val.type === "partial");
    if (val.type === "partial") {
      innerPartialWrite(val.val);
    } else {
      this.pushBoolean(val.val != null);
      if (val.val != null) {
        innerFullWrite(val.val);
      }
    }
  }
  pushArrayDiff<T>(
    val: DeepPartial<T[]>,
    innerWrite: (x: T) => void,
    innerUpdateWrite: (x: DeepPartial<T>) => void,
  ) {
    this.pushUInt(val.additions.length);
    val.additions.forEach((item) => {
      innerWrite(item);
    });
    this.pushUInt(val.updates.length);
    val.updates.forEach((item) => {
      this.pushBoolean(item !== NO_DIFF);
      if (item !== NO_DIFF) {
        innerUpdateWrite(item);
      }
    });
  }
  pushRecordDiff<K, T>(
    val: DeepPartial<Map<K, T>>,
    innerKeyWrite: (x: K) => void,
    innerValWrite: (x: T) => void,
    innerValUpdateWrite: (x: DeepPartial<T>) => void,
  ) {
    this.pushUInt(val.deletions.size);
    for (const key of val.deletions) {
      this.pushUInt(key);
    }
    this.pushUInt(val.additions.size);
    for (const [key, value] of val.additions) {
      innerKeyWrite(key);
      innerValWrite(value);
    }
    this.pushUInt(val.updates.size);
    for (const [key, value] of val.updates) {
      this.pushUInt(key);
      innerValUpdateWrite(value);
    }
  }
  nextString() {
    const lenOrIdx = this.reader.readVarint();
    if (lenOrIdx === 0) {
      return "";
    }
    if (lenOrIdx > 0) {
      const str = this.reader.readStringUtf8(lenOrIdx);
      this.dict.push(str);
      return str;
    }
    return this.dict[-lenOrIdx - 1];
  }
  nextInt() {
    return this.reader.readVarint();
  }
  nextUInt() {
    return this.reader.readUVarint();
  }
  nextFloat() {
    return this.reader.readFloat();
  }
  nextBoolean() {
    return this.bits[this.bitsIdx++];
  }
  nextOptional<T>(innerRead: () => T): T | undefined {
    return this.nextBoolean() ? innerRead() : undefined;
  }
  nextArray<T>(innerRead: () => T): T[] {
    const len = this.nextUInt();
    const arr = new Array<T>(len);
    for (let i = 0; i < len; i++) {
      arr[i] = innerRead();
    }
    return arr;
  }
  nextRecord<K, T>(innerKeyRead: () => K, innerValRead: () => T): Map<K, T> {
    const len = this.nextUInt();
    const obj: Map<K, T> = new Map();
    for (let i = 0; i < len; i++) {
      obj.set(innerKeyRead(), innerValRead());
    }
    return obj;
  }
  nextOptionalDiff<T>(
    innerFullRead: () => T,
    innerPartialRead: () => DeepPartial<T>,
  ): typeof NO_DIFF | { type: "partial"; val: DeepPartial<T> } | { type: "full"; val: T | undefined } {
    const isPartial = this.nextBoolean();
    if (isPartial) {
      return { type: "partial", val: innerPartialRead() };
    }
    return { type: "full", val: this.nextBoolean() ? innerFullRead() : undefined };
  }
  nextArrayDiff<T>(
    innerRead: () => T,
    innerUpdateRead: () => DeepPartial<T>,
  ): DeepPartial<T[]> {
    const numAdditions = this.nextUInt();
    const additions = new Array<T>(numAdditions);
    for (let i = 0; i < numAdditions; i++) {
      additions[i] = innerRead();
    }
    const numUpdates = this.nextUInt();
    const updates = new Array<DeepPartial<T> | typeof NO_DIFF>(numUpdates);
    for (let i = 0; i < numUpdates; i++) {
      updates[i] = this.nextBoolean() ? innerUpdateRead() : NO_DIFF;
    }
    return { additions, updates };
  }
  nextRecordDiff<K, T>(
    innerKeyRead: () => K,
    innerValRead: () => T,
    innerValUpdateRead: () => DeepPartial<T>,
  ): DeepPartial<Map<K, T>> {
    const obj: DeepPartial<Map<K, T>> = { deletions: new Set(), additions: new Map(), updates: new Map() };
    const numDeleted = this.nextUInt();
    for (let i = 0; i < numDeleted; i++) {
      obj.deletions.add(this.nextUInt());
    }
    const numAdded = this.nextUInt();
    for (let i = 0; i < numAdded; i++) {
      obj.additions.set(innerKeyRead(), innerValRead());
    }
    const numUpdated = this.nextUInt();
    for (let i = 0; i < numUpdated; i++) {
      obj.updates.set(this.nextUInt(), innerValUpdateRead());
    }
    return obj;
  }
  toBuffer() {
    const buf = new Writer();

    const rleBits = rleEncode(this.bits);
    buf.writeUVarint(rleBits.length);
    buf.writeBits(rleBits);

    this.data.forEach((x) => {
      if (x.type === "string") {
        buf.writeVarint(x.len);
        buf.writeStringUtf8(x.val, x.len);
      } else if (x.type === "int") {
        buf.writeVarint(x.val);
      } else if (x.type === "uint") {
        buf.writeUVarint(x.val);
      } else if (x.type === "float") {
        buf.writeFloat(x.val);
      }
    });

    return buf.toBuffer();
  }
}

export function validatePrimitive(isValid: boolean, errorMessage: string) {
  return isValid ? [] : [errorMessage];
}
export function validateOptional<T>(val: T | undefined, innerValidate: (x: T) => string[]) {
  if (val != null) {
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

export function diffPrimitive<T>(a: T, b: T) {
  return a === b ? NO_DIFF : b;
}
export function diffFloat(a: number, b: number) {
  return Math.abs(a - b) < 0.00001 ? NO_DIFF : b;
}
export function diffOptional<T>(
  a: T | undefined,
  b: T | undefined,
  innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF,
): typeof NO_DIFF | { type: "partial"; val: DeepPartial<T> } | { type: "full"; val: T | undefined } {
  if (a != null && b != null) {
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
  const aOrderedKeys = Array.from(a.keys()).sort();
  for (const [bKey, bVal] of b) {
    const aVal = a.get(bKey);
    if (aVal == null) {
      obj.additions.set(bKey, bVal);
    } else {
      const diff = innerDiff(aVal, bVal);
      if (diff !== NO_DIFF) {
        const idx = aOrderedKeys.indexOf(bKey);
        obj.updates.set(idx, diff);
      }
    }
  }
  aOrderedKeys.forEach((aKey, idx) => {
    if (!b.has(aKey)) {
      obj.deletions.add(idx);
    }
  });
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
  const result: T[] = [];
  for (let i = 0; i < patch.updates.length; i++) {
    const val = patch.updates[i];
    if (val !== NO_DIFF) {
      result.push(innerPatch(arr[i], val));
    } else {
      result.push(arr[i]);
    }
  }
  patch.additions.forEach((val) => {
    result.push(val);
  });
  return result;
}
export function patchRecord<K, T>(
  obj: Map<K, T>,
  patch: DeepPartial<Map<K, T>> | typeof NO_DIFF,
  innerPatch: (a: T, b: DeepPartial<T>) => T,
): Map<K, T> {
  if (patch === NO_DIFF) {
    return obj;
  }
  const result = new Map<K, T>();
  const sortedKeys = [...obj.keys()].sort();
  sortedKeys.forEach((key, idx) => {
    if (patch.deletions.has(idx)) {
      return
    }
    const objVal = obj.get(key)!;
    const patchVal = patch.updates.get(idx);
    if (patchVal != null) {
      result.set(key, innerPatch(objVal, patchVal));
    } else {
      result.set(key, objVal);
    }
  });
  for (const [key, patchVal] of patch.additions) {
    result.set(key, patchVal);
  }
  return result;
}
