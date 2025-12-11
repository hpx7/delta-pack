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

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 231B (4.1x) |
| MessagePack | 159B (2.8x) |
| Protobuf    | 79B (1.4x)  |
| Delta-Pack  | 57B (1.0x)  |

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
| JSON        | 517.2K (1.9x) | 308.1K (1.8x) | 232.2K (2.0x) | 223.9K (2.0x) | 115.2K (1.5x) | 113.8K (1.5x) |
| MessagePack | 213.5K (4.5x) | 131.9K (4.1x) | 113.3K (4.0x) | 104.0K (4.2x) | 50.8K (3.5x)  | 50.5K (3.5x)  |
| Protobuf    | 349.9K (2.8x) | 208.0K (2.6x) | 173.6K (2.6x) | 163.6K (2.7x) | 72.0K (2.4x)  | 72.2K (2.4x)  |
| Delta-Pack  | 970.6K (1.0x) | 543.5K (1.0x) | 453.0K (1.0x) | 437.9K (1.0x) | 175.4K (1.0x) | 175.8K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 5.7M (1.0x) | 5.7M (1.0x) |
| MessagePack | 1.9M (3.0x) | 1.9M (3.0x) |
| Protobuf    | 5.4M (1.1x) | 5.4M (1.1x) |
| Delta-Pack  | 4.2M (1.3x) | 4.2M (1.3x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.3M (1.1x) |
| MessagePack | 1.1M (2.1x) |
| Protobuf    | 2.1M (1.2x) |
| Delta-Pack  | 2.4M (1.0x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 2.2M (1.0x)   | 2.0M (1.0x)   |
| MessagePack | 857.3K (2.6x) | 791.9K (2.5x) |
| Protobuf    | 1.2M (1.9x)   | 960.8K (2.1x) |
| Delta-Pack  | 1.6M (1.4x)   | 1.3M (1.5x)   |
