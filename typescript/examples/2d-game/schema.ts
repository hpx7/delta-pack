import {
  StringType,
  IntType,
  FloatType,
  BooleanType,
  RecordType,
  ReferenceType,
  UnionType,
  loadClass,
  WithDirty,
  DirtyMap,
} from "@hpx7/delta-pack";

// Player class
export class Player {
  @StringType()
  id: string = "";

  @StringType()
  name: string = "";

  @FloatType({ precision: 0.1 })
  x: number = 0;

  @FloatType({ precision: 0.1 })
  y: number = 0;

  @FloatType({ precision: 0.1 })
  vx: number = 0;

  @FloatType({ precision: 0.1 })
  vy: number = 0;

  @IntType()
  health: number = 100;

  @IntType()
  score: number = 0;

  @BooleanType()
  isAlive: boolean = true;

  constructor(overrides: Partial<Player> = {}) {
    Object.assign(this, overrides);
  }
}

// GameState class
export class GameState {
  @RecordType(StringType(), ReferenceType(Player))
  players: DirtyMap<string, Player> = new Map();

  @IntType()
  tick: number = 0;

  @FloatType()
  gameTime: number = 0;

  constructor(overrides: Partial<GameState> = {}) {
    Object.assign(this, overrides);
  }
}

// ClientInput class
export class ClientInput {
  @BooleanType()
  up: boolean = false;

  @BooleanType()
  down: boolean = false;

  @BooleanType()
  left: boolean = false;

  @BooleanType()
  right: boolean = false;

  @BooleanType()
  shoot: boolean = false;

  constructor(overrides: Partial<ClientInput> = {}) {
    Object.assign(this, overrides);
  }
}

// Client -> Server messages
export class JoinMessage {
  @StringType()
  name: string = "";

  constructor(overrides: Partial<JoinMessage> = {}) {
    Object.assign(this, overrides);
  }
}

export class InputMessage {
  @ReferenceType(ClientInput)
  input: ClientInput = new ClientInput();

  constructor(overrides: Partial<InputMessage> = {}) {
    Object.assign(this, overrides);
  }
}

export const ClientMessage = UnionType("ClientMessage", [JoinMessage, InputMessage]);
export type ClientMessage = JoinMessage | InputMessage;

// Server -> Client messages
export class StateMessage {
  @StringType()
  playerId: string = "";

  @ReferenceType(GameState)
  state: WithDirty<GameState> = new GameState();

  constructor(overrides: Partial<StateMessage> = {}) {
    Object.assign(this, overrides);
  }
}

export const ServerMessage = UnionType("ServerMessage", [StateMessage]);
export type ServerMessage = StateMessage;

// Create APIs using loadClass
export const PlayerApi = loadClass(Player);
export const GameStateApi = loadClass(GameState);
export const ClientInputApi = loadClass(ClientInput);
export const ClientMessageApi = loadClass(ClientMessage);
export const ServerMessageApi = loadClass(ServerMessage);
