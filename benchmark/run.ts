import * as fs from "node:fs";
import assert from "assert";
import * as msgpack from "msgpackr";
import * as rfc6902 from "rfc6902";
import { load, parseSchemaYml, type DeltaPackApi } from "@hpx7/delta-pack";
import protobuf from "protobufjs";

const examplesDir = "../examples";

// Cache for loaded schemas
const deltaPackCache = new Map<string, DeltaPackApi<any>>();
const protobufCache = new Map<string, protobuf.Type>();

function getDeltaPackApi(example: string): DeltaPackApi<any> {
  if (!deltaPackCache.has(example)) {
    const schemaPath = `${examplesDir}/${example}/schema.yml`;
    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    const schema = parseSchemaYml(schemaContent);
    deltaPackCache.set(example, load(schema[example]!));
  }
  return deltaPackCache.get(example)!;
}

function getProtobufType(example: string): protobuf.Type {
  if (!protobufCache.has(example)) {
    const protoPath = `${examplesDir}/${example}/schema.proto`;
    const root = protobuf.loadSync(protoPath);
    protobufCache.set(example, root.lookupType(example));
  }
  return protobufCache.get(example)!;
}

// Deep equality check with float tolerance
function deepEquals(a: unknown, b: unknown, tolerance = 0.1): boolean {
  if (a === b) return true;
  // Treat null and undefined as equal
  if ((a === null || a === undefined) && (b === null || b === undefined)) return true;
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
    // Use union of keys
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...allKeys].every((key) => deepEquals((a as any)[key], (b as any)[key], tolerance));
  }
  return false;
}

