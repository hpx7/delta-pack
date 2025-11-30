import * as _ from "@hathora/delta-pack/helpers";


export type Team = "RED" | "BLUE" | "GREEN" | "YELLOW";
    

export type PlayerStatus = "ALIVE" | "DEAD" | "SPECTATING" | "DISCONNECTED";
    

export type WeaponType = "SWORD" | "BOW" | "STAFF" | "DAGGER" | "AXE";
    

export type ItemRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
    

export type AbilityType = "HEAL" | "DAMAGE" | "SHIELD" | "BUFF" | "DEBUFF" | "TELEPORT";
    

export type EffectType = "POISON" | "BURN" | "FREEZE" | "STUN" | "REGEN" | "HASTE";
    
export type Position = {
  x: number;
  y: number;
};
export type Velocity = {
  vx: number;
  vy: number;
};
export type InventoryItem = {
  itemId: string;
  name: string;
  quantity: number;
  rarity: ItemRarity;
  durability?: number;
  enchantmentLevel?: number;
};
export type Equipment = {
  weapon?: WeaponType;
  armor?: string;
  accessory1?: string;
  accessory2?: string;
};
export type PlayerStats = {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  level: number;
  experience: number;
  strength: number;
  agility: number;
  intelligence: number;
  defense: number;
};
export type ActiveEffect = {
  effectType: EffectType;
  duration: number;
  strength: number;
  stackCount: number;
};
export type AbilityCooldown = {
  abilityId: string;
  abilityType: AbilityType;
  remainingCooldown: number;
};
export type Player = {
  playerId: string;
  username: string;
  team?: Team;
  status: PlayerStatus;
  position: Position;
  velocity: Velocity;
  rotation: number;
  stats: PlayerStats;
  inventory: InventoryItem[];
  equipment: Equipment;
  activeEffects: ActiveEffect[];
  abilityCooldowns: AbilityCooldown[];
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  score: number;
  ping: number;
  isJumping: boolean;
  isCrouching: boolean;
  isAiming: boolean;
  lastDamageTime?: number;
  respawnTime?: number;
};
export type Enemy = {
  enemyId: string;
  name: string;
  position: Position;
  velocity: Velocity;
  health: number;
  maxHealth: number;
  level: number;
  isAggro: boolean;
  targetPlayerId?: string;
  lastAttackTime: number;
  lootTableId?: string;
};
export type Projectile = {
  projectileId: string;
  ownerId: string;
  position: Position;
  velocity: Velocity;
  damage: number;
  penetration: number;
  timeToLive: number;
  hitPlayers: string[];
};
export type DroppedLoot = {
  lootId: string;
  position: Position;
  item: InventoryItem;
  despawnTime: number;
};
export type WorldObject = {
  objectId: string;
  objectType: string;
  position: Position;
  health?: number;
  isDestroyed: boolean;
  isInteractable: boolean;
  interactedBy?: string;
};
export type MatchStats = {
  totalKills: number;
  totalDeaths: number;
  totalDamageDealt: number;
  totalHealingDone: number;
  longestKillStreak: number;
  matchDuration: number;
};
export type TeamScore = {
  team: Team;
  score: number;
  kills: number;
  objectivesCaptured: number;
};
export type GameSettings = {
  maxPlayers: number;
  friendlyFire: boolean;
  respawnDelay: number;
  roundTimeLimit: number;
  startingGold: number;
  gravityMultiplier: number;
};
export type GameState = {
  gameId: string;
  serverTime: number;
  tickNumber: number;
  round: number;
  phase: string;
  timeRemaining: number;
  players: Map<string, Player>;
  enemies: Map<string, Enemy>;
  projectiles: Map<string, Projectile>;
  droppedLoot: Map<string, DroppedLoot>;
  worldObjects: Map<string, WorldObject>;
  teamScores: TeamScore[];
  matchStats: MatchStats;
  settings: GameSettings;
  winningTeam?: Team;
  mapName: string;
  weatherIntensity: number;
};


const Team = {
  0: "RED",
  1: "BLUE",
  2: "GREEN",
  3: "YELLOW",
  RED: 0,
  BLUE: 1,
  GREEN: 2,
  YELLOW: 3,
};

const PlayerStatus = {
  0: "ALIVE",
  1: "DEAD",
  2: "SPECTATING",
  3: "DISCONNECTED",
  ALIVE: 0,
  DEAD: 1,
  SPECTATING: 2,
  DISCONNECTED: 3,
};

const WeaponType = {
  0: "SWORD",
  1: "BOW",
  2: "STAFF",
  3: "DAGGER",
  4: "AXE",
  SWORD: 0,
  BOW: 1,
  STAFF: 2,
  DAGGER: 3,
  AXE: 4,
};

const ItemRarity = {
  0: "COMMON",
  1: "UNCOMMON",
  2: "RARE",
  3: "EPIC",
  4: "LEGENDARY",
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
};

const AbilityType = {
  0: "HEAL",
  1: "DAMAGE",
  2: "SHIELD",
  3: "BUFF",
  4: "DEBUFF",
  5: "TELEPORT",
  HEAL: 0,
  DAMAGE: 1,
  SHIELD: 2,
  BUFF: 3,
  DEBUFF: 4,
  TELEPORT: 5,
};

const EffectType = {
  0: "POISON",
  1: "BURN",
  2: "FREEZE",
  3: "STUN",
  4: "REGEN",
  5: "HASTE",
  POISON: 0,
  BURN: 1,
  FREEZE: 2,
  STUN: 3,
  REGEN: 4,
  HASTE: 5,
};

export const Position = {
  default(): Position {
    return {
      x: 0.0,
      y: 0.0,
    };
  },
  parse(obj: Position): Position {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Position: ${obj}`);
    }
    return {
      x: _.tryParseField(() => _.parseFloat(obj.x), "Position.x"),
      y: _.tryParseField(() => _.parseFloat(obj.y), "Position.y"),
    };
  },
  equals(a: Position, b: Position): boolean {
    return (
      Math.round(a.x / 0.1) === Math.round(b.x / 0.1) &&
      Math.round(a.y / 0.1) === Math.round(b.y / 0.1)
    );
  },
  encode(obj: Position): Uint8Array {
    const tracker = new _.Tracker();
    Position._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Position, tracker: _.Tracker): void {
    tracker.pushInt(Math.round(obj.x / 0.1));
    tracker.pushInt(Math.round(obj.y / 0.1));
  },
  encodeDiff(a: Position, b: Position): Uint8Array {
    const tracker = new _.Tracker();
    Position._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Position, b: Position, tracker: _.Tracker): void {
    const changed = !Position.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushIntDiff(Math.round(a.x / 0.1), Math.round(b.x / 0.1));
    tracker.pushIntDiff(Math.round(a.y / 0.1), Math.round(b.y / 0.1));
  },
  decode(input: Uint8Array): Position {
    return Position._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Position {
    return {
      x: tracker.nextInt() * 0.1,
      y: tracker.nextInt() * 0.1,
    };
  },
  decodeDiff(obj: Position, input: Uint8Array): Position {
    const tracker = _.Tracker.parse(input);
    return Position._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Position, tracker: _.Tracker): Position {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      x: tracker.nextIntDiff(Math.round(obj.x / 0.1)) * 0.1,
      y: tracker.nextIntDiff(Math.round(obj.y / 0.1)) * 0.1,
    };
  },
};

export const Velocity = {
  default(): Velocity {
    return {
      vx: 0.0,
      vy: 0.0,
    };
  },
  parse(obj: Velocity): Velocity {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Velocity: ${obj}`);
    }
    return {
      vx: _.tryParseField(() => _.parseFloat(obj.vx), "Velocity.vx"),
      vy: _.tryParseField(() => _.parseFloat(obj.vy), "Velocity.vy"),
    };
  },
  equals(a: Velocity, b: Velocity): boolean {
    return (
      Math.round(a.vx / 0.1) === Math.round(b.vx / 0.1) &&
      Math.round(a.vy / 0.1) === Math.round(b.vy / 0.1)
    );
  },
  encode(obj: Velocity): Uint8Array {
    const tracker = new _.Tracker();
    Velocity._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Velocity, tracker: _.Tracker): void {
    tracker.pushInt(Math.round(obj.vx / 0.1));
    tracker.pushInt(Math.round(obj.vy / 0.1));
  },
  encodeDiff(a: Velocity, b: Velocity): Uint8Array {
    const tracker = new _.Tracker();
    Velocity._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Velocity, b: Velocity, tracker: _.Tracker): void {
    const changed = !Velocity.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushIntDiff(Math.round(a.vx / 0.1), Math.round(b.vx / 0.1));
    tracker.pushIntDiff(Math.round(a.vy / 0.1), Math.round(b.vy / 0.1));
  },
  decode(input: Uint8Array): Velocity {
    return Velocity._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Velocity {
    return {
      vx: tracker.nextInt() * 0.1,
      vy: tracker.nextInt() * 0.1,
    };
  },
  decodeDiff(obj: Velocity, input: Uint8Array): Velocity {
    const tracker = _.Tracker.parse(input);
    return Velocity._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Velocity, tracker: _.Tracker): Velocity {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      vx: tracker.nextIntDiff(Math.round(obj.vx / 0.1)) * 0.1,
      vy: tracker.nextIntDiff(Math.round(obj.vy / 0.1)) * 0.1,
    };
  },
};

