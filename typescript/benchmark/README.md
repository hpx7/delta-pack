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
| JSON        | 424.4K (2.5x) | 264.5K (2.4x) | 209.8K (2.5x) | 193.0K (2.6x) | 101.2K (1.9x) | 101.2K (1.9x) |
| MessagePack | 303.3K (3.5x) | 193.5K (3.2x) | 162.5K (3.2x) | 140.9K (3.6x) | 67.1K (2.8x)  | 68.2K (2.8x)  |
| DeltaPack   | 1.1M (1.0x)   | 625.2K (1.0x) | 516.0K (1.0x) | 500.6K (1.0x) | 188.0K (1.0x) | 189.0K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 4.7M (1.3x) | 4.8M (1.4x) |
| MessagePack | 4.2M (1.5x) | 4.3M (1.5x) |
| DeltaPack   | 6.4M (1.0x) | 6.5M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.1M (1.4x) |
| MessagePack | 2.2M (1.3x) |
| DeltaPack   | 3.0M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.9M (1.0x) | 1.8M (1.0x) |
| MessagePack | 1.6M (1.2x) | 1.4M (1.3x) |
| DeltaPack   | 1.7M (1.1x) | 1.5M (1.2x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 334.6K (3.3x) | 205.6K (3.2x) | 165.7K (3.3x) | 156.7K (3.3x) | 74.3K (2.8x)  | 73.8K (2.9x)  |
| MessagePack | 183.6K (6.0x) | 109.8K (6.0x) | 96.4K (5.6x)  | 90.3K (5.7x)  | 44.5K (4.7x)  | 43.7K (4.8x)  |
| DeltaPack   | 1.1M (1.0x)   | 654.9K (1.0x) | 539.0K (1.0x) | 518.1K (1.0x) | 210.4K (1.0x) | 211.8K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 5.0M (2.0x)  | 5.0M (2.0x)  |
| MessagePack | 6.5M (1.6x)  | 6.5M (1.6x)  |
| DeltaPack   | 10.1M (1.0x) | 10.0M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.7M (2.5x) |
| MessagePack | 1.6M (2.6x) |
| DeltaPack   | 4.2M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.4M (1.1x) | 1.3M (1.0x) |
| MessagePack | 1.1M (1.3x) | 1.0M (1.2x) |
| DeltaPack   | 1.5M (1.0x) | 1.2M (1.1x) |
