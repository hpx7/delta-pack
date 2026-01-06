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
import { ObjectType, StringType, IntType, load, Infer } from "@hpx7/delta-pack";

// Define schema type directly
const Player = ObjectType("Player", {
  id: StringType(),
  name: StringType(),
  score: IntType(),
});

// Infer TypeScript type
type Player = Infer<typeof Player>;
// Result: { id: string; name: string; score: number }

// Load API for the type
const PlayerApi = load(Player);

// Use the API
const player = { id: "p1", name: "Alice", score: 100 };
const encoded = PlayerApi.encode(player);
const decoded = PlayerApi.decode(encoded);
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

Create a YAML schema file (`schema.yml`):

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/hpx7/delta-pack/refs/heads/main/schema.json

Player:
  id: string
  name: string
  score: int
```

Generate TypeScript code using the CLI:

```bash
npx delta-pack generate schema.yml -l typescript -o generated.ts
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
2. **TypeScript** - Define schemas using the type constructor functions. Works with both interpreter and codegen modes. Required for using the `Infer<>` type utility.

**Note:** The `Infer<>` type utility only works with TypeScript-defined schemas, not YAML-parsed schemas, since it requires compile-time type information.

### YAML Schema

Create a `schema.yml` file:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/hpx7/delta-pack/refs/heads/main/schema.json

# Enums (list of string literals)
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

# Union types (list of type references)
# A union is a list where all items are defined type names
MoveAction:
  x: int
  y: int

AttackAction:
  targetId: string
  damage: uint # shorthand for int(min=0)

GameAction:
  - MoveAction
  - AttackAction

# Complex types
GameState:
  players: <string, Player>
  actions: GameAction[]
  round: uint
  phase: string

# Bounded integers
BoundedExample:
  health: int(min=0, max=100) # validated in fromJson, encoded as unsigned
  level: int(min=1, max=99)
  temperature: int(min=-50, max=50)
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

Define schemas using the type constructor functions. Named types (`ObjectType`, `EnumType`, `UnionType`) take a required name as the first parameter:

```typescript
import {
  ObjectType,
  StringType,
  IntType,
  UIntType,
  FloatType,
  ArrayType,
  OptionalType,
  RecordType,
  EnumType,
  UnionType,
  ReferenceType,
} from "@hpx7/delta-pack";

// Enum type
const Team = EnumType("Team", ["RED", "BLUE"]);

// Object types - define in dependency order
const Position = ObjectType("Position", {
  x: FloatType({ precision: 0.1 }),
  y: FloatType({ precision: 0.1 }),
});

const Player = ObjectType("Player", {
  id: StringType(),
  name: StringType(),
  score: IntType(),
  team: ReferenceType(Team),
  position: OptionalType(ReferenceType(Position)),
});

// Union type - options are direct type references
const MoveAction = ObjectType("MoveAction", {
  x: IntType(),
  y: IntType(),
});

const AttackAction = ObjectType("AttackAction", {
  targetId: StringType(),
  damage: UIntType(),
});

const GameAction = UnionType("GameAction", [MoveAction, AttackAction]);

// Using unions in other types
const GameState = ObjectType("GameState", {
  players: RecordType(StringType(), ReferenceType(Player)),
  actions: ArrayType(ReferenceType(GameAction)),
  round: UIntType(),
  phase: StringType(),
});
```

**Union value format:** Union values use a flattened discriminated union format with `_type`:

```typescript
// Creating a union value
const action: GameAction = { _type: "MoveAction", x: 10, y: 20 };

// Type narrowing with discriminant
if (action._type === "MoveAction") {
  console.log(action.x, action.y);
}
```

## Interpreter API

The interpreter mode provides a runtime API for working with schemas.

### Loading a Schema

```typescript
import { ObjectType, StringType, IntType, load, Infer } from "@hpx7/delta-pack";

// Define schema type
const Player = ObjectType("Player", {
  id: StringType(),
  name: StringType(),
  score: IntType(),
});

// Infer TypeScript type
type Player = Infer<typeof Player>;
// Result: { id: string; name: string; score: number }

// Load interpreter API
const PlayerApi = load(Player);
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
const action: GameAction = { _type: "MoveAction", x: 10, y: 20 };
const json = GameAction.toJson(action);
// Result: { MoveAction: { x: 10, y: 20 } }
```

