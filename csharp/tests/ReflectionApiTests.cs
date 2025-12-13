using Xunit;

namespace DeltaPack.Tests;

public class ReflectionApiTests
{
    // Simple test classes
    public class Player
    {
        public string Name { get; set; } = "";
        public int Score { get; set; }
        public bool Active { get; set; }
    }

    [Fact]
    public void SimpleObject_RoundTrips()
    {
        var codec = new DeltaPackCodec<Player>();
        var player = new Player { Name = "Alice", Score = 100, Active = true };

        var encoded = codec.Encode(player);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Alice", decoded.Name);
        Assert.Equal(100, decoded.Score);
        Assert.True(decoded.Active);
    }

    // Nested objects
    public class Position
    {
        public float X { get; set; }
        public float Y { get; set; }
    }

    public class Entity
    {
        public string Name { get; set; } = "";
        public Position Position { get; set; } = new();
    }

    [Fact]
    public void NestedObject_RoundTrips()
    {
        var codec = new DeltaPackCodec<Entity>();
        var entity = new Entity
        {
            Name = "Hero",
            Position = new Position { X = 10.5f, Y = 20.3f }
        };

        var encoded = codec.Encode(entity);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Hero", decoded.Name);
        Assert.Equal(10.5f, decoded.Position.X, 0.01f);
        Assert.Equal(20.3f, decoded.Position.Y, 0.01f);
    }

    // Arrays
    public class Inventory
    {
        public List<string> Items { get; set; } = new();
        public int Gold { get; set; }
    }

    [Fact]
    public void ArrayProperty_RoundTrips()
    {
        var codec = new DeltaPackCodec<Inventory>();
        var inventory = new Inventory
        {
            Items = new List<string> { "sword", "shield", "potion" },
            Gold = 500
        };

        var encoded = codec.Encode(inventory);
        var decoded = codec.Decode(encoded);

        Assert.Equal(new List<string> { "sword", "shield", "potion" }, decoded.Items);
        Assert.Equal(500, decoded.Gold);
    }

    // Nullable value types
    public class Character
    {
        public string Name { get; set; } = "";
        public int? Level { get; set; }
        public float? Health { get; set; }
    }

    [Fact]
    public void NullableValueTypes_WithValues_RoundTrips()
    {
        var codec = new DeltaPackCodec<Character>();
        var character = new Character { Name = "Mage", Level = 10, Health = 95.5f };

        var encoded = codec.Encode(character);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Mage", decoded.Name);
        Assert.Equal(10, decoded.Level);
        Assert.Equal(95.5f, decoded.Health!.Value, 0.01f);
    }

    [Fact]
    public void NullableValueTypes_WithNulls_RoundTrips()
    {
        var codec = new DeltaPackCodec<Character>();
        var character = new Character { Name = "Ghost", Level = null, Health = null };

        var encoded = codec.Encode(character);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Ghost", decoded.Name);
        Assert.Null(decoded.Level);
        Assert.Null(decoded.Health);
    }

    // Enums
    public enum DamageType { Fire, Ice, Lightning }

    public class Attack
    {
        public string Name { get; set; } = "";
        public DamageType Type { get; set; }
        public int Damage { get; set; }
    }

    [Fact]
    public void EnumProperty_RoundTrips()
    {
        var codec = new DeltaPackCodec<Attack>();
        var attack = new Attack { Name = "Fireball", Type = DamageType.Fire, Damage = 50 };

        var encoded = codec.Encode(attack);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Fireball", decoded.Name);
        Assert.Equal(DamageType.Fire, decoded.Type);
        Assert.Equal(50, decoded.Damage);
    }

    // Dictionaries
    public class Stats
    {
        public Dictionary<string, int> Values { get; set; } = new();
    }