function main() {
  const examples = fs
    .readdirSync(examplesDir, { withFileTypes: true })
    .filter((f) => f.isDirectory())
    .map((f) => f.name);

  // Section 1: Full Encoding Size Comparison
  console.log("## Full Encoding Size Comparison (bytes)\n");
  console.log("Lower is better. Multiplier shows size relative to smallest format.\n");

  const fullGroups: ChartGroup[] = [];

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

    for (let i = 0; i < result.json.length; i++) {
      fullGroups.push({
        label: `${example} State${i + 1}`,
        bars: [
          { label: "JSON", value: result.json[i]!, color: COLORS.json },
          { label: "MessagePack", value: result.msgpack[i]!, color: COLORS.msgpack },
          { label: "Protobuf", value: result.protobuf[i]!, color: COLORS.protobuf },
          { label: "Delta-Pack", value: result.deltaPack[i]!, color: COLORS.deltaPack },
        ],
      });
    }
  }

  // Section 2: Delta Encoding Size Comparison
  console.log("## Delta Encoding Size Comparison (bytes)\n");
  console.log("Compares delta-pack diffs against JSON Patch (RFC 6902) for incremental updates.\n");

  const deltaGroups: ChartGroup[] = [];

  for (const example of examples) {
    const result = benchmarkDeltaEncode(example);
    if (!result || result.transitions.length === 0) continue;

    console.log(`### ${example}\n`);

    const headers = ["Transition", "JSON (full)", "JSON Patch", "Delta-Pack Full", "Delta-Pack Diff", "vs JSON Patch"];
    const allRows = result.transitions.map((t) => {
      const savings = ((1 - t.deltaDiff / t.jsonPatch) * 100).toFixed(0);
      return [t.name, `${t.json}B`, `${t.jsonPatch}B`, `${t.deltaFull}B`, `${t.deltaDiff}B`, `${savings}%`];
    });

    printTable(headers, allRows);
    console.log();

    for (const t of result.transitions) {
      deltaGroups.push({
        label: `${example} ${t.name}`,
        bars: [
          { label: "JSON (full)", value: t.json, color: COLORS.json },
          { label: "JSON Patch", value: t.jsonPatch, color: COLORS.jsonPatch },
          { label: "Delta-Pack Full", value: t.deltaFull, color: COLORS.protobuf },
          { label: "Delta-Pack Diff", value: t.deltaDiff, color: COLORS.deltaPack },
        ],
      });
    }
  }

  // Generate SVG charts
  fs.mkdirSync("charts", { recursive: true });
  fs.writeFileSync("charts/full-encode.svg", generateBarChartSvg("Full Encoding Size (bytes)", fullGroups));
  fs.writeFileSync("charts/delta-encode.svg", generateBarChartSvg("Delta Encoding Size (bytes)", deltaGroups));
  console.log("Charts written to charts/full-encode.svg and charts/delta-encode.svg");
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
  const transitions: {
    name: string;
    json: number;
    jsonPatch: number;
    deltaFull: number;
    deltaDiff: number;
  }[] = [];

  const State = getDeltaPackApi(example);

  for (let i = 0; i < states.length - 1; i++) {
    const prev = states[i];
    const next = states[i + 1];

    // JSON full re-send (naive baseline)
    const jsonSize = Buffer.from(JSON.stringify(next)).length;

    // JSON Patch (RFC 6902)
    const patch = rfc6902.createPatch(prev, next);
    const jsonPatchSize = Buffer.from(JSON.stringify(patch)).length;

    // Verify JSON Patch round-trip
    const patched = structuredClone(prev);
    rfc6902.applyPatch(patched, patch);
    assert(deepEquals(patched, next), `JSON Patch round-trip failed for ${example} state${i + 1}→${i + 2}`);

    // Delta-pack
    const prevParsed = State.fromJson(prev);
    const nextParsed = State.fromJson(next);
    const fullEncode = State.encode(nextParsed);
    const diff = State.encodeDiff(prevParsed, nextParsed);

    // Verify delta-pack round-trip
    const reconstructed = State.decodeDiff(prevParsed, diff);
    assert(
      deepEquals(State.toJson(reconstructed), next),
      `Delta round-trip failed for ${example} state${i + 1}→${i + 2}`
    );

    transitions.push({
      name: `State${i + 1}→${i + 2}`,
      json: jsonSize,
      jsonPatch: jsonPatchSize,
      deltaFull: fullEncode.length,
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
  const MessageType = getProtobufType(example);

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
  const State = getDeltaPackApi(example);

  return states.map((state, i) => {
    const encoded = State.encode(State.fromJson(state));
    const decoded = State.toJson(State.decode(encoded));
    assert(deepEquals(decoded, state), `Delta-pack state${i + 1} round-trip mismatch`);
    return encoded.length;
  });
}

const COLORS = {
  json: "#f59e0b",
  msgpack: "#8b5cf6",
  protobuf: "#3b82f6",
  deltaPack: "#10b981",
  jsonPatch: "#ef4444",
};

interface ChartGroup {
  label: string;
  bars: { label: string; value: number; color: string }[];
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateBarChartSvg(title: string, groups: ChartGroup[]): string {
  const width = 680;
  const labelWidth = 130;
  const valueWidth = 70;
  const barAreaWidth = width - labelWidth - valueWidth - 24;
  const barHeight = 20;
  const barGap = 4;
  const groupHeaderHeight = 24;
  const groupGap = 16;
  const titleHeight = 40;
  const bottomPadding = 12;

  let height = titleHeight;
  for (const group of groups) {
    height += groupHeaderHeight;
    height += group.bars.length * (barHeight + barGap) - barGap;
    height += groupGap;
  }
  height += bottomPadding;

  const lines: string[] = [];
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
  );
  lines.push(`  <style>`);
  lines.push(`    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }`);
  lines.push(`  </style>`);
  lines.push(`  <rect width="${width}" height="${height}" fill="white" rx="8"/>`);

  // Title
  lines.push(
    `  <text x="${width / 2}" y="28" text-anchor="middle" font-size="15" font-weight="bold" fill="#111827">${escapeXml(title)}</text>`
  );

  let y = titleHeight;

  for (const group of groups) {
    // Group label
    lines.push(
      `  <text x="12" y="${y + 16}" font-size="13" font-weight="600" fill="#374151">${escapeXml(group.label)}</text>`
    );
    y += groupHeaderHeight;

    const maxValue = Math.max(...group.bars.map((b) => b.value));

    for (const bar of group.bars) {
      const barW = maxValue > 0 ? (bar.value / maxValue) * barAreaWidth : 0;

      // Bar label
      lines.push(
        `  <text x="${labelWidth - 4}" y="${y + 14}" text-anchor="end" font-size="11" fill="#6b7280">${escapeXml(bar.label)}</text>`
      );

      // Bar
      lines.push(
        `  <rect x="${labelWidth}" y="${y}" width="${Math.max(barW, 2)}" height="${barHeight}" fill="${bar.color}" rx="3"/>`
      );

      // Value label
      lines.push(
        `  <text x="${labelWidth + barW + 6}" y="${y + 14}" font-size="11" fill="#374151" font-weight="500">${bar.value}B</text>`
      );

      y += barHeight + barGap;
    }
    y += groupGap - barGap;
  }

  lines.push(`</svg>`);
  return lines.join("\n");
}

main();
