import "reflect-metadata";
import { load, DeltaPackApi } from "./interpreter.js";

// ============ Type Interfaces ============

export type PrimitiveType = EnumType | StringType | IntType | UIntType | FloatType | BooleanType;
export type ContainerType = ArrayType | OptionalType | RecordType;
export type Type = ReferenceType | ObjectType | UnionType | ContainerType | PrimitiveType;

// Each type has both an interface (for type annotations) and a function (for creating instances)
// TypeScript's declaration merging allows them to share the same name

export interface ReferenceType {
  type: "reference";
  reference: string;
}

export interface ObjectType {
  type: "object";
  properties: Record<string, PrimitiveType | ContainerType | ReferenceType>;
}

export interface UnionType {
  type: "union";
  options: readonly ReferenceType[];
}

export interface ArrayType {
  type: "array";
  value: PrimitiveType | ContainerType | ReferenceType;
}

export interface OptionalType {
  type: "optional";
  value: PrimitiveType | ContainerType | ReferenceType;
}

export interface RecordType {
  type: "record";
  key: StringType | IntType | UIntType;
  value: PrimitiveType | ContainerType | ReferenceType;
}

export interface EnumType {
  type: "enum";
  options: readonly string[];
}

export interface StringType {
  type: "string";
}

export interface IntType {
  type: "int";
}

export interface UIntType {
  type: "uint";
}

export interface FloatType {
  type: "float";
  precision?: number | undefined;
}

export interface BooleanType {
  type: "boolean";
}

// ============ Utility Functions ============

export function isPrimitiveType(type: Type, schema: Record<string, Type>): boolean {
  if (type.type === "reference" && schema) {
    const refType = schema[type.reference];
    if (!refType) {
      throw new Error(`Unknown reference type: ${type.reference}`);
    }
    return isPrimitiveType(refType, schema);
  }

  return (
    type.type === "string" ||
    type.type === "int" ||
    type.type === "uint" ||
    type.type === "float" ||
    type.type === "boolean" ||
    type.type === "enum"
  );
}

// ============ Metadata Keys ============

const SCHEMA_TYPE = "deltapack:schemaType";
const UNION_VARIANTS = "deltapack:union";

// ============ Internal Types ============

type SchemaTypeOrRef = PrimitiveType | ContainerType | ReferenceType | { __class: Function };

// A unified type that works as both a PropertyDecorator and a schema type
type UnifiedType<T> = PropertyDecorator & T;

// ============ Helper Types ============

export type TsStringEnum = { [key: string]: string };

export type ElementType =
  | typeof String
  | typeof Number
  | typeof Boolean
  | Function
  | Function[]
  | TsStringEnum
  | SchemaTypeOrRef;

export interface NumberOptions {
  unsigned?: boolean;
  float?: boolean | number;
}

export interface EnumOptions {
  enumName?: string;
}

// ============ Internal Helpers ============

export function isTsStringEnum(value: unknown): value is TsStringEnum {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  return keys.length > 0 && keys.every((key) => typeof obj[key] === "string");
}

export function getTsEnumValues(enumObj: TsStringEnum): string[] {
  return Object.values(enumObj);
}

export function getTsEnumName(enumObj: TsStringEnum): string {
  const values = getTsEnumValues(enumObj);
  return values.map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join("Or");
}

function isSchemaType(value: unknown): value is SchemaTypeOrRef {
  if (value === null) return false;
  if (typeof value === "object" || typeof value === "function") {
    return "type" in value;
  }
  return false;
}

function toKeyType(elementType: ElementType): StringType | IntType | UIntType {
  if (isSchemaType(elementType)) {
    const t = elementType as { type: string };
    if (t.type === "string" || t.type === "int" || t.type === "uint") {
      return elementType as StringType | IntType | UIntType;
    }
  }
  if (elementType === String) {
    return { type: "string" };
  }
  if (elementType === Number) {
    return { type: "int" };
  }
  return { type: "string" };
}

