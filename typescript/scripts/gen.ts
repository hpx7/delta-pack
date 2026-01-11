import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import { parseSchemaYml } from "@hpx7/delta-pack";
import { codegenTypescript } from "@hpx7/delta-pack-cli/codegen";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const examplesDir = path.join(rootDir, "../examples");
const generatedDir = path.join(rootDir, "generated/examples");

fs.mkdirSync(generatedDir, { recursive: true });

// Generate examples
const examples = fs.readdirSync(examplesDir);

for (const example of examples) {
  const schemaPath = path.join(examplesDir, example, "schema.yml");
  if (!fs.existsSync(schemaPath)) continue;

  const schemaContent = fs.readFileSync(schemaPath, "utf8");
  const parsedSchema = parseSchemaYml(schemaContent);
  const generated = codegenTypescript(parsedSchema);

  const outPath = path.join(generatedDir, `${example}.ts`);
  fs.writeFileSync(outPath, generated);
  console.log(`Generated ${outPath}`);
}

// Generate index.ts
const indexContent =
  examples
    .filter((e) => fs.existsSync(path.join(examplesDir, e, "schema.yml")))
    .map((e) => `export { ${e} } from "./${e}.js";`)
    .join("\n") + "\n";

fs.writeFileSync(path.join(generatedDir, "index.ts"), indexContent);
console.log(`Generated ${path.join(generatedDir, "index.ts")}`);
