import { describe, it, expect } from "vitest";
import {
  parseString,
  parseInt,
  parseFloat,
  parseBoolean,
  parseEnum,
  parseOptional,
  parseArray,
  parseRecord,
  tryParseField,
  mapValues,
  Encoder,
  Decoder,
} from "@hpx7/delta-pack";

describe("Helper Functions - Parse and Validation", () => {
  describe("parseString", () => {
    it("should accept valid strings", () => {
      expect(parseString("hello")).toBe("hello");
      expect(parseString("")).toBe("");
      expect(parseString("123")).toBe("123");
    });

    it("should coerce numbers and booleans to strings", () => {
      expect(parseString(123)).toBe("123");
      expect(parseString(3.14)).toBe("3.14");
      expect(parseString(true)).toBe("true");
      expect(parseString(false)).toBe("false");
      expect(parseString(0)).toBe("0");
    });

    it("should reject non-coercible values", () => {
      expect(() => parseString(null)).toThrow("Invalid string");
      expect(() => parseString(undefined)).toThrow("Invalid string");
      expect(() => parseString({})).toThrow("Invalid string");
      expect(() => parseString([])).toThrow("Invalid string");
    });
  });

  describe("parseInt", () => {
    it("should accept valid integers", () => {
      expect(parseInt(42)).toBe(42);
      expect(parseInt(-10)).toBe(-10);
      expect(parseInt(0)).toBe(0);
    });

    it("should parse string integers", () => {
      expect(parseInt("42")).toBe(42);
      expect(parseInt("-10")).toBe(-10);
      expect(parseInt("0")).toBe(0);
    });

    it("should reject non-integers", () => {
      expect(() => parseInt(3.14)).toThrow("Invalid int: 3.14");
      expect(() => parseInt("3.14")).toThrow("Invalid int");
      expect(() => parseInt(NaN)).toThrow("Invalid int");
      expect(() => parseInt(Infinity)).toThrow("Invalid int");
      expect(() => parseInt("hello")).toThrow("Invalid int");
      expect(() => parseInt(null)).toThrow("Invalid int");
      expect(() => parseInt(true)).toThrow("Invalid int");
    });
  });

  describe("parseInt with bounds", () => {
    it("should accept integers within bounds", () => {
      expect(parseInt(42, 0, 100)).toBe(42);
      expect(parseInt(0, 0, 100)).toBe(0);
      expect(parseInt(100, 0, 100)).toBe(100);
      expect(parseInt(-50, -100, 100)).toBe(-50);
    });

    it("should accept integers with no bounds", () => {
      expect(parseInt(42)).toBe(42);
      expect(parseInt(-100)).toBe(-100);
    });

    it("should reject values below minimum", () => {
      expect(() => parseInt(-1, 0, 100)).toThrow("below minimum");
      expect(() => parseInt(-101, -100, 100)).toThrow("below minimum");
    });

    it("should reject values above maximum", () => {
      expect(() => parseInt(101, 0, 100)).toThrow("above maximum");
      expect(() => parseInt(101, undefined, 100)).toThrow("above maximum");
    });

    it("should reject non-integers", () => {
      expect(() => parseInt(3.14, 0, 100)).toThrow("Invalid int");
      expect(() => parseInt(NaN)).toThrow("Invalid int");
    });
  });

  describe("parseFloat", () => {
    it("should accept valid floats", () => {
      expect(parseFloat(3.14)).toBe(3.14);
      expect(parseFloat(42)).toBe(42);
      expect(parseFloat(-10.5)).toBe(-10.5);
      expect(parseFloat(0)).toBe(0);
    });

    it("should parse string floats", () => {
      expect(parseFloat("3.14")).toBe(3.14);
      expect(parseFloat("42")).toBe(42);
      expect(parseFloat("-10.5")).toBe(-10.5);
    });

    it("should reject invalid floats", () => {
      expect(() => parseFloat(NaN)).toThrow("Invalid float");
      expect(() => parseFloat(Infinity)).toThrow("Invalid float");
      expect(() => parseFloat(-Infinity)).toThrow("Invalid float");
      expect(() => parseFloat("hello")).toThrow("Invalid float");
      expect(() => parseFloat(null)).toThrow("Invalid float");
    });
  });

  describe("parseBoolean", () => {
    it("should accept valid booleans", () => {
      expect(parseBoolean(true)).toBe(true);
      expect(parseBoolean(false)).toBe(false);
    });

    it('should accept string "true" and "false" (case-insensitive)', () => {
      expect(parseBoolean("true")).toBe(true);
      expect(parseBoolean("false")).toBe(false);
      expect(parseBoolean("TRUE")).toBe(true);
      expect(parseBoolean("FALSE")).toBe(false);
      expect(parseBoolean("True")).toBe(true);
      expect(parseBoolean("False")).toBe(false);
    });

    it("should accept 1/0 and '1'/'0' as booleans", () => {
      expect(parseBoolean(1)).toBe(true);
      expect(parseBoolean(0)).toBe(false);
      expect(parseBoolean("1")).toBe(true);
      expect(parseBoolean("0")).toBe(false);
    });

    it("should reject non-booleans", () => {
      expect(() => parseBoolean("yes")).toThrow("Invalid boolean");
      expect(() => parseBoolean("no")).toThrow("Invalid boolean");
      expect(() => parseBoolean(2)).toThrow("Invalid boolean");
      expect(() => parseBoolean(null)).toThrow("Invalid boolean");
      expect(() => parseBoolean(undefined)).toThrow("Invalid boolean");
    });
  });

  describe("parseEnum", () => {
    const Color = {
      RED: 0,
      GREEN: 1,
      BLUE: 2,
      0: "RED",
      1: "GREEN",
      2: "BLUE",
    };

    it("should accept valid enum values", () => {
      expect(parseEnum("RED", Color)).toBe("RED");
      expect(parseEnum("GREEN", Color)).toBe("GREEN");
      expect(parseEnum("BLUE", Color)).toBe("BLUE");
    });

    it("should match enum values case-insensitively", () => {
      expect(parseEnum("red", Color)).toBe("RED");
      expect(parseEnum("Red", Color)).toBe("RED");
      expect(parseEnum("green", Color)).toBe("GREEN");
      expect(parseEnum("blue", Color)).toBe("BLUE");
    });

    it("should accept integer indices", () => {
      expect(parseEnum(0, Color)).toBe("RED");
      expect(parseEnum(1, Color)).toBe("GREEN");
      expect(parseEnum(2, Color)).toBe("BLUE");
      expect(parseEnum("0", Color)).toBe("RED");
      expect(parseEnum("1", Color)).toBe("GREEN");
    });

    it("should reject invalid enum values", () => {
      expect(() => parseEnum("YELLOW", Color)).toThrow("Invalid enum: YELLOW");
      expect(() => parseEnum("purple", Color)).toThrow("Invalid enum: purple");
      expect(() => parseEnum(99, Color)).toThrow("Invalid enum: 99");
      expect(() => parseEnum(null, Color)).toThrow("Invalid enum");
    });
  });

  describe("parseOptional", () => {
    it("should accept null/undefined as valid optional", () => {
      expect(parseOptional(null, parseString)).toBeUndefined();
      expect(parseOptional(undefined, parseString)).toBeUndefined();
    });

    it("should treat empty string as undefined", () => {
      expect(parseOptional("", parseString)).toBeUndefined();
    });

    it("should parse valid inner values", () => {
      expect(parseOptional("hello", parseString)).toBe("hello");
      expect(parseOptional(42, parseInt)).toBe(42);
    });

    it("should coerce numbers to strings in optional", () => {
      expect(parseOptional(123, parseString)).toBe("123");
    });

    it("should throw with cause on invalid inner values", () => {
      try {
        parseOptional({}, parseString);
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toContain("Invalid optional");
        expect(err.cause).toBeDefined();
        expect(err.cause.message).toContain("Invalid string");
      }
    });
  });

  describe("parseArray", () => {
    it("should accept valid arrays", () => {
      expect(parseArray(["a", "b", "c"], parseString)).toEqual(["a", "b", "c"]);
      expect(parseArray([1, 2, 3], parseInt)).toEqual([1, 2, 3]);
      expect(parseArray([], parseString)).toEqual([]);
    });

    it("should coerce numbers to strings in array", () => {
      expect(parseArray(["a", 123, "c"], parseString)).toEqual(["a", "123", "c"]);
    });

    it("should reject non-arrays", () => {
      expect(() => parseArray("not array", parseString)).toThrow("Invalid array");
      expect(() => parseArray(null, parseString)).toThrow("Invalid array");
      expect(() => parseArray({}, parseString)).toThrow("Invalid array");
    });

    it("should throw with index information on invalid element", () => {
      try {
        parseArray(["a", {}, "c"], parseString);
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toContain("Invalid array element at index 1");
        expect(err.cause).toBeDefined();
        expect(err.cause.message).toContain("Invalid string");
      }
    });
  });

  describe("parseRecord", () => {
    it("should accept valid plain objects", () => {
      const obj = { foo: "bar", baz: "qux" };
      const result = parseRecord(obj, parseString, parseString);
      expect(result).toBeInstanceOf(Map);
      expect(result.get("foo")).toBe("bar");
      expect(result.get("baz")).toBe("qux");
    });

    it("should accept Map instances", () => {
      const map = new Map([
        ["foo", "bar"],
        ["baz", "qux"],
      ]);
      const result = parseRecord(map, parseString, parseString);
      expect(result).toBeInstanceOf(Map);
      expect(result.get("foo")).toBe("bar");
      expect(result.get("baz")).toBe("qux");
    });

    it("should reject arrays", () => {
      expect(() => parseRecord([], parseString, parseString)).toThrow("Invalid record");
    });

    it("should reject null/undefined", () => {
      expect(() => parseRecord(null, parseString, parseString)).toThrow("Invalid record");
      expect(() => parseRecord(undefined, parseString, parseString)).toThrow("Invalid record");
    });

    it("should reject non-plain objects (Date)", () => {
      const date = new Date();
      expect(() => parseRecord(date, parseString, parseString)).toThrow("Invalid record, got object");
    });

    it("should reject non-plain objects (Set)", () => {
      const set = new Set(["a", "b"]);
      expect(() => parseRecord(set, parseString, parseString)).toThrow("Invalid record, got object");
    });

    it("should reject custom class instances", () => {
      class CustomClass {
        foo = "bar";
      }
      const instance = new CustomClass();
      expect(() => parseRecord(instance, parseString, parseString)).toThrow("Invalid record, got object");
    });

    it("should accept Object.create(null)", () => {
      const obj = Object.create(null);
      obj.foo = "bar";
      expect(parseRecord(obj, parseString, parseString)).toBeInstanceOf(Map);
    });

    it("should coerce numbers to strings in record values", () => {
      const obj = { foo: "bar", baz: 123 };
      const result = parseRecord(obj, parseString, parseString);
      expect(result.get("baz")).toBe("123");
    });

    it("should throw with key/value information on invalid element", () => {
      const obj = { foo: "bar", baz: {} };
      try {
        parseRecord(obj, parseString, parseString);
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toContain("Invalid record element");
        expect(err.cause).toBeDefined();
      }
    });
  });

  describe("tryParseField", () => {
    it("should return value on success", () => {
      expect(tryParseField(() => 42, "score")).toBe(42);
      expect(tryParseField(() => "hello", "name")).toBe("hello");
    });

    it("should throw with field name on error", () => {
      try {
        tryParseField(() => {
          throw new Error("Invalid value");
        }, "playerName");
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toBe("Invalid field playerName");
        expect(err.cause).toBeDefined();
        expect(err.cause.message).toBe("Invalid value");
      }
    });
  });

  describe("mapValues", () => {
    it("should transform object values", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = mapValues(obj, (val) => val * 2);
      expect(result).toEqual({ a: 2, b: 4, c: 6 });
    });

    it("should pass key to transform function", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = mapValues(obj, (val, key) => `${key}:${val}`);
      expect(result).toEqual({ a: "a:1", b: "b:2", c: "c:3" });
    });

    it("should handle empty objects", () => {
      const obj = {};
      const result = mapValues(obj, (val) => val);
      expect(result).toEqual({});
    });

    it("should preserve key names", () => {
      const obj = { foo: "bar", baz: "qux" };
      const result = mapValues(obj, (val) => val.toUpperCase());
      expect(Object.keys(result)).toEqual(["foo", "baz"]);
    });
  });

  describe("Error chaining", () => {
    it("should chain errors through nested structures", () => {
      try {
        tryParseField(() => {
          parseArray([1, 2, "invalid"], parseInt);
        }, "scores");
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toContain("Invalid field scores");
        expect(err.cause).toBeDefined();
        expect(err.cause.message).toContain("Invalid array element at index 2");
        expect(err.cause.cause).toBeDefined();
        expect(err.cause.cause.message).toContain("Invalid int");
      }
    });

    it("should chain errors through optional fields", () => {
      try {
        tryParseField(() => {
          parseOptional({}, parseString);
        }, "optionalName");
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toContain("Invalid field optionalName");
        expect(err.cause).toBeDefined();
        expect(err.cause.message).toContain("Invalid optional");
        expect(err.cause.cause).toBeDefined();
        expect(err.cause.cause.message).toContain("Invalid string");
      }
    });
  });
});

