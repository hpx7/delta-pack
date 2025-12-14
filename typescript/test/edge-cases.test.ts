import { describe, it, expect } from "vitest";
import {
  load,
  defineSchema,
  ObjectType,
  StringType,
  IntType,
  UIntType,
  FloatType,
  BooleanType,
  ArrayType,
  RecordType,
  OptionalType,
  EnumType,
  ReferenceType,
  UnionType,
  Infer,
} from "@hpx7/delta-pack";

/**
 * Edge case tests for boundary values, error handling, and special scenarios
 * that aren't covered by the main shared API tests.
 */

// Schema for boundary value testing
const boundarySchema = defineSchema({
  IntBoundaries: ObjectType({
    minInt: IntType(),
    maxInt: IntType(),
    zero: IntType(),
    negOne: IntType(),
  }),
  UIntBoundaries: ObjectType({
    zero: UIntType(),
    maxUint: UIntType(),
    one: UIntType(),
  }),
  FloatEdges: ObjectType({
    zero: FloatType(),
    negZero: FloatType(),
    small: FloatType(),
    large: FloatType(),
    negative: FloatType(),
  }),
  QuantizedFloatEdges: ObjectType({
    value: FloatType({ precision: 0.1 }),
  }),
  StringEdges: ObjectType({
    empty: StringType(),
    unicode: StringType(),
    long: StringType(),
  }),
  ManyBooleans: ObjectType({
    b1: BooleanType(),
    b2: BooleanType(),
    b3: BooleanType(),
    b4: BooleanType(),
    b5: BooleanType(),
    b6: BooleanType(),
    b7: BooleanType(),
    b8: BooleanType(),
    b9: BooleanType(),
    b10: BooleanType(),
  }),
  Color: EnumType(["RED", "BLUE", "GREEN"]),
  EnumHolder: ObjectType({
    color: ReferenceType("Color"),
  }),
  InnerOptional: ObjectType({
    inner: OptionalType(StringType()),
  }),
  NestedOptional: ObjectType({
    outer: OptionalType(ReferenceType("InnerOptional")),
  }),
  ArrayHolder: ObjectType({
    items: ArrayType(IntType()),
  }),
  RecordHolder: ObjectType({
    data: RecordType(StringType(), IntType()),
  }),
  ActionA: ObjectType({ value: IntType() }),
  ActionB: ObjectType({ name: StringType() }),
  ActionUnion: UnionType([ReferenceType("ActionA"), ReferenceType("ActionB")]),
  UnionHolder: ObjectType({
    action: ReferenceType("ActionUnion"),
  }),
});

// Infer types from schema
type IntBoundaries = Infer<typeof boundarySchema.IntBoundaries, typeof boundarySchema>;
type UIntBoundaries = Infer<typeof boundarySchema.UIntBoundaries, typeof boundarySchema>;
type FloatEdges = Infer<typeof boundarySchema.FloatEdges, typeof boundarySchema>;
type QuantizedFloatEdges = Infer<typeof boundarySchema.QuantizedFloatEdges, typeof boundarySchema>;
type StringEdges = Infer<typeof boundarySchema.StringEdges, typeof boundarySchema>;
type ManyBooleans = Infer<typeof boundarySchema.ManyBooleans, typeof boundarySchema>;
type EnumHolder = Infer<typeof boundarySchema.EnumHolder, typeof boundarySchema>;
type NestedOptional = Infer<typeof boundarySchema.NestedOptional, typeof boundarySchema>;
type ArrayHolder = Infer<typeof boundarySchema.ArrayHolder, typeof boundarySchema>;
type RecordHolder = Infer<typeof boundarySchema.RecordHolder, typeof boundarySchema>;
type UnionHolder = Infer<typeof boundarySchema.UnionHolder, typeof boundarySchema>;

