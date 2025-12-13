import "reflect-metadata";

// Metadata keys
export const DELTA_PACK_PROP_TYPE = "deltapack:propType";
export const DELTA_PACK_FLOAT = "deltapack:float";
export const DELTA_PACK_UNSIGNED = "deltapack:unsigned";
export const DELTA_PACK_UNION = "deltapack:union";
export const DELTA_PACK_ARRAY_ELEMENT = "deltapack:arrayElement";
export const DELTA_PACK_ARRAY_MODIFIERS = "deltapack:arrayModifiers";
export const DELTA_PACK_MAP_VALUE = "deltapack:mapValue";
export const DELTA_PACK_MAP_MODIFIERS = "deltapack:mapModifiers";
export const DELTA_PACK_OPTIONAL_ELEMENT = "deltapack:optionalElement";
export const DELTA_PACK_OPTIONAL_MODIFIERS = "deltapack:optionalModifiers";
export const DELTA_PACK_ENUM_NAME = "deltapack:enumName";

/**
 * Configuration for number modifiers in containers.
 */
export interface NumberModifiers {
  unsigned?: boolean;
  float?: boolean | number; // true = IEEE 754, number = precision
}

/**
 * Options for container decorators (arrays, maps, optionals).
 */
export interface ContainerOptions extends NumberModifiers {
  /**
   * Explicit name for TypeScript string enums.
   * Required for enums to have a specific name in the schema instead of auto-generated names.
   */
  enumName?: string;
}

/**
 * TypeScript string enum object type.
 * String enums at runtime are objects mapping keys to string values.
 */
export type TsStringEnum = { [key: string]: string };

/**
 * Descriptor for nested container types.
 * Used when containers need to contain other containers (e.g., int[][]).
 */
export interface ContainerDescriptor {
  __container: "array" | "map" | "optional";
  element?: BaseElementType | ContainerDescriptor;
  value?: BaseElementType | ContainerDescriptor;
  modifiers?: NumberModifiers;
}

/**
 * Type guard to check if a value is a ContainerDescriptor.
 * Handles both plain objects and hybrid decorator/descriptors (which are functions).
 */
export function isContainerDescriptor(value: unknown): value is ContainerDescriptor {
  if (value === null || value === undefined) return false;
  // Check for __container property on objects or functions (hybrid decorator/descriptors)
  if (typeof value === "object" || typeof value === "function") {
    return "__container" in value && (value as ContainerDescriptor).__container in { array: 1, map: 1, optional: 1 };
  }
  return false;
}

/**
 * Base element type (non-container).
 * Can be a primitive constructor, class, array of classes (union),
 * or a TypeScript string enum.
 */
export type BaseElementType = Function | Function[] | TsStringEnum;

/**
 * Element type for arrays, maps, and optionals.
 * Can be a primitive constructor, class, array of classes (union),
 * a TypeScript string enum, or a nested container descriptor.
 */
export type ElementType = BaseElementType | ContainerDescriptor;

/**
 * Type guard to check if a value is a TypeScript string enum.
 * String enums are plain objects where all values are strings.
 */
export function isTsStringEnum(value: unknown): value is TsStringEnum {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  // Must have at least one key and all values must be strings
  return keys.length > 0 && keys.every((key) => typeof obj[key] === "string");
}

/**
 * Extracts the string values from a TypeScript string enum.
 */
export function getTsEnumValues(enumObj: TsStringEnum): string[] {
  return Object.values(enumObj);
}

/**
 * Gets a name for a TypeScript enum based on its values.
 */
export function getTsEnumName(enumObj: TsStringEnum): string {
  const values = getTsEnumValues(enumObj);
  return values.map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join("Or");
}

/**
 * Configuration for float properties.
 */
export interface FloatConfig {
  precision: number;
}

/**
 * Marks a number property as a float.
 * Without this decorator, numbers default to signed int.
 *
 * @param config - Optional configuration with precision for quantized floats. If omitted, uses IEEE 754 float.
 *
 * @example
 * ```typescript
 * class Position {
 *   @DeltaPackFloat({ precision: 0.01 })  // Quantized
 *   x: number = 0;
 *
 *   @DeltaPackFloat()  // IEEE 754
 *   y: number = 0;
 * }
 * ```
 */
