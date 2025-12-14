import "reflect-metadata";
import { describe, it, expect } from "vitest";
import {
  loadClass,
  buildSchema,
  load,
  DeltaPackArrayOf,
  DeltaPackMapOf,
  DeltaPackOptionalOf,
  DeltaPackString,
  DeltaPackInt,
  type Infer,
} from "@hpx7/delta-pack";
import { schema } from "./schema.js";
import {
  Color,
  Player,
  Velocity,
  Entity,
  AttackAction,
  MoveAction,
  GameState,
  Inventory,
  CoverageTestSchema,
} from "./reflection-schema.js";

/**
 * These tests verify that the reflection API correctly generates schemas
 * from decorated classes. Since reflection uses the interpreter internally,
 * we focus on schema generation correctness rather than encoding behavior
 * (which is tested in interpreter.test.ts).
 */
describe("Delta Pack Reflection", () => {
  describe("Schema Structure - Nested Objects", () => {
    it("should generate correct schema for self-referencing type", () => {
      const generatedSchema = buildSchema(Player);
      expect(generatedSchema["Player"]).toEqual(schema["Player"]);
    });
  });

  describe("Schema Structure - Containers", () => {
    it("should generate correct schema for arrays", () => {
      class WithArrays {
        @DeltaPackArrayOf(String)
        strings: string[] = [];

        @DeltaPackArrayOf(Number)
        numbers: number[] = [];
      }

      const generatedSchema = buildSchema(WithArrays);
      expect(generatedSchema["WithArrays"]).toEqual({
        type: "object",
        properties: {
          strings: { type: "array", value: { type: "string" } },
          numbers: { type: "array", value: { type: "int" } },
        },
      });
    });

    it("should generate correct schema for arrays with number modifiers", () => {
      class WithModifiedArrays {
        @DeltaPackArrayOf(Number, { unsigned: true })
        unsignedInts: number[] = [];

        @DeltaPackArrayOf(Number, { float: true })
        floats: number[] = [];

        @DeltaPackArrayOf(Number, { float: 0.1 })
        quantizedFloats: number[] = [];
      }

      const generatedSchema = buildSchema(WithModifiedArrays);
      expect(generatedSchema["WithModifiedArrays"]).toEqual({
        type: "object",
        properties: {
          unsignedInts: { type: "array", value: { type: "uint" } },
          floats: { type: "array", value: { type: "float" } },
          quantizedFloats: { type: "array", value: { type: "float", precision: 0.1 } },
        },
      });
    });

    it("should generate correct schema for maps with number modifiers", () => {
      class WithModifiedMaps {
        @DeltaPackMapOf(Number, { unsigned: true })
        unsignedMap: Map<string, number> = new Map();

        @DeltaPackMapOf(Number, { float: 0.01 })
        floatMap: Map<string, number> = new Map();
      }

      const generatedSchema = buildSchema(WithModifiedMaps);
      expect(generatedSchema["WithModifiedMaps"]).toEqual({
        type: "object",
        properties: {
          unsignedMap: { type: "record", key: { type: "string" }, value: { type: "uint" } },
          floatMap: { type: "record", key: { type: "string" }, value: { type: "float", precision: 0.01 } },
        },
      });
    });

    it("should generate correct schema for optionals", () => {
      class WithOptionals {
        @DeltaPackOptionalOf(String)
        optString?: string;

        @DeltaPackOptionalOf(Number)
        optNumber?: number;

        @DeltaPackOptionalOf(Number, { unsigned: true })
        optUnsigned?: number;

        @DeltaPackOptionalOf(Number, { float: 0.1 })
        optFloat?: number;
      }

      const generatedSchema = buildSchema(WithOptionals);
      expect(generatedSchema["WithOptionals"]).toEqual({
        type: "object",
        properties: {
          optString: { type: "optional", value: { type: "string" } },
          optNumber: { type: "optional", value: { type: "int" } },
          optUnsigned: { type: "optional", value: { type: "uint" } },
          optFloat: { type: "optional", value: { type: "float", precision: 0.1 } },
        },
      });
    });
  });

  describe("Schema Structure - Unions", () => {
    it("should generate correct schema for union arrays and maps", () => {
      class MoveCmd {
        @DeltaPackInt()
        x: number = 0;
      }

      class FireCmd {
        @DeltaPackString()
        target: string = "";
      }

      class CommandQueue {
        @DeltaPackArrayOf([MoveCmd, FireCmd])
        commands: (MoveCmd | FireCmd)[] = [];

        @DeltaPackMapOf([MoveCmd, FireCmd])
        commandsById: Map<string, MoveCmd | FireCmd> = new Map();
      }

      const generatedSchema = buildSchema(CommandQueue);
      expect(generatedSchema["CommandQueue"]).toEqual({
        type: "object",
        properties: {
          commands: {
            type: "array",
            value: { type: "reference", reference: "MoveCmdOrFireCmd" },
          },
          commandsById: {
            type: "record",
            key: { type: "string" },
            value: { type: "reference", reference: "MoveCmdOrFireCmd" },
          },
        },
      });
    });
  });

  describe("Schema Structure - Nested Containers", () => {
    it("should generate correct schema for array of arrays (int[][])", () => {
      class Matrix {
        @DeltaPackArrayOf(DeltaPackArrayOf(Number))
        data: number[][] = [];
      }

      const generatedSchema = buildSchema(Matrix);
      expect(generatedSchema["Matrix"]).toEqual({
        type: "object",
        properties: {
          data: {
            type: "array",
            value: { type: "array", value: { type: "int" } },
          },
        },
      });
    });

    it("should generate correct schema for nested containers with modifiers", () => {
      class NestedWithModifiers {
        @DeltaPackArrayOf(DeltaPackArrayOf(Number, { float: 0.01 }))
        floatMatrix: number[][] = [];

        @DeltaPackMapOf(DeltaPackArrayOf(Number, { unsigned: true }))
        vectorMap: Map<string, number[]> = new Map();

        @DeltaPackOptionalOf(DeltaPackArrayOf(Number))
        optionalArray?: number[];
      }

      const generatedSchema = buildSchema(NestedWithModifiers);
      expect(generatedSchema["NestedWithModifiers"]).toEqual({
        type: "object",
        properties: {
          floatMatrix: {
            type: "array",
            value: { type: "array", value: { type: "float", precision: 0.01 } },
          },
          vectorMap: {
            type: "record",
            key: { type: "string" },
            value: { type: "array", value: { type: "uint" } },
          },
          optionalArray: {
            type: "optional",
            value: { type: "array", value: { type: "int" } },
          },
        },
      });
    });

    it("should generate correct schema for deeply nested containers (int[][][])", () => {
      class Cube {
        @DeltaPackArrayOf(DeltaPackArrayOf(DeltaPackArrayOf(Number)))
        data: number[][][] = [];
      }

      const generatedSchema = buildSchema(Cube);
      expect(generatedSchema["Cube"]).toEqual({
        type: "object",
        properties: {
          data: {
            type: "array",
            value: {
              type: "array",
              value: { type: "array", value: { type: "int" } },
            },
          },
        },
      });
    });
  });

  describe("Schema Structure - Complex Types from schema.ts", () => {
    it("should generate equivalent Inventory schema", () => {
      const generatedSchema = buildSchema(Inventory);
      expect(generatedSchema["Inventory"]).toEqual(schema["Inventory"]);
    });

    it("should generate equivalent Velocity schema", () => {
      const generatedSchema = buildSchema(Velocity);
      expect(generatedSchema["Velocity"]).toEqual(schema["Velocity"]);
    });

    it("should generate equivalent Entity schema", () => {
      const generatedSchema = buildSchema(Entity);
      expect(generatedSchema["Entity"]).toEqual(schema["Entity"]);
    });

    it("should generate equivalent GameState schema", () => {
      const generatedSchema = buildSchema(GameState);
      expect(generatedSchema["GameState"]).toEqual(schema["GameState"]);
    });
  });

  describe("Interpreter Wiring", () => {
    it("should produce identical encoding via loadClass and load", () => {
      // This test verifies that loadClass correctly wires to the interpreter
      const reflectionApi = loadClass(GameState);
      type SchemaGameState = Infer<typeof schema.GameState, typeof schema>;
      const schemaApi = load<SchemaGameState>(schema, "GameState");

      // Create equivalent state via both APIs
      const state = new GameState();
      state.round = 5;
      state.currentPlayer = "p1";
      state.winningColor = Color.BLUE;
      state.metadata.set("mode", "ranked");

      const player = new Player();
      player.id = "p1";
      player.name = "Alice";
      player.score = 100;
      player.isActive = true;
      state.players.push(player);

      const attack = new AttackAction();
      attack.targetId = "p2";
      attack.damage = 25;
      state.lastAction = attack;

      // Encode via reflection
      const reflectionEncoded = reflectionApi.encode(state);

      // Encode equivalent plain object via interpreter
      const schemaEncoded = schemaApi.encode({
        players: [{ id: "p1", name: "Alice", score: 100, isActive: true }],
        currentPlayer: "p1",
        round: 5,
        metadata: new Map([["mode", "ranked"]]),
        winningColor: "BLUE",
        lastAction: { type: "AttackAction", val: { targetId: "p2", damage: 25 } },
      });

      expect(reflectionEncoded).toEqual(schemaEncoded);
    });

    it("should allow class instances in fromJson", () => {
      // The interpreter now accepts class instances (not just plain objects)
      const reflectionApi = loadClass(Player);

      const player = new Player();
      player.id = "p1";
      player.name = "Alice";
      player.score = 100;
      player.isActive = true;

      // fromJson should accept class instances
      const validated = reflectionApi.fromJson(player);
      expect(validated.id).toBe("p1");
      expect(validated.name).toBe("Alice");
      expect(validated.score).toBe(100);
      expect(validated.isActive).toBe(true);
    });

    it("should support full encode/decode cycle with class instances", () => {
      const api = loadClass(Player);

      const player = new Player();
      player.id = "p1";
      player.name = "Alice";
      player.score = 100;
      player.isActive = true;

      const encoded = api.encode(player);
      const decoded = api.decode(encoded);

      expect(api.equals(player, decoded)).toBe(true);
    });
  });

  describe("Error Cases", () => {
    it("should throw for class without property decorators", () => {
      class NoDecorators {
        value: number = 0;
      }

      expect(() => loadClass(NoDecorators)).toThrow(/Cannot determine type/);
    });

    it("should throw for property without type decorator", () => {
      class PartialDecorators {
        @DeltaPackInt()
        decorated: number = 0;

        undecorated: number = 0;
      }

      expect(() => loadClass(PartialDecorators)).toThrow(/Cannot determine type/);
    });

    it("should throw for array property without @DeltaPackArrayOf decorator", () => {
      class BadArray {
        @DeltaPackString()
        name: string = "";

        items: string[] = [];
      }

      expect(() => loadClass(BadArray)).toThrow(/Cannot determine type/);
    });

    it("should throw for map property without @DeltaPackMapOf decorator", () => {
      class BadMap {
        @DeltaPackString()
        name: string = "";

        data: Map<string, number> = new Map();
      }

      expect(() => loadClass(BadMap)).toThrow(/Cannot determine type/);
    });
  });

  describe("Coverage - Obscure Decorator Combinations", () => {
    it("should generate correct schema for CoverageTestSchema", () => {
      const generatedSchema = buildSchema(CoverageTestSchema);

      expect(generatedSchema["CoverageTestSchema"]).toEqual({
        type: "object",
        properties: {
          directEnum: { type: "reference", reference: "Color" },
          nestedOptional: { type: "optional", value: { type: "optional", value: { type: "string" } } },
          boolMatrix: { type: "array", value: { type: "array", value: { type: "boolean" } } },
          stringMatrix: { type: "array", value: { type: "array", value: { type: "string" } } },
          intMatrix: { type: "array", value: { type: "array", value: { type: "int" } } },
          action: { type: "optional", value: { type: "reference", reference: "GameAction" } },
        },
      });

      // Verify enum was generated
      expect(generatedSchema["Color"]).toEqual({
        type: "enum",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
      });
    });

    it("should support all API methods with union types", () => {
      const api = loadClass(CoverageTestSchema);

      // Create instance with union value
      const obj1 = new CoverageTestSchema();
      obj1.directEnum = Color.BLUE;
      obj1.boolMatrix = [
        [true, false],
        [false, true],
      ];
      obj1.stringMatrix = [["a", "b"]];
      obj1.intMatrix = [
        [1, 2],
        [3, 4],
      ];
      const attack = new AttackAction();
      attack.targetId = "enemy1";
      attack.damage = 50;
      obj1.action = attack;

      // Test encode/decode
      const encoded = api.encode(obj1);
      const decoded = api.decode(encoded);

      expect(decoded.directEnum).toBe("BLUE");
      expect(decoded.boolMatrix).toEqual([
        [true, false],
        [false, true],
      ]);
      expect(decoded.action).toEqual({ type: "AttackAction", val: { targetId: "enemy1", damage: 50 } });

      // Test encodeDiff/decodeDiff
      const obj2 = new CoverageTestSchema();
      obj2.directEnum = Color.GREEN;
      const move = new MoveAction();
      move.x = 10;
      move.y = 20;
      obj2.action = move;

      const diff = api.encodeDiff(obj1, obj2);
      const applied = api.decodeDiff(decoded, diff);

      expect(applied.directEnum).toBe("GREEN");
      expect(applied.action).toEqual({ type: "MoveAction", val: { x: 10, y: 20 } });

      // Test equals
      const obj3 = new CoverageTestSchema();
      obj3.directEnum = Color.BLUE;
      obj3.boolMatrix = [
        [true, false],
        [false, true],
      ];
      obj3.stringMatrix = [["a", "b"]];
      obj3.intMatrix = [
        [1, 2],
        [3, 4],
      ];
      const attack2 = new AttackAction();
      attack2.targetId = "enemy1";
      attack2.damage = 50;
      obj3.action = attack2;

      expect(api.equals(obj1, obj3)).toBe(true);
      expect(api.equals(obj1, obj2)).toBe(false);

      // Test clone
      const cloned = api.clone(obj1);
      expect(api.equals(obj1, cloned)).toBe(true);

      // Test toJson (uses { TypeName: value } format, not { type, val })
      const json = api.toJson(obj1);
      expect(json["action"]).toEqual({ AttackAction: { targetId: "enemy1", damage: 50 } });

      // Test fromJson
      const validated = api.fromJson(obj1);
      expect(validated.directEnum).toBe("BLUE");
    });

    it("should handle pre-wrapped { type, val } union objects", () => {
      const api = loadClass(CoverageTestSchema);

      // Pass already-wrapped union format
      const obj = {
        directEnum: "RED" as Color,
        boolMatrix: [] as boolean[][],
        stringMatrix: [] as string[][],
        intMatrix: [] as number[][],
        action: { type: "MoveAction", val: { x: 5, y: 10 } },
      };

      const encoded = api.encode(obj as unknown as CoverageTestSchema);
      const decoded = api.decode(encoded);

      expect(decoded.action).toEqual({ type: "MoveAction", val: { x: 5, y: 10 } });
    });

    it("should handle nested optional values", () => {
      const api = loadClass(CoverageTestSchema);

      // With nested optional set
      const obj1 = new CoverageTestSchema();
      obj1.nestedOptional = "hello";

      const encoded1 = api.encode(obj1);
      const decoded1 = api.decode(encoded1);
      expect(decoded1.nestedOptional).toBe("hello");

      // With nested optional unset
      const obj2 = new CoverageTestSchema();

      const encoded2 = api.encode(obj2);
      const decoded2 = api.decode(encoded2);
      expect(decoded2.nestedOptional).toBeUndefined();
    });
  });
});
