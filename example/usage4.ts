import { GameState } from "./output4";

const state1: GameState = {
  timeRemaining: 120,
  players: [
    {
      id: 1,
      position: { x: 94.5, y: 102.3 },
      health: 100,
      weapon: { name: "Sword", damage: 25 },
      stealth: false,
    },
    {
      id: 2,
      position: { x: 216.6, y: 198.1 },
      health: 100,
      weapon: { name: "Bow", damage: 15 },
      stealth: true,
    },
  ],
};

console.log(GameState.encode(state1).toBuffer());
// Uint8Array(41) [
//   129, 112,   2,  2,   0,   0, 189,  66, 154, 153,
//   204,  66, 129, 72,   1,   5,  83, 119, 111, 114,
//   100,  50,   0,  4, 154, 153,  88,  67, 154,  25,
//    70,  67, 129, 72,   1,   3,  66, 111, 119,  30,
//     1
// ]
