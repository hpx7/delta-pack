import { equalsFloat, equalsArray, equalsRecord } from "./helpers.js";
import { allocFromSlab, copyBuffer, floatWrite, utf8Size, utf8Write, utf8Encode, RleWriter } from "./serde.js";

export class Encoder {
  private static _instance: Encoder | null = null;

  private bytes = allocFromSlab(256);
  private pos!: number;
  private dict!: string[];
  private rle = new RleWriter();

  static create(): Encoder {
    const enc = Encoder._instance ?? new Encoder();
    Encoder._instance = null;
    enc.pos = 0;
    enc.dict = [];
    enc.rle.reset();
    return enc;
  }
  private constructor() {}

  pushString(val: string) {
    if (val === "") {
      this.writeVarint(0);
      return;
    }
    const idx = this.dict.indexOf(val);
    if (idx >= 0) {
      this.writeVarint(-idx - 1);
      return;
    }

    this.dict.push(val);

    // Fast path: strings ≤21 chars have max 63 UTF-8 bytes, fits in 1-byte zigzag varint
    if (val.length <= 21) {
      this.writeStringFastPath(val);
      return;
    }

    // Standard path: compute byte count first for longer strings
    const len = utf8Size(val);
    this.writeVarint(len);
    this.writeStringUtf8(val, len);
  }

  pushInt(val: number) {
    this.writeVarint(val);
  }

  pushBoundedInt(val: number, min: number) {
    this.writeUVarint(val - min);
  }

  pushFloat(val: number) {
    this.writeFloat(val);
  }

  pushFloatQuantized(val: number, precision: number) {
    this.pushInt(Math.round(val / precision));
  }

  pushBoolean(val: boolean) {
    this.rle.pushBit(val);
  }

  pushEnum(val: number, numBits: number) {
    this.rle.pushBits(val, numBits);
  }

  pushOptional<T>(val: T | undefined, innerWrite: (x: T) => void) {
    this.pushBoolean(val != null);
    if (val != null) {
      innerWrite(val);
    }
  }

  pushArray<T>(val: T[], innerWrite: (x: T) => void) {
    this.writeUVarint(val.length);
    for (const item of val) {
      innerWrite(item);
    }
  }

