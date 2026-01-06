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
| JSON        | 331.9K (3.2x) | 201.6K (3.2x) | 163.6K (3.3x) | 155.6K (3.3x) | 79.7K (2.4x)  | 79.4K (2.5x)  |
| MessagePack | 270.6K (4.0x) | 166.9K (3.9x) | 153.1K (3.5x) | 135.9K (3.7x) | 65.1K (2.9x)  | 65.2K (3.0x)  |
| Protobuf    | 351.5K (3.1x) | 210.4K (3.1x) | 172.0K (3.1x) | 153.9K (3.3x) | 69.4K (2.8x)  | 72.6K (2.7x)  |
| DeltaPack   | 1.1M (1.0x)   | 651.0K (1.0x) | 537.0K (1.0x) | 509.0K (1.0x) | 191.9K (1.0x) | 196.3K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.0M (2.4x) | 3.0M (2.4x) |
| MessagePack | 4.4M (1.6x) | 4.4M (1.6x) |
| Protobuf    | 6.0M (1.2x) | 6.0M (1.2x) |
| DeltaPack   | 7.1M (1.0x) | 7.1M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.5M (2.1x) |
| MessagePack | 2.2M (1.4x) |
| Protobuf    | 2.3M (1.4x) |
| DeltaPack   | 3.1M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.3M (1.3x) | 1.2M (1.2x)   |
| MessagePack | 1.5M (1.1x) | 1.4M (1.1x)   |
| Protobuf    | 1.1M (1.5x) | 952.3K (1.5x) |
| DeltaPack   | 1.7M (1.0x) | 1.5M (1.0x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 308.2K (3.5x) | 190.6K (3.4x) | 154.2K (3.4x) | 144.5K (3.6x) | 70.4K (2.9x)  | 69.7K (3.0x)  |
| MessagePack | 177.1K (6.1x) | 105.2K (6.1x) | 91.0K (5.7x)  | 85.7K (6.0x)  | 42.4K (4.8x)  | 42.1K (4.9x)  |
| Protobuf    | 908.1K (1.2x) | 542.1K (1.2x) | 416.8K (1.3x) | 394.9K (1.3x) | 170.2K (1.2x) | 170.3K (1.2x) |
| DeltaPack   | 1.1M (1.0x)   | 646.5K (1.0x) | 521.5K (1.0x) | 515.3K (1.0x) | 204.7K (1.0x) | 205.7K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 4.3M (3.1x)  | 4.3M (3.2x)  |
| MessagePack | 7.3M (1.8x)  | 7.2M (1.9x)  |
| Protobuf    | 13.5M (1.0x) | 13.5M (1.0x) |
| DeltaPack   | 10.0M (1.4x) | 9.9M (1.4x)  |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.6M (3.7x) |
| MessagePack | 1.6M (3.6x) |
| Protobuf    | 5.7M (1.0x) |
| DeltaPack   | 4.4M (1.3x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.3M (1.4x) | 1.2M (1.2x)   |
| MessagePack | 1.1M (1.6x) | 993.6K (1.4x) |
| Protobuf    | 1.8M (1.0x) | 1.4M (1.0x)   |
| DeltaPack   | 1.4M (1.2x) | 1.1M (1.2x)   |
