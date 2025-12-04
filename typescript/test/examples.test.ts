import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parseSchemaYml, load } from "@hpx7/delta-pack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const examplesDir = join(__dirname, "../../examples");

describe("Examples - Primitives", () => {
  const schemaPath = join(examplesDir, "primitives/schema.yml");
  const schemaYml = readFileSync(schemaPath, "utf8");
  const schema = parseSchemaYml(schemaYml);

  const state1Path = join(examplesDir, "primitives/state1.json");
  const state2Path = join(examplesDir, "primitives/state2.json");

  const state1Data = JSON.parse(readFileSync(state1Path, "utf8"));
  const state2Data = JSON.parse(readFileSync(state2Path, "utf8"));

  type ExampleObject = {
    stringField: string;
    signedIntField: number;
    unsignedIntField: number;
    floatField: number;
    booleanField: boolean;
  };

  const ExampleObject = load<ExampleObject>(schema, "ExampleObject");

  it("should parse schema successfully", () => {
    expect(schema.ExampleObject).toBeDefined();
    expect(schema.ExampleObject.type).toBe("object");
  });

  it("should parse state1 JSON data", () => {
    expect(() => ExampleObject.fromJson(state1Data)).not.toThrow();
    const parsed = ExampleObject.fromJson(state1Data);
    expect(parsed.stringField).toBe("example string");
    expect(parsed.signedIntField).toBe(-42);
    expect(parsed.unsignedIntField).toBe(42);
    expect(parsed.floatField).toBeCloseTo(3.14);
    expect(parsed.booleanField).toBe(true);
  });

  it("should parse state2 JSON data", () => {
    expect(() => ExampleObject.fromJson(state2Data)).not.toThrow();
    const parsed = ExampleObject.fromJson(state2Data);
    expect(parsed.stringField).toBe("updated string");
    expect(parsed.signedIntField).toBe(-43);
    expect(parsed.unsignedIntField).toBe(43);
    expect(parsed.booleanField).toBe(false);
  });

  it("should encode and decode state1", () => {
    const state1 = ExampleObject.fromJson(state1Data);
    const encoded = ExampleObject.encode(state1);
    const decoded = ExampleObject.decode(encoded);
    expect(ExampleObject.equals(decoded, state1)).toBe(true);
  });

  it("should encode and decode state2", () => {
    const state2 = ExampleObject.fromJson(state2Data);
    const encoded = ExampleObject.encode(state2);
    const decoded = ExampleObject.decode(encoded);
    expect(ExampleObject.equals(decoded, state2)).toBe(true);
  });

  it("should encode and decode diff from state1 to state2", () => {
    const state1 = ExampleObject.fromJson(state1Data);
    const state2 = ExampleObject.fromJson(state2Data);

    const diff = ExampleObject.encodeDiff(state1, state2);
    const decoded = ExampleObject.decodeDiff(state1, diff);

    expect(ExampleObject.equals(decoded, state2)).toBe(true);
  });
});

