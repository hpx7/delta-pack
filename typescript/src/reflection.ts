import "reflect-metadata";
import { load, DeltaPackApi } from "./interpreter.js";
import {
  Type,
  PrimitiveType,
  ContainerType,
  StringType,
  IntType,
  UIntType,
  FloatType,
  BooleanType,
  ArrayType,
  OptionalType,
  RecordType,
  EnumType,
  ReferenceType,
  ObjectType,
  UnionType,
} from "./schema.js";
import {
  DELTA_PACK_PROP_TYPE,
  DELTA_PACK_FLOAT,
  DELTA_PACK_UNSIGNED,
  DELTA_PACK_UNION,
  DELTA_PACK_ARRAY_ELEMENT,
  DELTA_PACK_ARRAY_MODIFIERS,
  DELTA_PACK_MAP_VALUE,
  DELTA_PACK_MAP_MODIFIERS,
  DELTA_PACK_OPTIONAL_ELEMENT,
  DELTA_PACK_OPTIONAL_MODIFIERS,
  DELTA_PACK_ENUM_NAME,
  isTsStringEnum,
  isContainerDescriptor,
  getTsEnumValues,
  getTsEnumName,
  type ElementType,
  type TsStringEnum,
  type NumberModifiers,
  type ContainerDescriptor,
} from "./decorators.js";

// Type constructor
type Constructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Internal mapping for typed/untyped conversion
 */
interface TypeMapping {
  kind: "primitive" | "enum" | "object" | "array" | "record" | "optional" | "union";
  targetClass?: Constructor;
  elementMapping?: TypeMapping;
  valueMapping?: TypeMapping;
  unionVariants?: Map<string, { cls: Constructor; mapping: TypeMapping }>;
  members?: Map<string, TypeMapping>;
  // Number modifiers for primitives
  unsigned?: boolean;
  float?: boolean | number;
  // TypeScript string enum
  tsEnum?: TsStringEnum;
  // Explicit enum name (from enumName option)
  enumName?: string;
}

/**
 * Builds a delta-pack schema from a decorated TypeScript class.
 */
class SchemaBuilder {
  private schema: Record<string, Type> = {};
  private mappings = new Map<Constructor, TypeMapping>();
  private processing = new Set<Constructor>();

  build(rootClass: Constructor): {
    schema: Record<string, Type>;
    rootMapping: TypeMapping;
    mappings: Map<Constructor, TypeMapping>;
  } {
    const rootMapping = this.buildMapping(rootClass);
    return {
      schema: this.schema,
      rootMapping,
      mappings: this.mappings,
    };
  }

  private buildMapping(type: Constructor): TypeMapping {
    // Check cache
    const cached = this.mappings.get(type);
    if (cached) return cached;

    // Check for circular reference - return a reference instead of recursing
    if (this.processing.has(type)) {
      // Return a reference mapping - the actual type will be in the schema
      return { kind: "object", targetClass: type };
    }

    this.processing.add(type);

    // Check for union type
    const unionVariants = Reflect.getMetadata(DELTA_PACK_UNION, type) as Constructor[] | undefined;
    if (unionVariants) {
      const mapping = this.buildUnionMapping(type, unionVariants);
      this.processing.delete(type);
      return mapping;
    }

    // Validate class has DeltaPack property decorators
    if (!this.hasDeltaPackProperties(type)) {
      this.processing.delete(type);
      throw new Error(`Class ${type.name} must have DeltaPack property decorators`);
    }

    // Build object mapping
    const mapping = this.buildObjectMapping(type);
    this.processing.delete(type);
    return mapping;
  }

  private buildObjectMapping(type: Constructor): TypeMapping {
    // Create instance to get property keys
    const instance = new type();
    const propertyKeys = Object.keys(instance as object);

    const properties: Record<string, PrimitiveType | ContainerType | ReturnType<typeof ReferenceType>> = {};
    const members = new Map<string, TypeMapping>();

    for (const propertyKey of propertyKeys) {
      const memberMapping = this.buildMemberMapping(type.prototype, propertyKey);
      properties[propertyKey] = this.mappingToSchemaType(memberMapping, type.prototype, propertyKey);
      members.set(propertyKey, memberMapping);
    }

    const objectMapping: TypeMapping = {
      kind: "object",
      targetClass: type,
      members,
    };

    this.mappings.set(type, objectMapping);
    this.schema[type.name] = ObjectType(properties);

    return objectMapping;
  }

