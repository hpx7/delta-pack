import { WithDirty } from "@hpx7/delta-pack";
import { Player, GameState, ClientInput } from "./schema.js";

export class Game {
  private state: WithDirty<GameState>;
  private playerInputs = new Map<string, ClientInput>();
  private tickRate = 20; // 20 ticks per second
  private tickInterval: NodeJS.Timeout | null = null;
  private startTime = Date.now();

  // Game constants
  private readonly PLAYER_SPEED = 200; // pixels per second
  private readonly WORLD_WIDTH = 800;
  private readonly WORLD_HEIGHT = 600;
  private readonly MAX_PLAYERS = 100;

  constructor() {
    this.state = new GameState();
    this.state._dirty = new Set();
    this.state.players._dirty = new Set();
  }

  start() {
    console.log(`🎮 Game started at ${this.tickRate} ticks/sec`);
    this.tickInterval = setInterval(() => this.tick(), 1000 / this.tickRate);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  addPlayer(id: string, name: string): Player {
    if (this.state.players.size >= this.MAX_PLAYERS) {
      throw new Error("Server full");
    }

    const player = new Player({
      id,
      name,
      x: Math.random() * this.WORLD_WIDTH,
      y: Math.random() * this.WORLD_HEIGHT,
    });

    this.state.players.set(id, player);

    // Mark as dirty
    this.state.players._dirty!.add(id);
    this.state._dirty!.add("players");

    console.log(`✅ Player ${name} (${id}) joined. Total players: ${this.state.players.size}`);
    return player;
  }

  removePlayer(id: string) {
    const removed = this.state.players.delete(id);
    if (!removed) return;
    this.playerInputs.delete(id);

    // Mark as dirty
    this.state.players._dirty!.add(id);
    this.state._dirty!.add("players");

    console.log(`👋 Player ${id} left. Total players: ${this.state.players.size}`);
  }

  setPlayerInput(playerId: string, input: ClientInput) {
    this.playerInputs.set(playerId, input);
  }

  private tick() {
    const deltaTime = 1 / this.tickRate;

    // Update game time
    this.state.gameTime = (Date.now() - this.startTime) / 1000;
    this.state.tick++;
    this.state._dirty!.add("gameTime");
    this.state._dirty!.add("tick");

    // Process player inputs and update physics
    for (const [playerId, input] of this.playerInputs) {
      const player = this.state.players.get(playerId);
      if (!player || !player.isAlive) continue;

      let vx = 0;
      let vy = 0;

      if (input.up) vy -= this.PLAYER_SPEED;
      if (input.down) vy += this.PLAYER_SPEED;
      if (input.left) vx -= this.PLAYER_SPEED;
      if (input.right) vx += this.PLAYER_SPEED;

      if (vx === 0 && vy === 0 && player.vx === 0 && player.vy === 0) {
        // No change
        continue;
      }

      // Normalize diagonal movement
      if (vx !== 0 && vy !== 0) {
        const length = Math.sqrt(vx * vx + vy * vy);
        vx = (vx / length) * this.PLAYER_SPEED;
        vy = (vy / length) * this.PLAYER_SPEED;
      }

      // Update velocity
      player.vx = vx;
      player.vy = vy;

      // Update position
      player.x += vx * deltaTime;
      player.y += vy * deltaTime;

      // Clamp to world bounds
      player.x = Math.max(0, Math.min(this.WORLD_WIDTH, player.x));
      player.y = Math.max(0, Math.min(this.WORLD_HEIGHT, player.y));

      // Mark player as dirty
      this.state.players._dirty!.add(playerId);
      this.state._dirty!.add("players");
    }
  }

  getStateForPlayer(_id: string): GameState {
    return this.state;
  }

  resetChanges() {
    this.state._dirty!.clear();
    this.state.players._dirty!.clear();
  }

  getStats() {
    return {
      players: this.state.players.size,
      tick: this.state.tick,
      gameTime: this.state.gameTime.toFixed(1),
      dirtyPlayers: this.state.players._dirty?.size ?? 0,
      dirtyFields: this.state._dirty?.size ?? 0,
    };
  }
}
