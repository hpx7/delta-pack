import { describe, it, expect } from "vitest";
import { Infer, track, clearTracking, load, loadClass } from "@hpx7/delta-pack";
import { schema } from "./schema.js";
import { Position, Player } from "./reflection-schema.js";

describe("Dirty Tracking", () => {
  describe("track() - Object tracking", () => {
    it("should automatically track property changes", () => {
      const obj = track({ x: 0, y: 0, name: "test" });

      obj.x = 100;
      obj.y = 200;

      expect(obj._dirty!.has("x")).toBe(true);
      expect(obj._dirty!.has("y")).toBe(true);
      expect(obj._dirty!.has("name")).toBe(false);
      expect(obj._dirty!.size).toBe(2);
    });

    it("should not mark dirty if value is unchanged", () => {
      const obj = track({ x: 100, y: 200 });

      obj.x = 100; // Same value

      expect(obj._dirty!.has("x")).toBe(false);
      expect(obj._dirty!.size).toBe(0);
    });

    it("should preserve original values", () => {
      const obj = track({ x: 0, y: 0 });

      obj.x = 100;

      expect(obj.x).toBe(100);
      expect(obj.y).toBe(0);
    });

    it("should allow clearing dirty set", () => {
      const obj = track({ x: 0, y: 0 });
      obj.x = 100;

      clearTracking(obj);

      expect(obj._dirty!.size).toBe(0);
    });

    it("should track mutations via for...in loop", () => {
      const state = track({
        a: { value: 1 },
        b: { value: 2 },
      });

      for (const key in state) {
        if (key !== "_dirty") {
          (state as unknown as Record<string, { value: number }>)[key]!.value = 99;
        }
      }

      expect(state.a._dirty!.has("value")).toBe(true);
      expect(state.b._dirty!.has("value")).toBe(true);
      expect(state._dirty!.has("a")).toBe(true);
      expect(state._dirty!.has("b")).toBe(true);
    });

    it("should track mutations via Object.values()", () => {
      const state = track({
        a: { value: 1 },
        b: { value: 2 },
      });

      for (const item of Object.values(state)) {
        if (typeof item === "object" && item !== null && "value" in item) {
          (item as { value: number }).value = 99;
        }
      }

      expect(state.a._dirty!.has("value")).toBe(true);
      expect(state.b._dirty!.has("value")).toBe(true);
    });

    it("should track mutations via Object.entries()", () => {
      const state = track({
        a: { value: 1 },
        b: { value: 2 },
      });

      for (const [key, item] of Object.entries(state)) {
        if (key !== "_dirty" && typeof item === "object" && item !== null && "value" in item) {
          (item as { value: number }).value = 99;
        }
      }

      expect(state.a._dirty!.has("value")).toBe(true);
      expect(state.b._dirty!.has("value")).toBe(true);
    });

    it("should track mutations via destructuring", () => {
      const state = track({
        player: { x: 0, y: 0 },
        enemy: { x: 10, y: 10 },
      });

      const { player, enemy } = state;
      player.x = 100;
      enemy.y = 200;

      expect(state.player._dirty!.has("x")).toBe(true);
      expect(state.enemy._dirty!.has("y")).toBe(true);
      expect(state._dirty!.has("player")).toBe(true);
      expect(state._dirty!.has("enemy")).toBe(true);
    });

    it("should track replaced nested object and its mutations", () => {
      const state = track({
        player: { x: 0, y: 0 },
      });

      // Replace the entire nested object
      state.player = { x: 100, y: 100 };

      expect(state._dirty!.has("player")).toBe(true);

      // Clear and verify the new object is tracked
      clearTracking(state);

      state.player.x = 200;

      expect(state.player._dirty!.has("x")).toBe(true);
      expect(state._dirty!.has("player")).toBe(true);
    });

    it("should track replaced nested array and its mutations", () => {
      const state = track({
        items: [{ value: 1 }],
      });

      // Replace the entire array
      state.items = [{ value: 10 }, { value: 20 }];

      expect(state._dirty!.has("items")).toBe(true);

      // Clear and verify the new array is tracked
      clearTracking(state);

      state.items[0]!.value = 99;

      expect(state.items[0]!._dirty!.has("value")).toBe(true);
      expect(state.items._dirty!.has(0)).toBe(true);
      expect(state._dirty!.has("items")).toBe(true);
    });

    it("should track replaced nested map and its mutations", () => {
      const state = track({
        players: new Map([["p1", { x: 0 }]]),
      });

      // Replace the entire map
      state.players = new Map([["p2", { x: 100 }]]);

      expect(state._dirty!.has("players")).toBe(true);

      // Clear and verify the new map is tracked
      clearTracking(state);

      state.players.get("p2")!.x = 200;

      expect(state.players.get("p2")!._dirty!.has("x")).toBe(true);
      expect(state.players._dirty!.has("p2")).toBe(true);
      expect(state._dirty!.has("players")).toBe(true);
    });
  });

  describe("Nested containers (deep tracking)", () => {
    it("should track nested object mutations and propagate to parent", () => {
      const state = track({
        player: { x: 0, y: 0 },
        score: 0,
      });

      state.player.x = 100;

      // Inner mutation tracked
      expect(state.player._dirty!.has("x")).toBe(true);
      // Propagated to parent
      expect(state._dirty!.has("player")).toBe(true);
    });

    it("should track nested array mutations and propagate to parent", () => {
      const state = track({
        items: [{ value: 1 }, { value: 2 }],
      });

      const item = state.items[0]!;
      item.value = 99;

      // Inner mutation tracked
      expect(item._dirty!.has("value")).toBe(true);
      // Propagated to array
      expect(state.items._dirty!.has(0)).toBe(true);
      // Propagated to parent
      expect(state._dirty!.has("items")).toBe(true);
    });

    it("should track array push and propagate to parent", () => {
      const state = track({
        items: [1, 2, 3],
      });

      state.items.push(4);

      expect(state.items._dirty!.has(3)).toBe(true);
      expect(state._dirty!.has("items")).toBe(true);
    });

    it("should track mutations on pushed items", () => {
      const state = track({
        items: [{ v: 1 }],
      });

      state.items.push({ v: 2 });
      clearTracking(state);

      // Mutate the pushed item
      state.items[1]!.v = 99;

      expect(state.items[1]!._dirty!.has("v")).toBe(true);
      expect(state.items._dirty!.has(1)).toBe(true);
      expect(state._dirty!.has("items")).toBe(true);
    });

    it("should track array pop and propagate to parent", () => {
      const state = track({
        items: [1, 2, 3],
      });

      const popped = state.items.pop();

      expect(popped).toBe(3);
      expect(state.items._dirty!.has(2)).toBe(true);
      expect(state._dirty!.has("items")).toBe(true);
    });

    it("should track array shift and propagate to parent", () => {
      const state = track({
        items: [1, 2, 3],
      });

      const shifted = state.items.shift();

      expect(shifted).toBe(1);
      // All indices marked dirty since they shift
      expect(state.items._dirty!.has(0)).toBe(true);
      expect(state.items._dirty!.has(1)).toBe(true);
      expect(state.items._dirty!.has(2)).toBe(true);
      expect(state._dirty!.has("items")).toBe(true);
    });

    it("should track array unshift and propagate to parent", () => {
      const state = track({
        items: [1, 2, 3],
      });

      const newLength = state.items.unshift(0);

      expect(newLength).toBe(4);
      expect(state.items[0]).toBe(0);
      // All indices marked dirty since they shift
      expect(state.items._dirty!.has(0)).toBe(true);
      expect(state.items._dirty!.has(1)).toBe(true);
      expect(state.items._dirty!.has(2)).toBe(true);
      expect(state.items._dirty!.has(3)).toBe(true);
      expect(state._dirty!.has("items")).toBe(true);
    });

    it("should track mutations on unshifted items", () => {
      const state = track({
        items: [{ v: 1 }],
      });

      state.items.unshift({ v: 0 });
      clearTracking(state);

      // Mutate the unshifted item
      state.items[0]!.v = 99;

      expect(state.items[0]!._dirty!.has("v")).toBe(true);
      expect(state.items._dirty!.has(0)).toBe(true);
      expect(state._dirty!.has("items")).toBe(true);
    });

    it("should track array splice and propagate to parent", () => {
      const state = track({
        items: [{ v: 1 }, { v: 2 }, { v: 3 }],
      });

      const removed = state.items.splice(1, 1, { v: 10 }, { v: 20 });

      expect(removed.length).toBe(1);
      expect(state.items.length).toBe(4);
      expect(state.items[1]!.v).toBe(10);
      expect(state.items[2]!.v).toBe(20);
      // Affected indices marked dirty
      expect(state.items._dirty!.has(1)).toBe(true);
      expect(state.items._dirty!.has(2)).toBe(true);
      expect(state._dirty!.has("items")).toBe(true);

      // Verify spliced-in items are tracked
      clearTracking(state);
      state.items[1]!.v = 100;
      expect(state.items[1]!._dirty!.has("v")).toBe(true);
      expect(state.items._dirty!.has(1)).toBe(true);
    });

    it("should track nested map mutations and propagate to parent", () => {
      const state = track({
        players: new Map([["p1", { x: 0, y: 0 }]]),
      });

      state.players.get("p1")!.x = 100;

      // Inner mutation tracked
      expect(state.players.get("p1")!._dirty!.has("x")).toBe(true);
      // Propagated to map
      expect(state.players._dirty!.has("p1")).toBe(true);
      // Propagated to parent
      expect(state._dirty!.has("players")).toBe(true);
    });

    it("should track map set and propagate to parent", () => {
      const state = track({
        players: new Map<string, { x: number }>(),
      });

      state.players.set("p1", { x: 100 });

      expect(state.players._dirty!.has("p1")).toBe(true);
      expect(state._dirty!.has("players")).toBe(true);
    });

    it("should track mutations in map for...of loop", () => {
      const state = track({
        players: new Map([
          ["p1", { x: 0 }],
          ["p2", { x: 0 }],
        ]),
      });

      for (const [, player] of state.players) {
        player.x = 99;
      }

      expect(state.players._dirty!.has("p1")).toBe(true);
      expect(state.players._dirty!.has("p2")).toBe(true);
      expect(state._dirty!.has("players")).toBe(true);
    });

    it("should track mutations via map.values()", () => {
      const state = track({
        players: new Map([
          ["p1", { x: 0 }],
          ["p2", { x: 0 }],
        ]),
      });

      for (const player of state.players.values()) {
        player.x = 99;
      }

      expect(state.players._dirty!.has("p1")).toBe(true);
      expect(state.players._dirty!.has("p2")).toBe(true);
    });

    it("should track mutations via map.forEach()", () => {
      const state = track({
        players: new Map([
          ["p1", { x: 0 }],
          ["p2", { x: 0 }],
        ]),
      });

      state.players.forEach((player) => {
        player.x = 99;
      });

      expect(state.players._dirty!.has("p1")).toBe(true);
      expect(state.players._dirty!.has("p2")).toBe(true);
    });

    it("should track map delete and propagate to parent", () => {
      const state = track({
        players: new Map([["p1", { x: 0 }]]),
      });

      state.players.delete("p1");

      expect(state.players._dirty!.has("p1")).toBe(true);
      expect(state._dirty!.has("players")).toBe(true);
    });

    it("should track map clear and propagate to parent", () => {
      const state = track({
        players: new Map([
          ["p1", { x: 0 }],
          ["p2", { x: 0 }],
        ]),
      });

      state.players.clear();

      expect(state.players._dirty!.has("p1")).toBe(true);
      expect(state.players._dirty!.has("p2")).toBe(true);
      expect(state._dirty!.has("players")).toBe(true);
    });

    it("should support map.size, map.has, and map.keys", () => {
      const state = track({
        players: new Map([
          ["p1", { x: 0 }],
          ["p2", { x: 10 }],
        ]),
      });

      expect(state.players.size).toBe(2);
      expect(state.players.has("p1")).toBe(true);
      expect(state.players.has("p3")).toBe(false);
      expect([...state.players.keys()]).toEqual(["p1", "p2"]);
    });

    it("should track deeply nested structures", () => {
      const state = track({
        game: {
          teams: new Map<string, { players: { score: number }[] }>(),
        },
      });

      state.game.teams.set("red", { players: [{ score: 0 }] });
      clearTracking(state); // Clear so we can test the nested mutation

      const team = state.game.teams.get("red")!;
      const player = team.players[0]!;
      player.score = 100;

      // Full propagation chain
      expect(player._dirty!.has("score")).toBe(true);
      expect(team.players._dirty!.has(0)).toBe(true);
      expect(team._dirty!.has("players")).toBe(true);
      expect(state.game.teams._dirty!.has("red")).toBe(true);
      expect(state.game._dirty!.has("teams")).toBe(true);
      expect(state._dirty!.has("game")).toBe(true);
    });

    it("should track mutations in for...of loops", () => {
      const state = track({
        items: [{ value: 1 }, { value: 2 }],
      });

      for (const item of state.items) {
        item.value = 99;
      }

      expect(state.items._dirty!.has(0)).toBe(true);
      expect(state.items._dirty!.has(1)).toBe(true);
      expect(state._dirty!.has("items")).toBe(true);
    });

    it("should track mutations in forEach", () => {
      const state = track({
        items: [{ value: 1 }, { value: 2 }],
      });

      state.items.forEach((item) => {
        item.value = 99;
      });

      expect(state.items._dirty!.has(0)).toBe(true);
      expect(state.items._dirty!.has(1)).toBe(true);
    });

    it("should return tracked item from find", () => {
      const state = track({
        items: [
          { id: "a", value: 1 },
          { id: "b", value: 2 },
        ],
      });

      const found = state.items.find((item) => item.id === "b");
      found!.value = 99;

      expect(state.items._dirty!.has(1)).toBe(true);
    });

    it("should clear tracking recursively", () => {
      const state = track({
        player: { x: 0, y: 0 },
        items: [{ value: 1 }],
      });

      state.player.x = 100;
      state.items[0]!.value = 99;

      clearTracking(state);

      expect(state._dirty!.size).toBe(0);
      expect(state.player._dirty!.size).toBe(0);
      expect(state.items._dirty!.size).toBe(0);
      expect(state.items[0]!._dirty!.size).toBe(0);
    });
  });

  describe("Integration with delta-pack interpreter API", () => {
    it("should work with encodeDiff", () => {
      type Position = Infer<typeof schema.Position>;
      const api = load(schema.Position);

      const state1: Position = { x: 0, y: 0 };
      const state2 = track({ x: 0, y: 0 });
      state2.x = 100;
      state2.y = 200;

      expect(state2._dirty!.has("x")).toBe(true);
      expect(state2._dirty!.has("y")).toBe(true);
      expect(state2._dirty!.size).toBe(2);

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.x).toBe(100);
      expect(decoded.y).toBe(200);
    });

    it("should produce smaller diffs with dirty tracking", () => {
      type Player = Infer<typeof schema.Player>;
      const api = load(schema.Player);

      const state1: Player = { id: "p1", name: "Alice", score: 0, isActive: true };

      // Without dirty tracking - must compare all fields
      const state2NoDirty = { ...state1, score: 100 };
      expect(state2NoDirty._dirty).toBeUndefined();
      const diffNoDirty = api.encodeDiff(state1, state2NoDirty);

      // With dirty tracking - only score marked as changed
      const state2WithDirty = track(state1) as Player;
      state2WithDirty.score = 100;
      expect(state2WithDirty._dirty!.has("score")).toBe(true);
      expect(state2WithDirty._dirty!.size).toBe(1);
      const diffWithDirty = api.encodeDiff(state1, state2WithDirty as Player);

      // Both should produce same decoded result
      expect(api.decodeDiff(state1, diffNoDirty).score).toBe(100);
      expect(api.decodeDiff(state1, diffWithDirty).score).toBe(100);

      // Dirty tracking version should be same size or smaller
      expect(diffWithDirty.length).toBeLessThanOrEqual(diffNoDirty.length);
    });
  });

  describe("Integration with decorator API", () => {
    it("should work with class instances", () => {
      const api = loadClass(Position);

      const state1 = new Position();
      const state2 = track(new Position());
      state2.x = 100;
      state2.y = 200;

      expect(state2._dirty!.has("x")).toBe(true);
      expect(state2._dirty!.has("y")).toBe(true);
      expect(state2._dirty!.size).toBe(2);

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.x).toBe(100);
      expect(decoded.y).toBe(200);
    });

    it("should produce smaller diffs with dirty tracking on class instances", () => {
      const api = loadClass(Player);

      const state1 = new Player();
      state1.id = "p1";
      state1.name = "Alice";
      state1.score = 0;
      state1.isActive = true;

      const state2 = new Player();
      state2.id = "p1";
      state2.name = "Alice";
      state2.score = 0;
      state2.isActive = true;
      const trackedState2 = track(state2);
      trackedState2.score = 100;

      expect(trackedState2._dirty!.has("score")).toBe(true);
      expect(trackedState2._dirty!.size).toBe(1);

      const diff = api.encodeDiff(state1, trackedState2 as Player);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.score).toBe(100);
      expect(decoded.name).toBe("Alice");
    });
  });
});
