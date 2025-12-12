import * as _ from "@hpx7/delta-pack/helpers";

export type Player = {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  score: number;
  isAlive: boolean;
} & { _dirty?: Set<keyof Player> };
export type GameState = {
  players: Map<string, Player> & { _dirty?: Set<string> };
  tick: number;
  gameTime: number;
} & { _dirty?: Set<keyof GameState> };
export type ClientInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
} & { _dirty?: Set<keyof ClientInput> };
export type JoinMessage = {
  name: string;
} & { _dirty?: Set<keyof JoinMessage> };
export type InputMessage = {
  input: ClientInput;
} & { _dirty?: Set<keyof InputMessage> };
export type ClientMessage = { type: "JoinMessage"; val: JoinMessage } | { type: "InputMessage"; val: InputMessage };
export type StateMessage = {
  playerId: string;
  state: GameState;
} & { _dirty?: Set<keyof StateMessage> };
export type ServerMessage = { type: "StateMessage"; val: StateMessage };


export const Player = {
  default(): Player {
    return {
      id: "",
      name: "",
      x: 0.0,
      y: 0.0,
      vx: 0.0,
      vy: 0.0,
      health: 0,
      score: 0,
      isAlive: false,
    };
  },
  fromJson(obj: Record<string, unknown>): Player {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Player: ${obj}`);
    }
    return {
      id: _.tryParseField(() => _.parseString(obj["id"]), "Player.id"),
      name: _.tryParseField(() => _.parseString(obj["name"]), "Player.name"),
      x: _.tryParseField(() => _.parseFloat(obj["x"]), "Player.x"),
      y: _.tryParseField(() => _.parseFloat(obj["y"]), "Player.y"),
      vx: _.tryParseField(() => _.parseFloat(obj["vx"]), "Player.vx"),
      vy: _.tryParseField(() => _.parseFloat(obj["vy"]), "Player.vy"),
      health: _.tryParseField(() => _.parseInt(obj["health"]), "Player.health"),
      score: _.tryParseField(() => _.parseInt(obj["score"]), "Player.score"),
      isAlive: _.tryParseField(() => _.parseBoolean(obj["isAlive"]), "Player.isAlive"),
    };
  },
  toJson(obj: Player): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["id"] = obj.id;
    result["name"] = obj.name;
    result["x"] = obj.x;
    result["y"] = obj.y;
    result["vx"] = obj.vx;
    result["vy"] = obj.vy;
    result["health"] = obj.health;
    result["score"] = obj.score;
    result["isAlive"] = obj.isAlive;
    return result;
  },
  clone(obj: Player): Player {
    return {
      id: obj.id,
      name: obj.name,
      x: obj.x,
      y: obj.y,
      vx: obj.vx,
      vy: obj.vy,
      health: obj.health,
      score: obj.score,
      isAlive: obj.isAlive,
    };
  },
  equals(a: Player, b: Player): boolean {
    return (
      a.id === b.id &&
      a.name === b.name &&
      _.equalsFloatQuantized(a.x, b.x, 0.1) &&
      _.equalsFloatQuantized(a.y, b.y, 0.1) &&
      _.equalsFloatQuantized(a.vx, b.vx, 0.1) &&
      _.equalsFloatQuantized(a.vy, b.vy, 0.1) &&
      a.health === b.health &&
      a.score === b.score &&
      a.isAlive === b.isAlive
    );
  },
  encode(obj: Player): Uint8Array {
    const encoder = new _.Encoder();
    Player._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Player, encoder: _.Encoder): void {
    encoder.pushString(obj.id);
    encoder.pushString(obj.name);
    encoder.pushFloatQuantized(obj.x, 0.1);
    encoder.pushFloatQuantized(obj.y, 0.1);
    encoder.pushFloatQuantized(obj.vx, 0.1);
    encoder.pushFloatQuantized(obj.vy, 0.1);
    encoder.pushInt(obj.health);
    encoder.pushInt(obj.score);
    encoder.pushBoolean(obj.isAlive);
  },
  encodeDiff(a: Player, b: Player): Uint8Array {
    const encoder = new _.Encoder();
    Player._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Player, b: Player, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Player.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: id
    if (dirty != null && !dirty.has("id")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushStringDiff(a.id, b.id);
    }
    // Field: name
    if (dirty != null && !dirty.has("name")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushStringDiff(a.name, b.name);
    }
    // Field: x
    if (dirty != null && !dirty.has("x")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushFloatQuantizedDiff(a.x, b.x, 0.1);
    }
    // Field: y
    if (dirty != null && !dirty.has("y")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushFloatQuantizedDiff(a.y, b.y, 0.1);
    }
    // Field: vx
    if (dirty != null && !dirty.has("vx")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushFloatQuantizedDiff(a.vx, b.vx, 0.1);
    }
    // Field: vy
    if (dirty != null && !dirty.has("vy")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushFloatQuantizedDiff(a.vy, b.vy, 0.1);
    }
    // Field: health
    if (dirty != null && !dirty.has("health")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushIntDiff(a.health, b.health);
    }
    // Field: score
    if (dirty != null && !dirty.has("score")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushIntDiff(a.score, b.score);
    }
    // Field: isAlive
    if (dirty != null && !dirty.has("isAlive")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushBooleanDiff(a.isAlive, b.isAlive);
    }
  },
  decode(input: Uint8Array): Player {
    return Player._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): Player {
    return {
      id: decoder.nextString(),
      name: decoder.nextString(),
      x: decoder.nextFloatQuantized(0.1),
      y: decoder.nextFloatQuantized(0.1),
      vx: decoder.nextFloatQuantized(0.1),
      vy: decoder.nextFloatQuantized(0.1),
      health: decoder.nextInt(),
      score: decoder.nextInt(),
      isAlive: decoder.nextBoolean(),
    };
  },
  decodeDiff(obj: Player, input: Uint8Array): Player {
    const decoder = new _.Decoder(input);
    return Player._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: Player, decoder: _.Decoder): Player {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      id: decoder.nextStringDiff(obj.id),
      name: decoder.nextStringDiff(obj.name),
      x: decoder.nextFloatQuantizedDiff(obj.x, 0.1),
      y: decoder.nextFloatQuantizedDiff(obj.y, 0.1),
      vx: decoder.nextFloatQuantizedDiff(obj.vx, 0.1),
      vy: decoder.nextFloatQuantizedDiff(obj.vy, 0.1),
      health: decoder.nextIntDiff(obj.health),
      score: decoder.nextIntDiff(obj.score),
      isAlive: decoder.nextBooleanDiff(obj.isAlive),
    };
  },
};

export const GameState = {
  default(): GameState {
    return {
      players: new Map(),
      tick: 0,
      gameTime: 0.0,
    };
  },
  fromJson(obj: Record<string, unknown>): GameState {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid GameState: ${obj}`);
    }
    return {
      players: _.tryParseField(() => _.parseRecord(obj["players"], (x) => _.parseString(x), (x) => Player.fromJson(x as Player)), "GameState.players"),
      tick: _.tryParseField(() => _.parseInt(obj["tick"]), "GameState.tick"),
      gameTime: _.tryParseField(() => _.parseFloat(obj["gameTime"]), "GameState.gameTime"),
    };
  },
  toJson(obj: GameState): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["players"] = _.mapToObject(obj.players, (x) => Player.toJson(x));
    result["tick"] = obj.tick;
    result["gameTime"] = obj.gameTime;
    return result;
  },
  clone(obj: GameState): GameState {
    return {
      players: new Map([...obj.players].map(([k, v]) => [k, Player.clone(v)])),
      tick: obj.tick,
      gameTime: obj.gameTime,
    };
  },
  equals(a: GameState, b: GameState): boolean {
    return (
      _.equalsRecord(a.players, b.players, (x, y) => x === y, (x, y) => Player.equals(x, y)) &&
      a.tick === b.tick &&
      _.equalsFloat(a.gameTime, b.gameTime)
    );
  },
  encode(obj: GameState): Uint8Array {
    const encoder = new _.Encoder();
    GameState._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: GameState, encoder: _.Encoder): void {
    encoder.pushRecord(obj.players, (x) => encoder.pushString(x), (x) => Player._encode(x, encoder));
    encoder.pushInt(obj.tick);
    encoder.pushFloat(obj.gameTime);
  },
  encodeDiff(a: GameState, b: GameState): Uint8Array {
    const encoder = new _.Encoder();
    GameState._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: GameState, b: GameState, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !GameState.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: players
    if (dirty != null && !dirty.has("players")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushRecordDiff<string, Player>(
        a.players,
        b.players,
        (x, y) => Player.equals(x, y),
        (x) => encoder.pushString(x),
        (x) => Player._encode(x, encoder),
        (x, y) => Player._encodeDiff(x, y, encoder)
      );
    }
    // Field: tick
    if (dirty != null && !dirty.has("tick")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushIntDiff(a.tick, b.tick);
    }
    // Field: gameTime
    if (dirty != null && !dirty.has("gameTime")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushFloatDiff(a.gameTime, b.gameTime);
    }
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): GameState {
    return {
      players: decoder.nextRecord(() => decoder.nextString(), () => Player._decode(decoder)),
      tick: decoder.nextInt(),
      gameTime: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: GameState, input: Uint8Array): GameState {
    const decoder = new _.Decoder(input);
    return GameState._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: GameState, decoder: _.Decoder): GameState {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      players: decoder.nextRecordDiff<string, Player>(
        obj.players,
        () => decoder.nextString(),
        () => Player._decode(decoder),
        (x) => Player._decodeDiff(x, decoder)
      ),
      tick: decoder.nextIntDiff(obj.tick),
      gameTime: decoder.nextFloatDiff(obj.gameTime),
    };
  },
};