export function DeltaPackFloat(config?: FloatConfig): PropertyDecorator {
  return function (target, propertyKey) {
    Reflect.defineMetadata(DELTA_PACK_FLOAT, config?.precision ?? true, target, propertyKey);
    Reflect.defineMetadata(DELTA_PACK_PROP_TYPE, "int", target, propertyKey);
  };
}

/**
 * Marks a class as a union type with specified variants.
 * For union properties, use @DeltaPackArrayOf([TypeA, TypeB]), @DeltaPackMapOf([TypeA, TypeB]), or @DeltaPackOptionalOf([TypeA, TypeB]).
 *
 * @param variants - Array of concrete class constructors
 *
 * @example
 * ```typescript
 * class MoveAction {
 *   @DeltaPackInt() x: number = 0;
 *   @DeltaPackInt() y: number = 0;
 * }
 *
 * class AttackAction {
 *   @DeltaPackString() targetId: string = "";
 * }
 *
 * @DeltaPackUnion([MoveAction, AttackAction])
 * abstract class GameAction {}
 * ```
 */
export function DeltaPackUnion(variants: Function[]): ClassDecorator {
  return function (target) {
    Reflect.defineMetadata(DELTA_PACK_UNION, variants, target);
  };
}

/**
 * Specifies the element type for array properties.
 * Can also be used as a nested container descriptor within other container decorators.
 *
 * @param elementType - String/Number/Boolean for primitives, a class for objects,
 *                      an array of classes for unions, a TypeScript string enum,
 *                      or another container descriptor for nesting
 * @param modifiers - Optional number modifiers (only applies when elementType is Number)
 * @returns A hybrid that works both as a PropertyDecorator and as a ContainerDescriptor
 *
 * @example
 * ```typescript
 * enum Color {
 *   RED = "RED",
 *   BLUE = "BLUE",
 * }
 *
 * class GameState {
 *   @DeltaPackArrayOf(Player)
 *   players: Player[] = [];
 *
 *   @DeltaPackArrayOf(String)
 *   tags: string[] = [];
 *
 *   @DeltaPackArrayOf([MoveAction, AttackAction])
 *   actions: GameAction[] = [];
 *
 *   // Number modifiers
 *   @DeltaPackArrayOf(Number, { unsigned: true })
 *   counts: number[] = [];
 *
 *   @DeltaPackArrayOf(Number, { float: 0.01 })
 *   prices: number[] = [];
 *
 *   // Enum array
 *   @DeltaPackArrayOf(Color)
 *   colors: Color[] = [];
 *
 *   // Nested containers
 *   @DeltaPackArrayOf(DeltaPackArrayOf(Number))
 *   matrix: number[][] = [];
 *
 *   @DeltaPackArrayOf(DeltaPackArrayOf(Number, { float: 0.01 }))
 *   floatMatrix: number[][] = [];
 * }
 * ```
 */
export function DeltaPackArrayOf(
  elementType: ElementType,
  options?: ContainerOptions
): PropertyDecorator & ContainerDescriptor {
  const descriptor: ContainerDescriptor = {
    __container: "array",
    element: elementType,
  };
  if (options) {
    descriptor.modifiers = options;
  }

  const decorator: PropertyDecorator = function (target, propertyKey) {
    Reflect.defineMetadata(DELTA_PACK_ARRAY_ELEMENT, elementType, target, propertyKey);
    if (options) {
      Reflect.defineMetadata(DELTA_PACK_ARRAY_MODIFIERS, options, target, propertyKey);
    }
    if (options?.enumName) {
      Reflect.defineMetadata(DELTA_PACK_ENUM_NAME, options.enumName, target, propertyKey);
    }
    Reflect.defineMetadata(DELTA_PACK_PROP_TYPE, "array", target, propertyKey);
  };

  // Merge descriptor properties onto the decorator function
  return Object.assign(decorator, descriptor);
}

