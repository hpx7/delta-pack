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
| JSON        | 467.6K (2.2x) | 284.9K (2.0x) | 214.7K (2.2x) | 205.6K (2.1x) | 108.5K (1.6x) | 104.3K (1.7x) |
| MessagePack | 281.9K (3.7x) | 174.1K (3.3x) | 144.0K (3.3x) | 139.7K (3.1x) | 65.2K (2.7x)  | 66.2K (2.6x)  |
| Protobuf    | 337.3K (3.1x) | 207.4K (2.7x) | 170.4K (2.8x) | 157.7K (2.8x) | 69.8K (2.5x)  | 70.3K (2.5x)  |
| Delta-Pack  | 1.0M (1.0x)   | 566.3K (1.0x) | 470.6K (1.0x) | 437.6K (1.0x) | 174.9K (1.0x) | 174.6K (1.0x) |

### Primitives

| Format      | State1      | State2      |
| ----------- | ----------- | ----------- |
| JSON        | 4.7M (1.4x) | 4.7M (1.4x) |
| MessagePack | 4.0M (1.6x) | 4.0M (1.6x) |
| Protobuf    | 5.7M (1.1x) | 5.8M (1.1x) |
| Delta-Pack  | 6.5M (1.0x) | 6.6M (1.0x) |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 2.0M (1.4x) |
| MessagePack | 2.1M (1.3x) |
| Protobuf    | 2.2M (1.3x) |
| Delta-Pack  | 2.8M (1.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 2.0M (1.0x) | 1.8M (1.0x)   |
| MessagePack | 1.4M (1.4x) | 1.3M (1.4x)   |
| Protobuf    | 1.2M (1.7x) | 927.1K (2.0x) |
| Delta-Pack  | 1.7M (1.2x) | 1.4M (1.3x)   |

## Decoding Speed Comparison (ops/s)

Higher is better. The multiplier shows how much slower each format is compared to the fastest.

### GameState

| Format      | State1        | State2        | State3        | State4        | State5        | State6        |
| ----------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON        | 288.3K (3.1x) | 177.0K (3.0x) | 142.6K (3.1x) | 130.7K (3.3x) | 63.1K (2.8x)  | 64.4K (2.7x)  |
| MessagePack | 177.6K (5.0x) | 105.9K (5.0x) | 93.0K (4.7x)  | 89.3K (4.8x)  | 43.3K (4.1x)  | 42.4K (4.2x)  |
| Protobuf    | 839.0K (1.1x) | 494.6K (1.1x) | 387.0K (1.1x) | 359.3K (1.2x) | 155.7K (1.1x) | 157.5K (1.1x) |
| Delta-Pack  | 892.8K (1.0x) | 530.6K (1.0x) | 436.5K (1.0x) | 430.2K (1.0x) | 177.2K (1.0x) | 176.1K (1.0x) |

### Primitives

| Format      | State1       | State2       |
| ----------- | ------------ | ------------ |
| JSON        | 3.4M (3.5x)  | 3.4M (3.5x)  |
| MessagePack | 6.6M (1.8x)  | 6.7M (1.8x)  |
| Protobuf    | 11.8M (1.0x) | 11.9M (1.0x) |
| Delta-Pack  | 5.3M (2.2x)  | 5.0M (2.4x)  |

### Test

| Format      | State1      |
| ----------- | ----------- |
| JSON        | 1.4M (2.8x) |
| MessagePack | 1.5M (2.7x) |
| Protobuf    | 4.1M (1.0x) |
| Delta-Pack  | 2.1M (2.0x) |

### User

| Format      | State1      | State2        |
| ----------- | ----------- | ------------- |
| JSON        | 1.1M (1.5x) | 1.1M (1.3x)   |
| MessagePack | 1.1M (1.6x) | 984.5K (1.4x) |
| Protobuf    | 1.8M (1.0x) | 1.4M (1.0x)   |
| Delta-Pack  | 1.1M (1.7x) | 950.5K (1.5x) |
