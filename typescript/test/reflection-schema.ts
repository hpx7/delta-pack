import "reflect-metadata";
import {
  DeltaPackString,
  DeltaPackInt,
  DeltaPackBool,
  DeltaPackFloat,
  DeltaPackArrayOf,
  DeltaPackMapOf,
  DeltaPackOptionalOf,
  DeltaPackUnion,
  DeltaPackRef,
} from "@hpx7/delta-pack";

// Enum matching schema.ts Color
export enum Color {
  RED = "RED",
  BLUE = "BLUE",
  GREEN = "GREEN",
  YELLOW = "YELLOW",
}

export class Player {
  @DeltaPackString()
  id: string = "";

  @DeltaPackString()
  name: string = "";

  @DeltaPackInt()
  score: number = 0;

  @DeltaPackBool()
  isActive: boolean = false;

  @DeltaPackOptionalOf(Player)
  partner?: Player;
}

// Position with quantized floats
export class Position {
  @DeltaPackFloat({ precision: 0.1 })
  x: number = 0;

  @DeltaPackFloat({ precision: 0.1 })
  y: number = 0;
}

// Velocity with non-quantized floats
export class Velocity {
  @DeltaPackFloat()
  vx: number = 0;

  @DeltaPackFloat()
  vy: number = 0;
}

// Entity with nested object reference (Position)
export class Entity {
  @DeltaPackString()
  id: string = "";

  @DeltaPackRef(Position)
  position: Position = new Position();
}

// Union variant types
export class MoveAction {
  @DeltaPackInt()
  x: number = 0;

  @DeltaPackInt()
  y: number = 0;
}

export class AttackAction {
  @DeltaPackString()
  targetId: string = "";

  @DeltaPackInt({ unsigned: true })
  damage: number = 0;
}

export class UseItemAction {
  @DeltaPackString()
  itemId: string = "";
}

@DeltaPackUnion([MoveAction, AttackAction, UseItemAction])
export abstract class GameAction {}

// GameState - simplified without recursive Player.partner reference
export class GameState {
  @DeltaPackArrayOf(Player)
  players: Player[] = [];

  @DeltaPackOptionalOf(String)
  currentPlayer?: string;

  @DeltaPackInt({ unsigned: true })
  round: number = 0;

  @DeltaPackMapOf(String)
  metadata: Map<string, string> = new Map();

  @DeltaPackOptionalOf(Color, { enumName: "Color" })
  winningColor?: Color;

  @DeltaPackOptionalOf(GameAction)
  lastAction?: GameAction;
}

// Inventory with nested containers: optional array of maps
export class Inventory {
  @DeltaPackOptionalOf(DeltaPackArrayOf(DeltaPackMapOf(Number)))
  items?: Map<string, number>[];
}

// PlayerRegistry - map with object values
export class PlayerRegistry {
  @DeltaPackMapOf(Player)
  players: Map<string, Player> = new Map();
}
