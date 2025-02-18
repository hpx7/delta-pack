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

    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.y");
    }

    return validationErrors;
  },
  encode(obj: Position, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.x);
    _.writeInt(buf, obj.y);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Position>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeInt(buf, obj.y);
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Position {
    const sb = buf;
    return {
      x: _.parseInt(sb),
      y: _.parseInt(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Position> {
    const sb = buf;
    return {
      x: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Position, b: Position): _.DeepPartial<Position> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Position> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
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

    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Velocity.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Velocity.y");
    }

    return validationErrors;
  },
  encode(obj: Velocity, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.x);
    _.writeInt(buf, obj.y);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Velocity>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeInt(buf, obj.y);
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Velocity {
    const sb = buf;
    return {
      x: _.parseInt(sb),
      y: _.parseInt(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Velocity> {
    const sb = buf;
    return {
      x: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Velocity, b: Velocity): _.DeepPartial<Velocity> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Velocity> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Velocity, diff: _.DeepPartial<Velocity> | typeof _.NO_DIFF): Velocity {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    return obj;
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

    validationErrors = _.validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${obj.id}`);
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
    validationErrors = _.validatePrimitive(Number.isInteger(obj.width), `Invalid int: ${obj.width}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.width");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.height), `Invalid int: ${obj.height}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.height");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.rotation), `Invalid int: ${obj.rotation}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.rotation");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.mass), `Invalid int: ${obj.mass}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.mass");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.health), `Invalid int: ${obj.health}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.health");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.depth), `Invalid int: ${obj.depth}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.depth");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.lifetime), `Invalid int: ${obj.lifetime}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.lifetime");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.radius), `Invalid int: ${obj.radius}`);
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
    validationErrors = _.validatePrimitive(Number.isInteger(obj.owner), `Invalid int: ${obj.owner}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.owner");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.maxSpeed), `Invalid int: ${obj.maxSpeed}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.maxSpeed");
    }

    return validationErrors;
  },
  encode(obj: Player, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.id);
    _.writeString(buf, obj.name);
    _.writeString(buf, obj.type);
    Position.encode(obj.position, tracker, buf);
    Velocity.encode(obj.velocity, tracker, buf);
    _.writeInt(buf, obj.width);
    _.writeInt(buf, obj.height);
    _.writeInt(buf, obj.rotation);
    _.writeInt(buf, obj.mass);
    _.writeInt(buf, obj.health);
    _.writeInt(buf, obj.depth);
    _.writeInt(buf, obj.lifetime);
    _.writeInt(buf, obj.radius);
    _.writeBoolean(tracker, obj.isSensor);
    _.writeBoolean(tracker, obj.isStatic);
    _.writeBoolean(tracker, obj.destroyed);
    _.writeInt(buf, obj.owner);
    _.writeInt(buf, obj.maxSpeed);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Player>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      _.writeInt(buf, obj.id);
    }
    tracker.push(obj.name !== _.NO_DIFF);
    if (obj.name !== _.NO_DIFF) {
      _.writeString(buf, obj.name);
    }
    tracker.push(obj.type !== _.NO_DIFF);
    if (obj.type !== _.NO_DIFF) {
      _.writeString(buf, obj.type);
    }
    tracker.push(obj.position !== _.NO_DIFF);
    if (obj.position !== _.NO_DIFF) {
      Position.encodeDiff(obj.position, tracker, buf);
    }
    tracker.push(obj.velocity !== _.NO_DIFF);
    if (obj.velocity !== _.NO_DIFF) {
      Velocity.encodeDiff(obj.velocity, tracker, buf);
    }
    tracker.push(obj.width !== _.NO_DIFF);
    if (obj.width !== _.NO_DIFF) {
      _.writeInt(buf, obj.width);
    }
    tracker.push(obj.height !== _.NO_DIFF);
    if (obj.height !== _.NO_DIFF) {
      _.writeInt(buf, obj.height);
    }
    tracker.push(obj.rotation !== _.NO_DIFF);
    if (obj.rotation !== _.NO_DIFF) {
      _.writeInt(buf, obj.rotation);
    }
    tracker.push(obj.mass !== _.NO_DIFF);
    if (obj.mass !== _.NO_DIFF) {
      _.writeInt(buf, obj.mass);
    }
    tracker.push(obj.health !== _.NO_DIFF);
    if (obj.health !== _.NO_DIFF) {
      _.writeInt(buf, obj.health);
    }
    tracker.push(obj.depth !== _.NO_DIFF);
    if (obj.depth !== _.NO_DIFF) {
      _.writeInt(buf, obj.depth);
    }
    tracker.push(obj.lifetime !== _.NO_DIFF);
    if (obj.lifetime !== _.NO_DIFF) {
      _.writeInt(buf, obj.lifetime);
    }
    tracker.push(obj.radius !== _.NO_DIFF);
    if (obj.radius !== _.NO_DIFF) {
      _.writeInt(buf, obj.radius);
    }
    tracker.push(obj.isSensor !== _.NO_DIFF);
    if (obj.isSensor !== _.NO_DIFF) {
      _.writeBoolean(tracker, obj.isSensor);
    }
    tracker.push(obj.isStatic !== _.NO_DIFF);
    if (obj.isStatic !== _.NO_DIFF) {
      _.writeBoolean(tracker, obj.isStatic);
    }
    tracker.push(obj.destroyed !== _.NO_DIFF);
    if (obj.destroyed !== _.NO_DIFF) {
      _.writeBoolean(tracker, obj.destroyed);
    }
    tracker.push(obj.owner !== _.NO_DIFF);
    if (obj.owner !== _.NO_DIFF) {
      _.writeInt(buf, obj.owner);
    }
    tracker.push(obj.maxSpeed !== _.NO_DIFF);
    if (obj.maxSpeed !== _.NO_DIFF) {
      _.writeInt(buf, obj.maxSpeed);
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Player {
    const sb = buf;
    return {
      id: _.parseInt(sb),
      name: _.parseString(sb),
      type: _.parseString(sb),
      position: Position.decode(sb, tracker),
      velocity: Velocity.decode(sb, tracker),
      width: _.parseInt(sb),
      height: _.parseInt(sb),
      rotation: _.parseInt(sb),
      mass: _.parseInt(sb),
      health: _.parseInt(sb),
      depth: _.parseInt(sb),
      lifetime: _.parseInt(sb),
      radius: _.parseInt(sb),
      isSensor: _.parseBoolean(tracker),
      isStatic: _.parseBoolean(tracker),
      destroyed: _.parseBoolean(tracker),
      owner: _.parseInt(sb),
      maxSpeed: _.parseInt(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Player> {
    const sb = buf;
    return {
      id: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      name: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      type: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      position: tracker.next() ? Position.decodeDiff(sb, tracker) : _.NO_DIFF,
      velocity: tracker.next() ? Velocity.decodeDiff(sb, tracker) : _.NO_DIFF,
      width: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      height: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      rotation: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      mass: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      health: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      depth: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      lifetime: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      radius: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      isSensor: tracker.next() ? _.parseBoolean(tracker) : _.NO_DIFF,
      isStatic: tracker.next() ? _.parseBoolean(tracker) : _.NO_DIFF,
      destroyed: tracker.next() ? _.parseBoolean(tracker) : _.NO_DIFF,
      owner: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      maxSpeed: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
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
  applyDiff(obj: Player, diff: _.DeepPartial<Player> | typeof _.NO_DIFF): Player {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.id = diff.id === _.NO_DIFF ? obj.id : diff.id;
    obj.name = diff.name === _.NO_DIFF ? obj.name : diff.name;
    obj.type = diff.type === _.NO_DIFF ? obj.type : diff.type;
    obj.position = diff.position === _.NO_DIFF ? obj.position : Position.applyDiff(obj.position, diff.position);
    obj.velocity = diff.velocity === _.NO_DIFF ? obj.velocity : Velocity.applyDiff(obj.velocity, diff.velocity);
    obj.width = diff.width === _.NO_DIFF ? obj.width : diff.width;
    obj.height = diff.height === _.NO_DIFF ? obj.height : diff.height;
    obj.rotation = diff.rotation === _.NO_DIFF ? obj.rotation : diff.rotation;
    obj.mass = diff.mass === _.NO_DIFF ? obj.mass : diff.mass;
    obj.health = diff.health === _.NO_DIFF ? obj.health : diff.health;
    obj.depth = diff.depth === _.NO_DIFF ? obj.depth : diff.depth;
    obj.lifetime = diff.lifetime === _.NO_DIFF ? obj.lifetime : diff.lifetime;
    obj.radius = diff.radius === _.NO_DIFF ? obj.radius : diff.radius;
    obj.isSensor = diff.isSensor === _.NO_DIFF ? obj.isSensor : diff.isSensor;
    obj.isStatic = diff.isStatic === _.NO_DIFF ? obj.isStatic : diff.isStatic;
    obj.destroyed = diff.destroyed === _.NO_DIFF ? obj.destroyed : diff.destroyed;
    obj.owner = diff.owner === _.NO_DIFF ? obj.owner : diff.owner;
    obj.maxSpeed = diff.maxSpeed === _.NO_DIFF ? obj.maxSpeed : diff.maxSpeed;
    return obj;
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

    validationErrors = _.validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: State.id");
    }
    validationErrors = _.validateArray(obj.state, (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: State.state");
    }

    return validationErrors;
  },
  encode(obj: State, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.id);
    _.writeArray(buf, obj.state, (x) => Player.encode(x, tracker, buf));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<State>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      _.writeInt(buf, obj.id);
    }
    tracker.push(obj.state !== _.NO_DIFF);
    if (obj.state !== _.NO_DIFF) {
      _.writeArrayDiff<Player>(buf, tracker, obj.state, (x) => Player.encode(x, tracker, buf), (x) => Player.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): State {
    const sb = buf;
    return {
      id: _.parseInt(sb),
      state: _.parseArray(sb, () => Player.decode(sb, tracker)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<State> {
    const sb = buf;
    return {
      id: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      state: tracker.next() ? _.parseArrayDiff<Player>(sb, tracker, () => Player.decode(sb, tracker), () => Player.decodeDiff(sb, tracker)) : _.NO_DIFF,
    };
  },
  computeDiff(a: State, b: State): _.DeepPartial<State> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<State> =  {
      id: _.diffPrimitive(a.id, b.id),
      state: _.diffArray(a.state, b.state, (x, y) => Player.computeDiff(x, y)),
    };
    return diff.id === _.NO_DIFF && diff.state === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: State, diff: _.DeepPartial<State> | typeof _.NO_DIFF): State {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.id = diff.id === _.NO_DIFF ? obj.id : diff.id;
    obj.state = diff.state === _.NO_DIFF ? obj.state : _.patchArray<Player>(obj.state, diff.state, (a, b) => Player.applyDiff(a, b));
    return obj;
  },
};
