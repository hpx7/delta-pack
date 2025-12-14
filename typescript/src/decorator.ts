import "reflect-metadata";
import { load, DeltaPackApi } from "./interpreter.js";
import { Type, PropertyType, SCHEMA_TYPE, UNION_VARIANTS } from "./schema.js";

// ============ Types ============

type Constructor<T = unknown> = new (...args: unknown[]) => T;

interface EnumDef {
  options: string[];
  name: string;
}

type SchemaTypeOrRef = PropertyType | { __class: Function } | { __enum: EnumDef };

// ============ Helper Functions ============

function isClassRef(value: unknown): value is { __class: Function } {
  return typeof value === "object" && value !== null && "__class" in value;
}

function isEnumRef(value: unknown): value is { __enum: EnumDef } {
  return typeof value === "object" && value !== null && "__enum" in value;
}

// ============ Schema Builder ============

export function buildSchema<T extends object>(rootClass: Constructor<T>): Record<string, Type> {
  const schema: Record<string, Type> = {};
  const visited = new Set<Function>();

  function processClass(cls: Function): void {
    if (visited.has(cls)) return;
    visited.add(cls);

    const unionVariants = Reflect.getMetadata(UNION_VARIANTS, cls) as Function[] | undefined;
    if (unionVariants) {
      for (const variant of unionVariants) {
        processClass(variant);
      }
      schema[cls.name] = {
        type: "union",
        options: unionVariants.map((v) => ({ type: "reference" as const, reference: v.name })),
      };
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
        properties[key] = resolveSchemaType(schemaType);
      }
      // Properties without decorators are ignored (not serialized)
    }

    if (Object.keys(properties).length === 0) {
      throw new Error(
        `Class ${cls.name} must have at least one property decorator. ` + `Use @StringType(), @IntType(), etc.`
      );
    }

    schema[cls.name] = { type: "object", properties };
  }

  function resolveSchemaType(schemaType: SchemaTypeOrRef): PropertyType {
    if (isClassRef(schemaType)) {
      const cls = schemaType.__class;
      processClass(cls);
      return { type: "reference", reference: cls.name };
    }

    if (isEnumRef(schemaType)) {
      const enumDef = schemaType.__enum;
      if (!schema[enumDef.name]) {
        schema[enumDef.name] = { type: "enum", options: enumDef.options };
      }
      return { type: "reference", reference: enumDef.name };
    }

    if (schemaType.type === "array") {
      const arrayType = schemaType as { type: "array"; value: SchemaTypeOrRef };
      return { type: "array", value: resolveSchemaType(arrayType.value) };
    }
    if (schemaType.type === "optional") {
      const optType = schemaType as { type: "optional"; value: SchemaTypeOrRef };
      return { type: "optional", value: resolveSchemaType(optType.value) };
    }
    if (schemaType.type === "record") {
      const recType = schemaType as { type: "record"; key: { type: "string" }; value: SchemaTypeOrRef };
      return { type: "record", key: recType.key, value: resolveSchemaType(recType.value) };
    }

    // Only non-enum primitives reach here (enums are resolved via isEnumRef above)
    return schemaType as PropertyType;
  }

  processClass(rootClass);
  return schema;
}

// ============ Class Loader ============

export function loadClass<T extends object>(rootClass: Constructor<T>): DeltaPackApi<T> {
  const schema = buildSchema(rootClass);
  const rawApi = load<T>(schema, rootClass.name);

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
          instance[key] = hydrateValue(value, propType);
        }
        return instance;
      }
    }
    return obj;
  }

  function hydrateValue(value: unknown, propType: PropertyType): unknown {
    if (value === null || value === undefined) return value;

    if (propType.type === "reference") {
      return hydrate(value, propType.reference);
    } else if (propType.type === "array") {
      return (value as unknown[]).map((item) => hydrateValue(item, propType.value));
    } else if (propType.type === "record") {
      const map = value as Map<unknown, unknown>;
      const hydrated = new Map<unknown, unknown>();
      for (const [k, v] of map) {
        hydrated.set(k, hydrateValue(v, propType.value));
      }
      return hydrated;
    } else if (propType.type === "optional") {
      return hydrateValue(value, propType.value);
    }
    return value;
  }

  const rootType = schema[rootClass.name];
  if (!rootType) {
    throw new Error(`Type ${rootClass.name} not found in schema`);
  }
  const wrap = (obj: T) => wrapUnions(obj, rootType, schema, unionVariants) as T;

  return {
    ...rawApi,
    fromJson: (obj: object) => hydrate(rawApi.fromJson(wrap(obj as T)), rootClass.name) as T,
    encode: (obj: T) => rawApi.encode(wrap(obj)),
    decode: (buf: Uint8Array) => hydrate(rawApi.decode(buf), rootClass.name) as T,
    encodeDiff: (a: T, b: T) => rawApi.encodeDiff(wrap(a), wrap(b)),
    decodeDiff: (a: T, diff: Uint8Array) => hydrate(rawApi.decodeDiff(wrap(a), diff), rootClass.name) as T,
    equals: (a: T, b: T) => rawApi.equals(wrap(a), wrap(b)),
    clone: (obj: T) => hydrate(rawApi.clone(wrap(obj)), rootClass.name) as T,
    toJson: (obj: T) => rawApi.toJson(wrap(obj)),
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

function wrapUnions(obj: unknown, objType: Type, schema: Record<string, Type>, unionVariants: Set<string>): unknown {
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

  if (objType.type === "reference") {
    const refType = schema[objType.reference];
    return refType ? wrapUnions(obj, refType, schema, unionVariants) : obj;
  }

  return obj;
}

function wrapUnionValue(
  value: unknown,
  propType: PropertyType,
  schema: Record<string, Type>,
  unionVariants: Set<string>
): unknown {
  if (value === null || value === undefined) return value;

  if (propType.type === "reference") {
    const refType = schema[propType.reference];
    return refType ? wrapUnions(value, refType, schema, unionVariants) : value;
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
