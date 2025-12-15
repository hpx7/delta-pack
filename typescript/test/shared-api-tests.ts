import { describe, it, expect } from "vitest";
import { DeltaPackApi, equalsFloat, equalsFloatQuantized, Infer } from "@hpx7/delta-pack";
import { schema } from "./schema.js";

// Infer types from schema
type Player = Infer<typeof schema.Player>;
type Position = Infer<typeof schema.Position>;
type Velocity = Infer<typeof schema.Velocity>;
type Entity = Infer<typeof schema.Entity>;
type MoveAction = Infer<typeof schema.MoveAction>;
type AttackAction = Infer<typeof schema.AttackAction>;
type UseItemAction = Infer<typeof schema.UseItemAction>;
type GameAction = Infer<typeof schema.GameAction>;
type GameState = Infer<typeof schema.GameState>;
type Inventory = Infer<typeof schema.Inventory>;
type PlayerRegistry = Infer<typeof schema.PlayerRegistry>;

export function runPlayerTests(Player: DeltaPackApi<Player>) {
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
      expect(() => Player.fromJson(player1)).not.toThrow();
    });

    it("should detect validation errors for name", () => {
      const invalidPlayer = { id: "p1", name: 123, score: 100, isActive: true };
      expect(() => Player.fromJson(invalidPlayer)).toThrow(/name/);
    });

    it("should detect validation errors for id", () => {
      const invalidPlayer = { id: 123, name: "Alice", score: 100, isActive: true };
      expect(() => Player.fromJson(invalidPlayer)).toThrow(/id/);
    });

    it("should detect validation errors for score", () => {
      const invalidPlayer = { id: "p1", name: "Alice", score: "invalid", isActive: true };
      expect(() => Player.fromJson(invalidPlayer)).toThrow(/score/);
    });

    it("should detect validation errors for isActive", () => {
      const invalidPlayer = { id: "p1", name: "Alice", score: 100, isActive: "invalid" };
      expect(() => Player.fromJson(invalidPlayer)).toThrow(/isActive/);
    });

    it("should discard extra properties in fromJson", () => {
      const playerWithExtra = {
        id: "player-1",
        name: "Alice",
        score: 100,
        isActive: true,
        extraField: "should be ignored",
        anotherExtra: 999,
      };
      const parsed = Player.fromJson(playerWithExtra);
      expect(parsed).toEqual(player1);
      expect(parsed).not.toHaveProperty("extraField");
      expect(parsed).not.toHaveProperty("anotherExtra");
    });

    it("should not encode extra properties", () => {
      const playerWithExtra = {
        ...player1,
        extraField: "should be ignored",
        anotherExtra: 999,
      };
      const encodedNormal = Player.encode(player1);
      const encodedWithExtra = Player.encode(playerWithExtra);
      expect(encodedWithExtra).toEqual(encodedNormal);
    });

    it("should convert player to JSON", () => {
      const json = Player.toJson(player1);
      expect(json).toEqual({
        id: "player-1",
        name: "Alice",
        score: 100,
        isActive: true,
      });
    });

    it("should round-trip fromJson/toJson", () => {
      const json = Player.toJson(player1);
      const parsed = Player.fromJson(json);
      expect(Player.equals(parsed, player1)).toBe(true);
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
}

export function runRecursivePlayerTests(Player: DeltaPackApi<Player>) {
  describe("Recursive Schema - Player with Partner", () => {
    it("should handle player without partner", () => {
      const player: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      expect(() => Player.fromJson(player)).not.toThrow();

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
      };

      const player: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner: partner,
      };

      expect(() => Player.fromJson(player)).not.toThrow();

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

      expect(() => Player.fromJson(player)).not.toThrow();

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
      };

      const partner: Player = {
        id: "p2",
        name: "Bob",
        score: 50,
        isActive: true,
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
        score: 75,
        isActive: true,
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
        partner: { id: 123, name: "Bob" },
      };
      expect(() => Player.fromJson(invalidPlayer)).toThrow();
    });
  });
}

