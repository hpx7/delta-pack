using DeltaPack;
using Fleck;

namespace Game2D;

public class GameServer
{
    private const int Port = 3000;
    private const int TickRate = 20;
    private const int StatsIntervalMs = 5000;

    private readonly GameLogic _game = new();
    private readonly Dictionary<string, ConnectedClient> _clients = new();
    private readonly Dictionary<IWebSocketConnection, string> _socketToClientId = new();
    private readonly DeltaPackCodec<ClientMessage> _clientMessageCodec = new();
    private readonly DeltaPackCodec<ServerMessage> _serverMessageCodec = new();

    private WebSocketServer? _server;
    private Timer? _tickTimer;
    private Timer? _statsTimer;
    private int _clientIdCounter;

    // Stats tracking
    private long _totalBytesSent;
    private int _totalUpdates;
    private long _lastSecondBytes;
    private int _lastSecondUpdates;
    private double _avgDiffSize;

    private class ConnectedClient
    {
        public required string Id { get; init; }
        public required IWebSocketConnection Socket { get; init; }
        public string Name { get; set; } = "";
        public ServerMessage? LastMessage { get; set; }
    }

    public void Start()
    {
        _server = new WebSocketServer($"ws://0.0.0.0:{Port}");

        _server.Start(socket =>
        {
            socket.OnOpen = () => HandleConnection(socket);
            socket.OnClose = () => HandleDisconnection(socket);
            socket.OnBinary = data => HandleMessage(socket, data);
            socket.OnError = ex => Console.WriteLine($"WebSocket error: {ex.Message}");
        });

        Console.WriteLine($"WebSocket server started on ws://localhost:{Port}");
        Console.WriteLine("Server ready for connections");

        // Start game tick timer
        _tickTimer = new Timer(_ =>
        {
            _game.Tick();
            BroadcastState();
        }, null, 0, 1000 / TickRate);

        // Start stats timer
        _statsTimer = new Timer(_ => LogStats(), null, StatsIntervalMs, StatsIntervalMs);
    }

    private void HandleConnection(IWebSocketConnection socket)
    {
        var clientId = $"player-{++_clientIdCounter}";

        // Store socket to client ID mapping
        _socketToClientId[socket] = clientId;

        Console.WriteLine($"Client connected: {clientId}");
    }

    private void HandleDisconnection(IWebSocketConnection socket)
    {
        var clientId = GetClientId(socket);
        if (clientId == null) return;

        _game.RemovePlayer(clientId);
        _clients.Remove(clientId);
        _socketToClientId.Remove(socket);
        Console.WriteLine($"Client disconnected: {clientId}");
    }

    private void HandleMessage(IWebSocketConnection socket, byte[] data)
    {
        var clientId = GetClientId(socket);
        if (clientId == null) return;

        try
        {
            var message = _clientMessageCodec.Decode(data);

            switch (message)
            {
                case JoinMessage joinMsg:
                    HandleJoin(socket, clientId, joinMsg);
                    break;

                case InputMessage inputMsg:
                    HandleInput(clientId, inputMsg);
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to decode message: {ex.Message}");
        }
    }

    private void HandleJoin(IWebSocketConnection socket, string clientId, JoinMessage joinMsg)
    {
        var playerName = string.IsNullOrEmpty(joinMsg.Name) ? $"Player{_clientIdCounter}" : joinMsg.Name;
        _game.AddPlayer(clientId, playerName);

        var client = new ConnectedClient
        {
            Id = clientId,
            Socket = socket,
            Name = playerName
        };
        _clients[clientId] = client;

        // Send initial full state
        var stateMsg = new StateMessage
        {
            PlayerId = clientId,
            State = _game.State
        };

        client.LastMessage = stateMsg;
        var encoded = _serverMessageCodec.Encode(stateMsg);
        socket.Send(encoded);

        Console.WriteLine($"{playerName} joined the game");
    }

    private void HandleInput(string clientId, InputMessage inputMsg)
    {
        _game.SetPlayerInput(clientId, inputMsg.Input);
    }

    private void BroadcastState()
    {
        if (_clients.Count == 0) return;

        long totalBytes = 0;

        foreach (var client in _clients.Values)
        {
            if (!client.Socket.IsAvailable) continue;
            if (client.LastMessage == null) continue;

            // Create update message with current state
            var updateMessage = new StateMessage
            {
                PlayerId = client.Id,
                State = _game.State
            };

            // Send diff from last message
            var encoded = _serverMessageCodec.EncodeDiff(client.LastMessage, updateMessage);
            client.Socket.Send(encoded);
            totalBytes += encoded.Length;

            // Clone and update client's last message
            client.LastMessage = _serverMessageCodec.Clone(updateMessage);
        }

        // Track stats
        _totalBytesSent += totalBytes;
        _totalUpdates++;
        _lastSecondBytes += totalBytes;
        _lastSecondUpdates++;

        var avgSize = _clients.Count > 0 ? (double)totalBytes / _clients.Count : 0;
        _avgDiffSize = (_avgDiffSize * (_totalUpdates - 1) + avgSize) / _totalUpdates;
    }

    private void LogStats()
    {
        var (players, tick, gameTime) = _game.GetStats();
        var bytesPerSecond = _lastSecondBytes / (StatsIntervalMs / 1000.0);
        var updatesPerSecond = _lastSecondUpdates / (StatsIntervalMs / 1000.0);

        Console.WriteLine();
        Console.WriteLine("Server Stats:");
        Console.WriteLine($"  Players: {players}");
        Console.WriteLine($"  Tick: {tick} ({gameTime:F1}s)");
        Console.WriteLine($"  Avg diff size: {_avgDiffSize:F1} bytes");
        Console.WriteLine($"  Bandwidth: {bytesPerSecond / 1024:F2} KB/s");
        Console.WriteLine($"  Updates/sec: {updatesPerSecond:F1}");

        // Reset per-second counters
        _lastSecondBytes = 0;
        _lastSecondUpdates = 0;
    }

    private string? GetClientId(IWebSocketConnection socket)
    {
        return _socketToClientId.TryGetValue(socket, out var id) ? id : null;
    }

    public void Stop()
    {
        Console.WriteLine();
        Console.WriteLine("Shutting down server...");

        _tickTimer?.Dispose();
        _statsTimer?.Dispose();
        _server?.Dispose();

        Console.WriteLine("Server stopped");
    }
}
