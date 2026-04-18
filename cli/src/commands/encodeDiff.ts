import { readFile } from "node:fs/promises";
import { loadApi } from "../utils/schema.js";
import { writeOutput } from "../utils/io.js";
import {
  getString,
  requireSchemaPath,
  requireString,
  type Flags,
} from "../utils/flags.js";

export async function encodeDiff(
  schemaPath: string | undefined,
  flags: Flags,
): Promise<void> {
  const path = requireSchemaPath(schemaPath, "encode-diff");
  const typeName = requireString(
    flags,
    ["t", "type"],
    "encode-diff: type required (-t <name>)",
  );
  const oldPath = requireString(
    flags,
    ["old"],
    "encode-diff: old state required (--old <file>)",
  );
  const newPath = requireString(
    flags,
    ["new"],
    "encode-diff: new state required (--new <file>)",
  );

  const api = await loadApi(path, typeName);
  const oldObj = api.fromJson(JSON.parse(await readFile(oldPath, "utf-8")));
  const newObj = api.fromJson(JSON.parse(await readFile(newPath, "utf-8")));
  const diff = api.encodeDiff(oldObj, newObj);

  await writeOutput(getString(flags, "o", "output"), diff);
}
