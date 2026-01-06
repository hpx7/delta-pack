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

# Browser benchmarks
npx serve benchmark  # then open http://localhost:3000
# Optional: add ?filter=primitives to URL to filter
```

## Results

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 445.5K (1.9x) | 280.3K (1.9x) | 212.2K (2.2x) | 204.8K (2.1x) | 102.3K (1.7x) | 101.2K (1.7x) |
| MessagePack | 286.3K (3.0x) | 173.9K (3.1x) | 149.4K (3.1x) | 133.1K (3.3x) | 66.9K (2.6x)  | 60.9K (2.9x)  |
| Protobuf    | 259.9K (3.3x) | 168.6K (3.2x) | 141.4K (3.2x) | 134.8K (3.3x) | 62.9K (2.8x)  | 63.7K (2.8x)  |
| DeltaPack   | 864.9K (1.0x) | 545.6K (1.0x) | 459.1K (1.0x) | 439.0K (1.0x) | 175.0K (1.0x) | 175.4K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.2M (2.0x) | 3.2M (2.0x) |
| MessagePack | 3.9M (1.6x) | 4.0M (1.6x) |
| Protobuf    | 5.5M (1.2x) | 5.3M (1.2x) |
| DeltaPack   | 6.4M (1.0x) | 6.4M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.7M (1.8x) |
| MessagePack | 2.1M (1.4x) |
| Protobuf    | 2.0M (1.5x) |
| DeltaPack   | 3.0M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.6M (1.0x) | 1.5M (1.0x)   |
| MessagePack | 1.5M (1.1x) | 1.3M (1.1x)   |
| Protobuf    | 1.1M (1.4x) | 944.1K (1.6x) |
| DeltaPack   | 1.6M (1.0x) | 1.4M (1.0x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 281.3K (3.5x) | 171.1K (3.4x) | 138.8K (3.5x) | 131.2K (3.5x) | 63.1K (3.1x)  | 62.2K (3.1x)  |
| MessagePack | 179.0K (5.4x) | 105.6K (5.5x) | 93.6K (5.2x)  | 88.2K (5.3x)  | 43.2K (4.5x)  | 41.9K (4.6x)  |
| Protobuf    | 890.8K (1.1x) | 528.0K (1.1x) | 416.7K (1.2x) | 387.2K (1.2x) | 164.7K (1.2x) | 163.3K (1.2x) |
| DeltaPack   | 971.4K (1.0x) | 580.6K (1.0x) | 489.9K (1.0x) | 465.9K (1.0x) | 194.5K (1.0x) | 191.4K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 3.3M (3.2x)  | 3.3M (3.2x)  |
| MessagePack | 6.4M (1.7x)  | 6.4M (1.7x)  |
| Protobuf    | 10.6M (1.0x) | 10.6M (1.0x) |
| DeltaPack   | 10.3M (1.0x) | 10.4M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.4M (3.3x) |
| MessagePack | 1.6M (3.0x) |
| Protobuf    | 4.7M (1.0x) |
| DeltaPack   | 4.2M (1.1x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.1M (1.6x) | 1.0M (1.4x)   |
| MessagePack | 1.1M (1.7x) | 972.3K (1.5x) |
| Protobuf    | 1.8M (1.0x) | 1.4M (1.0x)   |
| DeltaPack   | 1.5M (1.2x) | 1.2M (1.2x)   |
