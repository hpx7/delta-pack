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

export enum EntityEvent {
  DESTROYED,
}
    

export enum EntityState {
  IDLE,
  WALK,
  RUN,
  JUMP,
  ATTACK,
  FALL,
  DEATH,
}
    
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
  encode(obj: ChatMessage, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeString(buf, obj.author);
    _.writeString(buf, obj.content);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<ChatMessage>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.author !== _.NO_DIFF);
    if (obj.author !== _.NO_DIFF) {
      _.writeString(buf, obj.author);
    }
    tracker.push(obj.content !== _.NO_DIFF);
    if (obj.content !== _.NO_DIFF) {
      _.writeString(buf, obj.content);
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): ChatMessage {
    const sb = buf;
    return {
      author: _.parseString(sb),
      content: _.parseString(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<ChatMessage> {
    const sb = buf;
    return {
      author: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      content: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: ChatMessage, b: ChatMessage): _.DeepPartial<ChatMessage> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<ChatMessage> =  {
      author: _.diffPrimitive(a.author, b.author),
      content: _.diffPrimitive(a.content, b.content),
    };
    return diff.author === _.NO_DIFF && diff.content === _.NO_DIFF ? _.NO_DIFF : diff;
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
  encode(obj: ChatList, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeArray(buf, obj.messages, (x) => ChatMessage.encode(x, tracker, buf));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<ChatList>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.messages !== _.NO_DIFF);
    if (obj.messages !== _.NO_DIFF) {
      _.writeArrayDiff<ChatMessage>(buf, tracker, obj.messages, (x) => ChatMessage.encode(x, tracker, buf), (x) => ChatMessage.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): ChatList {
    const sb = buf;
    return {
      messages: _.parseArray(sb, () => ChatMessage.decode(sb, tracker)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<ChatList> {
    const sb = buf;
    return {
      messages: tracker.next() ? _.parseArrayDiff<ChatMessage>(sb, tracker, () => ChatMessage.decode(sb, tracker), () => ChatMessage.decodeDiff(sb, tracker)) : _.NO_DIFF,
    };
  },
  computeDiff(a: ChatList, b: ChatList): _.DeepPartial<ChatList> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<ChatList> =  {
      messages: _.diffArray(a.messages, b.messages, (x, y) => ChatMessage.computeDiff(x, y)),
    };
    return diff.messages === _.NO_DIFF ? _.NO_DIFF : diff;
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
  encode(obj: Position, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeFloat(buf, obj.x);
    _.writeFloat(buf, obj.y);
    _.writeFloat(buf, obj.z);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Position>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeFloat(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeFloat(buf, obj.y);
    }
    tracker.push(obj.z !== _.NO_DIFF);
    if (obj.z !== _.NO_DIFF) {
      _.writeFloat(buf, obj.z);
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Position {
    const sb = buf;
    return {
      x: _.parseFloat(sb),
      y: _.parseFloat(sb),
      z: _.parseFloat(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Position> {
    const sb = buf;
    return {
      x: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
      z: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Position, b: Position): _.DeepPartial<Position> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Position> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
      z: _.diffPrimitive(a.z, b.z),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF && diff.z === _.NO_DIFF ? _.NO_DIFF : diff;
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
  encode(obj: Rotation, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeFloat(buf, obj.x);
    _.writeFloat(buf, obj.y);
    _.writeFloat(buf, obj.z);
    _.writeFloat(buf, obj.w);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Rotation>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeFloat(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeFloat(buf, obj.y);
    }
    tracker.push(obj.z !== _.NO_DIFF);
    if (obj.z !== _.NO_DIFF) {
      _.writeFloat(buf, obj.z);
    }
    tracker.push(obj.w !== _.NO_DIFF);
    if (obj.w !== _.NO_DIFF) {
      _.writeFloat(buf, obj.w);
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Rotation {
    const sb = buf;
    return {
      x: _.parseFloat(sb),
      y: _.parseFloat(sb),
      z: _.parseFloat(sb),
      w: _.parseFloat(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Rotation> {
    const sb = buf;
    return {
      x: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
      z: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
      w: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Rotation, b: Rotation): _.DeepPartial<Rotation> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Rotation> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
      z: _.diffPrimitive(a.z, b.z),
      w: _.diffPrimitive(a.w, b.w),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF && diff.z === _.NO_DIFF && diff.w === _.NO_DIFF ? _.NO_DIFF : diff;
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
  encode(obj: Size3D, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeFloat(buf, obj.width);
    _.writeFloat(buf, obj.height);
    _.writeFloat(buf, obj.depth);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Size3D>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.width !== _.NO_DIFF);
    if (obj.width !== _.NO_DIFF) {
      _.writeFloat(buf, obj.width);
    }
    tracker.push(obj.height !== _.NO_DIFF);
    if (obj.height !== _.NO_DIFF) {
      _.writeFloat(buf, obj.height);
    }
    tracker.push(obj.depth !== _.NO_DIFF);
    if (obj.depth !== _.NO_DIFF) {
      _.writeFloat(buf, obj.depth);
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Size3D {
    const sb = buf;
    return {
      width: _.parseFloat(sb),
      height: _.parseFloat(sb),
      depth: _.parseFloat(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Size3D> {
    const sb = buf;
    return {
      width: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
      height: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
      depth: tracker.next() ? _.parseFloat(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Size3D, b: Size3D): _.DeepPartial<Size3D> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Size3D> =  {
      width: _.diffPrimitive(a.width, b.width),
      height: _.diffPrimitive(a.height, b.height),
      depth: _.diffPrimitive(a.depth, b.depth),
    };
    return diff.width === _.NO_DIFF && diff.height === _.NO_DIFF && diff.depth === _.NO_DIFF ? _.NO_DIFF : diff;
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
  encode(obj: Component, buf: _.Writer = new _.Writer()) {
    if (obj.type === "Color") {
      _.writeUInt8(buf, 0);
      _.writeString(buf, obj.val);
    }
    else if (obj.type === "Position") {
      _.writeUInt8(buf, 1);
      Position.encode(obj.val, tracker, buf);
    }
    else if (obj.type === "Rotation") {
      _.writeUInt8(buf, 2);
      Rotation.encode(obj.val, tracker, buf);
    }
    else if (obj.type === "Size3D") {
      _.writeUInt8(buf, 3);
      Size3D.encode(obj.val, tracker, buf);
    }
    else if (obj.type === "Size1D") {
      _.writeUInt8(buf, 4);
      _.writeFloat(buf, obj.val);
    }
    else if (obj.type === "EntityEvent") {
      _.writeUInt8(buf, 5);
      _.writeUInt8(buf, obj.val);
    }
    else if (obj.type === "EntityState") {
      _.writeUInt8(buf, 6);
      _.writeUInt8(buf, obj.val);
    }
    else if (obj.type === "ChatList") {
      _.writeUInt8(buf, 7);
      ChatList.encode(obj.val, tracker, buf);
    }
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Component>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    if (obj.type === "Color") {
      _.writeUInt8(buf, 0);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeString(buf, obj.val);
      }
    }
    else if (obj.type === "Position") {
      _.writeUInt8(buf, 1);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Position.encodeDiff(obj.val, tracker, buf);
      }
    }
    else if (obj.type === "Rotation") {
      _.writeUInt8(buf, 2);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Rotation.encodeDiff(obj.val, tracker, buf);
      }
    }
    else if (obj.type === "Size3D") {
      _.writeUInt8(buf, 3);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Size3D.encodeDiff(obj.val, tracker, buf);
      }
    }
    else if (obj.type === "Size1D") {
      _.writeUInt8(buf, 4);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeFloat(buf, obj.val);
      }
    }
    else if (obj.type === "EntityEvent") {
      _.writeUInt8(buf, 5);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeUInt8(buf, obj.val);
      }
    }
    else if (obj.type === "EntityState") {
      _.writeUInt8(buf, 6);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeUInt8(buf, obj.val);
      }
    }
    else if (obj.type === "ChatList") {
      _.writeUInt8(buf, 7);
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       ChatList.encodeDiff(obj.val, tracker, buf);
      }
    }
    return buf;
  },
  decode(sb: _.Reader): Component {
    const type = _.parseUInt8(sb);
    if (type === 0) {
      return { type: "Color", val: _.parseString(sb) };
    }
    else if (type === 1) {
      return { type: "Position", val: Position.decode(sb, tracker) };
    }
    else if (type === 2) {
      return { type: "Rotation", val: Rotation.decode(sb, tracker) };
    }
    else if (type === 3) {
      return { type: "Size3D", val: Size3D.decode(sb, tracker) };
    }
    else if (type === 4) {
      return { type: "Size1D", val: _.parseFloat(sb) };
    }
    else if (type === 5) {
      return { type: "EntityEvent", val: _.parseUInt8(sb) };
    }
    else if (type === 6) {
      return { type: "EntityState", val: _.parseUInt8(sb) };
    }
    else if (type === 7) {
      return { type: "ChatList", val: ChatList.decode(sb, tracker) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(sb: _.Reader, tracker: _.Tracker): _.DeepPartial<Component> {
    const type = _.parseUInt8(sb);
    if (type === 0) {
      return { type: "Color", val: _.parseBoolean(sb) ? _.parseString(sb) : _.NO_DIFF };
    }
    else if (type === 1) {
      return { type: "Position", val: _.parseBoolean(sb) ? Position.decodeDiff(sb, tracker) : _.NO_DIFF };
    }
    else if (type === 2) {
      return { type: "Rotation", val: _.parseBoolean(sb) ? Rotation.decodeDiff(sb, tracker) : _.NO_DIFF };
    }
    else if (type === 3) {
      return { type: "Size3D", val: _.parseBoolean(sb) ? Size3D.decodeDiff(sb, tracker) : _.NO_DIFF };
    }
    else if (type === 4) {
      return { type: "Size1D", val: _.parseBoolean(sb) ? _.parseFloat(sb) : _.NO_DIFF };
    }
    else if (type === 5) {
      return { type: "EntityEvent", val: _.parseBoolean(sb) ? _.parseUInt8(sb) : _.NO_DIFF };
    }
    else if (type === 6) {
      return { type: "EntityState", val: _.parseBoolean(sb) ? _.parseUInt8(sb) : _.NO_DIFF };
    }
    else if (type === 7) {
      return { type: "ChatList", val: _.parseBoolean(sb) ? ChatList.decodeDiff(sb, tracker) : _.NO_DIFF };
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
  encode(obj: Entity, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.entityId);
    _.writeArray(buf, obj.components, (x) => Component.encode(x, tracker, buf));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Entity>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.entityId !== _.NO_DIFF);
    if (obj.entityId !== _.NO_DIFF) {
      _.writeInt(buf, obj.entityId);
    }
    tracker.push(obj.components !== _.NO_DIFF);
    if (obj.components !== _.NO_DIFF) {
      _.writeArrayDiff<Component>(buf, tracker, obj.components, (x) => Component.encode(x, tracker, buf), (x) => Component.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Entity {
    const sb = buf;
    return {
      entityId: _.parseInt(sb),
      components: _.parseArray(sb, () => Component.decode(sb, tracker)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Entity> {
    const sb = buf;
    return {
      entityId: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      components: tracker.next() ? _.parseArrayDiff<Component>(sb, tracker, () => Component.decode(sb, tracker), () => Component.decodeDiff(sb, tracker)) : _.NO_DIFF,
    };
  },
  computeDiff(a: Entity, b: Entity): _.DeepPartial<Entity> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Entity> =  {
      entityId: _.diffPrimitive(a.entityId, b.entityId),
      components: _.diffArray(a.components, b.components, (x, y) => Component.computeDiff(x, y)),
    };
    return diff.entityId === _.NO_DIFF && diff.components === _.NO_DIFF ? _.NO_DIFF : diff;
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
  encode(obj: Snapshot, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    _.writeArray(buf, obj.entities, (x) => Entity.encode(x, tracker, buf));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Snapshot>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.entities !== _.NO_DIFF);
    if (obj.entities !== _.NO_DIFF) {
      _.writeArrayDiff<Entity>(buf, tracker, obj.entities, (x) => Entity.encode(x, tracker, buf), (x) => Entity.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _.Reader, tracker: _.Tracker): Snapshot {
    const sb = buf;
    return {
      entities: _.parseArray(sb, () => Entity.decode(sb, tracker)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Snapshot> {
    const sb = buf;
    return {
      entities: tracker.next() ? _.parseArrayDiff<Entity>(sb, tracker, () => Entity.decode(sb, tracker), () => Entity.decodeDiff(sb, tracker)) : _.NO_DIFF,
    };
  },
  computeDiff(a: Snapshot, b: Snapshot): _.DeepPartial<Snapshot> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Snapshot> =  {
      entities: _.diffArray(a.entities, b.entities, (x, y) => Entity.computeDiff(x, y)),
    };
    return diff.entities === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Snapshot, diff: _.DeepPartial<Snapshot> | typeof _.NO_DIFF): Snapshot {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.entities = diff.entities === _.NO_DIFF ? obj.entities : _.patchArray<Entity>(obj.entities, diff.entities, (a, b) => Entity.applyDiff(a, b));
    return obj;
  },
};
