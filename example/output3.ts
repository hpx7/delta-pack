import * as _ from "../helpers.ts";

export type ChatMessage = {
  author: string;
  content: string;
};
export type ChatList = {
  messages: ChatMessage[];
};
export type Color = string;
export type Position = {
  x: number;
  y: number;
  z: number;
};
export type Rotation = {
  x: number;
  y: number;
  z: number;
  w: number;
};
export type Size3D = {
  width: number;
  height: number;
  depth: number;
};
export type Size1D = number;

export type EntityEvent = "DESTROYED";
    

export type EntityState = "IDLE" | "WALK" | "RUN" | "JUMP" | "ATTACK" | "FALL" | "DEATH";
    
export type Component = { type: "Color"; val: Color } | { type: "Position"; val: Position } | { type: "Rotation"; val: Rotation } | { type: "Size3D"; val: Size3D } | { type: "Size1D"; val: Size1D } | { type: "EntityEvent"; val: EntityEvent } | { type: "EntityState"; val: EntityState } | { type: "ChatList"; val: ChatList };
export type Entity = {
  entityId: number;
  components: Component[];
};
export type Snapshot = {
  entities: Entity[];
};


export const ChatMessage = {
  default(): ChatMessage {
    return {
      author: "",
      content: "",
    };
  },
  validate(obj: ChatMessage) {
    if (typeof obj !== "object") {
      return [`Invalid ChatMessage object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.author === "string", `Invalid string: ${obj.author}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ChatMessage.author");
    }
    validationErrors = _.validatePrimitive(typeof obj.content === "string", `Invalid string: ${obj.content}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ChatMessage.content");
    }

    return validationErrors;
  },
  encode(obj: ChatMessage, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushString(obj.author);
    tracker.pushString(obj.content);
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): ChatMessage {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      author: tracker.nextString(),
      content: tracker.nextString(),
    };
  },
  computeDiff(a: ChatMessage, b: ChatMessage): _.DeepPartial<ChatMessage> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<ChatMessage> =  {
      author: _.diffPrimitive(a.author, b.author),
      content: _.diffPrimitive(a.content, b.content),
    };
    return diff.author === _.NO_DIFF && diff.content === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<ChatMessage>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.author !== _.NO_DIFF);
    if (obj.author !== _.NO_DIFF) {
      tracker.pushString(obj.author);
    }
    tracker.pushBoolean(obj.content !== _.NO_DIFF);
    if (obj.content !== _.NO_DIFF) {
      tracker.pushString(obj.content);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<ChatMessage> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      author: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      content: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
    };
  },
  applyDiff(obj: ChatMessage, diff: _.DeepPartial<ChatMessage> | typeof _.NO_DIFF): ChatMessage {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.author = diff.author === _.NO_DIFF ? obj.author : diff.author;
    obj.content = diff.content === _.NO_DIFF ? obj.content : diff.content;
    return obj;
  },
};

export const ChatList = {
  default(): ChatList {
    return {
      messages: [],
    };
  },
  validate(obj: ChatList) {
    if (typeof obj !== "object") {
      return [`Invalid ChatList object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateArray(obj.messages, (x) => ChatMessage.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ChatList.messages");
    }

    return validationErrors;
  },
  encode(obj: ChatList, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    _.writeArray(tracker, obj.messages, (x) => ChatMessage.encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): ChatList {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      messages: _.parseArray(tracker, () => ChatMessage.decode(tracker)),
    };
  },
  computeDiff(a: ChatList, b: ChatList): _.DeepPartial<ChatList> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<ChatList> =  {
      messages: _.diffArray(a.messages, b.messages, (x, y) => ChatMessage.computeDiff(x, y)),
    };
    return diff.messages === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<ChatList>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.messages !== _.NO_DIFF);
    if (obj.messages !== _.NO_DIFF) {
      _.writeArrayDiff<ChatMessage>(tracker, obj.messages, (x) => ChatMessage.encode(x, tracker), (x) => ChatMessage.encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<ChatList> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      messages: tracker.nextBoolean() ? _.parseArrayDiff<ChatMessage>(tracker, () => ChatMessage.decode(tracker), () => ChatMessage.decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: ChatList, diff: _.DeepPartial<ChatList> | typeof _.NO_DIFF): ChatList {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.messages = diff.messages === _.NO_DIFF ? obj.messages : _.patchArray<ChatMessage>(obj.messages, diff.messages, (a, b) => ChatMessage.applyDiff(a, b));
    return obj;
  },
};


export const Position = {
  default(): Position {
    return {
      x: 0.0,
      y: 0.0,
      z: 0.0,
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
    validationErrors = _.validatePrimitive(typeof obj.z === "number", `Invalid float: ${obj.z}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.z");
    }

    return validationErrors;
  },
  encode(obj: Position, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushFloat(obj.x);
    tracker.pushFloat(obj.y);
    tracker.pushFloat(obj.z);
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Position {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      x: tracker.nextFloat(),
      y: tracker.nextFloat(),
      z: tracker.nextFloat(),
    };
  },
  computeDiff(a: Position, b: Position): _.DeepPartial<Position> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Position> =  {
      x: _.diffFloat(a.x, b.x),
      y: _.diffFloat(a.y, b.y),
      z: _.diffFloat(a.z, b.z),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF && diff.z === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Position>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushFloat(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushFloat(obj.y);
    }
    tracker.pushBoolean(obj.z !== _.NO_DIFF);
    if (obj.z !== _.NO_DIFF) {
      tracker.pushFloat(obj.z);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Position> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      x: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
      z: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Position, diff: _.DeepPartial<Position> | typeof _.NO_DIFF): Position {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    obj.z = diff.z === _.NO_DIFF ? obj.z : diff.z;
    return obj;
  },
};

export const Rotation = {
  default(): Rotation {
    return {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      w: 0.0,
    };
  },
  validate(obj: Rotation) {
    if (typeof obj !== "object") {
      return [`Invalid Rotation object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.x === "number", `Invalid float: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Rotation.x");
    }
    validationErrors = _.validatePrimitive(typeof obj.y === "number", `Invalid float: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Rotation.y");
    }
    validationErrors = _.validatePrimitive(typeof obj.z === "number", `Invalid float: ${obj.z}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Rotation.z");
    }
    validationErrors = _.validatePrimitive(typeof obj.w === "number", `Invalid float: ${obj.w}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Rotation.w");
    }

    return validationErrors;
  },
  encode(obj: Rotation, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushFloat(obj.x);
    tracker.pushFloat(obj.y);
    tracker.pushFloat(obj.z);
    tracker.pushFloat(obj.w);
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Rotation {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      x: tracker.nextFloat(),
      y: tracker.nextFloat(),
      z: tracker.nextFloat(),
      w: tracker.nextFloat(),
    };
  },
  computeDiff(a: Rotation, b: Rotation): _.DeepPartial<Rotation> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Rotation> =  {
      x: _.diffFloat(a.x, b.x),
      y: _.diffFloat(a.y, b.y),
      z: _.diffFloat(a.z, b.z),
      w: _.diffFloat(a.w, b.w),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF && diff.z === _.NO_DIFF && diff.w === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Rotation>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushFloat(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushFloat(obj.y);
    }
    tracker.pushBoolean(obj.z !== _.NO_DIFF);
    if (obj.z !== _.NO_DIFF) {
      tracker.pushFloat(obj.z);
    }
    tracker.pushBoolean(obj.w !== _.NO_DIFF);
    if (obj.w !== _.NO_DIFF) {
      tracker.pushFloat(obj.w);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Rotation> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      x: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
      z: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
      w: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Rotation, diff: _.DeepPartial<Rotation> | typeof _.NO_DIFF): Rotation {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    obj.z = diff.z === _.NO_DIFF ? obj.z : diff.z;
    obj.w = diff.w === _.NO_DIFF ? obj.w : diff.w;
    return obj;
  },
};

export const Size3D = {
  default(): Size3D {
    return {
      width: 0.0,
      height: 0.0,
      depth: 0.0,
    };
  },
  validate(obj: Size3D) {
    if (typeof obj !== "object") {
      return [`Invalid Size3D object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.width === "number", `Invalid float: ${obj.width}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Size3D.width");
    }
    validationErrors = _.validatePrimitive(typeof obj.height === "number", `Invalid float: ${obj.height}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Size3D.height");
    }
    validationErrors = _.validatePrimitive(typeof obj.depth === "number", `Invalid float: ${obj.depth}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Size3D.depth");
    }

    return validationErrors;
  },
  encode(obj: Size3D, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushFloat(obj.width);
    tracker.pushFloat(obj.height);
    tracker.pushFloat(obj.depth);
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Size3D {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      width: tracker.nextFloat(),
      height: tracker.nextFloat(),
      depth: tracker.nextFloat(),
    };
  },
  computeDiff(a: Size3D, b: Size3D): _.DeepPartial<Size3D> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Size3D> =  {
      width: _.diffFloat(a.width, b.width),
      height: _.diffFloat(a.height, b.height),
      depth: _.diffFloat(a.depth, b.depth),
    };
    return diff.width === _.NO_DIFF && diff.height === _.NO_DIFF && diff.depth === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Size3D>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.width !== _.NO_DIFF);
    if (obj.width !== _.NO_DIFF) {
      tracker.pushFloat(obj.width);
    }
    tracker.pushBoolean(obj.height !== _.NO_DIFF);
    if (obj.height !== _.NO_DIFF) {
      tracker.pushFloat(obj.height);
    }
    tracker.pushBoolean(obj.depth !== _.NO_DIFF);
    if (obj.depth !== _.NO_DIFF) {
      tracker.pushFloat(obj.depth);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Size3D> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      width: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
      height: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
      depth: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Size3D, diff: _.DeepPartial<Size3D> | typeof _.NO_DIFF): Size3D {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.width = diff.width === _.NO_DIFF ? obj.width : diff.width;
    obj.height = diff.height === _.NO_DIFF ? obj.height : diff.height;
    obj.depth = diff.depth === _.NO_DIFF ? obj.depth : diff.depth;
    return obj;
  },
};


const EntityEvent = {
  0: "DESTROYED",
  DESTROYED: 0,
};

const EntityState = {
  0: "IDLE",
  1: "WALK",
  2: "RUN",
  3: "JUMP",
  4: "ATTACK",
  5: "FALL",
  6: "DEATH",
  IDLE: 0,
  WALK: 1,
  RUN: 2,
  JUMP: 3,
  ATTACK: 4,
  FALL: 5,
  DEATH: 6,
};

export const Component = {
  default(): Component {
    return {
      type: "Color",
      val: "",
    };
  },
  values() {
    return ["Color", "Position", "Rotation", "Size3D", "Size1D", "EntityEvent", "EntityState", "ChatList"];
  },
  validate(obj: Component) {
    if (obj.type === "Color") {
      const validationErrors = _.validatePrimitive(typeof obj.val === "string", `Invalid string: ${obj.val}`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: Component");
      }
      return validationErrors;
    }
    else if (obj.type === "Position") {
      const validationErrors = Position.validate(obj.val);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: Component");
      }
      return validationErrors;
    }
    else if (obj.type === "Rotation") {
      const validationErrors = Rotation.validate(obj.val);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: Component");
      }
      return validationErrors;
    }
    else if (obj.type === "Size3D") {
      const validationErrors = Size3D.validate(obj.val);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: Component");
      }
      return validationErrors;
    }
    else if (obj.type === "Size1D") {
      const validationErrors = _.validatePrimitive(typeof obj.val === "number", `Invalid float: ${obj.val}`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: Component");
      }
      return validationErrors;
    }
    else if (obj.type === "EntityEvent") {
      const validationErrors = _.validatePrimitive(obj.val in EntityEvent, `Invalid EntityEvent: ${obj.val}`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: Component");
      }
      return validationErrors;
    }
    else if (obj.type === "EntityState") {
      const validationErrors = _.validatePrimitive(obj.val in EntityState, `Invalid EntityState: ${obj.val}`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: Component");
      }
      return validationErrors;
    }
    else if (obj.type === "ChatList") {
      const validationErrors = ChatList.validate(obj.val);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: Component");
      }
      return validationErrors;
    }
    else {
      return [`Invalid Component union: ${obj}`];
    }
  },
  encode(obj: Component, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    if (obj.type === "Color") {
      tracker.pushUInt(0);
      tracker.pushString(obj.val);
    }
    else if (obj.type === "Position") {
      tracker.pushUInt(1);
      Position.encode(obj.val, tracker);
    }
    else if (obj.type === "Rotation") {
      tracker.pushUInt(2);
      Rotation.encode(obj.val, tracker);
    }
    else if (obj.type === "Size3D") {
      tracker.pushUInt(3);
      Size3D.encode(obj.val, tracker);
    }
    else if (obj.type === "Size1D") {
      tracker.pushUInt(4);
      tracker.pushFloat(obj.val);
    }
    else if (obj.type === "EntityEvent") {
      tracker.pushUInt(5);
      tracker.pushUInt(EntityEvent[obj.val]);
    }
    else if (obj.type === "EntityState") {
      tracker.pushUInt(6);
      tracker.pushUInt(EntityState[obj.val]);
    }
    else if (obj.type === "ChatList") {
      tracker.pushUInt(7);
      ChatList.encode(obj.val, tracker);
    }
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Component {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "Color", val: tracker.nextString() };
    }
    else if (type === 1) {
      return { type: "Position", val: Position.decode(tracker) };
    }
    else if (type === 2) {
      return { type: "Rotation", val: Rotation.decode(tracker) };
    }
    else if (type === 3) {
      return { type: "Size3D", val: Size3D.decode(tracker) };
    }
    else if (type === 4) {
      return { type: "Size1D", val: tracker.nextFloat() };
    }
    else if (type === 5) {
      return { type: "EntityEvent", val: EntityEvent[tracker.nextUInt()] };
    }
    else if (type === 6) {
      return { type: "EntityState", val: EntityState[tracker.nextUInt()] };
    }
    else if (type === 7) {
      return { type: "ChatList", val: ChatList.decode(tracker) };
    }
    throw new Error("Invalid union");
  },
  encodeDiff(obj: _.DeepPartial<Component>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    if (obj.type === "Color") {
      tracker.pushUInt(0);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       tracker.pushString(obj.val);
      }
    }
    else if (obj.type === "Position") {
      tracker.pushUInt(1);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Position.encodeDiff(obj.val, tracker);
      }
    }
    else if (obj.type === "Rotation") {
      tracker.pushUInt(2);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Rotation.encodeDiff(obj.val, tracker);
      }
    }
    else if (obj.type === "Size3D") {
      tracker.pushUInt(3);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Size3D.encodeDiff(obj.val, tracker);
      }
    }
    else if (obj.type === "Size1D") {
      tracker.pushUInt(4);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       tracker.pushFloat(obj.val);
      }
    }
    else if (obj.type === "EntityEvent") {
      tracker.pushUInt(5);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       tracker.pushUInt(EntityEvent[obj.val]);
      }
    }
    else if (obj.type === "EntityState") {
      tracker.pushUInt(6);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       tracker.pushUInt(EntityState[obj.val]);
      }
    }
    else if (obj.type === "ChatList") {
      tracker.pushUInt(7);
      tracker.pushBoolean(obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       ChatList.encodeDiff(obj.val, tracker);
      }
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Component> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "Color", val: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF };
    }
    else if (type === 1) {
      return { type: "Position", val: tracker.nextBoolean() ? Position.decodeDiff(tracker) : _.NO_DIFF };
    }
    else if (type === 2) {
      return { type: "Rotation", val: tracker.nextBoolean() ? Rotation.decodeDiff(tracker) : _.NO_DIFF };
    }
    else if (type === 3) {
      return { type: "Size3D", val: tracker.nextBoolean() ? Size3D.decodeDiff(tracker) : _.NO_DIFF };
    }
    else if (type === 4) {
      return { type: "Size1D", val: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF };
    }
    else if (type === 5) {
      return { type: "EntityEvent", val: tracker.nextBoolean() ? EntityEvent[tracker.nextUInt()] : _.NO_DIFF };
    }
    else if (type === 6) {
      return { type: "EntityState", val: tracker.nextBoolean() ? EntityState[tracker.nextUInt()] : _.NO_DIFF };
    }
    else if (type === 7) {
      return { type: "ChatList", val: tracker.nextBoolean() ? ChatList.decodeDiff(tracker) : _.NO_DIFF };
    }
    throw new Error("Invalid union");
  },
}

