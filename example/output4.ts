import * as _ from "../helpers.ts";

export type Position = {
  x: number;
  y: number;
};
export type Weapon = {
  name: string;
  damage: number;
};
export type Player = {
  position: Position;
  health: number;
  weapon?: Weapon;
  stealth: boolean;
};
export type GameState = {
  timeRemaining: number;
  players: Map<number, Player>;
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

    validationErrors = _.validatePrimitive(typeof obj.x === "number", `Invalid float: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.x");
    }
    validationErrors = _.validatePrimitive(typeof obj.y === "number", `Invalid float: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.y");
    }

    return validationErrors;
  },
  encode(obj: Position) {
    return Position._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Position, tracker: _.Tracker) {
    tracker.pushFloat(obj.x);
    tracker.pushFloat(obj.y);
    return tracker;
  },
  decode(input: Uint8Array): Position {
    return Position._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Position {
    return {
      x: tracker.nextFloat(),
      y: tracker.nextFloat(),
    };
  },
  computeDiff(a: Position, b: Position): _.DeepPartial<Position> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Position> =  {
      x: _.diffFloat(a.x, b.x),
      y: _.diffFloat(a.y, b.y),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Position> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Position._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Position>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushFloat(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushFloat(obj.y);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<Position> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Position._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Position> {
    return {
      x: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Position, diff: _.DeepPartial<Position> | typeof _.NO_DIFF): Position {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
    };
  },
};

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

    validationErrors = _.validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Weapon.name");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.damage), `Invalid int: ${obj.damage}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Weapon.damage");
    }

    return validationErrors;
  },
  encode(obj: Weapon) {
    return Weapon._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Weapon, tracker: _.Tracker) {
    tracker.pushString(obj.name);
    tracker.pushInt(obj.damage);
    return tracker;
  },
  decode(input: Uint8Array): Weapon {
    return Weapon._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Weapon {
    return {
      name: tracker.nextString(),
      damage: tracker.nextInt(),
    };
  },
  computeDiff(a: Weapon, b: Weapon): _.DeepPartial<Weapon> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Weapon> =  {
      name: _.diffPrimitive(a.name, b.name),
      damage: _.diffPrimitive(a.damage, b.damage),
    };
    return diff.name === _.NO_DIFF && diff.damage === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Weapon> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Weapon._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Weapon>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.name !== _.NO_DIFF);
    if (obj.name !== _.NO_DIFF) {
      tracker.pushString(obj.name);
    }
    tracker.pushBoolean(obj.damage !== _.NO_DIFF);
    if (obj.damage !== _.NO_DIFF) {
      tracker.pushInt(obj.damage);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<Weapon> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Weapon._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Weapon> {
    return {
      name: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      damage: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Weapon, diff: _.DeepPartial<Weapon> | typeof _.NO_DIFF): Weapon {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      name: diff.name === _.NO_DIFF ? obj.name : diff.name,
      damage: diff.damage === _.NO_DIFF ? obj.damage : diff.damage,
    };
  },
};

