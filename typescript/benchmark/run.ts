import * as msgpack from "msgpackr";
import protobuf from "protobufjs";
import { load, parseSchemaYml, type DeltaPackApi } from "@hpx7/delta-pack";
import * as deltapackGenerated from "../generated/examples/index.js";
import * as protobufGenerated from "./generated/protobuf/index.js";
import { exampleData, schemas, protos } from "./generated/data.js";

const WARMUP_ITERATIONS = 1000;
const BENCHMARK_DURATION_MS = 500;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

interface Example {
  name: string;
  states: StateData[];
}

interface StateData {
  jsonInput: unknown;
  deltaPackInput: unknown;
  protobufInput: unknown;
  jsonEncoded: Uint8Array;
  msgpackEncoded: Uint8Array;
  deltaPackEncoded: Uint8Array;
  protobufEncoded: Uint8Array;
  deltaPackApi: DeltaPackApi<unknown>;
  protobufApi: ProtobufType;
}

interface ProtobufType {
  fromObject: (object: unknown) => unknown;
  encode: (message: unknown) => { finish: () => Uint8Array };
  decode: (data: Uint8Array) => unknown;
}

export function runBenchmarks(mode: "codegen" | "interpreter", filter?: string[]) {
  const deltaPack =
    mode === "codegen"
      ? (deltapackGenerated as Record<string, DeltaPackApi<unknown>>)
      : loadDeltaPackFromSchemas(schemas);
  const protobuf =
    mode === "codegen"
      ? extractProtobufFromGenerated(protobufGenerated as Record<string, Record<string, unknown>>)
      : loadProtobufFromProtos(protos);

  let examples = loadExamples(exampleData, deltaPack, protobuf);

  if (filter?.length) {
    examples = examples.filter((e) => filter.some((f) => e.name.toLowerCase().includes(f.toLowerCase())));
    if (examples.length === 0) {
      console.error(`No examples match filter: ${filter.join(", ")}`);
      console.error(`Available: ${Object.keys(exampleData).join(", ")}`);
      return;
    }
  }

  console.log("Warming up...");
  globalWarmup(examples);

  console.log(`Running benchmarks (${mode})...\n`);

  console.log("## Encoding Speed Comparison (ops/s)\n");
  console.log("Higher is better. The multiplier shows how much slower each format is compared to the fastest.\n");
  runBenchmarksForExamples(examples, (state) => ({
    JSON: () => textEncoder.encode(JSON.stringify(state.jsonInput)),
    MessagePack: () => msgpack.pack(state.jsonInput),
    Protobuf: () => state.protobufApi.encode(state.protobufInput).finish(),
    DeltaPack: () => state.deltaPackApi.encode(state.deltaPackInput),
  }));

  console.log("\n## Decoding Speed Comparison (ops/s)\n");
  console.log("Higher is better. The multiplier shows how much slower each format is compared to the fastest.\n");
  runBenchmarksForExamples(examples, (state) => ({
    JSON: () => JSON.parse(textDecoder.decode(state.jsonEncoded)),
    MessagePack: () => msgpack.unpack(state.msgpackEncoded),
    Protobuf: () => state.protobufApi.decode(state.protobufEncoded),
    DeltaPack: () => state.deltaPackApi.decode(state.deltaPackEncoded),
  }));
}

function globalWarmup(examples: Example[]) {
  for (const example of examples) {
    for (const state of example.states) {
      // Warmup encode
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        textEncoder.encode(JSON.stringify(state.jsonInput));
        msgpack.pack(state.jsonInput);
        state.protobufApi.encode(state.protobufInput).finish();
        state.deltaPackApi.encode(state.deltaPackInput);
      }
      // Warmup decode
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        JSON.parse(textDecoder.decode(state.jsonEncoded));
        msgpack.unpack(state.msgpackEncoded);
        state.protobufApi.decode(state.protobufEncoded);
        state.deltaPackApi.decode(state.deltaPackEncoded);
      }
    }
  }
}

function runBenchmarksForExamples(examples: Example[], getActions: (state: StateData) => Record<string, () => void>) {
  for (const example of examples) {
    console.log(`### ${example.name}\n`);

    const results: Record<string, number[]> = {};
    for (const state of example.states) {
      for (const [name, action] of Object.entries(getActions(state))) {
        (results[name] ??= []).push(measureOpsPerSecond(action));
      }
    }

    printTable(example.states.length, results);
    console.log();
  }
}

