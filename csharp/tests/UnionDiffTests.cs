using Generated.Examples;
using Xunit;

namespace DeltaPack.Tests;

public class UnionDiffTests
{
    [Fact]
    public void Diff_SameVariant_DifferentFields_RoundTrips()
    {
        var a = new User
        {
            Id = "u",
            PreferredContact = new EmailContact { Email = "old@x.com" },
            HairColor = HairColor.RED,
        };
        var b = new User
        {
            Id = "u",
            PreferredContact = new EmailContact { Email = "new@x.com" },
            HairColor = HairColor.RED,
        };

        var diff = User.EncodeDiff(a, b);
        var reconstructed = User.DecodeDiff(a, diff);

        Assert.True(User.Equals(b, reconstructed));
    }
}
