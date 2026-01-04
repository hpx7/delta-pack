# TypeScript Performance Benchmarks

Performance comparison of DeltaPack against JSON and MessagePack.

## Running

```bash
# From the typescript directory
npm run bench:build  # Generate code + compile
npm run bench        # Run all benchmarks

# Run specific benchmarks (case-insensitive, partial match)
npm run bench primitives
npm run bench gamestate user
```

## Results

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 462.3K (2.1x) | 294.9K (2.0x) | 209.0K (2.3x) | 202.9K (2.3x) | 104.8K (1.8x) | 104.4K (1.7x) |
| MessagePack | 228.1K (4.3x) | 139.8K (4.2x) | 120.7K (4.0x) | 110.6K (4.2x) | 52.3K (3.5x)  | 54.2K (3.4x)  |
| Protobuf    | 316.2K (3.1x) | 185.7K (3.2x) | 158.3K (3.1x) | 148.6K (3.1x) | 68.8K (2.7x)  | 69.7K (2.6x)  |
| DeltaPack   | 987.8K (1.0x) | 592.9K (1.0x) | 485.6K (1.0x) | 462.7K (1.0x) | 184.6K (1.0x) | 182.4K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 4.7M (1.4x) | 4.7M (1.4x) |
| MessagePack | 3.8M (1.7x) | 3.8M (1.7x) |
| Protobuf    | 5.3M (1.2x) | 5.3M (1.2x) |
| DeltaPack   | 6.4M (1.0x) | 6.4M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.1M (1.5x) |
| MessagePack | 1.9M (1.6x) |
| Protobuf    | 2.0M (1.6x) |
| DeltaPack   | 3.1M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.9M (1.0x) | 1.8M (1.0x)   |
| MessagePack | 1.2M (1.6x) | 1.1M (1.6x)   |
| Protobuf    | 1.1M (1.8x) | 901.7K (2.0x) |
| DeltaPack   | 1.7M (1.1x) | 1.4M (1.2x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 291.0K (3.3x) | 179.4K (3.2x) | 144.5K (3.3x) | 136.3K (3.4x) | 64.3K (3.0x)  | 64.5K (3.0x)  |
| MessagePack | 176.3K (5.5x) | 103.6K (5.6x) | 92.3K (5.1x)  | 86.2K (5.3x)  | 42.1K (4.6x)  | 40.9K (4.7x)  |
| Protobuf    | 895.3K (1.1x) | 529.9K (1.1x) | 416.3K (1.1x) | 388.2K (1.2x) | 168.8K (1.2x) | 166.2K (1.2x) |
| DeltaPack   | 973.5K (1.0x) | 577.5K (1.0x) | 469.7K (1.0x) | 457.5K (1.0x) | 194.6K (1.0x) | 193.5K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 3.9M (2.7x)  | 3.9M (2.7x)  |
| MessagePack | 6.5M (1.6x)  | 6.3M (1.7x)  |
| Protobuf    | 10.5M (1.0x) | 10.7M (1.0x) |
| DeltaPack   | 9.1M (1.2x)  | 9.1M (1.2x)  |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.5M (2.9x) |
| MessagePack | 1.6M (2.8x) |
| Protobuf    | 4.4M (1.0x) |
| DeltaPack   | 3.6M (1.2x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.2M (1.5x) | 1.1M (1.3x)   |
| MessagePack | 1.1M (1.7x) | 954.4K (1.5x) |
| Protobuf    | 1.8M (1.0x) | 1.4M (1.0x)   |
| DeltaPack   | 1.5M (1.2x) | 1.2M (1.2x)   |
