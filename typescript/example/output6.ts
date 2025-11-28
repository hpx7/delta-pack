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
  validate(obj: Position) {
    if (typeof obj !== "object") {
      return [`Invalid Position object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.x === "number", `Invalid float: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.x");
    }
    validationErrors = _.validatePrimitive(typeof obj.y === "number", `Invalid float: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Position.y");
    }

    return validationErrors;
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
  validate(obj: Velocity) {
    if (typeof obj !== "object") {
      return [`Invalid Velocity object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.vx === "number", `Invalid float: ${obj.vx}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Velocity.vx");
    }
    validationErrors = _.validatePrimitive(typeof obj.vy === "number", `Invalid float: ${obj.vy}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Velocity.vy");
    }

    return validationErrors;
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
  validate(obj: InventoryItem) {
    if (typeof obj !== "object") {
      return [`Invalid InventoryItem object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.itemId === "string", `Invalid string: ${obj.itemId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: InventoryItem.itemId");
    }
    validationErrors = _.validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: InventoryItem.name");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.quantity) && obj.quantity >= 0, `Invalid uint: ${obj.quantity}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: InventoryItem.quantity");
    }
    validationErrors = _.validatePrimitive(obj.rarity in ItemRarity, `Invalid ItemRarity: ${obj.rarity}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: InventoryItem.rarity");
    }
    validationErrors = _.validateOptional(obj.durability, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: InventoryItem.durability");
    }
    validationErrors = _.validateOptional(obj.enchantmentLevel, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: InventoryItem.enchantmentLevel");
    }

    return validationErrors;
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
      rarity: ItemRarity[tracker.nextUInt()],
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
      rarity: ItemRarity[tracker.nextUIntDiff(ItemRarity[obj.rarity])],
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
  validate(obj: Equipment) {
    if (typeof obj !== "object") {
      return [`Invalid Equipment object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.weapon, (x) => _.validatePrimitive(x in WeaponType, `Invalid WeaponType: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Equipment.weapon");
    }
    validationErrors = _.validateOptional(obj.armor, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Equipment.armor");
    }
    validationErrors = _.validateOptional(obj.accessory1, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Equipment.accessory1");
    }
    validationErrors = _.validateOptional(obj.accessory2, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Equipment.accessory2");
    }

    return validationErrors;
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
      weapon: tracker.nextOptional(() => WeaponType[tracker.nextUInt()]),
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
        () => WeaponType[tracker.nextUInt()]
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
  validate(obj: PlayerStats) {
    if (typeof obj !== "object") {
      return [`Invalid PlayerStats object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.health) && obj.health >= 0, `Invalid uint: ${obj.health}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.health");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.maxHealth) && obj.maxHealth >= 0, `Invalid uint: ${obj.maxHealth}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.maxHealth");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.mana) && obj.mana >= 0, `Invalid uint: ${obj.mana}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.mana");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.maxMana) && obj.maxMana >= 0, `Invalid uint: ${obj.maxMana}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.maxMana");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.stamina) && obj.stamina >= 0, `Invalid uint: ${obj.stamina}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.stamina");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.maxStamina) && obj.maxStamina >= 0, `Invalid uint: ${obj.maxStamina}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.maxStamina");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.level) && obj.level >= 0, `Invalid uint: ${obj.level}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.level");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.experience) && obj.experience >= 0, `Invalid uint: ${obj.experience}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.experience");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.strength) && obj.strength >= 0, `Invalid uint: ${obj.strength}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.strength");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.agility) && obj.agility >= 0, `Invalid uint: ${obj.agility}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.agility");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.intelligence) && obj.intelligence >= 0, `Invalid uint: ${obj.intelligence}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.intelligence");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.defense) && obj.defense >= 0, `Invalid uint: ${obj.defense}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerStats.defense");
    }

    return validationErrors;
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
  validate(obj: ActiveEffect) {
    if (typeof obj !== "object") {
      return [`Invalid ActiveEffect object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(obj.effectType in EffectType, `Invalid EffectType: ${obj.effectType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ActiveEffect.effectType");
    }
    validationErrors = _.validatePrimitive(typeof obj.duration === "number", `Invalid float: ${obj.duration}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ActiveEffect.duration");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.strength) && obj.strength >= 0, `Invalid uint: ${obj.strength}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ActiveEffect.strength");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.stackCount) && obj.stackCount >= 0, `Invalid uint: ${obj.stackCount}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ActiveEffect.stackCount");
    }

    return validationErrors;
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
      effectType: EffectType[tracker.nextUInt()],
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
      effectType: EffectType[tracker.nextUIntDiff(EffectType[obj.effectType])],
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
  validate(obj: AbilityCooldown) {
    if (typeof obj !== "object") {
      return [`Invalid AbilityCooldown object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.abilityId === "string", `Invalid string: ${obj.abilityId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: AbilityCooldown.abilityId");
    }
    validationErrors = _.validatePrimitive(obj.abilityType in AbilityType, `Invalid AbilityType: ${obj.abilityType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: AbilityCooldown.abilityType");
    }
    validationErrors = _.validatePrimitive(typeof obj.remainingCooldown === "number", `Invalid float: ${obj.remainingCooldown}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: AbilityCooldown.remainingCooldown");
    }

    return validationErrors;
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
      abilityType: AbilityType[tracker.nextUInt()],
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
      abilityType: AbilityType[tracker.nextUIntDiff(AbilityType[obj.abilityType])],
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
  validate(obj: Player) {
    if (typeof obj !== "object") {
      return [`Invalid Player object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.playerId === "string", `Invalid string: ${obj.playerId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.playerId");
    }
    validationErrors = _.validatePrimitive(typeof obj.username === "string", `Invalid string: ${obj.username}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.username");
    }
    validationErrors = _.validateOptional(obj.team, (x) => _.validatePrimitive(x in Team, `Invalid Team: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.team");
    }
    validationErrors = _.validatePrimitive(obj.status in PlayerStatus, `Invalid PlayerStatus: ${obj.status}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.status");
    }
    validationErrors = Position.validate(obj.position);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.position");
    }
    validationErrors = Velocity.validate(obj.velocity);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.velocity");
    }
    validationErrors = _.validatePrimitive(typeof obj.rotation === "number", `Invalid float: ${obj.rotation}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.rotation");
    }
    validationErrors = PlayerStats.validate(obj.stats);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.stats");
    }
    validationErrors = _.validateArray(obj.inventory, (x) => InventoryItem.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.inventory");
    }
    validationErrors = Equipment.validate(obj.equipment);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.equipment");
    }
    validationErrors = _.validateArray(obj.activeEffects, (x) => ActiveEffect.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.activeEffects");
    }
    validationErrors = _.validateArray(obj.abilityCooldowns, (x) => AbilityCooldown.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.abilityCooldowns");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.kills) && obj.kills >= 0, `Invalid uint: ${obj.kills}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.kills");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.deaths) && obj.deaths >= 0, `Invalid uint: ${obj.deaths}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.deaths");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.assists) && obj.assists >= 0, `Invalid uint: ${obj.assists}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.assists");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.gold) && obj.gold >= 0, `Invalid uint: ${obj.gold}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.gold");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.score), `Invalid int: ${obj.score}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.score");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.ping) && obj.ping >= 0, `Invalid uint: ${obj.ping}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.ping");
    }
    validationErrors = _.validatePrimitive(typeof obj.isJumping === "boolean", `Invalid boolean: ${obj.isJumping}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isJumping");
    }
    validationErrors = _.validatePrimitive(typeof obj.isCrouching === "boolean", `Invalid boolean: ${obj.isCrouching}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isCrouching");
    }
    validationErrors = _.validatePrimitive(typeof obj.isAiming === "boolean", `Invalid boolean: ${obj.isAiming}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.isAiming");
    }
    validationErrors = _.validateOptional(obj.lastDamageTime, (x) => _.validatePrimitive(typeof x === "number", `Invalid float: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.lastDamageTime");
    }
    validationErrors = _.validateOptional(obj.respawnTime, (x) => _.validatePrimitive(typeof x === "number", `Invalid float: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.respawnTime");
    }

    return validationErrors;
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
      team: tracker.nextOptional(() => Team[tracker.nextUInt()]),
      status: PlayerStatus[tracker.nextUInt()],
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
        () => Team[tracker.nextUInt()]
      ),
      status: PlayerStatus[tracker.nextUIntDiff(PlayerStatus[obj.status])],
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
  validate(obj: Enemy) {
    if (typeof obj !== "object") {
      return [`Invalid Enemy object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.enemyId === "string", `Invalid string: ${obj.enemyId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.enemyId");
    }
    validationErrors = _.validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.name");
    }
    validationErrors = Position.validate(obj.position);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.position");
    }
    validationErrors = Velocity.validate(obj.velocity);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.velocity");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.health) && obj.health >= 0, `Invalid uint: ${obj.health}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.health");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.maxHealth) && obj.maxHealth >= 0, `Invalid uint: ${obj.maxHealth}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.maxHealth");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.level) && obj.level >= 0, `Invalid uint: ${obj.level}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.level");
    }
    validationErrors = _.validatePrimitive(typeof obj.isAggro === "boolean", `Invalid boolean: ${obj.isAggro}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.isAggro");
    }
    validationErrors = _.validateOptional(obj.targetPlayerId, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.targetPlayerId");
    }
    validationErrors = _.validatePrimitive(typeof obj.lastAttackTime === "number", `Invalid float: ${obj.lastAttackTime}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.lastAttackTime");
    }
    validationErrors = _.validateOptional(obj.lootTableId, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Enemy.lootTableId");
    }

    return validationErrors;
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
  validate(obj: Projectile) {
    if (typeof obj !== "object") {
      return [`Invalid Projectile object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.projectileId === "string", `Invalid string: ${obj.projectileId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Projectile.projectileId");
    }
    validationErrors = _.validatePrimitive(typeof obj.ownerId === "string", `Invalid string: ${obj.ownerId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Projectile.ownerId");
    }
    validationErrors = Position.validate(obj.position);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Projectile.position");
    }
    validationErrors = Velocity.validate(obj.velocity);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Projectile.velocity");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.damage) && obj.damage >= 0, `Invalid uint: ${obj.damage}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Projectile.damage");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.penetration) && obj.penetration >= 0, `Invalid uint: ${obj.penetration}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Projectile.penetration");
    }
    validationErrors = _.validatePrimitive(typeof obj.timeToLive === "number", `Invalid float: ${obj.timeToLive}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Projectile.timeToLive");
    }
    validationErrors = _.validateArray(obj.hitPlayers, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Projectile.hitPlayers");
    }

    return validationErrors;
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
  validate(obj: DroppedLoot) {
    if (typeof obj !== "object") {
      return [`Invalid DroppedLoot object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.lootId === "string", `Invalid string: ${obj.lootId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DroppedLoot.lootId");
    }
    validationErrors = Position.validate(obj.position);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DroppedLoot.position");
    }
    validationErrors = InventoryItem.validate(obj.item);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DroppedLoot.item");
    }
    validationErrors = _.validatePrimitive(typeof obj.despawnTime === "number", `Invalid float: ${obj.despawnTime}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DroppedLoot.despawnTime");
    }

    return validationErrors;
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
  validate(obj: WorldObject) {
    if (typeof obj !== "object") {
      return [`Invalid WorldObject object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.objectId === "string", `Invalid string: ${obj.objectId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: WorldObject.objectId");
    }
    validationErrors = _.validatePrimitive(typeof obj.objectType === "string", `Invalid string: ${obj.objectType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: WorldObject.objectType");
    }
    validationErrors = Position.validate(obj.position);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: WorldObject.position");
    }
    validationErrors = _.validateOptional(obj.health, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: WorldObject.health");
    }
    validationErrors = _.validatePrimitive(typeof obj.isDestroyed === "boolean", `Invalid boolean: ${obj.isDestroyed}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: WorldObject.isDestroyed");
    }
    validationErrors = _.validatePrimitive(typeof obj.isInteractable === "boolean", `Invalid boolean: ${obj.isInteractable}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: WorldObject.isInteractable");
    }
    validationErrors = _.validateOptional(obj.interactedBy, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: WorldObject.interactedBy");
    }

    return validationErrors;
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
  validate(obj: MatchStats) {
    if (typeof obj !== "object") {
      return [`Invalid MatchStats object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.totalKills) && obj.totalKills >= 0, `Invalid uint: ${obj.totalKills}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: MatchStats.totalKills");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.totalDeaths) && obj.totalDeaths >= 0, `Invalid uint: ${obj.totalDeaths}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: MatchStats.totalDeaths");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.totalDamageDealt) && obj.totalDamageDealt >= 0, `Invalid uint: ${obj.totalDamageDealt}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: MatchStats.totalDamageDealt");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.totalHealingDone) && obj.totalHealingDone >= 0, `Invalid uint: ${obj.totalHealingDone}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: MatchStats.totalHealingDone");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.longestKillStreak) && obj.longestKillStreak >= 0, `Invalid uint: ${obj.longestKillStreak}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: MatchStats.longestKillStreak");
    }
    validationErrors = _.validatePrimitive(typeof obj.matchDuration === "number", `Invalid float: ${obj.matchDuration}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: MatchStats.matchDuration");
    }

    return validationErrors;
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
  validate(obj: TeamScore) {
    if (typeof obj !== "object") {
      return [`Invalid TeamScore object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(obj.team in Team, `Invalid Team: ${obj.team}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: TeamScore.team");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.score) && obj.score >= 0, `Invalid uint: ${obj.score}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: TeamScore.score");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.kills) && obj.kills >= 0, `Invalid uint: ${obj.kills}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: TeamScore.kills");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.objectivesCaptured) && obj.objectivesCaptured >= 0, `Invalid uint: ${obj.objectivesCaptured}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: TeamScore.objectivesCaptured");
    }

    return validationErrors;
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
      team: Team[tracker.nextUInt()],
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
      team: Team[tracker.nextUIntDiff(Team[obj.team])],
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
  validate(obj: GameSettings) {
    if (typeof obj !== "object") {
      return [`Invalid GameSettings object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.maxPlayers) && obj.maxPlayers >= 0, `Invalid uint: ${obj.maxPlayers}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameSettings.maxPlayers");
    }
    validationErrors = _.validatePrimitive(typeof obj.friendlyFire === "boolean", `Invalid boolean: ${obj.friendlyFire}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameSettings.friendlyFire");
    }
    validationErrors = _.validatePrimitive(typeof obj.respawnDelay === "number", `Invalid float: ${obj.respawnDelay}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameSettings.respawnDelay");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.roundTimeLimit) && obj.roundTimeLimit >= 0, `Invalid uint: ${obj.roundTimeLimit}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameSettings.roundTimeLimit");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.startingGold) && obj.startingGold >= 0, `Invalid uint: ${obj.startingGold}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameSettings.startingGold");
    }
    validationErrors = _.validatePrimitive(typeof obj.gravityMultiplier === "number", `Invalid float: ${obj.gravityMultiplier}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameSettings.gravityMultiplier");
    }

    return validationErrors;
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
  validate(obj: GameState) {
    if (typeof obj !== "object") {
      return [`Invalid GameState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.gameId === "string", `Invalid string: ${obj.gameId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.gameId");
    }
    validationErrors = _.validatePrimitive(typeof obj.serverTime === "number", `Invalid float: ${obj.serverTime}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.serverTime");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.tickNumber) && obj.tickNumber >= 0, `Invalid uint: ${obj.tickNumber}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.tickNumber");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.round) && obj.round >= 0, `Invalid uint: ${obj.round}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.round");
    }
    validationErrors = _.validatePrimitive(typeof obj.phase === "string", `Invalid string: ${obj.phase}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.phase");
    }
    validationErrors = _.validatePrimitive(typeof obj.timeRemaining === "number", `Invalid float: ${obj.timeRemaining}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.timeRemaining");
    }
    validationErrors = _.validateRecord(obj.players, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`), (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.players");
    }
    validationErrors = _.validateRecord(obj.enemies, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`), (x) => Enemy.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.enemies");
    }
    validationErrors = _.validateRecord(obj.projectiles, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`), (x) => Projectile.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.projectiles");
    }
    validationErrors = _.validateRecord(obj.droppedLoot, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`), (x) => DroppedLoot.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.droppedLoot");
    }
    validationErrors = _.validateRecord(obj.worldObjects, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`), (x) => WorldObject.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.worldObjects");
    }
    validationErrors = _.validateArray(obj.teamScores, (x) => TeamScore.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.teamScores");
    }
    validationErrors = MatchStats.validate(obj.matchStats);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.matchStats");
    }
    validationErrors = GameSettings.validate(obj.settings);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.settings");
    }
    validationErrors = _.validateOptional(obj.winningTeam, (x) => _.validatePrimitive(x in Team, `Invalid Team: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.winningTeam");
    }
    validationErrors = _.validatePrimitive(typeof obj.mapName === "string", `Invalid string: ${obj.mapName}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.mapName");
    }
    validationErrors = _.validatePrimitive(typeof obj.weatherIntensity === "number", `Invalid float: ${obj.weatherIntensity}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.weatherIntensity");
    }

    return validationErrors;
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
      winningTeam: tracker.nextOptional(() => Team[tracker.nextUInt()]),
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
        () => Team[tracker.nextUInt()]
      ),
      mapName: tracker.nextStringDiff(obj.mapName),
      weatherIntensity: tracker.nextIntDiff(Math.round(obj.weatherIntensity / 0.01)) * 0.01,
    };
  },
};
