import { allocFromSlab, copyBuffer, floatWrite, utf8Size, utf8Write, utf8Encode, RleWriter } from "./serde.js";
import { getFieldVersions, getCreatedVersions, getDeletedVersions } from "./tracking.js";
import { equalsFloat, equalsFloatQuantized } from "./helpers.js";

export class Encoder {
  protected static _instance: Encoder | null = null;

  protected bytes = allocFromSlab(256);
  protected pos = 0;
  protected dict: string[] = [];
  protected rle = new RleWriter();

  static create(): Encoder {
    const enc = Encoder._instance ?? new Encoder();
    Encoder._instance = null;
    enc.pos = 0;
    enc.dict = [];
    enc.rle.reset();
    return enc;
  }

  protected constructor() {}

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
    if (!Number.isInteger(val)) {
      throw new RangeError(`Invalid int: ${val}`);
    }
    this.writeVarint(val);
  }

  pushBoundedInt(val: number, min: number) {
    if (!Number.isInteger(val)) {
      throw new RangeError(`Invalid int: ${val}`);
    }
    if (val < min) {
      throw new RangeError(`Int ${val} below minimum ${min}`);
    }
    this.writeUVarint(val - min);
  }

  pushFloat(val: number) {
    this.writeFloat(val);
  }

  pushFloatQuantized(val: number, precision: number) {
    if (!Number.isFinite(val)) {
      throw new RangeError(`Invalid quantized float: ${val}`);
    }
    this.pushInt(Math.round(val / precision));
  }

  pushBoolean(val: boolean) {
    this.rle.pushBit(val);
  }

  pushEnum(val: number, numBits: number) {
    if (val < 0 || val >= 2 ** numBits) {
      throw new RangeError(`Value ${val} out of range for ${numBits} bits`);
    }
    this.rle.pushBits(val, numBits);
  }

  pushBitPackedInt(val: number, min: number, max: number, numBits: number) {
    if (!Number.isInteger(val) || val < min || val > max) {
      throw new RangeError(`Int ${val} outside [${min}, ${max}]`);
    }
    this.rle.pushBits(val - min, numBits);
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

  toBuffer() {
    const rleBytes = this.rle.toBytes();
    this.ensureSize(rleBytes.length);
    for (let i = 0; i < rleBytes.length; i++) {
      this.bytes[this.pos++] = rleBytes[i]!;
    }
    Encoder._instance = this;
    return copyBuffer(this.bytes.subarray(0, this.pos));
  }

  protected writeVarint(val: number) {
    const zigzagEncoded = val >= 0 ? val * 2 : val * -2 - 1;
    this.writeUVarint(zigzagEncoded);
  }

  protected writeUVarint(val: number) {
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

  protected writeFloat(val: number) {
    this.ensureSize(4);
    floatWrite(val, this.bytes, this.pos);
    this.pos += 4;
  }

  protected writeStringUtf8(val: string, len: number) {
    this.ensureSize(len);
    utf8Write(val, this.bytes, this.pos, len);
    this.pos += len;
  }

  protected writeStringFastPath(val: string) {
    this.ensureSize(1 + val.length * 3); // max utf8 size
    const lengthPos = this.pos++;
    const written = utf8Encode(val, this.bytes, this.pos);
    this.bytes[lengthPos] = written * 2; // Zigzag encode: positive n → n*2
    this.pos += written;
  }

  protected ensureSize(size: number) {
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

export class DiffEncoder extends Encoder {
  protected static override _instance: DiffEncoder | null = null;

  /**
   * Snapshot baseline version threaded through the entire encode. Set once
   * by the top-level `encodeDiff(a, b)` wrapper from
   * `getSnapshotVersion(a) ?? -1`, then read by every nested diff method
   * instead of looking up the per-node snapshot stamp the previous design
   * paid for at every tree level.
   */
  minVersion = -1;

  static override create(): DiffEncoder {
    const enc = DiffEncoder._instance ?? new DiffEncoder();
    DiffEncoder._instance = null;
    enc.pos = 0;
    enc.dict = [];
    enc.rle.reset();
    enc.minVersion = -1;
    return enc;
  }

  override toBuffer() {
    const rleBytes = this.rle.toBytes();
    this.ensureSize(rleBytes.length);
    for (let i = 0; i < rleBytes.length; i++) {
      this.bytes[this.pos++] = rleBytes[i]!;
    }
    DiffEncoder._instance = this;
    return copyBuffer(this.bytes.subarray(0, this.pos));
  }

  pushStringDiff(a: string, b: string) {
    if (!this.dict.includes(a)) {
      this.dict.push(a);
    }
    this.pushString(b);
  }

  pushIntDiff(_a: number, b: number) {
    this.pushInt(b);
  }

  pushBoundedIntDiff(_a: number, b: number, min: number) {
    this.pushBoundedInt(b, min);
  }

  pushFloatDiff(_a: number, b: number) {
    this.pushFloat(b);
  }

  pushFloatQuantizedDiff(_a: number, b: number, precision: number) {
    this.pushFloatQuantized(b, precision);
  }

  // Boolean diff is special - the change bit IS the diff
  pushBooleanDiff(a: boolean, b: boolean) {
    this.pushBoolean(a !== b);
  }

  pushEnumDiff(_a: number, b: number, numBits: number) {
    this.pushEnum(b, numBits);
  }

  pushBitPackedIntDiff(_a: number, b: number, min: number, max: number, numBits: number) {
    this.pushBitPackedInt(b, min, max, numBits);
  }

  // Object diff - handles dirty tracking and change bit. encodeDiff receives
  // (a, b, encoder) so the generated code can pass the static `_encodeDiff`
  // method directly without allocating a wrapping closure per call.
  pushObjectDiff<T>(
    a: T,
    b: T,
    equals: (a: T, b: T) => boolean,
    encodeDiff: (a: T, b: T, encoder: DiffEncoder) => void
  ) {
    const versions = getFieldVersions(b);

    let changed = false;
    if (versions != null) {
      const minVersion = this.minVersion;
      for (const [, ver] of versions) {
        if (ver > minVersion) {
          changed = true;
          break;
        }
      }
    } else {
      changed = !equals(a, b);
    }

    this.pushBoolean(changed);
    if (changed) encodeDiff(a, b, this);
  }

  // ---- Per-field diff helpers --------------------------------------------------------------
  //
  // Generated code (both AOT and JIT) uses these for the per-field diff loop. Each helper
  // gates on the dirty version filter (skipping the field entirely if no mutation has
  // happened since the snapshot baseline), then falls back to a value compare and pushes
  // either a 0 bit (no change) or a 1 bit + the diff payload.
  //
  // Type-specialized variants (pushFieldString, pushFieldInt, …) avoid the closure
  // allocations the previous closure-passing form paid at every call site. Composite
  // field types (object, union, self-ref) use `pushFieldDiff` with the type's static
  // `equals` and `_encodeDiff` method references — also no closures. Array/record/optional
  // fields fall back to inline if/else blocks in the generator (closures inside those only
  // allocate when the field is dirty), since a helper would force unconditional allocation.

  /** True if `key` should be encoded — untracked source, or version > snapshot baseline. */
  private isFieldDirty(versions: Map<unknown, number> | undefined, key: string): boolean {
    return versions === undefined || (versions.get(key) ?? -1) > this.minVersion;
  }

  pushFieldString(versions: Map<unknown, number> | undefined, key: string, aVal: string, bVal: string): void {
    if (!this.isFieldDirty(versions, key)) {
      this.pushBoolean(false);
      return;
    }
    const changed = aVal !== bVal;
    this.pushBoolean(changed);
    if (changed) this.pushStringDiff(aVal, bVal);
  }

  pushFieldInt(versions: Map<unknown, number> | undefined, key: string, aVal: number, bVal: number): void {
    if (!this.isFieldDirty(versions, key)) {
      this.pushBoolean(false);
      return;
    }
    const changed = aVal !== bVal;
    this.pushBoolean(changed);
    if (changed) this.pushIntDiff(aVal, bVal);
  }

  pushFieldBoundedInt(
    versions: Map<unknown, number> | undefined,
    key: string,
    aVal: number,
    bVal: number,
    min: number
  ): void {
    if (!this.isFieldDirty(versions, key)) {
      this.pushBoolean(false);
      return;
    }
    const changed = aVal !== bVal;
    this.pushBoolean(changed);
    if (changed) this.pushBoundedIntDiff(aVal, bVal, min);
  }

  pushFieldBitPackedInt(
    versions: Map<unknown, number> | undefined,
    key: string,
    aVal: number,
    bVal: number,
    min: number,
    max: number,
    numBits: number
  ): void {
    if (!this.isFieldDirty(versions, key)) {
      this.pushBoolean(false);
      return;
    }
    const changed = aVal !== bVal;
    this.pushBoolean(changed);
    if (changed) this.pushBitPackedIntDiff(aVal, bVal, min, max, numBits);
  }

  pushFieldFloat(versions: Map<unknown, number> | undefined, key: string, aVal: number, bVal: number): void {
    if (!this.isFieldDirty(versions, key)) {
      this.pushBoolean(false);
      return;
    }
    const changed = !equalsFloat(aVal, bVal);
    this.pushBoolean(changed);
    if (changed) this.pushFloatDiff(aVal, bVal);
  }

  pushFieldFloatQuantized(
    versions: Map<unknown, number> | undefined,
    key: string,
    aVal: number,
    bVal: number,
    precision: number
  ): void {
    if (!this.isFieldDirty(versions, key)) {
      this.pushBoolean(false);
      return;
    }
    const changed = !equalsFloatQuantized(aVal, bVal, precision);
    this.pushBoolean(changed);
    if (changed) this.pushFloatQuantizedDiff(aVal, bVal, precision);
  }

  pushFieldEnum<T extends string>(
    versions: Map<unknown, number> | undefined,
    key: string,
    aVal: T,
    bVal: T,
    // The AOT codegen passes a hybrid enum object (numeric keys → strings,
    // string keys → numeric indices); the JIT passes a string-keyed lookup.
    // Both expose `lookup[stringValue] -> number`, which is all we need.
    enumLookup: Record<string, unknown>,
    numBits: number
  ): void {
    if (!this.isFieldDirty(versions, key)) {
      this.pushBoolean(false);
      return;
    }
    const changed = aVal !== bVal;
    this.pushBoolean(changed);
    if (changed) this.pushEnumDiff(enumLookup[aVal] as number, enumLookup[bVal] as number, numBits);
  }

  /**
   * Generic per-field diff for composite types (object, union, self-ref). `equals` and
   * `encodeDiff` are passed as static method references — `Type.equals` /
   * `Type._encodeDiff` — so the call site allocates nothing.
   */
  pushFieldDiff<T>(
    versions: Map<unknown, number> | undefined,
    key: string,
    aVal: T,
    bVal: T,
    equals: (a: T, b: T) => boolean,
    encodeDiff: (a: T, b: T, encoder: DiffEncoder) => void
  ): void {
    if (!this.isFieldDirty(versions, key)) {
      this.pushBoolean(false);
      return;
    }
    const changed = !equals(aVal, bVal);
    this.pushBoolean(changed);
    if (changed) encodeDiff(aVal, bVal, this);
  }

  pushOptionalDiff<T>(a: T | undefined, b: T | undefined, encode: (x: T) => void, encodeDiff: (a: T, b: T) => void) {
    // Optimization: if a was null, we know b must be non-null (else changed would be false)
    // So skip the present bit in null→value case
    if (a == null) {
      encode(b!);
    } else {
      this.pushBoolean(b != null);
      if (b != null) {
        encodeDiff(a, b);
      }
    }
  }

  pushArrayDiff<T>(
    a: T[],
    b: T[],
    equals: (x: T, y: T) => boolean,
    encode: (x: T) => void,
    encodeDiff: (a: T, b: T) => void
  ) {
    const versions = getFieldVersions(b);
    this.writeUVarint(b.length);

    // Collect changed indices (sparse encoding)
    const updates: number[] = [];
    const minLen = Math.min(a.length, b.length);
    if (versions != null) {
      const minVersion = this.minVersion;
      versions.forEach((ver, i) => {
        if (typeof i === "number" && i < minLen && ver > minVersion) {
          updates.push(i);
        }
      });
    } else {
      // No tracking: compare values
      for (let i = 0; i < minLen; i++) {
        if (!equals(a[i]!, b[i]!)) updates.push(i);
      }
    }

    // Write updates (sparse)
    this.writeUVarint(updates.length);
    for (const i of updates) {
      this.writeUVarint(i);
      encodeDiff(a[i]!, b[i]!);
    }

    // Write additions
    for (let i = a.length; i < b.length; i++) {
      encode(b[i]!);
    }
  }

  pushRecordDiff<K, T>(
    a: Map<K, T>,
    b: Map<K, T>,
    equals: (x: T, y: T) => boolean,
    encodeKey: (x: K) => void,
    encodeVal: (x: T) => void,
    encodeDiff: (a: T, b: T) => void
  ) {
    const versions = getFieldVersions(b) as Map<K, number> | undefined;
    const createdVersions = getCreatedVersions(b);
    const deletedVersions = getDeletedVersions(b);

    // Build key→index map for positional encoding
    const keyToIndex = new Map<K, number>();
    let idx = 0;
    for (const key of a.keys()) {
      keyToIndex.set(key, idx++);
    }

    const updates: { idx: number; key: K }[] = [];
    const deletions: number[] = [];
    const additions: [K, T][] = [];

    if (versions && createdVersions && deletedVersions) {
      const minVersion = this.minVersion;
      for (const [key, ver] of deletedVersions) {
        if (ver > minVersion && a.has(key)) {
          deletions.push(keyToIndex.get(key)!);
        }
      }
      for (const [key, ver] of createdVersions) {
        // !a.has(key) gates additions to keys that don't already exist in the snapshot —
        // revival (delete + re-set) marks both `created` and `dirty`; this filter directs
        // the emission to the dirty-update path instead of a full-value addition.
        if (ver > minVersion && b.has(key) && !a.has(key)) {
          additions.push([key, b.get(key)!]);
        }
      }
      for (const [key, ver] of versions) {
        if (ver > minVersion && b.has(key) && a.has(key)) {
          updates.push({ idx: keyToIndex.get(key)!, key });
        }
      }
    } else {
      // Without tracking: check all keys
      a.forEach((aVal, aKey) => {
        if (b.has(aKey)) {
          if (!equals(aVal, b.get(aKey)!)) {
            updates.push({ idx: keyToIndex.get(aKey)!, key: aKey });
          }
        } else {
          deletions.push(keyToIndex.get(aKey)!);
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
      for (const delIdx of deletions) {
        this.writeUVarint(delIdx);
      }
      this.writeUVarint(updates.length);
      for (const { idx: updIdx, key } of updates) {
        this.writeUVarint(updIdx);
        encodeDiff(a.get(key)!, b.get(key)!);
      }
    }
    this.writeUVarint(additions.length);
    additions.forEach(([key, val]) => {
      encodeKey(key);
      encodeVal(val);
    });
  }
}
