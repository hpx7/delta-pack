import { createUnifiedType, createUnionDecorator, stripDecorator, UnifiedType, ClassRef, EnumRef } from "./unified.js";

// ============ Type Interfaces ============

// Type categories
export type PrimitiveType = StringType | IntType | UIntType | FloatType | BooleanType;
export type ContainerType = ArrayType | OptionalType | RecordType;
export type PropertyType = PrimitiveType | ContainerType | ReferenceType | SelfReferenceType;
export type NamedType = ObjectType | UnionType | EnumType;
export type Type = NamedType | PropertyType;

// Primitive types
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

// Container types
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

// Reference types
export interface ReferenceType {
  type: "reference";
  ref: NamedType;
}

export interface SelfReferenceType {
  type: "self-reference";
}

// Named types
export interface ObjectType {
  type: "object";
  properties: Record<string, PropertyType>;
  name: string;
}

export interface UnionType {
  type: "union";
  options: readonly NamedType[];
  name: string;
}

export interface EnumType {
  type: "enum";
  options: readonly string[];
  name: string;
}

// ============ Utility Functions ============

export function isPrimitiveOrEnum(type: Type): boolean {
  if (type.type === "reference") {
    return isPrimitiveOrEnum(type.ref);
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

// Types that can be used as values in containers (both schema mode and decorator mode)
type ValueType = PropertyType | ClassRef | EnumRef;

export function ArrayType<const V extends ValueType>(value: V): UnifiedType<{ type: "array"; value: V }> {
  const schemaType = {
    type: "array" as const,
    value: stripDecorator(value as PropertyType) as V,
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
    value: stripDecorator(value as PropertyType) as V,
  };
  return createUnifiedType(schemaType);
}

export function OptionalType<const V extends ValueType>(value: V): UnifiedType<{ type: "optional"; value: V }> {
  const schemaType = {
    type: "optional" as const,
    value: stripDecorator(value as PropertyType) as V,
  };
  return createUnifiedType(schemaType);
}

// ============ Reference Type Constructors ============

// Schema mode - direct type reference
export function ReferenceType<T extends NamedType>(ref: T): UnifiedType<{ type: "reference"; ref: T }>;
// Decorator mode - class reference
export function ReferenceType<C extends Function>(cls: C): UnifiedType<ClassRef & { __class: C }>;
// Decorator mode - enum reference
export function ReferenceType<E extends Record<string, string>>(
  enumObj: E,
  options: { enumName: string }
): UnifiedType<EnumRef>;
// Implementation
export function ReferenceType(
  ref: NamedType | Function | Record<string, string>,
  options?: { enumName: string }
): UnifiedType<{ type: "reference"; ref: NamedType }> | UnifiedType<ClassRef> | UnifiedType<EnumRef> {
  // Decorator mode - class reference
  if (typeof ref === "function") {
    return createUnifiedType({ __class: ref }) as UnifiedType<ClassRef>;
  }
  // Schema mode - direct type reference (has "type" property)
  if (typeof ref === "object" && ref !== null && "type" in ref) {
    return createUnifiedType({ type: "reference" as const, ref: ref as NamedType }) as UnifiedType<ReferenceType>;
  }
  // Decorator mode - enum reference (plain object without "type")
  const enumOptions = Object.values(ref as Record<string, string>);
  const enumName = options?.enumName ?? `Enum_${enumOptions.join("_")}`;
  return createUnifiedType({ __enum: { options: enumOptions, name: enumName } }) as UnifiedType<EnumRef>;
}

// Self-reference (for recursive types)
export function SelfReferenceType(): UnifiedType<SelfReferenceType> {
  return createUnifiedType({ type: "self-reference" });
}

// ============ Named Type Constructors ============

// EnumType - name first, required
export function EnumType<const N extends string, const O extends readonly string[]>(
  name: N,
  options: O
): { type: "enum"; options: O; name: N } {
  return { type: "enum", options, name };
}

// ObjectType - name first, required
export function ObjectType<const N extends string, const P extends Record<string, PropertyType>>(
  name: N,
  properties: P
): { type: "object"; properties: P; name: N } {
  const cleanProperties: Record<string, PropertyType> = {};
  for (const [key, value] of Object.entries(properties)) {
    cleanProperties[key] = stripDecorator(value as PropertyType);
  }
  return { type: "object", properties: cleanProperties as P, name };
}

// UnionType - schema mode (name first, required) or decorator mode (class array only)
export function UnionType<const N extends string, const V extends readonly NamedType[]>(
  name: N,
  options: V
): { type: "union"; options: V; name: N };
export function UnionType(options: Function[]): ClassDecorator;
export function UnionType<const N extends string, const V extends readonly NamedType[]>(
  nameOrClasses: N | Function[],
  options?: V
): ClassDecorator | { type: "union"; options: V; name: N } {
  // Schema mode - name string with array of NamedType
  if (typeof nameOrClasses === "string") {
    return { type: "union", options: options as V, name: nameOrClasses };
  }
  // Decorator mode - array of classes
  return createUnionDecorator(nameOrClasses);
}