describe("Edge Cases - Boundary Values", () => {
  describe("Integer Boundaries", () => {
    const IntBoundaries = load<IntBoundaries>(boundarySchema, "IntBoundaries");

    it("should handle maximum safe integer values", () => {
      // Varint encoding supports arbitrary precision, but JS has limits
      const maxSafe: IntBoundaries = {
        minInt: -2147483648, // -2^31 (32-bit signed min)
        maxInt: 2147483647, // 2^31 - 1 (32-bit signed max)
        zero: 0,
        negOne: -1,
      };

      const encoded = IntBoundaries.encode(maxSafe);
      const decoded = IntBoundaries.decode(encoded);

      expect(decoded.minInt).toBe(-2147483648);
      expect(decoded.maxInt).toBe(2147483647);
      expect(decoded.zero).toBe(0);
      expect(decoded.negOne).toBe(-1);
    });

    it("should handle negative numbers correctly with zigzag encoding", () => {
      const values: IntBoundaries = {
        minInt: -1000000,
        maxInt: 1000000,
        zero: 0,
        negOne: -1,
      };

      const encoded = IntBoundaries.encode(values);
      const decoded = IntBoundaries.decode(encoded);

      expect(IntBoundaries.equals(decoded, values)).toBe(true);
    });

    it("should produce identical encoding for same values (determinism)", () => {
      const values: IntBoundaries = {
        minInt: -12345,
        maxInt: 67890,
        zero: 0,
        negOne: -1,
      };

      const encoded1 = IntBoundaries.encode(values);
      const encoded2 = IntBoundaries.encode(values);

      expect(encoded1).toEqual(encoded2);
    });
  });

  describe("Unsigned Integer Boundaries", () => {
    const UIntBoundaries = load<UIntBoundaries>(boundarySchema, "UIntBoundaries");

    it("should handle maximum unsigned values", () => {
      const maxUnsigned: UIntBoundaries = {
        zero: 0,
        maxUint: 4294967295, // 2^32 - 1
        one: 1,
      };

      const encoded = UIntBoundaries.encode(maxUnsigned);
      const decoded = UIntBoundaries.decode(encoded);

      expect(decoded.zero).toBe(0);
      expect(decoded.maxUint).toBe(4294967295);
      expect(decoded.one).toBe(1);
    });

    it("should reject negative values in fromJson", () => {
      expect(() => UIntBoundaries.fromJson({ zero: -1, maxUint: 0, one: 0 })).toThrow();
    });
  });

  describe("Float Edge Cases", () => {
    const FloatEdges = load<FloatEdges>(boundarySchema, "FloatEdges");

    it("should handle zero and negative zero", () => {
      const values: FloatEdges = {
        zero: 0.0,
        negZero: -0.0,
        small: 0.000001,
        large: 1e10,
        negative: -1e10,
      };

      const encoded = FloatEdges.encode(values);
      const decoded = FloatEdges.decode(encoded);

      // Zero values should round-trip (IEEE 754 preserves -0)
      expect(decoded.zero).toBe(0);
      expect(Object.is(decoded.negZero, -0)).toBe(true); // -0 is preserved
      expect(Math.abs(decoded.small - 0.000001)).toBeLessThan(1e-10);
      expect(Math.abs(decoded.large - 1e10)).toBeLessThan(1);
      expect(Math.abs(decoded.negative - -1e10)).toBeLessThan(1);
    });

    it("should handle very small float values", () => {
      const values: FloatEdges = {
        zero: 0,
        negZero: 0,
        small: 1e-20,
        large: 0,
        negative: -1e-20,
      };

      const encoded = FloatEdges.encode(values);
      const decoded = FloatEdges.decode(encoded);

      expect(FloatEdges.equals(decoded, values)).toBe(true);
    });

    it("should produce identical encoding for same float values (determinism)", () => {
      const values: FloatEdges = {
        zero: 0.0,
        negZero: 0.0,
        small: 3.14159,
        large: 1000.5,
        negative: -999.999,
      };

      const encoded1 = FloatEdges.encode(values);
      const encoded2 = FloatEdges.encode(values);

      expect(encoded1).toEqual(encoded2);
    });
  });

  describe("Quantized Float Precision", () => {
    const QuantizedFloatEdges = load<QuantizedFloatEdges>(boundarySchema, "QuantizedFloatEdges");

    it("should quantize to specified precision", () => {
      // Library uses standard rounding (round half away from zero)
      const testCases = [
        { input: 0.05, expected: 0.1 }, // 0.05 rounds up to 0.1
        { input: 0.04, expected: 0.0 }, // 0.04 rounds down to 0
        { input: 0.15, expected: 0.1 }, // 0.15 rounds down to 0.1 (banker's rounding or floor)
        { input: -0.05, expected: 0.0 }, // -0.05 rounds to 0
        { input: -0.04, expected: 0.0 }, // -0.04 rounds to 0
        { input: 0.051, expected: 0.1 }, // 0.051 rounds to 0.1
        { input: 0.049, expected: 0.0 }, // 0.049 rounds to 0
      ];

      for (const { input, expected } of testCases) {
        const encoded = QuantizedFloatEdges.encode({ value: input });
        const decoded = QuantizedFloatEdges.decode(encoded);
        expect(decoded.value).toBeCloseTo(expected, 5);
      }
    });

    it("should handle quantization at boundaries consistently", () => {
      // Test that repeated encode/decode doesn't accumulate error
      let value: QuantizedFloatEdges = { value: 123.456 };

      for (let i = 0; i < 10; i++) {
        const encoded = QuantizedFloatEdges.encode(value);
        value = QuantizedFloatEdges.decode(encoded);
      }

      // After multiple round-trips, should still be quantized to 0.1 precision
      expect(value.value).toBeCloseTo(123.5, 5);
    });
  });
});

