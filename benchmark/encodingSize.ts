import * as fs from "node:fs";
import assert from "assert";
import * as msgpack from "msgpackr";
import * as protobuf from "./generated/protobuf/index.js";
import * as deltapack from "./generated/deltapack/index.js";
import { deepEquals } from "./utils.js";

const examplesDir = "../examples";

function main() {
  const examples = fs.readdirSync(examplesDir);

  console.log("## Encoding Size Comparison (bytes)\n");

  for (const example of examples) {
    const result = benchmarkExample(example);

    // Find smallest size for each state
    const minSizes = result.json.map((_, i) =>
      Math.min(result.json[i]!, result.msgpack[i]!, result.protobuf[i]!, result.deltaPack[i]!)
    );

    console.log(`### ${example}\n`);

    // Calculate column widths
    const allRows = [
      ["JSON", ...result.json.map((size, i) => `${size}B (${(size / minSizes[i]!).toFixed(1)}x)`)],
      ["MessagePack", ...result.msgpack.map((size, i) => `${size}B (${(size / minSizes[i]!).toFixed(1)}x)`)],
      ["Protobuf", ...result.protobuf.map((size, i) => `${size}B (${(size / minSizes[i]!).toFixed(1)}x)`)],
      ["Delta-Pack", ...result.deltaPack.map((size, i) => `${size}B (${(size / minSizes[i]!).toFixed(1)}x)`)],
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
  return states.map((state, i) => {
    const encoded = Buffer.from(JSON.stringify(state));
    const decoded = JSON.parse(encoded.toString());
    assert(deepEquals(decoded, state), `JSON state${i + 1} decode mismatch`);
    return encoded.length;
  });
}

function benchmarkMessagePack(states: any[]): number[] {
  return states.map((state, i) => {
    const encoded = msgpack.pack(state);
    const decoded = msgpack.unpack(encoded);
    assert(deepEquals(decoded, state), `MessagePack state${i + 1} decode mismatch`);
    return encoded.length;
  });
}

function benchmarkProtobuf(states: any[], example: string): number[] {
  const MessageType = protobuf[example as keyof typeof protobuf] as {
    fromObject: (object: any) => any;
    toObject: (message: any, options?: any) => any;
    encode: (message: any) => { finish: () => Uint8Array };
    decode: (data: Uint8Array) => any;
  };

  return states.map((state, i) => {
    const encoded = MessageType.encode(MessageType.fromObject(state)).finish();
    const decoded = MessageType.toObject(MessageType.decode(encoded), {
      defaults: true,
      enums: String,
      longs: Number,
    });
    assert(deepEquals(decoded, state), `Protobuf state${i + 1} round-trip mismatch`);
    return encoded.length;
  });
}

function benchmarkDeltaPack(states: any[], example: string): number[] {
  const State = deltapack[example as keyof typeof deltapack] as {
    fromJson: (json: any) => any;
    toJson: (state: any) => any;
    encode: (state: any) => Uint8Array;
    decode: (data: Uint8Array) => any;
  };

  return states.map((state, i) => {
    const encoded = State.encode(State.fromJson(state));
    const decoded = State.toJson(State.decode(encoded));
    assert(deepEquals(decoded, state), `Delta-pack state${i + 1} round-trip mismatch`);
    return encoded.length;
  });
}

main();
