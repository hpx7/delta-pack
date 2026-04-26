using DeltaPack;

namespace Game2D;

// Player class - property order must match TypeScript exactly
[DeltaPack]
public partial class Player
{
    public partial string Id { get; set; }
    public partial string Name { get; set; }

    [DeltaPackPrecision(0.1)]
    public partial float X { get; set; }

    [DeltaPackPrecision(0.1)]
    public partial float Y { get; set; }

    [DeltaPackPrecision(0.1)]
    public partial float Vx { get; set; }

    [DeltaPackPrecision(0.1)]
    public partial float Vy { get; set; }

    public partial int Health { get; set; }
    public partial int Score { get; set; }
    public partial bool IsAlive { get; set; }
}

// GameState class
[DeltaPack]
public partial class GameState
{
    public partial DPDict<string, Player> Players { get; set; }
    public partial int Tick { get; set; }
    public partial float GameTime { get; set; }
}

// ClientInput class
[DeltaPack]
public partial class ClientInput
{
    public bool Up { get; set; }
    public bool Down { get; set; }
    public bool Left { get; set; }
    public bool Right { get; set; }
    public bool Shoot { get; set; }
}

// Client -> Server messages
[DeltaPack]
[DeltaPackUnion(typeof(JoinMessage), typeof(InputMessage))]
public abstract partial class ClientMessage { }

[DeltaPack]
public partial class JoinMessage : ClientMessage
{
    public string Name { get; set; } = "";
}

[DeltaPack]
public partial class InputMessage : ClientMessage
{
    public ClientInput Input { get; set; } = new();
}

// Server -> Client messages
[DeltaPack]
[DeltaPackUnion(typeof(StateMessage))]
public abstract partial class ServerMessage { }

[DeltaPack]
public partial class StateMessage : ServerMessage
{
    public string PlayerId { get; set; } = "";
    public GameState State { get; set; } = new();
}
