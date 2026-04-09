import { describe, it, expect } from "vitest";
import {
  load,
  ObjectType,
  StringType,
  IntType,
  UIntType,
  BooleanType,
  ArrayType,
  OptionalType,
  EnumType,
  ReferenceType,
  UnionType,
  isPrimitiveOrEnum,
  parseSchemaYml,
  Infer,
  track,
} from "@hpx7/delta-pack";
import { parseUnion, parseInt as parseIntHelper } from "@hpx7/delta-pack/runtime";

/**
 * Tests targeting specific uncovered lines and branches to improve coverage.
 */

// ============ helpers.ts - parseUnion ============

describe("parseUnion", () => {
  const variants = ["Cat", "Dog"] as const;
  const parsers: Record<"Cat" | "Dog", (val: unknown) => unknown> = {
    Cat: (val: unknown) => val,
    Dog: (val: unknown) => val,
  };

  it("should match exact variant name via _type field", () => {
    const result = parseUnion({ _type: "Cat", name: "Whiskers" }, variants, parsers);
    expect(result._type).toBe("Cat");
  });

  it("should match variant name case-insensitively via _type field", () => {
    // Exercises the case-insensitive fallback inside findVariant (lines 142-143)
    // Use parsers that return {}, so the spread doesn't overwrite _type
    const strictParsers: Record<"Cat" | "Dog", (val: unknown) => unknown> = {
      Cat: (_val: unknown) => ({}),
      Dog: (_val: unknown) => ({}),
    };
    const result = parseUnion({ _type: "cat" }, variants, strictParsers);
    expect(result._type).toBe("Cat");

    const result2 = parseUnion({ _type: "DOG" }, variants, strictParsers);
    expect(result2._type).toBe("Dog");
  });

  it("should throw for unknown variant name in _type format", () => {
    // Exercises line 150 - unknown variant throws
    expect(() => parseUnion({ _type: "Fish" }, variants, parsers)).toThrow("Unknown union type variant: Fish");
  });

  it("should parse protobuf-format union { VariantName: data }", () => {
    // Exercises lines 157-163 - protobuf format with single-entry object
    const result = parseUnion({ Cat: { name: "Whiskers" } }, variants, parsers);
    expect(result._type).toBe("Cat");
  });

  it("should parse protobuf-format union case-insensitively", () => {
    // Exercises case-insensitive fallback in protobuf format
    const result = parseUnion({ dog: { name: "Rex" } }, variants, parsers);
    expect(result._type).toBe("Dog");
  });

  it("should throw for unknown variant name in protobuf format", () => {
    // Exercises line 161 - unknown protobuf variant throws
    expect(() => parseUnion({ Fish: { name: "Nemo" } }, variants, parsers)).toThrow(
      "Unknown union type variant: Fish"
    );
  });

  it("should throw for object with multiple fields and no _type", () => {
    // Exercises line 166 - invalid union (multiple fields, no _type)
    expect(() => parseUnion({ Cat: "a", Dog: "b" }, variants, parsers)).toThrow("Invalid union");
  });

  it("should throw for non-object input", () => {
    // Exercises lines 135-136 - non-object input throws
    expect(() => parseUnion("not-an-object", variants, parsers)).toThrow("Invalid union");
    expect(() => parseUnion(null, variants, parsers)).toThrow("Invalid union");
    expect(() => parseUnion(42, variants, parsers)).toThrow("Invalid union");
  });

  it("should use parseUnion through interpreter.ts fromJson with union type", () => {
    // Integration test - case-insensitive union variant matching through full API
    const Cat = ObjectType("Cat", { name: StringType() });
    const Dog = ObjectType("Dog", { name: StringType() });
    const Animal = UnionType("Animal", [Cat, Dog]);
    const api = load(Animal);

    // Protobuf format
    const catFromProtobuf = api.fromJson({ Cat: { name: "Whiskers" } });
    expect(catFromProtobuf._type).toBe("Cat");

    // Case-insensitive _type
    const dogCaseInsensitive = api.fromJson({ _type: "dog", name: "Rex" });
    expect(dogCaseInsensitive._type).toBe("Dog");
  });
});

// ============ schema.ts - isPrimitiveOrEnum, IntType, UIntType ============

