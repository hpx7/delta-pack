import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parseSchemaYml, EnumType, ObjectType, UnionType, FloatType } from "@hpx7/delta-pack";
import { schema as tsSchema } from "./schema.js";

// Extract individual types from the TypeScript schema
const Color = tsSchema.Color;
const Player = tsSchema.Player;
const MoveAction = tsSchema.MoveAction;
const AttackAction = tsSchema.AttackAction;
const UseItemAction = tsSchema.UseItemAction;
const GameAction = tsSchema.GameAction;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("YAML Schema Parser", () => {
  const schemaYmlPath = join(__dirname, "schema.yml");
  const yamlContent = readFileSync(schemaYmlPath, "utf8");
  const parsedSchema = parseSchemaYml(yamlContent);

  it("should parse YAML schema successfully", () => {
    expect(parsedSchema).toBeDefined();
    expect(parsedSchema["Color"]).toBeDefined();
    expect(parsedSchema["Player"]).toBeDefined();
    expect(parsedSchema["Position"]).toBeDefined();
    expect(parsedSchema["Velocity"]).toBeDefined();
    expect(parsedSchema["Entity"]).toBeDefined();
    expect(parsedSchema["MoveAction"]).toBeDefined();
    expect(parsedSchema["AttackAction"]).toBeDefined();
    expect(parsedSchema["UseItemAction"]).toBeDefined();
    expect(parsedSchema["GameAction"]).toBeDefined();
    expect(parsedSchema["GameState"]).toBeDefined();
    expect(parsedSchema["Inventory"]).toBeDefined();
  });

  it("should parse Color as enum type", () => {
    const colorType = parsedSchema["Color"] as EnumType;
    expect(colorType.type).toBe("enum");
    expect(colorType.options).toEqual(["RED", "BLUE", "GREEN", "YELLOW"]);
    expect(parsedSchema["Color"]).toEqual(Color);
  });

  it("should parse Player as object type", () => {
    const playerType = parsedSchema["Player"] as ObjectType;
    expect(playerType.type).toBe("object");
    expect(playerType.properties).toBeDefined();
    expect(playerType.properties["id"]!.type).toBe("string");
    expect(playerType.properties["name"]!.type).toBe("string");
    expect(playerType.properties["score"]!.type).toBe("int");
    expect(playerType.properties["isActive"]!.type).toBe("boolean");
    expect(parsedSchema["Player"]).toEqual(Player);
  });

  it("should parse Position as object type with quantized floats", () => {
    const positionType = parsedSchema["Position"] as ObjectType;
    expect(positionType.type).toBe("object");
    const xType = positionType.properties["x"] as FloatType;
    const yType = positionType.properties["y"] as FloatType;
    expect(xType.type).toBe("float");
    expect(yType.type).toBe("float");
    expect(xType.precision).toBe(0.1);
    expect(yType.precision).toBe(0.1);
  });

  it("should parse Velocity as object type with non-quantized floats", () => {
    const velocityType = parsedSchema["Velocity"] as ObjectType;
    expect(velocityType.type).toBe("object");
    const vxType = velocityType.properties["vx"] as FloatType;
    const vyType = velocityType.properties["vy"] as FloatType;
    expect(vxType.type).toBe("float");
    expect(vyType.type).toBe("float");
    expect(vxType.precision).toBeUndefined();
    expect(vyType.precision).toBeUndefined();
  });

  it("should parse Entity as object type with nested object reference", () => {
    const entityType = parsedSchema["Entity"] as ObjectType;
    expect(entityType.type).toBe("object");
    expect(entityType.properties["id"]!.type).toBe("string");
    expect(entityType.properties["position"]!.type).toBe("reference");
    expect((entityType.properties["position"] as any).reference).toBe("Position");
    expect(parsedSchema["Entity"]).toEqual(tsSchema.Entity);
  });

  it("should parse MoveAction as object type", () => {
    const moveActionType = parsedSchema["MoveAction"] as ObjectType;
    expect(moveActionType.type).toBe("object");
    expect(moveActionType.properties["x"]!.type).toBe("int");
    expect(moveActionType.properties["y"]!.type).toBe("int");
    expect(parsedSchema["MoveAction"]).toEqual(MoveAction);
  });

  it("should parse AttackAction as object type", () => {
    const attackActionType = parsedSchema["AttackAction"] as ObjectType;
    expect(attackActionType.type).toBe("object");
    expect(attackActionType.properties["targetId"]!.type).toBe("string");
    expect(attackActionType.properties["damage"]!.type).toBe("uint");
    expect(parsedSchema["AttackAction"]).toEqual(AttackAction);
  });

  it("should parse UseItemAction as object type", () => {
    const useItemActionType = parsedSchema["UseItemAction"] as ObjectType;
    expect(useItemActionType.type).toBe("object");
    expect(useItemActionType.properties["itemId"]!.type).toBe("string");
    expect(parsedSchema["UseItemAction"]).toEqual(UseItemAction);
  });

  it("should parse GameAction as union type", () => {
    const gameActionType = parsedSchema["GameAction"] as UnionType;
    expect(gameActionType.type).toBe("union");
    expect(gameActionType.options).toHaveLength(3);
    expect(gameActionType.options[0]!.type).toBe("reference");
    expect(gameActionType.options[0]!.reference).toBe("MoveAction");
    expect(gameActionType.options[1]!.reference).toBe("AttackAction");
    expect(gameActionType.options[2]!.reference).toBe("UseItemAction");
  });

  it("should parse GameState as object type with complex fields", () => {
    const gameStateType = parsedSchema["GameState"] as ObjectType;
    expect(gameStateType.type).toBe("object");

    // Array field
    expect(gameStateType.properties["players"]!.type).toBe("array");
    expect((gameStateType.properties["players"] as any).value.type).toBe("reference");
    expect((gameStateType.properties["players"] as any).value.reference).toBe("Player");

    // Optional fields
    expect(gameStateType.properties["currentPlayer"]!.type).toBe("optional");
    expect((gameStateType.properties["currentPlayer"] as any).value.type).toBe("string");

    // Uint field
    expect(gameStateType.properties["round"]!.type).toBe("uint");

    // Record/Map field
    expect(gameStateType.properties["metadata"]!.type).toBe("record");
    expect((gameStateType.properties["metadata"] as any).key.type).toBe("string");
    expect((gameStateType.properties["metadata"] as any).value.type).toBe("string");

    // Optional reference to enum
    expect(gameStateType.properties["winningColor"]!.type).toBe("optional");
    expect((gameStateType.properties["winningColor"] as any).value.type).toBe("reference");
    expect((gameStateType.properties["winningColor"] as any).value.reference).toBe("Color");

    // Optional reference to union
    expect(gameStateType.properties["lastAction"]!.type).toBe("optional");
    expect((gameStateType.properties["lastAction"] as any).value.type).toBe("reference");
    expect((gameStateType.properties["lastAction"] as any).value.reference).toBe("GameAction");
  });

  it("should match TypeScript schema structure", () => {
    // Test that parsed YAML types match TypeScript types
    expect(parsedSchema["Color"]).toEqual(Color);
    expect(parsedSchema["MoveAction"]).toEqual(MoveAction);
    expect(parsedSchema["AttackAction"]).toEqual(AttackAction);
    expect(parsedSchema["UseItemAction"]).toEqual(UseItemAction);
    expect(parsedSchema["Position"]).toEqual(tsSchema.Position);
    expect(parsedSchema["Entity"]).toEqual(tsSchema.Entity);

    // GameAction should match structure
    const gameActionType = parsedSchema["GameAction"] as UnionType;
    expect(gameActionType.type).toBe(GameAction.type);
    expect(gameActionType.options.length).toBe(GameAction.options.length);

    // Player should match
    const playerType = parsedSchema["Player"] as ObjectType;
    expect(playerType.type).toBe(Player.type);
    expect(Object.keys(playerType.properties)).toEqual(Object.keys(Player.properties));
  });

  it("should handle nested references correctly", () => {
    // GameState has nested references (Player[], Color?, GameAction?)
    const gameState = parsedSchema["GameState"] as ObjectType;

    // players: Player[]
    const playersField = gameState.properties["players"]!;
    expect(playersField.type).toBe("array");
    expect((playersField as any).value.type).toBe("reference");
    expect((playersField as any).value.reference).toBe("Player");

    // winningColor: Color?
    const winningColorField = gameState.properties["winningColor"]!;
    expect(winningColorField.type).toBe("optional");
    expect((winningColorField as any).value.type).toBe("reference");
    expect((winningColorField as any).value.reference).toBe("Color");

    // lastAction: GameAction?
    const lastActionField = gameState.properties["lastAction"]!;
    expect(lastActionField.type).toBe("optional");
    expect((lastActionField as any).value.type).toBe("reference");
    expect((lastActionField as any).value.reference).toBe("GameAction");
  });

  it("should parse all primitive types correctly", () => {
    // Test all primitive types across different objects
    const allTypes = new Set<string>();

    function collectTypes(type: any) {
      if (type.type === "object") {
        Object.values(type.properties).forEach((prop: any) => collectTypes(prop));
      } else if (type.type === "array" || type.type === "optional") {
        collectTypes(type.value);
      } else if (type.type === "record") {
        collectTypes(type.key);
        collectTypes(type.value);
      } else if (type.type !== "reference" && type.type !== "union" && type.type !== "enum") {
        allTypes.add(type.type);
      }
    }

    Object.values(parsedSchema).forEach(collectTypes);

    expect(allTypes).toContain("string");
    expect(allTypes).toContain("int");
    expect(allTypes).toContain("uint");
    expect(allTypes).toContain("float");
    expect(allTypes).toContain("boolean");
  });

  it("should parse Inventory with nested containers using angle bracket syntax", () => {
    const inventoryType = parsedSchema["Inventory"] as ObjectType;
    expect(inventoryType.type).toBe("object");

    // items: <string, int>[]?
    const itemsField = inventoryType.properties["items"]!;
    expect(itemsField.type).toBe("optional");

    // Should be optional array
    const arrayType = (itemsField as any).value;
    expect(arrayType.type).toBe("array");

    // Array element should be record
    const recordType = arrayType.value;
    expect(recordType.type).toBe("record");
    expect(recordType.key.type).toBe("string");
    expect(recordType.value.type).toBe("int");
  });

  it("should parse angle bracket record syntax", () => {
    // Test <string, string> syntax
    const gameStateType = parsedSchema["GameState"] as ObjectType;
    const metadataField = gameStateType.properties["metadata"]!;
    expect(metadataField.type).toBe("record");
    expect((metadataField as any).key.type).toBe("string");
    expect((metadataField as any).value.type).toBe("string");
  });

  it("should support angle bracket syntax with suffixes", () => {
    // <string, int>[]? should parse as: OptionalType(ArrayType(RecordType(...)))
    const inventoryType = parsedSchema["Inventory"] as ObjectType;
    const itemsField = inventoryType.properties["items"]!;

    // Outer: optional
    expect(itemsField.type).toBe("optional");

    // Middle: array
    const innerType = (itemsField as any).value;
    expect(innerType.type).toBe("array");

    // Inner: record
    const recordType = innerType.value;
    expect(recordType.type).toBe("record");
    expect(recordType.key.type).toBe("string");
    expect(recordType.value.type).toBe("int");
  });

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
    expect((fieldType as any).key.type).toBe("string");

    // Value should be a nested record
    const valueType = (fieldType as any).value;
    expect(valueType.type).toBe("record");
    expect(valueType.key.type).toBe("int");
    expect(valueType.value.type).toBe("reference");
    expect(valueType.value.reference).toBe("Player");
  });
});
