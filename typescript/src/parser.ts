import yaml from "yaml";
import { ArrayType, BooleanType, ContainerType, EnumType, FloatType, IntType, ObjectType, OptionalType, PrimitiveType, ReferenceType, StringType, Type, UIntType } from "./generator";

export function parseSchemaYml(yamlContent: string): Record<string, Type> {
  const parsedSchema: Record<string, any> = yaml.parse(yamlContent);
  const result: Record<string, Type> = {};
  for (const [key, value] of Object.entries(parsedSchema)) {
    result[key] = parseType(parsedSchema, value);
  }
  return result;
}

function parseType(schema: Record<string, any>, value: any): Type {
  if (Array.isArray(value)) {
    return EnumType(value as string[]);
  }
  if (typeof value === "object") {
    const properties: Record<string, PrimitiveType | ContainerType | ReferenceType> = {};
    for (const [propKey, propValue] of Object.entries(value)) {
      properties[propKey] = parseType(schema, propValue) as PrimitiveType | ContainerType | ReferenceType;
    }
    return ObjectType(properties);
  }
  if (typeof value === "string") {
    if (value.endsWith("[]")) {
      const itemTypeStr = value.slice(0, -2);
      const childType = parseType(schema, itemTypeStr) as PrimitiveType | ContainerType | ReferenceType;
      return ArrayType(childType);
    } 
    if (value.endsWith("?")) {
      const itemTypeStr = value.slice(0, -1);
      const childType = parseType(schema, itemTypeStr) as PrimitiveType | ContainerType | ReferenceType;
      return OptionalType(childType);
    }
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
    } else {
      return ReferenceType(value);
    }
  }
  throw new Error(`Unsupported type format: ${value}`);
}
