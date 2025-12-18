import { readFile } from "node:fs/promises";
import { parseSchemaYml, codegenTypescript } from "@hpx7/delta-pack";
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

  let code: string;
  switch (lang) {
    case "typescript":
    case "ts":
      code = codegenTypescript(schema);
      break;
    case "csharp":
    case "cs":
      throw new ArgError("generate: C# codegen not yet implemented");
    default:
      throw new ArgError(`generate: unknown language '${lang}'`);
  }

  await writeOutput(output === true ? undefined : output, code);
}
