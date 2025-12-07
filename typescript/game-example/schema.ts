import {
  ObjectType,
  StringType,
  IntType,
  FloatType,
  BooleanType,
  RecordType,
  ReferenceType,
  UnionType,
} from "@hpx7/delta-pack";

export const schema = {
  Player: ObjectType({
    id: StringType(),
    name: StringType(),
    x: FloatType({ precision: 0.1 }), // Position with 0.1 precision
    y: FloatType({ precision: 0.1 }),
    vx: FloatType({ precision: 0.1 }), // Velocity
    vy: FloatType({ precision: 0.1 }),
    health: IntType(),
    score: IntType(),
    isAlive: BooleanType(),
  }),

  GameState: ObjectType({
    players: RecordType(StringType(), ReferenceType("Player")),
    tick: IntType(),
    gameTime: FloatType(),
  }),

  ClientInput: ObjectType({
    up: BooleanType(),
    down: BooleanType(),
    left: BooleanType(),
    right: BooleanType(),
    shoot: BooleanType(),
  }),

  // Client -> Server messages
  JoinMessage: ObjectType({
    name: StringType(),
  }),

  InputMessage: ObjectType({
    input: ReferenceType("ClientInput"),
  }),

  ClientMessage: UnionType([ReferenceType("JoinMessage"), ReferenceType("InputMessage")]),

  // Server -> Client messages
  StateMessage: ObjectType({
    playerId: StringType(),
    state: ReferenceType("GameState"),
  }),

  ServerMessage: UnionType([ReferenceType("StateMessage")]),
};