  pushRecord<K, T>(val: Map<K, T>, innerKeyWrite: (x: K) => void, innerValWrite: (x: T) => void) {
    this.writeUVarint(val.size);
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

  pushBoundedIntDiff(a: number, b: number, min: number) {
    this.pushBoolean(a !== b);
    if (a !== b) {
      this.writeUVarint(b - min);
    }
  }
  pushFloatDiff(a: number, b: number) {
    const changed = !equalsFloat(a, b);
    this.pushBoolean(changed);
    if (changed) {
      this.pushFloat(b);
    }
  }

  pushFloatQuantizedDiff(a: number, b: number, precision: number) {
    this.pushIntDiff(Math.round(a / precision), Math.round(b / precision));
  }

  pushBooleanDiff(a: boolean, b: boolean) {
    this.pushBoolean(a !== b);
  }

  pushEnumDiff(a: number, b: number, numBits: number) {
    this.pushBoolean(a !== b);
    if (a !== b) {
      this.pushEnum(b, numBits);
    }
  }

  pushOptionalDiffPrimitive<T>(
    a: T | undefined,
    b: T | undefined,
    equals: (a: T, b: T) => boolean,
    encode: (x: T) => void
  ) {
    if (a == null) {
      this.pushBoolean(b != null);
      if (b != null) {
        // null → value
        encode(b);
      }
      // else null → null
    } else {
      const changed = b == null || !equals(a, b);
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

  pushOptionalDiff<T>(a: T | undefined, b: T | undefined, encode: (x: T) => void, encodeDiff: (a: T, b: T) => void) {
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
    b: T[] & { _dirty?: Set<number> },
    equals: (x: T, y: T) => boolean,
    encode: (x: T) => void,
    encodeDiff: (a: T, b: T) => void
  ) {
    const dirty = b._dirty;
    const changed = dirty != null ? dirty.size > 0 || a.length !== b.length : !equalsArray(a, b, equals);
    this.pushBoolean(changed);
    if (!changed) {
      return;
    }
    this.writeUVarint(b.length);
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      const elementChanged = dirty != null ? dirty.has(i) : !equals(a[i]!, b[i]!);
      this.pushBoolean(elementChanged);
      if (elementChanged) {
        encodeDiff(a[i]!, b[i]!);
      }
    }
    for (let i = a.length; i < b.length; i++) {
      encode(b[i]!);
    }
  }

  pushRecordDiff<K, T>(
    a: Map<K, T>,
    b: Map<K, T> & { _dirty?: Set<K> },
    equals: (x: T, y: T) => boolean,
    encodeKey: (x: K) => void,
    encodeVal: (x: T) => void,
    encodeDiff: (a: T, b: T) => void
  ) {
    const dirty = b._dirty;
    const changed = dirty != null ? dirty.size > 0 : !equalsRecord(a, b, (x, y) => x === y, equals);
    this.pushBoolean(changed);
    if (!changed) {
      return;
    }
    const updates: K[] = [];
    const deletions: K[] = [];
    const additions: [K, T][] = [];
    if (dirty != null) {
      // With dirty tracking: only process dirty keys
      dirty.forEach((dirtyKey) => {
        if (a.has(dirtyKey) && b.has(dirtyKey)) {
          // Key exists in both - it's an update
          updates.push(dirtyKey);
        } else if (!a.has(dirtyKey) && b.has(dirtyKey)) {
          // Key not in a - it's an addition
          additions.push([dirtyKey, b.get(dirtyKey)!]);
        } else if (a.has(dirtyKey) && !b.has(dirtyKey)) {
          // Key in a but not in b - it's a deletion
          deletions.push(dirtyKey);
        }
      });
    } else {
      // Without dirty tracking: check all keys
      a.forEach((aVal, aKey) => {
        if (b.has(aKey)) {
          if (!equals(aVal, b.get(aKey)!)) {
            updates.push(aKey);
          }
        } else {
          deletions.push(aKey);
        }
      });
      b.forEach((bVal, bKey) => {
        if (!a.has(bKey)) {
          additions.push([bKey, bVal]);
        }
      });
    }
    if (a.size > 0) {
      this.writeUVarint(deletions.length);
      deletions.forEach((key) => {
        encodeKey(key);
      });
      this.writeUVarint(updates.length);
      updates.forEach((key) => {
        encodeKey(key);
        encodeDiff(a.get(key)!, b.get(key)!);
      });
    }
    this.writeUVarint(additions.length);
    additions.forEach(([key, val]) => {
      encodeKey(key);
      encodeVal(val);
    });
  }

  toBuffer() {
    const rleBytes = this.rle.toBytes();
    this.ensureSize(rleBytes.length);
    for (let i = 0; i < rleBytes.length; i++) {
      this.bytes[this.pos++] = rleBytes[i]!;
    }
    Encoder._instance = this;
    return copyBuffer(this.bytes.subarray(0, this.pos));
  }

  private writeVarint(val: number) {
    const encoded = val >= 0 ? val * 2 : val * -2 - 1;
    this.writeUVarint(encoded);
  }

  private writeUVarint(val: number) {
    if (val <= 0xfffffff) {
      this.ensureSize(4);
      while (val >= 0x80) {
        this.bytes[this.pos++] = (val & 0x7f) | 0x80;
        val >>>= 7;
      }
    } else {
      this.ensureSize(8);
      while (val >= 0x80) {
        this.bytes[this.pos++] = (val & 0x7f) | 0x80;
        val = Math.floor(val / 128);
      }
    }
    this.bytes[this.pos++] = val;
  }

  private writeFloat(val: number) {
    this.ensureSize(4);
    floatWrite(val, this.bytes, this.pos);
    this.pos += 4;
  }

  private writeStringUtf8(val: string, len: number) {
    this.ensureSize(len);
    utf8Write(val, this.bytes, this.pos, len);
    this.pos += len;
  }

  private writeStringFastPath(val: string) {
    this.ensureSize(1 + val.length * 3); // max utf8 size
    const lengthPos = this.pos++;
    const written = utf8Encode(val, this.bytes, this.pos);
    this.bytes[lengthPos] = written * 2; // Zigzag encode: positive n → n*2
    this.pos += written;
  }

  private ensureSize(size: number) {
    if (this.bytes.length >= this.pos + size) {
      return;
    }
    let newSize = this.bytes.length * 2;
    while (newSize < this.pos + size) {
      newSize *= 2;
    }
    const newBytes = allocFromSlab(newSize);
    newBytes.set(this.bytes);
    this.bytes = newBytes;
  }
}