export function runPositionTests(Position: DeltaPackApi<Position>) {
  describe("Position Type - Quantized Floats", () => {
    it("should parse correct position data", () => {
      const pos = { x: 123.456, y: 78.912 };
      expect(() => Position.fromJson(pos)).not.toThrow();
    });

    it("should detect validation errors for x", () => {
      const invalidPos = { x: "invalid", y: 10.0 };
      expect(() => Position.fromJson(invalidPos)).toThrow(/x/);
    });

    it("should detect validation errors for y", () => {
      const invalidPos = { x: 10.0, y: "invalid" };
      expect(() => Position.fromJson(invalidPos)).toThrow(/y/);
    });

    it("should quantize floats on encode/decode (0.1 precision)", () => {
      const pos = { x: 123.456, y: 78.912 };
      const encoded = Position.encode(pos);
      const decoded = Position.decode(encoded);

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
      const pos1 = { x: 100.02, y: 200.01 };
      const pos2 = { x: 100.03, y: 200.04 };

      expect(Position.equals(pos1, pos2)).toBe(true);
    });

    it("should detect inequality beyond quantization threshold", () => {
      const pos1 = { x: 100.0, y: 200.0 };
      const pos2 = { x: 100.2, y: 200.0 };

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

      const encodedDiff = Position.encodeDiff(pos1, pos2);
      const result = Position.decodeDiff(pos1, encodedDiff);

      expect(Position.equals(result, pos1)).toBe(true);
    });

    it("should use less bandwidth than full precision for small changes", () => {
      const pos1 = { x: 100.0, y: 200.0 };
      const pos2 = { x: 100.5, y: 200.3 };

      const fullEncoded = Position.encode(pos2);
      const diffEncoded = Position.encodeDiff(pos1, pos2);

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
}

export function runVelocityTests(Position: DeltaPackApi<Position>, Velocity: DeltaPackApi<Velocity>) {
  describe("Velocity Type - Non-Quantized Floats", () => {
    it("should parse correct velocity data", () => {
      const vel = { vx: 123.456789, vy: 78.912345 };
      expect(() => Velocity.fromJson(vel)).not.toThrow();
    });

    it("should detect validation errors for vx", () => {
      const invalidVel = { vx: "invalid", vy: 10.0 };
      expect(() => Velocity.fromJson(invalidVel)).toThrow(/vx/);
    });

    it("should detect validation errors for vy", () => {
      const invalidVel = { vx: 10.0, vy: "invalid" };
      expect(() => Velocity.fromJson(invalidVel)).toThrow(/vy/);
    });

    it("should preserve full precision floats on encode/decode", () => {
      const vel = { vx: 123.456789, vy: 78.912345 };
      const encoded = Velocity.encode(vel);
      const decoded = Velocity.decode(encoded);

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
      const vel1 = { vx: 100.000001, vy: 200.000001 };
      const vel2 = { vx: 100.000002, vy: 200.000002 };

      expect(Velocity.equals(vel1, vel2)).toBe(true);
    });

    it("should detect inequality beyond epsilon threshold", () => {
      const vel1 = { vx: 100.0, vy: 200.0 };
      const vel2 = { vx: 100.01, vy: 200.0 };

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

      const encodedDiff = Velocity.encodeDiff(vel1, vel2);
      const result = Velocity.decodeDiff(vel1, encodedDiff);

      expect(Velocity.equals(result, vel1)).toBe(true);
    });

    it("should handle large velocity values", () => {
      const vel = { vx: 9999.123456, vy: -8888.654321 };
      const encoded = Velocity.encode(vel);
      const decoded = Velocity.decode(encoded);

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
      const pos = { x: 123.456, y: 78.912 };
      const encodedPos = Position.encode(pos);
      const decodedPos = Position.decode(encodedPos);

      const vel = { vx: 123.456, vy: 78.912 };
      const encodedVel = Velocity.encode(vel);
      const decodedVel = Velocity.decode(encodedVel);

      expect(equalsFloatQuantized(decodedPos.x, 123.456, 0.1)).toBe(true);
      expect(equalsFloatQuantized(decodedPos.y, 78.912, 0.1)).toBe(true);
      expect(decodedPos.x).toBe(123.5);
      expect(decodedPos.y).toBe(78.9);

      expect(equalsFloat(decodedVel.vx, 123.456)).toBe(true);
      expect(equalsFloat(decodedVel.vy, 78.912)).toBe(true);
    });
  });
}

export function runEntityTests(Entity: DeltaPackApi<Entity>) {
  describe("Entity Type - Nested Object Reference", () => {
    it("should parse correct entity data", () => {
      const entity: Entity = { id: "entity1", position: { x: 10.5, y: 20.3 } };
      expect(() => Entity.fromJson(entity)).not.toThrow();
    });

    it("should detect validation errors for id", () => {
      const invalidEntity = { id: 123, position: { x: 10.5, y: 20.3 } };
      expect(() => Entity.fromJson(invalidEntity)).toThrow(/id/);
    });

    it("should detect validation errors for position", () => {
      const invalidEntity = { id: "entity1", position: "invalid" };
      expect(() => Entity.fromJson(invalidEntity)).toThrow();
    });

    it("should detect validation errors for nested position fields", () => {
      const invalidEntity = { id: "entity1", position: { x: "invalid", y: 20.3 } };
      expect(() => Entity.fromJson(invalidEntity)).toThrow(/position/);
    });

    it("should encode and decode entity data", () => {
      const entity: Entity = { id: "entity1", position: { x: 10.5, y: 20.3 } };
      const encoded = Entity.encode(entity);
      expect(encoded).toBeInstanceOf(Uint8Array);

      const decoded = Entity.decode(encoded);
      expect(decoded.id).toBe("entity1");
      expect(decoded.position.x).toBe(10.5);
      expect(decoded.position.y).toBe(20.3);
    });

    it("should check equality correctly", () => {
      const entity1: Entity = { id: "entity1", position: { x: 10.5, y: 20.3 } };
      const entity2: Entity = { id: "entity1", position: { x: 10.5, y: 20.3 } };
      const entity3: Entity = { id: "entity1", position: { x: 10.6, y: 20.3 } };

      expect(Entity.equals(entity1, entity2)).toBe(true);
      expect(Entity.equals(entity1, entity3)).toBe(false);
    });

    it("should encode and decode diff", () => {
      const entity1: Entity = { id: "entity1", position: { x: 10.0, y: 20.0 } };
      const entity2: Entity = { id: "entity1", position: { x: 15.5, y: 20.0 } };

      const encodedDiff = Entity.encodeDiff(entity1, entity2);
      expect(encodedDiff).toBeInstanceOf(Uint8Array);

      const result = Entity.decodeDiff(entity1, encodedDiff);
      expect(result.id).toBe("entity1");
      expect(result.position.x).toBe(15.5);
      expect(result.position.y).toBe(20.0);
    });

    it("should have smaller diff encoding than full encoding for partial changes", () => {
      const entity1: Entity = { id: "entity1", position: { x: 10.0, y: 20.0 } };
      const entity2: Entity = { id: "entity1", position: { x: 10.5, y: 20.0 } };

      const fullEncoded = Entity.encode(entity2);
      const diffEncoded = Entity.encodeDiff(entity1, entity2);

      expect(diffEncoded.length).toBeLessThanOrEqual(fullEncoded.length);
    });

    it("should convert entity to JSON", () => {
      const entity: Entity = { id: "entity1", position: { x: 10.5, y: 20.3 } };
      const json = Entity.toJson(entity);
      expect(json).toEqual({
        id: "entity1",
        position: { x: 10.5, y: 20.3 },
      });
    });

    it("should round-trip fromJson/toJson", () => {
      const entity: Entity = { id: "entity1", position: { x: 10.5, y: 20.3 } };
      const json = Entity.toJson(entity);
      const parsed = Entity.fromJson(json);
      expect(Entity.equals(parsed, entity)).toBe(true);
    });

    it("should clone entity deeply", () => {
      const entity: Entity = { id: "entity1", position: { x: 10.5, y: 20.3 } };
      const cloned = Entity.clone(entity);

      expect(cloned).toEqual(entity);
      expect(cloned).not.toBe(entity);
      expect(cloned.position).not.toBe(entity.position);

      cloned.position.x = 999;
      expect(entity.position.x).toBe(10.5);
      expect(cloned.position.x).toBe(999);
    });
  });
}

export function runActionTests(
  MoveAction: DeltaPackApi<MoveAction>,
  AttackAction: DeltaPackApi<AttackAction>,
  UseItemAction: DeltaPackApi<UseItemAction>
) {
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
      expect(() => MoveAction.fromJson(move)).not.toThrow();
    });

    it("should detect MoveAction validation errors for x", () => {
      const invalidMove = { x: "invalid", y: 20 };
      expect(() => MoveAction.fromJson(invalidMove)).toThrow(/x/);
    });

    it("should detect MoveAction validation errors for y", () => {
      const invalidMove = { x: 10, y: "invalid" };
      expect(() => MoveAction.fromJson(invalidMove)).toThrow(/y/);
    });

    it("should detect MoveAction validation errors for non-object", () => {
      expect(() => MoveAction.fromJson("not an object" as any)).toThrow(/Invalid/);
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
      expect(() => AttackAction.fromJson(attack)).not.toThrow();
    });

    it("should detect AttackAction validation errors for targetId", () => {
      const invalidAttack = { targetId: 123, damage: 50 };
      expect(() => AttackAction.fromJson(invalidAttack)).toThrow(/targetId/);
    });

    it("should detect AttackAction validation errors for damage", () => {
      const invalidAttack = { targetId: "enemy-1", damage: "invalid" };
      expect(() => AttackAction.fromJson(invalidAttack)).toThrow(/damage/);
    });

    it("should detect AttackAction validation errors for negative damage", () => {
      const invalidAttack = { targetId: "enemy-1", damage: -10 };
      expect(() => AttackAction.fromJson(invalidAttack)).toThrow(/damage/);
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
      expect(() => UseItemAction.fromJson(useItem)).not.toThrow();
    });

    it("should detect UseItemAction validation errors for itemId", () => {
      const invalidUse = { itemId: false };
      expect(() => UseItemAction.fromJson(invalidUse)).toThrow(/itemId/);
    });
  });
}

