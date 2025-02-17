import {
  ArrayType,
  EnumType,
  IntType,
  ObjectType,
  OptionalType,
  StringType,
  UnionType,
  codegenTypescript,
} from "../generator";

const UserId = StringType();

const Color = EnumType(["RED", "BLUE", "GREEN", "YELLOW"]);

const Card = ObjectType({
  value: IntType(),
  color: "Color",
});

const Player = ObjectType({
  id: "UserId",
  numCards: IntType(),
});

const PlayerState = ObjectType({
  hand: ArrayType("Card"),
  players: ArrayType("Player"),
  turn: OptionalType("UserId"),
  pile: OptionalType("Card"),
  winner: OptionalType("UserId"),
  intArray: ArrayType(IntType()),
  intOptional: OptionalType(IntType()),
});

const UnionTest = UnionType(["UserId", "Color", "Card"]);

console.log(
  codegenTypescript({
    UserId,
    Color,
    Card,
    Player,
    PlayerState,
    UnionTest,
  }),
);