export const Entity = {
  default(): Entity {
    return {
      entityId: 0,
      components: [],
    };
  },
  validate(obj: Entity) {
    if (typeof obj !== "object") {
      return [`Invalid Entity object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.entityId), `Invalid int: ${obj.entityId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Entity.entityId");
    }
    validationErrors = _.validateArray(obj.components, (x) => Component.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Entity.components");
    }

    return validationErrors;
  },
  encode(obj: Entity, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushInt(obj.entityId);
    _.writeArray(tracker, obj.components, (x) => Component.encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Entity {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      entityId: tracker.nextInt(),
      components: _.parseArray(tracker, () => Component.decode(tracker)),
    };
  },
  computeDiff(a: Entity, b: Entity): _.DeepPartial<Entity> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Entity> =  {
      entityId: _.diffPrimitive(a.entityId, b.entityId),
      components: _.diffArray(a.components, b.components, (x, y) => Component.computeDiff(x, y)),
    };
    return diff.entityId === _.NO_DIFF && diff.components === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Entity>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.entityId !== _.NO_DIFF);
    if (obj.entityId !== _.NO_DIFF) {
      tracker.pushInt(obj.entityId);
    }
    tracker.pushBoolean(obj.components !== _.NO_DIFF);
    if (obj.components !== _.NO_DIFF) {
      _.writeArrayDiff<Component>(tracker, obj.components, (x) => Component.encode(x, tracker), (x) => Component.encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Entity> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      entityId: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      components: tracker.nextBoolean() ? _.parseArrayDiff<Component>(tracker, () => Component.decode(tracker), () => Component.decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: Entity, diff: _.DeepPartial<Entity> | typeof _.NO_DIFF): Entity {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.entityId = diff.entityId === _.NO_DIFF ? obj.entityId : diff.entityId;
    obj.components = diff.components === _.NO_DIFF ? obj.components : _.patchArray<Component>(obj.components, diff.components, (a, b) => Component.applyDiff(a, b));
    return obj;
  },
};

export const Snapshot = {
  default(): Snapshot {
    return {
      entities: [],
    };
  },
  validate(obj: Snapshot) {
    if (typeof obj !== "object") {
      return [`Invalid Snapshot object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateArray(obj.entities, (x) => Entity.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Snapshot.entities");
    }

    return validationErrors;
  },
  encode(obj: Snapshot, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    _.writeArray(tracker, obj.entities, (x) => Entity.encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): Snapshot {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      entities: _.parseArray(tracker, () => Entity.decode(tracker)),
    };
  },
  computeDiff(a: Snapshot, b: Snapshot): _.DeepPartial<Snapshot> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Snapshot> =  {
      entities: _.diffArray(a.entities, b.entities, (x, y) => Entity.computeDiff(x, y)),
    };
    return diff.entities === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Snapshot>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    tracker.pushBoolean(obj.entities !== _.NO_DIFF);
    if (obj.entities !== _.NO_DIFF) {
      _.writeArrayDiff<Entity>(tracker, obj.entities, (x) => Entity.encode(x, tracker), (x) => Entity.encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<Snapshot> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      entities: tracker.nextBoolean() ? _.parseArrayDiff<Entity>(tracker, () => Entity.decode(tracker), () => Entity.decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: Snapshot, diff: _.DeepPartial<Snapshot> | typeof _.NO_DIFF): Snapshot {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.entities = diff.entities === _.NO_DIFF ? obj.entities : _.patchArray<Entity>(obj.entities, diff.entities, (a, b) => Entity.applyDiff(a, b));
    return obj;
  },
};
