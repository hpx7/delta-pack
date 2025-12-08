import * as _ from "@hpx7/delta-pack/helpers";


export type Color = "RED" | "BLUE" | "GREEN" | "YELLOW";
    
export type PlayerId = string;
export type Player = {
  id: PlayerId;
  name: string;
  score: number;
  isActive: boolean;
  partner?: Player | undefined;
} & { _dirty?: Set<keyof Player> };
export type Position = {
  x: number;
  y: number;
} & { _dirty?: Set<keyof Position> };
export type Velocity = {
  vx: number;
  vy: number;
} & { _dirty?: Set<keyof Velocity> };
export type MoveAction = {
  x: number;
  y: number;
} & { _dirty?: Set<keyof MoveAction> };
export type AttackAction = {
  targetId: string;
  damage: number;
} & { _dirty?: Set<keyof AttackAction> };
export type UseItemAction = {
  itemId: string;
} & { _dirty?: Set<keyof UseItemAction> };
export type GameAction = { type: "MoveAction"; val: MoveAction } | { type: "AttackAction"; val: AttackAction } | { type: "UseItemAction"; val: UseItemAction };
export type GameState = {
  players: Player[] & { _dirty?: Set<number> };
  currentPlayer?: string | undefined;
  round: number;
  metadata: Map<string, string> & { _dirty?: Set<string> };
  winningColor?: Color | undefined;
  lastAction?: GameAction | undefined;
} & { _dirty?: Set<keyof GameState> };
export type Inventory = {
  items?: (Map<string, number> & { _dirty?: Set<string> })[] & { _dirty?: Set<number> } | undefined;
} & { _dirty?: Set<keyof Inventory> };
export type PlayerRegistry = {
  players: Map<string, Player> & { _dirty?: Set<string> };
} & { _dirty?: Set<keyof PlayerRegistry> };


const Color = {
  0: "RED",
  1: "BLUE",
  2: "GREEN",
  3: "YELLOW",
  RED: 0,
  BLUE: 1,
  GREEN: 2,
  YELLOW: 3,
};


