import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { codegenTypescript } from "@hpx7/delta-pack-cli/codegen";
import { schema } from "./schema.js";
import * as apis from "./generated-schema.js";
import { runAllSharedTests } from "./shared-api-tests.js";

describe("Delta Pack Codegen - Unified API", () => {
  describe("Code Generation", () => {
    it("should generate code matching generated-schema.ts", () => {
      const generatedCode = codegenTypescript(schema);
      const expectedCode = readFileSync(join(__dirname, "generated-schema.ts"), "utf-8");

      expect(generatedCode.trim()).toBe(expectedCode.trim());
    });
  });

  describe("Default Values (codegen-specific)", () => {
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

  // Run all shared tests
  runAllSharedTests(apis);
});
