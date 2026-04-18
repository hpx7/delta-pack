import { readFile } from "node:fs/promises";
import {
  load,
  parseSchemaYml,
  type DeltaPackApi,
  type NamedType,
  type ObjectType,
  type UnionType,
} from "@hpx7/delta-pack";

export async function loadSchema(
  path: string,
): Promise<Record<string, NamedType>> {
  const content = await readFile(path, "utf-8");
  return parseSchemaYml(content);
}

export function getRootType(
  schema: Record<string, NamedType>,
  typeName: string,
): ObjectType | UnionType {
  const type = schema[typeName];
  if (!type) {
    throw new Error(`Type "${typeName}" not found in schema`);
  }
  if (type.type !== "object" && type.type !== "union") {
    throw new Error(
      `Type "${typeName}" must be an object or union, got ${type.type}`,
    );
  }
  return type;
}

/** Parse the schema file and load a DeltaPackApi for the named root type. */
export async function loadApi(
  schemaPath: string,
  typeName: string,
): Promise<DeltaPackApi<unknown>> {
  const schema = await loadSchema(schemaPath);
  return load<unknown>(getRootType(schema, typeName));
}
