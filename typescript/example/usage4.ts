import util from "util";
import assert from "assert";
import { GameState } from "./output4";

const state1 = GameState.parse({
  timeRemaining: 120,
  players: new Map([
    [
      1,
      {
        position: { x: 94.5, y: 102.3 },
        health: 100,
        weapon: { name: "Sword", damage: 25 },
        stealth: false,
      },
    ],
    [
      2,
      {
        position: { x: 216.6, y: 198.1 },
        health: 100,
        weapon: { name: "Bow", damage: 15 },
        stealth: true,
      },
    ],
  ]),
});

const encoded = GameState.encode(state1);
console.log("encoded", encoded);
// Uint8Array(39)

const decoded = GameState.decode(encoded);
console.log("decoded", util.inspect(decoded, { depth: null, colors: true }));
assert(GameState.equals(decoded, state1));

const state2 = GameState.parse({
  timeRemaining: 60,
  players: new Map([
    [
      2,
      {
        ...state1.players.get(2)!,
        health: 80,
      },
    ],
    [
      3,
      {
        position: { x: 300, y: 300 },
        health: 100,
        weapon: { name: "Axe", damage: 30 },
        stealth: false,
      },
    ],
  ]),
});

const encodedDiff = GameState.encodeDiff(state1, state2);
console.log("encodedDiff", encodedDiff);
// Uint8Array(27)

const decodedDiff = GameState.decodeDiff(state1, encodedDiff);
console.log("decodedDiff", util.inspect(decodedDiff, { depth: null, colors: true }));
assert(GameState.equals(decodedDiff, state2));
