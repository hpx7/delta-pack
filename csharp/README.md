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

**`SyncSession` is the recommended API for real-time sync.** The source generator emits a `CreateSyncSession()` factory on every `[DeltaPack]` type. For manual wiring (e.g., to a third-party type), construct directly: `new SyncSession<T>(encode, decode, encodeDiff, decodeDiff, clone)` (binds to `Tracker.Default`) or `new SyncSession<T>(tracker, encode, decode, encodeDiff, decodeDiff, clone)` for explicit per-domain isolation.

### Multiple sync domains in one process (`Tracker`)

If you're hosting several independent sync domains in a single process — game rooms, tenants, parallel tests — pass a per-domain `Tracker` to keep their baseline / tombstone state isolated:

```csharp
var roomA = new Tracker();
var roomB = new Tracker();

var sessionA = GameState.CreateSyncSession(roomA);
var sessionB = GameState.CreateSyncSession(roomB);
```

Without an explicit `Tracker`, all calls share `Tracker.Default` (the process-wide singleton) — fine for single-domain apps, scripts, and demos. With an explicit tracker per domain: a stale snapshot held alive in room A can't suppress tombstone pruning in room B, and the setter fast-path in B isn't gated by A's encode tick rate.

The version clock itself is process-global, so dirty stamps remain comparable across trackers and a tracked subtree adopts its parent's tracker on attach (no re-stamping pass needed).

### Low-level delta encoding (advanced)

For custom protocols (ack-based history, multi-baseline diffs, UDP-style packet loss handling, etc.), use the generated `EncodeDiff` / `DecodeDiff` methods directly:

```csharp
var stateA = new GameState { Score = 100, Health = 100 };
var stateB = new GameState { Score = 150, Health = 100 }; // Only score changed

byte[] diff = GameState.EncodeDiff(stateA, stateB);
GameState result = GameState.DecodeDiff(stateA, diff);
```

When using these directly, **the `a` argument must exactly match the peer's wire view (same key insertion order in `DPDict`s, not just the same key-value content)**. Mismatch causes silent corruption. `SyncSession` maintains this invariant for you — reach for the raw API only if you've committed to managing wire-view state yourself.

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
- **Collections**: `DPList<T>` (always-tracking list) and `DPDict<TKey, TValue>` (always-tracking, insertion-order map). TKey: `string`, `int`, `uint`, `long`, `ulong`. Plain `List<T>`/`Dictionary<TKey, TValue>` on a `[DeltaPack]` field is rejected by diagnostics `DP012`/`DP003` with code fixes that swap them in.
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

## Change Tracking

Tracking layers in two places, and each layer is independent — turn on as much or as little as you want without changing the wire format.

- **Collection level — always on.** `[DeltaPack]` classes use `DeltaPack.DPList<T>` for arrays
  and `DeltaPack.DPDict<TKey, TValue>` for maps. These are always-tracking: every mutation
  bumps a per-instance version counter, and `EncodeDiff` consults per-key/per-index change
  maps in lieu of scanning both sides. Plain `List<T>` / `Dictionary<TKey, TValue>` on a
  `[DeltaPack]` field is rejected by diagnostics `DP012` / `DP003` (alt-enter code fixes
  swap them in). Always-tracking adds one int-increment per mutation and is Unity-friendly.

- **Property level — opt-in via `partial`.** Mark a property
  `public partial T Foo { get; set; }` and the source generator emits a dirty-bit setter so
  `EncodeDiff` can skip equality comparisons on unchanged fields. Plain
  `public T Foo { get; set; }` falls back to comparison-based diff. A class with at least
  one `partial` property implements `DeltaPack.ITrackedObject` and gets a slot-keyed dirty
  bitmap; classes with no `partial` properties have zero tracking-interface plumbing.

A Unity client (no `partial` properties) talks to a tracked .NET server fine — wire format is identical regardless of which tracking layers are active.

```csharp
[DeltaPack]
public partial class Player
{
    public partial string Name { get; set; }
    public partial uint Score { get; set; }
    public partial Position Pos { get; set; }
    public partial DPList<int> Inventory { get; set; }
    public partial DPDict<string, int> Stats { get; set; }
}

var live = Player.Default();
live.Name = "Alice";
live.Score = 10;

// Take a snapshot. `Clone` is a deep copy; `Tracker.RegisterSnapshot` stamps it
// against the source's tracker so `EncodeDiff` filters to mutations after this
// point. `SyncSession<T>` does both steps automatically — prefer it over the raw
// pattern shown here unless you need manual control.
var snapshot = Player.Clone(live);
Tracker.RegisterSnapshot(snapshot, live);
live.Score = 25;                    // recorded as dirty since snapshot

byte[] diff = Player.EncodeDiff(snapshot, live);  // only Score is compared/encoded
```

