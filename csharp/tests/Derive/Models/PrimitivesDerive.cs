namespace DeltaPack.Tests.Derive.Models;

[DeltaPack]
public partial class PrimitivesDerive
{
    public string StringField { get; set; } = "";
    public long SignedIntField { get; set; }
    public uint UnsignedIntField { get; set; }
    [DeltaPackRange(-10, 10)] public int BoundedIntField { get; set; }
    public float FloatField { get; set; }
    public bool BooleanField { get; set; }
}
