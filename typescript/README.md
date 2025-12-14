# Delta-Pack TypeScript

TypeScript implementation of delta-pack, a compact binary serialization format with efficient delta compression for real-time state synchronization.

## Installation

```bash
npm install @hpx7/delta-pack
```

## Quick Start

Delta-pack provides three approaches for working with schemas:

1. **Interpreter Mode** - Runtime schema parsing with dynamic API
2. **Decorator Mode** - Use TypeScript decorators for class-based schemas (builds on interpreter mode)
3. **Codegen Mode** - Generate TypeScript code from schemas for compile-time type safety

### Interpreter Mode (Recommended for prototyping)

```typescript
import { ObjectType, StringType, IntType, load, Infer, defineSchema } from "@hpx7/delta-pack";

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

### Decorator Mode (Recommended for class-based code)

```typescript
import { StringType, IntType, loadClass } from "@hpx7/delta-pack";

class Player {
  @StringType()
  id: string = "";

  @StringType()
  name: string = "";

  @IntType()
  score: number = 0;
}

// Load API from decorated class
const PlayerApi = loadClass(Player);

// Use the API
const player = new Player();
player.id = "p1";
player.name = "Alice";
player.score = 100;

const encoded = PlayerApi.encode(player);
const decoded = PlayerApi.decode(encoded);
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

const player: Player = { id: "p1", name: "Alice", score: 100 };
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
  x: float(precision=0.1)
  y: float(precision=0.1)

# Complex types
GameState:
  players: string,Player # Map<string, Player>
  round: uint
  phase: string
```

Parse YAML schemas with:

```typescript
import { parseSchemaYml } from "@hpx7/delta-pack";
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
import { ObjectType, StringType, IntType, load, Infer, defineSchema } from "@hpx7/delta-pack";

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

#### `fromJson(obj: Record<string, unknown>): T`

Validates and parses JSON data, throwing if invalid. Use this when parsing untrusted or untyped data:

```typescript
// Parse unvalidated JSON data
const jsonData = JSON.parse(networkResponse);
const player = Player.fromJson(jsonData);
```

For most cases, prefer using TypeScript types directly:

```typescript
// Preferred: use TypeScript types for compile-time safety
const player: Player = { id: "p1", name: "Alice", score: 100 };
```

#### `toJson(obj: T): Record<string, unknown>`

Converts an object to JSON-serializable format. Useful for serializing to JSON or sending over HTTP:

```typescript
const player: Player = { id: "p1", name: "Alice", score: 100 };
const json = Player.toJson(player);
const jsonString = JSON.stringify(json);
```

**Format notes:**
- Maps (RecordType) are converted to plain objects
- Optional object properties with `undefined` values are excluded from the JSON
- Unions are converted to protobuf format: `{ TypeName: {...} }`

**Example with unions:**

```typescript
const action: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
const json = GameAction.toJson(action);
// Result: { MoveAction: { x: 10, y: 20 } }
```

This format is compatible with protobuf JSON encoding and can be parsed back with `fromJson()`.

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

Deep equality comparison with appropriate tolerance for floats:

```typescript
const isEqual = Player.equals(player1, player2);
```

For quantized floats (with `precision`), equality uses quantized value comparison. For non-quantized floats, equality uses epsilon-based comparison (0.00001 tolerance).

#### `clone(obj: T): T`

Creates a deep clone of an object:

```typescript
const player1 = { id: "p1", name: "Alice", score: 100 };
const player2 = Player.clone(player1);

// Modifying the clone doesn't affect the original
player2.score = 200;
console.log(player1.score); // 100
console.log(player2.score); // 200
```

**Important notes:**
- Creates deep copies of all nested objects, arrays, and maps
- Primitives (strings, numbers, booleans) are copied by value
- The `_dirty` field is **not** preserved in clones (clones always start clean)
- Useful for creating modified copies without mutating the original state

#### `default(): T`

Creates a default instance:

```typescript
const defaultPlayer = Player.default();
// { id: '', name: '', score: 0 }
```

