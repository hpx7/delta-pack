import {
  ObjectType,
  StringType,
  IntType,
  UIntType,
  FloatType,
  BooleanType,
  ArrayType,
  OptionalType,
  RecordType,
  EnumType,
  ReferenceType,
  codegenTypescript,
} from '@hathora/delta-pack';

// Enums for game constants
const Team = EnumType(['RED', 'BLUE', 'GREEN', 'YELLOW']);
const PlayerStatus = EnumType(['ALIVE', 'DEAD', 'SPECTATING', 'DISCONNECTED']);
const WeaponType = EnumType(['SWORD', 'BOW', 'STAFF', 'DAGGER', 'AXE']);
const ItemRarity = EnumType(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);
const AbilityType = EnumType(['HEAL', 'DAMAGE', 'SHIELD', 'BUFF', 'DEBUFF', 'TELEPORT']);
const EffectType = EnumType(['POISON', 'BURN', 'FREEZE', 'STUN', 'REGEN', 'HASTE']);

// Position in 2D space (0.1 precision = ~10cm accuracy)
const Position = ObjectType({
  x: FloatType({ precision: 0.1 }),
  y: FloatType({ precision: 0.1 }),
});

// Velocity for movement (0.1 precision)
const Velocity = ObjectType({
  vx: FloatType({ precision: 0.1 }),
  vy: FloatType({ precision: 0.1 }),
});

// Item in inventory
const InventoryItem = ObjectType({
  itemId: StringType(),
  name: StringType(),
  quantity: UIntType(),
  rarity: ReferenceType(ItemRarity),
  durability: OptionalType(UIntType()),
  enchantmentLevel: OptionalType(UIntType()),
});

// Equipment slot
const Equipment = ObjectType({
  weapon: OptionalType(ReferenceType(WeaponType)),
  armor: OptionalType(StringType()),
  accessory1: OptionalType(StringType()),
  accessory2: OptionalType(StringType()),
});

// Player stats
const PlayerStats = ObjectType({
  health: UIntType(),
  maxHealth: UIntType(),
  mana: UIntType(),
  maxMana: UIntType(),
  stamina: UIntType(),
  maxStamina: UIntType(),
  level: UIntType(),
  experience: UIntType(),
  strength: UIntType(),
  agility: UIntType(),
  intelligence: UIntType(),
  defense: UIntType(),
});

// Active effect on player
const ActiveEffect = ObjectType({
  effectType: ReferenceType(EffectType),
  duration: FloatType({ precision: 0.1 }),
  strength: UIntType(),
  stackCount: UIntType(),
});

// Ability cooldown tracking
const AbilityCooldown = ObjectType({
  abilityId: StringType(),
  abilityType: ReferenceType(AbilityType),
  remainingCooldown: FloatType({ precision: 0.1 }),
});

// Player state
const Player = ObjectType({
  playerId: StringType(),
  username: StringType(),
  team: OptionalType(ReferenceType(Team)),
  status: ReferenceType(PlayerStatus),
  position: ReferenceType(Position),
  velocity: ReferenceType(Velocity),
  rotation: FloatType({ precision: 0.01 }), // angle in radians, 0.01 rad ~= 0.57 degrees
  stats: ReferenceType(PlayerStats),
  inventory: ArrayType(ReferenceType(InventoryItem)),
  equipment: ReferenceType(Equipment),
  activeEffects: ArrayType(ReferenceType(ActiveEffect)),
  abilityCooldowns: ArrayType(ReferenceType(AbilityCooldown)),
  kills: UIntType(),
  deaths: UIntType(),
  assists: UIntType(),
  gold: UIntType(),
  score: IntType(),
  ping: UIntType(),
  isJumping: BooleanType(),
  isCrouching: BooleanType(),
  isAiming: BooleanType(),
  lastDamageTime: OptionalType(FloatType({ precision: 0.1 })),
  respawnTime: OptionalType(FloatType({ precision: 0.1 })),
});

