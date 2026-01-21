import { describe, it, expect } from "vitest";
import { Infer, track, load, loadClass } from "@hpx7/delta-pack";
import { getFieldVersions } from "../src/tracking.js";
import { schema } from "./schema.js";
import { Position } from "./reflection-schema.js";

/** Test helper to check if a key is dirty on a tracked object (has a version entry) */
function isDirty(obj: unknown, key: string | number): boolean {
  const versions = getFieldVersions(obj);
  return versions != null && versions.has(key);
}

/** Test helper to get the size of the dirty map */
function dirtySize(obj: unknown): number {
  const versions = getFieldVersions(obj);
  return versions?.size ?? 0;
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

    it("should track mutations via iteration and destructuring", () => {
      const state = track({
        a: { value: 1 },
        b: { value: 2 },
      });

      // Test Object.values iteration
      for (const item of Object.values(state)) {
        if (typeof item === "object" && item !== null && "value" in item) {
          (item as { value: number }).value = 99;
        }
      }

      expect(isDirty(state.a, "value")).toBe(true);
      expect(isDirty(state.b, "value")).toBe(true);
    });

    it("should track replaced nested object and its mutations", () => {
      const state = track({
        player: { x: 0, y: 0 },
      });

      // Replace the entire nested object
      state.player = { x: 100, y: 100 };

      expect(isDirty(state, "player")).toBe(true);

      // The new object should be tracked
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

      // The new array should be tracked
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

      // The new map should be tracked
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

      // New key tracked via created map (not dirty map)
      expect(state.players.has("p1")).toBe(true);
    });

    it("should track mutations via map iteration", () => {
      const state = track({
        players: new Map([
          ["p1", { x: 0 }],
          ["p2", { x: 0 }],
        ]),
      });

      for (const [, player] of state.players) {
        player.x = 99;
      }

      expect(isDirty(state.players.get("p1")!, "x")).toBe(true);
      expect(isDirty(state.players.get("p2")!, "x")).toBe(true);
    });

    it("should track map delete", () => {
      const state = track({
        players: new Map([["p1", { x: 0 }]]),
      });

      state.players.delete("p1");

      // Deletion tracked via deleted map
      expect(state.players.has("p1")).toBe(false);
    });

    it("should track map clear", () => {
      const state = track({
        players: new Map([
          ["p1", { x: 0 }],
          ["p2", { x: 0 }],
        ]),
      });

      state.players.clear();

      expect(state.players.size).toBe(0);
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

      const team = state.game.teams.get("red")!;
      const player = team.players[0]!;
      player.score = 100;

      // Inner mutation tracked
      expect(isDirty(player, "score")).toBe(true);
    });

    it("should track mutations via array iteration and find", () => {
      const state = track({
        items: [
          { id: "a", value: 1 },
          { id: "b", value: 2 },
        ],
      });

      // Test for...of iteration
      for (const item of state.items) {
        item.value = 99;
      }

      expect(isDirty(state.items[0]!, "value")).toBe(true);
      expect(isDirty(state.items[1]!, "value")).toBe(true);

      // Test find returns tracked item
      const found = state.items.find((item) => item.id === "b");
      found!.value = 100;
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

    it("should track array fill with various ranges", () => {
      // Fill with range
      const state1 = track({ items: [1, 2, 3, 4] });
      state1.items.fill(9, 1, 3);
      expect(state1.items).toEqual([1, 9, 9, 4]);
      expect(isDirty(state1.items, 1)).toBe(true);
      expect(isDirty(state1.items, 0)).toBe(false);

      // Fill with default bounds
      const state2 = track({ items: [1, 2, 3] });
      state2.items.fill(9);
      expect(state2.items).toEqual([9, 9, 9]);
      expect(isDirty(state2.items, 0)).toBe(true);

      // No-op fill (invalid range)
      const state3 = track({ items: [1, 2, 3] });
      state3.items.fill(9, 2, 1);
      expect(dirtySize(state3.items)).toBe(0);

      // Negative index
      const state4 = track({ items: [1, 2, 3, 4] });
      state4.items.fill(9, -2);
      expect(state4.items).toEqual([1, 2, 9, 9]);
      expect(isDirty(state4.items, 2)).toBe(true);
    });

    it("should track array copyWithin", () => {
      // With explicit range
      const state1 = track({ items: [1, 2, 3, 4] });
      state1.items.copyWithin(1, 0, 2);
      expect(state1.items).toEqual([1, 1, 2, 4]);
      expect(isDirty(state1.items, 1)).toBe(true);
      expect(isDirty(state1.items, 0)).toBe(false);

      // With default end
      const state2 = track({ items: [1, 2, 3, 4] });
      state2.items.copyWithin(2, 0);
      expect(state2.items).toEqual([1, 2, 1, 2]);
      expect(isDirty(state2.items, 2)).toBe(true);

      // No-op (empty range)
      const state3 = track({ items: [1, 2, 3] });
      state3.items.copyWithin(0, 0, 0);
      expect(dirtySize(state3.items)).toBe(0);
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
      state.items[1]!.v = 100;
      expect(isDirty(state.items[1]!, "v")).toBe(true);
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

    it("should work with Map encodeDiff - updates, additions, deletions", () => {
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

      // Update, add, and delete
      state2.metadata.set("key1", "updated");
      state2.metadata.set("key3", "newvalue");
      state2.metadata.delete("key2");

      expect(isDirty(state2.metadata, "key1")).toBe(true);

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.metadata.get("key1")).toBe("updated");
      expect(decoded.metadata.get("key3")).toBe("newvalue");
      expect(decoded.metadata.has("key2")).toBe(false);
    });

    it("should work with array encodeDiff without snapshot", () => {
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      // Untracked baseline (no snapshot version)
      const state1: GameState = {
        players: [{ id: "p1", name: "Alice", score: 0, isActive: true }],
        round: 1,
        metadata: new Map(),
      };
      // Tracked state with array element mutation
      const state2 = track({
        players: [{ id: "p1", name: "Alice", score: 0, isActive: true }],
        round: 1,
        metadata: new Map(),
      }) as GameState;
      state2.players[0]!.score = 100;

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.players[0]!.score).toBe(100);
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
      expect(dirtySize(state2)).toBe(2);

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.x).toBe(100);
      expect(decoded.y).toBe(200);
    });
  });

  describe("Parent propagation", () => {
    it("should propagate dirty from nested containers to parent", () => {
      // Object nesting
      const objState = track({ nested: { deep: { value: 0 } } });
      objState.nested.deep.value = 100;
      expect(isDirty(objState.nested.deep, "value")).toBe(true);
      expect(isDirty(objState.nested, "deep")).toBe(true);
      expect(isDirty(objState, "nested")).toBe(true);

      // Array nesting
      const arrState = track({ items: [{ value: 0 }] });
      arrState.items[0]!.value = 100;
      expect(isDirty(arrState.items[0]!, "value")).toBe(true);
      expect(isDirty(arrState.items, 0)).toBe(true);
      expect(isDirty(arrState, "items")).toBe(true);

      // Map nesting
      const mapState = track({ players: new Map([["p1", { x: 0 }]]) });
      mapState.players.get("p1")!.x = 100;
      expect(isDirty(mapState.players.get("p1")!, "x")).toBe(true);
      expect(isDirty(mapState.players, "p1")).toBe(true);
      expect(isDirty(mapState, "players")).toBe(true);
    });

    it("should correctly encode nested mutations with encodeDiff", () => {
      type Entity = Infer<typeof schema.Entity>;
      const api = load(schema.Entity);

      const state1: Entity = { id: "e1", position: { x: 0, y: 0 } };
      const state2 = track({ id: "e1", position: { x: 0, y: 0 } });
      state2.position.x = 100;

      const diff = api.encodeDiff(state1, state2);
      const decoded = api.decodeDiff(state1, diff);

      expect(decoded.position.x).toBe(100);
      expect(decoded.position.y).toBe(0);
    });
  });

  describe("Property deletion", () => {
    it("should track property deletion with propagation", () => {
      const state = track({
        nested: { x: 1, y: 2 } as { x?: number; y: number },
      });

      delete state.nested.x;

      expect(isDirty(state.nested, "x")).toBe(true);
      expect(isDirty(state, "nested")).toBe(true);
      expect(state.nested.x).toBeUndefined();
    });

    it("should not mark dirty when deleting non-existent property", () => {
      const obj = track({ x: 1 } as { x: number; y?: number });
      delete obj.y;
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

      // Modify via new parent
      state.backup!.value = 100;

      // Should propagate through new parent
      expect(isDirty(state.backup!, "value")).toBe(true);
      expect(isDirty(state, "backup")).toBe(true);
    });
  });

  describe("Version-based multi-baseline tracking", () => {
    it("should support diffs from multiple snapshots", () => {
      const api = load(schema.Position);

      const state = track({ x: 0, y: 0 });
      state.x = 100;

      // Take first snapshot
      const snapshot1 = api.clone(state);

      // More changes
      state.y = 200;

      // Take second snapshot
      const snapshot2 = api.clone(state);

      // More changes
      state.x = 300;

      // Diff from snapshot1 should include x=300 and y=200
      const diff1 = api.encodeDiff(snapshot1, state);
      const decoded1 = api.decodeDiff(snapshot1, diff1);
      expect(decoded1.x).toBe(300);
      expect(decoded1.y).toBe(200);

      // Diff from snapshot2 should only include x=300 (y unchanged since snapshot2)
      const diff2 = api.encodeDiff(snapshot2, state);
      const decoded2 = api.decodeDiff(snapshot2, diff2);
      expect(decoded2.x).toBe(300);
      expect(decoded2.y).toBe(200); // Same as snapshot2
    });

    it("should track map changes across multiple snapshots", () => {
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      const state = track({
        players: [],
        round: 1,
        metadata: new Map<string, string>(),
      }) as GameState;

      // Add key1
      state.metadata.set("key1", "value1");
      const snapshot1 = api.clone(state);

      // Add key2
      state.metadata.set("key2", "value2");
      const snapshot2 = api.clone(state);

      // Delete key1
      state.metadata.delete("key1");

      // Diff from snapshot1 should show key1 deleted and key2 added
      const diff1 = api.encodeDiff(snapshot1, state);
      const decoded1 = api.decodeDiff(snapshot1, diff1);
      expect(decoded1.metadata.has("key1")).toBe(false);
      expect(decoded1.metadata.get("key2")).toBe("value2");

      // Diff from snapshot2 should only show key1 deleted
      const diff2 = api.encodeDiff(snapshot2, state);
      const decoded2 = api.decodeDiff(snapshot2, diff2);
      expect(decoded2.metadata.has("key1")).toBe(false);
      expect(decoded2.metadata.get("key2")).toBe("value2");
    });

    it("should handle object diff with no changes since snapshot", () => {
      const api = load(schema.Position);

      const state = track({ x: 100, y: 200 });
      const snapshot = api.clone(state);

      // No changes since snapshot - should still produce valid diff
      const diff = api.encodeDiff(snapshot, state);
      const decoded = api.decodeDiff(snapshot, diff);
      expect(decoded.x).toBe(100);
      expect(decoded.y).toBe(200);
    });

    it("should handle tracked object with no changes and no snapshot version", () => {
      const api = load(schema.Position);

      // Create tracked object with no changes
      const state = track({ x: 100, y: 200 });
      // Create untracked baseline (no snapshot version)
      const baseline = { x: 100, y: 200 };

      // Diff from untracked baseline to tracked state with no changes
      const diff = api.encodeDiff(baseline, state);
      const decoded = api.decodeDiff(baseline, diff);
      expect(decoded.x).toBe(100);
      expect(decoded.y).toBe(200);
    });

    it("should track array element changes across snapshots", () => {
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      const state = track({
        players: [
          { id: "p1", name: "Alice", score: 0, isActive: true },
          { id: "p2", name: "Bob", score: 0, isActive: true },
        ],
        round: 1,
        metadata: new Map<string, string>(),
      }) as GameState;

      // Modify first player
      state.players[0]!.score = 100;
      const snapshot1 = api.clone(state);

      // Modify second player after snapshot
      state.players[1]!.score = 200;

      // Diff from snapshot1 should include second player's change
      const diff1 = api.encodeDiff(snapshot1, state);
      const decoded1 = api.decodeDiff(snapshot1, diff1);
      expect(decoded1.players[0]!.score).toBe(100);
      expect(decoded1.players[1]!.score).toBe(200);
    });

    it("should track map value updates across snapshots", () => {
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      const state = track({
        players: [],
        round: 1,
        metadata: new Map<string, string>([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
      }) as GameState;

      // Take initial snapshot
      const snapshot1 = api.clone(state);

      // Update existing key (not add or delete)
      state.metadata.set("key1", "updated1");
      const snapshot2 = api.clone(state);

      // Update another key after snapshot2
      state.metadata.set("key2", "updated2");

      // Diff from snapshot1 should include both updates
      const diff1 = api.encodeDiff(snapshot1, state);
      const decoded1 = api.decodeDiff(snapshot1, diff1);
      expect(decoded1.metadata.get("key1")).toBe("updated1");
      expect(decoded1.metadata.get("key2")).toBe("updated2");

      // Diff from snapshot2 should only include key2 update
      const diff2 = api.encodeDiff(snapshot2, state);
      const decoded2 = api.decodeDiff(snapshot2, diff2);
      expect(decoded2.metadata.get("key1")).toBe("updated1");
      expect(decoded2.metadata.get("key2")).toBe("updated2");
    });
  });
});