export function runGameActionTests(GameAction: DeltaPackApi<GameAction>) {
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
      expect(() => GameAction.fromJson(moveAction)).not.toThrow();
    });

    it("should parse AttackAction in union", () => {
      const attackAction: GameAction = { type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } };
      expect(() => GameAction.fromJson(attackAction)).not.toThrow();
    });

    it("should parse UseItemAction in union", () => {
      const useItemAction: GameAction = { type: "UseItemAction", val: { itemId: "potion-1" } };
      expect(() => GameAction.fromJson(useItemAction)).not.toThrow();
    });

    it("should parse protobuf-style MoveAction union", () => {
      const protobufAction: any = { MoveAction: { x: 10, y: 20 } };
      const parsed = GameAction.fromJson(protobufAction);
      expect(parsed).toEqual({ type: "MoveAction", val: { x: 10, y: 20 } });
    });

    it("should parse protobuf-style AttackAction union", () => {
      const protobufAction: any = { AttackAction: { targetId: "enemy-1", damage: 50 } };
      const parsed = GameAction.fromJson(protobufAction);
      expect(parsed).toEqual({ type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } });
    });

    it("should parse protobuf-style UseItemAction union", () => {
      const protobufAction: any = { UseItemAction: { itemId: "potion-1" } };
      const parsed = GameAction.fromJson(protobufAction);
      expect(parsed).toEqual({ type: "UseItemAction", val: { itemId: "potion-1" } });
    });

    it("should encode protobuf-style union the same as delta-pack format", () => {
      const deltaPackAction: GameAction = { type: "MoveAction", val: { x: 100, y: 200 } };
      const protobufAction: any = { MoveAction: { x: 100, y: 200 } };

      const parsedProtobuf = GameAction.fromJson(protobufAction);
      const encodedDeltaPack = GameAction.encode(deltaPackAction);
      const encodedProtobuf = GameAction.encode(parsedProtobuf);

      expect(encodedProtobuf).toEqual(encodedDeltaPack);
    });

    it("should detect GameAction validation errors for invalid type", () => {
      const invalidAction: any = { type: "InvalidAction", val: {} };
      expect(() => GameAction.fromJson(invalidAction)).toThrow();
    });

    it("should detect GameAction validation errors for non-object", () => {
      expect(() => GameAction.fromJson("not an object" as any)).toThrow();
    });

    it("should detect GameAction validation errors for invalid MoveAction value", () => {
      const invalidAction: any = { type: "MoveAction", val: { x: "invalid", y: 20 } };
      expect(() => GameAction.fromJson(invalidAction)).toThrow();
    });

    it("should detect GameAction validation errors for invalid AttackAction value", () => {
      const invalidAction: any = { type: "AttackAction", val: { targetId: 123, damage: 50 } };
      expect(() => GameAction.fromJson(invalidAction)).toThrow();
    });

    it("should detect GameAction validation errors for invalid UseItemAction value", () => {
      const invalidAction: any = { type: "UseItemAction", val: { itemId: false } };
      expect(() => GameAction.fromJson(invalidAction)).toThrow();
    });

    it("should convert MoveAction union to protobuf JSON format", () => {
      const action: GameAction = { type: "MoveAction", val: { x: 10, y: 20 } };
      const json = GameAction.toJson(action);
      expect(json).toEqual({ MoveAction: { x: 10, y: 20 } });
    });

    it("should convert AttackAction union to protobuf JSON format", () => {
      const action: GameAction = { type: "AttackAction", val: { targetId: "enemy-1", damage: 50 } };
      const json = GameAction.toJson(action);
      expect(json).toEqual({ AttackAction: { targetId: "enemy-1", damage: 50 } });
    });

    it("should convert UseItemAction union to protobuf JSON format", () => {
      const action: GameAction = { type: "UseItemAction", val: { itemId: "potion-1" } };
      const json = GameAction.toJson(action);
      expect(json).toEqual({ UseItemAction: { itemId: "potion-1" } });
    });

    it("should round-trip union fromJson/toJson with protobuf format", () => {
      const action: GameAction = { type: "MoveAction", val: { x: 100, y: 200 } };
      const json = GameAction.toJson(action);
      const parsed = GameAction.fromJson(json);
      expect(GameAction.equals(parsed, action)).toBe(true);
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
}

export function runGameStateTests(GameState: DeltaPackApi<GameState>) {
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
      lastAction: { type: "MoveAction", val: { x: 10, y: 20 } },
    };

    it("should parse valid GameState", () => {
      expect(() => GameState.fromJson(gameState1)).not.toThrow();
    });

    it("should detect validation errors for players array", () => {
      const invalidState = {
        ...gameState1,
        players: [{ id: 123, name: "Alice", score: 100, isActive: true }],
      };
      expect(() => GameState.fromJson(invalidState)).toThrow();
    });

    it("should detect validation errors for round", () => {
      const invalidState = { ...gameState1, round: -1 };
      expect(() => GameState.fromJson(invalidState)).toThrow(/round/);
    });

    it("should handle optional currentPlayer", () => {
      const stateWithoutCurrentPlayer = { ...gameState1, currentPlayer: undefined };
      expect(() => GameState.fromJson(stateWithoutCurrentPlayer)).not.toThrow();
    });

    it("should handle optional winningColor", () => {
      const stateWithColor: GameState = { ...gameState1, winningColor: "RED" };
      expect(() => GameState.fromJson(stateWithColor)).not.toThrow();
    });

    it("should handle optional lastAction", () => {
      const stateWithoutAction = { ...gameState1, lastAction: undefined };
      expect(() => GameState.fromJson(stateWithoutAction)).not.toThrow();
    });

    it("should convert GameState to JSON with arrays and records", () => {
      const json = GameState.toJson(gameState1);
      expect(json).toEqual({
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: "p2", name: "Bob", score: 50, isActive: true },
        ],
        currentPlayer: "p1",
        round: 1,
        metadata: {
          mode: "classic",
          difficulty: "hard",
        },
        lastAction: { MoveAction: { x: 10, y: 20 } },
      });
    });

    it("should round-trip GameState fromJson/toJson", () => {
      const json = GameState.toJson(gameState1);
      const parsed = GameState.fromJson(json);
      expect(GameState.equals(parsed, gameState1)).toBe(true);
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
        round: 0,
        metadata: new Map(),
      };

      const encoded = GameState.encode(emptyState);
      const decoded = GameState.decode(encoded);

      expect(decoded.players).toHaveLength(0);
      expect(decoded.metadata.size).toBe(0);
    });

    it("should detect record validation errors", () => {
      const invalidState = {
        ...gameState1,
        metadata: new Map([[123, "value"]]),
      };
      expect(() => GameState.fromJson(invalidState)).toThrow();
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
        round: 2,
      };

      const fullEncoded = GameState.encode(gameState2);
      const diffEncoded = GameState.encodeDiff(gameState1, gameState2);

      expect(diffEncoded.length).toBeLessThan(fullEncoded.length);
    });
  });
}

