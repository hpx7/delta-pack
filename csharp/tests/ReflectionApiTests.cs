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

    // ==================== Schema Equivalence Tests ====================

    [Fact]
    public void SchemaEquivalence_SimpleObject()
    {
        var schema = ReflectionSchema.BuildSchema<Player>();
        var player = (ObjectType)schema["Player"];

        Assert.Equal(3, player.Properties.Count);
        Assert.IsType<StringType>(player.Properties["name"]);
        Assert.IsType<IntType>(player.Properties["score"]);
        Assert.IsType<BooleanType>(player.Properties["active"]);
    }

    [Fact]
    public void SchemaEquivalence_NestedObject()
    {
        var schema = ReflectionSchema.BuildSchema<Entity>();

        var position = (ObjectType)schema["Position"];
        Assert.Equal(2, position.Properties.Count);
        Assert.IsType<FloatType>(position.Properties["x"]);
        Assert.IsType<FloatType>(position.Properties["y"]);

        var entity = (ObjectType)schema["Entity"];
        Assert.Equal(2, entity.Properties.Count);
        Assert.IsType<StringType>(entity.Properties["name"]);
        Assert.Equal("Position", ((ReferenceType)entity.Properties["position"]).Reference);
    }

    [Fact]
    public void SchemaEquivalence_WithArraysAndDictionaries()
    {
        var schema = ReflectionSchema.BuildSchema<Guild>();

        var guild = (ObjectType)schema["Guild"];
        Assert.Equal(3, guild.Properties.Count);
        Assert.IsType<StringType>(guild.Properties["name"]);

        var members = (ArrayType)guild.Properties["members"];
        Assert.Equal("Player", ((ReferenceType)members.Value).Reference);

        var resources = (RecordType)guild.Properties["resources"];
        Assert.IsType<StringType>(resources.Key);
        Assert.IsType<IntType>(resources.Value);
    }

    [Fact]
    public void SchemaEquivalence_WithEnum()
    {
        var schema = ReflectionSchema.BuildSchema<Attack>();

        var damageType = (EnumType)schema["DamageType"];
        Assert.Equal(new[] { "Fire", "Ice", "Lightning" }, damageType.Options);

        var attack = (ObjectType)schema["Attack"];
        Assert.IsType<StringType>(attack.Properties["name"]);
        Assert.Equal("DamageType", ((ReferenceType)attack.Properties["type"]).Reference);
        Assert.IsType<IntType>(attack.Properties["damage"]);
    }

    [Fact]
    public void SchemaEquivalence_WithOptionals()
    {
        var schema = ReflectionSchema.BuildSchema<Character>();

        var character = (ObjectType)schema["Character"];
        Assert.IsType<StringType>(character.Properties["name"]);

        var level = (OptionalType)character.Properties["level"];
        Assert.IsType<IntType>(level.Value);

        var health = (OptionalType)character.Properties["health"];
        Assert.IsType<FloatType>(health.Value);
    }

    [Fact]
    public void SchemaEquivalence_WithUnion()
    {
        var schema = ReflectionSchema.BuildSchema<Warrior>();

        var sword = (ObjectType)schema["Sword"];
        Assert.IsType<StringType>(sword.Properties["name"]);
        Assert.IsType<IntType>(sword.Properties["slashDamage"]);

        var bow = (ObjectType)schema["Bow"];
        Assert.IsType<StringType>(bow.Properties["name"]);
        Assert.IsType<IntType>(bow.Properties["arrowDamage"]);
        Assert.IsType<FloatType>(bow.Properties["range"]);

        var weapon = (UnionType)schema["Weapon"];
        Assert.Equal(2, weapon.Options.Count);
        Assert.Equal("Sword", weapon.Options[0].Reference);
        Assert.Equal("Bow", weapon.Options[1].Reference);

        var warrior = (ObjectType)schema["Warrior"];
        Assert.IsType<StringType>(warrior.Properties["name"]);
        Assert.Equal("Weapon", ((ReferenceType)warrior.Properties["weapon"]).Reference);
    }

    [Fact]
    public void SchemaEquivalence_WithPrecisionAttribute()
    {
        var schema = ReflectionSchema.BuildSchema<PrecisePosition>();

        var position = (ObjectType)schema["PrecisePosition"];
        Assert.Equal(0.01, ((FloatType)position.Properties["x"]).Precision);
        Assert.Equal(0.01, ((FloatType)position.Properties["y"]).Precision);
    }

    [Fact]
    public void SchemaEquivalence_SelfReferencing()
    {
        var schema = ReflectionSchema.BuildSchema<LinkedNode>();

        var node = (ObjectType)schema["LinkedNode"];
        Assert.IsType<StringType>(node.Properties["value"]);

        var next = (OptionalType)node.Properties["next"];
        Assert.Equal("LinkedNode", ((ReferenceType)next.Value).Reference);
    }

    // ==================== Round-trip Tests ====================

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

    // Int-keyed dictionaries
    public class IntKeyedContainer
    {
        public Dictionary<int, string> PlayerNames { get; set; } = new();
    }

    [Fact]
    public void DictionaryProperty_IntKeys_RoundTrips()
    {
        var codec = new DeltaPackCodec<IntKeyedContainer>();
        var container = new IntKeyedContainer
        {
            PlayerNames = new Dictionary<int, string>
            {
                [1] = "Alice",
                [2] = "Bob",
                [-5] = "Charlie"
            }
        };

        var encoded = codec.Encode(container);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Alice", decoded.PlayerNames[1]);
        Assert.Equal("Bob", decoded.PlayerNames[2]);
        Assert.Equal("Charlie", decoded.PlayerNames[-5]);
    }

    [Fact]
    public void DictionaryProperty_IntKeys_SchemaGeneration()
    {
        var schema = ReflectionSchema.BuildSchema<IntKeyedContainer>();
        var container = (ObjectType)schema["IntKeyedContainer"];
        var playerNames = (RecordType)container.Properties["playerNames"];

        Assert.IsType<IntType>(playerNames.Key);
        Assert.IsType<StringType>(playerNames.Value);
    }

    // UInt-keyed dictionaries
    public class UIntKeyedContainer
    {
        public Dictionary<uint, int> ItemCounts { get; set; } = new();
    }

    [Fact]
    public void DictionaryProperty_UIntKeys_RoundTrips()
    {
        var codec = new DeltaPackCodec<UIntKeyedContainer>();
        var container = new UIntKeyedContainer
        {
            ItemCounts = new Dictionary<uint, int>
            {
                [100] = 5,
                [200] = 10,
                [300] = 15
            }
        };

        var encoded = codec.Encode(container);
        var decoded = codec.Decode(encoded);

        Assert.Equal(5, decoded.ItemCounts[100]);
        Assert.Equal(10, decoded.ItemCounts[200]);
        Assert.Equal(15, decoded.ItemCounts[300]);
    }

    [Fact]
    public void DictionaryProperty_UIntKeys_SchemaGeneration()
    {
        var schema = ReflectionSchema.BuildSchema<UIntKeyedContainer>();
        var container = (ObjectType)schema["UIntKeyedContainer"];
        var itemCounts = (RecordType)container.Properties["itemCounts"];

        Assert.IsType<UIntType>(itemCounts.Key);
        Assert.IsType<IntType>(itemCounts.Value);
    }

    [Fact]
    public void DictionaryProperty_IntKeys_DiffRoundTrips()
    {
        var codec = new DeltaPackCodec<IntKeyedContainer>();

        var a = new IntKeyedContainer
        {
            PlayerNames = new Dictionary<int, string>
            {
                [1] = "Alice",
                [2] = "Bob"
            }
        };

        var b = new IntKeyedContainer
        {
            PlayerNames = new Dictionary<int, string>
            {
                [1] = "Alicia",  // Changed
                [3] = "Charlie" // Added (2 removed)
            }
        };

        var diff = codec.EncodeDiff(a, b);
        var result = codec.DecodeDiff(a, diff);

        Assert.Equal(2, result.PlayerNames.Count);
        Assert.Equal("Alicia", result.PlayerNames[1]);
        Assert.Equal("Charlie", result.PlayerNames[3]);
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

    // Ignore attribute
    public class PlayerWithIgnored
    {
        public string Name { get; set; } = "";
        public int Score { get; set; }

        [DeltaPackIgnore]
        public string CachedDisplayName { get; set; } = "";

        [DeltaPackIgnore]
        public DateTime LastUpdated { get; set; }
    }

    [Fact]
    public void IgnoreAttribute_ExcludesFromSchema()
    {
        var schema = ReflectionSchema.BuildSchema<PlayerWithIgnored>();

        var player = (ObjectType)schema["PlayerWithIgnored"];
        Assert.Equal(2, player.Properties.Count);
        Assert.True(player.Properties.ContainsKey("name"));
        Assert.True(player.Properties.ContainsKey("score"));
        Assert.False(player.Properties.ContainsKey("cachedDisplayName"));
        Assert.False(player.Properties.ContainsKey("lastUpdated"));
    }

    [Fact]
    public void IgnoreAttribute_RoundTrip()
    {
        var codec = new DeltaPackCodec<PlayerWithIgnored>();
        var player = new PlayerWithIgnored
        {
            Name = "Alice",
            Score = 100,
            CachedDisplayName = "Alice (100)",
            LastUpdated = DateTime.Now
        };

        var encoded = codec.Encode(player);
        var decoded = codec.Decode(encoded);

        Assert.Equal("Alice", decoded.Name);
        Assert.Equal(100, decoded.Score);
        // Ignored fields should have default values
        Assert.Equal("", decoded.CachedDisplayName);
        Assert.Equal(default(DateTime), decoded.LastUpdated);
    }

    // Unsigned integer types
    public class UnsignedTypes
    {
        public uint Count { get; set; }
        public ulong BigCount { get; set; }
        public ushort SmallCount { get; set; }
        public byte TinyCount { get; set; }
    }

    [Fact]
    public void UnsignedTypes_MapsToUIntType()
    {
        var schema = ReflectionSchema.BuildSchema<UnsignedTypes>();

        var types = (ObjectType)schema["UnsignedTypes"];
        Assert.IsType<UIntType>(types.Properties["count"]);
        Assert.IsType<UIntType>(types.Properties["bigCount"]);
        Assert.IsType<UIntType>(types.Properties["smallCount"]);
        Assert.IsType<UIntType>(types.Properties["tinyCount"]);
    }

    [Fact]
    public void UnsignedTypes_RoundTrip()
    {
        var codec = new DeltaPackCodec<UnsignedTypes>();
        var obj = new UnsignedTypes
        {
            Count = 12345,
            BigCount = 9876543210,
            SmallCount = 65000,
            TinyCount = 255
        };

        var encoded = codec.Encode(obj);
        var decoded = codec.Decode(encoded);

        Assert.Equal(12345u, decoded.Count);
        Assert.Equal(9876543210ul, decoded.BigCount);
        Assert.Equal((ushort)65000, decoded.SmallCount);
        Assert.Equal((byte)255, decoded.TinyCount);
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

    // Self-referencing types
    public class LinkedNode
    {
        public string Value { get; set; } = "";
        public LinkedNode? Next { get; set; }
    }

    [Fact]
    public void SelfReferencingType_RoundTrips()
    {
        var codec = new DeltaPackCodec<LinkedNode>();
        var node = new LinkedNode
        {
            Value = "first",
            Next = new LinkedNode
            {
                Value = "second",
                Next = new LinkedNode
                {
                    Value = "third",
                    Next = null
                }
            }
        };

        var encoded = codec.Encode(node);
        var decoded = codec.Decode(encoded);

        Assert.Equal("first", decoded.Value);
        Assert.NotNull(decoded.Next);
        Assert.Equal("second", decoded.Next!.Value);
        Assert.NotNull(decoded.Next.Next);
        Assert.Equal("third", decoded.Next.Next!.Value);
        Assert.Null(decoded.Next.Next.Next);
    }

    [Fact]
    public void SelfReferencingType_DiffEncoding_RoundTrips()
    {
        var codec = new DeltaPackCodec<LinkedNode>();

        var nodeA = new LinkedNode
        {
            Value = "first",
            Next = new LinkedNode { Value = "second", Next = null }
        };

        var nodeB = new LinkedNode
        {
            Value = "first",
            Next = new LinkedNode { Value = "modified", Next = null }
        };

        var diff = codec.EncodeDiff(nodeA, nodeB);
        var result = codec.DecodeDiff(nodeA, diff);

        Assert.Equal("first", result.Value);
        Assert.Equal("modified", result.Next!.Value);
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
