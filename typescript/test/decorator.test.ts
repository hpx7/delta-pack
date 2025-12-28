import "reflect-metadata";
import { describe, it, expect } from "vitest";
import {
  loadClass,
  buildSchema,
  load,
  ArrayType,
  RecordType,
  OptionalType,
  StringType,
  IntType,
  UIntType,
  FloatType,
  ReferenceType,
  UnionType,
  Infer,
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
      expect(generatedSchema["Player"]).toEqual(schema.Player);
    });
  });

  describe("Schema Structure - Containers", () => {
    it("should generate correct schema for arrays", () => {
      class WithArrays {
        @ArrayType(StringType())
        strings: string[] = [];

        @ArrayType(IntType())
        numbers: number[] = [];
      }

      const generatedSchema = buildSchema(WithArrays);
      expect(generatedSchema["WithArrays"]).toEqual({
        type: "object",
        properties: {
          strings: { type: "array", value: { type: "string" } },
          numbers: { type: "array", value: { type: "int" } },
        },
        name: "WithArrays",
      });
    });

    it("should generate correct schema for arrays with number modifiers", () => {
      class WithModifiedArrays {
        @ArrayType(UIntType())
        unsignedInts: number[] = [];

        @ArrayType(FloatType())
        floats: number[] = [];

        @ArrayType(FloatType({ precision: 0.1 }))
        quantizedFloats: number[] = [];
      }

      const generatedSchema = buildSchema(WithModifiedArrays);
      expect(generatedSchema["WithModifiedArrays"]).toEqual({
        type: "object",
        properties: {
          unsignedInts: { type: "array", value: { type: "int", min: 0 } },
          floats: { type: "array", value: { type: "float" } },
          quantizedFloats: { type: "array", value: { type: "float", precision: 0.1 } },
        },
        name: "WithModifiedArrays",
      });
    });

    it("should generate correct schema for maps with number modifiers", () => {
      class WithModifiedMaps {
        @RecordType(StringType(), UIntType())
        unsignedMap: Map<string, number> = new Map();

        @RecordType(StringType(), FloatType({ precision: 0.01 }))
        floatMap: Map<string, number> = new Map();
      }

      const generatedSchema = buildSchema(WithModifiedMaps);
      expect(generatedSchema["WithModifiedMaps"]).toEqual({
        type: "object",
        properties: {
          unsignedMap: { type: "record", key: { type: "string" }, value: { type: "int", min: 0 } },
          floatMap: { type: "record", key: { type: "string" }, value: { type: "float", precision: 0.01 } },
        },
        name: "WithModifiedMaps",
      });
    });

    it("should generate correct schema for optionals", () => {
      class WithOptionals {
        @OptionalType(StringType())
        optString?: string;

        @OptionalType(IntType())
        optNumber?: number;

        @OptionalType(UIntType())
        optUnsigned?: number;

        @OptionalType(FloatType({ precision: 0.1 }))
        optFloat?: number;
      }

      const generatedSchema = buildSchema(WithOptionals);
      expect(generatedSchema["WithOptionals"]).toEqual({
        type: "object",
        properties: {
          optString: { type: "optional", value: { type: "string" } },
          optNumber: { type: "optional", value: { type: "int" } },
          optUnsigned: { type: "optional", value: { type: "int", min: 0 } },
          optFloat: { type: "optional", value: { type: "float", precision: 0.1 } },
        },
        name: "WithOptionals",
      });
    });
  });

  describe("Schema Structure - Unions", () => {
    it("should generate correct schema for union arrays and maps", () => {
      class MoveCmd {
        @IntType()
        x: number = 0;
      }

      class FireCmd {
        @StringType()
        target: string = "";
      }

      const Command = UnionType("Command", [MoveCmd, FireCmd]);
      type Command = Infer<typeof Command>;

      class CommandQueue {
        @ArrayType(ReferenceType(Command))
        commands: Command[] = [];

        @RecordType(StringType(), ReferenceType(Command))
        commandsById: Map<string, Command> = new Map();
      }

      const generatedSchema = buildSchema(CommandQueue);
      expect(generatedSchema["CommandQueue"]).toEqual({
        type: "object",
        properties: {
          commands: {
            type: "array",
            value: { type: "reference", ref: generatedSchema["Command"] },
          },
          commandsById: {
            type: "record",
            key: { type: "string" },
            value: { type: "reference", ref: generatedSchema["Command"] },
          },
        },
        name: "CommandQueue",
      });
      // Verify union was generated
      expect(generatedSchema["Command"]).toEqual({
        type: "union",
        options: [generatedSchema["MoveCmd"], generatedSchema["FireCmd"]],
        name: "Command",
        numBits: 1,
      });

      // Verify variants are properly typed and instanceable
      const moveCmd = new MoveCmd();
      const fireCmd = new FireCmd();
      expect(moveCmd).toBeInstanceOf(MoveCmd);
      expect(fireCmd).toBeInstanceOf(FireCmd);
      expect(generatedSchema[MoveCmd.name]).toBeDefined();
      expect(generatedSchema[FireCmd.name]).toBeDefined();
    });
  });

  describe("Schema Structure - Nested Containers", () => {
    it("should generate correct schema for array of arrays (int[][])", () => {
      class Matrix {
        @ArrayType(ArrayType(IntType()))
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
        name: "Matrix",
      });
    });

    it("should generate correct schema for nested containers with modifiers", () => {
      class NestedWithModifiers {
        @ArrayType(ArrayType(FloatType({ precision: 0.01 })))
        floatMatrix: number[][] = [];

        @RecordType(StringType(), ArrayType(UIntType()))
        vectorMap: Map<string, number[]> = new Map();

        @OptionalType(ArrayType(IntType()))
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
            value: { type: "array", value: { type: "int", min: 0 } },
          },
          optionalArray: {
            type: "optional",
            value: { type: "array", value: { type: "int" } },
          },
        },
        name: "NestedWithModifiers",
      });
    });

    it("should generate correct schema for deeply nested containers (int[][][])", () => {
      class Cube {
        @ArrayType(ArrayType(ArrayType(IntType())))
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
        name: "Cube",
      });
    });
  });

  describe("Schema Structure - Complex Types from schema.ts", () => {
    it("should generate equivalent Inventory schema", () => {
      const generatedSchema = buildSchema(Inventory);
      expect(generatedSchema["Inventory"]).toEqual(schema.Inventory);
    });

    it("should generate equivalent Velocity schema", () => {
      const generatedSchema = buildSchema(Velocity);
      expect(generatedSchema["Velocity"]).toEqual(schema.Velocity);
    });

    it("should generate equivalent Entity schema", () => {
      const generatedSchema = buildSchema(Entity);
      expect(generatedSchema["Entity"]).toEqual(schema.Entity);
    });

    it("should generate equivalent GameState schema", () => {
      const generatedSchema = buildSchema(GameState);
      expect(generatedSchema["GameState"]).toEqual(schema.GameState);
    });
  });

  describe("Interpreter Wiring", () => {
    it("should produce identical encoding via loadClass and load", () => {
      // This test verifies that loadClass correctly wires to the interpreter
      const reflectionApi = loadClass(GameState);
      const schemaApi = load(schema.GameState);

      // Create equivalent state via both APIs
      const state = new GameState();
      state.round = 5;
      state.currentPlayer = "p1";
      state.winningColor = "BLUE";
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
    it("should throw for class without any property decorators", () => {
      class NoDecorators {
        value: number = 0;
      }

      expect(() => loadClass(NoDecorators)).toThrow(/must have at least one property decorator/);
    });

    it("should ignore properties without decorators", () => {
      class PartialDecorators {
        @IntType()
        decorated: number = 0;

        undecorated: number = 0;
        untrackedArray: string[] = [];
        untrackedMap: Map<string, number> = new Map();
      }

      const api = loadClass(PartialDecorators);
      const generatedSchema = buildSchema(PartialDecorators);

      // Only decorated property should be in schema
      expect(generatedSchema["PartialDecorators"]).toEqual({
        type: "object",
        properties: {
          decorated: { type: "int" },
        },
        name: "PartialDecorators",
      });

      // Undecorated properties are not serialized
      const obj = new PartialDecorators();
      obj.decorated = 42;
      obj.undecorated = 100;
      obj.untrackedArray = ["a", "b"];
      obj.untrackedMap.set("key", 999);

      const encoded = api.encode(obj);
      const decoded = api.decode(encoded);

      expect(decoded.decorated).toBe(42);
      expect(decoded.undecorated).toBeUndefined();
      expect(decoded.untrackedArray).toBeUndefined();
      expect(decoded.untrackedMap).toBeUndefined();
    });

    it("should return class instances from decode, decodeDiff, clone, and default", () => {
      class PlayerWithMethod {
        @StringType()
        name: string = "";

        @IntType()
        score: number = 0;

        greet() {
          return `Hi, I'm ${this.name}!`;
        }
      }

      const api = loadClass(PlayerWithMethod);

      const player1 = new PlayerWithMethod();
      player1.name = "Alice";
      player1.score = 100;

      const player2 = new PlayerWithMethod();
      player2.name = "Alice";
      player2.score = 150;

      // Test decode returns class instance
      const encoded = api.encode(player1);
      const decoded = api.decode(encoded);
      expect(decoded instanceof PlayerWithMethod).toBe(true);
      expect(decoded.greet()).toBe("Hi, I'm Alice!");

      // Test decodeDiff returns class instance
      const diff = api.encodeDiff(player1, player2);
      const diffDecoded = api.decodeDiff(player1, diff);
      expect(diffDecoded instanceof PlayerWithMethod).toBe(true);
      expect(diffDecoded.score).toBe(150);
      expect(diffDecoded.greet()).toBe("Hi, I'm Alice!");

      // Test clone returns class instance
      const cloned = api.clone(player1);
      expect(cloned instanceof PlayerWithMethod).toBe(true);
      expect(cloned.greet()).toBe("Hi, I'm Alice!");
    });

    it("should not corrupt auxiliary Set/Map properties during encodeDiff", () => {
      // This tests that wrapUnions only processes schema-defined properties,
      // not auxiliary properties like _dirty used for dirty tracking
      class StateWithDirtyTracking {
        @StringType()
        name: string = "";

        @IntType()
        value: number = 0;

        // Auxiliary property not part of schema
        _dirty?: Set<keyof StateWithDirtyTracking>;
      }

      const api = loadClass(StateWithDirtyTracking);

      const state1 = new StateWithDirtyTracking();
      state1.name = "test";
      state1.value = 100;
      state1._dirty = new Set(["value"]);

      const state2 = new StateWithDirtyTracking();
      state2.name = "test";
      state2.value = 200;
      state2._dirty = new Set(["value"]);

      // encodeDiff should work without corrupting the Set
      const diff = api.encodeDiff(state1, state2);
      expect(diff).toBeDefined();
      expect(diff.length).toBeGreaterThan(0);

      // Verify the original Sets are still valid
      expect(state1._dirty!.size).toBe(1);
      expect(state2._dirty!.size).toBe(1);
      expect(state1._dirty!.has("value")).toBe(true);

      // Decode the diff
      const decoded = api.decodeDiff(state1, diff);
      expect(decoded.value).toBe(200);
    });
  });

  describe("Coverage - Obscure Decorator Combinations", () => {
    it("should generate correct schema for CoverageTestSchema", () => {
      const generatedSchema = buildSchema(CoverageTestSchema);

      expect(generatedSchema["CoverageTestSchema"]).toEqual({
        type: "object",
        properties: {
          directEnum: { type: "reference", ref: generatedSchema["Color"] },
          nestedOptional: { type: "optional", value: { type: "optional", value: { type: "string" } } },
          boolMatrix: { type: "array", value: { type: "array", value: { type: "boolean" } } },
          stringMatrix: { type: "array", value: { type: "array", value: { type: "string" } } },
          intMatrix: { type: "array", value: { type: "array", value: { type: "int" } } },
          action: { type: "optional", value: { type: "reference", ref: generatedSchema["GameAction"] } },
        },
        name: "CoverageTestSchema",
      });

      // Verify enum was generated
      expect(generatedSchema["Color"]).toEqual({
        type: "enum",
        options: ["RED", "BLUE", "GREEN", "YELLOW"],
        name: "Color",
        numBits: 2,
      });
    });

    it("should support all API methods with union types", () => {
      const api = loadClass(CoverageTestSchema);

      // Create instance with union value
      const obj1 = new CoverageTestSchema();
      obj1.directEnum = "BLUE";
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
      // Union values are hydrated to class instances
      expect(decoded.action).toBeInstanceOf(AttackAction);
      const decodedAttack = decoded.action as AttackAction;
      expect(decodedAttack.targetId).toBe("enemy1");
      expect(decodedAttack.damage).toBe(50);

      // Test encodeDiff/decodeDiff
      const obj2 = new CoverageTestSchema();
      obj2.directEnum = "GREEN";
      const move = new MoveAction();
      move.x = 10;
      move.y = 20;
      obj2.action = move;

      const diff = api.encodeDiff(obj1, obj2);
      const applied = api.decodeDiff(decoded, diff);

      expect(applied.directEnum).toBe("GREEN");
      expect(applied.action).toBeInstanceOf(MoveAction);
      const appliedMove = applied.action as MoveAction;
      expect(appliedMove.x).toBe(10);
      expect(appliedMove.y).toBe(20);

      // Test equals
      const obj3 = new CoverageTestSchema();
      obj3.directEnum = "BLUE";
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

      // Pass already-wrapped union format (for backwards compatibility)
      const obj = {
        directEnum: "RED" as Color,
        boolMatrix: [] as boolean[][],
        stringMatrix: [] as string[][],
        intMatrix: [] as number[][],
        action: { type: "MoveAction", val: { x: 5, y: 10 } },
      };

      const encoded = api.encode(obj as unknown as CoverageTestSchema);
      const decoded = api.decode(encoded);

      // Decoded union is hydrated to class instance
      expect(decoded.action).toBeInstanceOf(MoveAction);
      const action = decoded.action as MoveAction;
      expect(action.x).toBe(5);
      expect(action.y).toBe(10);
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
