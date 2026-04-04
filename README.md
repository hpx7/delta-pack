# Delta-Pack

[![TypeScript CI](https://github.com/hpx7/delta-pack/actions/workflows/typescript-ci.yml/badge.svg)](https://github.com/hpx7/delta-pack/actions/workflows/typescript-ci.yml)
[![C# CI](https://github.com/hpx7/delta-pack/actions/workflows/csharp-ci.yml/badge.svg)](https://github.com/hpx7/delta-pack/actions/workflows/csharp-ci.yml)
[![Rust CI](https://github.com/hpx7/delta-pack/actions/workflows/rust-ci.yml/badge.svg)](https://github.com/hpx7/delta-pack/actions/workflows/rust-ci.yml)

[![npm](https://img.shields.io/npm/v/@hpx7/delta-pack)](https://www.npmjs.com/package/@hpx7/delta-pack)
[![NuGet](https://img.shields.io/nuget/v/DeltaPack)](https://www.nuget.org/packages/DeltaPack)
[![crates.io](https://img.shields.io/crates/v/delta-pack)](https://crates.io/crates/delta-pack)

Ultra-compact serialization format, designed to power state synchronization for multiplayer games, collaborative apps, and real-time systems. Supports TypeScript, C#, and Rust.

Delta-Pack combines the schema-based binary encoding of [Protobuf](https://protobuf.dev/) with the delta encoding of [JSON Patch](https://jsonpatch.com/) — define a schema once, then efficiently encode full snapshots and diffs across languages.

Define your data schema using the supported [data types](#data-types), either in YAML or programmatically with [language-native APIs](#usage):

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

Given two snapshots of a Player, where position and health have changed:

```jsonc
// state1.json
{
  "name": "Alice",
  "position": { "x": 1.0, "y": 3.5 },
  "health": 100,
  "team": "RED"
}

// state2.json
{
  "name": "Alice",
  "position": { "x": 2.3, "y": 3.5 },  // was 1.0
  "health": 82,                        // was 100
  "team": "RED"
}
```

Delta-Pack can compactly encode the full snapshot as well as the diff:

```bash
$ delta-pack encode schema.yml --type Player --input state1.json
# → 11 bytes

$ delta-pack encode-diff schema.yml --type Player --old state1.json --new state2.json
# → 5 bytes
```

## Benchmarks

Encoding size comparisons using the example schemas in [`examples/`](examples/).

### Snapshot Encoding

JSON, MessagePack, Protobuf, and Delta-Pack compared for snapshot encoding. Lower is better.

<img src="https://raw.githubusercontent.com/hpx7/delta-pack/main/benchmark/charts/full-encode.svg" alt="Snapshot encoding size comparison" />

### Delta Encoding

Delta-Pack diffs vs JSON Patch (RFC 6902) for delta encoding. Lower is better.

<img src="https://raw.githubusercontent.com/hpx7/delta-pack/main/benchmark/charts/delta-encode.svg" alt="Delta encoding size comparison" />

### Performance

Per-language encoding/decoding speed benchmarks:

- [TypeScript](typescript/benchmark/) (vs JSON, MessagePack, Protobuf)
- [C#](csharp/benchmarks/) (vs System.Text.Json, MessagePack-CSharp)
- [Rust](rust/benchmarks/) (vs JSON, MessagePack)

## API

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

## Data Types

All types are available across TypeScript, C#, and Rust. The examples below use the YAML schema syntax.

### Primitives

| Type              | YAML Schema             | JSON Example | Encoding                                |
| ----------------- | ----------------------- | ------------ | --------------------------------------- |
| String            | `string`                | `"hello"`    | Dictionary-compressed UTF-8             |
| Int               | `int`                   | `42`, `-7`   | ZigZag varint                           |
| Int (bounded)     | `int(min=0, max=100)`   | `50`         | Bit-packed (min bits for range)         |
| Uint              | `uint`                  | `42`         | Varint (shorthand for `int` with min=0) |
| Float             | `float`                 | `3.14`       | IEEE 754 32-bit                         |
| Float (quantized) | `float(precision=0.01)` | `3.14`       | Quantized to varint                     |
| Boolean           | `boolean`               | `true`       | Single bit (RLE-compressed)             |

### Containers

| Type     | YAML Schema     | JSON Example        | Encoding                        |
| -------- | --------------- | ------------------- | ------------------------------- |
| Array    | `int[]`         | `[1, 2, 3]`         | Length prefix + elements        |
| Optional | `string?`       | `"value"` or `null` | Presence bit + value            |
| Map      | `<string, int>` | `{"a": 1, "b": 2}`  | Length prefix + key-value pairs |

Map keys must be `string` or `int`.

### Named Types

| Type       | YAML Schema                                                                     | JSON Example                         | Encoding                       |
| ---------- | ------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| Object     | `Position:`<br>&nbsp;&nbsp;`x: float`<br>&nbsp;&nbsp;`y: float`                 | `{"x": 1.5, "y": 2.0}`               | Sequential fields              |
| Enum       | `Team:`<br>&nbsp;&nbsp;`- RED`<br>&nbsp;&nbsp;`- BLUE`<br>&nbsp;&nbsp;`- GREEN` | `"RED"`                              | Minimum bits for variant count |
| Union      | `Contact:`<br>&nbsp;&nbsp;`- EmailContact`<br>&nbsp;&nbsp;`- PhoneContact`      | `{"EmailContact": {"email": "..."}}` | Variant index + variant data   |
| Type alias | `UserId: string`                                                                | `"abc123"`                           | Resolved to underlying type    |

## Usage

Delta-Pack supports TypeScript, C#, and Rust. All three share the same schema format and binary encoding, so a TypeScript server can communicate with a Rust or C# client.

### Code generation (recommended)

Generate typed code from a YAML schema using the [CLI](#cli):

```bash
delta-pack generate schema.yml -l typescript -o generated.ts
delta-pack generate schema.yml -l csharp -o Generated.cs
delta-pack generate schema.yml -l rust -o generated.rs
```

Generated code provides a namespace per type with all API functions and full type safety:

```typescript
import { Player } from "./generated";

const prev: Player = Player.default();
const current: Player = { ...prev, health: 82 };

// Snapshot
const snapshotBytes = Player.encode(current);
const decoded = Player.decode(snapshotBytes);
Player.equals(decoded, current); // true

// Delta
const diffBytes = Player.encodeDiff(prev, current);
const patched = Player.decodeDiff(prev, diffBytes);
Player.equals(patched, current); // true
```

### TypeScript

```bash
npm install @hpx7/delta-pack
```

In addition to codegen, TypeScript supports two runtime modes:

**Interpreter mode** -- parse schemas at runtime, no build step needed:

```typescript
import fs from "node:fs";
import { load, parseSchemaYml } from "@hpx7/delta-pack";

const schema = parseSchemaYml(fs.readFileSync("schema.yml", "utf-8"));

const api = load(schema["Position"]);
const bytes = api.encode({ x: 1.5, y: 2.0 });
```

**Decorator mode** -- define schemas as TypeScript classes:

```typescript
import { loadClass, FloatType } from "@hpx7/delta-pack";

class Position {
  @FloatType({ precision: 0.1 })
  x: number;

  @FloatType({ precision: 0.1 })
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

const api = loadClass(Position);
const bytes = api.encode(new Position(1.5, 2.0));
```

### C#

```bash
dotnet add package DeltaPack
```

The C# runtime is Unity-compatible. In addition to codegen, C# supports two runtime modes:

**Reflection mode** -- build schemas from C# classes:

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

**Interpreter mode** -- parse schemas at runtime:

```csharp
class Position {
    public float X { get; set; }
    public float Y { get; set; }
}

var schema = Parser.ParseYml(File.ReadAllText("schema.yml"));

var api = Interpreter.Load<Position>(schema["Position"]);
byte[] bytes = api.Encode(new Position { X = 1.5f, Y = 2.0f });
```

### Rust

```bash
cargo add delta-pack
```

Rust uses codegen exclusively:

```rust
use generated::Position;

let pos = Position { x: 1.5, y: 2.0 };
let bytes = pos.encode();
```

### CLI

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
