import * as _ from "./helpers.js";
import { NamedType, Type, isPrimitiveOrEnum } from "./schema.js";
import type { Infer } from "./infer.js";

export type DeltaPackApi<T> = {
  fromJson: (obj: object) => T;
  toJson: (obj: T) => Record<string, unknown>;
  encode: (obj: T) => Uint8Array;
  decode: (buf: Uint8Array) => T;
  encodeDiff: (a: T, b: T) => Uint8Array;
  decodeDiff: (a: T, diff: Uint8Array) => T;
  equals: (a: T, b: T) => boolean;
  clone: (obj: T) => T;
};

type UnionVal = { type: string; val: unknown };

// Overload for type inference (when using TypeScript-defined schemas)
export function load<T extends NamedType>(rootType: T): DeltaPackApi<Infer<T>>;
// Overload for explicit type specification (useful when loading from parsed YAML schemas)
export function load<T>(rootType: NamedType): DeltaPackApi<T>;
// Implementation
export function load(rootType: NamedType): DeltaPackApi<unknown> {
  function prop(obj: unknown, key: string): unknown {
    return (obj as Record<string, unknown>)[key];
  }

  function enumIndices(options: readonly string[]): Record<string, number> {
    return Object.fromEntries(options.map((opt, i) => [opt, i]));
  }

  function _fromJson(objVal: unknown, objType: Type, parent: NamedType): unknown {
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
      return _fromJson(objVal, objType.ref, objType.ref);
    } else if (objType.type === "self-reference") {
      return _fromJson(objVal, parent, parent);
    } else if (objType.type === "object") {
      if (typeof objVal !== "object" || objVal == null) {
        throw new Error(`Invalid object: ${objVal}`);
      }
      return _.mapValues(objType.properties, (typeVal, key) => {
        return _.tryParseField(() => _fromJson(prop(objVal, key), typeVal, parent), key);
      });
    } else if (objType.type === "array") {
      return _.parseArray(objVal, (elem) => _fromJson(elem, objType.value, parent));
    } else if (objType.type === "record") {
      return _.parseRecord(
        objVal,
        (key) => _fromJson(key, objType.key, parent),
        (val) => _fromJson(val, objType.value, parent)
      );
    } else if (objType.type === "union") {
      if (typeof objVal !== "object" || objVal == null) {
        throw new Error(`Invalid union: ${JSON.stringify(objVal)}`);
      }
      // check if it's delta-pack format: { type: "TypeName", val: ... }
      if ("type" in objVal && typeof objVal.type === "string" && "val" in objVal) {
        const variant = objType.options.find((v) => v.name === objVal.type);
        if (!variant) {
          throw new Error(`Unknown union type variant: ${objVal.type}`);
        }
        return {
          type: objVal.type,
          val: _fromJson(objVal.val, variant, variant),
        };
      }
      // check if it's protobuf format: { TypeName: ... }
      const entries = Object.entries(objVal);
      if (entries.length === 1) {
        const [fieldName, fieldValue] = entries[0]!;
        const variant = objType.options.find((v) => v.name === fieldName);
        if (!variant) {
          throw new Error(`Unknown union type variant: ${fieldName}`);
        }
        return {
          type: fieldName,
          val: _fromJson(fieldValue, variant, variant),
        };
      }
      throw new Error(`Invalid union: ${JSON.stringify(objVal)}`);
    } else if (objType.type === "optional") {
      return _.parseOptional(objVal, (val) => _fromJson(val, objType.value, parent));
    }
    throw new Error(`Unknown type: ${objType}`);
  }

  function _toJson(objVal: unknown, objType: Type, parent: NamedType): unknown {
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
      return _toJson(objVal, objType.ref, objType.ref);
    } else if (objType.type === "self-reference") {
      return _toJson(objVal, parent, parent);
    } else if (objType.type === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        const fieldVal = prop(objVal, key);
        // Skip optional properties that are undefined
        if (typeVal.type === "optional" && fieldVal == null) {
          continue;
        }
        result[key] = _toJson(fieldVal, typeVal, parent);
      }
      return result;
    } else if (objType.type === "array") {
      const arr = objVal as unknown[];
      return arr.map((elem) => _toJson(elem, objType.value, parent));
    } else if (objType.type === "record") {
      const map = objVal as Map<unknown, unknown>;
      return _.mapToObject(map, (val) => _toJson(val, objType.value, parent));
    } else if (objType.type === "union") {
      const union = objVal as UnionVal;
      const variant = objType.options.find((v) => v.name === union.type);
      if (!variant) {
        throw new Error(`Unknown union variant: ${union.type}`);
      }
      return {
        [union.type]: _toJson(union.val, variant, variant),
      };
    } else if (objType.type === "optional") {
      if (objVal == null) {
        return null;
      }
      return _toJson(objVal, objType.value, parent);
    }
    return objVal;
  }

  function _encode(objVal: unknown, objType: Type, encoder: _.Encoder, parent: NamedType): void {
    if (objType.type === "string") {
      encoder.pushString(objVal as string);
    } else if (objType.type === "int") {
      encoder.pushInt(objVal as number);
    } else if (objType.type === "uint") {
      encoder.pushUInt(objVal as number);
    } else if (objType.type === "float") {
      if (objType.precision) {
        encoder.pushFloatQuantized(objVal as number, objType.precision);
      } else {
        encoder.pushFloat(objVal as number);
      }
    } else if (objType.type === "boolean") {
      encoder.pushBoolean(objVal as boolean);
    } else if (objType.type === "enum") {
      encoder.pushUInt(enumIndices(objType.options)[objVal as string]!);
    } else if (objType.type === "reference") {
      _encode(objVal, objType.ref, encoder, objType.ref);
    } else if (objType.type === "self-reference") {
      _encode(objVal, parent, encoder, parent);
    } else if (objType.type === "object") {
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        _encode(prop(objVal, key), typeVal, encoder, parent);
      }
    } else if (objType.type === "array") {
      const arr = objVal as unknown[];
      encoder.pushArray(arr, (elem) => _encode(elem, objType.value, encoder, parent));
    } else if (objType.type === "record") {
      const map = objVal as Map<unknown, unknown>;
      encoder.pushRecord(
        map,
        (key) => _encode(key, objType.key, encoder, parent),
        (val) => _encode(val, objType.value, encoder, parent)
      );
    } else if (objType.type === "union") {
      const union = objVal as UnionVal;
      const variantIndex = objType.options.findIndex((v) => v.name === union.type);
      if (variantIndex === -1) {
        throw new Error(`Unknown union variant: ${union.type}`);
      }
      const variant = objType.options[variantIndex]!;
      encoder.pushUInt(variantIndex);
      _encode(union.val, variant, encoder, variant);
    } else if (objType.type === "optional") {
      encoder.pushOptional(objVal, (val) => _encode(val, objType.value, encoder, parent));
    }
  }

  function _decode(objType: Type, decoder: _.Decoder, parent: NamedType): unknown {
    if (objType.type === "string") {
      return decoder.nextString();
    } else if (objType.type === "int") {
      return decoder.nextInt();
    } else if (objType.type === "uint") {
      return decoder.nextUInt();
    } else if (objType.type === "float") {
      if (objType.precision) {
        return decoder.nextFloatQuantized(objType.precision);
      } else {
        return decoder.nextFloat();
      }
    } else if (objType.type === "boolean") {
      return decoder.nextBoolean();
    } else if (objType.type === "enum") {
      return objType.options[decoder.nextUInt()];
    } else if (objType.type === "reference") {
      return _decode(objType.ref, decoder, objType.ref);
    } else if (objType.type === "self-reference") {
      return _decode(parent, decoder, parent);
    } else if (objType.type === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        result[key] = _decode(typeVal, decoder, parent);
      }
      return result;
    } else if (objType.type === "array") {
      const length = decoder.nextUInt();
      const arr: unknown[] = [];
      for (let i = 0; i < length; i++) {
        arr.push(_decode(objType.value, decoder, parent));
      }
      return arr;
    } else if (objType.type === "record") {
      const size = decoder.nextUInt();
      const map = new Map();
      for (let i = 0; i < size; i++) {
        const key = _decode(objType.key, decoder, parent);
        const val = _decode(objType.value, decoder, parent);
        map.set(key, val);
      }
      return map;
    } else if (objType.type === "union") {
      const variantIndex = decoder.nextUInt();
      const variant = objType.options[variantIndex];
      if (!variant) {
        throw new Error(`Invalid union variant index: ${variantIndex}`);
      }
      return {
        type: variant.name,
        val: _decode(variant, decoder, variant),
      };
    } else if (objType.type === "optional") {
      return decoder.nextBoolean() ? _decode(objType.value, decoder, parent) : undefined;
    }
    throw new Error(`Unknown type: ${objType}`);
  }

  function _equals(a: unknown, b: unknown, objType: Type, parent: NamedType): boolean {
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
      return _equals(a, b, objType.ref, objType.ref);
    } else if (objType.type === "self-reference") {
      return _equals(a, b, parent, parent);
    } else if (objType.type === "object") {
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        if (!_equals(prop(a, key), prop(b, key), typeVal, parent)) {
          return false;
        }
      }
      return true;
    } else if (objType.type === "array") {
      const arrA = a as unknown[];
      const arrB = b as unknown[];
      if (arrA.length !== arrB.length) return false;
      for (let i = 0; i < arrA.length; i++) {
        if (!_equals(arrA[i], arrB[i], objType.value, parent)) {
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
        if (!_equals(val, mapB.get(key), objType.value, parent)) {
          return false;
        }
      }
      return true;
    } else if (objType.type === "union") {
      const unionA = a as UnionVal;
      const unionB = b as UnionVal;
      if (unionA.type !== unionB.type) return false;
      const variant = objType.options.find((v) => v.name === unionA.type);
      if (!variant) return false;
      return _equals(unionA.val, unionB.val, variant, variant);
    } else if (objType.type === "optional") {
      if (a == null && b == null) return true;
      if (a == null || b == null) return false;
      return _equals(a, b, objType.value, parent);
    }
    return true;
  }

  function _clone(obj: unknown, objType: Type, parent: NamedType): unknown {
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
      return _clone(obj, objType.ref, objType.ref);
    } else if (objType.type === "self-reference") {
      return _clone(obj, parent, parent);
    } else if (objType.type === "object") {
      // Preserve prototype from source object (supports class instances)
      const result: Record<string, unknown> = Object.create(Object.getPrototypeOf(obj));
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        result[key] = _clone(prop(obj, key), typeVal, parent);
      }
      return result;
    } else if (objType.type === "array") {
      const arr = obj as unknown[];
      return arr.map((item) => _clone(item, objType.value, parent));
    } else if (objType.type === "record") {
      const map = obj as Map<unknown, unknown>;
      const newMap = new Map();
      for (const [key, val] of map) {
        newMap.set(key, _clone(val, objType.value, parent));
      }
      return newMap;
    } else if (objType.type === "union") {
      const union = obj as UnionVal;
      const variant = objType.options.find((v) => v.name === union.type);
      if (!variant) {
        throw new Error(`Unknown union variant: ${union.type}`);
      }
      return {
        type: union.type,
        val: _clone(union.val, variant, variant),
      };
    } else if (objType.type === "optional") {
      if (obj == null) return undefined;
      return _clone(obj, objType.value, parent);
    }
    return obj;
  }

  function _encodeDiff(a: unknown, b: unknown, objType: Type, encoder: _.Encoder, parent: NamedType): void {
    if (objType.type === "string") {
      encoder.pushStringDiff(a as string, b as string);
    } else if (objType.type === "int") {
      encoder.pushIntDiff(a as number, b as number);
    } else if (objType.type === "uint") {
      encoder.pushUIntDiff(a as number, b as number);
    } else if (objType.type === "float") {
      if (objType.precision) {
        return encoder.pushFloatQuantizedDiff(a as number, b as number, objType.precision);
      } else {
        encoder.pushFloatDiff(a as number, b as number);
      }
    } else if (objType.type === "boolean") {
      encoder.pushBooleanDiff(a as boolean, b as boolean);
    } else if (objType.type === "enum") {
      const indices = enumIndices(objType.options);
      encoder.pushUIntDiff(indices[a as string]!, indices[b as string]!);
    } else if (objType.type === "reference") {
      _encodeDiff(a, b, objType.ref, encoder, objType.ref);
    } else if (objType.type === "self-reference") {
      _encodeDiff(a, b, parent, encoder, parent);
    } else if (objType.type === "object") {
      const dirty = (b as { _dirty?: Set<string> })._dirty;
      const changed = dirty == null ? !_equals(a, b, objType, parent) : dirty.size > 0;
      encoder.pushBoolean(changed);
      if (!changed) return;
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        if (dirty != null && !dirty.has(key)) {
          encoder.pushBoolean(false);
        } else {
          _encodeDiff(prop(a, key), prop(b, key), typeVal, encoder, parent);
        }
      }
    } else if (objType.type === "array") {
      const arrA = a as unknown[];
      const arrB = b as unknown[];
      encoder.pushArrayDiff(
        arrA,
        arrB,
        (x, y) => _equals(x, y, objType.value, parent),
        (x) => _encode(x, objType.value, encoder, parent),
        (x, y) => _encodeDiff(x, y, objType.value, encoder, parent)
      );
    } else if (objType.type === "record") {
      const mapA = a as Map<unknown, unknown>;
      const mapB = b as Map<unknown, unknown>;
      encoder.pushRecordDiff(
        mapA,
        mapB,
        (x, y) => _equals(x, y, objType.value, parent),
        (x) => _encode(x, objType.key, encoder, parent),
        (x) => _encode(x, objType.value, encoder, parent),
        (x, y) => _encodeDiff(x, y, objType.value, encoder, parent)
      );
    } else if (objType.type === "union") {
      const unionA = a as UnionVal;
      const unionB = b as UnionVal;
      if (unionB.type !== unionA.type) {
        // Type changed - encode new discriminator and value
        encoder.pushBoolean(false);
        const variantIndex = objType.options.findIndex((v) => v.name === unionB.type);
        const variant = objType.options[variantIndex]!;
        encoder.pushUInt(variantIndex);
        _encode(unionB.val, variant, encoder, variant);
      } else {
        // Same type - encode diff
        encoder.pushBoolean(true);
        const variant = objType.options.find((v) => v.name === unionA.type)!;
        _encodeDiff(unionA.val, unionB.val, variant, encoder, variant);
      }
    } else if (objType.type === "optional") {
      const valueType = objType.value;
      // Use pushOptionalDiffPrimitive for primitives (including primitive references like UserId)
      // Use pushOptionalDiff for objects/complex types
      if (isPrimitiveOrEnum(valueType)) {
        encoder.pushOptionalDiffPrimitive(a, b, (x) => _encode(x, valueType, encoder, parent));
      } else {
        encoder.pushOptionalDiff(
          a,
          b,
          (x) => _encode(x, valueType, encoder, parent),
          (x, y) => _encodeDiff(x, y, valueType, encoder, parent)
        );
      }
    }
  }

  function _decodeDiff(a: unknown, objType: Type, decoder: _.Decoder, parent: NamedType): unknown {
    if (objType.type === "string") {
      return decoder.nextStringDiff(a as string);
    } else if (objType.type === "int") {
      return decoder.nextIntDiff(a as number);
    } else if (objType.type === "uint") {
      return decoder.nextUIntDiff(a as number);
    } else if (objType.type === "float") {
      if (objType.precision) {
        return decoder.nextFloatQuantizedDiff(a as number, objType.precision);
      } else {
        return decoder.nextFloatDiff(a as number);
      }
    } else if (objType.type === "boolean") {
      return decoder.nextBoolean() ? !(a as boolean) : a;
    } else if (objType.type === "enum") {
      const newIdx = decoder.nextUIntDiff(enumIndices(objType.options)[a as string]!);
      return objType.options[newIdx];
    } else if (objType.type === "reference") {
      return _decodeDiff(a, objType.ref, decoder, objType.ref);
    } else if (objType.type === "self-reference") {
      return _decodeDiff(a, parent, decoder, parent);
    } else if (objType.type === "object") {
      const changed = decoder.nextBoolean();
      if (!changed) return a;
      // Preserve prototype from old object (supports class instances)
      const result: Record<string, unknown> = Object.create(Object.getPrototypeOf(a));
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        result[key] = _decodeDiff(prop(a, key), typeVal, decoder, parent);
      }
      return result;
    } else if (objType.type === "array") {
      const arrA = a as unknown[];
      return decoder.nextArrayDiff(
        arrA,
        () => _decode(objType.value, decoder, parent),
        (x) => _decodeDiff(x, objType.value, decoder, parent)
      );
    } else if (objType.type === "record") {
      const mapA = a as Map<unknown, unknown>;
      return decoder.nextRecordDiff(
        mapA,
        () => _decode(objType.key, decoder, parent),
        () => _decode(objType.value, decoder, parent),
        (x) => _decodeDiff(x, objType.value, decoder, parent)
      );
    } else if (objType.type === "union") {
      const unionA = a as UnionVal;
      const sameType = decoder.nextBoolean();
      if (!sameType) {
        // Type changed - decode new discriminator and value
        const variantIndex = decoder.nextUInt();
        const variant = objType.options[variantIndex];
        if (!variant) {
          throw new Error(`Invalid union variant index: ${variantIndex}`);
        }
        return {
          type: variant.name,
          val: _decode(variant, decoder, variant),
        };
      } else {
        // Same type - decode diff
        const variant = objType.options.find((v) => v.name === unionA.type)!;
        return {
          type: unionA.type,
          val: _decodeDiff(unionA.val, variant, decoder, variant),
        };
      }
    } else if (objType.type === "optional") {
      const valueType = objType.value;
      // Use nextOptionalDiffPrimitive for primitives, nextOptionalDiff for complex types
      if (isPrimitiveOrEnum(valueType)) {
        return decoder.nextOptionalDiffPrimitive(a, () => _decode(valueType, decoder, parent));
      } else {
        return decoder.nextOptionalDiff(
          a,
          () => _decode(valueType, decoder, parent),
          (x) => _decodeDiff(x, valueType, decoder, parent)
        );
      }
    }
    return a;
  }

  return {
    fromJson: (obj: object) => _fromJson(obj, rootType, rootType),
    toJson: (obj) => _toJson(obj, rootType, rootType) as Record<string, unknown>,
    encode: (obj) => {
      const encoder = new _.Encoder();
      _encode(obj, rootType, encoder, rootType);
      return encoder.toBuffer();
    },
    decode: (buf: Uint8Array) => {
      const decoder = new _.Decoder(buf);
      return _decode(rootType, decoder, rootType);
    },
    encodeDiff: (a, b) => {
      const encoder = new _.Encoder();
      _encodeDiff(a, b, rootType, encoder, rootType);
      return encoder.toBuffer();
    },
    decodeDiff: (a, diff: Uint8Array) => {
      const decoder = new _.Decoder(diff);
      return _decodeDiff(a, rootType, decoder, rootType);
    },
    equals: (a, b) => _equals(a, b, rootType, rootType),
    clone: (obj) => _clone(obj, rootType, rootType),
  };
}