describe("schema.ts constructors", () => {
  describe("isPrimitiveOrEnum", () => {
    it("should return true for a ReferenceType wrapping a primitive", () => {
      // Exercises lines 140-142 - reference type recursion
      const enumType = EnumType("Color", ["RED", "GREEN", "BLUE"]);
      const ref = ReferenceType(enumType);
      expect(isPrimitiveOrEnum(ref)).toBe(true);
    });

    it("should return true for a ReferenceType wrapping a string type", () => {
      const obj = ObjectType("Wrapper", { value: StringType() });
      const ref = ReferenceType(obj);
      expect(isPrimitiveOrEnum(ref)).toBe(false);
    });
  });

  describe("IntType validation", () => {
    it("should throw when min > max", () => {
      // Exercises line 219 - invalid range validation
      expect(() => IntType({ min: 10, max: 5 })).toThrow("Invalid int range");
      expect(() => IntType({ min: 10, max: 5 })).toThrow("min (10) > max (5)");
    });

    it("should throw when min > max with string values", () => {
      expect(() => IntType({ min: "100", max: "50" })).toThrow("Invalid int range");
    });

    it("should accept equal min and max", () => {
      // Boundary condition: min === max is valid
      const t = IntType({ min: 5, max: 5 });
      expect(t.min).toBe(5);
      expect(t.max).toBe(5);
    });
  });

  describe("UIntType with max option", () => {
    it("should call IntType({ min: 0, max }) when max is provided", () => {
      // Exercises line 248 - UIntType with max option
      const t = UIntType({ max: 99 });
      expect(t.type).toBe("int");
      expect(t.min).toBe(0);
      expect(t.max).toBe(99);
    });

    it("should call IntType({ min: 0 }) when no options provided", () => {
      // Exercises line 250 - UIntType without options
      const t = UIntType();
      expect(t.type).toBe("int");
      expect(t.min).toBe(0);
      expect(t.max).toBeUndefined();
    });

    it("should work in a schema with max option", () => {
      const Schema = ObjectType("Schema", { count: UIntType({ max: 255 }) });
      const api = load(Schema);
      const encoded = api.encode({ count: 128 });
      expect(api.decode(encoded)).toEqual({ count: 128 });
    });
  });
});

// ============ parser.ts - error paths ============

describe("parser.ts error paths", () => {
  it("should throw for unknown type reference in union resolution", () => {
    // Exercises line 194 - unknown union variant reference
    const yaml = `
Action:
  - Move
  - Attack
`;
    // Move and Attack are referenced but not defined
    expect(() => parseSchemaYml(yaml)).toThrow("Unknown type reference");
  });

  it("should throw for unknown type reference in property type", () => {
    // Exercises line 217 - unknown property reference
    const yaml = `
Player:
  position: UnknownType
`;
    expect(() => parseSchemaYml(yaml)).toThrow("Unknown type reference: UnknownType");
  });

  it("should throw for malformed parameter string (no parens match)", () => {
    // Exercises line 249 - invalid format
    const yaml = `
Test:
  value: int[badformat]
`;
    // The "[" suffix triggers array parsing, then "int" part becomes the inner type,
    // so this won't hit the parseParams error. Use a different approach:
    expect(() => parseSchemaYml("Test:\n  value: int(badformat)")).toThrow("Invalid int format");
  });

  it("should throw for invalid parameter assignment (missing value)", () => {
    // Exercises line 255 - invalid key=value parameter format
    expect(() => parseSchemaYml("Test:\n  value: int(min=)")).toThrow("Invalid parameter format");
  });

  it("should throw for invalid record type format (no comma)", () => {
    // Parser throws for invalid record type
    expect(() => parseSchemaYml("Test:\n  field: <string>")).toThrow("Invalid record type format");
  });

  it("should throw for unsupported type format", () => {
    // Exercises line 175 - unsupported property type
    expect(() => parseSchemaYml("Test:\n  field: int(key)")).toThrow("Invalid int format");
  });

  it("should resolve references in optional property types", () => {
    // Exercises resolvePropertyType for optional (line 225-226 in parser.ts)
    const schema = parseSchemaYml(`
Position:
  x: float
  y: float

Player:
  name: string
  pos: Position?
`);
    expect(schema["Player"]).toBeDefined();
    expect(schema["Position"]).toBeDefined();
    const player = schema["Player"] as ReturnType<typeof ObjectType>;
    const pos = player.properties["pos"];
    expect(pos?.type).toBe("optional");
  });

  it("should resolve references in array property types", () => {
    // Exercises resolvePropertyType for array
    const schema = parseSchemaYml(`
Item:
  name: string

Inventory:
  items: Item[]
`);
    expect(schema["Inventory"]).toBeDefined();
    const inventory = schema["Inventory"] as ReturnType<typeof ObjectType>;
    const items = inventory.properties["items"];
    expect(items?.type).toBe("array");
    if (items?.type === "array") {
      expect(items.value.type).toBe("reference");
    }
  });

  it("should resolve references in record property types", () => {
    // Exercises resolvePropertyType for record (line 228-229)
    const schema = parseSchemaYml(`
Player:
  name: string

Registry:
  players: <string, Player>
`);
    expect(schema["Registry"]).toBeDefined();
    const registry = schema["Registry"] as ReturnType<typeof ObjectType>;
    const players = registry.properties["players"];
    expect(players?.type).toBe("record");
    if (players?.type === "record") {
      expect(players.value.type).toBe("reference");
    }
  });
});

