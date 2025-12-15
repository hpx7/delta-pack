import "reflect-metadata";
import { load, DeltaPackApi } from "./interpreter.js";
import { NamedType, PropertyType } from "./schema.js";
import { SCHEMA_TYPE, UNION_VARIANTS, EnumDef } from "./unified.js";

// ============ Types ============

type Constructor<T = unknown> = new (...args: unknown[]) => T;

type SchemaTypeOrRef = PropertyType | { __class: Function } | { __enum: EnumDef };

// ============ Helper Functions ============

function isClassRef(value: unknown): value is { __class: Function } {
  return typeof value === "object" && value !== null && "__class" in value;
}

function isEnumRef(value: unknown): value is { __enum: EnumDef } {
  return typeof value === "object" && value !== null && "__enum" in value;
}

// ============ Schema Builder ============

export function buildSchema<T extends object>(rootClass: Constructor<T>): Record<string, NamedType> {
  const schema: Record<string, NamedType> = {};
  const visited = new Set<Function>();

  function processClass(cls: Function): void {
    if (visited.has(cls)) return;
    visited.add(cls);

    const unionVariants = Reflect.getMetadata(UNION_VARIANTS, cls) as Function[] | undefined;
    if (unionVariants) {
      for (const variant of unionVariants) {
        processClass(variant);
      }
      // Store union with placeholder, resolve references after all types are processed
      schema[cls.name] = {
        type: "union",
        options: [] as unknown as readonly NamedType[], // Will be resolved later
        name: cls.name,
        __variantNames: unionVariants.map((v) => v.name), // Temporary for resolution
      } as NamedType & { __variantNames: string[] };
      return;
    }

    let instance: object;
    try {
      instance = new (cls as Constructor)() as object;
    } catch {
      throw new Error(
        `Cannot instantiate ${cls.name}. Classes must have a parameterless constructor. ` +
          `For abstract union types, use @UnionType([Variant1, Variant2]).`
      );
    }

    const propertyKeys = Object.keys(instance);
    const properties: Record<string, PropertyType> = {};

    for (const key of propertyKeys) {
      const schemaType = Reflect.getMetadata(SCHEMA_TYPE, cls.prototype, key);
      if (schemaType) {
        properties[key] = resolveSchemaType(schemaType, cls);
      }
      // Properties without decorators are ignored (not serialized)
    }

    if (Object.keys(properties).length === 0) {
      throw new Error(
        `Class ${cls.name} must have at least one property decorator. ` + `Use @StringType(), @IntType(), etc.`
      );
    }

    schema[cls.name] = { type: "object", properties, name: cls.name };
  }

  function resolveSchemaType(schemaType: SchemaTypeOrRef, currentClass?: Function): PropertyType {
    if (isClassRef(schemaType)) {
      const cls = schemaType.__class;
      // Check for self-reference (class referencing itself)
      if (cls === currentClass) {
        return { type: "self-reference" } as PropertyType;
      }
      processClass(cls);
      // Return a placeholder that will be resolved after all types are collected
      return { type: "reference", __refName: cls.name } as unknown as PropertyType;
    }

    if (isEnumRef(schemaType)) {
      const enumDef = schemaType.__enum;
      if (!schema[enumDef.name]) {
        schema[enumDef.name] = { type: "enum", options: enumDef.options as readonly string[], name: enumDef.name };
      }
      return { type: "reference", __refName: enumDef.name } as unknown as PropertyType;
    }

    if (schemaType.type === "array") {
      const arrayType = schemaType as { type: "array"; value: SchemaTypeOrRef };
      return { type: "array", value: resolveSchemaType(arrayType.value, currentClass) };
    }
    if (schemaType.type === "optional") {
      const optType = schemaType as { type: "optional"; value: SchemaTypeOrRef };
      return { type: "optional", value: resolveSchemaType(optType.value, currentClass) };
    }
    if (schemaType.type === "record") {
      const recType = schemaType as { type: "record"; key: { type: "string" }; value: SchemaTypeOrRef };
      return { type: "record", key: recType.key, value: resolveSchemaType(recType.value, currentClass) };
    }

    // Only non-enum primitives reach here (enums are resolved via isEnumRef above)
    return schemaType as PropertyType;
  }

  processClass(rootClass);

  // Second pass: resolve all references now that all types are in schema
  for (const typeName of Object.keys(schema)) {
    const type = schema[typeName]!;
    if (type.type === "union") {
      const unionWithNames = type as NamedType & { __variantNames?: string[] };
      if (unionWithNames.__variantNames) {
        (type as { options: readonly NamedType[] }).options = unionWithNames.__variantNames.map(
          (name) => schema[name]!
        );
        delete unionWithNames.__variantNames;
      }
    } else if (type.type === "object") {
      for (const key of Object.keys(type.properties)) {
        type.properties[key] = resolveReferences(type.properties[key]!);
      }
    }
  }

  function resolveReferences(prop: PropertyType): PropertyType {
    const propWithRefName = prop as PropertyType & { __refName?: string };
    if (prop.type === "reference" && propWithRefName.__refName) {
      const refType = schema[propWithRefName.__refName]!;
      delete propWithRefName.__refName;
      return { type: "reference", ref: refType };
    }
    if (prop.type === "array") {
      return { type: "array", value: resolveReferences(prop.value) };
    }
    if (prop.type === "optional") {
      return { type: "optional", value: resolveReferences(prop.value) };
    }
    if (prop.type === "record") {
      return { type: "record", key: prop.key, value: resolveReferences(prop.value) };
    }
    return prop;
  }

  return schema;
}