export const Player = {
  default(): Player {
    return {
      id: "",
      name: "",
      score: 0,
      isActive: false,
      partner: undefined,
    };
  },
  fromJson(obj: Record<string, unknown>): Player {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Player: ${obj}`);
    }
    return {
      id: _.tryParseField(() => _.parseString(obj["id"]), "Player.id"),
      name: _.tryParseField(() => _.parseString(obj["name"]), "Player.name"),
      score: _.tryParseField(() => _.parseInt(obj["score"]), "Player.score"),
      isActive: _.tryParseField(() => _.parseBoolean(obj["isActive"]), "Player.isActive"),
      partner: _.tryParseField(() => _.parseOptional(obj["partner"], (x) => Player.fromJson(x as Player)), "Player.partner"),
    };
  },
  toJson(obj: Player): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["id"] = obj.id;
    result["name"] = obj.name;
    result["score"] = obj.score;
    result["isActive"] = obj.isActive;
    if (obj.partner != null) {
      result["partner"] = Player.toJson(obj.partner);
    }
    return result;
  },
  clone(obj: Player): Player {
    return {
      id: obj.id,
      name: obj.name,
      score: obj.score,
      isActive: obj.isActive,
      partner: obj.partner != null ? Player.clone(obj.partner) : undefined,
    };
  },
  equals(a: Player, b: Player): boolean {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.score === b.score &&
      a.isActive === b.isActive &&
      _.equalsOptional(a.partner, b.partner, (x, y) => Player.equals(x, y))
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
    tracker.pushInt(obj.score);
    tracker.pushBoolean(obj.isActive);
    tracker.pushOptional(obj.partner, (x) => Player._encode(x, tracker));
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
    // Field: score
    if (dirty != null && !dirty.has("score")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushIntDiff(a.score, b.score);
    }
    // Field: isActive
    if (dirty != null && !dirty.has("isActive")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushBooleanDiff(a.isActive, b.isActive);
    }
    // Field: partner
    if (dirty != null && !dirty.has("partner")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushOptionalDiff<Player>(
        a.partner,
        b.partner,
        (x) => Player._encode(x, tracker),
        (x, y) => Player._encodeDiff(x, y, tracker)
      );
    }
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Player {
    return {
      id: tracker.nextString(),
      name: tracker.nextString(),
      score: tracker.nextInt(),
      isActive: tracker.nextBoolean(),
      partner: tracker.nextOptional(() => Player._decode(tracker)),
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
      score: tracker.nextIntDiff(obj.score),
      isActive: tracker.nextBooleanDiff(obj.isActive),
      partner: tracker.nextOptionalDiff<Player>(
        obj.partner,
        () => Player._decode(tracker),
        (x) => Player._decodeDiff(x, tracker)
      ),
    };
  },
};

export const Position = {
  default(): Position {
    return {
      x: 0.0,
      y: 0.0,
    };
  },
  fromJson(obj: Record<string, unknown>): Position {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Position: ${obj}`);
    }
    return {
      x: _.tryParseField(() => _.parseFloat(obj["x"]), "Position.x"),
      y: _.tryParseField(() => _.parseFloat(obj["y"]), "Position.y"),
    };
  },
  toJson(obj: Position): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["x"] = obj.x;
    result["y"] = obj.y;
    return result;
  },
  clone(obj: Position): Position {
    return {
      x: obj.x,
      y: obj.y,
    };
  },
  equals(a: Position, b: Position): boolean {
    return (
      _.equalsFloatQuantized(a.x, b.x, 0.1) &&
      _.equalsFloatQuantized(a.y, b.y, 0.1)
    );
  },
  encode(obj: Position): Uint8Array {
    const tracker = new _.Tracker();
    Position._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Position, tracker: _.Tracker): void {
    tracker.pushFloatQuantized(obj.x, 0.1);
    tracker.pushFloatQuantized(obj.y, 0.1);
  },
  encodeDiff(a: Position, b: Position): Uint8Array {
    const tracker = new _.Tracker();
    Position._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Position, b: Position, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Position.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
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
  },
  decode(input: Uint8Array): Position {
    return Position._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Position {
    return {
      x: tracker.nextFloatQuantized(0.1),
      y: tracker.nextFloatQuantized(0.1),
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
      x: tracker.nextFloatQuantizedDiff(obj.x, 0.1),
      y: tracker.nextFloatQuantizedDiff(obj.y, 0.1),
    };
  },
};

