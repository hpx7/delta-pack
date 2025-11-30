import { describe, it, expect } from "vitest";
import { Infer } from "../src/infer";
import { load } from "../src/interpreter";
import { schema } from "./schema";

// Infer TypeScript types from schema
type Player = Infer<typeof schema.Player, typeof schema>;
type Position = Infer<typeof schema.Position, typeof schema>;
type MoveAction = Infer<typeof schema.MoveAction, typeof schema>;
type AttackAction = Infer<typeof schema.AttackAction, typeof schema>;
type UseItemAction = Infer<typeof schema.UseItemAction, typeof schema>;
type GameAction = Infer<typeof schema.GameAction, typeof schema>;
type GameState = Infer<typeof schema.GameState, typeof schema>;

// Load interpreter APIs
const Player = load<Player>(schema, "Player");
const Position = load<Position>(schema, "Position");
const MoveAction = load<MoveAction>(schema, "MoveAction");
const AttackAction = load<AttackAction>(schema, "AttackAction");
const UseItemAction = load<UseItemAction>(schema, "UseItemAction");
const GameAction = load<GameAction>(schema, "GameAction");
const GameState = load<GameState>(schema, "GameState");

describe("Delta Pack Interpreter - Unified API", () => {
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

  describe("Position Type - Quantized Floats", () => {
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

  describe("MoveAction, AttackAction, UseItemAction", () => {
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
      expect(() => MoveAction.parse("not an object" as any)).toThrow(/Invalid/);
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

    it("should parse AttackAction", () => {
      const attack = { targetId: "enemy-1", damage: 50 };
      expect(() => AttackAction.parse(attack)).not.toThrow();
    });

    it("should detect AttackAction validation errors for targetId", () => {
      const invalidAttack = { targetId: 123, damage: 50 };
      expect(() => AttackAction.parse(invalidAttack as any)).toThrow(/targetId/);
    });

    it("should detect AttackAction validation errors for damage", () => {
      const invalidAttack = { targetId: "enemy-1", damage: "invalid" };
      expect(() => AttackAction.parse(invalidAttack as any)).toThrow(/damage/);
    });

    it("should detect AttackAction validation errors for negative damage", () => {
      const invalidAttack = { targetId: "enemy-1", damage: -10 };
      expect(() => AttackAction.parse(invalidAttack as any)).toThrow(/damage/);
    });

    it("should check UseItemAction equality", () => {
      const use1 = { itemId: "potion-1" };
      const use2 = { itemId: "potion-1" };
      const use3 = { itemId: "potion-2" };
      expect(UseItemAction.equals(use1, use2)).toBe(true);
      expect(UseItemAction.equals(use1, use3)).toBe(false);
    });

    it("should encode/decode UseItemAction", () => {
      const useItem = { itemId: "potion-1" };
      const encoded = UseItemAction.encode(useItem);
      const decoded = UseItemAction.decode(encoded);
      expect(decoded).toEqual(useItem);
    });

    it("should parse UseItemAction", () => {
      const useItem = { itemId: "potion-1" };
      expect(() => UseItemAction.parse(useItem)).not.toThrow();
    });

    it("should detect UseItemAction validation errors for itemId", () => {
      const invalidUse = { itemId: false };
      expect(() => UseItemAction.parse(invalidUse as any)).toThrow(/itemId/);
    });
  });

  describe("Union Types - GameAction", () => {
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
      expect(GameAction.equals(result, action2)).toBe(true);
    });

    it("should handle diff when changing union variant", () => {
      const action1: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      const action2: GameAction = { type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } };

      const encodedDiff = GameAction.encodeDiff(action1, action2);
      const result = GameAction.decodeDiff(action1, encodedDiff);

      expect(result.type).toBe("AttackAction");
      expect(result.val).toEqual({ targetId: "enemy-1", damage: 50 });
    });

    it("should handle identical union values (no diff)", () => {
      const action: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      const encodedDiff = GameAction.encodeDiff(action, action);
      const result = GameAction.decodeDiff(action, encodedDiff);

      expect(result).toEqual(action);
      expect(GameAction.equals(result, action)).toBe(true);
    });
  });

  describe("Complex Type - GameState", () => {
    const player1: Player = { id: "p1", name: "Alice", score: 100, isActive: true };
    const player2: Player = { id: "p2", name: "Bob", score: 50, isActive: true };

    const gameState1: GameState = {
      players: [player1, player2],
      currentPlayer: "p1",
      round: 1,
      metadata: new Map([
        ["mode", "classic"],
        ["difficulty", "hard"],
      ]),
      winningColor: undefined,
      lastAction: { type: "MoveAction", val: { x: 10, y: 20 } },
    };

    it("should parse valid GameState", () => {
      expect(() => GameState.parse(gameState1)).not.toThrow();
    });

    it("should detect validation errors for players array", () => {
      const invalidState = {
        ...gameState1,
        players: [{ id: 123, name: "Alice", score: 100, isActive: true }],
      };
      expect(() => GameState.parse(invalidState as any)).toThrow();
    });

    it("should detect validation errors for round", () => {
      const invalidState = { ...gameState1, round: -1 };
      expect(() => GameState.parse(invalidState as any)).toThrow(/round/);
    });

    it("should handle optional currentPlayer", () => {
      const stateWithoutCurrentPlayer = { ...gameState1, currentPlayer: undefined };
      expect(() => GameState.parse(stateWithoutCurrentPlayer)).not.toThrow();
    });

    it("should handle optional winningColor", () => {
      const stateWithColor: GameState = { ...gameState1, winningColor: "RED" };
      expect(() => GameState.parse(stateWithColor)).not.toThrow();
    });

    it("should handle optional lastAction", () => {
      const stateWithoutAction = { ...gameState1, lastAction: undefined };
      expect(() => GameState.parse(stateWithoutAction)).not.toThrow();
    });

    it("should encode and decode GameState", () => {
      const encoded = GameState.encode(gameState1);
      expect(encoded).toBeInstanceOf(Uint8Array);

      const decoded = GameState.decode(encoded);
      expect(decoded.players).toHaveLength(2);
      expect(decoded.currentPlayer).toBe("p1");
      expect(decoded.round).toBe(1);
      expect(decoded.metadata.get("mode")).toBe("classic");
      expect(decoded.metadata.get("difficulty")).toBe("hard");
      expect(GameState.equals(decoded, gameState1)).toBe(true);
    });

    it("should encode and decode GameState diff", () => {
      const gameState2: GameState = {
        ...gameState1,
        currentPlayer: "p2",
        round: 2,
        lastAction: { type: "AttackAction", val: { targetId: "p1", damage: 25 } },
      };

      const encodedDiff = GameState.encodeDiff(gameState1, gameState2);
      const result = GameState.decodeDiff(gameState1, encodedDiff);

      expect(result.currentPlayer).toBe("p2");
      expect(result.round).toBe(2);
      expect(result.lastAction?.type).toBe("AttackAction");
      expect(GameState.equals(result, gameState2)).toBe(true);
    });

    it("should handle empty players array", () => {
      const emptyState: GameState = {
        players: [],
        currentPlayer: undefined,
        round: 0,
        metadata: new Map(),
        winningColor: undefined,
        lastAction: undefined,
      };

      const encoded = GameState.encode(emptyState);
      const decoded = GameState.decode(encoded);

      expect(decoded.players).toHaveLength(0);
      expect(decoded.metadata.size).toBe(0);
    });

    it("should detect record validation errors", () => {
      const invalidState = {
        ...gameState1,
        metadata: new Map([[123, "value"]]), // invalid key type
      };
      expect(() => GameState.parse(invalidState as any)).toThrow();
    });

    it("should handle record changes in diff", () => {
      const gameState2: GameState = {
        ...gameState1,
        metadata: new Map([
          ["mode", "tournament"],
          ["difficulty", "hard"],
          ["newKey", "newValue"],
        ]),
      };

      const encodedDiff = GameState.encodeDiff(gameState1, gameState2);
      const result = GameState.decodeDiff(gameState1, encodedDiff);

      expect(result.metadata.get("mode")).toBe("tournament");
      expect(result.metadata.get("newKey")).toBe("newValue");
    });

    it("should have significant compression for minimal changes", () => {
      const gameState2: GameState = {
        ...gameState1,
        round: 2, // Only round changes
      };

      const fullEncoded = GameState.encode(gameState2);
      const diffEncoded = GameState.encodeDiff(gameState1, gameState2);

      // Diff should be much smaller when only one field changes
      expect(diffEncoded.length).toBeLessThan(fullEncoded.length);
    });
  });

  describe("Performance Characteristics", () => {
    it("should demonstrate delta compression benefits", () => {
      const state1: GameState = {
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: "p2", name: "Bob", score: 50, isActive: true },
        ],
        currentPlayer: "p1",
        round: 1,
        metadata: new Map([["mode", "classic"]]),
        winningColor: undefined,
        lastAction: undefined,
      };

      const state2: GameState = {
        ...state1,
        round: 2, // Only round changes
      };

      const fullEncoded = GameState.encode(state2);
      const diffEncoded = GameState.encodeDiff(state1, state2);

      console.log(`Full state: ${fullEncoded.length} bytes`);
      console.log(`Delta: ${diffEncoded.length} bytes`);
      console.log(`Savings: ${((1 - diffEncoded.length / fullEncoded.length) * 100).toFixed(1)}%`);

      expect(diffEncoded.length).toBeLessThan(fullEncoded.length * 0.2); // At least 80% savings
    });

    it("should have reasonable encoding sizes for minimal state", () => {
      const minimalState: GameState = {
        players: [],
        currentPlayer: undefined,
        round: 0,
        metadata: new Map(),
        winningColor: undefined,
        lastAction: undefined,
      };

      const encoded = GameState.encode(minimalState);
      console.log(`Minimal state size: ${encoded.length} bytes`);

      expect(encoded.length).toBeLessThan(20); // Should be very small
    });
  });
});
