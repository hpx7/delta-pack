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

Benchmarks run on Node v24.11.1, Apple M4 Pro.

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 370.6K (2.8x) | 224.1K (2.8x) | 184.3K (2.8x) | 174.9K (2.8x) | 88.8K (2.0x)  | 88.5K (2.0x)  |
| MessagePack | 298.6K (3.5x) | 181.6K (3.5x) | 153.9K (3.3x) | 149.9K (3.3x) | 67.4K (2.7x)  | 71.3K (2.5x)  |
| Protobuf    | 379.8K (2.8x) | 223.0K (2.9x) | 187.9K (2.7x) | 176.8K (2.8x) | 77.2K (2.3x)  | 77.2K (2.3x)  |
| DeltaPack   | 1.1M (1.0x)   | 635.6K (1.0x) | 514.3K (1.0x) | 492.1K (1.0x) | 180.2K (1.0x) | 181.1K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.3M (2.2x) | 3.2M (2.2x) |
| MessagePack | 4.6M (1.6x) | 4.5M (1.5x) |
| Protobuf    | 6.3M (1.1x) | 6.1M (1.1x) |
| DeltaPack   | 7.1M (1.0x) | 7.0M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.6M (2.1x) |
| MessagePack | 2.3M (1.5x) |
| Protobuf    | 2.5M (1.4x) |
| DeltaPack   | 3.4M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.4M (1.1x) | 1.3M (1.1x) |
| MessagePack | 1.5M (1.0x) | 1.4M (1.0x) |
| Protobuf    | 1.2M (1.2x) | 1.0M (1.4x) |
| DeltaPack   | 1.5M (1.0x) | 1.2M (1.2x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 331.0K (3.5x) | 204.2K (3.4x) | 166.3K (3.4x) | 155.6K (3.5x) | 72.6K (3.0x)  | 72.7K (3.0x)  |
| MessagePack | 187.8K (6.2x) | 113.6K (6.2x) | 99.2K (5.8x)  | 93.4K (5.9x)  | 45.1K (4.8x)  | 44.4K (4.9x)  |
| Protobuf    | 928.4K (1.2x) | 559.3K (1.3x) | 441.0K (1.3x) | 405.9K (1.4x) | 174.4K (1.2x) | 172.6K (1.3x) |
| DeltaPack   | 1.2M (1.0x)   | 699.3K (1.0x) | 573.1K (1.0x) | 548.8K (1.0x) | 217.9K (1.0x) | 218.4K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 4.4M (3.2x)  | 4.5M (3.1x)  |
| MessagePack | 7.0M (2.0x)  | 7.0M (2.0x)  |
| Protobuf    | 13.9M (1.0x) | 13.9M (1.0x) |
| DeltaPack   | 12.9M (1.1x) | 12.7M (1.1x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.7M (3.6x) |
| MessagePack | 1.7M (3.5x) |
| Protobuf    | 5.9M (1.0x) |
| DeltaPack   | 4.9M (1.2x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.3M (1.4x) | 1.2M (1.2x) |
| MessagePack | 1.2M (1.6x) | 1.0M (1.4x) |
| Protobuf    | 1.8M (1.0x) | 1.5M (1.0x) |
| DeltaPack   | 1.5M (1.2x) | 1.2M (1.3x) |