## Decorator API

The decorator mode provides a class-based API using TypeScript decorators. Schemas are inferred from decorated classes at runtime.

### Decorators

| Decorator | Description |
|-----------|-------------|
| `@StringType()` | String property |
| `@IntType()` | Signed integer |
| `@UIntType()` | Unsigned integer |
| `@BooleanType()` | Boolean property |
| `@FloatType()` | IEEE 754 float (use `{ precision: 0.01 }` for quantized) |
| `@ReferenceType(Type)` | Reference to a class or TypeScript string enum (use `{ enumName }` for enums) |
| `@ArrayType(Type)` | Array property |
| `@RecordType(Type)` | Map with string keys |
| `@OptionalType(Type)` | Optional property |
| `@UnionType([A, B])` | Class decorator for union types |

For container types (`@ArrayType`, `@RecordType`, `@OptionalType`):
- `Type` can be: `String`, `Number`, `Boolean`, a class, `[A, B, ...]` for unions, a TypeScript string enum, or another container decorator for nesting
- For `Number`, pass options as second arg: `@ArrayType(Number, { unsigned: true })` or `{ float: 0.01 }`
- For enums, use `{ enumName: "Name" }` to specify the schema name (otherwise auto-generated from values)

### Example

```typescript
import {
  StringType, IntType, UIntType, FloatType, BooleanType,
  ReferenceType, ArrayType, RecordType, OptionalType,
  UnionType, loadClass,
} from "@hpx7/delta-pack";

// Enums
enum Team { RED = "red", BLUE = "blue" }
enum Status { ACTIVE = "active", IDLE = "idle" }

// Nested object
class Position {
  @FloatType({ precision: 0.1 })
  x: number = 0;

  @FloatType({ precision: 0.1 })
  y: number = 0;
}

// Union types
class MoveAction {
  @IntType() x: number = 0;
  @IntType() y: number = 0;
}

class AttackAction {
  @StringType() targetId: string = "";
  @UIntType() damage: number = 0;
}

@UnionType([MoveAction, AttackAction])
abstract class GameAction {}

// Main class demonstrating all features
class Player {
  // Primitives
  @StringType() id: string = "";
  @StringType() name: string = "";
  @IntType() score: number = 0;
  @UIntType() level: number = 1;
  @BooleanType() isOnline: boolean = false;
  @FloatType() velocity: number = 0;

  // References
  @ReferenceType(Position) position: Position = new Position();
  @ReferenceType(Team) team: Team = Team.RED;

  // Arrays
  @ArrayType(String) tags: string[] = [];
  @ArrayType(Position) waypoints: Position[] = [];
  @ArrayType(Number, { float: 0.01 }) scores: number[] = [];
  @ArrayType(Status) statuses: Status[] = [];
  @ArrayType([MoveAction, AttackAction]) actions: GameAction[] = [];

  // Maps
  @RecordType(Number) inventory: Map<string, number> = new Map();
  @RecordType(Position) markers: Map<string, Position> = new Map();
  @RecordType(Number, { unsigned: true }) counts: Map<string, number> = new Map();

  // Optionals
  @OptionalType(String) nickname?: string;
  @OptionalType(Position) target?: Position;
  @OptionalType(Number, { float: 0.01 }) rating?: number;
  @OptionalType([MoveAction, AttackAction]) lastAction?: GameAction;

  // Self-reference (circular)
  @OptionalType(Player) partner?: Player;

  // Nested containers
  @ArrayType(ArrayType(Number)) matrix: number[][] = [];
  @RecordType(ArrayType(Number)) vectorsById: Map<string, number[]> = new Map();
  @OptionalType(ArrayType(Number)) optionalScores?: number[];
  @ArrayType(ArrayType(Number, { float: 0.01 })) floatMatrix: number[][] = [];
}

// Load API and use
const PlayerApi = loadClass(Player);
const player = new Player();
player.name = "Alice";
const encoded = PlayerApi.encode(player);
const decoded = PlayerApi.decode(encoded);
```

