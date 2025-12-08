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
  defineSchema,
} from "@hpx7/delta-pack";

// Define test schema with multiple types
const Color = EnumType(["RED", "BLUE", "GREEN", "YELLOW"]);

// Type alias
const PlayerId = StringType();

const Player = ObjectType({
  id: ReferenceType("PlayerId"),
  name: StringType(),
  score: IntType(),
  isActive: BooleanType(),
  partner: OptionalType(ReferenceType("Player")), // Recursive reference
});

// Position with quantized floats
const Position = ObjectType({
  x: FloatType({ precision: 0.1 }),
  y: FloatType({ precision: 0.1 }),
});

// Velocity with non-quantized floats
const Velocity = ObjectType({
  vx: FloatType(),
  vy: FloatType(),
});

// Union type for different game actions
const MoveAction = ObjectType({
  x: IntType(),
  y: IntType(),
});

const AttackAction = ObjectType({
  targetId: StringType(),
  damage: UIntType(),
});

const UseItemAction = ObjectType({
  itemId: StringType(),
});

const GameAction = UnionType([
  ReferenceType("MoveAction"),
  ReferenceType("AttackAction"),
  ReferenceType("UseItemAction"),
]);

const GameState = ObjectType({
  players: ArrayType(ReferenceType("Player")),
  currentPlayer: OptionalType(StringType()),
  round: UIntType(),
  metadata: RecordType(StringType(), StringType()),
  winningColor: OptionalType(ReferenceType("Color")),
  lastAction: OptionalType(ReferenceType("GameAction")),
});

// Nested container type: optional array of records
const Inventory = ObjectType({
  items: OptionalType(ArrayType(RecordType(StringType(), IntType()))),
});

// Map with object values
const PlayerRegistry = ObjectType({
  players: RecordType(StringType(), ReferenceType("Player")),
});

// Export schema for interpreter tests
export const schema = defineSchema({
  Color,
  PlayerId,
  Player,
  Position,
  Velocity,
  MoveAction,
  AttackAction,
  UseItemAction,
  GameAction,
  GameState,
  Inventory,
  PlayerRegistry,
});
