import { WebSocketServer, WebSocket } from "ws";
import {
  StateMessage,
  JoinMessage,
  InputMessage,
  ClientMessageApi,
  ServerMessageApi,
  ClientMessage,
  ServerMessage,
} from "./schema.js";
import { Game } from "./game.js";

// Server configuration
const PORT = 3000;
const TICK_RATE = 20; // Send updates 20 times per second
const STATS_INTERVAL = 5000; // Log stats every 5 seconds

interface Client {
  id: string;
  ws: WebSocket;
  name: string;
  lastMessage: ServerMessage | null; // Last ServerMessage sent to this client
}

class GameServer {
  private game: Game;
  private clients = new Map<string, Client>();
  private wss: WebSocketServer;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private statsInterval: NodeJS.Timeout | null = null;
  private clientIdCounter = 0;

  // Performance tracking
  private stats = {
    totalBytesSent: 0,
    totalUpdates: 0,
    lastSecondBytes: 0,
    lastSecondUpdates: 0,
    avgDiffSize: 0,
  };

  constructor() {
    this.game = new Game();

    // Create WebSocket server
    this.wss = new WebSocketServer({ port: PORT });

    this.wss.on("connection", (ws) => this.handleConnection(ws));
  }

  start() {
    console.log(`🚀 WebSocket server started on ws://localhost:${PORT}`);
    console.log(`📡 Server ready for connections`);

    this.game.start();

    // Start broadcasting state updates
    this.broadcastInterval = setInterval(() => this.broadcastState(), 1000 / TICK_RATE);

    // Start stats logging
    this.statsInterval = setInterval(() => this.logStats(), STATS_INTERVAL);
  }

  private handleConnection(ws: WebSocket) {
    const clientId = `player-${++this.clientIdCounter}`;
    const client: Client = {
      id: clientId,
      ws,
      name: `Player${this.clientIdCounter}`,
      lastMessage: null,
    };

    console.log(`🔌 Client connected: ${clientId}`);

    ws.on("message", (data) => {
      try {
        if (data instanceof Buffer || data instanceof Uint8Array) {
          const message = ClientMessageApi.decode(data);
          this.handleMessage(client, message);
        } else {
          console.error("Received non-binary message");
        }
      } catch (err) {
        console.error("Failed to decode message:", err);
      }
    });

    ws.on("close", () => {
      console.log(`🔌 Client disconnected: ${clientId}`);
      this.game.removePlayer(clientId);
      this.clients.delete(clientId);
    });

    ws.on("error", (err) => {
      console.error(`WebSocket error for ${clientId}:`, err);
    });
  }

  private handleMessage(client: Client, message: ClientMessage) {
    if (message instanceof JoinMessage) {
      // Add player to game
      const playerName = message.name || client.name;
      this.game.addPlayer(client.id, playerName);
      this.clients.set(client.id, client);

      // Send initial full state
      const fullState = this.game.getStateForPlayer(client.id);
      const stateMsg = new StateMessage({ playerId: client.id, state: fullState });

      client.lastMessage = stateMsg;
      const encoded = ServerMessageApi.encode(stateMsg);
      client.ws.send(encoded);

      console.log(`👤 ${playerName} joined the game`);
    } else if (message instanceof InputMessage) {
      // Process player input
      this.game.setPlayerInput(client.id, message.input);
    }
  }

  private broadcastState() {
    if (this.clients.size === 0) return;

    let totalBytes = 0;

    // Send diff to each client based on their last message
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        if (client.lastMessage != null) {
          // Create update message with current snapshot
          const currentState = this.game.getStateForPlayer(client.id);
          const updateMessage = new StateMessage({ playerId: client.id, state: currentState });

          // Send diff from last update message
          const encoded = ServerMessageApi.encodeDiff(client.lastMessage, updateMessage);
          client.ws.send(encoded);
          totalBytes += encoded.length;

          // Clone and update client's last message
          client.lastMessage = ServerMessageApi.clone(updateMessage);
        }
      }
    }

    // Clear changes after broadcasting
    this.game.resetChanges();

    // Track stats
    this.stats.totalBytesSent += totalBytes;
    this.stats.totalUpdates++;
    this.stats.lastSecondBytes += totalBytes;
    this.stats.lastSecondUpdates++;
    const avgSize = this.clients.size > 0 ? totalBytes / this.clients.size : 0;
    this.stats.avgDiffSize =
      (this.stats.avgDiffSize * (this.stats.totalUpdates - 1) + avgSize) / this.stats.totalUpdates;
  }

  private logStats() {
    const gameStats = this.game.getStats();
    const bytesPerSecond = this.stats.lastSecondBytes / 5; // 5 second average
    const updatesPerSecond = this.stats.lastSecondUpdates / 5;

    console.log("\n📊 Server Stats:");
    console.log(`  Players: ${gameStats.players}`);
    console.log(`  Tick: ${gameStats.tick} (${gameStats.gameTime}s)`);
    console.log(`  Dirty players: ${gameStats.dirtyPlayers}`);
    console.log(`  Dirty fields: ${gameStats.dirtyFields}`);
    console.log(`  Avg diff size: ${this.stats.avgDiffSize.toFixed(1)} bytes`);
    console.log(`  Bandwidth: ${(bytesPerSecond / 1024).toFixed(2)} KB/s`);
    console.log(`  Updates/sec: ${updatesPerSecond.toFixed(1)}`);

    // Reset per-second counters
    this.stats.lastSecondBytes = 0;
    this.stats.lastSecondUpdates = 0;
  }

  stop() {
    console.log("\n🛑 Shutting down server...");

    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    this.game.stop();
    this.wss.close();

    console.log("✅ Server stopped");
  }
}

// Start the server
const server = new GameServer();
server.start();

// Graceful shutdown
process.on("SIGINT", () => {
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.stop();
  process.exit(0);
});
