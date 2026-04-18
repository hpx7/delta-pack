import { loadApi } from "../utils/schema.js";
import { readInput, writeOutput } from "../utils/io.js";
import {
  getString,
  requireSchemaPath,
  requireString,
  type Flags,
} from "../utils/flags.js";

export async function decode(
  schemaPath: string | undefined,
  flags: Flags,
): Promise<void> {
  const path = requireSchemaPath(schemaPath, "decode");
  const typeName = requireString(
    flags,
    ["t", "type"],
    "decode: type required (-t <name>)",
  );

  const api = await loadApi(path, typeName);
  const binary = await readInput(getString(flags, "i", "input"));
  const json = JSON.stringify(api.toJson(api.decode(binary)), null, 2);

  await writeOutput(getString(flags, "o", "output"), json + "\n");
}
