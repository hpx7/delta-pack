import * as _ from "./helpers.js";
import { Type, isPrimitiveType } from "./schema.js";

type DeltaPackApi<T> = {
  fromJson: (obj: Record<string, unknown>) => T;
  toJson: (obj: T) => Record<string, unknown>;
  encode: (obj: T) => Uint8Array;
  decode: (buf: Uint8Array) => T;
  encodeDiff: (a: T, b: T) => Uint8Array;
  decodeDiff: (a: T, diff: Uint8Array) => T;
  equals: (a: T, b: T) => boolean;
  clone: (obj: T) => T;
};

type UnionVal = { type: string; val: unknown };

export function load<T>(schema: Record<string, Type>, objectName: string): DeltaPackApi<T> {
  const typeVal = schema[objectName];
  if (!typeVal) {
    throw new Error(`Type ${objectName} not found in schema`);
  }
  // Support object, union, and enum types as root types
  if (typeVal.type !== "object" && typeVal.type !== "union" && typeVal.type !== "enum") {
    throw new Error(`Type ${objectName} must be an object, union, or enum type, got ${typeVal.type}`);
  }

  function resolveRef(name: string): Type {
    const refType = schema[name];
    if (!refType) {
      throw new Error(`Unknown reference type: ${name}`);
    }
    return refType;
  }

  function prop(obj: unknown, key: string): unknown {
    return (obj as Record<string, unknown>)[key];
  }

  function enumIndices(options: readonly string[]): Record<string, number> {
    return Object.fromEntries(options.map((opt, i) => [opt, i]));
  }

  function _fromJson(objVal: unknown, objType: Type): unknown {
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
      return _.parseEnum(objVal, enumIndices(objType.options));
    } else if (objType.type === "reference") {
      return _fromJson(objVal, resolveRef(objType.reference));
    } else if (objType.type === "object") {
      if (typeof objVal !== "object" || objVal == null || Object.getPrototypeOf(objVal) !== Object.prototype) {
        throw new Error(`Invalid object: ${objVal}`);
      }
      return _.mapValues(objType.properties, (typeVal, key) => {
        return _.tryParseField(() => _fromJson(prop(objVal, key), typeVal), key);
      });
    } else if (objType.type === "array") {
      return _.parseArray(objVal, (elem) => _fromJson(elem, objType.value));
    } else if (objType.type === "record") {
      return _.parseRecord(
        objVal,
        (key) => _fromJson(key, objType.key),
        (val) => _fromJson(val, objType.value)
      );
    } else if (objType.type === "union") {
      if (typeof objVal !== "object" || objVal == null) {
        throw new Error(`Invalid union: ${JSON.stringify(objVal)}`);
      }
      // check if it's delta-pack format: { type: "TypeName", val: ... }
      if ("type" in objVal && typeof objVal.type === "string" && "val" in objVal) {
        const optionType = objType.options.find((opt) => opt.reference === objVal.type);
        if (!optionType) {
          throw new Error(`Unknown union type option: ${objVal.type}`);
        }
        return {
          type: objVal.type,
          val: _fromJson(objVal.val, resolveRef(optionType.reference)),
        };
      }
      // check if it's protobuf format: { TypeName: ... }
      const entries = Object.entries(objVal);
      if (entries.length === 1) {
        const [fieldName, fieldValue] = entries[0]!;
        const optionType = objType.options.find((opt) => opt.reference === fieldName);
        if (!optionType) {
          throw new Error(`Unknown union type option: ${fieldName}`);
        }
        return {
          type: fieldName,
          val: _fromJson(fieldValue, resolveRef(optionType.reference)),
        };
      }
      throw new Error(`Invalid union: ${JSON.stringify(objVal)}`);
    } else if (objType.type === "optional") {
      return _.parseOptional(objVal, (val) => _fromJson(val, objType.value));
    }
    throw new Error(`Unknown type: ${objType}`);
  }

  function _toJson(objVal: unknown, objType: Type): unknown {
    if (
      objType.type === "string" ||
      objType.type === "int" ||
      objType.type === "uint" ||
      objType.type === "float" ||
      objType.type === "boolean" ||
      objType.type === "enum"
    ) {
      return objVal;
    } else if (objType.type === "reference") {
      return _toJson(objVal, resolveRef(objType.reference));
    } else if (objType.type === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        const fieldVal = prop(objVal, key);
        // Skip optional properties that are undefined
        if (typeVal.type === "optional" && fieldVal == null) {
          continue;
        }
        result[key] = _toJson(fieldVal, typeVal);
      }
      return result;
    } else if (objType.type === "array") {
      const arr = objVal as unknown[];
      return arr.map((elem) => _toJson(elem, objType.value));
    } else if (objType.type === "record") {
      const map = objVal as Map<unknown, unknown>;
      return _.mapToObject(map, (val) => _toJson(val, objType.value));
    } else if (objType.type === "union") {
      const union = objVal as UnionVal;
      return {
        [union.type]: _toJson(union.val, resolveRef(union.type)),
      };
    } else if (objType.type === "optional") {
      if (objVal == null) {
        return null;
      }
      return _toJson(objVal, objType.value);
    }
    return objVal;
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
        tracker.pushFloatQuantized(objVal as number, objType.precision);
      } else {
        tracker.pushFloat(objVal as number);
      }
    } else if (objType.type === "boolean") {
      tracker.pushBoolean(objVal as boolean);
    } else if (objType.type === "enum") {
      tracker.pushUInt(enumIndices(objType.options)[objVal as string]!);
    } else if (objType.type === "reference") {
      _encode(objVal, resolveRef(objType.reference), tracker);
    } else if (objType.type === "object") {
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        _encode(prop(objVal, key), typeVal, tracker);
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
      const union = objVal as UnionVal;
      const variantIndex = objType.options.findIndex((opt) => opt.reference === union.type);
      if (variantIndex === -1) {
        throw new Error(`Unknown union variant: ${union.type}`);
      }
      tracker.pushUInt(variantIndex);
      _encode(union.val, resolveRef(union.type), tracker);
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
        return tracker.nextFloatQuantized(objType.precision);
      } else {
        return tracker.nextFloat();
      }
    } else if (objType.type === "boolean") {
      return tracker.nextBoolean();
    } else if (objType.type === "enum") {
      return objType.options[tracker.nextUInt()];
    } else if (objType.type === "reference") {
      return _decode(resolveRef(objType.reference), tracker);
    } else if (objType.type === "object") {
      const result: Record<string, unknown> = {};
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
      return {
        type: variant.reference,
        val: _decode(resolveRef(variant.reference), tracker),
      };
    } else if (objType.type === "optional") {
      return tracker.nextBoolean() ? _decode(objType.value, tracker) : undefined;
    }
    throw new Error(`Unknown type: ${objType}`);
  }

  function _equals(a: unknown, b: unknown, objType: Type): boolean {
    if (objType.type === "string" || objType.type === "int" || objType.type === "uint") {
      return a === b;
    } else if (objType.type === "float") {
      if (objType.precision) {
        return _.equalsFloatQuantized(a as number, b as number, objType.precision);
      } else {
        return _.equalsFloat(a as number, b as number);
      }
    } else if (objType.type === "boolean") {
      return a === b;
    } else if (objType.type === "enum") {
      return a === b;
    } else if (objType.type === "reference") {
      return _equals(a, b, resolveRef(objType.reference));
    } else if (objType.type === "object") {
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        if (!_equals(prop(a, key), prop(b, key), typeVal)) {
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
      const unionA = a as UnionVal;
      const unionB = b as UnionVal;
      if (unionA.type !== unionB.type) return false;
      return _equals(unionA.val, unionB.val, resolveRef(unionA.type));
    } else if (objType.type === "optional") {
      if (a == null && b == null) return true;
      if (a == null || b == null) return false;
      return _equals(a, b, objType.value);
    }
    return true;
  }

  function _clone(obj: unknown, objType: Type): unknown {
    if (
      objType.type === "string" ||
      objType.type === "int" ||
      objType.type === "uint" ||
      objType.type === "float" ||
      objType.type === "boolean" ||
      objType.type === "enum"
    ) {
      return obj;
    } else if (objType.type === "reference") {
      return _clone(obj, resolveRef(objType.reference));
    } else if (objType.type === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        result[key] = _clone(prop(obj, key), typeVal);
      }
      return result;
    } else if (objType.type === "array") {
      const arr = obj as unknown[];
      return arr.map((item) => _clone(item, objType.value));
    } else if (objType.type === "record") {
      const map = obj as Map<unknown, unknown>;
      const newMap = new Map();
      for (const [key, val] of map) {
        newMap.set(key, _clone(val, objType.value));
      }
      return newMap;
    } else if (objType.type === "union") {
      const union = obj as UnionVal;
      return {
        type: union.type,
        val: _clone(union.val, resolveRef(union.type)),
      };
    } else if (objType.type === "optional") {
      if (obj == null) return undefined;
      return _clone(obj, objType.value);
    }
    return obj;
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
        return tracker.pushFloatQuantizedDiff(a as number, b as number, objType.precision);
      } else {
        tracker.pushFloatDiff(a as number, b as number);
      }
    } else if (objType.type === "boolean") {
      tracker.pushBooleanDiff(a as boolean, b as boolean);
    } else if (objType.type === "enum") {
      const indices = enumIndices(objType.options);
      tracker.pushUIntDiff(indices[a as string]!, indices[b as string]!);
    } else if (objType.type === "reference") {
      _encodeDiff(a, b, resolveRef(objType.reference), tracker);
    } else if (objType.type === "object") {
      const dirty = (b as { _dirty?: Set<string> })._dirty;
      const changed = dirty == null ? !_equals(a, b, objType) : dirty.size > 0;
      tracker.pushBoolean(changed);
      if (!changed) return;
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        if (dirty != null && !dirty.has(key)) {
          tracker.pushBoolean(false);
        } else {
          _encodeDiff(prop(a, key), prop(b, key), typeVal, tracker);
        }
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
      const unionA = a as UnionVal;
      const unionB = b as UnionVal;
      if (unionB.type !== unionA.type) {
        // Type changed - encode new discriminator and value
        tracker.pushBoolean(false);
        const variantIndex = objType.options.findIndex((opt) => opt.reference === unionB.type);
        tracker.pushUInt(variantIndex);
        _encode(unionB.val, resolveRef(unionB.type), tracker);
      } else {
        // Same type - encode diff
        tracker.pushBoolean(true);
        _encodeDiff(unionA.val, unionB.val, resolveRef(unionA.type), tracker);
      }
    } else if (objType.type === "optional") {
      const valueType = objType.value;
      // Use pushOptionalDiffPrimitive for primitives (including primitive references like UserId)
      // Use pushOptionalDiff for objects/complex types
      if (isPrimitiveType(valueType, schema)) {
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
        return tracker.nextFloatQuantizedDiff(a as number, objType.precision);
      } else {
        return tracker.nextFloatDiff(a as number);
      }
    } else if (objType.type === "boolean") {
      return tracker.nextBoolean() ? !(a as boolean) : a;
    } else if (objType.type === "enum") {
      const newIdx = tracker.nextUIntDiff(enumIndices(objType.options)[a as string]!);
      return objType.options[newIdx];
    } else if (objType.type === "reference") {
      return _decodeDiff(a, resolveRef(objType.reference), tracker);
    } else if (objType.type === "object") {
      const changed = tracker.nextBoolean();
      if (!changed) return a;
      const result: Record<string, unknown> = {};
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        result[key] = _decodeDiff(prop(a, key), typeVal, tracker);
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
      const unionA = a as UnionVal;
      const sameType = tracker.nextBoolean();
      if (!sameType) {
        // Type changed - decode new discriminator and value
        const variantIndex = tracker.nextUInt();
        const variant = objType.options[variantIndex];
        if (!variant) {
          throw new Error(`Invalid union variant index: ${variantIndex}`);
        }
        return {
          type: variant.reference,
          val: _decode(resolveRef(variant.reference), tracker),
        };
      } else {
        // Same type - decode diff
        return {
          type: unionA.type,
          val: _decodeDiff(unionA.val, resolveRef(unionA.type), tracker),
        };
      }
    } else if (objType.type === "optional") {
      const valueType = objType.value;
      // Use nextOptionalDiffPrimitive for primitives, nextOptionalDiff for complex types
      if (isPrimitiveType(valueType, schema)) {
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
    fromJson: (obj: Record<string, unknown>) => _fromJson(obj, typeVal) as T,
    toJson: (obj: T) => _toJson(obj, typeVal) as Record<string, unknown>,
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
    clone: (obj: T) => _clone(obj, typeVal) as T,
  };
}
