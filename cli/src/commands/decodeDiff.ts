import { readFile } from "node:fs/promises";
import { loadApi } from "../utils/schema.js";
import { readInput, writeOutput } from "../utils/io.js";
import {
  getString,
  requireSchemaPath,
  requireString,
  type Flags,
} from "../utils/flags.js";

export async function decodeDiff(
  schemaPath: string | undefined,
  flags: Flags,
): Promise<void> {
  const path = requireSchemaPath(schemaPath, "decode-diff");
  const typeName = requireString(
    flags,
    ["t", "type"],
    "decode-diff: type required (-t <name>)",
  );
  const oldPath = requireString(
    flags,
    ["old"],
    "decode-diff: old state required (--old <file>)",
  );

  const api = await loadApi(path, typeName);
  const oldObj = api.fromJson(JSON.parse(await readFile(oldPath, "utf-8")));
  const diffBinary = await readInput(getString(flags, "diff"));
  const newObj = api.decodeDiff(oldObj, diffBinary);
  const json = JSON.stringify(api.toJson(newObj), null, 2);

  await writeOutput(getString(flags, "o", "output"), json + "\n");
}
