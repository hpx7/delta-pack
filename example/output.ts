import {
  _DeepPartial,
  _NO_DIFF,
  _Reader,
  _Tracker,
  _Writer,
  diffArray,
  diffOptional,
  diffPrimitive,
  parseArray,
  parseArrayDiff,
  parseBoolean,
  parseFloat,
  parseInt,
  parseOptional,
  parseString,
  patchArray,
  patchOptional,
  parseUInt8,
  validateArray,
  validateOptional,
  validatePrimitive,
  writeArray,
  writeArrayDiff,
  writeBoolean,
  writeFloat,
  writeInt,
  writeOptional,
  writeString,
  writeUInt8,
} from "../helpers";

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

    validationErrors = validatePrimitive(Number.isInteger(obj.value), `Invalid int: ${obj.value}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Card.value");
    }
    validationErrors = validatePrimitive(obj.color in Color, `Invalid Color: ${obj.color}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Card.color");
    }

    return validationErrors;
  },
  encode(obj: Card, buf: _Writer = new _Writer()) {
    writeInt(buf, obj.value);
    writeUInt8(buf, obj.color);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Card>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.value !== _NO_DIFF);
    if (obj.value !== _NO_DIFF) {
      writeInt(buf, obj.value);
    }
    tracker.push(obj.color !== _NO_DIFF);
    if (obj.color !== _NO_DIFF) {
      writeUInt8(buf, obj.color);
    }
    return buf;
  },
  decode(buf: _Reader): Card {
    const sb = buf;
    return {
      value: parseInt(sb),
      color: parseUInt8(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Card> {
    const sb = buf;
    return {
      value: tracker.next() ? parseInt(sb) : _NO_DIFF,
      color: tracker.next() ? parseUInt8(sb) : _NO_DIFF,
    };
  },
  computeDiff(a: Card, b: Card): _DeepPartial<Card> | typeof _NO_DIFF {
    const diff: _DeepPartial<Card> =  {
      value: diffPrimitive(a.value, b.value),
      color: diffPrimitive(a.color, b.color),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: Card, diff: _DeepPartial<Card> | typeof _NO_DIFF): Card {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      value: diff.value === _NO_DIFF ? obj.value : diff.value,
      color: diff.color === _NO_DIFF ? obj.color : diff.color,
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

    validationErrors = validatePrimitive(typeof obj.id === "string", `Invalid string: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.id");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.numCards), `Invalid int: ${obj.numCards}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.numCards");
    }

    return validationErrors;
  },
  encode(obj: Player, buf: _Writer = new _Writer()) {
    writeString(buf, obj.id);
    writeInt(buf, obj.numCards);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Player>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.id !== _NO_DIFF);
    if (obj.id !== _NO_DIFF) {
      writeString(buf, obj.id);
    }
    tracker.push(obj.numCards !== _NO_DIFF);
    if (obj.numCards !== _NO_DIFF) {
      writeInt(buf, obj.numCards);
    }
    return buf;
  },
  decode(buf: _Reader): Player {
    const sb = buf;
    return {
      id: parseString(sb),
      numCards: parseInt(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Player> {
    const sb = buf;
    return {
      id: tracker.next() ? parseString(sb) : _NO_DIFF,
      numCards: tracker.next() ? parseInt(sb) : _NO_DIFF,
    };
  },
  computeDiff(a: Player, b: Player): _DeepPartial<Player> | typeof _NO_DIFF {
    const diff: _DeepPartial<Player> =  {
      id: diffPrimitive(a.id, b.id),
      numCards: diffPrimitive(a.numCards, b.numCards),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: Player, diff: _DeepPartial<Player> | typeof _NO_DIFF): Player {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      id: diff.id === _NO_DIFF ? obj.id : diff.id,
      numCards: diff.numCards === _NO_DIFF ? obj.numCards : diff.numCards,
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

    validationErrors = validateArray(obj.hand, (x) => Card.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.hand");
    }
    validationErrors = validateArray(obj.players, (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.players");
    }
    validationErrors = validateOptional(obj.turn, (x) => validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.turn");
    }
    validationErrors = validateOptional(obj.pile, (x) => Card.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.pile");
    }
    validationErrors = validateOptional(obj.winner, (x) => validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.winner");
    }
    validationErrors = validateArray(obj.intArray, (x) => validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.intArray");
    }
    validationErrors = validateOptional(obj.intOptional, (x) => validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.intOptional");
    }

    return validationErrors;
  },
  encode(obj: PlayerState, buf: _Writer = new _Writer()) {
    writeArray(buf, obj.hand, (x) => Card.encode(x, buf));
    writeArray(buf, obj.players, (x) => Player.encode(x, buf));
    writeOptional(buf, obj.turn, (x) => writeString(buf, x));
    writeOptional(buf, obj.pile, (x) => Card.encode(x, buf));
    writeOptional(buf, obj.winner, (x) => writeString(buf, x));
    writeArray(buf, obj.intArray, (x) => writeInt(buf, x));
    writeOptional(buf, obj.intOptional, (x) => writeInt(buf, x));
    return buf;
  },
  encodeDiff(obj: _DeepPartial<PlayerState>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.hand !== _NO_DIFF);
    if (obj.hand !== _NO_DIFF) {
      writeArrayDiff(buf, tracker, obj.hand, (x) => Card.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.players !== _NO_DIFF);
    if (obj.players !== _NO_DIFF) {
      writeArrayDiff(buf, tracker, obj.players, (x) => Player.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.turn !== _NO_DIFF);
    if (obj.turn !== _NO_DIFF) {
      writeOptional(buf, obj.turn, (x) => writeString(buf, x));
    }
    tracker.push(obj.pile !== _NO_DIFF);
    if (obj.pile !== _NO_DIFF) {
      writeOptional(buf, obj.pile, (x) => Card.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.winner !== _NO_DIFF);
    if (obj.winner !== _NO_DIFF) {
      writeOptional(buf, obj.winner, (x) => writeString(buf, x));
    }
    tracker.push(obj.intArray !== _NO_DIFF);
    if (obj.intArray !== _NO_DIFF) {
      writeArrayDiff(buf, tracker, obj.intArray, (x) => writeInt(buf, x));
    }
    tracker.push(obj.intOptional !== _NO_DIFF);
    if (obj.intOptional !== _NO_DIFF) {
      writeOptional(buf, obj.intOptional, (x) => writeInt(buf, x));
    }
    return buf;
  },
  decode(buf: _Reader): PlayerState {
    const sb = buf;
    return {
      hand: parseArray(sb, () => Card.decode(sb)),
      players: parseArray(sb, () => Player.decode(sb)),
      turn: parseOptional(sb, () => parseString(sb)),
      pile: parseOptional(sb, () => Card.decode(sb)),
      winner: parseOptional(sb, () => parseString(sb)),
      intArray: parseArray(sb, () => parseInt(sb)),
      intOptional: parseOptional(sb, () => parseInt(sb)),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<PlayerState> {
    const sb = buf;
    return {
      hand: tracker.next() ? parseArrayDiff(sb, tracker, () => Card.decodeDiff(sb, tracker)) : _NO_DIFF,
      players: tracker.next() ? parseArrayDiff(sb, tracker, () => Player.decodeDiff(sb, tracker)) : _NO_DIFF,
      turn: tracker.next() ? parseOptional(sb, () => parseString(sb)) : _NO_DIFF,
      pile: tracker.next() ? parseOptional(sb, () => Card.decodeDiff(sb, tracker)) : _NO_DIFF,
      winner: tracker.next() ? parseOptional(sb, () => parseString(sb)) : _NO_DIFF,
      intArray: tracker.next() ? parseArrayDiff(sb, tracker, () => parseInt(sb)) : _NO_DIFF,
      intOptional: tracker.next() ? parseOptional(sb, () => parseInt(sb)) : _NO_DIFF,
    };
  },
  computeDiff(a: PlayerState, b: PlayerState): _DeepPartial<PlayerState> | typeof _NO_DIFF {
    const diff: _DeepPartial<PlayerState> =  {
      hand: diffArray(a.hand, b.hand, (x, y) => Card.computeDiff(x, y)),
      players: diffArray(a.players, b.players, (x, y) => Player.computeDiff(x, y)),
      turn: diffOptional(a.turn, b.turn, (x, y) => diffPrimitive(x, y)),
      pile: diffOptional(a.pile, b.pile, (x, y) => Card.computeDiff(x, y)),
      winner: diffOptional(a.winner, b.winner, (x, y) => diffPrimitive(x, y)),
      intArray: diffArray(a.intArray, b.intArray, (x, y) => diffPrimitive(x, y)),
      intOptional: diffOptional(a.intOptional, b.intOptional, (x, y) => diffPrimitive(x, y)),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: PlayerState, diff: _DeepPartial<PlayerState> | typeof _NO_DIFF): PlayerState {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      hand: diff.hand === _NO_DIFF ? obj.hand : patchArray(obj.hand, diff.hand, (a, b) => Card.applyDiff(a, b)),
      players: diff.players === _NO_DIFF ? obj.players : patchArray(obj.players, diff.players, (a, b) => Player.applyDiff(a, b)),
      turn: diff.turn === _NO_DIFF ? obj.turn : patchOptional(obj.turn, diff.turn, (a, b) => b),
      pile: diff.pile === _NO_DIFF ? obj.pile : patchOptional(obj.pile, diff.pile, (a, b) => Card.applyDiff(a, b)),
      winner: diff.winner === _NO_DIFF ? obj.winner : patchOptional(obj.winner, diff.winner, (a, b) => b),
      intArray: diff.intArray === _NO_DIFF ? obj.intArray : patchArray(obj.intArray, diff.intArray, (a, b) => b),
      intOptional: diff.intOptional === _NO_DIFF ? obj.intOptional : patchOptional(obj.intOptional, diff.intOptional, (a, b) => b),
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
      const validationErrors = validatePrimitive(typeof obj.val === "string", `Invalid string: ${obj.val}`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: UnionTest");
      }
      return validationErrors;
    }
    else if (obj.type === "Color") {
      const validationErrors = validatePrimitive(obj.val in Color, `Invalid Color: ${obj.val}`);
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
  encode(obj: UnionTest, buf: _Writer = new _Writer()) {
    if (obj.type === "UserId") {
      writeUInt8(buf, 0);
      writeString(buf, obj.val);
    }
    else if (obj.type === "Color") {
      writeUInt8(buf, 1);
      writeUInt8(buf, obj.val);
    }
    else if (obj.type === "Card") {
      writeUInt8(buf, 2);
      Card.encode(obj.val, buf);
    }
    return buf;
  },
  encodeDiff(obj: _DeepPartial<UnionTest>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    if (obj.type === "UserId") {
      writeUInt8(buf, 0);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
       writeString(buf, obj.val);
      }
    }
    else if (obj.type === "Color") {
      writeUInt8(buf, 1);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
       writeUInt8(buf, obj.val);
      }
    }
    else if (obj.type === "Card") {
      writeUInt8(buf, 2);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
       Card.encodeDiff(obj.val, tracker, buf);
      }
    }
    return buf;
  },
  decode(sb: _Reader): UnionTest {
    const type = parseUInt8(sb);
    if (type === 0) {
      return { type: "UserId", val: parseString(sb) };
    }
    else if (type === 1) {
      return { type: "Color", val: parseUInt8(sb) };
    }
    else if (type === 2) {
      return { type: "Card", val: Card.decode(sb) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(sb: _Reader, tracker: _Tracker): _DeepPartial<UnionTest> {
    const type = parseUInt8(sb);
    if (type === 0) {
      return { type: "UserId", val: parseBoolean(sb) ? parseString(sb) : _NO_DIFF };
    }
    else if (type === 1) {
      return { type: "Color", val: parseBoolean(sb) ? parseUInt8(sb) : _NO_DIFF };
    }
    else if (type === 2) {
      return { type: "Card", val: parseBoolean(sb) ? Card.decodeDiff(sb, tracker) : _NO_DIFF };
    }
    throw new Error("Invalid union");
  },
}

