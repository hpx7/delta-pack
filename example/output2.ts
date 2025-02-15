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

    validationErrors = validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.x");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.y");
    }

    return validationErrors;
  },
  encode(obj: Position, buf: _Writer = new _Writer()) {
    writeInt(buf, obj.x);
    writeInt(buf, obj.y);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Position>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.x !== _NO_DIFF);
    if (obj.x !== _NO_DIFF) {
      writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _NO_DIFF);
    if (obj.y !== _NO_DIFF) {
      writeInt(buf, obj.y);
    }
    return buf;
  },
  decode(buf: _Reader): Position {
    const sb = buf;
    return {
      x: parseInt(sb),
      y: parseInt(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Position> {
    const sb = buf;
    return {
      x: tracker.next() ? parseInt(sb) : _NO_DIFF,
      y: tracker.next() ? parseInt(sb) : _NO_DIFF,
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

    validationErrors = validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Velocity.x");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Velocity.y");
    }

    return validationErrors;
  },
  encode(obj: Velocity, buf: _Writer = new _Writer()) {
    writeInt(buf, obj.x);
    writeInt(buf, obj.y);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Velocity>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.x !== _NO_DIFF);
    if (obj.x !== _NO_DIFF) {
      writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _NO_DIFF);
    if (obj.y !== _NO_DIFF) {
      writeInt(buf, obj.y);
    }
    return buf;
  },
  decode(buf: _Reader): Velocity {
    const sb = buf;
    return {
      x: parseInt(sb),
      y: parseInt(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Velocity> {
    const sb = buf;
    return {
      x: tracker.next() ? parseInt(sb) : _NO_DIFF,
      y: tracker.next() ? parseInt(sb) : _NO_DIFF,
    };
  },
  computeDiff(a: Velocity, b: Velocity): _DeepPartial<Velocity> | typeof _NO_DIFF {
    const diff: _DeepPartial<Velocity> =  {
      x: diffPrimitive(a.x, b.x),
      y: diffPrimitive(a.y, b.y),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: Velocity, diff: _DeepPartial<Velocity> | typeof _NO_DIFF): Velocity {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      x: diff.x === _NO_DIFF ? obj.x : diff.x,
      y: diff.y === _NO_DIFF ? obj.y : diff.y,
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

    validationErrors = validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.id");
    }
    validationErrors = validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.name");
    }
    validationErrors = validatePrimitive(typeof obj.type === "string", `Invalid string: ${obj.type}`);
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
    validationErrors = validatePrimitive(Number.isInteger(obj.width), `Invalid int: ${obj.width}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.width");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.height), `Invalid int: ${obj.height}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.height");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.rotation), `Invalid int: ${obj.rotation}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.rotation");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.mass), `Invalid int: ${obj.mass}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.mass");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.health), `Invalid int: ${obj.health}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.health");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.depth), `Invalid int: ${obj.depth}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.depth");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.lifetime), `Invalid int: ${obj.lifetime}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.lifetime");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.radius), `Invalid int: ${obj.radius}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.radius");
    }
    validationErrors = validatePrimitive(typeof obj.isSensor === "boolean", `Invalid boolean: ${obj.isSensor}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isSensor");
    }
    validationErrors = validatePrimitive(typeof obj.isStatic === "boolean", `Invalid boolean: ${obj.isStatic}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isStatic");
    }
    validationErrors = validatePrimitive(typeof obj.destroyed === "boolean", `Invalid boolean: ${obj.destroyed}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.destroyed");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.owner), `Invalid int: ${obj.owner}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.owner");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.maxSpeed), `Invalid int: ${obj.maxSpeed}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.maxSpeed");
    }

    return validationErrors;
  },
  encode(obj: Player, buf: _Writer = new _Writer()) {
    writeInt(buf, obj.id);
    writeString(buf, obj.name);
    writeString(buf, obj.type);
    Position.encode(obj.position, buf);
    Velocity.encode(obj.velocity, buf);
    writeInt(buf, obj.width);
    writeInt(buf, obj.height);
    writeInt(buf, obj.rotation);
    writeInt(buf, obj.mass);
    writeInt(buf, obj.health);
    writeInt(buf, obj.depth);
    writeInt(buf, obj.lifetime);
    writeInt(buf, obj.radius);
    writeBoolean(buf, obj.isSensor);
    writeBoolean(buf, obj.isStatic);
    writeBoolean(buf, obj.destroyed);
    writeInt(buf, obj.owner);
    writeInt(buf, obj.maxSpeed);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Player>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.id !== _NO_DIFF);
    if (obj.id !== _NO_DIFF) {
      writeInt(buf, obj.id);
    }
    tracker.push(obj.name !== _NO_DIFF);
    if (obj.name !== _NO_DIFF) {
      writeString(buf, obj.name);
    }
    tracker.push(obj.type !== _NO_DIFF);
    if (obj.type !== _NO_DIFF) {
      writeString(buf, obj.type);
    }
    tracker.push(obj.position !== _NO_DIFF);
    if (obj.position !== _NO_DIFF) {
      Position.encodeDiff(obj.position, tracker, buf);
    }
    tracker.push(obj.velocity !== _NO_DIFF);
    if (obj.velocity !== _NO_DIFF) {
      Velocity.encodeDiff(obj.velocity, tracker, buf);
    }
    tracker.push(obj.width !== _NO_DIFF);
    if (obj.width !== _NO_DIFF) {
      writeInt(buf, obj.width);
    }
    tracker.push(obj.height !== _NO_DIFF);
    if (obj.height !== _NO_DIFF) {
      writeInt(buf, obj.height);
    }
    tracker.push(obj.rotation !== _NO_DIFF);
    if (obj.rotation !== _NO_DIFF) {
      writeInt(buf, obj.rotation);
    }
    tracker.push(obj.mass !== _NO_DIFF);
    if (obj.mass !== _NO_DIFF) {
      writeInt(buf, obj.mass);
    }
    tracker.push(obj.health !== _NO_DIFF);
    if (obj.health !== _NO_DIFF) {
      writeInt(buf, obj.health);
    }
    tracker.push(obj.depth !== _NO_DIFF);
    if (obj.depth !== _NO_DIFF) {
      writeInt(buf, obj.depth);
    }
    tracker.push(obj.lifetime !== _NO_DIFF);
    if (obj.lifetime !== _NO_DIFF) {
      writeInt(buf, obj.lifetime);
    }
    tracker.push(obj.radius !== _NO_DIFF);
    if (obj.radius !== _NO_DIFF) {
      writeInt(buf, obj.radius);
    }
    tracker.push(obj.isSensor !== _NO_DIFF);
    if (obj.isSensor !== _NO_DIFF) {
      writeBoolean(buf, obj.isSensor);
    }
    tracker.push(obj.isStatic !== _NO_DIFF);
    if (obj.isStatic !== _NO_DIFF) {
      writeBoolean(buf, obj.isStatic);
    }
    tracker.push(obj.destroyed !== _NO_DIFF);
    if (obj.destroyed !== _NO_DIFF) {
      writeBoolean(buf, obj.destroyed);
    }
    tracker.push(obj.owner !== _NO_DIFF);
    if (obj.owner !== _NO_DIFF) {
      writeInt(buf, obj.owner);
    }
    tracker.push(obj.maxSpeed !== _NO_DIFF);
    if (obj.maxSpeed !== _NO_DIFF) {
      writeInt(buf, obj.maxSpeed);
    }
    return buf;
  },
  decode(buf: _Reader): Player {
    const sb = buf;
    return {
      id: parseInt(sb),
      name: parseString(sb),
      type: parseString(sb),
      position: Position.decode(sb),
      velocity: Velocity.decode(sb),
      width: parseInt(sb),
      height: parseInt(sb),
      rotation: parseInt(sb),
      mass: parseInt(sb),
      health: parseInt(sb),
      depth: parseInt(sb),
      lifetime: parseInt(sb),
      radius: parseInt(sb),
      isSensor: parseBoolean(sb),
      isStatic: parseBoolean(sb),
      destroyed: parseBoolean(sb),
      owner: parseInt(sb),
      maxSpeed: parseInt(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Player> {
    const sb = buf;
    return {
      id: tracker.next() ? parseInt(sb) : _NO_DIFF,
      name: tracker.next() ? parseString(sb) : _NO_DIFF,
      type: tracker.next() ? parseString(sb) : _NO_DIFF,
      position: tracker.next() ? Position.decodeDiff(sb, tracker) : _NO_DIFF,
      velocity: tracker.next() ? Velocity.decodeDiff(sb, tracker) : _NO_DIFF,
      width: tracker.next() ? parseInt(sb) : _NO_DIFF,
      height: tracker.next() ? parseInt(sb) : _NO_DIFF,
      rotation: tracker.next() ? parseInt(sb) : _NO_DIFF,
      mass: tracker.next() ? parseInt(sb) : _NO_DIFF,
      health: tracker.next() ? parseInt(sb) : _NO_DIFF,
      depth: tracker.next() ? parseInt(sb) : _NO_DIFF,
      lifetime: tracker.next() ? parseInt(sb) : _NO_DIFF,
      radius: tracker.next() ? parseInt(sb) : _NO_DIFF,
      isSensor: tracker.next() ? parseBoolean(sb) : _NO_DIFF,
      isStatic: tracker.next() ? parseBoolean(sb) : _NO_DIFF,
      destroyed: tracker.next() ? parseBoolean(sb) : _NO_DIFF,
      owner: tracker.next() ? parseInt(sb) : _NO_DIFF,
      maxSpeed: tracker.next() ? parseInt(sb) : _NO_DIFF,
    };
  },
  computeDiff(a: Player, b: Player): _DeepPartial<Player> | typeof _NO_DIFF {
    const diff: _DeepPartial<Player> =  {
      id: diffPrimitive(a.id, b.id),
      name: diffPrimitive(a.name, b.name),
      type: diffPrimitive(a.type, b.type),
      position: Position.computeDiff(a.position, b.position),
      velocity: Velocity.computeDiff(a.velocity, b.velocity),
      width: diffPrimitive(a.width, b.width),
      height: diffPrimitive(a.height, b.height),
      rotation: diffPrimitive(a.rotation, b.rotation),
      mass: diffPrimitive(a.mass, b.mass),
      health: diffPrimitive(a.health, b.health),
      depth: diffPrimitive(a.depth, b.depth),
      lifetime: diffPrimitive(a.lifetime, b.lifetime),
      radius: diffPrimitive(a.radius, b.radius),
      isSensor: diffPrimitive(a.isSensor, b.isSensor),
      isStatic: diffPrimitive(a.isStatic, b.isStatic),
      destroyed: diffPrimitive(a.destroyed, b.destroyed),
      owner: diffPrimitive(a.owner, b.owner),
      maxSpeed: diffPrimitive(a.maxSpeed, b.maxSpeed),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: Player, diff: _DeepPartial<Player> | typeof _NO_DIFF): Player {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      id: diff.id === _NO_DIFF ? obj.id : diff.id,
      name: diff.name === _NO_DIFF ? obj.name : diff.name,
      type: diff.type === _NO_DIFF ? obj.type : diff.type,
      position: diff.position === _NO_DIFF ? obj.position : Position.applyDiff(obj.position, diff.position),
      velocity: diff.velocity === _NO_DIFF ? obj.velocity : Velocity.applyDiff(obj.velocity, diff.velocity),
      width: diff.width === _NO_DIFF ? obj.width : diff.width,
      height: diff.height === _NO_DIFF ? obj.height : diff.height,
      rotation: diff.rotation === _NO_DIFF ? obj.rotation : diff.rotation,
      mass: diff.mass === _NO_DIFF ? obj.mass : diff.mass,
      health: diff.health === _NO_DIFF ? obj.health : diff.health,
      depth: diff.depth === _NO_DIFF ? obj.depth : diff.depth,
      lifetime: diff.lifetime === _NO_DIFF ? obj.lifetime : diff.lifetime,
      radius: diff.radius === _NO_DIFF ? obj.radius : diff.radius,
      isSensor: diff.isSensor === _NO_DIFF ? obj.isSensor : diff.isSensor,
      isStatic: diff.isStatic === _NO_DIFF ? obj.isStatic : diff.isStatic,
      destroyed: diff.destroyed === _NO_DIFF ? obj.destroyed : diff.destroyed,
      owner: diff.owner === _NO_DIFF ? obj.owner : diff.owner,
      maxSpeed: diff.maxSpeed === _NO_DIFF ? obj.maxSpeed : diff.maxSpeed,
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

    validationErrors = validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: State.id");
    }
    validationErrors = validateArray(obj.state, (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: State.state");
    }

    return validationErrors;
  },
  encode(obj: State, buf: _Writer = new _Writer()) {
    writeInt(buf, obj.id);
    writeArray(buf, obj.state, (x) => Player.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: _DeepPartial<State>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.id !== _NO_DIFF);
    if (obj.id !== _NO_DIFF) {
      writeInt(buf, obj.id);
    }
    tracker.push(obj.state !== _NO_DIFF);
    if (obj.state !== _NO_DIFF) {
      writeArrayDiff(buf, tracker, obj.state, (x) => Player.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _Reader): State {
    const sb = buf;
    return {
      id: parseInt(sb),
      state: parseArray(sb, () => Player.decode(sb)),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<State> {
    const sb = buf;
    return {
      id: tracker.next() ? parseInt(sb) : _NO_DIFF,
      state: tracker.next() ? parseArrayDiff(sb, tracker, () => Player.decodeDiff(sb, tracker)) : _NO_DIFF,
    };
  },
  computeDiff(a: State, b: State): _DeepPartial<State> | typeof _NO_DIFF {
    const diff: _DeepPartial<State> =  {
      id: diffPrimitive(a.id, b.id),
      state: diffArray(a.state, b.state, (x, y) => Player.computeDiff(x, y)),
    };
    return Object.values(diff).every((v) => v === _NO_DIFF) ? _NO_DIFF : diff;
  },
  applyDiff(obj: State, diff: _DeepPartial<State> | typeof _NO_DIFF): State {
    if (diff === _NO_DIFF) {
      return obj;
    }
    return {
      id: diff.id === _NO_DIFF ? obj.id : diff.id,
      state: diff.state === _NO_DIFF ? obj.state : patchArray(obj.state, diff.state, (a, b) => Player.applyDiff(a, b)),
    };
  },
};