export const Player = {
  default(): Player {
    return {
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

    validationErrors = Position.validate(obj.position);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.position");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.health), `Invalid int: ${obj.health}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.health");
    }
    validationErrors = _.validateOptional(obj.weapon, (x) => Weapon.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.weapon");
    }
    validationErrors = _.validatePrimitive(typeof obj.stealth === "boolean", `Invalid boolean: ${obj.stealth}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.stealth");
    }

    return validationErrors;
  },
  encode(obj: Player) {
    return Player._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Player, tracker: _.Tracker) {
    Position._encode(obj.position, tracker);
    tracker.pushInt(obj.health);
    tracker.pushOptional(obj.weapon, (x) => Weapon._encode(x, tracker));
    tracker.pushBoolean(obj.stealth);
    return tracker;
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Player {
    return {
      position: Position._decode(tracker),
      health: tracker.nextInt(),
      weapon: tracker.nextOptional(() => Weapon._decode(tracker)),
      stealth: tracker.nextBoolean(),
    };
  },
  computeDiff(a: Player, b: Player): _.DeepPartial<Player> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Player> =  {
      position: Position.computeDiff(a.position, b.position),
      health: _.diffPrimitive(a.health, b.health),
      weapon: _.diffOptional(a.weapon, b.weapon, (x, y) => Weapon.computeDiff(x, y)),
      stealth: _.diffPrimitive(a.stealth, b.stealth),
    };
    return diff.position === _.NO_DIFF && diff.health === _.NO_DIFF && diff.weapon === _.NO_DIFF && diff.stealth === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Player> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Player._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Player>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.position !== _.NO_DIFF);
    if (obj.position !== _.NO_DIFF) {
      Position._encodeDiff(obj.position, tracker);
    }
    tracker.pushBoolean(obj.health !== _.NO_DIFF);
    if (obj.health !== _.NO_DIFF) {
      tracker.pushInt(obj.health);
    }
    tracker.pushBoolean(obj.weapon !== _.NO_DIFF);
    if (obj.weapon !== _.NO_DIFF) {
      tracker.pushOptionalDiff<Weapon>(obj.weapon!, (x) => Weapon._encode(x, tracker), (x) => Weapon._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.stealth !== _.NO_DIFF);
    if (obj.stealth !== _.NO_DIFF) {
      tracker.pushBoolean(obj.stealth);
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
      position: tracker.nextBoolean() ? Position._decodeDiff(tracker) : _.NO_DIFF,
      health: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      weapon: tracker.nextBoolean() ? tracker.nextOptionalDiff<Weapon>(() => Weapon._decode(tracker), () => Weapon._decodeDiff(tracker)) : _.NO_DIFF,
      stealth: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Player, diff: _.DeepPartial<Player> | typeof _.NO_DIFF): Player {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      position: diff.position === _.NO_DIFF ? obj.position : Position.applyDiff(obj.position, diff.position),
      health: diff.health === _.NO_DIFF ? obj.health : diff.health,
      weapon: diff.weapon === _.NO_DIFF ? obj.weapon : _.patchOptional<Weapon>(obj.weapon, diff.weapon!, (a, b) => Weapon.applyDiff(a, b)),
      stealth: diff.stealth === _.NO_DIFF ? obj.stealth : diff.stealth,
    };
  },
};

export const GameState = {
  default(): GameState {
    return {
      timeRemaining: 0,
      players: new Map(),
    };
  },
  validate(obj: GameState) {
    if (typeof obj !== "object") {
      return [`Invalid GameState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.timeRemaining), `Invalid int: ${obj.timeRemaining}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.timeRemaining");
    }
    validationErrors = _.validateRecord(obj.players, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`), (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.players");
    }

    return validationErrors;
  },
  encode(obj: GameState) {
    return GameState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: GameState, tracker: _.Tracker) {
    tracker.pushInt(obj.timeRemaining);
    tracker.pushRecord(obj.players, (x) => tracker.pushInt(x), (x) => Player._encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): GameState {
    return {
      timeRemaining: tracker.nextInt(),
      players: tracker.nextRecord(() => tracker.nextInt(), () => Player._decode(tracker)),
    };
  },
  computeDiff(a: GameState, b: GameState): _.DeepPartial<GameState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<GameState> =  {
      timeRemaining: _.diffPrimitive(a.timeRemaining, b.timeRemaining),
      players: _.diffRecord(a.players, b.players, (x, y) => Player.computeDiff(x, y)),
    };
    return diff.timeRemaining === _.NO_DIFF && diff.players === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<GameState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return GameState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<GameState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.timeRemaining !== _.NO_DIFF);
    if (obj.timeRemaining !== _.NO_DIFF) {
      tracker.pushInt(obj.timeRemaining);
    }
    tracker.pushBoolean(obj.players !== _.NO_DIFF);
    if (obj.players !== _.NO_DIFF) {
      tracker.pushRecordDiff<number, Player>(obj.players, (x) => tracker.pushInt(x), (x) => Player._encode(x, tracker), (x) => Player._encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<GameState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return GameState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<GameState> {
    return {
      timeRemaining: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      players: tracker.nextBoolean() ? tracker.nextRecordDiff<number, Player>(() => tracker.nextInt(), () => Player._decode(tracker), () => Player._decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: GameState, diff: _.DeepPartial<GameState> | typeof _.NO_DIFF): GameState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      timeRemaining: diff.timeRemaining === _.NO_DIFF ? obj.timeRemaining : diff.timeRemaining,
      players: diff.players === _.NO_DIFF ? obj.players : _.patchRecord<number, Player>(obj.players, diff.players, (a, b) => Player.applyDiff(a, b)),
    };
  },
};
