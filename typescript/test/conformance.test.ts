import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { parseSchemaYml, load, DeltaPackApi } from "@hpx7/delta-pack";
import * as codegen from "../generated/examples/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const examplesDir = join(__dirname, "../../examples");

function readGoldenBytes(example: string, filename: string): Buffer {
  return readFileSync(join(examplesDir, example, filename));
}

function getStates(example: string): string[] {
  const dir = join(examplesDir, example);
  return readdirSync(dir)
    .filter((f) => f.startsWith("state") && f.endsWith(".json"))
    .sort();
}

const EXAMPLES = ["Primitives", "User", "GameState", "Test"] as const;

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

      for (const stateFile of states) {
        const stateName = basename(stateFile, ".json");
        const statePath = join(examplesDir, example, stateFile);
        const stateData = JSON.parse(readFileSync(statePath, "utf8"));

        it(`${stateName} encode matches golden`, () => {
          const goldenBytes = readGoldenBytes(example, `${stateName}.snapshot.bin`);
          const state = api.fromJson(stateData);
          const tsEncoded = Buffer.from(api.encode(state));
          // Encoding order may vary, so only check decoded equality
          const goldenDecoded = api.decode(goldenBytes);
          const tsDecoded = api.decode(tsEncoded);
          expect(api.equals(goldenDecoded, tsDecoded)).toBe(true);
        });

        it(`${stateName} decode from golden`, () => {
          const goldenBytes = readGoldenBytes(example, `${stateName}.snapshot.bin`);
          const state = api.fromJson(stateData);
          const decoded = api.decode(goldenBytes);
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
        const oldFile = states[i]!;
        const newFile = states[i + 1]!;
        const oldName = basename(oldFile, ".json");
        const newName = basename(newFile, ".json");
        const oldPath = join(examplesDir, example, oldFile);
        const newPath = join(examplesDir, example, newFile);

        it(`diff ${oldName} -> ${newName} encode matches golden`, () => {
          const goldenDiff = readGoldenBytes(example, `${oldName}_${newName}.diff.bin`);
          const oldState = api.fromJson(JSON.parse(readFileSync(oldPath, "utf8")));
          const newState = api.fromJson(JSON.parse(readFileSync(newPath, "utf8")));
          const tsEncoded = Buffer.from(api.encodeDiff(oldState, newState));
          // Encoding order may vary, so only check decoded equality
          const goldenDecoded = api.decodeDiff(oldState, goldenDiff);
          const tsDecoded = api.decodeDiff(oldState, tsEncoded);
          expect(api.equals(goldenDecoded, tsDecoded)).toBe(true);
        });

        it(`diff ${oldName} -> ${newName} decode from golden`, () => {
          const goldenDiff = readGoldenBytes(example, `${oldName}_${newName}.diff.bin`);
          const oldState = api.fromJson(JSON.parse(readFileSync(oldPath, "utf8")));
          const newState = api.fromJson(JSON.parse(readFileSync(newPath, "utf8")));
          const decoded = api.decodeDiff(oldState, goldenDiff);
          expect(api.equals(decoded, newState)).toBe(true);
        });
      }
    });
  }
}

describe("Golden Conformance - Interpreter", () => {
  runConformanceTests("interpreter");
});

describe("Golden Conformance - Codegen", () => {
  runConformanceTests("codegen");
});
