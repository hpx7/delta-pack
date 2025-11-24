import * as _ from "../helpers.ts";

export type UserId = string;

export type Color = "RED" | "BLUE" | "GREEN" | "YELLOW";
    
export type Card = {
  value: number;
  color: Color;
};
export type Player = {
  id: UserId;
  numCards: number;
};
export type PlayerState = {
  hand: Card[];
  players: Player[];
  turn?: UserId;
  pile?: Card;
  winner?: UserId;
  intArray: number[];
  intOptional?: number;
};
export type UnionTest = { type: "UserId"; val: UserId } | { type: "Color"; val: Color } | { type: "Card"; val: Card };



const Color = {
  0: "RED",
  1: "BLUE",
  2: "GREEN",
  3: "YELLOW",
  RED: 0,
  BLUE: 1,
  GREEN: 2,
  YELLOW: 3,
};

export const Card = {
  default(): Card {
    return {
      value: 0,
      color: "RED",
    };
  },
  validate(obj: Card) {
    if (typeof obj !== "object") {
      return [`Invalid Card object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.value), `Invalid int: ${obj.value}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Card.value");
    }
    validationErrors = _.validatePrimitive(obj.color in Color, `Invalid Color: ${obj.color}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Card.color");
    }

    return validationErrors;
  },
  encode(obj: Card, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushInt(obj.value);
    tracker.pushUInt(Color[obj.color]);
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Card {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      value: tracker.nextInt(),
      color: Color[tracker.nextUInt()],
    };
  },
  computeDiff(a: Card, b: Card): _.DeepPartial<Card> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Card> =  {
      value: _.diffPrimitive(a.value, b.value),
      color: _.diffPrimitive(a.color, b.color),
    };
    return diff.value === _.NO_DIFF && diff.color === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Card>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.value !== _.NO_DIFF);
    if (obj.value !== _.NO_DIFF) {
      tracker.pushInt(obj.value);
    }
    tracker.pushBoolean(obj.color !== _.NO_DIFF);
    if (obj.color !== _.NO_DIFF) {
      tracker.pushUInt(Color[obj.color]);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Card> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      value: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      color: tracker.nextBoolean() ? Color[tracker.nextUInt()] : _.NO_DIFF,
    };
  },
  applyDiff(obj: Card, diff: _.DeepPartial<Card> | typeof _.NO_DIFF): Card {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.value = diff.value === _.NO_DIFF ? obj.value : diff.value;
    obj.color = diff.color === _.NO_DIFF ? obj.color : diff.color;
    return obj;
  },
};

export const Player = {
  default(): Player {
    return {
      id: "",
      numCards: 0,
    };
  },
  validate(obj: Player) {
    if (typeof obj !== "object") {
      return [`Invalid Player object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.id === "string", `Invalid string: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.id");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.numCards), `Invalid int: ${obj.numCards}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.numCards");
    }

    return validationErrors;
  },
  encode(obj: Player, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushString(obj.id);
    tracker.pushInt(obj.numCards);
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Player {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      id: tracker.nextString(),
      numCards: tracker.nextInt(),
    };
  },
  computeDiff(a: Player, b: Player): _.DeepPartial<Player> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Player> =  {
      id: _.diffPrimitive(a.id, b.id),
      numCards: _.diffPrimitive(a.numCards, b.numCards),
    };
    return diff.id === _.NO_DIFF && diff.numCards === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Player>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      tracker.pushString(obj.id);
    }
    tracker.pushBoolean(obj.numCards !== _.NO_DIFF);
    if (obj.numCards !== _.NO_DIFF) {
      tracker.pushInt(obj.numCards);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Player> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      id: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      numCards: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Player, diff: _.DeepPartial<Player> | typeof _.NO_DIFF): Player {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.id = diff.id === _.NO_DIFF ? obj.id : diff.id;
    obj.numCards = diff.numCards === _.NO_DIFF ? obj.numCards : diff.numCards;
    return obj;
  },
};

