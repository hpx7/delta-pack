import "reflect-metadata";
import { load, DeltaPackApi } from "./interpreter.js";
import {
  StringType,
  IntType,
  UIntType,
  FloatType,
  BooleanType,
  ArrayType,
  OptionalType,
  RecordType,
  ReferenceType,
  EnumType,
  UnionType,
  type PrimitiveType,
  type ContainerType,
  type Type,
} from "./schema.js";

// ============ Metadata Keys ============

const DELTA_PACK_SCHEMA_TYPE = "deltapack:schemaType";
const DELTA_PACK_UNION = "deltapack:union";

// ============ Types ============

type Constructor<T = unknown> = new (...args: unknown[]) => T;

// Type for schema types that may contain unresolved class references
type SchemaTypeOrRef = PrimitiveType | ContainerType | ReturnType<typeof ReferenceType> | { __class: Function };

/**
 * TypeScript string enum object type.
 */
export type TsStringEnum = { [key: string]: string };

/**
 * Element type for container decorators.
 * - String/Number/Boolean: primitive constructors
 * - Function: class reference
 * - Function[]: union of classes
 * - TsStringEnum: TypeScript string enum
 * - SchemaType: nested schema type from another decorator call
 */
export type ElementType =
  | typeof String
  | typeof Number
  | typeof Boolean
  | Function
  | Function[]
  | TsStringEnum
  | SchemaTypeOrRef;

/**
 * Options for number types in containers.
 */
export interface NumberOptions {
  unsigned?: boolean;
  float?: boolean | number;
}

/**
 * Options for enum references.
 */
export interface EnumOptions {
  enumName?: string;
}

// ============ Helper Functions ============

/**
 * Type guard to check if a value is a TypeScript string enum.
 */
export function isTsStringEnum(value: unknown): value is TsStringEnum {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  return keys.length > 0 && keys.every((key) => typeof obj[key] === "string");
}

/**
 * Gets enum values from a TypeScript string enum.
 */
export function getTsEnumValues(enumObj: TsStringEnum): string[] {
  return Object.values(enumObj);
}

/**
 * Gets a default name for a TypeScript enum based on its values.
 */
export function getTsEnumName(enumObj: TsStringEnum): string {
  const values = getTsEnumValues(enumObj);
  return values.map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join("Or");
}

/**
 * Check if value is a schema type object (has a "type" property).
 * Also handles functions with schema properties (from nested decorator calls).
 */
function isSchemaType(value: unknown): value is SchemaTypeOrRef {
  if (value === null) return false;
  // Handle both objects and functions with schema properties (nested decorator results)
  if (typeof value === "object" || typeof value === "function") {
    return "type" in value;
  }
  return false;
}

/**
 * Check if value is an unresolved class reference.
 */
function isClassRef(value: unknown): value is { __class: Function } {
  return typeof value === "object" && value !== null && "__class" in value;
}

/**
 * Convert an element type to a schema type.
 * Class references become { __class: Constructor } for later resolution.
 */
function toSchemaType(elementType: ElementType, options?: NumberOptions & EnumOptions): SchemaTypeOrRef {
  // Already a schema type (from nested decorator call)
  if (isSchemaType(elementType)) {
    return elementType;
  }

  // Primitive constructors
  if (elementType === String) {
    return StringType();
  }
  if (elementType === Boolean) {
    return BooleanType();
  }
  if (elementType === Number) {
    if (options?.float !== undefined) {
      return typeof options.float === "number" ? FloatType({ precision: options.float }) : FloatType();
    }
    if (options?.unsigned) {
      return UIntType();
    }
    return IntType();
  }

  // TypeScript string enum
  if (isTsStringEnum(elementType)) {
    // Store enum info for later resolution
    return {
      type: "enum" as const,
      options: getTsEnumValues(elementType),
      __enumName: options?.enumName ?? getTsEnumName(elementType),
    } as unknown as SchemaTypeOrRef;
  }

  // Union (array of classes)
  if (Array.isArray(elementType)) {
    return {
      __union: elementType,
    } as unknown as SchemaTypeOrRef;
  }

  // Class reference
  return { __class: elementType };
}

// ============ Property Decorators ============

/**
 * String property decorator.
 */