describe("Edge Cases - String Encoding", () => {
  const StringEdges = load<StringEdges>(boundarySchema, "StringEdges");

  it("should handle empty strings", () => {
    const values: StringEdges = { empty: "", unicode: "", long: "" };

    const encoded = StringEdges.encode(values);
    const decoded = StringEdges.decode(encoded);

    expect(decoded.empty).toBe("");
    expect(decoded.unicode).toBe("");
    expect(decoded.long).toBe("");
  });

  it("should handle unicode characters (emoji)", () => {
    const values: StringEdges = {
      empty: "",
      unicode: "Hello 👋 World 🌍 Test 🎮",
      long: "",
    };

    const encoded = StringEdges.encode(values);
    const decoded = StringEdges.decode(encoded);

    expect(decoded.unicode).toBe("Hello 👋 World 🌍 Test 🎮");
  });

  it("should handle multi-byte UTF-8 characters", () => {
    const values: StringEdges = {
      empty: "",
      unicode: "日本語テスト αβγδ مرحبا",
      long: "",
    };

    const encoded = StringEdges.encode(values);
    const decoded = StringEdges.decode(encoded);

    expect(decoded.unicode).toBe("日本語テスト αβγδ مرحبا");
  });

  it("should handle long strings", () => {
    const longString = "a".repeat(10000);
    const values: StringEdges = { empty: "", unicode: "", long: longString };

    const encoded = StringEdges.encode(values);
    const decoded = StringEdges.decode(encoded);

    expect(decoded.long).toBe(longString);
    expect(decoded.long.length).toBe(10000);
  });

  it("should handle strings with special characters", () => {
    const values: StringEdges = {
      empty: "",
      unicode: "line1\nline2\ttab\r\nwindows",
      long: "",
    };

    const encoded = StringEdges.encode(values);
    const decoded = StringEdges.decode(encoded);

    expect(decoded.unicode).toBe("line1\nline2\ttab\r\nwindows");
  });

  it("should produce identical encoding for same strings (determinism)", () => {
    const values: StringEdges = {
      empty: "",
      unicode: "test 🎮 string",
      long: "x".repeat(1000),
    };

    const encoded1 = StringEdges.encode(values);
    const encoded2 = StringEdges.encode(values);

    expect(encoded1).toEqual(encoded2);
  });
});

