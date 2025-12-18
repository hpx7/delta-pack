using System.Text.Json;
using Xunit;

namespace DeltaPack.Tests;

public class InterpreterTests
{
    [Fact]
    public void SimpleObject_EncodeDecodeRoundTrip()
    {
        var yaml = @"
Player:
  name: string
  score: uint
  active: boolean
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var player = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["score"] = 100,
            ["active"] = true
        };

        var encoded = api.Encode(player);
        var decoded = api.Decode(encoded);

        Assert.Equal("Alice", decoded["name"]);
        Assert.Equal(100L, decoded["score"]);
        Assert.Equal(true, decoded["active"]);
    }

    [Fact]
    public void NestedObject_EncodeDecodeRoundTrip()
    {
        var yaml = @"
Position:
  x: float
  y: float

Player:
  name: string
  position: Position
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var player = new Dictionary<string, object?>
        {
            ["name"] = "Bob",
            ["position"] = new Dictionary<string, object?>
            {
                ["x"] = 1.5f,
                ["y"] = 2.5f
            }
        };

        var encoded = api.Encode(player);
        var decoded = api.Decode(encoded);

        Assert.Equal("Bob", decoded["name"]);
        var pos = (Dictionary<string, object?>)decoded["position"]!;
        Assert.Equal(1.5f, pos["x"]);
        Assert.Equal(2.5f, pos["y"]);
    }

    [Fact]
    public void QuantizedFloat_EncodeDecodeRoundTrip()
    {
        var yaml = @"
Position:
  x: float(precision=0.1)
  y: float(precision=0.1)
";
        var schema = Parser.ParseSchemaYml(yaml);
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
    public void Array_EncodeDecodeRoundTrip()
    {
        var yaml = @"
Container:
  items: string[]
  numbers: int[]
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Container");

        var container = new Dictionary<string, object?>
        {
            ["items"] = new List<object?> { "a", "b", "c" },
            ["numbers"] = new List<object?> { 1L, 2L, 3L }
        };

        var encoded = api.Encode(container);
        var decoded = api.Decode(encoded);

        Assert.Equal(new List<object?> { "a", "b", "c" }, decoded["items"]);
        Assert.Equal(new List<object?> { 1L, 2L, 3L }, decoded["numbers"]);
    }

    [Fact]
    public void Optional_EncodeDecodeRoundTrip()
    {
        var yaml = @"
Entity:
  name: string
  description: string?
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Entity");

        var withDesc = new Dictionary<string, object?>
        {
            ["name"] = "Item1",
            ["description"] = "A description"
        };

        var withoutDesc = new Dictionary<string, object?>
        {
            ["name"] = "Item2",
            ["description"] = null
        };

        var encoded1 = api.Encode(withDesc);
        var decoded1 = api.Decode(encoded1);
        Assert.Equal("A description", decoded1["description"]);

        var encoded2 = api.Encode(withoutDesc);
        var decoded2 = api.Decode(encoded2);
        Assert.Null(decoded2["description"]);
    }

    [Fact]
    public void Enum_EncodeDecodeRoundTrip()
    {
        var yaml = @"
Color:
  - RED
  - GREEN
  - BLUE

Item:
  name: string
  color: Color
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Item");

        var item = new Dictionary<string, object?>
        {
            ["name"] = "Apple",
            ["color"] = "RED"
        };

        var encoded = api.Encode(item);
        var decoded = api.Decode(encoded);

        Assert.Equal("Apple", decoded["name"]);
        Assert.Equal("RED", decoded["color"]);
    }

    [Fact]
    public void Union_EncodeDecodeRoundTrip()
    {
        var yaml = @"
Email:
  address: string

Phone:
  number: string

Contact:
  - Email
  - Phone
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<UnionValue>(schema, "Contact");

        var emailContact = new UnionValue("Email", new Dictionary<string, object?>
        {
            ["address"] = "test@example.com"
        });

        var phoneContact = new UnionValue("Phone", new Dictionary<string, object?>
        {
            ["number"] = "555-1234"
        });

        var encodedEmail = api.Encode(emailContact);
        var decodedEmail = api.Decode(encodedEmail);
        Assert.Equal("Email", decodedEmail.Type);
        Assert.Equal("test@example.com", ((Dictionary<string, object?>)decodedEmail.Val!)["address"]);

        var encodedPhone = api.Encode(phoneContact);
        var decodedPhone = api.Decode(encodedPhone);
        Assert.Equal("Phone", decodedPhone.Type);
        Assert.Equal("555-1234", ((Dictionary<string, object?>)decodedPhone.Val!)["number"]);
    }

    [Fact]
    public void Record_EncodeDecodeRoundTrip()
    {
        var yaml = @"
Inventory:
  items: <string, uint>
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Inventory");

        var inventory = new Dictionary<string, object?>
        {
            ["items"] = new Dictionary<object, object?>
            {
                ["sword"] = 1,
                ["potion"] = 5
            }
        };

        var encoded = api.Encode(inventory);
        var decoded = api.Decode(encoded);

        var items = (Dictionary<object, object?>)decoded["items"]!;
        Assert.Equal(1L, items["sword"]);
        Assert.Equal(5L, items["potion"]);
    }

    [Fact]
    public void Record_IntKeys_EncodeDecodeRoundTrip()
    {
        var yaml = @"
PlayerScores:
  scores: <int, string>
";
        var schema = Parser.ParseSchemaYml(yaml);
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
    public void Record_UIntKeys_EncodeDecodeRoundTrip()
    {
        var yaml = @"
ItemCounts:
  counts: <uint, uint>
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "ItemCounts");

        var itemCounts = new Dictionary<string, object?>
        {
            ["counts"] = new Dictionary<object, object?>
            {
                [100L] = 5L,
                [200L] = 10L,
                [300L] = 15L
            }
        };

        var encoded = api.Encode(itemCounts);
        var decoded = api.Decode(encoded);

        var counts = (Dictionary<object, object?>)decoded["counts"]!;
        Assert.Equal(5L, counts[100L]);
        Assert.Equal(10L, counts[200L]);
        Assert.Equal(15L, counts[300L]);
    }

    [Fact]
    public void Record_IntKeys_DiffRoundTrip()
    {
        var yaml = @"
PlayerScores:
  scores: <int, string>
";
        var schema = Parser.ParseSchemaYml(yaml);
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

    [Fact]
    public void Equals_ReturnsCorrectly()
    {
        var yaml = @"
Player:
  name: string
  score: uint
";
        var schema = Parser.ParseSchemaYml(yaml);
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
        var yaml = @"
Position:
  x: float
  y: float

Player:
  name: string
  position: Position
";
        var schema = Parser.ParseSchemaYml(yaml);
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
    public void Diff_EncodesOnlyChanges()
    {
        var yaml = @"
Player:
  name: string
  score: uint
  health: uint
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var playerA = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["score"] = 100,
            ["health"] = 100
        };

        var playerB = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["score"] = 150,  // Changed
            ["health"] = 100
        };

        var diff = api.EncodeDiff(playerA, playerB);
        var result = api.DecodeDiff(playerA, diff);

        Assert.Equal("Alice", result["name"]);
        Assert.Equal(150L, result["score"]);
        Assert.Equal(100L, result["health"]);

        // Diff should be smaller than full encode
        var fullEncode = api.Encode(playerB);
        Assert.True(diff.Length <= fullEncode.Length);
    }

    [Fact]
    public void Diff_NoChanges_ProducesMinimalOutput()
    {
        var yaml = @"
Player:
  name: string
  score: uint
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var player = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["score"] = 100L
        };

        var diff = api.EncodeDiff(player, player);
        var result = api.DecodeDiff(player, diff);

        Assert.Equal("Alice", result["name"]);
        Assert.Equal(100L, result["score"]);

        // No changes should produce very small diff (just a "changed=false" bit)
        Assert.True(diff.Length <= 2);
    }

    [Fact]
    public void ArrayDiff_RoundTrips()
    {
        var yaml = @"
Container:
  items: string[]
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Container");

        var a = new Dictionary<string, object?>
        {
            ["items"] = new List<object?> { "a", "b", "c" }
        };

        var b = new Dictionary<string, object?>
        {
            ["items"] = new List<object?> { "a", "X", "c", "d" }
        };

        var diff = api.EncodeDiff(a, b);
        var result = api.DecodeDiff(a, diff);

        Assert.Equal(new List<object?> { "a", "X", "c", "d" }, result["items"]);
    }

    [Fact]
    public void UnionDiff_SameType_RoundTrips()
    {
        var yaml = @"
Email:
  address: string

Phone:
  number: string

Contact:
  - Email
  - Phone
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<UnionValue>(schema, "Contact");

        var a = new UnionValue("Email", new Dictionary<string, object?> { ["address"] = "old@example.com" });
        var b = new UnionValue("Email", new Dictionary<string, object?> { ["address"] = "new@example.com" });

        var diff = api.EncodeDiff(a, b);
        var result = api.DecodeDiff(a, diff);

        Assert.Equal("Email", result.Type);
        Assert.Equal("new@example.com", ((Dictionary<string, object?>)result.Val!)["address"]);
    }

    [Fact]
    public void UnionDiff_TypeChange_RoundTrips()
    {
        var yaml = @"
Email:
  address: string

Phone:
  number: string

Contact:
  - Email
  - Phone
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<UnionValue>(schema, "Contact");

        var a = new UnionValue("Email", new Dictionary<string, object?> { ["address"] = "test@example.com" });
        var b = new UnionValue("Phone", new Dictionary<string, object?> { ["number"] = "555-1234" });

        var diff = api.EncodeDiff(a, b);
        var result = api.DecodeDiff(a, diff);

        Assert.Equal("Phone", result.Type);
        Assert.Equal("555-1234", ((Dictionary<string, object?>)result.Val!)["number"]);
    }

    [Fact]
    public void OptionalDiff_NullToValue_RoundTrips()
    {
        var yaml = @"
Entity:
  name: string
  description: string?
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Entity");

        var a = new Dictionary<string, object?>
        {
            ["name"] = "Item",
            ["description"] = null
        };
        var b = new Dictionary<string, object?>
        {
            ["name"] = "Item",
            ["description"] = "A useful item"
        };

        var diff = api.EncodeDiff(a, b);
        var result = api.DecodeDiff(a, diff);

        Assert.Equal("Item", result["name"]);
        Assert.Equal("A useful item", result["description"]);
    }

    [Fact]
    public void OptionalDiff_ValueToNull_RoundTrips()
    {
        var yaml = @"
Entity:
  name: string
  description: string?
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Entity");

        var a = new Dictionary<string, object?>
        {
            ["name"] = "Item",
            ["description"] = "A useful item"
        };
        var b = new Dictionary<string, object?>
        {
            ["name"] = "Item",
            ["description"] = null
        };

        var diff = api.EncodeDiff(a, b);
        var result = api.DecodeDiff(a, diff);

        Assert.Equal("Item", result["name"]);
        Assert.Null(result["description"]);
    }

    [Fact]
    public void OptionalDiff_ValueToValue_RoundTrips()
    {
        var yaml = @"
Entity:
  name: string
  description: string?
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Entity");

        var a = new Dictionary<string, object?>
        {
            ["name"] = "Item",
            ["description"] = "Old description"
        };
        var b = new Dictionary<string, object?>
        {
            ["name"] = "Item",
            ["description"] = "New description"
        };

        var diff = api.EncodeDiff(a, b);
        var result = api.DecodeDiff(a, diff);

        Assert.Equal("Item", result["name"]);
        Assert.Equal("New description", result["description"]);
    }

    [Fact]
    public void OptionalDiff_ComplexType_NullToValue_RoundTrips()
    {
        var yaml = @"
Address:
  street: string
  city: string

Person:
  name: string
  address: Address?
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Person");

        var a = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["address"] = null
        };
        var b = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["address"] = new Dictionary<string, object?>
            {
                ["street"] = "123 Main St",
                ["city"] = "Springfield"
            }
        };

        var diff = api.EncodeDiff(a, b);
        var result = api.DecodeDiff(a, diff);

        Assert.Equal("Alice", result["name"]);
        var address = (Dictionary<string, object?>)result["address"]!;
        Assert.Equal("123 Main St", address["street"]);
        Assert.Equal("Springfield", address["city"]);
    }

    [Fact]
    public void OptionalDiff_ComplexType_ValueToValue_RoundTrips()
    {
        var yaml = @"
Address:
  street: string
  city: string

Person:
  name: string
  address: Address?
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Person");

        var a = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["address"] = new Dictionary<string, object?>
            {
                ["street"] = "123 Main St",
                ["city"] = "Springfield"
            }
        };
        var b = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["address"] = new Dictionary<string, object?>
            {
                ["street"] = "456 Oak Ave",
                ["city"] = "Springfield"
            }
        };

        var diff = api.EncodeDiff(a, b);
        var result = api.DecodeDiff(a, diff);

        Assert.Equal("Alice", result["name"]);
        var address = (Dictionary<string, object?>)result["address"]!;
        Assert.Equal("456 Oak Ave", address["street"]);
        Assert.Equal("Springfield", address["city"]);
    }

    [Fact]
    public void FromJson_ParsesCorrectly()
    {
        var yaml = @"
Player:
  name: string
  score: uint
  active: boolean
";
        var schema = Parser.ParseSchemaYml(yaml);
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
        var yaml = @"
Player:
  name: string
  score: uint
";
        var schema = Parser.ParseSchemaYml(yaml);
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
    public void Reference_EncodeDecodeRoundTrip()
    {
        var yaml = @"
UserId: string

User:
  id: UserId
  name: string
";
        var schema = Parser.ParseSchemaYml(yaml);
        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "User");

        var user = new Dictionary<string, object?>
        {
            ["id"] = "user-123",
            ["name"] = "Alice"
        };

        var encoded = api.Encode(user);
        var decoded = api.Decode(encoded);

        Assert.Equal("user-123", decoded["id"]);
        Assert.Equal("Alice", decoded["name"]);
    }

    [Fact]
    public void Load_ThrowsOnUnknownType()
    {
        var yaml = @"
Player:
  name: string
";
        var schema = Parser.ParseSchemaYml(yaml);

        Assert.Throws<ArgumentException>(() =>
            Interpreter.Load<Dictionary<string, object?>>(schema, "Unknown"));
    }

    [Fact]
    public void Load_ThrowsOnPrimitiveRootType()
    {
        var yaml = @"
UserId: string
";
        var schema = Parser.ParseSchemaYml(yaml);

        Assert.Throws<ArgumentException>(() =>
            Interpreter.Load<string>(schema, "UserId"));
    }

    // Tests demonstrating dependency-free usage (no YAML parsing, no JSON)
    // These patterns work in Unity without any external dependencies

    [Fact]
    public void CodeDefinedSchema_SimpleObject_RoundTrips()
    {
        // Define schema in code - no YamlDotNet needed
        var schema = new Dictionary<string, SchemaType>
        {
            ["Player"] = new ObjectType(new Dictionary<string, SchemaType>
            {
                ["name"] = new StringType(),
                ["score"] = new IntType(),
                ["active"] = new BooleanType()
            })
        };

        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        // Create state directly - no JSON parsing needed
        var player = new Dictionary<string, object?>
        {
            ["name"] = "Alice",
            ["score"] = 100L,
            ["active"] = true
        };

        var encoded = api.Encode(player);
        var decoded = api.Decode(encoded);

        Assert.Equal("Alice", decoded["name"]);
        Assert.Equal(100L, decoded["score"]);
        Assert.Equal(true, decoded["active"]);
    }

    [Fact]
    public void CodeDefinedSchema_NestedObjects_RoundTrips()
    {
        var schema = new Dictionary<string, SchemaType>
        {
            ["Position"] = new ObjectType(new Dictionary<string, SchemaType>
            {
                ["x"] = new FloatType(),
                ["y"] = new FloatType()
            }),
            ["Player"] = new ObjectType(new Dictionary<string, SchemaType>
            {
                ["name"] = new StringType(),
                ["position"] = new ReferenceType("Position")
            })
        };

        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Player");

        var player = new Dictionary<string, object?>
        {
            ["name"] = "Bob",
            ["position"] = new Dictionary<string, object?>
            {
                ["x"] = 10.5f,
                ["y"] = 20.3f
            }
        };

        var encoded = api.Encode(player);
        var decoded = api.Decode(encoded);

        Assert.Equal("Bob", decoded["name"]);
        var pos = (Dictionary<string, object?>)decoded["position"]!;
        Assert.Equal(10.5f, (float)pos["x"]!, 0.01f);
        Assert.Equal(20.3f, (float)pos["y"]!, 0.01f);
    }

    [Fact]
    public void CodeDefinedSchema_WithArraysAndOptionals_RoundTrips()
    {
        var schema = new Dictionary<string, SchemaType>
        {
            ["Inventory"] = new ObjectType(new Dictionary<string, SchemaType>
            {
                ["items"] = new ArrayType(new StringType()),
                ["gold"] = new IntType(),
                ["equippedWeapon"] = new OptionalType(new StringType())
            })
        };

        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Inventory");

        var inventory = new Dictionary<string, object?>
        {
            ["items"] = new List<object?> { "sword", "shield", "potion" },
            ["gold"] = 500L,
            ["equippedWeapon"] = "sword"
        };

        var encoded = api.Encode(inventory);
        var decoded = api.Decode(encoded);

        Assert.Equal(new List<object?> { "sword", "shield", "potion" }, decoded["items"]);
        Assert.Equal(500L, decoded["gold"]);
        Assert.Equal("sword", decoded["equippedWeapon"]);
    }

    [Fact]
    public void CodeDefinedSchema_WithEnumAndUnion_RoundTrips()
    {
        var schema = new Dictionary<string, SchemaType>
        {
            ["DamageType"] = new EnumType(new[] { "FIRE", "ICE", "LIGHTNING" }),
            ["MeleeAttack"] = new ObjectType(new Dictionary<string, SchemaType>
            {
                ["damage"] = new IntType(),
                ["range"] = new FloatType()
            }),
            ["RangedAttack"] = new ObjectType(new Dictionary<string, SchemaType>
            {
                ["damage"] = new IntType(),
                ["projectileSpeed"] = new FloatType()
            }),
            ["Attack"] = new UnionType(new[] { new ReferenceType("MeleeAttack"), new ReferenceType("RangedAttack") }),
            ["Weapon"] = new ObjectType(new Dictionary<string, SchemaType>
            {
                ["name"] = new StringType(),
                ["damageType"] = new ReferenceType("DamageType"),
                ["attack"] = new ReferenceType("Attack")
            })
        };

        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "Weapon");

        var weapon = new Dictionary<string, object?>
        {
            ["name"] = "Flaming Sword",
            ["damageType"] = "FIRE",
            ["attack"] = new UnionValue("MeleeAttack", new Dictionary<string, object?>
            {
                ["damage"] = 50L,
                ["range"] = 2.5f
            })
        };

        var encoded = api.Encode(weapon);
        var decoded = api.Decode(encoded);

        Assert.Equal("Flaming Sword", decoded["name"]);
        Assert.Equal("FIRE", decoded["damageType"]);
        var attack = (UnionValue)decoded["attack"]!;
        Assert.Equal("MeleeAttack", attack.Type);
        var attackData = (Dictionary<string, object?>)attack.Val!;
        Assert.Equal(50L, attackData["damage"]);
        Assert.Equal(2.5f, (float)attackData["range"]!, 0.01f);
    }

    [Fact]
    public void CodeDefinedSchema_DiffEncoding_RoundTrips()
    {
        var schema = new Dictionary<string, SchemaType>
        {
            ["GameState"] = new ObjectType(new Dictionary<string, SchemaType>
            {
                ["score"] = new IntType(),
                ["health"] = new IntType(),
                ["position"] = new ObjectType(new Dictionary<string, SchemaType>
                {
                    ["x"] = new FloatType(),
                    ["y"] = new FloatType()
                })
            })
        };

        var api = Interpreter.Load<Dictionary<string, object?>>(schema, "GameState");

        var stateA = new Dictionary<string, object?>
        {
            ["score"] = 100L,
            ["health"] = 100L,
            ["position"] = new Dictionary<string, object?> { ["x"] = 0f, ["y"] = 0f }
        };

        var stateB = new Dictionary<string, object?>
        {
            ["score"] = 150L,  // changed
            ["health"] = 100L, // unchanged
            ["position"] = new Dictionary<string, object?> { ["x"] = 5.5f, ["y"] = 0f } // x changed
        };

        var diff = api.EncodeDiff(stateA, stateB);
        var result = api.DecodeDiff(stateA, diff);

        Assert.Equal(150L, result["score"]);
        Assert.Equal(100L, result["health"]);
        var pos = (Dictionary<string, object?>)result["position"]!;
        Assert.Equal(5.5f, (float)pos["x"]!, 0.01f);
        Assert.Equal(0f, (float)pos["y"]!, 0.01f);

        // Diff should be smaller than full encode
        var fullEncode = api.Encode(stateB);
        Assert.True(diff.Length <= fullEncode.Length);
    }
}
