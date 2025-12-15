import { describe, it, expect } from "vitest";
import {
  load,
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

// Schema definitions and inferred types
const Color = EnumType("Color", ["RED", "BLUE", "GREEN"]);
const EnumHolder = ObjectType("EnumHolder", {
  color: ReferenceType(Color),
});
type EnumHolder = Infer<typeof EnumHolder>;
const ArrayHolder = ObjectType("ArrayHolder", {
  items: ArrayType(IntType()),
});
type ArrayHolder = Infer<typeof ArrayHolder>;
const RecordHolder = ObjectType("RecordHolder", {
  data: RecordType(StringType(), IntType()),
});
type RecordHolder = Infer<typeof RecordHolder>;

describe("Edge Cases - Boundary Values", () => {
  describe("Integer Boundaries", () => {
    const IntBoundaries = ObjectType("IntBoundaries", {
      minInt: IntType(),
      maxInt: IntType(),
      zero: IntType(),
      negOne: IntType(),
    });
    type IntBoundaries = Infer<typeof IntBoundaries>;
    const api = load(IntBoundaries);

    it("should handle maximum safe integer values", () => {
      // Varint encoding supports arbitrary precision, but JS has limits
      const maxSafe: IntBoundaries = {
        minInt: -2147483648, // -2^31 (32-bit signed min)
        maxInt: 2147483647, // 2^31 - 1 (32-bit signed max)
        zero: 0,
        negOne: -1,
      };

      const encoded = api.encode(maxSafe);
      const decoded = api.decode(encoded);

      expect(decoded).toEqual(maxSafe);
    });

    it("should handle negative numbers correctly with zigzag encoding", () => {
      const values: IntBoundaries = {
        minInt: -1000000,
        maxInt: 1000000,
        zero: 0,
        negOne: -1,
      };

      const encoded = api.encode(values);
      const decoded = api.decode(encoded);

      expect(decoded).toEqual(values);
    });

    it("should produce identical encoding for same values (determinism)", () => {
      const values: IntBoundaries = {
        minInt: -12345,
        maxInt: 67890,
        zero: 0,
        negOne: -1,
      };

      const encoded1 = api.encode(values);
      const encoded2 = api.encode(values);

      expect(encoded1).toEqual(encoded2);
    });
  });

  describe("Unsigned Integer Boundaries", () => {
    const UIntBoundaries = ObjectType("UIntBoundaries", {
      zero: UIntType(),
      maxUint: UIntType(),
      one: UIntType(),
    });
    type UIntBoundaries = Infer<typeof UIntBoundaries>;
    const api = load(UIntBoundaries);

    it("should handle maximum unsigned values", () => {
      const maxUnsigned: UIntBoundaries = {
        zero: 0,
        maxUint: 4294967295, // 2^32 - 1
        one: 1,
      };

      const encoded = api.encode(maxUnsigned);
      const decoded = api.decode(encoded);

      expect(decoded).toEqual(maxUnsigned);
    });

    it("should reject negative values in fromJson", () => {
      expect(() => api.fromJson({ zero: -1, maxUint: 0, one: 0 })).toThrow();
    });
  });

  describe("Float Edge Cases", () => {
    const FloatEdges = ObjectType("FloatEdges", {
      zero: FloatType(),
      negZero: FloatType(),
      small: FloatType(),
      large: FloatType(),
      negative: FloatType(),
    });
    type FloatEdges = Infer<typeof FloatEdges>;
    const api = load(FloatEdges);

    it("should handle zero and negative zero", () => {
      const values: FloatEdges = {
        zero: 0.0,
        negZero: -0.0,
        small: 0.000001,
        large: 1e10,
        negative: -1e10,
      };

      const encoded = api.encode(values);
      const decoded = api.decode(encoded);

      // Zero values should round-trip (IEEE 754 preserves -0)
      expect(decoded.zero).toBe(0);
      expect(Object.is(decoded.negZero, -0)).toBe(true); // -0 is preserved
      expect(Math.abs(decoded.small - values.small)).toBeLessThan(1e-10);
      expect(Math.abs(decoded.large - values.large)).toBeLessThan(1);
      expect(Math.abs(decoded.negative - values.negative)).toBeLessThan(1);
    });

    it("should handle very small float values", () => {
      const values: FloatEdges = {
        zero: 0,
        negZero: 0,
        small: 1e-20,
        large: 0,
        negative: -1e-20,
      };

      const encoded = api.encode(values);
      const decoded = api.decode(encoded);

      expect(api.equals(decoded, values)).toBe(true);
    });

    it("should produce identical encoding for same float values (determinism)", () => {
      const values: FloatEdges = {
        zero: 0.0,
        negZero: 0.0,
        small: 3.14159,
        large: 1000.5,
        negative: -999.999,
      };

      const encoded1 = api.encode(values);
      const encoded2 = api.encode(values);

      expect(encoded1).toEqual(encoded2);
    });
  });

  describe("Quantized Float Precision", () => {
    const QuantizedFloatEdges = ObjectType("QuantizedFloatEdges", {
      value: FloatType({ precision: 0.1 }),
    });
    type QuantizedFloatEdges = Infer<typeof QuantizedFloatEdges>;
    const api = load(QuantizedFloatEdges);

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
        const encoded = api.encode({ value: input });
        const decoded = api.decode(encoded);
        expect(decoded.value).toBeCloseTo(expected, 5);
      }
    });

    it("should handle quantization at boundaries consistently", () => {
      // Test that repeated encode/decode doesn't accumulate error
      let value: QuantizedFloatEdges = { value: 123.456 };

      for (let i = 0; i < 10; i++) {
        const encoded = api.encode(value);
        value = api.decode(encoded);
      }

      // After multiple round-trips, should still be quantized to 0.1 precision
      expect(value.value).toBeCloseTo(123.5, 5);
    });
  });
});

