# delta-pack

Binary serialization with delta compression for real-time state synchronization.

Delta-Pack is a cross-language serialization framework optimized for networked applications where you need to efficiently synchronize state between clients and servers. It provides both full encoding and delta encoding (only transmitting what changed).

## Features

- **Compact binary format** - Smaller than JSON, MessagePack, and often Protobuf
- **Delta compression** - Encode only the differences between two states
- **Cross-language** - Compatible with TypeScript and C# implementations
- **Zero-copy strings** - String dictionary deduplication within each message
- **Serde integration** - Generated types derive `Serialize`/`Deserialize`

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
delta-pack = "0.1"
```

## Usage

Delta-Pack uses code generation from YAML schemas. Define your schema, generate Rust code, and use the generated types.

### 1. Define a Schema

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

### 2. Generate Rust Code

```bash
npx delta-pack generate schema.yml -l rust > src/generated.rs
```

### 3. Use the Generated Types

```rust
use crate::generated::{User, Address, HairColor};

fn main() {
    // Create a user
    let user1 = User {
        id: "user-123".into(),
        name: "Alice".into(),
        age: 30,
        weight: 65.5,
        hair_color: HairColor::Brown,
        address: Some(Address {
            street: "123 Main St".into(),
            city: "Springfield".into(),
            zip: "12345".into(),
        }),
        tags: vec!["admin".into(), "verified".into()],
        metadata: [("level".into(), "5".into())].into(),
    };

    // Full encode/decode
    let bytes = user1.encode();
    let decoded = User::decode(&bytes);
    assert!(user1.equals(&decoded));

    // Delta encoding - only send what changed
    let user2 = User {
        age: 31,  // birthday!
        ..user1.clone()
    };

    let full_size = user2.encode().len();
    let diff = User::encode_diff(&user1, &user2);
    let diff_size = diff.len();

    println!("Full: {} bytes, Diff: {} bytes", full_size, diff_size);
    // Full: 58 bytes, Diff: 3 bytes

    // Apply the diff to reconstruct user2
    let reconstructed = User::decode_diff(&user1, &diff);
    assert!(user2.equals(&reconstructed));
}
```

## Generated API

Every generated type provides these methods:

| Method | Description |
|--------|-------------|
| `encode(&self) -> Vec<u8>` | Serialize to binary |
| `decode(buf: &[u8]) -> Self` | Deserialize from binary |
| `encode_diff(a: &Self, b: &Self) -> Vec<u8>` | Encode only the differences from `a` to `b` |
| `decode_diff(a: &Self, diff: &[u8]) -> Self` | Apply a diff to `a` to produce `b` |
| `equals(&self, other: &Self) -> bool` | Deep equality (respects float precision) |

Generated types also derive:
- `Clone`, `Debug` - Standard traits
- `Default` - All fields initialized to zero/empty values
- `Serialize`, `Deserialize` - Serde support for JSON interop

## Schema Types

### Primitives

| Schema | Rust Type | Notes |
|--------|-----------|-------|
| `string` | `String` | UTF-8, dictionary-compressed |
| `int` | `i64` | Signed, varint-encoded |
| `uint` | `u64` | Unsigned, varint-encoded |
| `int(min=0, max=100)` | `u64` | Bounded, more compact |
| `float` | `f32` | 32-bit IEEE 754 |
| `float(precision=0.01)` | `f32` | Quantized for smaller diffs |
| `boolean` | `bool` | 1 bit, RLE-compressed |

### Containers

| Schema | Rust Type |
|--------|-----------|
| `T[]` | `Vec<T>` |
| `T?` | `Option<T>` |
| `<K, V>` | `HashMap<K, V>` |

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

Recursive types are supported and generate `Box<T>`:

```yaml
TreeNode:
  value: int
  children: TreeNode[]  # Generates Vec<Box<TreeNode>>
```

## Binary Format

```
[data section][RLE section][numRleBits: reverse varint]
```

- **Data section**: Primitives encoded sequentially (strings with dictionary, varints, floats)
- **RLE section**: Run-length encoded bits (booleans, optional flags, change indicators)
- **Reverse varint**: Bit count stored at end for streaming decode

## Performance

Benchmarks comparing encode throughput (higher is better):

| Schema | DeltaPack | JSON | MessagePack |
|--------|-----------|------|-------------|
| Primitives | 34.1M ops/s | 11.1M | 10.1M |
| GameState | 5.8M ops/s | 673K | 816K |
| User | 5.3M ops/s | 1.8M | 2.0M |

Run benchmarks:

```bash
cd rust/benchmarks
./build.sh  # Generate benchmark schemas
cargo run --release
```

### Faster Decoding with mimalloc

Decode performance is allocation-bound. Using mimalloc instead of the system allocator improves decode throughput by ~30%:

```toml
# Cargo.toml
[dependencies]
mimalloc = "0.1"
```

```rust
// main.rs
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;
```

## Cross-Language Compatibility

Delta-Pack ensures binary compatibility across Rust, TypeScript, and C#:

- Same schema produces interoperable binary format
- Conformance tests verify encode/decode compatibility
- Diff encoding uses sorted keys for deterministic output

Note: Full encodes may produce different byte sequences across languages due to HashMap iteration order, but decoded values are identical.

## License

MIT