export function DeltaPackString(): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(DELTA_PACK_SCHEMA_TYPE, StringType(), target, propertyKey);
  };
}

/**
 * Boolean property decorator.
 */
export function DeltaPackBool(): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(DELTA_PACK_SCHEMA_TYPE, BooleanType(), target, propertyKey);
  };
}

/**
 * Integer property decorator.
 */
export function DeltaPackInt(options?: { unsigned?: boolean }): PropertyDecorator {
  return (target, propertyKey) => {
    const schemaType = options?.unsigned ? UIntType() : IntType();
    Reflect.defineMetadata(DELTA_PACK_SCHEMA_TYPE, schemaType, target, propertyKey);
  };
}

/**
 * Float property decorator.
 */
export function DeltaPackFloat(options?: { precision?: number }): PropertyDecorator {
  return (target, propertyKey) => {
    const schemaType = options?.precision ? FloatType({ precision: options.precision }) : FloatType();
    Reflect.defineMetadata(DELTA_PACK_SCHEMA_TYPE, schemaType, target, propertyKey);
  };
}

/**
 * Reference to another class or enum.
 */
export function DeltaPackRef(typeRef: Function | TsStringEnum, options?: EnumOptions): PropertyDecorator {
  return (target, propertyKey) => {
    const schemaType = toSchemaType(typeRef, options);
    Reflect.defineMetadata(DELTA_PACK_SCHEMA_TYPE, schemaType, target, propertyKey);
  };
}

/**
 * Array property decorator.
 * Returns both a PropertyDecorator and a schema type for nesting.
 */
export function DeltaPackArrayOf(
  elementType: ElementType,
  options?: NumberOptions & EnumOptions
): PropertyDecorator & { type: "array"; value: SchemaTypeOrRef } {
  const valueType = toSchemaType(elementType, options);
  const schemaType = { type: "array" as const, value: valueType };

  const decorator: PropertyDecorator = (target, propertyKey) => {
    Reflect.defineMetadata(DELTA_PACK_SCHEMA_TYPE, schemaType, target, propertyKey);
  };

  return Object.assign(decorator, schemaType);
}

/**
 * Map property decorator (string keys).
 * Returns both a PropertyDecorator and a schema type for nesting.
 */
export function DeltaPackMapOf(
  valueType: ElementType,
  options?: NumberOptions & EnumOptions
): PropertyDecorator & { type: "record"; key: ReturnType<typeof StringType>; value: SchemaTypeOrRef } {
  const resolvedValue = toSchemaType(valueType, options);
  const schemaType = { type: "record" as const, key: StringType(), value: resolvedValue };

  const decorator: PropertyDecorator = (target, propertyKey) => {
    Reflect.defineMetadata(DELTA_PACK_SCHEMA_TYPE, schemaType, target, propertyKey);
  };

  return Object.assign(decorator, schemaType);
}

/**
 * Optional property decorator.
 * Returns both a PropertyDecorator and a schema type for nesting.
 */
export function DeltaPackOptionalOf(
  elementType: ElementType,
  options?: NumberOptions & EnumOptions
): PropertyDecorator & { type: "optional"; value: SchemaTypeOrRef } {
  const valueType = toSchemaType(elementType, options);
  const schemaType = { type: "optional" as const, value: valueType };

  const decorator: PropertyDecorator = (target, propertyKey) => {
    Reflect.defineMetadata(DELTA_PACK_SCHEMA_TYPE, schemaType, target, propertyKey);
  };

  return Object.assign(decorator, schemaType);
}

/**
 * Union class decorator.
 */
export function DeltaPackUnion(variants: Function[]): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(DELTA_PACK_UNION, variants, target);
  };
}

// ============ Schema Builder ============

/**
 * Build a schema from a decorated class.
 * This function traverses the class and its references to generate a complete schema.
 */
