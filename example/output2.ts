import * as _ from "../helpers.ts";

export type Position = {
  x: number;
  y: number;
};
export type Velocity = {
  x: number;
  y: number;
};
export type Player = {
  id: number;
  name: string;
  type: string;
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  rotation: number;
  mass: number;
  health: number;
  depth: number;
  lifetime: number;
  radius: number;
  isSensor: boolean;
  isStatic: boolean;
  destroyed: boolean;
  owner: number;
  maxSpeed: number;
};
export type State = {
  id: number;
  state: Player[];
};


export const Position = {
  default(): Position {
    return {
      x: 0,
      y: 0,
    };
  },
  validate(obj: Position) {
    if (typeof obj !== "object") {
      return [`Invalid Position object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.x) && obj.x >= 0, `Invalid uint: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y) && obj.y >= 0, `Invalid uint: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.y");
    }

    return validationErrors;
  },
  encode(obj: Position) {
    return Position._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Position, tracker: _.Tracker) {
    tracker.pushUInt(obj.x);
    tracker.pushUInt(obj.y);
    return tracker;
  },
  decode(input: Uint8Array): Position {
    return Position._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Position {
    return {
      x: tracker.nextUInt(),
      y: tracker.nextUInt(),
    };
  },
  computeDiff(a: Position, b: Position): _.DeepPartial<Position> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Position> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
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
      tracker.pushUInt(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushUInt(obj.y);
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
      x: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
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

export const Velocity = {
  default(): Velocity {
    return {
      x: 0,
      y: 0,
    };
  },
  validate(obj: Velocity) {
    if (typeof obj !== "object") {
      return [`Invalid Velocity object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.x) && obj.x >= 0, `Invalid uint: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Velocity.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y) && obj.y >= 0, `Invalid uint: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Velocity.y");
    }

    return validationErrors;
  },
  encode(obj: Velocity) {
    return Velocity._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Velocity, tracker: _.Tracker) {
    tracker.pushUInt(obj.x);
    tracker.pushUInt(obj.y);
    return tracker;
  },
  decode(input: Uint8Array): Velocity {
    return Velocity._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Velocity {
    return {
      x: tracker.nextUInt(),
      y: tracker.nextUInt(),
    };
  },
  computeDiff(a: Velocity, b: Velocity): _.DeepPartial<Velocity> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Velocity> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Velocity> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Velocity._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Velocity>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushUInt(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushUInt(obj.y);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<Velocity> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Velocity._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Velocity> {
    return {
      x: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Velocity, diff: _.DeepPartial<Velocity> | typeof _.NO_DIFF): Velocity {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
    };
  },
};

export const Player = {
  default(): Player {
    return {
      id: 0,
      name: "",
      type: "",
      position: Position.default(),
      velocity: Velocity.default(),
      width: 0,
      height: 0,
      rotation: 0,
      mass: 0,
      health: 0,
      depth: 0,
      lifetime: 0,
      radius: 0,
      isSensor: false,
      isStatic: false,
      destroyed: false,
      owner: 0,
      maxSpeed: 0,
    };
  },
  validate(obj: Player) {
    if (typeof obj !== "object") {
      return [`Invalid Player object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.id) && obj.id >= 0, `Invalid uint: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.id");
    }
    validationErrors = _.validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.name");
    }
    validationErrors = _.validatePrimitive(typeof obj.type === "string", `Invalid string: ${obj.type}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.type");
    }
    validationErrors = Position.validate(obj.position);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.position");
    }
    validationErrors = Velocity.validate(obj.velocity);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.velocity");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.width) && obj.width >= 0, `Invalid uint: ${obj.width}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.width");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.height) && obj.height >= 0, `Invalid uint: ${obj.height}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.height");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.rotation) && obj.rotation >= 0, `Invalid uint: ${obj.rotation}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.rotation");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.mass) && obj.mass >= 0, `Invalid uint: ${obj.mass}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.mass");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.health) && obj.health >= 0, `Invalid uint: ${obj.health}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.health");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.depth) && obj.depth >= 0, `Invalid uint: ${obj.depth}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.depth");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.lifetime) && obj.lifetime >= 0, `Invalid uint: ${obj.lifetime}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.lifetime");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.radius) && obj.radius >= 0, `Invalid uint: ${obj.radius}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.radius");
    }
    validationErrors = _.validatePrimitive(typeof obj.isSensor === "boolean", `Invalid boolean: ${obj.isSensor}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isSensor");
    }
    validationErrors = _.validatePrimitive(typeof obj.isStatic === "boolean", `Invalid boolean: ${obj.isStatic}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isStatic");
    }
    validationErrors = _.validatePrimitive(typeof obj.destroyed === "boolean", `Invalid boolean: ${obj.destroyed}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.destroyed");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.owner) && obj.owner >= 0, `Invalid uint: ${obj.owner}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.owner");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.maxSpeed) && obj.maxSpeed >= 0, `Invalid uint: ${obj.maxSpeed}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.maxSpeed");
    }

    return validationErrors;
  },
  encode(obj: Player) {
    return Player._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Player, tracker: _.Tracker) {
    tracker.pushUInt(obj.id);
    tracker.pushString(obj.name);
    tracker.pushString(obj.type);
    Position._encode(obj.position, tracker);
    Velocity._encode(obj.velocity, tracker);
    tracker.pushUInt(obj.width);
    tracker.pushUInt(obj.height);
    tracker.pushUInt(obj.rotation);
    tracker.pushUInt(obj.mass);
    tracker.pushUInt(obj.health);
    tracker.pushUInt(obj.depth);
    tracker.pushUInt(obj.lifetime);
    tracker.pushUInt(obj.radius);
    tracker.pushBoolean(obj.isSensor);
    tracker.pushBoolean(obj.isStatic);
    tracker.pushBoolean(obj.destroyed);
    tracker.pushUInt(obj.owner);
    tracker.pushUInt(obj.maxSpeed);
    return tracker;
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Player {
    return {
      id: tracker.nextUInt(),
      name: tracker.nextString(),
      type: tracker.nextString(),
      position: Position._decode(tracker),
      velocity: Velocity._decode(tracker),
      width: tracker.nextUInt(),
      height: tracker.nextUInt(),
      rotation: tracker.nextUInt(),
      mass: tracker.nextUInt(),
      health: tracker.nextUInt(),
      depth: tracker.nextUInt(),
      lifetime: tracker.nextUInt(),
      radius: tracker.nextUInt(),
      isSensor: tracker.nextBoolean(),
      isStatic: tracker.nextBoolean(),
      destroyed: tracker.nextBoolean(),
      owner: tracker.nextUInt(),
      maxSpeed: tracker.nextUInt(),
    };
  },
  computeDiff(a: Player, b: Player): _.DeepPartial<Player> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Player> =  {
      id: _.diffPrimitive(a.id, b.id),
      name: _.diffPrimitive(a.name, b.name),
      type: _.diffPrimitive(a.type, b.type),
      position: Position.computeDiff(a.position, b.position),
      velocity: Velocity.computeDiff(a.velocity, b.velocity),
      width: _.diffPrimitive(a.width, b.width),
      height: _.diffPrimitive(a.height, b.height),
      rotation: _.diffPrimitive(a.rotation, b.rotation),
      mass: _.diffPrimitive(a.mass, b.mass),
      health: _.diffPrimitive(a.health, b.health),
      depth: _.diffPrimitive(a.depth, b.depth),
      lifetime: _.diffPrimitive(a.lifetime, b.lifetime),
      radius: _.diffPrimitive(a.radius, b.radius),
      isSensor: _.diffPrimitive(a.isSensor, b.isSensor),
      isStatic: _.diffPrimitive(a.isStatic, b.isStatic),
      destroyed: _.diffPrimitive(a.destroyed, b.destroyed),
      owner: _.diffPrimitive(a.owner, b.owner),
      maxSpeed: _.diffPrimitive(a.maxSpeed, b.maxSpeed),
    };
    return diff.id === _.NO_DIFF && diff.name === _.NO_DIFF && diff.type === _.NO_DIFF && diff.position === _.NO_DIFF && diff.velocity === _.NO_DIFF && diff.width === _.NO_DIFF && diff.height === _.NO_DIFF && diff.rotation === _.NO_DIFF && diff.mass === _.NO_DIFF && diff.health === _.NO_DIFF && diff.depth === _.NO_DIFF && diff.lifetime === _.NO_DIFF && diff.radius === _.NO_DIFF && diff.isSensor === _.NO_DIFF && diff.isStatic === _.NO_DIFF && diff.destroyed === _.NO_DIFF && diff.owner === _.NO_DIFF && diff.maxSpeed === _.NO_DIFF ? _.NO_DIFF : diff;
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
      tracker.pushUInt(obj.id);
    }
    tracker.pushBoolean(obj.name !== _.NO_DIFF);
    if (obj.name !== _.NO_DIFF) {
      tracker.pushString(obj.name);
    }
    tracker.pushBoolean(obj.type !== _.NO_DIFF);
    if (obj.type !== _.NO_DIFF) {
      tracker.pushString(obj.type);
    }
    tracker.pushBoolean(obj.position !== _.NO_DIFF);
    if (obj.position !== _.NO_DIFF) {
      Position._encodeDiff(obj.position, tracker);
    }
    tracker.pushBoolean(obj.velocity !== _.NO_DIFF);
    if (obj.velocity !== _.NO_DIFF) {
      Velocity._encodeDiff(obj.velocity, tracker);
    }
    tracker.pushBoolean(obj.width !== _.NO_DIFF);
    if (obj.width !== _.NO_DIFF) {
      tracker.pushUInt(obj.width);
    }
    tracker.pushBoolean(obj.height !== _.NO_DIFF);
    if (obj.height !== _.NO_DIFF) {
      tracker.pushUInt(obj.height);
    }
    tracker.pushBoolean(obj.rotation !== _.NO_DIFF);
    if (obj.rotation !== _.NO_DIFF) {
      tracker.pushUInt(obj.rotation);
    }
    tracker.pushBoolean(obj.mass !== _.NO_DIFF);
    if (obj.mass !== _.NO_DIFF) {
      tracker.pushUInt(obj.mass);
    }
    tracker.pushBoolean(obj.health !== _.NO_DIFF);
    if (obj.health !== _.NO_DIFF) {
      tracker.pushUInt(obj.health);
    }
    tracker.pushBoolean(obj.depth !== _.NO_DIFF);
    if (obj.depth !== _.NO_DIFF) {
      tracker.pushUInt(obj.depth);
    }
    tracker.pushBoolean(obj.lifetime !== _.NO_DIFF);
    if (obj.lifetime !== _.NO_DIFF) {
      tracker.pushUInt(obj.lifetime);
    }
    tracker.pushBoolean(obj.radius !== _.NO_DIFF);
    if (obj.radius !== _.NO_DIFF) {
      tracker.pushUInt(obj.radius);
    }
    tracker.pushBoolean(obj.isSensor !== _.NO_DIFF);
    if (obj.isSensor !== _.NO_DIFF) {
      tracker.pushBoolean(obj.isSensor);
    }
    tracker.pushBoolean(obj.isStatic !== _.NO_DIFF);
    if (obj.isStatic !== _.NO_DIFF) {
      tracker.pushBoolean(obj.isStatic);
    }
    tracker.pushBoolean(obj.destroyed !== _.NO_DIFF);
    if (obj.destroyed !== _.NO_DIFF) {
      tracker.pushBoolean(obj.destroyed);
    }
    tracker.pushBoolean(obj.owner !== _.NO_DIFF);
    if (obj.owner !== _.NO_DIFF) {
      tracker.pushUInt(obj.owner);
    }
    tracker.pushBoolean(obj.maxSpeed !== _.NO_DIFF);
    if (obj.maxSpeed !== _.NO_DIFF) {
      tracker.pushUInt(obj.maxSpeed);
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
      id: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      name: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      type: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      position: tracker.nextBoolean() ? Position._decodeDiff(tracker) : _.NO_DIFF,
      velocity: tracker.nextBoolean() ? Velocity._decodeDiff(tracker) : _.NO_DIFF,
      width: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      height: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      rotation: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      mass: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      health: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      depth: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      lifetime: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      radius: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      isSensor: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
      isStatic: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
      destroyed: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
      owner: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      maxSpeed: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Player, diff: _.DeepPartial<Player> | typeof _.NO_DIFF): Player {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      id: diff.id === _.NO_DIFF ? obj.id : diff.id,
      name: diff.name === _.NO_DIFF ? obj.name : diff.name,
      type: diff.type === _.NO_DIFF ? obj.type : diff.type,
      position: diff.position === _.NO_DIFF ? obj.position : Position.applyDiff(obj.position, diff.position),
      velocity: diff.velocity === _.NO_DIFF ? obj.velocity : Velocity.applyDiff(obj.velocity, diff.velocity),
      width: diff.width === _.NO_DIFF ? obj.width : diff.width,
      height: diff.height === _.NO_DIFF ? obj.height : diff.height,
      rotation: diff.rotation === _.NO_DIFF ? obj.rotation : diff.rotation,
      mass: diff.mass === _.NO_DIFF ? obj.mass : diff.mass,
      health: diff.health === _.NO_DIFF ? obj.health : diff.health,
      depth: diff.depth === _.NO_DIFF ? obj.depth : diff.depth,
      lifetime: diff.lifetime === _.NO_DIFF ? obj.lifetime : diff.lifetime,
      radius: diff.radius === _.NO_DIFF ? obj.radius : diff.radius,
      isSensor: diff.isSensor === _.NO_DIFF ? obj.isSensor : diff.isSensor,
      isStatic: diff.isStatic === _.NO_DIFF ? obj.isStatic : diff.isStatic,
      destroyed: diff.destroyed === _.NO_DIFF ? obj.destroyed : diff.destroyed,
      owner: diff.owner === _.NO_DIFF ? obj.owner : diff.owner,
      maxSpeed: diff.maxSpeed === _.NO_DIFF ? obj.maxSpeed : diff.maxSpeed,
    };
  },
};