    [Fact]
    public void DictionaryProperty_RoundTrips()
    {
        var codec = new DeltaPackCodec<Stats>();
        var stats = new Stats
        {
            Values = new Dictionary<string, int>
            {
                ["strength"] = 10,
                ["agility"] = 15,
                ["wisdom"] = 12
            }
        };

        var encoded = codec.Encode(stats);
        var decoded = codec.Decode(encoded);

        Assert.Equal(10, decoded.Values["strength"]);
        Assert.Equal(15, decoded.Values["agility"]);
        Assert.Equal(12, decoded.Values["wisdom"]);
    }

    // Diff encoding
    public class GameState
    {
        public int Score { get; set; }
        public int Health { get; set; }
        public Position Position { get; set; } = new();
    }

    [Fact]
    public void DiffEncoding_RoundTrips()
    {
        var codec = new DeltaPackCodec<GameState>();

        var stateA = new GameState
        {
            Score = 100,
            Health = 100,
            Position = new Position { X = 0, Y = 0 }
        };

        var stateB = new GameState
        {
            Score = 150,  // changed
            Health = 100, // unchanged
            Position = new Position { X = 5.5f, Y = 0 } // x changed
        };

        var diff = codec.EncodeDiff(stateA, stateB);
        var result = codec.DecodeDiff(stateA, diff);

        Assert.Equal(150, result.Score);
        Assert.Equal(100, result.Health);
        Assert.Equal(5.5f, result.Position.X, 0.01f);
        Assert.Equal(0f, result.Position.Y, 0.01f);

        // Diff should be smaller than full encode
        var fullEncode = codec.Encode(stateB);
        Assert.True(diff.Length <= fullEncode.Length);
    }

    // Clone
    [Fact]
    public void Clone_CreatesDeepCopy()
    {
        var codec = new DeltaPackCodec<GameState>();

        var original = new GameState
        {
            Score = 100,
            Health = 80,
            Position = new Position { X = 10, Y = 20 }
        };

        var clone = codec.Clone(original);

        // Values should be equal
        Assert.Equal(original.Score, clone.Score);
        Assert.Equal(original.Health, clone.Health);
        Assert.Equal(original.Position.X, clone.Position.X);
        Assert.Equal(original.Position.Y, clone.Position.Y);

        // But not the same reference
        Assert.NotSame(original, clone);
        Assert.NotSame(original.Position, clone.Position);
    }

    // Equals
    [Fact]
    public void Equals_ReturnsTrueForEqualObjects()
    {
        var codec = new DeltaPackCodec<Player>();

        var a = new Player { Name = "Bob", Score = 50, Active = true };
        var b = new Player { Name = "Bob", Score = 50, Active = true };

        Assert.True(codec.Equals(a, b));
    }

    [Fact]
    public void Equals_ReturnsFalseForDifferentObjects()
    {
        var codec = new DeltaPackCodec<Player>();

        var a = new Player { Name = "Bob", Score = 50, Active = true };
        var b = new Player { Name = "Bob", Score = 100, Active = true };

        Assert.False(codec.Equals(a, b));
    }

    // Float precision attribute
    public class PrecisePosition
    {
        [DeltaPackPrecision(0.01)]
        public float X { get; set; }

        [DeltaPackPrecision(0.01)]
        public float Y { get; set; }
    }

    [Fact]
    public void FloatPrecision_QuantizesValues()
    {
        var codec = new DeltaPackCodec<PrecisePosition>();
        var pos = new PrecisePosition { X = 10.555f, Y = 20.333f };

        var encoded = codec.Encode(pos);
        var decoded = codec.Decode(encoded);

        // Should be quantized to 0.01 precision
        Assert.Equal(10.56f, decoded.X, 0.001f);
        Assert.Equal(20.33f, decoded.Y, 0.001f);
    }

    // Complex nested structure
    public class Guild
    {
        public string Name { get; set; } = "";
        public List<Player> Members { get; set; } = new();
        public Dictionary<string, int> Resources { get; set; } = new();
    }

