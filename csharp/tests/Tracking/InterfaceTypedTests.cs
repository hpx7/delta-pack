using System.Collections.Generic;
using System.Linq;
using DeltaPack;
using DeltaPack.Tests.Tracking.Models;
using Xunit;

namespace DeltaPack.Tests.Tracking;

/// <summary>
/// Verifies that partial properties declared as <see cref="IList{T}"/> / <see cref="IDictionary{TKey,TValue}"/>
/// preserve the tracking semantics of their concrete <c>DPList</c> / <c>DPDict</c> equivalents — the setter
/// wraps non-tracked assignments, the getter returns the underlying tracked container typed as the interface,
/// and the wire format is unchanged.
/// </summary>
public class InterfaceTypedTests
{
    [Fact]
    public void Backing_field_is_tracked_container_after_default_construction()
    {
        var p = new InterfaceTrackedPlayer();
        // The getter reads the backing field — DPList<T> implements both IList<T> and IDirtyTracked.
        Assert.IsType<DPList<int>>(p.Inventory);
        Assert.IsType<DPDict<string, int>>(p.Stats);
    }

    [Fact]
    public void Assigning_plain_List_wraps_into_DPList()
    {
        var p = new InterfaceTrackedPlayer();
        var raw = new List<int> { 1, 2, 3 };
        p.Inventory = raw;

        Assert.IsType<DPList<int>>(p.Inventory);
        // Wrap is a copy: caller's reference no longer == the backing.
        Assert.False(ReferenceEquals(raw, p.Inventory));
        Assert.Equal(new[] { 1, 2, 3 }, p.Inventory);
    }

    [Fact]
    public void Assigning_plain_Dictionary_wraps_into_DPDict()
    {
        var p = new InterfaceTrackedPlayer();
        var raw = new Dictionary<string, int> { ["hp"] = 100, ["mp"] = 50 };
        p.Stats = raw;

        Assert.IsType<DPDict<string, int>>(p.Stats);
        Assert.False(ReferenceEquals(raw, p.Stats));
        Assert.Equal(100, p.Stats["hp"]);
        Assert.Equal(50, p.Stats["mp"]);
    }

    [Fact]
    public void Assigning_an_existing_DPList_passes_through_without_wrapping()
    {
        var p = new InterfaceTrackedPlayer();
        var dp = new DPList<int> { 7, 8, 9 };
        p.Inventory = dp;
        // No copy — same reference reaches the backing field.
        Assert.Same(dp, p.Inventory);
    }

    [Fact]
    public void Assigning_an_existing_DPDict_passes_through_without_wrapping()
    {
        var p = new InterfaceTrackedPlayer();
        var dp = new DPDict<string, int> { ["k"] = 1 };
        p.Stats = dp;
        Assert.Same(dp, p.Stats);
    }

    [Fact]
    public void Mutations_through_the_interface_getter_record_dirty_versions()
    {
        var p = new InterfaceTrackedPlayer();
        // Add via IList<T> — dispatches to DPList.Add and bumps the dirty index.
        p.Inventory.Add(42);
        var dp = (DPList<int>)p.Inventory;
        Assert.True(dp.DirtyIndices.ContainsKey(0));

        // Same for IDictionary<K, V>.
        p.Stats["hp"] = 100;
        var dd = (DPDict<string, int>)p.Stats;
        Assert.True(dd.CreatedKeys.ContainsKey("hp"));
    }

    [Fact]
    public void Wrapped_assignment_propagates_dirty_to_parent_slot()
    {
        var p = new InterfaceTrackedPlayer();
        var startVersion = Tracker.CurrentVersion;
        p.Inventory = new List<int> { 1, 2, 3 };

        var tracked = (ITrackedObject)p;
        // Inventory is slot 2 (Name=0, Score=1, Inventory=2, Stats=3).
        Assert.True(tracked.GetDirtyVersion(2) > startVersion);
    }

    [Fact]
    public void Reassigning_same_DPList_short_circuits()
    {
        var p = new InterfaceTrackedPlayer();
        var dp = new DPList<int> { 1, 2, 3 };
        p.Inventory = dp;
        var versionAfterFirst = Tracker.CurrentVersion;

        p.Inventory = dp; // ReferenceEquals(backing, value) → early return
        Assert.Equal(versionAfterFirst, Tracker.CurrentVersion);
    }

    [Fact]
    public void Wire_format_matches_concrete_typed_equivalent()
    {
        // The interface-typed model and ConcreteTrackedPlayerMirror have identical fields;
        // with matching state, encoded bytes must be byte-identical. Confirms the IList/
        // IDictionary sugar is purely a declaration-level change with no wire impact.
        var ifaceP = new InterfaceTrackedPlayer
        {
            Name = "Alice",
            Score = 42,
            Inventory = new List<int> { 1, 2, 3 },
            Stats = new Dictionary<string, int> { ["hp"] = 100 },
        };
        var concreteP = new ConcreteTrackedPlayerMirror
        {
            Name = "Alice",
            Score = 42,
            Inventory = new DPList<int> { 1, 2, 3 },
            Stats = new DPDict<string, int> { ["hp"] = 100 },
        };

        var ifaceBytes = InterfaceTrackedPlayer.Encode(ifaceP);
        var concreteBytes = ConcreteTrackedPlayerMirror.Encode(concreteP);
        Assert.Equal(concreteBytes, ifaceBytes);
    }

    [Fact]
    public void Round_trip_through_encode_decode_preserves_state()
    {
        var p = new InterfaceTrackedPlayer
        {
            Name = "Bob",
            Score = 7,
            Inventory = new List<int> { 10, 20, 30 },
            Stats = new Dictionary<string, int> { ["str"] = 5, ["dex"] = 9 },
        };

        var bytes = InterfaceTrackedPlayer.Encode(p);
        var decoded = InterfaceTrackedPlayer.Decode(bytes);
        Assert.Equal("Bob", decoded.Name);
        Assert.Equal(7u, decoded.Score);
        Assert.Equal(new[] { 10, 20, 30 }, decoded.Inventory);
        Assert.Equal(5, decoded.Stats["str"]);
        Assert.Equal(9, decoded.Stats["dex"]);
        // Decoded backing is the concrete tracked container.
        Assert.IsType<DPList<int>>(decoded.Inventory);
        Assert.IsType<DPDict<string, int>>(decoded.Stats);
    }

    [Fact]
    public void SyncSession_works_with_interface_typed_model()
    {
        var server = InterfaceTrackedRegistry.CreateSyncSession();
        var client = InterfaceTrackedRegistry.CreateSyncSession();

        var state = new InterfaceTrackedRegistry
        {
            Players = new Dictionary<string, InterfaceTrackedPlayer>
            {
                ["a"] = new() { Name = "Alice", Score = 1 },
            },
        };

        var snapshot = server.Encode(state);
        var view = client.Decode(snapshot);
        Assert.Equal("Alice", view.Players["a"].Name);

        // Mutate through the interface-typed property and send a diff.
        state.Players["a"].Score = 99;
        var diff = server.Encode(state);
        view = client.Decode(diff);
        Assert.Equal(99u, view.Players["a"].Score);

        // Add through the IDictionary surface.
        state.Players["b"] = new InterfaceTrackedPlayer { Name = "Bob", Score = 5 };
        diff = server.Encode(state);
        view = client.Decode(diff);
        Assert.Equal(2, view.Players.Count);
        Assert.Equal("Bob", view.Players["b"].Name);
    }
}
