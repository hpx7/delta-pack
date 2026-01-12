# C# Performance Benchmarks

Performance comparison of DeltaPack against System.Text.Json, MessagePack-CSharp, and Protobuf.

## Running

```bash
# From csharp directory
benchmarks/build.sh                         # Generate code
dotnet run -c Release --project benchmarks  # Run all benchmarks (codegen mode)

# Run specific benchmarks (case-insensitive, partial match)
dotnet run -c Release --project benchmarks Primitives
dotnet run -c Release --project benchmarks GameState User

# Run in interpreter mode
dotnet run -c Release --project benchmarks -- --interpreter
dotnet run -c Release --project benchmarks -- --interpreter Primitives
```

## Modes

- **Codegen mode** (default): Uses pre-generated C# code for DeltaPack serialization
- **Interpreter mode** (`--interpreter`): Parses YAML schemas at runtime and uses the interpreter for DeltaPack operations

The interpreter mode is useful for comparing the performance overhead of runtime schema parsing vs compile-time code generation. JSON, MessagePack, and Protobuf always use their generated/native implementations in both modes.

## Results (codegen)

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 573.4K (5.3x) | 388.7K (4.8x) | 300.7K (4.9x) | 283.4K (4.7x) | 139.3K (3.2x) | 139.3K (3.2x) |
| MessagePack | 848.7K (3.6x) | 534.1K (3.5x) | 464.5K (3.1x) | 449.2K (3.0x) | 219.5K (2.0x) | 218.0K (2.0x) |
| Protobuf    | 1.1M (2.7x)   | 1.1M (1.8x)   | 787.9K (1.9x) | 698.6K (1.9x) | 321.3K (1.4x) | 323.1K (1.4x) |
| DeltaPack   | 3.0M (1.0x)   | 1.9M (1.0x)   | 1.5M (1.0x)   | 1.3M (1.0x)   | 442.3K (1.0x) | 440.4K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 7.9M (3.9x)  | 8.5M (3.7x)  |
| MessagePack | 7.3M (4.2x)  | 7.3M (4.3x)  |
| Protobuf    | 24.3M (1.3x) | 26.7M (1.2x) |
| DeltaPack   | 30.8M (1.0x) | 31.1M (1.0x) |

### Test

| Format      | State1       |
| ----------- | ------------ |
| JSON        | 3.7M (3.2x)  |
| MessagePack | 4.9M (2.5x)  |
| Protobuf    | 8.1M (1.5x)  |
| DeltaPack   | 12.0M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.8M (1.7x) | 1.1M (2.0x)   |
| MessagePack | 1.5M (2.0x) | 973.3K (2.3x) |
| Protobuf    | 3.0M (1.0x) | 2.2M (1.0x)   |
| DeltaPack   | 3.0M (1.0x) | 1.8M (1.3x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 369.3K (6.0x) | 220.9K (6.2x) | 184.0K (6.2x) | 175.8K (6.2x) | 87.0K (5.6x)  | 87.5K (5.6x)  |
| MessagePack | 502.7K (4.4x) | 305.4K (4.5x) | 263.6K (4.3x) | 253.6K (4.3x) | 122.5K (4.0x) | 121.2K (4.0x) |
| Protobuf    | 1.1M (2.0x)   | 1.0M (1.4x)   | 782.9K (1.4x) | 724.2K (1.5x) | 324.9K (1.5x) | 329.5K (1.5x) |
| DeltaPack   | 2.2M (1.0x)   | 1.4M (1.0x)   | 1.1M (1.0x)   | 1.1M (1.0x)   | 488.3K (1.0x) | 490.0K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 6.0M (5.1x)  | 6.0M (5.1x)  |
| MessagePack | 6.4M (4.8x)  | 6.5M (4.7x)  |
| Protobuf    | 18.8M (1.6x) | 20.1M (1.5x) |
| DeltaPack   | 31.0M (1.0x) | 30.5M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.2M (4.6x) |
| MessagePack | 3.3M (3.0x) |
| Protobuf    | 6.2M (1.6x) |
| DeltaPack   | 9.8M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.1M (2.5x) | 673.4K (2.8x) |
| MessagePack | 1.0M (2.7x) | 685.7K (2.7x) |
| Protobuf    | 2.7M (1.0x) | 1.8M (1.0x)   |
| DeltaPack   | 2.8M (1.0x) | 1.9M (1.0x)   |
