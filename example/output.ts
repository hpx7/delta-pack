import * as _ from "../helpers";

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
  encode(obj: Card, buf: _.Writer = new _.Writer()) {
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
  decode(buf: _.Reader): Card {
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
    return Object.values(diff).every((v) => v === _.NO_DIFF) ? _.NO_DIFF : diff;
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
  encode(obj: Player, buf: _.Writer = new _.Writer()) {
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
  decode(buf: _.Reader): Player {
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
    return Object.values(diff).every((v) => v === _.NO_DIFF) ? _.NO_DIFF : diff;
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
  encode(obj: PlayerState, buf: _.Writer = new _.Writer()) {
    _.writeArray(buf, obj.hand, (x) => Card.encode(x, buf));
    _.writeArray(buf, obj.players, (x) => Player.encode(x, buf));
    _.writeOptional(buf, obj.turn, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.pile, (x) => Card.encode(x, buf));
    _.writeOptional(buf, obj.winner, (x) => _.writeString(buf, x));
    _.writeArray(buf, obj.intArray, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.intOptional, (x) => _.writeInt(buf, x));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<PlayerState>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.hand !== _.NO_DIFF);
    if (obj.hand !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.hand, (x) => Card.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.players !== _.NO_DIFF);
    if (obj.players !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.players, (x) => Player.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.turn !== _.NO_DIFF);
    if (obj.turn !== _.NO_DIFF) {
      _.writeOptional(buf, obj.turn, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.pile !== _.NO_DIFF);
    if (obj.pile !== _.NO_DIFF) {
      _.writeOptional(buf, obj.pile, (x) => Card.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.winner !== _.NO_DIFF);
    if (obj.winner !== _.NO_DIFF) {
      _.writeOptional(buf, obj.winner, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.intArray !== _.NO_DIFF);
    if (obj.intArray !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.intArray, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.intOptional !== _.NO_DIFF);
    if (obj.intOptional !== _.NO_DIFF) {
      _.writeOptional(buf, obj.intOptional, (x) => _.writeInt(buf, x));
    }
    return buf;
  },
  decode(buf: _.Reader): PlayerState {
    const sb = buf;
    return {
      hand: _.parseArray(sb, () => Card.decode(sb)),
      players: _.parseArray(sb, () => Player.decode(sb)),
      turn: _.parseOptional(sb, () => _.parseString(sb)),
      pile: _.parseOptional(sb, () => Card.decode(sb)),
      winner: _.parseOptional(sb, () => _.parseString(sb)),
      intArray: _.parseArray(sb, () => _.parseInt(sb)),
      intOptional: _.parseOptional(sb, () => _.parseInt(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<PlayerState> {
    const sb = buf;
    return {
      hand: tracker.next() ? _.parseArrayDiff(sb, tracker, () => Card.decodeDiff(sb, tracker)) : _.NO_DIFF,
      players: tracker.next() ? _.parseArrayDiff(sb, tracker, () => Player.decodeDiff(sb, tracker)) : _.NO_DIFF,
      turn: tracker.next() ? _.parseOptional(sb, () => _.parseString(sb)) : _.NO_DIFF,
      pile: tracker.next() ? _.parseOptional(sb, () => Card.decodeDiff(sb, tracker)) : _.NO_DIFF,
      winner: tracker.next() ? _.parseOptional(sb, () => _.parseString(sb)) : _.NO_DIFF,
      intArray: tracker.next() ? _.parseArrayDiff(sb, tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      intOptional: tracker.next() ? _.parseOptional(sb, () => _.parseInt(sb)) : _.NO_DIFF,
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
    };
    return Object.values(diff).every((v) => v === _.NO_DIFF) ? _.NO_DIFF : diff;
  },
  applyDiff(obj: PlayerState, diff: _.DeepPartial<PlayerState> | typeof _.NO_DIFF): PlayerState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      hand: diff.hand === _.NO_DIFF ? obj.hand : _.patchArray(obj.hand, diff.hand, (a, b) => Card.applyDiff(a, b)),
      players: diff.players === _.NO_DIFF ? obj.players : _.patchArray(obj.players, diff.players, (a, b) => Player.applyDiff(a, b)),
      turn: diff.turn === _.NO_DIFF ? obj.turn : _.patchOptional(obj.turn, diff.turn, (a, b) => b),
      pile: diff.pile === _.NO_DIFF ? obj.pile : _.patchOptional(obj.pile, diff.pile, (a, b) => Card.applyDiff(a, b)),
      winner: diff.winner === _.NO_DIFF ? obj.winner : _.patchOptional(obj.winner, diff.winner, (a, b) => b),
      intArray: diff.intArray === _.NO_DIFF ? obj.intArray : _.patchArray(obj.intArray, diff.intArray, (a, b) => b),
      intOptional: diff.intOptional === _.NO_DIFF ? obj.intOptional : _.patchOptional(obj.intOptional, diff.intOptional, (a, b) => b),
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
      Card.encode(obj.val, buf);
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
      return { type: "Card", val: Card.decode(sb) };
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