  private buildVariantMappings(variants: Constructor[]): Map<string, { cls: Constructor; mapping: TypeMapping }> {
    const variantMappings = new Map<string, { cls: Constructor; mapping: TypeMapping }>();
    for (const variant of variants) {
      const variantMapping = this.buildMapping(variant);
      variantMappings.set(variant.name, { cls: variant, mapping: variantMapping });
    }
    return variantMappings;
  }

  private buildUnionMapping(baseType: Constructor, variants: Constructor[]): TypeMapping {
    const variantMappings = this.buildVariantMappings(variants);

    const unionMapping: TypeMapping = {
      kind: "union",
      targetClass: baseType,
      unionVariants: variantMappings,
    };

    this.mappings.set(baseType, unionMapping);
    this.schema[baseType.name] = UnionType(Array.from(variantMappings.keys()).map((name) => ReferenceType(name)));

    return unionMapping;
  }

  private buildMemberMapping(target: object, propertyKey: string): TypeMapping {
    // Get explicit enum name if provided
    const enumName = Reflect.getMetadata(DELTA_PACK_ENUM_NAME, target, propertyKey) as string | undefined;

    // Check for @DeltaPackOptionalOf
    const optionalElementType = Reflect.getMetadata(DELTA_PACK_OPTIONAL_ELEMENT, target, propertyKey) as
      | ElementType
      | undefined;
    if (optionalElementType) {
      const modifiers = Reflect.getMetadata(DELTA_PACK_OPTIONAL_MODIFIERS, target, propertyKey) as
        | NumberModifiers
        | undefined;
      const innerMapping = this.buildElementMapping(optionalElementType, modifiers, enumName);
      return { kind: "optional", elementMapping: innerMapping };
    }

    // Check for explicit type decorator (@DeltaPackString, @DeltaPackInt, @DeltaPackBool, @DeltaPackRef, @DeltaPackArrayOf, @DeltaPackMapOf)
    const explicitType = Reflect.getMetadata(DELTA_PACK_PROP_TYPE, target, propertyKey) as
      | string
      | Constructor
      | TsStringEnum
      | undefined;
    if (explicitType) {
      return this.buildMappingFromExplicitType(explicitType, propertyKey, target, enumName);
    }

    throw new Error(
      `Cannot determine type for property ${propertyKey}. ` +
        `Use @DeltaPackString(), @DeltaPackInt(), @DeltaPackBool(), @DeltaPackFloat(), ` +
        `@DeltaPackRef(Type), @DeltaPackArrayOf(Type), @DeltaPackMapOf(Type), or @DeltaPackOptionalOf(Type).`
    );
  }

  private hasDeltaPackProperties(cls: Constructor): boolean {
    // Check if any property has DeltaPack metadata
    try {
      const instance = new cls();
      const propertyKeys = Object.keys(instance as object);
      const proto = cls.prototype;
      return propertyKeys.some((key) => {
        // DELTA_PACK_PROP_TYPE covers @DeltaPackString, @DeltaPackInt, @DeltaPackBool,
        // @DeltaPackFloat, @DeltaPackUnsigned, @DeltaPackRef, @DeltaPackArrayOf, @DeltaPackMapOf
        // Only need separate check for @DeltaPackOptionalOf
        return (
          Reflect.getMetadata(DELTA_PACK_PROP_TYPE, proto, key) !== undefined ||
          Reflect.getMetadata(DELTA_PACK_OPTIONAL_ELEMENT, proto, key) !== undefined
        );
      });
    } catch {
      return false;
    }
  }

