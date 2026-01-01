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
| JSON        | 581.3K (3.1x) | 390.3K (2.8x) | 304.4K (2.8x) | 283.4K (2.8x) | 139.7K (2.2x) | 139.2K (2.2x) |
| MessagePack | 906.0K (2.0x) | 554.7K (2.0x) | 477.3K (1.8x) | 471.3K (1.7x) | 225.8K (1.4x) | 222.3K (1.4x) |
| DeltaPack   | 1.8M (1.0x)   | 1.1M (1.0x)   | 862.6K (1.0x) | 784.2K (1.0x) | 307.8K (1.0x) | 307.6K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 8.0M (1.9x)  | 8.0M (1.9x)  |
| MessagePack | 15.2M (1.0x) | 15.1M (1.0x) |
| DeltaPack   | 14.0M (1.1x) | 14.2M (1.1x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 3.7M (2.1x) |
| MessagePack | 7.7M (1.0x) |
| DeltaPack   | 7.2M (1.1x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.0M (1.0x) | 2.5M (1.1x) |
| MessagePack | 3.1M (1.0x) | 2.9M (1.0x) |
| DeltaPack   | 2.6M (1.2x) | 2.2M (1.3x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 371.1K (5.3x) | 224.7K (5.6x) | 188.4K (5.6x) | 179.4K (5.7x) | 87.9K (5.4x)  | 88.8K (5.4x)  |
| MessagePack | 530.0K (3.7x) | 320.0K (3.9x) | 274.6K (3.8x) | 265.6K (3.9x) | 125.5K (3.8x) | 125.5K (3.8x) |
| DeltaPack   | 2.0M (1.0x)   | 1.3M (1.0x)   | 1.0M (1.0x)   | 1.0M (1.0x)   | 476.1K (1.0x) | 475.7K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 5.9M (3.4x)  | 6.0M (3.4x)  |
| MessagePack | 10.4M (1.9x) | 10.3M (2.0x) |
| DeltaPack   | 20.1M (1.0x) | 20.1M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.8M (3.9x) |
| MessagePack | 4.1M (1.8x) |
| DeltaPack   | 7.3M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.8M (2.0x) | 1.6M (2.0x) |
| MessagePack | 1.9M (1.9x) | 1.9M (1.7x) |
| DeltaPack   | 3.6M (1.0x) | 3.2M (1.0x) |