export const ClientInput = {
  default(): ClientInput {
    return {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
    };
  },
  fromJson(obj: Record<string, unknown>): ClientInput {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid ClientInput: ${obj}`);
    }
    return {
      up: _.tryParseField(() => _.parseBoolean(obj["up"]), "ClientInput.up"),
      down: _.tryParseField(() => _.parseBoolean(obj["down"]), "ClientInput.down"),
      left: _.tryParseField(() => _.parseBoolean(obj["left"]), "ClientInput.left"),
      right: _.tryParseField(() => _.parseBoolean(obj["right"]), "ClientInput.right"),
      shoot: _.tryParseField(() => _.parseBoolean(obj["shoot"]), "ClientInput.shoot"),
    };
  },
  toJson(obj: ClientInput): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["up"] = obj.up;
    result["down"] = obj.down;
    result["left"] = obj.left;
    result["right"] = obj.right;
    result["shoot"] = obj.shoot;
    return result;
  },
  clone(obj: ClientInput): ClientInput {
    return {
      up: obj.up,
      down: obj.down,
      left: obj.left,
      right: obj.right,
      shoot: obj.shoot,
    };
  },
  equals(a: ClientInput, b: ClientInput): boolean {
    return (
      a.up === b.up &&
      a.down === b.down &&
      a.left === b.left &&
      a.right === b.right &&
      a.shoot === b.shoot
    );
  },
  encode(obj: ClientInput): Uint8Array {
    const encoder = new _.Encoder();
    ClientInput._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: ClientInput, encoder: _.Encoder): void {
    encoder.pushBoolean(obj.up);
    encoder.pushBoolean(obj.down);
    encoder.pushBoolean(obj.left);
    encoder.pushBoolean(obj.right);
    encoder.pushBoolean(obj.shoot);
  },
  encodeDiff(a: ClientInput, b: ClientInput): Uint8Array {
    const encoder = new _.Encoder();
    ClientInput._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: ClientInput, b: ClientInput, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !ClientInput.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: up
    if (dirty != null && !dirty.has("up")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushBooleanDiff(a.up, b.up);
    }
    // Field: down
    if (dirty != null && !dirty.has("down")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushBooleanDiff(a.down, b.down);
    }
    // Field: left
    if (dirty != null && !dirty.has("left")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushBooleanDiff(a.left, b.left);
    }
    // Field: right
    if (dirty != null && !dirty.has("right")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushBooleanDiff(a.right, b.right);
    }
    // Field: shoot
    if (dirty != null && !dirty.has("shoot")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushBooleanDiff(a.shoot, b.shoot);
    }
  },
  decode(input: Uint8Array): ClientInput {
    return ClientInput._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): ClientInput {
    return {
      up: decoder.nextBoolean(),
      down: decoder.nextBoolean(),
      left: decoder.nextBoolean(),
      right: decoder.nextBoolean(),
      shoot: decoder.nextBoolean(),
    };
  },
  decodeDiff(obj: ClientInput, input: Uint8Array): ClientInput {
    const decoder = new _.Decoder(input);
    return ClientInput._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: ClientInput, decoder: _.Decoder): ClientInput {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      up: decoder.nextBooleanDiff(obj.up),
      down: decoder.nextBooleanDiff(obj.down),
      left: decoder.nextBooleanDiff(obj.left),
      right: decoder.nextBooleanDiff(obj.right),
      shoot: decoder.nextBooleanDiff(obj.shoot),
    };
  },
};

export const JoinMessage = {
  default(): JoinMessage {
    return {
      name: "",
    };
  },
  fromJson(obj: Record<string, unknown>): JoinMessage {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid JoinMessage: ${obj}`);
    }
    return {
      name: _.tryParseField(() => _.parseString(obj["name"]), "JoinMessage.name"),
    };
  },
  toJson(obj: JoinMessage): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["name"] = obj.name;
    return result;
  },
  clone(obj: JoinMessage): JoinMessage {
    return {
      name: obj.name,
    };
  },
  equals(a: JoinMessage, b: JoinMessage): boolean {
    return (
      a.name === b.name
    );
  },
  encode(obj: JoinMessage): Uint8Array {
    const encoder = new _.Encoder();
    JoinMessage._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: JoinMessage, encoder: _.Encoder): void {
    encoder.pushString(obj.name);
  },
  encodeDiff(a: JoinMessage, b: JoinMessage): Uint8Array {
    const encoder = new _.Encoder();
    JoinMessage._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: JoinMessage, b: JoinMessage, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !JoinMessage.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: name
    if (dirty != null && !dirty.has("name")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushStringDiff(a.name, b.name);
    }
  },
  decode(input: Uint8Array): JoinMessage {
    return JoinMessage._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): JoinMessage {
    return {
      name: decoder.nextString(),
    };
  },
  decodeDiff(obj: JoinMessage, input: Uint8Array): JoinMessage {
    const decoder = new _.Decoder(input);
    return JoinMessage._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: JoinMessage, decoder: _.Decoder): JoinMessage {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      name: decoder.nextStringDiff(obj.name),
    };
  },
};

