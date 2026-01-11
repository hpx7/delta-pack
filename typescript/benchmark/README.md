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
| JSON        | 373.0K (3.4x) | 226.3K (3.4x) | 189.2K (3.3x) | 177.4K (3.4x) | 90.8K (2.5x)  | 90.2K (2.6x)  |
| MessagePack | 287.6K (4.4x) | 172.8K (4.5x) | 146.3K (4.3x) | 134.7K (4.5x) | 68.8K (3.4x)  | 66.4K (3.5x)  |
| Protobuf    | 381.2K (3.3x) | 227.6K (3.4x) | 186.1K (3.4x) | 175.7K (3.4x) | 73.9K (3.1x)  | 75.0K (3.1x)  |
| DeltaPack   | 1.3M (1.0x)   | 774.0K (1.0x) | 629.9K (1.0x) | 601.6K (1.0x) | 230.6K (1.0x) | 230.9K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.4M (2.6x) | 3.4M (2.6x) |
| MessagePack | 4.2M (2.1x) | 4.3M (2.0x) |
| Protobuf    | 6.4M (1.3x) | 6.5M (1.3x) |
| DeltaPack   | 8.6M (1.0x) | 8.7M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.7M (2.4x) |
| MessagePack | 2.3M (1.8x) |
| Protobuf    | 2.5M (1.6x) |
| DeltaPack   | 4.1M (1.0x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 911.4K (1.9x) | 397.3K (3.0x) |
| MessagePack | 765.9K (2.3x) | 469.8K (2.6x) |
| Protobuf    | 833.6K (2.1x) | 566.5K (2.1x) |
| DeltaPack   | 1.8M (1.0x)   | 1.2M (1.0x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 335.2K (3.5x) | 203.8K (3.3x) | 164.4K (3.4x) | 156.3K (3.5x) | 75.2K (2.8x)  | 73.9K (2.9x)  |
| MessagePack | 192.7K (6.1x) | 111.0K (6.1x) | 99.0K (5.7x)  | 94.4K (5.7x)  | 45.9K (4.6x)  | 45.5K (4.7x)  |
| Protobuf    | 959.5K (1.2x) | 549.9K (1.2x) | 443.7K (1.3x) | 411.4K (1.3x) | 176.3K (1.2x) | 177.6K (1.2x) |
| DeltaPack   | 1.2M (1.0x)   | 682.4K (1.0x) | 564.2K (1.0x) | 541.3K (1.0x) | 213.5K (1.0x) | 213.1K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 4.5M (3.1x)  | 4.5M (3.0x)  |
| MessagePack | 7.5M (1.9x)  | 7.6M (1.8x)  |
| Protobuf    | 13.9M (1.0x) | 13.8M (1.0x) |
| DeltaPack   | 13.4M (1.0x) | 13.5M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.6M (3.7x) |
| MessagePack | 1.7M (3.6x) |
| Protobuf    | 6.0M (1.0x) |
| DeltaPack   | 5.6M (1.1x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 749.9K (2.0x) | 393.8K (2.6x) |
| MessagePack | 584.7K (2.6x) | 346.4K (3.0x) |
| Protobuf    | 1.5M (1.0x)   | 1.0M (1.0x)   |
| DeltaPack   | 1.2M (1.3x)   | 818.2K (1.3x) |
