using DeltaPack;

namespace Shooter.Shared;

// Client -> Server messages
[DeltaPack]
[DeltaPackUnion(typeof(JoinRequest), typeof(InputMessage))]
public abstract partial class ClientMessage { }

[DeltaPack]
public partial class JoinRequest : ClientMessage
{
    public string PlayerName { get; set; } = "";
}

[DeltaPack]
public partial class InputMessage : ClientMessage
{
    public uint LastReceivedTick { get; set; }  // Piggyback ack - more reliable than dedicated acks
    public List<TimestampedInput> Inputs { get; set; } = new();  // Last N inputs for redundancy
}

[DeltaPack]
public partial class TimestampedInput
{
    public uint Tick { get; set; }
    public ClientInput Input { get; set; } = new();
}

// Server -> Client message (single type, no union needed)
[DeltaPack]
public partial class StateMessage
{
    public string PlayerId { get; set; } = "";
    public uint Tick { get; set; }
    public uint BaselineTick { get; set; }  // 0 = full encode, >0 = diff from this tick
    public uint LastProcessedInputTick { get; set; }  // For client to detect dropped inputs
    public GameState State { get; set; } = new();
}
