namespace Game2D;

public class GameLogic
{
    private readonly GameState _state = new();
    private readonly Dictionary<string, ClientInput> _playerInputs = new();
    private readonly DateTime _startTime = DateTime.UtcNow;

    // Game constants
    private const float PlayerSpeed = 200f; // pixels per second
    private const float WorldWidth = 800f;
    private const float WorldHeight = 600f;
    private const int MaxPlayers = 100;
    private const int TickRate = 20;

    public GameState State => _state;

    public Player AddPlayer(string id, string name)
    {
        if (_state.Players.Count >= MaxPlayers)
            throw new InvalidOperationException("Server full");

        var random = new Random();
        var player = new Player
        {
            Id = id,
            Name = name,
            X = (float)(random.NextDouble() * WorldWidth),
            Y = (float)(random.NextDouble() * WorldHeight),
            Health = 100,
            IsAlive = true
        };

        _state.Players[id] = player;
        Console.WriteLine($"Player {name} ({id}) joined. Total players: {_state.Players.Count}");
        return player;
    }

    public void RemovePlayer(string id)
    {
        if (_state.Players.Remove(id))
        {
            _playerInputs.Remove(id);
            Console.WriteLine($"Player {id} left. Total players: {_state.Players.Count}");
        }
    }

    public void SetPlayerInput(string playerId, ClientInput input)
    {
        _playerInputs[playerId] = input;
    }

    public void Tick()
    {
        var deltaTime = 1f / TickRate;

        // Update game time
        _state.GameTime = (float)(DateTime.UtcNow - _startTime).TotalSeconds;
        _state.Tick++;

        // Process player inputs and update physics
        foreach (var (playerId, input) in _playerInputs)
        {
            if (!_state.Players.TryGetValue(playerId, out var player))
                continue;
            if (!player.IsAlive)
                continue;

            float vx = 0;
            float vy = 0;

            if (input.Up) vy -= PlayerSpeed;
            if (input.Down) vy += PlayerSpeed;
            if (input.Left) vx -= PlayerSpeed;
            if (input.Right) vx += PlayerSpeed;

            if (vx == 0 && vy == 0 && player.Vx == 0 && player.Vy == 0)
                continue;

            // Normalize diagonal movement
            if (vx != 0 && vy != 0)
            {
                var length = MathF.Sqrt(vx * vx + vy * vy);
                vx = vx / length * PlayerSpeed;
                vy = vy / length * PlayerSpeed;
            }

            // Update velocity
            player.Vx = vx;
            player.Vy = vy;

            // Update position
            player.X += vx * deltaTime;
            player.Y += vy * deltaTime;

            // Clamp to world bounds
            player.X = Math.Clamp(player.X, 0, WorldWidth);
            player.Y = Math.Clamp(player.Y, 0, WorldHeight);
        }
    }

    public (int players, int tick, float gameTime) GetStats()
    {
        return (_state.Players.Count, _state.Tick, _state.GameTime);
    }
}
