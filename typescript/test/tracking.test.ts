import { describe, it, expect } from "vitest";
import {
  Infer,
  track,
  load,
  loadClass,
  registerSnapshot,
  ObjectType,
  EnumType,
  UnionType,
  IntType,
  StringType,
  FloatType,
  ReferenceType,
  Tracker,
  SyncSession,
} from "@hpx7/delta-pack";
import { getFieldVersions, getDeletedVersions } from "../src/tracking.js";

/** Deep-clone + stamp as a snapshot of the source — the raw-API analog of what SyncSession does. */
function snapshot<T>(api: { clone: (x: T) => T }, source: T): T {
  const snap = api.clone(source);
  if (snap != null && typeof snap === "object") {
    registerSnapshot(snap as object, source as object);
  }
  return snap;
}
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
      // Symbol-keyed writes are forwarded to the target (not silently dropped)
      // but stay outside the dirty-tracking system since the schema only
      // describes string-keyed fields.
      (state as any)[sym] = "symbol-value";
      expect(dirtySize(state)).toBe(0);
      expect((state as any)[sym]).toBe("symbol-value");
    });

    it("should handle symbol properties on arrays", () => {
      const sym = Symbol("test");
      const state = track({ items: [1, 2, 3] });
      (state.items as any)[sym] = "symbol-value";
      expect(dirtySize(state.items)).toBe(0);
      expect((state.items as any)[sym]).toBe("symbol-value");
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
      const snapshot1 = snapshot(api, state);

      // More changes
      state.y = 200;

      // Take second snapshot
      const snapshot2 = snapshot(api, state);

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
      const snapshot1 = snapshot(api, state);

      // Add key2
      state.metadata.set("key2", "value2");
      const snapshot2 = snapshot(api, state);

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
      const snap = snapshot(api, state);

      // No changes since snapshot - should still produce valid diff
      const diff = api.encodeDiff(snap, state);
      const decoded = api.decodeDiff(snap, diff);
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
      const snapshot1 = snapshot(api, state);

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
      const snapshot1 = snapshot(api, state);

      // Update existing key (not add or delete)
      state.metadata.set("key1", "updated1");
      const snapshot2 = snapshot(api, state);

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

    it("emits an update (not an addition) when a snapshot key is deleted and re-set", () => {
      // Revival scenario: a key that was in the baseline snapshot is deleted and then
      // re-set (e.g. delete+reinsert for reordering). Tracking records the key in
      // CREATED, but the encoder must recognize it still exists in the snapshot and
      // route the emission through the update path — not encode the full value as an
      // addition. Compare bytes to a control where the same field change is made via
      // a plain `set` (no delete+reinsert): the two should produce identically-sized
      // diffs.
      type GameState = Infer<typeof schema.GameState>;
      const api = load(schema.GameState);

      const makeState = () =>
        track({
          players: [],
          round: 1,
          metadata: new Map<string, string>([
            ["a", "X"],
            ["b", "Y"],
          ]),
        }) as GameState;

      // Revival path: delete "a" and re-set it with a new value.
      const revived = makeState();
      const snapRevived = snapshot(api, revived);
      revived.metadata.delete("a");
      revived.metadata.set("a", "X2");
      const diffRevived = api.encodeDiff(snapRevived, revived);

      // Control: same net value change via a plain `set`.
      const control = makeState();
      const snapControl = snapshot(api, control);
      control.metadata.set("a", "X2");
      const diffControl = api.encodeDiff(snapControl, control);

      // Both should route through the update path and produce equivalent diffs.
      expect(diffRevived.length).toBe(diffControl.length);

      // Decoded result is the same as the control in both cases.
      expect(api.decodeDiff(snapRevived, diffRevived).metadata.get("a")).toBe("X2");
      expect(api.decodeDiff(snapControl, diffControl).metadata.get("a")).toBe("X2");
    });
  });

  describe("Detachment of removed children", () => {
    // Mutating a held reference to a removed child should NOT leak dirty
    // marks back to the old container — the C# tracker (TrackedList /
    // TrackedOrderedDict) calls Detach on every removal; TS now matches.

    it("Map.delete detaches the removed value", () => {
      const state = track({ players: new Map([["p1", { x: 0, y: 0 }]]) });
      const stale = state.players.get("p1")!;
      state.players.delete("p1");
      const dirtyBefore = dirtySize(state.players);
      stale.x = 999;
      expect(dirtySize(state.players)).toBe(dirtyBefore);
    });

    it("Map.clear detaches every value", () => {
      const state = track({
        players: new Map([
          ["p1", { x: 0 }],
          ["p2", { x: 0 }],
        ]),
      });
      const a = state.players.get("p1")!;
      const b = state.players.get("p2")!;
      state.players.clear();
      const dirtyBefore = dirtySize(state.players);
      a.x = 999;
      b.x = 999;
      expect(dirtySize(state.players)).toBe(dirtyBefore);
    });

    it("Map.set detaches the prior value when overwriting an existing key", () => {
      const state = track({ players: new Map([["p1", { x: 0 }]]) });
      const stale = state.players.get("p1")!;
      state.players.set("p1", { x: 1 });
      const dirtyBefore = dirtySize(state.players);
      stale.x = 999;
      expect(dirtySize(state.players)).toBe(dirtyBefore);
    });

    it("Array.pop detaches the popped item", () => {
      const state = track({ items: [{ v: 1 }, { v: 2 }] });
      const stale = state.items.pop()!;
      const dirtyBefore = dirtySize(state.items);
      stale.v = 999;
      expect(dirtySize(state.items)).toBe(dirtyBefore);
    });

    it("Array.shift detaches the shifted item", () => {
      const state = track({ items: [{ v: 1 }, { v: 2 }] });
      const stale = state.items.shift()!;
      const dirtyBefore = dirtySize(state.items);
      stale.v = 999;
      expect(dirtySize(state.items)).toBe(dirtyBefore);
    });

    it("Array.splice detaches every removed item", () => {
      const state = track({ items: [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }] });
      const stales = state.items.splice(1, 2);
      const dirtyBefore = dirtySize(state.items);
      stales[0]!.v = 999;
      stales[1]!.v = 999;
      expect(dirtySize(state.items)).toBe(dirtyBefore);
    });

    it("Array length shrink detaches truncated items", () => {
      const state = track({ items: [{ v: 1 }, { v: 2 }, { v: 3 }] });
      const stale = state.items[2]!;
      state.items.length = 1;
      const dirtyBefore = dirtySize(state.items);
      stale.v = 999;
      expect(dirtySize(state.items)).toBe(dirtyBefore);
    });

    it("Array index assignment detaches the prior occupant", () => {
      const state = track({ items: [{ v: 1 }, { v: 2 }] });
      const stale = state.items[0]!;
      state.items[0] = { v: 99 };
      const dirtyBefore = dirtySize(state.items);
      stale.v = 999;
      expect(dirtySize(state.items)).toBe(dirtyBefore);
    });

    it("Object property reassignment detaches the prior value", () => {
      const state = track({ inner: { v: 1 } });
      const stale = state.inner;
      state.inner = { v: 2 };
      const dirtyBefore = dirtySize(state);
      stale.v = 999;
      expect(dirtySize(state)).toBe(dirtyBefore);
    });

    it("Object property delete detaches the removed value", () => {
      const state = track({ inner: { v: 1 } } as {
        inner?: { v: number };
      });
      const stale = state.inner!;
      delete state.inner;
      const dirtyBefore = dirtySize(state);
      stale.v = 999;
      expect(dirtySize(state)).toBe(dirtyBefore);
    });
  });

  describe("Per-field version filter (DiffEncoder helpers)", () => {
    // These cover the "field is not dirty" skip branch on each helper, which
    // only fires when (1) the source is tracked, (2) a snapshot was registered,
    // and (3) the field hasn't been touched since that snapshot. The wire bit
    // is the same as the value-compare-finds-equal path, so tests that only
    // check decoded values won't distinguish them — these assert the skip path
    // is exercised at all.

    it("preserves class prototype, methods, and accessors", () => {
      class Counter {
        value = 0;
        nested = { inner: 1 };
        increment(n: number) {
          this.value += n;
        }
        get doubled() {
          return this.value * 2;
        }
      }
      const tracked = track(new Counter());
      expect(tracked).toBeInstanceOf(Counter);
      expect(typeof tracked.increment).toBe("function");
      expect(tracked.doubled).toBe(0);
      // Method calls go through the proxy and dirty-track the mutation.
      tracked.increment(5);
      expect(tracked.value).toBe(5);
      expect(tracked.doubled).toBe(10);
      expect(isDirty(tracked, "value")).toBe(true);
    });

    it("skips encoding tracked enum field that hasn't changed since snapshot", () => {
      const Color = EnumType("Color", ["RED", "BLUE", "GREEN"]);
      const Holder = ObjectType("Holder", {
        color: ReferenceType(Color),
        count: IntType(),
      });
      type Holder = Infer<typeof Holder>;
      const api = load(Holder);

      const state = track<Holder>({ color: "RED", count: 0 });
      const snap = snapshot(api, state);
      // Touch only `count`; `color` hits the skip path in pushFieldEnum.
      state.count = 5;

      const diff = api.encodeDiff(snap, state);
      const decoded = api.decodeDiff(snap, diff);
      expect(decoded.color).toBe("RED");
      expect(decoded.count).toBe(5);
    });

    it("skips encoding tracked numeric fields that haven't changed since snapshot", () => {
      const Holder = ObjectType("Holder", {
        velocity: FloatType(),
        // Bounded int with min/max → bit-packed encoding (numBits set).
        level: IntType({ min: 1, max: 100 }),
        // Unbounded int → varint encoding (pushFieldInt).
        score: IntType(),
        count: IntType(),
      });
      const api = load(Holder);

      const state = track({ velocity: 1.5, level: 50, score: 42, count: 0 });
      const snap = snapshot(api, state);
      // Touch only `count`; velocity (pushFieldFloat), level
      // (pushFieldBitPackedInt), and score (pushFieldInt) all hit the skip path.
      state.count = 5;

      const diff = api.encodeDiff(snap, state);
      const decoded = api.decodeDiff(snap, diff);
      expect(decoded.velocity).toBe(1.5);
      expect(decoded.level).toBe(50);
      expect(decoded.score).toBe(42);
      expect(decoded.count).toBe(5);
    });

    it("skips encoding tracked union field that hasn't changed since snapshot", () => {
      const VariantA = ObjectType("VariantA", { value: IntType() });
      const VariantB = ObjectType("VariantB", { name: StringType() });
      const Variants = UnionType("Variants", [VariantA, VariantB]);
      const Holder = ObjectType("Holder", {
        action: ReferenceType(Variants),
        count: IntType(),
      });
      type Holder = Infer<typeof Holder>;
      const api = load(Holder);

      const state = track<Holder>({
        action: { _type: "VariantA", value: 1 },
        count: 0,
      });
      const snap = snapshot(api, state);
      // Touch only `count`; `action` hits the skip path in pushFieldDiff.
      state.count = 5;

      const diff = api.encodeDiff(snap, state);
      const decoded = api.decodeDiff(snap, diff);
      expect(decoded.action._type).toBe("VariantA");
      expect((decoded.action as { _type: "VariantA"; value: number }).value).toBe(1);
      expect(decoded.count).toBe(5);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Multi-tracker isolation. Mirrors C#'s `MultiTrackerTests` — verifies that a
  // stale snapshot held in one tracker doesn't suppress tombstone pruning or
  // SyncSession progress in another. Single-domain code keeps using
  // `Tracker.default` implicitly; multi-domain code passes an explicit tracker.

  describe("Multi-tracker isolation", () => {
    it("registers snapshots in the source's tracker, not the default", () => {
      const trackerA = new Tracker();
      const trackerB = new Tracker();

      const stateA = track({ players: new Map<string, { name: string }>() }, trackerA);
      const stateB = track({ players: new Map<string, { name: string }>() }, trackerB);

      // Snapshot earlier tests' impact on Tracker.default before mutating, so
      // we can assert these registrations don't add to it. The fresh trackers
      // start at 0, so their assertions are absolute.
      const defaultRefsBefore = Tracker.default.snapshotRefs.size;
      const snapA = { players: new Map([["p1", { name: "alice" }]]) };
      const snapB = { players: new Map([["p2", { name: "bob" }]]) };
      registerSnapshot(snapA, stateA);
      registerSnapshot(snapB, stateB);

      expect(trackerA.snapshotRefs.size).toBe(1);
      expect(trackerB.snapshotRefs.size).toBe(1);
      expect(Tracker.default.snapshotRefs.size).toBe(defaultRefsBefore);
    });

    it("tombstones in one tracker prune independently of another", () => {
      const trackerA = new Tracker();
      const trackerB = new Tracker();

      // A holds a perpetual snapshot — its `oldestVersionCached` will sit at
      // some early version forever. Without per-tracker isolation, this would
      // pin every other tracker's tombstones in memory.
      const stateA = track({ items: new Map<string, number>([["x", 1]]) }, trackerA);
      const stateBRoot = track({ items: new Map<string, number>() }, trackerB);
      const stateB = stateBRoot.items;

      // Take A's snapshot now — captures `oldestVersionCached` for tracker A.
      registerSnapshot({ items: new Map([["x", 1]]) }, stateA);

      // B churns: 10 inserts then 10 deletes → 10 tombstones.
      for (let i = 0; i < 10; i++) stateB.set(`k${i}`, i);
      for (let i = 0; i < 10; i++) stateB.delete(`k${i}`);

      const deletedB = getDeletedVersions(stateB as Map<string, number>);
      expect(deletedB!.size).toBe(10);

      // One more bump so the snapshot's version is strictly greater than every
      // existing tombstone. (Prune predicate is strict less-than.)
      stateB.set("sentinel", 0);
      stateB.delete("sentinel");

      // Register B's snapshot. Pruning runs on tracker B only — A's pin has no
      // effect here. All 10 + 1 tombstones strictly older than the new baseline
      // get pruned; the most recent may equal the baseline and survive.
      registerSnapshot({ items: new Map() }, stateBRoot);
      expect(deletedB!.size).toBeLessThanOrEqual(1);
    });

    it("sync sessions in different trackers round-trip independently", () => {
      const roomA = new Tracker();
      const roomB = new Tracker();

      const Room = ObjectType("Room", { score: IntType(), name: StringType() });
      type Room = Infer<typeof Room>;
      const api = load(Room);

      const senderA = new SyncSession<Room>(api);
      const receiverA = new SyncSession<Room>(api);
      const senderB = new SyncSession<Room>(api);
      const receiverB = new SyncSession<Room>(api);

      const stateA = track<Room>({ score: 1, name: "alice" }, roomA);
      const stateB = track<Room>({ score: 99, name: "bob" }, roomB);

      // Initial full encodes.
      receiverA.decode(senderA.encode(stateA));
      receiverB.decode(senderB.encode(stateB));

      // Diff encodes — each pair is independent.
      stateA.score = 2;
      stateB.score = 100;
      const viewA = receiverA.decode(senderA.encode(stateA));
      const viewB = receiverB.decode(senderB.encode(stateB));

      expect(viewA.name).toBe("alice");
      expect(viewA.score).toBe(2);
      expect(viewB.name).toBe("bob");
      expect(viewB.score).toBe(100);
    });

    it("default tracker is used when no tracker is passed", () => {
      const state = track({ x: 1 });
      const snap = { x: 1 };
      const refsBefore = Tracker.default.snapshotRefs.size;
      registerSnapshot(snap, state);
      expect(Tracker.default.snapshotRefs.size).toBe(refsBefore + 1);
    });

    it("nested children inherit the root's tracker", () => {
      const myTracker = new Tracker();
      const state = track({ players: new Map<string, { score: number }>([["p1", { score: 0 }]]) }, myTracker);

      // Mutating the nested player's score should produce a tombstone-free
      // event; deleting the player should bump myTracker's tombstone count,
      // not the default tracker's. (Other tests in the suite exercise the
      // default tracker, so we measure the default delta instead of asserting
      // an absolute zero.)
      const myBefore = myTracker.liveTombstones;
      const defaultBefore = Tracker.default.liveTombstones;
      state.players.delete("p1");
      expect(myTracker.liveTombstones).toBe(myBefore + 1);
      expect(Tracker.default.liveTombstones).toBe(defaultBefore);
    });

    it("grafting a tracked object across trackers adopts the new tracker (object children)", () => {
      const trackerA = new Tracker();
      const trackerB = new Tracker();

      const stateA = track({ sub: { players: new Map<string, { v: number }>([["p1", { v: 1 }]]) } }, trackerA);
      const stateB = track({ holder: null as null | typeof stateA.sub }, trackerB);

      // Move sub from A's tree into B's tree. This hits the already-tracked
      // fast-path in `attach`, which detects the tracker mismatch and walks
      // `adoptTracker` to re-bind the whole subtree (including the inner Map).
      stateB.holder = stateA.sub;

      // Subsequent tombstone bookkeeping must land in trackerB, not trackerA.
      const aBefore = trackerA.liveTombstones;
      const bBefore = trackerB.liveTombstones;
      stateB.holder!.players.delete("p1");
      expect(trackerB.liveTombstones).toBe(bBefore + 1);
      expect(trackerA.liveTombstones).toBe(aBefore);
    });

    it("grafting a tracked array across trackers adopts the new tracker (array children)", () => {
      const trackerA = new Tracker();
      const trackerB = new Tracker();

      // Build a subtree under A that contains an array of tracked objects.
      // Each object inside the array must also adopt the new tracker.
      const stateA = track({ items: [{ players: new Map<string, number>([["p1", 1]]) }] }, trackerA);
      const stateB = track({ moved: null as null | typeof stateA.items }, trackerB);

      stateB.moved = stateA.items;

      const aBefore = trackerA.liveTombstones;
      const bBefore = trackerB.liveTombstones;
      stateB.moved![0]!.players.delete("p1");
      expect(trackerB.liveTombstones).toBe(bBefore + 1);
      expect(trackerA.liveTombstones).toBe(aBefore);
    });

    it("grafting a tracked map across trackers adopts the new tracker (map values)", () => {
      const trackerA = new Tracker();
      const trackerB = new Tracker();

      // The map's VALUES are themselves tracked objects with a nested Map —
      // adoptTracker must recurse into them.
      const stateA = track(
        {
          pool: new Map<string, { items: Map<string, number> }>([["g1", { items: new Map([["x", 1]]) }]]),
        },
        trackerA
      );
      const stateB = track({ borrowed: null as null | typeof stateA.pool }, trackerB);

      stateB.borrowed = stateA.pool;

      const aBefore = trackerA.liveTombstones;
      const bBefore = trackerB.liveTombstones;
      // Delete from the inner map of a value reachable through the moved Map.
      stateB.borrowed!.get("g1")!.items.delete("x");
      expect(trackerB.liveTombstones).toBe(bBefore + 1);
      expect(trackerA.liveTombstones).toBe(aBefore);
    });

    it("registerSnapshot is a no-op for an untracked source", () => {
      // The early-return path in registerSnapshot — source has no field
      // versions, so nothing happens. Asserts we don't throw and don't
      // touch any tracker's snapshotRefs.
      const tracker = new Tracker();
      const snapshotsBefore = tracker.snapshotRefs.size;
      registerSnapshot({ x: 1 }, { x: 1 }); // both untracked
      expect(tracker.snapshotRefs.size).toBe(snapshotsBefore);
    });

    it("getFieldVersions handles null and primitive inputs", () => {
      // Defensive branches in `getFieldVersions` — input must be a non-null
      // object to look up the symbol slot. Caller code (encoder) doesn't
      // trip this in practice but the guards exist for safety; cover the
      // negative paths here.
      expect(getFieldVersions(null)).toBeUndefined();
      expect(getFieldVersions(undefined)).toBeUndefined();
      expect(getFieldVersions(42)).toBeUndefined();
      expect(getFieldVersions("abc")).toBeUndefined();
    });

    it("rebuilds oldest version after REBUILD_INTERVAL prunes", () => {
      // Pruning increments `encodesSinceRebuild`; on the 1024th tick it runs
      // `rebuildOldestVersion`. The simplest way to drive this is a churn
      // loop that produces a tombstone and registers a fresh snapshot per
      // iteration — each register triggers `pruneDeleted`, which keeps
      // `liveTombstones > 0` so the rebuild branch eventually fires.
      const tracker = new Tracker();
      const state = track({ items: new Map<string, number>() }, tracker);
      // Seed one perpetual entry so deletes always have something to remove.
      state.items.set("seed", 0);

      for (let i = 0; i < 1100; i++) {
        state.items.set(`k${i}`, i);
        state.items.delete(`k${i}`);
        // Register a fresh snapshot — each call invokes pruneDeleted on the
        // tracker, which is what bumps encodesSinceRebuild.
        registerSnapshot({ items: new Map() }, state);
      }

      // After 1100 prunes, the rebuild has fired and the counter wrapped back
      // below the threshold. The actual cached version isn't asserted (depends
      // on GC of registered snapshot stubs) — the assertion is that the
      // rebuild branch was hit at least once.
      expect(tracker.encodesSinceRebuild).toBeLessThan(1024);
    });
  });
});
