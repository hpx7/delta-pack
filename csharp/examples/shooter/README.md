# Delta-Pack Shooter Example

A multiplayer top-down shooter demonstrating delta-encoded UDP networking with DeltaPack.

## Network Architecture

This example implements **Quake-style snapshot interpolation**:

- Server runs authoritative simulation at fixed tick rate
- Server broadcasts delta-encoded game state to all clients
- Clients buffer states and interpolate for smooth rendering
- Unreliable UDP transport with no head-of-line blocking

```
┌────────────────────────────────────────────────────────────────┐
│                         SERVER (50 Hz)                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │GameSimulation│──▶│ GameServer  │───▶│ DeltaPack Encoder   │ │
│  │  (physics)   │   │ (networking)│    │ (delta compression) │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ UDP (LiteNetLib)
                              │ Sequenced delivery
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                        CLIENT (60 fps)                         │
│  ┌─────────────────────┐    ┌───────────────────┐    ┌───────┐ │
│  │ DeltaPack Decoder   │───▶│InterpolationBuffer│───▶│Renderer│ │
│  │ (delta + full)      │    │ (adaptive delay)  │    │(Raylib)│ │
│  └─────────────────────┘    └───────────────────┘    └───────┘ │
└────────────────────────────────────────────────────────────────┘
```

## Protocol Design

### State Synchronization (Server → Client)

The server sends game state every tick using **baseline delta encoding**:

```
Message format: [baseline_tick: 4 bytes][payload: variable]

If baseline_tick == 0:
    payload = full state encoding
Else:
    payload = delta from baseline state
```

The baseline is always the **client's last acknowledged tick**, ensuring the client can decode the delta (it has that state in its history).

**Packet loss handling**: Lost packets don't block future packets. If tick 5 is lost:

```
Server sends: Tick 4 (full), Tick 5 (Δ from 4), Tick 6 (Δ from 4), Tick 7 (Δ from 4)
Client gets:  Tick 4 ✓,      Tick 5 ✗,          Tick 6 ✓,          Tick 7 ✓
                                                  └─ Still decodable (has tick 4)
Client acks:  4                                   6
Server uses baseline 6 for future diffs
```

### Input Transmission (Client → Server)

Clients send input at the tick rate with **redundancy** to handle packet loss:

```csharp
InputMessage {
    LastReceivedTick: uint     // Piggybacked state acknowledgment
    Inputs: [                  // Last 6 inputs (~120ms at 50Hz)
        { Tick: 93, Input: {...} },
        { Tick: 94, Input: {...} },
        ...
        { Tick: 104, Input: {...} }
    ]
}
```

The server applies only new inputs (tick > last processed) and uses `ShootSeq` for shoot deduplication.

### Delivery Methods

| Message      | Direction | Delivery        | Reason                      |
| ------------ | --------- | --------------- | --------------------------- |
| JoinRequest  | C→S       | ReliableOrdered | Must not be lost            |
| InputMessage | C→S       | Sequenced       | Redundancy handles loss     |
| StateMessage | S→C       | Sequenced       | Delta encoding handles loss |

**Sequenced** = unreliable + ordered (old packets discarded, no retransmission).

## Message Types

### Client → Server

```csharp
// Initial connection
JoinRequest { PlayerName: string }

// Sent every tick (50Hz)
InputMessage {
    LastReceivedTick: uint          // Ack for delta baseline
    Inputs: List<TimestampedInput>  // Redundant input history
}

TimestampedInput {
    Tick: uint
    Input: ClientInput {
        Up, Down, Left, Right: bool
        ShootSeq: uint              // Monotonic, for deduplication
        AimAngle: float             // 0.01 radian precision
    }
}
```

### Server → Client

```csharp
// Sent every tick (50Hz), per client
StateMessage {
    PlayerId: string                // Assigned on join
    Tick: uint                      // Server tick number
    BaselineTick: uint              // 0=full, >0=delta baseline
    LastProcessedInputTick: uint    // For client to detect dropped inputs
    State: GameState {
        Tick: uint
        Players: Dict<string, Player>
        Bullets: Dict<string, Bullet>
    }
}
```

