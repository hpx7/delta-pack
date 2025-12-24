using System.Net;
using System.Net.Sockets;
using DeltaPack;
using LiteNetLib;
using LiteNetLib.Utils;
using Shooter.Shared;

namespace Shooter.Server;

public class GameServer : INetEventListener
{
    private readonly NetManager _netManager;
    private readonly GameSimulation _game = new();
    private readonly Dictionary<int, ClientState> _clients = new();  // peer.Id -> state

    private readonly DeltaPackCodec<ClientMessage> _clientCodec = new();
    private readonly DeltaPackCodec<StateMessage> _stateCodec = new();
    private readonly DeltaPackCodec<GameState> _gameStateCodec = new();

    private readonly Dictionary<uint, GameState> _stateHistory = new();

    private int _playerIdCounter;

    // Diagnostics
    private DateTime _lastStatsLog = DateTime.UtcNow;
    private const int StatsLogIntervalSeconds = 10;
    private int _ticksSinceLastLog;
    private long _lastBytesReceived;
    private long _lastBytesSent;
    private long _lastPacketsReceived;
    private long _lastPacketsSent;

    private class ClientState
    {
        public required string PlayerId { get; init; }
        public required NetPeer Peer { get; init; }
        public string Name { get; set; } = "";
        public bool JoinedGame { get; set; }
        public uint LastAckedTick { get; set; }  // For ack-based delta encoding
    }

    public GameServer(bool simulatePacketLoss = false)
    {
        _netManager = new NetManager(this)
        {
            AutoRecycle = true,
            UpdateTime = 15,
            UseNativeSockets = true,       // Better performance on Windows/Linux
            AllowPeerAddressChange = true, // Handle mobile players switching networks
            EnableStatistics = true
        };

        if (simulatePacketLoss)
        {
            _netManager.SimulatePacketLoss = true;
            _netManager.SimulationPacketLossChance = 30;  // 30% loss
            _netManager.SimulateLatency = true;
            _netManager.SimulationMinLatency = 100;
            _netManager.SimulationMaxLatency = 200;
            Console.WriteLine("Network simulation enabled: 30% packet loss, 100-200ms latency");
        }
    }

    public void Start()
    {
        _netManager.Start(Constants.ServerPort);
        Console.WriteLine($"Server started on port {Constants.ServerPort}");

        Console.WriteLine("Press Ctrl+C to stop");
        Console.CancelKeyPress += (_, e) =>
        {
            e.Cancel = true;
            Stop();
        };

        // Single-threaded main loop with fixed timestep
        var lastTick = DateTime.UtcNow;
        var tickInterval = TimeSpan.FromMilliseconds(1000.0 / Constants.TickRate);

        while (_netManager.IsRunning)
        {
            _netManager.PollEvents();

            // Run game tick at fixed rate
            var now = DateTime.UtcNow;
            if (now - lastTick > tickInterval * 10)
            {
                var behind = (now - lastTick).TotalMilliseconds;
                Console.WriteLine($"[WARN] Server {behind:F0}ms behind, resetting tick timer");
                lastTick = now;
            }
            if (now - lastTick >= tickInterval)
            {
                lastTick += tickInterval;
                Tick();
                LogPeriodicStats();
            }

            Thread.Sleep(1);
        }
    }

    public void Stop()
    {
        Console.WriteLine("Stopping server...");
        _netManager.Stop();
    }

    private void LogPeriodicStats()
    {
        _ticksSinceLastLog++;
        var now = DateTime.UtcNow;
        var elapsed = (now - _lastStatsLog).TotalSeconds;

        if (elapsed >= StatsLogIntervalSeconds)
        {
            var actualTickRate = _ticksSinceLastLog / elapsed;
            var playerCount = _clients.Values.Count(c => c.JoinedGame);

            // Calculate bandwidth and packet rates
            var stats = _netManager.Statistics;
            var bytesIn = stats.BytesReceived - _lastBytesReceived;
            var bytesOut = stats.BytesSent - _lastBytesSent;
            var packetsIn = stats.PacketsReceived - _lastPacketsReceived;
            var packetsOut = stats.PacketsSent - _lastPacketsSent;

            var inKBps = bytesIn / 1024.0 / elapsed;
            var outKBps = bytesOut / 1024.0 / elapsed;
            var avgPacketIn = packetsIn > 0 ? bytesIn / packetsIn : 0;
            var avgPacketOut = packetsOut > 0 ? bytesOut / packetsOut : 0;

            Console.WriteLine($"[STATS] Tick {_game.State.Tick} | " +
                $"Players: {playerCount} | " +
                $"FPS: {actualTickRate:F1} | " +
                $"In: {inKBps:F1} KB/s, {packetsIn / elapsed:F0} pkt/s, {avgPacketIn:F0} B/pkt | " +
                $"Out: {outKBps:F1} KB/s, {packetsOut / elapsed:F0} pkt/s, {avgPacketOut:F0} B/pkt");

            _lastStatsLog = now;
            _ticksSinceLastLog = 0;
            _lastBytesReceived = stats.BytesReceived;
            _lastBytesSent = stats.BytesSent;
            _lastPacketsReceived = stats.PacketsReceived;
            _lastPacketsSent = stats.PacketsSent;
        }
    }