export function buildSchema<T extends object>(rootClass: Constructor<T>): Record<string, Type> {
  const schema: Record<string, Type> = {};
  const visited = new Set<Function>();

  function processClass(cls: Function): void {
    if (visited.has(cls)) return;
    visited.add(cls);

    // Check for union FIRST (before trying to instantiate)
    const unionVariants = Reflect.getMetadata(DELTA_PACK_UNION, cls) as Function[] | undefined;
    if (unionVariants) {
      // Process each variant
      for (const variant of unionVariants) {
        processClass(variant);
      }
      // Create union type
      schema[cls.name] = UnionType(unionVariants.map((v) => ReferenceType(v.name)));
      return;
    }

    // Regular class - get properties by instantiating
    let instance: object;
    try {
      instance = new (cls as Constructor)() as object;
    } catch {
      throw new Error(
        `Cannot instantiate ${cls.name}. Classes must have a parameterless constructor. ` +
          `For abstract union types, use @DeltaPackUnion([Variant1, Variant2]).`
      );
    }

    const propertyKeys = Object.keys(instance);
    if (propertyKeys.length === 0) {
      throw new Error(
        `Class ${cls.name} must have DeltaPack property decorators. ` + `Use @DeltaPackString(), @DeltaPackInt(), etc.`
      );
    }

    const properties: Record<string, PrimitiveType | ContainerType | ReturnType<typeof ReferenceType>> = {};

    for (const key of propertyKeys) {
      const schemaType = Reflect.getMetadata(DELTA_PACK_SCHEMA_TYPE, cls.prototype, key);
      if (!schemaType) {
        throw new Error(
          `Cannot determine type for property ${cls.name}.${key}. ` +
            `Use @DeltaPackString(), @DeltaPackInt(), @DeltaPackArrayOf(), etc.`
        );
      }
      properties[key] = resolveSchemaType(schemaType);
    }

    schema[cls.name] = { type: "object", properties };
  }

  function resolveSchemaType(
    schemaType: SchemaTypeOrRef
  ): PrimitiveType | ContainerType | ReturnType<typeof ReferenceType> {
    // Class reference
    if (isClassRef(schemaType)) {
      const cls = schemaType.__class;
      processClass(cls);
      return ReferenceType(cls.name);
    }

    // Union reference
    if ("__union" in schemaType) {
      const variants = (schemaType as { __union: Function[] }).__union;
      const unionName = variants.map((v) => v.name).join("Or");

      // Process each variant and create union
      for (const variant of variants) {
        processClass(variant);
      }
      if (!schema[unionName]) {
        schema[unionName] = UnionType(variants.map((v) => ReferenceType(v.name)));
      }
      return ReferenceType(unionName);
    }

    // Enum with name
    if ("__enumName" in schemaType) {
      const enumType = schemaType as { type: "enum"; options: string[]; __enumName: string };
      const enumName = enumType.__enumName;
      if (!schema[enumName]) {
        schema[enumName] = EnumType(enumType.options);
      }
      return ReferenceType(enumName);
    }

    // Container types - recurse into value
    if (schemaType.type === "array") {
      const arrayType = schemaType as { type: "array"; value: SchemaTypeOrRef };
      return ArrayType(resolveSchemaType(arrayType.value));
    }
    if (schemaType.type === "optional") {
      const optType = schemaType as { type: "optional"; value: SchemaTypeOrRef };
      return OptionalType(resolveSchemaType(optType.value));
    }
    if (schemaType.type === "record") {
      const recType = schemaType as { type: "record"; key: ReturnType<typeof StringType>; value: SchemaTypeOrRef };
      return RecordType(recType.key, resolveSchemaType(recType.value));
    }

    // Primitive types - return as-is
    return schemaType as PrimitiveType;
  }

  processClass(rootClass);
  return schema;
}

// ============ Class Loader ============

/**
 * Load a DeltaPack API from a decorated class.
 * This is a convenience wrapper that builds a schema from the class and loads it.
 */
export function loadClass<T extends object>(rootClass: Constructor<T>): DeltaPackApi<T> {
  const schema = buildSchema(rootClass);
  const rawApi = load<T>(schema, rootClass.name);

  // Build a set of union variant class names
  const unionVariants = new Set<string>();
  collectUnionVariants(rootClass, unionVariants, new Set());

  // Wrap API methods to handle class instances with union types
  return {
    ...rawApi,
    fromJson: (obj: object) => rawApi.fromJson(wrapUnions(obj, unionVariants) as object),
    encode: (obj: T) => rawApi.encode(wrapUnions(obj, unionVariants) as T),
    encodeDiff: (a: T, b: T) => rawApi.encodeDiff(wrapUnions(a, unionVariants) as T, wrapUnions(b, unionVariants) as T),
    equals: (a: T, b: T) => rawApi.equals(wrapUnions(a, unionVariants) as T, wrapUnions(b, unionVariants) as T),
    clone: (obj: T) => rawApi.clone(wrapUnions(obj, unionVariants) as T),
    toJson: (obj: T) => rawApi.toJson(wrapUnions(obj, unionVariants) as T),
  };
}