describe("Encoder/Decoder - RLE Boolean Encoding", () => {
  it("should handle empty boolean sequences", () => {
    const encoder = new Encoder();
    const buf = encoder.toBuffer();
    // No booleans pushed, parsing should still succeed
    expect(buf.length).toBeGreaterThan(0);
    expect(() => new Decoder(buf)).not.toThrow();
  });

  it("should encode and decode single boolean", () => {
    const encoder = new Encoder();
    encoder.pushBoolean(true);
    const buf = encoder.toBuffer();
    const decoder = new Decoder(buf);
    expect(decoder.nextBoolean()).toBe(true);
  });

  it("should encode and decode run of 1 (alternating pattern)", () => {
    const encoder = new Encoder();
    encoder.pushBoolean(true);
    encoder.pushBoolean(false);
    encoder.pushBoolean(true);
    encoder.pushBoolean(false);
    const buf = encoder.toBuffer();
    const decoder = new Decoder(buf);
    expect(decoder.nextBoolean()).toBe(true);
    expect(decoder.nextBoolean()).toBe(false);
    expect(decoder.nextBoolean()).toBe(true);
    expect(decoder.nextBoolean()).toBe(false);
  });

  it("should encode and decode runs of 2-3 (previously buggy)", () => {
    // Run of 2
    const encoder2 = new Encoder();
    for (let i = 0; i < 2; i++) encoder2.pushBoolean(true);
    for (let i = 0; i < 2; i++) encoder2.pushBoolean(false);
    const buf2 = encoder2.toBuffer();
    const decoder2 = new Decoder(buf2);
    expect(decoder2.nextBoolean()).toBe(true);
    expect(decoder2.nextBoolean()).toBe(true);
    expect(decoder2.nextBoolean()).toBe(false);
    expect(decoder2.nextBoolean()).toBe(false);

    // Run of 3
    const encoder3 = new Encoder();
    for (let i = 0; i < 3; i++) encoder3.pushBoolean(false);
    for (let i = 0; i < 3; i++) encoder3.pushBoolean(true);
    const buf3 = encoder3.toBuffer();
    const decoder3 = new Decoder(buf3);
    for (let i = 0; i < 3; i++) expect(decoder3.nextBoolean()).toBe(false);
    for (let i = 0; i < 3; i++) expect(decoder3.nextBoolean()).toBe(true);
  });

  it("should encode and decode runs of 4-5 (previously buggy)", () => {
    // Run of 4
    const encoder4 = new Encoder();
    for (let i = 0; i < 4; i++) encoder4.pushBoolean(true);
    const buf4 = encoder4.toBuffer();
    const decoder4 = new Decoder(buf4);
    for (let i = 0; i < 4; i++) expect(decoder4.nextBoolean()).toBe(true);

    // Run of 5
    const encoder5 = new Encoder();
    for (let i = 0; i < 5; i++) encoder5.pushBoolean(false);
    const buf5 = encoder5.toBuffer();
    const decoder5 = new Decoder(buf5);
    for (let i = 0; i < 5; i++) expect(decoder5.nextBoolean()).toBe(false);
  });

  it("should encode and decode runs of 6-13 (previously buggy)", () => {
    for (const runLength of [6, 7, 10, 13]) {
      const encoder = new Encoder();
      for (let i = 0; i < runLength; i++) encoder.pushBoolean(true);
      for (let i = 0; i < runLength; i++) encoder.pushBoolean(false);
      const buf = encoder.toBuffer();
      const decoder = new Decoder(buf);
      for (let i = 0; i < runLength; i++) {
        expect(decoder.nextBoolean()).toBe(true);
      }
      for (let i = 0; i < runLength; i++) {
        expect(decoder.nextBoolean()).toBe(false);
      }
    }
  });

  it("should encode and decode runs of 14-269", () => {
    for (const runLength of [14, 50, 100, 269]) {
      const encoder = new Encoder();
      for (let i = 0; i < runLength; i++) encoder.pushBoolean(true);
      const buf = encoder.toBuffer();
      const decoder = new Decoder(buf);
      for (let i = 0; i < runLength; i++) {
        expect(decoder.nextBoolean()).toBe(true);
      }
    }
  });

  it("should handle mixed run lengths", () => {
    const encoder = new Encoder();
    // Run of 1
    encoder.pushBoolean(true);
    // Run of 3
    for (let i = 0; i < 3; i++) encoder.pushBoolean(false);
    // Run of 5
    for (let i = 0; i < 5; i++) encoder.pushBoolean(true);
    // Run of 10
    for (let i = 0; i < 10; i++) encoder.pushBoolean(false);
    // Run of 20
    for (let i = 0; i < 20; i++) encoder.pushBoolean(true);

    const buf = encoder.toBuffer();
    const decoder = new Decoder(buf);

    expect(decoder.nextBoolean()).toBe(true);
    for (let i = 0; i < 3; i++) expect(decoder.nextBoolean()).toBe(false);
    for (let i = 0; i < 5; i++) expect(decoder.nextBoolean()).toBe(true);
    for (let i = 0; i < 10; i++) expect(decoder.nextBoolean()).toBe(false);
    for (let i = 0; i < 20; i++) expect(decoder.nextBoolean()).toBe(true);
  });

  it("should handle long sequences of same value", () => {
    const encoder = new Encoder();
    for (let i = 0; i < 100; i++) encoder.pushBoolean(false);
    const buf = encoder.toBuffer();
    const decoder = new Decoder(buf);
    for (let i = 0; i < 100; i++) {
      expect(decoder.nextBoolean()).toBe(false);
    }
  });
});
