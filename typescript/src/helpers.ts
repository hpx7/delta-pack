import { Writer, Reader } from "bin-serde";
import utf8Size from "utf8-buffer-size";
import { rleDecode, rleEncode } from "./rle";

type PrimitiveValue =
  | { type: "string"; val: string; len: number }
  | { type: "int"; val: number }
  | { type: "uint"; val: number }
  | { type: "float"; val: number };

export class Tracker {
  private bitsIdx = 0;
  private dict: string[] = [];
  private data: PrimitiveValue[] = [];
  constructor(private bits: boolean[] = [], private reader: Reader = new Reader(new Uint8Array())) {}
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
  pushStringDiff(a: string, b: string) {
    if (!this.dict.includes(a)) {
      this.dict.push(a);
    }
    this.pushBoolean(a !== b);
    if (a !== b) {
      this.pushString(b);
    }
  }
  pushIntDiff(a: number, b: number) {
    this.pushBoolean(a !== b);
    if (a !== b) {
      this.pushInt(b);
    }
  }
  pushUIntDiff(a: number, b: number) {
    this.pushBoolean(a !== b);
    if (a !== b) {
      this.pushUInt(b);
    }
  }
  pushFloatDiff(a: number, b: number) {
    const changed = Math.abs(a - b) > 0.00001;
    this.pushBoolean(changed);
    if (changed) {
      this.pushFloat(b);
    }
  }
  pushBooleanDiff(a: boolean, b: boolean) {
    this.pushBoolean(a !== b);
  }
  pushOptionalDiffPrimitive<T>(
    a: T | undefined,
    b: T | undefined,
    encode: (x: T) => void,
  ) {
    if (a == null) {
      this.pushBoolean(b != null);
      if (b != null) {
        // null → value
        encode(b);
      }
      // else null → null
    } else {
      const changed = b == null || a !== b;
      this.pushBoolean(changed);
      if (changed) {
        this.pushBoolean(b != null);
        if (b != null) {
          // value → value
          encode(b);
        }
        // else value → null
      }
    }
  }
  pushOptionalDiff<T>(
    a: T | undefined,
    b: T | undefined,
    encode: (x: T) => void,
    encodeDiff: (a: T, b: T) => void,
  ) {
    if (a == null) {
      this.pushBoolean(b != null);
      if (b != null) {
        // null → value
        encode(b);
      }
      // else null → null
    } else {
      this.pushBoolean(b != null);
      if (b != null) {
        // value → value
        encodeDiff(a, b);
      }
      // else value → null
    }
  }
  pushArrayDiff<T>(
    a: T[],
    b: T[],
    equals: (x: T, y: T) => boolean,
    encode: (x: T) => void,
    encodeDiff: (a: T, b: T) => void,
  ) {
    const changed = a.length !== b.length || !equalsArray(a, b, equals);
    this.pushBoolean(changed);
    if (!changed) {
      return;
    }

    this.pushUInt(b.length);
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      this.pushBoolean(!equals(a[i], b[i]));
      if (!equals(a[i], b[i])) {
        encodeDiff(a[i], b[i]);
      }
    }
    for (let i = a.length; i < b.length; i++) {
      encode(b[i]);
    }
  }
  pushRecordDiff<K, T>(
    a: Map<K, T>,
    b: Map<K, T>,
    equals: (x: T, y: T) => boolean,
    encodeKey: (x: K) => void,
    encodeVal: (x: T) => void,
    encodeDiff: (a: T, b: T) => void,
  ) {
    const changed = a.size !== b.size || !equalsRecord(a, b, (x, y) => x === y, equals);
    this.pushBoolean(changed);
    if (!changed) {
      return;
    }

    const orderedKeys = [...a.keys()].sort();

    const updates: number[] = [];
    const deletions: number[] = [];
    orderedKeys.forEach((aKey, i) => {
      if (b.has(aKey)) {
        if (!equals(a.get(aKey)!, b.get(aKey)!)) {
          updates.push(i);
        }
      } else {
        deletions.push(i);
      }
    });
    const additions: [K, T][] = [];
    b.forEach((bVal, bKey) => {
      if (!a.has(bKey)) {
        additions.push([bKey, bVal]);
      }
    });

    if (a.size > 0) {
      this.pushUInt(deletions.length);
      deletions.forEach((idx) => {
        this.pushUInt(idx);
      });
      this.pushUInt(updates.length);
      updates.forEach((idx) => {
        this.pushUInt(idx);
        const key = orderedKeys[idx];
        encodeDiff(a.get(key)!, b.get(key)!);
      });
    }
    this.pushUInt(additions.length);
    additions.forEach(([key, val]) => {
      encodeKey(key);
      encodeVal(val);
    });
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
  nextStringDiff(a: string) {
    if (!this.dict.includes(a)) {
      this.dict.push(a);
    }
    const changed = this.nextBoolean();
    return changed ? this.nextString() : a;
  }
  nextIntDiff(a: number) {
    const changed = this.nextBoolean();
    return changed ? this.nextInt() : a;
  }
  nextUIntDiff(a: number) {
    const changed = this.nextBoolean();
    return changed ? this.nextUInt() : a;
  }
  nextFloatDiff(a: number) {
    const changed = this.nextBoolean();
    return changed ? this.nextFloat() : a;
  }
  nextBooleanDiff(a: boolean) {
    const changed = this.nextBoolean();
    return changed ? !a : a;
  }
  nextOptionalDiffPrimitive<T>(
    obj: T | undefined,
    decode: () => T,
  ): T | undefined {
    if (obj == null) {
      const present = this.nextBoolean();
      return present ? decode() : undefined;
    } else {
      const changed = this.nextBoolean();
      if (!changed) {
        return obj;
      }
      const present = this.nextBoolean();
      return present ? decode() : undefined;
    }
  }
  nextOptionalDiff<T>(
    obj: T | undefined,
    decode: () => T,
    decodeDiff: (a: T) => T,
  ): T | undefined {
    if (obj == null) {
      const present = this.nextBoolean();
      return present ? decode() : undefined;
    } else {
      const present = this.nextBoolean();
      return present ? decodeDiff(obj) : undefined;
    }
  }
  nextArrayDiff<T>(
    arr: T[],
    decode: () => T,
    decodeDiff: (a: T) => T,
  ): T[] {
    const changed = this.nextBoolean();
    if (!changed) {
      return arr;
    }

    const newLen = this.nextUInt();
    const newArr: T[] = new Array<T>(newLen);
    const minLen = Math.min(arr.length, newLen);
    for (let i = 0; i < minLen; i++) {
      const changed = this.nextBoolean();
      newArr[i] = changed ? decodeDiff(arr[i]) : arr[i];
    }
    for (let i = arr.length; i < newLen; i++) {
      newArr[i] = decode();
    }
    return newArr;
  }
  nextRecordDiff<K, T>(
    obj: Map<K, T>,
    decodeKey: () => K,
    decodeVal: () => T,
    decodeDiff: (a: T) => T,
  ): Map<K, T> {
    const changed = this.nextBoolean();
    if (!changed) {
      return obj;
    }

    const result: Map<K, T> = new Map(obj);
    const orderedKeys = [...obj.keys()].sort();

    if (obj.size > 0) {
      const numDeletions = this.nextUInt();
      for (let i = 0; i < numDeletions; i++) {
        const key = orderedKeys[this.nextUInt()];
        result.delete(key);
      }
      const numUpdates = this.nextUInt();
      for (let i = 0; i < numUpdates; i++) {
        const key = orderedKeys[this.nextUInt()];
        result.set(key, decodeDiff(result.get(key)!));
      }
    }
    const numAdditions = this.nextUInt();
    for (let i = 0; i < numAdditions; i++) {
      const key = decodeKey();
      const val = decodeVal();
      result.set(key, val);
    }

    return result;
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
    if (!equals(a[i], b[i])) {
      return false;
    }
  }
  return true;
}
export function equalsRecord<K, T>(
  a: Map<K, T>,
  b: Map<K, T>,
  keyEquals: (x: K, y: K) => boolean,
  valueEquals: (x: T, y: T) => boolean,
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
