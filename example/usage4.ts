import util from "util";
import { GameState } from "./output4.ts";
import { Tracker, DeepPartial, NO_DIFF, Reader, Writer } from "../helpers.ts";

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

const encoded = GameState.encode(state1).toBuffer();
console.log("encoded", encoded);
// Uint8Array(41) [
//   129, 112,   2,  2,   0,   0, 189,  66, 154, 153,
//   204,  66, 129, 72,   1,   5,  83, 119, 111, 114,
//   100,  50,   0,  4, 154, 153,  88,  67, 154,  25,
//    70,  67, 129, 72,   1,   3,  66, 111, 119,  30,
//     1
// ]

const decoded = GameState.decode(new Reader(encoded));
console.log("decoded", util.inspect(decoded, { depth: null, colors: true }));

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
const encodedDiff = encodeDiff(diff);
console.log("encodedDiff", encodedDiff);
// Uint8Array(27) [
//   15, 203, 127, 120,  1,   2,  2,   4,
//  129,  32,   6,   0,  0, 150, 67,   0,
//    0, 150,  67, 129, 72,   3, 65, 120,
//  101,  60,   0
// ]
// Uint8Array(27) [
//   18, 151, 255,  1, 120,  3,   4, 129,
//   32,   6,   0,  0, 150, 67,   0,   0,
//  150,  67, 129, 72,   3, 65, 120, 101,
//   60,   0,   2
// ]

const decodedDiff = decodeDiff(new Reader(encodedDiff));
const applied = GameState.applyDiff(state1, decodedDiff);
console.log("applied", util.inspect(applied, { depth: null, colors: true }));

function encodeDiff(diff: DeepPartial<GameState> | typeof NO_DIFF) {
  if (diff === NO_DIFF) {
    return new Uint8Array(0);
  }
  const tracker = new Tracker();
  const encodedDiff = GameState.encodeDiff(diff, tracker).toBuffer();
  const writer = new Writer();
  tracker.encode(writer);
  writer.writeBuffer(encodedDiff);
  return writer.toBuffer();
}

function decodeDiff(reader: Reader) {
  if (reader.remaining() === 0) {
    return NO_DIFF;
  }
  const tracker = new Tracker(reader);
  return GameState.decodeDiff(reader, tracker);
}
