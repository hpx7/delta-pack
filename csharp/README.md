# DeltaPack for C#

Binary serialization library optimized for delta encoding of game state.

## Installation

```bash
dotnet add package DeltaPack
```

## Quick Start

```csharp
using DeltaPack;

// Define your types
public class Player
{
    public string Name { get; set; } = "";
    public int Score { get; set; }
    public bool Active { get; set; }
}

// Create a codec (do this once during initialization)
var codec = new DeltaPackCodec<Player>();

// Encode
var player = new Player { Name = "Alice", Score = 100, Active = true };
byte[] encoded = codec.Encode(player);

// Decode
Player decoded = codec.Decode(encoded);
```

## Delta Encoding

Send only what changed between two states:

```csharp
var stateA = new GameState { Score = 100, Health = 100 };
var stateB = new GameState { Score = 150, Health = 100 }; // Only score changed

byte[] diff = codec.EncodeDiff(stateA, stateB);
GameState result = codec.DecodeDiff(stateA, diff);

// diff is smaller than full encode when few fields change
```

## Code Generation

As an alternative to reflection-based serialization, you can generate C# code from a YAML schema:

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

Generate C# code using the CLI:

```bash
npx delta-pack generate schema.yml -l csharp -o Generated.cs
```

The generated code provides static methods for each type:

```csharp
// Generated types are plain classes
var player = new Player { Name = "Alice", Score = 100, Active = true };

// Static encode/decode methods
byte[] encoded = Player.Encode(player);
Player decoded = Player.Decode(encoded);

// Delta encoding
byte[] diff = Player.EncodeDiff(oldPlayer, newPlayer);
Player result = Player.DecodeDiff(oldPlayer, diff);
```

**When to use codegen vs reflection:**

- **Codegen**: Shared schemas across TypeScript/C#, compile-time type safety, no reflection overhead
- **Reflection**: Define types directly in C#, no build step, works with existing classes

## Supported Types

- **Primitives**: `string`, `bool`, `int`, `uint`, `long`, `ulong`, `float`, `double`, `byte`, `short`, etc.
- **Enums**: Bit-packed using minimum bits needed (e.g., 4 variants = 2 bits)
- **Collections**: `List<T>`, `Dictionary<TKey, TValue>` (TKey: `string`, `int`, `uint`, `long`, `ulong`)
- **Nullable value types**: `int?`, `float?`, etc.
- **Nullable reference types**: `Player?`, `string?`, etc.
- **Nested objects**: Any class with public properties
- **Self-referencing types**: Types that reference themselves (e.g., linked lists, trees)
- **Union types**: Abstract classes with `[DeltaPackUnion]` attribute

## Attributes

### `[DeltaPackPrecision]`

Quantize floats for smaller encoding:

```csharp
public class Position
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
public class Stats
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
public class Player
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
[DeltaPackUnion(typeof(Sword), typeof(Bow), typeof(Staff))]
public abstract class Weapon
{
    public string Name { get; set; } = "";
}

public class Sword : Weapon
{
    public int SlashDamage { get; set; }
}

public class Bow : Weapon
{
    public int ArrowDamage { get; set; }
    public float Range { get; set; }
}
```

## API Reference

### `DeltaPackCodec<T>`

| Method                         | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `Encode(T obj)`                | Serialize object to bytes                   |
| `Decode(byte[] buf)`           | Deserialize bytes to object                 |
| `EncodeDiff(T a, T b)`         | Encode only the differences between a and b |
| `DecodeDiff(T a, byte[] diff)` | Apply diff to a, producing b                |
| `Equals(T a, T b)`             | Deep equality comparison                    |
| `Clone(T obj)`                 | Deep clone                                  |

### Custom Factory

For types without parameterless constructors, such as records:

```csharp
public record ImmutablePlayer(string Name, int Score);

var codec = new DeltaPackCodec<ImmutablePlayer>(
    () => new ImmutablePlayer("", 0)
);
```

> **Note:** Union types (abstract classes with `[DeltaPackUnion]`) don't require a factory—variants are instantiated directly during decoding.

## Unity Compatibility

This library targets `netstandard2.1` and is compatible with Unity 2021.2+.

**Recommended usage pattern:**

```csharp
public class NetworkManager : MonoBehaviour
{
    // Create codecs once during initialization
    private DeltaPackCodec<GameState> _stateCodec;
    private DeltaPackCodec<PlayerInput> _inputCodec;

    void Awake()
    {
        _stateCodec = new DeltaPackCodec<GameState>();
        _inputCodec = new DeltaPackCodec<PlayerInput>();
    }

    void SendState(GameState state)
    {
        byte[] data = _stateCodec.Encode(state);
        // Send data...
    }

    GameState ReceiveState(byte[] data)
    {
        return _stateCodec.Decode(data);
    }
}
```

## Requirements

### Runtime

- .NET 6.0+ or .NET Standard 2.1 (Unity 2021.2+)

### Type Definitions

- **Parameterless constructor** required (or provide a factory)
- **Public properties** with both getter and setter are serialized
- **Public fields** are also serialized
- **`init` setters** work (reflection bypasses compile-time restriction)
- **Private members** are skipped
- **Read-only properties** (getter only) are skipped
- **Dictionary keys** must be `string`, `int`, `uint`, `long`, or `ulong`

```csharp
public class Player
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
