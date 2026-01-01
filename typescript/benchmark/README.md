# TypeScript Performance Benchmarks

Performance comparison of DeltaPack against JSON and MessagePack.

## Running

```bash
# From the typescript directory
npm run bench:build  # Generate code + compile
npm run bench        # Run benchmarks
```

## Results

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 472.3K (2.1x) | 297.0K (1.9x) | 211.2K (2.3x) | 201.0K (2.2x) | 106.3K (1.7x) | 106.2K (1.7x) |
| MessagePack | 228.1K (4.3x) | 137.1K (4.2x) | 123.0K (3.9x) | 111.5K (4.0x) | 56.0K (3.2x)  | 53.5K (3.4x)  |
| Protobuf    | 322.3K (3.0x) | 196.3K (2.9x) | 163.2K (3.0x) | 153.1K (2.9x) | 69.8K (2.6x)  | 72.1K (2.5x)  |
| DeltaPack   | 975.3K (1.0x) | 574.1K (1.0x) | 485.3K (1.0x) | 442.1K (1.0x) | 179.2K (1.0x) | 183.0K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 4.8M (1.3x) | 4.8M (1.3x) |
| MessagePack | 3.6M (1.8x) | 3.6M (1.7x) |
| Protobuf    | 5.4M (1.2x) | 5.5M (1.1x) |
| DeltaPack   | 6.3M (1.0x) | 6.2M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.1M (1.6x) |
| MessagePack | 1.8M (1.8x) |
| Protobuf    | 2.1M (1.5x) |
| DeltaPack   | 3.3M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 2.0M (1.0x) | 1.8M (1.0x)   |
| MessagePack | 1.2M (1.6x) | 1.1M (1.6x)   |
| Protobuf    | 1.1M (1.8x) | 944.2K (1.9x) |
| DeltaPack   | 1.7M (1.2x) | 1.4M (1.3x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 297.1K (3.3x) | 184.6K (3.2x) | 147.2K (3.3x) | 137.2K (3.4x) | 65.5K (3.0x)  | 66.4K (2.9x)  |
| MessagePack | 184.4K (5.3x) | 109.5K (5.4x) | 92.5K (5.2x)  | 89.0K (5.2x)  | 43.5K (4.6x)  | 43.3K (4.5x)  |
| Protobuf    | 927.7K (1.1x) | 546.1K (1.1x) | 419.6K (1.1x) | 389.6K (1.2x) | 172.5K (1.2x) | 172.5K (1.1x) |
| DeltaPack   | 985.2K (1.0x) | 587.2K (1.0x) | 479.3K (1.0x) | 465.9K (1.0x) | 198.8K (1.0x) | 195.3K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 4.0M (2.9x)  | 4.0M (2.8x)  |
| MessagePack | 6.5M (1.8x)  | 6.5M (1.7x)  |
| Protobuf    | 11.4M (1.0x) | 11.4M (1.0x) |
| DeltaPack   | 9.4M (1.2x)  | 9.4M (1.2x)  |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.5M (3.1x) |
| MessagePack | 1.6M (3.0x) |
| Protobuf    | 4.8M (1.0x) |
| DeltaPack   | 3.6M (1.3x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.2M (1.5x) | 1.1M (1.3x) |
| MessagePack | 1.2M (1.6x) | 1.0M (1.5x) |
| Protobuf    | 1.9M (1.0x) | 1.5M (1.0x) |
| DeltaPack   | 1.5M (1.2x) | 1.2M (1.2x) |
