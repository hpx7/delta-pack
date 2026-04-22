using System.Collections.Generic;

namespace DeltaPack.Tests.Tracking.Models;

[DeltaPack, DeltaPackTracked]
public partial class TrackedPosition
{
    public partial float X { get; set; }
    public partial float Y { get; set; }
}

[DeltaPack, DeltaPackTracked]
public partial class TrackedPlayer
{
    public partial string Name { get; set; }
    public partial uint Score { get; set; }
    public partial TrackedPosition Pos { get; set; }
    public partial TrackedList<int> Inventory { get; set; }
    public partial TrackedOrderedDict<string, int> Stats { get; set; }
}

[DeltaPack, DeltaPackTracked]
public partial class TrackedRegistry
{
    public partial TrackedOrderedDict<string, TrackedPlayer> Players { get; set; }
}