// ============ Dirty Tracking Types ============

/** Add _dirty tracking to an object type */
export type WithDirty<T> = T & { _dirty?: Set<keyof T> };

/** Add _dirty tracking to an array (tracks dirty indices) */
export type DirtyArray<T> = T[] & { _dirty?: Set<number> };

/** Add _dirty tracking to a Map (tracks dirty keys) */
export type DirtyMap<K, V> = Map<K, V> & { _dirty?: Set<K> };

// ============ Class Loader ============

export function loadClass<T extends object>(rootClass: Constructor<T>): DeltaPackApi<WithDirty<T>> {
  const schema = buildSchema(rootClass);
  const rootType = schema[rootClass.name];
  if (!rootType) {
    throw new Error(`Type ${rootClass.name} not found in schema`);
  }
  const rawApi = load<T>(rootType);

  // Collect class constructors and union variants in a single traversal
  const info: CollectedInfo = {
    classMap: new Map<string, Constructor>(),
    unionVariants: new Set<string>(),
  };
  collectClassInfo(rootClass, info, new Set());
  const { classMap, unionVariants } = info;

  // Hydrate plain objects into class instances
  function hydrate(obj: unknown, typeName: string): unknown {
    const type = schema[typeName];
    if (!type) return obj;

    if (type.type === "object") {
      const cls = classMap.get(typeName);
      if (cls && obj && typeof obj === "object") {
        const instance = Object.create(cls.prototype);
        for (const [key, propType] of Object.entries(type.properties)) {
          const value = (obj as Record<string, unknown>)[key];
          instance[key] = hydrateValue(value, propType, typeName);
        }
        return instance;
      }
    }

    if (type.type === "union") {
      // Union values are { type: "VariantName", val: {...} }
      // Hydrate val to a class instance of the variant type
      if (obj && typeof obj === "object" && "type" in obj && "val" in obj) {
        const unionObj = obj as { type: string; val: unknown };
        return hydrate(unionObj.val, unionObj.type);
      }
    }

    return obj;
  }

  function hydrateValue(value: unknown, propType: PropertyType, currentTypeName: string): unknown {
    if (value === null || value === undefined) return value;

    if (propType.type === "reference") {
      return hydrate(value, propType.ref.name!);
    } else if (propType.type === "self-reference") {
      return hydrate(value, currentTypeName);
    } else if (propType.type === "array") {
      return (value as unknown[]).map((item) => hydrateValue(item, propType.value, currentTypeName));
    } else if (propType.type === "record") {
      const map = value as Map<unknown, unknown>;
      const hydrated = new Map<unknown, unknown>();
      for (const [k, v] of map) {
        hydrated.set(k, hydrateValue(v, propType.value, currentTypeName));
      }
      return hydrated;
    } else if (propType.type === "optional") {
      return hydrateValue(value, propType.value, currentTypeName);
    }
    return value;
  }

  type D = WithDirty<T>;
  const wrap = (obj: D) => wrapUnions(obj, rootType, schema, unionVariants) as T;

  return {
    fromJson: (obj: object) => hydrate(rawApi.fromJson(wrap(obj as D)), rootClass.name) as D,
    encode: (obj: D) => rawApi.encode(wrap(obj)),
    decode: (buf: Uint8Array) => hydrate(rawApi.decode(buf), rootClass.name) as D,
    encodeDiff: (a: D, b: D) => rawApi.encodeDiff(wrap(a), wrap(b)),
    decodeDiff: (a: D, diff: Uint8Array) => hydrate(rawApi.decodeDiff(wrap(a), diff), rootClass.name) as D,
    equals: (a: D, b: D) => rawApi.equals(wrap(a), wrap(b)),
    clone: (obj: D) => hydrate(rawApi.clone(wrap(obj)), rootClass.name) as D,
    toJson: (obj: D) => rawApi.toJson(wrap(obj)),
  };
}

