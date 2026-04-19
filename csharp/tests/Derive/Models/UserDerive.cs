using System.Collections.Generic;

namespace DeltaPack.Tests.Derive.Models;

public enum HairColorDerive
{
    BLACK = 0,
    BROWN = 1,
    BLOND = 2,
    RED = 3,
    WHITE = 4,
    OTHER = 5,
}

[DeltaPack]
public partial class AddressDerive
{
    public string Street { get; set; } = "";
    public string Zip { get; set; } = "";
    public string State { get; set; } = "";
}

[DeltaPack]
[DeltaPackUnion(typeof(EmailContactDerive), typeof(PhoneContactDerive))]
public abstract partial class ContactDerive { }

[DeltaPack]
public partial class EmailContactDerive : ContactDerive
{
    public string Email { get; set; } = "";
}

[DeltaPack]
public partial class PhoneContactDerive : ContactDerive
{
    public string Phone { get; set; } = "";
    public uint? Extension { get; set; }
}

[DeltaPack]
public partial class UserDerive
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public uint Age { get; set; }
    public float Weight { get; set; }
    public bool Married { get; set; }
    public HairColorDerive HairColor { get; set; }
    public AddressDerive? Address { get; set; }
    public List<UserDerive> Children { get; set; } = new();
    public OrderedDict<string, string> Metadata { get; set; } = new();
    public ContactDerive? PreferredContact { get; set; }
}
