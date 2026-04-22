# DeltaPack for C#

Binary serialization library optimized for delta encoding of game state.

## Installation

```bash
dotnet add package DeltaPack
```

## Quick Start

Annotate your types with `[DeltaPack]` and declare them `partial`. A source generator
emits `Encode`/`Decode`/`EncodeDiff`/`DecodeDiff`/`Equals`/`Clone`/`Default`/
`FromJson`/`ToJson` at compile time.

```csharp
using DeltaPack;

[DeltaPack]
public partial class Player
{
    public string Name { get; set; } = "";
    public int Score { get; set; }
    public bool Active { get; set; }
}

var player = new Player { Name = "Alice", Score = 100, Active = true };
byte[] encoded = Player.Encode(player);
Player decoded = Player.Decode(encoded);
```

## State Synchronization (`SyncSession<T>`)

For ongoing state sync between two endpoints (server ↔ client, peer ↔ peer), use `SyncSession<T>`. It handles the full-encode bootstrap plus subsequent diffs automatically and keeps both sides aligned — even when the sender's state gets mutated in ways that reorder internal collections.

```csharp
using DeltaPack;

// Server — one SyncSession per connected peer
var session = GameState.CreateSyncSession();
peer.Send(session.Encode(state));  // first call: full; subsequent calls: diff

// Client
var session = GameState.CreateSyncSession();
GameState state = session.Decode(bytes);
```

**`SyncSession` is the recommended API for real-time sync.** The source generator emits a `CreateSyncSession()` factory on every `[DeltaPack]` type. For manual wiring (e.g., to a third-party type), construct directly: `new SyncSession<T>(encode, decode, encodeDiff, decodeDiff, clone)`.

### Low-level delta encoding (advanced)

For custom protocols (ack-based history, multi-baseline diffs, UDP-style packet loss handling, etc.), use the generated `EncodeDiff` / `DecodeDiff` methods directly:

```csharp
var stateA = new GameState { Score = 100, Health = 100 };
var stateB = new GameState { Score = 150, Health = 100 }; // Only score changed

byte[] diff = GameState.EncodeDiff(stateA, stateB);
GameState result = GameState.DecodeDiff(stateA, diff);
```

When using these directly, **the `a` argument must exactly match the peer's wire view (same key insertion order in `OrderedDict`s, not just the same key-value content)**. Mismatch causes silent corruption. `SyncSession` maintains this invariant for you — reach for the raw API only if you've committed to managing wire-view state yourself.

## Shared Schemas (TypeScript/Rust/C#)

For cross-language compatibility, you can author a YAML schema and generate C# from it:

```yaml
# schema.yml
Player:
  name: string
  score: int
  active: boolean

GameState:
  players: <string, Player>
  round: uint
```

```bash
delta-pack generate schema.yml -l csharp -o Generated.cs
```

The CLI emits minimal `[DeltaPack] partial class` skeletons — the source generator still
fills in the methods, so call sites and binary format match.

## Supported Types

- **Primitives**: `string`, `bool`, `int`, `uint`, `long`, `ulong`, `float`, `byte`, `short`, etc.
- **Enums**: Bit-packed using minimum bits needed (e.g., 4 variants = 2 bits)
- **Collections**: `List<T>`, `OrderedDict<TKey, TValue>` (TKey: `string`, `int`, `uint`, `long`, `ulong`)
- **Nullable value types**: `int?`, `float?`, etc.
- **Nullable reference types**: `Player?`, `string?`, etc.
- **Nested objects**: Any `[DeltaPack] partial class`
- **Structs**: `[DeltaPack] partial struct`
- **Self-referencing types**: Types that reference themselves (e.g., linked lists, trees)
- **Union types**: Abstract classes with `[DeltaPackUnion]` attribute

## Attributes

### `[DeltaPack]`

Marks a type for code generation. Types must be declared `partial`.

### `[DeltaPackPrecision]`

Quantize floats for smaller encoding:

```csharp
[DeltaPack]
public partial class Position
{
    [DeltaPackPrecision(0.01)]
    public float X { get; set; }

    [DeltaPackPrecision(0.01)]
    public float Y { get; set; }
}
```

### `[DeltaPackRange]`

Specify bounds for integers (enables more efficient encoding):

```csharp
[DeltaPack]
public partial class Stats
{
    [DeltaPackRange(0, 100)]
    public int Health { get; set; }

    [DeltaPackRange(1)]  // min only
    public int PlayerId { get; set; }
}
```

### `[DeltaPackIgnore]`

Exclude a property from serialization:

```csharp
[DeltaPack]
public partial class Player
{
    public string Name { get; set; } = "";
    public int Score { get; set; }

    [DeltaPackIgnore]
    public string CachedDisplayName { get; set; } = "";
}
```

### `[DeltaPackUnion]`

Define polymorphic types:

```csharp
[DeltaPack]
[DeltaPackUnion(typeof(Sword), typeof(Bow))]
public abstract partial class Weapon
{
    public string Name { get; set; } = "";
}

[DeltaPack]
public partial class Sword : Weapon
{
    public int SlashDamage { get; set; }
}

[DeltaPack]
public partial class Bow : Weapon
{
    public int ArrowDamage { get; set; }
    public float Range { get; set; }
}
```

### `[DeltaPackTracked]`

Opt-in change tracking. The generator emits dirty-marking setters on partial properties so
`EncodeDiff` skips equality comparisons on fields that haven't been mutated since the
snapshot was taken — same wire format as the untracked encoder, lower CPU cost.

