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
} from "../helpers";

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
    return buf;
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
  computeDiff(a: Position, b: Position): _DeepPartial<Position> | typeof _NO_DIFF {
    const diff: _DeepPartial<Position> =  {
      x: diffPrimitive(a.x, b.x),
      y: diffPrimitive(a.y, b.y),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: Position, diff: _DeepPartial<Position> | typeof _NO_DIFF): Position {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      x: diff.x === _NO_DIFF ? obj.x : diff.x,
      y: diff.y === _NO_DIFF ? obj.y : diff.y,
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
    return buf;
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
  computeDiff(a: Weapon, b: Weapon): _DeepPartial<Weapon> | typeof _NO_DIFF {
    const diff: _DeepPartial<Weapon> =  {
      name: diffPrimitive(a.name, b.name),
      damage: diffPrimitive(a.damage, b.damage),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: Weapon, diff: _DeepPartial<Weapon> | typeof _NO_DIFF): Weapon {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      name: diff.name === _NO_DIFF ? obj.name : diff.name,
      damage: diff.damage === _NO_DIFF ? obj.damage : diff.damage,
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
    return buf;
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
  computeDiff(a: Player, b: Player): _DeepPartial<Player> | typeof _NO_DIFF {
    const diff: _DeepPartial<Player> =  {
      id: diffPrimitive(a.id, b.id),
      position: Position.computeDiff(a.position, b.position),
      health: diffPrimitive(a.health, b.health),
      weapon: diffOptional(a.weapon, b.weapon, (x, y) => Weapon.computeDiff(x, y)),
      stealth: diffPrimitive(a.stealth, b.stealth),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: Player, diff: _DeepPartial<Player> | typeof _NO_DIFF): Player {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      id: diff.id === _NO_DIFF ? obj.id : diff.id,
      position: diff.position === _NO_DIFF ? obj.position : Position.applyDiff(obj.position, diff.position),
      health: diff.health === _NO_DIFF ? obj.health : diff.health,
      weapon: diff.weapon === _NO_DIFF ? obj.weapon : patchOptional(obj.weapon, diff.weapon, (a, b) => Weapon.applyDiff(a, b)),
      stealth: diff.stealth === _NO_DIFF ? obj.stealth : diff.stealth,
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
    return buf;
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
  computeDiff(a: GameState, b: GameState): _DeepPartial<GameState> | typeof _NO_DIFF {
    const diff: _DeepPartial<GameState> =  {
      timeRemaining: diffPrimitive(a.timeRemaining, b.timeRemaining),
      players: diffArray(a.players, b.players, (x, y) => Player.computeDiff(x, y)),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: GameState, diff: _DeepPartial<GameState> | typeof _NO_DIFF): GameState {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      timeRemaining: diff.timeRemaining === _NO_DIFF ? obj.timeRemaining : diff.timeRemaining,
      players: diff.players === _NO_DIFF ? obj.players : patchArray(obj.players, diff.players, (a, b) => Player.applyDiff(a, b)),
    };
  },
}

