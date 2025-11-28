import {
  ArrayType,
  BooleanType,
  UIntType,
  ObjectType,
  StringType,
  codegenTypescript,
  ReferenceType,
} from "@hathora/delta-pack";

const Position = ObjectType({
  x: UIntType(),
  y: UIntType(),
});

const Velocity = ObjectType({
  x: UIntType(),
  y: UIntType(),
});

const Player = ObjectType({
  id: UIntType(),
  name: StringType(),
  type: StringType(),
  position: ReferenceType(Position),
  velocity: ReferenceType(Velocity),
  width: UIntType(),
  height: UIntType(),
  rotation: UIntType(),
  mass: UIntType(),
  health: UIntType(),
  depth: UIntType(),
  lifetime: UIntType(),
  radius: UIntType(),
  isSensor: BooleanType(),
  isStatic: BooleanType(),
  destroyed: BooleanType(),
  owner: UIntType(),
  maxSpeed: UIntType(),
});

const State = ObjectType({
  id: UIntType(),
  state: ArrayType(ReferenceType(Player)),
});

console.log(
  codegenTypescript({
    Position,
    Velocity,
    Player,
    State,
  }),
);