export const InventoryItem = {
  default(): InventoryItem {
    return {
      itemId: "",
      name: "",
      quantity: 0,
      rarity: "COMMON",
      durability: undefined,
      enchantmentLevel: undefined,
    };
  },
  parse(obj: InventoryItem): InventoryItem {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid InventoryItem: ${obj}`);
    }
    return {
      itemId: _.tryParseField(() => _.parseString(obj.itemId), "InventoryItem.itemId"),
      name: _.tryParseField(() => _.parseString(obj.name), "InventoryItem.name"),
      quantity: _.tryParseField(() => _.parseUInt(obj.quantity), "InventoryItem.quantity"),
      rarity: _.tryParseField(() => _.parseEnum(obj.rarity, ItemRarity), "InventoryItem.rarity"),
      durability: _.tryParseField(() => _.parseOptional(obj.durability, (x) => _.parseUInt(x)), "InventoryItem.durability"),
      enchantmentLevel: _.tryParseField(() => _.parseOptional(obj.enchantmentLevel, (x) => _.parseUInt(x)), "InventoryItem.enchantmentLevel"),
    };
  },
  equals(a: InventoryItem, b: InventoryItem): boolean {
    return (
      a.itemId === b.itemId &&
      a.name === b.name &&
      a.quantity === b.quantity &&
      a.rarity === b.rarity &&
      _.equalsOptional(a.durability, b.durability, (x, y) => x === y) &&
      _.equalsOptional(a.enchantmentLevel, b.enchantmentLevel, (x, y) => x === y)
    );
  },
  encode(obj: InventoryItem): Uint8Array {
    const tracker = new _.Tracker();
    InventoryItem._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: InventoryItem, tracker: _.Tracker): void {
    tracker.pushString(obj.itemId);
    tracker.pushString(obj.name);
    tracker.pushUInt(obj.quantity);
    tracker.pushUInt(ItemRarity[obj.rarity]);
    tracker.pushOptional(obj.durability, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.enchantmentLevel, (x) => tracker.pushUInt(x));
  },
  encodeDiff(a: InventoryItem, b: InventoryItem): Uint8Array {
    const tracker = new _.Tracker();
    InventoryItem._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: InventoryItem, b: InventoryItem, tracker: _.Tracker): void {
    const changed = !InventoryItem.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.itemId, b.itemId);
    tracker.pushStringDiff(a.name, b.name);
    tracker.pushUIntDiff(a.quantity, b.quantity);
    tracker.pushUIntDiff(ItemRarity[a.rarity], ItemRarity[b.rarity]);
    tracker.pushOptionalDiffPrimitive<number>(
      a.durability,
      b.durability,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.enchantmentLevel,
      b.enchantmentLevel,
      (x) => tracker.pushUInt(x)
    );
  },
  decode(input: Uint8Array): InventoryItem {
    return InventoryItem._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): InventoryItem {
    return {
      itemId: tracker.nextString(),
      name: tracker.nextString(),
      quantity: tracker.nextUInt(),
      rarity: (ItemRarity as any)[tracker.nextUInt()],
      durability: tracker.nextOptional(() => tracker.nextUInt()),
      enchantmentLevel: tracker.nextOptional(() => tracker.nextUInt()),
    };
  },
  decodeDiff(obj: InventoryItem, input: Uint8Array): InventoryItem {
    const tracker = _.Tracker.parse(input);
    return InventoryItem._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: InventoryItem, tracker: _.Tracker): InventoryItem {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      itemId: tracker.nextStringDiff(obj.itemId),
      name: tracker.nextStringDiff(obj.name),
      quantity: tracker.nextUIntDiff(obj.quantity),
      rarity: (ItemRarity as any)[tracker.nextUIntDiff((ItemRarity as any)[obj.rarity])],
      durability: tracker.nextOptionalDiffPrimitive<number>(
        obj.durability,
        () => tracker.nextUInt()
      ),
      enchantmentLevel: tracker.nextOptionalDiffPrimitive<number>(
        obj.enchantmentLevel,
        () => tracker.nextUInt()
      ),
    };
  },
};

export const Equipment = {
  default(): Equipment {
    return {
      weapon: undefined,
      armor: undefined,
      accessory1: undefined,
      accessory2: undefined,
    };
  },
  parse(obj: Equipment): Equipment {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Equipment: ${obj}`);
    }
    return {
      weapon: _.tryParseField(() => _.parseOptional(obj.weapon, (x) => _.parseEnum(x, WeaponType)), "Equipment.weapon"),
      armor: _.tryParseField(() => _.parseOptional(obj.armor, (x) => _.parseString(x)), "Equipment.armor"),
      accessory1: _.tryParseField(() => _.parseOptional(obj.accessory1, (x) => _.parseString(x)), "Equipment.accessory1"),
      accessory2: _.tryParseField(() => _.parseOptional(obj.accessory2, (x) => _.parseString(x)), "Equipment.accessory2"),
    };
  },
  equals(a: Equipment, b: Equipment): boolean {
    return (
      _.equalsOptional(a.weapon, b.weapon, (x, y) => x === y) &&
      _.equalsOptional(a.armor, b.armor, (x, y) => x === y) &&
      _.equalsOptional(a.accessory1, b.accessory1, (x, y) => x === y) &&
      _.equalsOptional(a.accessory2, b.accessory2, (x, y) => x === y)
    );
  },
  encode(obj: Equipment): Uint8Array {
    const tracker = new _.Tracker();
    Equipment._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Equipment, tracker: _.Tracker): void {
    tracker.pushOptional(obj.weapon, (x) => tracker.pushUInt(WeaponType[x]));
    tracker.pushOptional(obj.armor, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.accessory1, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.accessory2, (x) => tracker.pushString(x));
  },
  encodeDiff(a: Equipment, b: Equipment): Uint8Array {
    const tracker = new _.Tracker();
    Equipment._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Equipment, b: Equipment, tracker: _.Tracker): void {
    const changed = !Equipment.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushOptionalDiffPrimitive<WeaponType>(
      a.weapon,
      b.weapon,
      (x) => tracker.pushUInt(WeaponType[x])
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.armor,
      b.armor,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.accessory1,
      b.accessory1,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.accessory2,
      b.accessory2,
      (x) => tracker.pushString(x)
    );
  },
  decode(input: Uint8Array): Equipment {
    return Equipment._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Equipment {
    return {
      weapon: tracker.nextOptional(() => (WeaponType as any)[tracker.nextUInt()]),
      armor: tracker.nextOptional(() => tracker.nextString()),
      accessory1: tracker.nextOptional(() => tracker.nextString()),
      accessory2: tracker.nextOptional(() => tracker.nextString()),
    };
  },
  decodeDiff(obj: Equipment, input: Uint8Array): Equipment {
    const tracker = _.Tracker.parse(input);
    return Equipment._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Equipment, tracker: _.Tracker): Equipment {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      weapon: tracker.nextOptionalDiffPrimitive<WeaponType>(
        obj.weapon,
        () => (WeaponType as any)[tracker.nextUInt()]
      ),
      armor: tracker.nextOptionalDiffPrimitive<string>(
        obj.armor,
        () => tracker.nextString()
      ),
      accessory1: tracker.nextOptionalDiffPrimitive<string>(
        obj.accessory1,
        () => tracker.nextString()
      ),
      accessory2: tracker.nextOptionalDiffPrimitive<string>(
        obj.accessory2,
        () => tracker.nextString()
      ),
    };
  },
};

