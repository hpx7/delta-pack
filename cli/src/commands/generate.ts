import { readFile } from "node:fs/promises";
import { parseSchemaYml } from "@hpx7/delta-pack";
import { languages } from "../codegen/index.js";
import { writeOutput } from "../utils/io.js";
import { ArgError } from "../utils/errors.js";

export type Flags = Map<string, string | true>;

export async function generate(
  schemaPath: string | undefined,
  flags: Flags,
): Promise<void> {
  if (!schemaPath) {
    throw new ArgError("generate: schema file required");
  }

  const lang = flags.get("l") ?? flags.get("language");
  const output = flags.get("o") ?? flags.get("output");

  if (!lang || lang === true) {
    throw new ArgError("generate: language required (-l <typescript|csharp>)");
  }

  const content = await readFile(schemaPath, "utf-8");
  const schema = parseSchemaYml(content);

  const codegen = languages[lang];
  if (!codegen) {
    throw new ArgError(`generate: unknown language '${lang}'`);
  }

  const ns = flags.get("n") ?? flags.get("namespace");
  const code = codegen(schema, typeof ns === "string" ? ns : undefined);

  await writeOutput(output === true ? undefined : output, code);
}
