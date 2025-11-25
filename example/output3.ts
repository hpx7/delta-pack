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
  encode(obj: ChatMessage) {
    return ChatMessage._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: ChatMessage, tracker: _.Tracker) {
    tracker.pushString(obj.author);
    tracker.pushString(obj.content);
    return tracker;
  },
  decode(input: Uint8Array): ChatMessage {
    return ChatMessage._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ChatMessage {
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
  encodeDiff(obj: _.DeepPartial<ChatMessage> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return ChatMessage._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<ChatMessage>, tracker: _.Tracker) {
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
  decodeDiff(input: Uint8Array): _.DeepPartial<ChatMessage> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return ChatMessage._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<ChatMessage> {
    return {
      author: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      content: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
    };
  },
  applyDiff(obj: ChatMessage, diff: _.DeepPartial<ChatMessage> | typeof _.NO_DIFF): ChatMessage {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      author: diff.author === _.NO_DIFF ? obj.author : diff.author,
      content: diff.content === _.NO_DIFF ? obj.content : diff.content,
    };
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
  encode(obj: ChatList) {
    return ChatList._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: ChatList, tracker: _.Tracker) {
    tracker.pushArray(obj.messages, (x) => ChatMessage._encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array): ChatList {
    return ChatList._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ChatList {
    return {
      messages: tracker.nextArray(() => ChatMessage._decode(tracker)),
    };
  },
  computeDiff(a: ChatList, b: ChatList): _.DeepPartial<ChatList> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<ChatList> =  {
      messages: _.diffArray(a.messages, b.messages, (x, y) => ChatMessage.computeDiff(x, y)),
    };
    return diff.messages === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<ChatList> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return ChatList._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<ChatList>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.messages !== _.NO_DIFF);
    if (obj.messages !== _.NO_DIFF) {
      tracker.pushArrayDiff<ChatMessage>(obj.messages, (x) => ChatMessage._encode(x, tracker), (x) => ChatMessage._encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<ChatList> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return ChatList._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<ChatList> {
    return {
      messages: tracker.nextBoolean() ? tracker.nextArrayDiff<ChatMessage>(() => ChatMessage._decode(tracker), () => ChatMessage._decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: ChatList, diff: _.DeepPartial<ChatList> | typeof _.NO_DIFF): ChatList {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      messages: diff.messages === _.NO_DIFF ? obj.messages : _.patchArray<ChatMessage>(obj.messages, diff.messages, (a, b) => ChatMessage.applyDiff(a, b)),
    };
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
  encode(obj: Position) {
    return Position._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Position, tracker: _.Tracker) {
    tracker.pushFloat(obj.x);
    tracker.pushFloat(obj.y);
    tracker.pushFloat(obj.z);
    return tracker;
  },
  decode(input: Uint8Array): Position {
    return Position._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Position {
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
    tracker.pushBoolean(obj.z !== _.NO_DIFF);
    if (obj.z !== _.NO_DIFF) {
      tracker.pushFloat(obj.z);
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
      z: tracker.nextBoolean() ? tracker.nextFloat() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Position, diff: _.DeepPartial<Position> | typeof _.NO_DIFF): Position {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
      z: diff.z === _.NO_DIFF ? obj.z : diff.z,
    };
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
  encode(obj: Rotation) {
    return Rotation._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Rotation, tracker: _.Tracker) {
    tracker.pushFloat(obj.x);
    tracker.pushFloat(obj.y);
    tracker.pushFloat(obj.z);
    tracker.pushFloat(obj.w);
    return tracker;
  },
  decode(input: Uint8Array): Rotation {
    return Rotation._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Rotation {
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
  encodeDiff(obj: _.DeepPartial<Rotation> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Rotation._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Rotation>, tracker: _.Tracker) {
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
  decodeDiff(input: Uint8Array): _.DeepPartial<Rotation> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Rotation._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Rotation> {
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
    return {
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
      z: diff.z === _.NO_DIFF ? obj.z : diff.z,
      w: diff.w === _.NO_DIFF ? obj.w : diff.w,
    };
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
  encode(obj: Size3D) {
    return Size3D._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Size3D, tracker: _.Tracker) {
    tracker.pushFloat(obj.width);
    tracker.pushFloat(obj.height);
    tracker.pushFloat(obj.depth);
    return tracker;
  },
  decode(input: Uint8Array): Size3D {
    return Size3D._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Size3D {
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
  encodeDiff(obj: _.DeepPartial<Size3D> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Size3D._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Size3D>, tracker: _.Tracker) {
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
  decodeDiff(input: Uint8Array): _.DeepPartial<Size3D> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Size3D._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Size3D> {
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
    return {
      width: diff.width === _.NO_DIFF ? obj.width : diff.width,
      height: diff.height === _.NO_DIFF ? obj.height : diff.height,
      depth: diff.depth === _.NO_DIFF ? obj.depth : diff.depth,
    };
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
  encode(obj: Component) {
    return Component._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Component, tracker: _.Tracker) {
    if (obj.type === "Color") {
      tracker.pushUInt(0);
      tracker.pushString(obj.val);
    }
    else if (obj.type === "Position") {
      tracker.pushUInt(1);
      Position._encode(obj.val, tracker);
    }
    else if (obj.type === "Rotation") {
      tracker.pushUInt(2);
      Rotation._encode(obj.val, tracker);
    }
    else if (obj.type === "Size3D") {
      tracker.pushUInt(3);
      Size3D._encode(obj.val, tracker);
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
      ChatList._encode(obj.val, tracker);
    }
    return tracker;
  },
  decode(input: Uint8Array): Component {
    return Component._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Component {
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "Color", val: tracker.nextString() };
    }
    else if (type === 1) {
      return { type: "Position", val: Position._decode(tracker) };
    }
    else if (type === 2) {
      return { type: "Rotation", val: Rotation._decode(tracker) };
    }
    else if (type === 3) {
      return { type: "Size3D", val: Size3D._decode(tracker) };
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
      return { type: "ChatList", val: ChatList._decode(tracker) };
    }
    throw new Error("Invalid union");
  },
  computeDiff(a: Component, b: Component): _.DeepPartial<Component> | typeof _.NO_DIFF {
    if (a.type !== b.type) {
      return { partial: false, ...b };
    }
    if (a.type === "Color" && b.type === "Color") {
      const valDiff = _.diffPrimitive(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    else if (a.type === "Position" && b.type === "Position") {
      const valDiff = Position.computeDiff(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    else if (a.type === "Rotation" && b.type === "Rotation") {
      const valDiff = Rotation.computeDiff(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    else if (a.type === "Size3D" && b.type === "Size3D") {
      const valDiff = Size3D.computeDiff(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    else if (a.type === "Size1D" && b.type === "Size1D") {
      const valDiff = _.diffFloat(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    else if (a.type === "EntityEvent" && b.type === "EntityEvent") {
      const valDiff = _.diffPrimitive(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    else if (a.type === "EntityState" && b.type === "EntityState") {
      const valDiff = _.diffPrimitive(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    else if (a.type === "ChatList" && b.type === "ChatList") {
      const valDiff = ChatList.computeDiff(a.val, b.val);
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }
    throw new Error("Invalid union");
  },
  encodeDiff(obj: _.DeepPartial<Component> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Component._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Component>, tracker: _.Tracker) {
    if (obj.type === "Color") {
      tracker.pushUInt(0);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        tracker.pushString(obj.val);
      } else {
        tracker.pushString(obj.val);
      }
    }
    else if (obj.type === "Position") {
      tracker.pushUInt(1);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        Position._encodeDiff(obj.val, tracker);
      } else {
        Position._encode(obj.val, tracker);
      }
    }
    else if (obj.type === "Rotation") {
      tracker.pushUInt(2);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        Rotation._encodeDiff(obj.val, tracker);
      } else {
        Rotation._encode(obj.val, tracker);
      }
    }
    else if (obj.type === "Size3D") {
      tracker.pushUInt(3);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        Size3D._encodeDiff(obj.val, tracker);
      } else {
        Size3D._encode(obj.val, tracker);
      }
    }
    else if (obj.type === "Size1D") {
      tracker.pushUInt(4);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        tracker.pushFloat(obj.val);
      } else {
        tracker.pushFloat(obj.val);
      }
    }
    else if (obj.type === "EntityEvent") {
      tracker.pushUInt(5);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        tracker.pushUInt(EntityEvent[obj.val]);
      } else {
        tracker.pushUInt(EntityEvent[obj.val]);
      }
    }
    else if (obj.type === "EntityState") {
      tracker.pushUInt(6);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        tracker.pushUInt(EntityState[obj.val]);
      } else {
        tracker.pushUInt(EntityState[obj.val]);
      }
    }
    else if (obj.type === "ChatList") {
      tracker.pushUInt(7);
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        ChatList._encodeDiff(obj.val, tracker);
      } else {
        ChatList._encode(obj.val, tracker);
      }
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<Component> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Component._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Component> {
    const type = tracker.nextUInt();
    const partial = tracker.nextBoolean();
    if (type === 0) {
      if (partial) {
        return { partial, type: "Color", val: tracker.nextString() };
      } else {
        return { partial, type: "Color", val: tracker.nextString() };
      }
    }
    else if (type === 1) {
      if (partial) {
        return { partial, type: "Position", val: Position._decodeDiff(tracker) };
      } else {
        return { partial, type: "Position", val: Position._decode(tracker) };
      }
    }
    else if (type === 2) {
      if (partial) {
        return { partial, type: "Rotation", val: Rotation._decodeDiff(tracker) };
      } else {
        return { partial, type: "Rotation", val: Rotation._decode(tracker) };
      }
    }
    else if (type === 3) {
      if (partial) {
        return { partial, type: "Size3D", val: Size3D._decodeDiff(tracker) };
      } else {
        return { partial, type: "Size3D", val: Size3D._decode(tracker) };
      }
    }
    else if (type === 4) {
      if (partial) {
        return { partial, type: "Size1D", val: tracker.nextFloat() };
      } else {
        return { partial, type: "Size1D", val: tracker.nextFloat() };
      }
    }
    else if (type === 5) {
      if (partial) {
        return { partial, type: "EntityEvent", val: EntityEvent[tracker.nextUInt()] };
      } else {
        return { partial, type: "EntityEvent", val: EntityEvent[tracker.nextUInt()] };
      }
    }
    else if (type === 6) {
      if (partial) {
        return { partial, type: "EntityState", val: EntityState[tracker.nextUInt()] };
      } else {
        return { partial, type: "EntityState", val: EntityState[tracker.nextUInt()] };
      }
    }
    else if (type === 7) {
      if (partial) {
        return { partial, type: "ChatList", val: ChatList._decodeDiff(tracker) };
      } else {
        return { partial, type: "ChatList", val: ChatList._decode(tracker) };
      }
    }
    throw new Error("Invalid union");
  },
  applyDiff(obj: Component, diff: _.DeepPartial<Component> | typeof _.NO_DIFF): Component {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    if (!diff.partial) {
      return diff;
    }
    if (obj.type === "Color" && diff.type === "Color") {
      return { type: obj.type, val: diff.val };
    }
    else if (obj.type === "Position" && diff.type === "Position") {
      return { type: obj.type, val: Position.applyDiff(obj.val, diff.val) };
    }
    else if (obj.type === "Rotation" && diff.type === "Rotation") {
      return { type: obj.type, val: Rotation.applyDiff(obj.val, diff.val) };
    }
    else if (obj.type === "Size3D" && diff.type === "Size3D") {
      return { type: obj.type, val: Size3D.applyDiff(obj.val, diff.val) };
    }
    else if (obj.type === "Size1D" && diff.type === "Size1D") {
      return { type: obj.type, val: diff.val };
    }
    else if (obj.type === "EntityEvent" && diff.type === "EntityEvent") {
      return { type: obj.type, val: diff.val };
    }
    else if (obj.type === "EntityState" && diff.type === "EntityState") {
      return { type: obj.type, val: diff.val };
    }
    else if (obj.type === "ChatList" && diff.type === "ChatList") {
      return { type: obj.type, val: ChatList.applyDiff(obj.val, diff.val) };
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
  encode(obj: Entity) {
    return Entity._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Entity, tracker: _.Tracker) {
    tracker.pushInt(obj.entityId);
    tracker.pushArray(obj.components, (x) => Component._encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array): Entity {
    return Entity._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Entity {
    return {
      entityId: tracker.nextInt(),
      components: tracker.nextArray(() => Component._decode(tracker)),
    };
  },
  computeDiff(a: Entity, b: Entity): _.DeepPartial<Entity> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Entity> =  {
      entityId: _.diffPrimitive(a.entityId, b.entityId),
      components: _.diffArray(a.components, b.components, (x, y) => Component.computeDiff(x, y)),
    };
    return diff.entityId === _.NO_DIFF && diff.components === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Entity> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Entity._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Entity>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.entityId !== _.NO_DIFF);
    if (obj.entityId !== _.NO_DIFF) {
      tracker.pushInt(obj.entityId);
    }
    tracker.pushBoolean(obj.components !== _.NO_DIFF);
    if (obj.components !== _.NO_DIFF) {
      tracker.pushArrayDiff<Component>(obj.components, (x) => Component._encode(x, tracker), (x) => Component._encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<Entity> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Entity._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Entity> {
    return {
      entityId: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      components: tracker.nextBoolean() ? tracker.nextArrayDiff<Component>(() => Component._decode(tracker), () => Component._decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: Entity, diff: _.DeepPartial<Entity> | typeof _.NO_DIFF): Entity {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      entityId: diff.entityId === _.NO_DIFF ? obj.entityId : diff.entityId,
      components: diff.components === _.NO_DIFF ? obj.components : _.patchArray<Component>(obj.components, diff.components, (a, b) => Component.applyDiff(a, b)),
    };
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
  encode(obj: Snapshot) {
    return Snapshot._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Snapshot, tracker: _.Tracker) {
    tracker.pushArray(obj.entities, (x) => Entity._encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array): Snapshot {
    return Snapshot._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Snapshot {
    return {
      entities: tracker.nextArray(() => Entity._decode(tracker)),
    };
  },
  computeDiff(a: Snapshot, b: Snapshot): _.DeepPartial<Snapshot> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Snapshot> =  {
      entities: _.diffArray(a.entities, b.entities, (x, y) => Entity.computeDiff(x, y)),
    };
    return diff.entities === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Snapshot> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Snapshot._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Snapshot>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.entities !== _.NO_DIFF);
    if (obj.entities !== _.NO_DIFF) {
      tracker.pushArrayDiff<Entity>(obj.entities, (x) => Entity._encode(x, tracker), (x) => Entity._encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<Snapshot> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Snapshot._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Snapshot> {
    return {
      entities: tracker.nextBoolean() ? tracker.nextArrayDiff<Entity>(() => Entity._decode(tracker), () => Entity._decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: Snapshot, diff: _.DeepPartial<Snapshot> | typeof _.NO_DIFF): Snapshot {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      entities: diff.entities === _.NO_DIFF ? obj.entities : _.patchArray<Entity>(obj.entities, diff.entities, (a, b) => Entity.applyDiff(a, b)),
    };
  },
};
