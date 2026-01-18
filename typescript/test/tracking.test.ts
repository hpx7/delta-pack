import { describe, it, expect } from "vitest";
import { Infer, track, clearTracking, load, loadClass, getDirty, markDirty } from "@hpx7/delta-pack";
import { schema } from "./schema.js";
import { Position, Player } from "./reflection-schema.js";

/** Test helper to check if a key is dirty on a tracked object */
function isDirty(obj: unknown, key: string | number): boolean {
  const dirty = getDirty(obj);
  return dirty != null && dirty.has(key);
}

/** Test helper to get the size of the dirty set */
function dirtySize(obj: unknown): number {
  const dirty = getDirty(obj);
  return dirty?.size ?? 0;
}

describe("Dirty Tracking", () => {
  describe("track() - Object tracking", () => {
    it("should automatically track property changes", () => {
      const obj = track({ x: 0, y: 0, name: "test" });

      obj.x = 100;
      obj.y = 200;

      expect(isDirty(obj, "x")).toBe(true);
      expect(isDirty(obj, "y")).toBe(true);
      expect(isDirty(obj, "name")).toBe(false);
      expect(dirtySize(obj)).toBe(2);
    });

    it("should not mark dirty if value is unchanged", () => {
      const obj = track({ x: 100, y: 200 });

      obj.x = 100; // Same value

      expect(isDirty(obj, "x")).toBe(false);
      expect(dirtySize(obj)).toBe(0);
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

      expect(dirtySize(obj)).toBe(0);
    });

    it("should track mutations via for...in loop", () => {
      const state = track({
        a: { value: 1 },
        b: { value: 2 },
      });

      for (const key in state) {
        (state as unknown as Record<string, { value: number }>)[key]!.value = 99;
      }

      expect(isDirty(state.a, "value")).toBe(true);
      expect(isDirty(state.b, "value")).toBe(true);
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

      expect(isDirty(state.a, "value")).toBe(true);
      expect(isDirty(state.b, "value")).toBe(true);
    });

    it("should track mutations via Object.entries()", () => {
      const state = track({
        a: { value: 1 },
        b: { value: 2 },
      });

      for (const [, item] of Object.entries(state)) {
        if (typeof item === "object" && item !== null && "value" in item) {
          (item as { value: number }).value = 99;
        }
      }

      expect(isDirty(state.a, "value")).toBe(true);
      expect(isDirty(state.b, "value")).toBe(true);
    });

    it("should track mutations via destructuring", () => {
      const state = track({
        player: { x: 0, y: 0 },
        enemy: { x: 10, y: 10 },
      });

      const { player, enemy } = state;
      player.x = 100;
      enemy.y = 200;

      expect(isDirty(state.player, "x")).toBe(true);
      expect(isDirty(state.enemy, "y")).toBe(true);
    });

    it("should track replaced nested object and its mutations", () => {
      const state = track({
        player: { x: 0, y: 0 },
      });

      // Replace the entire nested object
      state.player = { x: 100, y: 100 };

      expect(isDirty(state, "player")).toBe(true);

      // Clear and verify the new object is tracked
      clearTracking(state);

      state.player.x = 200;

      expect(isDirty(state.player, "x")).toBe(true);
    });

    it("should track replaced nested array and its mutations", () => {
      const state = track({
        items: [{ value: 1 }],
      });

      // Replace the entire array
      state.items = [{ value: 10 }, { value: 20 }];

      expect(isDirty(state, "items")).toBe(true);

      // Clear and verify the new array is tracked
      clearTracking(state);

      state.items[0]!.value = 99;

      expect(isDirty(state.items[0]!, "value")).toBe(true);
    });

    it("should track replaced nested map and its mutations", () => {
      const state = track({
        players: new Map([["p1", { x: 0 }]]),
      });

      // Replace the entire map
      state.players = new Map([["p2", { x: 100 }]]);

      expect(isDirty(state, "players")).toBe(true);

      // Clear and verify the new map is tracked
      clearTracking(state);

      state.players.get("p2")!.x = 200;

      expect(isDirty(state.players.get("p2")!, "x")).toBe(true);
    });
  });

  describe("Nested containers (deep tracking)", () => {
    it("should track nested object mutations", () => {
      const state = track({
        player: { x: 0, y: 0 },
        score: 0,
      });

      state.player.x = 100;

      // Inner mutation tracked
      expect(isDirty(state.player, "x")).toBe(true);
    });

    it("should track nested array mutations", () => {
      const state = track({
        items: [{ value: 1 }, { value: 2 }],
      });

      const item = state.items[0]!;
      item.value = 99;

      // Inner mutation tracked
      expect(isDirty(item, "value")).toBe(true);
    });

    it("should track array push", () => {
      const state = track({
        items: [1, 2, 3],
      });

      state.items.push(4);

      expect(isDirty(state.items, 3)).toBe(true);
    });

    it("should track mutations on pushed items", () => {
      const state = track({
        items: [{ v: 1 }],
      });

      state.items.push({ v: 2 });
      clearTracking(state);

      // Mutate the pushed item
      state.items[1]!.v = 99;

      expect(isDirty(state.items[1]!, "v")).toBe(true);
    });

    it("should track array pop", () => {
      const state = track({
        items: [1, 2, 3],
      });

      const popped = state.items.pop();

      expect(popped).toBe(3);
      expect(isDirty(state.items, 2)).toBe(true);
    });

    it("should track array shift", () => {
      const state = track({
        items: [1, 2, 3],
      });

      const shifted = state.items.shift();

      expect(shifted).toBe(1);
      // All indices marked dirty since they shift
      expect(isDirty(state.items, 0)).toBe(true);
      expect(isDirty(state.items, 1)).toBe(true);
      expect(isDirty(state.items, 2)).toBe(true);
    });

    it("should track reindexed items after shift", () => {
      const state = track({
        items: [{ v: 1 }, { v: 2 }],
      });

      const moved = state.items[1]!;
      state.items.shift();
      clearTracking(state);

      moved.v = 99;

      // Without propagation, modifying moved item only marks dirty on the item itself
      expect(isDirty(moved, "v")).toBe(true);
    });

    it("should track array unshift", () => {
      const state = track({
        items: [1, 2, 3],
      });

      const newLength = state.items.unshift(0);

      expect(newLength).toBe(4);
      expect(state.items[0]).toBe(0);
      // All indices marked dirty since they shift
      expect(isDirty(state.items, 0)).toBe(true);
      expect(isDirty(state.items, 1)).toBe(true);
      expect(isDirty(state.items, 2)).toBe(true);
      expect(isDirty(state.items, 3)).toBe(true);
    });

    it("should not mark dirty for empty unshift", () => {
      const state = track({
        items: [1, 2, 3],
      });

      const newLength = state.items.unshift();

      expect(newLength).toBe(3);
      expect(dirtySize(state.items)).toBe(0);
      expect(dirtySize(state)).toBe(0);
    });

    it("should track mutations on unshifted items", () => {
      const state = track({
        items: [{ v: 1 }],
      });

      state.items.unshift({ v: 0 });
      clearTracking(state);

      // Mutate the unshifted item
      state.items[0]!.v = 99;

      expect(isDirty(state.items[0]!, "v")).toBe(true);
    });

    it("should track array splice", () => {
      const state = track({
        items: [{ v: 1 }, { v: 2 }, { v: 3 }],
      });

      const removed = state.items.splice(1, 1, { v: 10 }, { v: 20 });

      expect(removed.length).toBe(1);
      expect(state.items.length).toBe(4);
      expect(state.items[1]!.v).toBe(10);
      expect(state.items[2]!.v).toBe(20);
      // Affected indices marked dirty
      expect(isDirty(state.items, 1)).toBe(true);
      expect(isDirty(state.items, 2)).toBe(true);

      // Verify spliced-in items are tracked
      clearTracking(state);
      state.items[1]!.v = 100;
      expect(isDirty(state.items[1]!, "v")).toBe(true);
    });

    it("should track array splice deletions without insertions", () => {
      const state = track({
        items: [1, 2, 3, 4],
      });

      const removed = state.items.splice(1, 2);

      expect(removed).toEqual([2, 3]);
      expect(state.items).toEqual([1, 4]);
      expect(isDirty(state.items, 1)).toBe(true);
    });

    it("should track splice inserts at end", () => {
      const state = track({
        items: [] as number[],
      });

      state.items.splice(0, 0, 1);

      expect(isDirty(state.items, 0)).toBe(true);

      clearTracking(state);

      state.items.splice(state.items.length, 0, 2);

      expect(isDirty(state.items, 1)).toBe(true);
    });

    it("should track nested map mutations", () => {
      const state = track({
        players: new Map([["p1", { x: 0, y: 0 }]]),
      });

      state.players.get("p1")!.x = 100;

      // Inner mutation tracked
      expect(isDirty(state.players.get("p1")!, "x")).toBe(true);
    });

    it("should track map set", () => {
      const state = track({
        players: new Map<string, { x: number }>(),
      });

      state.players.set("p1", { x: 100 });

      expect(isDirty(state.players, "p1")).toBe(true);
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

      // Inner mutations tracked
      expect(isDirty(state.players.get("p1")!, "x")).toBe(true);
      expect(isDirty(state.players.get("p2")!, "x")).toBe(true);
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

      // Inner mutations tracked
      expect(isDirty(state.players.get("p1")!, "x")).toBe(true);
      expect(isDirty(state.players.get("p2")!, "x")).toBe(true);
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

      // Inner mutations tracked
      expect(isDirty(state.players.get("p1")!, "x")).toBe(true);
      expect(isDirty(state.players.get("p2")!, "x")).toBe(true);
    });

    it("should track map delete", () => {
      const state = track({
        players: new Map([["p1", { x: 0 }]]),
      });

      state.players.delete("p1");

      expect(isDirty(state.players, "p1")).toBe(true);
    });

    it("should track map clear", () => {
      const state = track({
        players: new Map([
          ["p1", { x: 0 }],
          ["p2", { x: 0 }],
        ]),
      });

      state.players.clear();

      expect(isDirty(state.players, "p1")).toBe(true);
      expect(isDirty(state.players, "p2")).toBe(true);
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

      // Inner mutation tracked
      expect(isDirty(player, "score")).toBe(true);
    });

    it("should track mutations in for...of loops", () => {
      const state = track({
        items: [{ value: 1 }, { value: 2 }],
      });

      for (const item of state.items) {
        item.value = 99;
      }

      // Inner mutations tracked
      expect(isDirty(state.items[0]!, "value")).toBe(true);
      expect(isDirty(state.items[1]!, "value")).toBe(true);
    });

    it("should track mutations in forEach", () => {
      const state = track({
        items: [{ value: 1 }, { value: 2 }],
      });

      state.items.forEach((item) => {
        item.value = 99;
      });

      // Inner mutations tracked
      expect(isDirty(state.items[0]!, "value")).toBe(true);
      expect(isDirty(state.items[1]!, "value")).toBe(true);
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

      // Inner mutation tracked
      expect(isDirty(found!, "value")).toBe(true);
    });

    it("should track array sort", () => {
      const state = track({
        items: [3, 1, 2],
      });

      state.items.sort((a, b) => a - b);

      expect(state.items).toEqual([1, 2, 3]);
      expect(isDirty(state.items, 0)).toBe(true);
      expect(isDirty(state.items, 1)).toBe(true);
      expect(isDirty(state.items, 2)).toBe(true);
    });

    it("should track array reverse", () => {
      const state = track({
        items: [1, 2, 3],
      });

      state.items.reverse();

      expect(state.items).toEqual([3, 2, 1]);
      expect(isDirty(state.items, 0)).toBe(true);
      expect(isDirty(state.items, 1)).toBe(true);
      expect(isDirty(state.items, 2)).toBe(true);
    });

    it("should track array fill range", () => {
      const state = track({
        items: [1, 2, 3, 4],
      });

      state.items.fill(9, 1, 3);

      expect(state.items).toEqual([1, 9, 9, 4]);
      expect(isDirty(state.items, 1)).toBe(true);
      expect(isDirty(state.items, 2)).toBe(true);
      expect(isDirty(state.items, 0)).toBe(false);
      expect(isDirty(state.items, 3)).toBe(false);
    });

    it("should track array fill with default bounds", () => {
      const state = track({
        items: [1, 2, 3],
      });

      state.items.fill(9);

      expect(state.items).toEqual([9, 9, 9]);
      expect(isDirty(state.items, 0)).toBe(true);
      expect(isDirty(state.items, 1)).toBe(true);
      expect(isDirty(state.items, 2)).toBe(true);
    });

    it("should handle array fill with no-op range", () => {
      const state = track({
        items: [1, 2, 3],
      });

      state.items.fill(9, 2, 1);

      expect(state.items).toEqual([1, 2, 3]);
      expect(dirtySize(state.items)).toBe(0);
      expect(dirtySize(state)).toBe(0);
    });

    it("should handle array fill with negative start index", () => {
      const state = track({
        items: [1, 2, 3, 4],
      });

      state.items.fill(9, -2);

      expect(state.items).toEqual([1, 2, 9, 9]);
      expect(isDirty(state.items, 2)).toBe(true);
      expect(isDirty(state.items, 3)).toBe(true);
      expect(isDirty(state.items, 0)).toBe(false);
      expect(isDirty(state.items, 1)).toBe(false);
    });

    it("should track array copyWithin range", () => {
      const state = track({
        items: [1, 2, 3, 4],
      });

      state.items.copyWithin(1, 0, 2);

      expect(state.items).toEqual([1, 1, 2, 4]);
      expect(isDirty(state.items, 1)).toBe(true);
      expect(isDirty(state.items, 2)).toBe(true);
      expect(isDirty(state.items, 0)).toBe(false);
      expect(isDirty(state.items, 3)).toBe(false);
    });

    it("should track array copyWithin with default end", () => {
      const state = track({
        items: [1, 2, 3, 4],
      });

      state.items.copyWithin(2, 0);

      expect(state.items).toEqual([1, 2, 1, 2]);
      expect(isDirty(state.items, 2)).toBe(true);
      expect(isDirty(state.items, 3)).toBe(true);
    });

    it("should handle array copyWithin no-op range", () => {
      const state = track({
        items: [1, 2, 3],
      });

      state.items.copyWithin(0, 0, 0);

      expect(state.items).toEqual([1, 2, 3]);
      expect(dirtySize(state.items)).toBe(0);
      expect(dirtySize(state)).toBe(0);
    });

    it("should clear tracking recursively", () => {
      const state = track({
        player: { x: 0, y: 0 },
        items: [{ value: 1 }],
      });

      state.player.x = 100;
      state.items[0]!.value = 99;

      clearTracking(state);

      expect(dirtySize(state)).toBe(0);
      expect(dirtySize(state.player)).toBe(0);
      expect(dirtySize(state.items)).toBe(0);
      expect(dirtySize(state.items[0]!)).toBe(0);
    });

    it("should handle symbol properties on objects", () => {
      const sym = Symbol("test");
      const state = track({ x: 0 });
      // Setting symbol should not throw and should be ignored for dirty tracking
      (state as any)[sym] = "symbol-value";
      expect(dirtySize(state)).toBe(0); // Symbols don't mark dirty
      // Getting symbol should return undefined (not tracked)
      expect((state as any)[sym]).toBeUndefined();
    });

    it("should handle symbol properties on arrays", () => {
      const sym = Symbol("test");
      const state = track({ items: [1, 2, 3] });
      // Setting symbol on array should not throw and should be ignored
      (state.items as any)[sym] = "symbol-value";
      expect(dirtySize(state.items)).toBe(0);
    });

    it("should handle symbol iteration", () => {
      const state = track({ items: [1, 2, 3] });
      // Symbol.iterator should work for arrays
      const values = [...state.items];
      expect(values).toEqual([1, 2, 3]);
    });

    it("should allow setting non-index properties without marking dirty", () => {
      const state = track({ items: [1, 2, 3] });
      (state.items as any).label = "scores";
      expect((state.items as any).label).toBe("scores");
      expect(dirtySize(state.items)).toBe(0);
      expect(dirtySize(state)).toBe(0);
    });

    it("should handle setting array length directly", () => {
      const state = track({ items: [1, 2, 3, 4, 5] });
      state.items.length = 2;
      expect(state.items.length).toBe(2);
      expect(state.items).toEqual([1, 2]);
      expect(isDirty(state.items, 2)).toBe(true);
      expect(isDirty(state.items, 3)).toBe(true);
      expect(isDirty(state.items, 4)).toBe(true);
    });

    it("should track direct array index assignment", () => {
      const state = track({ items: [{ v: 1 }, { v: 2 }, { v: 3 }] });

      // Direct index assignment
      state.items[1] = { v: 99 };

      expect(isDirty(state.items, 1)).toBe(true);
      expect(state.items[1]!.v).toBe(99);

      // The new object should be tracked
      clearTracking(state);
      state.items[1]!.v = 100;
      expect(isDirty(state.items[1]!, "v")).toBe(true);
    });
  });

  describe("markDirty() - Manual tracking without proxies", () => {
    it("should mark object fields as dirty", () => {
      const obj = { x: 0, y: 0, name: "test" };

      obj.x = 100;
      markDirty(obj, "x");

      expect(isDirty(obj, "x")).toBe(true);
      expect(isDirty(obj, "y")).toBe(false);
      expect(dirtySize(obj)).toBe(1);
    });

    it("should mark array indices as dirty", () => {
      const arr = [1, 2, 3, 4, 5];

      arr[2] = 99;
      markDirty(arr, 2);

      expect(isDirty(arr, 2)).toBe(true);
      expect(isDirty(arr, 0)).toBe(false);
      expect(dirtySize(arr)).toBe(1);
    });

    it("should mark map keys as dirty", () => {
      const map = new Map([
        ["a", 1],
        ["b", 2],
      ]);

      map.set("a", 100);
      markDirty(map, "a");

      expect(isDirty(map, "a")).toBe(true);
      expect(isDirty(map, "b")).toBe(false);
      expect(dirtySize(map)).toBe(1);
    });

    it("should accumulate multiple dirty keys", () => {
      const obj = { a: 1, b: 2, c: 3 };

      markDirty(obj, "a");
      markDirty(obj, "c");

      expect(isDirty(obj, "a")).toBe(true);
      expect(isDirty(obj, "b")).toBe(false);
      expect(isDirty(obj, "c")).toBe(true);
      expect(dirtySize(obj)).toBe(2);
    });

    it("should work with clearTracking", () => {
      const obj = { x: 0, y: 0 };

      markDirty(obj, "x");
      markDirty(obj, "y");
      expect(dirtySize(obj)).toBe(2);

      clearTracking(obj);
      expect(dirtySize(obj)).toBe(0);
    });

    it("should work with encodeDiff", () => {
      type Position = Infer<typeof schema.Position>;
      const api = load(schema.Position);

      const state1: Position = { x: 0, y: 0 };
      const state2: Position = { x: 100, y: 0 };
      markDirty(state2, "x");

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.x).toBe(100);
      expect(decoded.y).toBe(0);
    });

    it("should skip unchanged fields in encodeDiff", () => {
      type Position = Infer<typeof schema.Position>;
      const api = load(schema.Position);

      const state1: Position = { x: 0, y: 0 };
      const state2: Position = { x: 100, y: 200 };
      // Only mark x as dirty, even though y also changed
      markDirty(state2, "x");

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.x).toBe(100);
      expect(decoded.y).toBe(0); // y unchanged because not marked dirty
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

      expect(isDirty(state2, "x")).toBe(true);
      expect(isDirty(state2, "y")).toBe(true);
      expect(dirtySize(state2)).toBe(2);

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.x).toBe(100);
      expect(decoded.y).toBe(200);
    });

    it("should work with Map encodeDiff - updates", () => {
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      const state1: GameState = {
        players: [],
        round: 1,
        metadata: new Map([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
      };

      const state2 = track({
        players: [],
        round: 1,
        metadata: new Map([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
      }) as GameState;

      // Update an existing key
      state2.metadata.set("key1", "updated");

      expect(isDirty(state2.metadata, "key1")).toBe(true);
      expect(dirtySize(state2.metadata)).toBe(1);

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.metadata.get("key1")).toBe("updated");
      expect(decoded.metadata.get("key2")).toBe("value2");
    });

    it("should work with Map encodeDiff - additions", () => {
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      const state1: GameState = {
        players: [],
        round: 1,
        metadata: new Map([["key1", "value1"]]),
      };

      const state2 = track({
        players: [],
        round: 1,
        metadata: new Map([["key1", "value1"]]),
      }) as GameState;

      // Add a new key
      state2.metadata.set("key2", "newvalue");

      expect(isDirty(state2.metadata, "key2")).toBe(true);

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.metadata.get("key1")).toBe("value1");
      expect(decoded.metadata.get("key2")).toBe("newvalue");
    });

    it("should work with Map encodeDiff - deletions", () => {
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      const state1: GameState = {
        players: [],
        round: 1,
        metadata: new Map([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
      };

      const state2 = track({
        players: [],
        round: 1,
        metadata: new Map([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
      }) as GameState;

      // Delete a key
      state2.metadata.delete("key2");

      expect(isDirty(state2.metadata, "key2")).toBe(true);

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.metadata.get("key1")).toBe("value1");
      expect(decoded.metadata.has("key2")).toBe(false);
    });

    it("should produce smaller diffs with dirty tracking", () => {
      type Player = Infer<typeof schema.Player>;
      const api = load(schema.Player);

      const state1: Player = { id: "p1", name: "Alice", score: 0, isActive: true };

      // Without dirty tracking - must compare all fields
      const state2NoDirty = { ...state1, score: 100 };
      expect(getDirty(state2NoDirty)).toBeUndefined();
      const diffNoDirty = api.encodeDiff(state1, state2NoDirty);

      // With dirty tracking - only score marked as changed
      const state2WithDirty = track(state1) as Player;
      state2WithDirty.score = 100;
      expect(isDirty(state2WithDirty, "score")).toBe(true);
      expect(dirtySize(state2WithDirty)).toBe(1);
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

      expect(isDirty(state2, "x")).toBe(true);
      expect(isDirty(state2, "y")).toBe(true);
      expect(dirtySize(state2)).toBe(2);

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

      expect(isDirty(trackedState2, "score")).toBe(true);
      expect(dirtySize(trackedState2)).toBe(1);

      const diff = api.encodeDiff(state1, trackedState2 as Player);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.score).toBe(100);
      expect(decoded.name).toBe("Alice");
    });
  });

  describe("Parent propagation", () => {
    it("should propagate dirty from nested object to parent", () => {
      const state = track({
        nested: { deep: { value: 0 } },
      });

      state.nested.deep.value = 100;

      // Deep change should propagate up
      expect(isDirty(state.nested.deep, "value")).toBe(true);
      expect(isDirty(state.nested, "deep")).toBe(true);
      expect(isDirty(state, "nested")).toBe(true);
    });

    it("should propagate dirty from array item mutation to parent", () => {
      const state = track({
        items: [{ value: 0 }, { value: 0 }],
      });

      state.items[0]!.value = 100;

      // Item change should propagate to array and parent
      expect(isDirty(state.items[0]!, "value")).toBe(true);
      expect(isDirty(state.items, 0)).toBe(true);
      expect(isDirty(state, "items")).toBe(true);
    });

    it("should propagate dirty from map value mutation to parent", () => {
      const state = track({
        players: new Map([["p1", { x: 0, y: 0 }]]),
      });

      state.players.get("p1")!.x = 100;

      // Map value change should propagate
      expect(isDirty(state.players.get("p1")!, "x")).toBe(true);
      expect(isDirty(state.players, "p1")).toBe(true);
      expect(isDirty(state, "players")).toBe(true);
    });

    it("should correctly encode deep nested changes with encodeDiff", () => {
      type Entity = Infer<typeof schema.Entity>;
      const api = load(schema.Entity);

      const state1: Entity = { id: "e1", position: { x: 0, y: 0 } };
      const state2 = track({ id: "e1", position: { x: 0, y: 0 } });
      state2.position.x = 100;

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.id).toBe("e1");
      expect(decoded.position.x).toBe(100);
      expect(decoded.position.y).toBe(0);
    });

    it("should correctly encode array item mutations with encodeDiff", () => {
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      const state1: GameState = {
        players: [{ id: "p1", name: "Alice", score: 0, isActive: true }],
        round: 1,
        metadata: new Map(),
      };
      const state2 = track({
        players: [{ id: "p1", name: "Alice", score: 0, isActive: true }],
        round: 1,
        metadata: new Map(),
      });
      state2.players[0]!.score = 100;

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.players[0]!.score).toBe(100);
      expect(decoded.players[0]!.name).toBe("Alice");
    });

    it("should correctly encode map value mutations with encodeDiff", () => {
      type PlayerRegistry = Infer<typeof schema.PlayerRegistry>;
      const api = load(schema.PlayerRegistry);

      const state1: PlayerRegistry = {
        players: new Map([["p1", { id: "p1", name: "Alice", score: 0, isActive: true }]]),
      };
      const state2 = track({
        players: new Map([["p1", { id: "p1", name: "Alice", score: 0, isActive: true }]]),
      });
      state2.players.get("p1")!.score = 100;

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.players.get("p1")!.score).toBe(100);
      expect(decoded.players.get("p1")!.name).toBe("Alice");
    });

    it("should correctly track mutations after array reordering and clearTracking", () => {
      // Regression test: after reordering, PARENT_KEY must be updated
      // so that subsequent mutations propagate to the correct index
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      const state1: GameState = {
        players: [
          { id: "p1", name: "Alice", score: 0, isActive: true },
          { id: "p2", name: "Bob", score: 0, isActive: true },
        ],
        round: 1,
        metadata: new Map(),
      };
      const state2 = track({
        players: [
          { id: "p1", name: "Alice", score: 0, isActive: true },
          { id: "p2", name: "Bob", score: 0, isActive: true },
        ],
        round: 1,
        metadata: new Map(),
      });

      // Reorder via unshift
      state2.players.unshift({ id: "p0", name: "New", score: 0, isActive: true });
      clearTracking(state2);

      // Modify the element that moved from index 1 to index 2
      state2.players[2]!.score = 100;

      // The correct index (2) should be marked dirty
      expect(isDirty(state2.players, 2)).toBe(true);
      expect(isDirty(state2.players, 1)).toBe(false);

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      // Verify the diff correctly captures the change
      expect(decoded.players[2]!.score).toBe(100);
      expect(decoded.players[2]!.name).toBe("Bob");
    });

    it("should propagate dirty when using markDirty on nested object", () => {
      const state = track({
        nested: { value: 0 },
      });

      // Manually mark dirty on nested object
      markDirty(state.nested, "value");

      // Should propagate to parent
      expect(isDirty(state.nested, "value")).toBe(true);
      expect(isDirty(state, "nested")).toBe(true);
    });
  });

  describe("Property deletion", () => {
    it("should track property deletion", () => {
      const obj = track({ x: 1, y: 2, z: 3 } as { x?: number; y: number; z?: number });

      delete obj.x;

      expect(isDirty(obj, "x")).toBe(true);
      expect(isDirty(obj, "y")).toBe(false);
      expect(obj.x).toBeUndefined();
      expect(obj.y).toBe(2);
    });

    it("should propagate dirty on deletion to parent", () => {
      const state = track({
        nested: { x: 1, y: 2 } as { x?: number; y: number },
      });

      delete state.nested.x;

      expect(isDirty(state.nested, "x")).toBe(true);
      expect(isDirty(state, "nested")).toBe(true);
    });

    it("should not mark dirty when deleting non-existent property", () => {
      const obj = track({ x: 1 } as { x: number; y?: number });

      delete obj.y;

      expect(isDirty(obj, "y")).toBe(false);
      expect(dirtySize(obj)).toBe(0);
    });
  });

  describe("Reparenting tracked objects", () => {
    it("should allow moving tracked object to new parent", () => {
      const state = track({
        items: [{ value: 1 }],
        backup: null as { value: number } | null,
      });

      // Move item from array to backup
      const item = state.items[0]!;
      state.backup = item;
      clearTracking(state);

      // Modify via new parent
      state.backup!.value = 100;

      // Should propagate through new parent
      expect(isDirty(state.backup!, "value")).toBe(true);
      expect(isDirty(state, "backup")).toBe(true);
    });
  });
});
