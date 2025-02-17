import {
  BooleanType,
  FloatType,
  IntType,
  ObjectType,
  OptionalType,
  RecordType,
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
  position: "Position",
  health: IntType(),
  weapon: OptionalType("Weapon"),
  stealth: BooleanType(),
});

const GameState = ObjectType({
  timeRemaining: IntType(),
  players: RecordType(IntType(), "Player"),
});

console.log(
  codegenTypescript({
    Position,
    Weapon,
    Player,
    GameState,
  }),
);
