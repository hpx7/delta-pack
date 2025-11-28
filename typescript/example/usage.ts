import assert from "assert";
import { PlayerState } from "./output.js";

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
assert(PlayerState.equals(decodedState1, state1));

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
assert(PlayerState.equals(decodedState2, state2));

const encodedDiff = PlayerState.encodeDiff(state1, state2);
console.log("encodedDiff", encodedDiff);
// Uint8Array(23)

const decodedDiff = PlayerState.decodeDiff(state1, encodedDiff);
console.log("decodedDiff", decodedDiff);
assert(PlayerState.equals(decodedDiff, state2));
