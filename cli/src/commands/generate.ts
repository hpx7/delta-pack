import { readFile } from "node:fs/promises";
import { parseSchemaYml } from "@hpx7/delta-pack";
import { languages } from "../codegen/index.js";
import { writeOutput } from "../utils/io.js";
import { ArgError } from "../utils/errors.js";
import {
  getBoolean,
  getString,
  requireSchemaPath,
  requireString,
  type Flags,
} from "../utils/flags.js";

export async function generate(
  schemaPath: string | undefined,
  flags: Flags,
): Promise<void> {
  const path = requireSchemaPath(schemaPath, "generate");
  const lang = requireString(
    flags,
    ["l", "language"],
    "generate: language required (-l <typescript|csharp>)",
  );

  const codegen = languages[lang];
  if (!codegen) {
    throw new ArgError(`generate: unknown language '${lang}'`);
  }

  const content = await readFile(path, "utf-8");
  const schema = parseSchemaYml(content);
  const code = codegen(schema, {
    namespace: getString(flags, "n", "namespace"),
    partial: getBoolean(flags, "partial"),
  });

  await writeOutput(getString(flags, "o", "output"), code);
}