export const Velocity = {
  default(): Velocity {
    return {
      vx: 0.0,
      vy: 0.0,
    };
  },
  fromJson(obj: Record<string, unknown>): Velocity {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Velocity: ${obj}`);
    }
    return {
      vx: _.tryParseField(() => _.parseFloat(obj["vx"]), "Velocity.vx"),
      vy: _.tryParseField(() => _.parseFloat(obj["vy"]), "Velocity.vy"),
    };
  },
  toJson(obj: Velocity): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["vx"] = obj.vx;
    result["vy"] = obj.vy;
    return result;
  },
  clone(obj: Velocity): Velocity {
    return {
      vx: obj.vx,
      vy: obj.vy,
    };
  },
  equals(a: Velocity, b: Velocity): boolean {
    return (
      _.equalsFloat(a.vx, b.vx) &&
      _.equalsFloat(a.vy, b.vy)
    );
  },
  encode(obj: Velocity): Uint8Array {
    const tracker = new _.Tracker();
    Velocity._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Velocity, tracker: _.Tracker): void {
    tracker.pushFloat(obj.vx);
    tracker.pushFloat(obj.vy);
  },
  encodeDiff(a: Velocity, b: Velocity): Uint8Array {
    const tracker = new _.Tracker();
    Velocity._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Velocity, b: Velocity, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Velocity.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: vx
    if (dirty != null && !dirty.has("vx")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushFloatDiff(a.vx, b.vx);
    }
    // Field: vy
    if (dirty != null && !dirty.has("vy")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushFloatDiff(a.vy, b.vy);
    }
  },
  decode(input: Uint8Array): Velocity {
    return Velocity._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Velocity {
    return {
      vx: tracker.nextFloat(),
      vy: tracker.nextFloat(),
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
      vx: tracker.nextFloatDiff(obj.vx),
      vy: tracker.nextFloatDiff(obj.vy),
    };
  },
};

export const MoveAction = {
  default(): MoveAction {
    return {
      x: 0,
      y: 0,
    };
  },
  fromJson(obj: Record<string, unknown>): MoveAction {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid MoveAction: ${obj}`);
    }
    return {
      x: _.tryParseField(() => _.parseInt(obj["x"]), "MoveAction.x"),
      y: _.tryParseField(() => _.parseInt(obj["y"]), "MoveAction.y"),
    };
  },
  toJson(obj: MoveAction): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["x"] = obj.x;
    result["y"] = obj.y;
    return result;
  },
  clone(obj: MoveAction): MoveAction {
    return {
      x: obj.x,
      y: obj.y,
    };
  },
  equals(a: MoveAction, b: MoveAction): boolean {
    return (
      a.x === b.x &&
      a.y === b.y
    );
  },
  encode(obj: MoveAction): Uint8Array {
    const tracker = new _.Tracker();
    MoveAction._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: MoveAction, tracker: _.Tracker): void {
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
  },
  encodeDiff(a: MoveAction, b: MoveAction): Uint8Array {
    const tracker = new _.Tracker();
    MoveAction._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: MoveAction, b: MoveAction, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !MoveAction.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: x
    if (dirty != null && !dirty.has("x")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushIntDiff(a.x, b.x);
    }
    // Field: y
    if (dirty != null && !dirty.has("y")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushIntDiff(a.y, b.y);
    }
  },
  decode(input: Uint8Array): MoveAction {
    return MoveAction._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): MoveAction {
    return {
      x: tracker.nextInt(),
      y: tracker.nextInt(),
    };
  },
  decodeDiff(obj: MoveAction, input: Uint8Array): MoveAction {
    const tracker = _.Tracker.parse(input);
    return MoveAction._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: MoveAction, tracker: _.Tracker): MoveAction {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      x: tracker.nextIntDiff(obj.x),
      y: tracker.nextIntDiff(obj.y),
    };
  },
};

export const AttackAction = {
  default(): AttackAction {
    return {
      targetId: "",
      damage: 0,
    };
  },
  fromJson(obj: Record<string, unknown>): AttackAction {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid AttackAction: ${obj}`);
    }
    return {
      targetId: _.tryParseField(() => _.parseString(obj["targetId"]), "AttackAction.targetId"),
      damage: _.tryParseField(() => _.parseUInt(obj["damage"]), "AttackAction.damage"),
    };
  },
  toJson(obj: AttackAction): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["targetId"] = obj.targetId;
    result["damage"] = obj.damage;
    return result;
  },
  clone(obj: AttackAction): AttackAction {
    return {
      targetId: obj.targetId,
      damage: obj.damage,
    };
  },
  equals(a: AttackAction, b: AttackAction): boolean {
    return (
      a.targetId === b.targetId &&
      a.damage === b.damage
    );
  },
  encode(obj: AttackAction): Uint8Array {
    const tracker = new _.Tracker();
    AttackAction._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: AttackAction, tracker: _.Tracker): void {
    tracker.pushString(obj.targetId);
    tracker.pushUInt(obj.damage);
  },
  encodeDiff(a: AttackAction, b: AttackAction): Uint8Array {
    const tracker = new _.Tracker();
    AttackAction._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: AttackAction, b: AttackAction, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !AttackAction.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: targetId
    if (dirty != null && !dirty.has("targetId")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushStringDiff(a.targetId, b.targetId);
    }
    // Field: damage
    if (dirty != null && !dirty.has("damage")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushUIntDiff(a.damage, b.damage);
    }
  },
  decode(input: Uint8Array): AttackAction {
    return AttackAction._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): AttackAction {
    return {
      targetId: tracker.nextString(),
      damage: tracker.nextUInt(),
    };
  },
  decodeDiff(obj: AttackAction, input: Uint8Array): AttackAction {
    const tracker = _.Tracker.parse(input);
    return AttackAction._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: AttackAction, tracker: _.Tracker): AttackAction {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      targetId: tracker.nextStringDiff(obj.targetId),
      damage: tracker.nextUIntDiff(obj.damage),
    };
  },
};

export const UseItemAction = {
  default(): UseItemAction {
    return {
      itemId: "",
    };
  },
  fromJson(obj: Record<string, unknown>): UseItemAction {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid UseItemAction: ${obj}`);
    }
    return {
      itemId: _.tryParseField(() => _.parseString(obj["itemId"]), "UseItemAction.itemId"),
    };
  },
  toJson(obj: UseItemAction): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["itemId"] = obj.itemId;
    return result;
  },
  clone(obj: UseItemAction): UseItemAction {
    return {
      itemId: obj.itemId,
    };
  },
  equals(a: UseItemAction, b: UseItemAction): boolean {
    return (
      a.itemId === b.itemId
    );
  },
  encode(obj: UseItemAction): Uint8Array {
    const tracker = new _.Tracker();
    UseItemAction._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: UseItemAction, tracker: _.Tracker): void {
    tracker.pushString(obj.itemId);
  },
  encodeDiff(a: UseItemAction, b: UseItemAction): Uint8Array {
    const tracker = new _.Tracker();
    UseItemAction._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: UseItemAction, b: UseItemAction, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !UseItemAction.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: itemId
    if (dirty != null && !dirty.has("itemId")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushStringDiff(a.itemId, b.itemId);
    }
  },
  decode(input: Uint8Array): UseItemAction {
    return UseItemAction._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): UseItemAction {
    return {
      itemId: tracker.nextString(),
    };
  },
  decodeDiff(obj: UseItemAction, input: Uint8Array): UseItemAction {
    const tracker = _.Tracker.parse(input);
    return UseItemAction._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: UseItemAction, tracker: _.Tracker): UseItemAction {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      itemId: tracker.nextStringDiff(obj.itemId),
    };
  },
};