export const PlayerStats = {
  default(): PlayerStats {
    return {
      health: 0,
      maxHealth: 0,
      mana: 0,
      maxMana: 0,
      stamina: 0,
      maxStamina: 0,
      level: 0,
      experience: 0,
      strength: 0,
      agility: 0,
      intelligence: 0,
      defense: 0,
    };
  },
  parse(obj: PlayerStats): PlayerStats {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid PlayerStats: ${obj}`);
    }
    return {
      health: _.tryParseField(() => _.parseUInt(obj.health), "PlayerStats.health"),
      maxHealth: _.tryParseField(() => _.parseUInt(obj.maxHealth), "PlayerStats.maxHealth"),
      mana: _.tryParseField(() => _.parseUInt(obj.mana), "PlayerStats.mana"),
      maxMana: _.tryParseField(() => _.parseUInt(obj.maxMana), "PlayerStats.maxMana"),
      stamina: _.tryParseField(() => _.parseUInt(obj.stamina), "PlayerStats.stamina"),
      maxStamina: _.tryParseField(() => _.parseUInt(obj.maxStamina), "PlayerStats.maxStamina"),
      level: _.tryParseField(() => _.parseUInt(obj.level), "PlayerStats.level"),
      experience: _.tryParseField(() => _.parseUInt(obj.experience), "PlayerStats.experience"),
      strength: _.tryParseField(() => _.parseUInt(obj.strength), "PlayerStats.strength"),
      agility: _.tryParseField(() => _.parseUInt(obj.agility), "PlayerStats.agility"),
      intelligence: _.tryParseField(() => _.parseUInt(obj.intelligence), "PlayerStats.intelligence"),
      defense: _.tryParseField(() => _.parseUInt(obj.defense), "PlayerStats.defense"),
    };
  },
  equals(a: PlayerStats, b: PlayerStats): boolean {
    return (
      a.health === b.health &&
      a.maxHealth === b.maxHealth &&
      a.mana === b.mana &&
      a.maxMana === b.maxMana &&
      a.stamina === b.stamina &&
      a.maxStamina === b.maxStamina &&
      a.level === b.level &&
      a.experience === b.experience &&
      a.strength === b.strength &&
      a.agility === b.agility &&
      a.intelligence === b.intelligence &&
      a.defense === b.defense
    );
  },
  encode(obj: PlayerStats): Uint8Array {
    const tracker = new _.Tracker();
    PlayerStats._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: PlayerStats, tracker: _.Tracker): void {
    tracker.pushUInt(obj.health);
    tracker.pushUInt(obj.maxHealth);
    tracker.pushUInt(obj.mana);
    tracker.pushUInt(obj.maxMana);
    tracker.pushUInt(obj.stamina);
    tracker.pushUInt(obj.maxStamina);
    tracker.pushUInt(obj.level);
    tracker.pushUInt(obj.experience);
    tracker.pushUInt(obj.strength);
    tracker.pushUInt(obj.agility);
    tracker.pushUInt(obj.intelligence);
    tracker.pushUInt(obj.defense);
  },
  encodeDiff(a: PlayerStats, b: PlayerStats): Uint8Array {
    const tracker = new _.Tracker();
    PlayerStats._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: PlayerStats, b: PlayerStats, tracker: _.Tracker): void {
    const changed = !PlayerStats.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(a.health, b.health);
    tracker.pushUIntDiff(a.maxHealth, b.maxHealth);
    tracker.pushUIntDiff(a.mana, b.mana);
    tracker.pushUIntDiff(a.maxMana, b.maxMana);
    tracker.pushUIntDiff(a.stamina, b.stamina);
    tracker.pushUIntDiff(a.maxStamina, b.maxStamina);
    tracker.pushUIntDiff(a.level, b.level);
    tracker.pushUIntDiff(a.experience, b.experience);
    tracker.pushUIntDiff(a.strength, b.strength);
    tracker.pushUIntDiff(a.agility, b.agility);
    tracker.pushUIntDiff(a.intelligence, b.intelligence);
    tracker.pushUIntDiff(a.defense, b.defense);
  },
  decode(input: Uint8Array): PlayerStats {
    return PlayerStats._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): PlayerStats {
    return {
      health: tracker.nextUInt(),
      maxHealth: tracker.nextUInt(),
      mana: tracker.nextUInt(),
      maxMana: tracker.nextUInt(),
      stamina: tracker.nextUInt(),
      maxStamina: tracker.nextUInt(),
      level: tracker.nextUInt(),
      experience: tracker.nextUInt(),
      strength: tracker.nextUInt(),
      agility: tracker.nextUInt(),
      intelligence: tracker.nextUInt(),
      defense: tracker.nextUInt(),
    };
  },
  decodeDiff(obj: PlayerStats, input: Uint8Array): PlayerStats {
    const tracker = _.Tracker.parse(input);
    return PlayerStats._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: PlayerStats, tracker: _.Tracker): PlayerStats {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      health: tracker.nextUIntDiff(obj.health),
      maxHealth: tracker.nextUIntDiff(obj.maxHealth),
      mana: tracker.nextUIntDiff(obj.mana),
      maxMana: tracker.nextUIntDiff(obj.maxMana),
      stamina: tracker.nextUIntDiff(obj.stamina),
      maxStamina: tracker.nextUIntDiff(obj.maxStamina),
      level: tracker.nextUIntDiff(obj.level),
      experience: tracker.nextUIntDiff(obj.experience),
      strength: tracker.nextUIntDiff(obj.strength),
      agility: tracker.nextUIntDiff(obj.agility),
      intelligence: tracker.nextUIntDiff(obj.intelligence),
      defense: tracker.nextUIntDiff(obj.defense),
    };
  },
};

export const ActiveEffect = {
  default(): ActiveEffect {
    return {
      effectType: "POISON",
      duration: 0.0,
      strength: 0,
      stackCount: 0,
    };
  },
  parse(obj: ActiveEffect): ActiveEffect {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid ActiveEffect: ${obj}`);
    }
    return {
      effectType: _.tryParseField(() => _.parseEnum(obj.effectType, EffectType), "ActiveEffect.effectType"),
      duration: _.tryParseField(() => _.parseFloat(obj.duration), "ActiveEffect.duration"),
      strength: _.tryParseField(() => _.parseUInt(obj.strength), "ActiveEffect.strength"),
      stackCount: _.tryParseField(() => _.parseUInt(obj.stackCount), "ActiveEffect.stackCount"),
    };
  },
  equals(a: ActiveEffect, b: ActiveEffect): boolean {
    return (
      a.effectType === b.effectType &&
      Math.round(a.duration / 0.1) === Math.round(b.duration / 0.1) &&
      a.strength === b.strength &&
      a.stackCount === b.stackCount
    );
  },
  encode(obj: ActiveEffect): Uint8Array {
    const tracker = new _.Tracker();
    ActiveEffect._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ActiveEffect, tracker: _.Tracker): void {
    tracker.pushUInt(EffectType[obj.effectType]);
    tracker.pushInt(Math.round(obj.duration / 0.1));
    tracker.pushUInt(obj.strength);
    tracker.pushUInt(obj.stackCount);
  },
  encodeDiff(a: ActiveEffect, b: ActiveEffect): Uint8Array {
    const tracker = new _.Tracker();
    ActiveEffect._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ActiveEffect, b: ActiveEffect, tracker: _.Tracker): void {
    const changed = !ActiveEffect.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(EffectType[a.effectType], EffectType[b.effectType]);
    tracker.pushIntDiff(Math.round(a.duration / 0.1), Math.round(b.duration / 0.1));
    tracker.pushUIntDiff(a.strength, b.strength);
    tracker.pushUIntDiff(a.stackCount, b.stackCount);
  },
  decode(input: Uint8Array): ActiveEffect {
    return ActiveEffect._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ActiveEffect {
    return {
      effectType: (EffectType as any)[tracker.nextUInt()],
      duration: tracker.nextInt() * 0.1,
      strength: tracker.nextUInt(),
      stackCount: tracker.nextUInt(),
    };
  },
  decodeDiff(obj: ActiveEffect, input: Uint8Array): ActiveEffect {
    const tracker = _.Tracker.parse(input);
    return ActiveEffect._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ActiveEffect, tracker: _.Tracker): ActiveEffect {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      effectType: (EffectType as any)[tracker.nextUIntDiff((EffectType as any)[obj.effectType])],
      duration: tracker.nextIntDiff(Math.round(obj.duration / 0.1)) * 0.1,
      strength: tracker.nextUIntDiff(obj.strength),
      stackCount: tracker.nextUIntDiff(obj.stackCount),
    };
  },
};