  private buildMappingFromExplicitType(
    explicitType: string | Constructor | TsStringEnum,
    propertyKey: string,
    target: object,
    enumName?: string
  ): TypeMapping {
    if (explicitType === "string" || explicitType === "boolean" || explicitType === "int") {
      return { kind: "primitive" };
    } else if (explicitType === "array") {
      return this.buildArrayMapping(target, propertyKey);
    } else if (explicitType === "map") {
      return this.buildMapMapping(target, propertyKey);
    } else if (isTsStringEnum(explicitType)) {
      // It's a TypeScript string enum (@DeltaPackRef(TsEnum))
      const mapping: TypeMapping = { kind: "enum", tsEnum: explicitType };
      if (enumName) mapping.enumName = enumName;
      return mapping;
    } else if (typeof explicitType === "function") {
      // It's a class reference (@DeltaPackRef)
      this.buildMapping(explicitType);
      return { kind: "object", targetClass: explicitType };
    } else {
      throw new Error(`Unknown explicit type: ${explicitType}`);
    }
  }

  private buildElementMapping(elementType: ElementType, modifiers?: NumberModifiers, enumName?: string): TypeMapping {
    // Handle nested container descriptors
    if (isContainerDescriptor(elementType)) {
      return this.buildContainerDescriptorMapping(elementType);
    }

    // Handle TypeScript string enums
    if (isTsStringEnum(elementType)) {
      const mapping: TypeMapping = { kind: "enum", tsEnum: elementType };
      if (enumName) mapping.enumName = enumName;
      return mapping;
    }

    // Handle union arrays (Function[])
    if (Array.isArray(elementType)) {
      return this.buildPropertyUnionMapping(elementType as Constructor[]);
    }

    // Handle primitives
    if (elementType === String || elementType === Number || elementType === Boolean) {
      const mapping: TypeMapping = { kind: "primitive", targetClass: elementType as Constructor };
      // Apply number modifiers if this is a Number type
      if (elementType === Number && modifiers) {
        if (modifiers.unsigned !== undefined) mapping.unsigned = modifiers.unsigned;
        if (modifiers.float !== undefined) mapping.float = modifiers.float;
      }
      return mapping;
    }

    // Handle class references
    return this.buildMapping(elementType as Constructor);
  }

  private buildContainerDescriptorMapping(descriptor: ContainerDescriptor): TypeMapping {
    switch (descriptor.__container) {
      case "array": {
        const innerMapping = this.buildElementMapping(descriptor.element!, descriptor.modifiers);
        return { kind: "array", elementMapping: innerMapping };
      }
      case "map": {
        const innerMapping = this.buildElementMapping(descriptor.value!, descriptor.modifiers);
        return { kind: "record", valueMapping: innerMapping };
      }
      case "optional": {
        const innerMapping = this.buildElementMapping(descriptor.element!, descriptor.modifiers);
        return { kind: "optional", elementMapping: innerMapping };
      }
      default:
        throw new Error(`Unknown container type: ${(descriptor as ContainerDescriptor).__container}`);
    }
  }

  private buildArrayMapping(target: object, propertyKey: string): TypeMapping {
    const elementType = Reflect.getMetadata(DELTA_PACK_ARRAY_ELEMENT, target, propertyKey) as ElementType | undefined;
    const modifiers = Reflect.getMetadata(DELTA_PACK_ARRAY_MODIFIERS, target, propertyKey) as
      | NumberModifiers
      | undefined;

    if (!elementType) {
      throw new Error(`Property ${propertyKey} requires @DeltaPackArrayOf(ElementType) decorator.`);
    }

    return {
      kind: "array",
      elementMapping: this.buildElementMapping(elementType, modifiers),
    };
  }

  private buildMapMapping(target: object, propertyKey: string): TypeMapping {
    const valueType = Reflect.getMetadata(DELTA_PACK_MAP_VALUE, target, propertyKey) as ElementType | undefined;
    const modifiers = Reflect.getMetadata(DELTA_PACK_MAP_MODIFIERS, target, propertyKey) as NumberModifiers | undefined;

    if (!valueType) {
      throw new Error(`Property ${propertyKey} requires @DeltaPackMapOf(ValueType) decorator.`);
    }

    return {
      kind: "record",
      valueMapping: this.buildElementMapping(valueType, modifiers),
    };
  }

  private buildPropertyUnionMapping(variants: Constructor[]): TypeMapping {
    return {
      kind: "union",
      unionVariants: this.buildVariantMappings(variants),
    };
  }

