import * as fs from "node:fs";
import * as deltapack from "@hpx7/delta-pack";
import * as pbjs from "protobufjs-cli/pbjs.js";
import * as pbts from "protobufjs-cli/pbts.js";

const examplesDir = "../examples";

async function main() {
  const examples = fs.readdirSync(examplesDir);
  const generatedExamples: string[] = [];

  fs.mkdirSync("./generated/deltapack", { recursive: true });
  fs.mkdirSync("./generated/protobuf", { recursive: true });

  for (const example of examples) {
    const schemaPath = `${examplesDir}/${example}/schema.yml`;
    if (!fs.existsSync(schemaPath)) continue;

    // Generate delta-pack TypeScript
    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    const parsedSchema = deltapack.parseSchemaYml(schemaContent);
    const generated = deltapack.codegenTypescript(parsedSchema);

    const deltapackOutPath = `./generated/deltapack/${example}.ts`;
    fs.writeFileSync(deltapackOutPath, generated);
    console.log(`Generated ${deltapackOutPath}`);

    // Generate protobuf JS + TypeScript definitions
    const protoPath = `${examplesDir}/${example}/schema.proto`;
    const protobufJsPath = `./generated/protobuf/${example}.js`;
    const protobufDtsPath = `./generated/protobuf/${example}.d.ts`;

    let jsOutput = await runPbjs(["-t", "static-module", "-w", "es6", "--es6", "--keep-case", protoPath]);
    // Fix import for ES modules - use default import since protobufjs is CommonJS
    jsOutput = jsOutput.replace(
      'import * as $protobuf from "protobufjs/minimal";',
      'import $protobuf from "protobufjs/minimal.js";'
    );
    fs.writeFileSync(protobufJsPath, jsOutput);
    console.log(`Generated ${protobufJsPath}`);

    const dtsOutput = await runPbts([protobufJsPath]);
    fs.writeFileSync(protobufDtsPath, dtsOutput);
    console.log(`Generated ${protobufDtsPath}`);

    generatedExamples.push(example);
  }

  // Generate delta-pack index.ts
  const deltapackIndexContent = generatedExamples.map((e) => `export { ${e} } from "./${e}.js";`).join("\n") + "\n";
  fs.writeFileSync("./generated/deltapack/index.ts", deltapackIndexContent);
  console.log("Generated ./generated/deltapack/index.ts");

  // Generate protobuf index.ts
  const protobufIndexContent = generatedExamples.map((e) => `export { ${e} } from "./${e}.js";`).join("\n") + "\n";
  fs.writeFileSync("./generated/protobuf/index.ts", protobufIndexContent);
  console.log("Generated ./generated/protobuf/index.ts");
}

function runPbjs(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    pbjs.main(args, (err, output) => {
      if (err) reject(err);
      else resolve(output ?? "");
    });
  });
}

function runPbts(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    pbts.main(args, (err, output) => {
      if (err) reject(err);
      else resolve(output ?? "");
    });
  });
}

main();
