using System.Collections.Generic;
using System.Text.Json;
using DeltaPack.Tests.Derive.Models;
using Xunit;

namespace DeltaPack.Tests.Derive;

public class DeriveJsonTests
{
    [Fact]
    public void Primitives_JsonRoundTrip()
    {
        var p = new PrimitivesDerive
        {
            StringField = "hello",
            SignedIntField = -42,
            UnsignedIntField = 7,
            BoundedIntField = 3,
            FloatField = 1.5f,
            BooleanField = true,
        };

        var json = PrimitivesDerive.ToJson(p);
        var element = JsonDocument.Parse(json.ToJsonString()).RootElement;
        var reparsed = PrimitivesDerive.FromJson(element);

        Assert.True(PrimitivesDerive.Equals(p, reparsed));
    }

    [Fact]
    public void User_JsonRoundTrip_WithOptionals()
    {
        var u = new UserDerive
        {
            Id = "u1",
            Name = "Alice",
            Age = 30,
            Weight = 65.5f,
            Married = true,
            HairColor = HairColorDerive.BROWN,
            Address = new AddressDerive { Street = "1 Main", Zip = "02139", State = "MA" },
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

        var jsonObj = UserDerive.ToJson(u);
        var element = JsonDocument.Parse(jsonObj.ToJsonString()).RootElement;
        var reparsed = UserDerive.FromJson(element);

        Assert.True(UserDerive.Equals(u, reparsed));
    }

    [Fact]
    public void User_JsonRoundTrip_NullOptionals()
    {
        var u = new UserDerive
        {
            Id = "u2",
            Name = "NoOpt",
            Age = 25,
            HairColor = HairColorDerive.RED,
            Address = null,
            PreferredContact = null,
        };

        var json = UserDerive.ToJson(u).ToJsonString();
        var reparsed = UserDerive.FromJson(JsonDocument.Parse(json).RootElement);

        Assert.True(UserDerive.Equals(u, reparsed));
        Assert.Null(reparsed.Address);
        Assert.Null(reparsed.PreferredContact);
    }

    [Fact]
    public void User_Union_PhoneVariant_JsonRoundTrip()
    {
        var u = new UserDerive
        {
            Id = "u3",
            Name = "Phone",
            Age = 40,
            HairColor = HairColorDerive.BLACK,
            PreferredContact = new PhoneContactDerive { Phone = "555-1234", Extension = 101 },
        };

        var json = UserDerive.ToJson(u).ToJsonString();
        var reparsed = UserDerive.FromJson(JsonDocument.Parse(json).RootElement);

        Assert.True(UserDerive.Equals(u, reparsed));
        Assert.IsType<PhoneContactDerive>(reparsed.PreferredContact);
    }

    [Fact]
    public void Test_Nested_JsonRoundTrip()
    {
        var t = new TestDerive
        {
            String = "nested",
            Uint32 = 42,
            Inner = new InnerDerive
            {
                Int32 = -1,
                InnerInner = new InnerInnerDerive
                {
                    Long = 1000,
                    Enum = TestEnumDerive.THREE,
                    Sint32 = -7,
                },
                Outer = new OuterDerive
                {
                    Bool = new List<bool> { true, false, true },
                    Double = 2.5f,
                },
            },
            Float = 3.14f,
            BoundedInt = 4,
        };

        var json = TestDerive.ToJson(t).ToJsonString();
        var reparsed = TestDerive.FromJson(JsonDocument.Parse(json).RootElement);

        Assert.True(TestDerive.Equals(t, reparsed));
    }
}
