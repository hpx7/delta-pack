using Shooter.Shared;

namespace Shooter.Server;

public class GameSimulation
{
    private readonly GameState _state = new();
    private readonly Dictionary<string, ClientInput> _playerInputs = new();
    private readonly Dictionary<string, uint> _lastProcessedInputTick = new();
    private readonly Dictionary<string, uint> _lastProcessedShootSeq = new();
    private readonly Random _random = new();
    private int _bulletIdCounter;

    private static readonly PlayerColor[] Colors =
        Enum.GetValues<PlayerColor>();

    public GameState State => _state;

    public uint GetLastProcessedInputTick(string playerId)
        => _lastProcessedInputTick.GetValueOrDefault(playerId);

    public void AddPlayer(string id, string name)
    {
        var player = new Player
        {
            Id = id,
            Name = name,
            Position = GetRandomSpawnPosition(),
            Color = Colors[_state.Players.Count % Colors.Length]
        };
        _state.Players[id] = player;
    }

    private Vec2 GetRandomSpawnPosition()
    {
        const float margin = 50;
        return new Vec2(
            _random.NextSingle() * (Constants.WorldWidth - 2 * margin) + margin,
            _random.NextSingle() * (Constants.WorldHeight - 2 * margin) + margin
        );
    }

    public void RemovePlayer(string id)
    {
        _state.Players.Remove(id);
        _playerInputs.Remove(id);
        _lastProcessedInputTick.Remove(id);
        _lastProcessedShootSeq.Remove(id);

        // Remove bullets owned by this player
        var bulletsToRemove = _state.Bullets
            .Where(b => b.Value.OwnerId == id)
            .Select(b => b.Key)
            .ToList();
        foreach (var bulletId in bulletsToRemove)
            _state.Bullets.Remove(bulletId);
    }

    /// <summary>
    /// Process all inputs from redundancy window, handling shots and movement.
    /// </summary>
    public void ProcessInputs(string playerId, List<TimestampedInput> inputs)
    {
        if (!_state.Players.TryGetValue(playerId, out var player))
            return;

        _lastProcessedInputTick.TryGetValue(playerId, out var lastTick);
        _lastProcessedShootSeq.TryGetValue(playerId, out var lastSeq);

        // Process each new input for shots
        foreach (var timestamped in inputs)
        {
            if (timestamped.Tick <= lastTick)
                continue;

            // Check for new shot
            if (timestamped.Input.ShootSeq > lastSeq)
            {
                lastSeq = timestamped.Input.ShootSeq;
                TryShoot(player, timestamped.Input.AimAngle);
            }
        }

        // Apply latest movement input
        if (inputs.Count > 0 && inputs[^1].Tick > lastTick)
        {
            lastTick = inputs[^1].Tick;
            _playerInputs[playerId] = inputs[^1].Input;
        }

        _lastProcessedInputTick[playerId] = lastTick;
        _lastProcessedShootSeq[playerId] = lastSeq;
    }

    private void TryShoot(Player player, float aimAngle)
    {
        if (!player.IsAlive || player.ShootCooldown > 0)
            return;

        SpawnBullet(player, aimAngle);
        player.ShootCooldown = Constants.ShootCooldown;
    }

    public void Update(float dt)
    {
        _state.Tick++;

        UpdatePlayers(dt);
        UpdateBullets(dt);
        CheckCollisions();
        UpdateRespawns(dt);
    }

    private void UpdatePlayers(float dt)
    {
        foreach (var player in _state.Players.Values)
        {
            if (!player.IsAlive) continue;

            // Update cooldowns
            player.ShootCooldown = MathF.Max(0, player.ShootCooldown - dt);

            // Get input
            if (!_playerInputs.TryGetValue(player.Id, out var input))
                continue;

            // Update aim
            player.AimAngle = input.AimAngle;

            // Calculate movement direction
            var dir = new Vec2(
                (input.Right ? 1 : 0) - (input.Left ? 1 : 0),
                (input.Down ? 1 : 0) - (input.Up ? 1 : 0)
            );

            // Normalize diagonal movement
            if (dir.LengthSquared() > 1)
                dir = dir.Normalized();

            // Apply movement
            player.Position += dir * Constants.PlayerSpeed * dt;

            // Clamp to world bounds
            player.Position = new Vec2(
                Math.Clamp(player.Position.X, Constants.PlayerRadius, Constants.WorldWidth - Constants.PlayerRadius),
                Math.Clamp(player.Position.Y, Constants.PlayerRadius, Constants.WorldHeight - Constants.PlayerRadius)
            );
        }
    }

