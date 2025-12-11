# Delta-Pack

A compact binary serialization format with efficient delta compression for real-time state synchronization.

## Overview

Delta-pack provides a schema-driven approach to binary serialization with built-in delta compression. It's designed for use cases like multiplayer games, collaborative applications, and real-time systems where network bandwidth is critical.

**Key Features:**

- **Compact Binary Format**: Efficient encoding of primitive types, objects, arrays, and maps
- **Delta Compression**: Send only what changed between states, dramatically reducing bandwidth
- **Schema-Driven**: Type-safe code generation from declarative schemas
- **String Dictionary**: Automatic deduplication of repeated strings
- **RLE Compression**: Run-length encoding for boolean arrays

## Schema Types

Delta-pack schemas are defined using a simple YAML format that supports the following types:

### Primitive Types

```yaml
MyObject:
  stringField: string # UTF-8 encoded string
  signedInt: int # Variable-length signed integer
  unsignedInt: uint # Variable-length unsigned integer
  floatField: float # 32-bit IEEE 754 float
  booleanField: boolean # Single bit boolean
```

### Type Aliases

Create reusable type definitions:

```yaml
UserId: string # Type alias for string
PlayerId: uint # Type alias for uint

User:
  id: UserId
  name: string
```

### Enums

Define enumerated types with string constants:

```yaml
Color:
  - RED
  - GREEN
  - BLUE

Player:
  favoriteColor: Color
```

Enums are encoded as variable-length unsigned integers (0, 1, 2, etc.).

### Union Types

Define union types by listing type names that exist in the schema:

```yaml
EmailContact:
  email: string

PhoneContact:
  phone: string
  extension: uint?

Contact:
  - EmailContact
  - PhoneContact

User:
  preferredContact: Contact?
```

**How it works:**

- If an array contains only type names defined in the schema, it's treated as a union type
- If an array contains literal strings not in the schema, it's treated as an enum
- Union values are encoded with a discriminator (type tag) plus the variant data

### Objects

Nested object types:

```yaml
Address:
  street: string
  city: string
  zipCode: string

User:
  name: string
  address: Address # Nested object
```

### Optional Types

Mark fields as optional with `?`:

```yaml
User:
  name: string
  middleName: string? # Optional field
  address: Address? # Optional nested object
```

Optional fields encode a presence bit before the value.

### Arrays

Define array types with `[]`:

```yaml
User:
  name: string
  tags: string[] # Array of strings
  scores: int[] # Array of integers
```

### Maps (Records)

Maps use angle bracket syntax `<KeyType, ValueType>`:

```yaml
User:
  name: string
  metadata: <string, string> # Map<string, string>
  scores: <string, int> # Map<string, int>
  playerPositions: <PlayerId, Position> # Map<PlayerId, Position>
```

**Nested Containers:**
You can nest maps in arrays or optionals:

```yaml
Inventory:
  items: <string, int>[]? # Optional array of maps

GameState:
  players: <string, Player> # Map of player ID to Player object
```

**Key Type Restrictions:**

- Map keys must be `string`, `int`, or `uint`
- Map values can be any type (primitives, objects, arrays, etc.)

**Encoding:**
Maps are encoded as key-value pairs in binary format.

### IDE Support & Validation

Enable schema validation and autocompletion in your IDE:

**VS Code:**
Add this comment at the top of your schema file:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/hpx7/delta-pack/refs/heads/main/schema.json

UserId: string
# ... rest of schema
```

**IntelliJ/WebStorm:**

1. Go to Preferences → Languages & Frameworks → Schemas and DTDs → JSON Schema Mappings
2. Add new mapping with URL: `https://raw.githubusercontent.com/hpx7/delta-pack/refs/heads/main/schema.json
`
3. Map to file pattern: `*.schema.yml` or specific files

**Using the schema:**
All example schema files include the schema reference at the top. Just copy the first line when creating your own schemas:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/hpx7/delta-pack/refs/heads/main/schema.json
```

For local development, you can also reference the schema file directly:

```yaml
# yaml-language-server: $schema=../../schema.json
```

This provides:

- ✓ Type validation
- ✓ Autocomplete for primitive types
- ✓ Error highlighting for invalid syntax
- ✓ Documentation on hover

## Core API

Every type defined in a schema generates a consistent API with four core operations:

### `encode(object) → bytes`

Serializes an object to binary format.

**Example:**

```
Input: { name: "Alice", age: 30, active: true }
Output: [binary data] (e.g., 15 bytes)
```

### `decode(bytes) → object`

Deserializes binary data back to an object.

**Example:**

```
Input: [binary data] (15 bytes)
Output: { name: "Alice", age: 30, active: true }
```

### `encodeDiff(oldObject, newObject) → bytes`

Encodes only the differences between two objects.

**Example:**

```
Input:
  old: { name: "Alice", age: 30, active: true }
  new: { name: "Alice", age: 31, active: true }
Output: [binary data] (e.g., 3 bytes - only age changed)
```

### `decodeDiff(oldObject, diffBytes) → newObject`

Applies a diff to an old object to reconstruct the new object.

**Example:**

