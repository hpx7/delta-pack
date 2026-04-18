import { loadApi } from "../utils/schema.js";
import { readJson, writeOutput } from "../utils/io.js";
import {
  getString,
  requireSchemaPath,
  requireString,
  type Flags,
} from "../utils/flags.js";

export async function encode(
  schemaPath: string | undefined,
  flags: Flags,
): Promise<void> {
  const path = requireSchemaPath(schemaPath, "encode");
  const typeName = requireString(
    flags,
    ["t", "type"],
    "encode: type required (-t <name>)",
  );

  const api = await loadApi(path, typeName);
  const json = await readJson(getString(flags, "i", "input"));
  const encoded = api.encode(api.fromJson(json as object));

  await writeOutput(getString(flags, "o", "output"), encoded);
}
