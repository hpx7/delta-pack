using System.Collections.Generic;

namespace DeltaPack.Tests.Tracking.Models;

// Mirrors TrackedSimple.cs but declares the partial collection properties via the BCL
// interfaces. The source generator's setter wraps non-tracked assignments into DPList /
// DPDict, so the backing store and on-the-wire behavior should be identical to the
// concrete-typed variant.

[DeltaPack]
public partial class InterfaceTrackedPlayer
{
    public partial string Name { get; set; }
    public partial uint Score { get; set; }
    public partial IList<int> Inventory { get; set; }
    public partial IDictionary<string, int> Stats { get; set; }
}

// Concrete-typed twin of InterfaceTrackedPlayer with identical fields. Used as a
// byte-parity reference: with the same state, both models must produce identical bytes.
[DeltaPack]
public partial class ConcreteTrackedPlayerMirror
{
    public partial string Name { get; set; }
    public partial uint Score { get; set; }
    public partial DPList<int> Inventory { get; set; }
    public partial DPDict<string, int> Stats { get; set; }
}

[DeltaPack]
public partial class InterfaceTrackedRegistry
{
    public partial IDictionary<string, InterfaceTrackedPlayer> Players { get; set; }
}
