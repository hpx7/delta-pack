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
  union: UnionTest;
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
  encode(obj: Card) {
    return Card._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Card, tracker: _.Tracker) {
    tracker.pushInt(obj.value);
    tracker.pushUInt(Color[obj.color]);
    return tracker;
  },
  decode(input: Uint8Array): Card {
    return Card._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Card {
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
  encodeDiff(obj: _.DeepPartial<Card> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Card._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Card>, tracker: _.Tracker) {
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
  decodeDiff(input: Uint8Array): _.DeepPartial<Card> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Card._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Card> {
    return {
      value: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      color: tracker.nextBoolean() ? Color[tracker.nextUInt()] : _.NO_DIFF,
    };
  },
  applyDiff(obj: Card, diff: _.DeepPartial<Card> | typeof _.NO_DIFF): Card {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      value: diff.value === _.NO_DIFF ? obj.value : diff.value,
      color: diff.color === _.NO_DIFF ? obj.color : diff.color,
    };
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
  encode(obj: Player) {
    return Player._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Player, tracker: _.Tracker) {
    tracker.pushString(obj.id);
    tracker.pushInt(obj.numCards);
    return tracker;
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Player {
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
  encodeDiff(obj: _.DeepPartial<Player> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Player._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Player>, tracker: _.Tracker) {
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
  decodeDiff(input: Uint8Array): _.DeepPartial<Player> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Player._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Player> {
    return {
      id: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      numCards: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Player, diff: _.DeepPartial<Player> | typeof _.NO_DIFF): Player {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      id: diff.id === _.NO_DIFF ? obj.id : diff.id,
      numCards: diff.numCards === _.NO_DIFF ? obj.numCards : diff.numCards,
    };
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
      union: UnionTest.default(),
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
    validationErrors = UnionTest.validate(obj.union);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.union");
    }

    return validationErrors;
  },
  encode(obj: PlayerState) {
    return PlayerState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: PlayerState, tracker: _.Tracker) {
    tracker.pushArray(obj.hand, (x) => Card._encode(x, tracker));
    tracker.pushArray(obj.players, (x) => Player._encode(x, tracker));
    tracker.pushOptional(obj.turn, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.pile, (x) => Card._encode(x, tracker));
    tracker.pushOptional(obj.winner, (x) => tracker.pushString(x));
    tracker.pushArray(obj.intArray, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.intOptional, (x) => tracker.pushInt(x));
    UnionTest._encode(obj.union, tracker);
    return tracker;
  },
  decode(input: Uint8Array): PlayerState {
    return PlayerState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): PlayerState {
    return {
      hand: tracker.nextArray(() => Card._decode(tracker)),
      players: tracker.nextArray(() => Player._decode(tracker)),
      turn: tracker.nextOptional(() => tracker.nextString()),
      pile: tracker.nextOptional(() => Card._decode(tracker)),
      winner: tracker.nextOptional(() => tracker.nextString()),
      intArray: tracker.nextArray(() => tracker.nextInt()),
      intOptional: tracker.nextOptional(() => tracker.nextInt()),
      union: UnionTest._decode(tracker),
    };
  },
  computeDiff(a: PlayerState, b: PlayerState): _.DeepPartial<PlayerState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<PlayerState> =  {
      hand: _.diffArray(a.hand, b.hand, (x, y) => Card.computeDiff(x, y)),
      players: _.diffArray(a.players, b.players, (x, y) => Player.computeDiff(x, y)),
      turn: _.diffOptional(a.turn, b.turn, (x, y) => _.diffPrimitive(x, y)),
      pile: _.diffOptional(a.pile, b.pile, (x, y) => Card.computeDiff(x, y)),
      winner: _.diffOptional(a.winner, b.winner, (x, y) => _.diffPrimitive(x, y)),
      intArray: _.diffArray(a.intArray, b.intArray, (x, y) => _.diffPrimitive(x, y)),
      intOptional: _.diffOptional(a.intOptional, b.intOptional, (x, y) => _.diffPrimitive(x, y)),
      union: UnionTest.computeDiff(a.union, b.union),
    };
    return diff.hand === _.NO_DIFF && diff.players === _.NO_DIFF && diff.turn === _.NO_DIFF && diff.pile === _.NO_DIFF && diff.winner === _.NO_DIFF && diff.intArray === _.NO_DIFF && diff.intOptional === _.NO_DIFF && diff.union === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<PlayerState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return PlayerState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<PlayerState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.hand !== _.NO_DIFF);
    if (obj.hand !== _.NO_DIFF) {
      tracker.pushArrayDiff<Card>(obj.hand, (x) => Card._encode(x, tracker), (x) => Card._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.players !== _.NO_DIFF);
    if (obj.players !== _.NO_DIFF) {
      tracker.pushArrayDiff<Player>(obj.players, (x) => Player._encode(x, tracker), (x) => Player._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.turn !== _.NO_DIFF);
    if (obj.turn !== _.NO_DIFF) {
      tracker.pushOptionalDiff<UserId>(obj.turn!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.pile !== _.NO_DIFF);
    if (obj.pile !== _.NO_DIFF) {
      tracker.pushOptionalDiff<Card>(obj.pile!, (x) => Card._encode(x, tracker), (x) => Card._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.winner !== _.NO_DIFF);
    if (obj.winner !== _.NO_DIFF) {
      tracker.pushOptionalDiff<UserId>(obj.winner!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.intArray !== _.NO_DIFF);
    if (obj.intArray !== _.NO_DIFF) {
      tracker.pushArrayDiff<number>(obj.intArray, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.intOptional !== _.NO_DIFF);
    if (obj.intOptional !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.intOptional!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.union !== _.NO_DIFF);
    if (obj.union !== _.NO_DIFF) {
      UnionTest._encodeDiff(obj.union, tracker);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<PlayerState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return PlayerState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<PlayerState> {
    return {
      hand: tracker.nextBoolean() ? tracker.nextArrayDiff<Card>(() => Card._decode(tracker), () => Card._decodeDiff(tracker)) : _.NO_DIFF,
      players: tracker.nextBoolean() ? tracker.nextArrayDiff<Player>(() => Player._decode(tracker), () => Player._decodeDiff(tracker)) : _.NO_DIFF,
      turn: tracker.nextBoolean() ? tracker.nextOptionalDiff<UserId>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      pile: tracker.nextBoolean() ? tracker.nextOptionalDiff<Card>(() => Card._decode(tracker), () => Card._decodeDiff(tracker)) : _.NO_DIFF,
      winner: tracker.nextBoolean() ? tracker.nextOptionalDiff<UserId>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      intArray: tracker.nextBoolean() ? tracker.nextArrayDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      intOptional: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      union: tracker.nextBoolean() ? UnionTest._decodeDiff(tracker) : _.NO_DIFF,
    };
  },
  applyDiff(obj: PlayerState, diff: _.DeepPartial<PlayerState> | typeof _.NO_DIFF): PlayerState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      hand: diff.hand === _.NO_DIFF ? obj.hand : _.patchArray<Card>(obj.hand, diff.hand, (a, b) => Card.applyDiff(a, b)),
      players: diff.players === _.NO_DIFF ? obj.players : _.patchArray<Player>(obj.players, diff.players, (a, b) => Player.applyDiff(a, b)),
      turn: diff.turn === _.NO_DIFF ? obj.turn : _.patchOptional<UserId>(obj.turn, diff.turn!, (a, b) => b),
      pile: diff.pile === _.NO_DIFF ? obj.pile : _.patchOptional<Card>(obj.pile, diff.pile!, (a, b) => Card.applyDiff(a, b)),
      winner: diff.winner === _.NO_DIFF ? obj.winner : _.patchOptional<UserId>(obj.winner, diff.winner!, (a, b) => b),
      intArray: diff.intArray === _.NO_DIFF ? obj.intArray : _.patchArray<number>(obj.intArray, diff.intArray, (a, b) => b),
      intOptional: diff.intOptional === _.NO_DIFF ? obj.intOptional : _.patchOptional<number>(obj.intOptional, diff.intOptional!, (a, b) => b),
      union: diff.union === _.NO_DIFF ? obj.union : UnionTest.applyDiff(obj.union, diff.union),
    };
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
  encode(obj: UnionTest) {
    return UnionTest._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: UnionTest, tracker: _.Tracker) {
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
      Card._encode(obj.val, tracker);
    }
    return tracker;
  },
  decode(input: Uint8Array): UnionTest {
    return UnionTest._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): UnionTest {
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "UserId", val: tracker.nextString() };
    }
    else if (type === 1) {
      return { type: "Color", val: Color[tracker.nextUInt()] };
    }
    else if (type === 2) {
      return { type: "Card", val: Card._decode(tracker) };
    }
    throw new Error("Invalid union");
  },
  computeDiff(a: UnionTest, b: UnionTest): _.DeepPartial<UnionTest> | typeof _.NO_DIFF {
    if (a.type !== b.type) {
      return { partial: false, ...b };
    }
    if (a.type === "UserId" && b.type === "UserId") {
      const valDiff = _.diffPrimitive(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    else if (a.type === "Color" && b.type === "Color") {
      const valDiff = _.diffPrimitive(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    else if (a.type === "Card" && b.type === "Card") {
      const valDiff = Card.computeDiff(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    throw new Error("Invalid union");
  },
  encodeDiff(obj: _.DeepPartial<UnionTest> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return UnionTest._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<UnionTest>, tracker: _.Tracker) {
    if (obj.type === "UserId") {
      tracker.pushUInt(0);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        tracker.pushString(obj.val);
      } else {
        tracker.pushString(obj.val);
      }
    }
    else if (obj.type === "Color") {
      tracker.pushUInt(1);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        tracker.pushUInt(Color[obj.val]);
      } else {
        tracker.pushUInt(Color[obj.val]);
      }
    }
    else if (obj.type === "Card") {
      tracker.pushUInt(2);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        Card._encodeDiff(obj.val, tracker);
      } else {
        Card._encode(obj.val, tracker);
      }
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<UnionTest> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return UnionTest._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<UnionTest> {
    const type = tracker.nextUInt();
    const partial = tracker.nextBoolean();
    if (type === 0) {
      if (partial) {
        return { partial, type: "UserId", val: tracker.nextString() };
      } else {
        return { partial, type: "UserId", val: tracker.nextString() };
      }
    }
    else if (type === 1) {
      if (partial) {
        return { partial, type: "Color", val: Color[tracker.nextUInt()] };
      } else {
        return { partial, type: "Color", val: Color[tracker.nextUInt()] };
      }
    }
    else if (type === 2) {
      if (partial) {
        return { partial, type: "Card", val: Card._decodeDiff(tracker) };
      } else {
        return { partial, type: "Card", val: Card._decode(tracker) };
      }
    }
    throw new Error("Invalid union");
  },
  applyDiff(obj: UnionTest, diff: _.DeepPartial<UnionTest> | typeof _.NO_DIFF): UnionTest {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    if (!diff.partial) {
      return diff;
    }
    if (obj.type === "UserId" && diff.type === "UserId") {
      return { type: obj.type, val: diff.val };
    }
    else if (obj.type === "Color" && diff.type === "Color") {
      return { type: obj.type, val: diff.val };
    }
    else if (obj.type === "Card" && diff.type === "Card") {
      return { type: obj.type, val: Card.applyDiff(obj.val, diff.val) };
    }
    throw new Error("Invalid union");
  },
}