    private void Tick()
    {
        _game.Update(Constants.TickDuration);

        // Store cloned state for delta encoding
        _stateHistory[_game.State.Tick] = _gameStateCodec.Clone(_game.State);

        // Prune old history
        var minTick = _game.State.Tick - Constants.MaxHistoryTicks;
        foreach (var tick in _stateHistory.Keys.Where(t => t < minTick).ToList())
            _stateHistory.Remove(tick);

        BroadcastState();
    }

    private void BroadcastState()
    {
        foreach (var client in _clients.Values)
        {
            if (!client.JoinedGame) continue;
            if (client.Peer.ConnectionState != ConnectionState.Connected) continue;

            // Create message with current state
            var message = new StateMessage
            {
                PlayerId = client.PlayerId,
                Tick = _game.State.Tick,
                LastProcessedInputTick = _game.GetLastProcessedInputTick(client.PlayerId),
                State = _game.State
            };

            // Prefix with baseline tick so client knows which state to decode from
            var writer = new NetDataWriter();

            if (_stateHistory.TryGetValue(client.LastAckedTick, out var baseline))
            {
                // Diff from client's last acked state
                writer.Put(client.LastAckedTick);  // Baseline tick prefix
                message.BaselineTick = client.LastAckedTick;
                var baselineMessage = new StateMessage
                {
                    PlayerId = client.PlayerId,
                    Tick = client.LastAckedTick,
                    BaselineTick = 0,
                    LastProcessedInputTick = 0,  // Will be overwritten by diff
                    State = baseline
                };
                writer.Put(_stateCodec.EncodeDiff(baselineMessage, message));
            }
            else
            {
                // Client too far behind or new - send full state
                if (client.LastAckedTick > 0)
                {
                    var ticksBehind = _game.State.Tick - client.LastAckedTick;
                    Console.WriteLine($"[WARN] {client.Name} ack {ticksBehind} ticks behind, sending full state");
                }
                writer.Put(0);  // Baseline tick = 0 means full state
                message.BaselineTick = 0;
                writer.Put(_stateCodec.Encode(message));
            }

            client.Peer.Send(writer, DeliveryMethod.Sequenced);
        }
    }

    private void HandleMessage(NetPeer peer, byte[] data)
    {
        if (!_clients.TryGetValue(peer.Id, out var client))
            return;

        try
        {
            var message = _clientCodec.Decode(data);

            switch (message)
            {
                case JoinRequest joinRequest:
                    HandleJoinRequest(client, joinRequest);
                    break;
                case InputMessage inputMessage:
                    HandleInput(client, inputMessage);
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling message from {client.PlayerId}: {ex.Message}");
        }
    }

    private void HandleJoinRequest(ClientState client, JoinRequest request)
    {
        if (client.JoinedGame)
            return;

        var name = string.IsNullOrWhiteSpace(request.PlayerName)
            ? $"Player{_playerIdCounter}"
            : request.PlayerName;

        client.Name = name;
        client.JoinedGame = true;
        _game.AddPlayer(client.PlayerId, name);

        Console.WriteLine($"{name} joined the game");

        // First state message will be sent on next tick via BroadcastState
    }

    private void HandleInput(ClientState client, InputMessage message)
    {
        if (!client.JoinedGame)
        {
            Console.WriteLine($"[WARN] {client.PlayerId} sent input before joining");
            return;
        }

        // Update acked tick from piggybacked value (more reliable than dedicated acks)
        if (message.LastReceivedTick > client.LastAckedTick)
            client.LastAckedTick = message.LastReceivedTick;

        // Delegate all input processing to game logic
        _game.ProcessInputs(client.PlayerId, message.Inputs);
    }

    // INetEventListener implementation

    public void OnPeerConnected(NetPeer peer)
    {
        var playerId = $"player-{++_playerIdCounter}";
        _clients[peer.Id] = new ClientState
        {
            PlayerId = playerId,
            Peer = peer
        };
        Console.WriteLine($"Client connected: {playerId}");
    }

    public void OnPeerDisconnected(NetPeer peer, DisconnectInfo disconnectInfo)
    {
        if (_clients.TryGetValue(peer.Id, out var client))
        {
            var displayName = string.IsNullOrEmpty(client.Name) ? client.PlayerId : client.Name;
            Console.WriteLine($"{displayName} disconnected: {disconnectInfo.Reason}");
            _game.RemovePlayer(client.PlayerId);
            _clients.Remove(peer.Id);
        }
    }

    public void OnNetworkReceive(NetPeer peer, NetPacketReader reader, byte channelNumber, DeliveryMethod deliveryMethod)
    {
        var data = new byte[reader.AvailableBytes];
        reader.GetBytes(data, data.Length);
        HandleMessage(peer, data);
    }

    public void OnNetworkError(IPEndPoint endPoint, SocketError socketError)
    {
        Console.WriteLine($"Network error from {endPoint}: {socketError}");
    }

    public void OnConnectionRequest(ConnectionRequest request)
    {
        if (request.Data.TryGetString(out var key) && key == Constants.ConnectionKey)
        {
            request.Accept();
        }
        else
        {
            request.Reject();
            Console.WriteLine("Connection rejected: invalid key");
        }
    }

    public void OnNetworkReceiveUnconnected(IPEndPoint remoteEndPoint, NetPacketReader reader, UnconnectedMessageType messageType)
    {
    }

    public void OnNetworkLatencyUpdate(NetPeer peer, int latency)
    {
    }
}
