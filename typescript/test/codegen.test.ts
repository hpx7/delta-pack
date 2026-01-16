import { describe, it, expect } from "vitest";
import * as apis from "./generated-schema.js";

describe("Delta Pack Codegen", () => {
  describe("Default Values", () => {
    it("should create default player", () => {
      const defaultPlayer = apis.Player.default();
      expect(defaultPlayer).toEqual({
        id: "",
        name: "",
        score: 0,
        isActive: false,
      });
    });

    it("should create default position", () => {
      const defaultPos = apis.Position.default();
      expect(defaultPos).toEqual({ x: 0.0, y: 0.0 });
    });

    it("should create default velocity", () => {
      const defaultVel = apis.Velocity.default();
      expect(defaultVel).toEqual({ vx: 0.0, vy: 0.0 });
    });

    it("should create default entity", () => {
      const defaultEntity = apis.Entity.default();
      expect(defaultEntity).toEqual({ id: "", position: { x: 0, y: 0 } });
    });

    it("should create default MoveAction", () => {
      const defaultMove = apis.MoveAction.default();
      expect(defaultMove).toEqual({ x: 0, y: 0 });
    });

    it("should create default AttackAction", () => {
      const defaultAttack = apis.AttackAction.default();
      expect(defaultAttack).toEqual({ targetId: "", damage: 0 });
    });

    it("should create default UseItemAction", () => {
      const defaultUseItem = apis.UseItemAction.default();
      expect(defaultUseItem).toEqual({ itemId: "" });
    });

    it("should create default GameAction", () => {
      const defaultAction = apis.GameAction.default();
      expect(defaultAction._type).toBe("MoveAction");
    });

    it("should create default game state", () => {
      const defaultState = apis.GameState.default();
      expect(defaultState).toEqual({
        players: [],
        round: 0,
        metadata: new Map(),
      });
    });
  });
});
