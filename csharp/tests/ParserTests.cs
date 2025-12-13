using Xunit;

namespace DeltaPack.Tests;

public class ParserTests
{
    [Fact]
    public void ParsesPrimitiveTypes()
    {
        var yaml = @"
Primitives:
  stringField: string
  signedIntField: int
  unsignedIntField: uint
  floatField: float
  booleanField: boolean
";
        var schema = Parser.ParseSchemaYml(yaml);

        Assert.Single(schema);
        Assert.True(schema.ContainsKey("Primitives"));

        var primitives = schema["Primitives"] as ObjectType;
        Assert.NotNull(primitives);
        Assert.Equal(5, primitives.Properties.Count);

        Assert.IsType<StringType>(primitives.Properties["stringField"]);
        Assert.IsType<IntType>(primitives.Properties["signedIntField"]);
        Assert.IsType<UIntType>(primitives.Properties["unsignedIntField"]);
        Assert.IsType<FloatType>(primitives.Properties["floatField"]);
        Assert.IsType<BooleanType>(primitives.Properties["booleanField"]);
    }

    [Fact]
    public void ParsesFloatWithPrecision()
    {
        var yaml = @"
Position:
  x: float(precision=0.1)
  y: float(precision=0.01)
  z: float
";
        var schema = Parser.ParseSchemaYml(yaml);

        var position = schema["Position"] as ObjectType;
        Assert.NotNull(position);

        var xType = position.Properties["x"] as FloatType;
        Assert.NotNull(xType);
        Assert.Equal(0.1, xType.Precision);

        var yType = position.Properties["y"] as FloatType;
        Assert.NotNull(yType);
        Assert.Equal(0.01, yType.Precision);

        var zType = position.Properties["z"] as FloatType;
        Assert.NotNull(zType);
        Assert.Null(zType.Precision);
    }

    [Fact]
    public void ParsesEnumType()
    {
        var yaml = @"
HairColor:
  - BLACK
  - BROWN
  - BLOND
  - RED
";
        var schema = Parser.ParseSchemaYml(yaml);

        Assert.Single(schema);
        var hairColor = schema["HairColor"] as EnumType;
        Assert.NotNull(hairColor);
        Assert.Equal(["BLACK", "BROWN", "BLOND", "RED"], hairColor.Options);
    }

    [Fact]
    public void ParsesUnionType()
    {
        var yaml = @"
EmailContact:
  email: string

PhoneContact:
  phone: string

Contact:
  - EmailContact
  - PhoneContact
";
        var schema = Parser.ParseSchemaYml(yaml);

        Assert.Equal(3, schema.Count);
        Assert.IsType<ObjectType>(schema["EmailContact"]);
        Assert.IsType<ObjectType>(schema["PhoneContact"]);

        var contact = schema["Contact"] as UnionType;
        Assert.NotNull(contact);
        Assert.Equal(2, contact.Options.Count);
        Assert.Equal("EmailContact", contact.Options[0].Reference);
        Assert.Equal("PhoneContact", contact.Options[1].Reference);
    }

    [Fact]
    public void ParsesArrayType()
    {
        var yaml = @"
Container:
  items: string[]
  numbers: int[]
  nested: uint[]
";
        var schema = Parser.ParseSchemaYml(yaml);

        var container = schema["Container"] as ObjectType;
        Assert.NotNull(container);

        var items = container.Properties["items"] as ArrayType;
        Assert.NotNull(items);
        Assert.IsType<StringType>(items.Value);

        var numbers = container.Properties["numbers"] as ArrayType;
        Assert.NotNull(numbers);
        Assert.IsType<IntType>(numbers.Value);
    }

    [Fact]
    public void ParsesOptionalType()
    {
        var yaml = @"
Entity:
  name: string
  description: string?
  age: uint?
";
        var schema = Parser.ParseSchemaYml(yaml);

        var entity = schema["Entity"] as ObjectType;
        Assert.NotNull(entity);

        Assert.IsType<StringType>(entity.Properties["name"]);

        var description = entity.Properties["description"] as OptionalType;
        Assert.NotNull(description);
        Assert.IsType<StringType>(description.Value);

        var age = entity.Properties["age"] as OptionalType;
        Assert.NotNull(age);
        Assert.IsType<UIntType>(age.Value);
    }

