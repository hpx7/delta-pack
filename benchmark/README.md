## Encoding Size Comparison (bytes)

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