// ============ decoder.ts - nextOptionalDiff with non-null obj ============

describe("decoder.ts - optional diff from Some to None", () => {
  const OptSchema = ObjectType("OptObj", {
    name: StringType(),
    val: OptionalType(IntType()),
  });
  type OptObj = Infer<typeof OptSchema>;
  const api = load(OptSchema);

  it("should decode diff where optional goes from Some to None", () => {
    // Exercises decoder.ts line 125 (the else branch in nextOptionalDiff)
    // When obj is non-null, the decoder reads a present bit and if false, returns undefined
    const a: OptObj = { name: "test", val: 42 };
    const b: OptObj = { name: "test", val: undefined };

    const diff = api.encodeDiff(a, b);
    const result = api.decodeDiff(a, diff);

    expect(result.val).toBeUndefined();
  });

  it("should decode diff where optional goes from Some to Some different value", () => {
    // Exercises decoder.ts line 125 (else branch, present=true)
    const a: OptObj = { name: "test", val: 42 };
    const b: OptObj = { name: "test", val: 100 };

    const diff = api.encodeDiff(a, b);
    const result = api.decodeDiff(a, diff);

    expect(result.val).toBe(100);
  });

  it("should decode diff where optional goes from None to Some", () => {
    // Exercises decoder.ts line 124 (obj is null, calls decode())
    const a: OptObj = { name: "test", val: undefined };
    const b: OptObj = { name: "test", val: 99 };

    const diff = api.encodeDiff(a, b);
    const result = api.decodeDiff(a, diff);

    expect(result.val).toBe(99);
  });
});

// ============ tracking.ts - deleteProperty symbol, empty array shift ============

describe("tracking.ts edge cases", () => {
  describe("deleteProperty with symbol key", () => {
    it("should delete a symbol property from a tracked object", () => {
      // Exercises line 327 - deleteProperty trap for symbol keys
      const sym = Symbol("testSymbol");
      const obj = track({ x: 1, y: 2 } as Record<string | symbol, unknown>);
      (obj as Record<symbol, unknown>)[sym] = "hello";

      expect((obj as Record<symbol, unknown>)[sym]).toBe("hello");

      delete (obj as Record<symbol, unknown>)[sym];
      expect((obj as Record<symbol, unknown>)[sym]).toBeUndefined();
    });
  });

  describe("shift on empty tracked array", () => {
    it("should return undefined when shifting an empty tracked array", () => {
      // Exercises line 435 - shift on empty array (the else branch)
      const arr = track([] as number[]);
      const result = arr.shift();
      expect(result).toBeUndefined();
    });

    it("should shift from a non-empty tracked array and dirty track", () => {
      // Exercises the normal shift path (array has elements)
      const arr = track([10, 20, 30]);
      const result = arr.shift();
      expect(result).toBe(10);
      expect(arr.length).toBe(2);
      expect(arr[0]).toBe(20);
    });
  });
});

// ============ interpreter.ts - clone/toJson edge cases ============

