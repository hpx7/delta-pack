import util from "util";
import { Reader, Writer } from "bin-serde";
import { GameState } from "./output4";
import { _Tracker, _DeepPartial, _NO_DIFF } from "../helpers";

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
  ...JSON.parse(JSON.stringify(state1)),
  timeRemaining: 60,
};
const diff = GameState.computeDiff(state1, state2);
const encodedDiff = encodeDiff(diff);
console.log("encodedDiff", encodedDiff);
// Uint8Array(3) [ 2, 1, 120 ]

const decodedDiff = decodeDiff(new Reader(encodedDiff));
console.log("decodedDiff", util.inspect(decodedDiff, { depth: null, colors: true }));

const applied = GameState.applyDiff(state1, decodedDiff);
console.log("applied", util.inspect(applied, { depth: null, colors: true }));

function encodeDiff(diff: _DeepPartial<GameState> | typeof _NO_DIFF) {
  if (diff === _NO_DIFF) {
    return new Uint8Array(0);
  }
  const tracker = new _Tracker();
  const encodedDiff = GameState.encodeDiff(diff, tracker).toBuffer();
  const writer = new Writer();
  writer.writeUVarint(tracker.bits.length);
  writer.writeBits(tracker.bits);
  writer.writeBuffer(encodedDiff);
  return writer.toBuffer();
}

function decodeDiff(reader: Reader) {
  if (reader.remaining() === 0) {
    return _NO_DIFF;
  }
  const clientTracker = new _Tracker(reader.readBits(reader.readUVarint()));
  return GameState.decodeDiff(reader, clientTracker);
}
