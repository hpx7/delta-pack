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
| JSON        | 522.2K (1.9x) | 312.6K (1.7x) | 237.4K (1.9x) | 225.2K (2.0x) | 116.6K (1.5x) | 114.0K (1.6x) |
| MessagePack | 204.2K (4.8x) | 133.5K (4.0x) | 108.8K (4.2x) | 104.6K (4.2x) | 50.5K (3.4x)  | 50.7K (3.5x)  |
| Protobuf    | 350.6K (2.8x) | 208.7K (2.5x) | 171.0K (2.6x) | 160.9K (2.7x) | 72.1K (2.4x)  | 72.4K (2.4x)  |
| Delta-Pack  | 973.3K (1.0x) | 530.6K (1.0x) | 451.7K (1.0x) | 439.4K (1.0x) | 171.7K (1.0x) | 177.0K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 5.7M (1.0x) | 5.7M (1.0x) |
| MessagePack | 1.9M (3.0x) | 1.9M (2.9x) |
| Protobuf    | 5.4M (1.1x) | 5.3M (1.1x) |
| Delta-Pack  | 4.8M (1.2x) | 4.9M (1.2x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 2.2M (1.0x)   | 2.0M (1.0x)   |
| MessagePack | 869.5K (2.5x) | 790.0K (2.5x) |
| Protobuf    | 1.2M (1.8x)   | 1.0M (2.0x)   |
| Delta-Pack  | 1.7M (1.3x)   | 1.4M (1.4x)   |