export const AbilityCooldown = {
  default(): AbilityCooldown {
    return {
      abilityId: "",
      abilityType: "HEAL",
      remainingCooldown: 0.0,
    };
  },
  parse(obj: AbilityCooldown): AbilityCooldown {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid AbilityCooldown: ${obj}`);
    }
    return {
      abilityId: _.tryParseField(() => _.parseString(obj.abilityId), "AbilityCooldown.abilityId"),
      abilityType: _.tryParseField(() => _.parseEnum(obj.abilityType, AbilityType), "AbilityCooldown.abilityType"),
      remainingCooldown: _.tryParseField(() => _.parseFloat(obj.remainingCooldown), "AbilityCooldown.remainingCooldown"),
    };
  },
  equals(a: AbilityCooldown, b: AbilityCooldown): boolean {
    return (
      a.abilityId === b.abilityId &&
      a.abilityType === b.abilityType &&
      Math.round(a.remainingCooldown / 0.1) === Math.round(b.remainingCooldown / 0.1)
    );
  },
  encode(obj: AbilityCooldown): Uint8Array {
    const tracker = new _.Tracker();
    AbilityCooldown._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: AbilityCooldown, tracker: _.Tracker): void {
    tracker.pushString(obj.abilityId);
    tracker.pushUInt(AbilityType[obj.abilityType]);
    tracker.pushInt(Math.round(obj.remainingCooldown / 0.1));
  },
  encodeDiff(a: AbilityCooldown, b: AbilityCooldown): Uint8Array {
    const tracker = new _.Tracker();
    AbilityCooldown._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: AbilityCooldown, b: AbilityCooldown, tracker: _.Tracker): void {
    const changed = !AbilityCooldown.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.abilityId, b.abilityId);
    tracker.pushUIntDiff(AbilityType[a.abilityType], AbilityType[b.abilityType]);
    tracker.pushIntDiff(Math.round(a.remainingCooldown / 0.1), Math.round(b.remainingCooldown / 0.1));
  },
  decode(input: Uint8Array): AbilityCooldown {
    return AbilityCooldown._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): AbilityCooldown {
    return {
      abilityId: tracker.nextString(),
      abilityType: (AbilityType as any)[tracker.nextUInt()],
      remainingCooldown: tracker.nextInt() * 0.1,
    };
  },
  decodeDiff(obj: AbilityCooldown, input: Uint8Array): AbilityCooldown {
    const tracker = _.Tracker.parse(input);
    return AbilityCooldown._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: AbilityCooldown, tracker: _.Tracker): AbilityCooldown {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      abilityId: tracker.nextStringDiff(obj.abilityId),
      abilityType: (AbilityType as any)[tracker.nextUIntDiff((AbilityType as any)[obj.abilityType])],
      remainingCooldown: tracker.nextIntDiff(Math.round(obj.remainingCooldown / 0.1)) * 0.1,
    };
  },
};

export const Player = {
  default(): Player {
    return {
      playerId: "",
      username: "",
      team: undefined,
      status: "ALIVE",
      position: Position.default(),
      velocity: Velocity.default(),
      rotation: 0.0,
      stats: PlayerStats.default(),
      inventory: [],
      equipment: Equipment.default(),
      activeEffects: [],
      abilityCooldowns: [],
      kills: 0,
      deaths: 0,
      assists: 0,
      gold: 0,
      score: 0,
      ping: 0,
      isJumping: false,
      isCrouching: false,
      isAiming: false,
      lastDamageTime: undefined,
      respawnTime: undefined,
    };
  },
  parse(obj: Player): Player {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Player: ${obj}`);
    }
    return {
      playerId: _.tryParseField(() => _.parseString(obj.playerId), "Player.playerId"),
      username: _.tryParseField(() => _.parseString(obj.username), "Player.username"),
      team: _.tryParseField(() => _.parseOptional(obj.team, (x) => _.parseEnum(x, Team)), "Player.team"),
      status: _.tryParseField(() => _.parseEnum(obj.status, PlayerStatus), "Player.status"),
      position: _.tryParseField(() => Position.parse(obj.position as Position), "Player.position"),
      velocity: _.tryParseField(() => Velocity.parse(obj.velocity as Velocity), "Player.velocity"),
      rotation: _.tryParseField(() => _.parseFloat(obj.rotation), "Player.rotation"),
      stats: _.tryParseField(() => PlayerStats.parse(obj.stats as PlayerStats), "Player.stats"),
      inventory: _.tryParseField(() => _.parseArray(obj.inventory, (x) => InventoryItem.parse(x as InventoryItem)), "Player.inventory"),
      equipment: _.tryParseField(() => Equipment.parse(obj.equipment as Equipment), "Player.equipment"),
      activeEffects: _.tryParseField(() => _.parseArray(obj.activeEffects, (x) => ActiveEffect.parse(x as ActiveEffect)), "Player.activeEffects"),
      abilityCooldowns: _.tryParseField(() => _.parseArray(obj.abilityCooldowns, (x) => AbilityCooldown.parse(x as AbilityCooldown)), "Player.abilityCooldowns"),
      kills: _.tryParseField(() => _.parseUInt(obj.kills), "Player.kills"),
      deaths: _.tryParseField(() => _.parseUInt(obj.deaths), "Player.deaths"),
      assists: _.tryParseField(() => _.parseUInt(obj.assists), "Player.assists"),
      gold: _.tryParseField(() => _.parseUInt(obj.gold), "Player.gold"),
      score: _.tryParseField(() => _.parseInt(obj.score), "Player.score"),
      ping: _.tryParseField(() => _.parseUInt(obj.ping), "Player.ping"),
      isJumping: _.tryParseField(() => _.parseBoolean(obj.isJumping), "Player.isJumping"),
      isCrouching: _.tryParseField(() => _.parseBoolean(obj.isCrouching), "Player.isCrouching"),
      isAiming: _.tryParseField(() => _.parseBoolean(obj.isAiming), "Player.isAiming"),
      lastDamageTime: _.tryParseField(() => _.parseOptional(obj.lastDamageTime, (x) => _.parseFloat(x)), "Player.lastDamageTime"),
      respawnTime: _.tryParseField(() => _.parseOptional(obj.respawnTime, (x) => _.parseFloat(x)), "Player.respawnTime"),
    };
  },
  equals(a: Player, b: Player): boolean {
    return (
      a.playerId === b.playerId &&
      a.username === b.username &&
      _.equalsOptional(a.team, b.team, (x, y) => x === y) &&
      a.status === b.status &&
      Position.equals(a.position, b.position) &&
      Velocity.equals(a.velocity, b.velocity) &&
      Math.round(a.rotation / 0.01) === Math.round(b.rotation / 0.01) &&
      PlayerStats.equals(a.stats, b.stats) &&
      _.equalsArray(a.inventory, b.inventory, (x, y) => InventoryItem.equals(x, y)) &&
      Equipment.equals(a.equipment, b.equipment) &&
      _.equalsArray(a.activeEffects, b.activeEffects, (x, y) => ActiveEffect.equals(x, y)) &&
      _.equalsArray(a.abilityCooldowns, b.abilityCooldowns, (x, y) => AbilityCooldown.equals(x, y)) &&
      a.kills === b.kills &&
      a.deaths === b.deaths &&
      a.assists === b.assists &&
      a.gold === b.gold &&
      a.score === b.score &&
      a.ping === b.ping &&
      a.isJumping === b.isJumping &&
      a.isCrouching === b.isCrouching &&
      a.isAiming === b.isAiming &&
      _.equalsOptional(a.lastDamageTime, b.lastDamageTime, (x, y) => Math.round(x / 0.1) === Math.round(y / 0.1)) &&
      _.equalsOptional(a.respawnTime, b.respawnTime, (x, y) => Math.round(x / 0.1) === Math.round(y / 0.1))
    );
  },
  encode(obj: Player): Uint8Array {
    const tracker = new _.Tracker();
    Player._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Player, tracker: _.Tracker): void {
    tracker.pushString(obj.playerId);
    tracker.pushString(obj.username);
    tracker.pushOptional(obj.team, (x) => tracker.pushUInt(Team[x]));
    tracker.pushUInt(PlayerStatus[obj.status]);
    Position._encode(obj.position, tracker);
    Velocity._encode(obj.velocity, tracker);
    tracker.pushInt(Math.round(obj.rotation / 0.01));
    PlayerStats._encode(obj.stats, tracker);
    tracker.pushArray(obj.inventory, (x) => InventoryItem._encode(x, tracker));
    Equipment._encode(obj.equipment, tracker);
    tracker.pushArray(obj.activeEffects, (x) => ActiveEffect._encode(x, tracker));
    tracker.pushArray(obj.abilityCooldowns, (x) => AbilityCooldown._encode(x, tracker));
    tracker.pushUInt(obj.kills);
    tracker.pushUInt(obj.deaths);
    tracker.pushUInt(obj.assists);
    tracker.pushUInt(obj.gold);
    tracker.pushInt(obj.score);
    tracker.pushUInt(obj.ping);
    tracker.pushBoolean(obj.isJumping);
    tracker.pushBoolean(obj.isCrouching);
    tracker.pushBoolean(obj.isAiming);
    tracker.pushOptional(obj.lastDamageTime, (x) => tracker.pushInt(Math.round(x / 0.1)));
    tracker.pushOptional(obj.respawnTime, (x) => tracker.pushInt(Math.round(x / 0.1)));
  },
  encodeDiff(a: Player, b: Player): Uint8Array {
    const tracker = new _.Tracker();
    Player._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Player, b: Player, tracker: _.Tracker): void {
    const changed = !Player.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.playerId, b.playerId);
    tracker.pushStringDiff(a.username, b.username);
    tracker.pushOptionalDiffPrimitive<Team>(
      a.team,
      b.team,
      (x) => tracker.pushUInt(Team[x])
    );
    tracker.pushUIntDiff(PlayerStatus[a.status], PlayerStatus[b.status]);
    Position._encodeDiff(a.position, b.position, tracker);
    Velocity._encodeDiff(a.velocity, b.velocity, tracker);
    tracker.pushIntDiff(Math.round(a.rotation / 0.01), Math.round(b.rotation / 0.01));
    PlayerStats._encodeDiff(a.stats, b.stats, tracker);
    tracker.pushArrayDiff<InventoryItem>(
      a.inventory,
      b.inventory,
      (x, y) => InventoryItem.equals(x, y),
      (x) => InventoryItem._encode(x, tracker),
      (x, y) => InventoryItem._encodeDiff(x, y, tracker)
    );
    Equipment._encodeDiff(a.equipment, b.equipment, tracker);
    tracker.pushArrayDiff<ActiveEffect>(
      a.activeEffects,
      b.activeEffects,
      (x, y) => ActiveEffect.equals(x, y),
      (x) => ActiveEffect._encode(x, tracker),
      (x, y) => ActiveEffect._encodeDiff(x, y, tracker)
    );
    tracker.pushArrayDiff<AbilityCooldown>(
      a.abilityCooldowns,
      b.abilityCooldowns,
      (x, y) => AbilityCooldown.equals(x, y),
      (x) => AbilityCooldown._encode(x, tracker),
      (x, y) => AbilityCooldown._encodeDiff(x, y, tracker)
    );
    tracker.pushUIntDiff(a.kills, b.kills);
    tracker.pushUIntDiff(a.deaths, b.deaths);
    tracker.pushUIntDiff(a.assists, b.assists);
    tracker.pushUIntDiff(a.gold, b.gold);
    tracker.pushIntDiff(a.score, b.score);
    tracker.pushUIntDiff(a.ping, b.ping);
    tracker.pushBooleanDiff(a.isJumping, b.isJumping);
    tracker.pushBooleanDiff(a.isCrouching, b.isCrouching);
    tracker.pushBooleanDiff(a.isAiming, b.isAiming);
    tracker.pushOptionalDiffPrimitive<number>(
      a.lastDamageTime,
      b.lastDamageTime,
      (x) => tracker.pushInt(Math.round(x / 0.1))
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.respawnTime,
      b.respawnTime,
      (x) => tracker.pushInt(Math.round(x / 0.1))
    );
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Player {
    return {
      playerId: tracker.nextString(),
      username: tracker.nextString(),
      team: tracker.nextOptional(() => (Team as any)[tracker.nextUInt()]),
      status: (PlayerStatus as any)[tracker.nextUInt()],
      position: Position._decode(tracker),
      velocity: Velocity._decode(tracker),
      rotation: tracker.nextInt() * 0.01,
      stats: PlayerStats._decode(tracker),
      inventory: tracker.nextArray(() => InventoryItem._decode(tracker)),
      equipment: Equipment._decode(tracker),
      activeEffects: tracker.nextArray(() => ActiveEffect._decode(tracker)),
      abilityCooldowns: tracker.nextArray(() => AbilityCooldown._decode(tracker)),
      kills: tracker.nextUInt(),
      deaths: tracker.nextUInt(),
      assists: tracker.nextUInt(),
      gold: tracker.nextUInt(),
      score: tracker.nextInt(),
      ping: tracker.nextUInt(),
      isJumping: tracker.nextBoolean(),
      isCrouching: tracker.nextBoolean(),
      isAiming: tracker.nextBoolean(),
      lastDamageTime: tracker.nextOptional(() => tracker.nextInt() * 0.1),
      respawnTime: tracker.nextOptional(() => tracker.nextInt() * 0.1),
    };
  },
  decodeDiff(obj: Player, input: Uint8Array): Player {
    const tracker = _.Tracker.parse(input);
    return Player._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Player, tracker: _.Tracker): Player {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      playerId: tracker.nextStringDiff(obj.playerId),
      username: tracker.nextStringDiff(obj.username),
      team: tracker.nextOptionalDiffPrimitive<Team>(
        obj.team,
        () => (Team as any)[tracker.nextUInt()]
      ),
      status: (PlayerStatus as any)[tracker.nextUIntDiff((PlayerStatus as any)[obj.status])],
      position: Position._decodeDiff(obj.position, tracker),
      velocity: Velocity._decodeDiff(obj.velocity, tracker),
      rotation: tracker.nextIntDiff(Math.round(obj.rotation / 0.01)) * 0.01,
      stats: PlayerStats._decodeDiff(obj.stats, tracker),
      inventory: tracker.nextArrayDiff<InventoryItem>(
        obj.inventory,
        () => InventoryItem._decode(tracker),
        (x) => InventoryItem._decodeDiff(x, tracker)
      ),
      equipment: Equipment._decodeDiff(obj.equipment, tracker),
      activeEffects: tracker.nextArrayDiff<ActiveEffect>(
        obj.activeEffects,
        () => ActiveEffect._decode(tracker),
        (x) => ActiveEffect._decodeDiff(x, tracker)
      ),
      abilityCooldowns: tracker.nextArrayDiff<AbilityCooldown>(
        obj.abilityCooldowns,
        () => AbilityCooldown._decode(tracker),
        (x) => AbilityCooldown._decodeDiff(x, tracker)
      ),
      kills: tracker.nextUIntDiff(obj.kills),
      deaths: tracker.nextUIntDiff(obj.deaths),
      assists: tracker.nextUIntDiff(obj.assists),
      gold: tracker.nextUIntDiff(obj.gold),
      score: tracker.nextIntDiff(obj.score),
      ping: tracker.nextUIntDiff(obj.ping),
      isJumping: tracker.nextBooleanDiff(obj.isJumping),
      isCrouching: tracker.nextBooleanDiff(obj.isCrouching),
      isAiming: tracker.nextBooleanDiff(obj.isAiming),
      lastDamageTime: tracker.nextOptionalDiffPrimitive<number>(
        obj.lastDamageTime,
        () => tracker.nextInt() * 0.1
      ),
      respawnTime: tracker.nextOptionalDiffPrimitive<number>(
        obj.respawnTime,
        () => tracker.nextInt() * 0.1
      ),
    };
  },
};

