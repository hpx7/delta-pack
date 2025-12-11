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
| JSON        | 471.0K (2.2x) | 289.8K (2.0x) | 217.3K (2.1x) | 205.7K (2.2x) | 107.2K (1.6x) | 104.7K (1.7x) |
| MessagePack | 187.9K (5.4x) | 118.6K (4.8x) | 102.3K (4.5x) | 97.2K (4.6x)  | 46.5K (3.8x)  | 46.7K (3.8x)  |
| Protobuf    | 327.7K (3.1x) | 199.3K (2.9x) | 165.3K (2.8x) | 154.7K (2.9x) | 69.0K (2.5x)  | 68.0K (2.6x)  |
| Delta-Pack  | 1.0M (1.0x)   | 571.1K (1.0x) | 464.9K (1.0x) | 443.6K (1.0x) | 175.6K (1.0x) | 176.6K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 4.6M (1.4x) | 4.6M (1.4x) |
| MessagePack | 1.7M (3.7x) | 1.8M (3.6x) |
| Protobuf    | 5.5M (1.2x) | 5.4M (1.2x) |
| Delta-Pack  | 6.4M (1.0x) | 6.4M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.0M (1.4x) |
| MessagePack | 1.1M (2.6x) |
| Protobuf    | 2.0M (1.4x) |
| Delta-Pack  | 2.9M (1.0x) |

### User

| Format      | State1        | State2        |
| ----------- | ------------- | ------------- |
| JSON        | 1.9M (1.0x)   | 1.8M (1.0x)   |
| MessagePack | 817.4K (2.4x) | 757.9K (2.3x) |
| Protobuf    | 1.1M (1.7x)   | 913.1K (1.9x) |
| Delta-Pack  | 1.7M (1.2x)   | 1.4M (1.2x)   |