### buildSchema()

If you need access to the generated schema (e.g., for inspection or to use with `load()` directly), use `buildSchema()`:

```typescript
import { buildSchema, load } from "@hpx7/delta-pack";

const schema = buildSchema(Player);
console.log(schema); // { Player: { type: "object", properties: { ... } } }

// Use with load() for more control
const PlayerApi = load(schema, "Player");
```

Note: When using `buildSchema()` + `load()` with union types, you must manually wrap values in `{ type: "TypeName", val: {...} }` format. The `loadClass()` convenience method handles this automatically.

### Requirements

**tsconfig.json:** Enable `"experimentalDecorators": true`

**Class requirements:**
1. Parameterless constructor (instantiable with `new Class()`)
2. Properties must have default values (discovered via `Object.keys(new Class())`)
3. Every property needs a type decorator
4. Unique class names (used as schema identifiers)

### API Methods

`loadClass()` returns the same API as interpreter mode: `encode`, `decode`, `encodeDiff`, `decodeDiff`, `equals`, `clone`, `toJson`, `fromJson`

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

- `Player.fromJson(obj)` - Validate and parse JSON data
- `Player.toJson(obj)` - Convert to JSON-serializable format
- `Player.encode(obj)` - Serialize to binary
- `Player.decode(bytes)` - Deserialize from binary
- `Player.encodeDiff(old, new)` - Encode delta
- `Player.decodeDiff(old, diff)` - Apply delta
- `Player.equals(a, b)` - Deep equality
- `Player.clone(obj)` - Deep clone object
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
  load,
  Infer,
  defineSchema,
} from "@hpx7/delta-pack";

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

### Dirty Tracking Optimization

For maximum encodeDiff performance, you can use the optional `_dirty` field to mark which fields/indices/keys have changed. This allows delta encoding to skip comparison checks entirely:

```typescript
// Objects: track changed fields
const player: Player = { id: "p1", name: "Alice", score: 100 };
player.score = 150;
player._dirty = new Set(["score"]);

const diff = Player.encodeDiff(oldPlayer, player);
// Only encodes the 'score' field without checking other fields
```

**Pattern: Clone and modify for clean state tracking:**

When you need to modify state without mutating the original, use `clone()` to create a fresh copy:

```typescript
// Start with a clean clone
const newPlayer = Player.clone(oldPlayer);

// Modify and track changes
newPlayer.score = 200;
newPlayer._dirty = new Set(["score"]);

// Efficient delta encoding
const diff = Player.encodeDiff(oldPlayer, newPlayer);
```

This pattern ensures:
- Original state remains unchanged
- You can precisely control which fields are marked dirty
- Delta encoding is maximally efficient

```typescript
// Arrays: track changed indices
const items: Item[] = [...];
items[5] = newItem;
items._dirty = new Set([5]);

const diff = encodeDiff(oldItems, items);
// Only encodes index 5 without checking other elements
```

```typescript
// Maps (RecordType): track changed keys
const players: Map<string, Player> = new Map();
players.set("p1", updatedPlayer);
players._dirty = new Set(["p1"]);

const diff = encodeDiff(oldPlayers, players);
// Only processes key "p1" without checking other entries
```

The `_dirty` field is:
- **Optional**: If absent, full comparison is performed
- **Type-safe**: `Set<keyof T>` for objects, `Set<number>` for arrays, `Set<K>` for maps
- **Included in generated types**: Both codegen and interpreter types include `_dirty`
- **Not serialized**: The `_dirty` field is never encoded in the binary format

**When to use dirty tracking:**
- High-frequency updates (e.g., 60+ times per second)
- Large objects/collections where full comparison is expensive
- When you can reliably track changes at the application level

**Important:** If dirty tracking is enabled but incomplete (e.g., you modify a field but don't mark it dirty), the delta will be incorrect. Only use dirty tracking if you can guarantee accurate tracking.

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