export function runDirtyTrackingTests(Player: DeltaPackApi<Player>, GameState: DeltaPackApi<GameState>) {
  describe("Dirty Tracking Optimization", () => {
    it("should work without dirty tracking (normal behavior)", () => {
      const state1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const state2: Player = {
        id: "p1",
        name: "Alice",
        score: 150,
        isActive: true,
      };

      const diff = Player.encodeDiff(state1, state2);
      const decoded = Player.decodeDiff(state1, diff);

      expect(Player.equals(decoded, state2)).toBe(true);
    });

    it("should use dirty tracking when _dirty is present", () => {
      const state1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const state2: Player = {
        id: "p1",
        name: "Alice",
        score: 150,
        isActive: true,
        _dirty: new Set(["score"]),
      };

      const diff = Player.encodeDiff(state1, state2);
      const decoded = Player.decodeDiff(state1, diff);

      expect(decoded.score).toBe(150);
      expect(Player.equals(decoded, state2)).toBe(true);
    });

    it("should produce smaller diffs with dirty tracking for sparse updates", () => {
      const largeState1: GameState = {
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: "p2", name: "Bob", score: 50, isActive: true },
        ],
        currentPlayer: "p1",
        round: 1,
        metadata: new Map([["mode", "classic"]]),
      };

      const state2WithoutDirty: GameState = {
        ...largeState1,
        round: 2,
      };

      const state2WithDirty: GameState = {
        ...largeState1,
        round: 2,
        _dirty: new Set(["round"]),
      };

      const diffWithoutDirty = GameState.encodeDiff(largeState1, state2WithoutDirty);
      const diffWithDirty = GameState.encodeDiff(largeState1, state2WithDirty);

      expect(diffWithDirty.length).toBeLessThanOrEqual(diffWithoutDirty.length);

      const decoded1 = GameState.decodeDiff(largeState1, diffWithoutDirty);
      const decoded2 = GameState.decodeDiff(largeState1, diffWithDirty);

      expect(decoded1.round).toBe(2);
      expect(decoded2.round).toBe(2);
    });

    it("should early exit when dirty is empty", () => {
      const state1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const state2: Player = {
        ...state1,
        _dirty: new Set(),
      };

      const diff = Player.encodeDiff(state1, state2);
      const decoded = Player.decodeDiff(state1, diff);

      expect(Player.equals(decoded, state1)).toBe(true);
      expect(diff.length).toBeLessThan(5);
    });

    it("should support dirty tracking for arrays", () => {
      const state1: GameState = {
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: "p2", name: "Bob", score: 50, isActive: true },
          { id: "p3", name: "Charlie", score: 75, isActive: true },
        ],
        currentPlayer: "p1",
        round: 1,
        metadata: new Map(),
      };

      const players = state1.players;
      players[1] = { ...players[1]!, score: 200 };
      players._dirty = new Set([1]);

      const state2: GameState = {
        ...state1,
        players,
      };

      const diff = GameState.encodeDiff(state1, state2);
      const decoded = GameState.decodeDiff(state1, diff);

      expect(decoded.players[1]!.score).toBe(200);
      expect(GameState.equals(decoded, state2)).toBe(true);
    });

    it("should support dirty tracking for records", () => {
      const state1: GameState = {
        players: [],
        currentPlayer: "p1",
        round: 1,
        metadata: new Map([
          ["mode", "classic"],
          ["difficulty", "hard"],
          ["map", "desert"],
        ]),
      };

      const metadata = state1.metadata;
      metadata.set("mode", "ranked");
      metadata._dirty = new Set(["mode"]);

      const state2: GameState = {
        ...state1,
        metadata,
      };

      const diff = GameState.encodeDiff(state1, state2);
      const decoded = GameState.decodeDiff(state1, diff);

      expect(decoded.metadata.get("mode")).toBe("ranked");
      expect(GameState.equals(decoded, state2)).toBe(true);
    });
  });
}

