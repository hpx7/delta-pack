# Delta-Pack

[![TypeScript CI](https://github.com/hpx7/delta-pack/actions/workflows/typescript-ci.yml/badge.svg)](https://github.com/hpx7/delta-pack/actions/workflows/typescript-ci.yml)
[![C# CI](https://github.com/hpx7/delta-pack/actions/workflows/csharp-ci.yml/badge.svg)](https://github.com/hpx7/delta-pack/actions/workflows/csharp-ci.yml)
[![Rust CI](https://github.com/hpx7/delta-pack/actions/workflows/rust-ci.yml/badge.svg)](https://github.com/hpx7/delta-pack/actions/workflows/rust-ci.yml)

[![npm](https://img.shields.io/npm/v/@hpx7/delta-pack)](https://www.npmjs.com/package/@hpx7/delta-pack)
[![NuGet](https://img.shields.io/nuget/v/DeltaPack)](https://www.nuget.org/packages/DeltaPack)
[![crates.io](https://img.shields.io/crates/v/delta-pack)](https://crates.io/crates/delta-pack)

Ultra-compact serialization format, designed to power state synchronization for multiplayer games, collaborative apps, and other real-time systems. Implementations available for [TypeScript](typescript/), [C#](csharp/), and [Rust](rust/).

## Overview

<!-- #region overview -->

State synchronization over a network involves repeatedly transmitting the same shape of state with small changes between frames. To optimize bandwidth, it's important to have an efficient encoding scheme for the wire format.

Delta-Pack achieves ultra-compact encodings by combining two core concepts:

- **Schema-driven binary encoding**, like [Protobuf](https://protobuf.dev/). Both client and server have a shared schema. They already know the field names, types, and structure, allowing the wire format to carry only values.
- **Structural delta encoding**, like [JSON Patch](https://jsonpatch.com/). Only changed data is serialized, with as few bits as possible.

The result is wire sizes that are smaller than Protobuf for snapshots, and oders of magnitude smaller than JSON Patch for diffs — see [Benchmarks](#benchmarks).

### Example

Define your data schema using the supported [data types](#data-types), either programmatically with [language-native APIs](#usage) or with YAML:

```yaml
# schema.yml
Team:
  - RED
  - BLUE
  - GREEN

Position:
  x: float(precision=0.1)
  y: float(precision=0.1)

Player:
  name: string
  position: Position
  health: uint
  team: Team?
```

Given two snapshots of a `Player`, where position and health have changed:

```jsonc
// state1.json — 71 bytes as compact JSON
{"name":"Alice","position":{"x":1.0,"y":3.5},"health":100,"team":"RED"}

// state2.json — x moved, health dropped
{"name":"Alice","position":{"x":2.3,"y":3.5},"health":82,"team":"RED"}
```

Delta-Pack compactly encodes snapshot and diff forms:

```bash
$ delta-pack encode schema.yml --type Player --input state1.json
# → 11 bytes (snapshot)

$ delta-pack encode-diff schema.yml --type Player --old state1.json --new state2.json
# → 5 bytes (diff)
```

<!-- #endregion overview -->

## Benchmarks

<!-- #region benchmarks -->

Benchmarks use the example schemas in [`examples/`](examples/). Each example contains:

- a delta-pack schema (`schema.yml`)
- a protobuf schema (`schema.proto`)
- an avro schema (`schema.avsc`)
- 2 or more data snapshots (`schema1.json`, ..., `schemaN.json`)

### Snapshot Encoding Size

[JSON](https://www.json.org/), [MessagePack](https://msgpack.org/), [Protobuf](https://protobuf.dev/), [Avro](https://avro.apache.org/), and Delta-Pack compared for snapshot encoding. Lower is better.

<img src="https://raw.githubusercontent.com/hpx7/delta-pack/main/benchmark/charts/full-encode.svg" alt="Snapshot encoding size comparison" />

### Delta Encoding Size

Delta-Pack diffs vs [JSON Patch (RFC 6902)](https://jsonpatch.com/) for delta encoding. Lower is better.

<img src="https://raw.githubusercontent.com/hpx7/delta-pack/main/benchmark/charts/delta-encode.svg" alt="Delta encoding size comparison" />

### Performance

Per-language encoding/decoding speed benchmarks:

- [TypeScript](typescript/benchmark/) (vs JSON, msgpackr, protobufjs)
- [C#](csharp/benchmarks/) (vs System.Text.Json, MessagePack-CSharp, Google.Protobuf)
- [Rust](rust/benchmarks/) (vs JSON, rmp-serde, prost)

<!-- #endregion benchmarks -->

## Data Types

<!-- #region data-types -->

Delta-Pack schemas are built from a fixed set of data types, each with a defined snapshot encoding, diff encoding, and parsing rules. Every type is available across all language implementations.

Types fall into three groups — **primitives**, **containers**, and **named types** — described below.

### Primitives

Primitives represent the basic scalar values:

| Type              | YAML Syntax             | JSON Example | Encode                                        | Diff                                           |
| ----------------- | ----------------------- | ------------ | --------------------------------------------- | ---------------------------------------------- |
| String            | `string`                | `"hello"`    | UTF-8 with per-message dictionary compression | New value (old value pre-loaded in dictionary) |
| Int               | `int`                   | `42`, `-7`   | ZigZag varint                                 | New value                                      |
| Int (bounded)     | `int(min=0, max=100)`   | `50`         | Bit-packed in `log₂(max − min + 1)` bits      | New value                                      |
| Uint              | `uint`                  | `42`         | Varint (shorthand for `int(min=0)`)           | New value                                      |
| Float             | `float`                 | `3.14`       | IEEE 754 32-bit                               | New value                                      |
| Float (quantized) | `float(precision=0.01)` | `3.14`       | `round(value / precision)` as ZigZag varint   | New value                                      |
| Boolean           | `boolean`               | `true`       | Single bit (RLE-compressed)                   | Change bit (decoder flips old value)           |

### Containers

Containers wrap other types:

| Type     | YAML Schema     | JSON Example        | Encode                               | Diff                                                                           |
| -------- | --------------- | ------------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| Array    | `int[]`         | `[1, 2, 3]`         | Length prefix + elements in sequence | New length + sparse updates (index + element diff) + appended elements         |
| Map      | `<string, int>` | `{"a": 1, "b": 2}`  | Length prefix + key-value pairs      | Positional deletions + positional updates (with value diffs) + keyed additions |
| Optional | `string?`       | `"value"` or `null` | Presence bit + value if present      | Was null: new value directly; was non-null: presence bit + value diff          |

### Named Types

Named types are the only types that can be directly encoded/decoded or used as the codegen `--type`:

| Type       | YAML Schema                                                                     | JSON Example                         | Encode                        | Diff                                                             |
| ---------- | ------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------- | ---------------------------------------------------------------- |
| Object     | `Position:`<br>&nbsp;&nbsp;`x: float`<br>&nbsp;&nbsp;`y: float`                 | `{"x": 1.5, "y": 2.0}`               | Fields in declaration order   | Change bit + per-field change bits with diffs                    |
| Enum       | `Team:`<br>&nbsp;&nbsp;`- RED`<br>&nbsp;&nbsp;`- BLUE`<br>&nbsp;&nbsp;`- GREEN` | `"RED"`                              | `log₂(variant count)` bits    | New value                                                        |
| Union      | `Contact:`<br>&nbsp;&nbsp;`- EmailContact`<br>&nbsp;&nbsp;`- PhoneContact`      | `{"EmailContact": {"email": "..."}}` | Variant bits + variant fields | Same type: per-field diffs; new type: variant bits + full encode |
| Type alias | `UserId: string`                                                                | `"abc123"`                           | Resolved to underlying type   | Resolved to underlying type                                      |

### Language bindings

How each schema type is represented in TypeScript, C#, and Rust:

| Schema type           | TypeScript                    | C#                                  | Rust                        |
| --------------------- | ----------------------------- | ----------------------------------- | --------------------------- |
| `string`              | `string`                      | `string`                            | `String`                    |
| `int`, `int(min,max)` | `number`                      | `long`                              | `i64`                       |
| `uint`                | `number`                      | `long`                              | `u64`                       |
| `float`, `float(p)`   | `number`                      | `float`                             | `f32`                       |
| `boolean`             | `boolean`                     | `bool`                              | `bool`                      |
| `T[]`                 | `T[]`                         | `List<T>`                           | `Vec<T>`                    |
| `T?`                  | `T \| undefined`              | `T?`                                | `Option<T>`                 |
| `<K, V>`              | `Map<K, V>`                   | `OrderedDict<K, V>`                 | `IndexMap<K, V>`            |
| Object                | `type` (structural)           | `class`                             | `struct`                    |
| Enum                  | string literal union          | `enum`                              | `enum`                      |
| Union                 | discriminated union (`_type`) | abstract class + variant subclasses | `enum` (tagged)             |
| Type alias            | resolved to underlying type   | resolved to underlying type         | resolved to underlying type |

### Binary layout

Every encoded message shares the same structure:

```
[data section][RLE bits][bit count (reverse varint)]
```

The **data section** holds whole-byte values (strings, varints, floats). The **RLE section** holds packed bits (booleans, enums, bounded integers, and change flags). The bit count at the end lets the decoder find the boundary.

Diff compactness comes from **change bits**: inside objects, unions, arrays, and maps, each field or element is preceded by a single bit in the RLE section. If it's `0`, nothing else is encoded for that field — the decoder keeps the old value.

<!-- #endregion data-types -->

## API

<!-- #region api -->

Every object and union type provides the following functions:

| Function                         | Description                                         |
| -------------------------------- | --------------------------------------------------- |
| `encode(obj) → bytes`            | Serialize to binary                                 |
| `decode(bytes) → obj`            | Deserialize from binary                             |
| `encodeDiff(prev, next) → bytes` | Delta-compress only the changes between two states  |
| `decodeDiff(prev, diff) → obj`   | Apply a delta to reconstruct the new state          |
| `equals(a, b) → bool`            | Deep equality comparison (respects float precision) |
| `clone(obj) → obj`               | Deep clone                                          |
| `fromJson(json) → obj`           | Parse from JSON with lenient type coercion          |
| `toJson(obj) → json`             | Convert to a JSON-serializable representation       |

### Typical flow

```
          encode              decode
 Server ────────→ [bytes] ────────→ Client
   T                                  T

          encodeDiff          decodeDiff
 Server ────────→ [bytes] ────────→ Client
 (prev,next)                     (prev,diff)
```

The server sends a full `encode` snapshot when a client first connects, then sends `encodeDiff` deltas for subsequent state changes. The client applies each delta to its local copy using `decodeDiff`.

<!-- #endregion api -->

## Usage

<!-- #region usage -->

Delta-Pack supports TypeScript, C#, and Rust. All three share the same schema format and binary encoding, so a TypeScript server can communicate with a Rust or C# client.

### Code generation (recommended)

Generate typed code from a YAML schema using the [CLI](#cli):

```bash
delta-pack generate schema.yml -l typescript -o generated.ts
delta-pack generate schema.yml -l csharp -o Generated.cs
delta-pack generate schema.yml -l rust -o generated.rs
```

### [TypeScript](typescript/)

Install:

```bash
npm install @hpx7/delta-pack
```

TypeScript supports codegen mode as well as a dynamic runtime mode.

**Codegen:**

```typescript
import { Position } from "./generated";

const prev: Position = Position.default();
const current: Position = { ...prev, x: 1.5 };

// Snapshot
const snapshotBytes = Position.encode(current);
const decoded = Position.decode(snapshotBytes);
Position.equals(decoded, current); // true

// Delta
const diffBytes = Position.encodeDiff(prev, current);
const patched = Position.decodeDiff(prev, diffBytes);
Position.equals(patched, current); // true
```

**Runtime** -- define schemas programmatically, no build step needed:

Schema definition:

```typescript
import { ObjectType, FloatType, load, Infer } from "@hpx7/delta-pack";

const Position = ObjectType("Position", {
  x: FloatType({ precision: 0.1 }),
  y: FloatType({ precision: 0.1 }),
});
type Position = Infer<typeof Position>;

const api = load(Position);
const bytes = api.encode({ x: 1.5, y: 2.0 });
```

Class definition:

```typescript
import { FloatType, loadClass } from "@hpx7/delta-pack";

class Position {
  @FloatType({ precision: 0.1 })
  x: number = 0;

  @FloatType({ precision: 0.1 })
  y: number = 0;
}

const api = loadClass(Position);
const bytes = api.encode(new Position());
```

### [C#](csharp/)

Install:

```bash
dotnet add package DeltaPack
```

The C# runtime is Unity-compatible, and supports both codegen and runtime modes.

**Codegen:**

```csharp
var prev = Position.Default();
var current = Position.Clone(prev);
current.X = 1.5f;

// Snapshot
byte[] snapshotBytes = Position.Encode(current);
Position decoded = Position.Decode(snapshotBytes);
Position.Equals(decoded, current); // true

// Delta
byte[] diffBytes = Position.EncodeDiff(prev, current);
Position patched = Position.DecodeDiff(prev, diffBytes);
Position.Equals(patched, current); // true
```

**Runtime** -- build schemas from C# classes:

```csharp
class Position {
    [DeltaPackPrecision(0.1)]
    public float X { get; set; }
    [DeltaPackPrecision(0.1)]
    public float Y { get; set; }
}

var api = new DeltaPackCodec<Position>();
byte[] bytes = api.Encode(new Position { X = 1.5f, Y = 2.0f });
```

### [Rust](rust/)

Install:

```bash
cargo add delta-pack
```

Rust supports both codegen mode and a `#[derive(DeltaPack)]` mode. Both expand through the same proc-macro and produce byte-identical output, so the choice is about workflow: derive mode needs no CLI install and no committed generated files, while codegen mode shares the schema with TypeScript or C# peers.

**Codegen:**

```rust
use delta_pack::DeltaPack;
use generated::Position;

let prev = Position::default();
let current = Position { x: 1.5, ..prev.clone() };

// Snapshot
let snapshot_bytes = current.encode();
let decoded = Position::decode(&snapshot_bytes);
current.equals(&decoded); // true

// Delta
let diff_bytes = Position::encode_diff(&prev, &current);
let patched = Position::decode_diff(&prev, &diff_bytes);
current.equals(&patched); // true
```

**Derive** -- define schemas as native Rust types, no build step needed:

```rust
use delta_pack::DeltaPack;

#[derive(Clone, Debug, DeltaPack)]
pub struct Position {
    #[delta_pack(precision = 0.1)]
    pub x: f32,
    #[delta_pack(precision = 0.1)]
    pub y: f32,
}

let bytes = Position { x: 1.5, y: 2.0 }.encode();
```

### [CLI](cli/)

The `delta-pack` CLI handles [code generation](#code-generation-recommended) and data conversion:

```bash
# Encode JSON to binary
delta-pack encode schema.yml -t Player -i state.json -o state.bin

# Decode binary to JSON
delta-pack decode schema.yml -t Player -i state.bin -o state.json

# Create a binary diff
delta-pack encode-diff schema.yml -t Player --old prev.json --new next.json -o diff.bin

# Apply a binary diff
delta-pack decode-diff schema.yml -t Player --old prev.json --diff diff.bin -o next.json
```

<!-- #endregion usage -->
