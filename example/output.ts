import * as _ from "../helpers.ts";

export type UserId = string;

export enum Color {
  RED,
  BLUE,
  GREEN,
  YELLOW,
}
    
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




export const Card = {
  default(): Card {
    return {
      value: 0,
      color: 0,
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
  encode(obj: Card, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.value);
    _.writeUInt8(buf, obj.color);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Card>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.value !== _.NO_DIFF);
    if (obj.value !== _.NO_DIFF) {
      _.writeInt(buf, obj.value);
    }
    tracker.push(obj.color !== _.NO_DIFF);
    if (obj.color !== _.NO_DIFF) {
      _.writeUInt8(buf, obj.color);
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Card {
    const sb = buf;
    return {
      value: _.parseInt(sb),
      color: _.parseUInt8(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Card> {
    const sb = buf;
    return {
      value: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      color: tracker.next() ? _.parseUInt8(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Card, b: Card): _.DeepPartial<Card> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Card> =  {
      value: _.diffPrimitive(a.value, b.value),
      color: _.diffPrimitive(a.color, b.color),
    };
    return diff.value === _.NO_DIFF && diff.color === _.NO_DIFF ? _.NO_DIFF : diff;
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
  encode(obj: Player, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeString(buf, obj.id);
    _.writeInt(buf, obj.numCards);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Player>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      _.writeString(buf, obj.id);
    }
    tracker.push(obj.numCards !== _.NO_DIFF);
    if (obj.numCards !== _.NO_DIFF) {
      _.writeInt(buf, obj.numCards);
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Player {
    const sb = buf;
    return {
      id: _.parseString(sb),
      numCards: _.parseInt(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Player> {
    const sb = buf;
    return {
      id: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      numCards: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Player, b: Player): _.DeepPartial<Player> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Player> =  {
      id: _.diffPrimitive(a.id, b.id),
      numCards: _.diffPrimitive(a.numCards, b.numCards),
    };
    return diff.id === _.NO_DIFF && diff.numCards === _.NO_DIFF ? _.NO_DIFF : diff;
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
  encode(obj: PlayerState, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeArray(buf, obj.hand, (x) => Card.encode(x, tracker, buf));
    _.writeArray(buf, obj.players, (x) => Player.encode(x, tracker, buf));
    _.writeOptional(tracker, obj.turn, (x) => _.writeString(buf, x));
    _.writeOptional(tracker, obj.pile, (x) => Card.encode(x, tracker, buf));
    _.writeOptional(tracker, obj.winner, (x) => _.writeString(buf, x));
    _.writeArray(buf, obj.intArray, (x) => _.writeInt(buf, x));
    _.writeOptional(tracker, obj.intOptional, (x) => _.writeInt(buf, x));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<PlayerState>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.hand !== _.NO_DIFF);
    if (obj.hand !== _.NO_DIFF) {
      _.writeArrayDiff<Card>(buf, tracker, obj.hand, (x) => Card.encode(x, tracker, buf), (x) => Card.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.players !== _.NO_DIFF);
    if (obj.players !== _.NO_DIFF) {
      _.writeArrayDiff<Player>(buf, tracker, obj.players, (x) => Player.encode(x, tracker, buf), (x) => Player.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.turn !== _.NO_DIFF);
    if (obj.turn !== _.NO_DIFF) {
      _.writeOptionalDiff<UserId>(tracker, obj.turn!, (x) => _.writeString(buf, x), (x) => _.writeString(buf, x));
    }
    tracker.push(obj.pile !== _.NO_DIFF);
    if (obj.pile !== _.NO_DIFF) {
      _.writeOptionalDiff<Card>(tracker, obj.pile!, (x) => Card.encode(x, tracker, buf), (x) => Card.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.winner !== _.NO_DIFF);
    if (obj.winner !== _.NO_DIFF) {
      _.writeOptionalDiff<UserId>(tracker, obj.winner!, (x) => _.writeString(buf, x), (x) => _.writeString(buf, x));
    }
    tracker.push(obj.intArray !== _.NO_DIFF);
    if (obj.intArray !== _.NO_DIFF) {
      _.writeArrayDiff<number>(buf, tracker, obj.intArray, (x) => _.writeInt(buf, x), (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.intOptional !== _.NO_DIFF);
    if (obj.intOptional !== _.NO_DIFF) {
      _.writeOptionalDiff<number>(tracker, obj.intOptional!, (x) => _.writeInt(buf, x), (x) => _.writeInt(buf, x));
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): PlayerState {
    const sb = buf;
    return {
      hand: _.parseArray(sb, () => Card.decode(sb, tracker)),
      players: _.parseArray(sb, () => Player.decode(sb, tracker)),
      turn: _.parseOptional(tracker, () => _.parseString(sb)),
      pile: _.parseOptional(tracker, () => Card.decode(sb, tracker)),
      winner: _.parseOptional(tracker, () => _.parseString(sb)),
      intArray: _.parseArray(sb, () => _.parseInt(sb)),
      intOptional: _.parseOptional(tracker, () => _.parseInt(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<PlayerState> {
    const sb = buf;
    return {
      hand: tracker.next() ? _.parseArrayDiff<Card>(sb, tracker, () => Card.decode(sb, tracker), () => Card.decodeDiff(sb, tracker)) : _.NO_DIFF,
      players: tracker.next() ? _.parseArrayDiff<Player>(sb, tracker, () => Player.decode(sb, tracker), () => Player.decodeDiff(sb, tracker)) : _.NO_DIFF,
      turn: tracker.next() ? _.parseOptionalDiff<UserId>(tracker, () => _.parseString(sb), () => _.parseString(sb)) : _.NO_DIFF,
      pile: tracker.next() ? _.parseOptionalDiff<Card>(tracker, () => Card.decode(sb, tracker), () => Card.decodeDiff(sb, tracker)) : _.NO_DIFF,
      winner: tracker.next() ? _.parseOptionalDiff<UserId>(tracker, () => _.parseString(sb), () => _.parseString(sb)) : _.NO_DIFF,
      intArray: tracker.next() ? _.parseArrayDiff<number>(sb, tracker, () => _.parseInt(sb), () => _.parseInt(sb)) : _.NO_DIFF,
      intOptional: tracker.next() ? _.parseOptionalDiff<number>(tracker, () => _.parseInt(sb), () => _.parseInt(sb)) : _.NO_DIFF,
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
  encode(obj: UnionTest, buf: _.Writer = new _.Writer()) {
    if (obj.type === "UserId") {
      _.writeUInt8(buf, 0);
      _.writeString(buf, obj.val);
    }
    else if (obj.type === "Color") {
      _.writeUInt8(buf, 1);
      _.writeUInt8(buf, obj.val);
    }
    else if (obj.type === "Card") {
      _.writeUInt8(buf, 2);
      Card.encode(obj.val, tracker, buf);
    }
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<UnionTest>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    if (obj.type === "UserId") {
      _.writeUInt8(buf, 0);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeString(buf, obj.val);
      }
    }
    else if (obj.type === "Color") {
      _.writeUInt8(buf, 1);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeUInt8(buf, obj.val);
      }
    }
    else if (obj.type === "Card") {
      _.writeUInt8(buf, 2);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Card.encodeDiff(obj.val, tracker, buf);
      }
    }
    return buf;
  },
  decode(sb: _.Reader): UnionTest {
    const type = _.parseUInt8(sb);
    if (type === 0) {
      return { type: "UserId", val: _.parseString(sb) };
    }
    else if (type === 1) {
      return { type: "Color", val: _.parseUInt8(sb) };
    }
    else if (type === 2) {
      return { type: "Card", val: Card.decode(sb, tracker) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(sb: _.Reader, tracker: _.Tracker): _.DeepPartial<UnionTest> {
    const type = _.parseUInt8(sb);
    if (type === 0) {
      return { type: "UserId", val: _.parseBoolean(sb) ? _.parseString(sb) : _.NO_DIFF };
    }
    else if (type === 1) {
      return { type: "Color", val: _.parseBoolean(sb) ? _.parseUInt8(sb) : _.NO_DIFF };
    }
    else if (type === 2) {
      return { type: "Card", val: _.parseBoolean(sb) ? Card.decodeDiff(sb, tracker) : _.NO_DIFF };
    }
    throw new Error("Invalid union");
  },
}
