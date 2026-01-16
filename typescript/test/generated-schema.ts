import * as _ from "@hpx7/delta-pack/runtime";

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

export type GameAction = { _type: "MoveAction" } & MoveAction | { _type: "AttackAction" } & AttackAction | { _type: "UseItemAction" } & UseItemAction;

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
  fromJson(obj: object): Player {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Player: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      id: _.tryParseField(() => _.parseString(o["id"]), "Player.id"),
      name: _.tryParseField(() => _.parseString(o["name"]), "Player.name"),
      score: _.tryParseField(() => _.parseInt(o["score"]), "Player.score"),
      isActive: _.tryParseField(() => _.parseBoolean(o["isActive"]), "Player.isActive"),
      partner: _.tryParseField(() => _.parseOptional(o["partner"], (x) => Player.fromJson(x as Player)), "Player.partner"),
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
    const encoder = _.Encoder.create();
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
    const encoder = _.Encoder.create();
    Player._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Player, b: Player, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Player.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      Player._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: Player, b: Player, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.id,
      b.id,
      dirty?.has("id") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a.name,
      b.name,
      dirty?.has("name") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a.score,
      b.score,
      dirty?.has("score") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
    encoder.pushFieldDiffValue(
      dirty?.has("isActive") ?? true,
      () => encoder.pushBooleanDiff(a.isActive, b.isActive),
    );
    encoder.pushFieldDiff(
      a.partner,
      b.partner,
      dirty?.has("partner") ?? true,
      (x, y) => _.equalsOptional(x, y, (x, y) => Player.equals(x, y)),
      (x, y) => encoder.pushOptionalDiff<Player>(x, y, (x) => Player._encode(x, encoder), (x, y) => Player._encodeDiffFields(x, y, encoder)),
    );
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Decoder.create(input));
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
    return Player._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: Player, decoder: _.Decoder): Player {
    return decoder.nextBoolean() ? Player._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: Player, decoder: _.Decoder): Player {
    return {
      id: decoder.nextFieldDiff(obj.id, (x) => decoder.nextStringDiff(x)),
      name: decoder.nextFieldDiff(obj.name, (x) => decoder.nextStringDiff(x)),
      score: decoder.nextFieldDiff(obj.score, (x) => decoder.nextIntDiff(x)),
      isActive: decoder.nextBooleanDiff(obj.isActive),
      partner: decoder.nextFieldDiff(obj.partner, (x) => decoder.nextOptionalDiff<Player>(x, () => Player._decode(decoder), (x) => Player._decodeDiffFields(x, decoder))),
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
  fromJson(obj: object): Position {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Position: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      x: _.tryParseField(() => _.parseFloat(o["x"]), "Position.x"),
      y: _.tryParseField(() => _.parseFloat(o["y"]), "Position.y"),
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
    const encoder = _.Encoder.create();
    Position._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Position, encoder: _.Encoder): void {
    encoder.pushFloatQuantized(obj.x, 0.1);
    encoder.pushFloatQuantized(obj.y, 0.1);
  },
  encodeDiff(a: Position, b: Position): Uint8Array {
    const encoder = _.Encoder.create();
    Position._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Position, b: Position, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Position.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      Position._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: Position, b: Position, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.x,
      b.x,
      dirty?.has("x") ?? true,
      (x, y) => _.equalsFloatQuantized(x, y, 0.1),
      (x, y) => encoder.pushFloatQuantizedDiff(x, y, 0.1),
    );
    encoder.pushFieldDiff(
      a.y,
      b.y,
      dirty?.has("y") ?? true,
      (x, y) => _.equalsFloatQuantized(x, y, 0.1),
      (x, y) => encoder.pushFloatQuantizedDiff(x, y, 0.1),
    );
  },
  decode(input: Uint8Array): Position {
    return Position._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Position {
    return {
      x: decoder.nextFloatQuantized(0.1),
      y: decoder.nextFloatQuantized(0.1),
    };
  },
  decodeDiff(obj: Position, input: Uint8Array): Position {
    return Position._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: Position, decoder: _.Decoder): Position {
    return decoder.nextBoolean() ? Position._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: Position, decoder: _.Decoder): Position {
    return {
      x: decoder.nextFieldDiff(obj.x, (x) => decoder.nextFloatQuantizedDiff(x, 0.1)),
      y: decoder.nextFieldDiff(obj.y, (x) => decoder.nextFloatQuantizedDiff(x, 0.1)),
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
  fromJson(obj: object): Velocity {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Velocity: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      vx: _.tryParseField(() => _.parseFloat(o["vx"]), "Velocity.vx"),
      vy: _.tryParseField(() => _.parseFloat(o["vy"]), "Velocity.vy"),
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
    const encoder = _.Encoder.create();
    Velocity._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Velocity, encoder: _.Encoder): void {
    encoder.pushFloat(obj.vx);
    encoder.pushFloat(obj.vy);
  },
  encodeDiff(a: Velocity, b: Velocity): Uint8Array {
    const encoder = _.Encoder.create();
    Velocity._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Velocity, b: Velocity, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Velocity.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      Velocity._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: Velocity, b: Velocity, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.vx,
      b.vx,
      dirty?.has("vx") ?? true,
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiff(
      a.vy,
      b.vy,
      dirty?.has("vy") ?? true,
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
  },
  decode(input: Uint8Array): Velocity {
    return Velocity._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Velocity {
    return {
      vx: decoder.nextFloat(),
      vy: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: Velocity, input: Uint8Array): Velocity {
    return Velocity._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: Velocity, decoder: _.Decoder): Velocity {
    return decoder.nextBoolean() ? Velocity._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: Velocity, decoder: _.Decoder): Velocity {
    return {
      vx: decoder.nextFieldDiff(obj.vx, (x) => decoder.nextFloatDiff(x)),
      vy: decoder.nextFieldDiff(obj.vy, (x) => decoder.nextFloatDiff(x)),
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
  fromJson(obj: object): Entity {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Entity: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      id: _.tryParseField(() => _.parseString(o["id"]), "Entity.id"),
      position: _.tryParseField(() => Position.fromJson(o["position"] as Position), "Entity.position"),
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
    const encoder = _.Encoder.create();
    Entity._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Entity, encoder: _.Encoder): void {
    encoder.pushString(obj.id);
    Position._encode(obj.position, encoder);
  },
  encodeDiff(a: Entity, b: Entity): Uint8Array {
    const encoder = _.Encoder.create();
    Entity._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Entity, b: Entity, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Entity.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      Entity._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: Entity, b: Entity, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.id,
      b.id,
      dirty?.has("id") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiffValue(
      dirty?.has("position") ?? true,
      () => Position._encodeDiff(a.position, b.position, encoder),
    );
  },
  decode(input: Uint8Array): Entity {
    return Entity._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Entity {
    return {
      id: decoder.nextString(),
      position: Position._decode(decoder),
    };
  },
  decodeDiff(obj: Entity, input: Uint8Array): Entity {
    return Entity._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: Entity, decoder: _.Decoder): Entity {
    return decoder.nextBoolean() ? Entity._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: Entity, decoder: _.Decoder): Entity {
    return {
      id: decoder.nextFieldDiff(obj.id, (x) => decoder.nextStringDiff(x)),
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
  fromJson(obj: object): MoveAction {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid MoveAction: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      x: _.tryParseField(() => _.parseInt(o["x"]), "MoveAction.x"),
      y: _.tryParseField(() => _.parseInt(o["y"]), "MoveAction.y"),
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
    const encoder = _.Encoder.create();
    MoveAction._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: MoveAction, encoder: _.Encoder): void {
    encoder.pushInt(obj.x);
    encoder.pushInt(obj.y);
  },
  encodeDiff(a: MoveAction, b: MoveAction): Uint8Array {
    const encoder = _.Encoder.create();
    MoveAction._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: MoveAction, b: MoveAction, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !MoveAction.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      MoveAction._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: MoveAction, b: MoveAction, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.x,
      b.x,
      dirty?.has("x") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
    encoder.pushFieldDiff(
      a.y,
      b.y,
      dirty?.has("y") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
  },
  decode(input: Uint8Array): MoveAction {
    return MoveAction._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): MoveAction {
    return {
      x: decoder.nextInt(),
      y: decoder.nextInt(),
    };
  },
  decodeDiff(obj: MoveAction, input: Uint8Array): MoveAction {
    return MoveAction._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: MoveAction, decoder: _.Decoder): MoveAction {
    return decoder.nextBoolean() ? MoveAction._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: MoveAction, decoder: _.Decoder): MoveAction {
    return {
      x: decoder.nextFieldDiff(obj.x, (x) => decoder.nextIntDiff(x)),
      y: decoder.nextFieldDiff(obj.y, (x) => decoder.nextIntDiff(x)),
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
  fromJson(obj: object): AttackAction {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid AttackAction: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      targetId: _.tryParseField(() => _.parseString(o["targetId"]), "AttackAction.targetId"),
      damage: _.tryParseField(() => _.parseInt(o["damage"], 0), "AttackAction.damage"),
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
    const encoder = _.Encoder.create();
    AttackAction._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: AttackAction, encoder: _.Encoder): void {
    encoder.pushString(obj.targetId);
    encoder.pushBoundedInt(obj.damage, 0);
  },
  encodeDiff(a: AttackAction, b: AttackAction): Uint8Array {
    const encoder = _.Encoder.create();
    AttackAction._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: AttackAction, b: AttackAction, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !AttackAction.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      AttackAction._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: AttackAction, b: AttackAction, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.targetId,
      b.targetId,
      dirty?.has("targetId") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a.damage,
      b.damage,
      dirty?.has("damage") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
  },
  decode(input: Uint8Array): AttackAction {
    return AttackAction._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): AttackAction {
    return {
      targetId: decoder.nextString(),
      damage: decoder.nextBoundedInt(0),
    };
  },
  decodeDiff(obj: AttackAction, input: Uint8Array): AttackAction {
    return AttackAction._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: AttackAction, decoder: _.Decoder): AttackAction {
    return decoder.nextBoolean() ? AttackAction._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: AttackAction, decoder: _.Decoder): AttackAction {
    return {
      targetId: decoder.nextFieldDiff(obj.targetId, (x) => decoder.nextStringDiff(x)),
      damage: decoder.nextFieldDiff(obj.damage, (x) => decoder.nextBoundedIntDiff(x, 0)),
    };
  },
};

export const UseItemAction = {
  default(): UseItemAction {
    return {
      itemId: "",
    };
  },
  fromJson(obj: object): UseItemAction {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid UseItemAction: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      itemId: _.tryParseField(() => _.parseString(o["itemId"]), "UseItemAction.itemId"),
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
    const encoder = _.Encoder.create();
    UseItemAction._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: UseItemAction, encoder: _.Encoder): void {
    encoder.pushString(obj.itemId);
  },
  encodeDiff(a: UseItemAction, b: UseItemAction): Uint8Array {
    const encoder = _.Encoder.create();
    UseItemAction._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: UseItemAction, b: UseItemAction, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !UseItemAction.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      UseItemAction._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: UseItemAction, b: UseItemAction, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.itemId,
      b.itemId,
      dirty?.has("itemId") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
  },
  decode(input: Uint8Array): UseItemAction {
    return UseItemAction._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): UseItemAction {
    return {
      itemId: decoder.nextString(),
    };
  },
  decodeDiff(obj: UseItemAction, input: Uint8Array): UseItemAction {
    return UseItemAction._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: UseItemAction, decoder: _.Decoder): UseItemAction {
    return decoder.nextBoolean() ? UseItemAction._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: UseItemAction, decoder: _.Decoder): UseItemAction {
    return {
      itemId: decoder.nextFieldDiff(obj.itemId, (x) => decoder.nextStringDiff(x)),
    };
  },
};

export const GameAction = {
  default(): GameAction {
    return { _type: "MoveAction", ...MoveAction.default() };
  },
  values() {
    return ["MoveAction", "AttackAction", "UseItemAction"];
  },
  fromJson(obj: object): GameAction {
    const result = _.parseUnion(obj, ["MoveAction", "AttackAction", "UseItemAction"] as const, {
      MoveAction: (x: unknown) => MoveAction.fromJson(x as MoveAction),
      AttackAction: (x: unknown) => AttackAction.fromJson(x as AttackAction),
      UseItemAction: (x: unknown) => UseItemAction.fromJson(x as UseItemAction)
    });
    return result as GameAction;
  },
  toJson(obj: GameAction): Record<string, unknown> {
    if (obj._type === "MoveAction") {
      return { MoveAction: MoveAction.toJson(obj) };
    }
    else if (obj._type === "AttackAction") {
      return { AttackAction: AttackAction.toJson(obj) };
    }
    else if (obj._type === "UseItemAction") {
      return { UseItemAction: UseItemAction.toJson(obj) };
    }
    throw new Error(`Invalid GameAction: ${obj}`);
  },
  clone(obj: GameAction): GameAction {
    if (obj._type === "MoveAction") {
      return { _type: "MoveAction", ...MoveAction.clone(obj) };
    }
    else if (obj._type === "AttackAction") {
      return { _type: "AttackAction", ...AttackAction.clone(obj) };
    }
    else if (obj._type === "UseItemAction") {
      return { _type: "UseItemAction", ...UseItemAction.clone(obj) };
    }
    throw new Error(`Invalid GameAction: ${obj}`);
  },
  equals(a: GameAction, b: GameAction): boolean {
    if (a._type === "MoveAction" && b._type === "MoveAction") {
      return MoveAction.equals(a, b);
    }
    else if (a._type === "AttackAction" && b._type === "AttackAction") {
      return AttackAction.equals(a, b);
    }
    else if (a._type === "UseItemAction" && b._type === "UseItemAction") {
      return UseItemAction.equals(a, b);
    }
    return false;
  },
  encode(obj: GameAction): Uint8Array {
    const encoder = _.Encoder.create();
    GameAction._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: GameAction, encoder: _.Encoder): void {
    if (obj._type === "MoveAction") {
      encoder.pushEnum(0, 2);
      MoveAction._encode(obj, encoder);
    }
    else if (obj._type === "AttackAction") {
      encoder.pushEnum(1, 2);
      AttackAction._encode(obj, encoder);
    }
    else if (obj._type === "UseItemAction") {
      encoder.pushEnum(2, 2);
      UseItemAction._encode(obj, encoder);
    }
  },
  encodeDiff(a: GameAction, b: GameAction): Uint8Array {
    const encoder = _.Encoder.create();
    GameAction._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: GameAction, b: GameAction, encoder: _.Encoder): void {
    encoder.pushBoolean(a._type === b._type);
    if (b._type === "MoveAction") {
      if (a._type === "MoveAction") {
        MoveAction._encodeDiffFields(a, b, encoder);
      } else {
        encoder.pushEnum(0, 2);
        MoveAction._encode(b, encoder);
      }
    }
    else if (b._type === "AttackAction") {
      if (a._type === "AttackAction") {
        AttackAction._encodeDiffFields(a, b, encoder);
      } else {
        encoder.pushEnum(1, 2);
        AttackAction._encode(b, encoder);
      }
    }
    else if (b._type === "UseItemAction") {
      if (a._type === "UseItemAction") {
        UseItemAction._encodeDiffFields(a, b, encoder);
      } else {
        encoder.pushEnum(2, 2);
        UseItemAction._encode(b, encoder);
      }
    }
  },
  decode(input: Uint8Array): GameAction {
    return GameAction._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): GameAction {
    const type = decoder.nextEnum(2);
    if (type === 0) {
      return { _type: "MoveAction", ...MoveAction._decode(decoder) };
    }
    else if (type === 1) {
      return { _type: "AttackAction", ...AttackAction._decode(decoder) };
    }
    else if (type === 2) {
      return { _type: "UseItemAction", ...UseItemAction._decode(decoder) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(obj: GameAction, input: Uint8Array): GameAction {
    return GameAction._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: GameAction, decoder: _.Decoder): GameAction {
    const isSameType = decoder.nextBoolean();
    if (isSameType) {
      if (obj._type === "MoveAction") {
        return { _type: "MoveAction", ...MoveAction._decodeDiffFields(obj, decoder) };
      }
      else if (obj._type === "AttackAction") {
        return { _type: "AttackAction", ...AttackAction._decodeDiffFields(obj, decoder) };
      }
      else if (obj._type === "UseItemAction") {
        return { _type: "UseItemAction", ...UseItemAction._decodeDiffFields(obj, decoder) };
      }
      throw new Error("Invalid union diff");
    } else {
      const type = decoder.nextEnum(2);
      if (type === 0) {
        return { _type: "MoveAction", ...MoveAction._decode(decoder) };
      }
      else if (type === 1) {
        return { _type: "AttackAction", ...AttackAction._decode(decoder) };
      }
      else if (type === 2) {
        return { _type: "UseItemAction", ...UseItemAction._decode(decoder) };
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
  fromJson(obj: object): GameState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid GameState: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      players: _.tryParseField(() => _.parseArray(o["players"], (x) => Player.fromJson(x as Player)), "GameState.players"),
      currentPlayer: _.tryParseField(() => _.parseOptional(o["currentPlayer"], (x) => _.parseString(x)), "GameState.currentPlayer"),
      round: _.tryParseField(() => _.parseInt(o["round"], 0), "GameState.round"),
      metadata: _.tryParseField(() => _.parseRecord(o["metadata"], (x) => _.parseString(x), (x) => _.parseString(x)), "GameState.metadata"),
      winningColor: _.tryParseField(() => _.parseOptional(o["winningColor"], (x) => _.parseEnum(x, Color)), "GameState.winningColor"),
      lastAction: _.tryParseField(() => _.parseOptional(o["lastAction"], (x) => GameAction.fromJson(x as GameAction)), "GameState.lastAction"),
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
    const encoder = _.Encoder.create();
    GameState._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: GameState, encoder: _.Encoder): void {
    encoder.pushArray(obj.players, (x) => Player._encode(x, encoder));
    encoder.pushOptional(obj.currentPlayer, (x) => encoder.pushString(x));
    encoder.pushBoundedInt(obj.round, 0);
    encoder.pushRecord(obj.metadata, (x) => encoder.pushString(x), (x) => encoder.pushString(x));
    encoder.pushOptional(obj.winningColor, (x) => encoder.pushEnum(Color[x], 2));
    encoder.pushOptional(obj.lastAction, (x) => GameAction._encode(x, encoder));
  },
  encodeDiff(a: GameState, b: GameState): Uint8Array {
    const encoder = _.Encoder.create();
    GameState._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: GameState, b: GameState, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !GameState.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      GameState._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: GameState, b: GameState, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.players,
      b.players,
      dirty?.has("players") ?? true,
      (x, y) => _.equalsArray(x, y, (x, y) => Player.equals(x, y)),
      (x, y) => encoder.pushArrayDiff<Player>(x, y, (x, y) => Player.equals(x, y), (x) => Player._encode(x, encoder), (x, y) => Player._encodeDiffFields(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a.currentPlayer,
      b.currentPlayer,
      dirty?.has("currentPlayer") ?? true,
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<string>(x, y, (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
    encoder.pushFieldDiff(
      a.round,
      b.round,
      dirty?.has("round") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a.metadata,
      b.metadata,
      dirty?.has("metadata") ?? true,
      (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => x === y),
      (x, y) => encoder.pushRecordDiff<string, string>(x, y, (x, y) => x === y, (x) => encoder.pushString(x), (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
    encoder.pushFieldDiff(
      a.winningColor,
      b.winningColor,
      dirty?.has("winningColor") ?? true,
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<Color>(x, y, (x) => encoder.pushEnum(Color[x], 2), (x, y) => encoder.pushEnumDiff(Color[x], Color[y], 2)),
    );
    encoder.pushFieldDiff(
      a.lastAction,
      b.lastAction,
      dirty?.has("lastAction") ?? true,
      (x, y) => _.equalsOptional(x, y, (x, y) => GameAction.equals(x, y)),
      (x, y) => encoder.pushOptionalDiff<GameAction>(x, y, (x) => GameAction._encode(x, encoder), (x, y) => GameAction._encodeDiff(x, y, encoder)),
    );
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): GameState {
    return {
      players: decoder.nextArray(() => Player._decode(decoder)),
      currentPlayer: decoder.nextOptional(() => decoder.nextString()),
      round: decoder.nextBoundedInt(0),
      metadata: decoder.nextRecord(() => decoder.nextString(), () => decoder.nextString()),
      winningColor: decoder.nextOptional(() => (Color as any)[decoder.nextEnum(2)]),
      lastAction: decoder.nextOptional(() => GameAction._decode(decoder)),
    };
  },
  decodeDiff(obj: GameState, input: Uint8Array): GameState {
    return GameState._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: GameState, decoder: _.Decoder): GameState {
    return decoder.nextBoolean() ? GameState._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: GameState, decoder: _.Decoder): GameState {
    return {
      players: decoder.nextFieldDiff(obj.players, (x) => decoder.nextArrayDiff<Player>(x, () => Player._decode(decoder), (x) => Player._decodeDiffFields(x, decoder))),
      currentPlayer: decoder.nextFieldDiff(obj.currentPlayer, (x) => decoder.nextOptionalDiff<string>(x, () => decoder.nextString(), (x) => decoder.nextStringDiff(x))),
      round: decoder.nextFieldDiff(obj.round, (x) => decoder.nextBoundedIntDiff(x, 0)),
      metadata: decoder.nextFieldDiff(obj.metadata, (x) => decoder.nextRecordDiff<string, string>(x, () => decoder.nextString(), () => decoder.nextString(), (x) => decoder.nextStringDiff(x))),
      winningColor: decoder.nextFieldDiff(obj.winningColor, (x) => decoder.nextOptionalDiff<Color>(x, () => (Color as any)[decoder.nextEnum(2)], (x) => (Color as any)[decoder.nextEnumDiff((Color as any)[x], 2)])),
      lastAction: decoder.nextFieldDiff(obj.lastAction, (x) => decoder.nextOptionalDiff<GameAction>(x, () => GameAction._decode(decoder), (x) => GameAction._decodeDiff(x, decoder))),
    };
  },
};

export const Inventory = {
  default(): Inventory {
    return {
      items: undefined,
    };
  },
  fromJson(obj: object): Inventory {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Inventory: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      items: _.tryParseField(() => _.parseOptional(o["items"], (x) => _.parseArray(x, (x) => _.parseRecord(x, (x) => _.parseString(x), (x) => _.parseInt(x)))), "Inventory.items"),
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
    const encoder = _.Encoder.create();
    Inventory._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Inventory, encoder: _.Encoder): void {
    encoder.pushOptional(obj.items, (x) => encoder.pushArray(x, (x) => encoder.pushRecord(x, (x) => encoder.pushString(x), (x) => encoder.pushInt(x))));
  },
  encodeDiff(a: Inventory, b: Inventory): Uint8Array {
    const encoder = _.Encoder.create();
    Inventory._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Inventory, b: Inventory, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Inventory.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      Inventory._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: Inventory, b: Inventory, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.items,
      b.items,
      dirty?.has("items") ?? true,
      (x, y) => _.equalsOptional(x, y, (x, y) => _.equalsArray(x, y, (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => x === y))),
      (x, y) => encoder.pushOptionalDiff<(Map<string, number> & { _dirty?: Set<string> })[] & { _dirty?: Set<number> }>(x, y, (x) => encoder.pushArray(x, (x) => encoder.pushRecord(x, (x) => encoder.pushString(x), (x) => encoder.pushInt(x))), (x, y) => encoder.pushArrayDiff<Map<string, number> & { _dirty?: Set<string> }>(x, y, (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => x === y), (x) => encoder.pushRecord(x, (x) => encoder.pushString(x), (x) => encoder.pushInt(x)), (x, y) => encoder.pushRecordDiff<string, number>(x, y, (x, y) => x === y, (x) => encoder.pushString(x), (x) => encoder.pushInt(x), (x, y) => encoder.pushIntDiff(x, y)))),
    );
  },
  decode(input: Uint8Array): Inventory {
    return Inventory._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Inventory {
    return {
      items: decoder.nextOptional(() => decoder.nextArray(() => decoder.nextRecord(() => decoder.nextString(), () => decoder.nextInt()))),
    };
  },
  decodeDiff(obj: Inventory, input: Uint8Array): Inventory {
    return Inventory._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: Inventory, decoder: _.Decoder): Inventory {
    return decoder.nextBoolean() ? Inventory._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: Inventory, decoder: _.Decoder): Inventory {
    return {
      items: decoder.nextFieldDiff(obj.items, (x) => decoder.nextOptionalDiff<(Map<string, number> & { _dirty?: Set<string> })[] & { _dirty?: Set<number> }>(x, () => decoder.nextArray(() => decoder.nextRecord(() => decoder.nextString(), () => decoder.nextInt())), (x) => decoder.nextArrayDiff<Map<string, number> & { _dirty?: Set<string> }>(x, () => decoder.nextRecord(() => decoder.nextString(), () => decoder.nextInt()), (x) => decoder.nextRecordDiff<string, number>(x, () => decoder.nextString(), () => decoder.nextInt(), (x) => decoder.nextIntDiff(x))))),
    };
  },
};

export const PlayerRegistry = {
  default(): PlayerRegistry {
    return {
      players: new Map(),
    };
  },
  fromJson(obj: object): PlayerRegistry {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid PlayerRegistry: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      players: _.tryParseField(() => _.parseRecord(o["players"], (x) => _.parseString(x), (x) => Player.fromJson(x as Player)), "PlayerRegistry.players"),
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
    const encoder = _.Encoder.create();
    PlayerRegistry._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: PlayerRegistry, encoder: _.Encoder): void {
    encoder.pushRecord(obj.players, (x) => encoder.pushString(x), (x) => Player._encode(x, encoder));
  },
  encodeDiff(a: PlayerRegistry, b: PlayerRegistry): Uint8Array {
    const encoder = _.Encoder.create();
    PlayerRegistry._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: PlayerRegistry, b: PlayerRegistry, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !PlayerRegistry.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      PlayerRegistry._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: PlayerRegistry, b: PlayerRegistry, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.players,
      b.players,
      dirty?.has("players") ?? true,
      (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => Player.equals(x, y)),
      (x, y) => encoder.pushRecordDiff<string, Player>(x, y, (x, y) => Player.equals(x, y), (x) => encoder.pushString(x), (x) => Player._encode(x, encoder), (x, y) => Player._encodeDiffFields(x, y, encoder)),
    );
  },
  decode(input: Uint8Array): PlayerRegistry {
    return PlayerRegistry._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): PlayerRegistry {
    return {
      players: decoder.nextRecord(() => decoder.nextString(), () => Player._decode(decoder)),
    };
  },
  decodeDiff(obj: PlayerRegistry, input: Uint8Array): PlayerRegistry {
    return PlayerRegistry._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: PlayerRegistry, decoder: _.Decoder): PlayerRegistry {
    return decoder.nextBoolean() ? PlayerRegistry._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: PlayerRegistry, decoder: _.Decoder): PlayerRegistry {
    return {
      players: decoder.nextFieldDiff(obj.players, (x) => decoder.nextRecordDiff<string, Player>(x, () => decoder.nextString(), () => Player._decode(decoder), (x) => Player._decodeDiffFields(x, decoder))),
    };
  },
};
