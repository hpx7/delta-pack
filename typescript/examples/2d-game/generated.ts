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
      id: _.tryParseField(() => _.parseString(obj.id), "Player.id"),
      name: _.tryParseField(() => _.parseString(obj.name), "Player.name"),
      x: _.tryParseField(() => _.parseFloat(obj.x), "Player.x"),
      y: _.tryParseField(() => _.parseFloat(obj.y), "Player.y"),
      vx: _.tryParseField(() => _.parseFloat(obj.vx), "Player.vx"),
      vy: _.tryParseField(() => _.parseFloat(obj.vy), "Player.vy"),
      health: _.tryParseField(() => _.parseInt(obj.health), "Player.health"),
      score: _.tryParseField(() => _.parseInt(obj.score), "Player.score"),
      isAlive: _.tryParseField(() => _.parseBoolean(obj.isAlive), "Player.isAlive"),
    };
  },
  toJson(obj: Player): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result.id = obj.id;
    result.name = obj.name;
    result.x = obj.x;
    result.y = obj.y;
    result.vx = obj.vx;
    result.vy = obj.vy;
    result.health = obj.health;
    result.score = obj.score;
    result.isAlive = obj.isAlive;
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
    const tracker = new _.Tracker();
    Player._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Player, tracker: _.Tracker): void {
    tracker.pushString(obj.id);
    tracker.pushString(obj.name);
    tracker.pushFloatQuantized(obj.x, 0.1);
    tracker.pushFloatQuantized(obj.y, 0.1);
    tracker.pushFloatQuantized(obj.vx, 0.1);
    tracker.pushFloatQuantized(obj.vy, 0.1);
    tracker.pushInt(obj.health);
    tracker.pushInt(obj.score);
    tracker.pushBoolean(obj.isAlive);
  },
  encodeDiff(a: Player, b: Player): Uint8Array {
    const tracker = new _.Tracker();
    Player._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Player, b: Player, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Player.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: id
    if (dirty != null && !dirty.has("id")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushStringDiff(a.id, b.id);
    }
    // Field: name
    if (dirty != null && !dirty.has("name")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushStringDiff(a.name, b.name);
    }
    // Field: x
    if (dirty != null && !dirty.has("x")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushFloatQuantizedDiff(a.x, b.x, 0.1);
    }
    // Field: y
    if (dirty != null && !dirty.has("y")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushFloatQuantizedDiff(a.y, b.y, 0.1);
    }
    // Field: vx
    if (dirty != null && !dirty.has("vx")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushFloatQuantizedDiff(a.vx, b.vx, 0.1);
    }
    // Field: vy
    if (dirty != null && !dirty.has("vy")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushFloatQuantizedDiff(a.vy, b.vy, 0.1);
    }
    // Field: health
    if (dirty != null && !dirty.has("health")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushIntDiff(a.health, b.health);
    }
    // Field: score
    if (dirty != null && !dirty.has("score")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushIntDiff(a.score, b.score);
    }
    // Field: isAlive
    if (dirty != null && !dirty.has("isAlive")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushBooleanDiff(a.isAlive, b.isAlive);
    }
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Player {
    return {
      id: tracker.nextString(),
      name: tracker.nextString(),
      x: tracker.nextFloatQuantized(0.1),
      y: tracker.nextFloatQuantized(0.1),
      vx: tracker.nextFloatQuantized(0.1),
      vy: tracker.nextFloatQuantized(0.1),
      health: tracker.nextInt(),
      score: tracker.nextInt(),
      isAlive: tracker.nextBoolean(),
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
      id: tracker.nextStringDiff(obj.id),
      name: tracker.nextStringDiff(obj.name),
      x: tracker.nextFloatQuantizedDiff(obj.x, 0.1),
      y: tracker.nextFloatQuantizedDiff(obj.y, 0.1),
      vx: tracker.nextFloatQuantizedDiff(obj.vx, 0.1),
      vy: tracker.nextFloatQuantizedDiff(obj.vy, 0.1),
      health: tracker.nextIntDiff(obj.health),
      score: tracker.nextIntDiff(obj.score),
      isAlive: tracker.nextBooleanDiff(obj.isAlive),
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
      players: _.tryParseField(() => _.parseRecord(obj.players, (x) => _.parseString(x), (x) => Player.fromJson(x as Player)), "GameState.players"),
      tick: _.tryParseField(() => _.parseInt(obj.tick), "GameState.tick"),
      gameTime: _.tryParseField(() => _.parseFloat(obj.gameTime), "GameState.gameTime"),
    };
  },
  toJson(obj: GameState): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result.players = _.mapToObject(obj.players, (x) => Player.toJson(x));
    result.tick = obj.tick;
    result.gameTime = obj.gameTime;
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
    const tracker = new _.Tracker();
    GameState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: GameState, tracker: _.Tracker): void {
    tracker.pushRecord(obj.players, (x) => tracker.pushString(x), (x) => Player._encode(x, tracker));
    tracker.pushInt(obj.tick);
    tracker.pushFloat(obj.gameTime);
  },
  encodeDiff(a: GameState, b: GameState): Uint8Array {
    const tracker = new _.Tracker();
    GameState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: GameState, b: GameState, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !GameState.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: players
    if (dirty != null && !dirty.has("players")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushRecordDiff<string, Player>(
        a.players,
        b.players,
        (x, y) => Player.equals(x, y),
        (x) => tracker.pushString(x),
        (x) => Player._encode(x, tracker),
        (x, y) => Player._encodeDiff(x, y, tracker)
      );
    }
    // Field: tick
    if (dirty != null && !dirty.has("tick")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushIntDiff(a.tick, b.tick);
    }
    // Field: gameTime
    if (dirty != null && !dirty.has("gameTime")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushFloatDiff(a.gameTime, b.gameTime);
    }
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): GameState {
    return {
      players: tracker.nextRecord(() => tracker.nextString(), () => Player._decode(tracker)),
      tick: tracker.nextInt(),
      gameTime: tracker.nextFloat(),
    };
  },
  decodeDiff(obj: GameState, input: Uint8Array): GameState {
    const tracker = _.Tracker.parse(input);
    return GameState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: GameState, tracker: _.Tracker): GameState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      players: tracker.nextRecordDiff<string, Player>(
        obj.players,
        () => tracker.nextString(),
        () => Player._decode(tracker),
        (x) => Player._decodeDiff(x, tracker)
      ),
      tick: tracker.nextIntDiff(obj.tick),
      gameTime: tracker.nextFloatDiff(obj.gameTime),
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
      up: _.tryParseField(() => _.parseBoolean(obj.up), "ClientInput.up"),
      down: _.tryParseField(() => _.parseBoolean(obj.down), "ClientInput.down"),
      left: _.tryParseField(() => _.parseBoolean(obj.left), "ClientInput.left"),
      right: _.tryParseField(() => _.parseBoolean(obj.right), "ClientInput.right"),
      shoot: _.tryParseField(() => _.parseBoolean(obj.shoot), "ClientInput.shoot"),
    };
  },
  toJson(obj: ClientInput): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result.up = obj.up;
    result.down = obj.down;
    result.left = obj.left;
    result.right = obj.right;
    result.shoot = obj.shoot;
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
    const tracker = new _.Tracker();
    ClientInput._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ClientInput, tracker: _.Tracker): void {
    tracker.pushBoolean(obj.up);
    tracker.pushBoolean(obj.down);
    tracker.pushBoolean(obj.left);
    tracker.pushBoolean(obj.right);
    tracker.pushBoolean(obj.shoot);
  },
  encodeDiff(a: ClientInput, b: ClientInput): Uint8Array {
    const tracker = new _.Tracker();
    ClientInput._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ClientInput, b: ClientInput, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !ClientInput.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: up
    if (dirty != null && !dirty.has("up")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushBooleanDiff(a.up, b.up);
    }
    // Field: down
    if (dirty != null && !dirty.has("down")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushBooleanDiff(a.down, b.down);
    }
    // Field: left
    if (dirty != null && !dirty.has("left")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushBooleanDiff(a.left, b.left);
    }
    // Field: right
    if (dirty != null && !dirty.has("right")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushBooleanDiff(a.right, b.right);
    }
    // Field: shoot
    if (dirty != null && !dirty.has("shoot")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushBooleanDiff(a.shoot, b.shoot);
    }
  },
  decode(input: Uint8Array): ClientInput {
    return ClientInput._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ClientInput {
    return {
      up: tracker.nextBoolean(),
      down: tracker.nextBoolean(),
      left: tracker.nextBoolean(),
      right: tracker.nextBoolean(),
      shoot: tracker.nextBoolean(),
    };
  },
  decodeDiff(obj: ClientInput, input: Uint8Array): ClientInput {
    const tracker = _.Tracker.parse(input);
    return ClientInput._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ClientInput, tracker: _.Tracker): ClientInput {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      up: tracker.nextBooleanDiff(obj.up),
      down: tracker.nextBooleanDiff(obj.down),
      left: tracker.nextBooleanDiff(obj.left),
      right: tracker.nextBooleanDiff(obj.right),
      shoot: tracker.nextBooleanDiff(obj.shoot),
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
      name: _.tryParseField(() => _.parseString(obj.name), "JoinMessage.name"),
    };
  },
  toJson(obj: JoinMessage): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result.name = obj.name;
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
    const tracker = new _.Tracker();
    JoinMessage._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: JoinMessage, tracker: _.Tracker): void {
    tracker.pushString(obj.name);
  },
  encodeDiff(a: JoinMessage, b: JoinMessage): Uint8Array {
    const tracker = new _.Tracker();
    JoinMessage._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: JoinMessage, b: JoinMessage, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !JoinMessage.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: name
    if (dirty != null && !dirty.has("name")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushStringDiff(a.name, b.name);
    }
  },
  decode(input: Uint8Array): JoinMessage {
    return JoinMessage._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): JoinMessage {
    return {
      name: tracker.nextString(),
    };
  },
  decodeDiff(obj: JoinMessage, input: Uint8Array): JoinMessage {
    const tracker = _.Tracker.parse(input);
    return JoinMessage._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: JoinMessage, tracker: _.Tracker): JoinMessage {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      name: tracker.nextStringDiff(obj.name),
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
      input: _.tryParseField(() => ClientInput.fromJson(obj.input as ClientInput), "InputMessage.input"),
    };
  },
  toJson(obj: InputMessage): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result.input = ClientInput.toJson(obj.input);
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
    const tracker = new _.Tracker();
    InputMessage._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: InputMessage, tracker: _.Tracker): void {
    ClientInput._encode(obj.input, tracker);
  },
  encodeDiff(a: InputMessage, b: InputMessage): Uint8Array {
    const tracker = new _.Tracker();
    InputMessage._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: InputMessage, b: InputMessage, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !InputMessage.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: input
    if (dirty != null && !dirty.has("input")) {
      tracker.pushBoolean(false);
    } else {
      ClientInput._encodeDiff(a.input, b.input, tracker);
    }
  },
  decode(input: Uint8Array): InputMessage {
    return InputMessage._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): InputMessage {
    return {
      input: ClientInput._decode(tracker),
    };
  },
  decodeDiff(obj: InputMessage, input: Uint8Array): InputMessage {
    const tracker = _.Tracker.parse(input);
    return InputMessage._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: InputMessage, tracker: _.Tracker): InputMessage {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      input: ClientInput._decodeDiff(obj.input, tracker),
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
    if ("type" in obj && typeof obj.type === "string" && "val" in obj) {
      if (obj.type === "JoinMessage") {
        return {
          type: "JoinMessage",
          val: JoinMessage.fromJson(obj.val as JoinMessage),
        };
      }
      else if (obj.type === "InputMessage") {
        return {
          type: "InputMessage",
          val: InputMessage.fromJson(obj.val as InputMessage),
        };
      }
      else {
        throw new Error(`Invalid ClientMessage: ${obj}`);
      }
    }
    // check if it's protobuf format: { TypeName: ... }
    const entries = Object.entries(obj);
    if (entries.length === 1) {
      const [fieldName, fieldValue] = entries[0];
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
    const tracker = new _.Tracker();
    ClientMessage._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ClientMessage, tracker: _.Tracker): void {
    if (obj.type === "JoinMessage") {
      tracker.pushUInt(0);
      JoinMessage._encode(obj.val, tracker);
    }
    else if (obj.type === "InputMessage") {
      tracker.pushUInt(1);
      InputMessage._encode(obj.val, tracker);
    }
  },
  encodeDiff(a: ClientMessage, b: ClientMessage): Uint8Array {
    const tracker = new _.Tracker();
    ClientMessage._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ClientMessage, b: ClientMessage, tracker: _.Tracker): void {
    tracker.pushBoolean(a.type === b.type);
    if (b.type === "JoinMessage") {
      if (a.type === "JoinMessage") {
        JoinMessage._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(0);
        JoinMessage._encode(b.val, tracker);
      }
    }
    else if (b.type === "InputMessage") {
      if (a.type === "InputMessage") {
        InputMessage._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(1);
        InputMessage._encode(b.val, tracker);
      }
    }
  },
  decode(input: Uint8Array): ClientMessage {
    return ClientMessage._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ClientMessage {
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "JoinMessage", val: JoinMessage._decode(tracker) };
    }
    else if (type === 1) {
      return { type: "InputMessage", val: InputMessage._decode(tracker) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(obj: ClientMessage, input: Uint8Array): ClientMessage {
    const tracker = _.Tracker.parse(input);
    return ClientMessage._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ClientMessage, tracker: _.Tracker): ClientMessage {
    const isSameType = tracker.nextBoolean();
    if (isSameType) {
      if (obj.type === "JoinMessage") {
        return {
          type: "JoinMessage",
          val: JoinMessage._decodeDiff(obj.val, tracker),
        };
      }
      else if (obj.type === "InputMessage") {
        return {
          type: "InputMessage",
          val: InputMessage._decodeDiff(obj.val, tracker),
        };
      }
      throw new Error("Invalid union diff");
    } else {
      const type = tracker.nextUInt();
      if (type === 0) {
        return {
          type: "JoinMessage",
          val: JoinMessage._decode(tracker),
        };
      }
      else if (type === 1) {
        return {
          type: "InputMessage",
          val: InputMessage._decode(tracker),
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
      playerId: _.tryParseField(() => _.parseString(obj.playerId), "StateMessage.playerId"),
      state: _.tryParseField(() => GameState.fromJson(obj.state as GameState), "StateMessage.state"),
    };
  },
  toJson(obj: StateMessage): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result.playerId = obj.playerId;
    result.state = GameState.toJson(obj.state);
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
    const tracker = new _.Tracker();
    StateMessage._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: StateMessage, tracker: _.Tracker): void {
    tracker.pushString(obj.playerId);
    GameState._encode(obj.state, tracker);
  },
  encodeDiff(a: StateMessage, b: StateMessage): Uint8Array {
    const tracker = new _.Tracker();
    StateMessage._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: StateMessage, b: StateMessage, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !StateMessage.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: playerId
    if (dirty != null && !dirty.has("playerId")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushStringDiff(a.playerId, b.playerId);
    }
    // Field: state
    if (dirty != null && !dirty.has("state")) {
      tracker.pushBoolean(false);
    } else {
      GameState._encodeDiff(a.state, b.state, tracker);
    }
  },
  decode(input: Uint8Array): StateMessage {
    return StateMessage._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): StateMessage {
    return {
      playerId: tracker.nextString(),
      state: GameState._decode(tracker),
    };
  },
  decodeDiff(obj: StateMessage, input: Uint8Array): StateMessage {
    const tracker = _.Tracker.parse(input);
    return StateMessage._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: StateMessage, tracker: _.Tracker): StateMessage {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      playerId: tracker.nextStringDiff(obj.playerId),
      state: GameState._decodeDiff(obj.state, tracker),
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
    if ("type" in obj && typeof obj.type === "string" && "val" in obj) {
      if (obj.type === "StateMessage") {
        return {
          type: "StateMessage",
          val: StateMessage.fromJson(obj.val as StateMessage),
        };
      }
      else {
        throw new Error(`Invalid ServerMessage: ${obj}`);
      }
    }
    // check if it's protobuf format: { TypeName: ... }
    const entries = Object.entries(obj);
    if (entries.length === 1) {
      const [fieldName, fieldValue] = entries[0];
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
    const tracker = new _.Tracker();
    ServerMessage._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ServerMessage, tracker: _.Tracker): void {
    if (obj.type === "StateMessage") {
      tracker.pushUInt(0);
      StateMessage._encode(obj.val, tracker);
    }
  },
  encodeDiff(a: ServerMessage, b: ServerMessage): Uint8Array {
    const tracker = new _.Tracker();
    ServerMessage._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ServerMessage, b: ServerMessage, tracker: _.Tracker): void {
    tracker.pushBoolean(a.type === b.type);
    if (b.type === "StateMessage") {
      if (a.type === "StateMessage") {
        StateMessage._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(0);
        StateMessage._encode(b.val, tracker);
      }
    }
  },
  decode(input: Uint8Array): ServerMessage {
    return ServerMessage._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ServerMessage {
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "StateMessage", val: StateMessage._decode(tracker) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(obj: ServerMessage, input: Uint8Array): ServerMessage {
    const tracker = _.Tracker.parse(input);
    return ServerMessage._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ServerMessage, tracker: _.Tracker): ServerMessage {
    const isSameType = tracker.nextBoolean();
    if (isSameType) {
      if (obj.type === "StateMessage") {
        return {
          type: "StateMessage",
          val: StateMessage._decodeDiff(obj.val, tracker),
        };
      }
      throw new Error("Invalid union diff");
    } else {
      const type = tracker.nextUInt();
      if (type === 0) {
        return {
          type: "StateMessage",
          val: StateMessage._decode(tracker),
        };
      }
      throw new Error("Invalid union diff");
    }
  }
}
