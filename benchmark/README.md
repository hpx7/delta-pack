# Encoding Size Benchmarks

Language-agnostic comparison of serialization formats by encoded size.

For performance benchmarks, see:

- TypeScript: `typescript/benchmark/`
- C#: `csharp/benchmarks/`

## Running

```bash
npm run build
npm run bench
```

## Full Encoding Size Comparison (bytes)

Lower is better. Multiplier shows size relative to smallest format.

### GameState

| Format      | State1       | State2       | State3       | State4       | State5       | State6       |
| ----------- | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
| JSON        | 1641B (8.5x) | 2683B (8.6x) | 3094B (7.8x) | 3273B (7.8x) | 6693B (6.9x) | 6701B (6.9x) |
| MessagePack | 1253B (6.5x) | 2017B (6.5x) | 2431B (6.1x) | 2580B (6.1x) | 5155B (5.3x) | 5161B (5.3x) |
| Protobuf    | 338B (1.8x)  | 572B (1.8x)  | 714B (1.8x)  | 761B (1.8x)  | 1732B (1.8x) | 1732B (1.8x) |
| Delta-Pack  | 192B (1.0x)  | 312B (1.0x)  | 398B (1.0x)  | 421B (1.0x)  | 971B (1.0x)  | 971B (1.0x)  |

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
| JSON        | 321B (2.5x) | 357B (2.5x) |
| MessagePack | 267B (2.1x) | 293B (2.0x) |
| Protobuf    | 151B (1.2x) | 173B (1.2x) |
| Delta-Pack  | 128B (1.0x) | 144B (1.0x) |

## Delta Encoding Size Comparison (bytes)

Compares delta-pack's `encodeDiff(prev, next)` vs re-encoding with other formats.

This demonstrates bandwidth savings for incremental state updates. Other formats must send the full new state, while delta-pack only sends what changed.

### GameState

| Transition | JSON  | MessagePack | Protobuf | Delta-Pack | Delta-Pack Diff | Savings |
| ---------- | ----- | ----------- | -------- | ---------- | --------------- | ------- |
| State1→2   | 2683B | 2017B       | 572B     | 312B       | 142B            | 75%     |
| State2→3   | 3094B | 2431B       | 714B     | 398B       | 200B            | 72%     |
| State3→4   | 3273B | 2580B       | 761B     | 421B       | 97B             | 87%     |
| State4→5   | 6693B | 5155B       | 1732B    | 971B       | 634B            | 63%     |
| State5→6   | 6701B | 5161B       | 1732B    | 971B       | 75B             | 96%     |

### Primitives

| Transition | JSON | MessagePack | Protobuf | Delta-Pack | Delta-Pack Diff | Savings |
| ---------- | ---- | ----------- | -------- | ---------- | --------------- | ------- |
| State1→2   | 114B | 99B         | 27B      | 23B        | 23B             | 15%     |

### User

| Transition | JSON | MessagePack | Protobuf | Delta-Pack | Delta-Pack Diff | Savings |
| ---------- | ---- | ----------- | -------- | ---------- | --------------- | ------- |
| State1→2   | 357B | 293B        | 173B     | 144B       | 50B             | 71%     |