## Delta Encoding

DeltaPack compares current state against baseline and encodes only changed fields:

```
Full state:  ~150-200 bytes (4 players, 5 bullets)
Delta state: ~20-40 bytes (typical, 80%+ compression)
```

Field precision is tuned for minimal bandwidth:

| Field           | Precision      | Bytes   |
| --------------- | -------------- | ------- |
| Position (X, Y) | 0.1            | ~2 each |
| Angle           | 0.01 rad       | ~2      |
| Health/Score    | integer        | 1-2     |
| Booleans        | RLE compressed | <1      |

## Client Interpolation

The `InterpolationBuffer` provides smooth rendering despite network jitter:

```
Server ticks:  [95] [96] [97] [98] [99] [100] ← latest received
                              ↑
               Render here (delay behind latest)
```

Key parameters:

- **Buffer size**: 25 states (~500ms at 50Hz)
- **Render delay**: Adaptive, 50-250ms (see below)
- **On stall**: Holds last state (no extrapolation)

### Adaptive Delay

The interpolation buffer uses **playback rate adjustment** (Source engine approach) to maintain consistent delay:

```
Buffer depth vs target:  Adjust playback speed ±5% per tick of error
On stall:                Increase target delay by 1 tick
When healthy:            Gradually decrease target delay
```

This allows:

- **Good networks**: Low latency (~50ms delay)
- **Lossy networks**: Automatically buffers more to prevent stalls
- **Smooth playback**: Speed adjustments are imperceptible (±10% max)

## Configuration

| Parameter           | Value    | Description                    |
| ------------------- | -------- | ------------------------------ |
| Tick rate           | 50 Hz    | Server simulation rate         |
| State send rate     | 50/sec   | One state per tick             |
| Input send rate     | 50/sec   | Matches tick rate              |
| Input redundancy    | 6 ticks  | ~120ms of inputs per packet    |
| Server history      | 150 ticks| 3 seconds of state             |
| Client history      | 75 ticks | 1.5 seconds of state           |
| Interpolation delay | 50-250ms | Adaptive, render behind latest |

## Server Simulation

The server runs authoritative physics at 50Hz:

- **Player movement**: WASD input, diagonal normalized, clamped to world bounds
- **Player collision**: Circle-circle collision, players push each other apart equally
- **Bullet physics**: Constant velocity, removed on hit or world exit
- **Bullet collision**: Damages players, awards score to shooter on kill
- **Respawn**: 3 second delay, random spawn position

## Running the Example

Start the server:

```bash
cd Server
dotnet run
```

Start one or more clients:

```bash
cd Client
dotnet run [host] [name]

# Examples:
dotnet run                          # Connect to localhost as random name
dotnet run 192.168.1.100 Alice      # Connect to specific host
```

## Network Stats Display

The client shows real-time network stats:

- **Ping**: Round-trip time (ms)
- **Loss**: Packet loss percentage (rolling 2s window)
- **Delay**: Current interpolation delay (shows adaptive system working)
- **BW**: Bandwidth (KB/s downstream)

## Files

```
Shared/
  Messages.cs   - Network message types
  Schema.cs     - Game state with DeltaPack annotations
  Vec2.cs       - 2D vector with precision annotations
  Constants.cs  - Shared configuration

Server/
  Program.cs    - Entry point, tick loop
  GameServer.cs - Networking, delta encoding, client management
  GameSimulation.cs  - Authoritative game simulation

Client/
  Program.cs    - Entry point, input handling
  GameClient.cs - Networking, delta decoding, ack management
  InterpolationBuffer.cs - State buffering and smooth interpolation
  StatsTracker.cs - Network statistics (ping, loss, bandwidth)
  Renderer.cs   - Raylib rendering
```
