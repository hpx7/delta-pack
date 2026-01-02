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
| JSON        | 568.7K (3.1x) | 385.6K (2.8x) | 299.3K (2.9x) | 280.9K (2.8x) | 139.0K (2.3x) | 138.0K (2.3x) |
| MessagePack | 842.5K (2.1x) | 529.6K (2.1x) | 467.7K (1.8x) | 450.2K (1.7x) | 218.3K (1.5x) | 218.2K (1.5x) |
| Protobuf    | 1.1M (1.6x)   | 1.0M (1.1x)   | 778.1K (1.1x) | 694.8K (1.1x) | 317.5K (1.0x) | 316.6K (1.0x) |
| DeltaPack   | 1.8M (1.0x)   | 1.1M (1.0x)   | 854.0K (1.0x) | 781.1K (1.0x) | 297.4K (1.1x) | 295.7K (1.1x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 7.6M (3.2x)  | 8.4M (3.3x)  |
| MessagePack | 7.3M (3.3x)  | 7.3M (3.7x)  |
| Protobuf    | 24.3M (1.0x) | 27.2M (1.0x) |
| DeltaPack   | 13.7M (1.8x) | 13.7M (2.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 3.7M (2.1x) |
| MessagePack | 4.8M (1.6x) |
| Protobuf    | 7.8M (1.0x) |
| DeltaPack   | 7.0M (1.1x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.0M (1.3x) | 2.6M (1.3x) |
| MessagePack | 2.5M (1.6x) | 2.3M (1.4x) |
| Protobuf    | 4.0M (1.0x) | 3.3M (1.0x) |
| DeltaPack   | 2.5M (1.6x) | 2.1M (1.5x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 366.0K (5.3x) | 220.0K (5.6x) | 183.2K (5.5x) | 173.5K (5.7x) | 86.4K (5.1x)  | 86.4K (5.1x)  |
| MessagePack | 497.1K (3.9x) | 304.4K (4.0x) | 263.8K (3.8x) | 253.1K (3.9x) | 121.3K (3.7x) | 122.6K (3.6x) |
| Protobuf    | 1.1M (1.8x)   | 1.0M (1.2x)   | 783.7K (1.3x) | 716.6K (1.4x) | 325.7K (1.4x) | 326.9K (1.4x) |
| DeltaPack   | 1.9M (1.0x)   | 1.2M (1.0x)   | 1.0M (1.0x)   | 993.0K (1.0x) | 443.8K (1.0x) | 441.6K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 6.0M (3.3x)  | 6.0M (3.5x)  |
| MessagePack | 6.5M (3.1x)  | 6.6M (3.2x)  |
| Protobuf    | 19.9M (1.0x) | 21.0M (1.0x) |
| DeltaPack   | 20.0M (1.0x) | 20.1M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.8M (3.9x) |
| MessagePack | 3.4M (2.1x) |
| Protobuf    | 6.3M (1.1x) |
| DeltaPack   | 7.0M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.8M (1.9x) | 1.5M (2.0x) |
| MessagePack | 1.8M (1.9x) | 1.7M (1.9x) |
| Protobuf    | 3.5M (1.0x) | 2.8M (1.1x) |
| DeltaPack   | 3.5M (1.0x) | 3.1M (1.0x) |