function measureOpsPerSecond(action: () => void): number {
  const BATCH_SIZE = 1000; // Check time every 1000 iterations to reduce overhead
  const start = performance.now();
  let ops = 0;

  while (performance.now() - start < BENCHMARK_DURATION_MS) {
    for (let i = 0; i < BATCH_SIZE; i++) {
      action();
    }
    ops += BATCH_SIZE;
  }

  const elapsed = (performance.now() - start) / 1000;
  return ops / elapsed;
}

function printTable(stateCount: number, results: Record<string, number[]>) {
  // Calculate max ops per state for multiplier calculation
  const maxOps: number[] = [];
  for (let i = 0; i < stateCount; i++) {
    maxOps.push(Math.max(...Object.values(results).map((r) => r[i]!)));
  }

  // Build header
  const headers = ["Format", ...Array.from({ length: stateCount }, (_, i) => `State${i + 1}`)];

  // Build rows
  const rows: string[][] = [];
  for (const [format, ops] of Object.entries(results)) {
    const row = [format];
    for (let i = 0; i < stateCount; i++) {
      const multiplier = maxOps[i]! / ops[i]!;
      row.push(`${formatOps(ops[i]!)} (${multiplier.toFixed(1)}x)`);
    }
    rows.push(row);
  }

  // Calculate column widths
  const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i]!.length)));

  // Print table
  console.log("| " + headers.map((h, i) => h.padEnd(colWidths[i]!)).join(" | ") + " |");
  console.log("| " + colWidths.map((w) => "-".repeat(w)).join(" | ") + " |");
  for (const row of rows) {
    console.log("| " + row.map((c, i) => c.padEnd(colWidths[i]!)).join(" | ") + " |");
  }
}

function formatOps(ops: number): string {
  if (ops >= 1_000_000) return `${(ops / 1_000_000).toFixed(1)}M`;
  if (ops >= 1_000) return `${(ops / 1_000).toFixed(1)}K`;
  return ops.toFixed(0);
}

function loadExamples(
  exampleData: Record<string, object[]>,
  deltaPack: Record<string, DeltaPackApi<unknown>>,
  protobuf: Record<string, ProtobufType>
): Example[] {
  const examples: Example[] = [];

  for (const [name, stateJsons] of Object.entries(exampleData)) {
    const deltaPackApi = deltaPack[name]!;
    const protobufApi = protobuf[name]!;

    const states: StateData[] = [];
    for (const jsonInput of stateJsons) {
      const deltaPackInput = deltaPackApi.fromJson(jsonInput);
      const protobufInput = protobufApi.fromObject(jsonInput);

      states.push({
        jsonInput,
        deltaPackInput,
        protobufInput,
        jsonEncoded: textEncoder.encode(JSON.stringify(jsonInput)),
        msgpackEncoded: msgpack.pack(jsonInput),
        deltaPackEncoded: deltaPackApi.encode(deltaPackInput),
        protobufEncoded: protobufApi.encode(protobufInput).finish(),
        deltaPackApi,
        protobufApi,
      });
    }

    if (states.length > 0) {
      examples.push({ name, states });
    }
  }

  return examples;
}

function loadDeltaPackFromSchemas(schemas: Record<string, string>): Record<string, DeltaPackApi<unknown>> {
  const apis: Record<string, DeltaPackApi<unknown>> = {};
  for (const [name, content] of Object.entries(schemas)) {
    const parsed = parseSchemaYml(content);
    if (parsed[name]) {
      apis[name] = load(parsed[name]) as DeltaPackApi<unknown>;
    }
  }
  return apis;
}

function loadProtobufFromProtos(protos: Record<string, string>): Record<string, ProtobufType> {
  const types: Record<string, ProtobufType> = {};
  for (const [name, content] of Object.entries(protos)) {
    const root = protobuf.parse(content).root;
    types[name] = root.lookupType(name) as unknown as ProtobufType;
  }
  return types;
}

function extractProtobufFromGenerated(
  generated: Record<string, Record<string, unknown>>
): Record<string, ProtobufType> {
  const types: Record<string, ProtobufType> = {};
  for (const [name, module] of Object.entries(generated)) {
    types[name] = module[name] as ProtobufType;
  }
  return types;
}