**Constraints:**

- A `partial` property must declare a regular `set` accessor. The source generator emits
  the dirty-bump body, so the user-side declaration must give it a setter to inject into:
  - Get-only `partial T Foo { get; }` → diagnostic `DP013` (code fix adds `set;`).
  - `init`-only `partial T Foo { get; init; }` → diagnostic `DP014` (the generator's
    setter body can't satisfy an `init` accessor).
  - `[DeltaPackIgnore]` on a `partial` property → diagnostic `DP015` (the two attributes
    contradict — drop one).
- `partial` properties require `<LangVersion>13</LangVersion>` (C# 13 partial properties).
- Aliasing — assigning the same tracked child to two slots — throws at runtime with a
  pointer to the offending field. Detach the prior owner first (assign that slot to a
  different value or remove the child from its container).
- When using raw `EncodeDiff` directly with `Clone(...)` as the baseline, call
  `Tracker.RegisterSnapshot(snap, source)` so tracking's version filter knows at which
  version the snapshot was taken — `SyncSession<T>` handles this for you.
- **Unity caveat:** Unity's bundled Roslyn doesn't support C# 13 partial properties.
  Drop `partial` on every property and the class becomes an untracked `[DeltaPack]` class
  that loses only the property-level dirty-bit fast path — collection-level tracking via
  `DPList` / `DPDict` still works, and the encoder transparently falls back to
  comparison-based diff for property reads.

**Migrating gradually.** Property-level tracking is per-property, so you can flip a hot
field (`Health`, `Position`) to `partial` without touching the rest of the class. Cold
fields stay as plain auto-properties and use the comparison path; hot fields skip the
comparison via the slot-keyed dirty bitmap. Both produce the same bytes on the wire.

## API Reference

### `SyncSession<T>` (recommended for state sync)

Stateful handle for one side of a sync stream. Handles full-vs-diff internally and keeps sender and receiver views aligned.

| Method                         | Description                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `T.CreateSyncSession()`        | Factory bound to `Tracker.Default` — fine for single-domain apps                           |
| `T.CreateSyncSession(Tracker)` | Factory bound to a per-domain `Tracker` (game room, tenant, parallel test)                 |
| `.Tracker → Tracker`           | The tracker this session's baselines are recorded against                                  |
| `.Encode(T state) → byte[]`    | First call emits a full encode; subsequent calls emit diffs. View updates internally.      |
| `.Decode(byte[] bytes) → T`    | First call expects a full encode; subsequent calls expect diffs. Returns the updated view. |
| `.Current → T?`                | The current view, or `null` if neither `Encode` nor `Decode` has been called.              |

For third-party types (no source generator), construct directly with the delegate overload: `new SyncSession<T>(encode, decode, encodeDiff, decodeDiff, clone)`. Pass an explicit `Tracker` as the first argument if you need per-domain isolation.

### Low-level API (per type)

For every `[DeltaPack] partial class T`, the generator emits these static methods. Use them directly for custom protocols; use `SyncSession<T>` for ordinary sync streams.

| Method                           | Description                                                |
| -------------------------------- | ---------------------------------------------------------- |
| `T.CreateSyncSession()`          | Construct a `SyncSession<T>` bound to `Tracker.Default`    |
| `T.CreateSyncSession(Tracker)`   | Construct a `SyncSession<T>` bound to a specific tracker   |
| `T.Default()`                    | Construct a default instance                               |
| `T.Encode(T obj)`                | Serialize object to bytes                                  |
| `T.Decode(byte[] buf)`           | Deserialize bytes (binds the result to `Tracker.Default`)  |
| `T.Decode(byte[] buf, Tracker)`  | Deserialize bytes (binds the result to a specific tracker) |
| `T.EncodeDiff(T a, T b)`         | Encode only the differences between a and b                |
| `T.DecodeDiff(T a, byte[] diff)` | Apply diff to a, producing b                               |
| `T.Equals(T a, T b)`             | Deep equality comparison                                   |
| `T.Clone(T obj)`                 | Deep clone (the clone inherits `obj`'s tracker)            |
| `T.FromJson(JsonElement json)`   | Deserialize from JSON                                      |
| `T.ToJson(T obj)`                | Serialize to JSON                                          |

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
- **`init` setters** work for non-`partial` properties (a `partial init` is `DP014`)
- **Private members** are skipped
- **Read-only properties** (getter only) are skipped on plain auto-properties; on a
  `partial` property they're rejected as `DP013` because tracking needs a setter to inject into
- **Dictionary keys** must be `string`, `int`, `uint`, `long`, or `ulong`
- **Collection fields** must use `DPList<T>` / `DPDict<TKey, TValue>` (`DP012` / `DP003`)

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
