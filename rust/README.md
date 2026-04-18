# delta-pack

Binary serialization with delta compression for real-time state synchronization.

Delta-Pack is a cross-language serialization framework optimized for networked applications where you need to efficiently synchronize state between clients and servers. It provides both full encoding and delta encoding (only transmitting what changed).

## Features

- **Compact binary format** - Smaller than JSON, MessagePack, and often Protobuf
- **Delta compression** - Encode only the differences between two states
- **Cross-language** - Compatible with TypeScript and C# implementations
- **Zero-copy strings** - String dictionary deduplication within each message
- **Serde integration** - Types work with `Serialize`/`Deserialize` for JSON interop

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
delta-pack = "0.1"
```

## Usage

There are two ways to define a schema: as a `#[derive(DeltaPack)]` on native Rust types, or as a YAML file fed through the `delta-pack` CLI. Both paths expand through the same proc-macro and emit byte-identical output, so pick whichever fits your workflow.

- **Derive mode** — schema lives in Rust, no build step, no committed generated files. Recommended for Rust-only projects.
- **Codegen mode** — schema lives in YAML, shared across Rust / TypeScript / C#. Required when the same schema drives multiple languages.

### Derive mode

Annotate a native Rust type with `#[derive(DeltaPack)]`:

```rust,ignore
use delta_pack::{DeltaPack, IndexMap};
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, DeltaPack)]
pub enum HairColor {
    BLACK,
    BROWN,
    BLOND,
    RED,
}

#[derive(Clone, Debug, Serialize, Deserialize, DeltaPack)]
pub struct Address {
    pub street: String,
    pub city: String,
    pub zip: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, DeltaPack)]
pub struct User {
    pub id: String,
    pub name: String,
    pub age: u64,
    #[delta_pack(precision = 0.01)]
    pub weight: f32,
    #[serde(rename = "hairColor")]
    pub hair_color: HairColor,
    pub address: Option<Address>,
    pub tags: Vec<String>,
    pub metadata: IndexMap<String, String>,
}
```

Field names are snake_case in Rust and camelCase in the schema — the derive reverses one to the other automatically. Use `#[serde(rename = "…")]` to keep the camelCase shape in JSON when you also want serde interop.

### Codegen mode

Define the schema in YAML:

```yaml
# schema.yml
HairColor:
  - BLACK
  - BROWN
  - BLOND
  - RED

Address:
  street: string
  city: string
  zip: string

User:
  id: string
  name: string
  age: uint
  weight: float(precision=0.01)
  hairColor: HairColor
  address: Address?
  tags: string[]
  metadata: <string, string>
```

Then generate Rust:

```bash
delta-pack generate schema.yml -l rust > src/generated.rs
```

The CLI emits struct and enum skeletons with `#[derive(DeltaPack)]` — not hand-rolled impls — so everything below applies identically to both modes.

### Encode / decode / diff

```rust,ignore
use delta_pack::DeltaPack;  // trait must be in scope

let user1 = User { /* ... */ };

// Full encode / decode
let bytes = user1.encode();
let decoded = User::decode(&bytes);
assert!(user1.equals(&decoded));

// Delta encoding — only send what changed
let user2 = User { age: 31, ..user1.clone() };
let diff = User::encode_diff(&user1, &user2);
let reconstructed = User::decode_diff(&user1, &diff);
assert!(user2.equals(&reconstructed));
```

### Attributes

`#[delta_pack(...)]` on a field accepts:

| Attribute                       | Target         | Effect                                                         |
| ------------------------------- | -------------- | -------------------------------------------------------------- |
| `range(min = N, max = M)`       | integer field  | bit-packs into `ceil(log2(M-N+1))` bits when `≤ 8` bits        |
| `range(min = N)` / `range(max = M)` | integer field | sets one bound only                                        |
| `precision = X`                 | `f32` field    | quantizes to multiples of `X`, encoded as a bit-packed integer |

## API

Every type implementing `DeltaPack` provides:

| Method                                       | Description                                 |
| -------------------------------------------- | ------------------------------------------- |
| `encode(&self) -> Vec<u8>`                   | Serialize to binary                         |
| `decode(buf: &[u8]) -> Self`                 | Deserialize from binary                     |
| `encode_diff(a: &Self, b: &Self) -> Vec<u8>` | Encode only the differences from `a` to `b` |
| `decode_diff(a: &Self, diff: &[u8]) -> Self` | Apply a diff to `a` to produce `b`          |
| `equals(&self, other: &Self) -> bool`        | Deep equality (respects float precision)    |

Types also get a derived `impl Default`. The user is responsible for `Clone`, `Debug`, `Serialize`, `Deserialize` (CLI-generated code derives them; derive-mode users add whichever they need).

## Schema Types

### Primitives

| Schema                  | Rust Type | Notes                        |
| ----------------------- | --------- | ---------------------------- |
| `string`                | `String`  | UTF-8, dictionary-compressed |
| `int`                   | `i64`     | Signed, varint-encoded       |
| `uint`                  | `u64`     | Unsigned, varint-encoded     |
| `int(min=0, max=100)`   | `u64`     | Bounded, more compact        |
| `float`                 | `f32`     | 32-bit IEEE 754              |
| `float(precision=0.01)` | `f32`     | Quantized for smaller diffs  |
| `boolean`               | `bool`    | 1 bit, RLE-compressed        |

### Containers

| Schema   | Rust Type       |
| -------- | --------------- |
| `T[]`    | `Vec<T>`        |
| `T?`     | `Option<T>`     |
| `<K, V>` | `IndexMap<K, V>` |

### Named Types

```yaml
# Enum (list of strings)
Direction:
  - up
  - down
  - left
  - right

# Object (key-value properties)
Player:
  name: string
  score: uint
  position: Position

# Union (list of type references)
Message:
  - ChatMessage
  - MoveMessage
  - AttackMessage
```

### Self-References

Recursive types are supported. In YAML they're implicit; in derive mode wrap the inner type in `Box<Self>`:

```yaml
TreeNode:
  value: int
  children: TreeNode[] # Generates Vec<Box<TreeNode>>
```

```rust,ignore
#[derive(Clone, Debug, Serialize, Deserialize, DeltaPack)]
pub struct TreeNode {
    pub value: i64,
    pub children: Vec<Box<Self>>,
}
```

## Binary Format

```text
[data section][RLE section][numRleBits: reverse varint]
```

- **Data section**: Primitives encoded sequentially (strings with dictionary, varints, floats)
- **RLE section**: Run-length encoded bits (booleans, optional flags, change indicators)
- **Reverse varint**: Bit count stored at end for streaming decode

## Performance

Benchmarks comparing encode throughput (higher is better):

| Schema     | DeltaPack   | JSON  | MessagePack |
| ---------- | ----------- | ----- | ----------- |
| Primitives | 34.1M ops/s | 11.1M | 10.1M       |
| GameState  | 5.8M ops/s  | 673K  | 816K        |
| User       | 5.3M ops/s  | 1.8M  | 2.0M        |

Run benchmarks:

```bash
cd rust/benchmarks
./build.sh  # Generate benchmark schemas
cargo run --release          # Run benchmarks
cargo run --release -- --save  # Run and save charts
```

### Faster Decoding with mimalloc

Decode performance is allocation-bound. Using mimalloc instead of the system allocator improves decode throughput by ~30%:

```toml
# Cargo.toml
[dependencies]
mimalloc = "0.1"
```

```rust,ignore
// main.rs
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;
```

## Cross-Language Compatibility

Delta-Pack ensures binary compatibility across Rust, TypeScript, and C#:

- Same schema produces interoperable binary format
- Conformance tests verify encode/decode compatibility
- Diff encoding uses sorted keys for deterministic output

All languages use insertion-order-preserving maps (`IndexMap` in Rust, `Map` in TypeScript, `OrderedDictionary` in C#), producing deterministic encoding for the same insertion order.

## License

MIT
