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
| JSON        | 572.5K (5.1x) | 385.5K (4.7x) | 298.5K (4.6x) | 281.4K (4.5x) | 137.0K (3.0x) | 137.4K (3.0x) |
| MessagePack | 834.1K (3.5x) | 529.1K (3.4x) | 464.5K (3.0x) | 436.4K (2.9x) | 216.5K (1.9x) | 217.7K (1.9x) |
| Protobuf    | 1.1M (2.6x)   | 1.0M (1.7x)   | 760.3K (1.8x) | 697.7K (1.8x) | 319.5K (1.3x) | 318.9K (1.3x) |
| DeltaPack   | 2.9M (1.0x)   | 1.8M (1.0x)   | 1.4M (1.0x)   | 1.3M (1.0x)   | 409.4K (1.0x) | 413.6K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 7.5M (3.5x)  | 8.3M (3.3x)  |
| MessagePack | 7.2M (3.7x)  | 7.1M (3.8x)  |
| Protobuf    | 24.1M (1.1x) | 27.0M (1.0x) |
| DeltaPack   | 26.4M (1.0x) | 26.6M (1.0x) |

### Test

| Format      | State1       |
| ----------- | ------------ |
| JSON        | 3.6M (2.9x)  |
| MessagePack | 4.3M (2.4x)  |
| Protobuf    | 7.7M (1.3x)  |
| DeltaPack   | 10.2M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.7M (1.8x) | 1.1M (1.9x) |
| MessagePack | 1.6M (2.0x) | 1.0M (2.1x) |
| Protobuf    | 3.1M (1.0x) | 2.2M (1.0x) |
| DeltaPack   | 2.7M (1.2x) | 1.7M (1.3x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 368.0K (5.9x) | 221.2K (6.0x) | 185.6K (6.0x) | 175.1K (6.0x) | 86.5K (5.3x)  | 86.0K (5.4x)  |
| MessagePack | 493.6K (4.4x) | 299.9K (4.4x) | 257.2K (4.3x) | 248.1K (4.2x) | 121.5K (3.8x) | 123.0K (3.8x) |
| Protobuf    | 1.1M (2.0x)   | 1.0M (1.3x)   | 779.0K (1.4x) | 717.5K (1.5x) | 329.2K (1.4x) | 330.2K (1.4x) |
| DeltaPack   | 2.2M (1.0x)   | 1.3M (1.0x)   | 1.1M (1.0x)   | 1.1M (1.0x)   | 462.4K (1.0x) | 465.4K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 6.0M (4.1x)  | 5.9M (4.2x)  |
| MessagePack | 6.5M (3.8x)  | 6.4M (3.9x)  |
| Protobuf    | 18.5M (1.3x) | 20.2M (1.2x) |
| DeltaPack   | 24.7M (1.0x) | 25.0M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.1M (4.0x) |
| MessagePack | 3.4M (2.6x) |
| Protobuf    | 6.2M (1.4x) |
| DeltaPack   | 8.7M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.1M (2.4x) | 669.9K (2.7x) |
| MessagePack | 1.0M (2.6x) | 666.0K (2.7x) |
| Protobuf    | 2.6M (1.0x) | 1.8M (1.0x)   |
| DeltaPack   | 2.5M (1.1x) | 1.7M (1.1x)   |
