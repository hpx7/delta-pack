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

function validatePropertyName(name: string): void {
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
    throw new Error(`Invalid property name "${name}": must be a valid identifier`);
  }
  if (name === "_type") {
    throw new Error(`Property name "_type" is reserved for union discriminators`);
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

/**
 * Create a string type for UTF-8 encoded text.
 *
 * Strings are encoded with dictionary compression - repeated strings
 * reference earlier occurrences for compact encoding.
 *
 * @example
 * ```ts
 * const User = ObjectType("User", {
 *   name: StringType(),
 *   email: StringType(),
 * });
 * ```
 */
export function StringType(): UnifiedType<StringType> {
  return createUnifiedType({ type: "string" });
}

/**
 * Create a boolean type.
 *
 * Booleans are encoded as single bits using run-length encoding,
 * making them very compact when there are many consecutive same values.
 *
 * @example
 * ```ts
 * const Settings = ObjectType("Settings", {
 *   darkMode: BooleanType(),
 *   notifications: BooleanType(),
 * });
 * ```
 */
export function BooleanType(): UnifiedType<BooleanType> {
  return createUnifiedType({ type: "boolean" });
}

/**
 * Create a signed integer type with optional min/max bounds.
 *
 * When bounds are specified, values are encoded more efficiently using
 * only the bits needed for the range. Without bounds, values use variable-length
 * encoding (varint) which is compact for small values.
 *
 * @param options - Optional bounds for the integer
 * @param options.min - Minimum allowed value (inclusive)
 * @param options.max - Maximum allowed value (inclusive)
 *
 * @example
 * ```ts
 * const GameState = ObjectType("GameState", {
 *   score: IntType(),                        // Unbounded, varint encoding
 *   level: IntType({ min: 1, max: 100 }),    // Bounded, uses 7 bits
 *   temperature: IntType({ min: -50, max: 50 }),
 * });
 * ```
 */
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

/**
 * Create an unsigned integer type (min=0) with optional max bound.
 *
 * Shorthand for `IntType({ min: 0, max })`. Useful for counts, sizes,
 * and other naturally non-negative values.
 *
 * @param options - Optional upper bound
 * @param options.max - Maximum allowed value (inclusive)
 *
 * @example
 * ```ts
 * const Inventory = ObjectType("Inventory", {
 *   itemCount: UIntType(),                   // 0 to infinity
 *   slotIndex: UIntType({ max: 99 }),        // 0 to 99, uses 7 bits
 * });
 * ```
 */
export function UIntType(options?: { max?: number | string }): UnifiedType<IntType> {
  if (options?.max != null) {
    return IntType({ min: 0, max: options.max });
  }
  return IntType({ min: 0 });
}

/**
 * Create a floating-point number type with optional precision quantization.
 *
 * Without precision, floats are encoded as full 32-bit IEEE 754 values.
 * With precision specified, values are quantized and encoded as integers,
 * which is more compact and ensures consistent rounding across platforms.
 *
 * @param options - Optional precision settings
 * @param options.precision - Quantization step size (e.g., 0.01 for 2 decimal places)
 *
 * @example
 * ```ts
 * const Position = ObjectType("Position", {
 *   x: FloatType({ precision: 0.01 }),  // Quantized to 2 decimal places
 *   y: FloatType({ precision: 0.01 }),
 *   rotation: FloatType(),               // Full precision
 * });
 * ```
 */
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

/**
 * Create an array type containing elements of the specified type.
 *
 * Arrays are encoded with a length prefix followed by each element.
 * In delta encoding, only changed elements are transmitted.
 *
 * @typeParam V - The element type
 * @param value - The type of elements in the array
 *
 * @example
 * ```ts
 * const Team = ObjectType("Team", {
 *   members: ArrayType(StringType()),
 *   scores: ArrayType(IntType({ min: 0 })),
 *   positions: ArrayType(ReferenceType(Position)),
 * });
 * ```
 */
export function ArrayType<const V extends ValueType>(value: V): UnifiedType<{ type: "array"; value: V }> {
  const schemaType = {
    type: "array" as const,
    value: stripDecorator(value as PropertyType) as V,
  };
  return createUnifiedType(schemaType);
}

/**
 * Create a map/dictionary type with typed keys and values.
 *
 * Records are encoded as key-value pairs. Keys must be string or int types.
 * At runtime, records are represented as JavaScript `Map` objects.
 *
 * @typeParam K - The key type (StringType or IntType)
 * @typeParam V - The value type
 * @param key - The type of keys in the map
 * @param value - The type of values in the map
 *
 * @example
 * ```ts
 * const PlayerStats = ObjectType("PlayerStats", {
 *   // Map from player name to score
 *   scoresByName: RecordType(StringType(), IntType()),
 *   // Map from player ID to position
 *   positionsById: RecordType(IntType(), ReferenceType(Position)),
 * });
 * ```
 */
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

/**
 * Create an optional (nullable) type.
 *
 * Optional values are encoded with a presence bit. When absent,
 * no additional data is encoded. Use for fields that may be undefined.
 *
 * @typeParam V - The underlying type when present
 * @param value - The type of the value when present
 *
 * @example
 * ```ts
 * const User = ObjectType("User", {
 *   name: StringType(),
 *   nickname: OptionalType(StringType()),      // May be undefined
 *   avatar: OptionalType(ReferenceType(Image)),
 * });
 * ```
 */
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

/**
 * Create a reference to another named type, class, or union.
 *
 * Use references to compose schemas from reusable type definitions.
 * References work differently depending on the mode:
 * - **Schema mode**: Pass a named type (ObjectType, UnionType, EnumType)
 * - **Decorator mode**: Pass a class constructor or ClassUnionDef
 *
 * @param ref - The type to reference (named type, class, or union definition)
 *
 * @example
 * ```ts
 * // Schema mode - reference other schema types
 * const Position = ObjectType("Position", {
 *   x: FloatType(),
 *   y: FloatType(),
 * });
 *
 * const Direction = EnumType("Direction", ["up", "down", "left", "right"]);
 *
 * const Player = ObjectType("Player", {
 *   position: ReferenceType(Position),
 *   facing: ReferenceType(Direction),
 * });
 * ```
 *
 * @example
 * ```ts
 * // Decorator mode - reference classes
 * class Position {
 *   x = FloatType();
 *   y = FloatType();
 * }
 *
 * class Player {
 *   position = ReferenceType(Position);
 * }
 * ```
 */
export function ReferenceType<T extends NamedType>(ref: T): UnifiedType<{ type: "reference"; ref: T }>;
export function ReferenceType<C extends Function>(cls: C): UnifiedType<ClassRef & { __class: C }>;
export function ReferenceType<U extends ClassUnionDef>(union: U): UnifiedType<ClassUnionRef<U>>;
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

/**
 * Create a self-reference for recursive types.
 *
 * Use this when a type needs to reference itself, such as tree structures
 * or linked lists. The reference resolves to the containing named type.
 *
 * @example
 * ```ts
 * // A tree node that contains children of the same type
 * const TreeNode = ObjectType("TreeNode", {
 *   value: StringType(),
 *   children: ArrayType(SelfReferenceType()),
 * });
 *
 * // A linked list node
 * const ListNode = ObjectType("ListNode", {
 *   value: IntType(),
 *   next: OptionalType(SelfReferenceType()),
 * });
 * ```
 */
export function SelfReferenceType(): UnifiedType<SelfReferenceType> {
  return createUnifiedType({ type: "self-reference" });
}

// ============ Named Type Constructors ============

/**
 * Create an enumeration type with a fixed set of string values.
 *
 * Enums are encoded using the minimum number of bits needed to represent
 * all options. For example, 4 options use 2 bits, 8 options use 3 bits.
 *
 * @param name - The type name (must start with uppercase, e.g., "Direction")
 * @param options - Array of string values for the enum
 *
 * @example
 * ```ts
 * const Direction = EnumType("Direction", ["up", "down", "left", "right"]);
 * const Status = EnumType("Status", ["pending", "active", "completed", "failed"]);
 *
 * const Player = ObjectType("Player", {
 *   facing: ReferenceType(Direction),
 *   status: ReferenceType(Status),
 * });
 * ```
 */
export function EnumType<const N extends string, const O extends readonly string[]>(
  name: N,
  options: O
): { type: "enum"; options: O; name: N; numBits: number } {
  validateTypeName(name);
  // Calculate minimum bits needed: ceil(log2(n)) for n > 1, else 1
  const numBits = options.length <= 1 ? 1 : Math.ceil(Math.log2(options.length));
  return { type: "enum", options, name, numBits };
}

/**
 * Create an object type with named properties.
 *
 * Objects are the primary way to define structured data in Delta-Pack.
 * Properties are encoded in definition order. This is a "named type"
 * that can be used as the root type for {@link load} or referenced
 * by other types using {@link ReferenceType}.
 *
 * @param name - The type name (must start with uppercase, e.g., "Player")
 * @param properties - Record of property names to their types
 *
 * @example
 * ```ts
 * const Player = ObjectType("Player", {
 *   name: StringType(),
 *   score: IntType({ min: 0 }),
 *   isActive: BooleanType(),
 *   inventory: ArrayType(StringType()),
 * });
 *
 * const api = load(Player);
 * ```
 */
export function ObjectType<const N extends string, const P extends Record<string, PropertyType>>(
  name: N,
  properties: P
): { type: "object"; properties: P; name: N } {
  validateTypeName(name);
  const cleanProperties: Record<string, PropertyType> = {};
  for (const [key, value] of Object.entries(properties)) {
    validatePropertyName(key);
    cleanProperties[key] = stripDecorator(value as PropertyType);
  }
  return { type: "object", properties: cleanProperties as P, name };
}

/**
 * Create a discriminated union type from multiple named types or classes.
 *
 * Unions allow a value to be one of several different types. Each variant
 * is distinguished by a `_type` discriminator field. The variant index is
 * encoded using the minimum bits needed.
 *
 * Works in both schema mode (with ObjectTypes) and decorator mode (with classes).
 *
 * @param name - The union type name (must start with uppercase, e.g., "Message")
 * @param options - Array of named types (schema mode) or class constructors (decorator mode)
 *
 * @example
 * ```ts
 * // Schema mode - union of object types
 * const TextMessage = ObjectType("TextMessage", {
 *   content: StringType(),
 * });
 *
 * const ImageMessage = ObjectType("ImageMessage", {
 *   url: StringType(),
 *   width: IntType(),
 *   height: IntType(),
 * });
 *
 * const Message = UnionType("Message", [TextMessage, ImageMessage]);
 *
 * const api = load(Message);
 * const msg = { _type: "TextMessage", content: "Hello!" };
 * ```
 *
 * @example
 * ```ts
 * // Decorator mode - union of classes
 * class Cat { meow = StringType(); }
 * class Dog { bark = StringType(); }
 *
 * const Animal = UnionType("Animal", [Cat, Dog]);
 * ```
 */
export function UnionType<const N extends string, const V extends readonly NamedType[]>(
  name: N,
  options: V
): { type: "union"; options: V; name: N; numBits: number };
export function UnionType<const N extends string, const V extends readonly (new (...args: any[]) => any)[]>(
  name: N,
  classes: V
): ClassUnionDef<N, V>;
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
