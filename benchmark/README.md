## Encoding Size Comparison (bytes)

Lower is better. The multiplier shows how much larger each format is compared to the smallest.

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
| Delta-Pack  | 128B (1.0x) | 145B (1.0x) |

## Encoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 476.7K (2.3x) | 296.4K (2.1x) | 220.0K (2.3x) | 211.0K (2.3x) | 111.6K (1.7x) | 111.2K (1.7x) |
| MessagePack | 287.4K (3.8x) | 167.3K (3.7x) | 145.3K (3.5x) | 139.2K (3.5x) | 68.7K (2.7x)  | 68.3K (2.7x)  |
| Protobuf    | 344.7K (3.2x) | 205.9K (3.0x) | 170.2K (3.0x) | 159.9K (3.0x) | 72.8K (2.5x)  | 71.3K (2.6x)  |
| Delta-Pack  | 1.1M (1.0x)   | 626.6K (1.0x) | 504.8K (1.0x) | 484.1K (1.0x) | 184.8K (1.0x) | 185.7K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 4.7M (1.3x) | 4.7M (1.3x) |
| MessagePack | 4.2M (1.5x) | 4.2M (1.5x) |
| Protobuf    | 5.3M (1.2x) | 5.4M (1.2x) |
| Delta-Pack  | 6.2M (1.0x) | 6.3M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.0M (1.6x) |
| MessagePack | 2.2M (1.5x) |
| Protobuf    | 2.1M (1.5x) |
| Delta-Pack  | 3.2M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 2.0M (1.0x) | 1.8M (1.0x)   |
| MessagePack | 1.5M (1.4x) | 1.3M (1.3x)   |
| Protobuf    | 1.1M (1.7x) | 933.4K (1.9x) |
| Delta-Pack  | 1.8M (1.1x) | 1.4M (1.2x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 285.9K (3.9x) | 174.2K (3.8x) | 141.0K (3.9x) | 134.1K (4.0x) | 64.4K (3.5x)  | 64.8K (3.5x)  |
| MessagePack | 182.4K (6.2x) | 108.2K (6.2x) | 93.9K (5.8x)  | 88.6K (6.0x)  | 43.4K (5.2x)  | 42.8K (5.3x)  |
| Protobuf    | 893.9K (1.3x) | 529.3K (1.3x) | 416.8K (1.3x) | 393.3K (1.3x) | 172.5K (1.3x) | 169.2K (1.3x) |
| Delta-Pack  | 1.1M (1.0x)   | 666.2K (1.0x) | 548.6K (1.0x) | 530.7K (1.0x) | 223.5K (1.0x) | 225.5K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 3.5M (3.1x)  | 3.5M (3.1x)  |
| MessagePack | 6.3M (1.7x)  | 6.3M (1.7x)  |
| Protobuf    | 10.9M (1.0x) | 10.8M (1.0x) |
| Delta-Pack  | 10.1M (1.1x) | 10.1M (1.1x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.4M (3.0x) |
| MessagePack | 1.6M (2.8x) |
| Protobuf    | 4.3M (1.0x) |
| Delta-Pack  | 4.2M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.1M (1.6x) | 1.1M (1.4x)   |
| MessagePack | 1.1M (1.7x) | 981.2K (1.5x) |
| Protobuf    | 1.8M (1.0x) | 1.4M (1.0x)   |
| Delta-Pack  | 1.5M (1.2x) | 1.3M (1.2x)   |