    private void SpawnBullet(Player player, float aimAngle)
    {
        var direction = new Vec2(MathF.Cos(aimAngle), MathF.Sin(aimAngle));
        var spawnOffset = Constants.PlayerRadius + Constants.BulletRadius + 2;

        var bullet = new Bullet
        {
            Id = $"b{++_bulletIdCounter}",
            OwnerId = player.Id,
            Position = player.Position + direction * spawnOffset,
            Velocity = direction * Constants.BulletSpeed,
            TimeToLive = Constants.BulletTimeToLive
        };
        _state.Bullets[bullet.Id] = bullet;
    }

    private void UpdateBullets(float dt)
    {
        var bulletsToRemove = new List<string>();

        foreach (var bullet in _state.Bullets.Values)
        {
            // Move
            bullet.Position += bullet.Velocity * dt;

            // Update TTL
            bullet.TimeToLive -= dt;

            // Check bounds and TTL
            if (bullet.TimeToLive <= 0 ||
                bullet.Position.X < -Constants.BulletRadius ||
                bullet.Position.X > Constants.WorldWidth + Constants.BulletRadius ||
                bullet.Position.Y < -Constants.BulletRadius ||
                bullet.Position.Y > Constants.WorldHeight + Constants.BulletRadius)
            {
                bulletsToRemove.Add(bullet.Id);
            }
        }

        foreach (var id in bulletsToRemove)
            _state.Bullets.Remove(id);
    }

    private void CheckCollisions()
    {
        // Player-player collision resolution
        var players = _state.Players.Values.Where(p => p.IsAlive).ToList();
        for (var i = 0; i < players.Count; i++)
        {
            for (var j = i + 1; j < players.Count; j++)
            {
                var a = players[i];
                var b = players[j];

                var delta = b.Position - a.Position;
                var distSq = delta.LengthSquared();
                var minDist = Constants.PlayerRadius * 2;

                if (distSq < minDist * minDist && distSq > 0)
                {
                    // Push apart equally
                    var dist = MathF.Sqrt(distSq);
                    var overlap = (minDist - dist) / 2;
                    var normal = delta / dist;

                    a.Position -= normal * overlap;
                    b.Position += normal * overlap;
                }
            }
        }

        // Bullet-player collisions
        var bulletsToRemove = new List<string>();

        foreach (var bullet in _state.Bullets.Values)
        {
            foreach (var player in _state.Players.Values)
            {
                // Don't hit self or dead players
                if (player.Id == bullet.OwnerId || !player.IsAlive)
                    continue;

                // Circle-circle collision
                var delta = player.Position - bullet.Position;
                var distSq = delta.LengthSquared();
                var minDist = Constants.PlayerRadius + Constants.BulletRadius;

                if (distSq < minDist * minDist)
                {
                    // Hit!
                    player.Health -= Constants.BulletDamage;
                    bulletsToRemove.Add(bullet.Id);

                    if (player.Health <= 0)
                    {
                        player.IsAlive = false;
                        player.Deaths++;
                        player.RespawnTimer = Constants.RespawnDelay;

                        // Award score to shooter
                        if (_state.Players.TryGetValue(bullet.OwnerId, out var shooter))
                            shooter.Score++;
                    }

                    break;  // Bullet can only hit one player
                }
            }
        }

        foreach (var id in bulletsToRemove)
            _state.Bullets.Remove(id);
    }

    private void UpdateRespawns(float dt)
    {
        foreach (var player in _state.Players.Values)
        {
            if (player.IsAlive) continue;

            player.RespawnTimer -= dt;
            if (player.RespawnTimer <= 0)
            {
                player.IsAlive = true;
                player.Health = Constants.PlayerMaxHealth;
                player.Position = GetRandomSpawnPosition();
            }
        }
    }
}
