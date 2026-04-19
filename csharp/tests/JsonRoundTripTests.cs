using System.Collections.Generic;
using System.Text.Json;
using Generated.Examples;
using Xunit;

namespace DeltaPack.Tests;

public class JsonRoundTripTests
{
    [Fact]
    public void Primitives_JsonRoundTrip()
    {
        var p = new Primitives
        {
            StringField = "hello",
            SignedIntField = -42,
            UnsignedIntField = 7,
            BoundedIntField = 3,
            FloatField = 1.5f,
            BooleanField = true,
        };

        var json = Primitives.ToJson(p);
        var element = JsonDocument.Parse(json.ToJsonString()).RootElement;
        var reparsed = Primitives.FromJson(element);

        Assert.True(Primitives.Equals(p, reparsed));
    }

    [Fact]
    public void User_JsonRoundTrip_WithOptionals()
    {
        var u = new User
        {
            Id = "u1",
            Name = "Alice",
            Age = 30,
            Weight = 65.5f,
            Married = true,
            HairColor = HairColor.BROWN,
            Address = new Address { Street = "1 Main", Zip = "02139", State = "MA" },
            Children = new List<User>
            {
                new() { Id = "c1", Name = "Bob", Age = 5, HairColor = HairColor.BLOND },
            },
            Metadata = new OrderedDict<string, string>
            {
                ["hobby"] = "chess",
                ["city"] = "cambridge",
            },
            PreferredContact = new EmailContact { Email = "alice@example.com" },
        };

        var jsonObj = User.ToJson(u);
        var element = JsonDocument.Parse(jsonObj.ToJsonString()).RootElement;
        var reparsed = User.FromJson(element);

        Assert.True(User.Equals(u, reparsed));
    }

    [Fact]
    public void User_JsonRoundTrip_NullOptionals()
    {
        var u = new User
        {
            Id = "u2",
            Name = "NoOpt",
            Age = 25,
            HairColor = HairColor.RED,
            Address = null,
            PreferredContact = null,
        };

        var json = User.ToJson(u).ToJsonString();
        var reparsed = User.FromJson(JsonDocument.Parse(json).RootElement);

        Assert.True(User.Equals(u, reparsed));
        Assert.Null(reparsed.Address);
        Assert.Null(reparsed.PreferredContact);
    }

    [Fact]
    public void User_Union_PhoneVariant_JsonRoundTrip()
    {
        var u = new User
        {
            Id = "u3",
            Name = "Phone",
            Age = 40,
            HairColor = HairColor.BLACK,
            PreferredContact = new PhoneContact { Phone = "555-1234", Extension = 101 },
        };

        var json = User.ToJson(u).ToJsonString();
        var reparsed = User.FromJson(JsonDocument.Parse(json).RootElement);

        Assert.True(User.Equals(u, reparsed));
        Assert.IsType<PhoneContact>(reparsed.PreferredContact);
    }

    [Fact]
    public void Test_Nested_JsonRoundTrip()
    {
        var t = new Test
        {
            String = "nested",
            Uint32 = 42,
            Inner = new Inner
            {
                Int32 = -1,
                InnerInner = new InnerInner
                {
                    Long = 1000,
                    Enum = Generated.Examples.Enum.THREE,
                    Sint32 = -7,
                },
                Outer = new Outer
                {
                    Bool = new List<bool> { true, false, true },
                    Double = 2.5f,
                },
            },
            Float = 3.14f,
            BoundedInt = 4,
        };

        var json = Test.ToJson(t).ToJsonString();
        var reparsed = Test.FromJson(JsonDocument.Parse(json).RootElement);

        Assert.True(Test.Equals(t, reparsed));
    }
}
