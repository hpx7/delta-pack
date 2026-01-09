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
| JSON        | 358.1K (3.4x) | 216.9K (3.4x) | 172.6K (3.5x) | 165.5K (3.5x) | 84.8K (2.7x)  | 85.9K (2.7x)  |
| MessagePack | 299.0K (4.1x) | 181.8K (4.1x) | 150.5K (4.1x) | 137.5K (4.3x) | 72.1K (3.2x)  | 69.3K (3.4x)  |
| Protobuf    | 378.1K (3.3x) | 220.1K (3.4x) | 181.5K (3.4x) | 168.3K (3.5x) | 75.7K (3.0x)  | 77.2K (3.0x)  |
| DeltaPack   | 1.2M (1.0x)   | 743.3K (1.0x) | 610.1K (1.0x) | 586.1K (1.0x) | 230.2K (1.0x) | 232.3K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 3.2M (2.7x) | 3.2M (2.6x) |
| MessagePack | 4.6M (1.9x) | 4.5M (1.9x) |
| Protobuf    | 6.5M (1.3x) | 6.4M (1.3x) |
| DeltaPack   | 8.6M (1.0x) | 8.5M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.6M (2.5x) |
| MessagePack | 2.3M (1.7x) |
| Protobuf    | 2.4M (1.6x) |
| DeltaPack   | 3.9M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.4M (1.8x) | 1.2M (1.7x)   |
| MessagePack | 1.5M (1.6x) | 1.4M (1.6x)   |
| Protobuf    | 1.2M (2.1x) | 940.1K (2.3x) |
| DeltaPack   | 2.4M (1.0x) | 2.2M (1.0x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 320.6K (3.7x) | 198.4K (3.6x) | 159.2K (3.6x) | 150.3K (3.7x) | 71.7K (3.0x)  | 72.0K (3.1x)  |
| MessagePack | 184.7K (6.5x) | 108.9K (6.5x) | 95.3K (6.0x)  | 90.9K (6.1x)  | 43.9K (5.0x)  | 44.2K (5.0x)  |
| Protobuf    | 929.6K (1.3x) | 555.1K (1.3x) | 432.8K (1.3x) | 404.4K (1.4x) | 173.5K (1.3x) | 174.9K (1.3x) |
| DeltaPack   | 1.2M (1.0x)   | 708.2K (1.0x) | 571.0K (1.0x) | 555.3K (1.0x) | 217.8K (1.0x) | 220.2K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 4.5M (3.2x)  | 4.4M (3.2x)  |
| MessagePack | 7.3M (1.9x)  | 7.4M (1.9x)  |
| Protobuf    | 14.2M (1.0x) | 14.1M (1.0x) |
| DeltaPack   | 13.0M (1.1x) | 12.9M (1.1x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.6M (3.6x) |
| MessagePack | 1.6M (3.6x) |
| Protobuf    | 5.9M (1.0x) |
| DeltaPack   | 5.4M (1.1x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.3M (1.4x) | 1.2M (1.2x) |
| MessagePack | 1.1M (1.6x) | 1.0M (1.4x) |
| Protobuf    | 1.9M (1.0x) | 1.5M (1.0x) |
| DeltaPack   | 1.5M (1.2x) | 1.2M (1.2x) |