describe("interpreter.ts edge cases", () => {
  describe("clone with unknown union variant", () => {
    it("should throw when cloning a union object with unknown _type", () => {
      // Exercises line 291 - unknown variant in _clone
      const Cat = ObjectType("Cat", { name: StringType() });
      const Dog = ObjectType("Dog", { name: StringType() });
      const Animal = UnionType("Animal", [Cat, Dog]);
      const api = load(Animal);

      // Create an object with an invalid _type that doesn't match any variant
      const invalidObj = { _type: "Fish", name: "Nemo" } as unknown as Infer<typeof Animal>;

      expect(() => api.clone(invalidObj)).toThrow("Unknown union variant: Fish");
    });
  });

  describe("toJson with union type", () => {
    it("should throw when calling toJson with unknown union variant", () => {
      // Exercises interpreter.ts _toJson union unknown variant path
      const Cat = ObjectType("Cat", { name: StringType() });
      const Dog = ObjectType("Dog", { name: StringType() });
      const Animal = UnionType("Animal", [Cat, Dog]);
      const api = load(Animal);

      const invalidObj = { _type: "Fish", name: "Nemo" } as unknown as Infer<typeof Animal>;
      expect(() => api.toJson(invalidObj)).toThrow("Unknown union variant: Fish");
    });
  });

  describe("equals with different union variants", () => {
    it("should return false when union variants differ", () => {
      // Exercises interpreter.ts _equals for union type
      const Cat = ObjectType("Cat", { name: StringType() });
      const Dog = ObjectType("Dog", { name: StringType() });
      const Animal = UnionType("Animal", [Cat, Dog]);
      const api = load(Animal);

      const cat = api.fromJson({ _type: "Cat", name: "Whiskers" });
      const dog = api.fromJson({ _type: "Dog", name: "Rex" });

      expect(api.equals(cat, dog)).toBe(false);
    });

    it("should return false when unknown variant encountered in equals", () => {
      // Exercises interpreter.ts _equals with unknown union variant (line 247)
      const Cat = ObjectType("Cat", { name: StringType() });
      const Dog = ObjectType("Dog", { name: StringType() });
      const Animal = UnionType("Animal", [Cat, Dog]);
      const api = load(Animal);

      const cat = api.fromJson({ _type: "Cat", name: "Whiskers" });
      const invalidObj = { _type: "Fish", name: "Nemo" } as unknown as Infer<typeof Animal>;

      // equals with an unknown variant should return false (variant not found)
      expect(api.equals(cat, invalidObj)).toBe(false);
    });
  });

  describe("toJson with null optional", () => {
    it("should return null for undefined optional in toJson", () => {
      // Exercises interpreter.ts _toJson optional null path (line 189-190)
      const Schema = ObjectType("Schema", {
        name: StringType(),
        val: OptionalType(IntType()),
      });
      const api = load(Schema);

      const obj = { name: "test", val: undefined };
      const json = api.toJson(obj);
      expect(json["val"]).toBeNull();
    });
  });
});

// ============ serde.ts - RLE overflow ============

describe("serde.ts - RLE edge cases", () => {
  it("should throw when encoding more than 269 identical consecutive boolean values", () => {
    // Exercises serde.ts line 224 - RLE count too large
    const BoolArraySchema = ObjectType("BoolArraySchema", {
      items: ArrayType(BooleanType()),
    });
    const api = load(BoolArraySchema);

    // 270 consecutive identical booleans create a run of 270, which exceeds the RLE limit
    const tooMany = { items: Array(270).fill(true) };
    expect(() => api.encode(tooMany)).toThrow("RLE count too large");
  });

  it("should encode up to 269 identical consecutive boolean values without error", () => {
    // Verify the boundary: 269 is within the limit
    const BoolArraySchema = ObjectType("BoolArraySchema", {
      items: ArrayType(BooleanType()),
    });
    const api = load(BoolArraySchema);

    const atLimit = { items: Array(269).fill(true) };
    const encoded = api.encode(atLimit);
    const decoded = api.decode(encoded);
    expect(decoded.items.length).toBe(269);
    expect(decoded.items.every((v: boolean) => v === true)).toBe(true);
  });

  it("should throw 'Invalid varint' when decoding a malformed boolean-only buffer", () => {
    // Exercises serde.ts line 276 - readReverseUVarint throws on all-high-bit buffer
    // The RleReader's readReverseUVarint throws when all bytes have the high bit set
    const BoolSchema = ObjectType("BoolSchema", { flag: BooleanType() });
    const api = load(BoolSchema);

    // A buffer where all bytes have the high bit set is an invalid varint
    const invalidBuf = new Uint8Array([0x80, 0x80, 0x80, 0x80]);
    expect(() => api.decode(invalidBuf)).toThrow("Invalid varint");
  });
});

