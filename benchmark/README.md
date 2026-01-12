# Encoding Size Benchmarks

Language-agnostic comparison of serialization formats by encoded size.

For performance benchmarks, see:

- TypeScript: `typescript/benchmark/`
- C#: `csharp/benchmarks/`

## Running

```bash
npm run bench
```

## Full Encoding Size Comparison (bytes)

Lower is better. Multiplier shows size relative to smallest format.

### GameState

| Format      | State1       | State2       | State3       | State4       | State5       | State6       |
| ----------- | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
| JSON        | 1641B (8.9x) | 2683B (9.1x) | 3094B (8.3x) | 3273B (8.2x) | 6693B (7.4x) | 6701B (7.4x) |
| MessagePack | 1253B (6.8x) | 2017B (6.8x) | 2431B (6.5x) | 2580B (6.5x) | 5155B (5.7x) | 5161B (5.7x) |
| Protobuf    | 338B (1.8x)  | 572B (1.9x)  | 714B (1.9x)  | 761B (1.9x)  | 1732B (1.9x) | 1732B (1.9x) |
| Delta-Pack  | 184B (1.0x)  | 296B (1.0x)  | 374B (1.0x)  | 397B (1.0x)  | 907B (1.0x)  | 907B (1.0x)  |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 113B (4.9x) | 114B (5.0x) |
| MessagePack | 99B (4.3x)  | 99B (4.3x)  |
| Protobuf    | 27B (1.2x)  | 27B (1.2x)  |
| Delta-Pack  | 23B (1.0x)  | 23B (1.0x)  |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 231B (4.1x) |
| MessagePack | 167B (3.0x) |
| Protobuf    | 79B (1.4x)  |
| Delta-Pack  | 56B (1.0x)  |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 617B (3.8x) | 973B (4.1x) |
| MessagePack | 481B (3.0x) | 751B (3.2x) |
| Protobuf    | 197B (1.2x) | 293B (1.2x) |
| Delta-Pack  | 161B (1.0x) | 238B (1.0x) |

## Delta Encoding Size Comparison (bytes)

Compares delta-pack's `encodeDiff(prev, next)` vs re-encoding with other formats.

This demonstrates bandwidth savings for incremental state updates.

### GameState

| Transition | JSON  | MessagePack | Protobuf | Delta-Pack Full | Delta-Pack Diff | Savings |
| ---------- | ----- | ----------- | -------- | --------------- | --------------- | ------- |
| State1→2   | 2683B | 2017B       | 572B     | 296B            | 134B            | 77%     |
| State2→3   | 3094B | 2431B       | 714B     | 374B            | 204B            | 71%     |
| State3→4   | 3273B | 2580B       | 761B     | 397B            | 114B            | 85%     |
| State4→5   | 6693B | 5155B       | 1732B    | 907B            | 609B            | 65%     |
| State5→6   | 6701B | 5161B       | 1732B    | 907B            | 102B            | 94%     |

### Primitives

| Transition | JSON | MessagePack | Protobuf | Delta-Pack Full | Delta-Pack Diff | Savings |
| ---------- | ---- | ----------- | -------- | --------------- | --------------- | ------- |
| State1→2   | 114B | 99B         | 27B      | 23B             | 23B             | 15%     |

### User

| Transition | JSON | MessagePack | Protobuf | Delta-Pack Full | Delta-Pack Diff | Savings |
| ---------- | ---- | ----------- | -------- | --------------- | --------------- | ------- |
| State1→2   | 973B | 751B        | 293B     | 238B            | 166B            | 43%     |
