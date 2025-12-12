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
| JSON        | 460.4K (2.2x) | 281.3K (1.9x) | 210.3K (2.1x) | 196.2K (2.2x) | 103.3K (1.7x) | 102.6K (1.6x) |
| MessagePack | 191.3K (5.3x) | 120.8K (4.5x) | 105.7K (4.3x) | 98.3K (4.4x)  | 45.9K (3.7x)  | 47.1K (3.5x)  |
| Protobuf    | 335.1K (3.0x) | 199.5K (2.7x) | 166.8K (2.7x) | 152.0K (2.8x) | 66.6K (2.6x)  | 68.7K (2.4x)  |
| Delta-Pack  | 1.0M (1.0x)   | 542.2K (1.0x) | 452.0K (1.0x) | 430.2K (1.0x) | 170.9K (1.0x) | 167.1K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 4.5M (1.4x) | 4.4M (1.4x) |
| MessagePack | 1.7M (3.7x) | 1.7M (3.7x) |
| Protobuf    | 5.1M (1.2x) | 5.0M (1.3x) |
| Delta-Pack  | 6.2M (1.0x) | 6.2M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.0M (1.3x) |
| MessagePack | 1.1M (2.3x) |
| Protobuf    | 2.0M (1.3x) |
| Delta-Pack  | 2.6M (1.0x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 1.9M (1.0x)   | 1.7M (1.0x)   |
| MessagePack | 783.9K (2.4x) | 730.4K (2.4x) |
| Protobuf    | 1.1M (1.7x)   | 878.2K (2.0x) |
| Delta-Pack  | 1.7M (1.1x)   | 1.3M (1.3x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 278.9K (4.1x) | 170.7K (4.0x) | 137.2K (3.7x) | 129.8K (4.1x) | 62.4K (3.5x)  | 62.1K (3.5x)  |
| MessagePack | 203.6K (5.7x) | 116.1K (5.9x) | 100.7K (5.0x) | 94.8K (5.6x)  | 41.4K (5.2x)  | 41.0K (5.3x)  |
| Protobuf    | 807.6K (1.4x) | 480.0K (1.4x) | 371.0K (1.4x) | 356.6K (1.5x) | 151.5K (1.4x) | 152.0K (1.4x) |
| Delta-Pack  | 1.2M (1.0x)   | 684.4K (1.0x) | 502.5K (1.0x) | 527.1K (1.0x) | 215.5K (1.0x) | 216.3K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 3.4M (3.4x)  | 3.3M (3.4x)  |
| MessagePack | 2.5M (4.7x)  | 2.6M (4.5x)  |
| Protobuf    | 11.4M (1.0x) | 11.4M (1.0x) |
| Delta-Pack  | 7.5M (1.5x)  | 7.6M (1.5x)  |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.4M (3.3x) |
| MessagePack | 1.1M (4.1x) |
| Protobuf    | 4.7M (1.0x) |
| Delta-Pack  | 3.1M (1.5x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 1.1M (1.4x)   | 1.0M (1.2x)   |
| MessagePack | 804.0K (1.9x) | 733.6K (1.7x) |
| Protobuf    | 1.5M (1.0x)   | 1.2M (1.0x)   |
| Delta-Pack  | 1.3M (1.2x)   | 1.1M (1.1x)   |
