using DeltaPack.Tests.Tracking.Models;
using Xunit;

namespace DeltaPack.Tests;

// Schema-level reproductions of the two real crashes found while benchmarking: a full
// snapshot encode of a large, uniformly-valued DPDict, and a steady-state diff encode where
// many entries flip the same boolean field in one tick. Both used to throw
// InvalidOperationException("RLE count too large") before the varint-escape fix.
public class RleEscapeIntegrationTests
{
    private static SyncSession<RleFlagBoard> NewSession() => RleFlagBoard.CreateSyncSession();

    [Fact]
    public void FullEncode_5000UniformBooleans_RoundTrips()
    {
        var board = new RleFlagBoard { Flags = new DPDict<string, RleFlag>() };
        for (var i = 0; i < 5000; i++)
            board.Flags[$"f{i}"] = new RleFlag { V = true };

        var sender = NewSession();
        var receiver = NewSession();

        var bytes = sender.Encode(board);
        var decoded = receiver.Decode(bytes);

        Assert.Equal(5000, decoded.Flags.Count);
        for (var i = 0; i < 5000; i++)
            Assert.True(decoded.Flags[$"f{i}"].V);
    }

    [Fact]
    public void DiffEncode_300FlipsInOneTick_RoundTrips()
    {
        const int total = 400;
        const int flipCount = 300;

        var board = new RleFlagBoard { Flags = new DPDict<string, RleFlag>() };
        for (var i = 0; i < total; i++)
            board.Flags[$"f{i}"] = new RleFlag { V = (i / 50) % 2 == 0 };

        var sender = NewSession();
        var receiver = NewSession();

        // Prime both sides with a full snapshot; the alternating-every-50 pattern keeps the
        // longest run well under the old 269 cap either way.
        receiver.Decode(sender.Encode(board));

        var expected = new bool[total];
        for (var i = 0; i < total; i++)
            expected[i] = board.Flags[$"f{i}"].V;

        // Flip the first 300 entries in one steady-state tick. Every flip writes "changed"
        // for the same single field, so 300 dirty entries in a row emit the same RLE bit
        // with nothing in the schema to interleave and break up the run.
        for (var i = 0; i < flipCount; i++)
        {
            board.Flags[$"f{i}"].V = !board.Flags[$"f{i}"].V;
            expected[i] = !expected[i];
        }

        var diffBytes = sender.Encode(board);
        var decoded = receiver.Decode(diffBytes);

        for (var i = 0; i < total; i++)
            Assert.Equal(expected[i], decoded.Flags[$"f{i}"].V);
    }

    [Fact]
    public void DiffEncode_AllFlagsFlippedAtOnce_RoundTrips()
    {
        // Stress case: every entry shares the same field and all flip together, producing
        // one uninterrupted run spanning the entire collection.
        const int total = 10_000;

        var board = new RleFlagBoard { Flags = new DPDict<string, RleFlag>() };
        for (var i = 0; i < total; i++)
            board.Flags[$"f{i}"] = new RleFlag { V = false };

        var sender = NewSession();
        var receiver = NewSession();
        receiver.Decode(sender.Encode(board));

        for (var i = 0; i < total; i++)
            board.Flags[$"f{i}"].V = true;

        var decoded = receiver.Decode(sender.Encode(board));

        for (var i = 0; i < total; i++)
            Assert.True(decoded.Flags[$"f{i}"].V);
    }
}