/**
 * Specifies the value type for Map properties.
 * Keys are always strings.
 * Can also be used as a nested container descriptor within other container decorators.
 *
 * @param valueType - String/Number/Boolean for primitives, a class for objects,
 *                    an array of classes for unions, a TypeScript string enum,
 *                    or another container descriptor for nesting
 * @param modifiers - Optional number modifiers (only applies when valueType is Number)
 * @returns A hybrid that works both as a PropertyDecorator and as a ContainerDescriptor
 *
 * @example
 * ```typescript
 * enum Status {
 *   ACTIVE = "active",
 *   INACTIVE = "inactive",
 * }
 *
 * class GameState {
 *   @DeltaPackMapOf(Player)
 *   playersById: Map<string, Player> = new Map();
 *
 *   @DeltaPackMapOf(Number)
 *   scores: Map<string, number> = new Map();
 *
 *   @DeltaPackMapOf([MoveAction, AttackAction])
 *   actionsById: Map<string, GameAction> = new Map();
 *
 *   // Number modifiers
 *   @DeltaPackMapOf(Number, { unsigned: true })
 *   counts: Map<string, number> = new Map();
 *
 *   // Enum map
 *   @DeltaPackMapOf(Status)
 *   statusById: Map<string, Status> = new Map();
 *
 *   // Nested containers
 *   @DeltaPackMapOf(DeltaPackArrayOf(Number))
 *   vectorsById: Map<string, number[]> = new Map();
 * }
 * ```
 */
export function DeltaPackMapOf(
  valueType: ElementType,
  options?: ContainerOptions
): PropertyDecorator & ContainerDescriptor {
  const descriptor: ContainerDescriptor = {
    __container: "map",
    value: valueType,
  };
  if (options) {
    descriptor.modifiers = options;
  }

  const decorator: PropertyDecorator = function (target, propertyKey) {
    Reflect.defineMetadata(DELTA_PACK_MAP_VALUE, valueType, target, propertyKey);
    if (options) {
      Reflect.defineMetadata(DELTA_PACK_MAP_MODIFIERS, options, target, propertyKey);
    }
    if (options?.enumName) {
      Reflect.defineMetadata(DELTA_PACK_ENUM_NAME, options.enumName, target, propertyKey);
    }
    Reflect.defineMetadata(DELTA_PACK_PROP_TYPE, "map", target, propertyKey);
  };

  // Merge descriptor properties onto the decorator function
  return Object.assign(decorator, descriptor);
}

/**
 * Specifies an optional (nullable) property with its type.
 * Can also be used as a nested container descriptor within other container decorators.
 *
 * @param elementType - String/Number/Boolean for primitives, a class for objects,
 *                      an array of classes for unions, a TypeScript string enum,
 *                      or another container descriptor for nesting
 * @param modifiers - Optional number modifiers (only applies when elementType is Number)
 * @returns A hybrid that works both as a PropertyDecorator and as a ContainerDescriptor
 *
 * @example
 * ```typescript
 * enum Status {
 *   ACTIVE = "active",
 *   INACTIVE = "inactive",
 * }
 *
 * class Player {
 *   @DeltaPackString()
 *   name: string = "";
 *
 *   @DeltaPackOptionalOf(String)
 *   nickname?: string;
 *
 *   @DeltaPackOptionalOf(Position)
 *   position?: Position;
 *
 *   @DeltaPackOptionalOf([MoveAction, AttackAction])
 *   lastAction?: GameAction;
 *
 *   // Number modifiers
 *   @DeltaPackOptionalOf(Number, { unsigned: true })
 *   count?: number;
 *
 *   // Enum optional
 *   @DeltaPackOptionalOf(Status)
 *   status?: Status;
 *
 *   // Nested containers
 *   @DeltaPackOptionalOf(DeltaPackArrayOf(String))
 *   tags?: string[];
 * }
 * ```
 */
