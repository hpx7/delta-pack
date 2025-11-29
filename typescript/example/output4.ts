import * as _ from "@hathora/delta-pack/helpers";

export type Position = {
  x: number;
  y: number;
};
export type Weapon = {
  name: string;
  damage: number;
};
export type Player = {
  position: Position;
  health: number;
  weapon?: Weapon;
  stealth: boolean;
};
export type GameState = {
  timeRemaining: number;
  players: Map<number, Player>;
};


export const Position = {
  default(): Position {
    return {
      x: 0.0,
      y: 0.0,
    };
  },
  parse(obj: Position): Position {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Position: ${obj}`);
    }
    return {
      x: _.parseFloat(obj.x),
      y: _.parseFloat(obj.y),
    };
  },
  equals(a: Position, b: Position): boolean {
    return (
      Math.abs(a.x - b.x) < 0.00001 &&
      Math.abs(a.y - b.y) < 0.00001
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
  },
  decode(input: Uint8Array): Position {
    return Position._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Position {
    return {
      x: tracker.nextFloat(),
      y: tracker.nextFloat(),
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
    };
  },
};

export const Weapon = {
  default(): Weapon {
    return {
      name: "",
      damage: 0,
    };
  },
  parse(obj: Weapon): Weapon {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Weapon: ${obj}`);
    }
    return {
      name: _.parseString(obj.name),
      damage: _.parseInt(obj.damage),
    };
  },
  equals(a: Weapon, b: Weapon): boolean {
    return (
      a.name === b.name &&
      a.damage === b.damage
    );
  },
  encode(obj: Weapon): Uint8Array {
    const tracker = new _.Tracker();
    Weapon._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Weapon, tracker: _.Tracker): void {
    tracker.pushString(obj.name);
    tracker.pushInt(obj.damage);
  },
  encodeDiff(a: Weapon, b: Weapon): Uint8Array {
    const tracker = new _.Tracker();
    Weapon._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Weapon, b: Weapon, tracker: _.Tracker): void {
    const changed = !Weapon.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.name, b.name);
    tracker.pushIntDiff(a.damage, b.damage);
  },
  decode(input: Uint8Array): Weapon {
    return Weapon._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Weapon {
    return {
      name: tracker.nextString(),
      damage: tracker.nextInt(),
    };
  },
  decodeDiff(obj: Weapon, input: Uint8Array): Weapon {
    const tracker = _.Tracker.parse(input);
    return Weapon._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Weapon, tracker: _.Tracker): Weapon {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      name: tracker.nextStringDiff(obj.name),
      damage: tracker.nextIntDiff(obj.damage),
    };
  },
};

export const Player = {
  default(): Player {
    return {
      position: Position.default(),
      health: 0,
      weapon: undefined,
      stealth: false,
    };
  },
  parse(obj: Player): Player {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Player: ${obj}`);
    }
    return {
      position: Position.parse(obj.position as Position),
      health: _.parseInt(obj.health),
      weapon: _.parseOptional(obj.weapon, (x) => Weapon.parse(x as Weapon)),
      stealth: _.parseBoolean(obj.stealth),
    };
  },
  equals(a: Player, b: Player): boolean {
    return (
      Position.equals(a.position, b.position) &&
      a.health === b.health &&
      _.equalsOptional(a.weapon, b.weapon, (x, y) => Weapon.equals(x, y)) &&
      a.stealth === b.stealth
    );
  },
  encode(obj: Player): Uint8Array {
    const tracker = new _.Tracker();
    Player._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Player, tracker: _.Tracker): void {
    Position._encode(obj.position, tracker);
    tracker.pushInt(obj.health);
    tracker.pushOptional(obj.weapon, (x) => Weapon._encode(x, tracker));
    tracker.pushBoolean(obj.stealth);
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
    Position._encodeDiff(a.position, b.position, tracker);
    tracker.pushIntDiff(a.health, b.health);
    tracker.pushOptionalDiff<Weapon>(
      a.weapon,
      b.weapon,
      (x) => Weapon._encode(x, tracker),
      (x, y) => Weapon._encodeDiff(x, y, tracker)
    );
    tracker.pushBooleanDiff(a.stealth, b.stealth);
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Player {
    return {
      position: Position._decode(tracker),
      health: tracker.nextInt(),
      weapon: tracker.nextOptional(() => Weapon._decode(tracker)),
      stealth: tracker.nextBoolean(),
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
      position: Position._decodeDiff(obj.position, tracker),
      health: tracker.nextIntDiff(obj.health),
      weapon: tracker.nextOptionalDiff<Weapon>(
        obj.weapon,
        () => Weapon._decode(tracker),
        (x) => Weapon._decodeDiff(x, tracker)
      ),
      stealth: tracker.nextBooleanDiff(obj.stealth),
    };
  },
};

export const GameState = {
  default(): GameState {
    return {
      timeRemaining: 0,
      players: new Map(),
    };
  },
  parse(obj: GameState): GameState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid GameState: ${obj}`);
    }
    return {
      timeRemaining: _.parseInt(obj.timeRemaining),
      players: _.parseRecord(obj.players, (x) => _.parseInt(x), (x) => Player.parse(x as Player)),
    };
  },
  equals(a: GameState, b: GameState): boolean {
    return (
      a.timeRemaining === b.timeRemaining &&
      _.equalsRecord(a.players, b.players, (x, y) => x === y, (x, y) => Player.equals(x, y))
    );
  },
  encode(obj: GameState): Uint8Array {
    const tracker = new _.Tracker();
    GameState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: GameState, tracker: _.Tracker): void {
    tracker.pushInt(obj.timeRemaining);
    tracker.pushRecord(obj.players, (x) => tracker.pushInt(x), (x) => Player._encode(x, tracker));
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
    tracker.pushIntDiff(a.timeRemaining, b.timeRemaining);
    tracker.pushRecordDiff<number, Player>(
      a.players,
      b.players,
      (x, y) => Player.equals(x, y),
      (x) => tracker.pushInt(x),
      (x) => Player._encode(x, tracker),
      (x, y) => Player._encodeDiff(x, y, tracker)
    );
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): GameState {
    return {
      timeRemaining: tracker.nextInt(),
      players: tracker.nextRecord(() => tracker.nextInt(), () => Player._decode(tracker)),
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
      timeRemaining: tracker.nextIntDiff(obj.timeRemaining),
      players: tracker.nextRecordDiff<number, Player>(
        obj.players,
        () => tracker.nextInt(),
        () => Player._decode(tracker),
        (x) => Player._decodeDiff(x, tracker)
      ),
    };
  },
};
