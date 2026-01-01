import * as fs from "node:fs";
import { parseSchemaYml } from "@hpx7/delta-pack";
import { codegenTypescript } from "@hpx7/delta-pack-cli/codegen";
import * as pbjs from "protobufjs-cli/pbjs.js";

const examplesDir = "../examples";
const generatedDir = "./benchmark/generated";

async function main() {
  const examples = fs.readdirSync(examplesDir);
  const generatedExamples: string[] = [];

  fs.mkdirSync(`${generatedDir}/deltapack`, { recursive: true });
  fs.mkdirSync(`${generatedDir}/protobuf`, { recursive: true });

  for (const example of examples) {
    const schemaPath = `${examplesDir}/${example}/schema.yml`;
    if (!fs.existsSync(schemaPath)) continue;

    // Generate delta-pack TypeScript
    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    const parsedSchema = parseSchemaYml(schemaContent);
    const generated = codegenTypescript(parsedSchema);

    const deltapackOutPath = `${generatedDir}/deltapack/${example}.ts`;
    fs.writeFileSync(deltapackOutPath, generated);
    console.log(`Generated ${deltapackOutPath}`);

    // Generate protobuf JS
    const protoPath = `${examplesDir}/${example}/schema.proto`;
    const protobufJsPath = `${generatedDir}/protobuf/${example}.js`;

    let jsOutput = await runPbjs(["-t", "static-module", "-w", "es6", "--es6", "--keep-case", protoPath]);
    // Fix import for ES modules - use default import since protobufjs is CommonJS
    jsOutput = jsOutput.replace(
      'import * as $protobuf from "protobufjs/minimal";',
      'import $protobuf from "protobufjs/minimal.js";'
    );
    fs.writeFileSync(protobufJsPath, jsOutput);
    console.log(`Generated ${protobufJsPath}`);

    generatedExamples.push(example);
  }

  // Generate delta-pack index.ts
  const deltapackIndexContent = generatedExamples.map((e) => `export * as ${e} from "./${e}.js";`).join("\n") + "\n";
  fs.writeFileSync(`${generatedDir}/deltapack/index.ts`, deltapackIndexContent);
  console.log(`Generated ${generatedDir}/deltapack/index.ts`);

  // Generate protobuf index.ts
  const protobufIndexContent = generatedExamples.map((e) => `export { ${e} } from "./${e}.js";`).join("\n") + "\n";
  fs.writeFileSync(`${generatedDir}/protobuf/index.ts`, protobufIndexContent);
  console.log(`Generated ${generatedDir}/protobuf/index.ts`);
}

function runPbjs(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    pbjs.main(args, (err, output) => {
      if (err) reject(err);
      else resolve(output ?? "");
    });
  });
}

main();
