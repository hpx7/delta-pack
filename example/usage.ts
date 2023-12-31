import { Writer } from "bin-serde";
import { Color, PlayerState } from "./output";

const state1: PlayerState = {
  hand: [],
  players: [],
};

console.log(PlayerState.encode(state1, new Writer()).toBuffer());
// Uint8Array(5) [ 0, 0, 0, 0, 0 ]

const state2: PlayerState = {
  hand: [
    { value: 1, color: Color.BLUE },
    { value: 2, color: Color.RED },
  ],
  players: [
    { id: "p1", numCards: 2 },
    { id: "p2", numCards: 3 },
  ],
  turn: "p1",
};

console.log(PlayerState.encode(state2, new Writer()).toBuffer());
// Uint8Array(20) [
//   2,  2,   1,  4,   0,  2, 2,
// 112, 49,   4,  2, 112, 50, 6,
//   1,  2, 112, 49,   0,  0
// ]