export const Enemy = {
  default(): Enemy {
    return {
      enemyId: "",
      name: "",
      position: Position.default(),
      velocity: Velocity.default(),
      health: 0,
      maxHealth: 0,
      level: 0,
      isAggro: false,
      targetPlayerId: undefined,
      lastAttackTime: 0.0,
      lootTableId: undefined,
    };
  },
  parse(obj: Enemy): Enemy {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Enemy: ${obj}`);
    }
    return {
      enemyId: _.tryParseField(() => _.parseString(obj.enemyId), "Enemy.enemyId"),
      name: _.tryParseField(() => _.parseString(obj.name), "Enemy.name"),
      position: _.tryParseField(() => Position.parse(obj.position as Position), "Enemy.position"),
      velocity: _.tryParseField(() => Velocity.parse(obj.velocity as Velocity), "Enemy.velocity"),
      health: _.tryParseField(() => _.parseUInt(obj.health), "Enemy.health"),
      maxHealth: _.tryParseField(() => _.parseUInt(obj.maxHealth), "Enemy.maxHealth"),
      level: _.tryParseField(() => _.parseUInt(obj.level), "Enemy.level"),
      isAggro: _.tryParseField(() => _.parseBoolean(obj.isAggro), "Enemy.isAggro"),
      targetPlayerId: _.tryParseField(() => _.parseOptional(obj.targetPlayerId, (x) => _.parseString(x)), "Enemy.targetPlayerId"),
      lastAttackTime: _.tryParseField(() => _.parseFloat(obj.lastAttackTime), "Enemy.lastAttackTime"),
      lootTableId: _.tryParseField(() => _.parseOptional(obj.lootTableId, (x) => _.parseString(x)), "Enemy.lootTableId"),
    };
  },
  equals(a: Enemy, b: Enemy): boolean {
    return (
      a.enemyId === b.enemyId &&
      a.name === b.name &&
      Position.equals(a.position, b.position) &&
      Velocity.equals(a.velocity, b.velocity) &&
      a.health === b.health &&
      a.maxHealth === b.maxHealth &&
      a.level === b.level &&
      a.isAggro === b.isAggro &&
      _.equalsOptional(a.targetPlayerId, b.targetPlayerId, (x, y) => x === y) &&
      Math.round(a.lastAttackTime / 0.1) === Math.round(b.lastAttackTime / 0.1) &&
      _.equalsOptional(a.lootTableId, b.lootTableId, (x, y) => x === y)
    );
  },
  encode(obj: Enemy): Uint8Array {
    const tracker = new _.Tracker();
    Enemy._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Enemy, tracker: _.Tracker): void {
    tracker.pushString(obj.enemyId);
    tracker.pushString(obj.name);
    Position._encode(obj.position, tracker);
    Velocity._encode(obj.velocity, tracker);
    tracker.pushUInt(obj.health);
    tracker.pushUInt(obj.maxHealth);
    tracker.pushUInt(obj.level);
    tracker.pushBoolean(obj.isAggro);
    tracker.pushOptional(obj.targetPlayerId, (x) => tracker.pushString(x));
    tracker.pushInt(Math.round(obj.lastAttackTime / 0.1));
    tracker.pushOptional(obj.lootTableId, (x) => tracker.pushString(x));
  },
  encodeDiff(a: Enemy, b: Enemy): Uint8Array {
    const tracker = new _.Tracker();
    Enemy._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Enemy, b: Enemy, tracker: _.Tracker): void {
    const changed = !Enemy.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.enemyId, b.enemyId);
    tracker.pushStringDiff(a.name, b.name);
    Position._encodeDiff(a.position, b.position, tracker);
    Velocity._encodeDiff(a.velocity, b.velocity, tracker);
    tracker.pushUIntDiff(a.health, b.health);
    tracker.pushUIntDiff(a.maxHealth, b.maxHealth);
    tracker.pushUIntDiff(a.level, b.level);
    tracker.pushBooleanDiff(a.isAggro, b.isAggro);
    tracker.pushOptionalDiffPrimitive<string>(
      a.targetPlayerId,
      b.targetPlayerId,
      (x) => tracker.pushString(x)
    );
    tracker.pushIntDiff(Math.round(a.lastAttackTime / 0.1), Math.round(b.lastAttackTime / 0.1));
    tracker.pushOptionalDiffPrimitive<string>(
      a.lootTableId,
      b.lootTableId,
      (x) => tracker.pushString(x)
    );
  },
  decode(input: Uint8Array): Enemy {
    return Enemy._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Enemy {
    return {
      enemyId: tracker.nextString(),
      name: tracker.nextString(),
      position: Position._decode(tracker),
      velocity: Velocity._decode(tracker),
      health: tracker.nextUInt(),
      maxHealth: tracker.nextUInt(),
      level: tracker.nextUInt(),
      isAggro: tracker.nextBoolean(),
      targetPlayerId: tracker.nextOptional(() => tracker.nextString()),
      lastAttackTime: tracker.nextInt() * 0.1,
      lootTableId: tracker.nextOptional(() => tracker.nextString()),
    };
  },
  decodeDiff(obj: Enemy, input: Uint8Array): Enemy {
    const tracker = _.Tracker.parse(input);
    return Enemy._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Enemy, tracker: _.Tracker): Enemy {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      enemyId: tracker.nextStringDiff(obj.enemyId),
      name: tracker.nextStringDiff(obj.name),
      position: Position._decodeDiff(obj.position, tracker),
      velocity: Velocity._decodeDiff(obj.velocity, tracker),
      health: tracker.nextUIntDiff(obj.health),
      maxHealth: tracker.nextUIntDiff(obj.maxHealth),
      level: tracker.nextUIntDiff(obj.level),
      isAggro: tracker.nextBooleanDiff(obj.isAggro),
      targetPlayerId: tracker.nextOptionalDiffPrimitive<string>(
        obj.targetPlayerId,
        () => tracker.nextString()
      ),
      lastAttackTime: tracker.nextIntDiff(Math.round(obj.lastAttackTime / 0.1)) * 0.1,
      lootTableId: tracker.nextOptionalDiffPrimitive<string>(
        obj.lootTableId,
        () => tracker.nextString()
      ),
    };
  },
};

export const Projectile = {
  default(): Projectile {
    return {
      projectileId: "",
      ownerId: "",
      position: Position.default(),
      velocity: Velocity.default(),
      damage: 0,
      penetration: 0,
      timeToLive: 0.0,
      hitPlayers: [],
    };
  },
  parse(obj: Projectile): Projectile {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid Projectile: ${obj}`);
    }
    return {
      projectileId: _.tryParseField(() => _.parseString(obj.projectileId), "Projectile.projectileId"),
      ownerId: _.tryParseField(() => _.parseString(obj.ownerId), "Projectile.ownerId"),
      position: _.tryParseField(() => Position.parse(obj.position as Position), "Projectile.position"),
      velocity: _.tryParseField(() => Velocity.parse(obj.velocity as Velocity), "Projectile.velocity"),
      damage: _.tryParseField(() => _.parseUInt(obj.damage), "Projectile.damage"),
      penetration: _.tryParseField(() => _.parseUInt(obj.penetration), "Projectile.penetration"),
      timeToLive: _.tryParseField(() => _.parseFloat(obj.timeToLive), "Projectile.timeToLive"),
      hitPlayers: _.tryParseField(() => _.parseArray(obj.hitPlayers, (x) => _.parseString(x)), "Projectile.hitPlayers"),
    };
  },
  equals(a: Projectile, b: Projectile): boolean {
    return (
      a.projectileId === b.projectileId &&
      a.ownerId === b.ownerId &&
      Position.equals(a.position, b.position) &&
      Velocity.equals(a.velocity, b.velocity) &&
      a.damage === b.damage &&
      a.penetration === b.penetration &&
      Math.round(a.timeToLive / 0.1) === Math.round(b.timeToLive / 0.1) &&
      _.equalsArray(a.hitPlayers, b.hitPlayers, (x, y) => x === y)
    );
  },
  encode(obj: Projectile): Uint8Array {
    const tracker = new _.Tracker();
    Projectile._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Projectile, tracker: _.Tracker): void {
    tracker.pushString(obj.projectileId);
    tracker.pushString(obj.ownerId);
    Position._encode(obj.position, tracker);
    Velocity._encode(obj.velocity, tracker);
    tracker.pushUInt(obj.damage);
    tracker.pushUInt(obj.penetration);
    tracker.pushInt(Math.round(obj.timeToLive / 0.1));
    tracker.pushArray(obj.hitPlayers, (x) => tracker.pushString(x));
  },
  encodeDiff(a: Projectile, b: Projectile): Uint8Array {
    const tracker = new _.Tracker();
    Projectile._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Projectile, b: Projectile, tracker: _.Tracker): void {
    const changed = !Projectile.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.projectileId, b.projectileId);
    tracker.pushStringDiff(a.ownerId, b.ownerId);
    Position._encodeDiff(a.position, b.position, tracker);
    Velocity._encodeDiff(a.velocity, b.velocity, tracker);
    tracker.pushUIntDiff(a.damage, b.damage);
    tracker.pushUIntDiff(a.penetration, b.penetration);
    tracker.pushIntDiff(Math.round(a.timeToLive / 0.1), Math.round(b.timeToLive / 0.1));
    tracker.pushArrayDiff<string>(
      a.hitPlayers,
      b.hitPlayers,
      (x, y) => x === y,
      (x) => tracker.pushString(x),
      (x, y) => tracker.pushStringDiff(x, y)
    );
  },
  decode(input: Uint8Array): Projectile {
    return Projectile._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Projectile {
    return {
      projectileId: tracker.nextString(),
      ownerId: tracker.nextString(),
      position: Position._decode(tracker),
      velocity: Velocity._decode(tracker),
      damage: tracker.nextUInt(),
      penetration: tracker.nextUInt(),
      timeToLive: tracker.nextInt() * 0.1,
      hitPlayers: tracker.nextArray(() => tracker.nextString()),
    };
  },
  decodeDiff(obj: Projectile, input: Uint8Array): Projectile {
    const tracker = _.Tracker.parse(input);
    return Projectile._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Projectile, tracker: _.Tracker): Projectile {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      projectileId: tracker.nextStringDiff(obj.projectileId),
      ownerId: tracker.nextStringDiff(obj.ownerId),
      position: Position._decodeDiff(obj.position, tracker),
      velocity: Velocity._decodeDiff(obj.velocity, tracker),
      damage: tracker.nextUIntDiff(obj.damage),
      penetration: tracker.nextUIntDiff(obj.penetration),
      timeToLive: tracker.nextIntDiff(Math.round(obj.timeToLive / 0.1)) * 0.1,
      hitPlayers: tracker.nextArrayDiff<string>(
        obj.hitPlayers,
        () => tracker.nextString(),
        (x) => tracker.nextStringDiff(x)
      ),
    };
  },
};

