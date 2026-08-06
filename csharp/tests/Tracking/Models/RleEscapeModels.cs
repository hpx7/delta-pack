namespace DeltaPack.Tests.Tracking.Models;

// Minimal models for reproducing the RLE 269-run overflow: many DPDict entries sharing a
// single boolean field can accumulate one long RLE run across the whole message, in both
// a full snapshot encode and a steady-state diff encode.
[DeltaPack]
public partial class RleFlag
{
    public partial bool V { get; set; }
}

[DeltaPack]
public partial class RleFlagBoard
{
    public partial DPDict<string, RleFlag> Flags { get; set; }
}
