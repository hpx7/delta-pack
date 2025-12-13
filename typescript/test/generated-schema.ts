import * as _ from "@hpx7/delta-pack/helpers";


export type Color = "RED" | "BLUE" | "GREEN" | "YELLOW";
    
export type Player = {
  id: string;
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
export type Entity = {
  id: string;
  position: Position;
} & { _dirty?: Set<keyof Entity> };
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
    const encoder = new _.Encoder();
    Player._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Player, encoder: _.Encoder): void {
    encoder.pushString(obj.id);
    encoder.pushString(obj.name);
    encoder.pushInt(obj.score);
    encoder.pushBoolean(obj.isActive);
    encoder.pushOptional(obj.partner, (x) => Player._encode(x, encoder));
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
    // Field: score
    if (dirty != null && !dirty.has("score")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushIntDiff(a.score, b.score);
    }
    // Field: isActive
    if (dirty != null && !dirty.has("isActive")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushBooleanDiff(a.isActive, b.isActive);
    }
    // Field: partner
    if (dirty != null && !dirty.has("partner")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushOptionalDiff<Player>(
        a.partner,
        b.partner,
        (x) => Player._encode(x, encoder),
        (x, y) => Player._encodeDiff(x, y, encoder)
      );
    }
  },
  decode(input: Uint8Array): Player {
    return Player._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): Player {
    return {
      id: decoder.nextString(),
      name: decoder.nextString(),
      score: decoder.nextInt(),
      isActive: decoder.nextBoolean(),
      partner: decoder.nextOptional(() => Player._decode(decoder)),
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
      score: decoder.nextIntDiff(obj.score),
      isActive: decoder.nextBooleanDiff(obj.isActive),
      partner: decoder.nextOptionalDiff<Player>(
        obj.partner,
        () => Player._decode(decoder),
        (x) => Player._decodeDiff(x, decoder)
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
    const encoder = new _.Encoder();
    Position._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Position, encoder: _.Encoder): void {
    encoder.pushFloatQuantized(obj.x, 0.1);
    encoder.pushFloatQuantized(obj.y, 0.1);
  },
  encodeDiff(a: Position, b: Position): Uint8Array {
    const encoder = new _.Encoder();
    Position._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Position, b: Position, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Position.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
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
  },
  decode(input: Uint8Array): Position {
    return Position._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): Position {
    return {
      x: decoder.nextFloatQuantized(0.1),
      y: decoder.nextFloatQuantized(0.1),
    };
  },
  decodeDiff(obj: Position, input: Uint8Array): Position {
    const decoder = new _.Decoder(input);
    return Position._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: Position, decoder: _.Decoder): Position {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      x: decoder.nextFloatQuantizedDiff(obj.x, 0.1),
      y: decoder.nextFloatQuantizedDiff(obj.y, 0.1),
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
    const encoder = new _.Encoder();
    Velocity._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Velocity, encoder: _.Encoder): void {
    encoder.pushFloat(obj.vx);
    encoder.pushFloat(obj.vy);
  },
  encodeDiff(a: Velocity, b: Velocity): Uint8Array {
    const encoder = new _.Encoder();
    Velocity._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Velocity, b: Velocity, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Velocity.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: vx
    if (dirty != null && !dirty.has("vx")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushFloatDiff(a.vx, b.vx);
    }
    // Field: vy
    if (dirty != null && !dirty.has("vy")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushFloatDiff(a.vy, b.vy);
    }
  },
  decode(input: Uint8Array): Velocity {
    return Velocity._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): Velocity {
    return {
      vx: decoder.nextFloat(),
      vy: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: Velocity, input: Uint8Array): Velocity {
    const decoder = new _.Decoder(input);
    return Velocity._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: Velocity, decoder: _.Decoder): Velocity {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      vx: decoder.nextFloatDiff(obj.vx),
      vy: decoder.nextFloatDiff(obj.vy),
    };
  },
};

export const Entity = {
  default(): Entity {
    return {
      id: "",
      position: Position.default(),
    };
  },
  fromJson(obj: Record<string, unknown>): Entity {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Entity: ${obj}`);
    }
    return {
      id: _.tryParseField(() => _.parseString(obj["id"]), "Entity.id"),
      position: _.tryParseField(() => Position.fromJson(obj["position"] as Position), "Entity.position"),
    };
  },
  toJson(obj: Entity): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["id"] = obj.id;
    result["position"] = Position.toJson(obj.position);
    return result;
  },
  clone(obj: Entity): Entity {
    return {
      id: obj.id,
      position: Position.clone(obj.position),
    };
  },
  equals(a: Entity, b: Entity): boolean {
    return (
      a.id === b.id &&
      Position.equals(a.position, b.position)
    );
  },
  encode(obj: Entity): Uint8Array {
    const encoder = new _.Encoder();
    Entity._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Entity, encoder: _.Encoder): void {
    encoder.pushString(obj.id);
    Position._encode(obj.position, encoder);
  },
  encodeDiff(a: Entity, b: Entity): Uint8Array {
    const encoder = new _.Encoder();
    Entity._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Entity, b: Entity, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Entity.equals(a, b) : dirty.size > 0;
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
    // Field: position
    if (dirty != null && !dirty.has("position")) {
      encoder.pushBoolean(false);
    } else {
      Position._encodeDiff(a.position, b.position, encoder);
    }
  },
  decode(input: Uint8Array): Entity {
    return Entity._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): Entity {
    return {
      id: decoder.nextString(),
      position: Position._decode(decoder),
    };
  },
  decodeDiff(obj: Entity, input: Uint8Array): Entity {
    const decoder = new _.Decoder(input);
    return Entity._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: Entity, decoder: _.Decoder): Entity {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      id: decoder.nextStringDiff(obj.id),
      position: Position._decodeDiff(obj.position, decoder),
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
    const encoder = new _.Encoder();
    MoveAction._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: MoveAction, encoder: _.Encoder): void {
    encoder.pushInt(obj.x);
    encoder.pushInt(obj.y);
  },
  encodeDiff(a: MoveAction, b: MoveAction): Uint8Array {
    const encoder = new _.Encoder();
    MoveAction._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: MoveAction, b: MoveAction, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !MoveAction.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: x
    if (dirty != null && !dirty.has("x")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushIntDiff(a.x, b.x);
    }
    // Field: y
    if (dirty != null && !dirty.has("y")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushIntDiff(a.y, b.y);
    }
  },
  decode(input: Uint8Array): MoveAction {
    return MoveAction._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): MoveAction {
    return {
      x: decoder.nextInt(),
      y: decoder.nextInt(),
    };
  },
  decodeDiff(obj: MoveAction, input: Uint8Array): MoveAction {
    const decoder = new _.Decoder(input);
    return MoveAction._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: MoveAction, decoder: _.Decoder): MoveAction {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      x: decoder.nextIntDiff(obj.x),
      y: decoder.nextIntDiff(obj.y),
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
    const encoder = new _.Encoder();
    AttackAction._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: AttackAction, encoder: _.Encoder): void {
    encoder.pushString(obj.targetId);
    encoder.pushUInt(obj.damage);
  },
  encodeDiff(a: AttackAction, b: AttackAction): Uint8Array {
    const encoder = new _.Encoder();
    AttackAction._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: AttackAction, b: AttackAction, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !AttackAction.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: targetId
    if (dirty != null && !dirty.has("targetId")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushStringDiff(a.targetId, b.targetId);
    }
    // Field: damage
    if (dirty != null && !dirty.has("damage")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushUIntDiff(a.damage, b.damage);
    }
  },
  decode(input: Uint8Array): AttackAction {
    return AttackAction._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): AttackAction {
    return {
      targetId: decoder.nextString(),
      damage: decoder.nextUInt(),
    };
  },
  decodeDiff(obj: AttackAction, input: Uint8Array): AttackAction {
    const decoder = new _.Decoder(input);
    return AttackAction._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: AttackAction, decoder: _.Decoder): AttackAction {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      targetId: decoder.nextStringDiff(obj.targetId),
      damage: decoder.nextUIntDiff(obj.damage),
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
    const encoder = new _.Encoder();
    UseItemAction._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: UseItemAction, encoder: _.Encoder): void {
    encoder.pushString(obj.itemId);
  },
  encodeDiff(a: UseItemAction, b: UseItemAction): Uint8Array {
    const encoder = new _.Encoder();
    UseItemAction._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: UseItemAction, b: UseItemAction, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !UseItemAction.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: itemId
    if (dirty != null && !dirty.has("itemId")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushStringDiff(a.itemId, b.itemId);
    }
  },
  decode(input: Uint8Array): UseItemAction {
    return UseItemAction._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): UseItemAction {
    return {
      itemId: decoder.nextString(),
    };
  },
  decodeDiff(obj: UseItemAction, input: Uint8Array): UseItemAction {
    const decoder = new _.Decoder(input);
    return UseItemAction._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: UseItemAction, decoder: _.Decoder): UseItemAction {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      itemId: decoder.nextStringDiff(obj.itemId),
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
    const encoder = new _.Encoder();
    GameAction._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: GameAction, encoder: _.Encoder): void {
    if (obj.type === "MoveAction") {
      encoder.pushUInt(0);
      MoveAction._encode(obj.val, encoder);
    }
    else if (obj.type === "AttackAction") {
      encoder.pushUInt(1);
      AttackAction._encode(obj.val, encoder);
    }
    else if (obj.type === "UseItemAction") {
      encoder.pushUInt(2);
      UseItemAction._encode(obj.val, encoder);
    }
  },
  encodeDiff(a: GameAction, b: GameAction): Uint8Array {
    const encoder = new _.Encoder();
    GameAction._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: GameAction, b: GameAction, encoder: _.Encoder): void {
    encoder.pushBoolean(a.type === b.type);
    if (b.type === "MoveAction") {
      if (a.type === "MoveAction") {
        MoveAction._encodeDiff(a.val, b.val, encoder);
      } else {
        encoder.pushUInt(0);
        MoveAction._encode(b.val, encoder);
      }
    }
    else if (b.type === "AttackAction") {
      if (a.type === "AttackAction") {
        AttackAction._encodeDiff(a.val, b.val, encoder);
      } else {
        encoder.pushUInt(1);
        AttackAction._encode(b.val, encoder);
      }
    }
    else if (b.type === "UseItemAction") {
      if (a.type === "UseItemAction") {
        UseItemAction._encodeDiff(a.val, b.val, encoder);
      } else {
        encoder.pushUInt(2);
        UseItemAction._encode(b.val, encoder);
      }
    }
  },
  decode(input: Uint8Array): GameAction {
    return GameAction._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): GameAction {
    const type = decoder.nextUInt();
    if (type === 0) {
      return { type: "MoveAction", val: MoveAction._decode(decoder) };
    }
    else if (type === 1) {
      return { type: "AttackAction", val: AttackAction._decode(decoder) };
    }
    else if (type === 2) {
      return { type: "UseItemAction", val: UseItemAction._decode(decoder) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(obj: GameAction, input: Uint8Array): GameAction {
    const decoder = new _.Decoder(input);
    return GameAction._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: GameAction, decoder: _.Decoder): GameAction {
    const isSameType = decoder.nextBoolean();
    if (isSameType) {
      if (obj.type === "MoveAction") {
        return {
          type: "MoveAction",
          val: MoveAction._decodeDiff(obj.val, decoder),
        };
      }
      else if (obj.type === "AttackAction") {
        return {
          type: "AttackAction",
          val: AttackAction._decodeDiff(obj.val, decoder),
        };
      }
      else if (obj.type === "UseItemAction") {
        return {
          type: "UseItemAction",
          val: UseItemAction._decodeDiff(obj.val, decoder),
        };
      }
      throw new Error("Invalid union diff");
    } else {
      const type = decoder.nextUInt();
      if (type === 0) {
        return {
          type: "MoveAction",
          val: MoveAction._decode(decoder),
        };
      }
      else if (type === 1) {
        return {
          type: "AttackAction",
          val: AttackAction._decode(decoder),
        };
      }
      else if (type === 2) {
        return {
          type: "UseItemAction",
          val: UseItemAction._decode(decoder),
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
    const encoder = new _.Encoder();
    GameState._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: GameState, encoder: _.Encoder): void {
    encoder.pushArray(obj.players, (x) => Player._encode(x, encoder));
    encoder.pushOptional(obj.currentPlayer, (x) => encoder.pushString(x));
    encoder.pushUInt(obj.round);
    encoder.pushRecord(obj.metadata, (x) => encoder.pushString(x), (x) => encoder.pushString(x));
    encoder.pushOptional(obj.winningColor, (x) => encoder.pushUInt(Color[x]));
    encoder.pushOptional(obj.lastAction, (x) => GameAction._encode(x, encoder));
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
      encoder.pushArrayDiff<Player>(
        a.players,
        b.players,
        (x, y) => Player.equals(x, y),
        (x) => Player._encode(x, encoder),
        (x, y) => Player._encodeDiff(x, y, encoder)
      );
    }
    // Field: currentPlayer
    if (dirty != null && !dirty.has("currentPlayer")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushOptionalDiffPrimitive<string>(
        a.currentPlayer,
        b.currentPlayer,
        (x) => encoder.pushString(x)
      );
    }
    // Field: round
    if (dirty != null && !dirty.has("round")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushUIntDiff(a.round, b.round);
    }
    // Field: metadata
    if (dirty != null && !dirty.has("metadata")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushRecordDiff<string, string>(
        a.metadata,
        b.metadata,
        (x, y) => x === y,
        (x) => encoder.pushString(x),
        (x) => encoder.pushString(x),
        (x, y) => encoder.pushStringDiff(x, y)
      );
    }
    // Field: winningColor
    if (dirty != null && !dirty.has("winningColor")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushOptionalDiffPrimitive<Color>(
        a.winningColor,
        b.winningColor,
        (x) => encoder.pushUInt(Color[x])
      );
    }
    // Field: lastAction
    if (dirty != null && !dirty.has("lastAction")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushOptionalDiff<GameAction>(
        a.lastAction,
        b.lastAction,
        (x) => GameAction._encode(x, encoder),
        (x, y) => GameAction._encodeDiff(x, y, encoder)
      );
    }
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): GameState {
    return {
      players: decoder.nextArray(() => Player._decode(decoder)),
      currentPlayer: decoder.nextOptional(() => decoder.nextString()),
      round: decoder.nextUInt(),
      metadata: decoder.nextRecord(() => decoder.nextString(), () => decoder.nextString()),
      winningColor: decoder.nextOptional(() => (Color as any)[decoder.nextUInt()]),
      lastAction: decoder.nextOptional(() => GameAction._decode(decoder)),
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
      players: decoder.nextArrayDiff<Player>(
        obj.players,
        () => Player._decode(decoder),
        (x) => Player._decodeDiff(x, decoder)
      ),
      currentPlayer: decoder.nextOptionalDiffPrimitive<string>(
        obj.currentPlayer,
        () => decoder.nextString()
      ),
      round: decoder.nextUIntDiff(obj.round),
      metadata: decoder.nextRecordDiff<string, string>(
        obj.metadata,
        () => decoder.nextString(),
        () => decoder.nextString(),
        (x) => decoder.nextStringDiff(x)
      ),
      winningColor: decoder.nextOptionalDiffPrimitive<Color>(
        obj.winningColor,
        () => (Color as any)[decoder.nextUInt()]
      ),
      lastAction: decoder.nextOptionalDiff<GameAction>(
        obj.lastAction,
        () => GameAction._decode(decoder),
        (x) => GameAction._decodeDiff(x, decoder)
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
    const encoder = new _.Encoder();
    Inventory._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Inventory, encoder: _.Encoder): void {
    encoder.pushOptional(obj.items, (x) => encoder.pushArray(x, (x) => encoder.pushRecord(x, (x) => encoder.pushString(x), (x) => encoder.pushInt(x))));
  },
  encodeDiff(a: Inventory, b: Inventory): Uint8Array {
    const encoder = new _.Encoder();
    Inventory._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Inventory, b: Inventory, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Inventory.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
    // Field: items
    if (dirty != null && !dirty.has("items")) {
      encoder.pushBoolean(false);
    } else {
      encoder.pushOptionalDiff<(Map<string, number> & { _dirty?: Set<string> })[] & { _dirty?: Set<number> }>(
        a.items,
        b.items,
        (x) => encoder.pushArray(x, (x) => encoder.pushRecord(x, (x) => encoder.pushString(x), (x) => encoder.pushInt(x))),
        (x, y) => encoder.pushArrayDiff<Map<string, number> & { _dirty?: Set<string> }>(
        x,
        y,
        (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => x === y),
        (x) => encoder.pushRecord(x, (x) => encoder.pushString(x), (x) => encoder.pushInt(x)),
        (x, y) => encoder.pushRecordDiff<string, number>(
        x,
        y,
        (x, y) => x === y,
        (x) => encoder.pushString(x),
        (x) => encoder.pushInt(x),
        (x, y) => encoder.pushIntDiff(x, y)
      )
      )
      );
    }
  },
  decode(input: Uint8Array): Inventory {
    return Inventory._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): Inventory {
    return {
      items: decoder.nextOptional(() => decoder.nextArray(() => decoder.nextRecord(() => decoder.nextString(), () => decoder.nextInt()))),
    };
  },
  decodeDiff(obj: Inventory, input: Uint8Array): Inventory {
    const decoder = new _.Decoder(input);
    return Inventory._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: Inventory, decoder: _.Decoder): Inventory {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      items: decoder.nextOptionalDiff<(Map<string, number> & { _dirty?: Set<string> })[] & { _dirty?: Set<number> }>(
        obj.items,
        () => decoder.nextArray(() => decoder.nextRecord(() => decoder.nextString(), () => decoder.nextInt())),
        (x) => decoder.nextArrayDiff<Map<string, number> & { _dirty?: Set<string> }>(
        x,
        () => decoder.nextRecord(() => decoder.nextString(), () => decoder.nextInt()),
        (x) => decoder.nextRecordDiff<string, number>(
        x,
        () => decoder.nextString(),
        () => decoder.nextInt(),
        (x) => decoder.nextIntDiff(x)
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
    const encoder = new _.Encoder();
    PlayerRegistry._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: PlayerRegistry, encoder: _.Encoder): void {
    encoder.pushRecord(obj.players, (x) => encoder.pushString(x), (x) => Player._encode(x, encoder));
  },
  encodeDiff(a: PlayerRegistry, b: PlayerRegistry): Uint8Array {
    const encoder = new _.Encoder();
    PlayerRegistry._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: PlayerRegistry, b: PlayerRegistry, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !PlayerRegistry.equals(a, b) : dirty.size > 0;
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
  },
  decode(input: Uint8Array): PlayerRegistry {
    return PlayerRegistry._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): PlayerRegistry {
    return {
      players: decoder.nextRecord(() => decoder.nextString(), () => Player._decode(decoder)),
    };
  },
  decodeDiff(obj: PlayerRegistry, input: Uint8Array): PlayerRegistry {
    const decoder = new _.Decoder(input);
    return PlayerRegistry._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: PlayerRegistry, decoder: _.Decoder): PlayerRegistry {
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
    };
  },
};
