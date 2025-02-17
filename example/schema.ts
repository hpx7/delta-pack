import {
  ArrayType,
  EnumType,
  IntType,
  ObjectType,
  OptionalType,
  ReferenceType,
  StringType,
  UnionType,
  codegenTypescript,
} from "../generator";

const UserId = StringType();

const Color = EnumType(["RED", "BLUE", "GREEN", "YELLOW"]);

const Card = ObjectType({
  value: IntType(),
  color: ReferenceType("Color"),
});

const Player = ObjectType({
  id: ReferenceType("UserId"),
  numCards: IntType(),
});

const PlayerState = ObjectType({
  hand: ArrayType(ReferenceType("Card")),
  players: ArrayType(ReferenceType("Player")),
  turn: OptionalType(ReferenceType("UserId")),
  pile: OptionalType(ReferenceType("Card")),
  winner: OptionalType(ReferenceType("UserId")),
  intArray: ArrayType(IntType()),
  intOptional: OptionalType(IntType()),
});

const UnionTest = UnionType([ReferenceType("UserId"), ReferenceType("Color"), ReferenceType("Card")]);

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
