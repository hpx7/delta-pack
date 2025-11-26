import assert from "assert";
import { GameState } from "./output5.ts";
import { NO_DIFF } from "../helpers.ts";

const state1: GameState = {
  creatures: new Map(),
  items: new Map(),
  effects: new Map(),
  objects: new Map(),
  players: new Map([
    [
      "pJmLTr3ekWjP",
      {
        name: "Jade Louse",
        randomSlots: [],
        restrictionZones: "",
      },
    ],
  ]),
  spectators: new Map(),
  info: {
    mode: "1v1",
    timeLimit: 600,
  },
  debugBodies: [
    {
      x: 0,
      y: 0,
      points: [],
    },
  ],
};

const encoded = GameState.encode(state1);
console.log("encoded", encoded);
// Uint8Array(45)

const decoded = GameState.decode(encoded);
assert.equal(GameState.computeDiff(state1, decoded), NO_DIFF);

const state2: GameState = {
  creatures: new Map(),
  items: new Map(),
  effects: new Map(),
  objects: new Map(),
  players: new Map([
    [
      "iSfj9vIZlNIJK0BvpgW9iiEJErzdWVP8",
      {
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
    ],
    [
      "pJmLTr3ekWjP",
      {
        name: "Jade Louse",
        randomSlots: [],
        restrictionZones: "",
        team: "red",
      },
    ],
  ]),
  spectators: new Map(),
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
  JSON.stringify(diff, (k, v) => (v instanceof Map ? Object.fromEntries(v) : v), 2),
);
// console.log("diff", util.inspect(diff, { depth: null, colors: true }));
const encodedDiff = GameState.encodeDiff(diff);
console.log("encodedDiff", encodedDiff);
// Uint8Array(169)

const decodedDiff = GameState.decodeDiff(encodedDiff);
const applied = GameState.applyDiff(state1, decodedDiff);
assert.equal(GameState.computeDiff(applied, state2), NO_DIFF);
