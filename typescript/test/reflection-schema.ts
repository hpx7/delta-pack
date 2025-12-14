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

  @OptionalType(Player)
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

// Union variant types
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

@UnionType([MoveAction, AttackAction, UseItemAction])
export abstract class GameAction {}

// GameState - simplified without recursive Player.partner reference
export class GameState {
  @ArrayType(Player)
  players: Player[] = [];

  @OptionalType(String)
  currentPlayer?: string;

  @UIntType()
  round: number = 0;

  @RecordType(StringType(), String)
  metadata: Map<string, string> = new Map();

  @OptionalType(Color, { enumName: "Color" })
  winningColor?: Color;

  @OptionalType(GameAction)
  lastAction?: GameAction;
}

// Inventory with nested containers: optional array of maps
export class Inventory {
  @OptionalType(ArrayType(RecordType(StringType(), Number)))
  items?: Map<string, number>[];
}

// PlayerRegistry - map with object values
export class PlayerRegistry {
  @RecordType(StringType(), Player)
  players: Map<string, Player> = new Map();
}

// Comprehensive test class for coverage of obscure decorator combinations
export class CoverageTestSchema {
  // Direct enum via @ReferenceType (not @OptionalType)
  @ReferenceType(Color, { enumName: "Color" })
  directEnum: Color = Color.RED;

  // Nested optional via container descriptor
  @OptionalType(OptionalType(String))
  nestedOptional?: string;

  // Primitive targetClass (Boolean) in nested containers
  @ArrayType(ArrayType(Boolean))
  boolMatrix: boolean[][] = [];

  // Primitive targetClass (String) in nested containers
  @ArrayType(ArrayType(String))
  stringMatrix: string[][] = [];

  // Primitive targetClass (Number) in nested containers
  @ArrayType(ArrayType(Number))
  intMatrix: number[][] = [];

  // Union type to trigger the wrapped API path
  @OptionalType(GameAction)
  action?: GameAction;
}
