using DeltaPack;

namespace Shooter.Shared;

[DeltaPack]
public partial class GameState
{
    public OrderedDict<string, Player> Players { get; set; } = new();
    public OrderedDict<string, Bullet> Bullets { get; set; } = new();
    public uint Tick { get; set; }
}

[DeltaPack]
public partial class Player
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

[DeltaPack]
public partial class Bullet
{
    public string Id { get; set; } = "";
    public string OwnerId { get; set; } = "";
    public Vec2 Position { get; set; }
    public Vec2 Velocity { get; set; }

    [DeltaPackPrecision(0.1)]
    public float TimeToLive { get; set; }
}

[DeltaPack]
public partial class ClientInput
{
    public bool Up { get; set; }
    public bool Down { get; set; }
    public bool Left { get; set; }
    public bool Right { get; set; }
    public uint ShootSeq { get; set; }  // Increments on each click

    [DeltaPackPrecision(0.01)]
    public float AimAngle { get; set; }
}
