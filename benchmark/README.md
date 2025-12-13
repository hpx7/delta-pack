## Encoding Size Comparison (bytes)

Lower is better. The multiplier shows how much larger each format is compared to the smallest.

### GameState

| Format      | State1       | State2       | State3       | State4       | State5       | State6       |
| ----------- | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
| JSON        | 1641B (8.3x) | 2683B (8.4x) | 3094B (7.6x) | 3273B (7.6x) | 6693B (6.8x) | 6701B (6.8x) |
| MessagePack | 1253B (6.4x) | 2017B (6.3x) | 2431B (6.0x) | 2580B (6.0x) | 5155B (5.2x) | 5161B (5.2x) |
| Protobuf    | 338B (1.7x)  | 572B (1.8x)  | 714B (1.8x)  | 761B (1.8x)  | 1732B (1.7x) | 1732B (1.7x) |
| Delta-Pack  | 197B (1.0x)  | 321B (1.0x)  | 407B (1.0x)  | 431B (1.0x)  | 991B (1.0x)  | 991B (1.0x)  |

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
| MessagePack | 167B (2.9x) |
| Protobuf    | 79B (1.4x)  |
| Delta-Pack  | 57B (1.0x)  |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 321B (2.5x) | 357B (2.5x) |
| MessagePack | 267B (2.1x) | 293B (2.0x) |
| Protobuf    | 151B (1.2x) | 173B (1.2x) |
| Delta-Pack  | 129B (1.0x) | 145B (1.0x) |

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 460.5K (2.4x) | 283.9K (2.2x) | 215.2K (2.4x) | 204.8K (2.3x) | 109.0K (1.7x) | 108.0K (1.7x) |
| MessagePack | 288.6K (3.8x) | 176.8K (3.5x) | 151.0K (3.4x) | 141.4K (3.4x) | 68.5K (2.6x)  | 66.5K (2.7x)  |
| Protobuf    | 345.4K (3.2x) | 210.4K (2.9x) | 172.4K (2.9x) | 159.5K (3.0x) | 71.6K (2.5x)  | 71.8K (2.5x)  |
| Delta-Pack  | 1.1M (1.0x)   | 611.6K (1.0x) | 506.3K (1.0x) | 478.3K (1.0x) | 180.0K (1.0x) | 181.2K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 4.6M (1.3x) | 4.6M (1.3x) |
| MessagePack | 3.9M (1.6x) | 4.0M (1.5x) |
| Protobuf    | 5.5M (1.1x) | 5.5M (1.1x) |
| Delta-Pack  | 6.1M (1.0x) | 6.1M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.0M (1.4x) |
| MessagePack | 2.1M (1.3x) |
| Protobuf    | 2.1M (1.3x) |
| Delta-Pack  | 2.8M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.9M (1.0x) | 1.7M (1.0x)   |
| MessagePack | 1.4M (1.4x) | 1.4M (1.3x)   |
| Protobuf    | 1.2M (1.7x) | 957.1K (1.8x) |
| Delta-Pack  | 1.7M (1.2x) | 1.4M (1.2x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 284.1K (4.1x) | 173.3K (4.0x) | 138.7K (4.0x) | 129.5K (4.2x) | 62.3K (3.6x)  | 62.7K (3.6x)  |
| MessagePack | 178.8K (6.4x) | 103.2K (6.8x) | 90.8K (6.1x)  | 86.4K (6.3x)  | 42.0K (5.3x)  | 41.7K (5.4x)  |
| Protobuf    | 885.7K (1.3x) | 525.4K (1.3x) | 413.4K (1.3x) | 386.2K (1.4x) | 169.8K (1.3x) | 169.6K (1.3x) |
| Delta-Pack  | 1.2M (1.0x)   | 697.7K (1.0x) | 553.6K (1.0x) | 541.6K (1.0x) | 223.7K (1.0x) | 225.2K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 3.5M (3.1x)  | 3.5M (3.1x)  |
| MessagePack | 6.3M (1.7x)  | 6.3M (1.7x)  |
| Protobuf    | 10.9M (1.0x) | 10.9M (1.0x) |
| Delta-Pack  | 9.6M (1.1x)  | 9.7M (1.1x)  |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.4M (3.4x) |
| MessagePack | 1.6M (3.1x) |
| Protobuf    | 4.9M (1.0x) |
| Delta-Pack  | 4.8M (1.0x) |

### User

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 1.2M (1.6x) | 1.1M (1.4x) |
| MessagePack | 1.1M (1.6x) | 1.0M (1.5x) |
| Protobuf    | 1.8M (1.0x) | 1.5M (1.0x) |
| Delta-Pack  | 1.5M (1.2x) | 1.2M (1.2x) |