export function runInventoryTests(Inventory: DeltaPackApi<Inventory>) {
  describe("Nested Container Types - Inventory", () => {
    it("should encode/decode inventory with optional array of records", () => {
      const inventory: Inventory = {
        items: [
          new Map([
            ["sword", 1],
            ["shield", 1],
          ]),
          new Map([
            ["potion", 5],
            ["arrow", 20],
          ]),
        ],
      };

      const encoded = Inventory.encode(inventory);
      const decoded = Inventory.decode(encoded);

      expect(decoded.items).toHaveLength(2);
      expect(decoded.items![0]!.get("sword")).toBe(1);
      expect(decoded.items![0]!.get("shield")).toBe(1);
      expect(decoded.items![1]!.get("potion")).toBe(5);
      expect(decoded.items![1]!.get("arrow")).toBe(20);
    });

    it("should handle undefined items in inventory", () => {
      const inventory: Inventory = {};

      const encoded = Inventory.encode(inventory);
      const decoded = Inventory.decode(encoded);

      expect(decoded.items).toBeUndefined();
    });

    it("should compute diff for nested container changes", () => {
      const inv1: Inventory = {
        items: [
          new Map([
            ["sword", 1],
            ["shield", 1],
          ]),
        ],
      };

      const inv2: Inventory = {
        items: [
          new Map([
            ["sword", 1],
            ["shield", 2],
          ]),
        ],
      };

      const encodedDiff = Inventory.encodeDiff(inv1, inv2);
      const decoded = Inventory.decodeDiff(inv1, encodedDiff);

      expect(decoded.items![0]!.get("shield")).toBe(2);
      expect(decoded.items![0]!.get("sword")).toBe(1);
    });
  });
}

