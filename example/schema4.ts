import {
  BooleanType,
  ChildType,
  FloatType,
  IntType,
  Modifier,
  ObjectType,
  RecordType,
  ReferenceType,
  StringType,
  codegenTypescript,
} from "../generator";

const Position = ObjectType({
  x: FloatType(),
  y: FloatType(),
});

const Weapon = ObjectType({
  name: StringType(),
  damage: IntType(),
});

const Player = ObjectType({
  position: ReferenceType("Position"),
  health: IntType(),
  weapon: ChildType(ReferenceType("Weapon"), Modifier.OPTIONAL),
  stealth: BooleanType(),
});

const GameState = ObjectType({
  timeRemaining: IntType(),
  players: RecordType(IntType(), ReferenceType("Player")),
});

console.log(
  codegenTypescript({
    Position,
    Weapon,
    Player,
    GameState,
  }),
);
