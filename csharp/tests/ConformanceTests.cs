using System.Diagnostics;
using System.Text.Json;
using Xunit;

namespace DeltaPack.Tests;

/// <summary>
/// Conformance tests that verify C# implementation produces identical binary output
/// to the CLI (source of truth). Tests both interpreter and codegen modes.
/// </summary>
public class ConformanceTests
{
    private static readonly string ExamplesDir = Path.GetFullPath(
        Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "examples"));

    private static readonly string[] Examples = ["Primitives", "User", "GameState", "Test"];

    private static byte[] RunCli(string args)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = "delta-pack",
            Arguments = args,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            WorkingDirectory = ExamplesDir
        };

        using var process = Process.Start(startInfo)!;
        using var ms = new MemoryStream();
        process.StandardOutput.BaseStream.CopyTo(ms);
        process.WaitForExit();

        if (process.ExitCode != 0)
        {
            var error = process.StandardError.ReadToEnd();
            throw new Exception($"CLI failed with exit code {process.ExitCode}: {error}");
        }

        return ms.ToArray();
    }

    private static string SchemaPath(string example) =>
        Path.Combine(ExamplesDir, example, "schema.yml");

    private static string[] GetStatePaths(string example)
    {
        var dir = Path.Combine(ExamplesDir, example);
        return Directory.GetFiles(dir, "state*.json")
            .OrderBy(f => f)
            .ToArray();
    }

    private static JsonElement ReadState(string statePath) =>
        JsonDocument.Parse(File.ReadAllText(statePath)).RootElement;

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
            foreach (var statePath in GetStatePaths(example))
            {
                var stateName = Path.GetFileNameWithoutExtension(statePath);
                yield return [example, statePath, stateName];
            }
        }
    }

    public static IEnumerable<object[]> DiffTestData()
    {
        foreach (var example in Examples)
        {
            var states = GetStatePaths(example);
            for (var i = 0; i < states.Length - 1; i++)
            {
                var oldName = Path.GetFileNameWithoutExtension(states[i]);
                var newName = Path.GetFileNameWithoutExtension(states[i + 1]);
                yield return [example, states[i], states[i + 1], oldName, newName];
            }
        }
    }

    #endregion

    #region Interpreter Mode Tests

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Interpreter_Encode_MatchesCli(string example, string statePath, string stateName)
    {
        var cliEncoded = RunCli($"encode {SchemaPath(example)} -t {example} -i {statePath}");
        var api = LoadInterpreter(example);
        var state = api.FromJson(ReadState(statePath));
        var csEncoded = api.Encode(state);

        // Encoding order is undefined, so check size and decoded equality instead of byte equality
        Assert.Equal(cliEncoded.Length, csEncoded.Length);
        var cliDecoded = api.Decode(cliEncoded);
        var csDecoded = api.Decode(csEncoded);
        Assert.True(api.Equals(cliDecoded, csDecoded));
    }

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Interpreter_Decode_FromCliOutput(string example, string statePath, string stateName)
    {
        var encoded = RunCli($"encode {SchemaPath(example)} -t {example} -i {statePath}");
        var api = LoadInterpreter(example);
        var expected = api.FromJson(ReadState(statePath));
        var decoded = api.Decode(encoded);

        Assert.True(api.Equals(expected, decoded));
    }

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Interpreter_ToJson_RoundTrip(string example, string statePath, string stateName)
    {
        var api = LoadInterpreter(example);
        var state = api.FromJson(ReadState(statePath));
        var json = api.ToJson(state);
        var reparsed = api.FromJson(json);

        Assert.True(api.Equals(state, reparsed));
    }

    [Theory]
    [MemberData(nameof(DiffTestData))]
    public void Interpreter_EncodeDiff_MatchesCli(string example, string oldPath, string newPath, string oldName, string newName)
    {
        var expected = RunCli($"encode-diff {SchemaPath(example)} -t {example} --old {oldPath} --new {newPath}");
        var api = LoadInterpreter(example);
        var oldState = api.FromJson(ReadState(oldPath));
        var newState = api.FromJson(ReadState(newPath));
        var actual = api.EncodeDiff(oldState, newState);

        Assert.Equal(expected, actual);
    }

    [Theory]
    [MemberData(nameof(DiffTestData))]
    public void Interpreter_DecodeDiff_FromCliOutput(string example, string oldPath, string newPath, string oldName, string newName)
    {
        var diffBytes = RunCli($"encode-diff {SchemaPath(example)} -t {example} --old {oldPath} --new {newPath}");
        var api = LoadInterpreter(example);
        var oldState = api.FromJson(ReadState(oldPath));
        var newState = api.FromJson(ReadState(newPath));
        var decoded = api.DecodeDiff(oldState, diffBytes);

        Assert.True(api.Equals(newState, decoded));
    }

    #endregion

    #region Codegen Mode Tests

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Codegen_Encode_MatchesCli(string example, string statePath, string stateName)
    {
        var expected = RunCli($"encode {SchemaPath(example)} -t {example} -i {statePath}");
        var actual = EncodeCodegen(example, statePath);

        Assert.Equal(expected, actual);
    }

    [Theory]
    [MemberData(nameof(EncodeTestData))]
    public void Codegen_Decode_FromCliOutput(string example, string statePath, string stateName)
    {
        var encoded = RunCli($"encode {SchemaPath(example)} -t {example} -i {statePath}");
        var (decoded, equals) = DecodeAndCompareCodegen(example, statePath, encoded);

        Assert.True(equals, $"Decoded state does not match expected for {example}/{stateName}");
    }

    [Theory]
    [MemberData(nameof(DiffTestData))]
    public void Codegen_EncodeDiff_MatchesCli(string example, string oldPath, string newPath, string oldName, string newName)
    {
        var expected = RunCli($"encode-diff {SchemaPath(example)} -t {example} --old {oldPath} --new {newPath}");
        var actual = EncodeDiffCodegen(example, oldPath, newPath);

        Assert.Equal(expected, actual);
    }

    [Theory]
    [MemberData(nameof(DiffTestData))]
    public void Codegen_DecodeDiff_FromCliOutput(string example, string oldPath, string newPath, string oldName, string newName)
    {
        var diffBytes = RunCli($"encode-diff {SchemaPath(example)} -t {example} --old {oldPath} --new {newPath}");
        var equals = DecodeDiffAndCompareCodegen(example, oldPath, newPath, diffBytes);

        Assert.True(equals, $"Decoded diff does not match expected for {example}/{oldName}->{newName}");
    }

    #endregion

    #region Codegen Helpers

    private static byte[] EncodeCodegen(string example, string statePath)
    {
        var json = ReadState(statePath);
        return example switch
        {
            "Primitives" => Generated.Examples.Primitives.Encode(Generated.Examples.Primitives.FromJson(json)),
            "User" => Generated.Examples.User.Encode(Generated.Examples.User.FromJson(json)),
            "GameState" => Generated.Examples.GameState.Encode(Generated.Examples.GameState.FromJson(json)),
            "Test" => Generated.Examples.Test.Encode(Generated.Examples.Test.FromJson(json)),
            _ => throw new ArgumentException($"Unknown example: {example}")
        };
    }

    private static (object decoded, bool equals) DecodeAndCompareCodegen(string example, string statePath, byte[] encoded)
    {
        var json = ReadState(statePath);
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

    private static byte[] EncodeDiffCodegen(string example, string oldPath, string newPath)
    {
        var oldJson = ReadState(oldPath);
        var newJson = ReadState(newPath);
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

    private static bool DecodeDiffAndCompareCodegen(string example, string oldPath, string newPath, byte[] diffBytes)
    {
        var oldJson = ReadState(oldPath);
        var newJson = ReadState(newPath);
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
