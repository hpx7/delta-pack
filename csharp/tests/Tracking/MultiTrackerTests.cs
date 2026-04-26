using System.Collections.Generic;
using DeltaPack;
using DeltaPack.Tests.Tracking.Models;
using Xunit;

namespace DeltaPack.Tests.Tracking;

/// <summary>
/// Verifies that <see cref="Tracker"/> instances isolate per-domain state — a stale
/// snapshot in one tracker doesn't suppress pruning or the setter fast-path in another.
/// </summary>
public class MultiTrackerTests
{
    [Fact]
    public void Independent_trackers_have_independent_baselines()
    {
        var trackerA = new Tracker();
        var trackerB = new Tracker();

        var a = TrackedPosition.CreateSyncSession(trackerA);
        var b = TrackedPosition.CreateSyncSession(trackerB);

        Assert.Equal(-1, trackerA.LatestBaseline);
        Assert.Equal(-1, trackerB.LatestBaseline);

        var stateA = TrackedPosition.Default(trackerA);
        a.Encode(stateA);

        var afterA = trackerA.LatestBaseline;
        Assert.True(afterA > -1);
        // B's baseline must not move when A registers a snapshot.
        Assert.Equal(-1, trackerB.LatestBaseline);

        var stateB = TrackedPosition.Default(trackerB);
        b.Encode(stateB);

        Assert.True(trackerB.LatestBaseline > -1);
        // A's baseline must not move when B registers either.
        Assert.Equal(afterA, trackerA.LatestBaseline);
    }

    [Fact]
    public void Tombstones_in_one_tracker_prune_independently_of_another()
    {
        var trackerA = new Tracker();
        var trackerB = new Tracker();

        var dictA = new DPDict<string, int>(trackerA);
        var dictB = new DPDict<string, int>(trackerB);

        // A holds a snapshot perpetually (simulates a stale ack-baseline).
        dictA["x"] = 1;
        var snapA = new DPDict<string, int>(trackerA, new Dictionary<string, int>(dictA));
        // We can't construct a frozen baseline directly; use a clone-and-register pattern.
        var aSnapHolder = new DPDict<string, int>(trackerA);
        aSnapHolder["x"] = 1;
        Tracker.RegisterSnapshot(aSnapHolder, dictA);

        // B churns: insert lots of keys, delete them, then register a fresh snapshot.
        for (int i = 0; i < 10; i++) dictB[$"k{i}"] = i;
        for (int i = 0; i < 10; i++) dictB.Remove($"k{i}");

        // Before pruning runs, B has 10 tombstones.
        Assert.Equal(10, dictB.DeletedKeys.Count);

        // Bump the global version past every existing tombstone, then register a fresh B
        // snapshot — its baseline is now strictly newer than every tombstone in B, so
        // pruning clears them. A's stale snapshot lives in trackerA, not trackerB, so it
        // cannot hold up B's cutoff.
        dictB["sentinel"] = 0;
        dictB.Remove("sentinel");  // bumps global version one more time after the last "real" deletion
        var bSnapHolder = new DPDict<string, int>(trackerB);
        Tracker.RegisterSnapshot(bSnapHolder, dictB);

        // Of the 11 tombstones, 10 had versions strictly less than the snapshot baseline
        // and were pruned; the most-recent "sentinel" tombstone may equal the baseline and
        // survive (the prune predicate is strictly-less-than). The point of the test is
        // that pruning *fires* in B without being held up by A.
        Assert.True(dictB.DeletedKeys.Count <= 1, $"expected ≤1 tombstone, got {dictB.DeletedKeys.Count}");
    }

    [Fact]
    public void Sync_sessions_in_different_trackers_round_trip_independently()
    {
        var roomA = new Tracker();
        var roomB = new Tracker();

        var senderA = TrackedPlayer.CreateSyncSession(roomA);
        var receiverA = TrackedPlayer.CreateSyncSession(roomA);
        var senderB = TrackedPlayer.CreateSyncSession(roomB);
        var receiverB = TrackedPlayer.CreateSyncSession(roomB);

        var stateA = TrackedPlayer.Default(roomA);
        stateA.Name = "alice";
        stateA.Score = 1;

        var stateB = TrackedPlayer.Default(roomB);
        stateB.Name = "bob";
        stateB.Score = 99;

        // Initial full encode on both sides.
        receiverA.Decode(senderA.Encode(stateA));
        receiverB.Decode(senderB.Encode(stateB));

        // Subsequent diff encode on both sides.
        stateA.Score = 2;
        stateB.Score = 100;
        var viewA = receiverA.Decode(senderA.Encode(stateA));
        var viewB = receiverB.Decode(senderB.Encode(stateB));

        Assert.Equal("alice", viewA.Name);
        Assert.Equal(2u, viewA.Score);
        Assert.Equal("bob", viewB.Name);
        Assert.Equal(100u, viewB.Score);
    }
}
