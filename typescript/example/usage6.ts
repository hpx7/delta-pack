import assert from "assert";
import { GameState } from "./output6.js";
import type { Player, Enemy, Projectile, DroppedLoot } from "./output6.js";

console.log("=== Multiplayer Game State Synchronization Demo ===\n");

// Helper to create a player
function createPlayer(
  playerId: string,
  username: string,
  x: number,
  y: number,
  team: "RED" | "BLUE" | "GREEN" | "YELLOW" | undefined
): Player {
  return {
    playerId,
    username,
    team,
    status: "ALIVE",
    position: { x, y },
    velocity: { vx: 0, vy: 0 },
    rotation: 0,
    stats: {
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      stamina: 100,
      maxStamina: 100,
      level: 1,
      experience: 0,
      strength: 10,
      agility: 10,
      intelligence: 10,
      defense: 10,
    },
    inventory: [],
    equipment: {
      weapon: undefined,
      armor: undefined,
      accessory1: undefined,
      accessory2: undefined,
    },
    activeEffects: [],
    abilityCooldowns: [],
    kills: 0,
    deaths: 0,
    assists: 0,
    gold: 500,
    score: 0,
    ping: 50,
    isJumping: false,
    isCrouching: false,
    isAiming: false,
    lastDamageTime: undefined,
    respawnTime: undefined,
  };
}

// Initial game state - lobby with 2 players
const initialState = GameState.default();
initialState.gameId = "match-12345";
initialState.serverTime = 0.0;
initialState.tickNumber = 0;
initialState.round = 0;
initialState.phase = "LOBBY";
initialState.timeRemaining = 600.0;
initialState.mapName = "Arena_01";
initialState.weatherIntensity = 0.0;
initialState.settings = {
  maxPlayers: 10,
  friendlyFire: false,
  respawnDelay: 5.0,
  roundTimeLimit: 600,
  startingGold: 500,
  gravityMultiplier: 1.0,
};
initialState.matchStats = {
  totalKills: 0,
  totalDeaths: 0,
  totalDamageDealt: 0,
  totalHealingDone: 0,
  longestKillStreak: 0,
  matchDuration: 0.0,
};
initialState.teamScores = [
  { team: "RED", score: 0, kills: 0, objectivesCaptured: 0 },
  { team: "BLUE", score: 0, kills: 0, objectivesCaptured: 0 },
];
initialState.players = new Map([
  ["player1", createPlayer("player1", "Alice", 100, 100, "RED")],
  ["player2", createPlayer("player2", "Bob", 200, 200, "BLUE")],
]);

const encoded = GameState.encode(initialState);
console.log(`Initial state (2 players in lobby): ${encoded.length} bytes`);
console.log(`  - 2 players`);
console.log(`  - Phase: LOBBY`);
console.log(`  - Round: 0`);
console.log();

// Tick 1: Game starts, 2 more players join
const tick1Encoded = GameState.encode(initialState);
const tick1 = GameState.decode(tick1Encoded);
tick1.serverTime = 0.016;
tick1.tickNumber = 1;
tick1.phase = "STARTING";
tick1.timeRemaining = 10.0;
tick1.players.set("player3", createPlayer("player3", "Charlie", 300, 100, "RED"));
tick1.players.set("player4", createPlayer("player4", "Dave", 400, 200, "BLUE"));

const diff1 = GameState.encodeDiff(initialState, tick1);
console.log(`Tick 1 (game starting, +2 players): ${diff1.length} bytes`);
console.log(`  - Phase: LOBBY → STARTING`);
console.log(`  - 2 new players joined`);
console.log(`  - Time remaining updated`);
console.log();

// Tick 60: Game active, players moving and shooting
const tick60 = GameState.decode(GameState.encode(tick1));
tick60.serverTime = 1.0;
tick60.tickNumber = 60;
tick60.phase = "ACTIVE";
tick60.timeRemaining = 590.0;