function toSchemaType(elementType: ElementType, options?: NumberOptions & EnumOptions): SchemaTypeOrRef {
  if (isSchemaType(elementType)) {
    return elementType;
  }

  if (elementType === String) {
    return { type: "string" };
  }
  if (elementType === Boolean) {
    return { type: "boolean" };
  }
  if (elementType === Number) {
    if (options?.float !== undefined) {
      return typeof options.float === "number" ? { type: "float", precision: options.float } : { type: "float" };
    }
    if (options?.unsigned) {
      return { type: "uint" };
    }
    return { type: "int" };
  }

  if (isTsStringEnum(elementType)) {
    return {
      type: "enum" as const,
      options: getTsEnumValues(elementType),
      __enumName: options?.enumName ?? getTsEnumName(elementType),
    } as unknown as SchemaTypeOrRef;
  }

  if (Array.isArray(elementType)) {
    return { __union: elementType } as unknown as SchemaTypeOrRef;
  }

  return { __class: elementType };
}

function createUnifiedType<T>(schemaType: T): UnifiedType<T> {
  const decorator: PropertyDecorator = (target, propertyKey) => {
    Reflect.defineMetadata(SCHEMA_TYPE, schemaType, target, propertyKey);
  };
  return Object.assign(decorator, schemaType) as UnifiedType<T>;
}

function stripDecorator<T extends PrimitiveType | ContainerType | ReferenceType>(type: T): T {
  if (typeof type === "function") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(type)) {
      const value = (type as unknown as Record<string, unknown>)[key];
      if (typeof value === "object" && value !== null && "type" in (value as Record<string, unknown>)) {
        result[key] = stripDecorator(value as unknown as PrimitiveType | ContainerType | ReferenceType);
      } else {
        result[key] = value;
      }
    }
    return result as T;
  }

  if (typeof type === "object" && type !== null) {
    const t = type as unknown as Record<string, unknown>;
    if ("value" in t && typeof t["value"] === "function") {
      return {
        ...type,
        value: stripDecorator(t["value"] as unknown as PrimitiveType | ContainerType | ReferenceType),
      } as T;
    }
    if ("value" in t && typeof t["value"] === "object" && t["value"] !== null) {
      return {
        ...type,
        value: stripDecorator(t["value"] as unknown as PrimitiveType | ContainerType | ReferenceType),
      } as T;
    }
    if ("key" in t && typeof t["key"] === "function") {
      const stripped: Record<string, unknown> = {
        ...type,
        key: stripDecorator(t["key"] as unknown as StringType | IntType | UIntType),
      };
      if ("value" in t && (typeof t["value"] === "function" || typeof t["value"] === "object")) {
        stripped["value"] = stripDecorator(t["value"] as unknown as PrimitiveType | ContainerType | ReferenceType);
      }
      return stripped as T;
    }
  }

  return type;
}

// ============ Primitive Type Constructors ============

export function StringType(): UnifiedType<StringType> {
  return createUnifiedType({ type: "string" as const });
}

export function BooleanType(): UnifiedType<BooleanType> {
  return createUnifiedType({ type: "boolean" as const });
}

export function IntType(): UnifiedType<IntType> {
  return createUnifiedType({ type: "int" as const });
}

export function UIntType(): UnifiedType<UIntType> {
  return createUnifiedType({ type: "uint" as const });
}

export function FloatType(options?: { precision?: number | string }): UnifiedType<FloatType> {
  if (typeof options?.precision === "number") {
    return createUnifiedType({ type: "float" as const, precision: options.precision });
  } else if (typeof options?.precision === "string") {
    return createUnifiedType({ type: "float" as const, precision: parseFloat(options.precision) });
  }
  return createUnifiedType({ type: "float" as const });
}

// ============ Container Type Constructors ============

// Schema mode overload
export function ArrayType<const V extends PrimitiveType | ContainerType | ReferenceType>(
  value: V
): { type: "array"; value: V };
// Decorator mode overload
export function ArrayType(
  elementType: ElementType,
  options?: NumberOptions & EnumOptions
): UnifiedType<{ type: "array"; value: SchemaTypeOrRef }>;
// Implementation
export function ArrayType(
  elementType: ElementType,
  options?: NumberOptions & EnumOptions
): { type: "array"; value: PrimitiveType | ContainerType | ReferenceType | SchemaTypeOrRef } {
  const valueType = toSchemaType(elementType, options);
  const schemaType = {
    type: "array" as const,
    value: stripDecorator(valueType as PrimitiveType | ContainerType | ReferenceType),
  };
  if (typeof elementType === "object" && elementType !== null && "type" in elementType) {
    return schemaType;
  }
  return createUnifiedType(schemaType);
}