  private mappingToSchemaType(
    mapping: TypeMapping,
    target: object,
    propertyKey: string
  ): PrimitiveType | ContainerType | ReturnType<typeof ReferenceType> {
    const floatMeta = Reflect.getMetadata(DELTA_PACK_FLOAT, target, propertyKey) as number | boolean | undefined;
    const unsigned = Reflect.getMetadata(DELTA_PACK_UNSIGNED, target, propertyKey) as boolean | undefined;

    switch (mapping.kind) {
      case "primitive": {
        const explicitType = Reflect.getMetadata(DELTA_PACK_PROP_TYPE, target, propertyKey) as string | undefined;

        // For array/map elements with primitive targetClass
        if (mapping.targetClass) {
          if (mapping.targetClass === String) return StringType();
          if (mapping.targetClass === Boolean) return BooleanType();
          if (mapping.targetClass === Number) return IntType();
        }

        if (explicitType === "string") return StringType();
        if (explicitType === "boolean") return BooleanType();
        if (explicitType === "int") {
          if (floatMeta !== undefined) {
            return typeof floatMeta === "number" ? FloatType({ precision: floatMeta }) : FloatType();
          }
          if (unsigned) return UIntType();
          return IntType();
        }

        throw new Error(`Unknown primitive type for ${propertyKey}`);
      }

      case "enum": {
        if (!mapping.tsEnum) throw new Error(`TypeScript enum not specified for ${propertyKey}`);
        const enumName = mapping.enumName ?? getTsEnumName(mapping.tsEnum);
        if (!this.schema[enumName]) {
          this.schema[enumName] = EnumType(getTsEnumValues(mapping.tsEnum));
        }
        return ReferenceType(enumName);
      }

      case "object":
        if (!mapping.targetClass) throw new Error(`Object type missing for ${propertyKey}`);
        return ReferenceType(mapping.targetClass.name);

      case "array":
        if (!mapping.elementMapping) throw new Error(`Array element type missing for ${propertyKey}`);
        return ArrayType(this.elementMappingToSchemaType(mapping.elementMapping));

      case "record":
        if (!mapping.valueMapping) throw new Error(`Record value type missing for ${propertyKey}`);
        return RecordType(StringType(), this.elementMappingToSchemaType(mapping.valueMapping));

      case "optional":
        if (!mapping.elementMapping) throw new Error(`Optional inner type missing for ${propertyKey}`);
        return OptionalType(this.elementMappingToSchemaType(mapping.elementMapping));

      case "union": {
        if (!mapping.unionVariants || mapping.unionVariants.size === 0) {
          throw new Error(`Union variants missing for ${propertyKey}`);
        }
        // Use targetClass name if available (from @DeltaPackUnion), otherwise generate from variants
        const unionName = mapping.targetClass?.name ?? Array.from(mapping.unionVariants.keys()).join("Or");
        if (!this.schema[unionName]) {
          this.schema[unionName] = UnionType(
            Array.from(mapping.unionVariants.keys()).map((name) => ReferenceType(name))
          );
        }
        return ReferenceType(unionName);
      }

      default:
        throw new Error(`Unknown mapping kind: ${mapping.kind}`);
    }
  }

  private elementMappingToSchemaType(
    mapping: TypeMapping
  ): PrimitiveType | ContainerType | ReturnType<typeof ReferenceType> {
    switch (mapping.kind) {
      case "primitive":
        if (mapping.targetClass === String) return StringType();
        if (mapping.targetClass === Boolean) return BooleanType();
        if (mapping.targetClass === Number) {
          // Apply number modifiers
          if (mapping.float !== undefined) {
            return typeof mapping.float === "number" ? FloatType({ precision: mapping.float }) : FloatType();
          }
          if (mapping.unsigned) return UIntType();
          return IntType();
        }
        throw new Error("Unknown primitive element type");

      case "enum": {
        if (!mapping.tsEnum) throw new Error("TypeScript enum missing for element type");
        const enumName = mapping.enumName ?? getTsEnumName(mapping.tsEnum);
        if (!this.schema[enumName]) {
          this.schema[enumName] = EnumType(getTsEnumValues(mapping.tsEnum));
        }
        return ReferenceType(enumName);
      }

      case "object":
        if (!mapping.targetClass) throw new Error("Object element type missing");
        return ReferenceType(mapping.targetClass.name);

      case "array":
        if (!mapping.elementMapping) throw new Error("Array element type missing");
        return ArrayType(this.elementMappingToSchemaType(mapping.elementMapping));

      case "record":
        if (!mapping.valueMapping) throw new Error("Record value type missing");
        return RecordType(StringType(), this.elementMappingToSchemaType(mapping.valueMapping));

      case "optional":
        if (!mapping.elementMapping) throw new Error("Optional inner type missing");
        return OptionalType(this.elementMappingToSchemaType(mapping.elementMapping));

      case "union": {
        if (!mapping.unionVariants || mapping.unionVariants.size === 0) {
          throw new Error("Union variants missing for element type");
        }
        // Use targetClass name if available (from @DeltaPackUnion), otherwise generate from variants
        const unionName = mapping.targetClass?.name ?? Array.from(mapping.unionVariants.keys()).join("Or");
        if (!this.schema[unionName]) {
          this.schema[unionName] = UnionType(
            Array.from(mapping.unionVariants.keys()).map((name) => ReferenceType(name))
          );
        }
        return ReferenceType(unionName);
      }

      default:
        throw new Error(`Unsupported element mapping kind: ${mapping.kind}`);
    }
  }
}