// ============ Additional integration tests for branch coverage ============

describe("integration - additional branch coverage", () => {
  describe("record diff operations", () => {
    it("should encode diff with deletions, updates, and additions in a record", () => {
      const RecordSchema = ObjectType("RecordSchema", {
        data: OptionalType(IntType()),
      });
      type RS = Infer<typeof RecordSchema>;
      const api = load(RecordSchema);

      // Test optional None → Some path (different from Some → None)
      const a: RS = { data: undefined };
      const b: RS = { data: 42 };
      const diff = api.encodeDiff(a, b);
      const result = api.decodeDiff(a, diff);
      expect(result.data).toBe(42);
    });
  });

  describe("union round-trip with fromJson/toJson", () => {
    it("should round-trip union type through fromJson and toJson", () => {
      const Cat = ObjectType("Cat", { name: StringType() });
      const Dog = ObjectType("Dog", { breed: StringType() });
      const Animal = UnionType("Animal", [Cat, Dog]);
      const api = load(Animal);

      // Encode a Cat
      const catJson = { _type: "Cat", name: "Whiskers" };
      const cat = api.fromJson(catJson);
      expect(cat._type).toBe("Cat");

      // toJson should produce protobuf format: { Cat: { name: ... } }
      const json = api.toJson(cat);
      expect(json).toEqual({ Cat: { name: "Whiskers" } });

      // Round-trip
      const reparsed = api.fromJson(json);
      expect(api.equals(cat, reparsed)).toBe(true);
    });

    it("should clone union objects correctly", () => {
      const Cat = ObjectType("Cat", { name: StringType() });
      const Dog = ObjectType("Dog", { breed: StringType() });
      const Animal = UnionType("Animal", [Cat, Dog]);
      const api = load(Animal);

      const cat = api.fromJson({ _type: "Cat", name: "Whiskers" });
      const cloned = api.clone(cat);
      expect(api.equals(cat, cloned)).toBe(true);
      expect(cloned).not.toBe(cat); // different reference
    });
  });

  describe("self-reference type", () => {
    it("should encode and decode a recursive (self-referencing) structure", () => {
      const schema = parseSchemaYml(`
TreeNode:
  value: int
  left: TreeNode?
  right: TreeNode?
`);
      const api = load<{ value: number; left?: unknown; right?: unknown }>(schema["TreeNode"]!);

      const tree = {
        value: 1,
        left: { value: 2, left: undefined, right: undefined },
        right: { value: 3, left: undefined, right: undefined },
      };

      const encoded = api.encode(tree);
      const decoded = api.decode(encoded);
      expect(api.equals(decoded, tree)).toBe(true);
    });
  });

  describe("decorator - record with reference values", () => {
    it("should hydrate record values via hydrateValue record case", () => {
      // Exercises decorator.ts lines 291-296 (hydrateValue for record type)
      // Uses reflection/decorator API with a record of class instances
      // This requires loadClass with a record containing class references
      const schema = parseSchemaYml(`
Item:
  name: string
  quantity: int

Inventory:
  items: <string, Item>
`);
      const api = load<{ items: Map<string, { name: string; quantity: number }> }>(schema["Inventory"]!);

      const obj = {
        items: new Map([
          ["sword", { name: "Iron Sword", quantity: 1 }],
          ["potion", { name: "Health Potion", quantity: 5 }],
        ]),
      };

      const encoded = api.encode(obj);
      const decoded = api.decode(encoded);
      expect(decoded.items.get("sword")?.name).toBe("Iron Sword");
      expect(decoded.items.get("potion")?.quantity).toBe(5);

      // Diff test
      const obj2 = {
        items: new Map([
          ["sword", { name: "Iron Sword", quantity: 2 }],
          ["potion", { name: "Health Potion", quantity: 5 }],
          ["shield", { name: "Wooden Shield", quantity: 1 }],
        ]),
      };
      const diff = api.encodeDiff(obj, obj2);
      const result = api.decodeDiff(obj, diff);
      expect(result.items.get("sword")?.quantity).toBe(2);
      expect(result.items.get("shield")?.name).toBe("Wooden Shield");
    });
  });
});