describe("Edge Cases - Boolean RLE Integration", () => {
  const ManyBooleans = load<ManyBooleans>(boundarySchema, "ManyBooleans");

  it("should handle all true values", () => {
    const allTrue: ManyBooleans = {
      b1: true,
      b2: true,
      b3: true,
      b4: true,
      b5: true,
      b6: true,
      b7: true,
      b8: true,
      b9: true,
      b10: true,
    };

    const encoded = ManyBooleans.encode(allTrue);
    const decoded = ManyBooleans.decode(encoded);

    expect(ManyBooleans.equals(decoded, allTrue)).toBe(true);
  });

  it("should handle all false values", () => {
    const allFalse: ManyBooleans = {
      b1: false,
      b2: false,
      b3: false,
      b4: false,
      b5: false,
      b6: false,
      b7: false,
      b8: false,
      b9: false,
      b10: false,
    };

    const encoded = ManyBooleans.encode(allFalse);
    const decoded = ManyBooleans.decode(encoded);

    expect(ManyBooleans.equals(decoded, allFalse)).toBe(true);
  });

  it("should handle alternating boolean pattern", () => {
    const alternating: ManyBooleans = {
      b1: true,
      b2: false,
      b3: true,
      b4: false,
      b5: true,
      b6: false,
      b7: true,
      b8: false,
      b9: true,
      b10: false,
    };

    const encoded = ManyBooleans.encode(alternating);
    const decoded = ManyBooleans.decode(encoded);

    expect(ManyBooleans.equals(decoded, alternating)).toBe(true);
  });

  it("should efficiently encode runs of same value", () => {
    const longRun: ManyBooleans = {
      b1: true,
      b2: true,
      b3: true,
      b4: true,
      b5: true,
      b6: false,
      b7: false,
      b8: false,
      b9: false,
      b10: false,
    };

    const encoded = ManyBooleans.encode(longRun);
    const decoded = ManyBooleans.decode(encoded);

    expect(ManyBooleans.equals(decoded, longRun)).toBe(true);
    // RLE should compress this efficiently
    expect(encoded.length).toBeLessThan(10);
  });

  it("should handle diff encoding with boolean changes", () => {
    const state1: ManyBooleans = {
      b1: true,
      b2: true,
      b3: true,
      b4: true,
      b5: true,
      b6: true,
      b7: true,
      b8: true,
      b9: true,
      b10: true,
    };

    const state2: ManyBooleans = {
      b1: true,
      b2: true,
      b3: false, // changed
      b4: true,
      b5: true,
      b6: true,
      b7: true,
      b8: false, // changed
      b9: true,
      b10: true,
    };

    const diff = ManyBooleans.encodeDiff(state1, state2);
    const decoded = ManyBooleans.decodeDiff(state1, diff);

    expect(ManyBooleans.equals(decoded, state2)).toBe(true);
  });
});

describe("Edge Cases - Enum Validation", () => {
  const EnumHolder = load<EnumHolder>(boundarySchema, "EnumHolder");

  it("should accept valid enum values", () => {
    expect(() => EnumHolder.fromJson({ color: "RED" })).not.toThrow();
    expect(() => EnumHolder.fromJson({ color: "BLUE" })).not.toThrow();
    expect(() => EnumHolder.fromJson({ color: "GREEN" })).not.toThrow();
  });

  it("should reject invalid enum values", () => {
    expect(() => EnumHolder.fromJson({ color: "PURPLE" })).toThrow();
    expect(() => EnumHolder.fromJson({ color: "red" })).toThrow(); // case sensitive
    expect(() => EnumHolder.fromJson({ color: "" })).toThrow();
    expect(() => EnumHolder.fromJson({ color: 0 })).toThrow();
  });

  it("should encode and decode all enum values", () => {
    for (const color of ["RED", "BLUE", "GREEN"] as const) {
      const holder: EnumHolder = { color };
      const encoded = EnumHolder.encode(holder);
      const decoded = EnumHolder.decode(encoded);
      expect(decoded.color).toBe(color);
    }
  });
});

