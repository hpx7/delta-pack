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

export type Position = {
  x: number;
  y: number;
};
export type Weapon = {
  name: string;
  damage: number;
};
export type Player = {
  id: number;
  position: Position;
  health: number;
  weapon?: Weapon;
  stealth: boolean;
};
export type GameState = {
  timeRemaining: number;
  players: Player[];
};


export const Position = {
  default(): Position {
    return {
      x: 0.0,
      y: 0.0,
    };
  },
  validate(obj: Position) {
    if (typeof obj !== "object") {
      return [`Invalid Position object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = validatePrimitive(typeof obj.x === "number", `Invalid string: ${ obj.x }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.x");
    }
    validationErrors = validatePrimitive(typeof obj.y === "number", `Invalid string: ${ obj.y }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.y");
    }

    return validationErrors;
  },
  encode(obj: Position, buf: _Writer = new _Writer()) {
    writeFloat(buf, obj.x);
    writeFloat(buf, obj.y);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Position>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.x !== _NO_DIFF);
    if (obj.x !== _NO_DIFF) {
      writeFloat(buf, obj.x);
    }
    tracker.push(obj.y !== _NO_DIFF);
    if (obj.y !== _NO_DIFF) {
      writeFloat(buf, obj.y);
    }
  },
  decode(buf: _Reader): Position {
    const sb = buf;
    return {
      x: parseFloat(sb),
      y: parseFloat(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Position> {
    const sb = buf;
    return {
      x: tracker.next() ? parseFloat(sb) : _NO_DIFF,
      y: tracker.next() ? parseFloat(sb) : _NO_DIFF,
    };
  },
}

export const Weapon = {
  default(): Weapon {
    return {
      name: "",
      damage: 0,
    };
  },
  validate(obj: Weapon) {
    if (typeof obj !== "object") {
      return [`Invalid Weapon object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = validatePrimitive(typeof obj.name === "string", `Invalid string: ${ obj.name }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Weapon.name");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.damage), `Invalid int: ${ obj.damage }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Weapon.damage");
    }

    return validationErrors;
  },
  encode(obj: Weapon, buf: _Writer = new _Writer()) {
    writeString(buf, obj.name);
    writeInt(buf, obj.damage);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Weapon>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.name !== _NO_DIFF);
    if (obj.name !== _NO_DIFF) {
      writeString(buf, obj.name);
    }
    tracker.push(obj.damage !== _NO_DIFF);
    if (obj.damage !== _NO_DIFF) {
      writeInt(buf, obj.damage);
    }
  },
  decode(buf: _Reader): Weapon {
    const sb = buf;
    return {
      name: parseString(sb),
      damage: parseInt(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Weapon> {
    const sb = buf;
    return {
      name: tracker.next() ? parseString(sb) : _NO_DIFF,
      damage: tracker.next() ? parseInt(sb) : _NO_DIFF,
    };
  },
}

export const Player = {
  default(): Player {
    return {
      id: 0,
      position: Position.default(),
      health: 0,
      weapon: undefined,
      stealth: false,
    };
  },
  validate(obj: Player) {
    if (typeof obj !== "object") {
      return [`Invalid Player object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${ obj.id }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.id");
    }
    validationErrors = Position.validate(obj.position);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.position");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.health), `Invalid int: ${ obj.health }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.health");
    }
    validationErrors = validateOptional(obj.weapon, (x) => Weapon.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.weapon");
    }
    validationErrors = validatePrimitive(typeof obj.stealth === "boolean", `Invalid string: ${ obj.stealth }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.stealth");
    }

    return validationErrors;
  },
  encode(obj: Player, buf: _Writer = new _Writer()) {
    writeInt(buf, obj.id);
    Position.encode(obj.position, buf);
    writeInt(buf, obj.health);
    writeOptional(buf, obj.weapon, (x) => Weapon.encode(x, buf));
    writeBoolean(buf, obj.stealth);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Player>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.id !== _NO_DIFF);
    if (obj.id !== _NO_DIFF) {
      writeInt(buf, obj.id);
    }
    tracker.push(obj.position !== _NO_DIFF);
    if (obj.position !== _NO_DIFF) {
      Position.encodeDiff(obj.position, tracker, buf);
    }
    tracker.push(obj.health !== _NO_DIFF);
    if (obj.health !== _NO_DIFF) {
      writeInt(buf, obj.health);
    }
    tracker.push(obj.weapon !== _NO_DIFF);
    if (obj.weapon !== _NO_DIFF) {
      writeOptional(buf, obj.weapon, (x) => Weapon.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.stealth !== _NO_DIFF);
    if (obj.stealth !== _NO_DIFF) {
      writeBoolean(buf, obj.stealth);
    }
  },
  decode(buf: _Reader): Player {
    const sb = buf;
    return {
      id: parseInt(sb),
      position: Position.decode(sb),
      health: parseInt(sb),
      weapon: parseOptional(sb, () => Weapon.decode(sb)),
      stealth: parseBoolean(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Player> {
    const sb = buf;
    return {
      id: tracker.next() ? parseInt(sb) : _NO_DIFF,
      position: tracker.next() ? Position.decodeDiff(sb, tracker) : _NO_DIFF,
      health: tracker.next() ? parseInt(sb) : _NO_DIFF,
      weapon: tracker.next() ? parseOptional(sb, () => Weapon.decodeDiff(sb, tracker)) : _NO_DIFF,
      stealth: tracker.next() ? parseBoolean(sb) : _NO_DIFF,
    };
  },
}

export const GameState = {
  default(): GameState {
    return {
      timeRemaining: 0,
      players: [],
    };
  },
  validate(obj: GameState) {
    if (typeof obj !== "object") {
      return [`Invalid GameState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = validatePrimitive(Number.isInteger(obj.timeRemaining), `Invalid int: ${ obj.timeRemaining }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.timeRemaining");
    }
    validationErrors = validateArray(obj.players, (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.players");
    }

    return validationErrors;
  },
  encode(obj: GameState, buf: _Writer = new _Writer()) {
    writeInt(buf, obj.timeRemaining);
    writeArray(buf, obj.players, (x) => Player.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: _DeepPartial<GameState>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.timeRemaining !== _NO_DIFF);
    if (obj.timeRemaining !== _NO_DIFF) {
      writeInt(buf, obj.timeRemaining);
    }
    tracker.push(obj.players !== _NO_DIFF);
    if (obj.players !== _NO_DIFF) {
      writeArrayDiff(buf, tracker, obj.players, (x) => Player.encodeDiff(x, tracker, buf));
    }
  },
  decode(buf: _Reader): GameState {
    const sb = buf;
    return {
      timeRemaining: parseInt(sb),
      players: parseArray(sb, () => Player.decode(sb)),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<GameState> {
    const sb = buf;
    return {
      timeRemaining: tracker.next() ? parseInt(sb) : _NO_DIFF,
      players: tracker.next() ? parseArrayDiff(sb, tracker, () => Player.decodeDiff(sb, tracker)) : _NO_DIFF,
    };
  },
}

