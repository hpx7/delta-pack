# Delta-Pack TypeScript

TypeScript implementation of delta-pack, a compact binary serialization format with efficient delta compression for real-time state synchronization.

## Installation

```bash
npm install @hpx7/delta-pack
```

## Quick Start

Delta-pack provides two approaches for working with schemas:

1. **Interpreter Mode** - Runtime schema parsing with dynamic API
2. **Codegen Mode** - Generate TypeScript code from schemas for compile-time type safety

### Interpreter Mode (Recommended for prototyping)

```typescript
import { ObjectType, StringType, IntType } from "@hpx7/delta-pack";
import { load } from "@hpx7/delta-pack/interpreter";
import { Infer, defineSchema } from "@hpx7/delta-pack/infer";

// Define schema in TypeScript
const schema = defineSchema({
  Player: ObjectType({
    id: StringType(),
    name: StringType(),
    score: IntType(),
  }),
});

// Infer TypeScript type
type Player = Infer<typeof schema.Player, typeof schema>;
// Result: { id: string; name: string; score: number }

// Load API for the type
const Player = load<Player>(schema, "Player");

// Use the API
const player = { id: "p1", name: "Alice", score: 100 };
const encoded = Player.encode(player);
const decoded = Player.decode(encoded);
```

### Codegen Mode (Recommended for production)

```typescript
import { codegenTypescript, ObjectType, StringType, IntType } from "@hpx7/delta-pack";
import { writeFileSync } from "fs";

// Define schema in TypeScript
const schema = {
  Player: ObjectType({
    id: StringType(),
    name: StringType(),
    score: IntType(),
  }),
};

// Generate TypeScript code
const code = codegenTypescript(schema);
writeFileSync("generated.ts", code);
```

Then use the generated code:

```typescript
import { Player } from "./generated";

const player = Player.parse({ id: "p1", name: "Alice", score: 100 });
const encoded = Player.encode(player);
const decoded = Player.decode(encoded);
```

## Schema Definition

Schemas can be defined in two ways:

1. **YAML** - Human-readable format, useful for defining schemas separately from code. Parse with `parseSchemaYml()` for interpreter mode.
2. **TypeScript** - Define schemas using the type definition API. Works with both interpreter and codegen modes. Required for using the `Infer<>` type utility.

**Note:** The `Infer<>` type utility only works with TypeScript-defined schemas, not YAML-parsed schemas, since it requires compile-time type information.

### YAML Schema

Create a `schema.yml` file:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/hpx7/delta-pack/refs/heads/main/schema.json

# Enums
Team:
  - RED
  - BLUE

# Objects
Player:
  id: string
  name: string
  score: int
  team: Team
  position: Position?

Position:
  x: float
  y: float

# Complex types
GameState:
  players: string,Player # Map<string, Player>
  round: uint
  phase: string
```

Parse YAML schemas with:

```typescript
import { parseSchemaYml } from "@hpx7/delta-pack/parser";
import { readFileSync } from "fs";

const schemaYml = readFileSync("schema.yml", "utf8");
const schema = parseSchemaYml(schemaYml);
```

See the [main README](../README.md) for complete schema syntax reference.

### TypeScript Schema

Define schemas using the type definition API:

```typescript
import {
  ObjectType,
  StringType,
  IntType,
  UIntType,
  FloatType,
  BooleanType,
  ArrayType,
  OptionalType,
  RecordType,
  EnumType,
  ReferenceType,
} from "@hpx7/delta-pack";

const Team = EnumType(["RED", "BLUE"]);

const Position = ObjectType({
  x: FloatType({ precision: 0.1 }),
  y: FloatType({ precision: 0.1 }),
});

const Player = ObjectType({
  id: StringType(),
  name: StringType(),
  score: IntType(),
  team: ReferenceType("Team"),
  position: OptionalType(ReferenceType("Position")),
});

const GameState = ObjectType({
  players: RecordType(StringType(), ReferenceType("Player")),
  round: UIntType(),
  phase: StringType(),
});

const schema = {
  Team,
  Position,
  Player,
  GameState,
};
```

## Interpreter API

The interpreter mode provides a runtime API for working with schemas.

### Loading a Schema

```typescript
import { ObjectType, StringType, IntType } from "@hpx7/delta-pack";
import { load } from "@hpx7/delta-pack/interpreter";
import { Infer, defineSchema } from "@hpx7/delta-pack/infer";

// Define schema
const schema = defineSchema({
  Player: ObjectType({
    id: StringType(),
    name: StringType(),
    score: IntType(),
  }),
});

// Infer type
type Player = Infer<typeof schema.Player, typeof schema>;
// Result: { id: string; name: string; score: number }

