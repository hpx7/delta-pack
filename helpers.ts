import { Writer as _Writer, Reader as _Reader } from "bin-serde";

export { _Writer, _Reader };

export const _NO_DIFF = Symbol("NODIFF");
export type _DeepPartial<T> = T extends string | number | boolean | undefined
  ? T
  : T extends Array<infer ArrayType>
  ? Array<_DeepPartial<ArrayType> | typeof _NO_DIFF> | typeof _NO_DIFF
  : T extends { type: string; val: any }
  ? { type: T["type"]; val: _DeepPartial<T["val"] | typeof _NO_DIFF> }
  : { [K in keyof T]: _DeepPartial<T[K]> | typeof _NO_DIFF };

export class _Tracker {
  constructor(public bits: boolean[] = [], private idx = 0) {}
  push(val: boolean) {
    this.bits.push(val);
  }
  next() {
    return this.bits[this.idx++];
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

export function writeUInt8(buf: _Writer, x: number) {
  buf.writeUInt8(x);
}
export function writeBoolean(buf: _Writer, x: boolean) {
  buf.writeUInt8(x ? 1 : 0);
}
export function writeInt(buf: _Writer, x: number) {
  buf.writeVarint(x);
}
export function writeFloat(buf: _Writer, x: number) {
  buf.writeFloat(x);
}
export function writeString(buf: _Writer, x: string) {
  buf.writeString(x);
}
export function writeOptional<T>(buf: _Writer, x: T | undefined, innerWrite: (x: T) => void) {
  writeBoolean(buf, x !== undefined);
  if (x !== undefined) {
    innerWrite(x);
  }
}
export function writeArray<T>(buf: _Writer, x: T[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  for (const val of x) {
    innerWrite(val);
  }
}
export function writeArrayDiff<T>(
  buf: _Writer,
  tracker: _Tracker,
  x: (T | typeof _NO_DIFF)[],
  innerWrite: (x: T) => void,
) {
  buf.writeUVarint(x.length);
  x.forEach((val) => {
    tracker.push(val !== _NO_DIFF);
    if (val !== _NO_DIFF) {
      innerWrite(val);
    }
  });
}

export function parseUInt8(buf: _Reader): number {
  return buf.readUInt8();
}
export function parseBoolean(buf: _Reader): boolean {
  return buf.readUInt8() > 0;
}
export function parseInt(buf: _Reader): number {
  return buf.readVarint();
}
export function parseFloat(buf: _Reader): number {
  return buf.readFloat();
}
export function parseString(buf: _Reader): string {
  return buf.readString();
}
export function parseOptional<T>(buf: _Reader, innerParse: (buf: _Reader) => T): T | undefined {
  return parseBoolean(buf) ? innerParse(buf) : undefined;
}
export function parseArray<T>(buf: _Reader, innerParse: () => T): T[] {
  const len = buf.readUVarint();
  const arr: T[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(innerParse());
  }
  return arr;
}
export function parseArrayDiff<T>(buf: _Reader, tracker: _Tracker, innerParse: () => T): (T | typeof _NO_DIFF)[] {
  const len = buf.readUVarint();
  const arr: (T | typeof _NO_DIFF)[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(tracker.next() ? innerParse() : _NO_DIFF);
  }
  return arr;
}

export function diffPrimitive<T>(a: T, b: T) {
  return a === b ? _NO_DIFF : b;
}
export function diffOptional<T>(
  a: T | undefined,
  b: T | undefined,
  innerDiff: (x: T, y: T) => _DeepPartial<T> | typeof _NO_DIFF,
) {
  if (a !== undefined && b !== undefined) {
    return innerDiff(a, b);
  } else if (a !== undefined || b !== undefined) {
    return b;
  }
  return _NO_DIFF;
}
export function diffArray<T>(a: T[], b: T[], innerDiff: (x: T, y: T) => _DeepPartial<T> | typeof _NO_DIFF) {
  const arr = b.map((val, i) => {
    return i < a.length ? innerDiff(val, a[i]) : val;
  });
  return a.length === b.length && arr.every((v) => v === _NO_DIFF) ? _NO_DIFF : arr;
}

export function patchArray<T>(arr: T[], patch: typeof _NO_DIFF | any[], innerPatch: (a: T, b: _DeepPartial<T>) => T) {
  if (patch === _NO_DIFF) {
    return arr;
  }
  patch.forEach((val, i) => {
    if (val !== _NO_DIFF) {
      if (i >= arr.length) {
        arr.push(val as T);
      } else {
        arr[i] = innerPatch(arr[i], val);
      }
    }
  });
  if (patch.length < arr.length) {
    arr.splice(patch.length);
  }
  return arr;
}
export function patchOptional<T>(obj: T | undefined, patch: any, innerPatch: (a: T, b: _DeepPartial<T>) => T) {
  if (patch === undefined) {
    return undefined;
  } else if (obj === undefined) {
    return patch as T;
  } else {
    return innerPatch(obj, patch);
  }
}
