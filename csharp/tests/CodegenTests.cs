using System.Diagnostics;
using Xunit;

namespace DeltaPack.Tests;

public class CodegenTests
{
    private static readonly string TestsDir = Path.GetFullPath(
        Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));

    private static readonly string SchemaPath = Path.Combine(TestsDir, "tests", "schema.yml");
    private static readonly string GeneratedPath = Path.Combine(TestsDir, "tests", "GeneratedSchema.cs");

    [Fact]
    public void GeneratedCode_MatchesCommittedFile()
    {
        // Generate fresh code using CLI
        var psi = new ProcessStartInfo
        {
            FileName = "delta-pack",
            Arguments = $"generate {SchemaPath} -l csharp -n Generated",
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
}
