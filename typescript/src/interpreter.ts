import * as _ from "./helpers";
import type { Type } from "./generator";

type DeltaPackApi<T> = {
  parse: (obj: T) => T;
  encode: (obj: T) => Uint8Array;
  decode: (buf: Uint8Array) => T;
  encodeDiff: (a: T, b: T) => Uint8Array;
  decodeDiff: (a: T, diff: Uint8Array) => T;
  equals: (a: T, b: T) => boolean;
};

export function load<T>(schema: Record<string, Type>, objectName: string): DeltaPackApi<T> {
  const typeVal = schema[objectName];
  if (!typeVal) {
    throw new Error(`Type ${objectName} not found in schema`);
  }
  // Support object, union, and enum types as root types
  if (typeVal.type !== "object" && typeVal.type !== "union" && typeVal.type !== "enum") {
    throw new Error(`Type ${objectName} must be an object, union, or enum type, got ${typeVal.type}`);
  }

  function isPrimitiveType(type: Type): boolean {
    // Resolve references
    if (type.type === "reference") {
      const refType = schema[type.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${type.reference}`);
      }
      return isPrimitiveType(refType);
    }

    // Check if the type itself is primitive
    return (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "uint" ||
      type.type === "float" ||
      type.type === "boolean" ||
      type.type === "enum"
    );
  }

  function _parse(objVal: unknown, objType: Type): unknown {
    if (objType.type === "string") {
      return _.parseString(objVal);
    } else if (objType.type === "int") {
      return _.parseInt(objVal);
    } else if (objType.type === "uint") {
      return _.parseUInt(objVal);
    } else if (objType.type === "float") {
      return _.parseFloat(objVal);
    } else if (objType.type === "boolean") {
      return _.parseBoolean(objVal);
    } else if (objType.type === "enum") {
      const enumObj = Object.fromEntries(objType.options.map((opt, i) => [opt, i]));
      return _.parseEnum(objVal, enumObj);
    } else if (objType.type === "reference") {
      const refType = schema[objType.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${objType.reference}`);
      }
      return _parse(objVal, refType);
    } else if (objType.type === "object") {
      if (typeof objVal !== "object" || objVal === null || Object.getPrototypeOf(objVal) !== Object.prototype) {
        throw new Error(`Invalid object: ${objVal}`);
      }
      return _.mapValues(objType.properties, (typeVal, key) => {
        const fieldVal = (objVal as any)[key];
        return _.tryParseField(() => _parse(fieldVal, typeVal), key);
      });
    } else if (objType.type === "array") {
      return _.parseArray(objVal, (elem) => _parse(elem, objType.value));
    } else if (objType.type === "record") {
      return _.parseRecord(
        objVal,
        (key) => _parse(key, objType.key),
        (val) => _parse(val, objType.value)
      );
    } else if (objType.type === "union") {
      const unionType = (objVal as { type: string })?.type;
      if (typeof unionType !== "string") {
        throw new Error(`Invalid union type object: ${JSON.stringify(objVal)}`);
      }
      const optionType = objType.options.find((opt) => opt.reference === unionType);
      if (!optionType) {
        throw new Error(`Unknown union type option: ${unionType}`);
      }
      const refType = schema[optionType.reference];
      return {
        type: unionType,
        val: _parse((objVal as any).val, refType),
      };
    } else if (objType.type === "optional") {
      return _.parseOptional(objVal, (val) => _parse(val, objType.value));
    }
  }

  function _encode(objVal: unknown, objType: Type, tracker: _.Tracker): void {
    if (objType.type === "string") {
      tracker.pushString(objVal as string);
    } else if (objType.type === "int") {
      tracker.pushInt(objVal as number);
    } else if (objType.type === "uint") {
      tracker.pushUInt(objVal as number);
    } else if (objType.type === "float") {
      if (objType.precision) {
        tracker.pushInt(Math.round((objVal as number) / objType.precision));
      } else {
        tracker.pushFloat(objVal as number);
      }
    } else if (objType.type === "boolean") {
      tracker.pushBoolean(objVal as boolean);
    } else if (objType.type === "enum") {
      const enumObj = Object.fromEntries(objType.options.map((opt, i) => [opt, i]));
      tracker.pushUInt(enumObj[objVal as string]);
    } else if (objType.type === "reference") {
      const refType = schema[objType.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${objType.reference}`);
      }
      _encode(objVal, refType, tracker);
    } else if (objType.type === "object") {
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        const fieldVal = (objVal as any)[key];
        _encode(fieldVal, typeVal, tracker);
      }
    } else if (objType.type === "array") {
      const arr = objVal as unknown[];
      tracker.pushArray(arr, (elem) => _encode(elem, objType.value, tracker));
    } else if (objType.type === "record") {
      const map = objVal as Map<unknown, unknown>;
      tracker.pushRecord(
        map,
        (key) => _encode(key, objType.key, tracker),
        (val) => _encode(val, objType.value, tracker)
      );
    } else if (objType.type === "union") {
      const unionObj = objVal as { type: string; val: unknown };
      const variantIndex = objType.options.findIndex((opt) => opt.reference === unionObj.type);
      if (variantIndex === -1) {
        throw new Error(`Unknown union variant: ${unionObj.type}`);
      }
      tracker.pushUInt(variantIndex);
      const refType = schema[unionObj.type];
      _encode(unionObj.val, refType, tracker);
    } else if (objType.type === "optional") {
      tracker.pushOptional(objVal, (val) => _encode(val, objType.value, tracker));
    }
  }

  function _decode(objType: Type, tracker: _.Tracker): unknown {
    if (objType.type === "string") {
      return tracker.nextString();
    } else if (objType.type === "int") {
      return tracker.nextInt();
    } else if (objType.type === "uint") {
      return tracker.nextUInt();
    } else if (objType.type === "float") {
      if (objType.precision) {
        return tracker.nextInt() * objType.precision;
      } else {
        return tracker.nextFloat();
      }
    } else if (objType.type === "boolean") {
      return tracker.nextBoolean();
    } else if (objType.type === "enum") {
      const idx = tracker.nextUInt();
      return objType.options[idx];
    } else if (objType.type === "reference") {
      const refType = schema[objType.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${objType.reference}`);
      }
      return _decode(refType, tracker);
    } else if (objType.type === "object") {
      const result: any = {};
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        result[key] = _decode(typeVal, tracker);
      }
      return result;
    } else if (objType.type === "array") {
      const length = tracker.nextUInt();
      const arr: unknown[] = [];
      for (let i = 0; i < length; i++) {
        arr.push(_decode(objType.value, tracker));
      }
      return arr;
    } else if (objType.type === "record") {
      const size = tracker.nextUInt();
      const map = new Map();
      for (let i = 0; i < size; i++) {
        const key = _decode(objType.key, tracker);
        const val = _decode(objType.value, tracker);
        map.set(key, val);
      }
      return map;
    } else if (objType.type === "union") {
      const variantIndex = tracker.nextUInt();
      const variant = objType.options[variantIndex];
      if (!variant) {
        throw new Error(`Invalid union variant index: ${variantIndex}`);
      }
      const refType = schema[variant.reference];
      return {
        type: variant.reference,
        val: _decode(refType, tracker),
      };
    } else if (objType.type === "optional") {
      const hasValue = tracker.nextBoolean();
      if (!hasValue) {
        return undefined;
      }
      return _decode(objType.value, tracker);
    }
  }

  function _equals(a: unknown, b: unknown, objType: Type): boolean {
    if (objType.type === "string" || objType.type === "int" || objType.type === "uint") {
      return a === b;
    } else if (objType.type === "float") {
      if (objType.precision) {
        return Math.round((a as number) / objType.precision) === Math.round((b as number) / objType.precision);
      } else {
        return Math.abs((a as number) - (b as number)) <= 0.00001;
      }
    } else if (objType.type === "boolean") {
      return a === b;
    } else if (objType.type === "enum") {
      return a === b;
    } else if (objType.type === "reference") {
      const refType = schema[objType.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${objType.reference}`);
      }
      return _equals(a, b, refType);
    } else if (objType.type === "object") {
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        if (!_equals((a as any)[key], (b as any)[key], typeVal)) {
          return false;
        }
      }
      return true;
    } else if (objType.type === "array") {
      const arrA = a as unknown[];
      const arrB = b as unknown[];
      if (arrA.length !== arrB.length) return false;
      for (let i = 0; i < arrA.length; i++) {
        if (!_equals(arrA[i], arrB[i], objType.value)) {
          return false;
        }
      }
      return true;
    } else if (objType.type === "record") {
      const mapA = a as Map<unknown, unknown>;
      const mapB = b as Map<unknown, unknown>;
      if (mapA.size !== mapB.size) return false;
      for (const [key, val] of mapA) {
        if (!mapB.has(key)) return false;
        if (!_equals(val, mapB.get(key), objType.value)) {
          return false;
        }
      }
      return true;
    } else if (objType.type === "union") {
      const unionA = a as { type: string; val: unknown };
      const unionB = b as { type: string; val: unknown };
      if (unionA.type !== unionB.type) return false;
      const refType = schema[unionA.type];
      return _equals(unionA.val, unionB.val, refType);
    } else if (objType.type === "optional") {
      if (a === undefined && b === undefined) return true;
      if (a === undefined || b === undefined) return false;
      return _equals(a, b, objType.value);
    }
    return true;
  }

  function _encodeDiff(a: unknown, b: unknown, objType: Type, tracker: _.Tracker): void {
    if (objType.type === "string") {
      tracker.pushStringDiff(a as string, b as string);
    } else if (objType.type === "int") {
      tracker.pushIntDiff(a as number, b as number);
    } else if (objType.type === "uint") {
      tracker.pushUIntDiff(a as number, b as number);
    } else if (objType.type === "float") {
      if (objType.precision) {
        const aQuantized = Math.round((a as number) / objType.precision);
        const bQuantized = Math.round((b as number) / objType.precision);
        tracker.pushIntDiff(aQuantized, bQuantized);
      } else {
        tracker.pushFloatDiff(a as number, b as number);
      }
    } else if (objType.type === "boolean") {
      tracker.pushBooleanDiff(a as boolean, b as boolean);
    } else if (objType.type === "enum") {
      const enumObj = Object.fromEntries(objType.options.map((opt, i) => [opt, i]));
      tracker.pushUIntDiff(enumObj[a as string], enumObj[b as string]);
    } else if (objType.type === "reference") {
      const refType = schema[objType.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${objType.reference}`);
      }
      _encodeDiff(a, b, refType, tracker);
    } else if (objType.type === "object") {
      const changed = !_equals(a, b, objType);
      tracker.pushBoolean(changed);
      if (!changed) return;
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        _encodeDiff((a as any)[key], (b as any)[key], typeVal, tracker);
      }
    } else if (objType.type === "array") {
      const arrA = a as unknown[];
      const arrB = b as unknown[];
      tracker.pushArrayDiff(
        arrA,
        arrB,
        (x, y) => _equals(x, y, objType.value),
        (x) => _encode(x, objType.value, tracker),
        (x, y) => _encodeDiff(x, y, objType.value, tracker)
      );
    } else if (objType.type === "record") {
      const mapA = a as Map<unknown, unknown>;
      const mapB = b as Map<unknown, unknown>;
      tracker.pushRecordDiff(
        mapA,
        mapB,
        (x, y) => _equals(x, y, objType.value),
        (x) => _encode(x, objType.key, tracker),
        (x) => _encode(x, objType.value, tracker),
        (x, y) => _encodeDiff(x, y, objType.value, tracker)
      );
    } else if (objType.type === "union") {
      const unionA = a as { type: string; val: unknown };
      const unionB = b as { type: string; val: unknown };

      if (unionB.type !== unionA.type) {
        // Type changed - encode new discriminator and value
        tracker.pushBoolean(false);
        const variantIndex = objType.options.findIndex((opt) => opt.reference === unionB.type);
        tracker.pushUInt(variantIndex);
        const refType = schema[unionB.type];
        _encode(unionB.val, refType, tracker);
      } else {
        // Same type - encode diff
        tracker.pushBoolean(true);
        const refType = schema[unionA.type];
        _encodeDiff(unionA.val, unionB.val, refType, tracker);
      }
    } else if (objType.type === "optional") {
      const valueType = objType.value;
      // Use pushOptionalDiffPrimitive for primitives (including primitive references like UserId)
      // Use pushOptionalDiff for objects/complex types
      if (isPrimitiveType(valueType)) {
        tracker.pushOptionalDiffPrimitive(a, b, (x) => _encode(x, valueType, tracker));
      } else {
        tracker.pushOptionalDiff(
          a,
          b,
          (x) => _encode(x, valueType, tracker),
          (x, y) => _encodeDiff(x, y, valueType, tracker)
        );
      }
    }
  }

  function _decodeDiff(a: unknown, objType: Type, tracker: _.Tracker): unknown {
    if (objType.type === "string") {
      return tracker.nextStringDiff(a as string);
    } else if (objType.type === "int") {
      return tracker.nextIntDiff(a as number);
    } else if (objType.type === "uint") {
      return tracker.nextUIntDiff(a as number);
    } else if (objType.type === "float") {
      if (objType.precision) {
        const aQuantized = Math.round((a as number) / objType.precision);
        const bQuantized = tracker.nextIntDiff(aQuantized);
        return bQuantized * objType.precision;
      } else {
        return tracker.nextFloatDiff(a as number);
      }
    } else if (objType.type === "boolean") {
      const changed = tracker.nextBoolean();
      return changed ? !(a as boolean) : (a as boolean);
    } else if (objType.type === "enum") {
      const oldEnumObj = Object.fromEntries(objType.options.map((opt, i) => [opt, i]));
      const oldIdx = oldEnumObj[a as string];
      const newIdx = tracker.nextUIntDiff(oldIdx);
      return objType.options[newIdx];
    } else if (objType.type === "reference") {
      const refType = schema[objType.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${objType.reference}`);
      }
      return _decodeDiff(a, refType, tracker);
    } else if (objType.type === "object") {
      const changed = tracker.nextBoolean();
      if (!changed) return a;
      const result: any = {};
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        result[key] = _decodeDiff((a as any)[key], typeVal, tracker);
      }
      return result;
    } else if (objType.type === "array") {
      const arrA = a as unknown[];
      return tracker.nextArrayDiff(
        arrA,
        () => _decode(objType.value, tracker),
        (x) => _decodeDiff(x, objType.value, tracker)
      );
    } else if (objType.type === "record") {
      const mapA = a as Map<unknown, unknown>;
      return tracker.nextRecordDiff(
        mapA,
        () => _decode(objType.key, tracker),
        () => _decode(objType.value, tracker),
        (x) => _decodeDiff(x, objType.value, tracker)
      );
    } else if (objType.type === "union") {
      const unionA = a as { type: string; val: unknown };
      const sameType = tracker.nextBoolean();

      if (!sameType) {
        // Type changed - decode new discriminator and value
        const variantIndex = tracker.nextUInt();
        const variant = objType.options[variantIndex];
        if (!variant) {
          throw new Error(`Invalid union variant index: ${variantIndex}`);
        }
        const refType = schema[variant.reference];
        return {
          type: variant.reference,
          val: _decode(refType, tracker),
        };
      } else {
        // Same type - decode diff
        const refType = schema[unionA.type];
        return {
          type: unionA.type,
          val: _decodeDiff(unionA.val, refType, tracker),
        };
      }
    } else if (objType.type === "optional") {
      const valueType = objType.value;
      // Use nextOptionalDiffPrimitive for primitives, nextOptionalDiff for complex types
      if (isPrimitiveType(valueType)) {
        return tracker.nextOptionalDiffPrimitive(a, () => _decode(valueType, tracker));
      } else {
        return tracker.nextOptionalDiff(
          a,
          () => _decode(valueType, tracker),
          (x) => _decodeDiff(x, valueType, tracker)
        );
      }
    }
    return a;
  }

  return {
    parse: (obj: T) => _parse(obj, typeVal) as T,
    encode: (obj: T) => {
      const tracker = new _.Tracker();
      _encode(obj, typeVal, tracker);
      return tracker.toBuffer();
    },
    decode: (buf: Uint8Array) => {
      const tracker = _.Tracker.parse(buf);
      return _decode(typeVal, tracker) as T;
    },
    encodeDiff: (a: T, b: T) => {
      const tracker = new _.Tracker();
      _encodeDiff(a, b, typeVal, tracker);
      return tracker.toBuffer();
    },
    decodeDiff: (a: T, diff: Uint8Array) => {
      const tracker = _.Tracker.parse(diff);
      return _decodeDiff(a, typeVal, tracker) as T;
    },
    equals: (a: T, b: T) => _equals(a, b, typeVal),
  };
}