export const DroppedLoot = {
  default(): DroppedLoot {
    return {
      lootId: "",
      position: Position.default(),
      item: InventoryItem.default(),
      despawnTime: 0.0,
    };
  },
  parse(obj: DroppedLoot): DroppedLoot {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid DroppedLoot: ${obj}`);
    }
    return {
      lootId: _.tryParseField(() => _.parseString(obj.lootId), "DroppedLoot.lootId"),
      position: _.tryParseField(() => Position.parse(obj.position as Position), "DroppedLoot.position"),
      item: _.tryParseField(() => InventoryItem.parse(obj.item as InventoryItem), "DroppedLoot.item"),
      despawnTime: _.tryParseField(() => _.parseFloat(obj.despawnTime), "DroppedLoot.despawnTime"),
    };
  },
  equals(a: DroppedLoot, b: DroppedLoot): boolean {
    return (
      a.lootId === b.lootId &&
      Position.equals(a.position, b.position) &&
      InventoryItem.equals(a.item, b.item) &&
      Math.round(a.despawnTime / 0.1) === Math.round(b.despawnTime / 0.1)
    );
  },
  encode(obj: DroppedLoot): Uint8Array {
    const tracker = new _.Tracker();
    DroppedLoot._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: DroppedLoot, tracker: _.Tracker): void {
    tracker.pushString(obj.lootId);
    Position._encode(obj.position, tracker);
    InventoryItem._encode(obj.item, tracker);
    tracker.pushInt(Math.round(obj.despawnTime / 0.1));
  },
  encodeDiff(a: DroppedLoot, b: DroppedLoot): Uint8Array {
    const tracker = new _.Tracker();
    DroppedLoot._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: DroppedLoot, b: DroppedLoot, tracker: _.Tracker): void {
    const changed = !DroppedLoot.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.lootId, b.lootId);
    Position._encodeDiff(a.position, b.position, tracker);
    InventoryItem._encodeDiff(a.item, b.item, tracker);
    tracker.pushIntDiff(Math.round(a.despawnTime / 0.1), Math.round(b.despawnTime / 0.1));
  },
  decode(input: Uint8Array): DroppedLoot {
    return DroppedLoot._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): DroppedLoot {
    return {
      lootId: tracker.nextString(),
      position: Position._decode(tracker),
      item: InventoryItem._decode(tracker),
      despawnTime: tracker.nextInt() * 0.1,
    };
  },
  decodeDiff(obj: DroppedLoot, input: Uint8Array): DroppedLoot {
    const tracker = _.Tracker.parse(input);
    return DroppedLoot._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: DroppedLoot, tracker: _.Tracker): DroppedLoot {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      lootId: tracker.nextStringDiff(obj.lootId),
      position: Position._decodeDiff(obj.position, tracker),
      item: InventoryItem._decodeDiff(obj.item, tracker),
      despawnTime: tracker.nextIntDiff(Math.round(obj.despawnTime / 0.1)) * 0.1,
    };
  },
};

export const WorldObject = {
  default(): WorldObject {
    return {
      objectId: "",
      objectType: "",
      position: Position.default(),
      health: undefined,
      isDestroyed: false,
      isInteractable: false,
      interactedBy: undefined,
    };
  },
  parse(obj: WorldObject): WorldObject {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid WorldObject: ${obj}`);
    }
    return {
      objectId: _.tryParseField(() => _.parseString(obj.objectId), "WorldObject.objectId"),
      objectType: _.tryParseField(() => _.parseString(obj.objectType), "WorldObject.objectType"),
      position: _.tryParseField(() => Position.parse(obj.position as Position), "WorldObject.position"),
      health: _.tryParseField(() => _.parseOptional(obj.health, (x) => _.parseUInt(x)), "WorldObject.health"),
      isDestroyed: _.tryParseField(() => _.parseBoolean(obj.isDestroyed), "WorldObject.isDestroyed"),
      isInteractable: _.tryParseField(() => _.parseBoolean(obj.isInteractable), "WorldObject.isInteractable"),
      interactedBy: _.tryParseField(() => _.parseOptional(obj.interactedBy, (x) => _.parseString(x)), "WorldObject.interactedBy"),
    };
  },
  equals(a: WorldObject, b: WorldObject): boolean {
    return (
      a.objectId === b.objectId &&
      a.objectType === b.objectType &&
      Position.equals(a.position, b.position) &&
      _.equalsOptional(a.health, b.health, (x, y) => x === y) &&
      a.isDestroyed === b.isDestroyed &&
      a.isInteractable === b.isInteractable &&
      _.equalsOptional(a.interactedBy, b.interactedBy, (x, y) => x === y)
    );
  },
  encode(obj: WorldObject): Uint8Array {
    const tracker = new _.Tracker();
    WorldObject._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: WorldObject, tracker: _.Tracker): void {
    tracker.pushString(obj.objectId);
    tracker.pushString(obj.objectType);
    Position._encode(obj.position, tracker);
    tracker.pushOptional(obj.health, (x) => tracker.pushUInt(x));
    tracker.pushBoolean(obj.isDestroyed);
    tracker.pushBoolean(obj.isInteractable);
    tracker.pushOptional(obj.interactedBy, (x) => tracker.pushString(x));
  },
  encodeDiff(a: WorldObject, b: WorldObject): Uint8Array {
    const tracker = new _.Tracker();
    WorldObject._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: WorldObject, b: WorldObject, tracker: _.Tracker): void {
    const changed = !WorldObject.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.objectId, b.objectId);
    tracker.pushStringDiff(a.objectType, b.objectType);
    Position._encodeDiff(a.position, b.position, tracker);
    tracker.pushOptionalDiffPrimitive<number>(
      a.health,
      b.health,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushBooleanDiff(a.isDestroyed, b.isDestroyed);
    tracker.pushBooleanDiff(a.isInteractable, b.isInteractable);
    tracker.pushOptionalDiffPrimitive<string>(
      a.interactedBy,
      b.interactedBy,
      (x) => tracker.pushString(x)
    );
  },
  decode(input: Uint8Array): WorldObject {
    return WorldObject._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): WorldObject {
    return {
      objectId: tracker.nextString(),
      objectType: tracker.nextString(),
      position: Position._decode(tracker),
      health: tracker.nextOptional(() => tracker.nextUInt()),
      isDestroyed: tracker.nextBoolean(),
      isInteractable: tracker.nextBoolean(),
      interactedBy: tracker.nextOptional(() => tracker.nextString()),
    };
  },
  decodeDiff(obj: WorldObject, input: Uint8Array): WorldObject {
    const tracker = _.Tracker.parse(input);
    return WorldObject._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: WorldObject, tracker: _.Tracker): WorldObject {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      objectId: tracker.nextStringDiff(obj.objectId),
      objectType: tracker.nextStringDiff(obj.objectType),
      position: Position._decodeDiff(obj.position, tracker),
      health: tracker.nextOptionalDiffPrimitive<number>(
        obj.health,
        () => tracker.nextUInt()
      ),
      isDestroyed: tracker.nextBooleanDiff(obj.isDestroyed),
      isInteractable: tracker.nextBooleanDiff(obj.isInteractable),
      interactedBy: tracker.nextOptionalDiffPrimitive<string>(
        obj.interactedBy,
        () => tracker.nextString()
      ),
    };
  },
};