// Schema mode overload
export function RecordType<
  const K extends StringType | IntType | UIntType,
  const V extends PrimitiveType | ContainerType | ReferenceType,
>(key: K, value: V): { type: "record"; key: K; value: V };
// Decorator mode overload
export function RecordType(
  keyType: ElementType,
  valueType: ElementType,
  options?: NumberOptions & EnumOptions
): UnifiedType<{ type: "record"; key: StringType | IntType | UIntType; value: SchemaTypeOrRef }>;
// Implementation
export function RecordType(
  keyType: ElementType,
  valueType: ElementType,
  options?: NumberOptions & EnumOptions
): { type: "record"; key: StringType | IntType | UIntType; value: SchemaTypeOrRef } {
  const resolvedKey = stripDecorator(toKeyType(keyType) as StringType | IntType | UIntType);
  const resolvedValue = stripDecorator(
    toSchemaType(valueType, options) as PrimitiveType | ContainerType | ReferenceType
  );
  const schemaType = { type: "record" as const, key: resolvedKey, value: resolvedValue };
  if (typeof keyType === "object" && keyType !== null && "type" in keyType) {
    return schemaType;
  }
  return createUnifiedType(schemaType);
}

// Schema mode overload
export function OptionalType<const V extends PrimitiveType | ContainerType | ReferenceType>(
  value: V
): { type: "optional"; value: V };
// Decorator mode overload
export function OptionalType(
  elementType: ElementType,
  options?: NumberOptions & EnumOptions
): UnifiedType<{ type: "optional"; value: SchemaTypeOrRef }>;
// Implementation
export function OptionalType(
  elementType: ElementType,
  options?: NumberOptions & EnumOptions
): { type: "optional"; value: PrimitiveType | ContainerType | ReferenceType | SchemaTypeOrRef } {
  const valueType = toSchemaType(elementType, options);
  const schemaType = {
    type: "optional" as const,
    value: stripDecorator(valueType as PrimitiveType | ContainerType | ReferenceType),
  };
  if (typeof elementType === "object" && elementType !== null && "type" in elementType) {
    return schemaType;
  }
  return createUnifiedType(schemaType);
}

// ============ Reference Type Constructors ============

// Schema mode overload
export function ReferenceType<const R extends string>(reference: R): { type: "reference"; reference: R };
// Decorator mode overload
export function ReferenceType(typeRef: Function | TsStringEnum, options?: EnumOptions): UnifiedType<SchemaTypeOrRef>;
// Implementation
export function ReferenceType(
  typeRef: Function | TsStringEnum | string,
  options?: EnumOptions
): { type: "reference"; reference: string } | UnifiedType<SchemaTypeOrRef> {
  if (typeof typeRef === "string") {
    return { type: "reference", reference: typeRef };
  }
  const schemaType = toSchemaType(typeRef, options);
  return createUnifiedType(schemaType);
}

// ============ Schema-Only Type Constructors ============

export function EnumType<const O extends readonly string[]>(options: O): { type: "enum"; options: O } {
  return { type: "enum", options };
}

export function ObjectType<const P extends Record<string, PrimitiveType | ContainerType | ReferenceType>>(
  properties: P
): { type: "object"; properties: P } {
  const cleanProperties: Record<string, PrimitiveType | ContainerType | ReferenceType> = {};
  for (const [key, value] of Object.entries(properties)) {
    cleanProperties[key] = stripDecorator(value as PrimitiveType | ContainerType | ReferenceType);
  }
  return { type: "object", properties: cleanProperties as P };
}

