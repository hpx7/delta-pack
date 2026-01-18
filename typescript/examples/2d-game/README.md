# Delta-Pack Game Example

A real-time multiplayer game server demonstrating delta compression and dirty tracking with delta-pack.

## Overview

This example implements a simple multiplayer game where players move around a 2D world. The server uses delta compression to efficiently synchronize game state with connected clients, sending only what changed instead of the full state on every frame.

## Features

- **WebSocket-based networking** - Real-time bidirectional communication
- **Delta compression** - Only changed data is sent over the network
- **Dirty tracking** - Optimized diff encoding by tracking which fields changed
- **20 Hz tick rate** - Server updates game state 20 times per second
- **60 Hz client updates** - Clients receive state updates up to 60 times per second
- **Efficient bandwidth usage** - Delta encoding reduces network traffic by 90%+

## Architecture

### Schema (`schema.ts`)

Defines the game data structures:

- `Player` - Player entity with position, velocity, health, score
- `GameState` - Complete game state with all players, tick count, game time
- `ClientInput` - Keyboard/controller input state
- `ClientMessage` / `ServerMessage` - Network message types

### Code Generation (`gen.ts`)

Generates TypeScript serialization code with `codegenTypescript()`:

- Binary encode/decode functions
- Delta compression (encodeDiff/decodeDiff)
- Clone, equals, validation functions
- Type-safe API for all operations

### Game Logic (`game.ts`)

Core game loop:

- Processes player input
- Updates physics (position, velocity)
- Manages game state and dirty tracking
- Provides state snapshots for network sync

### Server (`server.ts`)

WebSocket server using delta compression:

- Accepts client connections
- Processes input messages
- Broadcasts state updates using diff encoding
- Tracks last sent state per client for delta compression

### Client (`client.ts`)

Terminal-based game client:

- Connects to server via WebSocket
- Sends keyboard input at 20 Hz
- Receives and decodes state updates
- Displays player positions and game info

## Running the Example

### Install Dependencies

```bash
npm install
```

### Start the Server

```bash
npm run server
```

The server will start on `ws://localhost:3000` and run the game loop at 20 ticks/second.

### Connect Clients

In separate terminals, run clients with custom player names:

```bash
npm run client Alice
npm run client Bob
npm run client Charlie
```

Or without a name (random name will be assigned):

```bash
npm run client
```

### Controls

- **W/↑** - Move up
- **S/↓** - Move down
- **A/←** - Move left
- **D/→** - Move right
- **Q** - Quit

## How Delta Compression Works

### Initial Connection

When a client first connects, the server sends the **full game state**:

```typescript
const fullMessage = {
  type: "StateMessage",
  val: {
    playerId: "abc123",
    state: gameState,
  },
};
const bytes = ServerMessage.encode(fullMessage);
ws.send(bytes);
```

### Subsequent Updates

On every tick, the server sends only what **changed** since the last update:

```typescript
// Clone current state to capture this frame
const updateMessage = ServerMessage.clone(fullMessage);

// Encode diff from last sent state
const diffBytes = ServerMessage.encodeDiff(client.lastMessage, updateMessage);
ws.send(diffBytes);

// Save for next diff
client.lastMessage = updateMessage;
```

### Dirty Tracking Optimization

The game uses `track()` to automatically track changes:

```typescript
import { track, clearTracking } from "@hpx7/delta-pack";

// Wrap state with tracking
const state = track(new GameState());

// Modifications are automatically tracked
player.x += vx * deltaTime;
player.y += vy * deltaTime;

// After sending diff, clear tracking for next frame
clearTracking(state);
```

This allows `encodeDiff` to skip checking unchanged fields, making encoding faster.

## Network Efficiency

Example bandwidth comparison for a 10-player game at 60 Hz updates:

| Method                      | Bytes/Frame | Bandwidth (60 FPS) |
| --------------------------- | ----------- | ------------------ |
| Full state encoding         | ~800 bytes  | 384 KB/s           |
| Delta compression (typical) | ~50 bytes   | 24 KB/s            |
| Delta + dirty tracking      | ~30 bytes   | 14.4 KB/s          |

**Savings: ~96% bandwidth reduction**

## Code Generation Output

The `generated.ts` file provides:

```typescript
// For each type (Player, GameState, etc.):
Player.default(); // Create default instance
Player.clone(obj); // Deep clone
Player.equals(a, b); // Equality check
Player.encode(obj); // Binary serialization
Player.decode(bytes); // Binary deserialization
Player.encodeDiff(oldObj, newObj); // Delta encoding
Player.decodeDiff(oldObj, bytes); // Delta decoding
```

All generated functions are type-safe and optimized for performance.

## Performance Notes

- **Quantized floats**: Player positions use 0.1 precision, reducing size
- **String dictionary**: Player names are compressed using string table
- **RLE compression**: Boolean arrays use run-length encoding
- **Incremental updates**: Only players that moved are included in diffs

## Learn More

- [Delta-Pack Documentation](../README.md)
- [Type System Guide](../README.md#type-system)
- [Binary Format Details](../README.md#binary-encoding)
