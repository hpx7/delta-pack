# Rust Performance Benchmarks

Performance comparison of DeltaPack against serde_json and rmp-serde (MessagePack).

## Running

```bash
# From rust directory
benchmarks/build.sh                    # Generate code
cargo run --release -p delta-pack-benchmarks  # Run all benchmarks

# Run specific benchmarks (case-insensitive, partial match)
cargo run --release -p delta-pack-benchmarks -- primitives
cargo run --release -p delta-pack-benchmarks -- gamestate user
```

## Results (codegen)

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 663.7K (8.8x) | 403.3K (8.6x) | 320.1K (7.9x) | 303.3K (7.7x) | 150.9K (5.2x) | 151.1K (5.3x) |
| MessagePack | 817.7K (7.1x) | 503.8K (6.8x) | 438.4K (5.8x) | 414.6K (5.6x) | 202.6K (3.9x) | 203.1K (3.9x) |
| DeltaPack   | 5.8M (1.0x)   | 3.5M (1.0x)   | 2.5M (1.0x)   | 2.3M (1.0x)   | 785.4K (1.0x) | 798.6K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 10.7M (3.0x) | 10.8M (3.0x) |
| MessagePack | 9.7M (3.3x)  | 9.6M (3.4x)  |
| DeltaPack   | 31.8M (1.0x) | 32.5M (1.0x) |

### Test

| Format      | State1       |
| ----------- | ------------ |
| JSON        | 4.9M (3.8x)  |
| MessagePack | 4.8M (4.0x)  |
| DeltaPack   | 18.9M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.8M (2.8x) | 1.3M (2.9x) |
| MessagePack | 2.0M (2.6x) | 1.4M (2.7x) |
| DeltaPack   | 5.1M (1.0x) | 3.6M (1.0x) |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1         | State2         | State3         | State4         | State5        | State6        |
| ----------- | -------------- | -------------- | -------------- | -------------- | ------------- | ------------- |
| JSON        | 198.7K (16.8x) | 118.5K (17.3x) | 99.7K (16.3x)  | 95.7K (15.7x)  | 46.0K (13.7x) | 46.5K (13.5x) |
| MessagePack | 224.3K (14.9x) | 131.1K (15.6x) | 112.4K (14.5x) | 107.6K (14.0x) | 51.2K (12.3x) | 51.4K (12.2x) |
| DeltaPack   | 3.3M (1.0x)    | 2.1M (1.0x)    | 1.6M (1.0x)    | 1.5M (1.0x)    | 631.8K (1.0x) | 625.7K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 4.7M (6.5x)  | 4.8M (6.3x)  |
| MessagePack | 5.6M (5.4x)  | 5.5M (5.5x)  |
| DeltaPack   | 30.2M (1.0x) | 30.0M (1.0x) |

### Test

| Format      | State1       |
| ----------- | ------------ |
| JSON        | 1.9M (9.6x)  |
| MessagePack | 2.2M (8.4x)  |
| DeltaPack   | 18.5M (1.0x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 568.5K (6.4x) | 357.3K (7.2x) |
| MessagePack | 628.0K (5.8x) | 399.7K (6.5x) |
| DeltaPack   | 3.7M (1.0x)   | 2.6M (1.0x)   |
