import { Reader } from "bin-serde";
import { RleDecoder } from "./rle.js";

export class Decoder {
  private static _instance: Decoder | null = null;

  private dict: string[] = [];
  private rle = new RleDecoder();
  private reader: Reader;

  static create(buf: Uint8Array): Decoder {
    const dec = (Decoder._instance ??= new Decoder(buf));
    dec.dict = [];
    dec.rle.reset(buf);
    dec.reader.reset(buf);
    return dec;
  }
  private constructor(buf: Uint8Array) {
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
  nextBoundedInt(min: number) {
    return this.reader.readUVarint() + min;
  }
  nextBoundedIntDiff(a: number, min: number) {
    return this.nextUIntDiff(a - min) + min;
  }
  nextFloat() {
    return this.reader.readFloat();
  }
  nextFloatQuantized(precision: number) {
    return this.nextInt() * precision;
  }
  nextBoolean() {
    return this.rle.nextBit();
  }
  nextEnum(numBits: number): number {
    return this.rle.nextBits(numBits);
  }
  nextOptional<T>(innerRead: () => T): T | undefined {
    return this.nextBoolean() ? innerRead() : undefined;
  }
  nextArray<T>(innerRead: () => T): T[] {
    const len = this.reader.readUVarint();
    const arr = new Array<T>(len);
    for (let i = 0; i < len; i++) {
      arr[i] = innerRead();
    }
    return arr;
  }
  nextRecord<K, T>(innerKeyRead: () => K, innerValRead: () => T): Map<K, T> {
    const len = this.reader.readUVarint();
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

    const newLen = this.reader.readUVarint();
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
      const numDeletions = this.reader.readUVarint();
      for (let i = 0; i < numDeletions; i++) {
        const key = orderedKeys[this.reader.readUVarint()]!;
        result.delete(key);
      }
      const numUpdates = this.reader.readUVarint();
      for (let i = 0; i < numUpdates; i++) {
        const key = orderedKeys[this.reader.readUVarint()]!;
        result.set(key, decodeDiff(result.get(key)!));
      }
    }
    const numAdditions = this.reader.readUVarint();
    for (let i = 0; i < numAdditions; i++) {
      const key = decodeKey();
      const val = decodeVal();
      result.set(key, val);
    }

    return result;
  }

  private nextUIntDiff(a: number) {
    const changed = this.nextBoolean();
    return changed ? this.reader.readUVarint() : a;
  }
}
