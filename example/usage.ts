import assert from "assert";
import { NO_DIFF } from "../helpers.ts";
import { PlayerState } from "./output.ts";

const state1: PlayerState = {
  hand: [],
  players: [],
  intArray: [],
  union: { type: "Card", val: { value: 1, color: "BLUE" } },
};

const encodedState1 = PlayerState.encode(state1);
console.log(encodedState1);
// Uint8Array(8)
const decodedState1 = PlayerState.decode(encodedState1);
assert.equal(PlayerState.computeDiff(state1, decodedState1), NO_DIFF);

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

const encodedState2 = PlayerState.encode(state2);
console.log(encodedState2);
// Uint8Array(25)
const decodedState2 = PlayerState.decode(encodedState2);
assert.equal(PlayerState.computeDiff(state2, decodedState2), NO_DIFF);

const diff = PlayerState.computeDiff(state1, state2);
console.log(
  "diff",
  JSON.stringify(diff, (k, v) => (v instanceof Map ? Object.fromEntries(v) : v), 2),
);
const encodedDiff = PlayerState.encodeDiff(diff);
console.log("encodedDiff", encodedDiff);
// Uint8Array(26)

const decodedDiff = PlayerState.decodeDiff(encodedDiff);
const applied = PlayerState.applyDiff(state1, decodedDiff);
assert.equal(PlayerState.computeDiff(applied, state2), NO_DIFF);
