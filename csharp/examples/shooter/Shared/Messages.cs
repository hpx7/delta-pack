using DeltaPack;

namespace Shooter.Shared;

// Client -> Server messages
[DeltaPackUnion(typeof(JoinRequest), typeof(InputMessage))]
public abstract class ClientMessage { }

public class JoinRequest : ClientMessage
{
    public string PlayerName { get; set; } = "";
}

public class InputMessage : ClientMessage
{
    public uint LastReceivedTick { get; set; }  // Piggyback ack - more reliable than dedicated acks
    public List<TimestampedInput> Inputs { get; set; } = new();  // Last N inputs for redundancy
}

public class TimestampedInput
{
    public uint Tick { get; set; }
    public ClientInput Input { get; set; } = new();
}

// Server -> Client message (single type, no union needed)
public class StateMessage
{
    public string PlayerId { get; set; } = "";
    public uint Tick { get; set; }
    public uint BaselineTick { get; set; }  // 0 = full encode, >0 = diff from this tick
    public uint LastProcessedInputTick { get; set; }  // For client to detect dropped inputs
    public GameState State { get; set; } = new();
}
