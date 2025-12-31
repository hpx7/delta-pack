using System.Text.Json;
using Xunit;

namespace DeltaPack.Tests;

public class ExamplesTests
{
    private static readonly string ExamplesDir = Path.GetFullPath(
        Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "examples"));

    private static IReadOnlyDictionary<string, SchemaType> LoadSchema(string name) =>
        Parser.ParseSchemaYml(File.ReadAllText(Path.Combine(ExamplesDir, name, "schema.yml")));

    private static JsonElement ReadState(string name, int stateNum) =>
        JsonDocument.Parse(File.ReadAllText(Path.Combine(ExamplesDir, name, $"state{stateNum}.json"))).RootElement;

    #region Primitives

    [Fact]
    public void Primitives_State1_RoundTrip()
    {
        var schema = LoadSchema("Primitives");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Primitives");

        var state = api.FromJson(ReadState("Primitives", 1));
        var encoded = api.Encode(state);
        var decoded = api.Decode(encoded);

        Assert.True(api.Equals(state, decoded));
    }

    [Fact]
    public void Primitives_State2_RoundTrip()
    {
        var schema = LoadSchema("Primitives");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Primitives");

        var state = api.FromJson(ReadState("Primitives", 2));
        var encoded = api.Encode(state);
        var decoded = api.Decode(encoded);

        Assert.True(api.Equals(state, decoded));
    }

    [Fact]
    public void Primitives_DiffRoundTrip()
    {
        var schema = LoadSchema("Primitives");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Primitives");

        var state1 = api.FromJson(ReadState("Primitives", 1));
        var state2 = api.FromJson(ReadState("Primitives", 2));

        var diff = api.EncodeDiff(state1, state2);
        var decoded = api.DecodeDiff(state1, diff);

        Assert.True(api.Equals(state2, decoded));
    }

    [Fact]
    public void Primitives_FieldValues()
    {
        var schema = LoadSchema("Primitives");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Primitives");

        var state = api.FromJson(ReadState("Primitives", 1));

        Assert.Equal("example string", state["stringField"]);
        Assert.Equal(-42L, state["signedIntField"]);
        Assert.Equal(42L, state["unsignedIntField"]);
        Assert.Equal(3.14f, (float)state["floatField"]!, 0.01f);
        Assert.Equal(true, state["booleanField"]);
    }

    [Theory]
    [InlineData(1, 23)]
    [InlineData(2, 23)]
    public void Primitives_EncodingSize(int stateNum, int expectedSize)
    {
        var schema = LoadSchema("Primitives");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Primitives");

        var state = api.FromJson(ReadState("Primitives", stateNum));
        var encoded = api.Encode(state);
        Assert.Equal(expectedSize, encoded.Length);
    }

    #endregion

    #region Test

    [Fact]
    public void Test_State1_RoundTrip()
    {
        var schema = LoadSchema("Test");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Test");

        var state = api.FromJson(ReadState("Test", 1));
        var encoded = api.Encode(state);
        var decoded = api.Decode(encoded);

        Assert.True(api.Equals(state, decoded));
    }

    [Fact]
    public void Test_FieldValues()
    {
        var schema = LoadSchema("Test");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Test");

        var state = api.FromJson(ReadState("Test", 1));

        Assert.Equal("Lorem ipsum dolor sit amet.", state["string"]);
        Assert.Equal(9000L, state["uint32"]);

        var inner = (Dictionary<string, object?>)state["inner"]!;
        Assert.Equal(20161110L, inner["int32"]);

        var innerInner = (Dictionary<string, object?>)inner["innerInner"]!;
        Assert.Equal(649545084044315L, innerInner["long"]);
        Assert.Equal("TWO", innerInner["enum"]);
        Assert.Equal(-42L, innerInner["sint32"]);

        var outer = (Dictionary<string, object?>)inner["outer"]!;
        var bools = (List<object?>)outer["bool"]!;
        Assert.Equal(new List<object?> { true, false, false, true, false, false, true }, bools);
        Assert.Equal(204.8f, (float)outer["double"]!, 0.01f);

        Assert.Equal(0.25f, (float)state["float"]!, 0.01f);
    }

    [Fact]
    public void Test_EncodingSize()
    {
        var schema = LoadSchema("Test");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Test");

        var state = api.FromJson(ReadState("Test", 1));
        var encoded = api.Encode(state);
        Assert.Equal(56, encoded.Length);
    }

    #endregion

    #region User

    [Fact]
    public void User_State1_RoundTrip()
    {
        var schema = LoadSchema("User");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "User");

        var state = api.FromJson(ReadState("User", 1));
        var encoded = api.Encode(state);
        var decoded = api.Decode(encoded);

        Assert.True(api.Equals(state, decoded));
    }

    [Fact]
    public void User_State2_RoundTrip()
    {
        var schema = LoadSchema("User");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "User");

        var state = api.FromJson(ReadState("User", 2));
        var encoded = api.Encode(state);
        var decoded = api.Decode(encoded);

        Assert.True(api.Equals(state, decoded));
    }

    [Fact]
    public void User_DiffRoundTrip()
    {
        var schema = LoadSchema("User");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "User");

        var state1 = api.FromJson(ReadState("User", 1));
        var state2 = api.FromJson(ReadState("User", 2));

        var diff = api.EncodeDiff(state1, state2);
        var decoded = api.DecodeDiff(state1, diff);

        Assert.True(api.Equals(state2, decoded));
    }

    [Fact]
    public void User_FieldValues()
    {
        var schema = LoadSchema("User");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "User");

        var state = api.FromJson(ReadState("User", 1));

        Assert.Equal("user_12345", state["id"]);
        Assert.Equal("John Doe", state["name"]);
        Assert.Equal(30L, state["age"]);
        Assert.Equal(175.5f, (float)state["weight"]!, 0.1f);
        Assert.Equal(true, state["married"]);
        Assert.Equal("BROWN", state["hairColor"]);

        var address = (Dictionary<string, object?>)state["address"]!;
        Assert.Equal("123 Main St", address["street"]);
        Assert.Equal("12345", address["zip"]);
        Assert.Equal("CA", address["state"]);

        var children = (List<object?>)state["children"]!;
        Assert.Equal(2, children.Count);
        Assert.Equal("user_67890", children[0]);
        Assert.Equal("user_54321", children[1]);

        var metadata = (Dictionary<object, object?>)state["metadata"]!;
        Assert.Equal("admin", metadata["role"]);
        Assert.Equal("engineering", metadata["department"]);

        var contact = (UnionValue)state["preferredContact"]!;
        Assert.Equal("EmailContact", contact.Type);
    }

    [Theory]
    [InlineData(1, 128)]
    [InlineData(2, 144)]
    public void User_EncodingSize(int stateNum, int expectedSize)
    {
        var schema = LoadSchema("User");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "User");

        var state = api.FromJson(ReadState("User", stateNum));
        var encoded = api.Encode(state);
        Assert.Equal(expectedSize, encoded.Length);
    }

    #endregion

    #region GameState

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    [InlineData(6)]
    public void GameState_RoundTrip(int stateNum)
    {
        var schema = LoadSchema("GameState");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "GameState");

        var state = api.FromJson(ReadState("GameState", stateNum));
        var encoded = api.Encode(state);
        var decoded = api.Decode(encoded);

        Assert.True(api.Equals(state, decoded));
    }

    [Theory]
    [InlineData(1, 2)]
    [InlineData(2, 3)]
    [InlineData(3, 4)]
    [InlineData(4, 5)]
    [InlineData(5, 6)]
    public void GameState_DiffRoundTrip(int fromState, int toState)
    {
        var schema = LoadSchema("GameState");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "GameState");

        var state1 = api.FromJson(ReadState("GameState", fromState));
        var state2 = api.FromJson(ReadState("GameState", toState));

        var diff = api.EncodeDiff(state1, state2);
        var decoded = api.DecodeDiff(state1, diff);

        Assert.True(api.Equals(state2, decoded));
    }

    [Fact]
    public void GameState_State1_FieldValues()
    {
        var schema = LoadSchema("GameState");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "GameState");

        var state = api.FromJson(ReadState("GameState", 1));

        Assert.Equal("match-12345", state["gameId"]);
        Assert.Equal("LOBBY", state["phase"]);

        var players = (Dictionary<object, object?>)state["players"]!;
        Assert.Equal(2, players.Count);
    }

    [Fact]
    public void GameState_DeltaCompression()
    {
        var schema = LoadSchema("GameState");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "GameState");

        var state5 = api.FromJson(ReadState("GameState", 5));
        var state6 = api.FromJson(ReadState("GameState", 6));

        var fullEncode = api.Encode(state6);
        var diff = api.EncodeDiff(state5, state6);

        // state6 is mostly the same as state5 (only position updates)
        // so the diff should be significantly smaller
        Assert.True(diff.Length < fullEncode.Length);

        // For this specific case (8 players, minimal position changes)
        // the diff should be much smaller (typically < 10% of full size)
        var compressionRatio = (double)diff.Length / fullEncode.Length;
        Assert.True(compressionRatio < 0.1);
    }

    [Theory]
    [InlineData(1, 192)]
    [InlineData(2, 312)]
    [InlineData(3, 398)]
    [InlineData(4, 421)]
    [InlineData(5, 971)]
    [InlineData(6, 971)]
    public void GameState_EncodingSize(int stateNum, int expectedSize)
    {
        var schema = LoadSchema("GameState");
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "GameState");

        var state = api.FromJson(ReadState("GameState", stateNum));
        var encoded = api.Encode(state);
        Assert.Equal(expectedSize, encoded.Length);
    }

    #endregion
}