export const GameAction = {
  default(): GameAction {
    return {
      type: "MoveAction",
      val: MoveAction.default(),
    };
  },
  values() {
    return ["MoveAction", "AttackAction", "UseItemAction"];
  },
  fromJson(obj: Record<string, unknown>): GameAction {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid GameAction: ${obj}`);
    }
    // check if it's delta-pack format: { type: "TypeName", val: ... }
    if ("type" in obj && typeof obj["type"] === "string" && "val" in obj) {
      if (obj["type"] === "MoveAction") {
        return {
          type: "MoveAction",
          val: MoveAction.fromJson(obj["val"] as MoveAction),
        };
      }
      else if (obj["type"] === "AttackAction") {
        return {
          type: "AttackAction",
          val: AttackAction.fromJson(obj["val"] as AttackAction),
        };
      }
      else if (obj["type"] === "UseItemAction") {
        return {
          type: "UseItemAction",
          val: UseItemAction.fromJson(obj["val"] as UseItemAction),
        };
      }
      else {
        throw new Error(`Invalid GameAction: ${obj}`);
      }
    }
    // check if it's protobuf format: { TypeName: ... }
    const entries = Object.entries(obj);
    if (entries.length === 1) {
      const [fieldName, fieldValue] = entries[0]!;
      if (fieldName === "MoveAction") {
        return {
          type: "MoveAction",
          val: MoveAction.fromJson(fieldValue as MoveAction),
        };
      }
      else if (fieldName === "AttackAction") {
        return {
          type: "AttackAction",
          val: AttackAction.fromJson(fieldValue as AttackAction),
        };
      }
      else if (fieldName === "UseItemAction") {
        return {
          type: "UseItemAction",
          val: UseItemAction.fromJson(fieldValue as UseItemAction),
        };
      }
    }
    throw new Error(`Invalid GameAction: ${obj}`);
  },
  toJson(obj: GameAction): Record<string, unknown> {
    if (obj.type === "MoveAction") {
      return {
        MoveAction: MoveAction.toJson(obj.val),
      };
    }
    else if (obj.type === "AttackAction") {
      return {
        AttackAction: AttackAction.toJson(obj.val),
      };
    }
    else if (obj.type === "UseItemAction") {
      return {
        UseItemAction: UseItemAction.toJson(obj.val),
      };
    }
    throw new Error(`Invalid GameAction: ${obj}`);
  },
  clone(obj: GameAction): GameAction {
    if (obj.type === "MoveAction") {
      return {
        type: "MoveAction",
        val: MoveAction.clone(obj.val),
      };
    }
    else if (obj.type === "AttackAction") {
      return {
        type: "AttackAction",
        val: AttackAction.clone(obj.val),
      };
    }
    else if (obj.type === "UseItemAction") {
      return {
        type: "UseItemAction",
        val: UseItemAction.clone(obj.val),
      };
    }
    throw new Error(`Invalid GameAction: ${obj}`);
  },
  equals(a: GameAction, b: GameAction): boolean {
    if (a.type === "MoveAction" && b.type === "MoveAction") {
      return MoveAction.equals(a.val, b.val);
    }
    else if (a.type === "AttackAction" && b.type === "AttackAction") {
      return AttackAction.equals(a.val, b.val);
    }
    else if (a.type === "UseItemAction" && b.type === "UseItemAction") {
      return UseItemAction.equals(a.val, b.val);
    }
    return false;
  },
  encode(obj: GameAction): Uint8Array {
    const tracker = new _.Tracker();
    GameAction._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: GameAction, tracker: _.Tracker): void {
    if (obj.type === "MoveAction") {
      tracker.pushUInt(0);
      MoveAction._encode(obj.val, tracker);
    }
    else if (obj.type === "AttackAction") {
      tracker.pushUInt(1);
      AttackAction._encode(obj.val, tracker);
    }
    else if (obj.type === "UseItemAction") {
      tracker.pushUInt(2);
      UseItemAction._encode(obj.val, tracker);
    }
  },
  encodeDiff(a: GameAction, b: GameAction): Uint8Array {
    const tracker = new _.Tracker();
    GameAction._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: GameAction, b: GameAction, tracker: _.Tracker): void {
    tracker.pushBoolean(a.type === b.type);
    if (b.type === "MoveAction") {
      if (a.type === "MoveAction") {
        MoveAction._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(0);
        MoveAction._encode(b.val, tracker);
      }
    }
    else if (b.type === "AttackAction") {
      if (a.type === "AttackAction") {
        AttackAction._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(1);
        AttackAction._encode(b.val, tracker);
      }
    }
    else if (b.type === "UseItemAction") {
      if (a.type === "UseItemAction") {
        UseItemAction._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(2);
        UseItemAction._encode(b.val, tracker);
      }
    }
  },
  decode(input: Uint8Array): GameAction {
    return GameAction._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): GameAction {
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "MoveAction", val: MoveAction._decode(tracker) };
    }
    else if (type === 1) {
      return { type: "AttackAction", val: AttackAction._decode(tracker) };
    }
    else if (type === 2) {
      return { type: "UseItemAction", val: UseItemAction._decode(tracker) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(obj: GameAction, input: Uint8Array): GameAction {
    const tracker = _.Tracker.parse(input);
    return GameAction._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: GameAction, tracker: _.Tracker): GameAction {
    const isSameType = tracker.nextBoolean();
    if (isSameType) {
      if (obj.type === "MoveAction") {
        return {
          type: "MoveAction",
          val: MoveAction._decodeDiff(obj.val, tracker),
        };
      }
      else if (obj.type === "AttackAction") {
        return {
          type: "AttackAction",
          val: AttackAction._decodeDiff(obj.val, tracker),
        };
      }
      else if (obj.type === "UseItemAction") {
        return {
          type: "UseItemAction",
          val: UseItemAction._decodeDiff(obj.val, tracker),
        };
      }
      throw new Error("Invalid union diff");
    } else {
      const type = tracker.nextUInt();
      if (type === 0) {
        return {
          type: "MoveAction",
          val: MoveAction._decode(tracker),
        };
      }
      else if (type === 1) {
        return {
          type: "AttackAction",
          val: AttackAction._decode(tracker),
        };
      }
      else if (type === 2) {
        return {
          type: "UseItemAction",
          val: UseItemAction._decode(tracker),
        };
      }
      throw new Error("Invalid union diff");
    }
  }
}

export const GameState = {
  default(): GameState {
    return {
      players: [],
      currentPlayer: undefined,
      round: 0,
      metadata: new Map(),
      winningColor: undefined,
      lastAction: undefined,
    };
  },
  fromJson(obj: Record<string, unknown>): GameState {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid GameState: ${obj}`);
    }
    return {
      players: _.tryParseField(() => _.parseArray(obj["players"], (x) => Player.fromJson(x as Player)), "GameState.players"),
      currentPlayer: _.tryParseField(() => _.parseOptional(obj["currentPlayer"], (x) => _.parseString(x)), "GameState.currentPlayer"),
      round: _.tryParseField(() => _.parseUInt(obj["round"]), "GameState.round"),
      metadata: _.tryParseField(() => _.parseRecord(obj["metadata"], (x) => _.parseString(x), (x) => _.parseString(x)), "GameState.metadata"),
      winningColor: _.tryParseField(() => _.parseOptional(obj["winningColor"], (x) => _.parseEnum(x, Color)), "GameState.winningColor"),
      lastAction: _.tryParseField(() => _.parseOptional(obj["lastAction"], (x) => GameAction.fromJson(x as GameAction)), "GameState.lastAction"),
    };
  },
  toJson(obj: GameState): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["players"] = obj.players.map((x) => Player.toJson(x));
    if (obj.currentPlayer != null) {
      result["currentPlayer"] = obj.currentPlayer;
    }
    result["round"] = obj.round;
    result["metadata"] = _.mapToObject(obj.metadata, (x) => x);
    if (obj.winningColor != null) {
      result["winningColor"] = obj.winningColor;
    }
    if (obj.lastAction != null) {
      result["lastAction"] = GameAction.toJson(obj.lastAction);
    }
    return result;
  },
  clone(obj: GameState): GameState {
    return {
      players: obj.players.map((x) => Player.clone(x)),
      currentPlayer: obj.currentPlayer != null ? obj.currentPlayer : undefined,
      round: obj.round,
      metadata: new Map([...obj.metadata].map(([k, v]) => [k, v])),
      winningColor: obj.winningColor != null ? obj.winningColor : undefined,
      lastAction: obj.lastAction != null ? GameAction.clone(obj.lastAction) : undefined,
    };
  },
  equals(a: GameState, b: GameState): boolean {
    return (
      _.equalsArray(a.players, b.players, (x, y) => Player.equals(x, y)) &&
      _.equalsOptional(a.currentPlayer, b.currentPlayer, (x, y) => x === y) &&
      a.round === b.round &&
      _.equalsRecord(a.metadata, b.metadata, (x, y) => x === y, (x, y) => x === y) &&
      _.equalsOptional(a.winningColor, b.winningColor, (x, y) => x === y) &&
      _.equalsOptional(a.lastAction, b.lastAction, (x, y) => GameAction.equals(x, y))
    );
  },
  encode(obj: GameState): Uint8Array {
    const tracker = new _.Tracker();
    GameState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: GameState, tracker: _.Tracker): void {
    tracker.pushArray(obj.players, (x) => Player._encode(x, tracker));
    tracker.pushOptional(obj.currentPlayer, (x) => tracker.pushString(x));
    tracker.pushUInt(obj.round);
    tracker.pushRecord(obj.metadata, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    tracker.pushOptional(obj.winningColor, (x) => tracker.pushUInt(Color[x]));
    tracker.pushOptional(obj.lastAction, (x) => GameAction._encode(x, tracker));
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
      tracker.pushArrayDiff<Player>(
        a.players,
        b.players,
        (x, y) => Player.equals(x, y),
        (x) => Player._encode(x, tracker),
        (x, y) => Player._encodeDiff(x, y, tracker)
      );
    }
    // Field: currentPlayer
    if (dirty != null && !dirty.has("currentPlayer")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushOptionalDiffPrimitive<string>(
        a.currentPlayer,
        b.currentPlayer,
        (x) => tracker.pushString(x)
      );
    }
    // Field: round
    if (dirty != null && !dirty.has("round")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushUIntDiff(a.round, b.round);
    }
    // Field: metadata
    if (dirty != null && !dirty.has("metadata")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushRecordDiff<string, string>(
        a.metadata,
        b.metadata,
        (x, y) => x === y,
        (x) => tracker.pushString(x),
        (x) => tracker.pushString(x),
        (x, y) => tracker.pushStringDiff(x, y)
      );
    }
    // Field: winningColor
    if (dirty != null && !dirty.has("winningColor")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushOptionalDiffPrimitive<Color>(
        a.winningColor,
        b.winningColor,
        (x) => tracker.pushUInt(Color[x])
      );
    }
    // Field: lastAction
    if (dirty != null && !dirty.has("lastAction")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushOptionalDiff<GameAction>(
        a.lastAction,
        b.lastAction,
        (x) => GameAction._encode(x, tracker),
        (x, y) => GameAction._encodeDiff(x, y, tracker)
      );
    }
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): GameState {
    return {
      players: tracker.nextArray(() => Player._decode(tracker)),
      currentPlayer: tracker.nextOptional(() => tracker.nextString()),
      round: tracker.nextUInt(),
      metadata: tracker.nextRecord(() => tracker.nextString(), () => tracker.nextString()),
      winningColor: tracker.nextOptional(() => (Color as any)[tracker.nextUInt()]),
      lastAction: tracker.nextOptional(() => GameAction._decode(tracker)),
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
      players: tracker.nextArrayDiff<Player>(
        obj.players,
        () => Player._decode(tracker),
        (x) => Player._decodeDiff(x, tracker)
      ),
      currentPlayer: tracker.nextOptionalDiffPrimitive<string>(
        obj.currentPlayer,
        () => tracker.nextString()
      ),
      round: tracker.nextUIntDiff(obj.round),
      metadata: tracker.nextRecordDiff<string, string>(
        obj.metadata,
        () => tracker.nextString(),
        () => tracker.nextString(),
        (x) => tracker.nextStringDiff(x)
      ),
      winningColor: tracker.nextOptionalDiffPrimitive<Color>(
        obj.winningColor,
        () => (Color as any)[tracker.nextUInt()]
      ),
      lastAction: tracker.nextOptionalDiff<GameAction>(
        obj.lastAction,
        () => GameAction._decode(tracker),
        (x) => GameAction._decodeDiff(x, tracker)
      ),
    };
  },
};

