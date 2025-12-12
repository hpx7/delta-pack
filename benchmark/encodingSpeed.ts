import * as fs from "node:fs";
import * as deltapack from "@hpx7/delta-pack";
import { pack } from "msgpackr";
import protobuf from "protobufjs";

const examplesDir = "../examples";
const WARMUP_MS = 100;
const BENCHMARK_MS = 1000;

async function main() {
  const examples = fs.readdirSync(examplesDir);

  console.log("## Encoding Speed Comparison (ops/s)\n");

  for (const example of examples) {
    const result = await benchmarkExample(example);

    // Find highest ops/s for each state
    const maxOps = result.json.map((_, i) =>
      Math.max(result.json[i]!, result.msgpack[i]!, result.protobuf[i]!, result.deltaPack[i]!)
    );

    console.log(`### ${example}\n`);

    // Calculate column widths
    const allRows = [
      ["JSON", ...result.json.map((ops, i) => `${formatOps(ops)} (${(maxOps[i]! / ops).toFixed(1)}x)`)],
      ["MessagePack", ...result.msgpack.map((ops, i) => `${formatOps(ops)} (${(maxOps[i]! / ops).toFixed(1)}x)`)],
      ["Protobuf", ...result.protobuf.map((ops, i) => `${formatOps(ops)} (${(maxOps[i]! / ops).toFixed(1)}x)`)],
      ["Delta-Pack", ...result.deltaPack.map((ops, i) => `${formatOps(ops)} (${(maxOps[i]! / ops).toFixed(1)}x)`)],
    ];
    const headers = ["Format", ...result.json.map((_, i) => `State${i + 1}`)];
    const colWidths = headers.map((h, i) => Math.max(h.length, ...allRows.map((row) => row[i]!.length)));

    const formatRow = (cols: string[]) => "| " + cols.map((col, i) => col.padEnd(colWidths[i]!)).join(" | ") + " |";

    console.log(formatRow(headers));
    console.log("| " + colWidths.map((w) => "-".repeat(w)).join(" | ") + " |");
    allRows.forEach((row) => console.log(formatRow(row)));
    console.log();
  }
}

function formatOps(ops: number): string {
  if (ops >= 1_000_000) {
    return `${(ops / 1_000_000).toFixed(1)}M`;
  } else if (ops >= 1_000) {
    return `${(ops / 1_000).toFixed(1)}K`;
  }
  return `${ops.toFixed(0)}`;
}

async function benchmarkExample(example: string) {
  // Find all state files
  const exampleDir = `${examplesDir}/${example}`;
  const stateFiles = fs
    .readdirSync(exampleDir)
    .filter((f) => f.match(/^state\d+\.json$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0]!);
      const numB = parseInt(b.match(/\d+/)![0]!);
      return numA - numB;
    });

  // Read all state files
  const states = stateFiles.map((f) => JSON.parse(fs.readFileSync(`${exampleDir}/${f}`, "utf8")));

  // Benchmark each format
  const json = benchmarkJson(states);
  const msgpack = benchmarkMessagePack(states);
  const protobuf = benchmarkProtobuf(states, example);
  const deltaPack = await benchmarkDeltaPack(states, example);

  return {
    json,
    msgpack,
    protobuf,
    deltaPack,
  };
}

function measureOps(fn: () => void): number {
  // Warmup
  const warmupEnd = performance.now() + WARMUP_MS;
  while (performance.now() < warmupEnd) {
    fn();
  }

  // Benchmark
  let ops = 0;
  const benchmarkEnd = performance.now() + BENCHMARK_MS;
  while (performance.now() < benchmarkEnd) {
    fn();
    ops++;
  }

  return ops / (BENCHMARK_MS / 1000);
}

function benchmarkJson(states: any[]): number[] {
  return states.map((state) => measureOps(() => Buffer.from(JSON.stringify(state))));
}

function benchmarkMessagePack(states: any[]): number[] {
  return states.map((state) => measureOps(() => pack(state)));
}

function benchmarkProtobuf(states: any[], example: string): number[] {
  const protoPath = `${examplesDir}/${example}/schema.proto`;
  const root = new protobuf.Root().loadSync(protoPath, { keepCase: true });
  const MessageType = root.lookupType(example);

  return states.map((state) => {
    const message = MessageType.fromObject(state);
    return measureOps(() => MessageType.encode(message).finish());
  });
}

async function benchmarkDeltaPack(states: any[], example: string): Promise<number[]> {
  const schemaContent = fs.readFileSync(`${examplesDir}/${example}/schema.yml`, "utf8");
  const parsedSchema = deltapack.parseSchemaYml(schemaContent);
  const generated = deltapack.codegenTypescript(parsedSchema);

  // Write generated code to benchmark directory so it can resolve @hpx7/delta-pack/helpers
  const tempPath = `./generated-${example}.ts`;
  fs.writeFileSync(tempPath, generated);
  const module = await import(tempPath);
  const State = module[example];

  return states.map((state) => {
    const loaded = State.fromJson(state);
    return measureOps(() => State.encode(loaded));
  });
}

main();