describe("Examples - User", () => {
  const schemaPath = join(examplesDir, "user/schema.yml");
  const schemaYml = readFileSync(schemaPath, "utf8");
  const schema = parseSchemaYml(schemaYml);

  const state1Path = join(examplesDir, "user/state1.json");
  const state2Path = join(examplesDir, "user/state2.json");

  const state1Data = JSON.parse(readFileSync(state1Path, "utf8"));
  const state2Data = JSON.parse(readFileSync(state2Path, "utf8"));

  type User = any; // Type would be complex to define manually

  const User = load<User>(schema, "User");

  it("should parse schema successfully", () => {
    expect(schema.User).toBeDefined();
    expect(schema.User.type).toBe("object");
    expect(schema.HairColor).toBeDefined();
    expect(schema.HairColor.type).toBe("enum");
    expect(schema.Contact).toBeDefined();
    expect(schema.Contact.type).toBe("union");
  });

  it("should parse state1 JSON data", () => {
    expect(() => User.fromJson(state1Data)).not.toThrow();
    const parsed = User.fromJson(state1Data);
    expect(parsed.id).toBe("user_12345");
    expect(parsed.name).toBe("John Doe");
    expect(parsed.age).toBe(30);
    expect(parsed.hairColor).toBe("BROWN");
    expect(parsed.children).toHaveLength(2);
  });

  it("should parse state2 JSON data", () => {
    expect(() => User.fromJson(state2Data)).not.toThrow();
    const parsed = User.fromJson(state2Data);
    expect(parsed.name).toBe("John Doe");
    expect(parsed.age).toBe(31);
    expect(parsed.children).toHaveLength(3);
    expect(parsed.preferredContact.type).toBe("PhoneContact");
  });

  it("should encode and decode state1", () => {
    const state1 = User.fromJson(state1Data);
    const encoded = User.encode(state1);
    const decoded = User.decode(encoded);
    expect(User.equals(decoded, state1)).toBe(true);
  });

  it("should encode and decode state2", () => {
    const state2 = User.fromJson(state2Data);
    const encoded = User.encode(state2);
    const decoded = User.decode(encoded);
    expect(User.equals(decoded, state2)).toBe(true);
  });

  it("should encode and decode diff from state1 to state2", () => {
    const state1 = User.fromJson(state1Data);
    const state2 = User.fromJson(state2Data);

    const diff = User.encodeDiff(state1, state2);
    const decoded = User.decodeDiff(state1, diff);

    expect(User.equals(decoded, state2)).toBe(true);
  });
});