export const MatchStats = {
  default(): MatchStats {
    return {
      totalKills: 0,
      totalDeaths: 0,
      totalDamageDealt: 0,
      totalHealingDone: 0,
      longestKillStreak: 0,
      matchDuration: 0.0,
    };
  },
  parse(obj: MatchStats): MatchStats {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid MatchStats: ${obj}`);
    }
    return {
      totalKills: _.tryParseField(() => _.parseUInt(obj.totalKills), "MatchStats.totalKills"),
      totalDeaths: _.tryParseField(() => _.parseUInt(obj.totalDeaths), "MatchStats.totalDeaths"),
      totalDamageDealt: _.tryParseField(() => _.parseUInt(obj.totalDamageDealt), "MatchStats.totalDamageDealt"),
      totalHealingDone: _.tryParseField(() => _.parseUInt(obj.totalHealingDone), "MatchStats.totalHealingDone"),
      longestKillStreak: _.tryParseField(() => _.parseUInt(obj.longestKillStreak), "MatchStats.longestKillStreak"),
      matchDuration: _.tryParseField(() => _.parseFloat(obj.matchDuration), "MatchStats.matchDuration"),
    };
  },
  equals(a: MatchStats, b: MatchStats): boolean {
    return (
      a.totalKills === b.totalKills &&
      a.totalDeaths === b.totalDeaths &&
      a.totalDamageDealt === b.totalDamageDealt &&
      a.totalHealingDone === b.totalHealingDone &&
      a.longestKillStreak === b.longestKillStreak &&
      Math.round(a.matchDuration / 0.1) === Math.round(b.matchDuration / 0.1)
    );
  },
  encode(obj: MatchStats): Uint8Array {
    const tracker = new _.Tracker();
    MatchStats._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: MatchStats, tracker: _.Tracker): void {
    tracker.pushUInt(obj.totalKills);
    tracker.pushUInt(obj.totalDeaths);
    tracker.pushUInt(obj.totalDamageDealt);
    tracker.pushUInt(obj.totalHealingDone);
    tracker.pushUInt(obj.longestKillStreak);
    tracker.pushInt(Math.round(obj.matchDuration / 0.1));
  },
  encodeDiff(a: MatchStats, b: MatchStats): Uint8Array {
    const tracker = new _.Tracker();
    MatchStats._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: MatchStats, b: MatchStats, tracker: _.Tracker): void {
    const changed = !MatchStats.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(a.totalKills, b.totalKills);
    tracker.pushUIntDiff(a.totalDeaths, b.totalDeaths);
    tracker.pushUIntDiff(a.totalDamageDealt, b.totalDamageDealt);
    tracker.pushUIntDiff(a.totalHealingDone, b.totalHealingDone);
    tracker.pushUIntDiff(a.longestKillStreak, b.longestKillStreak);
    tracker.pushIntDiff(Math.round(a.matchDuration / 0.1), Math.round(b.matchDuration / 0.1));
  },
  decode(input: Uint8Array): MatchStats {
    return MatchStats._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): MatchStats {
    return {
      totalKills: tracker.nextUInt(),
      totalDeaths: tracker.nextUInt(),
      totalDamageDealt: tracker.nextUInt(),
      totalHealingDone: tracker.nextUInt(),
      longestKillStreak: tracker.nextUInt(),
      matchDuration: tracker.nextInt() * 0.1,
    };
  },
  decodeDiff(obj: MatchStats, input: Uint8Array): MatchStats {
    const tracker = _.Tracker.parse(input);
    return MatchStats._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: MatchStats, tracker: _.Tracker): MatchStats {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      totalKills: tracker.nextUIntDiff(obj.totalKills),
      totalDeaths: tracker.nextUIntDiff(obj.totalDeaths),
      totalDamageDealt: tracker.nextUIntDiff(obj.totalDamageDealt),
      totalHealingDone: tracker.nextUIntDiff(obj.totalHealingDone),
      longestKillStreak: tracker.nextUIntDiff(obj.longestKillStreak),
      matchDuration: tracker.nextIntDiff(Math.round(obj.matchDuration / 0.1)) * 0.1,
    };
  },
};

export const TeamScore = {
  default(): TeamScore {
    return {
      team: "RED",
      score: 0,
      kills: 0,
      objectivesCaptured: 0,
    };
  },
  parse(obj: TeamScore): TeamScore {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid TeamScore: ${obj}`);
    }
    return {
      team: _.tryParseField(() => _.parseEnum(obj.team, Team), "TeamScore.team"),
      score: _.tryParseField(() => _.parseUInt(obj.score), "TeamScore.score"),
      kills: _.tryParseField(() => _.parseUInt(obj.kills), "TeamScore.kills"),
      objectivesCaptured: _.tryParseField(() => _.parseUInt(obj.objectivesCaptured), "TeamScore.objectivesCaptured"),
    };
  },
  equals(a: TeamScore, b: TeamScore): boolean {
    return (
      a.team === b.team &&
      a.score === b.score &&
      a.kills === b.kills &&
      a.objectivesCaptured === b.objectivesCaptured
    );
  },
  encode(obj: TeamScore): Uint8Array {
    const tracker = new _.Tracker();
    TeamScore._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: TeamScore, tracker: _.Tracker): void {
    tracker.pushUInt(Team[obj.team]);
    tracker.pushUInt(obj.score);
    tracker.pushUInt(obj.kills);
    tracker.pushUInt(obj.objectivesCaptured);
  },
  encodeDiff(a: TeamScore, b: TeamScore): Uint8Array {
    const tracker = new _.Tracker();
    TeamScore._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: TeamScore, b: TeamScore, tracker: _.Tracker): void {
    const changed = !TeamScore.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(Team[a.team], Team[b.team]);
    tracker.pushUIntDiff(a.score, b.score);
    tracker.pushUIntDiff(a.kills, b.kills);
    tracker.pushUIntDiff(a.objectivesCaptured, b.objectivesCaptured);
  },
  decode(input: Uint8Array): TeamScore {
    return TeamScore._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): TeamScore {
    return {
      team: (Team as any)[tracker.nextUInt()],
      score: tracker.nextUInt(),
      kills: tracker.nextUInt(),
      objectivesCaptured: tracker.nextUInt(),
    };
  },
  decodeDiff(obj: TeamScore, input: Uint8Array): TeamScore {
    const tracker = _.Tracker.parse(input);
    return TeamScore._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: TeamScore, tracker: _.Tracker): TeamScore {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      team: (Team as any)[tracker.nextUIntDiff((Team as any)[obj.team])],
      score: tracker.nextUIntDiff(obj.score),
      kills: tracker.nextUIntDiff(obj.kills),
      objectivesCaptured: tracker.nextUIntDiff(obj.objectivesCaptured),
    };
  },
};