The JSON output uses protobuf format (`{ TypeName: {...} }`) which can be parsed back with `fromJson()`.

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

## Decorator API

The decorator mode provides a class-based API using TypeScript decorators. Schemas are inferred from decorated classes at runtime.

### Decorators

The same type functions used to build schemas (`StringType()`, `IntType()`, `ArrayType()`, etc.) also work as property decorators. See [Type Reference](#type-reference) for the complete list.

**Additional decorator-specific features:**

| Function                | Description                                   |
| ----------------------- | --------------------------------------------- |
| `EnumType("Name", [])`  | Define an enum type                           |
| `UnionType("Name", [])` | Define a union from a list of variant classes |
| `ReferenceType(ref)`    | Reference a class, enum, or union             |

**Referencing classes, enums, and unions:**

- Use `ReferenceType(ClassName)` to reference another class
- Use `EnumType("Name", [...])` to define an enum, then `ReferenceType(EnumDef)` to use it
- Use `UnionType("Name", [ClassA, ClassB])` to define a union, then `ReferenceType(UnionDef)` to use it

### Example

```typescript
import {
  StringType,
  IntType,
  UIntType,
  FloatType,
  BooleanType,
  ReferenceType,
  ArrayType,
  RecordType,
  OptionalType,
  EnumType,
  UnionType,
  Infer,
  loadClass,
} from "@hpx7/delta-pack";

// Enum type
const Team = EnumType("Team", ["RED", "BLUE"]);
type Team = Infer<typeof Team>;

// Nested object
class Position {
  @FloatType({ precision: 0.1 }) x: number = 0;
  @FloatType({ precision: 0.1 }) y: number = 0;
}

// Union types - define variant classes, then combine with UnionType
class MoveAction {
  @IntType() x: number = 0;
  @IntType() y: number = 0;
}

class AttackAction {
  @StringType() targetId: string = "";
  @UIntType() damage: number = 0;
}

// Define union type - combines variant classes
const GameAction = UnionType("GameAction", [MoveAction, AttackAction]);
type GameAction = Infer<typeof GameAction>;

// Main class
class Player {
  @StringType() id: string = "";
  @StringType() name: string = "";
  @IntType() score: number = 0;
  @BooleanType() isOnline: boolean = false;

  @ReferenceType(Position) position: Position = new Position();
  @ReferenceType(Team) team: Team = Team.RED;

  @ArrayType(StringType()) tags: string[] = [];
  @ArrayType(ReferenceType(Position)) waypoints: Position[] = [];
  @RecordType(StringType(), IntType()) inventory: Map<string, number> = new Map();

  @OptionalType(StringType()) nickname?: string;
  @OptionalType(ReferenceType(GameAction)) lastAction?: GameAction;
}

// Load API and use
const PlayerApi = loadClass(Player);
const player = new Player();
player.name = "Alice";
const encoded = PlayerApi.encode(player);
const decoded = PlayerApi.decode(encoded);
```

**Advanced patterns** (nested containers, number modifiers):

```typescript
class AdvancedExample {
  @ArrayType(UIntType()) unsignedInts: number[] = [];
  @ArrayType(FloatType({ precision: 0.01 })) floats: number[] = [];
  @ArrayType(ArrayType(IntType())) matrix: number[][] = [];
  @RecordType(StringType(), ArrayType(IntType())) vectorsById: Map<string, number[]> = new Map();
  @OptionalType(ReferenceType(Player)) partner?: Player; // Self-reference
}
```

### Working with Union Types

With the decorator API, union types are defined using `UnionType()` to combine variant classes:

```typescript
// Define variant classes (regular decorated classes)
class JoinMessage {
  @StringType() name: string = "";
}

class InputMessage {
  @ReferenceType(ClientInput) input: ClientInput = new ClientInput();
}

// Define union type - combines variants
const ClientMessage = UnionType("ClientMessage", [JoinMessage, InputMessage]);
type ClientMessage = Infer<typeof ClientMessage>;

// Load the API from the union
const ClientMessageApi = loadClass(ClientMessage);
```

**Encoding:** Pass variant class instances directly:

```typescript
const joinMsg = new JoinMessage();
joinMsg.name = "Alice";
const encoded = ClientMessageApi.encode(joinMsg);
```

**Decoding:** Returns variant class instances. Use `instanceof` to narrow the type:

```typescript
const message = ClientMessageApi.decode(encoded);

if (message instanceof JoinMessage) {
  console.log(message.name); // TypeScript knows this is JoinMessage
} else if (message instanceof InputMessage) {
  console.log(message.input);
}
```

### buildSchema()

If you need access to the generated schema (e.g., for inspection or to use with `load()` directly), use `buildSchema()`:

```typescript
import { buildSchema, load } from "@hpx7/delta-pack";

const schema = buildSchema(Player);
console.log(schema); // { Player: { type: "object", properties: { ... }, name: "Player" } }

// Use with load() for more control
const PlayerApi = load(schema["Player"]);
```

### Requirements

**tsconfig.json:** Enable `"experimentalDecorators": true`

**Class requirements:**

1. Parameterless constructor (instantiable with `new Class()`)
2. Decorated properties must have default values (discovered via `Object.keys(new Class())`)
3. At least one property must have a type decorator
4. Unique class names (used as schema identifiers)

**Note:** Properties without decorators are ignored (not serialized). Methods are also allowed. This lets you add helper methods or transient state to your classes.

### API Methods

`loadClass()` returns the same API as `load()` in interpreter mode:

| Method                  | Description                          |
| ----------------------- | ------------------------------------ |
| `encode(obj)`           | Serialize to binary                  |
| `decode(bytes)`         | Deserialize from binary              |
| `encodeDiff(old, new)`  | Encode delta between two states      |
| `decodeDiff(old, diff)` | Apply delta to reconstruct new state |
| `equals(a, b)`          | Deep equality comparison             |
| `clone(obj)`            | Deep clone                           |
| `toJson(obj)`           | Convert to JSON-serializable format  |
| `fromJson(obj)`         | Validate and parse JSON data         |

**Key difference:** In decorator mode, `decode`, `decodeDiff`, `clone`, and `fromJson` return proper class instances—not plain objects. This includes union variants (e.g., decoding a `ClientMessage` returns a `JoinMessage` or `InputMessage` instance).

### Schema API vs Decorator API

| Aspect            | Schema API                                   | Decorator API                               |
| ----------------- | -------------------------------------------- | ------------------------------------------- |
| Type constructors | `StringType()`, `ArrayType()`, etc.          | Same - work as decorators too               |
| Object types      | `ObjectType("Name", { ... })`                | Class with decorated properties             |
| Enums             | `EnumType("Name", [...])`                    | Same - `EnumType("Name", [...])`            |
| Unions            | `UnionType("Name", [TypeA, TypeB])`          | `UnionType("Name", [ClassA, ClassB])`       |
| References        | Type references: `ReferenceType(PlayerType)` | Class/enum/union refs: `ReferenceType(ref)` |
| Loading           | `load(RootType)`                             | `loadClass(Class)` or `loadClass(UnionDef)` |
| Return types      | Plain objects                                | Class instances with methods                |

## Codegen API

The codegen mode generates TypeScript code from schemas for compile-time type safety. Code generation is handled by the `@hpx7/delta-pack-cli` package.

### Generating Code

```bash
# Install CLI globally or use npx
npm install -g @hpx7/delta-pack-cli

# Generate from YAML schema
delta-pack generate schema.yml -l typescript -o generated.ts

# Or use npx
npx delta-pack generate schema.yml -l typescript -o generated.ts
```

For programmatic code generation, import from the CLI package:

```typescript
import { codegenTypescript } from "@hpx7/delta-pack-cli/codegen";
import { parseSchemaYml } from "@hpx7/delta-pack";
import { readFileSync, writeFileSync } from "fs";

const schemaYml = readFileSync("schema.yml", "utf8");
const schema = parseSchemaYml(schemaYml);
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
} from "@hpx7/delta-pack";

// Define schema types
const Team = EnumType("Team", ["RED", "BLUE"]);

const Position = ObjectType("Position", {
  x: FloatType(),
  y: FloatType(),
});

const Player = ObjectType("Player", {
  id: StringType(),
  username: StringType(),
  team: ReferenceType(Team),
  position: ReferenceType(Position),
  health: UIntType(),
  score: IntType(),
});

const GameState = ObjectType("GameState", {
  players: RecordType(StringType(), ReferenceType(Player)),
  round: UIntType(),
  timeRemaining: FloatType(),
});

// Infer types
type GameStateType = Infer<typeof GameState>;

// Load API
const GameStateApi = load(GameState);

// Create initial state
const state1: GameStateType = {
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
const state2: GameStateType = {
  ...state1,
  players: new Map([["p1", { ...state1.players.get("p1")!, position: { x: 105, y: 102 } }]]),
  timeRemaining: 599.0,
};

// Delta encoding
const diff = GameStateApi.encodeDiff(state1, state2);
const reconstructed = GameStateApi.decodeDiff(state1, diff);
```

**Using Decorator Mode:**

```typescript
import {
  StringType,
  UIntType,
  FloatType,
  IntType,
  ReferenceType,
  RecordType,
  EnumType,
  Infer,
  loadClass,
} from "@hpx7/delta-pack";

const Team = EnumType("Team", ["RED", "BLUE"]);
type Team = Infer<typeof Team>;

class Position {
  @FloatType() x: number = 0;
  @FloatType() y: number = 0;
}

class Player {
  @StringType() id: string = "";
  @StringType() username: string = "";
  @ReferenceType(Team) team: Team = "RED";
  @ReferenceType(Position) position: Position = new Position();
  @UIntType() health: number = 0;
  @IntType() score: number = 0;
}

class GameState {
  @RecordType(StringType(), ReferenceType(Player)) players: Map<string, Player> = new Map();
  @UIntType() round: number = 0;
  @FloatType() timeRemaining: number = 0;
}

// Load API
const GameStateApi = loadClass(GameState);

// Create initial state
const state1 = new GameState();
state1.round = 1;
state1.timeRemaining = 600.0;

const player = new Player();
player.id = "p1";
player.username = "Alice";
player.team = "RED";
player.position.x = 100;
player.position.y = 100;
player.health = 100;
state1.players.set("p1", player);

// Updated state (player moved)
const state2 = GameStateApi.clone(state1);
state2.players.get("p1")!.position.x = 105;
state2.players.get("p1")!.position.y = 102;
state2.timeRemaining = 599.0;

// Delta encoding
const diff = GameStateApi.encodeDiff(state1, state2);
const reconstructed = GameStateApi.decodeDiff(state1, diff);
```

**Using Codegen Mode:**

Create a schema file (`game.schema.yml`):

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/hpx7/delta-pack/refs/heads/main/schema.json

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
  players: <string, Player>
  round: uint
  timeRemaining: float
```

Generate the code:

```bash
npx delta-pack generate game.schema.yml -l typescript -o generated.ts
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

### Dirty Tracking with `track()`

For maximum `encodeDiff` performance, use `track()` to automatically track which fields have changed. This allows delta encoding to skip comparison checks entirely:

```typescript
import { track, clearTracking } from "@hpx7/delta-pack";

// Wrap state with tracking
const state = track({
  tick: 0,
  player: { x: 0, y: 0 },
  players: new Map([["p1", { x: 0, y: 0 }]]),
});

// Mutations are automatically tracked
state.tick = 1; // Marks "tick" dirty
state.player.x = 100; // Marks "x" on player, "player" on state
state.players.get("p1")!.x = 50; // Marks "x" on player, "p1" on players, "players" on state

// Efficient delta encoding - only changed fields are compared
const diff = GameStateApi.encodeDiff(oldState, state);

// Clear tracking for next update cycle
clearTracking(state);
```

**Deep tracking:** Changes to nested objects, arrays, and maps automatically propagate up to parents. This works with:

- Nested objects: `state.player.x = 100` marks both `player.x` and `state.player`
- Arrays: `state.items[0].value = 99` marks the item, index 0, and `state.items`
- Maps: `state.players.get("p1")!.x = 50` marks the player, key "p1", and `state.players`
- Array methods: `push`, `pop`, `shift`, `unshift`, `splice` all mark appropriate indices

**Game loop pattern:**

```typescript
class Game {
  private state = track(new GameState());

  tick() {
    // Mutations are automatically tracked
    this.state.tick++;
    for (const [id, input] of this.inputs) {
      const player = this.state.players.get(id)!;
      player.x += input.vx;
      player.y += input.vy;
    }
  }

  broadcast() {
    for (const client of this.clients) {
      const diff = GameStateApi.encodeDiff(client.lastState, this.state);
      client.send(diff);
      client.lastState = GameStateApi.clone(this.state);
    }
    clearTracking(this.state); // Reset for next tick
  }
}
```

**The `Tracked<T>` type:** The `track()` function returns a `Tracked<T>` which recursively adds `_dirty` sets at every level of the object tree.

**When to use tracking:**

- High-frequency updates (e.g., 20-60 times per second)
- Large state objects where full comparison is expensive
- Mutable state that changes incrementally each tick

**Manual `_dirty` (alternative):** You can also set `_dirty` directly without using `track()`:

```typescript
// Objects: track changed fields
player.score = 150;
player._dirty = new Set(["score"]);

// Arrays: track changed indices
items[5] = newItem;
items._dirty = new Set([5]);

// Maps: track changed keys
players.set("p1", updatedPlayer);
players._dirty = new Set(["p1"]);
```

The `_dirty` field is:

- **Optional**: If absent, full comparison is performed
- **Type-safe**: `Set<keyof T>` for objects, `Set<number>` for arrays, `Set<K>` for maps
- **Included in types**: Both codegen and interpreter types include `_dirty`
- **Not serialized**: The `_dirty` field is never encoded in the binary format

### Quantized Floats

Use precision for floats to reduce size:

```typescript
const Position = ObjectType("Position", {
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

| Function                   | TypeScript Type | Description                                 |
| -------------------------- | --------------- | ------------------------------------------- |
| `StringType()`             | `string`        | UTF-8 encoded string                        |
| `IntType()`                | `number`        | Variable-length signed integer (zigzag)     |
| `IntType({ min })`         | `number`        | Bounded integer, encoded as unsigned offset |
| `IntType({ min, max })`    | `number`        | Bounded integer with validation             |
| `UIntType()`               | `number`        | Shorthand for `IntType({ min: 0 })`         |
| `FloatType()`              | `number`        | 32-bit IEEE 754 float                       |
| `FloatType({ precision })` | `number`        | Quantized float with specified precision    |
| `BooleanType()`            | `boolean`       | Single bit boolean                          |

**Bounded integers:** When `min` is specified, values are encoded as `value - min` using unsigned varints, which is more compact for values near the minimum. The `max` parameter adds validation in `fromJson()` but doesn't affect encoding.

### Container Types

| Function           | TypeScript Type  | Description                          |
| ------------------ | ---------------- | ------------------------------------ |
| `ArrayType(T)`     | `T[]`            | Array of type T                      |
| `OptionalType(T)`  | `T \| undefined` | Optional value of type T             |
| `RecordType(K, V)` | `Map<K, V>`      | Map with key type K and value type V |

### Complex Types

| Function                      | TypeScript Type          | Description                      |
| ----------------------------- | ------------------------ | -------------------------------- |
| `ObjectType("Name", { ... })` | `{ ... }`                | Object with defined properties   |
| `EnumType("Name", [...])`     | Union of string literals | Enumerated string values         |
| `UnionType("Name", [...])`    | `{ _type: string } & T`  | Tagged union of named types      |
| `ReferenceType(Type)`         | Named type               | Reference to another named type  |
| `SelfReferenceType()`         | Self                     | Reference to the containing type |

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
