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
| JSON        | 570.5K (4.9x) | 383.7K (4.5x) | 292.0K (4.7x) | 274.6K (4.5x) | 136.8K (3.0x) | 133.3K (3.0x) |
| MessagePack | 820.5K (3.4x) | 519.3K (3.3x) | 460.6K (3.0x) | 445.7K (2.8x) | 218.0K (1.9x) | 213.9K (1.8x) |
| Protobuf    | 1.1M (2.5x)   | 1.1M (1.6x)   | 790.3K (1.7x) | 702.2K (1.8x) | 286.1K (1.4x) | 293.2K (1.3x) |
| DeltaPack   | 2.8M (1.0x)   | 1.7M (1.0x)   | 1.4M (1.0x)   | 1.2M (1.0x)   | 413.0K (1.0x) | 393.8K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 7.5M (3.4x)  | 8.3M (3.2x)  |
| MessagePack | 7.1M (3.6x)  | 7.2M (3.7x)  |
| Protobuf    | 24.2M (1.1x) | 26.5M (1.0x) |
| DeltaPack   | 25.7M (1.0x) | 25.0M (1.1x) |

### Test

| Format      | State1       |
| ----------- | ------------ |
| JSON        | 3.7M (2.9x)  |
| MessagePack | 4.8M (2.3x)  |
| Protobuf    | 8.0M (1.4x)  |
| DeltaPack   | 10.9M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.8M (1.8x) | 1.1M (1.9x) |
| MessagePack | 1.6M (2.0x) | 1.0M (2.1x) |
| Protobuf    | 3.1M (1.0x) | 2.2M (1.0x) |
| DeltaPack   | 2.7M (1.1x) | 1.6M (1.3x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 367.8K (5.9x) | 219.5K (6.0x) | 187.3K (5.8x) | 175.8K (5.9x) | 87.0K (5.2x)  | 86.8K (5.4x)  |
| MessagePack | 493.1K (4.4x) | 298.5K (4.4x) | 263.0K (4.1x) | 253.6K (4.1x) | 121.6K (3.7x) | 122.3K (3.8x) |
| Protobuf    | 1.1M (1.9x)   | 1.0M (1.3x)   | 785.1K (1.4x) | 723.7K (1.4x) | 325.6K (1.4x) | 325.6K (1.4x) |
| DeltaPack   | 2.2M (1.0x)   | 1.3M (1.0x)   | 1.1M (1.0x)   | 1.0M (1.0x)   | 453.3K (1.0x) | 467.9K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 5.8M (4.1x)  | 5.8M (4.1x)  |
| MessagePack | 6.4M (3.8x)  | 6.4M (3.8x)  |
| Protobuf    | 18.4M (1.3x) | 19.8M (1.2x) |
| DeltaPack   | 23.9M (1.0x) | 24.0M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.2M (4.0x) |
| MessagePack | 3.3M (2.6x) |
| Protobuf    | 6.2M (1.4x) |
| DeltaPack   | 8.6M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.1M (2.3x) | 674.6K (2.6x) |
| MessagePack | 1.0M (2.5x) | 670.9K (2.6x) |
| Protobuf    | 2.6M (1.0x) | 1.8M (1.0x)   |
| DeltaPack   | 2.4M (1.1x) | 1.6M (1.1x)   |
