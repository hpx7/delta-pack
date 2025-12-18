import { readFile } from "node:fs/promises";
import { load } from "@hpx7/delta-pack";
import { loadSchema, getRootType } from "../utils/schema.js";
import { readInput, writeOutput } from "../utils/io.js";

export type Flags = Map<string, string | true>;

export async function decodeDiff(schemaPath: string | undefined, flags: Flags): Promise<void> {
  if (!schemaPath) {
    throw new Error("Schema file required");
  }

  const typeName = flags.get("t") ?? flags.get("type");
  const oldPath = flags.get("old");
  const diffPath = flags.get("diff");
  const output = flags.get("o") ?? flags.get("output");

  if (!typeName || typeName === true) {
    throw new Error("Type required: -t <name>");
  }
  if (!oldPath || oldPath === true) {
    throw new Error("Old state required: --old <file>");
  }

  const schema = await loadSchema(schemaPath);
  const rootType = getRootType(schema, typeName);
  const api = load(rootType);

  const oldJson = JSON.parse(await readFile(oldPath, "utf-8"));
  const oldObj = api.fromJson(oldJson);

  const diffBinary = await readInput(diffPath === true ? undefined : diffPath);
  const newObj = api.decodeDiff(oldObj, diffBinary);
  const json = JSON.stringify(api.toJson(newObj), null, 2);

  await writeOutput(output === true ? undefined : output, json + "\n");
}
