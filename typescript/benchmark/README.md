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

## Results

Benchmarks run on Node v24.11.1, Apple M4 Pro.

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 370.1K (2.8x) | 227.2K (2.8x) | 184.3K (2.8x) | 174.4K (2.8x) | 87.5K (2.0x)  | 87.6K (2.0x)  |
| MessagePack | 305.8K (3.4x) | 183.2K (3.5x) | 158.4K (3.3x) | 150.5K (3.2x) | 72.1K (2.5x)  | 71.0K (2.5x)  |
| Protobuf    | 384.9K (2.7x) | 224.9K (2.8x) | 182.8K (2.8x) | 171.6K (2.8x) | 77.2K (2.3x)  | 73.5K (2.4x)  |
| DeltaPack   | 1.0M (1.0x)   | 639.1K (1.0x) | 515.3K (1.0x) | 484.7K (1.0x) | 179.1K (1.0x) | 179.3K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.3M (2.2x) | 3.3M (2.2x) |
| MessagePack | 4.7M (1.5x) | 4.7M (1.5x) |
| Protobuf    | 6.6M (1.1x) | 6.4M (1.1x) |
| DeltaPack   | 7.2M (1.0x) | 7.1M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.6M (2.5x) |
| MessagePack | 2.3M (1.8x) |
| Protobuf    | 2.5M (1.7x) |
| DeltaPack   | 4.1M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.4M (1.1x) | 1.3M (1.1x)   |
| MessagePack | 1.6M (1.0x) | 1.4M (1.0x)   |
| Protobuf    | 1.2M (1.3x) | 974.8K (1.4x) |
| DeltaPack   | 1.5M (1.1x) | 1.2M (1.1x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 327.8K (3.7x) | 201.8K (3.6x) | 162.7K (3.6x) | 154.1K (3.6x) | 73.0K (3.0x)  | 73.2K (3.0x)  |
| MessagePack | 187.0K (6.5x) | 112.1K (6.5x) | 96.7K (6.0x)  | 90.7K (6.2x)  | 44.5K (5.0x)  | 44.4K (5.0x)  |
| Protobuf    | 954.8K (1.3x) | 559.3K (1.3x) | 440.7K (1.3x) | 411.9K (1.4x) | 177.8K (1.2x) | 170.1K (1.3x) |
| DeltaPack   | 1.2M (1.0x)   | 724.8K (1.0x) | 579.8K (1.0x) | 561.2K (1.0x) | 221.0K (1.0x) | 222.3K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 4.5M (3.1x)  | 4.5M (3.2x)  |
| MessagePack | 7.5M (1.9x)  | 7.4M (1.9x)  |
| Protobuf    | 14.2M (1.0x) | 14.1M (1.0x) |
| DeltaPack   | 13.1M (1.1x) | 13.1M (1.1x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.6M (3.5x) |
| MessagePack | 1.7M (3.5x) |
| Protobuf    | 5.8M (1.0x) |
| DeltaPack   | 5.5M (1.1x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.3M (1.4x) | 1.2M (1.2x) |
| MessagePack | 1.1M (1.6x) | 1.0M (1.5x) |
| Protobuf    | 1.8M (1.0x) | 1.5M (1.0x) |
| DeltaPack   | 1.5M (1.2x) | 1.2M (1.2x) |
