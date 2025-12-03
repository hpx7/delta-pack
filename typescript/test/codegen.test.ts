import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { codegenTypescript, equalsFloat, equalsFloatQuantized } from "@hpx7/delta-pack";
import { schema } from "./schema";
import {
  Player,
  Position,
  Velocity,
  GameState,
  GameAction,
  MoveAction,
  AttackAction,
  UseItemAction,
  type Color,
} from "./generated-schema";

describe("Delta Pack Codegen - Unified API", () => {
  describe("Code Generation", () => {
    it("should generate code matching generated-schema.ts", () => {
      const generatedCode = codegenTypescript(schema);
      const expectedCode = readFileSync(join(__dirname, "generated-schema.ts"), "utf-8");

      expect(generatedCode.trim()).toBe(expectedCode.trim());
    });
  });

  describe("Player Type - Basic Operations", () => {
    const player1: Player = {
      id: "player-1",
      name: "Alice",
      score: 100,
      isActive: true,
    };

    const player2: Player = {
      id: "player-1",
      name: "Alice",
      score: 150,
      isActive: false,
    };

    it("should create default player", () => {
      const defaultPlayer = Player.default();
      expect(defaultPlayer).toEqual({
        id: "",
        name: "",
        score: 0,
        isActive: false,
      });
    });

    it("should parse correct player data", () => {
      expect(() => Player.parse(player1)).not.toThrow();
    });

    it("should detect validation errors for name", () => {
      const invalidPlayer = { id: "p1", name: 123, score: 100, isActive: true };
      expect(() => Player.parse(invalidPlayer as any)).toThrow(/name/);
    });

    it("should detect validation errors for id", () => {
      const invalidPlayer = { id: 123, name: "Alice", score: 100, isActive: true };
      expect(() => Player.parse(invalidPlayer as any)).toThrow(/id/);
    });

    it("should detect validation errors for score", () => {
      const invalidPlayer = { id: "p1", name: "Alice", score: "invalid", isActive: true };
      expect(() => Player.parse(invalidPlayer as any)).toThrow(/score/);
    });

    it("should detect validation errors for isActive", () => {
      const invalidPlayer = { id: "p1", name: "Alice", score: 100, isActive: "invalid" };
      expect(() => Player.parse(invalidPlayer as any)).toThrow(/isActive/);
    });

    it("should check equality correctly", () => {
      expect(Player.equals(player1, player1)).toBe(true);
      expect(Player.equals(player1, player2)).toBe(false);
    });

    it("should encode and decode player data", () => {
      const encoded = Player.encode(player1);
      expect(encoded).toBeInstanceOf(Uint8Array);

      const decoded = Player.decode(encoded);
      expect(decoded).toEqual(player1);
      expect(Player.equals(decoded, player1)).toBe(true);
    });

    it("should encode and decode diff", () => {
      const encodedDiff = Player.encodeDiff(player1, player2);
      expect(encodedDiff).toBeInstanceOf(Uint8Array);

      const result = Player.decodeDiff(player1, encodedDiff);
      expect(result).toEqual(player2);
      expect(Player.equals(result, player2)).toBe(true);
    });

    it("should handle identical players (no diff)", () => {
      const encodedDiff = Player.encodeDiff(player1, player1);
      const result = Player.decodeDiff(player1, encodedDiff);
      expect(result).toEqual(player1);
    });

    it("should have smaller diff encoding than full encoding", () => {
      const fullEncoded = Player.encode(player2);
      const diffEncoded = Player.encodeDiff(player1, player2);

      // Diff should be smaller or equal (when only some fields change)
      expect(diffEncoded.length).toBeLessThanOrEqual(fullEncoded.length);
    });

    it("should handle all fields changing", () => {
      const p1 = { id: "p1", name: "Alice", score: 100, isActive: true };
      const p2 = { id: "p2", name: "Bob", score: 200, isActive: false };

      const encodedDiff = Player.encodeDiff(p1, p2);
      const result = Player.decodeDiff(p1, encodedDiff);
      expect(result).toEqual(p2);
    });

    it("should handle only one field changing", () => {
      const p1 = { id: "p1", name: "Alice", score: 100, isActive: true };
      const p2 = { id: "p1", name: "Alice", score: 150, isActive: true };

      const encodedDiff = Player.encodeDiff(p1, p2);
      const result = Player.decodeDiff(p1, encodedDiff);
      expect(result).toEqual(p2);
    });
  });

  describe("Recursive Schema - Player with Partner", () => {
    it("should handle player without partner", () => {
      const player: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: undefined,
      };

      expect(() => Player.parse(player)).not.toThrow();

      const encoded = Player.encode(player);
      const decoded = Player.decode(encoded);
      expect(Player.equals(decoded, player)).toBe(true);
    });

    it("should handle player with partner (one level)", () => {
      const partner: Player = {
        id: "p2",
        name: "Bob",
        score: 50,
        isActive: true,
        partner: undefined,
      };

      const player: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: partner,
      };

      expect(() => Player.parse(player)).not.toThrow();

      const encoded = Player.encode(player);
      const decoded = Player.decode(encoded);
      expect(Player.equals(decoded, player)).toBe(true);
      expect(decoded.partner).toBeDefined();
      expect(decoded.partner?.name).toBe("Bob");
    });

    it("should handle nested partners (two levels)", () => {
      const partner2: Player = {
        id: "p3",
        name: "Charlie",
        score: 25,
        isActive: false,
        partner: undefined,
      };

      const partner1: Player = {
        id: "p2",
        name: "Bob",
        score: 50,
        isActive: true,
        partner: partner2,
      };

      const player: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: partner1,
      };

      expect(() => Player.parse(player)).not.toThrow();

      const encoded = Player.encode(player);
      const decoded = Player.decode(encoded);
      expect(Player.equals(decoded, player)).toBe(true);
      expect(decoded.partner?.name).toBe("Bob");
      expect(decoded.partner?.partner?.name).toBe("Charlie");
    });

    it("should handle partner changes in diff", () => {
      const player1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: undefined,
      };

      const partner: Player = {
        id: "p2",
        name: "Bob",
        score: 50,
        isActive: true,
        partner: undefined,
      };

      const player2: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: partner,
      };

      const encodedDiff = Player.encodeDiff(player1, player2);
      const result = Player.decodeDiff(player1, encodedDiff);
      expect(Player.equals(result, player2)).toBe(true);
      expect(result.partner?.name).toBe("Bob");
    });

    it("should handle nested partner changes in diff", () => {
      const partner1: Player = {
        id: "p2",
        name: "Bob",
        score: 50,
        isActive: true,
        partner: undefined,
      };

      const player1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: partner1,
      };

      const partner2: Player = {
        id: "p2",
        name: "Bob",
        score: 75, // score changed
        isActive: true,
        partner: undefined,
      };

      const player2: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: partner2,
      };

      const encodedDiff = Player.encodeDiff(player1, player2);
      const result = Player.decodeDiff(player1, encodedDiff);
      expect(Player.equals(result, player2)).toBe(true);
      expect(result.partner?.score).toBe(75);
    });

    it("should handle removing partner in diff", () => {
      const partner: Player = {
        id: "p2",
        name: "Bob",
        score: 50,
        isActive: true,
        partner: undefined,
      };

      const player1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: partner,
      };

      const player2: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: undefined,
      };

      const encodedDiff = Player.encodeDiff(player1, player2);
      const result = Player.decodeDiff(player1, encodedDiff);
      expect(Player.equals(result, player2)).toBe(true);
      expect(result.partner).toBeUndefined();
    });

    it("should detect validation errors for invalid partner", () => {
      const invalidPlayer = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: { id: 123, name: "Bob" }, // invalid id type
      };
      expect(() => Player.parse(invalidPlayer as any)).toThrow();
    });
  });

  describe("Position Type - Quantized Floats", () => {
    it("should create default position", () => {
      const defaultPos = Position.default();
      expect(defaultPos).toEqual({ x: 0.0, y: 0.0 });
    });

    it("should parse correct position data", () => {
      const pos = { x: 123.456, y: 78.912 };
      expect(() => Position.parse(pos)).not.toThrow();
    });

    it("should detect validation errors for x", () => {
      const invalidPos = { x: "invalid", y: 10.0 };
      expect(() => Position.parse(invalidPos as any)).toThrow(/x/);
    });

    it("should detect validation errors for y", () => {
      const invalidPos = { x: 10.0, y: "invalid" };
      expect(() => Position.parse(invalidPos as any)).toThrow(/y/);
    });

    it("should quantize floats on encode/decode (0.1 precision)", () => {
      const pos = { x: 123.456, y: 78.912 };
      const encoded = Position.encode(pos);
      const decoded = Position.decode(encoded);

      // Should round to nearest 0.1
      expect(decoded.x).toBe(123.5);
      expect(decoded.y).toBe(78.9);
    });

    it("should handle exact quantized values", () => {
      const pos = { x: 100.0, y: 200.5 };
      const encoded = Position.encode(pos);
      const decoded = Position.decode(encoded);

      expect(decoded.x).toBe(100.0);
      expect(decoded.y).toBe(200.5);
    });

    it("should check equality with quantization tolerance", () => {
      // Values that round to the same quantized value should be equal
      const pos1 = { x: 100.02, y: 200.01 };
      const pos2 = { x: 100.03, y: 200.04 };

      // Both should round to x=100.0, y=200.0
      expect(Position.equals(pos1, pos2)).toBe(true);
    });

    it("should detect inequality beyond quantization threshold", () => {
      const pos1 = { x: 100.0, y: 200.0 };
      const pos2 = { x: 100.2, y: 200.0 };

      // 100.0 vs 100.2 should be different after quantization
      expect(Position.equals(pos1, pos2)).toBe(false);
    });

    it("should encode/decode diff with quantization", () => {
      const pos1 = { x: 100.0, y: 200.0 };
      const pos2 = { x: 100.5, y: 200.3 };

      const encodedDiff = Position.encodeDiff(pos1, pos2);
      const result = Position.decodeDiff(pos1, encodedDiff);

      expect(result.x).toBe(100.5);
      expect(result.y).toBe(200.3);
      expect(Position.equals(result, pos2)).toBe(true);
    });

    it("should handle no change in diff (within precision)", () => {
      const pos1 = { x: 100.01, y: 200.02 };
      const pos2 = { x: 100.03, y: 200.03 };

      // Both round to same value (100.0, 200.0), so no diff
      const encodedDiff = Position.encodeDiff(pos1, pos2);
      const result = Position.decodeDiff(pos1, encodedDiff);

      expect(Position.equals(result, pos1)).toBe(true);
    });

    it("should use less bandwidth than full precision for small changes", () => {
      const pos1 = { x: 100.0, y: 200.0 };
      const pos2 = { x: 100.5, y: 200.3 };

      const fullEncoded = Position.encode(pos2);
      const diffEncoded = Position.encodeDiff(pos1, pos2);

      // Quantized encoding should be compact
      expect(fullEncoded.length).toBeLessThanOrEqual(8);
      expect(diffEncoded.length).toBeLessThanOrEqual(8);
    });

    it("should handle large position values", () => {
      const pos = { x: 9999.7, y: -8888.3 };
      const encoded = Position.encode(pos);
      const decoded = Position.decode(encoded);

      expect(decoded.x).toBeCloseTo(9999.7, 1);
      expect(decoded.y).toBeCloseTo(-8888.3, 1);
    });

    it("should handle negative positions", () => {
      const pos1 = { x: -50.3, y: -100.7 };
      const pos2 = { x: -50.1, y: -100.9 };

      const encodedDiff = Position.encodeDiff(pos1, pos2);
      const result = Position.decodeDiff(pos1, encodedDiff);

      expect(result.x).toBe(-50.1);
      expect(result.y).toBe(-100.9);
    });

    it("should handle zero positions", () => {
      const pos = { x: 0.0, y: 0.0 };
      const encoded = Position.encode(pos);
      const decoded = Position.decode(encoded);

      expect(decoded.x).toBe(0.0);
      expect(decoded.y).toBe(0.0);
    });
  });

  describe("Velocity Type - Non-Quantized Floats", () => {
    it("should create default velocity", () => {
      const defaultVel = Velocity.default();
      expect(defaultVel).toEqual({ vx: 0.0, vy: 0.0 });
    });

    it("should parse correct velocity data", () => {
      const vel = { vx: 123.456789, vy: 78.912345 };
      expect(() => Velocity.parse(vel)).not.toThrow();
    });

    it("should detect validation errors for vx", () => {
      const invalidVel = { vx: "invalid", vy: 10.0 };
      expect(() => Velocity.parse(invalidVel as any)).toThrow(/vx/);
    });

    it("should detect validation errors for vy", () => {
      const invalidVel = { vx: 10.0, vy: "invalid" };
      expect(() => Velocity.parse(invalidVel as any)).toThrow(/vy/);
    });

    it("should preserve full precision floats on encode/decode", () => {
      const vel = { vx: 123.456789, vy: 78.912345 };
      const encoded = Velocity.encode(vel);
      const decoded = Velocity.decode(encoded);

      // Should preserve values within epsilon (0.00001)
      expect(equalsFloat(decoded.vx, 123.456789)).toBe(true);
      expect(equalsFloat(decoded.vy, 78.912345)).toBe(true);
    });

    it("should handle exact float values", () => {
      const vel = { vx: 100.0, vy: 200.5 };
      const encoded = Velocity.encode(vel);
      const decoded = Velocity.decode(encoded);

      expect(equalsFloat(decoded.vx, 100.0)).toBe(true);
      expect(equalsFloat(decoded.vy, 200.5)).toBe(true);
    });

    it("should check equality with epsilon tolerance", () => {
      // Values within epsilon should be equal
      const vel1 = { vx: 100.000001, vy: 200.000001 };
      const vel2 = { vx: 100.000002, vy: 200.000002 };

      expect(Velocity.equals(vel1, vel2)).toBe(true);
    });

    it("should detect inequality beyond epsilon threshold", () => {
      const vel1 = { vx: 100.0, vy: 200.0 };
      const vel2 = { vx: 100.01, vy: 200.0 };

      // 0.01 is beyond epsilon (0.001)
      expect(Velocity.equals(vel1, vel2)).toBe(false);
    });

    it("should encode/decode diff with full precision", () => {
      const vel1 = { vx: 100.123456, vy: 200.654321 };
      const vel2 = { vx: 100.234567, vy: 200.765432 };

      const encodedDiff = Velocity.encodeDiff(vel1, vel2);
      const result = Velocity.decodeDiff(vel1, encodedDiff);

      expect(equalsFloat(result.vx, 100.234567)).toBe(true);
      expect(equalsFloat(result.vy, 200.765432)).toBe(true);
      expect(Velocity.equals(result, vel2)).toBe(true);
    });

    it("should handle no change in diff (within epsilon)", () => {
      const vel1 = { vx: 100.0000001, vy: 200.0000002 };
      const vel2 = { vx: 100.0000002, vy: 200.0000003 };

      // Both within epsilon, so should be treated as equal
      const encodedDiff = Velocity.encodeDiff(vel1, vel2);
      const result = Velocity.decodeDiff(vel1, encodedDiff);

      expect(Velocity.equals(result, vel1)).toBe(true);
    });

    it("should handle large velocity values", () => {
      const vel = { vx: 9999.123456, vy: -8888.654321 };
      const encoded = Velocity.encode(vel);
      const decoded = Velocity.decode(encoded);

      // Large float values lose precision with 32-bit encoding, but equalsFloat should still work
      expect(equalsFloat(decoded.vx, vel.vx)).toBe(true);
      expect(equalsFloat(decoded.vy, vel.vy)).toBe(true);
    });

    it("should handle negative velocities", () => {
      const vel1 = { vx: -50.123456, vy: -100.654321 };
      const vel2 = { vx: -50.234567, vy: -100.765432 };

      const encodedDiff = Velocity.encodeDiff(vel1, vel2);
      const result = Velocity.decodeDiff(vel1, encodedDiff);

      expect(equalsFloat(result.vx, -50.234567)).toBe(true);
      expect(equalsFloat(result.vy, -100.765432)).toBe(true);
    });

    it("should handle zero velocities", () => {
      const vel = { vx: 0.0, vy: 0.0 };
      const encoded = Velocity.encode(vel);
      const decoded = Velocity.decode(encoded);

      expect(decoded.vx).toBe(0.0);
      expect(decoded.vy).toBe(0.0);
    });

    it("should handle very small velocity values", () => {
      const vel = { vx: 0.000001, vy: 0.000002 };
      const encoded = Velocity.encode(vel);
      const decoded = Velocity.decode(encoded);

      expect(equalsFloat(decoded.vx, 0.000001)).toBe(true);
      expect(equalsFloat(decoded.vy, 0.000002)).toBe(true);
    });

    it("should distinguish between quantized and non-quantized floats", () => {
      // Position uses quantization (0.1 precision)
      const pos = { x: 123.456, y: 78.912 };
      const encodedPos = Position.encode(pos);
      const decodedPos = Position.decode(encodedPos);

      // Velocity uses epsilon comparison (no quantization)
      const vel = { vx: 123.456, vy: 78.912 };
      const encodedVel = Velocity.encode(vel);
      const decodedVel = Velocity.decode(encodedVel);

      // Position should be quantized to 0.1
      expect(equalsFloatQuantized(decodedPos.x, 123.456, 0.1)).toBe(true);
      expect(equalsFloatQuantized(decodedPos.y, 78.912, 0.1)).toBe(true);
      expect(decodedPos.x).toBe(123.5);
      expect(decodedPos.y).toBe(78.9);

      // Velocity should preserve full precision
      expect(equalsFloat(decodedVel.vx, 123.456)).toBe(true);
      expect(equalsFloat(decodedVel.vy, 78.912)).toBe(true);
    });
  });

  describe("MoveAction, AttackAction, UseItemAction", () => {
    it("should create default MoveAction", () => {
      const defaultMove = MoveAction.default();
      expect(defaultMove).toEqual({ x: 0, y: 0 });
    });

    it("should check MoveAction equality", () => {
      const move1 = { x: 10, y: 20 };
      const move2 = { x: 10, y: 20 };
      const move3 = { x: 15, y: 20 };
      expect(MoveAction.equals(move1, move2)).toBe(true);
      expect(MoveAction.equals(move1, move3)).toBe(false);
    });

    it("should encode/decode MoveAction", () => {
      const move = { x: 10, y: 20 };
      const encoded = MoveAction.encode(move);
      const decoded = MoveAction.decode(encoded);
      expect(decoded).toEqual(move);
    });

    it("should encode/decode diff for MoveAction", () => {
      const move1 = { x: 10, y: 20 };
      const move2 = { x: 15, y: 25 };
      const encodedDiff = MoveAction.encodeDiff(move1, move2);
      const result = MoveAction.decodeDiff(move1, encodedDiff);
      expect(result).toEqual(move2);
    });

    it("should handle identical MoveActions in diff", () => {
      const move = { x: 10, y: 20 };
      const encodedDiff = MoveAction.encodeDiff(move, move);
      const result = MoveAction.decodeDiff(move, encodedDiff);
      expect(result).toEqual(move);
    });

    it("should parse MoveAction", () => {
      const move = { x: 10, y: 20 };
      expect(() => MoveAction.parse(move)).not.toThrow();
    });

    it("should detect MoveAction validation errors for x", () => {
      const invalidMove = { x: "invalid", y: 20 };
      expect(() => MoveAction.parse(invalidMove as any)).toThrow(/x/);
    });

    it("should detect MoveAction validation errors for y", () => {
      const invalidMove = { x: 10, y: "invalid" };
      expect(() => MoveAction.parse(invalidMove as any)).toThrow(/y/);
    });

    it("should detect MoveAction validation errors for non-object", () => {
      expect(() => MoveAction.parse("not an object" as any)).toThrow(/Invalid MoveAction/);
    });

    it("should create default AttackAction", () => {
      const defaultAttack = AttackAction.default();
      expect(defaultAttack).toEqual({ targetId: "", damage: 0 });
    });

    it("should check AttackAction equality", () => {
      const attack1 = { targetId: "enemy-1", damage: 50 };
      const attack2 = { targetId: "enemy-1", damage: 50 };
      const attack3 = { targetId: "enemy-2", damage: 50 };
      expect(AttackAction.equals(attack1, attack2)).toBe(true);
      expect(AttackAction.equals(attack1, attack3)).toBe(false);
    });

    it("should encode/decode AttackAction", () => {
      const attack = { targetId: "enemy-1", damage: 50 };
      const encoded = AttackAction.encode(attack);
      const decoded = AttackAction.decode(encoded);
      expect(decoded).toEqual(attack);
    });

    it("should encode/decode diff for AttackAction", () => {
      const attack1 = { targetId: "enemy-1", damage: 50 };
      const attack2 = { targetId: "enemy-2", damage: 75 };
      const encodedDiff = AttackAction.encodeDiff(attack1, attack2);
      const result = AttackAction.decodeDiff(attack1, encodedDiff);
      expect(result).toEqual(attack2);
    });

    it("should handle identical AttackActions in diff", () => {
      const attack = { targetId: "enemy-1", damage: 50 };
      const encodedDiff = AttackAction.encodeDiff(attack, attack);
      const result = AttackAction.decodeDiff(attack, encodedDiff);
      expect(result).toEqual(attack);
    });

    it("should parse AttackAction", () => {
      const attack = { targetId: "enemy-1", damage: 50 };
      expect(() => AttackAction.parse(attack)).not.toThrow();
    });

    it("should detect AttackAction validation errors for targetId", () => {
      const invalid = { targetId: 123, damage: 50 };
      expect(() => AttackAction.parse(invalid as any)).toThrow(/targetId/);
    });

    it("should detect AttackAction validation errors for damage", () => {
      const invalid = { targetId: "enemy-1", damage: -10 };
      expect(() => AttackAction.parse(invalid as any)).toThrow(/damage/);
    });

    it("should detect AttackAction validation errors for non-object", () => {
      expect(() => AttackAction.parse("not an object" as any)).toThrow(/Invalid AttackAction/);
    });

    it("should create default UseItemAction", () => {
      const defaultUseItem = UseItemAction.default();
      expect(defaultUseItem).toEqual({ itemId: "" });
    });

    it("should check UseItemAction equality", () => {
      const useItem1 = { itemId: "potion-1" };
      const useItem2 = { itemId: "potion-1" };
      const useItem3 = { itemId: "potion-2" };
      expect(UseItemAction.equals(useItem1, useItem2)).toBe(true);
      expect(UseItemAction.equals(useItem1, useItem3)).toBe(false);
    });

    it("should encode/decode UseItemAction", () => {
      const useItem = { itemId: "potion-1" };
      const encoded = UseItemAction.encode(useItem);
      const decoded = UseItemAction.decode(encoded);
      expect(decoded).toEqual(useItem);
    });

    it("should encode/decode diff for UseItemAction", () => {
      const useItem1 = { itemId: "potion-1" };
      const useItem2 = { itemId: "sword-1" };
      const encodedDiff = UseItemAction.encodeDiff(useItem1, useItem2);
      const result = UseItemAction.decodeDiff(useItem1, encodedDiff);
      expect(result).toEqual(useItem2);
    });

    it("should handle identical UseItemActions in diff", () => {
      const useItem = { itemId: "potion-1" };
      const encodedDiff = UseItemAction.encodeDiff(useItem, useItem);
      const result = UseItemAction.decodeDiff(useItem, encodedDiff);
      expect(result).toEqual(useItem);
    });

    it("should parse UseItemAction", () => {
      const useItem = { itemId: "potion-1" };
      expect(() => UseItemAction.parse(useItem)).not.toThrow();
    });

    it("should detect UseItemAction validation errors for itemId", () => {
      const invalid = { itemId: 123 };
      expect(() => UseItemAction.parse(invalid as any)).toThrow(/itemId/);
    });

    it("should detect UseItemAction validation errors for non-object", () => {
      expect(() => UseItemAction.parse("not an object" as any)).toThrow(/Invalid UseItemAction/);
    });
  });

  describe("Union Types - GameAction", () => {
    it("should create default GameAction", () => {
      const defaultAction = GameAction.default();
      expect(defaultAction.type).toBe("MoveAction");
    });

    it("should check GameAction equality for same type and value", () => {
      const action1: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      const action2: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      expect(GameAction.equals(action1, action2)).toBe(true);
    });

    it("should check GameAction equality for same type but different value", () => {
      const action1: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      const action2: GameAction = { type: "MoveAction", val: { x: 15, y: 25 } };
      expect(GameAction.equals(action1, action2)).toBe(false);
    });

    it("should check GameAction equality for different types", () => {
      const action1: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      const action2: GameAction = { type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } };
      expect(GameAction.equals(action1, action2)).toBe(false);
    });

    it("should check GameAction equality for AttackAction", () => {
      const action1: GameAction = { type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } };
      const action2: GameAction = { type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } };
      const action3: GameAction = { type: "AttackAction", val: { targetId: "enemy-2", damage: 50 } };
      expect(GameAction.equals(action1, action2)).toBe(true);
      expect(GameAction.equals(action1, action3)).toBe(false);
    });

    it("should check GameAction equality for UseItemAction", () => {
      const action1: GameAction = { type: "UseItemAction", val: { itemId: "potion-1" } };
      const action2: GameAction = { type: "UseItemAction", val: { itemId: "potion-1" } };
      const action3: GameAction = { type: "UseItemAction", val: { itemId: "potion-2" } };
      expect(GameAction.equals(action1, action2)).toBe(true);
      expect(GameAction.equals(action1, action3)).toBe(false);
    });

    it("should parse MoveAction in union", () => {
      const moveAction: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      expect(() => GameAction.parse(moveAction)).not.toThrow();
    });

    it("should parse AttackAction in union", () => {
      const attackAction: GameAction = { type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } };
      expect(() => GameAction.parse(attackAction)).not.toThrow();
    });

    it("should parse UseItemAction in union", () => {
      const useItemAction: GameAction = { type: "UseItemAction", val: { itemId: "potion-1" } };
      expect(() => GameAction.parse(useItemAction)).not.toThrow();
    });

    it("should parse protobuf-style MoveAction union", () => {
      const protobufAction: any = { MoveAction: { x: 10, y: 20 } };
      const parsed = GameAction.parse(protobufAction);
      expect(parsed).toEqual({ type: "MoveAction", val: { x: 10, y: 20 } });
    });

    it("should parse protobuf-style AttackAction union", () => {
      const protobufAction: any = { AttackAction: { targetId: "enemy-1", damage: 50 } };
      const parsed = GameAction.parse(protobufAction);
      expect(parsed).toEqual({ type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } });
    });

    it("should parse protobuf-style UseItemAction union", () => {
      const protobufAction: any = { UseItemAction: { itemId: "potion-1" } };
      const parsed = GameAction.parse(protobufAction);
      expect(parsed).toEqual({ type: "UseItemAction", val: { itemId: "potion-1" } });
    });

    it("should encode protobuf-style union the same as delta-pack format", () => {
      const deltaPackAction: GameAction = { type: "MoveAction", val: { x: 100, y: 200 } };
      const protobufAction: any = { MoveAction: { x: 100, y: 200 } };

      const parsedProtobuf = GameAction.parse(protobufAction);
      const encodedDeltaPack = GameAction.encode(deltaPackAction);
      const encodedProtobuf = GameAction.encode(parsedProtobuf);

      expect(encodedProtobuf).toEqual(encodedDeltaPack);
    });

    it("should detect GameAction validation errors for invalid type", () => {
      const invalidAction: any = { type: "InvalidAction", val: {} };
      expect(() => GameAction.parse(invalidAction)).toThrow();
    });

    it("should detect GameAction validation errors for non-object", () => {
      expect(() => GameAction.parse("not an object" as any)).toThrow();
    });

    it("should detect GameAction validation errors for invalid MoveAction value", () => {
      const invalidAction: any = { type: "MoveAction", val: { x: "invalid", y: 20 } };
      expect(() => GameAction.parse(invalidAction)).toThrow();
    });

    it("should detect GameAction validation errors for invalid AttackAction value", () => {
      const invalidAction: any = { type: "AttackAction", val: { targetId: 123, damage: 50 } };
      expect(() => GameAction.parse(invalidAction)).toThrow();
    });

    it("should detect GameAction validation errors for invalid UseItemAction value", () => {
      const invalidAction: any = { type: "UseItemAction", val: { itemId: false } };
      expect(() => GameAction.parse(invalidAction)).toThrow();
    });

    it("should encode and decode MoveAction union", () => {
      const action: GameAction = { type: "MoveAction", val: { x: 100, y: 200 } };
      const encoded = GameAction.encode(action);
      const decoded = GameAction.decode(encoded);

      expect(decoded.type).toBe("MoveAction");
      expect(decoded.val).toEqual({ x: 100, y: 200 });
    });

    it("should encode and decode AttackAction union", () => {
      const action: GameAction = { type: "AttackAction", val: { targetId: "enemy-5", damage: 75 } };
      const encoded = GameAction.encode(action);
      const decoded = GameAction.decode(encoded);

      expect(decoded.type).toBe("AttackAction");
      expect(decoded.val).toEqual({ targetId: "enemy-5", damage: 75 });
    });

    it("should handle diff within same union variant", () => {
      const action1: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      const action2: GameAction = { type: "MoveAction", val: { x: 15, y: 25 } };

      const encodedDiff = GameAction.encodeDiff(action1, action2);
      const result = GameAction.decodeDiff(action1, encodedDiff);

      expect(result.type).toBe("MoveAction");
      expect(result.val).toEqual({ x: 15, y: 25 });
    });

    it("should handle diff between different union variants", () => {
      const action1: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      const action2: GameAction = { type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } };

      const encodedDiff = GameAction.encodeDiff(action1, action2);
      const result = GameAction.decodeDiff(action1, encodedDiff);

      expect(result.type).toBe("AttackAction");
      expect(result.val).toEqual({ targetId: "enemy-1", damage: 50 });
    });

    it("should handle identical union values", () => {
      const action: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      const encodedDiff = GameAction.encodeDiff(action, action);
      const result = GameAction.decodeDiff(action, encodedDiff);
      expect(result).toEqual(action);
    });
  });

  describe("GameState Type - Complex Nested Structure", () => {
    const gameState1: GameState = {
      players: [
        { id: "p1", name: "Alice", score: 0, isActive: true },
        { id: "p2", name: "Bob", score: 0, isActive: true },
      ],
      currentPlayer: "p1",
      round: 1,
      metadata: new Map([
        ["mode", "ranked"],
        ["difficulty", "hard"],
      ]),
      winningColor: undefined,
      lastAction: undefined,
    };

    const gameState2: GameState = {
      players: [
        { id: "p1", name: "Alice", score: 50, isActive: true },
        { id: "p2", name: "Bob", score: 30, isActive: true },
      ],
      currentPlayer: "p2",
      round: 2,
      metadata: new Map([
        ["mode", "ranked"],
        ["difficulty", "hard"],
        ["season", "winter"],
      ]),
      winningColor: "BLUE",
      lastAction: { type: "MoveAction", val: { x: 5, y: 10 } },
    };

    it("should create default game state", () => {
      const defaultState = GameState.default();
      expect(defaultState).toEqual({
        players: [],
        currentPlayer: undefined,
        round: 0,
        metadata: new Map(),
        winningColor: undefined,
        lastAction: undefined,
      });
    });

    it("should parse correct game state", () => {
      expect(() => GameState.parse(gameState1)).not.toThrow();
    });

    it("should detect validation errors for invalid players", () => {
      const invalidState = {
        players: [{ id: 123, name: "Invalid", score: 0, isActive: true }],
        currentPlayer: undefined,
        round: 0,
        metadata: new Map(),
        winningColor: undefined,
        lastAction: undefined,
      };
      expect(() => GameState.parse(invalidState as any)).toThrow(/players/);
    });

    it("should detect validation errors for invalid currentPlayer", () => {
      const invalidState = {
        players: [],
        currentPlayer: 123,
        round: 0,
        metadata: new Map(),
        winningColor: undefined,
        lastAction: undefined,
      };
      expect(() => GameState.parse(invalidState as any)).toThrow(/currentPlayer/);
    });

    it("should detect validation errors for invalid round", () => {
      const invalidState = {
        players: [],
        currentPlayer: undefined,
        round: -1,
        metadata: new Map(),
        winningColor: undefined,
        lastAction: undefined,
      };
      expect(() => GameState.parse(invalidState as any)).toThrow(/round/);
    });

    it("should detect validation errors for invalid metadata", () => {
      const invalidState = {
        players: [],
        currentPlayer: undefined,
        round: 0,
        metadata: "not a map",
        winningColor: undefined,
        lastAction: undefined,
      };
      expect(() => GameState.parse(invalidState as any)).toThrow(/metadata/);
    });

    it("should detect validation errors for invalid winningColor", () => {
      const invalidState = {
        players: [],
        currentPlayer: undefined,
        round: 0,
        metadata: new Map(),
        winningColor: "INVALID_COLOR",
        lastAction: undefined,
      };
      expect(() => GameState.parse(invalidState as any)).toThrow(/winningColor/);
    });

    it("should detect validation errors for invalid lastAction", () => {
      const invalidState = {
        players: [],
        currentPlayer: undefined,
        round: 0,
        metadata: new Map(),
        winningColor: undefined,
        lastAction: { type: "MoveAction", val: { x: "invalid", y: 20 } },
      };
      expect(() => GameState.parse(invalidState as any)).toThrow(/lastAction/);
    });

    it("should detect validation errors for non-object", () => {
      expect(() => GameState.parse("not an object" as any)).toThrow(/Invalid GameState/);
    });

    it("should check equality correctly", () => {
      expect(GameState.equals(gameState1, gameState1)).toBe(true);
      expect(GameState.equals(gameState1, gameState2)).toBe(false);
    });

    it("should encode and decode game state", () => {
      const encoded = GameState.encode(gameState1);
      const decoded = GameState.decode(encoded);

      expect(decoded.players).toEqual(gameState1.players);
      expect(decoded.currentPlayer).toBe(gameState1.currentPlayer);
      expect(decoded.round).toBe(gameState1.round);
      expect(decoded.metadata).toEqual(gameState1.metadata);
      expect(decoded.winningColor).toBe(gameState1.winningColor);
      expect(decoded.lastAction).toBe(gameState1.lastAction);
    });

    it("should encode and decode game state with optional fields", () => {
      const encoded = GameState.encode(gameState2);
      const decoded = GameState.decode(encoded);

      expect(decoded.winningColor).toBe("BLUE");
      expect(decoded.lastAction).toEqual({ type: "MoveAction", val: { x: 5, y: 10 } });
      expect(decoded.metadata).toEqual(gameState2.metadata);
    });

    it("should handle diff between game states", () => {
      const encodedDiff = GameState.encodeDiff(gameState1, gameState2);
      const result = GameState.decodeDiff(gameState1, encodedDiff);

      expect(GameState.equals(result, gameState2)).toBe(true);
      expect(result.players).toEqual(gameState2.players);
      expect(result.currentPlayer).toBe(gameState2.currentPlayer);
      expect(result.round).toBe(gameState2.round);
      expect(result.metadata).toEqual(gameState2.metadata);
      expect(result.winningColor).toBe(gameState2.winningColor);
      expect(result.lastAction).toEqual(gameState2.lastAction);
    });

    it("should have smaller diff encoding than full encoding for partial changes", () => {
      const state1 = {
        players: [{ id: "p1", name: "Alice", score: 100, isActive: true }],
        currentPlayer: "p1" as string | undefined,
        round: 1,
        metadata: new Map([["mode", "ranked"]]),
        winningColor: undefined as Color | undefined,
        lastAction: undefined as GameAction | undefined,
      };

      const state2 = {
        ...state1,
        round: 2, // Only round changed
      };

      const fullEncoded = GameState.encode(state2);
      const diffEncoded = GameState.encodeDiff(state1, state2);

      expect(diffEncoded.length).toBeLessThan(fullEncoded.length);
    });

    it("should handle identical states (no diff)", () => {
      const encodedDiff = GameState.encodeDiff(gameState1, gameState1);
      const result = GameState.decodeDiff(gameState1, encodedDiff);
      expect(GameState.equals(result, gameState1)).toBe(true);
    });
  });

  describe("Arrays - Complex Element Diffs", () => {
    it("should handle array with no changes", () => {
      const state = {
        players: [{ id: "p1", name: "Alice", score: 100, isActive: true }],
        currentPlayer: "p1" as string | undefined,
        round: 1,
        metadata: new Map(),
        winningColor: undefined as Color | undefined,
        lastAction: undefined as GameAction | undefined,
      };

      const encodedDiff = GameState.encodeDiff(state, state);
      const result = GameState.decodeDiff(state, encodedDiff);
      expect(result.players).toEqual(state.players);
    });

    it("should handle array element field changes", () => {
      const state1 = {
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: "p2", name: "Bob", score: 50, isActive: true },
        ],
        currentPlayer: undefined,
        round: 1,
        metadata: new Map(),
        winningColor: undefined as Color | undefined,
        lastAction: undefined as GameAction | undefined,
      };

      const state2 = {
        ...state1,
        players: [
          { id: "p1", name: "Alice", score: 150, isActive: true }, // score changed
          { id: "p2", name: "Bob", score: 75, isActive: false }, // score and isActive changed
        ],
      };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.players).toEqual(state2.players);
    });

    it("should handle array length changes - adding elements", () => {
      const state1 = {
        players: [{ id: "p1", name: "Alice", score: 100, isActive: true }],
        currentPlayer: undefined,
        round: 1,
        metadata: new Map(),
        winningColor: undefined as Color | undefined,
        lastAction: undefined as GameAction | undefined,
      };

      const state2 = {
        ...state1,
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: "p2", name: "Bob", score: 0, isActive: true },
        ],
      };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.players).toEqual(state2.players);
    });

    it("should handle array length changes - removing elements", () => {
      const state1 = {
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: "p2", name: "Bob", score: 50, isActive: true },
        ],
        currentPlayer: undefined,
        round: 1,
        metadata: new Map(),
        winningColor: undefined as Color | undefined,
        lastAction: undefined as GameAction | undefined,
      };

      const state2 = {
        ...state1,
        players: [{ id: "p1", name: "Alice", score: 100, isActive: true }],
      };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.players).toEqual(state2.players);
    });

    it("should handle empty array", () => {
      const state1 = {
        players: [{ id: "p1", name: "Alice", score: 100, isActive: true }],
        currentPlayer: undefined,
        round: 1,
        metadata: new Map(),
        winningColor: undefined as Color | undefined,
        lastAction: undefined as GameAction | undefined,
      };

      const state2 = { ...state1, players: [] };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.players).toEqual([]);
    });
  });

  describe("Optional Fields", () => {
    const baseState = {
      players: [],
      currentPlayer: undefined,
      round: 1,
      metadata: new Map(),
      winningColor: undefined as Color | undefined,
      lastAction: undefined as GameAction | undefined,
    };

    it("should handle optional field: undefined -> value", () => {
      const state1 = { ...baseState, currentPlayer: undefined };
      const state2 = { ...baseState, currentPlayer: "p1" };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.currentPlayer).toBe("p1");
    });

    it("should handle optional field: value -> undefined", () => {
      const state1 = { ...baseState, currentPlayer: "p1" };
      const state2 = { ...baseState, currentPlayer: undefined };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.currentPlayer).toBe(undefined);
    });

    it("should handle optional field: value -> different value", () => {
      const state1 = { ...baseState, currentPlayer: "p1" };
      const state2 = { ...baseState, currentPlayer: "p2" };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.currentPlayer).toBe("p2");
    });

    it("should handle optional field: undefined -> undefined", () => {
      const state1 = { ...baseState, currentPlayer: undefined };
      const state2 = { ...baseState, currentPlayer: undefined };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.currentPlayer).toBe(undefined);
    });

    it("should handle optional enum field", () => {
      const state1 = { ...baseState, winningColor: undefined };
      const state2 = { ...baseState, winningColor: "BLUE" as Color };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.winningColor).toBe("BLUE");
    });

    it("should handle optional union field", () => {
      const state1 = { ...baseState, lastAction: undefined };
      const state2 = {
        ...baseState,
        lastAction: { type: "MoveAction", val: { x: 10, y: 20 } } as GameAction,
      };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.lastAction).toEqual({ type: "MoveAction", val: { x: 10, y: 20 } });
    });
  });

  describe("Records (Maps)", () => {
    const baseState = {
      players: [],
      currentPlayer: undefined,
      round: 1,
      metadata: new Map(),
      winningColor: undefined as Color | undefined,
      lastAction: undefined as GameAction | undefined,
    };

    it("should handle empty map", () => {
      const state = { ...baseState, metadata: new Map() };
      const encoded = GameState.encode(state);
      const decoded = GameState.decode(encoded);
      expect(decoded.metadata).toEqual(new Map());
    });

    it("should handle map additions", () => {
      const state1 = { ...baseState, metadata: new Map([["key1", "value1"]]) };
      const state2 = {
        ...baseState,
        metadata: new Map([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
      };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.metadata).toEqual(state2.metadata);
    });

    it("should handle map deletions", () => {
      const state1 = {
        ...baseState,
        metadata: new Map([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
      };
      const state2 = { ...baseState, metadata: new Map([["key1", "value1"]]) };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.metadata).toEqual(state2.metadata);
    });

    it("should handle map updates", () => {
      const state1 = { ...baseState, metadata: new Map([["key1", "value1"]]) };
      const state2 = { ...baseState, metadata: new Map([["key1", "updated"]]) };

      const encodedDiff = GameState.encodeDiff(state1, state2);
      const result = GameState.decodeDiff(state1, encodedDiff);
      expect(result.metadata).toEqual(state2.metadata);
    });

    it("should handle map with no changes", () => {
      const state = {
        ...baseState,
        metadata: new Map([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
      };

      const encodedDiff = GameState.encodeDiff(state, state);
      const result = GameState.decodeDiff(state, encodedDiff);
      expect(result.metadata).toEqual(state.metadata);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle non-object validation", () => {
      expect(() => Player.parse("not an object" as any)).toThrow(/Invalid Player/);
    });

    it("should handle undefined values in validation", () => {
      expect(() => Player.parse(undefined as any)).toThrow();
    });

    it("should roundtrip encode/decode multiple times", () => {
      let state = GameState.default();

      for (let i = 0; i < 10; i++) {
        const encoded = GameState.encode(state);
        state = GameState.decode(encoded);
      }

      expect(state).toEqual(GameState.default());
    });

    it("should roundtrip diff encode/decode multiple times", () => {
      const initialState: GameState = {
        players: [{ id: "p1", name: "Alice", score: 0, isActive: true }],
        currentPlayer: "p1" as string | undefined,
        round: 0,
        metadata: new Map(),
        winningColor: undefined as Color | undefined,
        lastAction: undefined as GameAction | undefined,
      };

      let state = initialState;
      for (let i = 1; i <= 10; i++) {
        const nextState = { ...state, round: i };
        const encodedDiff = GameState.encodeDiff(state, nextState);
        state = GameState.decodeDiff(state, encodedDiff);
      }

      expect(state.round).toBe(10);
      expect(state.players).toEqual(initialState.players);
    });
  });

  describe("Performance Characteristics", () => {
    it("should demonstrate delta compression benefits", () => {
      const state1 = {
        players: Array.from({ length: 10 }, (_, i) => ({
          id: `p${i}`,
          name: `Player${i}`,
          score: i * 100,
          isActive: true,
        })),
        currentPlayer: "p0" as string | undefined,
        round: 1,
        metadata: new Map([
          ["mode", "ranked"],
          ["difficulty", "hard"],
          ["map", "forest"],
        ]),
        winningColor: undefined as Color | undefined,
        lastAction: undefined as GameAction | undefined,
      };

      // Only change one player's score
      const state2 = {
        ...state1,
        players: state1.players.map((p, i) => (i === 0 ? { ...p, score: 999 } : p)),
      };

      const fullEncoded = GameState.encode(state2);
      const diffEncoded = GameState.encodeDiff(state1, state2);

      console.log(`Full state: ${fullEncoded.length} bytes`);
      console.log(`Delta: ${diffEncoded.length} bytes`);
      console.log(`Savings: ${((1 - diffEncoded.length / fullEncoded.length) * 100).toFixed(1)}%`);

      expect(diffEncoded.length).toBeLessThan(fullEncoded.length);
    });

    it("should have reasonable encoding sizes for minimal state", () => {
      const minimalState = GameState.default();
      const encoded = GameState.encode(minimalState);

      console.log(`Minimal state size: ${encoded.length} bytes`);
      expect(encoded.length).toBeLessThan(50);
    });
  });
});
