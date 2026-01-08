import * as _ from "./helpers.js";
import { NamedType, Type } from "./schema.js";
import type { Infer } from "./infer.js";
import { compileEncodeDecode } from "./jit.js";

/**
 * The serialization API returned by {@link load} for a given schema type.
 * Provides methods for encoding, decoding, delta compression, and object utilities.
 *
 * @typeParam T - The TypeScript type that this API serializes
 *
 * @example
 * ```ts
 * const GameState = ObjectType("GameState", {
 *   score: IntType(),
 *   players: ArrayType(StringType()),
 * });
 *
 * const api: DeltaPackApi<{ score: number; players: string[] }> = load(GameState);
 *
 * const encoded = api.encode({ score: 100, players: ["alice"] });
 * const decoded = api.decode(encoded);
 * ```
 */
export type DeltaPackApi<T> = {
  /** Parse a JSON object into the typed representation, with lenient type coercion */
  fromJson: (obj: object) => T;
  /** Convert a typed object to a JSON-serializable representation */
  toJson: (obj: T) => Record<string, unknown>;
  /** Encode an object to a compact binary format */
  encode: (obj: T) => Uint8Array;
  /** Decode a binary buffer back to an object */
  decode: (buf: Uint8Array) => T;
  /** Encode only the differences between two objects (delta compression) */
  encodeDiff: (a: T, b: T) => Uint8Array;
  /** Apply a delta to a base object to produce the updated object */
  decodeDiff: (a: T, diff: Uint8Array) => T;
  /** Deep equality comparison that respects float precision settings */
  equals: (a: T, b: T) => boolean;
  /** Create a deep clone of an object */
  clone: (obj: T) => T;
};

type UnionVal = { _type: string; [k: string]: unknown };

/**
 * Create a {@link DeltaPackApi} from a schema definition.
 *
 * This is the main entry point for using Delta-Pack in interpreter mode.
 * Pass a schema type (created with {@link ObjectType}, {@link UnionType}, or {@link EnumType})
 * to get back an API for serializing objects of that type.
 *
 * @typeParam T - Automatically inferred from the schema, or explicitly specified
 * @param rootType - The root schema type (must be a named type: object, union, or enum)
 * @returns A {@link DeltaPackApi} for encoding/decoding objects of the schema type
 *
 * @example
 * ```ts
 * // Define a schema using type constructors
 * const Player = ObjectType("Player", {
 *   name: StringType(),
 *   score: IntType({ min: 0 }),
 *   position: ObjectType("Position", {
 *     x: FloatType({ precision: 0.01 }),
 *     y: FloatType({ precision: 0.01 }),
 *   }),
 * });
 *
 * // Load the schema to get the API (type is inferred)
 * const api = load(Player);
 *
 * // Use the API
 * const player = { name: "Alice", score: 100, position: { x: 1.5, y: 2.5 } };
 * const encoded = api.encode(player);
 * const decoded = api.decode(encoded);
 *
 * // Delta compression for state sync
 * const updated = { ...player, score: 150 };
 * const diff = api.encodeDiff(player, updated);
 * const applied = api.decodeDiff(player, diff);
 * ```
 *
 * @example
 * ```ts
 * // Load from parsed YAML schema with explicit type
 * const schema = parseSchemaYml(yamlString);
 * const api = load<MyType>(schema);
 * ```
 */
export function load<T extends NamedType>(rootType: T): DeltaPackApi<Infer<T>>;
/**
 * Create a {@link DeltaPackApi} with an explicit type parameter.
 * Useful when loading schemas parsed from YAML where types can't be inferred.
 */
export function load<T>(rootType: NamedType): DeltaPackApi<T>;
// Implementation
export function load(rootType: NamedType): DeltaPackApi<unknown> {
  function prop(obj: unknown, key: string): unknown {
    return (obj as Record<string, unknown>)[key];
  }

  function enumIndices(options: readonly string[]): Record<string | number, string | number> {
    return Object.fromEntries([...options.map((opt, i) => [opt, i]), ...options.map((opt, i) => [i, opt])]);
  }

  function _fromJson(objVal: unknown, objType: Type, parent: NamedType): unknown {
    if (objType.type === "string") {
      return _.parseString(objVal);
    } else if (objType.type === "int") {
      return _.parseInt(objVal, objType.min, objType.max);
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
      const variantNames = objType.options.map((o) => o.name!);
      const parsers = Object.fromEntries(
        objType.options.map((o) => [o.name!, (val: unknown) => _fromJson(val, o, o)])
      ) as Record<string, (val: unknown) => unknown>;
      return _.parseUnion(objVal, variantNames, parsers);
    } else if (objType.type === "optional") {
      return _.parseOptional(objVal, (val) => _fromJson(val, objType.value, parent));
    }
    throw new Error(`Unknown type: ${objType}`);
  }

  function _toJson(objVal: unknown, objType: Type, parent: NamedType): unknown {
    if (
      objType.type === "string" ||
      objType.type === "int" ||
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
      const variant = objType.options.find((v) => v.name === union._type);
      if (!variant) {
        throw new Error(`Unknown union variant: ${union._type}`);
      }
      return {
        [union._type]: _toJson(union, variant, variant),
      };
    } else if (objType.type === "optional") {
      if (objVal == null) {
        return null;
      }
      return _toJson(objVal, objType.value, parent);
    }
    return objVal;
  }

  function _equals(a: unknown, b: unknown, objType: Type, parent: NamedType): boolean {
    if (objType.type === "string" || objType.type === "int") {
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
      if (unionA._type !== unionB._type) return false;
      const variant = objType.options.find((v) => v.name === unionA._type);
      if (!variant) return false;
      return _equals(unionA, unionB, variant, variant);
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
      const variant = objType.options.find((v) => v.name === union._type);
      if (!variant) {
        throw new Error(`Unknown union variant: ${union._type}`);
      }
      return {
        _type: union._type,
        ...(_clone(union, variant, variant) as Record<string, unknown>),
      };
    } else if (objType.type === "optional") {
      if (obj == null) return undefined;
      return _clone(obj, objType.value, parent);
    }
    return obj;
  }

  // Use JIT-compiled encode/decode for performance
  const jit = compileEncodeDecode(rootType);

  return {
    fromJson: (obj: object) => _fromJson(obj, rootType, rootType),
    toJson: (obj) => _toJson(obj, rootType, rootType) as Record<string, unknown>,
    encode: (obj) => jit.encode(obj),
    decode: (buf: Uint8Array) => jit.decode(buf),
    encodeDiff: (a, b) => jit.encodeDiff(a, b),
    decodeDiff: (a, diff: Uint8Array) => jit.decodeDiff(a, diff),
    equals: (a, b) => _equals(a, b, rootType, rootType),
    clone: (obj) => _clone(obj, rootType, rootType),
  };
}
