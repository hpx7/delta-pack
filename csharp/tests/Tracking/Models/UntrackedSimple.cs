using System.Collections.Generic;

namespace DeltaPack.Tests.Tracking.Models;

// Structurally identical to TrackedPosition / TrackedPlayer but without tracking.
// Used to assert that the tracked encoder produces the same bytes as the untracked one
// for a typical mutate-and-diff workflow.

[DeltaPack]
public partial class UntrackedPosition
{
    public float X { get; set; }
    public float Y { get; set; }
}

[DeltaPack]
public partial class UntrackedPlayer
{
    public string Name { get; set; } = "";
    public uint Score { get; set; }
    public UntrackedPosition Pos { get; set; } = new();
    public List<int> Inventory { get; set; } = new();
    public OrderedDict<string, int> Stats { get; set; } = new();
}