```
Input:
  old: { name: "Alice", age: 30, active: true }
  diff: [binary data] (3 bytes)
Output: { name: "Alice", age: 31, active: true }
```

## Object Encoding Format

Objects are encoded in a compact binary format optimized for size and speed.

### Format Structure

```
[data][rle]
```

Where:

- **Data**: Sequential encoding of all non-boolean primitive values
- **RLE**: RLE-compressed boolean array with length suffix

### RLE Section

Format:

```
[rleBits][numRleBits: reverse varint]
```

The reverse varint at the end stores the exact number of RLE bits, allowing reading from the end of the buffer to determine where the RLE bits begin.

The RLE bits contain:

1. **Boolean fields**: All boolean values in field order
2. **Optional presence flags**: One bit per optional field indicating presence
3. **Array/Map change flags**: Bits indicating if collections changed (in diffs)
4. **Quantized change flags**: Bits indicating if quantized values changed (in diffs)

The boolean bits are RLE-compressed to handle long sequences of identical values efficiently.

### Data Section

Primitive values are encoded sequentially:

**Strings:**

```
[lengthOrIndex: varint][utf8Bytes (if new string)]
```

- Positive length: New string with UTF-8 bytes
- Zero: Empty string
- Negative index: Reference to string dictionary entry

**Integers (int/uint):**

```
[value: varint]
```

- Variable-length encoding (1-5 bytes)
- Smaller values use fewer bytes

**Floats:**

```
[value: 32-bit IEEE 754]
```

- Standard 4-byte float representation

**Arrays:**

```
[length: varint][item1][item2]...[itemN]
```

**Maps:**

```
[size: varint][key1][value1][key2][value2]...
```

### String Dictionary Compression

Strings are automatically deduplicated within a single encode/decode operation:

1. First occurrence: `[length][utf8Bytes]`
2. Subsequent occurrences: `[negativeIndex]`

Example:

```
["hello", "world", "hello"]
→ [5]["hello"][5]["world"][-1]  // -1 references first "hello"
```

## Diff Encoding Format

Diffs encode only what changed between two objects, dramatically reducing bandwidth for incremental updates.

### Diff Structure

```
[metadata][changedFields]
```

### Change Detection

For each field, a "changed" bit indicates if the value differs:

**Primitives:**

```
[changed: bit][newValue: encoded (if changed)]
```

**Objects:**

```
[changed: bit][fieldDiffs: recursive (if changed)]
```

**Arrays:**

```
[changed: bit][lengthChanged: bit][itemDiffs]
```

If array length changed:

```
[newLength: varint][itemDiffs for min(oldLen, newLen)][newItems]
```

Array item diffs:

```
[itemChanged: bit][itemDiff: recursive (if changed)]
```

**Maps:**

```
[changed: bit][deletions][updates][additions]
```

Map diff format:

```
[numDeletions: varint][deletionIndices: varint...]
[numUpdates: varint][updateIndices: varint...][updateDiffs...]
[numAdditions: varint][newKeyValuePairs...]
```

### Optimization Strategies

1. **Unchanged Detection**: If entire object unchanged, single `0` bit
2. **Primitive Diffs**: Only encode new value if changed
3. **Array Element Diffs**: Track which elements changed
4. **Map Diffs**: Separate deletions, updates, and additions
5. **String Reuse**: Dictionary applies across old and new state

### Example Diff

```
Old: { name: "Alice", age: 30, scores: [100, 200], active: true }
New: { name: "Alice", age: 31, scores: [100, 250], active: true }

Encoding:
- Metadata: [objectChanged: 1]
- name: [changed: 0]           // No change, 1 bit
- age: [changed: 1][31]        // Changed, 1 bit + varint
- scores: [changed: 1]         // Array changed
  [lengthChanged: 0]          // Same length
  [item0Changed: 0]           // First element unchanged
  [item1Changed: 1][250]      // Second element changed
- active: [changed: 0]         // No change, 1 bit

Result: ~5 bytes vs ~25 bytes for full encoding
```

## Performance Characteristics

### Bandwidth Comparison

Typical savings for incremental updates:

| Scenario                | Full Encoding | Diff Encoding | Savings |
| ----------------------- | ------------- | ------------- | ------- |
| Single field changed    | 100 bytes     | 5 bytes       | 95%     |
| Multiple fields changed | 100 bytes     | 15 bytes      | 85%     |
| Array element changed   | 200 bytes     | 10 bytes      | 95%     |
| No changes              | 100 bytes     | 2 bytes       | 98%     |

### Use Cases

**Optimal for:**

- Real-time multiplayer games (player state sync)
- Collaborative applications (document sync)
- Live dashboards (metric updates)
- IoT sensor data (periodic readings)

**Not optimal for:**

- Completely random state changes
- First-time state synchronization (use full encoding)
- Very small objects (overhead may exceed full encoding)

## Examples

See the `examples/` directory for complete schema examples:

- `examples/primitives/` - Basic primitive types
- `examples/allTypes/` - Comprehensive type showcase

Each example includes:

- `schema.yml` - Schema definition
- `state1.json` - Initial state
- `state2.json` - Updated state for diff demonstration
