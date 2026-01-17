import { floatRead, utf8Read, RleReader } from "./serde";

export class Decoder {
  protected static _instance: Decoder | null = null;

  protected bytes!: Uint8Array;
  protected pos = 0;
  protected dict: string[] = [];
  protected rle = new RleReader();

  static create(buf: Uint8Array): Decoder {
    const dec = (Decoder._instance ??= new Decoder());
    dec.bytes = buf;
    dec.pos = 0;
    dec.dict = [];
    dec.rle.reset(buf);
    return dec;
  }

  protected constructor() {}

  nextString() {
    const lenOrIdx = this.readVarint();
    if (lenOrIdx === 0) {
      return "";
    }
    if (lenOrIdx > 0) {
      const str = this.readStringUtf8(lenOrIdx);
      this.dict.push(str);
      return str;
    }
    return this.dict[-lenOrIdx - 1]!;
  }

  nextInt() {
    return this.readVarint();
  }

  nextBoundedInt(min: number) {
    return this.readUVarint() + min;
  }

  nextFloat() {
    return this.readFloat();
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
    const len = this.readUVarint();
    const arr = new Array<T>(len);
    for (let i = 0; i < len; i++) {
      arr[i] = innerRead();
    }
    return arr;
  }

  nextRecord<K, T>(innerKeyRead: () => K, innerValRead: () => T): Map<K, T> {
    const len = this.readUVarint();
    const obj: Map<K, T> = new Map();
    for (let i = 0; i < len; i++) {
      obj.set(innerKeyRead(), innerValRead());
    }
    return obj;
  }

  protected readVarint() {
    const val = this.readUVarint();
    return val % 2 === 0 ? val / 2 : -(val + 1) / 2;
  }

  protected readUVarint() {
    let result = 0;
    let multiplier = 1;
    while (true) {
      const byte = this.bytes[this.pos++]!;
      result += (byte & 0x7f) * multiplier;
      if (byte < 0x80) {
        return result;
      }
      multiplier *= 128;
    }
  }

  protected readFloat() {
    const val = floatRead(this.bytes, this.pos);
    this.pos += 4;
    return val;
  }

  protected readStringUtf8(len: number): string {
    const start = this.pos;
    this.pos += len;
    return utf8Read(this.bytes, start, len);
  }
}

export class DiffDecoder extends Decoder {
  protected static override _instance: DiffDecoder | null = null;

  static override create(buf: Uint8Array): DiffDecoder {
    const dec = (DiffDecoder._instance ??= new DiffDecoder());
    dec.bytes = buf;
    dec.pos = 0;
    dec.dict = [];
    dec.rle.reset(buf);
    return dec;
  }

  nextStringDiff(a: string) {
    if (!this.dict.includes(a)) {
      this.dict.push(a);
    }
    return this.nextString();
  }

  nextIntDiff(_a: number) {
    return this.nextInt();
  }

  nextBoundedIntDiff(_a: number, min: number) {
    return this.nextBoundedInt(min);
  }

  nextFloatDiff(_a: number) {
    return this.nextFloat();
  }

  nextFloatQuantizedDiff(_a: number, precision: number) {
    return this.nextFloatQuantized(precision);
  }

  // Boolean diff is special - the change bit IS the diff
  nextBooleanDiff(a: boolean) {
    const changed = this.nextBoolean();
    return changed ? !a : a;
  }

  nextEnumDiff(_a: number, numBits: number): number {
    return this.nextEnum(numBits);
  }

  // Object diff - reads change bit and returns old or decoded object
  nextObjectDiff<T>(a: T, decodeDiff: () => T): T {
    return this.nextBoolean() ? decodeDiff() : a;
  }

  // Generic field diff - reads change bit and returns old or new value
  nextFieldDiff<T>(a: T, decodeDiff: (a: T) => T): T {
    return this.nextBoolean() ? decodeDiff(a) : a;
  }

  nextOptionalDiff<T>(obj: T | undefined, decode: () => T, decodeDiff: (a: T) => T): T | undefined {
    // Optimization: if obj was null, we know new value must be non-null (else changed would be false)
    // So skip reading the present bit in null→value case
    if (obj == null) {
      return decode();
    } else {
      const present = this.nextBoolean();
      return present ? decodeDiff(obj) : undefined;
    }
  }

  nextArrayDiff<T>(arr: T[], decode: () => T, decodeDiff: (a: T) => T): T[] {
    const newLen = this.readUVarint();

    // Start with copy of old array (truncated to new length)
    const newArr = arr.slice(0, Math.min(arr.length, newLen));

    // Apply updates (sparse)
    const numUpdates = this.readUVarint();
    for (let i = 0; i < numUpdates; i++) {
      const idx = this.readUVarint();
      newArr[idx] = decodeDiff(arr[idx]!);
    }

    // Read additions
    for (let i = arr.length; i < newLen; i++) {
      newArr.push(decode());
    }

    return newArr;
  }

  nextRecordDiff<K, T>(obj: Map<K, T>, decodeKey: () => K, decodeVal: () => T, decodeDiff: (a: T) => T): Map<K, T> {
    const result: Map<K, T> = new Map(obj);
    if (obj.size > 0) {
      const numDeletions = this.readUVarint();
      for (let i = 0; i < numDeletions; i++) {
        const key = decodeKey();
        result.delete(key);
      }
      const numUpdates = this.readUVarint();
      for (let i = 0; i < numUpdates; i++) {
        const key = decodeKey();
        result.set(key, decodeDiff(result.get(key)!));
      }
    }
    const numAdditions = this.readUVarint();
    for (let i = 0; i < numAdditions; i++) {
      const key = decodeKey();
      const val = decodeVal();
      result.set(key, val);
    }
    return result;
  }
}
