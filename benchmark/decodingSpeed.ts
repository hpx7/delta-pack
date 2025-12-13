import * as fs from "node:fs";
import * as msgpack from "msgpackr";
import * as protobuf from "./generated/protobuf/index.js";
import * as deltapack from "./generated/deltapack/index.js";
import { measureOps, formatOps } from "./utils.js";

const examplesDir = "../examples";

function main() {
  const examples = fs.readdirSync(examplesDir);

  console.log("## Decoding Speed Comparison (ops/s)\n");

  for (const example of examples) {
    const result = benchmarkExample(example);

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

function benchmarkExample(example: string) {
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
  const jsonResult = benchmarkJson(states);
  const msgpackResult = benchmarkMessagePack(states);
  const protobufResult = benchmarkProtobuf(states, example);
  const deltaPackResult = benchmarkDeltaPack(states, example);

  return {
    json: jsonResult,
    msgpack: msgpackResult,
    protobuf: protobufResult,
    deltaPack: deltaPackResult,
  };
}

function benchmarkJson(states: any[]): number[] {
  return states.map((state) => {
    const encoded = Buffer.from(JSON.stringify(state));
    return measureOps(() => JSON.parse(encoded.toString()));
  });
}

function benchmarkMessagePack(states: any[]): number[] {
  return states.map((state) => {
    const encoded = msgpack.pack(state);
    return measureOps(() => msgpack.unpack(encoded));
  });
}

function benchmarkProtobuf(states: any[], example: string): number[] {
  const MessageType = protobuf[example as keyof typeof protobuf] as {
    fromObject: (object: any) => any;
    encode: (message: any) => { finish: () => Uint8Array };
    decode: (data: Uint8Array) => any;
  };

  return states.map((state) => {
    const message = MessageType.fromObject(state);
    const encoded = MessageType.encode(message).finish();
    return measureOps(() => MessageType.decode(encoded));
  });
}

function benchmarkDeltaPack(states: any[], example: string): number[] {
  const State = deltapack[example as keyof typeof deltapack] as {
    fromJson: (json: any) => any;
    encode: (state: any) => Uint8Array;
    decode: (data: Uint8Array) => any;
  };

  return states.map((state) => {
    const loaded = State.fromJson(state);
    const encoded = State.encode(loaded);
    return measureOps(() => State.decode(encoded));
  });
}

main();
