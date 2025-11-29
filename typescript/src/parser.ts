import yaml from "yaml";
import { ArrayType, BooleanType, ContainerType, EnumType, FloatType, IntType, ObjectType, OptionalType, PrimitiveType, RecordType, ReferenceType, StringType, Type, UIntType, UnionType } from "./generator";

export function parseSchemaYml(yamlContent: string): Record<string, Type> {
  // the yaml schema is a mapping from type names to type definitions
  const parsedSchema: Record<string, any> = yaml.parse(yamlContent);

  // parse the type definitions
  return mapValues(parsedSchema, (value) => parseType(parsedSchema, value));
}

function parseType(schema: Record<string, any>, value: any): Type {
  if (Array.isArray(value)) {
    // could be a union type or an enum type
    const values = value as string[];
    // it's a union type if all values are references to other types in the schema
    if (values.every((v) => v in schema)) {
      return UnionType(values.map((v) => ReferenceType(v)));
    }
    // otherwise, it's an enum type
    return EnumType(values);
  }
  if (typeof value === "object") {
    // object type
    const properties: Record<string, PrimitiveType | ContainerType | ReferenceType> = {};
    for (const [propKey, propValue] of Object.entries(value)) {
      properties[propKey] = parseType(schema, propValue) as PrimitiveType | ContainerType | ReferenceType;
    }
    return ObjectType(properties);
  }
  if (typeof value === "string") {
    // map type, array type, optional type, reference type, or primitive type
    if (value.includes(",")) {
      // map type
      const parts = value.split(",").map((s) => s.trim());
      if (parts.length !== 2) {
        throw new Error(`Map type must have exactly 2 types, got: ${value}`);
      }
      const [keyTypeStr, valueTypeStr] = parts;
      const keyType = parseType(schema, keyTypeStr) as { type: "string" | "int" | "uint" };
      const valueType = parseType(schema, valueTypeStr) as PrimitiveType | ContainerType | ReferenceType;
      return RecordType(keyType, valueType);
    }
    if (value.endsWith("[]")) {
      // array type
      const itemTypeStr = value.slice(0, -2);
      const childType = parseType(schema, itemTypeStr) as PrimitiveType | ContainerType | ReferenceType;
      return ArrayType(childType);
    }
    if (value.endsWith("?")) {
      // optional type
      const itemTypeStr = value.slice(0, -1);
      const childType = parseType(schema, itemTypeStr) as PrimitiveType | ContainerType | ReferenceType;
      return OptionalType(childType);
    }
    if (value in schema) {
      // reference type
      return ReferenceType(value);
    }
    // primitive type
    if (value === "string") {
      return StringType();
    } else if (value === "int") {
      return IntType();
    } else if (value === "uint") {
      return UIntType();
    } else if (value === "float") {
      return FloatType();
    } else if (value === "boolean") {
      return BooleanType();
    }
  }
  throw new Error(`Unsupported type format: ${value}`);
}

function mapValues<T, U>(obj: Record<string, T>, fn: (value: T) => U): Record<string, U> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value)]));
}