export const GameSettings = {
  default(): GameSettings {
    return {
      maxPlayers: 0,
      friendlyFire: false,
      respawnDelay: 0.0,
      roundTimeLimit: 0,
      startingGold: 0,
      gravityMultiplier: 0.0,
    };
  },
  parse(obj: GameSettings): GameSettings {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid GameSettings: ${obj}`);
    }
    return {
      maxPlayers: _.tryParseField(() => _.parseUInt(obj.maxPlayers), "GameSettings.maxPlayers"),
      friendlyFire: _.tryParseField(() => _.parseBoolean(obj.friendlyFire), "GameSettings.friendlyFire"),
      respawnDelay: _.tryParseField(() => _.parseFloat(obj.respawnDelay), "GameSettings.respawnDelay"),
      roundTimeLimit: _.tryParseField(() => _.parseUInt(obj.roundTimeLimit), "GameSettings.roundTimeLimit"),
      startingGold: _.tryParseField(() => _.parseUInt(obj.startingGold), "GameSettings.startingGold"),
      gravityMultiplier: _.tryParseField(() => _.parseFloat(obj.gravityMultiplier), "GameSettings.gravityMultiplier"),
    };
  },
  equals(a: GameSettings, b: GameSettings): boolean {
    return (
      a.maxPlayers === b.maxPlayers &&
      a.friendlyFire === b.friendlyFire &&
      Math.round(a.respawnDelay / 0.1) === Math.round(b.respawnDelay / 0.1) &&
      a.roundTimeLimit === b.roundTimeLimit &&
      a.startingGold === b.startingGold &&
      Math.round(a.gravityMultiplier / 0.01) === Math.round(b.gravityMultiplier / 0.01)
    );
  },
  encode(obj: GameSettings): Uint8Array {
    const tracker = new _.Tracker();
    GameSettings._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: GameSettings, tracker: _.Tracker): void {
    tracker.pushUInt(obj.maxPlayers);
    tracker.pushBoolean(obj.friendlyFire);
    tracker.pushInt(Math.round(obj.respawnDelay / 0.1));
    tracker.pushUInt(obj.roundTimeLimit);
    tracker.pushUInt(obj.startingGold);
    tracker.pushInt(Math.round(obj.gravityMultiplier / 0.01));
  },
  encodeDiff(a: GameSettings, b: GameSettings): Uint8Array {
    const tracker = new _.Tracker();
    GameSettings._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: GameSettings, b: GameSettings, tracker: _.Tracker): void {
    const changed = !GameSettings.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(a.maxPlayers, b.maxPlayers);
    tracker.pushBooleanDiff(a.friendlyFire, b.friendlyFire);
    tracker.pushIntDiff(Math.round(a.respawnDelay / 0.1), Math.round(b.respawnDelay / 0.1));
    tracker.pushUIntDiff(a.roundTimeLimit, b.roundTimeLimit);
    tracker.pushUIntDiff(a.startingGold, b.startingGold);
    tracker.pushIntDiff(Math.round(a.gravityMultiplier / 0.01), Math.round(b.gravityMultiplier / 0.01));
  },
  decode(input: Uint8Array): GameSettings {
    return GameSettings._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): GameSettings {
    return {
      maxPlayers: tracker.nextUInt(),
      friendlyFire: tracker.nextBoolean(),
      respawnDelay: tracker.nextInt() * 0.1,
      roundTimeLimit: tracker.nextUInt(),
      startingGold: tracker.nextUInt(),
      gravityMultiplier: tracker.nextInt() * 0.01,
    };
  },
  decodeDiff(obj: GameSettings, input: Uint8Array): GameSettings {
    const tracker = _.Tracker.parse(input);
    return GameSettings._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: GameSettings, tracker: _.Tracker): GameSettings {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      maxPlayers: tracker.nextUIntDiff(obj.maxPlayers),
      friendlyFire: tracker.nextBooleanDiff(obj.friendlyFire),
      respawnDelay: tracker.nextIntDiff(Math.round(obj.respawnDelay / 0.1)) * 0.1,
      roundTimeLimit: tracker.nextUIntDiff(obj.roundTimeLimit),
      startingGold: tracker.nextUIntDiff(obj.startingGold),
      gravityMultiplier: tracker.nextIntDiff(Math.round(obj.gravityMultiplier / 0.01)) * 0.01,
    };
  },
};

export const GameState = {
  default(): GameState {
    return {
      gameId: "",
      serverTime: 0.0,
      tickNumber: 0,
      round: 0,
      phase: "",
      timeRemaining: 0.0,
      players: new Map(),
      enemies: new Map(),
      projectiles: new Map(),
      droppedLoot: new Map(),
      worldObjects: new Map(),
      teamScores: [],
      matchStats: MatchStats.default(),
      settings: GameSettings.default(),
      winningTeam: undefined,
      mapName: "",
      weatherIntensity: 0.0,
    };
  },
  parse(obj: GameState): GameState {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(`Invalid GameState: ${obj}`);
    }
    return {
      gameId: _.tryParseField(() => _.parseString(obj.gameId), "GameState.gameId"),
      serverTime: _.tryParseField(() => _.parseFloat(obj.serverTime), "GameState.serverTime"),
      tickNumber: _.tryParseField(() => _.parseUInt(obj.tickNumber), "GameState.tickNumber"),
      round: _.tryParseField(() => _.parseUInt(obj.round), "GameState.round"),
      phase: _.tryParseField(() => _.parseString(obj.phase), "GameState.phase"),
      timeRemaining: _.tryParseField(() => _.parseFloat(obj.timeRemaining), "GameState.timeRemaining"),
      players: _.tryParseField(() => _.parseRecord(obj.players, (x) => _.parseString(x), (x) => Player.parse(x as Player)), "GameState.players"),
      enemies: _.tryParseField(() => _.parseRecord(obj.enemies, (x) => _.parseString(x), (x) => Enemy.parse(x as Enemy)), "GameState.enemies"),
      projectiles: _.tryParseField(() => _.parseRecord(obj.projectiles, (x) => _.parseString(x), (x) => Projectile.parse(x as Projectile)), "GameState.projectiles"),
      droppedLoot: _.tryParseField(() => _.parseRecord(obj.droppedLoot, (x) => _.parseString(x), (x) => DroppedLoot.parse(x as DroppedLoot)), "GameState.droppedLoot"),
      worldObjects: _.tryParseField(() => _.parseRecord(obj.worldObjects, (x) => _.parseString(x), (x) => WorldObject.parse(x as WorldObject)), "GameState.worldObjects"),
      teamScores: _.tryParseField(() => _.parseArray(obj.teamScores, (x) => TeamScore.parse(x as TeamScore)), "GameState.teamScores"),
      matchStats: _.tryParseField(() => MatchStats.parse(obj.matchStats as MatchStats), "GameState.matchStats"),
      settings: _.tryParseField(() => GameSettings.parse(obj.settings as GameSettings), "GameState.settings"),
      winningTeam: _.tryParseField(() => _.parseOptional(obj.winningTeam, (x) => _.parseEnum(x, Team)), "GameState.winningTeam"),
      mapName: _.tryParseField(() => _.parseString(obj.mapName), "GameState.mapName"),
      weatherIntensity: _.tryParseField(() => _.parseFloat(obj.weatherIntensity), "GameState.weatherIntensity"),
    };
  },
  equals(a: GameState, b: GameState): boolean {
    return (
      a.gameId === b.gameId &&
      Math.round(a.serverTime / 0.1) === Math.round(b.serverTime / 0.1) &&
      a.tickNumber === b.tickNumber &&
      a.round === b.round &&
      a.phase === b.phase &&
      Math.round(a.timeRemaining / 0.1) === Math.round(b.timeRemaining / 0.1) &&
      _.equalsRecord(a.players, b.players, (x, y) => x === y, (x, y) => Player.equals(x, y)) &&
      _.equalsRecord(a.enemies, b.enemies, (x, y) => x === y, (x, y) => Enemy.equals(x, y)) &&
      _.equalsRecord(a.projectiles, b.projectiles, (x, y) => x === y, (x, y) => Projectile.equals(x, y)) &&
      _.equalsRecord(a.droppedLoot, b.droppedLoot, (x, y) => x === y, (x, y) => DroppedLoot.equals(x, y)) &&
      _.equalsRecord(a.worldObjects, b.worldObjects, (x, y) => x === y, (x, y) => WorldObject.equals(x, y)) &&
      _.equalsArray(a.teamScores, b.teamScores, (x, y) => TeamScore.equals(x, y)) &&
      MatchStats.equals(a.matchStats, b.matchStats) &&
      GameSettings.equals(a.settings, b.settings) &&
      _.equalsOptional(a.winningTeam, b.winningTeam, (x, y) => x === y) &&
      a.mapName === b.mapName &&
      Math.round(a.weatherIntensity / 0.01) === Math.round(b.weatherIntensity / 0.01)
    );
  },
  encode(obj: GameState): Uint8Array {
    const tracker = new _.Tracker();
    GameState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: GameState, tracker: _.Tracker): void {
    tracker.pushString(obj.gameId);
    tracker.pushInt(Math.round(obj.serverTime / 0.1));
    tracker.pushUInt(obj.tickNumber);
    tracker.pushUInt(obj.round);
    tracker.pushString(obj.phase);
    tracker.pushInt(Math.round(obj.timeRemaining / 0.1));
    tracker.pushRecord(obj.players, (x) => tracker.pushString(x), (x) => Player._encode(x, tracker));
    tracker.pushRecord(obj.enemies, (x) => tracker.pushString(x), (x) => Enemy._encode(x, tracker));
    tracker.pushRecord(obj.projectiles, (x) => tracker.pushString(x), (x) => Projectile._encode(x, tracker));
    tracker.pushRecord(obj.droppedLoot, (x) => tracker.pushString(x), (x) => DroppedLoot._encode(x, tracker));
    tracker.pushRecord(obj.worldObjects, (x) => tracker.pushString(x), (x) => WorldObject._encode(x, tracker));
    tracker.pushArray(obj.teamScores, (x) => TeamScore._encode(x, tracker));
    MatchStats._encode(obj.matchStats, tracker);
    GameSettings._encode(obj.settings, tracker);
    tracker.pushOptional(obj.winningTeam, (x) => tracker.pushUInt(Team[x]));
    tracker.pushString(obj.mapName);
    tracker.pushInt(Math.round(obj.weatherIntensity / 0.01));
  },
  encodeDiff(a: GameState, b: GameState): Uint8Array {
    const tracker = new _.Tracker();
    GameState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: GameState, b: GameState, tracker: _.Tracker): void {
    const changed = !GameState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.gameId, b.gameId);
    tracker.pushIntDiff(Math.round(a.serverTime / 0.1), Math.round(b.serverTime / 0.1));
    tracker.pushUIntDiff(a.tickNumber, b.tickNumber);
    tracker.pushUIntDiff(a.round, b.round);
    tracker.pushStringDiff(a.phase, b.phase);
    tracker.pushIntDiff(Math.round(a.timeRemaining / 0.1), Math.round(b.timeRemaining / 0.1));
    tracker.pushRecordDiff<string, Player>(
      a.players,
      b.players,
      (x, y) => Player.equals(x, y),
      (x) => tracker.pushString(x),
      (x) => Player._encode(x, tracker),
      (x, y) => Player._encodeDiff(x, y, tracker)
    );
    tracker.pushRecordDiff<string, Enemy>(
      a.enemies,
      b.enemies,
      (x, y) => Enemy.equals(x, y),
      (x) => tracker.pushString(x),
      (x) => Enemy._encode(x, tracker),
      (x, y) => Enemy._encodeDiff(x, y, tracker)
    );
    tracker.pushRecordDiff<string, Projectile>(
      a.projectiles,
      b.projectiles,
      (x, y) => Projectile.equals(x, y),
      (x) => tracker.pushString(x),
      (x) => Projectile._encode(x, tracker),
      (x, y) => Projectile._encodeDiff(x, y, tracker)
    );
    tracker.pushRecordDiff<string, DroppedLoot>(
      a.droppedLoot,
      b.droppedLoot,
      (x, y) => DroppedLoot.equals(x, y),
      (x) => tracker.pushString(x),
      (x) => DroppedLoot._encode(x, tracker),
      (x, y) => DroppedLoot._encodeDiff(x, y, tracker)
    );
    tracker.pushRecordDiff<string, WorldObject>(
      a.worldObjects,
      b.worldObjects,
      (x, y) => WorldObject.equals(x, y),
      (x) => tracker.pushString(x),
      (x) => WorldObject._encode(x, tracker),
      (x, y) => WorldObject._encodeDiff(x, y, tracker)
    );
    tracker.pushArrayDiff<TeamScore>(
      a.teamScores,
      b.teamScores,
      (x, y) => TeamScore.equals(x, y),
      (x) => TeamScore._encode(x, tracker),
      (x, y) => TeamScore._encodeDiff(x, y, tracker)
    );
    MatchStats._encodeDiff(a.matchStats, b.matchStats, tracker);
    GameSettings._encodeDiff(a.settings, b.settings, tracker);
    tracker.pushOptionalDiffPrimitive<Team>(
      a.winningTeam,
      b.winningTeam,
      (x) => tracker.pushUInt(Team[x])
    );
    tracker.pushStringDiff(a.mapName, b.mapName);
    tracker.pushIntDiff(Math.round(a.weatherIntensity / 0.01), Math.round(b.weatherIntensity / 0.01));
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): GameState {
    return {
      gameId: tracker.nextString(),
      serverTime: tracker.nextInt() * 0.1,
      tickNumber: tracker.nextUInt(),
      round: tracker.nextUInt(),
      phase: tracker.nextString(),
      timeRemaining: tracker.nextInt() * 0.1,
      players: tracker.nextRecord(() => tracker.nextString(), () => Player._decode(tracker)),
      enemies: tracker.nextRecord(() => tracker.nextString(), () => Enemy._decode(tracker)),
      projectiles: tracker.nextRecord(() => tracker.nextString(), () => Projectile._decode(tracker)),
      droppedLoot: tracker.nextRecord(() => tracker.nextString(), () => DroppedLoot._decode(tracker)),
      worldObjects: tracker.nextRecord(() => tracker.nextString(), () => WorldObject._decode(tracker)),
      teamScores: tracker.nextArray(() => TeamScore._decode(tracker)),
      matchStats: MatchStats._decode(tracker),
      settings: GameSettings._decode(tracker),
      winningTeam: tracker.nextOptional(() => (Team as any)[tracker.nextUInt()]),
      mapName: tracker.nextString(),
      weatherIntensity: tracker.nextInt() * 0.01,
    };
  },
  decodeDiff(obj: GameState, input: Uint8Array): GameState {
    const tracker = _.Tracker.parse(input);
    return GameState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: GameState, tracker: _.Tracker): GameState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      gameId: tracker.nextStringDiff(obj.gameId),
      serverTime: tracker.nextIntDiff(Math.round(obj.serverTime / 0.1)) * 0.1,
      tickNumber: tracker.nextUIntDiff(obj.tickNumber),
      round: tracker.nextUIntDiff(obj.round),
      phase: tracker.nextStringDiff(obj.phase),
      timeRemaining: tracker.nextIntDiff(Math.round(obj.timeRemaining / 0.1)) * 0.1,
      players: tracker.nextRecordDiff<string, Player>(
        obj.players,
        () => tracker.nextString(),
        () => Player._decode(tracker),
        (x) => Player._decodeDiff(x, tracker)
      ),
      enemies: tracker.nextRecordDiff<string, Enemy>(
        obj.enemies,
        () => tracker.nextString(),
        () => Enemy._decode(tracker),
        (x) => Enemy._decodeDiff(x, tracker)
      ),
      projectiles: tracker.nextRecordDiff<string, Projectile>(
        obj.projectiles,
        () => tracker.nextString(),
        () => Projectile._decode(tracker),
        (x) => Projectile._decodeDiff(x, tracker)
      ),
      droppedLoot: tracker.nextRecordDiff<string, DroppedLoot>(
        obj.droppedLoot,
        () => tracker.nextString(),
        () => DroppedLoot._decode(tracker),
        (x) => DroppedLoot._decodeDiff(x, tracker)
      ),
      worldObjects: tracker.nextRecordDiff<string, WorldObject>(
        obj.worldObjects,
        () => tracker.nextString(),
        () => WorldObject._decode(tracker),
        (x) => WorldObject._decodeDiff(x, tracker)
      ),
      teamScores: tracker.nextArrayDiff<TeamScore>(
        obj.teamScores,
        () => TeamScore._decode(tracker),
        (x) => TeamScore._decodeDiff(x, tracker)
      ),
      matchStats: MatchStats._decodeDiff(obj.matchStats, tracker),
      settings: GameSettings._decodeDiff(obj.settings, tracker),
      winningTeam: tracker.nextOptionalDiffPrimitive<Team>(
        obj.winningTeam,
        () => (Team as any)[tracker.nextUInt()]
      ),
      mapName: tracker.nextStringDiff(obj.mapName),
      weatherIntensity: tracker.nextIntDiff(Math.round(obj.weatherIntensity / 0.01)) * 0.01,
    };
  },
};
