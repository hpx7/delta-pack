import * as fs from "node:fs";
import assert from "assert";
import * as deltapack from "@hpx7/delta-pack";
import msgpack from "@msgpack/msgpack";
import protobuf from "protobufjs";

const examplesDir = "../examples";

async function main() {
  const examples = fs.readdirSync(examplesDir);

  console.log("Encoding Size Comparison (bytes)\n");

  for (const example of examples) {
    const result = benchmarkExample(example);

    // Find smallest size for each state
    const minState1 = Math.min(
      result.json.state1,
      result.msgpack.state1,
      result.protobuf.state1,
      result.deltaPack.state1,
    );
    const minState2 = Math.min(
      result.json.state2,
      result.msgpack.state2,
      result.protobuf.state2,
      result.deltaPack.state2,
    );

    console.log(`${example}:`);
    console.log("Format".padEnd(15), "State1".padStart(16), "State2".padStart(16));
    console.log("=".repeat(50));
    console.log(
      "JSON".padEnd(15),
      `${result.json.state1}B (${(result.json.state1 / minState1).toFixed(1)}x)`.padStart(16),
      `${result.json.state2}B (${(result.json.state2 / minState2).toFixed(1)}x)`.padStart(16),
    );
    console.log(
      "MessagePack".padEnd(15),
      `${result.msgpack.state1}B (${(result.msgpack.state1 / minState1).toFixed(1)}x)`.padStart(16),
      `${result.msgpack.state2}B (${(result.msgpack.state2 / minState2).toFixed(1)}x)`.padStart(16),
    );
    console.log(
      "Protobuf".padEnd(15),
      `${result.protobuf.state1}B (${(result.protobuf.state1 / minState1).toFixed(1)}x)`.padStart(16),
      `${result.protobuf.state2}B (${(result.protobuf.state2 / minState2).toFixed(1)}x)`.padStart(16),
    );
    console.log(
      "Delta-Pack".padEnd(15),
      `${result.deltaPack.state1}B (${(result.deltaPack.state1 / minState1).toFixed(1)}x)`.padStart(16),
      `${result.deltaPack.state2}B (${(result.deltaPack.state2 / minState2).toFixed(1)}x)`.padStart(16),
    );
    console.log();
  }
}

function benchmarkExample(example: string) {
  // Read state files
  const state1Content = fs.readFileSync(`${examplesDir}/${example}/state1.json`, "utf8");
  const state2Content = fs.readFileSync(`${examplesDir}/${example}/state2.json`, "utf8");
  const state1Json = JSON.parse(state1Content);
  const state2Json = JSON.parse(state2Content);

  // Benchmark each format
  const json = benchmarkJson(state1Json, state2Json);
  const msgpack = benchmarkMessagePack(state1Json, state2Json);
  const protobuf = benchmarkProtobuf(state1Json, state2Json, example);
  const deltaPack = benchmarkDeltaPack(state1Json, state2Json, example);

  return {
    json,
    msgpack,
    protobuf,
    deltaPack,
  };
}

function benchmarkJson(state1: any, state2: any) {
  // Parse and encode states
  const encoded1 = Buffer.from(JSON.stringify(state1));
  const encoded2 = Buffer.from(JSON.stringify(state2));

  // Verify encoding by decoding and comparing
  const decoded1 = JSON.parse(encoded1.toString());
  const decoded2 = JSON.parse(encoded2.toString());
  assert(deepEquals(decoded1, state1), "JSON state1 decode mismatch");
  assert(deepEquals(decoded2, state2), "JSON state2 decode mismatch");

  return {
    state1: encoded1.length,
    state2: encoded2.length,
  };
}

function benchmarkMessagePack(state1: any, state2: any) {
  // Parse and encode states
  const encoded1 = msgpack.encode(state1);
  const encoded2 = msgpack.encode(state2);

  // Verify encoding by decoding and comparing
  const decoded1 = msgpack.decode(encoded1);
  const decoded2 = msgpack.decode(encoded2);
  assert(deepEquals(decoded1, state1), "MessagePack state1 decode mismatch");
  assert(deepEquals(decoded2, state2), "MessagePack state2 decode mismatch");

  return {
    state1: encoded1.length,
    state2: encoded2.length,
  };
}

function benchmarkProtobuf(state1: any, state2: any, example: string) {
  // Load protobuf schema
  const protoPath = `${examplesDir}/${example}/schema.proto`;
  const root = new protobuf.Root().loadSync(protoPath, { keepCase: true });
  const MessageType = root.lookupType(example);

  // Parse and encode states
  const encoded1 = MessageType.encode(MessageType.fromObject(state1)).finish();
  const encoded2 = MessageType.encode(MessageType.fromObject(state2)).finish();

  // Verify encoding by decoding and comparing
  const decoded1 = MessageType.toObject(MessageType.decode(encoded1), { enums: String, defaults: true });
  const decoded2 = MessageType.toObject(MessageType.decode(encoded2), { enums: String, defaults: true });
  assert(deepEquals(decoded1, state1), "Protobuf state1 round-trip mismatch");
  assert(deepEquals(decoded2, state2), "Protobuf state2 round-trip mismatch");

  return {
    state1: encoded1.length,
    state2: encoded2.length,
  };
}

function benchmarkDeltaPack(state1: any, state2: any, example: string) {
  // Load YAML schema
  const schemaContent = fs.readFileSync(`${examplesDir}/${example}/schema.yml`, "utf8");
  const parsedSchema = deltapack.parseSchemaYml(schemaContent);
  const State = deltapack.load(parsedSchema, example);

  // Parse and encode states
  const encoded1 = State.encode(State.fromJson(state1));
  const encoded2 = State.encode(State.fromJson(state2));

  // Verify encoding by decoding and comparing
  const decoded1 = State.toJson(State.decode(encoded1));
  const decoded2 = State.toJson(State.decode(encoded2));
  assert(deepEquals(decoded1, state1), "Delta-Pack state1 round-trip mismatch");
  assert(deepEquals(decoded2, state2), "Delta-Pack state2 round-trip mismatch");

  return {
    state1: encoded1.length,
    state2: encoded2.length,
  };
}

// Deep equality comparison with float precision tolerance
function deepEquals(a: any, b: any, floatPrecision = 0.01): boolean {
  // Handle primitive types
  if (a === b) return true;

  // Handle null/undefined
  if (a == null || b == null) return a === b;

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

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => deepEquals(a[key], b[key], floatPrecision));
  }

  return false;
}

main();