export const Inventory = {
  default(): Inventory {
    return {
      items: undefined,
    };
  },
  fromJson(obj: Record<string, unknown>): Inventory {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Inventory: ${obj}`);
    }
    return {
      items: _.tryParseField(() => _.parseOptional(obj["items"], (x) => _.parseArray(x, (x) => _.parseRecord(x, (x) => _.parseString(x), (x) => _.parseInt(x)))), "Inventory.items"),
    };
  },
  toJson(obj: Inventory): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (obj.items != null) {
      result["items"] = obj.items.map((x) => _.mapToObject(x, (x) => x));
    }
    return result;
  },
  clone(obj: Inventory): Inventory {
    return {
      items: obj.items != null ? obj.items.map((x) => new Map([...x].map(([k, v]) => [k, v]))) : undefined,
    };
  },
  equals(a: Inventory, b: Inventory): boolean {
    return (
      _.equalsOptional(a.items, b.items, (x, y) => _.equalsArray(x, y, (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => x === y)))
    );
  },
  encode(obj: Inventory): Uint8Array {
    const tracker = new _.Tracker();
    Inventory._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Inventory, tracker: _.Tracker): void {
    tracker.pushOptional(obj.items, (x) => tracker.pushArray(x, (x) => tracker.pushRecord(x, (x) => tracker.pushString(x), (x) => tracker.pushInt(x))));
  },
  encodeDiff(a: Inventory, b: Inventory): Uint8Array {
    const tracker = new _.Tracker();
    Inventory._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Inventory, b: Inventory, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Inventory.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: items
    if (dirty != null && !dirty.has("items")) {
      tracker.pushBoolean(false);
    } else {
      tracker.pushOptionalDiff<(Map<string, number> & { _dirty?: Set<string> })[] & { _dirty?: Set<number> }>(
        a.items,
        b.items,
        (x) => tracker.pushArray(x, (x) => tracker.pushRecord(x, (x) => tracker.pushString(x), (x) => tracker.pushInt(x))),
        (x, y) => tracker.pushArrayDiff<Map<string, number> & { _dirty?: Set<string> }>(
        x,
        y,
        (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => x === y),
        (x) => tracker.pushRecord(x, (x) => tracker.pushString(x), (x) => tracker.pushInt(x)),
        (x, y) => tracker.pushRecordDiff<string, number>(
        x,
        y,
        (x, y) => x === y,
        (x) => tracker.pushString(x),
        (x) => tracker.pushInt(x),
        (x, y) => tracker.pushIntDiff(x, y)
      )
      )
      );
    }
  },
  decode(input: Uint8Array): Inventory {
    return Inventory._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Inventory {
    return {
      items: tracker.nextOptional(() => tracker.nextArray(() => tracker.nextRecord(() => tracker.nextString(), () => tracker.nextInt()))),
    };
  },
  decodeDiff(obj: Inventory, input: Uint8Array): Inventory {
    const tracker = _.Tracker.parse(input);
    return Inventory._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Inventory, tracker: _.Tracker): Inventory {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      items: tracker.nextOptionalDiff<(Map<string, number> & { _dirty?: Set<string> })[] & { _dirty?: Set<number> }>(
        obj.items,
        () => tracker.nextArray(() => tracker.nextRecord(() => tracker.nextString(), () => tracker.nextInt())),
        (x) => tracker.nextArrayDiff<Map<string, number> & { _dirty?: Set<string> }>(
        x,
        () => tracker.nextRecord(() => tracker.nextString(), () => tracker.nextInt()),
        (x) => tracker.nextRecordDiff<string, number>(
        x,
        () => tracker.nextString(),
        () => tracker.nextInt(),
        (x) => tracker.nextIntDiff(x)
      )
      )
      ),
    };
  },
};

export const PlayerRegistry = {
  default(): PlayerRegistry {
    return {
      players: new Map(),
    };
  },
  fromJson(obj: Record<string, unknown>): PlayerRegistry {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid PlayerRegistry: ${obj}`);
    }
    return {
      players: _.tryParseField(() => _.parseRecord(obj["players"], (x) => _.parseString(x), (x) => Player.fromJson(x as Player)), "PlayerRegistry.players"),
    };
  },
  toJson(obj: PlayerRegistry): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["players"] = _.mapToObject(obj.players, (x) => Player.toJson(x));
    return result;
  },
  clone(obj: PlayerRegistry): PlayerRegistry {
    return {
      players: new Map([...obj.players].map(([k, v]) => [k, Player.clone(v)])),
    };
  },
  equals(a: PlayerRegistry, b: PlayerRegistry): boolean {
    return (
      _.equalsRecord(a.players, b.players, (x, y) => x === y, (x, y) => Player.equals(x, y))
    );
  },
  encode(obj: PlayerRegistry): Uint8Array {
    const tracker = new _.Tracker();
    PlayerRegistry._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: PlayerRegistry, tracker: _.Tracker): void {
    tracker.pushRecord(obj.players, (x) => tracker.pushString(x), (x) => Player._encode(x, tracker));
  },
  encodeDiff(a: PlayerRegistry, b: PlayerRegistry): Uint8Array {
    const tracker = new _.Tracker();
    PlayerRegistry._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: PlayerRegistry, b: PlayerRegistry, tracker: _.Tracker): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !PlayerRegistry.equals(a, b) : dirty.size > 0;
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
  },
  decode(input: Uint8Array): PlayerRegistry {
    return PlayerRegistry._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): PlayerRegistry {
    return {
      players: tracker.nextRecord(() => tracker.nextString(), () => Player._decode(tracker)),
    };
  },
  decodeDiff(obj: PlayerRegistry, input: Uint8Array): PlayerRegistry {
    const tracker = _.Tracker.parse(input);
    return PlayerRegistry._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: PlayerRegistry, tracker: _.Tracker): PlayerRegistry {
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
    };
  },
};
