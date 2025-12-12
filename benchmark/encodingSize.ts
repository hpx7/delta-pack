import * as fs from "node:fs";
import assert from "assert";
import * as deltapack from "@hpx7/delta-pack";
import { pack, unpack } from "msgpackr";
import protobuf from "protobufjs";

const examplesDir = "../examples";

async function main() {
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
  const json = benchmarkJson(states);
  const msgpack = benchmarkMessagePack(states);
  const protobuf = benchmarkProtobuf(states, example);
  const deltaPack = benchmarkDeltaPack(states, example);

  return {
    json,
    msgpack,
    protobuf,
    deltaPack,
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
    const encoded = pack(state);
    const decoded = unpack(encoded);
    assert(deepEquals(decoded, state), `MessagePack state${i + 1} decode mismatch`);
    return encoded.length;
  });
}

function benchmarkProtobuf(states: any[], example: string): number[] {
  const protoPath = `${examplesDir}/${example}/schema.proto`;
  const root = new protobuf.Root().loadSync(protoPath, { keepCase: true });
  const MessageType = root.lookupType(example);

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
  const schemaContent = fs.readFileSync(`${examplesDir}/${example}/schema.yml`, "utf8");
  const parsedSchema = deltapack.parseSchemaYml(schemaContent);
  const State = deltapack.load(parsedSchema, example);

  return states.map((state, i) => {
    const encoded = State.encode(State.fromJson(state));

    const decoded = State.toJson(State.decode(encoded));
    assert(deepEquals(decoded, state), `Delta-pack state${i + 1} round-trip mismatch`);
    return encoded.length;
  });
}

// Deep equality comparison with float precision tolerance
function deepEquals(a: any, b: any, floatPrecision = 0.01): boolean {
  // Handle primitive types
  if (a === b) return true;

  // Handle null/undefined - treat null and undefined as equivalent
  if (a == null || b == null) return a == b;

  // Handle numbers (floats)
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) <= floatPrecision;
  }

  // Handle different types
  if (typeof a !== typeof b) return false;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => deepEquals(val, b[idx], floatPrecision));
  }

  // Handle Maps
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key)) return false;
      if (!deepEquals(val, b.get(key), floatPrecision)) return false;
    }
    return true;
  }

  // Handle objects
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    const allKeys = new Set([...keysA, ...keysB]);
    return [...allKeys].every((key) => deepEquals(a[key], b[key], floatPrecision));
  }

  return false;
}

main();
