import { describe, it, expect } from "vitest";
import {
  parseString,
  parseInt,
  parseUInt,
  parseFloat,
  parseBoolean,
  parseEnum,
  parseOptional,
  parseArray,
  parseRecord,
  tryParseField,
  mapValues,
} from "../src/helpers";

describe("Helper Functions - Parse and Validation", () => {
  describe("parseString", () => {
    it("should accept valid strings", () => {
      expect(parseString("hello")).toBe("hello");
      expect(parseString("")).toBe("");
      expect(parseString("123")).toBe("123");
    });

    it("should reject non-strings", () => {
      expect(() => parseString(123)).toThrow("Invalid string: 123");
      expect(() => parseString(null)).toThrow("Invalid string");
      expect(() => parseString(undefined)).toThrow("Invalid string");
      expect(() => parseString(true)).toThrow("Invalid string");
      expect(() => parseString({})).toThrow("Invalid string");
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

  describe("parseUInt", () => {
    it("should accept valid unsigned integers", () => {
      expect(parseUInt(42)).toBe(42);
      expect(parseUInt(0)).toBe(0);
    });

    it("should parse string unsigned integers", () => {
      expect(parseUInt("42")).toBe(42);
      expect(parseUInt("0")).toBe(0);
    });

    it("should reject negative integers", () => {
      expect(() => parseUInt(-10)).toThrow("Invalid uint: -10");
      expect(() => parseUInt("-10")).toThrow("Invalid uint");
    });

    it("should reject non-integers", () => {
      expect(() => parseUInt(3.14)).toThrow("Invalid uint: 3.14");
      expect(() => parseUInt("3.14")).toThrow("Invalid uint");
      expect(() => parseUInt(NaN)).toThrow("Invalid uint");
      expect(() => parseUInt(Infinity)).toThrow("Invalid uint");
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

    it('should accept string "true" and "false"', () => {
      expect(parseBoolean("true")).toBe(true);
      expect(parseBoolean("false")).toBe(false);
    });

    it("should reject non-booleans", () => {
      expect(() => parseBoolean(1)).toThrow("Invalid boolean: 1");
      expect(() => parseBoolean(0)).toThrow("Invalid boolean: 0");
      expect(() => parseBoolean("yes")).toThrow("Invalid boolean");
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

    it("should reject invalid enum values", () => {
      expect(() => parseEnum("YELLOW", Color)).toThrow("Invalid enum: YELLOW");
      expect(() => parseEnum("red", Color)).toThrow("Invalid enum: red");
      expect(() => parseEnum(0, Color)).toThrow("Invalid enum: 0");
      expect(() => parseEnum(null, Color)).toThrow("Invalid enum");
    });
  });

  describe("parseOptional", () => {
    it("should accept null/undefined as valid optional", () => {
      expect(parseOptional(null, parseString)).toBeUndefined();
      expect(parseOptional(undefined, parseString)).toBeUndefined();
    });

    it("should parse valid inner values", () => {
      expect(parseOptional("hello", parseString)).toBe("hello");
      expect(parseOptional(42, parseInt)).toBe(42);
    });

    it("should throw with cause on invalid inner values", () => {
      try {
        parseOptional(123, parseString);
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

    it("should reject non-arrays", () => {
      expect(() => parseArray("not array", parseString)).toThrow("Invalid array");
      expect(() => parseArray(null, parseString)).toThrow("Invalid array");
      expect(() => parseArray({}, parseString)).toThrow("Invalid array");
    });

    it("should throw with index information on invalid element", () => {
      try {
        parseArray(["a", 123, "c"], parseString);
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

    it("should throw with key/value information on invalid element", () => {
      const obj = { foo: "bar", baz: 123 };
      try {
        parseRecord(obj, parseString, parseString);
        expect.fail("Should have thrown");
      } catch (err: any) {
        expect(err.message).toContain("Invalid record element (baz, 123)");
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
          parseOptional(123, parseString);
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
