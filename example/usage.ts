import { Color, PlayerState } from "./output.ts";

const state1: PlayerState = {
  hand: [],
  players: [],
  intArray: [],
};

console.log(PlayerState.encode(state1).toBuffer());
// Uint8Array(5) [ 4, 14, 0, 0, 0 ]

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
};

console.log(PlayerState.encode(state2).toBuffer());
// Uint8Array(23) [
//   10, 211,   0,  2, 2, 1,   4,  0,
//    2,   4, 112, 49, 4, 4, 112, 50,
//    6,   1,   3,  2, 4, 6,   1
// ]
