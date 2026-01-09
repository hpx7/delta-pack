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

## Results

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 569.7K (5.1x) | 381.1K (4.7x) | 295.9K (4.8x) | 277.4K (4.8x) | 137.7K (3.2x) | 135.7K (3.2x) |
| MessagePack | 827.3K (3.5x) | 525.3K (3.4x) | 463.7K (3.1x) | 449.8K (2.9x) | 219.3K (2.0x) | 219.9K (2.0x) |
| Protobuf    | 1.1M (2.6x)   | 1.0M (1.7x)   | 770.9K (1.8x) | 690.8K (1.9x) | 318.6K (1.4x) | 318.5K (1.4x) |
| DeltaPack   | 2.9M (1.0x)   | 1.8M (1.0x)   | 1.4M (1.0x)   | 1.3M (1.0x)   | 440.0K (1.0x) | 440.0K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 7.7M (3.4x)  | 8.3M (3.3x)  |
| MessagePack | 7.5M (3.5x)  | 7.5M (3.6x)  |
| Protobuf    | 24.1M (1.1x) | 27.2M (1.0x) |
| DeltaPack   | 26.2M (1.0x) | 26.1M (1.0x) |

### Test

| Format      | State1       |
| ----------- | ------------ |
| JSON        | 3.8M (2.9x)  |
| MessagePack | 4.9M (2.2x)  |
| Protobuf    | 8.2M (1.3x)  |
| DeltaPack   | 10.8M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.0M (1.3x) | 2.6M (1.3x) |
| MessagePack | 2.5M (1.6x) | 2.3M (1.4x) |
| Protobuf    | 4.0M (1.0x) | 3.3M (1.0x) |
| DeltaPack   | 4.1M (1.0x) | 3.3M (1.0x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 367.9K (5.9x) | 223.0K (6.0x) | 187.4K (5.9x) | 174.6K (6.1x) | 86.9K (5.4x)  | 86.3K (5.5x)  |
| MessagePack | 503.9K (4.3x) | 307.8K (4.4x) | 266.3K (4.2x) | 254.3K (4.2x) | 121.6K (3.9x) | 123.4K (3.9x) |
| Protobuf    | 1.1M (2.0x)   | 1.0M (1.3x)   | 784.7K (1.4x) | 725.2K (1.5x) | 323.9K (1.5x) | 327.8K (1.5x) |
| DeltaPack   | 2.2M (1.0x)   | 1.3M (1.0x)   | 1.1M (1.0x)   | 1.1M (1.0x)   | 473.4K (1.0x) | 475.9K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 6.0M (4.2x)  | 6.0M (4.1x)  |
| MessagePack | 6.2M (4.0x)  | 6.2M (3.9x)  |
| Protobuf    | 18.5M (1.3x) | 20.0M (1.2x) |
| DeltaPack   | 25.0M (1.0x) | 24.5M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.8M (4.6x) |
| MessagePack | 3.3M (2.6x) |
| Protobuf    | 6.2M (1.4x) |
| DeltaPack   | 8.4M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.8M (2.1x) | 1.5M (2.2x) |
| MessagePack | 1.8M (2.1x) | 1.7M (2.1x) |
| Protobuf    | 3.5M (1.1x) | 2.9M (1.2x) |
| DeltaPack   | 3.8M (1.0x) | 3.4M (1.0x) |
