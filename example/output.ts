import * as _ from "../helpers.ts";

export type UserId = string;

export type Color = "RED" | "BLUE" | "GREEN" | "YELLOW";
    
export type Card = {
  value: number;
  color: Color;
};
export type Player = {
  id: UserId;
  numCards: number;
};
export type PlayerState = {
  hand: Card[];
  players: Player[];
  turn?: UserId;
  pile?: Card;
  winner?: UserId;
  intArray: number[];
  intOptional?: number;
  union: UnionTest;
};
export type UnionTest = { type: "UserId"; val: UserId } | { type: "Color"; val: Color } | { type: "Card"; val: Card };



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

export const Card = {
  default(): Card {
    return {
      value: 0,
      color: "RED",
    };
  },
  validate(obj: Card) {
    if (typeof obj !== "object") {
      return [`Invalid Card object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.value), `Invalid int: ${obj.value}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Card.value");
    }
    validationErrors = _.validatePrimitive(obj.color in Color, `Invalid Color: ${obj.color}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Card.color");
    }

    return validationErrors;
  },
  equals(a: Card, b: Card): boolean {
    return (
      a.value === b.value &&
      a.color === b.color
    );
  },
  encode(obj: Card): Uint8Array {
    const tracker = new _.Tracker();
    Card._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Card, tracker: _.Tracker): void {
    tracker.pushInt(obj.value);
    tracker.pushUInt(Color[obj.color]);
  },
  encodeDiff(a: Card, b: Card): Uint8Array {
    const tracker = new _.Tracker();
    Card._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Card, b: Card, tracker: _.Tracker): void {
    const changed = !Card.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushIntDiff(a.value, b.value);
    tracker.pushUIntDiff(Color[a.color], Color[b.color]);
  },
  decode(input: Uint8Array): Card {
    return Card._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Card {
    return {
      value: tracker.nextInt(),
      color: Color[tracker.nextUInt()],
    };
  },
  decodeDiff(obj: Card, input: Uint8Array): Card {
    const tracker = _.Tracker.parse(input);
    return Card._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Card, tracker: _.Tracker): Card {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      value: tracker.nextIntDiff(obj.value),
      color: Color[tracker.nextUIntDiff(Color[obj.color])],
    };
  },
};

export const Player = {
  default(): Player {
    return {
      id: "",
      numCards: 0,
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
    validationErrors = _.validatePrimitive(Number.isInteger(obj.numCards), `Invalid int: ${obj.numCards}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.numCards");
    }

    return validationErrors;
  },
  equals(a: Player, b: Player): boolean {
    return (
      a.id === b.id &&
      a.numCards === b.numCards
    );
  },
  encode(obj: Player): Uint8Array {
    const tracker = new _.Tracker();
    Player._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Player, tracker: _.Tracker): void {
    tracker.pushString(obj.id);
    tracker.pushInt(obj.numCards);
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
    tracker.pushIntDiff(a.numCards, b.numCards);
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Player {
    return {
      id: tracker.nextString(),
      numCards: tracker.nextInt(),
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
      numCards: tracker.nextIntDiff(obj.numCards),
    };
  },
};

export const PlayerState = {
  default(): PlayerState {
    return {
      hand: [],
      players: [],
      turn: undefined,
      pile: undefined,
      winner: undefined,
      intArray: [],
      intOptional: undefined,
      union: UnionTest.default(),
    };
  },
  validate(obj: PlayerState) {
    if (typeof obj !== "object") {
      return [`Invalid PlayerState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateArray(obj.hand, (x) => Card.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.hand");
    }
    validationErrors = _.validateArray(obj.players, (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.players");
    }
    validationErrors = _.validateOptional(obj.turn, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.turn");
    }
    validationErrors = _.validateOptional(obj.pile, (x) => Card.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.pile");
    }
    validationErrors = _.validateOptional(obj.winner, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.winner");
    }
    validationErrors = _.validateArray(obj.intArray, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.intArray");
    }
    validationErrors = _.validateOptional(obj.intOptional, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.intOptional");
    }
    validationErrors = UnionTest.validate(obj.union);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.union");
    }

    return validationErrors;
  },
  equals(a: PlayerState, b: PlayerState): boolean {
    return (
      _.equalsArray(a.hand, b.hand, (x, y) => Card.equals(x, y)) &&
      _.equalsArray(a.players, b.players, (x, y) => Player.equals(x, y)) &&
      _.equalsOptional(a.turn, b.turn, (x, y) => x === y) &&
      _.equalsOptional(a.pile, b.pile, (x, y) => Card.equals(x, y)) &&
      _.equalsOptional(a.winner, b.winner, (x, y) => x === y) &&
      _.equalsArray(a.intArray, b.intArray, (x, y) => x === y) &&
      _.equalsOptional(a.intOptional, b.intOptional, (x, y) => x === y) &&
      UnionTest.equals(a.union, b.union)
    );
  },
  encode(obj: PlayerState): Uint8Array {
    const tracker = new _.Tracker();
    PlayerState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: PlayerState, tracker: _.Tracker): void {
    tracker.pushArray(obj.hand, (x) => Card._encode(x, tracker));
    tracker.pushArray(obj.players, (x) => Player._encode(x, tracker));
    tracker.pushOptional(obj.turn, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.pile, (x) => Card._encode(x, tracker));
    tracker.pushOptional(obj.winner, (x) => tracker.pushString(x));
    tracker.pushArray(obj.intArray, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.intOptional, (x) => tracker.pushInt(x));
    UnionTest._encode(obj.union, tracker);
  },
  encodeDiff(a: PlayerState, b: PlayerState): Uint8Array {
    const tracker = new _.Tracker();
    PlayerState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: PlayerState, b: PlayerState, tracker: _.Tracker): void {
    const changed = !PlayerState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushArrayDiff<Card>(
      a.hand,
      b.hand,
      (x, y) => Card.equals(x, y),
      (x) => Card._encode(x, tracker),
      (x, y) => Card._encodeDiff(x, y, tracker)
    );
    tracker.pushArrayDiff<Player>(
      a.players,
      b.players,
      (x, y) => Player.equals(x, y),
      (x) => Player._encode(x, tracker),
      (x, y) => Player._encodeDiff(x, y, tracker)
    );
    tracker.pushOptionalDiffPrimitive<UserId>(
      a.turn,
      b.turn,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiff<Card>(
      a.pile,
      b.pile,
      (x) => Card._encode(x, tracker),
      (x, y) => Card._encodeDiff(x, y, tracker)
    );
    tracker.pushOptionalDiffPrimitive<UserId>(
      a.winner,
      b.winner,
      (x) => tracker.pushString(x)
    );
    tracker.pushArrayDiff<number>(
      a.intArray,
      b.intArray,
      (x, y) => x === y,
      (x) => tracker.pushInt(x),
      (x, y) => tracker.pushIntDiff(x, y)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.intOptional,
      b.intOptional,
      (x) => tracker.pushInt(x)
    );
    UnionTest._encodeDiff(a.union, b.union, tracker);
  },
  decode(input: Uint8Array): PlayerState {
    return PlayerState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): PlayerState {
    return {
      hand: tracker.nextArray(() => Card._decode(tracker)),
      players: tracker.nextArray(() => Player._decode(tracker)),
      turn: tracker.nextOptional(() => tracker.nextString()),
      pile: tracker.nextOptional(() => Card._decode(tracker)),
      winner: tracker.nextOptional(() => tracker.nextString()),
      intArray: tracker.nextArray(() => tracker.nextInt()),
      intOptional: tracker.nextOptional(() => tracker.nextInt()),
      union: UnionTest._decode(tracker),
    };
  },
  decodeDiff(obj: PlayerState, input: Uint8Array): PlayerState {
    const tracker = _.Tracker.parse(input);
    return PlayerState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: PlayerState, tracker: _.Tracker): PlayerState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      hand: tracker.nextArrayDiff<Card>(
        obj.hand,
        () => Card._decode(tracker),
        (x) => Card._decodeDiff(x, tracker)
      ),
      players: tracker.nextArrayDiff<Player>(
        obj.players,
        () => Player._decode(tracker),
        (x) => Player._decodeDiff(x, tracker)
      ),
      turn: tracker.nextOptionalDiffPrimitive<UserId>(
        obj.turn,
        () => tracker.nextString()
      ),
      pile: tracker.nextOptionalDiff<Card>(
        obj.pile,
        () => Card._decode(tracker),
        (x) => Card._decodeDiff(x, tracker)
      ),
      winner: tracker.nextOptionalDiffPrimitive<UserId>(
        obj.winner,
        () => tracker.nextString()
      ),
      intArray: tracker.nextArrayDiff<number>(
        obj.intArray,
        () => tracker.nextInt(),
        (x) => tracker.nextIntDiff(x)
      ),
      intOptional: tracker.nextOptionalDiffPrimitive<number>(
        obj.intOptional,
        () => tracker.nextInt()
      ),
      union: UnionTest._decodeDiff(obj.union, tracker),
    };
  },
};

export const UnionTest = {
  default(): UnionTest {
    return {
      type: "UserId",
      val: "",
    };
  },
  values() {
    return ["UserId", "Color", "Card"];
  },
  validate(obj: UnionTest) {
    if (obj.type === "UserId") {
      const validationErrors = _.validatePrimitive(typeof obj.val === "string", `Invalid string: ${obj.val}`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: UnionTest");
      }
      return validationErrors;
    }
    else if (obj.type === "Color") {
      const validationErrors = _.validatePrimitive(obj.val in Color, `Invalid Color: ${obj.val}`);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: UnionTest");
      }
      return validationErrors;
    }
    else if (obj.type === "Card") {
      const validationErrors = Card.validate(obj.val);
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: UnionTest");
      }
      return validationErrors;
    }
    else {
      return [`Invalid UnionTest union: ${obj}`];
    }
  },
  equals(a: UnionTest, b: UnionTest): boolean {
    if (a.type === "UserId" && b.type === "UserId") {
      return a.val === b.val;
    }
    else if (a.type === "Color" && b.type === "Color") {
      return a.val === b.val;
    }
    else if (a.type === "Card" && b.type === "Card") {
      return Card.equals(a.val, b.val);
    }
    return false;
  },
  encode(obj: UnionTest): Uint8Array {
    const tracker = new _.Tracker();
    UnionTest._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: UnionTest, tracker: _.Tracker): void {
    if (obj.type === "UserId") {
      tracker.pushUInt(0);
      tracker.pushString(obj.val);
    }
    else if (obj.type === "Color") {
      tracker.pushUInt(1);
      tracker.pushUInt(Color[obj.val]);
    }
    else if (obj.type === "Card") {
      tracker.pushUInt(2);
      Card._encode(obj.val, tracker);
    }
  },
  encodeDiff(a: UnionTest, b: UnionTest): Uint8Array {
    const tracker = new _.Tracker();
    UnionTest._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: UnionTest, b: UnionTest, tracker: _.Tracker): void {
    if (b.type === "UserId") {
      tracker.pushBoolean(a.type === "UserId");
      if (a.type === "UserId") {
        tracker.pushStringDiff(a.val, b.val);
      } else {
        tracker.pushUInt(0);
        tracker.pushString(b.val);
      }
    }
    else if (b.type === "Color") {
      tracker.pushBoolean(a.type === "Color");
      if (a.type === "Color") {
        tracker.pushUIntDiff(Color[a.val], Color[b.val]);
      } else {
        tracker.pushUInt(1);
        tracker.pushUInt(Color[b.val]);
      }
    }
    else if (b.type === "Card") {
      tracker.pushBoolean(a.type === "Card");
      if (a.type === "Card") {
        Card._encodeDiff(a.val, b.val, tracker);
      } else {
        tracker.pushUInt(2);
        Card._encode(b.val, tracker);
      }
    }
  },
  decode(input: Uint8Array): UnionTest {
    return UnionTest._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): UnionTest {
    const type = tracker.nextUInt();
    if (type === 0) {
      return { type: "UserId", val: tracker.nextString() };
    }
    else if (type === 1) {
      return { type: "Color", val: Color[tracker.nextUInt()] };
    }
    else if (type === 2) {
      return { type: "Card", val: Card._decode(tracker) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(obj: UnionTest, input: Uint8Array): UnionTest {
    const tracker = _.Tracker.parse(input);
    return UnionTest._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: UnionTest, tracker: _.Tracker): UnionTest {
    const isSameType = tracker.nextBoolean();
    if (isSameType) {
      if (obj.type === "UserId") {
        return {
          type: "UserId",
          val: tracker.nextStringDiff(obj.val),
        };
      }
      else if (obj.type === "Color") {
        return {
          type: "Color",
          val: Color[tracker.nextUIntDiff(Color[obj.val])],
        };
      }
      else if (obj.type === "Card") {
        return {
          type: "Card",
          val: Card._decodeDiff(obj.val, tracker),
        };
      }
      throw new Error("Invalid union diff");
    } else {
      const type = tracker.nextUInt();
      if (type === 0) {
        return { type: "UserId", val: tracker.nextString() };
      }
      else if (type === 1) {
        return { type: "Color", val: Color[tracker.nextUInt()] };
      }
      else if (type === 2) {
        return { type: "Card", val: Card._decode(tracker) };
      }
      throw new Error("Invalid union diff");
    }
  }
}
