import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parseSchemaYml, EnumType, ObjectType, UnionType } from "@hpx7/delta-pack";
import { schema as tsSchema } from "./schema";

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
    expect(parsedSchema.Color).toBeDefined();
    expect(parsedSchema.Player).toBeDefined();
    expect(parsedSchema.Position).toBeDefined();
    expect(parsedSchema.MoveAction).toBeDefined();
    expect(parsedSchema.AttackAction).toBeDefined();
    expect(parsedSchema.UseItemAction).toBeDefined();
    expect(parsedSchema.GameAction).toBeDefined();
    expect(parsedSchema.GameState).toBeDefined();
  });

  it("should parse Color as enum type", () => {
    const colorType = parsedSchema.Color as EnumType;
    expect(colorType.type).toBe("enum");
    expect(colorType.options).toEqual(["RED", "BLUE", "GREEN", "YELLOW"]);
    expect(parsedSchema.Color).toEqual(Color);
  });

  it("should parse Player as object type", () => {
    const playerType = parsedSchema.Player as ObjectType;
    expect(playerType.type).toBe("object");
    expect(playerType.properties).toBeDefined();
    expect(playerType.properties.id.type).toBe("string");
    expect(playerType.properties.name.type).toBe("string");
    expect(playerType.properties.score.type).toBe("int");
    expect(playerType.properties.isActive.type).toBe("boolean");
    expect(parsedSchema.Player).toEqual(Player);
  });

  it("should parse Position as object type with floats", () => {
    const positionType = parsedSchema.Position as ObjectType;
    expect(positionType.type).toBe("object");
    expect(positionType.properties.x.type).toBe("float");
    expect(positionType.properties.y.type).toBe("float");

    // Note: YAML parser doesn't support float precision yet
    // Position in schema.ts has precision: 0.1, but YAML schema uses plain float
  });

  it("should parse MoveAction as object type", () => {
    const moveActionType = parsedSchema.MoveAction as ObjectType;
    expect(moveActionType.type).toBe("object");
    expect(moveActionType.properties.x.type).toBe("int");
    expect(moveActionType.properties.y.type).toBe("int");
    expect(parsedSchema.MoveAction).toEqual(MoveAction);
  });

  it("should parse AttackAction as object type", () => {
    const attackActionType = parsedSchema.AttackAction as ObjectType;
    expect(attackActionType.type).toBe("object");
    expect(attackActionType.properties.targetId.type).toBe("string");
    expect(attackActionType.properties.damage.type).toBe("uint");
    expect(parsedSchema.AttackAction).toEqual(AttackAction);
  });

  it("should parse UseItemAction as object type", () => {
    const useItemActionType = parsedSchema.UseItemAction as ObjectType;
    expect(useItemActionType.type).toBe("object");
    expect(useItemActionType.properties.itemId.type).toBe("string");
    expect(parsedSchema.UseItemAction).toEqual(UseItemAction);
  });

  it("should parse GameAction as union type", () => {
    const gameActionType = parsedSchema.GameAction as UnionType;
    expect(gameActionType.type).toBe("union");
    expect(gameActionType.options).toHaveLength(3);
    expect(gameActionType.options[0].type).toBe("reference");
    expect(gameActionType.options[0].reference).toBe("MoveAction");
    expect(gameActionType.options[1].reference).toBe("AttackAction");
    expect(gameActionType.options[2].reference).toBe("UseItemAction");
  });

  it("should parse GameState as object type with complex fields", () => {
    const gameStateType = parsedSchema.GameState as ObjectType;
    expect(gameStateType.type).toBe("object");

    // Array field
    expect(gameStateType.properties.players.type).toBe("array");
    expect((gameStateType.properties.players as any).value.type).toBe("reference");
    expect((gameStateType.properties.players as any).value.reference).toBe("Player");

    // Optional fields
    expect(gameStateType.properties.currentPlayer.type).toBe("optional");
    expect((gameStateType.properties.currentPlayer as any).value.type).toBe("string");

    // Uint field
    expect(gameStateType.properties.round.type).toBe("uint");

    // Record/Map field
    expect(gameStateType.properties.metadata.type).toBe("record");
    expect((gameStateType.properties.metadata as any).key.type).toBe("string");
    expect((gameStateType.properties.metadata as any).value.type).toBe("string");

    // Optional reference to enum
    expect(gameStateType.properties.winningColor.type).toBe("optional");
    expect((gameStateType.properties.winningColor as any).value.type).toBe("reference");
    expect((gameStateType.properties.winningColor as any).value.reference).toBe("Color");

    // Optional reference to union
    expect(gameStateType.properties.lastAction.type).toBe("optional");
    expect((gameStateType.properties.lastAction as any).value.type).toBe("reference");
    expect((gameStateType.properties.lastAction as any).value.reference).toBe("GameAction");
  });

  it("should match TypeScript schema structure (except float precision)", () => {
    // Test that parsed YAML types match TypeScript types
    // (excluding Position which has precision in TS but not in YAML)

    expect(parsedSchema.Color).toEqual(Color);
    expect(parsedSchema.MoveAction).toEqual(MoveAction);
    expect(parsedSchema.AttackAction).toEqual(AttackAction);
    expect(parsedSchema.UseItemAction).toEqual(UseItemAction);

    // GameAction should match structure
    const gameActionType = parsedSchema.GameAction as UnionType;
    expect(gameActionType.type).toBe(GameAction.type);
    expect(gameActionType.options.length).toBe(GameAction.options.length);

    // Player should match
    const playerType = parsedSchema.Player as ObjectType;
    expect(playerType.type).toBe(Player.type);
    expect(Object.keys(playerType.properties)).toEqual(Object.keys(Player.properties));
  });

  it("should handle nested references correctly", () => {
    // GameState has nested references (Player[], Color?, GameAction?)
    const gameState = parsedSchema.GameState as ObjectType;

    // players: Player[]
    const playersField = gameState.properties.players;
    expect(playersField.type).toBe("array");
    expect((playersField as any).value.type).toBe("reference");
    expect((playersField as any).value.reference).toBe("Player");

    // winningColor: Color?
    const winningColorField = gameState.properties.winningColor;
    expect(winningColorField.type).toBe("optional");
    expect((winningColorField as any).value.type).toBe("reference");
    expect((winningColorField as any).value.reference).toBe("Color");

    // lastAction: GameAction?
    const lastActionField = gameState.properties.lastAction;
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
});