    [Fact]
    public void ParsesRecordType()
    {
        var yaml = @"
Data:
  stringMap: <string, string>
  intMap: <int, boolean>
  uintMap: <uint, float>
";
        var schema = Parser.ParseSchemaYml(yaml);

        var data = schema["Data"] as ObjectType;
        Assert.NotNull(data);

        var stringMap = data.Properties["stringMap"] as RecordType;
        Assert.NotNull(stringMap);
        Assert.IsType<StringType>(stringMap.Key);
        Assert.IsType<StringType>(stringMap.Value);

        var intMap = data.Properties["intMap"] as RecordType;
        Assert.NotNull(intMap);
        Assert.IsType<IntType>(intMap.Key);
        Assert.IsType<BooleanType>(intMap.Value);
    }

    [Fact]
    public void ParsesReferenceType()
    {
        var yaml = @"
UserId: string

User:
  id: UserId
  name: string
";
        var schema = Parser.ParseSchemaYml(yaml);

        Assert.Equal(2, schema.Count);
        Assert.IsType<StringType>(schema["UserId"]);

        var user = schema["User"] as ObjectType;
        Assert.NotNull(user);

        var idRef = user.Properties["id"] as ReferenceType;
        Assert.NotNull(idRef);
        Assert.Equal("UserId", idRef.Reference);
    }

    [Fact]
    public void ParsesNestedTypes()
    {
        var yaml = @"
Address:
  street: string
  zip: string

User:
  name: string
  address: Address?
  friends: User[]
";
        var schema = Parser.ParseSchemaYml(yaml);

        var user = schema["User"] as ObjectType;
        Assert.NotNull(user);

        // Optional reference
        var address = user.Properties["address"] as OptionalType;
        Assert.NotNull(address);
        var addressRef = address.Value as ReferenceType;
        Assert.NotNull(addressRef);
        Assert.Equal("Address", addressRef.Reference);

        // Array of self-reference
        var friends = user.Properties["friends"] as ArrayType;
        Assert.NotNull(friends);
        var friendRef = friends.Value as ReferenceType;
        Assert.NotNull(friendRef);
        Assert.Equal("User", friendRef.Reference);
    }

    [Fact]
    public void ParsesComplexRecordType()
    {
        var yaml = @"
Player:
  name: string

GameState:
  players: <string, Player>
";
        var schema = Parser.ParseSchemaYml(yaml);

        var gameState = schema["GameState"] as ObjectType;
        Assert.NotNull(gameState);

        var players = gameState.Properties["players"] as RecordType;
        Assert.NotNull(players);
        Assert.IsType<StringType>(players.Key);

        var playerRef = players.Value as ReferenceType;
        Assert.NotNull(playerRef);
        Assert.Equal("Player", playerRef.Reference);
    }

    [Fact]
    public void IsPrimitiveType_ReturnsCorrectly()
    {
        var yaml = @"
UserId: string

HairColor:
  - BLACK
  - BROWN

User:
  id: UserId
  name: string
";
        var schema = Parser.ParseSchemaYml(yaml);

        // Direct primitives
        Assert.True(Schema.IsPrimitiveType(new StringType(), schema));
        Assert.True(Schema.IsPrimitiveType(new IntType(), schema));
        Assert.True(Schema.IsPrimitiveType(new UIntType(), schema));
        Assert.True(Schema.IsPrimitiveType(new FloatType(), schema));
        Assert.True(Schema.IsPrimitiveType(new BooleanType(), schema));

        // Enum is primitive
        Assert.True(Schema.IsPrimitiveType(schema["HairColor"], schema));

        // Reference to primitive
        Assert.True(Schema.IsPrimitiveType(new ReferenceType("UserId"), schema));

        // Object is not primitive
        Assert.False(Schema.IsPrimitiveType(schema["User"], schema));

        // Containers are not primitive
        Assert.False(Schema.IsPrimitiveType(new ArrayType(new StringType()), schema));
        Assert.False(Schema.IsPrimitiveType(new OptionalType(new StringType()), schema));
    }

    [Fact]
    public void ThrowsOnInvalidRecordFormat()
    {
        var yaml = @"
Invalid:
  bad: <string>
";
        Assert.Throws<ArgumentException>(() => Parser.ParseSchemaYml(yaml));
    }

    [Fact]
    public void ThrowsOnUnknownType()
    {
        var yaml = @"
Invalid:
  field: unknownType
";
        Assert.Throws<ArgumentException>(() => Parser.ParseSchemaYml(yaml));
    }
}
