using System.Collections.Generic;

namespace DeltaPack.Tests.Tracking.Models;

[DeltaPack]
public partial class TrackedPosition
{
    public partial float X { get; set; }
    public partial float Y { get; set; }
}

[DeltaPack]
public partial class TrackedPlayer
{
    public partial string Name { get; set; }
    public partial uint Score { get; set; }
    public partial TrackedPosition Pos { get; set; }
    public partial DPList<int> Inventory { get; set; }
    public partial DPDict<string, int> Stats { get; set; }
}

[DeltaPack]
public partial class TrackedRegistry
{
    public partial DPDict<string, TrackedPlayer> Players { get; set; }
}

[DeltaPack]
public partial class TrackedPair
{
    public partial TrackedPosition A { get; set; }
    public partial TrackedPosition B { get; set; }
}