export function DeltaPackOptionalOf(
  elementType: ElementType,
  options?: ContainerOptions
): PropertyDecorator & ContainerDescriptor {
  const descriptor: ContainerDescriptor = {
    __container: "optional",
    element: elementType,
  };
  if (options) {
    descriptor.modifiers = options;
  }

  const decorator: PropertyDecorator = function (target, propertyKey) {
    Reflect.defineMetadata(DELTA_PACK_OPTIONAL_ELEMENT, elementType, target, propertyKey);
    if (options) {
      Reflect.defineMetadata(DELTA_PACK_OPTIONAL_MODIFIERS, options, target, propertyKey);
    }
    if (options?.enumName) {
      Reflect.defineMetadata(DELTA_PACK_ENUM_NAME, options.enumName, target, propertyKey);
    }
  };

  // Merge descriptor properties onto the decorator function
  return Object.assign(decorator, descriptor);
}

/**
 * Marks a string property. Use when type inference is not available.
 *
 * @example
 * ```typescript
 * class Player {
 *   @DeltaPackString()
 *   name: string = "";
 * }
 * ```
 */
export function DeltaPackString(): PropertyDecorator {
  return function (target, propertyKey) {
    Reflect.defineMetadata(DELTA_PACK_PROP_TYPE, "string", target, propertyKey);
  };
}

/**
 * Marks a boolean property. Use when type inference is not available.
 *
 * @example
 * ```typescript
 * class Player {
 *   @DeltaPackString()
 *   name: string = "";
 *
 *   @DeltaPackBool()
 *   isActive: boolean = false;
 * }
 * ```
 */
export function DeltaPackBool(): PropertyDecorator {
  return function (target, propertyKey) {
    Reflect.defineMetadata(DELTA_PACK_PROP_TYPE, "boolean", target, propertyKey);
  };
}

/**
 * Configuration for integer properties.
 */
export interface IntConfig {
  unsigned?: boolean;
}

/**
 * Marks an integer property. Use when type inference is not available.
 * Defaults to signed integer. Pass `{ unsigned: true }` for unsigned.
 *
 * @param config - Optional configuration for the integer type
 *
 * @example
 * ```typescript
 * class Player {
 *   @DeltaPackString()
 *   name: string = "";
 *
 *   @DeltaPackInt()
 *   score: number = 0;
 *
 *   @DeltaPackInt({ unsigned: true })
 *   level: number = 1;
 * }
 * ```
 */
export function DeltaPackInt(config?: IntConfig): PropertyDecorator {
  return function (target, propertyKey) {
    Reflect.defineMetadata(DELTA_PACK_PROP_TYPE, "int", target, propertyKey);
    if (config?.unsigned) {
      Reflect.defineMetadata(DELTA_PACK_UNSIGNED, true, target, propertyKey);
    }
  };
}

/**
 * Options for @DeltaPackRef decorator.
 */
export interface RefOptions {
  /**
   * Explicit name for TypeScript string enums.
   * Required for enums to have a specific name in the schema instead of auto-generated names.
   */
  enumName?: string;
}

/**
 * Marks a property as referencing another class or TypeScript string enum.
 * Use when type inference is not available.
 *
 * @param typeRef - The class constructor for the property type, or a TypeScript string enum
 * @param options - Optional configuration (e.g., enumName for string enums)
 *
 * @example
 * ```typescript
 * class Position {
 *   @DeltaPackFloat() x: number = 0;
 *   @DeltaPackFloat() y: number = 0;
 * }
 *
 * enum Color {
 *   RED = "RED",
 *   BLUE = "BLUE",
 *   GREEN = "GREEN",
 * }
 *
 * class Player {
 *   @DeltaPackString()
 *   name: string = "";
 *
 *   @DeltaPackRef(Position)
 *   pos: Position = new Position();
 *
 *   @DeltaPackRef(Color, { enumName: "Color" })
 *   team: Color = Color.RED;
 * }
 * ```
 */
export function DeltaPackRef(typeRef: Function | TsStringEnum, options?: RefOptions): PropertyDecorator {
  return function (target, propertyKey) {
    Reflect.defineMetadata(DELTA_PACK_PROP_TYPE, typeRef, target, propertyKey);
    if (options?.enumName) {
      Reflect.defineMetadata(DELTA_PACK_ENUM_NAME, options.enumName, target, propertyKey);
    }
  };
}
