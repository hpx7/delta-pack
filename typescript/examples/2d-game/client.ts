import WebSocket from "ws";
import * as readline from "readline";
import {
  GameState,
  ClientInput,
  JoinMessage,
  InputMessage,
  StateMessage,
  ClientMessageApi,
  ServerMessageApi,
} from "./schema.js";

// Client configuration
const SERVER_URL = "ws://localhost:3000";
const INPUT_RATE = 50; // Send input updates every 50ms (20Hz)

class GameClient {
  private ws: WebSocket | null = null;
  private playerId: string | null = null;
  private playerName: string;
  private gameState: GameState | null = null;
  private connected = false;
  private lastMessage: StateMessage | null = null; // Last StateMessage received

  // Input state
  private input: ClientInput = new ClientInput();

  private inputInterval: NodeJS.Timeout | null = null;
  private lastUpdateTime = Date.now();
  private frameCount = 0;

  constructor(playerName: string) {
    this.playerName = playerName;
  }

  connect() {
    console.log(`🔌 Connecting to ${SERVER_URL}...`);
    this.ws = new WebSocket(SERVER_URL);

    this.ws.on("open", () => {
      this.connected = true;
      console.log("✅ Connected to server");
      this.sendJoinMessage();
      this.startInputLoop();
    });

    this.ws.on("message", (data: Buffer) => {
      try {
        const bytes = new Uint8Array(data);

        let message: StateMessage;
        if (this.lastMessage instanceof StateMessage) {
          // Decode as diff from last update message
          message = ServerMessageApi.decodeDiff(this.lastMessage, bytes) as StateMessage;
        } else {
          // First message, decode as full message
          message = ServerMessageApi.decode(bytes) as StateMessage;
        }

        this.handleMessage(message);
      } catch (err) {
        console.error("Failed to decode message:", err);
      }
    });

    this.ws.on("close", () => {
      this.connected = false;
      console.log("🔌 Disconnected from server");
      this.stopInputLoop();
      process.exit(0);
    });

    this.ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  }

  private sendJoinMessage() {
    if (!this.ws || !this.connected) return;

    const joinMsg = new JoinMessage({ name: this.playerName });
    const encoded = ClientMessageApi.encode(joinMsg);
    this.ws.send(encoded);
    console.log(`👤 Joining as "${this.playerName}"...`);
  }

  private handleMessage(message: StateMessage) {
    if (this.lastMessage == null) {
      // Initial full state
      this.playerId = message.playerId;
      this.gameState = message.state;
      console.log(`\n🎮 Joined game! Player ID: ${this.playerId}`);
      this.printGameState();
    } else {
      // Update game state
      this.gameState = message.state;

      this.frameCount++;
      const now = Date.now();
      if (now - this.lastUpdateTime > 1000) {
        console.log(`\n📊 Update rate: ${this.frameCount} FPS`);
        this.printGameState();
        this.frameCount = 0;
        this.lastUpdateTime = now;
      }
    }
    this.lastMessage = message;
  }

  private printGameState() {
    if (!this.gameState) return;

    console.log(`\n━━━ Game State (Tick ${this.gameState.tick}) ━━━`);
    console.log(`Game Time: ${this.gameState.gameTime.toFixed(1)}s`);
    console.log(`Players: ${this.gameState.players.size}`);

    if (this.gameState.players.size > 0) {
      console.log("\nPlayers:");
      this.gameState.players.forEach((player, id) => {
        const isMe = id === this.playerId ? " (YOU)" : "";
        const pos = `(${player.x.toFixed(1)}, ${player.y.toFixed(1)})`;
        const vel = player.vx !== 0 || player.vy !== 0 ? ` vel:(${player.vx.toFixed(1)}, ${player.vy.toFixed(1)})` : "";
        console.log(`  ${player.name}${isMe}: ${pos}${vel} | HP:${player.health}`);
      });
    }
  }

  private startInputLoop() {
    // Send input updates at fixed rate
    this.inputInterval = setInterval(() => {
      this.sendInput();
    }, INPUT_RATE);
  }

  private stopInputLoop() {
    if (this.inputInterval) {
      clearInterval(this.inputInterval);
      this.inputInterval = null;
    }
  }

  private sendInput() {
    if (!this.ws || !this.connected) return;

    const inputMsg = new InputMessage({ input: this.input });
    const encoded = ClientMessageApi.encode(inputMsg);
    this.ws.send(encoded);
  }

  // Public methods to control input
  setInput(key: keyof ClientInput, value: boolean) {
    this.input[key] = value;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Setup keyboard controls
function setupKeyboardControls(client: GameClient) {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  console.log("\n🎮 Controls:");
  console.log("  W/↑ - Move up");
  console.log("  S/↓ - Move down");
  console.log("  A/← - Move left");
  console.log("  D/→ - Move right");
  console.log("  Space - Shoot (not implemented)");
  console.log("  Q - Quit\n");

  // Track key release timers (auto-release after 150ms if not re-pressed)
  const keyTimers = new Map<string, NodeJS.Timeout>();
  const KEY_RELEASE_DELAY = 150; // ms

  const pressKey = (inputKey: keyof ClientInput) => {
    client.setInput(inputKey, true);

    // Clear any existing release timer for this key
    const timerKey = inputKey as string;
    if (keyTimers.has(timerKey)) {
      clearTimeout(keyTimers.get(timerKey)!);
    }

    // Set new release timer
    const timer = setTimeout(() => {
      client.setInput(inputKey, false);
      keyTimers.delete(timerKey);
    }, KEY_RELEASE_DELAY);

    keyTimers.set(timerKey, timer);
  };

  process.stdin.on("keypress", (_str, key) => {
    if (!key) return;

    // Handle quit
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      console.log("\n👋 Disconnecting...");
      client.disconnect();
      return;
    }

    // Movement keys
    switch (key.name) {
      case "w":
      case "up":
        pressKey("up");
        break;
      case "s":
      case "down":
        pressKey("down");
        break;
      case "a":
      case "left":
        pressKey("left");
        break;
      case "d":
      case "right":
        pressKey("right");
        break;
      case "space":
        pressKey("shoot");
        break;
    }
  });
}

// Main
const args = process.argv.slice(2);
const playerName = args[0] || `Player${Math.floor(Math.random() * 1000)}`;

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  Delta-Pack Game Client");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const client = new GameClient(playerName);
setupKeyboardControls(client);
client.connect();

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n👋 Disconnecting...");
  client.disconnect();
  process.exit(0);
});

process.on("SIGTERM", () => {
  client.disconnect();
  process.exit(0);
});
