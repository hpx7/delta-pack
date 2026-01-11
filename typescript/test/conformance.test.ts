import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { parseSchemaYml, load, DeltaPackApi } from "@hpx7/delta-pack";
import * as codegen from "../generated/examples/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const examplesDir = join(__dirname, "../../examples");

function cli(args: string): Buffer {
  return execSync(`npx delta-pack ${args}`, {
    encoding: "buffer",
    cwd: join(__dirname, ".."),
  });
}

function getStates(example: string): string[] {
  const dir = join(examplesDir, example);
  return readdirSync(dir)
    .filter((f) => f.startsWith("state") && f.endsWith(".json"))
    .sort()
    .map((f) => join(dir, f));
}

const EXAMPLES = ["Primitives", "User", "GameState", "Test"] as const;

// Pre-computed fixtures from CLI
interface Fixtures {
  encodes: Map<string, Buffer>; // statePath -> encoded bytes
  diffs: Map<string, Buffer>; // "oldPath|newPath" -> diff bytes
}

const fixtures = new Map<string, Fixtures>();

// Generate all fixtures upfront in a single beforeAll
beforeAll(() => {
  for (const example of EXAMPLES) {
    const schemaPath = join(examplesDir, `${example}/schema.yml`);
    const states = getStates(example);
    const encodes = new Map<string, Buffer>();
    const diffs = new Map<string, Buffer>();

    // Generate encode fixtures
    for (const statePath of states) {
      encodes.set(statePath, cli(`encode ${schemaPath} -t ${example} -i ${statePath}`));
    }

    // Generate diff fixtures
    for (let i = 0; i < states.length - 1; i++) {
      const oldPath = states[i];
      const newPath = states[i + 1];
      diffs.set(
        `${oldPath}|${newPath}`,
        cli(`encode-diff ${schemaPath} -t ${example} --old ${oldPath} --new ${newPath}`)
      );
    }

    fixtures.set(example, { encodes, diffs });
  }
});

// Get API for a given example and mode
function getApi(example: (typeof EXAMPLES)[number], mode: "interpreter" | "codegen"): DeltaPackApi<any> {
  if (mode === "codegen") {
    return codegen[example] as DeltaPackApi<any>;
  }
  const schemaPath = join(examplesDir, `${example}/schema.yml`);
  const schemaYml = readFileSync(schemaPath, "utf8");
  const schema = parseSchemaYml(schemaYml);
  return load<any>(schema[example]!);
}

// Run conformance tests for a given mode
function runConformanceTests(mode: "interpreter" | "codegen") {
  for (const example of EXAMPLES) {
    describe(example, () => {
      const api = getApi(example, mode);
      const states = getStates(example);

      for (const statePath of states) {
        const stateName = basename(statePath, ".json");
        const stateData = JSON.parse(readFileSync(statePath, "utf8"));

        it(`${stateName} encode matches CLI`, () => {
          const cliEncoded = fixtures.get(example)!.encodes.get(statePath)!;
          const state = api.fromJson(stateData);
          const tsEncoded = Buffer.from(api.encode(state));
          // Encoding order may vary, so only check decoded equality
          const cliDecoded = api.decode(cliEncoded);
          const tsDecoded = api.decode(tsEncoded);
          expect(api.equals(cliDecoded, tsDecoded)).toBe(true);
        });

        it(`${stateName} decode from CLI output`, () => {
          const encoded = fixtures.get(example)!.encodes.get(statePath)!;
          const state = api.fromJson(stateData);
          const decoded = api.decode(encoded);
          expect(api.equals(decoded, state)).toBe(true);
        });

        it(`${stateName} toJson round-trip`, () => {
          const state = api.fromJson(stateData);
          const json = api.toJson(state);
          const reparsed = api.fromJson(json);
          expect(api.equals(reparsed, state)).toBe(true);
        });
      }

      for (let i = 0; i < states.length - 1; i++) {
        const oldPath = states[i]!;
        const newPath = states[i + 1]!;
        const oldName = basename(oldPath, ".json");
        const newName = basename(newPath, ".json");

        it(`diff ${oldName} -> ${newName} encode matches CLI`, () => {
          const cliEncoded = fixtures.get(example)!.diffs.get(`${oldPath}|${newPath}`)!;
          const oldState = api.fromJson(JSON.parse(readFileSync(oldPath, "utf8")));
          const newState = api.fromJson(JSON.parse(readFileSync(newPath, "utf8")));
          const tsEncoded = Buffer.from(api.encodeDiff(oldState, newState));
          // Encoding order may vary, so only check decoded equality
          const cliDecoded = api.decodeDiff(oldState, cliEncoded);
          const tsDecoded = api.decodeDiff(oldState, tsEncoded);
          expect(api.equals(cliDecoded, tsDecoded)).toBe(true);
        });

        it(`diff ${oldName} -> ${newName} decode from CLI output`, () => {
          const diffBytes = fixtures.get(example)!.diffs.get(`${oldPath}|${newPath}`)!;
          const oldState = api.fromJson(JSON.parse(readFileSync(oldPath, "utf8")));
          const newState = api.fromJson(JSON.parse(readFileSync(newPath, "utf8")));
          const decoded = api.decodeDiff(oldState, diffBytes);
          expect(api.equals(decoded, newState)).toBe(true);
        });
      }
    });
  }
}

describe("CLI Conformance - Interpreter", () => {
  runConformanceTests("interpreter");
});

describe("CLI Conformance - Codegen", () => {
  runConformanceTests("codegen");
});
