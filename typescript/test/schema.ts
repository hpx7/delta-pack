import {
  ObjectType,
  StringType,
  IntType,
  UIntType,
  FloatType,
  BooleanType,
  ArrayType,
  OptionalType,
  RecordType,
  EnumType,
  ReferenceType,
  UnionType,
  SelfReferenceType,
} from "@hpx7/delta-pack";

// Define test schema with multiple types

const Color = EnumType("Color", ["RED", "BLUE", "GREEN", "YELLOW"]);

const Player = ObjectType("Player", {
  id: StringType(),
  name: StringType(),
  score: IntType(),
  isActive: BooleanType(),
  partner: OptionalType(SelfReferenceType()), // Self-reference
});

// Position with quantized floats
const Position = ObjectType("Position", {
  x: FloatType({ precision: 0.1 }),
  y: FloatType({ precision: 0.1 }),
});

// Velocity with non-quantized floats
const Velocity = ObjectType("Velocity", {
  vx: FloatType(),
  vy: FloatType(),
});

// Entity with nested object reference (Position)
const Entity = ObjectType("Entity", {
  id: StringType(),
  position: ReferenceType(Position),
});

// Union type for different game actions
const MoveAction = ObjectType("MoveAction", {
  x: IntType(),
  y: IntType(),
});

const AttackAction = ObjectType("AttackAction", {
  targetId: StringType(),
  damage: UIntType(),
});

const UseItemAction = ObjectType("UseItemAction", {
  itemId: StringType(),
});

const GameAction = UnionType("GameAction", [MoveAction, AttackAction, UseItemAction]);

const GameState = ObjectType("GameState", {
  players: ArrayType(ReferenceType(Player)),
  currentPlayer: OptionalType(StringType()),
  round: UIntType(),
  metadata: RecordType(StringType(), StringType()),
  winningColor: OptionalType(ReferenceType(Color)),
  lastAction: OptionalType(ReferenceType(GameAction)),
});

// Nested container type: optional array of records
const Inventory = ObjectType("Inventory", {
  items: OptionalType(ArrayType(RecordType(StringType(), IntType()))),
});

// Map with object values
const PlayerRegistry = ObjectType("PlayerRegistry", {
  players: RecordType(StringType(), ReferenceType(Player)),
});

// Export individual types
export const schema = {
  Color,
  Player,
  Position,
  Velocity,
  Entity,
  MoveAction,
  AttackAction,
  UseItemAction,
  GameAction,
  GameState,
  Inventory,
  PlayerRegistry,
};
