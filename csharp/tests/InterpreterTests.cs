using System.Text.Json;
using Xunit;
using Props = System.Collections.Generic.Dictionary<string, DeltaPack.SchemaType>;

namespace DeltaPack.Tests;

/// <summary>
/// Tests for the interpreter with programmatic schemas.
/// Round-trip tests with YAML schemas are covered by ConformanceTests.
/// </summary>
public class InterpreterTests
{
    [Fact]
    public void QuantizedFloat_EncodeDecodeRoundTrip()
    {
        var schema = new Props
        {
            ["Position"] = new ObjectType(new Props
            {
                ["x"] = new FloatType(Precision: 0.1),
                ["y"] = new FloatType(Precision: 0.1)
            })
        };
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Position");

        var pos = new Dictionary<string, object?>
        {
            ["x"] = 1.234f,
            ["y"] = 5.678f
        };

        var encoded = api.Encode(pos);
        var decoded = api.Decode(encoded);

        Assert.Equal(1.2f, (float)decoded["x"]!, 0.01f);
        Assert.Equal(5.7f, (float)decoded["y"]!, 0.01f);
    }

    [Fact]
    public void Equals_ReturnsCorrectly()
    {
        var schema = new Props
        {
            ["Player"] = new ObjectType(new Props
            {
                ["name"] = new StringType(),
                ["score"] = new IntType(Min: 0)
            })
        };
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var player1 = new Dictionary<string, object?> { ["name"] = "Alice", ["score"] = 100 };
        var player2 = new Dictionary<string, object?> { ["name"] = "Alice", ["score"] = 100 };
        var player3 = new Dictionary<string, object?> { ["name"] = "Bob", ["score"] = 100 };

        Assert.True(api.Equals(player1, player2));
        Assert.False(api.Equals(player1, player3));
    }

    [Fact]
    public void Clone_CreatesDeepCopy()
    {
        var schema = new Props
        {
            ["Position"] = new ObjectType(new Props
            {
                ["x"] = new FloatType(),
                ["y"] = new FloatType()
            }),
            ["Player"] = new ObjectType(new Props
            {
                ["name"] = new StringType(),
                ["position"] = new ReferenceType("Position")
            })
        };
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var player = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["position"] = new Dictionary<string, object?>
            {
                ["x"] = 1.0f,
                ["y"] = 2.0f
            }
        };

        var cloned = api.Clone(player);

        // Modify original
        player["name"] = "Bob";
        ((Dictionary<string, object?>)player["position"]!)["x"] = 99.0f;

        // Clone should be unchanged
        Assert.Equal("Alice", cloned["name"]);
        Assert.Equal(1.0f, ((Dictionary<string, object?>)cloned["position"]!)["x"]);
    }

    [Fact]
    public void Diff_NoChanges_ProducesMinimalOutput()
    {
        var schema = new Props
        {
            ["Player"] = new ObjectType(new Props
            {
                ["name"] = new StringType(),
                ["score"] = new IntType(Min: 0)
            })
        };
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var player = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["score"] = 100L
        };

        var diff = api.EncodeDiff(player, player);

        // No changes should produce very small diff (just a "changed=false" bit)
        Assert.True(diff.Length <= 2);
    }

    [Fact]
    public void FromJson_ParsesCorrectly()
    {
        var schema = new Props
        {
            ["Player"] = new ObjectType(new Props
            {
                ["name"] = new StringType(),
                ["score"] = new IntType(Min: 0),
                ["active"] = new BooleanType()
            })
        };
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var json = JsonDocument.Parse("""{"name": "Alice", "score": 100, "active": true}""").RootElement;
        var player = api.FromJson(json);

        Assert.Equal("Alice", player["name"]);
        Assert.Equal(100L, player["score"]);
        Assert.Equal(true, player["active"]);
    }

    [Fact]
    public void ToJson_SerializesCorrectly()
    {
        var schema = new Props
        {
            ["Player"] = new ObjectType(new Props
            {
                ["name"] = new StringType(),
                ["score"] = new IntType(Min: 0)
            })
        };
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var player = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["score"] = 100
        };

        var json = api.ToJson(player);

        Assert.Equal("Alice", json.GetProperty("name").GetString());
        Assert.Equal(100, json.GetProperty("score").GetInt32());
    }

    [Fact]
    public void Load_ThrowsOnUnknownType()
    {
        var schema = new Props
        {
            ["Player"] = new ObjectType(new Props
            {
                ["name"] = new StringType()
            })
        };

        Assert.Throws<ArgumentException>(() =>
            Interpreter.Load<Dictionary<string, object?>>(schema, "Unknown"));
    }

    [Fact]
    public void Load_ThrowsOnPrimitiveRootType()
    {
        var schema = new Props
        {
            ["UserId"] = new StringType()
        };

        Assert.Throws<ArgumentException>(() =>
            Interpreter.Load<string>(schema, "UserId"));
    }

    [Fact]
    public void Union_EncodeDecodeRoundTrip()
    {
        var schema = new Props
        {
            ["Email"] = new ObjectType(new Props
            {
                ["address"] = new StringType()
            }),
            ["Phone"] = new ObjectType(new Props
            {
                ["number"] = new StringType()
            }),
            ["Contact"] = new UnionType(new[] { new ReferenceType("Email"), new ReferenceType("Phone") })
        };
        var api = Interpreter.Load<UnionValue>(schema, "Contact");

        var emailContact = new UnionValue("Email", new Dictionary<string, object?>
        {
            ["address"] = "test@example.com"
        });

        var encodedEmail = api.Encode(emailContact);
        var decodedEmail = api.Decode(encodedEmail);
        Assert.Equal("Email", decodedEmail.Type);
        Assert.Equal("test@example.com", ((Dictionary<string, object?>)decodedEmail.Val!)["address"]);
    }

    [Fact]
    public void Record_IntKeys_EncodeDecodeRoundTrip()
    {
        var schema = new Props
        {
            ["PlayerScores"] = new ObjectType(new Props
            {
                ["scores"] = new RecordType(new IntType(), new StringType())
            })
        };
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "PlayerScores");

        var playerScores = new Dictionary<string, object?>
        {
            ["scores"] = new Dictionary<object, object?>
            {
                [1L] = "Alice",
                [2L] = "Bob",
                [-5L] = "Charlie"
            }
        };

        var encoded = api.Encode(playerScores);
        var decoded = api.Decode(encoded);

        var scores = (Dictionary<object, object?>)decoded["scores"]!;
        Assert.Equal("Alice", scores[1L]);
        Assert.Equal("Bob", scores[2L]);
        Assert.Equal("Charlie", scores[-5L]);
    }

    [Fact]
    public void Record_IntKeys_DiffRoundTrip()
    {
        var schema = new Props
        {
            ["PlayerScores"] = new ObjectType(new Props
            {
                ["scores"] = new RecordType(new IntType(), new StringType())
            })
        };
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "PlayerScores");

        var a = new Dictionary<string, object?>
        {
            ["scores"] = new Dictionary<object, object?>
            {
                [1L] = "Alice",
                [2L] = "Bob"
            }
        };

        var b = new Dictionary<string, object?>
        {
            ["scores"] = new Dictionary<object, object?>
            {
                [1L] = "Alicia",  // Changed
                [3L] = "Charlie" // Added (2 removed)
            }
        };

        var diff = api.EncodeDiff(a, b);
        var result = api.DecodeDiff(a, diff);

        var scores = (Dictionary<object, object?>)result["scores"]!;
        Assert.Equal(2, scores.Count);
        Assert.Equal("Alicia", scores[1L]);
        Assert.Equal("Charlie", scores[3L]);
    }
}