```csharp
[DeltaPack, DeltaPackTracked]
public partial class Player
{
    public partial string Name { get; set; }
    public partial uint Score { get; set; }
    public partial Position Pos { get; set; }
    public partial TrackedList<int> Inventory { get; set; }
    public partial TrackedOrderedDict<string, int> Stats { get; set; }
}

var live = Player.Default();
live.Name = "Alice";
live.Score = 10;

// Take a snapshot. `Clone` is a pure deep copy; `RegisterSnapshot` stamps it
// with the current global version so `EncodeDiff` filters to mutations after
// this point. `SyncSession<T>` does both steps automatically — prefer it over
// the raw pattern shown here unless you need manual control.
var snapshot = Player.Clone(live);
DirtyTracking.RegisterSnapshot(snapshot, live);
live.Score = 25;                    // recorded as dirty since snapshot

byte[] diff = Player.EncodeDiff(snapshot, live);  // only Score is compared/encoded
```

**Constraints:**

- Serialized properties must be declared `partial` (requires `<LangVersion>13</LangVersion>`
  in the consuming project — C# 13 partial properties). Missing `partial` produces
  diagnostic `DP011` with an alt-enter code fix.
- Collection-typed properties must use `TrackedList<T>` and `TrackedOrderedDict<TKey, TValue>`
  so mutations through the collection (`.Add`, `.RemoveAt`, indexer set, etc.) are recorded.
  Using `List<T>` or `OrderedDict<TKey, TValue>` on a tracked class produces diagnostics
  `DP012` / `DP013` with code fixes that swap in the tracked variant.
- `Clone` on a tracked class is a plain deep copy. When using raw `EncodeDiff` with the
  clone as the baseline, call `DirtyTracking.RegisterSnapshot(snap, source)` first to stamp
  its `SnapshotVersion` so tracking's version filter scopes the diff correctly.
  `SyncSession<T>` handles this for you.
- **Unity is currently unsupported** for `[DeltaPackTracked]` classes — Unity's bundled Roslyn
  doesn't support C# 13 partial properties. Untracked `[DeltaPack]` classes work as before.

**Migrating gradually.** The generator accepts `partial` properties on untracked `[DeltaPack]`
classes too (it emits a trivial implementing declaration with the same IL as an auto-property).
You can convert an existing class's properties to `partial` ahead of time, then flip
`[DeltaPackTracked]` on later without touching every property.

## API Reference

### `SyncSession<T>` (recommended for state sync)

Stateful handle for one side of a sync stream. Handles full-vs-diff internally and keeps sender and receiver views aligned.

| Method                      | Description                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `T.CreateSyncSession()`     | Factory emitted by the source generator on every `[DeltaPack]` type                        |
| `.Encode(T state) → byte[]` | First call emits a full encode; subsequent calls emit diffs. View updates internally.      |
| `.Decode(byte[] bytes) → T` | First call expects a full encode; subsequent calls expect diffs. Returns the updated view. |
| `.Current → T?`             | The current view, or `null` if neither `Encode` nor `Decode` has been called.              |

For third-party types (no source generator), construct directly with the delegate overload: `new SyncSession<T>(encode, decode, encodeDiff, decodeDiff, clone)`.

### Low-level API (per type)

For every `[DeltaPack] partial class T`, the generator emits these static methods. Use them directly for custom protocols; use `SyncSession<T>` for ordinary sync streams.

| Method                           | Description                                 |
| -------------------------------- | ------------------------------------------- |
| `T.CreateSyncSession()`          | Construct a `SyncSession<T>` (see above)    |
| `T.Default()`                    | Construct a default instance                |
| `T.Encode(T obj)`                | Serialize object to bytes                   |
| `T.Decode(byte[] buf)`           | Deserialize bytes to object                 |
| `T.EncodeDiff(T a, T b)`         | Encode only the differences between a and b |
| `T.DecodeDiff(T a, byte[] diff)` | Apply diff to a, producing b                |
| `T.Equals(T a, T b)`             | Deep equality comparison                    |
| `T.Clone(T obj)`                 | Deep clone                                  |
| `T.FromJson(JsonElement json)`   | Deserialize from JSON                       |
| `T.ToJson(T obj)`                | Serialize to JSON                           |

## Unity Compatibility

Targets `netstandard2.1` and is IL2CPP/AOT-safe — the source generator runs at compile
time, so there's no reflection overhead at runtime.

The bundled source generator requires **Roslyn 4.0+**, which matches Unity 2021.3 LTS and
newer. Older Unity versions predate incremental source generators and won't load the
analyzer.

Install via [NuGetForUnity](https://github.com/GlitchEnzo/NuGetForUnity), which handles
analyzer assets and pulls in the transitive `System.Text.Json` dependency needed for
`FromJson`/`ToJson`.

## Requirements

### Runtime

- .NET 6.0+ or .NET Standard 2.1 (Unity 2021.3 LTS+)

### Type Definitions

- Mark the type with `[DeltaPack]` and declare it `partial`
- **Public properties** with both getter and setter are serialized
- **Public fields** are also serialized
- **`init` setters** work
- **Private members** are skipped
- **Read-only properties** (getter only) are skipped
- **Dictionary keys** must be `string`, `int`, `uint`, `long`, or `ulong`

```csharp
[DeltaPack]
public partial class Player
{
    public string Name { get; set; } = "";     // ✓ Serialized
    public int Score { get; init; }            // ✓ Serialized (init works)
    public int Health;                         // ✓ Serialized (public field)
    public string Id { get; }                  // ✗ Skipped (no setter)
    private int _internalId;                   // ✗ Skipped (private)

    [DeltaPackIgnore]
    public string CachedValue { get; set; }    // ✗ Skipped (ignored)
}
```

## Binary Format

Data layout: `[field data][RLE bits][numRleBits: reverse varint]`

- Integers use varint encoding (zigzag for signed)
- Booleans are collected and RLE-compressed at the end of the buffer
- Floats can be quantized to reduce precision and size
- Strings are length-prefixed UTF-8
