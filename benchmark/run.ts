import * as fs from "node:fs";
import assert from "assert";
import * as msgpack from "msgpackr";
import type { DeltaPackApi } from "@hpx7/delta-pack";
import * as protobuf from "./generated/protobuf/index.js";
import * as deltapack from "./generated/deltapack/index.js";

const examplesDir = "../examples";

// Deep equality check with float tolerance
function deepEquals(a: unknown, b: unknown, tolerance = 0.01): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) < tolerance;
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key) || !deepEquals(val, b.get(key), tolerance)) return false;
    }
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEquals(val, b[i], tolerance));
  }
  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => deepEquals((a as any)[key], (b as any)[key], tolerance));
  }
  return false;
}

function main() {
  const examples = fs.readdirSync(examplesDir);

  // Section 1: Full Encoding Size Comparison
  console.log("## Full Encoding Size Comparison (bytes)\n");
  console.log("Lower is better. Multiplier shows size relative to smallest format.\n");

  for (const example of examples) {
    const result = benchmarkFullEncode(example);
    if (!result) continue;

    const minSizes = result.json.map((_, i) =>
      Math.min(result.json[i]!, result.msgpack[i]!, result.protobuf[i]!, result.deltaPack[i]!)
    );

    console.log(`### ${example}\n`);

    const allRows = [
      ["JSON", ...result.json.map((size, i) => `${size}B (${(size / minSizes[i]!).toFixed(1)}x)`)],
      ["MessagePack", ...result.msgpack.map((size, i) => `${size}B (${(size / minSizes[i]!).toFixed(1)}x)`)],
      ["Protobuf", ...result.protobuf.map((size, i) => `${size}B (${(size / minSizes[i]!).toFixed(1)}x)`)],
      ["Delta-Pack", ...result.deltaPack.map((size, i) => `${size}B (${(size / minSizes[i]!).toFixed(1)}x)`)],
    ];
    const headers = ["Format", ...result.json.map((_, i) => `State${i + 1}`)];

    printTable(headers, allRows);
    console.log();
  }

  // Section 2: Delta Encoding Size Comparison
  console.log("## Delta Encoding Size Comparison (bytes)\n");
  console.log("Compares delta-pack's `encodeDiff(prev, next)` vs re-encoding with other formats.\n");
  console.log("This demonstrates bandwidth savings for incremental state updates.\n");

  for (const example of examples) {
    const result = benchmarkDeltaEncode(example);
    if (!result || result.transitions.length === 0) continue;

    console.log(`### ${example}\n`);

    const headers = ["Transition", "JSON", "MessagePack", "Protobuf", "Delta-Pack Diff", "Savings"];
    const allRows = result.transitions.map((t) => {
      const minOther = Math.min(t.json, t.msgpack, t.protobuf);
      const savings = ((1 - t.deltaDiff / minOther) * 100).toFixed(0);
      return [t.name, `${t.json}B`, `${t.msgpack}B`, `${t.protobuf}B`, `${t.deltaDiff}B`, `${savings}%`];
    });

    printTable(headers, allRows);
    console.log();
  }
}

function printTable(headers: string[], rows: string[][]) {
  const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map((row) => row[i]!.length)));
  const formatRow = (cols: string[]) => "| " + cols.map((col, i) => col.padEnd(colWidths[i]!)).join(" | ") + " |";

  console.log(formatRow(headers));
  console.log("| " + colWidths.map((w) => "-".repeat(w)).join(" | ") + " |");
  rows.forEach((row) => console.log(formatRow(row)));
}

function benchmarkFullEncode(example: string) {
  const exampleDir = `${examplesDir}/${example}`;
  const stateFiles = fs
    .readdirSync(exampleDir)
    .filter((f) => f.match(/^state\d+\.json$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0]!);
      const numB = parseInt(b.match(/\d+/)![0]!);
      return numA - numB;
    });

  if (stateFiles.length === 0) return null;

  const states = stateFiles.map((f) => JSON.parse(fs.readFileSync(`${exampleDir}/${f}`, "utf8")));

  return {
    json: encodeJson(states),
    msgpack: encodeMsgpack(states),
    protobuf: encodeProtobuf(states, example),
    deltaPack: encodeDeltaPack(states, example),
  };
}

function benchmarkDeltaEncode(example: string) {
  const exampleDir = `${examplesDir}/${example}`;
  const stateFiles = fs
    .readdirSync(exampleDir)
    .filter((f) => f.match(/^state\d+\.json$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0]!);
      const numB = parseInt(b.match(/\d+/)![0]!);
      return numA - numB;
    });

  if (stateFiles.length < 2) return null;

  const states = stateFiles.map((f) => JSON.parse(fs.readFileSync(`${exampleDir}/${f}`, "utf8")));
  const transitions: { name: string; json: number; msgpack: number; protobuf: number; deltaDiff: number }[] = [];

  const State = deltapack[example as keyof typeof deltapack] as DeltaPackApi<unknown>;
  const MessageType = protobuf[example as keyof typeof protobuf] as unknown as {
    fromObject: (object: any) => any;
    encode: (message: any) => { finish: () => Uint8Array };
  };

  for (let i = 0; i < states.length - 1; i++) {
    const prev = states[i];
    const next = states[i + 1];

    // Other formats must send the full new state
    const jsonSize = Buffer.from(JSON.stringify(next)).length;
    const msgpackSize = msgpack.pack(next).length;
    const protobufSize = MessageType.encode(MessageType.fromObject(next)).finish().length;

    // Delta-pack can send just the diff
    const prevParsed = State.fromJson(prev);
    const nextParsed = State.fromJson(next);
    const diff = State.encodeDiff(prevParsed, nextParsed);

    // Verify round-trip
    const reconstructed = State.decodeDiff(prevParsed, diff);
    assert(
      deepEquals(State.toJson(reconstructed), next),
      `Delta round-trip failed for ${example} state${i + 1}→${i + 2}`
    );

    transitions.push({
      name: `State${i + 1}→${i + 2}`,
      json: jsonSize,
      msgpack: msgpackSize,
      protobuf: protobufSize,
      deltaDiff: diff.length,
    });
  }

  return { transitions };
}

function encodeJson(states: any[]): number[] {
  return states.map((state, i) => {
    const encoded = Buffer.from(JSON.stringify(state));
    const decoded = JSON.parse(encoded.toString());
    assert(deepEquals(decoded, state), `JSON state${i + 1} decode mismatch`);
    return encoded.length;
  });
}

function encodeMsgpack(states: any[]): number[] {
  return states.map((state, i) => {
    const encoded = msgpack.pack(state);
    const decoded = msgpack.unpack(encoded);
    assert(deepEquals(decoded, state), `MessagePack state${i + 1} decode mismatch`);
    return encoded.length;
  });
}

function encodeProtobuf(states: any[], example: string): number[] {
  const MessageType = protobuf[example as keyof typeof protobuf] as unknown as {
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

function encodeDeltaPack(states: any[], example: string): number[] {
  const State = deltapack[example as keyof typeof deltapack] as DeltaPackApi<unknown>;

  return states.map((state, i) => {
    const encoded = State.encode(State.fromJson(state));
    const decoded = State.toJson(State.decode(encoded));
    assert(deepEquals(decoded, state), `Delta-pack state${i + 1} round-trip mismatch`);
    return encoded.length;
  });
}

main();