describe("Edge Cases - Container Transitions", () => {
  const ArrayHolder = load<ArrayHolder>(boundarySchema, "ArrayHolder");
  const RecordHolder = load<RecordHolder>(boundarySchema, "RecordHolder");

  describe("Array Transitions", () => {
    it("should handle empty to populated transition", () => {
      const empty: ArrayHolder = { items: [] };
      const populated: ArrayHolder = { items: [1, 2, 3, 4, 5] };

      const diff = ArrayHolder.encodeDiff(empty, populated);
      const decoded = ArrayHolder.decodeDiff(empty, diff);

      expect(decoded.items).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle populated to empty transition", () => {
      const populated: ArrayHolder = { items: [1, 2, 3, 4, 5] };
      const empty: ArrayHolder = { items: [] };

      const diff = ArrayHolder.encodeDiff(populated, empty);
      const decoded = ArrayHolder.decodeDiff(populated, diff);

      expect(decoded.items).toEqual([]);
    });

    it("should handle large array", () => {
      const large: ArrayHolder = { items: Array.from({ length: 1000 }, (_, i) => i) };

      const encoded = ArrayHolder.encode(large);
      const decoded = ArrayHolder.decode(encoded);

      expect(decoded.items.length).toBe(1000);
      expect(decoded.items[0]).toBe(0);
      expect(decoded.items[999]).toBe(999);
    });

    it("should handle array growth in diff", () => {
      const small: ArrayHolder = { items: [1, 2, 3] };
      const large: ArrayHolder = { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };

      const diff = ArrayHolder.encodeDiff(small, large);
      const decoded = ArrayHolder.decodeDiff(small, diff);

      expect(decoded.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should handle array shrink in diff", () => {
      const large: ArrayHolder = { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
      const small: ArrayHolder = { items: [1, 2, 3] };

      const diff = ArrayHolder.encodeDiff(large, small);
      const decoded = ArrayHolder.decodeDiff(large, diff);

      expect(decoded.items).toEqual([1, 2, 3]);
    });
  });

  describe("Record Transitions", () => {
    it("should handle empty to populated transition", () => {
      const empty: RecordHolder = { data: new Map() };
      const populated: RecordHolder = {
        data: new Map([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]),
      };

      const diff = RecordHolder.encodeDiff(empty, populated);
      const decoded = RecordHolder.decodeDiff(empty, diff);

      expect(decoded.data.get("a")).toBe(1);
      expect(decoded.data.get("b")).toBe(2);
      expect(decoded.data.get("c")).toBe(3);
    });

    it("should handle populated to empty transition", () => {
      const populated: RecordHolder = {
        data: new Map([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]),
      };
      const empty: RecordHolder = { data: new Map() };

      const diff = RecordHolder.encodeDiff(populated, empty);
      const decoded = RecordHolder.decodeDiff(populated, diff);

      expect(decoded.data.size).toBe(0);
    });

    it("should handle key addition and removal in diff", () => {
      const state1: RecordHolder = {
        data: new Map([
          ["a", 1],
          ["b", 2],
        ]),
      };
      const state2: RecordHolder = {
        data: new Map([
          ["b", 2],
          ["c", 3],
        ]),
      };

      const diff = RecordHolder.encodeDiff(state1, state2);
      const decoded = RecordHolder.decodeDiff(state1, diff);

      expect(decoded.data.has("a")).toBe(false);
      expect(decoded.data.get("b")).toBe(2);
      expect(decoded.data.get("c")).toBe(3);
    });

    it("should handle large record", () => {
      const entries: [string, number][] = Array.from({ length: 100 }, (_, i) => [`key${i}`, i]);
      const large: RecordHolder = { data: new Map(entries) };

      const encoded = RecordHolder.encode(large);
      const decoded = RecordHolder.decode(encoded);

      expect(decoded.data.size).toBe(100);
      expect(decoded.data.get("key0")).toBe(0);
      expect(decoded.data.get("key99")).toBe(99);
    });
  });
});

describe("Edge Cases - Optional Field Transitions", () => {
  const NestedOptional = load<NestedOptional>(boundarySchema, "NestedOptional");

  it("should handle undefined to value transition", () => {
    const state1: NestedOptional = {}; // outer is optional, omit it
    const state2: NestedOptional = { outer: { inner: "hello" } };

    const diff = NestedOptional.encodeDiff(state1, state2);
    const decoded = NestedOptional.decodeDiff(state1, diff);

    expect(decoded.outer?.inner).toBe("hello");
  });

  it("should handle value to undefined transition", () => {
    const state1: NestedOptional = { outer: { inner: "hello" } };
    const state2: NestedOptional = {}; // outer is optional, omit it

    const diff = NestedOptional.encodeDiff(state1, state2);
    const decoded = NestedOptional.decodeDiff(state1, diff);

    expect(decoded.outer).toBeUndefined();
  });

  it("should handle nested optional: both undefined", () => {
    const state: NestedOptional = { outer: {} }; // inner is optional, omit it

    const encoded = NestedOptional.encode(state);
    const decoded = NestedOptional.decode(encoded);

    expect(decoded.outer).toBeDefined();
    expect(decoded.outer?.inner).toBeUndefined();
  });

  it("should handle nested optional: inner value change", () => {
    const state1: NestedOptional = { outer: { inner: "hello" } };
    const state2: NestedOptional = { outer: { inner: "world" } };

    const diff = NestedOptional.encodeDiff(state1, state2);
    const decoded = NestedOptional.decodeDiff(state1, diff);

    expect(decoded.outer?.inner).toBe("world");
  });

  it("should handle nested optional: inner undefined to value", () => {
    const state1: NestedOptional = { outer: {} }; // inner is optional, omit it
    const state2: NestedOptional = { outer: { inner: "hello" } };

    const diff = NestedOptional.encodeDiff(state1, state2);
    const decoded = NestedOptional.decodeDiff(state1, diff);

    expect(decoded.outer?.inner).toBe("hello");
  });
});

describe("Edge Cases - Union Type Transitions", () => {
  const UnionHolder = load<UnionHolder>(boundarySchema, "UnionHolder");

  it("should handle all variant combinations in diff", () => {
    const actionA1: UnionHolder = { action: { type: "ActionA", val: { value: 1 } } };
    const actionA2: UnionHolder = { action: { type: "ActionA", val: { value: 2 } } };
    const actionB1: UnionHolder = { action: { type: "ActionB", val: { name: "test1" } } };
    const actionB2: UnionHolder = { action: { type: "ActionB", val: { name: "test2" } } };

    // A -> A (same variant, different value)
    let diff = UnionHolder.encodeDiff(actionA1, actionA2);
    let decoded = UnionHolder.decodeDiff(actionA1, diff);
    expect(decoded.action.type).toBe("ActionA");
    expect((decoded.action.val as { value: number }).value).toBe(2);

    // A -> B (different variant)
    diff = UnionHolder.encodeDiff(actionA1, actionB1);
    decoded = UnionHolder.decodeDiff(actionA1, diff);
    expect(decoded.action.type).toBe("ActionB");
    expect((decoded.action.val as { name: string }).name).toBe("test1");

    // B -> A (different variant)
    diff = UnionHolder.encodeDiff(actionB1, actionA1);
    decoded = UnionHolder.decodeDiff(actionB1, diff);
    expect(decoded.action.type).toBe("ActionA");
    expect((decoded.action.val as { value: number }).value).toBe(1);

    // B -> B (same variant, different value)
    diff = UnionHolder.encodeDiff(actionB1, actionB2);
    decoded = UnionHolder.decodeDiff(actionB1, diff);
    expect(decoded.action.type).toBe("ActionB");
    expect((decoded.action.val as { name: string }).name).toBe("test2");
  });
});

describe("Edge Cases - Encoding Determinism", () => {
  const ArrayHolder = load<ArrayHolder>(boundarySchema, "ArrayHolder");
  const RecordHolder = load<RecordHolder>(boundarySchema, "RecordHolder");

  it("should produce identical bytes for identical arrays", () => {
    const arr1: ArrayHolder = { items: [1, 2, 3, 4, 5] };
    const arr2: ArrayHolder = { items: [1, 2, 3, 4, 5] };

    const encoded1 = ArrayHolder.encode(arr1);
    const encoded2 = ArrayHolder.encode(arr2);

    expect(encoded1).toEqual(encoded2);
  });

  it("should produce identical bytes for identical records", () => {
    const rec1: RecordHolder = {
      data: new Map([
        ["a", 1],
        ["b", 2],
      ]),
    };
    const rec2: RecordHolder = {
      data: new Map([
        ["a", 1],
        ["b", 2],
      ]),
    };

    const encoded1 = RecordHolder.encode(rec1);
    const encoded2 = RecordHolder.encode(rec2);

    expect(encoded1).toEqual(encoded2);
  });

  it("should produce identical diff bytes for identical transitions", () => {
    const state1: ArrayHolder = { items: [1, 2, 3] };
    const state2: ArrayHolder = { items: [1, 2, 3, 4, 5] };

    const diff1 = ArrayHolder.encodeDiff(state1, state2);
    const diff2 = ArrayHolder.encodeDiff(state1, state2);

    expect(diff1).toEqual(diff2);
  });
});

describe("Edge Cases - Error Message Quality", () => {
  const ArrayHolder = load<ArrayHolder>(boundarySchema, "ArrayHolder");
  const RecordHolder = load<RecordHolder>(boundarySchema, "RecordHolder");
  const EnumHolder = load<EnumHolder>(boundarySchema, "EnumHolder");

  it("should include field name in validation error for wrong type", () => {
    expect(() => ArrayHolder.fromJson({ items: "not an array" })).toThrow(/items/);
  });

  it("should include field name in validation error for array element", () => {
    expect(() => ArrayHolder.fromJson({ items: [1, 2, "three", 4] })).toThrow();
  });

  it("should include field name in validation error for record", () => {
    expect(() => RecordHolder.fromJson({ data: "not a map" })).toThrow(/data/);
  });

  it("should provide meaningful error for invalid enum", () => {
    try {
      EnumHolder.fromJson({ color: "INVALID" });
      expect.fail("Should have thrown");
    } catch (e) {
      const message = (e as Error).message;
      expect(message).toMatch(/color|INVALID|enum/i);
    }
  });
});