// Schema mode overload
export function UnionType<const O extends readonly ReferenceType[]>(options: O): { type: "union"; options: O };
// Decorator mode overload
export function UnionType(variants: Function[]): ClassDecorator;
// Implementation
export function UnionType(
  variantsOrOptions: Function[] | readonly ReferenceType[]
): ClassDecorator | { type: "union"; options: readonly ReferenceType[] } {
  if (variantsOrOptions.length > 0 && typeof variantsOrOptions[0] === "object" && "type" in variantsOrOptions[0]) {
    return { type: "union", options: variantsOrOptions as readonly ReferenceType[] };
  }
  return (target) => {
    Reflect.defineMetadata(UNION_VARIANTS, variantsOrOptions, target);
  };
}

// ============ Types ============

type Constructor<T = unknown> = new (...args: unknown[]) => T;

function isClassRef(value: unknown): value is { __class: Function } {
  return typeof value === "object" && value !== null && "__class" in value;
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
    const properties: Record<string, PrimitiveType | ContainerType | ReferenceType> = {};

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

  function resolveSchemaType(schemaType: SchemaTypeOrRef): PrimitiveType | ContainerType | ReferenceType {
    if (isClassRef(schemaType)) {
      const cls = schemaType.__class;
      processClass(cls);
      return { type: "reference", reference: cls.name };
    }

    if ("__union" in schemaType) {
      const variants = (schemaType as { __union: Function[] }).__union;
      const unionName = variants.map((v) => v.name).join("Or");

      for (const variant of variants) {
        processClass(variant);
      }
      if (!schema[unionName]) {
        schema[unionName] = {
          type: "union",
          options: variants.map((v) => ({ type: "reference" as const, reference: v.name })),
        };
      }
      return { type: "reference", reference: unionName };
    }

    if ("__enumName" in schemaType) {
      const enumType = schemaType as { type: "enum"; options: string[]; __enumName: string };
      const enumName = enumType.__enumName;
      if (!schema[enumName]) {
        schema[enumName] = { type: "enum", options: enumType.options };
      }
      return { type: "reference", reference: enumName };
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
      const recType = schemaType as { type: "record"; key: StringType; value: SchemaTypeOrRef };
      return { type: "record", key: recType.key, value: resolveSchemaType(recType.value) };
    }

    return schemaType as PrimitiveType;
  }

  processClass(rootClass);
  return schema;
}

// ============ Class Loader ============

export function loadClass<T extends object>(rootClass: Constructor<T>): DeltaPackApi<T> {
  const schema = buildSchema(rootClass);
  const rawApi = load<T>(schema, rootClass.name);

  const unionVariants = new Set<string>();
  collectUnionVariants(rootClass, unionVariants, new Set());

  // Collect all class constructors for hydration
  const classMap = new Map<string, Constructor>();
  collectClasses(rootClass, classMap, new Set());

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

  function hydrateValue(value: unknown, propType: PrimitiveType | ContainerType | ReferenceType): unknown {
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

  return {
    ...rawApi,
    fromJson: (obj: object) => hydrate(rawApi.fromJson(wrapUnions(obj, unionVariants) as object), rootClass.name) as T,
    encode: (obj: T) => rawApi.encode(wrapUnions(obj, unionVariants) as T),
    decode: (buf: Uint8Array) => hydrate(rawApi.decode(buf), rootClass.name) as T,
    encodeDiff: (a: T, b: T) => rawApi.encodeDiff(wrapUnions(a, unionVariants) as T, wrapUnions(b, unionVariants) as T),
    decodeDiff: (a: T, diff: Uint8Array) =>
      hydrate(rawApi.decodeDiff(wrapUnions(a, unionVariants) as T, diff), rootClass.name) as T,
    equals: (a: T, b: T) => rawApi.equals(wrapUnions(a, unionVariants) as T, wrapUnions(b, unionVariants) as T),
    clone: (obj: T) => hydrate(rawApi.clone(wrapUnions(obj, unionVariants) as T), rootClass.name) as T,
    toJson: (obj: T) => rawApi.toJson(wrapUnions(obj, unionVariants) as T),
  };
}

function collectClasses(cls: Function, classMap: Map<string, Constructor>, visited: Set<Function>): void {
  if (visited.has(cls)) return;
  visited.add(cls);

  const unionVariants = Reflect.getMetadata(UNION_VARIANTS, cls) as Function[] | undefined;
  if (unionVariants) {
    for (const variant of unionVariants) {
      collectClasses(variant, classMap, visited);
    }
    return;
  }

  // Store the constructor
  classMap.set(cls.name, cls as Constructor);

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
      collectClassesFromType(schemaType, classMap, visited);
    }
  }
}