// ============ Internal Helpers ============

interface CollectedInfo {
  classMap: Map<string, Constructor>;
  unionVariants: Set<string>;
}

function collectClassInfo(cls: Function, info: CollectedInfo, visited: Set<Function>): void {
  if (visited.has(cls)) return;
  visited.add(cls);

  const unionVariantClasses = Reflect.getMetadata(UNION_VARIANTS, cls) as Function[] | undefined;
  if (unionVariantClasses) {
    for (const variant of unionVariantClasses) {
      info.unionVariants.add(variant.name);
      collectClassInfo(variant, info, visited);
    }
    return;
  }

  // Store the constructor
  info.classMap.set(cls.name, cls as Constructor);

  // Process referenced classes from property metadata
  let instance: object;
  try {
    instance = new (cls as Constructor)() as object;
  } catch {
    return;
  }

  for (const key of Object.keys(instance)) {
    const schemaType = Reflect.getMetadata(SCHEMA_TYPE, cls.prototype, key);
    if (schemaType) {
      collectFromSchemaType(schemaType, info, visited);
    }
  }
}

function collectFromSchemaType(schemaType: unknown, info: CollectedInfo, visited: Set<Function>): void {
  if (!schemaType || typeof schemaType !== "object") return;

  if ("__class" in schemaType) {
    collectClassInfo((schemaType as { __class: Function }).__class, info, visited);
    return;
  }

  const type = (schemaType as Record<string, unknown>)["type"];
  if (type === "array" || type === "optional" || type === "record") {
    collectFromSchemaType((schemaType as { value: unknown }).value, info, visited);
  }
}

function wrapUnions(
  obj: unknown,
  objType: NamedType,
  schema: Record<string, NamedType>,
  unionVariants: Set<string>
): unknown {
  if (obj === null || obj === undefined) return obj;

  if (objType.type === "union") {
    // Check if obj is already in { type, val } format
    if (
      typeof obj === "object" &&
      obj !== null &&
      "type" in obj &&
      "val" in obj &&
      typeof (obj as { type: unknown }).type === "string"
    ) {
      const unionVal = obj as { type: string; val: unknown };
      const variantType = schema[unionVal.type];
      return {
        type: unionVal.type,
        val: variantType ? wrapUnions(unionVal.val, variantType, schema, unionVariants) : unionVal.val,
      };
    }

    // Check if obj is a class instance that's a union variant
    const proto = Object.getPrototypeOf(obj);
    if (proto && proto.constructor && proto.constructor !== Object) {
      const className = proto.constructor.name;
      if (className && unionVariants.has(className)) {
        const variantType = schema[className];
        return {
          type: className,
          val: variantType ? wrapUnions(obj, variantType, schema, unionVariants) : obj,
        };
      }
    }
    return obj;
  }

  if (objType.type === "object") {
    const proto = Object.getPrototypeOf(obj);
    const wrappedObj: Record<string, unknown> =
      proto && proto.constructor && proto.constructor !== Object ? Object.create(proto) : {};

    // Only process schema-defined properties
    for (const [key, propType] of Object.entries(objType.properties)) {
      const value = (obj as Record<string, unknown>)[key];
      wrappedObj[key] = wrapUnionValue(value, propType, schema, unionVariants);
    }
    return wrappedObj;
  }

  return obj;
}

function wrapUnionValue(
  value: unknown,
  propType: PropertyType,
  schema: Record<string, NamedType>,
  unionVariants: Set<string>
): unknown {
  if (value === null || value === undefined) return value;

  if (propType.type === "reference") {
    return wrapUnions(value, propType.ref, schema, unionVariants);
  }

  if (propType.type === "array") {
    return (value as unknown[]).map((item) => wrapUnionValue(item, propType.value, schema, unionVariants));
  }

  if (propType.type === "record") {
    const map = value as Map<unknown, unknown>;
    const wrapped = new Map<unknown, unknown>();
    for (const [k, v] of map) {
      wrapped.set(k, wrapUnionValue(v, propType.value, schema, unionVariants));
    }
    return wrapped;
  }

  if (propType.type === "optional") {
    return wrapUnionValue(value, propType.value, schema, unionVariants);
  }

  return value;
}
