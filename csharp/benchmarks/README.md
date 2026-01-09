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
| JSON        | 561.6K (5.0x) | 381.0K (4.6x) | 294.4K (4.5x) | 278.1K (4.4x) | 137.7K (2.9x) | 135.4K (3.0x) |
| MessagePack | 814.6K (3.4x) | 499.1K (3.5x) | 452.0K (3.0x) | 438.0K (2.8x) | 214.2K (1.8x) | 211.8K (1.9x) |
| Protobuf    | 1.1M (2.5x)   | 1.0M (1.7x)   | 771.7K (1.7x) | 685.2K (1.8x) | 316.1K (1.2x) | 315.6K (1.3x) |
| DeltaPack   | 2.8M (1.0x)   | 1.7M (1.0x)   | 1.3M (1.0x)   | 1.2M (1.0x)   | 394.6K (1.0x) | 410.1K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 7.7M (3.2x)  | 8.3M (3.2x)  |
| MessagePack | 7.3M (3.4x)  | 7.3M (3.7x)  |
| Protobuf    | 24.6M (1.0x) | 27.0M (1.0x) |
| DeltaPack   | 24.5M (1.0x) | 24.8M (1.1x) |

### Test

| Format      | State1       |
| ----------- | ------------ |
| JSON        | 3.7M (3.1x)  |
| MessagePack | 4.7M (2.4x)  |
| Protobuf    | 7.9M (1.4x)  |
| DeltaPack   | 11.5M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.0M (1.3x) | 2.6M (1.3x) |
| MessagePack | 2.5M (1.6x) | 2.3M (1.4x) |
| Protobuf    | 4.0M (1.0x) | 3.3M (1.0x) |
| DeltaPack   | 3.7M (1.1x) | 3.0M (1.1x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 368.2K (5.9x) | 218.9K (6.1x) | 185.4K (6.0x) | 174.9K (6.1x) | 86.7K (5.4x)  | 86.8K (5.4x)  |
| MessagePack | 497.0K (4.4x) | 305.6K (4.4x) | 263.1K (4.2x) | 249.5K (4.3x) | 121.1K (3.9x) | 122.6K (3.8x) |
| Protobuf    | 1.1M (2.0x)   | 995.0K (1.3x) | 772.9K (1.4x) | 711.5K (1.5x) | 326.5K (1.4x) | 325.6K (1.4x) |
| DeltaPack   | 2.2M (1.0x)   | 1.3M (1.0x)   | 1.1M (1.0x)   | 1.1M (1.0x)   | 466.6K (1.0x) | 468.6K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 5.9M (4.1x)  | 5.9M (4.2x)  |
| MessagePack | 6.5M (3.8x)  | 6.5M (3.8x)  |
| Protobuf    | 17.9M (1.4x) | 19.7M (1.2x) |
| DeltaPack   | 24.6M (1.0x) | 24.5M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.8M (4.8x) |
| MessagePack | 3.2M (2.6x) |
| Protobuf    | 6.1M (1.4x) |
| DeltaPack   | 8.5M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.8M (2.1x) | 1.6M (2.2x) |
| MessagePack | 1.8M (2.1x) | 1.7M (2.0x) |
| Protobuf    | 3.5M (1.1x) | 2.9M (1.2x) |
| DeltaPack   | 3.8M (1.0x) | 3.4M (1.0x) |