// Load interpreter API
const Player = load<Player>(schema, "Player");
```

### API Methods

Every loaded type provides these methods:

#### `parse(obj: unknown): T`

Validates and parses an object, throwing if invalid:

```typescript
const player = Player.parse({
  id: "p1",
  name: "Alice",
  score: 100,
});
```

#### `encode(obj: T): Uint8Array`

Serializes an object to binary format:

```typescript
const player = { id: "p1", name: "Alice", score: 100 };
const bytes = Player.encode(player);
console.log(`Encoded size: ${bytes.length} bytes`);
```

#### `decode(bytes: Uint8Array): T`

Deserializes binary data back to an object:

```typescript
const decoded = Player.decode(bytes);
// decoded = { id: 'p1', name: 'Alice', score: 100 }
```

#### `encodeDiff(oldObj: T, newObj: T): Uint8Array`

Encodes only the differences between two objects:

```typescript
const oldPlayer = { id: "p1", name: "Alice", score: 100 };
const newPlayer = { id: "p1", name: "Alice", score: 150 };

const diff = Player.encodeDiff(oldPlayer, newPlayer);
console.log(`Diff size: ${diff.length} bytes`); // Much smaller!
```

#### `decodeDiff(oldObj: T, diffBytes: Uint8Array): T`

Applies a diff to reconstruct the new object:

```typescript
const reconstructed = Player.decodeDiff(oldPlayer, diff);
// reconstructed = { id: 'p1', name: 'Alice', score: 150 }
```

#### `equals(a: T, b: T): boolean`

Deep equality comparison:

```typescript
const isEqual = Player.equals(player1, player2);
```

#### `default(): T`

Creates a default instance:

```typescript
const defaultPlayer = Player.default();
// { id: '', name: '', score: 0 }
```

## Codegen API

The codegen mode generates TypeScript code from schemas for compile-time type safety.

### Generating Code

```typescript
import { codegenTypescript } from "@hpx7/delta-pack";
import { writeFileSync } from "fs";

const code = codegenTypescript(schema);
writeFileSync("generated.ts", code);
```

### Using Generated Code

The generated code exports TypeScript types and runtime objects:

```typescript
import { Player, GameState } from "./generated";

// TypeScript types are available
const player: Player = {
  id: "p1",
  name: "Alice",
  score: 100,
};

// Runtime objects provide the same API as interpreter mode
const encoded = Player.encode(player);
const decoded = Player.decode(encoded);
```

### Generated API

The generated code provides the same methods as interpreter mode:

- `Player.parse(obj)` - Validate and parse
- `Player.encode(obj)` - Serialize to binary
- `Player.decode(bytes)` - Deserialize from binary
- `Player.encodeDiff(old, new)` - Encode delta
- `Player.decodeDiff(old, diff)` - Apply delta
- `Player.equals(a, b)` - Deep equality
- `Player.default()` - Default instance

## Complete Example

### Multiplayer Game State Sync

**schema.yml:**

```yaml
Team:
  - RED
  - BLUE

Position:
  x: float
  y: float

Player:
  id: string
  username: string
  team: Team
  position: Position
  health: uint
  score: int

GameState:
  players: string,Player
  round: uint
  timeRemaining: float
```

**Using Interpreter Mode:**

```typescript
import {
  ObjectType,
  StringType,
  UIntType,
  FloatType,
  IntType,
  EnumType,
  ReferenceType,
  RecordType,
} from "@hpx7/delta-pack";
import { load } from "@hpx7/delta-pack/interpreter";
import { Infer, defineSchema } from "@hpx7/delta-pack/infer";

// Define schema
const schema = defineSchema({
  Team: EnumType(["RED", "BLUE"]),
  Position: ObjectType({
    x: FloatType(),
    y: FloatType(),
  }),
  Player: ObjectType({
    id: StringType(),
    username: StringType(),
    team: ReferenceType("Team"),
    position: ReferenceType("Position"),
    health: UIntType(),
    score: IntType(),
  }),
  GameState: ObjectType({
    players: RecordType(StringType(), ReferenceType("Player")),
    round: UIntType(),
    timeRemaining: FloatType(),
  }),
});

// Infer types
type GameState = Infer<typeof schema.GameState, typeof schema>;
type Player = Infer<typeof schema.Player, typeof schema>;

// Load API
const GameState = load<GameState>(schema, "GameState");

// Initial state
const state1: GameState = {
  players: new Map([
    [
      "p1",
      {
        id: "p1",
        username: "Alice",
        team: "RED",
        position: { x: 100, y: 100 },
        health: 100,
        score: 0,
      },
    ],
  ]),
  round: 1,
  timeRemaining: 600.0,
};

// Updated state (player moved)
const state2: GameState = {
  ...state1,
  players: new Map([
    [
      "p1",
      {
        ...state1.players.get("p1")!,
        position: { x: 105.5, y: 102.3 },
      },
    ],
  ]),
  timeRemaining: 599.0,
};

// Full encoding
const fullBytes = GameState.encode(state2);
console.log(`Full state: ${fullBytes.length} bytes`);

