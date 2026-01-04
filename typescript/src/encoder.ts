import { Writer } from "bin-serde";
import utf8BufferSize from "utf8-buffer-size";
import { equalsFloat, equalsArray, equalsRecord } from "./helpers.js";
import { RleEncoder } from "./rle.js";

export class Encoder {
  private dict: string[] = [];
  private rle = new RleEncoder();
  private writer = new Writer();

  pushString(val: string) {
    if (val === "") {
      this.writer.writeVarint(0);
      return;
    }
    const idx = this.dict.indexOf(val);
    if (idx < 0) {
      this.dict.push(val);
      const len = utf8BufferSize(val);
      this.writer.writeVarint(len);
      this.writer.writeStringUtf8(val, len);
    } else {
      this.writer.writeVarint(-idx - 1);
    }
  }
  pushInt(val: number) {
    this.writer.writeVarint(val);
  }
  pushBoundedInt(val: number, min: number) {
    this.writer.writeUVarint(val - min);
  }
  pushBoundedIntDiff(a: number, b: number, min: number) {
    this.pushUIntDiff(a - min, b - min);
  }
  pushFloat(val: number) {
    this.writer.writeFloat(val);
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
    this.writer.writeUVarint(val.length);
    for (const item of val) {
      innerWrite(item);
    }
  }
  pushRecord<K, T>(val: Map<K, T>, innerKeyWrite: (x: K) => void, innerValWrite: (x: T) => void) {
    this.writer.writeUVarint(val.size);
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
  pushOptionalDiffPrimitive<T>(a: T | undefined, b: T | undefined, encode: (x: T) => void) {
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
    this.writer.writeUVarint(b.length);
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

    const orderedKeys = [...a.keys()].sort();
    const updates: number[] = [];
    const deletions: number[] = [];
    const additions: [K, T][] = [];

    if (dirty != null) {
      // With dirty tracking: only process dirty keys
      dirty.forEach((dirtyKey) => {
        if (a.has(dirtyKey) && b.has(dirtyKey)) {
          // Key exists in both - it's an update
          const idx = orderedKeys.indexOf(dirtyKey);
          updates.push(idx);
        } else if (!a.has(dirtyKey) && b.has(dirtyKey)) {
          // Key not in a - it's an addition
          additions.push([dirtyKey, b.get(dirtyKey)!]);
        } else if (a.has(dirtyKey) && !b.has(dirtyKey)) {
          // Key in a but not in b - it's a deletion
          const idx = orderedKeys.indexOf(dirtyKey);
          deletions.push(idx);
        }
      });
    } else {
      // Without dirty tracking: check all keys
      orderedKeys.forEach((aKey, i) => {
        if (b.has(aKey)) {
          if (!equals(a.get(aKey)!, b.get(aKey)!)) {
            updates.push(i);
          }
        } else {
          deletions.push(i);
        }
      });
      b.forEach((bVal, bKey) => {
        if (!a.has(bKey)) {
          additions.push([bKey, bVal]);
        }
      });
    }

    if (a.size > 0) {
      this.writer.writeUVarint(deletions.length);
      deletions.forEach((idx) => {
        this.writer.writeUVarint(idx);
      });
      this.writer.writeUVarint(updates.length);
      updates.forEach((idx) => {
        this.writer.writeUVarint(idx);
        const key = orderedKeys[idx]!;
        encodeDiff(a.get(key)!, b.get(key)!);
      });
    }
    this.writer.writeUVarint(additions.length);
    additions.forEach(([key, val]) => {
      encodeKey(key);
      encodeVal(val);
    });
  }
  toBuffer() {
    this.rle.finalize(this.writer);
    return this.writer.toBuffer();
  }

  private pushUIntDiff(a: number, b: number) {
    this.pushBoolean(a !== b);
    if (a !== b) {
      this.writer.writeUVarint(b);
    }
  }
}