// Enemy/NPC entity
const Enemy = ObjectType({
  enemyId: StringType(),
  name: StringType(),
  position: ReferenceType(Position),
  velocity: ReferenceType(Velocity),
  health: UIntType(),
  maxHealth: UIntType(),
  level: UIntType(),
  isAggro: BooleanType(),
  targetPlayerId: OptionalType(StringType()),
  lastAttackTime: FloatType({ precision: 0.1 }),
  lootTableId: OptionalType(StringType()),
});

// Projectile (bullets, arrows, spells)
const Projectile = ObjectType({
  projectileId: StringType(),
  ownerId: StringType(),
  position: ReferenceType(Position),
  velocity: ReferenceType(Velocity),
  damage: UIntType(),
  penetration: UIntType(),
  timeToLive: FloatType({ precision: 0.1 }),
  hitPlayers: ArrayType(StringType()),
});

// Dropped loot
const DroppedLoot = ObjectType({
  lootId: StringType(),
  position: ReferenceType(Position),
  item: ReferenceType(InventoryItem),
  despawnTime: FloatType({ precision: 0.1 }),
});

// World object (destructible, interactive)
const WorldObject = ObjectType({
  objectId: StringType(),
  objectType: StringType(),
  position: ReferenceType(Position),
  health: OptionalType(UIntType()),
  isDestroyed: BooleanType(),
  isInteractable: BooleanType(),
  interactedBy: OptionalType(StringType()),
});

// Match statistics
const MatchStats = ObjectType({
  totalKills: UIntType(),
  totalDeaths: UIntType(),
  totalDamageDealt: UIntType(),
  totalHealingDone: UIntType(),
  longestKillStreak: UIntType(),
  matchDuration: FloatType({ precision: 0.1 }),
});

// Team score
const TeamScore = ObjectType({
  team: ReferenceType(Team),
  score: UIntType(),
  kills: UIntType(),
  objectivesCaptured: UIntType(),
});

// Game settings
const GameSettings = ObjectType({
  maxPlayers: UIntType(),
  friendlyFire: BooleanType(),
  respawnDelay: FloatType({ precision: 0.1 }),
  roundTimeLimit: UIntType(),
  startingGold: UIntType(),
  gravityMultiplier: FloatType({ precision: 0.01 }),
});

// Main game state
const GameState = ObjectType({
  gameId: StringType(),
  serverTime: FloatType({ precision: 0.1 }),
  tickNumber: UIntType(),
  round: UIntType(),
  phase: StringType(), // "LOBBY", "STARTING", "ACTIVE", "ENDED"
  timeRemaining: FloatType({ precision: 0.1 }),
  players: RecordType(StringType(), ReferenceType(Player)),
  enemies: RecordType(StringType(), ReferenceType(Enemy)),
  projectiles: RecordType(StringType(), ReferenceType(Projectile)),
  droppedLoot: RecordType(StringType(), ReferenceType(DroppedLoot)),
  worldObjects: RecordType(StringType(), ReferenceType(WorldObject)),
  teamScores: ArrayType(ReferenceType(TeamScore)),
  matchStats: ReferenceType(MatchStats),
  settings: ReferenceType(GameSettings),
  winningTeam: OptionalType(ReferenceType(Team)),
  mapName: StringType(),
  weatherIntensity: FloatType({ precision: 0.01 }),
});

const typeDefinitions = {
  Team,
  PlayerStatus,
  WeaponType,
  ItemRarity,
  AbilityType,
  EffectType,
  Position,
  Velocity,
  InventoryItem,
  Equipment,
  PlayerStats,
  ActiveEffect,
  AbilityCooldown,
  Player,
  Enemy,
  Projectile,
  DroppedLoot,
  WorldObject,
  MatchStats,
  TeamScore,
  GameSettings,
  GameState,
};

const generatedCode = codegenTypescript(typeDefinitions);
console.log(generatedCode);
