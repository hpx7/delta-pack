using System.Text.Json;
using Xunit;

namespace DeltaPack.Tests;

public class EncodingSizeTests
{
    // Expected sizes from benchmark/README.md
    private static readonly string ExamplesDir = Path.GetFullPath(
        Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "examples"));

    private static string ReadSchema(string name) =>
        File.ReadAllText(Path.Combine(ExamplesDir, name, "schema.yml"));

    private static JsonElement ReadState(string name, int stateNum) =>
        JsonDocument.Parse(File.ReadAllText(Path.Combine(ExamplesDir, name, $"state{stateNum}.json"))).RootElement;

    [Theory]
    [InlineData("Primitives", 1, 23)]
    [InlineData("Primitives", 2, 23)]
    public void Primitives_EncodesToExpectedSize(string schemaName, int stateNum, int expectedSize)
    {
        var schema = Parser.ParseSchemaYml(ReadSchema(schemaName));
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Primitives");
        var state = api.FromJson(ReadState(schemaName, stateNum));

        var encoded = api.Encode(state);

        Assert.Equal(expectedSize, encoded.Length);
    }

    [Theory]
    [InlineData("Test", 1, 57)]
    public void Test_EncodesToExpectedSize(string schemaName, int stateNum, int expectedSize)
    {
        var schema = Parser.ParseSchemaYml(ReadSchema(schemaName));
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Test");
        var state = api.FromJson(ReadState(schemaName, stateNum));

        var encoded = api.Encode(state);

        Assert.Equal(expectedSize, encoded.Length);
    }

    [Theory]
    [InlineData("User", 1, 129)]
    [InlineData("User", 2, 145)]
    public void User_EncodesToExpectedSize(string schemaName, int stateNum, int expectedSize)
    {
        var schema = Parser.ParseSchemaYml(ReadSchema(schemaName));
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "User");
        var state = api.FromJson(ReadState(schemaName, stateNum));

        var encoded = api.Encode(state);

        Assert.Equal(expectedSize, encoded.Length);
    }

    [Theory]
    [InlineData("GameState", 1, 197)]
    [InlineData("GameState", 2, 321)]
    [InlineData("GameState", 3, 407)]
    [InlineData("GameState", 4, 431)]
    [InlineData("GameState", 5, 991)]
    [InlineData("GameState", 6, 991)]
    public void GameState_EncodesToExpectedSize(string schemaName, int stateNum, int expectedSize)
    {
        var schema = Parser.ParseSchemaYml(ReadSchema(schemaName));
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "GameState");
        var state = api.FromJson(ReadState(schemaName, stateNum));

        var encoded = api.Encode(state);

        Assert.Equal(expectedSize, encoded.Length);
    }

    [Fact]
    public void Primitives_RoundTripsCorrectly()
    {
        var schema = Parser.ParseSchemaYml(ReadSchema("Primitives"));
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Primitives");
        var state = api.FromJson(ReadState("Primitives", 1));

        var encoded = api.Encode(state);
        var decoded = api.Decode(encoded);

        Assert.Equal("example string", decoded["stringField"]);
        Assert.Equal(-42L, decoded["signedIntField"]);
        Assert.Equal(42L, decoded["unsignedIntField"]);
        Assert.Equal(3.14f, (float)decoded["floatField"]!, 0.01f);
        Assert.Equal(true, decoded["booleanField"]);
    }

    [Fact]
    public void User_RoundTripsCorrectly()
    {
        var schema = Parser.ParseSchemaYml(ReadSchema("User"));
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "User");
        var state = api.FromJson(ReadState("User", 1));

        var encoded = api.Encode(state);
        var decoded = api.Decode(encoded);

        Assert.Equal("user_12345", decoded["id"]);
        Assert.Equal("John Doe", decoded["name"]);
        Assert.Equal(30L, decoded["age"]);
        Assert.Equal(175.5f, (float)decoded["weight"]!, 0.1f);
        Assert.Equal(true, decoded["married"]);
        Assert.Equal("BROWN", decoded["hairColor"]);

        var address = (Dictionary<string, object?>)decoded["address"]!;
        Assert.Equal("123 Main St", address["street"]);
        Assert.Equal("12345", address["zip"]);
        Assert.Equal("CA", address["state"]);

        var children = (List<object?>)decoded["children"]!;
        Assert.Equal(2, children.Count);
        Assert.Equal("user_67890", children[0]);
        Assert.Equal("user_54321", children[1]);

        var metadata = (Dictionary<object, object?>)decoded["metadata"]!;
        Assert.Equal("admin", metadata["role"]);
        Assert.Equal("engineering", metadata["department"]);

        var contact = (UnionValue)decoded["preferredContact"]!;
        Assert.Equal("EmailContact", contact.Type);
        var email = (Dictionary<string, object?>)contact.Val!;
        Assert.Equal("john.doe@example.com", email["email"]);
    }

    [Fact]
    public void GameState_RoundTripsCorrectly()
    {
        var schema = Parser.ParseSchemaYml(ReadSchema("GameState"));
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "GameState");
        var state = api.FromJson(ReadState("GameState", 1));

        var encoded = api.Encode(state);
        var decoded = api.Decode(encoded);

        Assert.True(api.Equals(state, decoded));
    }
}
