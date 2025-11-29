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
  parse(obj: Position): Position {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Position: ${obj}`);
    }
    return {
      x: _.parseUInt(obj.x),
      y: _.parseUInt(obj.y),
    };
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
  parse(obj: Velocity): Velocity {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Velocity: ${obj}`);
    }
    return {
      x: _.parseUInt(obj.x),
      y: _.parseUInt(obj.y),
    };
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
  parse(obj: Player): Player {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Player: ${obj}`);
    }
    return {
      id: _.parseUInt(obj.id),
      name: _.parseString(obj.name),
      type: _.parseString(obj.type),
      position: Position.parse(obj.position as Position),
      velocity: Velocity.parse(obj.velocity as Velocity),
      width: _.parseUInt(obj.width),
      height: _.parseUInt(obj.height),
      rotation: _.parseUInt(obj.rotation),
      mass: _.parseUInt(obj.mass),
      health: _.parseUInt(obj.health),
      depth: _.parseUInt(obj.depth),
      lifetime: _.parseUInt(obj.lifetime),
      radius: _.parseUInt(obj.radius),
      isSensor: _.parseBoolean(obj.isSensor),
      isStatic: _.parseBoolean(obj.isStatic),
      destroyed: _.parseBoolean(obj.destroyed),
      owner: _.parseUInt(obj.owner),
      maxSpeed: _.parseUInt(obj.maxSpeed),
    };
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
  parse(obj: State): State {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid State: ${obj}`);
    }
    return {
      id: _.parseUInt(obj.id),
      state: _.parseArray(obj.state, (x) => Player.parse(x as Player)),
    };
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