    [Fact]
    public void ComplexNestedStructure_RoundTrips()
    {
        var codec = new DeltaPackCodec<Guild>();
        var guild = new Guild
        {
            Name = "Heroes",
            Members = new List<Player>
            {
                new() { Name = "Alice", Score = 100, Active = true },
                new() { Name = "Bob", Score = 80, Active = false }
            },
            Resources = new Dictionary<string, int>
            {
                ["gold"] = 1000,
                ["gems"] = 50
            }
        };

        var encoded = codec.Encode(guild);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Heroes", decoded.Name);
        Assert.Equal(2, decoded.Members.Count);
        Assert.Equal("Alice", decoded.Members[0].Name);
        Assert.Equal(100, decoded.Members[0].Score);
        Assert.Equal("Bob", decoded.Members[1].Name);
        Assert.Equal(1000, decoded.Resources["gold"]);
        Assert.Equal(50, decoded.Resources["gems"]);
    }

    // Unsigned attribute
    public class NetworkPacket
    {
        [DeltaPackUnsigned]
        public int SequenceNumber { get; set; }

        public int Payload { get; set; }
    }

    [Fact]
    public void UnsignedAttribute_EncodesAsUnsigned()
    {
        var codec = new DeltaPackCodec<NetworkPacket>();
        var packet = new NetworkPacket { SequenceNumber = 12345, Payload = -42 };

        var encoded = codec.Encode(packet);
        var decoded = codec.Decode(encoded);

        Assert.Equal(12345, decoded.SequenceNumber);
        Assert.Equal(-42, decoded.Payload);
    }

    // Codec reuse - the main benefit for Unity
    [Fact]
    public void CodecReuse_WorksCorrectly()
    {
        // Create once during initialization
        var codec = new DeltaPackCodec<Player>();

        // Reuse many times in game loop
        for (var i = 0; i < 100; i++)
        {
            var player = new Player { Name = $"Player{i}", Score = i * 10, Active = i % 2 == 0 };
            var encoded = codec.Encode(player);
            var decoded = codec.Decode(encoded);

            Assert.Equal(player.Name, decoded.Name);
            Assert.Equal(player.Score, decoded.Score);
            Assert.Equal(player.Active, decoded.Active);
        }
    }

    // Custom factory for types without parameterless constructors
    public class ImmutablePlayer
    {
        public string Name { get; }
        public int Score { get; }

        public ImmutablePlayer(string name, int score)
        {
            Name = name;
            Score = score;
        }

        // Private setters for deserialization
        private string _name = "";
        private int _score;
    }

    // Union types with explicit variants
    [DeltaPackUnion(typeof(Sword), typeof(Bow))]
    public abstract class Weapon
    {
        public string Name { get; set; } = "";
    }

    public class Sword : Weapon
    {
        public int SlashDamage { get; set; }
    }

    public class Bow : Weapon
    {
        public int ArrowDamage { get; set; }
        public float Range { get; set; }
    }

    public class Warrior
    {
        public string Name { get; set; } = "";
        public Weapon Weapon { get; set; } = null!;
    }

    [Fact]
    public void UnionType_WithAttribute_RoundTrips()
    {
        var codec = new DeltaPackCodec<Warrior>();

        var warrior = new Warrior
        {
            Name = "Knight",
            Weapon = new Sword { Name = "Excalibur", SlashDamage = 100 }
        };

        var encoded = codec.Encode(warrior);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Knight", decoded.Name);
        Assert.IsType<Sword>(decoded.Weapon);
        var sword = (Sword)decoded.Weapon;
        Assert.Equal("Excalibur", sword.Name);
        Assert.Equal(100, sword.SlashDamage);
    }

    [Fact]
    public void UnionType_DifferentVariant_RoundTrips()
    {
        var codec = new DeltaPackCodec<Warrior>();

        var archer = new Warrior
        {
            Name = "Archer",
            Weapon = new Bow { Name = "Longbow", ArrowDamage = 50, Range = 100.5f }
        };

        var encoded = codec.Encode(archer);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Archer", decoded.Name);
        Assert.IsType<Bow>(decoded.Weapon);
        var bow = (Bow)decoded.Weapon;
        Assert.Equal("Longbow", bow.Name);
        Assert.Equal(50, bow.ArrowDamage);
        Assert.Equal(100.5f, bow.Range, 0.01f);
    }
}
