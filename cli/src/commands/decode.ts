import { load } from "@hpx7/delta-pack";
import { loadSchema, getRootType } from "../utils/schema.js";
import { readInput, writeOutput } from "../utils/io.js";
import { ArgError } from "../utils/errors.js";

export type Flags = Map<string, string | true>;

export async function decode(
  schemaPath: string | undefined,
  flags: Flags,
): Promise<void> {
  if (!schemaPath) {
    throw new ArgError("decode: schema file required");
  }

  const typeName = flags.get("t") ?? flags.get("type");
  const input = flags.get("i") ?? flags.get("input");
  const output = flags.get("o") ?? flags.get("output");

  if (!typeName || typeName === true) {
    throw new ArgError("decode: type required (-t <name>)");
  }

  const schema = await loadSchema(schemaPath);
  const rootType = getRootType(schema, typeName);
  const api = load(rootType);

  const binary = await readInput(input === true ? undefined : input);
  const decoded = api.decode(binary);
  const json = JSON.stringify(api.toJson(decoded), null, 2);

  await writeOutput(output === true ? undefined : output, json + "\n");
}
