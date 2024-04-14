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

    validationErrors = validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${ obj.x }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.x");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${ obj.y }`);
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

    validationErrors = validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${ obj.x }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Velocity.x");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${ obj.y }`);
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

    validationErrors = validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${ obj.id }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.id");
    }
    validationErrors = validatePrimitive(typeof obj.name === "string", `Invalid string: ${ obj.name }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.name");
    }
    validationErrors = validatePrimitive(typeof obj.type === "string", `Invalid string: ${ obj.type }`);
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
    validationErrors = validatePrimitive(Number.isInteger(obj.width), `Invalid int: ${ obj.width }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.width");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.height), `Invalid int: ${ obj.height }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.height");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.rotation), `Invalid int: ${ obj.rotation }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.rotation");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.mass), `Invalid int: ${ obj.mass }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.mass");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.health), `Invalid int: ${ obj.health }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.health");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.depth), `Invalid int: ${ obj.depth }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.depth");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.lifetime), `Invalid int: ${ obj.lifetime }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.lifetime");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.radius), `Invalid int: ${ obj.radius }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.radius");
    }
    validationErrors = validatePrimitive(typeof obj.isSensor === "boolean", `Invalid boolean: ${ obj.isSensor }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isSensor");
    }
    validationErrors = validatePrimitive(typeof obj.isStatic === "boolean", `Invalid boolean: ${ obj.isStatic }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isStatic");
    }
    validationErrors = validatePrimitive(typeof obj.destroyed === "boolean", `Invalid boolean: ${ obj.destroyed }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.destroyed");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.owner), `Invalid int: ${ obj.owner }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.owner");
    }
    validationErrors = validatePrimitive(Number.isInteger(obj.maxSpeed), `Invalid int: ${ obj.maxSpeed }`);
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

    validationErrors = validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${ obj.id }`);
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
};

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

