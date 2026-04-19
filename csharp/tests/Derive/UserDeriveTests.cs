using System.Collections.Generic;
using DeltaPack.Tests.Derive.Models;
using Xunit;

namespace DeltaPack.Tests.Derive;

public class UserDeriveTests
{
    [Fact]
    public void User_EmptyUser_RoundTrip()
    {
        var u = new UserDerive();
        var decoded = UserDerive.Decode(UserDerive.Encode(u));
        Assert.True(UserDerive.Equals(u, decoded));
    }

    [Fact]
    public void User_PopulatedUser_RoundTrip()
    {
        var u = new UserDerive
        {
            Id = "u1",
            Name = "Alice",
            Age = 30,
            Weight = 65.5f,
            Married = true,
            HairColor = HairColorDerive.BROWN,
            Address = new AddressDerive { Street = "123 Main", Zip = "02139", State = "MA" },
            Children = new List<UserDerive>
            {
                new() { Id = "c1", Name = "Bob", Age = 5, HairColor = HairColorDerive.BLOND },
            },
            Metadata = new OrderedDict<string, string>
            {
                ["hobby"] = "chess",
                ["city"] = "cambridge",
            },
            PreferredContact = new EmailContactDerive { Email = "alice@example.com" },
        };

        var bytes = UserDerive.Encode(u);
        var decoded = UserDerive.Decode(bytes);
        Assert.True(UserDerive.Equals(u, decoded));
    }

    [Fact]
    public void User_Union_PhoneVariant_RoundTrip()
    {
        var u = new UserDerive
        {
            Id = "u2",
            Name = "Bob",
            Age = 40,
            HairColor = HairColorDerive.BLACK,
            PreferredContact = new PhoneContactDerive { Phone = "555-1234", Extension = 101 },
        };

        var decoded = UserDerive.Decode(UserDerive.Encode(u));
        Assert.True(UserDerive.Equals(u, decoded));
        Assert.IsType<PhoneContactDerive>(decoded.PreferredContact);
    }

    [Fact]
    public void User_Diff_SameTypeUnion_RoundTrip()
    {
        var a = new UserDerive
        {
            Id = "u",
            PreferredContact = new EmailContactDerive { Email = "old@x.com" },
            HairColor = HairColorDerive.RED,
        };
        var b = new UserDerive
        {
            Id = "u",
            PreferredContact = new EmailContactDerive { Email = "new@x.com" },
            HairColor = HairColorDerive.RED,
        };

        var diff = UserDerive.EncodeDiff(a, b);
        var reconstructed = UserDerive.DecodeDiff(a, diff);
        Assert.True(UserDerive.Equals(b, reconstructed));
    }

    [Fact]
    public void User_Diff_SwitchUnionVariant_RoundTrip()
    {
        var a = new UserDerive
        {
            PreferredContact = new EmailContactDerive { Email = "a@x.com" },
        };
        var b = new UserDerive
        {
            PreferredContact = new PhoneContactDerive { Phone = "555" },
        };

        var diff = UserDerive.EncodeDiff(a, b);
        var reconstructed = UserDerive.DecodeDiff(a, diff);
        Assert.True(UserDerive.Equals(b, reconstructed));
        Assert.IsType<PhoneContactDerive>(reconstructed.PreferredContact);
    }
}
