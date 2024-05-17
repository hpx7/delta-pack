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

export type ChatMessage = {
  author: string;
  content: string;
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
export enum EntityState {
  IDLE,
  WALK,
  RUN,
  JUMP,
  ATTACK,
  FALL,
  DEATH,
}
export type Component = { type: "Color"; val: Color } | { type: "Position"; val: Position } | { type: "Rotation"; val: Rotation } | { type: "EntityState"; val: EntityState };
export type Entity = {
  entityId: number;
  components: Component[];
};
export type Snapshot = {
  entities: Entity[];
  chatList: ChatMessage[];
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

    validationErrors = validatePrimitive(typeof obj.author === "string", `Invalid string: ${ obj.author }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ChatMessage.author");
    }
    validationErrors = validatePrimitive(typeof obj.content === "string", `Invalid string: ${ obj.content }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ChatMessage.content");
    }

    return validationErrors;
  },
  encode(obj: ChatMessage, buf: _Writer = new _Writer()) {
    writeString(buf, obj.author);
    writeString(buf, obj.content);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<ChatMessage>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.author !== _NO_DIFF);
    if (obj.author !== _NO_DIFF) {
      writeString(buf, obj.author);
    }
    tracker.push(obj.content !== _NO_DIFF);
    if (obj.content !== _NO_DIFF) {
      writeString(buf, obj.content);
    }
    return buf;
  },
  decode(buf: _Reader): ChatMessage {
    const sb = buf;
    return {
      author: parseString(sb),
      content: parseString(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<ChatMessage> {
    const sb = buf;
    return {
      author: tracker.next() ? parseString(sb) : _NO_DIFF,
      content: tracker.next() ? parseString(sb) : _NO_DIFF,
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

    validationErrors = validatePrimitive(typeof obj.x === "number", `Invalid float: ${ obj.x }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.x");
    }
    validationErrors = validatePrimitive(typeof obj.y === "number", `Invalid float: ${ obj.y }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.y");
    }
    validationErrors = validatePrimitive(typeof obj.z === "number", `Invalid float: ${ obj.z }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.z");
    }

    return validationErrors;
  },
  encode(obj: Position, buf: _Writer = new _Writer()) {
    writeFloat(buf, obj.x);
    writeFloat(buf, obj.y);
    writeFloat(buf, obj.z);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Position>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.x !== _NO_DIFF);
    if (obj.x !== _NO_DIFF) {
      writeFloat(buf, obj.x);
    }
    tracker.push(obj.y !== _NO_DIFF);
    if (obj.y !== _NO_DIFF) {
      writeFloat(buf, obj.y);
    }
    tracker.push(obj.z !== _NO_DIFF);
    if (obj.z !== _NO_DIFF) {
      writeFloat(buf, obj.z);
    }
    return buf;
  },
  decode(buf: _Reader): Position {
    const sb = buf;
    return {
      x: parseFloat(sb),
      y: parseFloat(sb),
      z: parseFloat(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Position> {
    const sb = buf;
    return {
      x: tracker.next() ? parseFloat(sb) : _NO_DIFF,
      y: tracker.next() ? parseFloat(sb) : _NO_DIFF,
      z: tracker.next() ? parseFloat(sb) : _NO_DIFF,
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

    validationErrors = validatePrimitive(typeof obj.x === "number", `Invalid float: ${ obj.x }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Rotation.x");
    }
    validationErrors = validatePrimitive(typeof obj.y === "number", `Invalid float: ${ obj.y }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Rotation.y");
    }
    validationErrors = validatePrimitive(typeof obj.z === "number", `Invalid float: ${ obj.z }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Rotation.z");
    }
    validationErrors = validatePrimitive(typeof obj.w === "number", `Invalid float: ${ obj.w }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Rotation.w");
    }

    return validationErrors;
  },
  encode(obj: Rotation, buf: _Writer = new _Writer()) {
    writeFloat(buf, obj.x);
    writeFloat(buf, obj.y);
    writeFloat(buf, obj.z);
    writeFloat(buf, obj.w);
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Rotation>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.x !== _NO_DIFF);
    if (obj.x !== _NO_DIFF) {
      writeFloat(buf, obj.x);
    }
    tracker.push(obj.y !== _NO_DIFF);
    if (obj.y !== _NO_DIFF) {
      writeFloat(buf, obj.y);
    }
    tracker.push(obj.z !== _NO_DIFF);
    if (obj.z !== _NO_DIFF) {
      writeFloat(buf, obj.z);
    }
    tracker.push(obj.w !== _NO_DIFF);
    if (obj.w !== _NO_DIFF) {
      writeFloat(buf, obj.w);
    }
    return buf;
  },
  decode(buf: _Reader): Rotation {
    const sb = buf;
    return {
      x: parseFloat(sb),
      y: parseFloat(sb),
      z: parseFloat(sb),
      w: parseFloat(sb),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Rotation> {
    const sb = buf;
    return {
      x: tracker.next() ? parseFloat(sb) : _NO_DIFF,
      y: tracker.next() ? parseFloat(sb) : _NO_DIFF,
      z: tracker.next() ? parseFloat(sb) : _NO_DIFF,
      w: tracker.next() ? parseFloat(sb) : _NO_DIFF,
    };
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
    return ["Color", "Position", "Rotation", "EntityState"];
  },
  validate(obj: Component) {
    if (obj.type === "Color") {
      const validationErrors = validatePrimitive(typeof obj.val === "string", `Invalid string: ${ obj.val }`);
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
    else if (obj.type === "EntityState") {
      const validationErrors = validatePrimitive(obj.val in EntityState, `Invalid EntityState: ${ obj.val }`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: Component");
      }
      return validationErrors;
    }
    else {
      return [`Invalid Component union: ${obj}`];
    }
  },
  encode(obj: Component, buf: _Writer = new _Writer()) {
    if (obj.type === "Color") {
      writeUInt8(buf, 0);
      const x = obj.val;
      writeString(buf, x);
    }
    else if (obj.type === "Position") {
      writeUInt8(buf, 1);
      const x = obj.val;
      Position.encode(x, buf);
    }
    else if (obj.type === "Rotation") {
      writeUInt8(buf, 2);
      const x = obj.val;
      Rotation.encode(x, buf);
    }
    else if (obj.type === "EntityState") {
      writeUInt8(buf, 3);
      const x = obj.val;
      writeUInt8(buf, x);
    }
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Component>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    if (obj.type === "Color") {
      writeUInt8(buf, 0);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
        const x = obj.val;
        writeString(buf, x);
      }
    }
    else if (obj.type === "Position") {
      writeUInt8(buf, 1);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
        const x = obj.val;
        Position.encodeDiff(x, tracker, buf);
      }
    }
    else if (obj.type === "Rotation") {
      writeUInt8(buf, 2);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
        const x = obj.val;
        Rotation.encodeDiff(x, tracker, buf);
      }
    }
    else if (obj.type === "EntityState") {
      writeUInt8(buf, 3);
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
        const x = obj.val;
        writeUInt8(buf, x);
      }
    }
    return buf;
  },
  decode(sb: _Reader): Component {
    const type = parseUInt8(sb);
    if (type === 0) {
      return { type: "Color", val: parseString(sb) };
    }
    else if (type === 1) {
      return { type: "Position", val: Position.decode(sb) };
    }
    else if (type === 2) {
      return { type: "Rotation", val: Rotation.decode(sb) };
    }
    else if (type === 3) {
      return { type: "EntityState", val: parseUInt8(sb) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(sb: _Reader, tracker: _Tracker): _DeepPartial<Component> {
    const type = parseUInt8(sb);
    if (type === 0) {
      return { type: "Color", val: parseBoolean(sb) ? parseString(sb) : _NO_DIFF };
    }
    else if (type === 1) {
      return { type: "Position", val: parseBoolean(sb) ? Position.decodeDiff(sb, tracker) : _NO_DIFF };
    }
    else if (type === 2) {
      return { type: "Rotation", val: parseBoolean(sb) ? Rotation.decodeDiff(sb, tracker) : _NO_DIFF };
    }
    else if (type === 3) {
      return { type: "EntityState", val: parseBoolean(sb) ? parseUInt8(sb) : _NO_DIFF };
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

    validationErrors = validatePrimitive(Number.isInteger(obj.entityId), `Invalid int: ${ obj.entityId }`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Entity.entityId");
    }
    validationErrors = validateArray(obj.components, (x) => Component.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Entity.components");
    }

    return validationErrors;
  },
  encode(obj: Entity, buf: _Writer = new _Writer()) {
    writeInt(buf, obj.entityId);
    writeArray(buf, obj.components, (x) => Component.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Entity>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.entityId !== _NO_DIFF);
    if (obj.entityId !== _NO_DIFF) {
      writeInt(buf, obj.entityId);
    }
    tracker.push(obj.components !== _NO_DIFF);
    if (obj.components !== _NO_DIFF) {
      writeArrayDiff(buf, tracker, obj.components, (x) => Component.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _Reader): Entity {
    const sb = buf;
    return {
      entityId: parseInt(sb),
      components: parseArray(sb, () => Component.decode(sb)),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Entity> {
    const sb = buf;
    return {
      entityId: tracker.next() ? parseInt(sb) : _NO_DIFF,
      components: tracker.next() ? parseArrayDiff(sb, tracker, () => Component.decodeDiff(sb, tracker)) : _NO_DIFF,
    };
  },
};
export const Snapshot = {
  default(): Snapshot {
    return {
      entities: [],
      chatList: [],
    };
  },
  validate(obj: Snapshot) {
    if (typeof obj !== "object") {
      return [`Invalid Snapshot object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = validateArray(obj.entities, (x) => Entity.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Snapshot.entities");
    }
    validationErrors = validateArray(obj.chatList, (x) => ChatMessage.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Snapshot.chatList");
    }

    return validationErrors;
  },
  encode(obj: Snapshot, buf: _Writer = new _Writer()) {
    writeArray(buf, obj.entities, (x) => Entity.encode(x, buf));
    writeArray(buf, obj.chatList, (x) => ChatMessage.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: _DeepPartial<Snapshot>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    tracker.push(obj.entities !== _NO_DIFF);
    if (obj.entities !== _NO_DIFF) {
      writeArrayDiff(buf, tracker, obj.entities, (x) => Entity.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.chatList !== _NO_DIFF);
    if (obj.chatList !== _NO_DIFF) {
      writeArrayDiff(buf, tracker, obj.chatList, (x) => ChatMessage.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _Reader): Snapshot {
    const sb = buf;
    return {
      entities: parseArray(sb, () => Entity.decode(sb)),
      chatList: parseArray(sb, () => ChatMessage.decode(sb)),
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<Snapshot> {
    const sb = buf;
    return {
      entities: tracker.next() ? parseArrayDiff(sb, tracker, () => Entity.decodeDiff(sb, tracker)) : _NO_DIFF,
      chatList: tracker.next() ? parseArrayDiff(sb, tracker, () => ChatMessage.decodeDiff(sb, tracker)) : _NO_DIFF,
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
