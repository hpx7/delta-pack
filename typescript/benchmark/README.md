# TypeScript Performance Benchmarks

Performance comparison of DeltaPack against JSON, MessagePack, and Protobuf.

## Running

```bash
# From the typescript directory
npm run bench:build  # Generate code + compile
npm run bench        # Run all benchmarks (codegen mode)

# Run specific benchmarks (case-insensitive, partial match)
npm run bench primitives
npm run bench gamestate user

# Run in interpreter mode (parses schemas at runtime)
npm run bench -- --interpreter
npm run bench -- --interpreter primitives

# Browser benchmarks
npx serve benchmark  # then open http://localhost:3000
# Optional query params: ?mode=interpreter&filter=primitives
```

## Modes

- **Codegen mode** (default): Uses pre-generated TypeScript/JS for DeltaPack and Protobuf
- **Interpreter mode** (`--interpreter`): Parses YAML schemas and .proto files at runtime

## Results (codegen)

Benchmarks run on Node v24.11.1, Apple M4 Pro.

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 370.0K (3.3x) | 222.3K (3.4x) | 182.1K (3.3x) | 171.8K (3.4x) | 87.6K (2.5x)  | 88.6K (2.5x)  |
| MessagePack | 275.6K (4.5x) | 164.5K (4.6x) | 137.9K (4.4x) | 129.0K (4.5x) | 64.5K (3.5x)  | 65.0K (3.5x)  |
| Protobuf    | 368.7K (3.3x) | 221.3K (3.4x) | 179.9K (3.4x) | 169.8K (3.4x) | 75.9K (2.9x)  | 76.5K (2.9x)  |
| DeltaPack   | 1.2M (1.0x)   | 750.8K (1.0x) | 609.7K (1.0x) | 581.1K (1.0x) | 222.8K (1.0x) | 224.3K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.3M (2.5x) | 3.3M (2.6x) |
| MessagePack | 4.0M (2.1x) | 4.1M (2.1x) |
| Protobuf    | 6.5M (1.3x) | 6.3M (1.3x) |
| DeltaPack   | 8.3M (1.0x) | 8.4M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.6M (2.4x) |
| MessagePack | 2.2M (1.8x) |
| Protobuf    | 2.4M (1.6x) |
| DeltaPack   | 3.9M (1.0x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 876.4K (2.0x) | 383.8K (3.0x) |
| MessagePack | 709.6K (2.5x) | 446.7K (2.6x) |
| Protobuf    | 823.1K (2.1x) | 553.0K (2.1x) |
| DeltaPack   | 1.7M (1.0x)   | 1.1M (1.0x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 324.5K (3.6x) | 197.6K (3.5x) | 160.8K (3.4x) | 152.3K (3.5x) | 73.1K (2.9x)  | 70.9K (3.0x)  |
| MessagePack | 183.3K (6.3x) | 106.7K (6.4x) | 95.2K (5.7x)  | 91.2K (5.9x)  | 44.3K (4.7x)  | 43.0K (4.9x)  |
| Protobuf    | 930.7K (1.2x) | 553.5K (1.2x) | 434.3K (1.3x) | 407.7K (1.3x) | 169.5K (1.2x) | 175.8K (1.2x) |
| DeltaPack   | 1.2M (1.0x)   | 685.6K (1.0x) | 544.5K (1.0x) | 533.5K (1.0x) | 209.6K (1.0x) | 211.5K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 4.5M (3.1x)  | 4.4M (3.1x)  |
| MessagePack | 7.3M (1.9x)  | 7.1M (2.0x)  |
| Protobuf    | 14.1M (1.0x) | 13.9M (1.0x) |
| DeltaPack   | 12.9M (1.1x) | 12.9M (1.1x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.6M (3.6x) |
| MessagePack | 1.6M (3.5x) |
| Protobuf    | 5.8M (1.0x) |
| DeltaPack   | 5.4M (1.1x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 724.1K (2.0x) | 379.1K (2.6x) |
| MessagePack | 570.3K (2.5x) | 334.3K (3.0x) |
| Protobuf    | 1.4M (1.0x)   | 986.5K (1.0x) |
| DeltaPack   | 1.1M (1.3x)   | 783.0K (1.3x) |
