using System;
using System.Collections.Generic;
using DeltaPack;
using DeltaPack.Tests.Tracking.Models;
using Xunit;

namespace DeltaPack.Tests.Tracking;

public class AliasReproTests
{
    // ============ Object-setter aliasing ============

    [Fact]
    public void Aliasing_same_child_into_second_slot_throws()
    {
        var live = TrackedPair.Default();
        var shared = TrackedPosition.Default();
        live.A = shared;

        var ex = Assert.Throws<InvalidOperationException>(() => live.B = shared);
        Assert.Contains("aliasing is not supported", ex.Message);
        Assert.Contains("TrackedPair.B", ex.Message);
    }

    [Fact]
    public void Moving_tracked_child_between_parents_throws()
    {
        var p1 = TrackedPair.Default();
        var p2 = TrackedPair.Default();
        var shared = TrackedPosition.Default();
        p1.A = shared;

        Assert.Throws<InvalidOperationException>(() => p2.A = shared);
    }

    [Fact]
    public void Reassigning_same_value_to_same_slot_is_a_noop()
    {
        var live = TrackedPair.Default();
        var shared = TrackedPosition.Default();
        live.A = shared;
        live.A = shared;
        Assert.Same(shared, live.A);
    }

    [Fact]
    public void Detach_then_reassign_is_allowed()
    {
        var live = TrackedPair.Default();
        var shared = TrackedPosition.Default();
        live.A = shared;
        live.A = TrackedPosition.Default();
        live.B = shared;

        shared.X = 42;
        var snap = TrackedPair.Clone(live);
        Tracker.RegisterSnapshot(snap, live);

        shared.X = 99;
        var decoded = TrackedPair.DecodeDiff(snap, TrackedPair.EncodeDiff(snap, live));
        Assert.Equal(99, decoded.B.X);
    }

    // ============ TrackedList aliasing ============

    [Fact]
    public void List_adding_same_tracked_child_twice_throws()
    {
        var list = new DPList<TrackedPosition>();
        var shared = TrackedPosition.Default();
        list.Add(shared);
        Assert.Throws<InvalidOperationException>(() => list.Add(shared));
    }

    [Fact]
    public void List_indexer_assigning_aliased_child_to_different_index_throws()
    {
        var list = new DPList<TrackedPosition>
        {
            TrackedPosition.Default(),
            TrackedPosition.Default(),
        };
        var a = list[0];
        Assert.Throws<InvalidOperationException>(() => list[1] = a);
    }

    [Fact]
    public void List_moving_tracked_child_between_lists_throws()
    {
        var l1 = new DPList<TrackedPosition>();
        var l2 = new DPList<TrackedPosition>();
        var shared = TrackedPosition.Default();
        l1.Add(shared);
        Assert.Throws<InvalidOperationException>(() => l2.Add(shared));
    }

    [Fact]
    public void List_insert_of_already_owned_child_throws()
    {
        var list = new DPList<TrackedPosition>();
        var shared = TrackedPosition.Default();
        list.Add(shared);
        Assert.Throws<InvalidOperationException>(() => list.Insert(0, shared));
    }

    [Fact]
    public void List_addRange_with_duplicate_references_throws()
    {
        var list = new DPList<TrackedPosition>();
        var shared = TrackedPosition.Default();
        var ex = Assert.Throws<InvalidOperationException>(
            () => list.AddRange(new[] { shared, shared }));
        Assert.Contains("more than once", ex.Message);
        Assert.Empty(list); // pre-scan failed before any mutation
    }

    [Fact]
    public void List_insertRange_with_already_parented_child_throws()
    {
        var donor = new DPList<TrackedPosition>();
        var shared = TrackedPosition.Default();
        donor.Add(shared);

        var target = new DPList<TrackedPosition> { TrackedPosition.Default() };
        Assert.Throws<InvalidOperationException>(
            () => target.InsertRange(0, new[] { shared, TrackedPosition.Default() }));
    }

    [Fact]
    public void List_constructor_rejects_pre_parented_child()
    {
        var parent = TrackedPair.Default();
        var shared = TrackedPosition.Default();
        parent.A = shared;
        Assert.Throws<InvalidOperationException>(
            () => new DPList<TrackedPosition>(new[] { shared }));
    }

    [Fact]
    public void List_remove_then_readd_is_allowed()
    {
        var list = new DPList<TrackedPosition>();
        var shared = TrackedPosition.Default();
        list.Add(shared);
        list.RemoveAt(0);
        list.Add(shared); // Parent was cleared by RemoveAt → allowed
        Assert.Same(shared, list[0]);
    }

    // ============ TrackedOrderedDict aliasing ============

    [Fact]
    public void Dict_setting_same_value_under_two_keys_throws()
    {
        var dict = new DPDict<string, TrackedPosition>();
        var shared = TrackedPosition.Default();
        dict["a"] = shared;
        Assert.Throws<InvalidOperationException>(() => dict["b"] = shared);
    }

    [Fact]
    public void Dict_moving_tracked_value_between_dicts_throws()
    {
        var d1 = new DPDict<string, TrackedPosition>();
        var d2 = new DPDict<string, TrackedPosition>();
        var shared = TrackedPosition.Default();
        d1["k"] = shared;
        Assert.Throws<InvalidOperationException>(() => d2["k"] = shared);
    }

    [Fact]
    public void Dict_setting_same_value_to_same_key_is_allowed()
    {
        var dict = new DPDict<string, TrackedPosition>();
        var shared = TrackedPosition.Default();
        dict["k"] = shared;
        dict["k"] = shared; // same ref, same key — permitted
        Assert.Same(shared, dict["k"]);
    }

    [Fact]
    public void Dict_constructor_rejects_duplicate_value_references()
    {
        var shared = TrackedPosition.Default();
        var src = new Dictionary<string, TrackedPosition> { ["a"] = shared, ["b"] = shared };
        Assert.Throws<InvalidOperationException>(
            () => new DPDict<string, TrackedPosition>(src));
    }

    [Fact]
    public void Dict_remove_then_readd_is_allowed()
    {
        var dict = new DPDict<string, TrackedPosition>();
        var shared = TrackedPosition.Default();
        dict["a"] = shared;
        dict.Remove("a");
        dict["b"] = shared; // Parent cleared by Remove → allowed
        Assert.Same(shared, dict["b"]);
    }
}
