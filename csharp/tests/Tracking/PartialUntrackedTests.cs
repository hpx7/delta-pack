using DeltaPack.Tests.Tracking.Models;
using Xunit;

namespace DeltaPack.Tests.Tracking;

// These tests exist for their compile-time value: if the generator doesn't emit trivial
// implementing declarations for partial properties on a non-tracked [DeltaPack] class,
// this file fails to build. The runtime assertions confirm the trivial body is a normal
// getter/setter with no dirty-tracking overhead.
public class PartialUntrackedTests
{
    [Fact]
    public void Partial_property_on_untracked_class_works_like_auto_property()
    {
        var p = new PartialUntrackedPosition();
        p.X = 1.5f;
        p.Y = -2.25f;
        Assert.Equal(1.5f, p.X);
        Assert.Equal(-2.25f, p.Y);

        var buf = PartialUntrackedPosition.Encode(p);
        var round = PartialUntrackedPosition.Decode(buf);
        Assert.Equal(p.X, round.X);
        Assert.Equal(p.Y, round.Y);
    }

    [Fact]
    public void Mixed_partial_and_auto_properties_coexist()
    {
        var m = new PartialUntrackedMixed();
        m.Name = "hello";
        m.Score = 42u;
        var buf = PartialUntrackedMixed.Encode(m);
        var round = PartialUntrackedMixed.Decode(buf);
        Assert.Equal("hello", round.Name);
        Assert.Equal(42u, round.Score);
    }

    [Fact]
    public void Untracked_partial_does_not_implement_IDirtyTracked()
    {
        var p = new PartialUntrackedPosition();
        Assert.False(p is DeltaPack.IDirtyTracked);
    }
}
