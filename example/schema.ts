import {
  ChildType,
  EnumType,
  IntType,
  Modifier,
  ObjectType,
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
  hand: ChildType(ReferenceType("Card"), Modifier.ARRAY),
  players: ChildType(ReferenceType("Player"), Modifier.ARRAY),
  turn: ChildType(ReferenceType("UserId"), Modifier.OPTIONAL),
  pile: ChildType(ReferenceType("Card"), Modifier.OPTIONAL),
  winner: ChildType(ReferenceType("UserId"), Modifier.OPTIONAL),
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