function collectClassesFromType(
  schemaType: SchemaTypeOrRef,
  classMap: Map<string, Constructor>,
  visited: Set<Function>
): void {
  if (isClassRef(schemaType)) {
    collectClasses(schemaType.__class, classMap, visited);
  } else if (typeof schemaType === "object" && "type" in schemaType) {
    const type = schemaType as ContainerType;
    if (type.type === "array" || type.type === "optional") {
      collectClassesFromType(type.value as SchemaTypeOrRef, classMap, visited);
    } else if (type.type === "record") {
      collectClassesFromType(type.value as SchemaTypeOrRef, classMap, visited);
    }
  }
  // Enums and primitives don't need hydration
}

function collectUnionVariants(cls: Function, variants: Set<string>, visited: Set<Function>): void {
  if (visited.has(cls)) return;
  visited.add(cls);

  const unionVariantClasses = Reflect.getMetadata(UNION_VARIANTS, cls) as Function[] | undefined;
  if (unionVariantClasses) {
    for (const variant of unionVariantClasses) {
      variants.add(variant.name);
      collectUnionVariants(variant, variants, visited);
    }
    return;
  }

  let instance: object;
  try {
    instance = new (cls as Constructor)() as object;
  } catch {
    return;
  }

  for (const key of Object.keys(instance)) {
    const schemaType = Reflect.getMetadata(SCHEMA_TYPE, cls.prototype, key);
    if (schemaType) {
      collectFromSchemaType(schemaType, variants, visited);
    }
  }
}

function collectFromSchemaType(schemaType: unknown, variants: Set<string>, visited: Set<Function>): void {
  if (!schemaType || typeof schemaType !== "object") return;

  if ("__class" in schemaType) {
    const cls = (schemaType as { __class: Function }).__class;
    collectUnionVariants(cls, variants, visited);
    return;
  }

  if ("__union" in schemaType) {
    const unionClasses = (schemaType as { __union: Function[] }).__union;
    for (const variant of unionClasses) {
      variants.add(variant.name);
      collectUnionVariants(variant, variants, visited);
    }
    return;
  }

  const type = (schemaType as Record<string, unknown>)["type"];
  if (type === "array" || type === "optional") {
    collectFromSchemaType((schemaType as { value: unknown }).value, variants, visited);
  } else if (type === "record") {
    collectFromSchemaType((schemaType as { value: unknown }).value, variants, visited);
  }
}

function wrapUnions(obj: unknown, unionVariants: Set<string>): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => wrapUnions(item, unionVariants));
  }

  if (obj instanceof Map) {
    const wrapped = new Map<string, unknown>();
    for (const [key, value] of obj) {
      wrapped.set(key, wrapUnions(value, unionVariants));
    }
    return wrapped;
  }

  if (typeof obj === "object") {
    const proto = Object.getPrototypeOf(obj);

    if (proto && proto.constructor && proto.constructor !== Object) {
      const cls = proto.constructor;
      const className = cls.name;

      if (className && unionVariants.has(className)) {
        const wrappedObj: Record<string, unknown> = {};
        for (const key of Object.keys(obj as object)) {
          wrappedObj[key] = wrapUnions((obj as Record<string, unknown>)[key], unionVariants);
        }
        return { type: className, val: wrappedObj };
      }

      // Preserve prototype for class instances
      const wrappedObj: Record<string, unknown> = Object.create(proto);
      for (const key of Object.keys(obj as object)) {
        wrappedObj[key] = wrapUnions((obj as Record<string, unknown>)[key], unionVariants);
      }
      return wrappedObj;
    }

    const wrappedObj: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      wrappedObj[key] = wrapUnions((obj as Record<string, unknown>)[key], unionVariants);
    }
    return wrappedObj;
  }

  return obj;
}
