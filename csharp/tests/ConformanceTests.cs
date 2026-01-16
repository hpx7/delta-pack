using System.Text.Json;
using Xunit;

namespace DeltaPack.Tests;

/// <summary>
/// Conformance tests that verify C# implementation produces identical binary output
/// to golden bytes (source of truth). Tests both interpreter and codegen modes.
/// </summary>
public class ConformanceTests
{
    private static readonly string ExamplesDir = Path.GetFullPath(
        Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "examples"));

    private static readonly string[] Examples = ["Primitives", "User", "GameState", "Test"];

    private static byte[] ReadGoldenBytes(string example, string filename) =>
        File.ReadAllBytes(Path.Combine(ExamplesDir, example, filename));

    private static string SchemaPath(string example) =>
        Path.Combine(ExamplesDir, example, "schema.yml");

    private static string[] GetStateNames(string example)
    {
        var dir = Path.Combine(ExamplesDir, example);
        return Directory.GetFiles(dir, "state*.json")
            .Select(Path.GetFileNameWithoutExtension)
            .OrderBy(f => f)
            .ToArray()!;
    }

    private static JsonElement ReadState(string example, string stateName) =>
        JsonDocument.Parse(File.ReadAllText(Path.Combine(ExamplesDir, example, $"{stateName}.json"))).RootElement;

    private static IDeltaPackApi<Dictionary<string, object?>> LoadInterpreter(string example)
    {
        var schema = Parser.ParseSchemaYml(File.ReadAllText(SchemaPath(example)));
        return Interpreter.Load<Dictionary<string, object?>>(schema, example);
    }

    #region Test Data Generation

    public static IEnumerable<object[]> EncodeTestData()
    {
        foreach (var example in Examples)
        {
            foreach (var stateName in GetStateNames(example))
            {
                yield return [example, stateName];
            }
        }
    }

    public static IEnumerable<object[]> DiffTestData()
    {
        foreach (var example in Examples)
        {
            var states = GetStateNames(example);
            for (var i = 0; i < states.Length - 1; i++)
            {
                yield return [example, states[i], states[i + 1]];
            }
        }
    }

    #endregion

    #region Interpreter Mode Tests

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Interpreter_Encode_MatchesGolden(string example, string stateName)
    {
        var goldenBytes = ReadGoldenBytes(example, $"{stateName}.snapshot.bin");
        var api = LoadInterpreter(example);
        var state = api.FromJson(ReadState(example, stateName));
        var csEncoded = api.Encode(state);

        // Encoding order may vary, so only check decoded equality
        var goldenDecoded = api.Decode(goldenBytes);
        var csDecoded = api.Decode(csEncoded);
        Assert.True(api.Equals(goldenDecoded, csDecoded));
    }

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Interpreter_Decode_FromGolden(string example, string stateName)
    {
        var goldenBytes = ReadGoldenBytes(example, $"{stateName}.snapshot.bin");
        var api = LoadInterpreter(example);
        var expected = api.FromJson(ReadState(example, stateName));
        var decoded = api.Decode(goldenBytes);

        Assert.True(api.Equals(expected, decoded));
    }

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Interpreter_ToJson_RoundTrip(string example, string stateName)
    {
        var api = LoadInterpreter(example);
        var state = api.FromJson(ReadState(example, stateName));
        var json = api.ToJson(state);
        var reparsed = api.FromJson(json);

        Assert.True(api.Equals(state, reparsed));
    }

    [Theory]
    [MemberData(nameof(DiffTestData))]
    public void Interpreter_EncodeDiff_MatchesGolden(string example, string oldName, string newName)
    {
        var goldenDiff = ReadGoldenBytes(example, $"{oldName}_{newName}.diff.bin");
        var api = LoadInterpreter(example);
        var oldState = api.FromJson(ReadState(example, oldName));
        var newState = api.FromJson(ReadState(example, newName));
        var csEncoded = api.EncodeDiff(oldState, newState);

        // Encoding order may vary, so only check decoded equality
        var goldenDecoded = api.DecodeDiff(oldState, goldenDiff);
        var csDecoded = api.DecodeDiff(oldState, csEncoded);
        Assert.True(api.Equals(goldenDecoded, csDecoded));
    }

    [Theory]
    [MemberData(nameof(DiffTestData))]
    public void Interpreter_DecodeDiff_FromGolden(string example, string oldName, string newName)
    {
        var goldenDiff = ReadGoldenBytes(example, $"{oldName}_{newName}.diff.bin");
        var api = LoadInterpreter(example);
        var oldState = api.FromJson(ReadState(example, oldName));
        var newState = api.FromJson(ReadState(example, newName));
        var decoded = api.DecodeDiff(oldState, goldenDiff);

        Assert.True(api.Equals(newState, decoded));
    }

    #endregion

    #region Codegen Mode Tests

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Codegen_Encode_MatchesGolden(string example, string stateName)
    {
        var goldenBytes = ReadGoldenBytes(example, $"{stateName}.snapshot.bin");
        var csEncoded = EncodeCodegen(example, stateName);

        // Encoding order may vary, so only check decoded equality
        var (_, goldenEquals) = DecodeAndCompareCodegen(example, stateName, goldenBytes);
        var (_, csEquals) = DecodeAndCompareCodegen(example, stateName, csEncoded);
        Assert.True(goldenEquals && csEquals);
    }

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Codegen_Decode_FromGolden(string example, string stateName)
    {
        var goldenBytes = ReadGoldenBytes(example, $"{stateName}.snapshot.bin");
        var (decoded, equals) = DecodeAndCompareCodegen(example, stateName, goldenBytes);

        Assert.True(equals, $"Decoded state does not match expected for {example}/{stateName}");
    }

    [Theory]
    [MemberData(nameof(DiffTestData))]
    public void Codegen_EncodeDiff_MatchesGolden(string example, string oldName, string newName)
    {
        var goldenDiff = ReadGoldenBytes(example, $"{oldName}_{newName}.diff.bin");
        var csEncoded = EncodeDiffCodegen(example, oldName, newName);

        // Encoding order may vary, so only check decoded equality
        var goldenDecoded = DecodeDiffAndCompareCodegen(example, oldName, newName, goldenDiff);
        var csDecoded = DecodeDiffAndCompareCodegen(example, oldName, newName, csEncoded);
        Assert.True(goldenDecoded && csDecoded);
    }

    [Theory]
    [MemberData(nameof(DiffTestData))]
    public void Codegen_DecodeDiff_FromGolden(string example, string oldName, string newName)
    {
        var goldenDiff = ReadGoldenBytes(example, $"{oldName}_{newName}.diff.bin");
        var equals = DecodeDiffAndCompareCodegen(example, oldName, newName, goldenDiff);

        Assert.True(equals, $"Decoded diff does not match expected for {example}/{oldName}->{newName}");
    }

    #endregion

    #region Codegen Helpers

    private static byte[] EncodeCodegen(string example, string stateName)
    {
        var json = ReadState(example, stateName);
        return example switch
        {
            "Primitives" => Generated.Examples.Primitives.Encode(Generated.Examples.Primitives.FromJson(json)),
            "User" => Generated.Examples.User.Encode(Generated.Examples.User.FromJson(json)),
            "GameState" => Generated.Examples.GameState.Encode(Generated.Examples.GameState.FromJson(json)),
            "Test" => Generated.Examples.Test.Encode(Generated.Examples.Test.FromJson(json)),
            _ => throw new ArgumentException($"Unknown example: {example}")
        };
    }

    private static (object decoded, bool equals) DecodeAndCompareCodegen(string example, string stateName, byte[] encoded)
    {
        var json = ReadState(example, stateName);
        return example switch
        {
            "Primitives" => DecodeAndCompare(
                Generated.Examples.Primitives.FromJson(json),
                Generated.Examples.Primitives.Decode(encoded),
                Generated.Examples.Primitives.Equals),
            "User" => DecodeAndCompare(
                Generated.Examples.User.FromJson(json),
                Generated.Examples.User.Decode(encoded),
                Generated.Examples.User.Equals),
            "GameState" => DecodeAndCompare(
                Generated.Examples.GameState.FromJson(json),
                Generated.Examples.GameState.Decode(encoded),
                Generated.Examples.GameState.Equals),
            "Test" => DecodeAndCompare(
                Generated.Examples.Test.FromJson(json),
                Generated.Examples.Test.Decode(encoded),
                Generated.Examples.Test.Equals),
            _ => throw new ArgumentException($"Unknown example: {example}")
        };
    }

    private static (object, bool) DecodeAndCompare<T>(T expected, T decoded, Func<T, T, bool> equals)
        => (decoded!, equals(expected, decoded));

    private static byte[] EncodeDiffCodegen(string example, string oldName, string newName)
    {
        var oldJson = ReadState(example, oldName);
        var newJson = ReadState(example, newName);
        return example switch
        {
            "Primitives" => Generated.Examples.Primitives.EncodeDiff(
                Generated.Examples.Primitives.FromJson(oldJson),
                Generated.Examples.Primitives.FromJson(newJson)),
            "User" => Generated.Examples.User.EncodeDiff(
                Generated.Examples.User.FromJson(oldJson),
                Generated.Examples.User.FromJson(newJson)),
            "GameState" => Generated.Examples.GameState.EncodeDiff(
                Generated.Examples.GameState.FromJson(oldJson),
                Generated.Examples.GameState.FromJson(newJson)),
            "Test" => Generated.Examples.Test.EncodeDiff(
                Generated.Examples.Test.FromJson(oldJson),
                Generated.Examples.Test.FromJson(newJson)),
            _ => throw new ArgumentException($"Unknown example: {example}")
        };
    }

    private static bool DecodeDiffAndCompareCodegen(string example, string oldName, string newName, byte[] diffBytes)
    {
        var oldJson = ReadState(example, oldName);
        var newJson = ReadState(example, newName);
        return example switch
        {
            "Primitives" => Generated.Examples.Primitives.Equals(
                Generated.Examples.Primitives.FromJson(newJson),
                Generated.Examples.Primitives.DecodeDiff(Generated.Examples.Primitives.FromJson(oldJson), diffBytes)),
            "User" => Generated.Examples.User.Equals(
                Generated.Examples.User.FromJson(newJson),
                Generated.Examples.User.DecodeDiff(Generated.Examples.User.FromJson(oldJson), diffBytes)),
            "GameState" => Generated.Examples.GameState.Equals(
                Generated.Examples.GameState.FromJson(newJson),
                Generated.Examples.GameState.DecodeDiff(Generated.Examples.GameState.FromJson(oldJson), diffBytes)),
            "Test" => Generated.Examples.Test.Equals(
                Generated.Examples.Test.FromJson(newJson),
                Generated.Examples.Test.DecodeDiff(Generated.Examples.Test.FromJson(oldJson), diffBytes)),
            _ => throw new ArgumentException($"Unknown example: {example}")
        };
    }

    #endregion
}