/**
 * Load a decorated class and return a DeltaPackApi for encoding/decoding.
 *
 * @param rootClass - A class with DeltaPack property decorators
 * @returns DeltaPackApi with encode/decode/etc methods
 *
 * @example
 * ```typescript
 * import { DeltaPackFloat, DeltaPackString, DeltaPackInt, loadClass } from "@hpx7/delta-pack";
 *
 * class Player {
 *   @DeltaPackString()
 *   name: string = "";
 *
 *   @DeltaPackInt()
 *   score: number = 0;
 *
 *   @DeltaPackFloat(0.01)
 *   x: number = 0;
 * }
 *
 * const playerApi = loadClass(Player);
 * const encoded = playerApi.encode(player);
 * const decoded = playerApi.decode(encoded);
 * ```
 */
export function loadClass<T extends object>(rootClass: Constructor<T>): DeltaPackApi<T> {
  const builder = new SchemaBuilder();
  const { schema, rootMapping, mappings } = builder.build(rootClass);

  // Get the raw interpreter API (works with untyped objects)
  const rawApi = load(schema, rootClass.name);

  // Create wrapper that converts between typed and untyped
  return {
    fromJson: (obj: Record<string, unknown>) => {
      const untyped = rawApi.fromJson(obj);
      return toTyped(untyped, rootMapping, mappings, rootClass) as T;
    },
    toJson: (obj: T) => {
      const untyped = toUntyped(obj, rootMapping, mappings) as Record<string, unknown>;
      return rawApi.toJson(untyped);
    },
    encode: (obj: T) => {
      const untyped = toUntyped(obj, rootMapping, mappings) as Record<string, unknown>;
      return rawApi.encode(untyped);
    },
    decode: (buf: Uint8Array) => {
      const untyped = rawApi.decode(buf);
      return toTyped(untyped, rootMapping, mappings, rootClass) as T;
    },
    encodeDiff: (a: T, b: T) => {
      const untypedA = toUntyped(a, rootMapping, mappings) as Record<string, unknown>;
      const untypedB = toUntyped(b, rootMapping, mappings) as Record<string, unknown>;
      return rawApi.encodeDiff(untypedA, untypedB);
    },
    decodeDiff: (a: T, diff: Uint8Array) => {
      const untypedA = toUntyped(a, rootMapping, mappings) as Record<string, unknown>;
      const untypedResult = rawApi.decodeDiff(untypedA, diff);
      return toTyped(untypedResult, rootMapping, mappings, rootClass) as T;
    },
    equals: (a: T, b: T) => {
      const untypedA = toUntyped(a, rootMapping, mappings) as Record<string, unknown>;
      const untypedB = toUntyped(b, rootMapping, mappings) as Record<string, unknown>;
      return rawApi.equals(untypedA, untypedB);
    },
    clone: (obj: T) => {
      const untyped = toUntyped(obj, rootMapping, mappings) as Record<string, unknown>;
      const clonedUntyped = rawApi.clone(untyped);
      return toTyped(clonedUntyped, rootMapping, mappings, rootClass) as T;
    },
  };
}

