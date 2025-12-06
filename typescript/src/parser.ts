import yaml from "yaml";
import {
  ArrayType,
  BooleanType,
  ContainerType,
  EnumType,
  FloatType,
  IntType,
  ObjectType,
  OptionalType,
  PrimitiveType,
  RecordType,
  ReferenceType,
  StringType,
  Type,
  UIntType,
  UnionType,
} from "./schema";
import { mapValues } from "./helpers";

export function parseSchemaYml(yamlContent: string): Record<string, Type> {
  // the yaml schema is a mapping from type names to type definitions
  const schema: Record<string, any> = yaml.parse(yamlContent);

  // recursive function to parse a type definition
  function parseType(value: any): Type {
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
        properties[propKey] = parseType(propValue) as PrimitiveType | ContainerType | ReferenceType;
      }
      return ObjectType(properties);
    }
    if (typeof value === "string") {
      // angle bracket record syntax: <K, V> with optional suffixes []?
      if (value.startsWith("<")) {
        const closeIndex = value.indexOf(">");
        if (closeIndex === -1) {
          throw new Error(`Unclosed angle bracket in type: ${value}`);
        }
        const inner = value.slice(1, closeIndex);
        const suffix = value.slice(closeIndex + 1);

        // Parse the inner part as K, V for record
        const parts = inner.split(",").map((s) => s.trim());
        if (parts.length !== 2) {
          throw new Error(`Record type must have exactly 2 types, got: ${value}`);
        }
        const [keyTypeStr, valueTypeStr] = parts;
        const keyType = parseType(keyTypeStr) as { type: "string" | "int" | "uint" };
        const valueType = parseType(valueTypeStr) as PrimitiveType | ContainerType | ReferenceType;
        let resultType: Type = RecordType(keyType, valueType);

        // Apply suffixes ([], ?, etc.)
        let remainingSuffix = suffix;
        while (remainingSuffix) {
          if (remainingSuffix.startsWith("[]")) {
            resultType = ArrayType(resultType as PrimitiveType | ContainerType | ReferenceType);
            remainingSuffix = remainingSuffix.slice(2);
          } else if (remainingSuffix.startsWith("?")) {
            resultType = OptionalType(resultType as PrimitiveType | ContainerType | ReferenceType);
            remainingSuffix = remainingSuffix.slice(1);
          } else {
            throw new Error(`Unknown suffix in type: ${remainingSuffix}`);
          }
        }

        return resultType;
      }

      // array type, optional type, reference type, or primitive type
      if (value.endsWith("[]")) {
        // array type
        const itemTypeStr = value.slice(0, -2);
        const childType = parseType(itemTypeStr) as PrimitiveType | ContainerType | ReferenceType;
        return ArrayType(childType);
      }
      if (value.endsWith("?")) {
        // optional type
        const itemTypeStr = value.slice(0, -1);
        const childType = parseType(itemTypeStr) as PrimitiveType | ContainerType | ReferenceType;
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

  // parse the type definitions
  return mapValues(schema, (value) => parseType(value));
}
