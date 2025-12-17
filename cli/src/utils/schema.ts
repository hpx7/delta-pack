import { parseSchemaYml, type NamedType, type ObjectType, type UnionType } from "@hpx7/delta-pack";

export async function loadSchema(path: string): Promise<Record<string, NamedType>> {
  const file = Bun.file(path);
  const content = await file.text();
  return parseSchemaYml(content);
}

export function getRootType(
  schema: Record<string, NamedType>,
  typeName: string
): ObjectType | UnionType {
  const type = schema[typeName];
  if (!type) {
    throw new Error(`Type "${typeName}" not found in schema`);
  }
  if (type.type !== "object" && type.type !== "union") {
    throw new Error(`Type "${typeName}" must be an object or union, got ${type.type}`);
  }
  return type;
}
