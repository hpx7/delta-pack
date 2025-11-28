import * as _ from "@hathora/delta-pack/helpers";


export type Color = "RED" | "BLUE" | "GREEN" | "YELLOW";
    
export type Player = {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
};
export type Position = {
  x: number;
  y: number;
};
export type MoveAction = {
  x: number;
  y: number;
};
export type AttackAction = {
  targetId: string;
  damage: number;
};
export type UseItemAction = {
  itemId: string;
};
export type GameAction = { type: "MoveAction"; val: MoveAction } | { type: "AttackAction"; val: AttackAction } | { type: "UseItemAction"; val: UseItemAction };
export type GameState = {
  players: Player[];
  currentPlayer?: string;
  round: number;
  metadata: Map<string, string>;
  winningColor?: Color;
  lastAction?: GameAction;
};


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
    };
  },
  validate(obj: Player) {
    if (typeof obj !== "object") {
      return [`Invalid Player object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.id === "string", `Invalid string: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.id");
    }
    validationErrors = _.validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.name");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.score), `Invalid int: ${obj.score}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.score");
    }
    validationErrors = _.validatePrimitive(typeof obj.isActive === "boolean", `Invalid boolean: ${obj.isActive}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isActive");
    }

    return validationErrors;
  },
  equals(a: Player, b: Player): boolean {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.score === b.score &&
      a.isActive === b.isActive
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
  },
  encodeDiff(a: Player, b: Player): Uint8Array {
    const tracker = new _.Tracker();
    Player._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Player, b: Player, tracker: _.Tracker): void {
    const changed = !Player.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.id, b.id);
    tracker.pushStringDiff(a.name, b.name);
    tracker.pushIntDiff(a.score, b.score);
    tracker.pushBooleanDiff(a.isActive, b.isActive);
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

    return validationErrors;
  },
  equals(a: Position, b: Position): boolean {
    return (
      Math.round(a.x / 0.1) === Math.round(b.x / 0.1) &&
      Math.round(a.y / 0.1) === Math.round(b.y / 0.1)
    );
  },
  encode(obj: Position): Uint8Array {
    const tracker = new _.Tracker();
    Position._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Position, tracker: _.Tracker): void {
    tracker.pushInt(Math.round(obj.x / 0.1));
    tracker.pushInt(Math.round(obj.y / 0.1));
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
    tracker.pushIntDiff(Math.round(a.x / 0.1), Math.round(b.x / 0.1));
    tracker.pushIntDiff(Math.round(a.y / 0.1), Math.round(b.y / 0.1));
  },
  decode(input: Uint8Array): Position {
    return Position._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Position {
    return {
      x: tracker.nextInt() * 0.1,
      y: tracker.nextInt() * 0.1,
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
      x: tracker.nextIntDiff(Math.round(obj.x / 0.1)) * 0.1,
      y: tracker.nextIntDiff(Math.round(obj.y / 0.1)) * 0.1,
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
  validate(obj: MoveAction) {
    if (typeof obj !== "object") {
      return [`Invalid MoveAction object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: MoveAction.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: MoveAction.y");
    }

    return validationErrors;
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
    const changed = !MoveAction.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushIntDiff(a.x, b.x);
    tracker.pushIntDiff(a.y, b.y);
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
  validate(obj: AttackAction) {
    if (typeof obj !== "object") {
      return [`Invalid AttackAction object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.targetId === "string", `Invalid string: ${obj.targetId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: AttackAction.targetId");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.damage) && obj.damage >= 0, `Invalid uint: ${obj.damage}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: AttackAction.damage");
    }

    return validationErrors;
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
    const changed = !AttackAction.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.targetId, b.targetId);
    tracker.pushUIntDiff(a.damage, b.damage);
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
  validate(obj: UseItemAction) {
    if (typeof obj !== "object") {
      return [`Invalid UseItemAction object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.itemId === "string", `Invalid string: ${obj.itemId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: UseItemAction.itemId");
    }

    return validationErrors;
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
    const changed = !UseItemAction.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.itemId, b.itemId);
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
  validate(obj: GameAction) {
    if (obj.type === "MoveAction") {
      const validationErrors = MoveAction.validate(obj.val);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: GameAction");
      }
      return validationErrors;
    }
    else if (obj.type === "AttackAction") {
      const validationErrors = AttackAction.validate(obj.val);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: GameAction");
      }
      return validationErrors;
    }
    else if (obj.type === "UseItemAction") {
      const validationErrors = UseItemAction.validate(obj.val);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: GameAction");
      }
      return validationErrors;
    }
    else {
      return [`Invalid GameAction union: ${obj}`];
    }
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
    if (b.type === "MoveAction") {
      tracker.pushBoolean(a.type === "MoveAction");
      if (a.type === "MoveAction") {
        MoveAction._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(0);
        MoveAction._encode(b.val, tracker);
      }
    }
    else if (b.type === "AttackAction") {
      tracker.pushBoolean(a.type === "AttackAction");
      if (a.type === "AttackAction") {
        AttackAction._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(1);
        AttackAction._encode(b.val, tracker);
      }
    }
    else if (b.type === "UseItemAction") {
      tracker.pushBoolean(a.type === "UseItemAction");
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
        return { type: "MoveAction", val: MoveAction._decode(tracker) };
      }
      else if (type === 1) {
        return { type: "AttackAction", val: AttackAction._decode(tracker) };
      }
      else if (type === 2) {
        return { type: "UseItemAction", val: UseItemAction._decode(tracker) };
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
  validate(obj: GameState) {
    if (typeof obj !== "object") {
      return [`Invalid GameState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateArray(obj.players, (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.players");
    }
    validationErrors = _.validateOptional(obj.currentPlayer, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.currentPlayer");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.round) && obj.round >= 0, `Invalid uint: ${obj.round}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.round");
    }
    validationErrors = _.validateRecord(obj.metadata, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`), (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.metadata");
    }
    validationErrors = _.validateOptional(obj.winningColor, (x) => _.validatePrimitive(x in Color, `Invalid Color: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.winningColor");
    }
    validationErrors = _.validateOptional(obj.lastAction, (x) => GameAction.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.lastAction");
    }

    return validationErrors;
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
    const changed = !GameState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushArrayDiff<Player>(
      a.players,
      b.players,
      (x, y) => Player.equals(x, y),
      (x) => Player._encode(x, tracker),
      (x, y) => Player._encodeDiff(x, y, tracker)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.currentPlayer,
      b.currentPlayer,
      (x) => tracker.pushString(x)
    );
    tracker.pushUIntDiff(a.round, b.round);
    tracker.pushRecordDiff<string, string>(
      a.metadata,
      b.metadata,
      (x, y) => x === y,
      (x) => tracker.pushString(x),
      (x) => tracker.pushString(x),
      (x, y) => tracker.pushStringDiff(x, y)
    );
    tracker.pushOptionalDiffPrimitive<Color>(
      a.winningColor,
      b.winningColor,
      (x) => tracker.pushUInt(Color[x])
    );
    tracker.pushOptionalDiff<GameAction>(
      a.lastAction,
      b.lastAction,
      (x) => GameAction._encode(x, tracker),
      (x, y) => GameAction._encodeDiff(x, y, tracker)
    );
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
      winningColor: tracker.nextOptional(() => Color[tracker.nextUInt()]),
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
        () => Color[tracker.nextUInt()]
      ),
      lastAction: tracker.nextOptionalDiff<GameAction>(
        obj.lastAction,
        () => GameAction._decode(tracker),
        (x) => GameAction._decodeDiff(x, tracker)
      ),
    };
  },
};