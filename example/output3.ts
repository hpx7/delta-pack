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
  encode(obj: ChatMessage, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    _.writeString(output, obj.author);
    _.writeString(output, obj.content);
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decode(input: Uint8Array | _.Reader, track?: _.Tracker): ChatMessage {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      author: _.parseString(reader),
      content: _.parseString(reader),
    };
  },
  computeDiff(a: ChatMessage, b: ChatMessage): _.DeepPartial<ChatMessage> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<ChatMessage> =  {
      author: _.diffPrimitive(a.author, b.author),
      content: _.diffPrimitive(a.content, b.content),
    };
    return diff.author === _.NO_DIFF && diff.content === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<ChatMessage>, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    tracker.push(obj.author !== _.NO_DIFF);
    if (obj.author !== _.NO_DIFF) {
      _.writeString(output, obj.author);
    }
    tracker.push(obj.content !== _.NO_DIFF);
    if (obj.content !== _.NO_DIFF) {
      _.writeString(output, obj.content);
    }
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decodeDiff(input: Uint8Array | _.Reader, track?: _.Tracker): _.DeepPartial<ChatMessage> {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      author: tracker.next() ? _.parseString(reader) : _.NO_DIFF,
      content: tracker.next() ? _.parseString(reader) : _.NO_DIFF,
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
  encode(obj: ChatList, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    _.writeArray(output, obj.messages, (x) => ChatMessage.encode(x, tracker, output));
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decode(input: Uint8Array | _.Reader, track?: _.Tracker): ChatList {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      messages: _.parseArray(reader, () => ChatMessage.decode(reader, tracker)),
    };
  },
  computeDiff(a: ChatList, b: ChatList): _.DeepPartial<ChatList> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<ChatList> =  {
      messages: _.diffArray(a.messages, b.messages, (x, y) => ChatMessage.computeDiff(x, y)),
    };
    return diff.messages === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<ChatList>, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    tracker.push(obj.messages !== _.NO_DIFF);
    if (obj.messages !== _.NO_DIFF) {
      _.writeArrayDiff<ChatMessage>(output, tracker, obj.messages, (x) => ChatMessage.encode(x, tracker, output), (x) => ChatMessage.encodeDiff(x, tracker, output));
    }
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decodeDiff(input: Uint8Array | _.Reader, track?: _.Tracker): _.DeepPartial<ChatList> {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      messages: tracker.next() ? _.parseArrayDiff<ChatMessage>(reader, tracker, () => ChatMessage.decode(reader, tracker), () => ChatMessage.decodeDiff(reader, tracker)) : _.NO_DIFF,
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
  encode(obj: Position, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    _.writeFloat(output, obj.x);
    _.writeFloat(output, obj.y);
    _.writeFloat(output, obj.z);
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decode(input: Uint8Array | _.Reader, track?: _.Tracker): Position {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      x: _.parseFloat(reader),
      y: _.parseFloat(reader),
      z: _.parseFloat(reader),
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
  encodeDiff(obj: _.DeepPartial<Position>, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeFloat(output, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeFloat(output, obj.y);
    }
    tracker.push(obj.z !== _.NO_DIFF);
    if (obj.z !== _.NO_DIFF) {
      _.writeFloat(output, obj.z);
    }
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decodeDiff(input: Uint8Array | _.Reader, track?: _.Tracker): _.DeepPartial<Position> {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      x: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
      y: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
      z: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
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
  encode(obj: Rotation, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    _.writeFloat(output, obj.x);
    _.writeFloat(output, obj.y);
    _.writeFloat(output, obj.z);
    _.writeFloat(output, obj.w);
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decode(input: Uint8Array | _.Reader, track?: _.Tracker): Rotation {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      x: _.parseFloat(reader),
      y: _.parseFloat(reader),
      z: _.parseFloat(reader),
      w: _.parseFloat(reader),
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
  encodeDiff(obj: _.DeepPartial<Rotation>, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeFloat(output, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeFloat(output, obj.y);
    }
    tracker.push(obj.z !== _.NO_DIFF);
    if (obj.z !== _.NO_DIFF) {
      _.writeFloat(output, obj.z);
    }
    tracker.push(obj.w !== _.NO_DIFF);
    if (obj.w !== _.NO_DIFF) {
      _.writeFloat(output, obj.w);
    }
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decodeDiff(input: Uint8Array | _.Reader, track?: _.Tracker): _.DeepPartial<Rotation> {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      x: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
      y: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
      z: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
      w: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
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
  encode(obj: Size3D, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    _.writeFloat(output, obj.width);
    _.writeFloat(output, obj.height);
    _.writeFloat(output, obj.depth);
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decode(input: Uint8Array | _.Reader, track?: _.Tracker): Size3D {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      width: _.parseFloat(reader),
      height: _.parseFloat(reader),
      depth: _.parseFloat(reader),
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
  encodeDiff(obj: _.DeepPartial<Size3D>, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    tracker.push(obj.width !== _.NO_DIFF);
    if (obj.width !== _.NO_DIFF) {
      _.writeFloat(output, obj.width);
    }
    tracker.push(obj.height !== _.NO_DIFF);
    if (obj.height !== _.NO_DIFF) {
      _.writeFloat(output, obj.height);
    }
    tracker.push(obj.depth !== _.NO_DIFF);
    if (obj.depth !== _.NO_DIFF) {
      _.writeFloat(output, obj.depth);
    }
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decodeDiff(input: Uint8Array | _.Reader, track?: _.Tracker): _.DeepPartial<Size3D> {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      width: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
      height: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
      depth: tracker.next() ? _.parseFloat(reader) : _.NO_DIFF,
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
  encode(obj: Component, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    if (obj.type === "Color") {
      _.writeUInt8(output, 0);
      _.writeString(output, obj.val);
    }
    else if (obj.type === "Position") {
      _.writeUInt8(output, 1);
      Position.encode(obj.val, tracker, output);
    }
    else if (obj.type === "Rotation") {
      _.writeUInt8(output, 2);
      Rotation.encode(obj.val, tracker, output);
    }
    else if (obj.type === "Size3D") {
      _.writeUInt8(output, 3);
      Size3D.encode(obj.val, tracker, output);
    }
    else if (obj.type === "Size1D") {
      _.writeUInt8(output, 4);
      _.writeFloat(output, obj.val);
    }
    else if (obj.type === "EntityEvent") {
      _.writeUInt8(output, 5);
      _.writeUInt8(output, obj.val);
    }
    else if (obj.type === "EntityState") {
      _.writeUInt8(output, 6);
      _.writeUInt8(output, obj.val);
    }
    else if (obj.type === "ChatList") {
      _.writeUInt8(output, 7);
      ChatList.encode(obj.val, tracker, output);
    }
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decode(input: Uint8Array | _.Reader, track?: _.Tracker): Component {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    const type = _.parseUInt8(reader);
    if (type === 0) {
      return { type: "Color", val: _.parseString(reader) };
    }
    else if (type === 1) {
      return { type: "Position", val: Position.decode(reader, tracker) };
    }
    else if (type === 2) {
      return { type: "Rotation", val: Rotation.decode(reader, tracker) };
    }
    else if (type === 3) {
      return { type: "Size3D", val: Size3D.decode(reader, tracker) };
    }
    else if (type === 4) {
      return { type: "Size1D", val: _.parseFloat(reader) };
    }
    else if (type === 5) {
      return { type: "EntityEvent", val: _.parseUInt8(reader) };
    }
    else if (type === 6) {
      return { type: "EntityState", val: _.parseUInt8(reader) };
    }
    else if (type === 7) {
      return { type: "ChatList", val: ChatList.decode(reader, tracker) };
    }
    throw new Error("Invalid union");
  },
  encodeDiff(obj: _.DeepPartial<Component>, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    if (obj.type === "Color") {
      _.writeUInt8(output, 0);
      _.writeBoolean(tracker, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeString(output, obj.val);
      }
    }
    else if (obj.type === "Position") {
      _.writeUInt8(output, 1);
      _.writeBoolean(tracker, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Position.encodeDiff(obj.val, tracker, output);
      }
    }
    else if (obj.type === "Rotation") {
      _.writeUInt8(output, 2);
      _.writeBoolean(tracker, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Rotation.encodeDiff(obj.val, tracker, output);
      }
    }
    else if (obj.type === "Size3D") {
      _.writeUInt8(output, 3);
      _.writeBoolean(tracker, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       Size3D.encodeDiff(obj.val, tracker, output);
      }
    }
    else if (obj.type === "Size1D") {
      _.writeUInt8(output, 4);
      _.writeBoolean(tracker, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeFloat(output, obj.val);
      }
    }
    else if (obj.type === "EntityEvent") {
      _.writeUInt8(output, 5);
      _.writeBoolean(tracker, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeUInt8(output, obj.val);
      }
    }
    else if (obj.type === "EntityState") {
      _.writeUInt8(output, 6);
      _.writeBoolean(tracker, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       _.writeUInt8(output, obj.val);
      }
    }
    else if (obj.type === "ChatList") {
      _.writeUInt8(output, 7);
      _.writeBoolean(tracker, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       ChatList.encodeDiff(obj.val, tracker, output);
      }
    }
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decodeDiff(input: Uint8Array | _.Reader, track?: _.Tracker): _.DeepPartial<Component> {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    const type = _.parseUInt8(reader);
    if (type === 0) {
      return { type: "Color", val: _.parseBoolean(tracker) ? _.parseString(reader) : _.NO_DIFF };
    }
    else if (type === 1) {
      return { type: "Position", val: _.parseBoolean(tracker) ? Position.decodeDiff(reader, tracker) : _.NO_DIFF };
    }
    else if (type === 2) {
      return { type: "Rotation", val: _.parseBoolean(tracker) ? Rotation.decodeDiff(reader, tracker) : _.NO_DIFF };
    }
    else if (type === 3) {
      return { type: "Size3D", val: _.parseBoolean(tracker) ? Size3D.decodeDiff(reader, tracker) : _.NO_DIFF };
    }
    else if (type === 4) {
      return { type: "Size1D", val: _.parseBoolean(tracker) ? _.parseFloat(reader) : _.NO_DIFF };
    }
    else if (type === 5) {
      return { type: "EntityEvent", val: _.parseBoolean(tracker) ? _.parseUInt8(reader) : _.NO_DIFF };
    }
    else if (type === 6) {
      return { type: "EntityState", val: _.parseBoolean(tracker) ? _.parseUInt8(reader) : _.NO_DIFF };
    }
    else if (type === 7) {
      return { type: "ChatList", val: _.parseBoolean(tracker) ? ChatList.decodeDiff(reader, tracker) : _.NO_DIFF };
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
  encode(obj: Entity, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    _.writeInt(output, obj.entityId);
    _.writeArray(output, obj.components, (x) => Component.encode(x, tracker, output));
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decode(input: Uint8Array | _.Reader, track?: _.Tracker): Entity {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      entityId: _.parseInt(reader),
      components: _.parseArray(reader, () => Component.decode(reader, tracker)),
    };
  },
  computeDiff(a: Entity, b: Entity): _.DeepPartial<Entity> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Entity> =  {
      entityId: _.diffPrimitive(a.entityId, b.entityId),
      components: _.diffArray(a.components, b.components, (x, y) => Component.computeDiff(x, y)),
    };
    return diff.entityId === _.NO_DIFF && diff.components === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Entity>, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    tracker.push(obj.entityId !== _.NO_DIFF);
    if (obj.entityId !== _.NO_DIFF) {
      _.writeInt(output, obj.entityId);
    }
    tracker.push(obj.components !== _.NO_DIFF);
    if (obj.components !== _.NO_DIFF) {
      _.writeArrayDiff<Component>(output, tracker, obj.components, (x) => Component.encode(x, tracker, output), (x) => Component.encodeDiff(x, tracker, output));
    }
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decodeDiff(input: Uint8Array | _.Reader, track?: _.Tracker): _.DeepPartial<Entity> {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      entityId: tracker.next() ? _.parseInt(reader) : _.NO_DIFF,
      components: tracker.next() ? _.parseArrayDiff<Component>(reader, tracker, () => Component.decode(reader, tracker), () => Component.decodeDiff(reader, tracker)) : _.NO_DIFF,
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
  encode(obj: Snapshot, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    _.writeArray(output, obj.entities, (x) => Entity.encode(x, tracker, output));
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decode(input: Uint8Array | _.Reader, track?: _.Tracker): Snapshot {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      entities: _.parseArray(reader, () => Entity.decode(reader, tracker)),
    };
  },
  computeDiff(a: Snapshot, b: Snapshot): _.DeepPartial<Snapshot> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Snapshot> =  {
      entities: _.diffArray(a.entities, b.entities, (x, y) => Entity.computeDiff(x, y)),
    };
    return diff.entities === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Snapshot>, track?: _.Tracker, output: _.Writer = new _.Writer()) {
    const tracker = track ?? new _.Tracker();
    tracker.push(obj.entities !== _.NO_DIFF);
    if (obj.entities !== _.NO_DIFF) {
      _.writeArrayDiff<Entity>(output, tracker, obj.entities, (x) => Entity.encode(x, tracker, output), (x) => Entity.encodeDiff(x, tracker, output));
    }
    if (track === undefined) {
      const writer = new _.Writer();
      tracker.encode(writer);
      writer.writeBuffer(output.toBuffer());
      return writer;
    }
    return output;
  },
  decodeDiff(input: Uint8Array | _.Reader, track?: _.Tracker): _.DeepPartial<Snapshot> {
    const reader = input instanceof Uint8Array ? new _.Reader(input) : input;
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(reader) : track!;
    return {
      entities: tracker.next() ? _.parseArrayDiff<Entity>(reader, tracker, () => Entity.decode(reader, tracker), () => Entity.decodeDiff(reader, tracker)) : _.NO_DIFF,
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
