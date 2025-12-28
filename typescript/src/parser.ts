import yaml from "yaml";
import {
  ArrayType,
  BooleanType,
  EnumType,
  FloatType,
  IntType,
  NamedType,
  ObjectType,
  OptionalType,
  PropertyType,
  RecordType,
  ReferenceType,
  SelfReferenceType,
  StringType,
  Type,
  UnionType,
} from "./schema.js";

// Placeholder for unresolved references during first pass
interface UnresolvedReference {
  type: "__unresolved_reference__";
  name: string;
}

// Placeholder for unresolved union during first pass
interface UnresolvedUnion {
  type: "__unresolved_union__";
  variantNames: string[];
  name: string;
}

type ParsedType = Type | UnresolvedReference | UnresolvedUnion;

export function parseSchemaYml(yamlContent: string): Record<string, NamedType> {
  // the yaml schema is a mapping from type names to type definitions
  const rawSchema: Record<string, unknown> = yaml.parse(yamlContent);

  // First pass: parse all types with unresolved references
  const unresolvedTypes: Record<string, ParsedType> = {};

  function parseType(value: unknown, currentTypeName: string): ParsedType | null {
    if (Array.isArray(value)) {
      // could be a union type or an enum type
      const values = value as string[];
      // it's a union type if all values are references to other types in the schema
      if (values.every((v) => v in rawSchema)) {
        return { type: "__unresolved_union__", variantNames: values, name: currentTypeName } as UnresolvedUnion;
      }
      // otherwise, it's an enum type
      return EnumType(currentTypeName, values);
    }
    if (typeof value === "object" && value !== null) {
      // object type
      const properties: Record<string, PropertyType> = {};
      for (const [propKey, propValue] of Object.entries(value)) {
        properties[propKey] = parsePropertyType(propValue, currentTypeName);
      }
      return ObjectType(currentTypeName, properties);
    }
    if (typeof value === "string") {
      // Type alias to a primitive or another type - skip, will be resolved inline
      return null;
    }
    throw new Error(`Unsupported type format: ${value}`);
  }

  function parsePropertyType(value: unknown, currentTypeName: string): PropertyType {
    if (typeof value === "string") {
      if (value.endsWith("[]")) {
        // array type
        const itemTypeStr = value.slice(0, -2);
        const childType = parsePropertyType(itemTypeStr, currentTypeName);
        return ArrayType(childType);
      } else if (value.endsWith("?")) {
        // optional type
        const itemTypeStr = value.slice(0, -1);
        const childType = parsePropertyType(itemTypeStr, currentTypeName);
        return OptionalType(childType);
      } else if (value.startsWith("<") && value.endsWith(">")) {
        // record type
        const inner = value.slice(1, -1);
        const commaIdx = inner.indexOf(",");
        if (commaIdx === -1) {
          throw new Error(`Invalid record type format: ${value}`);
        }
        const [keyTypeStr, valueTypeStr] = [inner.slice(0, commaIdx).trim(), inner.slice(commaIdx + 1).trim()];
        const keyType = parsePropertyType(keyTypeStr, currentTypeName) as StringType | IntType;
        const valueType = parsePropertyType(valueTypeStr, currentTypeName);
        return RecordType(keyType, valueType) as PropertyType;
      } else if (value.startsWith("string")) {
        return StringType();
      } else if (value.startsWith("uint")) {
        // uint is syntactic sugar for int with min defaulting to 0
        const params = parseParams(value, "uint");
        const max = params["max"];
        if (max != null) {
          return IntType({ min: params["min"] ?? 0, max });
        }
        return IntType({ min: params["min"] ?? 0 });
      } else if (value.startsWith("int")) {
        const params = parseParams(value, "int");
        return IntType(params);
      } else if (value.startsWith("float")) {
        const params = parseParams(value, "float");
        return FloatType(params);
      } else if (value.startsWith("boolean")) {
        return BooleanType();
      } else if (value === currentTypeName) {
        // Self-reference
        return SelfReferenceType();
      } else if (value in rawSchema) {
        // Check if it's a type alias (raw string value in schema)
        const targetValue = rawSchema[value];
        if (typeof targetValue === "string") {
          // Type alias - resolve inline to the underlying type
          return parsePropertyType(targetValue, currentTypeName);
        }
        // Reference to another type - will be resolved in second pass
        return { type: "__unresolved_reference__", name: value } as unknown as PropertyType;
      }
    }
    throw new Error(`Unsupported property type format: ${value}`);
  }

  // Parse all types (first pass)
  for (const [typeName, typeValue] of Object.entries(rawSchema)) {
    const parsed = parseType(typeValue, typeName);
    if (parsed !== null) {
      unresolvedTypes[typeName] = parsed;
    }
  }

  // Second pass: resolve references
  const resolvedTypes: Record<string, NamedType> = {};

  function resolveType(parsed: ParsedType): NamedType {
    if ("type" in parsed && parsed.type === "__unresolved_union__") {
      const union = parsed as UnresolvedUnion;
      const variants = union.variantNames.map((name) => {
        if (!(name in unresolvedTypes)) {
          throw new Error(`Unknown type reference: ${name}`);
        }
        return resolveType(unresolvedTypes[name]!);
      });
      return UnionType(union.name, variants);
    }
    // Already a named type (ObjectType or EnumType)
    const namedType = parsed as NamedType;
    if (namedType.type === "object") {
      // Resolve property references
      const resolvedProperties: Record<string, PropertyType> = {};
      for (const [key, prop] of Object.entries(namedType.properties)) {
        resolvedProperties[key] = resolvePropertyType(prop);
      }
      return ObjectType(namedType.name, resolvedProperties);
    }
    return namedType;
  }

  function resolvePropertyType(prop: PropertyType): PropertyType {
    if ("type" in prop && (prop as unknown as UnresolvedReference).type === "__unresolved_reference__") {
      const ref = prop as unknown as UnresolvedReference;
      if (!(ref.name in unresolvedTypes)) {
        throw new Error(`Unknown type reference: ${ref.name}`);
      }
      const resolved = resolveType(unresolvedTypes[ref.name]!);
      return ReferenceType(resolved);
    }
    if (prop.type === "array") {
      return ArrayType(resolvePropertyType(prop.value));
    }
    if (prop.type === "optional") {
      return OptionalType(resolvePropertyType(prop.value));
    }
    if (prop.type === "record") {
      return RecordType(prop.key, resolvePropertyType(prop.value));
    }
    return prop;
  }

  // Resolve all types
  for (const [typeName, parsed] of Object.entries(unresolvedTypes)) {
    resolvedTypes[typeName] = resolveType(parsed);
  }

  return resolvedTypes;
}

function parseParams(value: string, typeName: string): Record<string, string> {
  if (value === typeName) {
    return {};
  }
  // expect format: typeName(key=value, key2=value2, ...)
  const match = value.match(new RegExp(`^${typeName}\\((.+)\\)$`));
  if (!match) {
    throw new Error(`Invalid ${typeName} format: ${value}`);
  }
  const params: Record<string, string> = {};
  for (const part of match[1]!.split(",")) {
    const [key, val] = part.split("=").map((s) => s.trim());
    if (!key || !val) {
      throw new Error(`Invalid parameter format in ${value}`);
    }
    params[key] = val;
  }
  return params;
}
