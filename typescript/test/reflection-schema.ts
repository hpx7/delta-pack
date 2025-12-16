import "reflect-metadata";
import {
  StringType,
  IntType,
  UIntType,
  BooleanType,
  FloatType,
  ArrayType,
  RecordType,
  OptionalType,
  UnionType,
  ReferenceType,
} from "@hpx7/delta-pack";

// Enum matching schema.ts Color
export enum Color {
  RED = "RED",
  BLUE = "BLUE",
  GREEN = "GREEN",
  YELLOW = "YELLOW",
}

export class Player {
  @StringType()
  id: string = "";

  @StringType()
  name: string = "";

  @IntType()
  score: number = 0;

  @BooleanType()
  isActive: boolean = false;

  @OptionalType(ReferenceType(Player))
  partner?: Player;
}

// Position with quantized floats
export class Position {
  @FloatType({ precision: 0.1 })
  x: number = 0;

  @FloatType({ precision: 0.1 })
  y: number = 0;
}

// Velocity with non-quantized floats
export class Velocity {
  @FloatType()
  vx: number = 0;

  @FloatType()
  vy: number = 0;
}

// Entity with nested object reference (Position)
export class Entity {
  @StringType()
  id: string = "";

  @ReferenceType(Position)
  position: Position = new Position();
}

// Union variant classes
export class MoveAction {
  @IntType()
  x: number = 0;

  @IntType()
  y: number = 0;
}

export class AttackAction {
  @StringType()
  targetId: string = "";

  @UIntType()
  damage: number = 0;
}

export class UseItemAction {
  @StringType()
  itemId: string = "";
}

export const GameAction = UnionType("GameAction", [MoveAction, AttackAction, UseItemAction]);
export type GameAction = MoveAction | AttackAction | UseItemAction;

export class GameState {
  @ArrayType(ReferenceType(Player))
  players: Player[] = [];

  @OptionalType(StringType())
  currentPlayer?: string;

  @UIntType()
  round: number = 0;

  @RecordType(StringType(), StringType())
  metadata: Map<string, string> = new Map();

  @OptionalType(ReferenceType(Color, { enumName: "Color" }))
  winningColor?: Color;

  @OptionalType(ReferenceType(GameAction))
  lastAction?: GameAction;
}

// Inventory with nested containers: optional array of maps
export class Inventory {
  @OptionalType(ArrayType(RecordType(StringType(), IntType())))
  items?: Map<string, number>[];
}

// PlayerRegistry - map with object values
export class PlayerRegistry {
  @RecordType(StringType(), ReferenceType(Player))
  players: Map<string, Player> = new Map();
}

// Comprehensive test class for coverage of obscure decorator combinations
export class CoverageTestSchema {
  // Direct enum via @ReferenceType (not @OptionalType)
  @ReferenceType(Color, { enumName: "Color" })
  directEnum: Color = Color.RED;

  // Nested optional via container descriptor
  @OptionalType(OptionalType(StringType()))
  nestedOptional?: string;

  // Primitive targetClass (Boolean) in nested containers
  @ArrayType(ArrayType(BooleanType()))
  boolMatrix: boolean[][] = [];

  // Primitive targetClass (String) in nested containers
  @ArrayType(ArrayType(StringType()))
  stringMatrix: string[][] = [];

  // Primitive targetClass (Number) in nested containers
  @ArrayType(ArrayType(IntType()))
  intMatrix: number[][] = [];

  // Union type to trigger the wrapped API path
  @OptionalType(ReferenceType(GameAction))
  action?: GameAction;
}