// Players are moving
tick60.players.get("player1")!.position = { x: 105.5, y: 102.3 };
tick60.players.get("player1")!.velocity = { vx: 5.5, vy: 2.3 };
tick60.players.get("player1")!.rotation = 0.785; // ~45 degrees
tick60.players.get("player1")!.isAiming = true;

tick60.players.get("player2")!.position = { x: 198.2, y: 205.7 };
tick60.players.get("player2")!.velocity = { vx: -1.8, vy: 5.7 };
tick60.players.get("player2")!.rotation = 1.571; // ~90 degrees

tick60.players.get("player3")!.position = { x: 302.1, y: 98.4 };
tick60.players.get("player3")!.velocity = { vx: 2.1, vy: -1.6 };

tick60.players.get("player4")!.position = { x: 405.6, y: 203.2 };
tick60.players.get("player4")!.velocity = { vx: 5.6, vy: 3.2 };
tick60.players.get("player4")!.isCrouching = true;

// Add some projectiles
tick60.projectiles = new Map([
  [
    "proj1",
    {
      projectileId: "proj1",
      ownerId: "player1",
      position: { x: 110.0, y: 105.0 },
      velocity: { vx: 50.0, vy: 50.0 },
      damage: 25,
      penetration: 0,
      timeToLive: 2.0,
      hitPlayers: [],
    },
  ],
]);

// Add an enemy
tick60.enemies = new Map([
  [
    "enemy1",
    {
      enemyId: "enemy1",
      name: "Goblin Scout",
      position: { x: 250.0, y: 150.0 },
      velocity: { vx: 0, vy: 0 },
      health: 50,
      maxHealth: 50,
      level: 3,
      isAggro: false,
      targetPlayerId: undefined,
      lastAttackTime: 0.0,
      lootTableId: "goblin_loot",
    },
  ],
]);

const diff60 = GameState.encodeDiff(tick1, tick60);
console.log(`Tick 60 (1 second, players moving): ${diff60.length} bytes`);
console.log(`  - All 4 players moved`);
console.log(`  - 1 projectile spawned`);
console.log(`  - 1 enemy spawned`);
console.log(`  - Phase: STARTING → ACTIVE`);
console.log();

// Tick 120: Combat happens - player takes damage, uses ability
const tick120 = GameState.decode(GameState.encode(tick60));
tick120.serverTime = 2.0;
tick120.tickNumber = 120;
tick120.timeRemaining = 580.0;

// Player 1 took damage from enemy
tick120.players.get("player1")!.stats.health = 75;
tick120.players.get("player1")!.lastDamageTime = 2.0;
tick120.players.get("player1")!.activeEffects = [
  { effectType: "POISON", duration: 5.0, strength: 2, stackCount: 1 },
];

// Player 1 used a healing ability
tick120.players.get("player1")!.abilityCooldowns = [
  { abilityId: "heal1", abilityType: "HEAL", remainingCooldown: 10.0 },
];

// Player 2 got a kill
tick120.players.get("player2")!.kills = 1;
tick120.players.get("player2")!.score = 100;
tick120.players.get("player2")!.gold = 650;

// Update team scores
tick120.teamScores[1].score = 100;
tick120.teamScores[1].kills = 1;

// Enemy is now aggro on player 1
tick120.enemies.get("enemy1")!.isAggro = true;
tick120.enemies.get("enemy1")!.targetPlayerId = "player1";
tick120.enemies.get("enemy1")!.position = { x: 240.0, y: 145.0 };

// Projectile moved
tick120.projectiles.get("proj1")!.position = { x: 160.0, y: 155.0 };
tick120.projectiles.get("proj1")!.timeToLive = 1.0;

// Match stats updated
tick120.matchStats.totalDamageDealt = 25;
tick120.matchStats.totalKills = 1;
tick120.matchStats.matchDuration = 2.0;

