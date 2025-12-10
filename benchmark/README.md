## Encoding Size Comparison (bytes)

Lower is better. The multiplier shows how much larger each format is compared to the smallest.

### GameState

| Format      | State1       | State2       | State3       | State4       | State5       | State6       |
| ----------- | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
| JSON        | 1641B (8.3x) | 2683B (8.4x) | 3094B (7.6x) | 3273B (7.6x) | 6693B (6.8x) | 6701B (6.8x) |
| MessagePack | 1219B (6.2x) | 1967B (6.1x) | 2369B (5.8x) | 2514B (5.8x) | 5019B (5.1x) | 5025B (5.1x) |
| Protobuf    | 338B (1.7x)  | 572B (1.8x)  | 714B (1.8x)  | 761B (1.8x)  | 1732B (1.7x) | 1732B (1.7x) |
| Delta-Pack  | 197B (1.0x)  | 321B (1.0x)  | 407B (1.0x)  | 431B (1.0x)  | 991B (1.0x)  | 991B (1.0x)  |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 113B (4.9x) | 114B (5.0x) |
| MessagePack | 97B (4.2x)  | 97B (4.2x)  |
| Protobuf    | 27B (1.2x)  | 27B (1.2x)  |
| Delta-Pack  | 23B (1.0x)  | 23B (1.0x)  |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 321B (2.5x) | 357B (2.5x) |
| MessagePack | 257B (2.0x) | 283B (2.0x) |
| Protobuf    | 151B (1.2x) | 173B (1.2x) |
| Delta-Pack  | 129B (1.0x) | 145B (1.0x) |

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 517.0K (1.6x) | 310.9K (1.5x) | 232.4K (1.7x) | 221.3K (1.7x) | 114.8K (1.4x) | 110.3K (1.5x) |
| MessagePack | 203.4K (4.1x) | 125.0K (3.7x) | 101.5K (3.9x) | 101.5K (3.8x) | 49.0K (3.3x)  | 47.6K (3.4x)  |
| Protobuf    | 343.6K (2.4x) | 203.5K (2.3x) | 163.4K (2.4x) | 155.1K (2.5x) | 69.8K (2.3x)  | 69.3K (2.3x)  |
| Delta-Pack  | 838.8K (1.0x) | 462.0K (1.0x) | 393.4K (1.0x) | 384.6K (1.0x) | 163.1K (1.0x) | 160.8K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 5.4M (1.0x) | 5.4M (1.0x) |
| MessagePack | 1.7M (3.2x) | 1.7M (3.2x) |
| Protobuf    | 5.2M (1.0x) | 5.2M (1.0x) |
| Delta-Pack  | 2.7M (2.0x) | 2.7M (2.0x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 2.1M (1.0x)   | 2.0M (1.0x)   |
| MessagePack | 849.9K (2.5x) | 772.2K (2.5x) |
| Protobuf    | 1.1M (1.9x)   | 928.1K (2.1x) |
| Delta-Pack  | 1.2M (1.7x)   | 1.1M (1.8x)   |