// Delta encoding (much smaller!)
const diffBytes = GameState.encodeDiff(state1, state2);
console.log(`Delta: ${diffBytes.length} bytes`);
console.log(`Savings: ${((1 - diffBytes.length / fullBytes.length) * 100).toFixed(1)}%`);

// Client applies delta
const reconstructed = GameState.decodeDiff(state1, diffBytes);
console.log("State synchronized!", GameState.equals(reconstructed, state2)); // true
```

**Using Codegen Mode:**

```typescript
import {
  codegenTypescript,
  ObjectType,
  StringType,
  UIntType,
  FloatType,
  IntType,
  EnumType,
  ReferenceType,
  RecordType,
} from "@hpx7/delta-pack";
import { writeFileSync } from "fs";

// Define schema
const schema = {
  Team: EnumType(["RED", "BLUE"]),
  Position: ObjectType({
    x: FloatType(),
    y: FloatType(),
  }),
  Player: ObjectType({
    id: StringType(),
    username: StringType(),
    team: ReferenceType("Team"),
    position: ReferenceType("Position"),
    health: UIntType(),
    score: IntType(),
  }),
  GameState: ObjectType({
    players: RecordType(StringType(), ReferenceType("Player")),
    round: UIntType(),
    timeRemaining: FloatType(),
  }),
};

// Generate code
const code = codegenTypescript(schema);
writeFileSync("generated.ts", code);
```

Then use the generated code:

```typescript
import { GameState, Player } from "./generated";

// TypeScript types are available at compile time
const state: GameState = GameState.default();
state.players.set("p1", {
  id: "p1",
  username: "Alice",
  team: "RED",
  position: { x: 100, y: 100 },
  health: 100,
  score: 0,
});

// Same API as interpreter mode
const encoded = GameState.encode(state);
const decoded = GameState.decode(encoded);
```

## Performance Tips

### Delta Compression

Delta encoding is most effective when:

- State changes are incremental (only a few fields change per update)
- You send updates frequently (e.g., 60 times per second in games)
- Objects are medium to large (>50 bytes)

**Typical bandwidth savings:**

- Position-only updates: 90-95% smaller
- Single field changes: 85-90% smaller
- Multiple field changes: 70-85% smaller

### Quantized Floats

Use precision for floats to reduce size:

```typescript
const Position = ObjectType({
  x: FloatType({ precision: 0.1 }), // ~10cm precision
  y: FloatType({ precision: 0.1 }),
});
```

This enables delta compression to skip encoding unchanged floats even if they differ slightly due to floating-point imprecision.

### String Dictionary

Strings are automatically deduplicated within each encoding operation. Reuse common strings (player IDs, item names, etc.) to benefit from dictionary compression.

### Map vs Array

- Use `RecordType` (maps) when entities have unique IDs
- Use `ArrayType` when order matters or IDs aren't meaningful

Maps enable efficient delta encoding for entity collections (only changed entities are encoded).

## Examples

See the `examples/` directory for complete examples:

- `examples/primitives/` - Basic primitive types
- `examples/user/` - User profile with unions and optionals
- `examples/game/` - Multiplayer game with complex state

Each example includes:

- `schema.yml` - Schema definition
- `state1.json`, `state2.json`, ... - Example states demonstrating delta compression

## Type Reference

### Primitive Types

| Function                   | TypeScript Type | Description                              |
| -------------------------- | --------------- | ---------------------------------------- |
| `StringType()`             | `string`        | UTF-8 encoded string                     |
| `IntType()`                | `number`        | Variable-length signed integer           |
| `UIntType()`               | `number`        | Variable-length unsigned integer         |
| `FloatType()`              | `number`        | 32-bit IEEE 754 float                    |
| `FloatType({ precision })` | `number`        | Quantized float with specified precision |
| `BooleanType()`            | `boolean`       | Single bit boolean                       |

### Container Types

| Function           | TypeScript Type  | Description                          |
| ------------------ | ---------------- | ------------------------------------ |
| `ArrayType(T)`     | `T[]`            | Array of type T                      |
| `OptionalType(T)`  | `T \| undefined` | Optional value of type T             |
| `RecordType(K, V)` | `Map<K, V>`      | Map with key type K and value type V |

### Complex Types

| Function              | TypeScript Type          | Description                         |
| --------------------- | ------------------------ | ----------------------------------- |
| `ObjectType({ ... })` | `{ ... }`                | Object with defined properties      |
| `EnumType([...])`     | Union of string literals | Enumerated string values            |
| `ReferenceType(name)` | Named type               | Reference to another type in schema |

## Development

### Running Tests

```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage report
npm run test:ui       # Open Vitest UI
```

### Type Checking

```bash
npm run typecheck
```

### Formatting

```bash
npm run format        # Format code
npm run format:check  # Check formatting
```

## API Documentation

For detailed API documentation and schema syntax, see the [main README](../README.md).

## License

MIT
