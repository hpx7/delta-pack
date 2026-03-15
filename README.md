# Delta-Pack

Schema-based binary serialization with built-in delta compression, designed for real-time state synchronization.

Delta-Pack combines the compact binary encoding of schema-based formats like [Protobuf](https://protobuf.dev/) with the incremental update capabilities of formats like [JSON Patch](https://jsonpatch.com/).

Define your data schema using the supported [data types](#data-types), either in YAML or programmatically with language-native APIs:

```yaml
# schema.yml
Position:
  x: float(precision=0.1)
  y: float(precision=0.1)

Player:
  name: string
  position: Position
  health: uint
  alive: boolean
```

Given two snapshots of a Player, where position and health have changed:

```jsonc
// state1.json
{
  "name": "Alice",
  "position": { "x": 1.0, "y": 3.5 },
  "health": 100,
  "alive": true
}

// state2.json
{
  "name": "Alice",
  "position": { "x": 2.3, "y": 3.5 },  // was 1.0
  "health": 82,                        // was 100
  "alive": true
}
```

Delta-pack can compactly encode the full snapshot as well as the diff:

```bash
$ delta-pack encode schema.yml -t Player -i state1.json
# → 11 bytes

$ delta-pack encode-diff schema.yml -t Player --old state1.json --new state2.json
# → 5 bytes
```

## Benchmarks

Encoding size comparisons using the example schemas in [`examples/`](examples/).

### Full Encoding

JSON, MessagePack, Protobuf, and Delta-Pack compared for full state snapshots.

<img src="https://raw.githubusercontent.com/hpx7/delta-pack/main/benchmark/charts/full-encode.svg" alt="Full encoding size comparison" />

### Delta Encoding

Delta-Pack diffs vs JSON Patch (RFC 6902) for incremental updates.

<img src="https://raw.githubusercontent.com/hpx7/delta-pack/main/benchmark/charts/delta-encode.svg" alt="Delta encoding size comparison" />

## API

Every object and union type provides the following functions:

| Function | Description |
| --- | --- |
| `encode(obj) → bytes` | Serialize to binary |
| `decode(bytes) → obj` | Deserialize from binary |
| `encodeDiff(prev, next) → bytes` | Delta-compress only the changes between two states |
| `decodeDiff(prev, diff) → obj` | Apply a delta to reconstruct the new state |
| `equals(a, b) → bool` | Deep equality comparison (respects float precision) |
| `clone(obj) → obj` | Deep clone |
| `fromJson(json) → obj` | Parse from JSON with lenient type coercion |
| `toJson(obj) → json` | Convert to a JSON-serializable representation |

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

| Type | YAML Schema | JSON Example | Encoding |
| --- | --- | --- | --- |
| String | `string` | `"hello"` | Dictionary-compressed UTF-8 |
| Int | `int` | `42`, `-7` | ZigZag varint |
| Int (bounded) | `int(min=0, max=100)` | `50` | Bit-packed (min bits for range) |
| Uint | `uint` | `42` | Varint (shorthand for `int` with min=0) |
| Float | `float` | `3.14` | IEEE 754 32-bit |
| Float (quantized) | `float(precision=0.01)` | `3.14` | Quantized to varint |
| Boolean | `boolean` | `true` | Single bit (RLE-compressed) |

### Containers

| Type | YAML Schema | JSON Example | Encoding |
| --- | --- | --- | --- |
| Array | `int[]` | `[1, 2, 3]` | Length prefix + elements |
| Optional | `string?` | `"value"` or `null` | Presence bit + value |
| Map | `<string, int>` | `{"a": 1, "b": 2}` | Length prefix + key-value pairs |

Map keys must be `string` or `int`.

### Named Types

| Type | YAML Schema | JSON Example | Encoding |
| --- | --- | --- | --- |
| Object | `Position:`<br>&nbsp;&nbsp;`x: float`<br>&nbsp;&nbsp;`y: float` | `{"x": 1.5, "y": 2.0}` | Sequential fields |
| Enum | `Team:`<br>&nbsp;&nbsp;`- RED`<br>&nbsp;&nbsp;`- BLUE`<br>&nbsp;&nbsp;`- GREEN` | `"RED"` | Minimum bits for variant count |
| Union | `Contact:`<br>&nbsp;&nbsp;`- EmailContact`<br>&nbsp;&nbsp;`- PhoneContact` | `{"_type": "EmailContact", "email": "..."}` | Variant index + variant data |
| Type alias | `UserId: string` | `"abc123"` | Resolved to underlying type |

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
import { GameState } from "./generated";

const state: GameState = GameState.default();
const bytes = GameState.encode(state);
const decoded = GameState.decode(bytes);
const diff = GameState.encodeDiff(prev, state);
const updated = GameState.decodeDiff(prev, diff);
```

### TypeScript

```bash
npm install @hpx7/delta-pack
```

In addition to codegen, TypeScript supports two runtime modes:

**Interpreter mode** -- parse schemas at runtime, no build step needed:

```typescript
import { load, parseSchemaYml } from "@hpx7/delta-pack";

const schema = parseSchemaYml(fs.readFileSync("schema.yml", "utf-8"));
const GameState = load(schema.GameState);

const encoded = GameState.encode(state);
const diff = GameState.encodeDiff(prev, state);
```

**Decorator mode** -- define schemas as TypeScript classes:

```typescript
import { loadClass, StringType, IntType, FloatType, ObjectType } from "@hpx7/delta-pack";

class Position {
  x = FloatType({ precision: 0.1 });
  y = FloatType({ precision: 0.1 });
}

const api = loadClass(Position);
const encoded = api.encode({ x: 1.5, y: 2.0 });
```

### C#

The C# runtime is Unity-compatible. Use codegen for production, or the reflection API for quick prototyping:

```csharp
var schema = Parser.ParseYml(File.ReadAllText("schema.yml"));
var api = Interpreter.Load<GameState>(schema["GameState"]);

byte[] bytes = api.Encode(state);
byte[] diff = api.EncodeDiff(prev, state);
```

### Rust

Rust uses codegen exclusively:

```rust
let bytes = GameState::encode(&state);
let decoded = GameState::decode(&bytes);
let diff = GameState::encode_diff(&prev, &state);
let updated = GameState::decode_diff(&prev, &diff);
```

### CLI

The `delta-pack` CLI handles [code generation](#code-generation-recommended) and data conversion:

```bash
# Encode JSON to binary
delta-pack encode schema.yml -t GameState -i state.json -o state.bin

# Decode binary to JSON
delta-pack decode schema.yml -t GameState -i state.bin -o state.json

# Create a binary diff
delta-pack encode-diff schema.yml -t GameState --old prev.json --new next.json -o diff.bin

# Apply a binary diff
delta-pack decode-diff schema.yml -t GameState --old prev.json --diff diff.bin -o next.json
```