describe("Examples - Game", () => {
  const schemaPath = join(examplesDir, "game/schema.yml");
  const schemaYml = readFileSync(schemaPath, "utf8");
  const schema = parseSchemaYml(schemaYml);

  const statePaths = [
    join(examplesDir, "game/state1.json"),
    join(examplesDir, "game/state2.json"),
    join(examplesDir, "game/state3.json"),
    join(examplesDir, "game/state4.json"),
    join(examplesDir, "game/state5.json"),
    join(examplesDir, "game/state6.json"),
  ];

  const statesData = statePaths.map((path) => JSON.parse(readFileSync(path, "utf8")));

  type GameState = any; // Type would be very complex to define manually

  const GameState = load<GameState>(schema, "GameState");

  it("should parse schema successfully", () => {
    expect(schema.GameState).toBeDefined();
    expect(schema.GameState.type).toBe("object");
    expect(schema.Player).toBeDefined();
    expect(schema.Team).toBeDefined();
    expect(schema.Team.type).toBe("enum");
  });

  it("should parse state1 JSON data (lobby with 2 players)", () => {
    expect(() => GameState.fromJson(statesData[0])).not.toThrow();
    const parsed = GameState.fromJson(statesData[0]);
    expect(parsed.gameId).toBe("match-12345");
    expect(parsed.phase).toBe("LOBBY");
    expect(parsed.players.size).toBe(2);
  });

  it("should parse state2 JSON data (game starting with 4 players)", () => {
    expect(() => GameState.fromJson(statesData[1])).not.toThrow();
    const parsed = GameState.fromJson(statesData[1]);
    expect(parsed.phase).toBe("STARTING");
    expect(parsed.players.size).toBe(4);
  });

  it("should parse state3 JSON data (game active with enemies and projectiles)", () => {
    expect(() => GameState.fromJson(statesData[2])).not.toThrow();
    const parsed = GameState.fromJson(statesData[2]);
    expect(parsed.phase).toBe("ACTIVE");
    expect(parsed.enemies.size).toBe(1);
    expect(parsed.projectiles.size).toBe(1);
  });

  it("should parse state4 JSON data (combat with effects)", () => {
    expect(() => GameState.fromJson(statesData[3])).not.toThrow();
    const parsed = GameState.fromJson(statesData[3]);
    const player1 = parsed.players.get("player1");
    expect(player1.stats.health).toBe(75);
    expect(player1.activeEffects).toHaveLength(1);
    expect(player1.abilityCooldowns).toHaveLength(1);
  });

  it("should parse state5 JSON data (mid-game with 8 players)", () => {
    expect(() => GameState.fromJson(statesData[4])).not.toThrow();
    const parsed = GameState.fromJson(statesData[4]);
    expect(parsed.players.size).toBe(8);
    expect(parsed.enemies.size).toBe(3);
    expect(parsed.droppedLoot.size).toBe(1);
    expect(parsed.worldObjects.size).toBe(2);
  });

  it("should parse state6 JSON data (minimal position updates)", () => {
    expect(() => GameState.fromJson(statesData[5])).not.toThrow();
    const parsed = GameState.fromJson(statesData[5]);
    expect(parsed.tickNumber).toBe(601);
  });

  it("should encode and decode state1", () => {
    const state1 = GameState.fromJson(statesData[0]);
    const encoded = GameState.encode(state1);
    const decoded = GameState.decode(encoded);
    expect(GameState.equals(decoded, state1)).toBe(true);
  });

  it("should encode and decode state3 (with enemies and projectiles)", () => {
    const state3 = GameState.fromJson(statesData[2]);
    const encoded = GameState.encode(state3);
    const decoded = GameState.decode(encoded);
    expect(GameState.equals(decoded, state3)).toBe(true);
  });

  it("should encode and decode state5 (mid-game)", () => {
    const state5 = GameState.fromJson(statesData[4]);
    const encoded = GameState.encode(state5);
    const decoded = GameState.decode(encoded);
    expect(GameState.equals(decoded, state5)).toBe(true);
  });

  it("should encode and decode diff from state1 to state2", () => {
    const state1 = GameState.fromJson(statesData[0]);
    const state2 = GameState.fromJson(statesData[1]);

    const diff = GameState.encodeDiff(state1, state2);
    const decoded = GameState.decodeDiff(state1, diff);

    expect(GameState.equals(decoded, state2)).toBe(true);
  });

  it("should encode and decode diff from state2 to state3", () => {
    const state2 = GameState.fromJson(statesData[1]);
    const state3 = GameState.fromJson(statesData[2]);

    const diff = GameState.encodeDiff(state2, state3);
    const decoded = GameState.decodeDiff(state2, diff);

    expect(GameState.equals(decoded, state3)).toBe(true);
  });

  it("should encode and decode diff from state3 to state4", () => {
    const state3 = GameState.fromJson(statesData[2]);
    const state4 = GameState.fromJson(statesData[3]);

    const diff = GameState.encodeDiff(state3, state4);
    const decoded = GameState.decodeDiff(state3, diff);

    expect(GameState.equals(decoded, state4)).toBe(true);
  });

  it("should encode and decode diff from state4 to state5", () => {
    const state4 = GameState.fromJson(statesData[3]);
    const state5 = GameState.fromJson(statesData[4]);

    const diff = GameState.encodeDiff(state4, state5);
    const decoded = GameState.decodeDiff(state4, diff);

    expect(GameState.equals(decoded, state5)).toBe(true);
  });

  it("should encode and decode diff from state5 to state6 (minimal changes)", () => {
    const state5 = GameState.fromJson(statesData[4]);
    const state6 = GameState.fromJson(statesData[5]);

    const diff = GameState.encodeDiff(state5, state6);
    const decoded = GameState.decodeDiff(state5, diff);

    // Verify key fields that changed
    expect(decoded.tickNumber).toBe(state6.tickNumber);
    expect(decoded.serverTime).toBeCloseTo(state6.serverTime, 3);
    expect(decoded.timeRemaining).toBeCloseTo(state6.timeRemaining, 3);
    expect(decoded.players.size).toBe(state6.players.size);

    // Verify that position updates were applied
    const player1 = decoded.players.get("player1");
    expect(player1.position.x).toBeCloseTo(106.0, 1);
    expect(player1.position.y).toBeCloseTo(102.6, 1);
  });

  it("should demonstrate delta compression efficiency", () => {
    const state5 = GameState.fromJson(statesData[4]);
    const state6 = GameState.fromJson(statesData[5]);

    const fullEncode = GameState.encode(state6);
    const diff = GameState.encodeDiff(state5, state6);

    // state6 is mostly the same as state5 (only position updates)
    // so the diff should be significantly smaller
    expect(diff.length).toBeLessThan(fullEncode.length);

    // For this specific case (8 players, minimal position changes)
    // the diff should be much smaller (typically < 10% of full size)
    const compressionRatio = diff.length / fullEncode.length;
    expect(compressionRatio).toBeLessThan(0.1);
  });
});