export const PlayerState = {
  default(): PlayerState {
    return {
      hand: [],
      players: [],
      turn: undefined,
      pile: undefined,
      winner: undefined,
      intArray: [],
      intOptional: undefined,
    };
  },
  validate(obj: PlayerState) {
    if (typeof obj !== "object") {
      return [`Invalid PlayerState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateArray(obj.hand, (x) => Card.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.hand");
    }
    validationErrors = _.validateArray(obj.players, (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.players");
    }
    validationErrors = _.validateOptional(obj.turn, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.turn");
    }
    validationErrors = _.validateOptional(obj.pile, (x) => Card.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.pile");
    }
    validationErrors = _.validateOptional(obj.winner, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.winner");
    }
    validationErrors = _.validateArray(obj.intArray, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.intArray");
    }
    validationErrors = _.validateOptional(obj.intOptional, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.intOptional");
    }

    return validationErrors;
  },
  encode(obj: PlayerState, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    _.writeArray(tracker, obj.hand, (x) => Card.encode(x, tracker));
    _.writeArray(tracker, obj.players, (x) => Player.encode(x, tracker));
    _.writeOptional(tracker, obj.turn, (x) => tracker.pushString(x));
    _.writeOptional(tracker, obj.pile, (x) => Card.encode(x, tracker));
    _.writeOptional(tracker, obj.winner, (x) => tracker.pushString(x));
    _.writeArray(tracker, obj.intArray, (x) => tracker.pushInt(x));
    _.writeOptional(tracker, obj.intOptional, (x) => tracker.pushInt(x));
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): PlayerState {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      hand: _.parseArray(tracker, () => Card.decode(tracker)),
      players: _.parseArray(tracker, () => Player.decode(tracker)),
      turn: _.parseOptional(tracker, () => tracker.nextString()),
      pile: _.parseOptional(tracker, () => Card.decode(tracker)),
      winner: _.parseOptional(tracker, () => tracker.nextString()),
      intArray: _.parseArray(tracker, () => tracker.nextInt()),
      intOptional: _.parseOptional(tracker, () => tracker.nextInt()),
    };
  },
  computeDiff(a: PlayerState, b: PlayerState): _.DeepPartial<PlayerState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<PlayerState> =  {
      hand: _.diffArray(a.hand, b.hand, (x, y) => Card.computeDiff(x, y)),
      players: _.diffArray(a.players, b.players, (x, y) => Player.computeDiff(x, y)),
      turn: _.diffOptional<UserId>(a.turn, b.turn, (x, y) => _.diffPrimitive(x, y)),
      pile: _.diffOptional<Card>(a.pile, b.pile, (x, y) => Card.computeDiff(x, y)),
      winner: _.diffOptional<UserId>(a.winner, b.winner, (x, y) => _.diffPrimitive(x, y)),
      intArray: _.diffArray(a.intArray, b.intArray, (x, y) => _.diffPrimitive(x, y)),
      intOptional: _.diffOptional<number>(a.intOptional, b.intOptional, (x, y) => _.diffPrimitive(x, y)),
    };
    return diff.hand === _.NO_DIFF && diff.players === _.NO_DIFF && diff.turn === _.NO_DIFF && diff.pile === _.NO_DIFF && diff.winner === _.NO_DIFF && diff.intArray === _.NO_DIFF && diff.intOptional === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<PlayerState>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.hand !== _.NO_DIFF);
    if (obj.hand !== _.NO_DIFF) {
      _.writeArrayDiff<Card>(tracker, obj.hand, (x) => Card.encode(x, tracker), (x) => Card.encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.players !== _.NO_DIFF);
    if (obj.players !== _.NO_DIFF) {
      _.writeArrayDiff<Player>(tracker, obj.players, (x) => Player.encode(x, tracker), (x) => Player.encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.turn !== _.NO_DIFF);
    if (obj.turn !== _.NO_DIFF) {
      _.writeOptionalDiff<UserId>(tracker, obj.turn!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.pile !== _.NO_DIFF);
    if (obj.pile !== _.NO_DIFF) {
      _.writeOptionalDiff<Card>(tracker, obj.pile!, (x) => Card.encode(x, tracker), (x) => Card.encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.winner !== _.NO_DIFF);
    if (obj.winner !== _.NO_DIFF) {
      _.writeOptionalDiff<UserId>(tracker, obj.winner!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.intArray !== _.NO_DIFF);
    if (obj.intArray !== _.NO_DIFF) {
      _.writeArrayDiff<number>(tracker, obj.intArray, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.intOptional !== _.NO_DIFF);
    if (obj.intOptional !== _.NO_DIFF) {
      _.writeOptionalDiff<number>(tracker, obj.intOptional!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<PlayerState> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      hand: tracker.nextBoolean() ? _.parseArrayDiff<Card>(tracker, () => Card.decode(tracker), () => Card.decodeDiff(tracker)) : _.NO_DIFF,
      players: tracker.nextBoolean() ? _.parseArrayDiff<Player>(tracker, () => Player.decode(tracker), () => Player.decodeDiff(tracker)) : _.NO_DIFF,
      turn: tracker.nextBoolean() ? _.parseOptionalDiff<UserId>(tracker, () => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      pile: tracker.nextBoolean() ? _.parseOptionalDiff<Card>(tracker, () => Card.decode(tracker), () => Card.decodeDiff(tracker)) : _.NO_DIFF,
      winner: tracker.nextBoolean() ? _.parseOptionalDiff<UserId>(tracker, () => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      intArray: tracker.nextBoolean() ? _.parseArrayDiff<number>(tracker, () => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      intOptional: tracker.nextBoolean() ? _.parseOptionalDiff<number>(tracker, () => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
    };
  },
  applyDiff(obj: PlayerState, diff: _.DeepPartial<PlayerState> | typeof _.NO_DIFF): PlayerState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.hand = diff.hand === _.NO_DIFF ? obj.hand : _.patchArray<Card>(obj.hand, diff.hand, (a, b) => Card.applyDiff(a, b));
    obj.players = diff.players === _.NO_DIFF ? obj.players : _.patchArray<Player>(obj.players, diff.players, (a, b) => Player.applyDiff(a, b));
    obj.turn = diff.turn === _.NO_DIFF ? obj.turn : _.patchOptional<UserId>(obj.turn, diff.turn!, (a, b) => b);
    obj.pile = diff.pile === _.NO_DIFF ? obj.pile : _.patchOptional<Card>(obj.pile, diff.pile!, (a, b) => Card.applyDiff(a, b));
    obj.winner = diff.winner === _.NO_DIFF ? obj.winner : _.patchOptional<UserId>(obj.winner, diff.winner!, (a, b) => b);
    obj.intArray = diff.intArray === _.NO_DIFF ? obj.intArray : _.patchArray<number>(obj.intArray, diff.intArray, (a, b) => b);
    obj.intOptional = diff.intOptional === _.NO_DIFF ? obj.intOptional : _.patchOptional<number>(obj.intOptional, diff.intOptional!, (a, b) => b);
    return obj;
  },
};

export const UnionTest = {
  default(): UnionTest {
    return {
      type: "UserId",
      val: "",
    };
  },
  values() {
    return ["UserId", "Color", "Card"];
  },
  validate(obj: UnionTest) {
    if (obj.type === "UserId") {
      const validationErrors = _.validatePrimitive(typeof obj.val === "string", `Invalid string: ${obj.val}`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: UnionTest");
      }
      return validationErrors;
    }
    else if (obj.type === "Color") {
      const validationErrors = _.validatePrimitive(obj.val in Color, `Invalid Color: ${obj.val}`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: UnionTest");
      }
      return validationErrors;
    }
    else if (obj.type === "Card") {
      const validationErrors = Card.validate(obj.val);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: UnionTest");
      }
      return validationErrors;
    }
    else {
      return [`Invalid UnionTest union: ${obj}`];
    }
  },
  encode(obj: UnionTest, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    if (obj.type === "UserId") {
      tracker.pushUInt(0);
      tracker.pushString(obj.val);
    }
    else if (obj.type === "Color") {
      tracker.pushUInt(1);
      tracker.pushUInt(Color[obj.val]);
    }
    else if (obj.type === "Card") {
      tracker.pushUInt(2);
      Card.encode(obj.val, tracker);
    }
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): UnionTest {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "UserId", val: tracker.nextString() };
    }
    else if (type === 1) {
      return { type: "Color", val: Color[tracker.nextUInt()] };
    }
    else if (type === 2) {
      return { type: "Card", val: Card.decode(tracker) };
    }
    throw new Error("Invalid union");
  },
  encodeDiff(obj: _.DeepPartial<UnionTest>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    if (obj.type === "UserId") {
      tracker.pushUInt(0);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       tracker.pushString(obj.val);
      }
    }
    else if (obj.type === "Color") {
      tracker.pushUInt(1);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       tracker.pushUInt(Color[obj.val]);
      }
    }
    else if (obj.type === "Card") {
      tracker.pushUInt(2);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Card.encodeDiff(obj.val, tracker);
      }
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<UnionTest> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "UserId", val: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF };
    }
    else if (type === 1) {
      return { type: "Color", val: tracker.nextBoolean() ? Color[tracker.nextUInt()] : _.NO_DIFF };
    }
    else if (type === 2) {
      return { type: "Card", val: tracker.nextBoolean() ? Card.decodeDiff(tracker) : _.NO_DIFF };
    }
    throw new Error("Invalid union");
  },
}
