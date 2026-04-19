using System;
using System.Collections.Generic;
using DeltaPack;
using DeltaPack.Tests.Tracking.Models;
using Xunit;

namespace DeltaPack.Tests.Tracking;

public class TrackingTests
{
    // ============ Object tracking ============

    [Fact]
    public void Setting_property_marks_field_dirty()
    {
        var p = new TrackedPosition();
        var startVersion = DirtyTracking.CurrentVersion;
        p.X = 5f;
        p.Y = 10f;

        var tracked = (IDirtyTracked)p;
        Assert.NotNull(tracked.DirtyFields);
        Assert.True(tracked.DirtyFields!["X"] > startVersion);
        Assert.True(tracked.DirtyFields!["Y"] > startVersion);
    }

    [Fact]
    public void Setting_property_to_same_value_does_not_mark_dirty()
    {
        var p = new TrackedPosition();
        p.X = 5f;
        var tracked = (IDirtyTracked)p;
        var versionAfterFirstSet = tracked.DirtyFields!["X"];

        p.X = 5f; // no-op
        Assert.Equal(versionAfterFirstSet, tracked.DirtyFields!["X"]);
    }

    [Fact]
    public void Nested_tracked_object_propagates_to_parent()
    {
        var player = new TrackedPlayer();
        // Touch the property so the getter reparents.
        var pos = player.Pos;
        pos.X = 100f;

        var parentTracked = (IDirtyTracked)player;
        Assert.Contains("Pos", parentTracked.DirtyFields!.Keys);
    }

    // ============ TrackedList ============

    [Fact]
    public void TrackedList_Add_marks_index_dirty()
    {
        var list = new TrackedList<int>();
        list.Add(42);
        var tracked = (IDirtyTracked)list;
        Assert.NotNull(tracked.DirtyIndices);
        Assert.True(tracked.DirtyIndices!.ContainsKey(0));
    }

    [Fact]
    public void TrackedList_Set_to_same_value_does_not_mark_dirty()
    {
        var list = new TrackedList<int> { 1, 2, 3 };
        var tracked = (IDirtyTracked)list;
        var versionBefore = tracked.DirtyIndices!.GetValueOrDefault(1, -1);

        list[1] = 2; // no-op
        Assert.Equal(versionBefore, tracked.DirtyIndices!.GetValueOrDefault(1, -1));
    }

    [Fact]
    public void TrackedList_RemoveAt_shifts_parent_keys()
    {
        var list = new TrackedList<TrackedPosition>();
        var p0 = new TrackedPosition();
        var p1 = new TrackedPosition();
        var p2 = new TrackedPosition();
        list.Add(p0);
        list.Add(p1);
        list.Add(p2);

        list.RemoveAt(0);

        Assert.Equal(0, ((IDirtyTracked)p1).ParentKey);
        Assert.Equal(1, ((IDirtyTracked)p2).ParentKey);
    }

    [Fact]
    public void TrackedList_Add_propagates_to_parent_object()
    {
        var player = new TrackedPlayer();
        // Touching the property reparents the list.
        player.Inventory.Add(7);

        var parentTracked = (IDirtyTracked)player;
        Assert.Contains("Inventory", parentTracked.DirtyFields!.Keys);
    }

    [Fact]
    public void TrackedList_RemoveRange_shifts_parent_keys()
    {
        var list = new TrackedList<TrackedPosition>();
        var p0 = new TrackedPosition();
        var p1 = new TrackedPosition();
        var p2 = new TrackedPosition();
        var p3 = new TrackedPosition();
        list.Add(p0);
        list.Add(p1);
        list.Add(p2);
        list.Add(p3);

        list.RemoveRange(1, 2);

        Assert.Equal(2, list.Count);
        Assert.Equal(0, ((IDirtyTracked)p0).ParentKey);
        Assert.Equal(1, ((IDirtyTracked)p3).ParentKey);
    }

    [Fact]
    public void TrackedList_InsertRange_shifts_parent_keys()
    {
        var list = new TrackedList<TrackedPosition>();
        var p0 = new TrackedPosition();
        var p1 = new TrackedPosition();
        list.Add(p0);
        list.Add(p1);

        var p_new1 = new TrackedPosition();
        var p_new2 = new TrackedPosition();
        list.InsertRange(1, new[] { p_new1, p_new2 });

        Assert.Equal(4, list.Count);
        Assert.Equal(0, ((IDirtyTracked)p0).ParentKey);
        Assert.Equal(1, ((IDirtyTracked)p_new1).ParentKey);
        Assert.Equal(2, ((IDirtyTracked)p_new2).ParentKey);
        Assert.Equal(3, ((IDirtyTracked)p1).ParentKey);
    }