export const State = {
  default(): State {
    return {
      id: 0,
      state: [],
    };
  },
  validate(obj: State) {
    if (typeof obj !== "object") {
      return [`Invalid State object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.id) && obj.id >= 0, `Invalid uint: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: State.id");
    }
    validationErrors = _.validateArray(obj.state, (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: State.state");
    }

    return validationErrors;
  },
  encode(obj: State) {
    return State._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: State, tracker: _.Tracker) {
    tracker.pushUInt(obj.id);
    tracker.pushArray(obj.state, (x) => Player._encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array): State {
    return State._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): State {
    return {
      id: tracker.nextUInt(),
      state: tracker.nextArray(() => Player._decode(tracker)),
    };
  },
  computeDiff(a: State, b: State): _.DeepPartial<State> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<State> =  {
      id: _.diffPrimitive(a.id, b.id),
      state: _.diffArray(a.state, b.state, (x, y) => Player.computeDiff(x, y)),
    };
    return diff.id === _.NO_DIFF && diff.state === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<State> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return State._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<State>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      tracker.pushUInt(obj.id);
    }
    tracker.pushBoolean(obj.state !== _.NO_DIFF);
    if (obj.state !== _.NO_DIFF) {
      tracker.pushArrayDiff<Player>(obj.state, (x) => Player._encode(x, tracker), (x) => Player._encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<State> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return State._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<State> {
    return {
      id: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      state: tracker.nextBoolean() ? tracker.nextArrayDiff<Player>(() => Player._decode(tracker), () => Player._decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: State, diff: _.DeepPartial<State> | typeof _.NO_DIFF): State {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      id: diff.id === _.NO_DIFF ? obj.id : diff.id,
      state: diff.state === _.NO_DIFF ? obj.state : _.patchArray<Player>(obj.state, diff.state, (a, b) => Player.applyDiff(a, b)),
    };
  },
};