export const InputMessage = {
  default(): InputMessage {
    return {
      input: ClientInput.default(),
    };
  },
  fromJson(obj: Record<string, unknown>): InputMessage {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid InputMessage: ${obj}`);
    }
    return {
      input: _.tryParseField(() => ClientInput.fromJson(obj["input"] as ClientInput), "InputMessage.input"),
    };
  },
  toJson(obj: InputMessage): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["input"] = ClientInput.toJson(obj.input);
    return result;
  },
  clone(obj: InputMessage): InputMessage {
    return {
      input: ClientInput.clone(obj.input),
    };
  },
  equals(a: InputMessage, b: InputMessage): boolean {
    return (
      ClientInput.equals(a.input, b.input)
    );
  },
  encode(obj: InputMessage): Uint8Array {
    const encoder = new _.Encoder();
    InputMessage._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: InputMessage, encoder: _.Encoder): void {
    ClientInput._encode(obj.input, encoder);
  },
  encodeDiff(a: InputMessage, b: InputMessage): Uint8Array {
    const encoder = new _.Encoder();
    InputMessage._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: InputMessage, b: InputMessage, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !InputMessage.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: input
    if (dirty != null && !dirty.has("input")) {
      encoder.pushBoolean(false);
    } else {
      ClientInput._encodeDiff(a.input, b.input, encoder);
    }
  },
  decode(input: Uint8Array): InputMessage {
    return InputMessage._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): InputMessage {
    return {
      input: ClientInput._decode(decoder),
    };
  },
  decodeDiff(obj: InputMessage, input: Uint8Array): InputMessage {
    const decoder = new _.Decoder(input);
    return InputMessage._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: InputMessage, decoder: _.Decoder): InputMessage {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      input: ClientInput._decodeDiff(obj.input, decoder),
    };
  },
};

export const ClientMessage = {
  default(): ClientMessage {
    return {
      type: "JoinMessage",
      val: JoinMessage.default(),
    };
  },
  values() {
    return ["JoinMessage", "InputMessage"];
  },
  fromJson(obj: Record<string, unknown>): ClientMessage {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid ClientMessage: ${obj}`);
    }
    // check if it's delta-pack format: { type: "TypeName", val: ... }
    if ("type" in obj && typeof obj["type"] === "string" && "val" in obj) {
      if (obj["type"] === "JoinMessage") {
        return {
          type: "JoinMessage",
          val: JoinMessage.fromJson(obj["val"] as JoinMessage),
        };
      }
      else if (obj["type"] === "InputMessage") {
        return {
          type: "InputMessage",
          val: InputMessage.fromJson(obj["val"] as InputMessage),
        };
      }
      else {
        throw new Error(`Invalid ClientMessage: ${obj}`);
      }
    }
    // check if it's protobuf format: { TypeName: ... }
    const entries = Object.entries(obj);
    if (entries.length === 1) {
      const [fieldName, fieldValue] = entries[0]!;
      if (fieldName === "JoinMessage") {
        return {
          type: "JoinMessage",
          val: JoinMessage.fromJson(fieldValue as JoinMessage),
        };
      }
      else if (fieldName === "InputMessage") {
        return {
          type: "InputMessage",
          val: InputMessage.fromJson(fieldValue as InputMessage),
        };
      }
    }
    throw new Error(`Invalid ClientMessage: ${obj}`);
  },
  toJson(obj: ClientMessage): Record<string, unknown> {
    if (obj.type === "JoinMessage") {
      return {
        JoinMessage: JoinMessage.toJson(obj.val),
      };
    }
    else if (obj.type === "InputMessage") {
      return {
        InputMessage: InputMessage.toJson(obj.val),
      };
    }
    throw new Error(`Invalid ClientMessage: ${obj}`);
  },
  clone(obj: ClientMessage): ClientMessage {
    if (obj.type === "JoinMessage") {
      return {
        type: "JoinMessage",
        val: JoinMessage.clone(obj.val),
      };
    }
    else if (obj.type === "InputMessage") {
      return {
        type: "InputMessage",
        val: InputMessage.clone(obj.val),
      };
    }
    throw new Error(`Invalid ClientMessage: ${obj}`);
  },
  equals(a: ClientMessage, b: ClientMessage): boolean {
    if (a.type === "JoinMessage" && b.type === "JoinMessage") {
      return JoinMessage.equals(a.val, b.val);
    }
    else if (a.type === "InputMessage" && b.type === "InputMessage") {
      return InputMessage.equals(a.val, b.val);
    }
    return false;
  },
  encode(obj: ClientMessage): Uint8Array {
    const encoder = new _.Encoder();
    ClientMessage._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: ClientMessage, encoder: _.Encoder): void {
    if (obj.type === "JoinMessage") {
      encoder.pushUInt(0);
      JoinMessage._encode(obj.val, encoder);
    }
    else if (obj.type === "InputMessage") {
      encoder.pushUInt(1);
      InputMessage._encode(obj.val, encoder);
    }
  },
  encodeDiff(a: ClientMessage, b: ClientMessage): Uint8Array {
    const encoder = new _.Encoder();
    ClientMessage._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: ClientMessage, b: ClientMessage, encoder: _.Encoder): void {
    encoder.pushBoolean(a.type === b.type);
    if (b.type === "JoinMessage") {
      if (a.type === "JoinMessage") {
        JoinMessage._encodeDiff(a.val, b.val, encoder);
      } else {
        encoder.pushUInt(0);
        JoinMessage._encode(b.val, encoder);
      }
    }
    else if (b.type === "InputMessage") {
      if (a.type === "InputMessage") {
        InputMessage._encodeDiff(a.val, b.val, encoder);
      } else {
        encoder.pushUInt(1);
        InputMessage._encode(b.val, encoder);
      }
    }
  },
  decode(input: Uint8Array): ClientMessage {
    return ClientMessage._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): ClientMessage {
    const type = decoder.nextUInt();
    if (type === 0) {
      return { type: "JoinMessage", val: JoinMessage._decode(decoder) };
    }
    else if (type === 1) {
      return { type: "InputMessage", val: InputMessage._decode(decoder) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(obj: ClientMessage, input: Uint8Array): ClientMessage {
    const decoder = new _.Decoder(input);
    return ClientMessage._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: ClientMessage, decoder: _.Decoder): ClientMessage {
    const isSameType = decoder.nextBoolean();
    if (isSameType) {
      if (obj.type === "JoinMessage") {
        return {
          type: "JoinMessage",
          val: JoinMessage._decodeDiff(obj.val, decoder),
        };
      }
      else if (obj.type === "InputMessage") {
        return {
          type: "InputMessage",
          val: InputMessage._decodeDiff(obj.val, decoder),
        };
      }
      throw new Error("Invalid union diff");
    } else {
      const type = decoder.nextUInt();
      if (type === 0) {
        return {
          type: "JoinMessage",
          val: JoinMessage._decode(decoder),
        };
      }
      else if (type === 1) {
        return {
          type: "InputMessage",
          val: InputMessage._decode(decoder),
        };
      }
      throw new Error("Invalid union diff");
    }
  }
}

export const StateMessage = {
  default(): StateMessage {
    return {
      playerId: "",
      state: GameState.default(),
    };
  },
  fromJson(obj: Record<string, unknown>): StateMessage {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid StateMessage: ${obj}`);
    }
    return {
      playerId: _.tryParseField(() => _.parseString(obj["playerId"]), "StateMessage.playerId"),
      state: _.tryParseField(() => GameState.fromJson(obj["state"] as GameState), "StateMessage.state"),
    };
  },
  toJson(obj: StateMessage): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["playerId"] = obj.playerId;
    result["state"] = GameState.toJson(obj.state);
    return result;
  },
  clone(obj: StateMessage): StateMessage {
    return {
      playerId: obj.playerId,
      state: GameState.clone(obj.state),
    };
  },
  equals(a: StateMessage, b: StateMessage): boolean {
    return (
      a.playerId === b.playerId &&
      GameState.equals(a.state, b.state)
    );
  },
  encode(obj: StateMessage): Uint8Array {
    const encoder = new _.Encoder();
    StateMessage._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: StateMessage, encoder: _.Encoder): void {
    encoder.pushString(obj.playerId);
    GameState._encode(obj.state, encoder);
  },
  encodeDiff(a: StateMessage, b: StateMessage): Uint8Array {
    const encoder = new _.Encoder();
    StateMessage._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: StateMessage, b: StateMessage, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !StateMessage.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: playerId
    if (dirty != null && !dirty.has("playerId")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushStringDiff(a.playerId, b.playerId);
    }
    // Field: state
    if (dirty != null && !dirty.has("state")) {
      encoder.pushBoolean(false);
    } else {
      GameState._encodeDiff(a.state, b.state, encoder);
    }
  },
  decode(input: Uint8Array): StateMessage {
    return StateMessage._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): StateMessage {
    return {
      playerId: decoder.nextString(),
      state: GameState._decode(decoder),
    };
  },
  decodeDiff(obj: StateMessage, input: Uint8Array): StateMessage {
    const decoder = new _.Decoder(input);
    return StateMessage._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: StateMessage, decoder: _.Decoder): StateMessage {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      playerId: decoder.nextStringDiff(obj.playerId),
      state: GameState._decodeDiff(obj.state, decoder),
    };
  },
};

export const ServerMessage = {
  default(): ServerMessage {
    return {
      type: "StateMessage",
      val: StateMessage.default(),
    };
  },
  values() {
    return ["StateMessage"];
  },
  fromJson(obj: Record<string, unknown>): ServerMessage {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid ServerMessage: ${obj}`);
    }
    // check if it's delta-pack format: { type: "TypeName", val: ... }
    if ("type" in obj && typeof obj["type"] === "string" && "val" in obj) {
      if (obj["type"] === "StateMessage") {
        return {
          type: "StateMessage",
          val: StateMessage.fromJson(obj["val"] as StateMessage),
        };
      }
      else {
        throw new Error(`Invalid ServerMessage: ${obj}`);
      }
    }
    // check if it's protobuf format: { TypeName: ... }
    const entries = Object.entries(obj);
    if (entries.length === 1) {
      const [fieldName, fieldValue] = entries[0]!;
      if (fieldName === "StateMessage") {
        return {
          type: "StateMessage",
          val: StateMessage.fromJson(fieldValue as StateMessage),
        };
      }
    }
    throw new Error(`Invalid ServerMessage: ${obj}`);
  },
  toJson(obj: ServerMessage): Record<string, unknown> {
    if (obj.type === "StateMessage") {
      return {
        StateMessage: StateMessage.toJson(obj.val),
      };
    }
    throw new Error(`Invalid ServerMessage: ${obj}`);
  },
  clone(obj: ServerMessage): ServerMessage {
    if (obj.type === "StateMessage") {
      return {
        type: "StateMessage",
        val: StateMessage.clone(obj.val),
      };
    }
    throw new Error(`Invalid ServerMessage: ${obj}`);
  },
  equals(a: ServerMessage, b: ServerMessage): boolean {
    if (a.type === "StateMessage" && b.type === "StateMessage") {
      return StateMessage.equals(a.val, b.val);
    }
    return false;
  },
  encode(obj: ServerMessage): Uint8Array {
    const encoder = new _.Encoder();
    ServerMessage._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: ServerMessage, encoder: _.Encoder): void {
    if (obj.type === "StateMessage") {
      encoder.pushUInt(0);
      StateMessage._encode(obj.val, encoder);
    }
  },
  encodeDiff(a: ServerMessage, b: ServerMessage): Uint8Array {
    const encoder = new _.Encoder();
    ServerMessage._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: ServerMessage, b: ServerMessage, encoder: _.Encoder): void {
    encoder.pushBoolean(a.type === b.type);
    if (b.type === "StateMessage") {
      if (a.type === "StateMessage") {
        StateMessage._encodeDiff(a.val, b.val, encoder);
      } else {
        encoder.pushUInt(0);
        StateMessage._encode(b.val, encoder);
      }
    }
  },
  decode(input: Uint8Array): ServerMessage {
    return ServerMessage._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): ServerMessage {
    const type = decoder.nextUInt();
    if (type === 0) {
      return { type: "StateMessage", val: StateMessage._decode(decoder) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(obj: ServerMessage, input: Uint8Array): ServerMessage {
    const decoder = new _.Decoder(input);
    return ServerMessage._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: ServerMessage, decoder: _.Decoder): ServerMessage {
    const isSameType = decoder.nextBoolean();
    if (isSameType) {
      if (obj.type === "StateMessage") {
        return {
          type: "StateMessage",
          val: StateMessage._decodeDiff(obj.val, decoder),
        };
      }
      throw new Error("Invalid union diff");
    } else {
      const type = decoder.nextUInt();
      if (type === 0) {
        return {
          type: "StateMessage",
          val: StateMessage._decode(decoder),
        };
      }
      throw new Error("Invalid union diff");
    }
  }
}
