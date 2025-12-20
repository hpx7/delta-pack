import { Writer } from "bin-serde";
import utf8BufferSize from "utf8-buffer-size";
import { equalsFloat, equalsArray, equalsRecord } from "./helpers.js";
import { rleEncode } from "./rle.js";

export class Encoder {
  private dict: string[] = [];
  private bits: boolean[] = [];
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
  pushUInt(val: number) {
    this.writer.writeUVarint(val);
  }
  pushFloat(val: number) {
    this.writer.writeFloat(val);
  }
  pushFloatQuantized(val: number, precision: number) {
    this.pushInt(Math.round(val / precision));
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
    this.pushUInt(b.length);
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
      this.pushUInt(deletions.length);
      deletions.forEach((idx) => {
        this.pushUInt(idx);
      });
      this.pushUInt(updates.length);
      updates.forEach((idx) => {
        this.pushUInt(idx);
        const key = orderedKeys[idx]!;
        encodeDiff(a.get(key)!, b.get(key)!);
      });
    }
    this.pushUInt(additions.length);
    additions.forEach(([key, val]) => {
      encodeKey(key);
      encodeVal(val);
    });
  }
  toBuffer() {
    rleEncode(this.bits, this.writer);
    return this.writer.toBuffer();
  }
}
