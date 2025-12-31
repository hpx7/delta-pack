using System.Diagnostics;
using System.Text.Json;
using Xunit;

namespace DeltaPack.Tests;

public class CodegenTests
{
    private static readonly string TestsDir = Path.GetFullPath(
        Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));

    private static readonly string SchemaPath = Path.Combine(TestsDir, "tests", "schema.yml");
    private static readonly string GeneratedPath = Path.Combine(TestsDir, "tests", "Generated", "Schema.cs");

    #region Regeneration Check

    [Fact]
    public void GeneratedCode_MatchesCommittedFile()
    {
        // Generate fresh code using CLI
        var psi = new ProcessStartInfo
        {
            FileName = "bun",
            Arguments = $"cli/src/index.ts generate {SchemaPath} -l csharp -n Generated",
            WorkingDirectory = Path.GetFullPath(Path.Combine(TestsDir, "..")),
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false
        };

        using var process = Process.Start(psi)!;
        var generated = process.StandardOutput.ReadToEnd();
        process.WaitForExit();

        Assert.Equal(0, process.ExitCode);

        // Compare with committed file
        var committed = File.ReadAllText(GeneratedPath);
        Assert.Equal(committed.Trim(), generated.Trim());
    }

    #endregion

    #region Binary Compatibility (Interpreter vs Codegen)

    [Fact]
    public void Player_InterpreterAndCodegen_ProduceSameBytes()
    {
        var schema = Parser.ParseSchemaYml(File.ReadAllText(SchemaPath));
        var interpreterApi = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var player = new Generated.Player
        {
            Id = "player-1",
            Name = "Alice",
            Score = 100,
            IsActive = true
        };

        // Encode via codegen
        var codegenEncoded = Generated.Player.Encode(player);

        // Encode via interpreter
        var interpState = new Dictionary<string, object?>
        {
            ["id"] = "player-1",
            ["name"] = "Alice",
            ["score"] = 100L,
            ["isActive"] = true
        };
        var interpEncoded = interpreterApi.Encode(interpState);

        Assert.Equal(codegenEncoded, interpEncoded);
    }

    [Fact]
    public void Position_InterpreterAndCodegen_ProduceSameBytes()
    {
        var schema = Parser.ParseSchemaYml(File.ReadAllText(SchemaPath));
        var interpreterApi = Interpreter.Load<Dictionary<string, object?>>(schema, "Position");

        var position = new Generated.Position { X = 10.5f, Y = 20.3f };

        var codegenEncoded = Generated.Position.Encode(position);

        var interpState = new Dictionary<string, object?>
        {
            ["x"] = 10.5f,
            ["y"] = 20.3f
        };
        var interpEncoded = interpreterApi.Encode(interpState);

        Assert.Equal(codegenEncoded, interpEncoded);
    }

    [Fact]
    public void GameState_InterpreterAndCodegen_ProduceSameBytes()
    {
        var schema = Parser.ParseSchemaYml(File.ReadAllText(SchemaPath));
        var interpreterApi = Interpreter.Load<Dictionary<string, object?>>(schema, "GameState");

        var gameState = new Generated.GameState
        {
            Players = new List<Generated.Player>
            {
                new() { Id = "p1", Name = "Alice", Score = 100, IsActive = true }
            },
            CurrentPlayer = "p1",
            Round = 1,
            Metadata = new Dictionary<string, string> { ["mode"] = "classic" }
        };

        var codegenEncoded = Generated.GameState.Encode(gameState);

        var interpState = new Dictionary<string, object?>
        {
            ["players"] = new List<object?>
            {
                new Dictionary<string, object?>
                {
                    ["id"] = "p1",
                    ["name"] = "Alice",
                    ["score"] = 100L,
                    ["isActive"] = true,
                    ["partner"] = null
                }
            },
            ["currentPlayer"] = "p1",
            ["round"] = 1L,
            ["metadata"] = new Dictionary<object, object?> { ["mode"] = "classic" },
            ["winningColor"] = null,
            ["lastAction"] = null
        };
        var interpEncoded = interpreterApi.Encode(interpState);

        Assert.Equal(codegenEncoded, interpEncoded);
    }

    [Fact]
    public void GameAction_InterpreterAndCodegen_ProduceSameBytes()
    {
        var schema = Parser.ParseSchemaYml(File.ReadAllText(SchemaPath));
        var interpreterApi = Interpreter.Load<UnionValue>(schema, "GameAction");

        var action = new Generated.MoveAction { X = 10, Y = 20 };

        var codegenEncoded = Generated.GameAction.Encode(action);

        var interpState = new UnionValue("MoveAction", new Dictionary<string, object?>
        {
            ["x"] = 10L,
            ["y"] = 20L
        });
        var interpEncoded = interpreterApi.Encode(interpState);

        Assert.Equal(codegenEncoded, interpEncoded);
    }

    #endregion

    #region Codegen API Tests

    [Fact]
    public void Player_Default()
    {
        var player = Generated.Player.Default();
        Assert.Equal("", player.Id);
        Assert.Equal("", player.Name);
        Assert.Equal(0, player.Score);
        Assert.False(player.IsActive);
        Assert.Null(player.Partner);
    }

    [Fact]
    public void Position_Default()
    {
        var pos = Generated.Position.Default();
        Assert.Equal(0f, pos.X);
        Assert.Equal(0f, pos.Y);
    }

    [Fact]
    public void GameAction_Default()
    {
        var action = Generated.GameAction.Default();
        Assert.IsType<Generated.MoveAction>(action);
    }

    [Fact]
    public void Player_EncodeDecodeRoundTrip()
    {
        var player = new Generated.Player
        {
            Id = "player-1",
            Name = "Alice",
            Score = 100,
            IsActive = true,
            Partner = new Generated.Player
            {
                Id = "player-2",
                Name = "Bob",
                Score = 50,
                IsActive = false
            }
        };

        var encoded = Generated.Player.Encode(player);
        var decoded = Generated.Player.Decode(encoded);

        Assert.True(Generated.Player.Equals(player, decoded));
    }

    [Fact]
    public void Player_DiffRoundTrip()
    {
        var player1 = new Generated.Player
        {
            Id = "player-1",
            Name = "Alice",
            Score = 100,
            IsActive = true
        };

        var player2 = new Generated.Player
        {
            Id = "player-1",
            Name = "Alice",
            Score = 150,
            IsActive = false
        };

        var diff = Generated.Player.EncodeDiff(player1, player2);
        var decoded = Generated.Player.DecodeDiff(player1, diff);

        Assert.True(Generated.Player.Equals(player2, decoded));
    }

    [Fact]
    public void GameState_EncodeDecodeRoundTrip()
    {
        var state = new Generated.GameState
        {
            Players = new List<Generated.Player>
            {
                new() { Id = "p1", Name = "Alice", Score = 100, IsActive = true },
                new() { Id = "p2", Name = "Bob", Score = 50, IsActive = true }
            },
            CurrentPlayer = "p1",
            Round = 5,
            Metadata = new Dictionary<string, string>
            {
                ["mode"] = "classic",
                ["difficulty"] = "hard"
            },
            WinningColor = Generated.Color.BLUE,
            LastAction = new Generated.AttackAction { TargetId = "p2", Damage = 25 }
        };

        var encoded = Generated.GameState.Encode(state);
        var decoded = Generated.GameState.Decode(encoded);

        Assert.True(Generated.GameState.Equals(state, decoded));
    }

    [Fact]
    public void GameState_DiffRoundTrip()
    {
        var state1 = new Generated.GameState
        {
            Players = new List<Generated.Player>
            {
                new() { Id = "p1", Name = "Alice", Score = 100, IsActive = true }
            },
            Round = 1,
            Metadata = new Dictionary<string, string> { ["mode"] = "classic" }
        };

        var state2 = new Generated.GameState
        {
            Players = new List<Generated.Player>
            {
                new() { Id = "p1", Name = "Alice", Score = 150, IsActive = true }
            },
            Round = 2,
            Metadata = new Dictionary<string, string> { ["mode"] = "classic" }
        };

        var diff = Generated.GameState.EncodeDiff(state1, state2);
        var decoded = Generated.GameState.DecodeDiff(state1, diff);

        Assert.True(Generated.GameState.Equals(state2, decoded));
    }

    [Fact]
    public void GameAction_EncodeDecodeRoundTrip()
    {
        Generated.GameAction action = new Generated.AttackAction
        {
            TargetId = "enemy-1",
            Damage = 50
        };

        var encoded = Generated.GameAction.Encode(action);
        var decoded = Generated.GameAction.Decode(encoded);

        Assert.True(Generated.GameAction.Equals(action, decoded));
    }

    [Fact]
    public void GameAction_DiffRoundTrip_SameType()
    {
        Generated.GameAction action1 = new Generated.MoveAction { X = 10, Y = 20 };
        Generated.GameAction action2 = new Generated.MoveAction { X = 15, Y = 25 };

        var diff = Generated.GameAction.EncodeDiff(action1, action2);
        var decoded = Generated.GameAction.DecodeDiff(action1, diff);

        Assert.True(Generated.GameAction.Equals(action2, decoded));
    }

    [Fact]
    public void GameAction_DiffRoundTrip_TypeChange()
    {
        Generated.GameAction action1 = new Generated.MoveAction { X = 10, Y = 20 };
        Generated.GameAction action2 = new Generated.AttackAction { TargetId = "enemy-1", Damage = 50 };

        var diff = Generated.GameAction.EncodeDiff(action1, action2);
        var decoded = Generated.GameAction.DecodeDiff(action1, diff);

        Assert.True(Generated.GameAction.Equals(action2, decoded));
    }

    [Fact]
    public void Clone_CreatesDeepCopy()
    {
        var player = new Generated.Player
        {
            Id = "p1",
            Name = "Alice",
            Score = 100,
            IsActive = true,
            Partner = new Generated.Player { Id = "p2", Name = "Bob", Score = 50, IsActive = true }
        };

        var cloned = Generated.Player.Clone(player);

        // Modify original
        player.Name = "Alicia";
        player.Partner!.Name = "Bobby";

        // Clone should be unchanged
        Assert.Equal("Alice", cloned.Name);
        Assert.Equal("Bob", cloned.Partner!.Name);
    }

    [Fact]
    public void Inventory_NestedContainers_RoundTrip()
    {
        var inventory = new Generated.Inventory
        {
            Items = new List<Dictionary<string, long>>
            {
                new() { ["sword"] = 1, ["shield"] = 1 },
                new() { ["potion"] = 5, ["arrow"] = 20 }
            }
        };

        var encoded = Generated.Inventory.Encode(inventory);
        var decoded = Generated.Inventory.Decode(encoded);

        Assert.True(Generated.Inventory.Equals(inventory, decoded));
    }

    [Fact]
    public void PlayerRegistry_MapWithObjectValues_RoundTrip()
    {
        var registry = new Generated.PlayerRegistry
        {
            Players = new Dictionary<string, Generated.Player>
            {
                ["alice"] = new() { Id = "p1", Name = "Alice", Score = 100, IsActive = true },
                ["bob"] = new() { Id = "p2", Name = "Bob", Score = 50, IsActive = false }
            }
        };

        var encoded = Generated.PlayerRegistry.Encode(registry);
        var decoded = Generated.PlayerRegistry.Decode(encoded);

        Assert.True(Generated.PlayerRegistry.Equals(registry, decoded));
    }

    #endregion
}
