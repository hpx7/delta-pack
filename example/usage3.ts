import { Snapshot } from "./output3.ts";
import assert from "assert";
import { NO_DIFF } from "../helpers.ts";

const state1: Snapshot = {
  entities: [
    {
      entityId: 0,
      components: [
        { type: "Color", val: "red" },
        { type: "Position", val: { x: 0, y: 0, z: 0 } },
        { type: "Rotation", val: { x: 0, y: 0, z: 0, w: 0 } },
        { type: "Size3D", val: { width: 1, height: 1, depth: 1 } },
        { type: "Size1D", val: 1 },
        { type: "EntityEvent", val: "DESTROYED" },
        { type: "EntityState", val: "IDLE" },
      ],
    },
    {
      entityId: 1,
      components: [
        {
          type: "ChatList",
          val: {
            messages: [
              { author: "user1", content: "hello, world!" },
              { author: "user2", content: "hi there" },
            ],
          },
        },
      ],
    },
  ],
};

console.log(Snapshot.encode(state1));
// Uint8Array(100)

const state2: Snapshot = {
  entities: [
    {
      entityId: 0,
      components: [
        { type: "Color", val: "blue" },
        { type: "Position", val: { x: 10, y: 0, z: 0 } },
        { type: "Rotation", val: { x: 0, y: 0, z: 0, w: 1 } },
        { type: "Size3D", val: { width: 2, height: 2, depth: 2 } },
        { type: "Size1D", val: 2 },
        { type: "EntityEvent", val: "DESTROYED" },
        { type: "EntityState", val: "WALK" },
      ],
    },
    {
      entityId: 1,
      components: [
        {
          type: "ChatList",
          val: {
            messages: [
              { author: "user1", content: "hello, world!" },
              { author: "user2", content: "hi there" },
            ],
          },
        },
      ],
    },
  ],
};

console.log(Snapshot.encode(state2));
// Uint8Array(101);

const diff = Snapshot.computeDiff(state1, state2);
console.log(
  "diff",
  JSON.stringify(diff, (k, v) => (v instanceof Map ? Object.fromEntries(v) : v), 2),
);
const encodedDiff = Snapshot.encodeDiff(diff);
console.log("encodedDiff", encodedDiff);
// Uint8Array(45)

const decodedDiff = Snapshot.decodeDiff(encodedDiff);
const applied = Snapshot.applyDiff(state1, decodedDiff);
assert.notEqual(state1, applied);
assert.equal(Snapshot.computeDiff(applied, state2), NO_DIFF);