export function runCloneTests(
  Player: DeltaPackApi<Player>,
  GameState: DeltaPackApi<GameState>,
  GameAction: DeltaPackApi<GameAction>,
  Inventory: DeltaPackApi<Inventory>,
  PlayerRegistry: DeltaPackApi<PlayerRegistry>
) {
  describe("Clone Function", () => {
    it("should clone simple objects", () => {
      const player1: Player = {
        id: "player1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const player2 = Player.clone(player1);

      expect(player2).toEqual(player1);
      expect(player2).not.toBe(player1);

      player2.name = "Bob";
      expect(player1.name).toBe("Alice");
      expect(player2.name).toBe("Bob");
    });

    it("should clone nested objects", () => {
      const partner: Player = {
        id: "partner1",
        name: "Bob",
        score: 50,
        isActive: true,
      };

      const player1: Player = {
        id: "player1",
        name: "Alice",
        score: 100,
        isActive: true,
        partner,
      };

      const player2 = Player.clone(player1);

      expect(player2).toEqual(player1);
      expect(player2.partner).not.toBe(player1.partner);

      player2.partner!.name = "Charlie";
      expect(player1.partner!.name).toBe("Bob");
      expect(player2.partner!.name).toBe("Charlie");
    });

    it("should clone arrays", () => {
      const player1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const player2: Player = {
        id: "p2",
        name: "Bob",
        score: 150,
        isActive: false,
      };

      const gameState: GameState = {
        players: [player1, player2],
        round: 5,
        metadata: new Map(),
      };

      const clonedState = GameState.clone(gameState);

      expect(clonedState.players).toEqual(gameState.players);
      expect(clonedState.players).not.toBe(gameState.players);
      expect(clonedState.players[0]).not.toBe(gameState.players[0]);

      clonedState.players[0]!.name = "Charlie";
      expect(gameState.players[0]!.name).toBe("Alice");
      expect(clonedState.players[0]!.name).toBe("Charlie");
    });

    it("should clone maps/records", () => {
      const gameState: GameState = {
        players: [],
        round: 1,
        metadata: new Map([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
      };

      const clonedState = GameState.clone(gameState);

      expect(clonedState.metadata).toEqual(gameState.metadata);
      expect(clonedState.metadata).not.toBe(gameState.metadata);

      clonedState.metadata.set("key1", "modified");
      expect(gameState.metadata.get("key1")).toBe("value1");
      expect(clonedState.metadata.get("key1")).toBe("modified");
    });

    it("should clone maps with complex values", () => {
      const map1 = new Map<string, number>([
        ["item1", 5],
        ["item2", 10],
      ]);

      const map2 = new Map<string, number>([["item3", 15]]);

      const inventory: Inventory = {
        items: [map1, map2],
      };

      const clonedInventory = Inventory.clone(inventory);

      expect(clonedInventory.items).toEqual(inventory.items);
      expect(clonedInventory.items).not.toBe(inventory.items);
      expect(clonedInventory.items![0]).not.toBe(inventory.items![0]);

      clonedInventory.items![0]!.set("item1", 999);
      expect(inventory.items![0]!.get("item1")).toBe(5);
      expect(clonedInventory.items![0]!.get("item1")).toBe(999);
    });

    it("should clone union types", () => {
      const moveAction: GameAction = {
        type: "MoveAction",
        val: { x: 10, y: 20 },
      };

      const clonedAction = GameAction.clone(moveAction);

      expect(clonedAction).toEqual(moveAction);
      expect(clonedAction).not.toBe(moveAction);

      if (clonedAction.type === "MoveAction") {
        clonedAction.val.x = 999;
      }
      if (moveAction.type === "MoveAction") {
        expect(moveAction.val.x).toBe(10);
      }
      if (clonedAction.type === "MoveAction") {
        expect(clonedAction.val.x).toBe(999);
      }
    });

    it("should handle optional fields", () => {
      const player1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const player2 = Player.clone(player1);

      expect(player2.partner).toBeUndefined();

      player2.partner = {
        id: "partner",
        name: "Bob",
        score: 50,
        isActive: true,
      };

      expect(player1.partner).toBeUndefined();
      expect(player2.partner?.id).toBe("partner");
    });

    it("should not preserve dirty state", () => {
      const player1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const gameState: GameState = {
        players: [player1],
        round: 1,
        metadata: new Map([["key1", "value1"]]),
      };

      gameState.players._dirty = new Set([0]);
      gameState.metadata._dirty = new Set(["key1"]);

      const clonedState = GameState.clone(gameState);

      expect(clonedState.players._dirty).toBeUndefined();
      expect(clonedState.metadata._dirty).toBeUndefined();
    });

    it("should clone maps with object values", () => {
      const player1: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const player2: Player = {
        id: "p2",
        name: "Bob",
        score: 150,
        isActive: false,
      };

      const registry: PlayerRegistry = {
        players: new Map([
          ["alice", player1],
          ["bob", player2],
        ]),
      };

      const clonedRegistry = PlayerRegistry.clone(registry);

      expect(clonedRegistry.players).toEqual(registry.players);
      expect(clonedRegistry.players).not.toBe(registry.players);
      expect(clonedRegistry.players.get("alice")).not.toBe(registry.players.get("alice"));

      clonedRegistry.players.get("alice")!.name = "Alicia";
      expect(registry.players.get("alice")!.name).toBe("Alice");
      expect(clonedRegistry.players.get("alice")!.name).toBe("Alicia");
    });
  });
}

export function runNestedValidationTests(Entity: DeltaPackApi<Entity>, GameState: DeltaPackApi<GameState>) {
  describe("Nested Validation Error Paths", () => {
    it("should include path for nested object validation error", () => {
      const invalidEntity = {
        id: "entity1",
        position: { x: "not a number", y: 10 },
      };

      expect(() => Entity.fromJson(invalidEntity)).toThrow(/position/);
    });

    it("should include path for array element validation error", () => {
      const invalidState = {
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: 123, name: "Bob", score: 50, isActive: true }, // invalid id
        ],
        round: 1,
        metadata: new Map(),
      };

      expect(() => GameState.fromJson(invalidState)).toThrow(/players/);
    });

    it("should include path for deeply nested validation error", () => {
      const invalidState = {
        players: [
          {
            id: "p1",
            name: "Alice",
            score: 100,
            isActive: true,
            partner: {
              id: "p2",
              name: 12345, // invalid name type
              score: 50,
              isActive: true,
            },
          },
        ],
        round: 1,
        metadata: new Map(),
      };

      expect(() => GameState.fromJson(invalidState)).toThrow();
    });

    it("should validate union type field", () => {
      const invalidState = {
        players: [],
        round: 1,
        metadata: new Map(),
        lastAction: { type: "InvalidAction", val: {} },
      };

      expect(() => GameState.fromJson(invalidState)).toThrow();
    });

    it("should validate record values", () => {
      const invalidState = {
        players: [],
        round: 1,
        metadata: new Map([["key", 123]]), // value should be string
      };

      expect(() => GameState.fromJson(invalidState)).toThrow();
    });
  });
}

export function runDeterminismTests(
  Player: DeltaPackApi<Player>,
  GameState: DeltaPackApi<GameState>,
  GameAction: DeltaPackApi<GameAction>
) {
  describe("Encoding Determinism", () => {
    it("should produce identical bytes for same Player", () => {
      const player: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const encoded1 = Player.encode(player);
      const encoded2 = Player.encode(player);
      const encoded3 = Player.encode({ ...player });

      expect(encoded1).toEqual(encoded2);
      expect(encoded1).toEqual(encoded3);
    });

    it("should produce identical bytes for same GameState", () => {
      const state: GameState = {
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: "p2", name: "Bob", score: 50, isActive: false },
        ],
        currentPlayer: "p1",
        round: 5,
        metadata: new Map([
          ["mode", "classic"],
          ["map", "arena"],
        ]),
      };

      const encoded1 = GameState.encode(state);
      const encoded2 = GameState.encode(state);

      expect(encoded1).toEqual(encoded2);
    });

    it("should produce identical bytes for same union value", () => {
      const action: GameAction = {
        type: "AttackAction",
        val: { targetId: "enemy-1", damage: 50 },
      };

      const encoded1 = GameAction.encode(action);
      const encoded2 = GameAction.encode(action);

      expect(encoded1).toEqual(encoded2);
    });

    it("should produce identical diff bytes for same state transition", () => {
      const state1: GameState = {
        players: [{ id: "p1", name: "Alice", score: 100, isActive: true }],
        round: 1,
        metadata: new Map(),
      };

      const state2: GameState = {
        players: [{ id: "p1", name: "Alice", score: 150, isActive: true }],
        round: 2,
        metadata: new Map(),
      };

      const diff1 = GameState.encodeDiff(state1, state2);
      const diff2 = GameState.encodeDiff(state1, state2);

      expect(diff1).toEqual(diff2);
    });

    it("should maintain determinism across clone and encode", () => {
      const player: Player = {
        id: "p1",
        name: "Alice",
        score: 100,
        isActive: true,
      };

      const cloned = Player.clone(player);
      const encodedOriginal = Player.encode(player);
      const encodedClone = Player.encode(cloned);

      expect(encodedOriginal).toEqual(encodedClone);
    });
  });
}

