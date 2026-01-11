import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as esbuild from "esbuild";
import * as pbjs from "protobufjs-cli/pbjs.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const examplesDir = "../examples";
const generatedDir = "./benchmark/generated";

async function main() {
  const examples = fs.readdirSync(examplesDir).filter((e) => fs.existsSync(`${examplesDir}/${e}/schema.yml`));

  fs.mkdirSync(`${generatedDir}/protobuf`, { recursive: true });

  for (const example of examples) {
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
  }

  // Generate protobuf index.js (protobuf exports lowercase package names)
  const protobufIndexContent =
    examples.map((e) => `export { ${e.toLowerCase()} as ${e} } from "./${e}.js";`).join("\n") + "\n";
  fs.writeFileSync(`${generatedDir}/protobuf/index.js`, protobufIndexContent);
  console.log(`Generated ${generatedDir}/protobuf/index.js`);

  // Generate data.ts with all static imports for bundling
  generateData(examples);

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
    loader: {
      ".yml": "text",
      ".proto": "text",
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

function generateData(examples: string[]) {
  const lines: string[] = [];

  // Collect state files for each example
  const exampleStates: Record<string, string[]> = {};
  for (const example of examples) {
    const exampleDir = `${examplesDir}/${example}`;
    const stateFiles = fs
      .readdirSync(exampleDir)
      .filter((f) => f.match(/^state\d+\.json$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0]!);
        const numB = parseInt(b.match(/\d+/)![0]!);
        return numA - numB;
      });
    exampleStates[example] = stateFiles;
  }

  // Import state JSON files
  for (const example of examples) {
    for (const stateFile of exampleStates[example]!) {
      const stateName = stateFile.replace(".json", "");
      lines.push(`import ${example}_${stateName} from "../../../examples/${example}/${stateFile}";`);
    }
  }
  lines.push("");

  // Import schema YAML files
  for (const example of examples) {
    lines.push(`import ${example}_schema from "../../../examples/${example}/schema.yml";`);
  }
  lines.push("");

  // Import proto files
  for (const example of examples) {
    lines.push(`import ${example}_proto from "../../../examples/${example}/schema.proto";`);
  }
  lines.push("");

  // Export exampleData
  lines.push("export const exampleData: Record<string, object[]> = {");
  for (const example of examples) {
    const states = exampleStates[example]!.map((f) => `${example}_${f.replace(".json", "")}`);
    lines.push(`  ${example}: [${states.join(", ")}],`);
  }
  lines.push("};");
  lines.push("");

  // Export schemas
  lines.push("export const schemas: Record<string, string> = {");
  for (const example of examples) {
    lines.push(`  ${example}: ${example}_schema,`);
  }
  lines.push("};");
  lines.push("");

  // Export protos
  lines.push("export const protos: Record<string, string> = {");
  for (const example of examples) {
    lines.push(`  ${example}: ${example}_proto,`);
  }
  lines.push("};");
  lines.push("");

  fs.writeFileSync(`${generatedDir}/data.ts`, lines.join("\n"));
  console.log(`Generated ${generatedDir}/data.ts`);
}

main();
