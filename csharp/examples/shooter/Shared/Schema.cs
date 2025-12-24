using DeltaPack;

namespace Shooter.Shared;

public class GameState
{
    public Dictionary<string, Player> Players { get; set; } = new();
    public Dictionary<string, Bullet> Bullets { get; set; } = new();
    public uint Tick { get; set; }
}

public class Player
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public Vec2 Position { get; set; }

    [DeltaPackPrecision(0.01)]
    public float AimAngle { get; set; }

    public uint Health { get; set; } = Constants.PlayerMaxHealth;
    public bool IsAlive { get; set; } = true;
    public uint Score { get; set; }
    public uint Deaths { get; set; }

    [DeltaPackPrecision(0.1)]
    public float RespawnTimer { get; set; }

    [DeltaPackPrecision(0.1)]
    public float ShootCooldown { get; set; }

    public PlayerColor Color { get; set; } = PlayerColor.Red;
}

public enum PlayerColor
{
    Red,
    Blue,
    Green,
    Yellow,
    Purple,
    Orange
}

public class Bullet
{
    public string Id { get; set; } = "";
    public string OwnerId { get; set; } = "";
    public Vec2 Position { get; set; }
    public Vec2 Velocity { get; set; }

    [DeltaPackPrecision(0.1)]
    public float TimeToLive { get; set; }
}

public class ClientInput
{
    public bool Up { get; set; }
    public bool Down { get; set; }
    public bool Left { get; set; }
    public bool Right { get; set; }
    public uint ShootSeq { get; set; }  // Increments on each click

    [DeltaPackPrecision(0.01)]
    public float AimAngle { get; set; }
}