export function runEncodingTests(GameState: DeltaPackApi<GameState>) {
  describe("Encoding Characteristics", () => {
    it("should demonstrate delta compression benefits", () => {
      const state1: GameState = {
        players: [
          { id: "p1", name: "Alice", score: 100, isActive: true },
          { id: "p2", name: "Bob", score: 50, isActive: true },
        ],
        currentPlayer: "p1",
        round: 1,
        metadata: new Map([["mode", "classic"]]),
      };

      const state2: GameState = {
        ...state1,
        round: 2,
      };

      const fullEncoded = GameState.encode(state2);
      const diffEncoded = GameState.encodeDiff(state1, state2);

      expect(diffEncoded.length).toBeLessThan(fullEncoded.length * 0.2);
    });

    it("should have reasonable encoding sizes for minimal state", () => {
      const minimalState: GameState = {
        players: [],
        round: 0,
        metadata: new Map(),
      };

      const encoded = GameState.encode(minimalState);

      expect(encoded.length).toBeLessThan(20);
    });
  });
}

/**
 * Run all shared API tests for a given set of type APIs.
 */
export function runAllSharedTests(apis: {
  Player: DeltaPackApi<any>;
  Position: DeltaPackApi<any>;
  Velocity: DeltaPackApi<any>;
  Entity: DeltaPackApi<any>;
  MoveAction: DeltaPackApi<any>;
  AttackAction: DeltaPackApi<any>;
  UseItemAction: DeltaPackApi<any>;
  GameAction: DeltaPackApi<any>;
  GameState: DeltaPackApi<any>;
  Inventory: DeltaPackApi<any>;
  PlayerRegistry: DeltaPackApi<any>;
}) {
  runPlayerTests(apis.Player);
  runRecursivePlayerTests(apis.Player);
  runPositionTests(apis.Position);
  runVelocityTests(apis.Position, apis.Velocity);
  runEntityTests(apis.Entity);
  runActionTests(apis.MoveAction, apis.AttackAction, apis.UseItemAction);
  runGameActionTests(apis.GameAction);
  runGameStateTests(apis.GameState);
  runDirtyTrackingTests(apis.Player, apis.GameState);
  runInventoryTests(apis.Inventory);
  runCloneTests(apis.Player, apis.GameState, apis.GameAction, apis.Inventory, apis.PlayerRegistry);
  runNestedValidationTests(apis.Entity, apis.GameState);
  runDeterminismTests(apis.Player, apis.GameState, apis.GameAction);
  runEncodingTests(apis.GameState);
}
