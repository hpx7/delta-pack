import { load } from "@hpx7/delta-pack";
import { loadSchema, getRootType } from "../utils/schema.js";
import { readJson, writeOutput } from "../utils/io.js";
import { ArgError } from "../utils/errors.js";

export type Flags = Map<string, string | true>;

export async function encode(
  schemaPath: string | undefined,
  flags: Flags,
): Promise<void> {
  if (!schemaPath) {
    throw new ArgError("encode: schema file required");
  }

  const typeName = flags.get("t") ?? flags.get("type");
  const input = flags.get("i") ?? flags.get("input");
  const output = flags.get("o") ?? flags.get("output");

  if (!typeName || typeName === true) {
    throw new ArgError("encode: type required (-t <name>)");
  }

  const schema = await loadSchema(schemaPath);
  const rootType = getRootType(schema, typeName);
  const api = load(rootType);

  const json = await readJson(input === true ? undefined : input);
  const obj = api.fromJson(json as object);
  const encoded = api.encode(obj);

  await writeOutput(output === true ? undefined : output, encoded);
}