/**
 * Build a schema from a decorated class without creating the full API.
 * Useful for inspecting the generated schema or comparing with other schema definitions.
 *
 * @param rootClass - A class with DeltaPack property decorators
 * @returns The generated schema object
 */
export function buildSchema<T extends object>(rootClass: Constructor<T>): Record<string, Type> {
  const builder = new SchemaBuilder();
  const { schema } = builder.build(rootClass);
  return schema;
}

/**
 * Convert typed object to untyped representation for interpreter.
 */
function toUntyped(obj: unknown, mapping: TypeMapping, mappings: Map<Constructor, TypeMapping>): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  switch (mapping.kind) {
    case "primitive":
    case "enum":
      return obj;

    case "object": {
      // If this mapping doesn't have members, look up the full mapping from cache
      const fullMapping = mapping.members
        ? mapping
        : mapping.targetClass
          ? mappings.get(mapping.targetClass)
          : undefined;
      if (!fullMapping?.members) {
        throw new Error(`Object mapping missing members for ${mapping.targetClass?.name}`);
      }

      const result: Record<string, unknown> = {};
      for (const [propertyKey, memberMapping] of fullMapping.members) {
        const value = (obj as Record<string, unknown>)[propertyKey];
        result[propertyKey] = toUntyped(value, memberMapping, mappings);
      }
      return result;
    }

    case "array": {
      const arr = obj as unknown[];
      return arr.map((item) => toUntyped(item, mapping.elementMapping!, mappings));
    }

    case "record": {
      const map = obj as Map<string, unknown>;
      const result = new Map<string, unknown>();
      for (const [key, value] of map) {
        result.set(key, toUntyped(value, mapping.valueMapping!, mappings));
      }
      return result;
    }

    case "optional":
      return toUntyped(obj, mapping.elementMapping!, mappings);

    case "union": {
      // Determine which variant this is
      const objClass = (obj as object).constructor as Constructor;
      const variant = mapping.unionVariants!.get(objClass.name);
      if (!variant) {
        throw new Error(`Unknown union variant: ${objClass.name}`);
      }
      return {
        type: objClass.name,
        val: toUntyped(obj, variant.mapping, mappings),
      };
    }

    default:
      throw new Error(`Unknown mapping kind: ${mapping.kind}`);
  }
}

/**
 * Convert untyped representation back to typed object.
 */
function toTyped(
  obj: unknown,
  mapping: TypeMapping,
  mappings: Map<Constructor, TypeMapping>,
  targetClass?: Constructor
): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  switch (mapping.kind) {
    case "primitive":
    case "enum":
      return obj;

    case "object": {
      const cls = mapping.targetClass ?? targetClass;
      if (!cls) throw new Error("Cannot create typed object without target class");

      // If this mapping doesn't have members, look up the full mapping from cache
      const fullMapping = mapping.members ? mapping : mappings.get(cls);
      if (!fullMapping?.members) {
        throw new Error(`Object mapping missing members for ${cls.name}`);
      }

      const instance = new cls();
      const objRecord = obj as Record<string, unknown>;

      for (const [propertyKey, memberMapping] of fullMapping.members) {
        (instance as Record<string, unknown>)[propertyKey] = toTyped(
          objRecord[propertyKey],
          memberMapping,
          mappings,
          memberMapping.targetClass
        );
      }
      return instance;
    }

    case "array": {
      const arr = obj as unknown[];
      return arr.map((item) => toTyped(item, mapping.elementMapping!, mappings, mapping.elementMapping!.targetClass));
    }

    case "record": {
      const map = obj as Map<string, unknown>;
      const result = new Map<string, unknown>();
      for (const [key, value] of map) {
        result.set(key, toTyped(value, mapping.valueMapping!, mappings, mapping.valueMapping!.targetClass));
      }
      return result;
    }

    case "optional":
      return toTyped(obj, mapping.elementMapping!, mappings, mapping.elementMapping!.targetClass);

    case "union": {
      const unionObj = obj as { type: string; val: unknown };
      const variant = mapping.unionVariants!.get(unionObj.type);
      if (!variant) {
        throw new Error(`Unknown union variant: ${unionObj.type}`);
      }
      return toTyped(unionObj.val, variant.mapping, mappings, variant.cls);
    }

    default:
      throw new Error(`Unknown mapping kind: ${mapping.kind}`);
  }
}