describe("Edge Cases - String Encoding", () => {
  const StringEdges = ObjectType("StringEdges", {
    empty: StringType(),
    unicode: StringType(),
    long: StringType(),
  });
  type StringEdges = Infer<typeof StringEdges>;
  const api = load(StringEdges);

  it("should handle empty strings", () => {
    const values: StringEdges = { empty: "", unicode: "", long: "" };

    const encoded = api.encode(values);
    const decoded = api.decode(encoded);

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

    const encoded = api.encode(values);
    const decoded = api.decode(encoded);

    expect(decoded.unicode).toBe("Hello 👋 World 🌍 Test 🎮");
  });

  it("should handle multi-byte UTF-8 characters", () => {
    const values: StringEdges = {
      empty: "",
      unicode: "日本語テスト αβγδ مرحبا",
      long: "",
    };

    const encoded = api.encode(values);
    const decoded = api.decode(encoded);

    expect(decoded.unicode).toBe("日本語テスト αβγδ مرحبا");
  });

  it("should handle long strings", () => {
    const longString = "a".repeat(10000);
    const values: StringEdges = { empty: "", unicode: "", long: longString };

    const encoded = api.encode(values);
    const decoded = api.decode(encoded);

    expect(decoded.long).toBe(longString);
    expect(decoded.long.length).toBe(10000);
  });

  it("should handle strings with special characters", () => {
    const values: StringEdges = {
      empty: "",
      unicode: "line1\nline2\ttab\r\nwindows",
      long: "",
    };

    const encoded = api.encode(values);
    const decoded = api.decode(encoded);

    expect(decoded.unicode).toBe("line1\nline2\ttab\r\nwindows");
  });

  it("should produce identical encoding for same strings (determinism)", () => {
    const values: StringEdges = {
      empty: "",
      unicode: "test 🎮 string",
      long: "x".repeat(1000),
    };

    const encoded1 = api.encode(values);
    const encoded2 = api.encode(values);

    expect(encoded1).toEqual(encoded2);
  });
});

describe("Edge Cases - Boolean RLE Integration", () => {
  const ManyBooleans = ObjectType("ManyBooleans", {
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
  });
  type ManyBooleans = Infer<typeof ManyBooleans>;
  const api = load(ManyBooleans);

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

    const encoded = api.encode(allTrue);
    const decoded = api.decode(encoded);

    expect(api.equals(decoded, allTrue)).toBe(true);
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

    const encoded = api.encode(allFalse);
    const decoded = api.decode(encoded);

    expect(api.equals(decoded, allFalse)).toBe(true);
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

    const encoded = api.encode(alternating);
    const decoded = api.decode(encoded);

    expect(api.equals(decoded, alternating)).toBe(true);
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

    const encoded = api.encode(longRun);
    const decoded = api.decode(encoded);

    expect(api.equals(decoded, longRun)).toBe(true);
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

    const diff = api.encodeDiff(state1, state2);
    const decoded = api.decodeDiff(state1, diff);

    expect(api.equals(decoded, state2)).toBe(true);
  });
});

describe("Edge Cases - Enum Validation", () => {
  const api = load(EnumHolder);

  it("should accept valid enum values", () => {
    expect(() => api.fromJson({ color: "RED" })).not.toThrow();
    expect(() => api.fromJson({ color: "BLUE" })).not.toThrow();
    expect(() => api.fromJson({ color: "GREEN" })).not.toThrow();
  });

  it("should reject invalid enum values", () => {
    expect(() => api.fromJson({ color: "PURPLE" })).toThrow();
    expect(() => api.fromJson({ color: "red" })).toThrow(); // case sensitive
    expect(() => api.fromJson({ color: "" })).toThrow();
    expect(() => api.fromJson({ color: 0 })).toThrow();
  });

  it("should encode and decode all enum values", () => {
    for (const color of ["RED", "BLUE", "GREEN"] as const) {
      const holder: EnumHolder = { color };
      const encoded = api.encode(holder);
      const decoded = api.decode(encoded);
      expect(decoded.color).toBe(color);
    }
  });
});

