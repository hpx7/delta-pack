import util from "util";
import assert from "assert";
import { GameState } from "./output4.ts";
import { NO_DIFF } from "../helpers.ts";

const state1: GameState = {
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
};

const encoded = GameState.encode(state1);
console.log("encoded", encoded);
// Uint8Array(39)

const decoded = GameState.decode(encoded);
console.log("decoded", util.inspect(decoded, { depth: null, colors: true }));
assert.equal(GameState.computeDiff(state1, decoded), NO_DIFF);

const state2: GameState = {
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
};
const diff = GameState.computeDiff(state1, state2);
console.log("diff", util.inspect(diff, { depth: null, colors: true }));
const encodedDiff = GameState.encodeDiff(diff);
console.log("encodedDiff", encodedDiff);
// Uint8Array(27)

const decodedDiff = GameState.decodeDiff(encodedDiff);
const applied = GameState.applyDiff(state1, decodedDiff);
console.log("applied", util.inspect(applied, { depth: null, colors: true }));
assert.equal(GameState.computeDiff(applied, state2), NO_DIFF);
