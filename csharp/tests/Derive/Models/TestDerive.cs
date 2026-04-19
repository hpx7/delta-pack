using System.Collections.Generic;

namespace DeltaPack.Tests.Derive.Models;

public enum TestEnumDerive { ONE = 0, TWO = 1, THREE = 2, FOUR = 3, FIVE = 4 }

[DeltaPack]
public partial class InnerInnerDerive
{
    public long Long { get; set; }
    public TestEnumDerive Enum { get; set; }
    public int Sint32 { get; set; }
}

[DeltaPack]
public partial class OuterDerive
{
    public List<bool> Bool { get; set; } = new();
    public float Double { get; set; }
}

[DeltaPack]
public partial class InnerDerive
{
    public int Int32 { get; set; }
    public InnerInnerDerive InnerInner { get; set; } = InnerInnerDerive.Default();
    public OuterDerive Outer { get; set; } = OuterDerive.Default();
}

[DeltaPack]
public partial class TestDerive
{
    public string String { get; set; } = "";
    public int Uint32 { get; set; }
    public InnerDerive Inner { get; set; } = InnerDerive.Default();
    public float Float { get; set; }
    [DeltaPackRange(0, 5)] public int BoundedInt { get; set; }
}
