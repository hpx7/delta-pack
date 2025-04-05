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
  encode(obj: Position, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    _.writeFloat(tracker, obj.x);
    _.writeFloat(tracker, obj.y);
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Position {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      x: _.parseFloat(tracker),
      y: _.parseFloat(tracker),
    };
  },
  computeDiff(a: Position, b: Position): _.DeepPartial<Position> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Position> =  {
      x: _.diffFloat(a.x, b.x),
      y: _.diffFloat(a.y, b.y),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Position>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeFloat(tracker, obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeFloat(tracker, obj.y);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Position> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      x: tracker.nextBoolean() ? _.parseFloat(tracker) : _.NO_DIFF,
      y: tracker.nextBoolean() ? _.parseFloat(tracker) : _.NO_DIFF,
    };
  },
  applyDiff(obj: Position, diff: _.DeepPartial<Position> | typeof _.NO_DIFF): Position {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    return obj;
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
  encode(obj: Weapon, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    _.writeString(tracker, obj.name);
    _.writeInt(tracker, obj.damage);
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Weapon {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      name: _.parseString(tracker),
      damage: _.parseInt(tracker),
    };
  },
  computeDiff(a: Weapon, b: Weapon): _.DeepPartial<Weapon> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Weapon> =  {
      name: _.diffPrimitive(a.name, b.name),
      damage: _.diffPrimitive(a.damage, b.damage),
    };
    return diff.name === _.NO_DIFF && diff.damage === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Weapon>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.name !== _.NO_DIFF);
    if (obj.name !== _.NO_DIFF) {
      _.writeString(tracker, obj.name);
    }
    tracker.pushBoolean(obj.damage !== _.NO_DIFF);
    if (obj.damage !== _.NO_DIFF) {
      _.writeInt(tracker, obj.damage);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Weapon> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      name: tracker.nextBoolean() ? _.parseString(tracker) : _.NO_DIFF,
      damage: tracker.nextBoolean() ? _.parseInt(tracker) : _.NO_DIFF,
    };
  },
  applyDiff(obj: Weapon, diff: _.DeepPartial<Weapon> | typeof _.NO_DIFF): Weapon {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.name = diff.name === _.NO_DIFF ? obj.name : diff.name;
    obj.damage = diff.damage === _.NO_DIFF ? obj.damage : diff.damage;
    return obj;
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
  encode(obj: Player, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    Position.encode(obj.position, tracker);
    _.writeInt(tracker, obj.health);
    _.writeOptional(tracker, obj.weapon, (x) => Weapon.encode(x, tracker));
    _.writeBoolean(tracker, obj.stealth);
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Player {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      position: Position.decode(tracker),
      health: _.parseInt(tracker),
      weapon: _.parseOptional(tracker, () => Weapon.decode(tracker)),
      stealth: _.parseBoolean(tracker),
    };
  },
  computeDiff(a: Player, b: Player): _.DeepPartial<Player> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Player> =  {
      position: Position.computeDiff(a.position, b.position),
      health: _.diffPrimitive(a.health, b.health),
      weapon: _.diffOptional<Weapon>(a.weapon, b.weapon, (x, y) => Weapon.computeDiff(x, y)),
      stealth: _.diffPrimitive(a.stealth, b.stealth),
    };
    return diff.position === _.NO_DIFF && diff.health === _.NO_DIFF && diff.weapon === _.NO_DIFF && diff.stealth === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Player>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.position !== _.NO_DIFF);
    if (obj.position !== _.NO_DIFF) {
      Position.encodeDiff(obj.position, tracker);
    }
    tracker.pushBoolean(obj.health !== _.NO_DIFF);
    if (obj.health !== _.NO_DIFF) {
      _.writeInt(tracker, obj.health);
    }
    tracker.pushBoolean(obj.weapon !== _.NO_DIFF);
    if (obj.weapon !== _.NO_DIFF) {
      _.writeOptionalDiff<Weapon>(tracker, obj.weapon!, (x) => Weapon.encode(x, tracker), (x) => Weapon.encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.stealth !== _.NO_DIFF);
    if (obj.stealth !== _.NO_DIFF) {
      _.writeBoolean(tracker, obj.stealth);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Player> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      position: tracker.nextBoolean() ? Position.decodeDiff(tracker) : _.NO_DIFF,
      health: tracker.nextBoolean() ? _.parseInt(tracker) : _.NO_DIFF,
      weapon: tracker.nextBoolean() ? _.parseOptionalDiff<Weapon>(tracker, () => Weapon.decode(tracker), () => Weapon.decodeDiff(tracker)) : _.NO_DIFF,
      stealth: tracker.nextBoolean() ? _.parseBoolean(tracker) : _.NO_DIFF,
    };
  },
  applyDiff(obj: Player, diff: _.DeepPartial<Player> | typeof _.NO_DIFF): Player {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.position = diff.position === _.NO_DIFF ? obj.position : Position.applyDiff(obj.position, diff.position);
    obj.health = diff.health === _.NO_DIFF ? obj.health : diff.health;
    obj.weapon = diff.weapon === _.NO_DIFF ? obj.weapon : _.patchOptional<Weapon>(obj.weapon, diff.weapon!, (a, b) => Weapon.applyDiff(a, b));
    obj.stealth = diff.stealth === _.NO_DIFF ? obj.stealth : diff.stealth;
    return obj;
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
  encode(obj: GameState, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    _.writeInt(tracker, obj.timeRemaining);
    _.writeRecord(tracker, obj.players, (x) => _.writeInt(tracker, x), (x) => Player.encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): GameState {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      timeRemaining: _.parseInt(tracker),
      players: _.parseRecord(tracker, () => _.parseInt(tracker), () => Player.decode(tracker)),
    };
  },
  computeDiff(a: GameState, b: GameState): _.DeepPartial<GameState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<GameState> =  {
      timeRemaining: _.diffPrimitive(a.timeRemaining, b.timeRemaining),
      players: _.diffRecord(a.players, b.players, (x, y) => Player.computeDiff(x, y)),
    };
    return diff.timeRemaining === _.NO_DIFF && diff.players === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<GameState>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.timeRemaining !== _.NO_DIFF);
    if (obj.timeRemaining !== _.NO_DIFF) {
      _.writeInt(tracker, obj.timeRemaining);
    }
    tracker.pushBoolean(obj.players !== _.NO_DIFF);
    if (obj.players !== _.NO_DIFF) {
      _.writeRecordDiff<number, Player>(tracker, obj.players, (x) => _.writeInt(tracker, x), (x) => Player.encode(x, tracker), (x) => Player.encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<GameState> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      timeRemaining: tracker.nextBoolean() ? _.parseInt(tracker) : _.NO_DIFF,
      players: tracker.nextBoolean() ? _.parseRecordDiff<number, Player>(tracker, () => _.parseInt(tracker), () => Player.decode(tracker), () => Player.decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: GameState, diff: _.DeepPartial<GameState> | typeof _.NO_DIFF): GameState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.timeRemaining = diff.timeRemaining === _.NO_DIFF ? obj.timeRemaining : diff.timeRemaining;
    obj.players = diff.players === _.NO_DIFF ? obj.players : _.patchRecord<number, Player>(obj.players, diff.players, (a, b) => Player.applyDiff(a, b));
    return obj;
  },
};
