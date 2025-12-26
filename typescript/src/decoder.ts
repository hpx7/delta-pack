import { Reader } from "bin-serde";
import { rleDecode } from "./rle.js";

export class Decoder {
  private dict: string[] = [];
  private nextBit: () => boolean;
  private reader: Reader;

  constructor(buf: Uint8Array) {
    this.nextBit = rleDecode(buf);
    this.reader = new Reader(buf);
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
    return this.dict[-lenOrIdx - 1]!;
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
  nextFloatQuantized(precision: number) {
    return this.nextInt() * precision;
  }
  nextBoolean() {
    return this.nextBit();
  }
  nextEnum(numBits: number): number {
    // Read bits from most significant to least significant
    let val = 0;
    for (let i = 0; i < numBits; i++) {
      val = (val << 1) | (this.nextBit() ? 1 : 0);
    }
    return val;
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
  nextFloatQuantizedDiff(a: number, precision: number) {
    const changed = this.nextBoolean();
    return changed ? this.nextFloatQuantized(precision) : a;
  }
  nextBooleanDiff(a: boolean) {
    const changed = this.nextBoolean();
    return changed ? !a : a;
  }
  nextEnumDiff(a: number, numBits: number): number {
    const changed = this.nextBoolean();
    return changed ? this.nextEnum(numBits) : a;
  }
  nextOptionalDiffPrimitive<T>(obj: T | undefined, decode: () => T): T | undefined {
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
  nextOptionalDiff<T>(obj: T | undefined, decode: () => T, decodeDiff: (a: T) => T): T | undefined {
    if (obj == null) {
      const present = this.nextBoolean();
      return present ? decode() : undefined;
    } else {
      const present = this.nextBoolean();
      return present ? decodeDiff(obj) : undefined;
    }
  }
  nextArrayDiff<T>(arr: T[], decode: () => T, decodeDiff: (a: T) => T): T[] {
    const changed = this.nextBoolean();
    if (!changed) {
      return arr;
    }

    const newLen = this.nextUInt();
    const newArr: T[] = [];
    const minLen = Math.min(arr.length, newLen);
    for (let i = 0; i < minLen; i++) {
      const changed = this.nextBoolean();
      newArr.push(changed ? decodeDiff(arr[i]!) : arr[i]!);
    }
    for (let i = arr.length; i < newLen; i++) {
      newArr.push(decode());
    }
    return newArr;
  }
  nextRecordDiff<K, T>(obj: Map<K, T>, decodeKey: () => K, decodeVal: () => T, decodeDiff: (a: T) => T): Map<K, T> {
    const changed = this.nextBoolean();
    if (!changed) {
      return obj;
    }

    const result: Map<K, T> = new Map(obj);
    const orderedKeys = [...obj.keys()].sort();

    if (obj.size > 0) {
      const numDeletions = this.nextUInt();
      for (let i = 0; i < numDeletions; i++) {
        const key = orderedKeys[this.nextUInt()]!;
        result.delete(key);
      }
      const numUpdates = this.nextUInt();
      for (let i = 0; i < numUpdates; i++) {
        const key = orderedKeys[this.nextUInt()]!;
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
}