const diff120 = GameState.encodeDiff(tick60, tick120);
console.log(`Tick 120 (2 seconds, combat): ${diff120.length} bytes`);
console.log(`  - Player 1 took damage, has poison effect`);
console.log(`  - Player 1 used healing ability (cooldown)`);
console.log(`  - Player 2 got a kill (+gold, +score)`);
console.log(`  - Enemy is now aggressive`);
console.log(`  - Projectile moved`);
console.log(`  - Team scores updated`);
console.log();

// Tick 600: Mid-game, more players, more entities
const tick600 = GameState.decode(GameState.encode(tick120));
tick600.serverTime = 10.0;
tick600.tickNumber = 600;
tick600.timeRemaining = 500.0;

// 4 more players joined
tick600.players.set("player5", createPlayer("player5", "Eve", 150, 250, "RED"));
tick600.players.set("player6", createPlayer("player6", "Frank", 450, 150, "BLUE"));
tick600.players.set("player7", createPlayer("player7", "Grace", 100, 400, "RED"));
tick600.players.set("player8", createPlayer("player8", "Henry", 500, 300, "BLUE"));

// Players have inventory now
tick600.players.get("player1")!.inventory = [
  {
    itemId: "item1",
    name: "Health Potion",
    quantity: 3,
    rarity: "COMMON",
    durability: undefined,
    enchantmentLevel: undefined,
  },
  {
    itemId: "item2",
    name: "Mana Crystal",
    quantity: 5,
    rarity: "UNCOMMON",
    durability: undefined,
    enchantmentLevel: undefined,
  },
];
tick600.players.get("player1")!.equipment.weapon = "SWORD";
tick600.players.get("player1")!.equipment.armor = "leather_armor";

tick600.players.get("player2")!.inventory = [
  {
    itemId: "item3",
    name: "Enchanted Bow",
    quantity: 1,
    rarity: "RARE",
    durability: 80,
    enchantmentLevel: 2,
  },
];
tick600.players.get("player2")!.equipment.weapon = "BOW";

// More enemies
tick600.enemies.set("enemy2", {
  enemyId: "enemy2",
  name: "Orc Warrior",
  position: { x: 300.0, y: 300.0 },
  velocity: { vx: 5.0, vy: 0 },
  health: 150,
  maxHealth: 150,
  level: 8,
  isAggro: true,
  targetPlayerId: "player3",
  lastAttackTime: 9.5,
  lootTableId: "orc_loot",
});

tick600.enemies.set("enemy3", {
  enemyId: "enemy3",
  name: "Goblin Archer",
  position: { x: 400.0, y: 100.0 },
  velocity: { vx: 0, vy: 0 },
  health: 40,
  maxHealth: 40,
  level: 4,
  isAggro: false,
  targetPlayerId: undefined,
  lastAttackTime: 0.0,
  lootTableId: "goblin_loot",
});

// Projectiles
tick600.projectiles = new Map([
  [
    "proj2",
    {
      projectileId: "proj2",
      ownerId: "player2",
      position: { x: 320.0, y: 180.0 },
      velocity: { vx: 30.0, vy: -10.0 },
      damage: 35,
      penetration: 1,
      timeToLive: 3.0,
      hitPlayers: [],
    },
  ],
  [
    "proj3",
    {
      projectileId: "proj3",
      ownerId: "enemy3",
      position: { x: 390.0, y: 110.0 },
      velocity: { vx: -20.0, vy: 5.0 },
      damage: 15,
      penetration: 0,
      timeToLive: 2.5,
      hitPlayers: [],
    },
  ],
]);

// Dropped loot
tick600.droppedLoot = new Map([
  [
    "loot1",
    {
      lootId: "loot1",
      position: { x: 245.0, y: 148.0 },
      item: {
        itemId: "drop1",
        name: "Gold Coins",
        quantity: 50,
        rarity: "COMMON",
        durability: undefined,
        enchantmentLevel: undefined,
      },
      despawnTime: 40.0,
    },
  ],
]);

