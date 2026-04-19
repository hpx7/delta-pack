namespace DeltaPack.Tests.Tracking.Models;

// Exercises the "partial property, no tracking" case. Users may adopt partial-property
// syntax ahead of enabling [DeltaPackTracked] so toggling tracking later doesn't require
// touching every property. The generator emits trivial implementing declarations when
// it sees partial properties on an untracked class.

[DeltaPack]
public partial class PartialUntrackedPosition
{
    public partial float X { get; set; }
    public partial float Y { get; set; }
}

// Mixed auto and partial properties on the same class should also compile.
[DeltaPack]
public partial class PartialUntrackedMixed
{
    public partial string Name { get; set; }
    public uint Score { get; set; }
}