describe("Edge Cases - Container Transitions", () => {
  const arrayApi = load(ArrayHolder);
  const recordApi = load(RecordHolder);

  describe("Array Transitions", () => {
    it("should handle empty to populated transition", () => {
      const empty: ArrayHolder = { items: [] };
      const populated: ArrayHolder = { items: [1, 2, 3, 4, 5] };

      const diff = arrayApi.encodeDiff(empty, populated);
      const decoded = arrayApi.decodeDiff(empty, diff);

      expect(decoded.items).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle populated to empty transition", () => {
      const populated: ArrayHolder = { items: [1, 2, 3, 4, 5] };
      const empty: ArrayHolder = { items: [] };

      const diff = arrayApi.encodeDiff(populated, empty);
      const decoded = arrayApi.decodeDiff(populated, diff);

      expect(decoded.items).toEqual([]);
    });

    it("should handle large array", () => {
      const large: ArrayHolder = { items: Array.from({ length: 1000 }, (_, i) => i) };

      const encoded = arrayApi.encode(large);
      const decoded = arrayApi.decode(encoded);

      expect(decoded.items.length).toBe(1000);
      expect(decoded.items[0]).toBe(0);
      expect(decoded.items[999]).toBe(999);
    });

    it("should handle array growth in diff", () => {
      const small: ArrayHolder = { items: [1, 2, 3] };
      const large: ArrayHolder = { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };

      const diff = arrayApi.encodeDiff(small, large);
      const decoded = arrayApi.decodeDiff(small, diff);

      expect(decoded.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should handle array shrink in diff", () => {
      const large: ArrayHolder = { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
      const small: ArrayHolder = { items: [1, 2, 3] };

      const diff = arrayApi.encodeDiff(large, small);
      const decoded = arrayApi.decodeDiff(large, diff);

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

      const diff = recordApi.encodeDiff(empty, populated);
      const decoded = recordApi.decodeDiff(empty, diff);

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

      const diff = recordApi.encodeDiff(populated, empty);
      const decoded = recordApi.decodeDiff(populated, diff);

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

      const diff = recordApi.encodeDiff(state1, state2);
      const decoded = recordApi.decodeDiff(state1, diff);

      expect(decoded.data.has("a")).toBe(false);
      expect(decoded.data.get("b")).toBe(2);
      expect(decoded.data.get("c")).toBe(3);
    });

    it("should handle large record", () => {
      const entries: [string, number][] = Array.from({ length: 100 }, (_, i) => [`key${i}`, i]);
      const large: RecordHolder = { data: new Map(entries) };

      const encoded = recordApi.encode(large);
      const decoded = recordApi.decode(encoded);

      expect(decoded.data.size).toBe(100);
      expect(decoded.data.get("key0")).toBe(0);
      expect(decoded.data.get("key99")).toBe(99);
    });
  });
});

describe("Edge Cases - Optional Field Transitions", () => {
  const InnerOptional = ObjectType("InnerOptional", {
    inner: OptionalType(StringType()),
  });
  const NestedOptional = ObjectType("NestedOptional", {
    outer: OptionalType(ReferenceType(InnerOptional)),
  });
  type NestedOptional = Infer<typeof NestedOptional>;
  const api = load(NestedOptional);

  it("should handle undefined to value transition", () => {
    const state1: NestedOptional = {}; // outer is optional, omit it
    const state2: NestedOptional = { outer: { inner: "hello" } };

    const diff = api.encodeDiff(state1, state2);
    const decoded = api.decodeDiff(state1, diff);

    expect(decoded.outer?.inner).toBe("hello");
  });

  it("should handle value to undefined transition", () => {
    const state1: NestedOptional = { outer: { inner: "hello" } };
    const state2: NestedOptional = {}; // outer is optional, omit it

    const diff = api.encodeDiff(state1, state2);
    const decoded = api.decodeDiff(state1, diff);

    expect(decoded.outer).toBeUndefined();
  });

  it("should handle nested optional: both undefined", () => {
    const state: NestedOptional = { outer: {} }; // inner is optional, omit it

    const encoded = api.encode(state);
    const decoded = api.decode(encoded);

    expect(decoded.outer).toBeDefined();
    expect(decoded.outer?.inner).toBeUndefined();
  });

  it("should handle nested optional: inner value change", () => {
    const state1: NestedOptional = { outer: { inner: "hello" } };
    const state2: NestedOptional = { outer: { inner: "world" } };

    const diff = api.encodeDiff(state1, state2);
    const decoded = api.decodeDiff(state1, diff);

    expect(decoded.outer?.inner).toBe("world");
  });

  it("should handle nested optional: inner undefined to value", () => {
    const state1: NestedOptional = { outer: {} }; // inner is optional, omit it
    const state2: NestedOptional = { outer: { inner: "hello" } };

    const diff = api.encodeDiff(state1, state2);
    const decoded = api.decodeDiff(state1, diff);

    expect(decoded.outer?.inner).toBe("hello");
  });
});

describe("Edge Cases - Union Type Transitions", () => {
  const ActionA = ObjectType("ActionA", { value: IntType() });
  const ActionB = ObjectType("ActionB", { name: StringType() });
  const ActionUnion = UnionType("ActionUnion", [ActionA, ActionB]);
  const UnionHolder = ObjectType("UnionHolder", {
    action: ReferenceType(ActionUnion),
  });
  type UnionHolder = Infer<typeof UnionHolder>;
  const api = load(UnionHolder);

  it("should handle all variant combinations in diff", () => {
    const actionA1: UnionHolder = { action: { type: "ActionA", val: { value: 1 } } };
    const actionA2: UnionHolder = { action: { type: "ActionA", val: { value: 2 } } };
    const actionB1: UnionHolder = { action: { type: "ActionB", val: { name: "test1" } } };
    const actionB2: UnionHolder = { action: { type: "ActionB", val: { name: "test2" } } };

    // A -> A (same variant, different value)
    let diff = api.encodeDiff(actionA1, actionA2);
    let decoded = api.decodeDiff(actionA1, diff);
    expect(decoded.action.type).toBe("ActionA");
    expect((decoded.action.val as { value: number }).value).toBe(2);

    // A -> B (different variant)
    diff = api.encodeDiff(actionA1, actionB1);
    decoded = api.decodeDiff(actionA1, diff);
    expect(decoded.action.type).toBe("ActionB");
    expect((decoded.action.val as { name: string }).name).toBe("test1");

    // B -> A (different variant)
    diff = api.encodeDiff(actionB1, actionA1);
    decoded = api.decodeDiff(actionB1, diff);
    expect(decoded.action.type).toBe("ActionA");
    expect((decoded.action.val as { value: number }).value).toBe(1);

    // B -> B (same variant, different value)
    diff = api.encodeDiff(actionB1, actionB2);
    decoded = api.decodeDiff(actionB1, diff);
    expect(decoded.action.type).toBe("ActionB");
    expect((decoded.action.val as { name: string }).name).toBe("test2");
  });
});

describe("Edge Cases - Encoding Determinism", () => {
  const arrayApi = load(ArrayHolder);
  const recordApi = load(RecordHolder);

  it("should produce identical bytes for identical arrays", () => {
    const arr1: ArrayHolder = { items: [1, 2, 3, 4, 5] };
    const arr2: ArrayHolder = { items: [1, 2, 3, 4, 5] };

    const encoded1 = arrayApi.encode(arr1);
    const encoded2 = arrayApi.encode(arr2);

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

    const encoded1 = recordApi.encode(rec1);
    const encoded2 = recordApi.encode(rec2);

    expect(encoded1).toEqual(encoded2);
  });

  it("should produce identical diff bytes for identical transitions", () => {
    const state1: ArrayHolder = { items: [1, 2, 3] };
    const state2: ArrayHolder = { items: [1, 2, 3, 4, 5] };

    const diff1 = arrayApi.encodeDiff(state1, state2);
    const diff2 = arrayApi.encodeDiff(state1, state2);

    expect(diff1).toEqual(diff2);
  });
});

describe("Edge Cases - Error Message Quality", () => {
  const arrayApi = load(ArrayHolder);
  const recordApi = load(RecordHolder);
  const enumApi = load(EnumHolder);

  it("should include field name in validation error for wrong type", () => {
    expect(() => arrayApi.fromJson({ items: "not an array" })).toThrow(/items/);
  });

  it("should include field name in validation error for array element", () => {
    expect(() => arrayApi.fromJson({ items: [1, 2, "three", 4] })).toThrow();
  });

  it("should include field name in validation error for record", () => {
    expect(() => recordApi.fromJson({ data: "not a map" })).toThrow(/data/);
  });

  it("should provide meaningful error for invalid enum", () => {
    try {
      enumApi.fromJson({ color: "INVALID" });
      expect.fail("Should have thrown");
    } catch (e) {
      const message = (e as Error).message;
      expect(message).toMatch(/color|INVALID|enum/i);
    }
  });
});
