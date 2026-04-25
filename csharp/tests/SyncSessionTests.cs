using DeltaPack;
using DeltaPack.Tests.Tracking.Models;
using Xunit;

namespace DeltaPack.Tests;

public class SyncSessionTests
{
    private static SyncSession<Generated.PlayerRegistry> NewSession()
        => Generated.PlayerRegistry.CreateSyncSession();

    [Fact]
    public void RoundTripsASequenceOfTicks()
    {
        var sender = NewSession();
        var receiver = NewSession();

        var state = new Generated.PlayerRegistry
        {
            Players = new OrderedDict<string, Generated.Player>
            {
                { "a", new Generated.Player { Id = "a", Name = "Alice", Score = 10 } },
                { "b", new Generated.Player { Id = "b", Name = "Bob", Score = 20 } },
            },
        };

        for (var i = 0; i < 5; i++)
        {
            var bytes = sender.Encode(state);
            var decoded = receiver.Decode(bytes);
            Assert.Equal(state.Players["a"].Score, decoded.Players["a"].Score);
            Assert.Equal(state.Players["b"].Score, decoded.Players["b"].Score);
            state.Players["a"].Score += 1;
        }

        Assert.NotNull(sender.Current);
        Assert.NotNull(receiver.Current);
    }

    [Fact]
    public void SurvivesPrevReorderedBetweenEncodes()
    {
        var sender = NewSession();
        var receiver = NewSession();

        var state = new Generated.PlayerRegistry
        {
            Players = new OrderedDict<string, Generated.Player>
            {
                { "a", new Generated.Player { Id = "a", Name = "Alice", Score = 10 } },
                { "b", new Generated.Player { Id = "b", Name = "Bob", Score = 20 } },
                { "c", new Generated.Player { Id = "c", Name = "Carol", Score = 30 } },
            },
        };

        // Tick 1: initial sync
        receiver.Decode(sender.Encode(state));

        // Between ticks: user-side reordering via delete+reinsert.
        // Net value change: zero.
        var a = state.Players["a"];
        state.Players.Remove("a");
        state.Players["a"] = a;
        // state is now ordered [b, c, a] — but SyncSession's view still tracks [a, b, c].

        // Tick 2: real update to player c
        state.Players["c"].Score = 99;

        var decoded = receiver.Decode(sender.Encode(state));

        Assert.Equal(10, decoded.Players["a"].Score);
        Assert.Equal(20, decoded.Players["b"].Score);
        Assert.Equal(99, decoded.Players["c"].Score); // ← not corrupted
    }

    [Fact]
    public void KeepsTrackedStateInSyncAcrossManyTicks()
    {
        var sender = TrackedRegistry.CreateSyncSession();
        var receiver = TrackedRegistry.CreateSyncSession();

        var state = new TrackedRegistry
        {
            Players = new TrackedOrderedDict<string, TrackedPlayer>(),
        };
        state.Players["a"] = new TrackedPlayer { Name = "Alice", Score = 10 };
        receiver.Decode(sender.Encode(state));

        // Mix of additions, deletions, and field mutations over many ticks.
        state.Players["b"] = new TrackedPlayer { Name = "Bob", Score = 20 };
        receiver.Decode(sender.Encode(state));

        for (var i = 0; i < 20; i++)
        {
            state.Players["a"].Score += 1;
            receiver.Decode(sender.Encode(state));
        }

        state.Players.Remove("a");
        var final = receiver.Decode(sender.Encode(state));
        Assert.False(final.Players.ContainsKey("a"));
        Assert.Equal(20u, final.Players["b"].Score);
    }

    [Fact]
    public void FirstCallEncodesFullStateThenDiffs()
    {
        var sender = NewSession();
        var state = new Generated.PlayerRegistry
        {
            Players = new OrderedDict<string, Generated.Player>
            {
                { "a", new Generated.Player { Id = "a", Name = "Alice", Score = 10 } },
            },
        };

        var fullBytes = sender.Encode(state);
        var diffBytes = sender.Encode(state); // no change; should be a tiny diff
        Assert.True(diffBytes.Length < fullBytes.Length);
    }
}
