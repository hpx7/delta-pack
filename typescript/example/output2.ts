import * as _ from "@hathora/delta-pack/helpers";

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
  equals(a: Position, b: Position): boolean {
    return (
      a.x === b.x &&
      a.y === b.y
    );
  },
  encode(obj: Position): Uint8Array {
    const tracker = new _.Tracker();
    Position._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Position, tracker: _.Tracker): void {
    tracker.pushUInt(obj.x);
    tracker.pushUInt(obj.y);
  },
  encodeDiff(a: Position, b: Position): Uint8Array {
    const tracker = new _.Tracker();
    Position._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Position, b: Position, tracker: _.Tracker): void {
    const changed = !Position.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(a.x, b.x);
    tracker.pushUIntDiff(a.y, b.y);
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
  decodeDiff(obj: Position, input: Uint8Array): Position {
    const tracker = _.Tracker.parse(input);
    return Position._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Position, tracker: _.Tracker): Position {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      x: tracker.nextUIntDiff(obj.x),
      y: tracker.nextUIntDiff(obj.y),
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
  equals(a: Velocity, b: Velocity): boolean {
    return (
      a.x === b.x &&
      a.y === b.y
    );
  },
  encode(obj: Velocity): Uint8Array {
    const tracker = new _.Tracker();
    Velocity._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Velocity, tracker: _.Tracker): void {
    tracker.pushUInt(obj.x);
    tracker.pushUInt(obj.y);
  },
  encodeDiff(a: Velocity, b: Velocity): Uint8Array {
    const tracker = new _.Tracker();
    Velocity._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Velocity, b: Velocity, tracker: _.Tracker): void {
    const changed = !Velocity.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(a.x, b.x);
    tracker.pushUIntDiff(a.y, b.y);
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
  decodeDiff(obj: Velocity, input: Uint8Array): Velocity {
    const tracker = _.Tracker.parse(input);
    return Velocity._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Velocity, tracker: _.Tracker): Velocity {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      x: tracker.nextUIntDiff(obj.x),
      y: tracker.nextUIntDiff(obj.y),
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
  equals(a: Player, b: Player): boolean {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.type === b.type &&
      Position.equals(a.position, b.position) &&
      Velocity.equals(a.velocity, b.velocity) &&
      a.width === b.width &&
      a.height === b.height &&
      a.rotation === b.rotation &&
      a.mass === b.mass &&
      a.health === b.health &&
      a.depth === b.depth &&
      a.lifetime === b.lifetime &&
      a.radius === b.radius &&
      a.isSensor === b.isSensor &&
      a.isStatic === b.isStatic &&
      a.destroyed === b.destroyed &&
      a.owner === b.owner &&
      a.maxSpeed === b.maxSpeed
    );
  },
  encode(obj: Player): Uint8Array {
    const tracker = new _.Tracker();
    Player._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Player, tracker: _.Tracker): void {
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
  },
  encodeDiff(a: Player, b: Player): Uint8Array {
    const tracker = new _.Tracker();
    Player._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Player, b: Player, tracker: _.Tracker): void {
    const changed = !Player.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(a.id, b.id);
    tracker.pushStringDiff(a.name, b.name);
    tracker.pushStringDiff(a.type, b.type);
    Position._encodeDiff(a.position, b.position, tracker);
    Velocity._encodeDiff(a.velocity, b.velocity, tracker);
    tracker.pushUIntDiff(a.width, b.width);
    tracker.pushUIntDiff(a.height, b.height);
    tracker.pushUIntDiff(a.rotation, b.rotation);
    tracker.pushUIntDiff(a.mass, b.mass);
    tracker.pushUIntDiff(a.health, b.health);
    tracker.pushUIntDiff(a.depth, b.depth);
    tracker.pushUIntDiff(a.lifetime, b.lifetime);
    tracker.pushUIntDiff(a.radius, b.radius);
    tracker.pushBooleanDiff(a.isSensor, b.isSensor);
    tracker.pushBooleanDiff(a.isStatic, b.isStatic);
    tracker.pushBooleanDiff(a.destroyed, b.destroyed);
    tracker.pushUIntDiff(a.owner, b.owner);
    tracker.pushUIntDiff(a.maxSpeed, b.maxSpeed);
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
  decodeDiff(obj: Player, input: Uint8Array): Player {
    const tracker = _.Tracker.parse(input);
    return Player._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Player, tracker: _.Tracker): Player {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      id: tracker.nextUIntDiff(obj.id),
      name: tracker.nextStringDiff(obj.name),
      type: tracker.nextStringDiff(obj.type),
      position: Position._decodeDiff(obj.position, tracker),
      velocity: Velocity._decodeDiff(obj.velocity, tracker),
      width: tracker.nextUIntDiff(obj.width),
      height: tracker.nextUIntDiff(obj.height),
      rotation: tracker.nextUIntDiff(obj.rotation),
      mass: tracker.nextUIntDiff(obj.mass),
      health: tracker.nextUIntDiff(obj.health),
      depth: tracker.nextUIntDiff(obj.depth),
      lifetime: tracker.nextUIntDiff(obj.lifetime),
      radius: tracker.nextUIntDiff(obj.radius),
      isSensor: tracker.nextBooleanDiff(obj.isSensor),
      isStatic: tracker.nextBooleanDiff(obj.isStatic),
      destroyed: tracker.nextBooleanDiff(obj.destroyed),
      owner: tracker.nextUIntDiff(obj.owner),
      maxSpeed: tracker.nextUIntDiff(obj.maxSpeed),
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
  equals(a: State, b: State): boolean {
    return (
      a.id === b.id &&
      _.equalsArray(a.state, b.state, (x, y) => Player.equals(x, y))
    );
  },
  encode(obj: State): Uint8Array {
    const tracker = new _.Tracker();
    State._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: State, tracker: _.Tracker): void {
    tracker.pushUInt(obj.id);
    tracker.pushArray(obj.state, (x) => Player._encode(x, tracker));
  },
  encodeDiff(a: State, b: State): Uint8Array {
    const tracker = new _.Tracker();
    State._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: State, b: State, tracker: _.Tracker): void {
    const changed = !State.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(a.id, b.id);
    tracker.pushArrayDiff<Player>(
      a.state,
      b.state,
      (x, y) => Player.equals(x, y),
      (x) => Player._encode(x, tracker),
      (x, y) => Player._encodeDiff(x, y, tracker)
    );
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
  decodeDiff(obj: State, input: Uint8Array): State {
    const tracker = _.Tracker.parse(input);
    return State._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: State, tracker: _.Tracker): State {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      id: tracker.nextUIntDiff(obj.id),
      state: tracker.nextArrayDiff<Player>(
        obj.state,
        () => Player._decode(tracker),
        (x) => Player._decodeDiff(x, tracker)
      ),
    };
  },
};
