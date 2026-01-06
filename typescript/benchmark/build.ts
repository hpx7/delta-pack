import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as esbuild from "esbuild";
import { parseSchemaYml } from "@hpx7/delta-pack";
import { codegenTypescript } from "@hpx7/delta-pack-cli/codegen";
import * as pbjs from "protobufjs-cli/pbjs.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

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
  const deltapackIndexContent = generatedExamples.map((e) => `export { ${e} } from "./${e}.js";`).join("\n") + "\n";
  fs.writeFileSync(`${generatedDir}/deltapack/index.ts`, deltapackIndexContent);
  console.log(`Generated ${generatedDir}/deltapack/index.ts`);

  // Generate protobuf index.ts (protobuf exports lowercase package names)
  const protobufIndexContent =
    generatedExamples.map((e) => `export { ${e.toLowerCase()} as ${e} } from "./${e}.js";`).join("\n") + "\n";
  fs.writeFileSync(`${generatedDir}/protobuf/index.ts`, protobufIndexContent);
  console.log(`Generated ${generatedDir}/protobuf/index.ts`);

  const sharedOptions: esbuild.BuildOptions = {
    bundle: true,
    format: "esm",
    target: "es2020",
    minify: false,
    sourcemap: true,
    alias: {
      "@hpx7/delta-pack/runtime": path.join(__dirname, "../src/runtime.ts"),
      "@hpx7/delta-pack": path.join(__dirname, "../src/index.ts"),
    },
  };

  // Build node bundle
  await esbuild.build({
    ...sharedOptions,
    entryPoints: [path.join(__dirname, "run-node.ts")],
    outfile: path.join(__dirname, "dist/run-node.js"),
    platform: "node",
    packages: "external",
  });
  console.log("Built benchmark/dist/run-node.js");

  // Build browser bundle
  await esbuild.build({
    ...sharedOptions,
    entryPoints: [path.join(__dirname, "run-browser.ts")],
    outfile: path.join(__dirname, "dist/run-browser.js"),
    platform: "browser",
  });
  console.log("Built benchmark/dist/run-browser.js");
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
