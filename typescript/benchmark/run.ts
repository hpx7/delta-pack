import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as msgpack from "msgpackr";
import type { DeltaPackApi } from "@hpx7/delta-pack";
import * as deltapack from "./generated/deltapack/index.js";
import * as protobuf from "./generated/protobuf/index.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const examplesDir = path.join(__dirname, "../../../examples");
const WARMUP_ITERATIONS = 1000;
const BENCHMARK_DURATION_MS = 500;

interface ProtobufType {
  fromObject: (object: unknown) => unknown;
  toObject: (message: unknown, options?: object) => unknown;
  encode: (message: unknown) => { finish: () => Uint8Array };
  decode: (data: Uint8Array) => unknown;
}

interface Example {
  name: string;
  states: StateData[];
}

interface StateData {
  typedState: unknown;
  plainState: unknown;
  jsonEncoded: string;
  msgpackEncoded: Uint8Array;
  deltaPackEncoded: Uint8Array;
  protobufEncoded: Uint8Array;
  protobufMessage: unknown;
  api: DeltaPackApi<unknown>;
  protobufType: ProtobufType;
}

function main() {
  const filter = process.argv.slice(2);
  let examples = loadExamples();

  if (filter.length > 0) {
    examples = examples.filter((e) => filter.some((f) => e.name.toLowerCase().includes(f.toLowerCase())));
    if (examples.length === 0) {
      console.error(`No examples match filter: ${filter.join(", ")}`);
      console.error(
        `Available: ${loadExamples()
          .map((e) => e.name)
          .join(", ")}`
      );
      process.exit(1);
    }
  }

  console.error("Warming up...");
  globalWarmup(examples);
  console.error("Running benchmarks...\n");

  console.log("## Encoding Speed Comparison (ops/s)\n");
  console.log("Higher is better. The multiplier shows how much slower each format is compared to the fastest.\n");
  runEncodeBenchmarks(examples);

  console.log("\n## Decoding Speed Comparison (ops/s)\n");
  console.log("Higher is better. The multiplier shows how much slower each format is compared to the fastest.\n");
  runDecodeBenchmarks(examples);
}

function globalWarmup(examples: Example[]) {
  for (const example of examples) {
    for (const state of example.states) {
      // Warmup encode
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        Buffer.from(JSON.stringify(state.plainState));
        msgpack.pack(state.plainState);
        state.protobufType.encode(state.protobufMessage).finish();
        state.api.encode(state.typedState);
      }
      // Warmup decode
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        JSON.parse(state.jsonEncoded);
        msgpack.unpack(state.msgpackEncoded);
        state.protobufType.decode(state.protobufEncoded);
        state.api.decode(state.deltaPackEncoded);
      }
    }
  }
}

function runEncodeBenchmarks(examples: Example[]) {
  for (const example of examples) {
    console.log(`### ${example.name}\n`);

    const results: Record<string, number[]> = {
      JSON: [],
      MessagePack: [],
      Protobuf: [],
      DeltaPack: [],
    };

    for (const state of example.states) {
      results["JSON"]!.push(measureOpsPerSecond(() => Buffer.from(JSON.stringify(state.plainState))));
      results["MessagePack"]!.push(measureOpsPerSecond(() => msgpack.pack(state.plainState)));
      results["Protobuf"]!.push(measureOpsPerSecond(() => state.protobufType.encode(state.protobufMessage).finish()));
      results["DeltaPack"]!.push(measureOpsPerSecond(() => state.api.encode(state.typedState)));
    }

    printTable(example.states.length, results);
    console.log();
  }
}

function runDecodeBenchmarks(examples: Example[]) {
  for (const example of examples) {
    console.log(`### ${example.name}\n`);

    const results: Record<string, number[]> = {
      JSON: [],
      MessagePack: [],
      Protobuf: [],
      DeltaPack: [],
    };

    for (const state of example.states) {
      results["JSON"]!.push(measureOpsPerSecond(() => JSON.parse(state.jsonEncoded)));
      results["MessagePack"]!.push(measureOpsPerSecond(() => msgpack.unpack(state.msgpackEncoded)));
      results["Protobuf"]!.push(measureOpsPerSecond(() => state.protobufType.decode(state.protobufEncoded)));
      results["DeltaPack"]!.push(measureOpsPerSecond(() => state.api.decode(state.deltaPackEncoded)));
    }

    printTable(example.states.length, results);
    console.log();
  }
}

function measureOpsPerSecond(action: () => void): number {
  const start = performance.now();
  let ops = 0;

  while (performance.now() - start < BENCHMARK_DURATION_MS) {
    action();
    ops++;
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

function loadExamples(): Example[] {
  const examples: Example[] = [];

  for (const [name, api] of Object.entries(deltapack) as [string, DeltaPackApi<unknown>][]) {
    const protobufType = (protobuf as unknown as Record<string, Record<string, unknown>>)[name]?.[name] as ProtobufType;

    const exampleDir = `${examplesDir}/${name}`;
    const stateFiles = fs
      .readdirSync(exampleDir)
      .filter((f) => f.match(/^state\d+\.json$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0]!);
        const numB = parseInt(b.match(/\d+/)![0]!);
        return numA - numB;
      });

    const states: StateData[] = [];
    for (const file of stateFiles) {
      const json = fs.readFileSync(`${exampleDir}/${file}`, "utf8");
      const plainState = JSON.parse(json);
      const typedState = api.fromJson(plainState);
      const protobufMessage = protobufType.fromObject(plainState);

      states.push({
        typedState,
        plainState,
        jsonEncoded: JSON.stringify(plainState),
        msgpackEncoded: msgpack.pack(plainState),
        deltaPackEncoded: api.encode(typedState),
        protobufEncoded: protobufType.encode(protobufMessage).finish(),
        protobufMessage,
        api,
        protobufType,
      });
    }

    if (states.length > 0) {
      examples.push({ name, states });
    }
  }

  return examples;
}

main();
