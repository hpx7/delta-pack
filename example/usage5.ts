import assert from "assert";
import { GameState } from "./output5.ts";
import { Tracker, DeepPartial, NO_DIFF, Reader, Writer } from "../helpers.ts";

const state1: GameState = {
  creatures: new Map(),
  items: [],
  effects: [],
  objects: [],
  players: [
    {
      id: "pJmLTr3ekWjP",
      name: "Jade Louse",
      randomSlots: [],
      restrictionZones: "",
    },
  ],
  spectators: [],
  info: {
    mode: "1v1",
    timeLimit: 600,
  },
  debugBodies: [],
};

const encoded = GameState.encode(state1).toBuffer();
console.log("encoded", encoded);

const decoded = GameState.decode(new Reader(encoded));
assert.equal(GameState.computeDiff(state1, decoded), NO_DIFF);

const state2: GameState = {
  creatures: new Map(),
  items: [],
  effects: [],
  objects: [],
  players: [
    {
      id: "iSfj9vIZlNIJK0BvpgW9iiEJErzdWVP8",
      name: "Aseph",
      team: "blue",
      cents: 1000,
      deck: {
        card1: "cleric",
        card2: "goblinCatapult",
        card3: "golem",
        card4: "offenseUp",
        card5: "elf",
        card6: "halfling",
        card7: "goblin",
        card8: "healthPotion",
      },
      randomSlots: [],
      hand: {
        slot1: "cleric",
        slot2: "healthPotion",
        slot3: "goblinCatapult",
        slot4: "offenseUp",
      },
      skills: {},
      restrictionZones: "bottomRight,redBase,topRight",
    },
    {
      id: "pJmLTr3ekWjP",
      name: "Jade Louse",
      randomSlots: [],
      restrictionZones: "",
      team: "red",
    },
  ],
  spectators: [],
  info: {
    mode: "1v1",
    timeLimit: 600,
    timeElapsed: -7,
  },
  debugBodies: [],
};

const diff = GameState.computeDiff(state1, state2);
console.log(
  "diff",
  JSON.stringify(diff, (k, v) => (v instanceof Map ? [...v] : v), 2),
);
// console.log("diff", util.inspect(diff, { depth: null, colors: true }));
const encodedDiff = encodeDiff(diff);
console.log("encodedDiff", encodedDiff);
// Uint8Array(164)

const decodedDiff = decodeDiff(new Reader(encodedDiff));
const applied = GameState.applyDiff(state1, decodedDiff);
assert.equal(GameState.computeDiff(applied, state2), NO_DIFF);

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
