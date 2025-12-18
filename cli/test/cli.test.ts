import { describe, it, expect } from "bun:test";
import { $ } from "bun";
import { parseSchemaYml, load, ObjectType } from "@hpx7/delta-pack";

const cli = "./src/index.ts";

const schemaPath = "../examples/Primitives/schema.yml";
const state1Path = "../examples/Primitives/state1.json";
const state2Path = "../examples/Primitives/state2.json";
const schemaYml = await Bun.file(schemaPath).text();
const state1Json = await Bun.file(state1Path).json();
const state2Json = await Bun.file(state2Path).json();

const schema = parseSchemaYml(schemaYml);
const PrimitivesApi = load(schema["Primitives"] as ObjectType);

describe("CLI", () => {
  it("shows help", async () => {
    const result = await $`bun ${cli} help`.text();
    expect(result).toContain("delta-pack CLI");
    expect(result).toContain("Commands:");
  });

  it("shows version", async () => {
    const result = await $`bun ${cli} -v`.text();
    expect(result.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("encode and decode roundtrip", async () => {
    const encoded =
      await $`bun ${cli} encode ${schemaPath} -t Primitives -i ${state1Path}`.arrayBuffer();
    const decoded =
      await $`bun ${cli} decode ${schemaPath} -t Primitives < ${encoded}`.text();
    const original = PrimitivesApi.fromJson(state1Json);
    const result = PrimitivesApi.fromJson(JSON.parse(decoded));
    expect(PrimitivesApi.equals(result, original)).toBe(true);
  });

  it("encode-diff and decode-diff roundtrip", async () => {
    const diff =
      await $`bun ${cli} encode-diff ${schemaPath} -t Primitives --old ${state1Path} --new ${state2Path}`.arrayBuffer();
    const decoded =
      await $`bun ${cli} decode-diff ${schemaPath} -t Primitives --old ${state1Path} < ${diff}`.text();
    const expected = PrimitivesApi.fromJson(state2Json);
    const result = PrimitivesApi.fromJson(JSON.parse(decoded));
    expect(PrimitivesApi.equals(result, expected)).toBe(true);
  });

  it("generate typescript", async () => {
    const generated =
      await $`bun ${cli} generate ${schemaPath} -l typescript`.text();
    expect(generated).toContain("export type Primitives");
    expect(generated).toContain("export const Primitives");
  });

  it("errors on missing schema", async () => {
    const result = await $`bun ${cli} encode -t Foo`.nothrow();
    expect(result.exitCode).toBe(1);
  });

  it("errors on missing type", async () => {
    const result = await $`bun ${cli} encode ${schemaPath}`.nothrow();
    expect(result.exitCode).toBe(1);
  });

  it("errors on unknown type", async () => {
    const result =
      await $`bun ${cli} encode ${schemaPath} -t Unknown -i ${state1Path}`.nothrow();
    expect(result.exitCode).toBe(1);
  });
});
