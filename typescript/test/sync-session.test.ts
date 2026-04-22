import { describe, it, expect } from "vitest";
import { load, ObjectType, IntType, UIntType, StringType, RecordType, ReferenceType, track } from "../src/index.js";

const Creature = ObjectType("Creature", {
  hp: IntType(),
  name: StringType(),
});
const GameState = ObjectType("GameState", {
  creatures: RecordType(UIntType(), ReferenceType(Creature)),
});
const api = load(GameState);

describe("SyncSession", () => {
  it("round-trips a sequence of ticks", () => {
    const sender = api.createSyncSession();
    const receiver = api.createSyncSession();

    const state = {
      creatures: new Map([
        [1, { hp: 10, name: "a" }],
        [2, { hp: 20, name: "b" }],
      ]),
    };

    for (let i = 0; i < 5; i++) {
      const bytes = sender.encode(state);
      const decoded = receiver.decode(bytes);
      expect(decoded.creatures.get(1)).toEqual(state.creatures.get(1));
      expect(decoded.creatures.get(2)).toEqual(state.creatures.get(2));
      // mutate arbitrarily
      state.creatures.get(1)!.hp += 1;
    }

    expect(receiver.current()).toBeDefined();
    expect(sender.current()).toBeDefined();
  });

  it("survives issue #3: server prev reordered between encodes", () => {
    const sender = api.createSyncSession();
    const receiver = api.createSyncSession();

    const state = {
      creatures: new Map([
        [1, { hp: 10, name: "a" }],
        [2, { hp: 20, name: "b" }],
        [3, { hp: 30, name: "c" }],
      ]),
    };

    // Tick 1: initial sync
    receiver.decode(sender.encode(state));

    // Between ticks: user-side reordering via delete+reinsert.
    // Net value change: zero.
    const c1 = state.creatures.get(1)!;
    state.creatures.delete(1);
    state.creatures.set(1, c1);
    // state is now ordered [2, 3, 1] — but SyncSession's view still tracks [1, 2, 3].

    // Tick 2: real update to creature 3
    state.creatures.get(3)!.hp = 99;

    const decoded = receiver.decode(sender.encode(state));

    expect(decoded.creatures.get(1)).toEqual({ hp: 10, name: "a" });
    expect(decoded.creatures.get(2)).toEqual({ hp: 20, name: "b" });
    expect(decoded.creatures.get(3)).toEqual({ hp: 99, name: "c" }); // ← not corrupted
  });

  it("sender and receiver views converge after each tick", () => {
    const sender = api.createSyncSession();
    const receiver = api.createSyncSession();

    const state = {
      creatures: new Map([[1, { hp: 10, name: "a" }]]),
    };

    receiver.decode(sender.encode(state));
    expect(receiver.current()).toEqual(sender.current());

    state.creatures.set(2, { hp: 20, name: "b" });
    receiver.decode(sender.encode(state));
    expect(receiver.current()).toEqual(sender.current());

    state.creatures.delete(1);
    receiver.decode(sender.encode(state));
    expect(receiver.current()).toEqual(sender.current());
  });

  it("keeps tracking's version filter working across many ticks", () => {
    const sender = api.createSyncSession();
    const receiver = api.createSyncSession();

    // Start tracked and empty; add keys through the proxy so CREATED gets
    // populated — this is the bookkeeping that accumulates stale entries.
    const state = track<{ creatures: Map<number, { hp: number; name: string }> }>({
      creatures: new Map(),
    });

    // Tick 1: initial population + full encode.
    state.creatures.set(1, { hp: 10, name: "a" });
    receiver.decode(sender.encode(state));

    // Tick 2: a second key is added. Diff carries one addition + bookkeeping.
    state.creatures.set(2, { hp: 20, name: "b" });
    const tick2 = sender.encode(state);
    receiver.decode(tick2);

    // Ticks 3..N: only mutate existing values, no further additions.
    // Without registerSnapshot on the view after decodeDiff, CREATED entries
    // from ticks 1–2 have version > -1 (minVersion), so keys 1 and 2 get
    // re-emitted as additions on every tick. With the fix, minVersion
    // advances past those entries and they drop out.
    let maxSubsequent = 0;
    for (let i = 0; i < 20; i++) {
      state.creatures.get(1)!.hp += 1;
      const bytes = sender.encode(state);
      receiver.decode(bytes);
      maxSubsequent = Math.max(maxSubsequent, bytes.length);
    }

    expect(maxSubsequent).toBeLessThanOrEqual(tick2.length);
    expect(receiver.current()).toEqual(sender.current());
  });

  it("first call encodes full state; subsequent calls encode diffs", () => {
    const sender = api.createSyncSession();
    const state = {
      creatures: new Map([[1, { hp: 10, name: "a" }]]),
    };

    const fullBytes = sender.encode(state);
    const diffBytes = sender.encode(state); // no change; should be a tiny diff
    expect(diffBytes.length).toBeLessThan(fullBytes.length);
  });
});
