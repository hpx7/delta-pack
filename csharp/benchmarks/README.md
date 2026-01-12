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
| JSON        | 558.5K (5.4x) | 378.9K (5.0x) | 293.0K (4.8x) | 273.0K (4.8x) | 135.6K (3.1x) | 132.8K (3.2x) |
| MessagePack | 814.8K (3.7x) | 518.3K (3.6x) | 455.5K (3.1x) | 439.0K (3.0x) | 209.5K (2.0x) | 207.8K (2.0x) |
| Protobuf    | 1.1M (2.8x)   | 1.0M (1.9x)   | 758.1K (1.9x) | 673.8K (1.9x) | 308.5K (1.4x) | 308.2K (1.4x) |
| DeltaPack   | 3.0M (1.0x)   | 1.9M (1.0x)   | 1.4M (1.0x)   | 1.3M (1.0x)   | 422.8K (1.0x) | 420.9K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 7.5M (4.0x)  | 8.2M (3.7x)  |
| MessagePack | 7.2M (4.2x)  | 7.3M (4.2x)  |
| Protobuf    | 23.9M (1.3x) | 26.6M (1.1x) |
| DeltaPack   | 30.2M (1.0x) | 30.5M (1.0x) |

### Test

| Format      | State1       |
| ----------- | ------------ |
| JSON        | 3.7M (3.2x)  |
| MessagePack | 4.6M (2.6x)  |
| Protobuf    | 7.4M (1.6x)  |
| DeltaPack   | 11.8M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.7M (1.8x) | 1.1M (1.9x)   |
| MessagePack | 1.5M (2.0x) | 980.8K (2.2x) |
| Protobuf    | 3.1M (1.0x) | 2.2M (1.0x)   |
| DeltaPack   | 2.8M (1.1x) | 1.7M (1.3x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 351.9K (6.2x) | 214.2K (6.3x) | 181.0K (6.0x) | 170.9K (6.3x) | 85.3K (5.5x)  | 85.2K (5.6x)  |
| MessagePack | 489.2K (4.5x) | 301.8K (4.5x) | 257.5K (4.2x) | 244.9K (4.4x) | 118.8K (4.0x) | 121.1K (3.9x) |
| Protobuf    | 1.1M (2.0x)   | 978.0K (1.4x) | 761.3K (1.4x) | 701.4K (1.5x) | 315.7K (1.5x) | 318.1K (1.5x) |
| DeltaPack   | 2.2M (1.0x)   | 1.3M (1.0x)   | 1.1M (1.0x)   | 1.1M (1.0x)   | 470.1K (1.0x) | 476.5K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 5.8M (5.1x)  | 5.8M (5.0x)  |
| MessagePack | 6.3M (4.7x)  | 6.4M (4.5x)  |
| Protobuf    | 18.1M (1.6x) | 19.4M (1.5x) |
| DeltaPack   | 29.5M (1.0x) | 28.9M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.1M (4.5x) |
| MessagePack | 3.3M (2.9x) |
| Protobuf    | 6.1M (1.6x) |
| DeltaPack   | 9.4M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.1M (2.5x) | 639.7K (2.8x) |
| MessagePack | 1.0M (2.6x) | 659.4K (2.8x) |
| Protobuf    | 2.6M (1.0x) | 1.8M (1.0x)   |
| DeltaPack   | 2.7M (1.0x) | 1.8M (1.0x)   |
