using Xunit;

namespace DeltaPack.Tests;

public class CodegenTests
{
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
