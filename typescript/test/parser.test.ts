import { describe, it, expect } from "vitest";
import { parseSchemaYml, ObjectType, ReferenceType } from "@hpx7/delta-pack";

describe("YAML Schema Parser", () => {
  describe("Angle bracket syntax", () => {
    it("should support angle bracket syntax without spaces after comma", () => {
      // Test that <K,V> (no space) works the same as <K, V> (with space)
      const schema1 = parseSchemaYml("TestType:\n  field: <string,int>");
      const schema2 = parseSchemaYml("TestType:\n  field: <string, int>");

      const type1 = (schema1["TestType"] as ObjectType).properties["field"]!;
      const type2 = (schema2["TestType"] as ObjectType).properties["field"]!;

      expect(type1.type).toBe("record");
      expect(type2.type).toBe("record");
      expect(type1).toEqual(type2);

      // Test with suffixes
      const schema3 = parseSchemaYml("TestType:\n  field: <string,int>[]?");
      const type3 = (schema3["TestType"] as ObjectType).properties["field"]!;

      expect(type3.type).toBe("optional");
      const arrayType = (type3 as any).value;
      expect(arrayType.type).toBe("array");
      const recordType = arrayType.value;
      expect(recordType.type).toBe("record");
      expect(recordType.key.type).toBe("string");
      expect(recordType.value.type).toBe("int");
    });

    it("should support nested record types in values", () => {
      // Test nested inline records: <string, <int, Player>>
      const schema = parseSchemaYml(`
Player:
  id: string
  name: string

TestType:
  field: <string, <int, Player>>
`);

      const fieldType = (schema["TestType"] as ObjectType).properties["field"]!;
      expect(fieldType.type).toBe("record");

      // Key should be string
      expect((fieldType as { key: { type: string } }).key.type).toBe("string");

      // Value should be a nested record
      const valueType = (fieldType as { value: { type: string; key: { type: string }; value: ReferenceType } }).value;
      expect(valueType.type).toBe("record");
      expect(valueType.key.type).toBe("int");
      expect(valueType.value.type).toBe("reference");
      expect(valueType.value.ref.name).toBe("Player");
    });
  });

  describe("Bounded integer parsing", () => {
    it("should parse int with min parameter", () => {
      const schema = parseSchemaYml("TestType:\n  score: int(min=0)");
      const field = (schema["TestType"] as ObjectType).properties["score"]!;
      expect(field.type).toBe("int");
      expect((field as { min?: number }).min).toBe(0);
      expect((field as { max?: number }).max).toBeUndefined();
    });

    it("should parse int with max parameter", () => {
      const schema = parseSchemaYml("TestType:\n  level: int(max=100)");
      const field = (schema["TestType"] as ObjectType).properties["level"]!;
      expect(field.type).toBe("int");
      expect((field as { min?: number }).min).toBeUndefined();
      expect((field as { max?: number }).max).toBe(100);
    });

    it("should parse int with both min and max", () => {
      const schema = parseSchemaYml("TestType:\n  health: int(min=0, max=100)");
      const field = (schema["TestType"] as ObjectType).properties["health"]!;
      expect(field.type).toBe("int");
      expect((field as { min?: number }).min).toBe(0);
      expect((field as { max?: number }).max).toBe(100);
    });

    it("should parse int with negative min", () => {
      const schema = parseSchemaYml("TestType:\n  temp: int(min=-50, max=50)");
      const field = (schema["TestType"] as ObjectType).properties["temp"]!;
      expect(field.type).toBe("int");
      expect((field as { min?: number }).min).toBe(-50);
      expect((field as { max?: number }).max).toBe(50);
    });

    it("should parse uint as int with min=0", () => {
      const schema = parseSchemaYml("TestType:\n  count: uint");
      const field = (schema["TestType"] as ObjectType).properties["count"]!;
      expect(field.type).toBe("int");
      expect((field as { min?: number }).min).toBe(0);
    });

    it("should parse uint with max parameter", () => {
      const schema = parseSchemaYml("TestType:\n  count: uint(max=255)");
      const field = (schema["TestType"] as ObjectType).properties["count"]!;
      expect(field.type).toBe("int");
      expect((field as { min?: number }).min).toBe(0);
      expect((field as { max?: number }).max).toBe(255);
    });

    it("should parse plain int without bounds", () => {
      const schema = parseSchemaYml("TestType:\n  value: int");
      const field = (schema["TestType"] as ObjectType).properties["value"]!;
      expect(field.type).toBe("int");
      expect((field as { min?: number }).min).toBeUndefined();
      expect((field as { max?: number }).max).toBeUndefined();
    });
  });

  describe("Property name validation", () => {
    it("should reject reserved and invalid property names", () => {
      expect(() => parseSchemaYml("Test:\n  _type: string")).toThrow("_type");
      expect(() => parseSchemaYml("Test:\n  invalid-name: string")).toThrow("valid identifier");
    });
  });
});
