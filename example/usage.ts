import assert from "assert";
import { NO_DIFF } from "../helpers.ts";
import { PlayerState } from "./output.ts";

const state1: PlayerState = {
  hand: [],
  players: [],
  intArray: [],
  union: { type: "Card", val: { value: 1, color: "BLUE" } },
};

console.log(PlayerState.encode(state1));
// Uint8Array(8) [
//   4, 14, 0, 0,
//   0,  2, 2, 1
// ]

const state2: PlayerState = {
  hand: [
    { value: 1, color: "BLUE" },
    { value: 2, color: "RED" },
  ],
  players: [
    { id: "p1", numCards: 2 },
    { id: "p2", numCards: 3 },
  ],
  turn: "p1",
  intArray: [1, 2, 3],
  intOptional: -1,
  union: { type: "Card", val: { value: 1, color: "BLUE" } },
};

console.log(PlayerState.encode(state2));
// Uint8Array(26) [
//   10, 211,   0,  2, 2, 1,   4,  0,
//    2,   4, 112, 49, 4, 4, 112, 50,
//    6,   1,   3,  2, 4, 6,   1,  2,
//    2,   1
// ]

const diff = PlayerState.computeDiff(state1, state2);
console.log(
  "diff",
  JSON.stringify(diff, (k, v) => (v instanceof Map ? Object.fromEntries(v) : v), 2),
);
const encodedDiff = PlayerState.encodeDiff(diff);
console.log("encodedDiff", encodedDiff);
// Uint8Array(28) [
//   25, 151, 180, 73, 0,   2,  2, 1,
//    4,   0,   0,  2, 4, 112, 49, 4,
//    4, 112,  50,  6, 0,   1,  3, 2,
//    4,   6,   0,  1
// ]

const decodedDiff = PlayerState.decodeDiff(encodedDiff);
const applied = PlayerState.applyDiff(state1, decodedDiff);
assert.equal(PlayerState.computeDiff(applied, state2), NO_DIFF);