/**
 * Collect all union variant class names by traversing the class hierarchy.
 */
function collectUnionVariants(cls: Function, variants: Set<string>, visited: Set<Function>): void {
  if (visited.has(cls)) return;
  visited.add(cls);

  // Check if this class is a union
  const unionVariantClasses = Reflect.getMetadata(DELTA_PACK_UNION, cls) as Function[] | undefined;
  if (unionVariantClasses) {
    for (const variant of unionVariantClasses) {
      variants.add(variant.name);
      collectUnionVariants(variant, variants, visited);
    }
    return;
  }

  // Regular class - check its properties for references
  let instance: object;
  try {
    instance = new (cls as Constructor)() as object;
  } catch {
    return; // Can't instantiate, skip
  }

  for (const key of Object.keys(instance)) {
    const schemaType = Reflect.getMetadata(DELTA_PACK_SCHEMA_TYPE, cls.prototype, key);
    if (schemaType) {
      collectFromSchemaType(schemaType, variants, visited);
    }
  }
}

/**
 * Collect union variants from a schema type object.
 */
function collectFromSchemaType(schemaType: unknown, variants: Set<string>, visited: Set<Function>): void {
  if (!schemaType || typeof schemaType !== "object") return;

  // Class reference
  if ("__class" in schemaType) {
    const cls = (schemaType as { __class: Function }).__class;
    collectUnionVariants(cls, variants, visited);
    return;
  }

  // Inline union
  if ("__union" in schemaType) {
    const unionClasses = (schemaType as { __union: Function[] }).__union;
    for (const variant of unionClasses) {
      variants.add(variant.name);
      collectUnionVariants(variant, variants, visited);
    }
    return;
  }

  // Container types
  const type = (schemaType as Record<string, unknown>)["type"];
  if (type === "array" || type === "optional") {
    collectFromSchemaType((schemaType as { value: unknown }).value, variants, visited);
  } else if (type === "record") {
    collectFromSchemaType((schemaType as { value: unknown }).value, variants, visited);
  }
}

/**
 * Recursively wrap class instances that are union variants into { type, val } format.
 * Only wraps classes that are known to be union variants.
 */
function wrapUnions(obj: unknown, unionVariants: Set<string>): unknown {
  if (obj === null || obj === undefined) return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => wrapUnions(item, unionVariants));
  }

  // Handle Maps
  if (obj instanceof Map) {
    const wrapped = new Map<string, unknown>();
    for (const [key, value] of obj) {
      wrapped.set(key, wrapUnions(value, unionVariants));
    }
    return wrapped;
  }

  // Handle objects (including class instances)
  if (typeof obj === "object") {
    const proto = Object.getPrototypeOf(obj);

    // Check if this is a class instance
    if (proto && proto.constructor && proto.constructor !== Object) {
      const cls = proto.constructor;
      const className = cls.name;

      // Only wrap if this class is a known union variant
      if (className && unionVariants.has(className)) {
        // Recursively wrap properties
        const wrappedObj: Record<string, unknown> = {};
        for (const key of Object.keys(obj as object)) {
          wrappedObj[key] = wrapUnions((obj as Record<string, unknown>)[key], unionVariants);
        }
        return { type: className, val: wrappedObj };
      }

      // Not a union variant - just recursively wrap properties
      const wrappedObj: Record<string, unknown> = {};
      for (const key of Object.keys(obj as object)) {
        wrappedObj[key] = wrapUnions((obj as Record<string, unknown>)[key], unionVariants);
      }
      return wrappedObj;
    }

    // Regular plain object - recursively wrap properties
    const wrappedObj: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      wrappedObj[key] = wrapUnions((obj as Record<string, unknown>)[key], unionVariants);
    }
    return wrappedObj;
  }

  return obj;
}
