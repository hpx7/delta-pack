import {
  ChildType,
  EnumType,
  IntType,
  ObjectType,
  ReferenceType,
  StringType,
  UnionType,
  codegenTypescript,
} from "../generator";

const UserId = StringType();

const Color = EnumType([
  { label: "RED", value: 0 },
  { label: "BLUE", value: 1 },
  { label: "GREEN", value: 2 },
  { label: "YELLOW", value: 3 },
]);

const Card = ObjectType({
  value: IntType(),
  color: ReferenceType("Color"),
});

const Player = ObjectType({
  id: ReferenceType("UserId"),
  numCards: IntType(),
});

const PlayerState = ObjectType({
  hand: ChildType(ReferenceType("Card"), "array"),
  players: ChildType(ReferenceType("Player"), "array"),
  turn: ChildType(ReferenceType("UserId"), "optional"),
  pile: ChildType(ReferenceType("Card"), "optional"),
  winner: ChildType(ReferenceType("UserId"), "optional"),
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
  })
);
