using DeltaPack;

namespace Shooter.Shared;

[DeltaPack, DeltaPackTracked]
public partial class GameState
{
    public partial TrackedOrderedDict<string, Player> Players { get; set; }
    public partial TrackedOrderedDict<string, Bullet> Bullets { get; set; }
    public partial uint Tick { get; set; }
}

[DeltaPack, DeltaPackTracked]
public partial class Player
{
    public partial string Id { get; set; }
    public partial string Name { get; set; }
    public partial Vec2 Position { get; set; }

    [DeltaPackPrecision(0.01)]
    public partial float AimAngle { get; set; }

    public partial uint Health { get; set; }
    public partial bool IsAlive { get; set; }
    public partial uint Score { get; set; }
    public partial uint Deaths { get; set; }

    [DeltaPackPrecision(0.1)]
    public partial float RespawnTimer { get; set; }

    [DeltaPackPrecision(0.1)]
    public partial float ShootCooldown { get; set; }

    public partial PlayerColor Color { get; set; }
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

[DeltaPack, DeltaPackTracked]
public partial class Bullet
{
    public partial string Id { get; set; }
    public partial string OwnerId { get; set; }
    public partial Vec2 Position { get; set; }
    public partial Vec2 Velocity { get; set; }

    [DeltaPackPrecision(0.1)]
    public partial float TimeToLive { get; set; }
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
