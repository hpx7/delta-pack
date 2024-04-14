import { Writer as _Writer, Reader as _Reader } from "bin-serde";

const _NO_DIFF = Symbol("NODIFF");
type _DeepPartial<T> = T extends string | number | boolean | undefined
  ? T
  : T extends Array<infer ArrayType>
  ? Array<_DeepPartial<ArrayType> | typeof _NO_DIFF> | typeof _NO_DIFF
  : T extends { type: string; val: any }
  ? { type: T["type"]; val: _DeepPartial<T["val"] | typeof _NO_DIFF> }
  : { [K in keyof T]: _DeepPartial<T[K]> | typeof _NO_DIFF };

class _Tracker {
  constructor(private bits: boolean[] = [], private idx = 0) {}
  push(val: boolean) {
    this.bits.push(val);
  }
  next() {
    return this.bits[this.idx++];
  }
}

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

    validationErrors = validatePrimitive(Number.isInteger(obj.value), `Invalid int: ${ obj.value }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Card.value");
    }
    validationErrors = validatePrimitive(obj.color in Color, `Invalid Color: ${ obj.color }`);
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

    validationErrors = validatePrimitive(typeof obj.id === "string", `Invalid string: ${ obj.id }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.id");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.numCards), `Invalid int: ${ obj.numCards }`);
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
    validationErrors = validateOptional(obj.turn, (x) => validatePrimitive(typeof x === "string", `Invalid string: ${ x }`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.turn");
    }
    validationErrors = validateOptional(obj.pile, (x) => Card.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.pile");
    }
    validationErrors = validateOptional(obj.winner, (x) => validatePrimitive(typeof x === "string", `Invalid string: ${ x }`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.winner");
    }
    validationErrors = validateArray(obj.intArray, (x) => validatePrimitive(Number.isInteger(x), `Invalid int: ${ x }`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.intArray");
    }
    validationErrors = validateOptional(obj.intOptional, (x) => validatePrimitive(Number.isInteger(x), `Invalid int: ${ x }`));
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
      const validationErrors = validatePrimitive(typeof obj.val === "string", `Invalid string: ${ obj.val }`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: UnionTest");
      }
      return validationErrors;
    }
    else if (obj.type === "Color") {
      const validationErrors = validatePrimitive(obj.val in Color, `Invalid Color: ${ obj.val }`);
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
      const x = obj.val;
      writeString(buf, x);
    }
    else if (obj.type === "Color") {
      writeUInt8(buf, 1);
      const x = obj.val;
      writeUInt8(buf, x);
    }
    else if (obj.type === "Card") {
      writeUInt8(buf, 2);
      const x = obj.val;
      Card.encode(x, buf);
    }
    return buf;
  },
  encodeDiff(obj: _DeepPartial<UnionTest>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    if (obj.type === "UserId") {
      writeUInt8(buf, 0);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
        const x = obj.val;
        writeString(buf, x);
      }
    }
    else if (obj.type === "Color") {
      writeUInt8(buf, 1);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
        const x = obj.val;
        writeUInt8(buf, x);
      }
    }
    else if (obj.type === "Card") {
      writeUInt8(buf, 2);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
        const x = obj.val;
        Card.encodeDiff(x, tracker, buf);
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

function validatePrimitive(isValid: boolean, errorMessage: string) {
  return isValid ? [] : [errorMessage];
}
function validateOptional<T>(val: T | undefined, innerValidate: (x: T) => string[]) {
  if (val !== undefined) {
    return innerValidate(val);
  }
  return [];
}
function validateArray<T>(arr: T[], innerValidate: (x: T) => string[]) {
  if (!Array.isArray(arr)) {
    return ["Invalid array: " + arr];
  }
  for (let i = 0; i < arr.length; i++) {
    const validationErrors = innerValidate(arr[i]);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid array item at index " + i);
    }
  }
  return [];
}

function writeUInt8(buf: _Writer, x: number) {
  buf.writeUInt8(x);
}
function writeBoolean(buf: _Writer, x: boolean) {
  buf.writeUInt8(x ? 1 : 0);
}
function writeInt(buf: _Writer, x: number) {
  buf.writeVarint(x);
}
function writeFloat(buf: _Writer, x: number) {
  buf.writeFloat(x);
}
function writeString(buf: _Writer, x: string) {
  buf.writeString(x);
}
function writeOptional<T>(buf: _Writer, x: T | undefined, innerWrite: (x: T) => void) {
  writeBoolean(buf, x !== undefined);
  if (x !== undefined) {
    innerWrite(x);
  }
}
function writeArray<T>(buf: _Writer, x: T[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  for (const val of x) {
    innerWrite(val);
  }
}
function writeArrayDiff<T>(buf: _Writer, tracker: _Tracker, x: (T | typeof _NO_DIFF)[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  x.forEach((val) => {
    tracker.push(val !== _NO_DIFF);
    if (val !== _NO_DIFF) {
      innerWrite(val);
    }
  });
}

function parseUInt8(buf: _Reader): number {
  return buf.readUInt8();
}
function parseBoolean(buf: _Reader): boolean {
  return buf.readUInt8() > 0;
}
function parseInt(buf: _Reader): number {
  return buf.readVarint();
}
function parseFloat(buf: _Reader): number {
  return buf.readFloat();
}
function parseString(buf: _Reader): string {
  return buf.readString();
}
function parseOptional<T>(buf: _Reader, innerParse: (buf: _Reader) => T): T | undefined {
  return parseBoolean(buf) ? innerParse(buf) : undefined;
}
function parseArray<T>(buf: _Reader, innerParse: () => T): T[] {
  const len = buf.readUVarint();
  const arr: T[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(innerParse());
  }
  return arr;
}
function parseArrayDiff<T>(buf: _Reader, tracker: _Tracker, innerParse: () => T): (T | typeof _NO_DIFF)[] {
  const len = buf.readUVarint();
  const arr: (T | typeof _NO_DIFF)[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(tracker.next() ? innerParse() : _NO_DIFF);
  }
  return arr;
}