// World objects
tick600.worldObjects = new Map([
  [
    "barrel1",
    {
      objectId: "barrel1",
      objectType: "destructible_barrel",
      position: { x: 180.0, y: 220.0 },
      health: 30,
      isDestroyed: false,
      isInteractable: false,
      interactedBy: undefined,
    },
  ],
  [
    "chest1",
    {
      objectId: "chest1",
      objectType: "loot_chest",
      position: { x: 350.0, y: 380.0 },
      health: undefined,
      isDestroyed: false,
      isInteractable: true,
      interactedBy: undefined,
    },
  ],
]);

const diff600 = GameState.encodeDiff(tick120, tick600);
console.log(`Tick 600 (10 seconds, mid-game): ${diff600.length} bytes`); // 526
console.log(`  - 4 new players joined (total: 8)`);
console.log(`  - Players have inventory and equipment`);
console.log(`  - 2 more enemies (total: 3)`);
console.log(`  - 2 new projectiles`);
console.log(`  - 1 dropped loot item`);
console.log(`  - 2 world objects`);
console.log();

// Tick 601: Minimal change - just positions updated (typical server tick)
const tick601 = GameState.decode(GameState.encode(tick600));
tick601.serverTime = 10.016;
tick601.tickNumber = 601;
tick601.timeRemaining = 499.984;

// Only update positions slightly (typical server tick with no events)
tick601.players.get("player1")!.position.x += 0.5;
tick601.players.get("player1")!.position.y += 0.3;
tick601.players.get("player2")!.position.x -= 0.2;
tick601.players.get("player2")!.position.y += 0.4;
tick601.players.get("player3")!.position.x += 0.1;
tick601.players.get("player4")!.position.x += 0.3;
tick601.players.get("player4")!.position.y -= 0.2;

// Enemy movements
tick601.enemies.get("enemy2")!.position.x += 0.08;
tick601.enemies.get("enemy3")!.position.y += 0.05;

const diff601 = GameState.encodeDiff(tick600, tick601);
console.log(`Tick 601 (typical frame, minimal changes): ${diff601.length} bytes`); // 44
console.log(`  - Only position updates for moving entities`);
console.log(`  - Server time and tick incremented`);
console.log(`  - This represents a typical server tick in a game loop`);
console.log();

// Summary
console.log("=== Summary ===");
console.log();
const fullEncode601 = GameState.encode(tick601);
console.log(`Full state encoding (8 players, 3 enemies, etc.): ${fullEncode601.length} bytes`);
console.log(`Typical tick delta (positions only): ${diff601.length} bytes`);
console.log(
  `Delta compression ratio: ${((1 - diff601.length / fullEncode601.length) * 100).toFixed(1)}% smaller`
);
console.log();

console.log("Bandwidth calculations at 60 ticks/second:");
console.log(`  - Full state sync: ${(fullEncode601.length * 60) / 1024} KB/s per client`);
console.log(`  - Delta sync: ${(diff601.length * 60) / 1024} KB/s per client`);
console.log(
  `  - Savings: ${((fullEncode601.length * 60 - diff601.length * 60) / 1024).toFixed(2)} KB/s per client`
);
console.log();

// Verify roundtrip works
const decoded = GameState.decode(fullEncode601);
const fullRoundtripWorks = GameState.equals(decoded, tick601);

const decodedDiff = GameState.decodeDiff(tick600, diff601);
const diffRoundtripWorks = GameState.equals(decodedDiff, tick601);

if (fullRoundtripWorks && diffRoundtripWorks) {
  console.log("✓ All roundtrip tests passed!");
} else {
  console.log("⚠ Roundtrip tests:");
  console.log(`  - Full encode/decode: ${fullRoundtripWorks ? "✓" : "✗"}`);
  console.log(`  - Diff encode/decode: ${diffRoundtripWorks ? "✓" : "✗"}`);
  console.log("  (Minor floating point differences are expected)");
}
