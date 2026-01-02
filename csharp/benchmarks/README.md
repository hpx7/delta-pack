# C# Performance Benchmarks

Performance comparison of DeltaPack against System.Text.Json and MessagePack-CSharp.

## Running

```bash
# From csharp directory
benchmarks/build.sh                         # Generate code
dotnet run -c Release --project benchmarks  # Run benchmarks
```

## Results

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 585.6K (4.0x) | 391.2K (3.9x) | 307.4K (4.0x) | 288.4K (3.9x) | 143.3K (2.8x) | 141.7K (2.8x) |
| MessagePack | 862.2K (2.7x) | 538.5K (2.8x) | 472.8K (2.6x) | 454.3K (2.5x) | 218.6K (1.8x) | 218.6K (1.8x) |
| Protobuf    | 1.1M (2.1x)   | 1.1M (1.4x)   | 815.8K (1.5x) | 723.8K (1.5x) | 329.8K (1.2x) | 329.9K (1.2x) |
| DeltaPack   | 2.4M (1.0x)   | 1.5M (1.0x)   | 1.2M (1.0x)   | 1.1M (1.0x)   | 400.2K (1.0x) | 400.5K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 8.0M (3.1x)  | 8.6M (3.2x)  |
| MessagePack | 7.6M (3.3x)  | 7.6M (3.6x)  |
| Protobuf    | 24.9M (1.0x) | 27.7M (1.0x) |
| DeltaPack   | 22.1M (1.1x) | 22.2M (1.2x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 3.9M (2.6x) |
| MessagePack | 5.2M (1.9x) |
| Protobuf    | 8.4M (1.2x) |
| DeltaPack   | 9.9M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.1M (1.4x) | 2.6M (1.3x) |
| MessagePack | 2.5M (1.6x) | 2.4M (1.4x) |
| Protobuf    | 4.2M (1.0x) | 3.5M (1.0x) |
| DeltaPack   | 3.5M (1.2x) | 2.9M (1.2x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 381.7K (5.2x) | 227.9K (5.5x) | 193.3K (5.5x) | 183.7K (5.7x) | 90.2K (5.2x)  | 88.7K (5.2x)  |
| MessagePack | 512.0K (3.9x) | 312.5K (4.0x) | 269.2K (3.9x) | 258.2K (4.0x) | 123.7K (3.8x) | 124.1K (3.7x) |
| Protobuf    | 1.1M (1.8x)   | 1.0M (1.2x)   | 800.0K (1.3x) | 745.2K (1.4x) | 340.3K (1.4x) | 333.5K (1.4x) |
| DeltaPack   | 2.0M (1.0x)   | 1.3M (1.0x)   | 1.1M (1.0x)   | 1.0M (1.0x)   | 465.1K (1.0x) | 464.5K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 6.2M (3.3x)  | 6.1M (3.6x)  |
| MessagePack | 6.8M (3.0x)  | 6.7M (3.2x)  |
| Protobuf    | 20.3M (1.0x) | 21.8M (1.0x) |
| DeltaPack   | 20.4M (1.0x) | 20.4M (1.1x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.9M (3.9x) |
| MessagePack | 3.4M (2.1x) |
| Protobuf    | 6.6M (1.1x) |
| DeltaPack   | 7.3M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.9M (1.9x) | 1.6M (2.0x) |
| MessagePack | 1.9M (1.9x) | 1.7M (1.9x) |
| Protobuf    | 3.6M (1.0x) | 2.9M (1.1x) |
| DeltaPack   | 3.6M (1.0x) | 3.2M (1.0x) |
