import { createUnifiedType, stripDecorator, UnifiedType, ClassRef } from "./unified.js";

// ============ Class Union Definition (for decorator mode) ============

export const CLASS_UNION_MARKER = Symbol("classUnion");

export interface ClassUnionDef<
  N extends string = string,
  V extends readonly (new (...args: any[]) => any)[] = readonly (new (...args: any[]) => any)[],
> {
  [CLASS_UNION_MARKER]: true;
  name: N;
  classes: V;
}

export function isClassUnion(value: unknown): value is ClassUnionDef {
  return typeof value === "object" && value !== null && CLASS_UNION_MARKER in value;
}

// ============ Type Interfaces ============

// Type categories
export type PrimitiveType = StringType | IntType | FloatType | BooleanType;
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
  min?: number;
  max?: number;
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
  key: StringType | IntType;
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
  numBits: number;
}

export interface EnumType {
  type: "enum";
  options: readonly string[];
  name: string;
  numBits: number;
}

// ============ Utility Functions ============

const RESERVED_TYPE_NAMES = new Set([
  "String",
  "Number",
  "Boolean",
  "Object",
  "Array",
  "Map",
  "Set",
  "Function",
  "Symbol",
  "BigInt",
  "Date",
  "RegExp",
  "Error",
  "Promise",
  "Proxy",
  "WeakMap",
  "WeakSet",
]);

function validateTypeName(name: string): void {
  if (!/^[A-Z][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(
      `Invalid type name "${name}": must start with uppercase letter and contain only alphanumeric characters and underscores`
    );
  }
  if (RESERVED_TYPE_NAMES.has(name)) {
    throw new Error(`Invalid type name "${name}": conflicts with built-in TypeScript type`);
  }
}

export function isPrimitiveOrEnum(type: Type): boolean {
  if (type.type === "reference") {
    return isPrimitiveOrEnum(type.ref);
  }

  return (
    type.type === "string" ||
    type.type === "int" ||
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

export function IntType(options?: { min?: number | string; max?: number | string }): UnifiedType<IntType> {
  const min =
    options?.min != null ? (typeof options.min === "string" ? parseInt(options.min) : options.min) : undefined;
  const max =
    options?.max != null ? (typeof options.max === "string" ? parseInt(options.max) : options.max) : undefined;

  // Validation
  if (max != null && min != null && min > max) {
    throw new Error(`Invalid int range: min (${min}) > max (${max})`);
  }

  const type: IntType = { type: "int" };
  if (min != null) type.min = min;
  if (max != null) type.max = max;

  return createUnifiedType(type);
}

// UIntType is syntactic sugar for IntType with min=0
export function UIntType(options?: { max?: number | string }): UnifiedType<IntType> {
  if (options?.max != null) {
    return IntType({ min: 0, max: options.max });
  }
  return IntType({ min: 0 });
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
type ValueType = PropertyType | ClassRef | ClassUnionRef;

export function ArrayType<const V extends ValueType>(value: V): UnifiedType<{ type: "array"; value: V }> {
  const schemaType = {
    type: "array" as const,
    value: stripDecorator(value as PropertyType) as V,
  };
  return createUnifiedType(schemaType);
}

export function RecordType<const K extends StringType | IntType, const V extends ValueType>(
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

// Class union reference marker for decorator mode
export interface ClassUnionRef<U extends ClassUnionDef = ClassUnionDef> {
  __classUnion: U;
}

// Schema mode - direct type reference (includes EnumType)
export function ReferenceType<T extends NamedType>(ref: T): UnifiedType<{ type: "reference"; ref: T }>;
// Decorator mode - class reference
export function ReferenceType<C extends Function>(cls: C): UnifiedType<ClassRef & { __class: C }>;
// Decorator mode - class union reference
export function ReferenceType<U extends ClassUnionDef>(union: U): UnifiedType<ClassUnionRef<U>>;
// Implementation
export function ReferenceType(
  ref: NamedType | Function | ClassUnionDef
): UnifiedType<{ type: "reference"; ref: NamedType }> | UnifiedType<ClassRef> | UnifiedType<ClassUnionRef> {
  // Decorator mode - class union reference
  if (isClassUnion(ref)) {
    return createUnifiedType({ __classUnion: ref }) as UnifiedType<ClassUnionRef>;
  }
  // Decorator mode - class reference
  if (typeof ref === "function") {
    return createUnifiedType({ __class: ref }) as UnifiedType<ClassRef>;
  }
  // Schema mode - direct type reference (NamedType with "type" property, including EnumType)
  return createUnifiedType({ type: "reference" as const, ref: ref as NamedType }) as UnifiedType<ReferenceType>;
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
): { type: "enum"; options: O; name: N; numBits: number } {
  validateTypeName(name);
  // Calculate minimum bits needed: ceil(log2(n)) for n > 1, else 1
  const numBits = options.length <= 1 ? 1 : Math.ceil(Math.log2(options.length));
  return { type: "enum", options, name, numBits };
}

// ObjectType - name first, required
export function ObjectType<const N extends string, const P extends Record<string, PropertyType>>(
  name: N,
  properties: P
): { type: "object"; properties: P; name: N } {
  validateTypeName(name);
  const cleanProperties: Record<string, PropertyType> = {};
  for (const [key, value] of Object.entries(properties)) {
    cleanProperties[key] = stripDecorator(value as PropertyType);
  }
  return { type: "object", properties: cleanProperties as P, name };
}

// UnionType - schema mode (schema types)
export function UnionType<const N extends string, const V extends readonly NamedType[]>(
  name: N,
  options: V
): { type: "union"; options: V; name: N; numBits: number };
// UnionType - decorator mode (classes)
export function UnionType<const N extends string, const V extends readonly (new (...args: any[]) => any)[]>(
  name: N,
  classes: V
): ClassUnionDef<N, V>;
// Implementation
export function UnionType(
  name: string,
  options: readonly any[]
): { type: "union"; options: readonly NamedType[]; name: string; numBits: number } | ClassUnionDef {
  validateTypeName(name);
  // Check if first option is a class (function) or schema type (object with type)
  if (options.length > 0 && typeof options[0] === "function") {
    // Decorator mode - return class union def
    return {
      [CLASS_UNION_MARKER]: true as const,
      name,
      classes: options as readonly (new (...args: any[]) => any)[],
    };
  }
  // Schema mode - return schema union type
  // Calculate minimum bits needed: ceil(log2(n)) for n > 1, else 1
  const numBits = options.length <= 1 ? 1 : Math.ceil(Math.log2(options.length));
  return { type: "union", options: options as readonly NamedType[], name, numBits };
}