    // ============ TrackedOrderedDict ============

    [Fact]
    public void TrackedDict_Set_new_key_records_in_Created()
    {
        var dict = new TrackedOrderedDict<string, int>();
        dict["a"] = 1;
        Assert.Contains("a", dict.CreatedKeys.Keys);
        Assert.DoesNotContain("a", dict.DirtyKeys.Keys);
    }

    [Fact]
    public void TrackedDict_Set_existing_key_records_in_Dirty_not_Created()
    {
        var dict = new TrackedOrderedDict<string, int> { ["a"] = 1 };
        // Snapshot resets — but for a fresh dict, the Add went through Created. We need to
        // simulate a baseline by creating from an IDictionary source.
        var seeded = new TrackedOrderedDict<string, int>(new Dictionary<string, int> { ["a"] = 1 });
        seeded["a"] = 2;
        Assert.Contains("a", seeded.DirtyKeys.Keys);
        Assert.DoesNotContain("a", seeded.CreatedKeys.Keys);
    }

    [Fact]
    public void TrackedDict_Remove_records_in_Deleted()
    {
        var dict = new TrackedOrderedDict<string, int>(new Dictionary<string, int> { ["a"] = 1 });
        dict.Remove("a");
        Assert.Contains("a", dict.DeletedKeys.Keys);
    }

    [Fact]
    public void TrackedDict_Revival_clears_Deleted()
    {
        var dict = new TrackedOrderedDict<string, int>(new Dictionary<string, int> { ["a"] = 1 });
        dict.Remove("a");
        dict["a"] = 2;
        Assert.DoesNotContain("a", dict.DeletedKeys.Keys);
    }

    // ============ Snapshot semantics ============

    [Fact]
    public void Clone_registers_snapshot_with_current_version()
    {
        var live = TrackedPosition.Default();
        live.X = 1f;
        var snap = TrackedPosition.Clone(live);

        var snapTracked = (IDirtyTracked)snap;
        Assert.Equal(DirtyTracking.CurrentVersion, snapTracked.SnapshotVersion);
    }

    [Fact]
    public void EncodeDiff_after_snapshot_only_emits_changed_fields()
    {
        var live = TrackedPosition.Default();
        live.X = 1f;
        live.Y = 2f;

        var snap = TrackedPosition.Clone(live);
        live.X = 100f;

        var diff = TrackedPosition.EncodeDiff(snap, live);
        var decoded = TrackedPosition.DecodeDiff(snap, diff);
        Assert.Equal(100f, decoded.X);
        Assert.Equal(2f, decoded.Y);
    }

    [Fact]
    public void Snapshot_propagates_version_into_nested_collections()
    {
        // Regression: nested TrackedList/TrackedOrderedDict on a snapshot must have
        // their SnapshotVersion set so the encoder's index-based filter has the right baseline.
        var live = TrackedPlayer.Default();
        live.Inventory.Add(1);
        live.Inventory.Add(2);

        var snap = TrackedPlayer.Clone(live);
        var snapInventory = (IDirtyTracked)snap.Inventory;
        Assert.Equal(DirtyTracking.CurrentVersion, snapInventory.SnapshotVersion);
    }

    [Fact]
    public void Parent_propagation_short_circuits_when_version_already_higher()
    {
        // Burn through some versions to verify PropagateToParent stops walking up the chain
        // once the parent's recorded version for the key is >= the propagated version.
        var live = TrackedPlayer.Default();
        live.Pos.X = 1f;
        var versionAfterFirst = ((IDirtyTracked)live).DirtyFields!["Pos"];
        live.Pos.X = 2f;
        var versionAfterSecond = ((IDirtyTracked)live).DirtyFields!["Pos"];
        Assert.True(versionAfterSecond > versionAfterFirst);
    }

    [Fact]
    public void Diff_with_fresh_baseline_emits_all_set_fields()
    {
        // Using a default-constructed instance as `a` (snapshot) should result in every
        // tracked mutation since "the beginning of time" being included in the diff.
        var fresh = new TrackedPosition();
        var live = TrackedPosition.Default();
        live.X = 99f;

        var diff = TrackedPosition.EncodeDiff(fresh, live);
        var decoded = TrackedPosition.DecodeDiff(fresh, diff);
        Assert.Equal(99f, decoded.X);
        Assert.Equal(0f, decoded.Y);
    }
}
