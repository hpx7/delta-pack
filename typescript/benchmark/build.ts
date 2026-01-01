import * as fs from "node:fs";
import { parseSchemaYml } from "@hpx7/delta-pack";
import { codegenTypescript } from "@hpx7/delta-pack-cli/codegen";

const examplesDir = "../examples";
const generatedDir = "./benchmark/generated";

async function main() {
  const examples = fs.readdirSync(examplesDir);
  const generatedExamples: string[] = [];

  fs.mkdirSync(generatedDir, { recursive: true });

  for (const example of examples) {
    const schemaPath = `${examplesDir}/${example}/schema.yml`;
    if (!fs.existsSync(schemaPath)) continue;

    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    const parsedSchema = parseSchemaYml(schemaContent);
    const generated = codegenTypescript(parsedSchema);

    const outPath = `${generatedDir}/${example}.ts`;
    fs.writeFileSync(outPath, generated);
    console.log(`Generated ${outPath}`);

    generatedExamples.push(example);
  }

  // Generate index.ts
  const indexContent = generatedExamples.map((e) => `export * as ${e} from "./${e}.js";`).join("\n") + "\n";
  fs.writeFileSync(`${generatedDir}/index.ts`, indexContent);
  console.log(`Generated ${generatedDir}/index.ts`);
}

main();
