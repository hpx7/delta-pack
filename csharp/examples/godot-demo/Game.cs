using Godot;
using DeltaPack;
using Game2D;
using System;

public partial class Game : Node2D
{
    private const string ServerUrl = "ws://localhost:3000";
    private const float WorldWidth = 800f;
    private const float WorldHeight = 600f;
    private const double InputSendInterval = 1.0 / 30;

    private readonly WebSocketPeer _socket = new();
    private readonly SyncSession<ServerMessage> _session = ServerMessage.CreateSyncSession();

    private string? _myPlayerId;
    private GameState? _state;

    private bool _joinSent;
    private double _sinceLastInput;
    private long _bytesReceived;
    private int _messagesReceived;
    private WebSocketPeer.State _lastLoggedState = WebSocketPeer.State.Connecting;

    public override void _Ready()
    {
        var err = _socket.ConnectToUrl(ServerUrl);
        if (err != Error.Ok)
            GD.PrintErr($"WebSocket connect failed: {err}");
    }

    public override void _Process(double delta)
    {
        _socket.Poll();
        var state = _socket.GetReadyState();

        if (state != _lastLoggedState)
        {
            GD.Print($"[ws] {state}");
            _lastLoggedState = state;
        }

        if (state == WebSocketPeer.State.Open)
        {
            if (!_joinSent)
            {
                SendMessage(new JoinMessage { Name = "Godot" });
                _joinSent = true;
            }

            while (_socket.GetAvailablePacketCount() > 0)
                HandleIncoming(_socket.GetPacket());

            _sinceLastInput += delta;
            if (_sinceLastInput >= InputSendInterval)
            {
                _sinceLastInput = 0;
                SendCurrentInput();
            }
        }

        QueueRedraw();
    }

    private void SendMessage(ClientMessage msg)
    {
        var bytes = ClientMessage.Encode(msg);
        _socket.PutPacket(bytes);
    }

    private void SendCurrentInput()
    {
        var input = new ClientInput
        {
            Up = Input.IsKeyPressed(Key.W) || Input.IsKeyPressed(Key.Up),
            Down = Input.IsKeyPressed(Key.S) || Input.IsKeyPressed(Key.Down),
            Left = Input.IsKeyPressed(Key.A) || Input.IsKeyPressed(Key.Left),
            Right = Input.IsKeyPressed(Key.D) || Input.IsKeyPressed(Key.Right),
            Shoot = Input.IsKeyPressed(Key.Space),
        };
        SendMessage(new InputMessage { Input = input });
    }

    private void HandleIncoming(byte[] data)
    {
        _bytesReceived += data.Length;
        _messagesReceived++;
        try
        {
            // SyncSession.Decode picks full-vs-diff based on whether a prior
            // message has been received.
            var message = _session.Decode(data);

            if (message is StateMessage stateMsg)
            {
                _myPlayerId = stateMsg.PlayerId;
                _state = stateMsg.State;
            }
        }
        catch (Exception e)
        {
            GD.PrintErr($"Decode failed on msg #{_messagesReceived} ({data.Length} B): {e.Message}");
        }
    }

    public override void _Draw()
    {
        DrawRect(new Rect2(0, 0, WorldWidth, WorldHeight), new Color(0.08f, 0.08f, 0.10f), true);
        DrawRect(new Rect2(0, 0, WorldWidth, WorldHeight), new Color(0.25f, 0.25f, 0.30f), false, 2f);

        var font = ThemeDB.FallbackFont;
        var status = _socket.GetReadyState() switch
        {
            WebSocketPeer.State.Connecting => "connecting...",
            WebSocketPeer.State.Open => $"connected {ServerUrl}",
            WebSocketPeer.State.Closing => "closing",
            WebSocketPeer.State.Closed => "closed (start server: cd csharp/examples/2d-game && dotnet run)",
            _ => "?"
        };

        var hud = _state is null
            ? status
            : $"{status}   tick {_state.Tick}   players {_state.Players.Count}   recv {FmtBytes(_bytesReceived)} / {_messagesReceived} msgs";
        DrawString(font, new Vector2(10, 22), hud, HorizontalAlignment.Left, -1, 14, new Color(0.9f, 0.9f, 0.95f));
        DrawString(font, new Vector2(10, 42), "WASD / arrows to move   |   schema shared with ../2d-game/Schema.cs", HorizontalAlignment.Left, -1, 12, new Color(0.6f, 0.6f, 0.65f));

        if (_state is null) return;

        foreach (var kvp in _state.Players)
        {
            var p = kvp.Value;
            bool isMe = p.Id == _myPlayerId;
            var color = ColorForId(p.Id);
            var rect = new Rect2(p.X - 10, p.Y - 10, 20, 20);
            DrawRect(rect, color, true);
            if (isMe)
                DrawRect(rect.Grow(2), Colors.White, false, 2f);
            DrawString(font, new Vector2(p.X - 20, p.Y - 15), p.Name, HorizontalAlignment.Left, -1, 12, Colors.White);
        }
    }

    private static Color ColorForId(string id)
    {
        uint hash = 2166136261u;
        foreach (char c in id)
            hash = (hash ^ c) * 16777619u;
        float hue = (hash % 360) / 360f;
        return Color.FromHsv(hue, 0.65f, 0.95f);
    }

    private static string FmtBytes(long b)
    {
        if (b < 1024) return $"{b} B";
        if (b < 1024 * 1024) return $"{b / 1024.0:F1} KB";
        return $"{b / (1024.0 * 1024.0):F2} MB";
    }

    public override void _ExitTree()
    {
        if (_socket.GetReadyState() != WebSocketPeer.State.Closed)
            _socket.Close();
    }
}
