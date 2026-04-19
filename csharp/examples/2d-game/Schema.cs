using DeltaPack;

namespace Game2D;

// Player class - property order must match TypeScript exactly
[DeltaPack]
public partial class Player
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";

    [DeltaPackPrecision(0.1)]
    public float X { get; set; }

    [DeltaPackPrecision(0.1)]
    public float Y { get; set; }

    [DeltaPackPrecision(0.1)]
    public float Vx { get; set; }

    [DeltaPackPrecision(0.1)]
    public float Vy { get; set; }

    public int Health { get; set; } = 100;
    public int Score { get; set; }
    public bool IsAlive { get; set; } = true;
}

// GameState class
[DeltaPack]
public partial class GameState
{
    public DeltaPack.OrderedDict<string, Player> Players { get; set; } = new();
    public int Tick { get; set; }
    public float GameTime { get; set; }
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
