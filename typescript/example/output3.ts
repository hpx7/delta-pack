import * as _ from "@hathora/delta-pack/helpers";

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
  equals(a: ChatMessage, b: ChatMessage): boolean {
    return (
      a.author === b.author &&
      a.content === b.content
    );
  },
  encode(obj: ChatMessage): Uint8Array {
    const tracker = new _.Tracker();
    ChatMessage._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ChatMessage, tracker: _.Tracker): void {
    tracker.pushString(obj.author);
    tracker.pushString(obj.content);
  },
  encodeDiff(a: ChatMessage, b: ChatMessage): Uint8Array {
    const tracker = new _.Tracker();
    ChatMessage._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ChatMessage, b: ChatMessage, tracker: _.Tracker): void {
    const changed = !ChatMessage.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.author, b.author);
    tracker.pushStringDiff(a.content, b.content);
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
  decodeDiff(obj: ChatMessage, input: Uint8Array): ChatMessage {
    const tracker = _.Tracker.parse(input);
    return ChatMessage._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ChatMessage, tracker: _.Tracker): ChatMessage {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      author: tracker.nextStringDiff(obj.author),
      content: tracker.nextStringDiff(obj.content),
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
  equals(a: ChatList, b: ChatList): boolean {
    return (
      _.equalsArray(a.messages, b.messages, (x, y) => ChatMessage.equals(x, y))
    );
  },
  encode(obj: ChatList): Uint8Array {
    const tracker = new _.Tracker();
    ChatList._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ChatList, tracker: _.Tracker): void {
    tracker.pushArray(obj.messages, (x) => ChatMessage._encode(x, tracker));
  },
  encodeDiff(a: ChatList, b: ChatList): Uint8Array {
    const tracker = new _.Tracker();
    ChatList._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ChatList, b: ChatList, tracker: _.Tracker): void {
    const changed = !ChatList.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushArrayDiff<ChatMessage>(
      a.messages,
      b.messages,
      (x, y) => ChatMessage.equals(x, y),
      (x) => ChatMessage._encode(x, tracker),
      (x, y) => ChatMessage._encodeDiff(x, y, tracker)
    );
  },
  decode(input: Uint8Array): ChatList {
    return ChatList._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ChatList {
    return {
      messages: tracker.nextArray(() => ChatMessage._decode(tracker)),
    };
  },
  decodeDiff(obj: ChatList, input: Uint8Array): ChatList {
    const tracker = _.Tracker.parse(input);
    return ChatList._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ChatList, tracker: _.Tracker): ChatList {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      messages: tracker.nextArrayDiff<ChatMessage>(
        obj.messages,
        () => ChatMessage._decode(tracker),
        (x) => ChatMessage._decodeDiff(x, tracker)
      ),
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
  equals(a: Position, b: Position): boolean {
    return (
      Math.abs(a.x - b.x) < 0.00001 &&
      Math.abs(a.y - b.y) < 0.00001 &&
      Math.abs(a.z - b.z) < 0.00001
    );
  },
  encode(obj: Position): Uint8Array {
    const tracker = new _.Tracker();
    Position._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Position, tracker: _.Tracker): void {
    tracker.pushFloat(obj.x);
    tracker.pushFloat(obj.y);
    tracker.pushFloat(obj.z);
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
    tracker.pushFloatDiff(a.x, b.x);
    tracker.pushFloatDiff(a.y, b.y);
    tracker.pushFloatDiff(a.z, b.z);
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
      x: tracker.nextFloatDiff(obj.x),
      y: tracker.nextFloatDiff(obj.y),
      z: tracker.nextFloatDiff(obj.z),
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
  equals(a: Rotation, b: Rotation): boolean {
    return (
      Math.abs(a.x - b.x) < 0.00001 &&
      Math.abs(a.y - b.y) < 0.00001 &&
      Math.abs(a.z - b.z) < 0.00001 &&
      Math.abs(a.w - b.w) < 0.00001
    );
  },
  encode(obj: Rotation): Uint8Array {
    const tracker = new _.Tracker();
    Rotation._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Rotation, tracker: _.Tracker): void {
    tracker.pushFloat(obj.x);
    tracker.pushFloat(obj.y);
    tracker.pushFloat(obj.z);
    tracker.pushFloat(obj.w);
  },
  encodeDiff(a: Rotation, b: Rotation): Uint8Array {
    const tracker = new _.Tracker();
    Rotation._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Rotation, b: Rotation, tracker: _.Tracker): void {
    const changed = !Rotation.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushFloatDiff(a.x, b.x);
    tracker.pushFloatDiff(a.y, b.y);
    tracker.pushFloatDiff(a.z, b.z);
    tracker.pushFloatDiff(a.w, b.w);
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
  decodeDiff(obj: Rotation, input: Uint8Array): Rotation {
    const tracker = _.Tracker.parse(input);
    return Rotation._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Rotation, tracker: _.Tracker): Rotation {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      x: tracker.nextFloatDiff(obj.x),
      y: tracker.nextFloatDiff(obj.y),
      z: tracker.nextFloatDiff(obj.z),
      w: tracker.nextFloatDiff(obj.w),
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
  equals(a: Size3D, b: Size3D): boolean {
    return (
      Math.abs(a.width - b.width) < 0.00001 &&
      Math.abs(a.height - b.height) < 0.00001 &&
      Math.abs(a.depth - b.depth) < 0.00001
    );
  },
  encode(obj: Size3D): Uint8Array {
    const tracker = new _.Tracker();
    Size3D._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Size3D, tracker: _.Tracker): void {
    tracker.pushFloat(obj.width);
    tracker.pushFloat(obj.height);
    tracker.pushFloat(obj.depth);
  },
  encodeDiff(a: Size3D, b: Size3D): Uint8Array {
    const tracker = new _.Tracker();
    Size3D._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Size3D, b: Size3D, tracker: _.Tracker): void {
    const changed = !Size3D.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushFloatDiff(a.width, b.width);
    tracker.pushFloatDiff(a.height, b.height);
    tracker.pushFloatDiff(a.depth, b.depth);
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
  decodeDiff(obj: Size3D, input: Uint8Array): Size3D {
    const tracker = _.Tracker.parse(input);
    return Size3D._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Size3D, tracker: _.Tracker): Size3D {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      width: tracker.nextFloatDiff(obj.width),
      height: tracker.nextFloatDiff(obj.height),
      depth: tracker.nextFloatDiff(obj.depth),
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
  equals(a: Component, b: Component): boolean {
    if (a.type === "Color" && b.type === "Color") {
      return a.val === b.val;
    }
    else if (a.type === "Position" && b.type === "Position") {
      return Position.equals(a.val, b.val);
    }
    else if (a.type === "Rotation" && b.type === "Rotation") {
      return Rotation.equals(a.val, b.val);
    }
    else if (a.type === "Size3D" && b.type === "Size3D") {
      return Size3D.equals(a.val, b.val);
    }
    else if (a.type === "Size1D" && b.type === "Size1D") {
      return Math.abs(a.val - b.val) < 0.00001;
    }
    else if (a.type === "EntityEvent" && b.type === "EntityEvent") {
      return a.val === b.val;
    }
    else if (a.type === "EntityState" && b.type === "EntityState") {
      return a.val === b.val;
    }
    else if (a.type === "ChatList" && b.type === "ChatList") {
      return ChatList.equals(a.val, b.val);
    }
    return false;
  },
  encode(obj: Component): Uint8Array {
    const tracker = new _.Tracker();
    Component._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Component, tracker: _.Tracker): void {
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
  },
  encodeDiff(a: Component, b: Component): Uint8Array {
    const tracker = new _.Tracker();
    Component._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Component, b: Component, tracker: _.Tracker): void {
    if (b.type === "Color") {
      tracker.pushBoolean(a.type === "Color");
      if (a.type === "Color") {
        tracker.pushStringDiff(a.val, b.val);
      } else {
        tracker.pushUInt(0);
        tracker.pushString(b.val);
      }
    }
    else if (b.type === "Position") {
      tracker.pushBoolean(a.type === "Position");
      if (a.type === "Position") {
        Position._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(1);
        Position._encode(b.val, tracker);
      }
    }
    else if (b.type === "Rotation") {
      tracker.pushBoolean(a.type === "Rotation");
      if (a.type === "Rotation") {
        Rotation._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(2);
        Rotation._encode(b.val, tracker);
      }
    }
    else if (b.type === "Size3D") {
      tracker.pushBoolean(a.type === "Size3D");
      if (a.type === "Size3D") {
        Size3D._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(3);
        Size3D._encode(b.val, tracker);
      }
    }
    else if (b.type === "Size1D") {
      tracker.pushBoolean(a.type === "Size1D");
      if (a.type === "Size1D") {
        tracker.pushFloatDiff(a.val, b.val);
      } else {
        tracker.pushUInt(4);
        tracker.pushFloat(b.val);
      }
    }
    else if (b.type === "EntityEvent") {
      tracker.pushBoolean(a.type === "EntityEvent");
      if (a.type === "EntityEvent") {
        tracker.pushUIntDiff(EntityEvent[a.val], EntityEvent[b.val]);
      } else {
        tracker.pushUInt(5);
        tracker.pushUInt(EntityEvent[b.val]);
      }
    }
    else if (b.type === "EntityState") {
      tracker.pushBoolean(a.type === "EntityState");
      if (a.type === "EntityState") {
        tracker.pushUIntDiff(EntityState[a.val], EntityState[b.val]);
      } else {
        tracker.pushUInt(6);
        tracker.pushUInt(EntityState[b.val]);
      }
    }
    else if (b.type === "ChatList") {
      tracker.pushBoolean(a.type === "ChatList");
      if (a.type === "ChatList") {
        ChatList._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(7);
        ChatList._encode(b.val, tracker);
      }
    }
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
  decodeDiff(obj: Component, input: Uint8Array): Component {
    const tracker = _.Tracker.parse(input);
    return Component._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Component, tracker: _.Tracker): Component {
    const isSameType = tracker.nextBoolean();
    if (isSameType) {
      if (obj.type === "Color") {
        return {
          type: "Color",
          val: tracker.nextStringDiff(obj.val),
        };
      }
      else if (obj.type === "Position") {
        return {
          type: "Position",
          val: Position._decodeDiff(obj.val, tracker),
        };
      }
      else if (obj.type === "Rotation") {
        return {
          type: "Rotation",
          val: Rotation._decodeDiff(obj.val, tracker),
        };
      }
      else if (obj.type === "Size3D") {
        return {
          type: "Size3D",
          val: Size3D._decodeDiff(obj.val, tracker),
        };
      }
      else if (obj.type === "Size1D") {
        return {
          type: "Size1D",
          val: tracker.nextFloatDiff(obj.val),
        };
      }
      else if (obj.type === "EntityEvent") {
        return {
          type: "EntityEvent",
          val: EntityEvent[tracker.nextUIntDiff(EntityEvent[obj.val])],
        };
      }
      else if (obj.type === "EntityState") {
        return {
          type: "EntityState",
          val: EntityState[tracker.nextUIntDiff(EntityState[obj.val])],
        };
      }
      else if (obj.type === "ChatList") {
        return {
          type: "ChatList",
          val: ChatList._decodeDiff(obj.val, tracker),
        };
      }
      throw new Error("Invalid union diff");
    } else {
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
      throw new Error("Invalid union diff");
    }
  }
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
  equals(a: Entity, b: Entity): boolean {
    return (
      a.entityId === b.entityId &&
      _.equalsArray(a.components, b.components, (x, y) => Component.equals(x, y))
    );
  },
  encode(obj: Entity): Uint8Array {
    const tracker = new _.Tracker();
    Entity._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Entity, tracker: _.Tracker): void {
    tracker.pushInt(obj.entityId);
    tracker.pushArray(obj.components, (x) => Component._encode(x, tracker));
  },
  encodeDiff(a: Entity, b: Entity): Uint8Array {
    const tracker = new _.Tracker();
    Entity._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Entity, b: Entity, tracker: _.Tracker): void {
    const changed = !Entity.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushIntDiff(a.entityId, b.entityId);
    tracker.pushArrayDiff<Component>(
      a.components,
      b.components,
      (x, y) => Component.equals(x, y),
      (x) => Component._encode(x, tracker),
      (x, y) => Component._encodeDiff(x, y, tracker)
    );
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
  decodeDiff(obj: Entity, input: Uint8Array): Entity {
    const tracker = _.Tracker.parse(input);
    return Entity._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Entity, tracker: _.Tracker): Entity {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      entityId: tracker.nextIntDiff(obj.entityId),
      components: tracker.nextArrayDiff<Component>(
        obj.components,
        () => Component._decode(tracker),
        (x) => Component._decodeDiff(x, tracker)
      ),
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
  equals(a: Snapshot, b: Snapshot): boolean {
    return (
      _.equalsArray(a.entities, b.entities, (x, y) => Entity.equals(x, y))
    );
  },
  encode(obj: Snapshot): Uint8Array {
    const tracker = new _.Tracker();
    Snapshot._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Snapshot, tracker: _.Tracker): void {
    tracker.pushArray(obj.entities, (x) => Entity._encode(x, tracker));
  },
  encodeDiff(a: Snapshot, b: Snapshot): Uint8Array {
    const tracker = new _.Tracker();
    Snapshot._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Snapshot, b: Snapshot, tracker: _.Tracker): void {
    const changed = !Snapshot.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushArrayDiff<Entity>(
      a.entities,
      b.entities,
      (x, y) => Entity.equals(x, y),
      (x) => Entity._encode(x, tracker),
      (x, y) => Entity._encodeDiff(x, y, tracker)
    );
  },
  decode(input: Uint8Array): Snapshot {
    return Snapshot._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Snapshot {
    return {
      entities: tracker.nextArray(() => Entity._decode(tracker)),
    };
  },
  decodeDiff(obj: Snapshot, input: Uint8Array): Snapshot {
    const tracker = _.Tracker.parse(input);
    return Snapshot._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Snapshot, tracker: _.Tracker): Snapshot {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      entities: tracker.nextArrayDiff<Entity>(
        obj.entities,
        () => Entity._decode(tracker),
        (x) => Entity._decodeDiff(x, tracker)
      ),
    };
  },
};
