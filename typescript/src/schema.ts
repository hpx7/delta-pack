// ============ Type Interfaces ============

export type PrimitiveType = EnumType | StringType | IntType | UIntType | FloatType | BooleanType;
export type ContainerType = ArrayType | OptionalType | RecordType;
export type PropertyType = StringType | IntType | UIntType | FloatType | BooleanType | ContainerType | ReferenceType;
export type Type = ReferenceType | ObjectType | UnionType | ContainerType | PrimitiveType;

// Each type has both an interface (for type annotations) and a function (for creating instances)
// TypeScript's declaration merging allows them to share the same name

export interface ReferenceType {
  type: "reference";
  reference: string;
}

export interface ObjectType {
  type: "object";
  properties: Record<string, PropertyType>;
}

export interface UnionType {
  type: "union";
  options: readonly ReferenceType[];
}

export interface ArrayType {
  type: "array";
  value: PropertyType;
}

export interface OptionalType {
  type: "optional";
  value: PropertyType;
}

export interface RecordType {
  type: "record";
  key: StringType | IntType | UIntType;
  value: PropertyType;
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

interface EnumDef {
  options: string[];
  name: string;
}

// Types that can be used as values in containers (both schema mode and decorator mode)
type ValueType = PrimitiveType | ContainerType | ReferenceType | { __class: Function } | { __enum: EnumDef };

// A unified type that works as both a PropertyDecorator and a schema type
type UnifiedType<T> = PropertyDecorator & T;

// ============ Internal Helpers ============

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
  return createUnifiedType({ type: "string" });
}

export function BooleanType(): UnifiedType<BooleanType> {
  return createUnifiedType({ type: "boolean" });
}

export function IntType(): UnifiedType<IntType> {
  return createUnifiedType({ type: "int" });
}

export function UIntType(): UnifiedType<UIntType> {
  return createUnifiedType({ type: "uint" });
}

export function FloatType(options?: { precision?: number | string }): UnifiedType<FloatType> {
  if (typeof options?.precision === "number") {
    return createUnifiedType({ type: "float", precision: options.precision });
  } else if (typeof options?.precision === "string") {
    return createUnifiedType({ type: "float", precision: parseFloat(options.precision) });
  }
  return createUnifiedType({ type: "float" });
}

// ============ Container Type Constructors ============

export function ArrayType<const V extends ValueType>(value: V): UnifiedType<{ type: "array"; value: V }> {
  const schemaType = {
    type: "array" as const,
    value: stripDecorator(value as PrimitiveType | ContainerType | ReferenceType) as V,
  };
  return createUnifiedType(schemaType);
}

export function RecordType<const K extends StringType | IntType | UIntType, const V extends ValueType>(
  key: K,
  value: V
): UnifiedType<{ type: "record"; key: K; value: V }> {
  const schemaType = {
    type: "record" as const,
    key: stripDecorator(key),
    value: stripDecorator(value as PrimitiveType | ContainerType | ReferenceType) as V,
  };
  return createUnifiedType(schemaType);
}

export function OptionalType<const V extends ValueType>(value: V): UnifiedType<{ type: "optional"; value: V }> {
  const schemaType = {
    type: "optional" as const,
    value: stripDecorator(value as PrimitiveType | ContainerType | ReferenceType) as V,
  };
  return createUnifiedType(schemaType);
}

// ============ Reference Type Constructors ============

// Schema mode - string reference
export function ReferenceType<const R extends string>(reference: R): UnifiedType<{ type: "reference"; reference: R }>;
// Decorator mode - class reference
export function ReferenceType<C extends Function>(cls: C): UnifiedType<{ __class: C }>;
// Decorator mode - enum reference
export function ReferenceType<E extends Record<string, string>>(
  enumObj: E,
  options?: { enumName?: string }
): UnifiedType<{ __enum: EnumDef }>;
// Implementation
export function ReferenceType(
  ref: string | Function | Record<string, string>,
  options?: { enumName?: string }
):
  | UnifiedType<{ type: "reference"; reference: string }>
  | UnifiedType<{ __class: Function }>
  | UnifiedType<{ __enum: EnumDef }> {
  if (typeof ref === "string") {
    return createUnifiedType({ type: "reference" as const, reference: ref });
  }
  if (typeof ref === "function") {
    return createUnifiedType({ __class: ref });
  }
  // Enum object - generate name from options if not provided
  const enumOptions = Object.values(ref);
  const enumName = options?.enumName ?? `Enum_${enumOptions.join("_")}`;
  return createUnifiedType({ __enum: { options: enumOptions, name: enumName } });
}

// ============ Schema-Only Type Constructors ============

export function EnumType<const O extends readonly string[]>(options: O): { type: "enum"; options: O } {
  return { type: "enum", options };
}

export function ObjectType<const P extends Record<string, PropertyType>>(
  properties: P
): { type: "object"; properties: P } {
  const cleanProperties: Record<string, PropertyType> = {};
  for (const [key, value] of Object.entries(properties)) {
    cleanProperties[key] = stripDecorator(value as PropertyType);
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
  // Check if first item has "type" property with value "reference" (schema mode)
  // UnifiedType is a function with properties, so we check for the "type" property value
  const first = variantsOrOptions[0];
  if (first && "type" in first && (first as { type: unknown }).type === "reference") {
    return { type: "union", options: variantsOrOptions as readonly ReferenceType[] };
  }
  return (target) => {
    Reflect.defineMetadata(UNION_VARIANTS, variantsOrOptions, target);
  };
}
