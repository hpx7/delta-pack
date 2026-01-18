import * as _ from "@hpx7/delta-pack/runtime";

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
  durability?: number | undefined;
  enchantmentLevel?: number | undefined;
};

export type Equipment = {
  weapon?: WeaponType | undefined;
  armor?: string | undefined;
  accessory1?: string | undefined;
  accessory2?: string | undefined;
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
  team?: Team | undefined;
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
  lastDamageTime?: number | undefined;
  respawnTime?: number | undefined;
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
  targetPlayerId?: string | undefined;
  lastAttackTime: number;
  lootTableId?: string | undefined;
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
  health?: number | undefined;
  isDestroyed: boolean;
  isInteractable: boolean;
  interactedBy?: string | undefined;
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
  winningTeam?: Team | undefined;
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
  fromJson(obj: object): Position {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Position: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      x: _.tryParseField(() => _.parseFloat(o["x"]), "Position.x"),
      y: _.tryParseField(() => _.parseFloat(o["y"]), "Position.y"),
    };
  },
  toJson(obj: Position): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["x"] = obj.x;
    result["y"] = obj.y;
    return result;
  },
  clone(obj: Position): Position {
    return {
      x: obj.x,
      y: obj.y,
    };
  },
  equals(a: Position, b: Position): boolean {
    return (
      _.equalsFloatQuantized(a.x, b.x, 0.1) &&
      _.equalsFloatQuantized(a.y, b.y, 0.1)
    );
  },
  encode(obj: Position): Uint8Array {
    const encoder = _.Encoder.create();
    Position._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Position, encoder: _.Encoder): void {
    encoder.pushFloatQuantized(obj.x, 0.1);
    encoder.pushFloatQuantized(obj.y, 0.1);
  },
  encodeDiff(a: Position, b: Position): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Position.equals, () => Position._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Position, b: Position, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "x",
      (x, y) => _.equalsFloatQuantized(x, y, 0.1),
      (x, y) => encoder.pushFloatQuantizedDiff(x, y, 0.1),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "y",
      (x, y) => _.equalsFloatQuantized(x, y, 0.1),
      (x, y) => encoder.pushFloatQuantizedDiff(x, y, 0.1),
    );
  },
  decode(input: Uint8Array): Position {
    return Position._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Position {
    return {
      x: decoder.nextFloatQuantized(0.1),
      y: decoder.nextFloatQuantized(0.1),
    };
  },
  decodeDiff(obj: Position, input: Uint8Array): Position {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Position._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Position, decoder: _.DiffDecoder): Position {
    return {
      x: decoder.nextFieldDiff(
        obj.x,
        (x) => decoder.nextFloatQuantizedDiff(x, 0.1),
      ),
      y: decoder.nextFieldDiff(
        obj.y,
        (x) => decoder.nextFloatQuantizedDiff(x, 0.1),
      ),
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
  fromJson(obj: object): Velocity {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Velocity: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      vx: _.tryParseField(() => _.parseFloat(o["vx"]), "Velocity.vx"),
      vy: _.tryParseField(() => _.parseFloat(o["vy"]), "Velocity.vy"),
    };
  },
  toJson(obj: Velocity): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["vx"] = obj.vx;
    result["vy"] = obj.vy;
    return result;
  },
  clone(obj: Velocity): Velocity {
    return {
      vx: obj.vx,
      vy: obj.vy,
    };
  },
  equals(a: Velocity, b: Velocity): boolean {
    return (
      _.equalsFloat(a.vx, b.vx) &&
      _.equalsFloat(a.vy, b.vy)
    );
  },
  encode(obj: Velocity): Uint8Array {
    const encoder = _.Encoder.create();
    Velocity._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Velocity, encoder: _.Encoder): void {
    encoder.pushFloat(obj.vx);
    encoder.pushFloat(obj.vy);
  },
  encodeDiff(a: Velocity, b: Velocity): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Velocity.equals, () => Velocity._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Velocity, b: Velocity, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "vx",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "vy",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
  },
  decode(input: Uint8Array): Velocity {
    return Velocity._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Velocity {
    return {
      vx: decoder.nextFloat(),
      vy: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: Velocity, input: Uint8Array): Velocity {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Velocity._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Velocity, decoder: _.DiffDecoder): Velocity {
    return {
      vx: decoder.nextFieldDiff(
        obj.vx,
        (x) => decoder.nextFloatDiff(x),
      ),
      vy: decoder.nextFieldDiff(
        obj.vy,
        (x) => decoder.nextFloatDiff(x),
      ),
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
  fromJson(obj: object): InventoryItem {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid InventoryItem: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      itemId: _.tryParseField(() => _.parseString(o["itemId"]), "InventoryItem.itemId"),
      name: _.tryParseField(() => _.parseString(o["name"]), "InventoryItem.name"),
      quantity: _.tryParseField(() => _.parseInt(o["quantity"], 0), "InventoryItem.quantity"),
      rarity: _.tryParseField(() => _.parseEnum(o["rarity"], ItemRarity), "InventoryItem.rarity"),
      durability: _.tryParseField(() => _.parseOptional(o["durability"], (x) => _.parseInt(x, 0)), "InventoryItem.durability"),
      enchantmentLevel: _.tryParseField(() => _.parseOptional(o["enchantmentLevel"], (x) => _.parseInt(x, 0)), "InventoryItem.enchantmentLevel"),
    };
  },
  toJson(obj: InventoryItem): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["itemId"] = obj.itemId;
    result["name"] = obj.name;
    result["quantity"] = obj.quantity;
    result["rarity"] = obj.rarity;
    if (obj.durability != null) {
      result["durability"] = obj.durability;
    }
    if (obj.enchantmentLevel != null) {
      result["enchantmentLevel"] = obj.enchantmentLevel;
    }
    return result;
  },
  clone(obj: InventoryItem): InventoryItem {
    return {
      itemId: obj.itemId,
      name: obj.name,
      quantity: obj.quantity,
      rarity: obj.rarity,
      durability: obj.durability != null ? obj.durability : undefined,
      enchantmentLevel: obj.enchantmentLevel != null ? obj.enchantmentLevel : undefined,
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
    const encoder = _.Encoder.create();
    InventoryItem._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: InventoryItem, encoder: _.Encoder): void {
    encoder.pushString(obj.itemId);
    encoder.pushString(obj.name);
    encoder.pushBoundedInt(obj.quantity, 0);
    encoder.pushEnum(ItemRarity[obj.rarity], 3);
    encoder.pushOptional(obj.durability, (x) => encoder.pushBoundedInt(x, 0));
    encoder.pushOptional(obj.enchantmentLevel, (x) => encoder.pushBoundedInt(x, 0));
  },
  encodeDiff(a: InventoryItem, b: InventoryItem): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, InventoryItem.equals, () => InventoryItem._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: InventoryItem, b: InventoryItem, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "itemId",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "name",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "quantity",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "rarity",
      (x, y) => x === y,
      (x, y) => encoder.pushEnumDiff(ItemRarity[x], ItemRarity[y], 3),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "durability",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<number>(x, y, (x) => encoder.pushBoundedInt(x, 0), (x, y) => encoder.pushBoundedIntDiff(x, y, 0)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "enchantmentLevel",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<number>(x, y, (x) => encoder.pushBoundedInt(x, 0), (x, y) => encoder.pushBoundedIntDiff(x, y, 0)),
    );
  },
  decode(input: Uint8Array): InventoryItem {
    return InventoryItem._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): InventoryItem {
    return {
      itemId: decoder.nextString(),
      name: decoder.nextString(),
      quantity: decoder.nextBoundedInt(0),
      rarity: (ItemRarity as any)[decoder.nextEnum(3)],
      durability: decoder.nextOptional(() => decoder.nextBoundedInt(0)),
      enchantmentLevel: decoder.nextOptional(() => decoder.nextBoundedInt(0)),
    };
  },
  decodeDiff(obj: InventoryItem, input: Uint8Array): InventoryItem {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => InventoryItem._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: InventoryItem, decoder: _.DiffDecoder): InventoryItem {
    return {
      itemId: decoder.nextFieldDiff(
        obj.itemId,
        (x) => decoder.nextStringDiff(x),
      ),
      name: decoder.nextFieldDiff(
        obj.name,
        (x) => decoder.nextStringDiff(x),
      ),
      quantity: decoder.nextFieldDiff(
        obj.quantity,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      rarity: decoder.nextFieldDiff(
        obj.rarity,
        (x) => (ItemRarity as any)[decoder.nextEnumDiff((ItemRarity as any)[x], 3)],
      ),
      durability: decoder.nextFieldDiff(
        obj.durability,
        (x) => decoder.nextOptionalDiff<number>(x, () => decoder.nextBoundedInt(0), (x) => decoder.nextBoundedIntDiff(x, 0)),
      ),
      enchantmentLevel: decoder.nextFieldDiff(
        obj.enchantmentLevel,
        (x) => decoder.nextOptionalDiff<number>(x, () => decoder.nextBoundedInt(0), (x) => decoder.nextBoundedIntDiff(x, 0)),
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
  fromJson(obj: object): Equipment {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Equipment: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      weapon: _.tryParseField(() => _.parseOptional(o["weapon"], (x) => _.parseEnum(x, WeaponType)), "Equipment.weapon"),
      armor: _.tryParseField(() => _.parseOptional(o["armor"], (x) => _.parseString(x)), "Equipment.armor"),
      accessory1: _.tryParseField(() => _.parseOptional(o["accessory1"], (x) => _.parseString(x)), "Equipment.accessory1"),
      accessory2: _.tryParseField(() => _.parseOptional(o["accessory2"], (x) => _.parseString(x)), "Equipment.accessory2"),
    };
  },
  toJson(obj: Equipment): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (obj.weapon != null) {
      result["weapon"] = obj.weapon;
    }
    if (obj.armor != null) {
      result["armor"] = obj.armor;
    }
    if (obj.accessory1 != null) {
      result["accessory1"] = obj.accessory1;
    }
    if (obj.accessory2 != null) {
      result["accessory2"] = obj.accessory2;
    }
    return result;
  },
  clone(obj: Equipment): Equipment {
    return {
      weapon: obj.weapon != null ? obj.weapon : undefined,
      armor: obj.armor != null ? obj.armor : undefined,
      accessory1: obj.accessory1 != null ? obj.accessory1 : undefined,
      accessory2: obj.accessory2 != null ? obj.accessory2 : undefined,
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
    const encoder = _.Encoder.create();
    Equipment._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Equipment, encoder: _.Encoder): void {
    encoder.pushOptional(obj.weapon, (x) => encoder.pushEnum(WeaponType[x], 3));
    encoder.pushOptional(obj.armor, (x) => encoder.pushString(x));
    encoder.pushOptional(obj.accessory1, (x) => encoder.pushString(x));
    encoder.pushOptional(obj.accessory2, (x) => encoder.pushString(x));
  },
  encodeDiff(a: Equipment, b: Equipment): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Equipment.equals, () => Equipment._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Equipment, b: Equipment, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "weapon",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<WeaponType>(x, y, (x) => encoder.pushEnum(WeaponType[x], 3), (x, y) => encoder.pushEnumDiff(WeaponType[x], WeaponType[y], 3)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "armor",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<string>(x, y, (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "accessory1",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<string>(x, y, (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "accessory2",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<string>(x, y, (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
  },
  decode(input: Uint8Array): Equipment {
    return Equipment._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Equipment {
    return {
      weapon: decoder.nextOptional(() => (WeaponType as any)[decoder.nextEnum(3)]),
      armor: decoder.nextOptional(() => decoder.nextString()),
      accessory1: decoder.nextOptional(() => decoder.nextString()),
      accessory2: decoder.nextOptional(() => decoder.nextString()),
    };
  },
  decodeDiff(obj: Equipment, input: Uint8Array): Equipment {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Equipment._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Equipment, decoder: _.DiffDecoder): Equipment {
    return {
      weapon: decoder.nextFieldDiff(
        obj.weapon,
        (x) => decoder.nextOptionalDiff<WeaponType>(x, () => (WeaponType as any)[decoder.nextEnum(3)], (x) => (WeaponType as any)[decoder.nextEnumDiff((WeaponType as any)[x], 3)]),
      ),
      armor: decoder.nextFieldDiff(
        obj.armor,
        (x) => decoder.nextOptionalDiff<string>(x, () => decoder.nextString(), (x) => decoder.nextStringDiff(x)),
      ),
      accessory1: decoder.nextFieldDiff(
        obj.accessory1,
        (x) => decoder.nextOptionalDiff<string>(x, () => decoder.nextString(), (x) => decoder.nextStringDiff(x)),
      ),
      accessory2: decoder.nextFieldDiff(
        obj.accessory2,
        (x) => decoder.nextOptionalDiff<string>(x, () => decoder.nextString(), (x) => decoder.nextStringDiff(x)),
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
  fromJson(obj: object): PlayerStats {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid PlayerStats: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      health: _.tryParseField(() => _.parseInt(o["health"], 0), "PlayerStats.health"),
      maxHealth: _.tryParseField(() => _.parseInt(o["maxHealth"], 0), "PlayerStats.maxHealth"),
      mana: _.tryParseField(() => _.parseInt(o["mana"], 0), "PlayerStats.mana"),
      maxMana: _.tryParseField(() => _.parseInt(o["maxMana"], 0), "PlayerStats.maxMana"),
      stamina: _.tryParseField(() => _.parseInt(o["stamina"], 0), "PlayerStats.stamina"),
      maxStamina: _.tryParseField(() => _.parseInt(o["maxStamina"], 0), "PlayerStats.maxStamina"),
      level: _.tryParseField(() => _.parseInt(o["level"], 0), "PlayerStats.level"),
      experience: _.tryParseField(() => _.parseInt(o["experience"], 0), "PlayerStats.experience"),
      strength: _.tryParseField(() => _.parseInt(o["strength"], 0), "PlayerStats.strength"),
      agility: _.tryParseField(() => _.parseInt(o["agility"], 0), "PlayerStats.agility"),
      intelligence: _.tryParseField(() => _.parseInt(o["intelligence"], 0), "PlayerStats.intelligence"),
      defense: _.tryParseField(() => _.parseInt(o["defense"], 0), "PlayerStats.defense"),
    };
  },
  toJson(obj: PlayerStats): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["health"] = obj.health;
    result["maxHealth"] = obj.maxHealth;
    result["mana"] = obj.mana;
    result["maxMana"] = obj.maxMana;
    result["stamina"] = obj.stamina;
    result["maxStamina"] = obj.maxStamina;
    result["level"] = obj.level;
    result["experience"] = obj.experience;
    result["strength"] = obj.strength;
    result["agility"] = obj.agility;
    result["intelligence"] = obj.intelligence;
    result["defense"] = obj.defense;
    return result;
  },
  clone(obj: PlayerStats): PlayerStats {
    return {
      health: obj.health,
      maxHealth: obj.maxHealth,
      mana: obj.mana,
      maxMana: obj.maxMana,
      stamina: obj.stamina,
      maxStamina: obj.maxStamina,
      level: obj.level,
      experience: obj.experience,
      strength: obj.strength,
      agility: obj.agility,
      intelligence: obj.intelligence,
      defense: obj.defense,
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
    const encoder = _.Encoder.create();
    PlayerStats._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: PlayerStats, encoder: _.Encoder): void {
    encoder.pushBoundedInt(obj.health, 0);
    encoder.pushBoundedInt(obj.maxHealth, 0);
    encoder.pushBoundedInt(obj.mana, 0);
    encoder.pushBoundedInt(obj.maxMana, 0);
    encoder.pushBoundedInt(obj.stamina, 0);
    encoder.pushBoundedInt(obj.maxStamina, 0);
    encoder.pushBoundedInt(obj.level, 0);
    encoder.pushBoundedInt(obj.experience, 0);
    encoder.pushBoundedInt(obj.strength, 0);
    encoder.pushBoundedInt(obj.agility, 0);
    encoder.pushBoundedInt(obj.intelligence, 0);
    encoder.pushBoundedInt(obj.defense, 0);
  },
  encodeDiff(a: PlayerStats, b: PlayerStats): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, PlayerStats.equals, () => PlayerStats._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: PlayerStats, b: PlayerStats, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "health",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "maxHealth",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "mana",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "maxMana",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "stamina",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "maxStamina",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "level",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "experience",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "strength",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "agility",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "intelligence",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "defense",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
  },
  decode(input: Uint8Array): PlayerStats {
    return PlayerStats._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): PlayerStats {
    return {
      health: decoder.nextBoundedInt(0),
      maxHealth: decoder.nextBoundedInt(0),
      mana: decoder.nextBoundedInt(0),
      maxMana: decoder.nextBoundedInt(0),
      stamina: decoder.nextBoundedInt(0),
      maxStamina: decoder.nextBoundedInt(0),
      level: decoder.nextBoundedInt(0),
      experience: decoder.nextBoundedInt(0),
      strength: decoder.nextBoundedInt(0),
      agility: decoder.nextBoundedInt(0),
      intelligence: decoder.nextBoundedInt(0),
      defense: decoder.nextBoundedInt(0),
    };
  },
  decodeDiff(obj: PlayerStats, input: Uint8Array): PlayerStats {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => PlayerStats._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: PlayerStats, decoder: _.DiffDecoder): PlayerStats {
    return {
      health: decoder.nextFieldDiff(
        obj.health,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      maxHealth: decoder.nextFieldDiff(
        obj.maxHealth,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      mana: decoder.nextFieldDiff(
        obj.mana,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      maxMana: decoder.nextFieldDiff(
        obj.maxMana,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      stamina: decoder.nextFieldDiff(
        obj.stamina,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      maxStamina: decoder.nextFieldDiff(
        obj.maxStamina,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      level: decoder.nextFieldDiff(
        obj.level,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      experience: decoder.nextFieldDiff(
        obj.experience,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      strength: decoder.nextFieldDiff(
        obj.strength,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      agility: decoder.nextFieldDiff(
        obj.agility,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      intelligence: decoder.nextFieldDiff(
        obj.intelligence,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      defense: decoder.nextFieldDiff(
        obj.defense,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
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
  fromJson(obj: object): ActiveEffect {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid ActiveEffect: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      effectType: _.tryParseField(() => _.parseEnum(o["effectType"], EffectType), "ActiveEffect.effectType"),
      duration: _.tryParseField(() => _.parseFloat(o["duration"]), "ActiveEffect.duration"),
      strength: _.tryParseField(() => _.parseInt(o["strength"], 0), "ActiveEffect.strength"),
      stackCount: _.tryParseField(() => _.parseInt(o["stackCount"], 0), "ActiveEffect.stackCount"),
    };
  },
  toJson(obj: ActiveEffect): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["effectType"] = obj.effectType;
    result["duration"] = obj.duration;
    result["strength"] = obj.strength;
    result["stackCount"] = obj.stackCount;
    return result;
  },
  clone(obj: ActiveEffect): ActiveEffect {
    return {
      effectType: obj.effectType,
      duration: obj.duration,
      strength: obj.strength,
      stackCount: obj.stackCount,
    };
  },
  equals(a: ActiveEffect, b: ActiveEffect): boolean {
    return (
      a.effectType === b.effectType &&
      _.equalsFloat(a.duration, b.duration) &&
      a.strength === b.strength &&
      a.stackCount === b.stackCount
    );
  },
  encode(obj: ActiveEffect): Uint8Array {
    const encoder = _.Encoder.create();
    ActiveEffect._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: ActiveEffect, encoder: _.Encoder): void {
    encoder.pushEnum(EffectType[obj.effectType], 3);
    encoder.pushFloat(obj.duration);
    encoder.pushBoundedInt(obj.strength, 0);
    encoder.pushBoundedInt(obj.stackCount, 0);
  },
  encodeDiff(a: ActiveEffect, b: ActiveEffect): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, ActiveEffect.equals, () => ActiveEffect._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: ActiveEffect, b: ActiveEffect, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "effectType",
      (x, y) => x === y,
      (x, y) => encoder.pushEnumDiff(EffectType[x], EffectType[y], 3),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "duration",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "strength",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "stackCount",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
  },
  decode(input: Uint8Array): ActiveEffect {
    return ActiveEffect._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): ActiveEffect {
    return {
      effectType: (EffectType as any)[decoder.nextEnum(3)],
      duration: decoder.nextFloat(),
      strength: decoder.nextBoundedInt(0),
      stackCount: decoder.nextBoundedInt(0),
    };
  },
  decodeDiff(obj: ActiveEffect, input: Uint8Array): ActiveEffect {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => ActiveEffect._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: ActiveEffect, decoder: _.DiffDecoder): ActiveEffect {
    return {
      effectType: decoder.nextFieldDiff(
        obj.effectType,
        (x) => (EffectType as any)[decoder.nextEnumDiff((EffectType as any)[x], 3)],
      ),
      duration: decoder.nextFieldDiff(
        obj.duration,
        (x) => decoder.nextFloatDiff(x),
      ),
      strength: decoder.nextFieldDiff(
        obj.strength,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      stackCount: decoder.nextFieldDiff(
        obj.stackCount,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
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
  fromJson(obj: object): AbilityCooldown {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid AbilityCooldown: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      abilityId: _.tryParseField(() => _.parseString(o["abilityId"]), "AbilityCooldown.abilityId"),
      abilityType: _.tryParseField(() => _.parseEnum(o["abilityType"], AbilityType), "AbilityCooldown.abilityType"),
      remainingCooldown: _.tryParseField(() => _.parseFloat(o["remainingCooldown"]), "AbilityCooldown.remainingCooldown"),
    };
  },
  toJson(obj: AbilityCooldown): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["abilityId"] = obj.abilityId;
    result["abilityType"] = obj.abilityType;
    result["remainingCooldown"] = obj.remainingCooldown;
    return result;
  },
  clone(obj: AbilityCooldown): AbilityCooldown {
    return {
      abilityId: obj.abilityId,
      abilityType: obj.abilityType,
      remainingCooldown: obj.remainingCooldown,
    };
  },
  equals(a: AbilityCooldown, b: AbilityCooldown): boolean {
    return (
      a.abilityId === b.abilityId &&
      a.abilityType === b.abilityType &&
      _.equalsFloat(a.remainingCooldown, b.remainingCooldown)
    );
  },
  encode(obj: AbilityCooldown): Uint8Array {
    const encoder = _.Encoder.create();
    AbilityCooldown._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: AbilityCooldown, encoder: _.Encoder): void {
    encoder.pushString(obj.abilityId);
    encoder.pushEnum(AbilityType[obj.abilityType], 3);
    encoder.pushFloat(obj.remainingCooldown);
  },
  encodeDiff(a: AbilityCooldown, b: AbilityCooldown): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, AbilityCooldown.equals, () => AbilityCooldown._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: AbilityCooldown, b: AbilityCooldown, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "abilityId",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "abilityType",
      (x, y) => x === y,
      (x, y) => encoder.pushEnumDiff(AbilityType[x], AbilityType[y], 3),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "remainingCooldown",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
  },
  decode(input: Uint8Array): AbilityCooldown {
    return AbilityCooldown._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): AbilityCooldown {
    return {
      abilityId: decoder.nextString(),
      abilityType: (AbilityType as any)[decoder.nextEnum(3)],
      remainingCooldown: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: AbilityCooldown, input: Uint8Array): AbilityCooldown {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => AbilityCooldown._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: AbilityCooldown, decoder: _.DiffDecoder): AbilityCooldown {
    return {
      abilityId: decoder.nextFieldDiff(
        obj.abilityId,
        (x) => decoder.nextStringDiff(x),
      ),
      abilityType: decoder.nextFieldDiff(
        obj.abilityType,
        (x) => (AbilityType as any)[decoder.nextEnumDiff((AbilityType as any)[x], 3)],
      ),
      remainingCooldown: decoder.nextFieldDiff(
        obj.remainingCooldown,
        (x) => decoder.nextFloatDiff(x),
      ),
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
  fromJson(obj: object): Player {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Player: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      playerId: _.tryParseField(() => _.parseString(o["playerId"]), "Player.playerId"),
      username: _.tryParseField(() => _.parseString(o["username"]), "Player.username"),
      team: _.tryParseField(() => _.parseOptional(o["team"], (x) => _.parseEnum(x, Team)), "Player.team"),
      status: _.tryParseField(() => _.parseEnum(o["status"], PlayerStatus), "Player.status"),
      position: _.tryParseField(() => Position.fromJson(o["position"] as Position), "Player.position"),
      velocity: _.tryParseField(() => Velocity.fromJson(o["velocity"] as Velocity), "Player.velocity"),
      rotation: _.tryParseField(() => _.parseFloat(o["rotation"]), "Player.rotation"),
      stats: _.tryParseField(() => PlayerStats.fromJson(o["stats"] as PlayerStats), "Player.stats"),
      inventory: _.tryParseField(() => _.parseArray(o["inventory"], (x) => InventoryItem.fromJson(x as InventoryItem)), "Player.inventory"),
      equipment: _.tryParseField(() => Equipment.fromJson(o["equipment"] as Equipment), "Player.equipment"),
      activeEffects: _.tryParseField(() => _.parseArray(o["activeEffects"], (x) => ActiveEffect.fromJson(x as ActiveEffect)), "Player.activeEffects"),
      abilityCooldowns: _.tryParseField(() => _.parseArray(o["abilityCooldowns"], (x) => AbilityCooldown.fromJson(x as AbilityCooldown)), "Player.abilityCooldowns"),
      kills: _.tryParseField(() => _.parseInt(o["kills"], 0), "Player.kills"),
      deaths: _.tryParseField(() => _.parseInt(o["deaths"], 0), "Player.deaths"),
      assists: _.tryParseField(() => _.parseInt(o["assists"], 0), "Player.assists"),
      gold: _.tryParseField(() => _.parseInt(o["gold"], 0), "Player.gold"),
      score: _.tryParseField(() => _.parseInt(o["score"]), "Player.score"),
      ping: _.tryParseField(() => _.parseInt(o["ping"], 0), "Player.ping"),
      isJumping: _.tryParseField(() => _.parseBoolean(o["isJumping"]), "Player.isJumping"),
      isCrouching: _.tryParseField(() => _.parseBoolean(o["isCrouching"]), "Player.isCrouching"),
      isAiming: _.tryParseField(() => _.parseBoolean(o["isAiming"]), "Player.isAiming"),
      lastDamageTime: _.tryParseField(() => _.parseOptional(o["lastDamageTime"], (x) => _.parseFloat(x)), "Player.lastDamageTime"),
      respawnTime: _.tryParseField(() => _.parseOptional(o["respawnTime"], (x) => _.parseFloat(x)), "Player.respawnTime"),
    };
  },
  toJson(obj: Player): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["playerId"] = obj.playerId;
    result["username"] = obj.username;
    if (obj.team != null) {
      result["team"] = obj.team;
    }
    result["status"] = obj.status;
    result["position"] = Position.toJson(obj.position);
    result["velocity"] = Velocity.toJson(obj.velocity);
    result["rotation"] = obj.rotation;
    result["stats"] = PlayerStats.toJson(obj.stats);
    result["inventory"] = obj.inventory.map((x) => InventoryItem.toJson(x));
    result["equipment"] = Equipment.toJson(obj.equipment);
    result["activeEffects"] = obj.activeEffects.map((x) => ActiveEffect.toJson(x));
    result["abilityCooldowns"] = obj.abilityCooldowns.map((x) => AbilityCooldown.toJson(x));
    result["kills"] = obj.kills;
    result["deaths"] = obj.deaths;
    result["assists"] = obj.assists;
    result["gold"] = obj.gold;
    result["score"] = obj.score;
    result["ping"] = obj.ping;
    result["isJumping"] = obj.isJumping;
    result["isCrouching"] = obj.isCrouching;
    result["isAiming"] = obj.isAiming;
    if (obj.lastDamageTime != null) {
      result["lastDamageTime"] = obj.lastDamageTime;
    }
    if (obj.respawnTime != null) {
      result["respawnTime"] = obj.respawnTime;
    }
    return result;
  },
  clone(obj: Player): Player {
    return {
      playerId: obj.playerId,
      username: obj.username,
      team: obj.team != null ? obj.team : undefined,
      status: obj.status,
      position: Position.clone(obj.position),
      velocity: Velocity.clone(obj.velocity),
      rotation: obj.rotation,
      stats: PlayerStats.clone(obj.stats),
      inventory: obj.inventory.map((x) => InventoryItem.clone(x)),
      equipment: Equipment.clone(obj.equipment),
      activeEffects: obj.activeEffects.map((x) => ActiveEffect.clone(x)),
      abilityCooldowns: obj.abilityCooldowns.map((x) => AbilityCooldown.clone(x)),
      kills: obj.kills,
      deaths: obj.deaths,
      assists: obj.assists,
      gold: obj.gold,
      score: obj.score,
      ping: obj.ping,
      isJumping: obj.isJumping,
      isCrouching: obj.isCrouching,
      isAiming: obj.isAiming,
      lastDamageTime: obj.lastDamageTime != null ? obj.lastDamageTime : undefined,
      respawnTime: obj.respawnTime != null ? obj.respawnTime : undefined,
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
      _.equalsFloat(a.rotation, b.rotation) &&
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
      _.equalsOptional(a.lastDamageTime, b.lastDamageTime, (x, y) => _.equalsFloat(x, y)) &&
      _.equalsOptional(a.respawnTime, b.respawnTime, (x, y) => _.equalsFloat(x, y))
    );
  },
  encode(obj: Player): Uint8Array {
    const encoder = _.Encoder.create();
    Player._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Player, encoder: _.Encoder): void {
    encoder.pushString(obj.playerId);
    encoder.pushString(obj.username);
    encoder.pushOptional(obj.team, (x) => encoder.pushEnum(Team[x], 2));
    encoder.pushEnum(PlayerStatus[obj.status], 2);
    Position._encode(obj.position, encoder);
    Velocity._encode(obj.velocity, encoder);
    encoder.pushFloat(obj.rotation);
    PlayerStats._encode(obj.stats, encoder);
    encoder.pushArray(obj.inventory, (x) => InventoryItem._encode(x, encoder));
    Equipment._encode(obj.equipment, encoder);
    encoder.pushArray(obj.activeEffects, (x) => ActiveEffect._encode(x, encoder));
    encoder.pushArray(obj.abilityCooldowns, (x) => AbilityCooldown._encode(x, encoder));
    encoder.pushBoundedInt(obj.kills, 0);
    encoder.pushBoundedInt(obj.deaths, 0);
    encoder.pushBoundedInt(obj.assists, 0);
    encoder.pushBoundedInt(obj.gold, 0);
    encoder.pushInt(obj.score);
    encoder.pushBoundedInt(obj.ping, 0);
    encoder.pushBoolean(obj.isJumping);
    encoder.pushBoolean(obj.isCrouching);
    encoder.pushBoolean(obj.isAiming);
    encoder.pushOptional(obj.lastDamageTime, (x) => encoder.pushFloat(x));
    encoder.pushOptional(obj.respawnTime, (x) => encoder.pushFloat(x));
  },
  encodeDiff(a: Player, b: Player): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Player.equals, () => Player._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Player, b: Player, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "playerId",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "username",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "team",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<Team>(x, y, (x) => encoder.pushEnum(Team[x], 2), (x, y) => encoder.pushEnumDiff(Team[x], Team[y], 2)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "status",
      (x, y) => x === y,
      (x, y) => encoder.pushEnumDiff(PlayerStatus[x], PlayerStatus[y], 2),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "position",
      (x, y) => Position.equals(x, y),
      (x, y) => Position._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "velocity",
      (x, y) => Velocity.equals(x, y),
      (x, y) => Velocity._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "rotation",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "stats",
      (x, y) => PlayerStats.equals(x, y),
      (x, y) => PlayerStats._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "inventory",
      (x, y) => _.equalsArray(x, y, (x, y) => InventoryItem.equals(x, y)),
      (x, y) => encoder.pushArrayDiff<InventoryItem>(x, y, (x, y) => InventoryItem.equals(x, y), (x) => InventoryItem._encode(x, encoder), (x, y) => InventoryItem._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "equipment",
      (x, y) => Equipment.equals(x, y),
      (x, y) => Equipment._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "activeEffects",
      (x, y) => _.equalsArray(x, y, (x, y) => ActiveEffect.equals(x, y)),
      (x, y) => encoder.pushArrayDiff<ActiveEffect>(x, y, (x, y) => ActiveEffect.equals(x, y), (x) => ActiveEffect._encode(x, encoder), (x, y) => ActiveEffect._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "abilityCooldowns",
      (x, y) => _.equalsArray(x, y, (x, y) => AbilityCooldown.equals(x, y)),
      (x, y) => encoder.pushArrayDiff<AbilityCooldown>(x, y, (x, y) => AbilityCooldown.equals(x, y), (x) => AbilityCooldown._encode(x, encoder), (x, y) => AbilityCooldown._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "kills",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "deaths",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "assists",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "gold",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "score",
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "ping",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiffValue(
      b,
      "isJumping",
      () => encoder.pushBooleanDiff(a["isJumping"], b["isJumping"]),
    );
    encoder.pushFieldDiffValue(
      b,
      "isCrouching",
      () => encoder.pushBooleanDiff(a["isCrouching"], b["isCrouching"]),
    );
    encoder.pushFieldDiffValue(
      b,
      "isAiming",
      () => encoder.pushBooleanDiff(a["isAiming"], b["isAiming"]),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "lastDamageTime",
      (x, y) => _.equalsOptional(x, y, (x, y) => _.equalsFloat(x, y)),
      (x, y) => encoder.pushOptionalDiff<number>(x, y, (x) => encoder.pushFloat(x), (x, y) => encoder.pushFloatDiff(x, y)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "respawnTime",
      (x, y) => _.equalsOptional(x, y, (x, y) => _.equalsFloat(x, y)),
      (x, y) => encoder.pushOptionalDiff<number>(x, y, (x) => encoder.pushFloat(x), (x, y) => encoder.pushFloatDiff(x, y)),
    );
  },
  decode(input: Uint8Array): Player {
    return Player._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Player {
    return {
      playerId: decoder.nextString(),
      username: decoder.nextString(),
      team: decoder.nextOptional(() => (Team as any)[decoder.nextEnum(2)]),
      status: (PlayerStatus as any)[decoder.nextEnum(2)],
      position: Position._decode(decoder),
      velocity: Velocity._decode(decoder),
      rotation: decoder.nextFloat(),
      stats: PlayerStats._decode(decoder),
      inventory: decoder.nextArray(() => InventoryItem._decode(decoder)),
      equipment: Equipment._decode(decoder),
      activeEffects: decoder.nextArray(() => ActiveEffect._decode(decoder)),
      abilityCooldowns: decoder.nextArray(() => AbilityCooldown._decode(decoder)),
      kills: decoder.nextBoundedInt(0),
      deaths: decoder.nextBoundedInt(0),
      assists: decoder.nextBoundedInt(0),
      gold: decoder.nextBoundedInt(0),
      score: decoder.nextInt(),
      ping: decoder.nextBoundedInt(0),
      isJumping: decoder.nextBoolean(),
      isCrouching: decoder.nextBoolean(),
      isAiming: decoder.nextBoolean(),
      lastDamageTime: decoder.nextOptional(() => decoder.nextFloat()),
      respawnTime: decoder.nextOptional(() => decoder.nextFloat()),
    };
  },
  decodeDiff(obj: Player, input: Uint8Array): Player {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Player._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Player, decoder: _.DiffDecoder): Player {
    return {
      playerId: decoder.nextFieldDiff(
        obj.playerId,
        (x) => decoder.nextStringDiff(x),
      ),
      username: decoder.nextFieldDiff(
        obj.username,
        (x) => decoder.nextStringDiff(x),
      ),
      team: decoder.nextFieldDiff(
        obj.team,
        (x) => decoder.nextOptionalDiff<Team>(x, () => (Team as any)[decoder.nextEnum(2)], (x) => (Team as any)[decoder.nextEnumDiff((Team as any)[x], 2)]),
      ),
      status: decoder.nextFieldDiff(
        obj.status,
        (x) => (PlayerStatus as any)[decoder.nextEnumDiff((PlayerStatus as any)[x], 2)],
      ),
      position: decoder.nextFieldDiff(
        obj.position,
        (x) => Position._decodeDiff(x, decoder),
      ),
      velocity: decoder.nextFieldDiff(
        obj.velocity,
        (x) => Velocity._decodeDiff(x, decoder),
      ),
      rotation: decoder.nextFieldDiff(
        obj.rotation,
        (x) => decoder.nextFloatDiff(x),
      ),
      stats: decoder.nextFieldDiff(
        obj.stats,
        (x) => PlayerStats._decodeDiff(x, decoder),
      ),
      inventory: decoder.nextFieldDiff(
        obj.inventory,
        (x) => decoder.nextArrayDiff<InventoryItem>(x, () => InventoryItem._decode(decoder), (x) => InventoryItem._decodeDiff(x, decoder)),
      ),
      equipment: decoder.nextFieldDiff(
        obj.equipment,
        (x) => Equipment._decodeDiff(x, decoder),
      ),
      activeEffects: decoder.nextFieldDiff(
        obj.activeEffects,
        (x) => decoder.nextArrayDiff<ActiveEffect>(x, () => ActiveEffect._decode(decoder), (x) => ActiveEffect._decodeDiff(x, decoder)),
      ),
      abilityCooldowns: decoder.nextFieldDiff(
        obj.abilityCooldowns,
        (x) => decoder.nextArrayDiff<AbilityCooldown>(x, () => AbilityCooldown._decode(decoder), (x) => AbilityCooldown._decodeDiff(x, decoder)),
      ),
      kills: decoder.nextFieldDiff(
        obj.kills,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      deaths: decoder.nextFieldDiff(
        obj.deaths,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      assists: decoder.nextFieldDiff(
        obj.assists,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      gold: decoder.nextFieldDiff(
        obj.gold,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      score: decoder.nextFieldDiff(
        obj.score,
        (x) => decoder.nextIntDiff(x),
      ),
      ping: decoder.nextFieldDiff(
        obj.ping,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      isJumping: decoder.nextBooleanDiff(obj.isJumping),
      isCrouching: decoder.nextBooleanDiff(obj.isCrouching),
      isAiming: decoder.nextBooleanDiff(obj.isAiming),
      lastDamageTime: decoder.nextFieldDiff(
        obj.lastDamageTime,
        (x) => decoder.nextOptionalDiff<number>(x, () => decoder.nextFloat(), (x) => decoder.nextFloatDiff(x)),
      ),
      respawnTime: decoder.nextFieldDiff(
        obj.respawnTime,
        (x) => decoder.nextOptionalDiff<number>(x, () => decoder.nextFloat(), (x) => decoder.nextFloatDiff(x)),
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
  fromJson(obj: object): Enemy {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Enemy: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      enemyId: _.tryParseField(() => _.parseString(o["enemyId"]), "Enemy.enemyId"),
      name: _.tryParseField(() => _.parseString(o["name"]), "Enemy.name"),
      position: _.tryParseField(() => Position.fromJson(o["position"] as Position), "Enemy.position"),
      velocity: _.tryParseField(() => Velocity.fromJson(o["velocity"] as Velocity), "Enemy.velocity"),
      health: _.tryParseField(() => _.parseInt(o["health"], 0), "Enemy.health"),
      maxHealth: _.tryParseField(() => _.parseInt(o["maxHealth"], 0), "Enemy.maxHealth"),
      level: _.tryParseField(() => _.parseInt(o["level"], 0), "Enemy.level"),
      isAggro: _.tryParseField(() => _.parseBoolean(o["isAggro"]), "Enemy.isAggro"),
      targetPlayerId: _.tryParseField(() => _.parseOptional(o["targetPlayerId"], (x) => _.parseString(x)), "Enemy.targetPlayerId"),
      lastAttackTime: _.tryParseField(() => _.parseFloat(o["lastAttackTime"]), "Enemy.lastAttackTime"),
      lootTableId: _.tryParseField(() => _.parseOptional(o["lootTableId"], (x) => _.parseString(x)), "Enemy.lootTableId"),
    };
  },
  toJson(obj: Enemy): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["enemyId"] = obj.enemyId;
    result["name"] = obj.name;
    result["position"] = Position.toJson(obj.position);
    result["velocity"] = Velocity.toJson(obj.velocity);
    result["health"] = obj.health;
    result["maxHealth"] = obj.maxHealth;
    result["level"] = obj.level;
    result["isAggro"] = obj.isAggro;
    if (obj.targetPlayerId != null) {
      result["targetPlayerId"] = obj.targetPlayerId;
    }
    result["lastAttackTime"] = obj.lastAttackTime;
    if (obj.lootTableId != null) {
      result["lootTableId"] = obj.lootTableId;
    }
    return result;
  },
  clone(obj: Enemy): Enemy {
    return {
      enemyId: obj.enemyId,
      name: obj.name,
      position: Position.clone(obj.position),
      velocity: Velocity.clone(obj.velocity),
      health: obj.health,
      maxHealth: obj.maxHealth,
      level: obj.level,
      isAggro: obj.isAggro,
      targetPlayerId: obj.targetPlayerId != null ? obj.targetPlayerId : undefined,
      lastAttackTime: obj.lastAttackTime,
      lootTableId: obj.lootTableId != null ? obj.lootTableId : undefined,
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
      _.equalsFloat(a.lastAttackTime, b.lastAttackTime) &&
      _.equalsOptional(a.lootTableId, b.lootTableId, (x, y) => x === y)
    );
  },
  encode(obj: Enemy): Uint8Array {
    const encoder = _.Encoder.create();
    Enemy._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Enemy, encoder: _.Encoder): void {
    encoder.pushString(obj.enemyId);
    encoder.pushString(obj.name);
    Position._encode(obj.position, encoder);
    Velocity._encode(obj.velocity, encoder);
    encoder.pushBoundedInt(obj.health, 0);
    encoder.pushBoundedInt(obj.maxHealth, 0);
    encoder.pushBoundedInt(obj.level, 0);
    encoder.pushBoolean(obj.isAggro);
    encoder.pushOptional(obj.targetPlayerId, (x) => encoder.pushString(x));
    encoder.pushFloat(obj.lastAttackTime);
    encoder.pushOptional(obj.lootTableId, (x) => encoder.pushString(x));
  },
  encodeDiff(a: Enemy, b: Enemy): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Enemy.equals, () => Enemy._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Enemy, b: Enemy, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "enemyId",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "name",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "position",
      (x, y) => Position.equals(x, y),
      (x, y) => Position._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "velocity",
      (x, y) => Velocity.equals(x, y),
      (x, y) => Velocity._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "health",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "maxHealth",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "level",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiffValue(
      b,
      "isAggro",
      () => encoder.pushBooleanDiff(a["isAggro"], b["isAggro"]),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "targetPlayerId",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<string>(x, y, (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "lastAttackTime",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "lootTableId",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<string>(x, y, (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
  },
  decode(input: Uint8Array): Enemy {
    return Enemy._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Enemy {
    return {
      enemyId: decoder.nextString(),
      name: decoder.nextString(),
      position: Position._decode(decoder),
      velocity: Velocity._decode(decoder),
      health: decoder.nextBoundedInt(0),
      maxHealth: decoder.nextBoundedInt(0),
      level: decoder.nextBoundedInt(0),
      isAggro: decoder.nextBoolean(),
      targetPlayerId: decoder.nextOptional(() => decoder.nextString()),
      lastAttackTime: decoder.nextFloat(),
      lootTableId: decoder.nextOptional(() => decoder.nextString()),
    };
  },
  decodeDiff(obj: Enemy, input: Uint8Array): Enemy {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Enemy._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Enemy, decoder: _.DiffDecoder): Enemy {
    return {
      enemyId: decoder.nextFieldDiff(
        obj.enemyId,
        (x) => decoder.nextStringDiff(x),
      ),
      name: decoder.nextFieldDiff(
        obj.name,
        (x) => decoder.nextStringDiff(x),
      ),
      position: decoder.nextFieldDiff(
        obj.position,
        (x) => Position._decodeDiff(x, decoder),
      ),
      velocity: decoder.nextFieldDiff(
        obj.velocity,
        (x) => Velocity._decodeDiff(x, decoder),
      ),
      health: decoder.nextFieldDiff(
        obj.health,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      maxHealth: decoder.nextFieldDiff(
        obj.maxHealth,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      level: decoder.nextFieldDiff(
        obj.level,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      isAggro: decoder.nextBooleanDiff(obj.isAggro),
      targetPlayerId: decoder.nextFieldDiff(
        obj.targetPlayerId,
        (x) => decoder.nextOptionalDiff<string>(x, () => decoder.nextString(), (x) => decoder.nextStringDiff(x)),
      ),
      lastAttackTime: decoder.nextFieldDiff(
        obj.lastAttackTime,
        (x) => decoder.nextFloatDiff(x),
      ),
      lootTableId: decoder.nextFieldDiff(
        obj.lootTableId,
        (x) => decoder.nextOptionalDiff<string>(x, () => decoder.nextString(), (x) => decoder.nextStringDiff(x)),
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
  fromJson(obj: object): Projectile {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Projectile: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      projectileId: _.tryParseField(() => _.parseString(o["projectileId"]), "Projectile.projectileId"),
      ownerId: _.tryParseField(() => _.parseString(o["ownerId"]), "Projectile.ownerId"),
      position: _.tryParseField(() => Position.fromJson(o["position"] as Position), "Projectile.position"),
      velocity: _.tryParseField(() => Velocity.fromJson(o["velocity"] as Velocity), "Projectile.velocity"),
      damage: _.tryParseField(() => _.parseInt(o["damage"], 0), "Projectile.damage"),
      penetration: _.tryParseField(() => _.parseInt(o["penetration"], 0), "Projectile.penetration"),
      timeToLive: _.tryParseField(() => _.parseFloat(o["timeToLive"]), "Projectile.timeToLive"),
      hitPlayers: _.tryParseField(() => _.parseArray(o["hitPlayers"], (x) => _.parseString(x)), "Projectile.hitPlayers"),
    };
  },
  toJson(obj: Projectile): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["projectileId"] = obj.projectileId;
    result["ownerId"] = obj.ownerId;
    result["position"] = Position.toJson(obj.position);
    result["velocity"] = Velocity.toJson(obj.velocity);
    result["damage"] = obj.damage;
    result["penetration"] = obj.penetration;
    result["timeToLive"] = obj.timeToLive;
    result["hitPlayers"] = obj.hitPlayers.map((x) => x);
    return result;
  },
  clone(obj: Projectile): Projectile {
    return {
      projectileId: obj.projectileId,
      ownerId: obj.ownerId,
      position: Position.clone(obj.position),
      velocity: Velocity.clone(obj.velocity),
      damage: obj.damage,
      penetration: obj.penetration,
      timeToLive: obj.timeToLive,
      hitPlayers: obj.hitPlayers.map((x) => x),
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
      _.equalsFloat(a.timeToLive, b.timeToLive) &&
      _.equalsArray(a.hitPlayers, b.hitPlayers, (x, y) => x === y)
    );
  },
  encode(obj: Projectile): Uint8Array {
    const encoder = _.Encoder.create();
    Projectile._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Projectile, encoder: _.Encoder): void {
    encoder.pushString(obj.projectileId);
    encoder.pushString(obj.ownerId);
    Position._encode(obj.position, encoder);
    Velocity._encode(obj.velocity, encoder);
    encoder.pushBoundedInt(obj.damage, 0);
    encoder.pushBoundedInt(obj.penetration, 0);
    encoder.pushFloat(obj.timeToLive);
    encoder.pushArray(obj.hitPlayers, (x) => encoder.pushString(x));
  },
  encodeDiff(a: Projectile, b: Projectile): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Projectile.equals, () => Projectile._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Projectile, b: Projectile, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "projectileId",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "ownerId",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "position",
      (x, y) => Position.equals(x, y),
      (x, y) => Position._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "velocity",
      (x, y) => Velocity.equals(x, y),
      (x, y) => Velocity._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "damage",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "penetration",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "timeToLive",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "hitPlayers",
      (x, y) => _.equalsArray(x, y, (x, y) => x === y),
      (x, y) => encoder.pushArrayDiff<string>(x, y, (x, y) => x === y, (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
  },
  decode(input: Uint8Array): Projectile {
    return Projectile._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Projectile {
    return {
      projectileId: decoder.nextString(),
      ownerId: decoder.nextString(),
      position: Position._decode(decoder),
      velocity: Velocity._decode(decoder),
      damage: decoder.nextBoundedInt(0),
      penetration: decoder.nextBoundedInt(0),
      timeToLive: decoder.nextFloat(),
      hitPlayers: decoder.nextArray(() => decoder.nextString()),
    };
  },
  decodeDiff(obj: Projectile, input: Uint8Array): Projectile {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Projectile._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Projectile, decoder: _.DiffDecoder): Projectile {
    return {
      projectileId: decoder.nextFieldDiff(
        obj.projectileId,
        (x) => decoder.nextStringDiff(x),
      ),
      ownerId: decoder.nextFieldDiff(
        obj.ownerId,
        (x) => decoder.nextStringDiff(x),
      ),
      position: decoder.nextFieldDiff(
        obj.position,
        (x) => Position._decodeDiff(x, decoder),
      ),
      velocity: decoder.nextFieldDiff(
        obj.velocity,
        (x) => Velocity._decodeDiff(x, decoder),
      ),
      damage: decoder.nextFieldDiff(
        obj.damage,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      penetration: decoder.nextFieldDiff(
        obj.penetration,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      timeToLive: decoder.nextFieldDiff(
        obj.timeToLive,
        (x) => decoder.nextFloatDiff(x),
      ),
      hitPlayers: decoder.nextFieldDiff(
        obj.hitPlayers,
        (x) => decoder.nextArrayDiff<string>(x, () => decoder.nextString(), (x) => decoder.nextStringDiff(x)),
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
  fromJson(obj: object): DroppedLoot {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid DroppedLoot: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      lootId: _.tryParseField(() => _.parseString(o["lootId"]), "DroppedLoot.lootId"),
      position: _.tryParseField(() => Position.fromJson(o["position"] as Position), "DroppedLoot.position"),
      item: _.tryParseField(() => InventoryItem.fromJson(o["item"] as InventoryItem), "DroppedLoot.item"),
      despawnTime: _.tryParseField(() => _.parseFloat(o["despawnTime"]), "DroppedLoot.despawnTime"),
    };
  },
  toJson(obj: DroppedLoot): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["lootId"] = obj.lootId;
    result["position"] = Position.toJson(obj.position);
    result["item"] = InventoryItem.toJson(obj.item);
    result["despawnTime"] = obj.despawnTime;
    return result;
  },
  clone(obj: DroppedLoot): DroppedLoot {
    return {
      lootId: obj.lootId,
      position: Position.clone(obj.position),
      item: InventoryItem.clone(obj.item),
      despawnTime: obj.despawnTime,
    };
  },
  equals(a: DroppedLoot, b: DroppedLoot): boolean {
    return (
      a.lootId === b.lootId &&
      Position.equals(a.position, b.position) &&
      InventoryItem.equals(a.item, b.item) &&
      _.equalsFloat(a.despawnTime, b.despawnTime)
    );
  },
  encode(obj: DroppedLoot): Uint8Array {
    const encoder = _.Encoder.create();
    DroppedLoot._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: DroppedLoot, encoder: _.Encoder): void {
    encoder.pushString(obj.lootId);
    Position._encode(obj.position, encoder);
    InventoryItem._encode(obj.item, encoder);
    encoder.pushFloat(obj.despawnTime);
  },
  encodeDiff(a: DroppedLoot, b: DroppedLoot): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, DroppedLoot.equals, () => DroppedLoot._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: DroppedLoot, b: DroppedLoot, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "lootId",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "position",
      (x, y) => Position.equals(x, y),
      (x, y) => Position._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "item",
      (x, y) => InventoryItem.equals(x, y),
      (x, y) => InventoryItem._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "despawnTime",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
  },
  decode(input: Uint8Array): DroppedLoot {
    return DroppedLoot._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): DroppedLoot {
    return {
      lootId: decoder.nextString(),
      position: Position._decode(decoder),
      item: InventoryItem._decode(decoder),
      despawnTime: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: DroppedLoot, input: Uint8Array): DroppedLoot {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => DroppedLoot._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: DroppedLoot, decoder: _.DiffDecoder): DroppedLoot {
    return {
      lootId: decoder.nextFieldDiff(
        obj.lootId,
        (x) => decoder.nextStringDiff(x),
      ),
      position: decoder.nextFieldDiff(
        obj.position,
        (x) => Position._decodeDiff(x, decoder),
      ),
      item: decoder.nextFieldDiff(
        obj.item,
        (x) => InventoryItem._decodeDiff(x, decoder),
      ),
      despawnTime: decoder.nextFieldDiff(
        obj.despawnTime,
        (x) => decoder.nextFloatDiff(x),
      ),
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
  fromJson(obj: object): WorldObject {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid WorldObject: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      objectId: _.tryParseField(() => _.parseString(o["objectId"]), "WorldObject.objectId"),
      objectType: _.tryParseField(() => _.parseString(o["objectType"]), "WorldObject.objectType"),
      position: _.tryParseField(() => Position.fromJson(o["position"] as Position), "WorldObject.position"),
      health: _.tryParseField(() => _.parseOptional(o["health"], (x) => _.parseInt(x, 0)), "WorldObject.health"),
      isDestroyed: _.tryParseField(() => _.parseBoolean(o["isDestroyed"]), "WorldObject.isDestroyed"),
      isInteractable: _.tryParseField(() => _.parseBoolean(o["isInteractable"]), "WorldObject.isInteractable"),
      interactedBy: _.tryParseField(() => _.parseOptional(o["interactedBy"], (x) => _.parseString(x)), "WorldObject.interactedBy"),
    };
  },
  toJson(obj: WorldObject): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["objectId"] = obj.objectId;
    result["objectType"] = obj.objectType;
    result["position"] = Position.toJson(obj.position);
    if (obj.health != null) {
      result["health"] = obj.health;
    }
    result["isDestroyed"] = obj.isDestroyed;
    result["isInteractable"] = obj.isInteractable;
    if (obj.interactedBy != null) {
      result["interactedBy"] = obj.interactedBy;
    }
    return result;
  },
  clone(obj: WorldObject): WorldObject {
    return {
      objectId: obj.objectId,
      objectType: obj.objectType,
      position: Position.clone(obj.position),
      health: obj.health != null ? obj.health : undefined,
      isDestroyed: obj.isDestroyed,
      isInteractable: obj.isInteractable,
      interactedBy: obj.interactedBy != null ? obj.interactedBy : undefined,
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
    const encoder = _.Encoder.create();
    WorldObject._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: WorldObject, encoder: _.Encoder): void {
    encoder.pushString(obj.objectId);
    encoder.pushString(obj.objectType);
    Position._encode(obj.position, encoder);
    encoder.pushOptional(obj.health, (x) => encoder.pushBoundedInt(x, 0));
    encoder.pushBoolean(obj.isDestroyed);
    encoder.pushBoolean(obj.isInteractable);
    encoder.pushOptional(obj.interactedBy, (x) => encoder.pushString(x));
  },
  encodeDiff(a: WorldObject, b: WorldObject): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, WorldObject.equals, () => WorldObject._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: WorldObject, b: WorldObject, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "objectId",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "objectType",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "position",
      (x, y) => Position.equals(x, y),
      (x, y) => Position._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "health",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<number>(x, y, (x) => encoder.pushBoundedInt(x, 0), (x, y) => encoder.pushBoundedIntDiff(x, y, 0)),
    );
    encoder.pushFieldDiffValue(
      b,
      "isDestroyed",
      () => encoder.pushBooleanDiff(a["isDestroyed"], b["isDestroyed"]),
    );
    encoder.pushFieldDiffValue(
      b,
      "isInteractable",
      () => encoder.pushBooleanDiff(a["isInteractable"], b["isInteractable"]),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "interactedBy",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<string>(x, y, (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
  },
  decode(input: Uint8Array): WorldObject {
    return WorldObject._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): WorldObject {
    return {
      objectId: decoder.nextString(),
      objectType: decoder.nextString(),
      position: Position._decode(decoder),
      health: decoder.nextOptional(() => decoder.nextBoundedInt(0)),
      isDestroyed: decoder.nextBoolean(),
      isInteractable: decoder.nextBoolean(),
      interactedBy: decoder.nextOptional(() => decoder.nextString()),
    };
  },
  decodeDiff(obj: WorldObject, input: Uint8Array): WorldObject {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => WorldObject._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: WorldObject, decoder: _.DiffDecoder): WorldObject {
    return {
      objectId: decoder.nextFieldDiff(
        obj.objectId,
        (x) => decoder.nextStringDiff(x),
      ),
      objectType: decoder.nextFieldDiff(
        obj.objectType,
        (x) => decoder.nextStringDiff(x),
      ),
      position: decoder.nextFieldDiff(
        obj.position,
        (x) => Position._decodeDiff(x, decoder),
      ),
      health: decoder.nextFieldDiff(
        obj.health,
        (x) => decoder.nextOptionalDiff<number>(x, () => decoder.nextBoundedInt(0), (x) => decoder.nextBoundedIntDiff(x, 0)),
      ),
      isDestroyed: decoder.nextBooleanDiff(obj.isDestroyed),
      isInteractable: decoder.nextBooleanDiff(obj.isInteractable),
      interactedBy: decoder.nextFieldDiff(
        obj.interactedBy,
        (x) => decoder.nextOptionalDiff<string>(x, () => decoder.nextString(), (x) => decoder.nextStringDiff(x)),
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
  fromJson(obj: object): MatchStats {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid MatchStats: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      totalKills: _.tryParseField(() => _.parseInt(o["totalKills"], 0), "MatchStats.totalKills"),
      totalDeaths: _.tryParseField(() => _.parseInt(o["totalDeaths"], 0), "MatchStats.totalDeaths"),
      totalDamageDealt: _.tryParseField(() => _.parseInt(o["totalDamageDealt"], 0), "MatchStats.totalDamageDealt"),
      totalHealingDone: _.tryParseField(() => _.parseInt(o["totalHealingDone"], 0), "MatchStats.totalHealingDone"),
      longestKillStreak: _.tryParseField(() => _.parseInt(o["longestKillStreak"], 0), "MatchStats.longestKillStreak"),
      matchDuration: _.tryParseField(() => _.parseFloat(o["matchDuration"]), "MatchStats.matchDuration"),
    };
  },
  toJson(obj: MatchStats): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["totalKills"] = obj.totalKills;
    result["totalDeaths"] = obj.totalDeaths;
    result["totalDamageDealt"] = obj.totalDamageDealt;
    result["totalHealingDone"] = obj.totalHealingDone;
    result["longestKillStreak"] = obj.longestKillStreak;
    result["matchDuration"] = obj.matchDuration;
    return result;
  },
  clone(obj: MatchStats): MatchStats {
    return {
      totalKills: obj.totalKills,
      totalDeaths: obj.totalDeaths,
      totalDamageDealt: obj.totalDamageDealt,
      totalHealingDone: obj.totalHealingDone,
      longestKillStreak: obj.longestKillStreak,
      matchDuration: obj.matchDuration,
    };
  },
  equals(a: MatchStats, b: MatchStats): boolean {
    return (
      a.totalKills === b.totalKills &&
      a.totalDeaths === b.totalDeaths &&
      a.totalDamageDealt === b.totalDamageDealt &&
      a.totalHealingDone === b.totalHealingDone &&
      a.longestKillStreak === b.longestKillStreak &&
      _.equalsFloat(a.matchDuration, b.matchDuration)
    );
  },
  encode(obj: MatchStats): Uint8Array {
    const encoder = _.Encoder.create();
    MatchStats._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: MatchStats, encoder: _.Encoder): void {
    encoder.pushBoundedInt(obj.totalKills, 0);
    encoder.pushBoundedInt(obj.totalDeaths, 0);
    encoder.pushBoundedInt(obj.totalDamageDealt, 0);
    encoder.pushBoundedInt(obj.totalHealingDone, 0);
    encoder.pushBoundedInt(obj.longestKillStreak, 0);
    encoder.pushFloat(obj.matchDuration);
  },
  encodeDiff(a: MatchStats, b: MatchStats): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, MatchStats.equals, () => MatchStats._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: MatchStats, b: MatchStats, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "totalKills",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "totalDeaths",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "totalDamageDealt",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "totalHealingDone",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "longestKillStreak",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "matchDuration",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
  },
  decode(input: Uint8Array): MatchStats {
    return MatchStats._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): MatchStats {
    return {
      totalKills: decoder.nextBoundedInt(0),
      totalDeaths: decoder.nextBoundedInt(0),
      totalDamageDealt: decoder.nextBoundedInt(0),
      totalHealingDone: decoder.nextBoundedInt(0),
      longestKillStreak: decoder.nextBoundedInt(0),
      matchDuration: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: MatchStats, input: Uint8Array): MatchStats {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => MatchStats._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: MatchStats, decoder: _.DiffDecoder): MatchStats {
    return {
      totalKills: decoder.nextFieldDiff(
        obj.totalKills,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      totalDeaths: decoder.nextFieldDiff(
        obj.totalDeaths,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      totalDamageDealt: decoder.nextFieldDiff(
        obj.totalDamageDealt,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      totalHealingDone: decoder.nextFieldDiff(
        obj.totalHealingDone,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      longestKillStreak: decoder.nextFieldDiff(
        obj.longestKillStreak,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      matchDuration: decoder.nextFieldDiff(
        obj.matchDuration,
        (x) => decoder.nextFloatDiff(x),
      ),
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
  fromJson(obj: object): TeamScore {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid TeamScore: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      team: _.tryParseField(() => _.parseEnum(o["team"], Team), "TeamScore.team"),
      score: _.tryParseField(() => _.parseInt(o["score"], 0), "TeamScore.score"),
      kills: _.tryParseField(() => _.parseInt(o["kills"], 0), "TeamScore.kills"),
      objectivesCaptured: _.tryParseField(() => _.parseInt(o["objectivesCaptured"], 0), "TeamScore.objectivesCaptured"),
    };
  },
  toJson(obj: TeamScore): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["team"] = obj.team;
    result["score"] = obj.score;
    result["kills"] = obj.kills;
    result["objectivesCaptured"] = obj.objectivesCaptured;
    return result;
  },
  clone(obj: TeamScore): TeamScore {
    return {
      team: obj.team,
      score: obj.score,
      kills: obj.kills,
      objectivesCaptured: obj.objectivesCaptured,
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
    const encoder = _.Encoder.create();
    TeamScore._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: TeamScore, encoder: _.Encoder): void {
    encoder.pushEnum(Team[obj.team], 2);
    encoder.pushBoundedInt(obj.score, 0);
    encoder.pushBoundedInt(obj.kills, 0);
    encoder.pushBoundedInt(obj.objectivesCaptured, 0);
  },
  encodeDiff(a: TeamScore, b: TeamScore): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, TeamScore.equals, () => TeamScore._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: TeamScore, b: TeamScore, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "team",
      (x, y) => x === y,
      (x, y) => encoder.pushEnumDiff(Team[x], Team[y], 2),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "score",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "kills",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "objectivesCaptured",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
  },
  decode(input: Uint8Array): TeamScore {
    return TeamScore._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): TeamScore {
    return {
      team: (Team as any)[decoder.nextEnum(2)],
      score: decoder.nextBoundedInt(0),
      kills: decoder.nextBoundedInt(0),
      objectivesCaptured: decoder.nextBoundedInt(0),
    };
  },
  decodeDiff(obj: TeamScore, input: Uint8Array): TeamScore {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => TeamScore._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: TeamScore, decoder: _.DiffDecoder): TeamScore {
    return {
      team: decoder.nextFieldDiff(
        obj.team,
        (x) => (Team as any)[decoder.nextEnumDiff((Team as any)[x], 2)],
      ),
      score: decoder.nextFieldDiff(
        obj.score,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      kills: decoder.nextFieldDiff(
        obj.kills,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      objectivesCaptured: decoder.nextFieldDiff(
        obj.objectivesCaptured,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
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
  fromJson(obj: object): GameSettings {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid GameSettings: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      maxPlayers: _.tryParseField(() => _.parseInt(o["maxPlayers"], 0), "GameSettings.maxPlayers"),
      friendlyFire: _.tryParseField(() => _.parseBoolean(o["friendlyFire"]), "GameSettings.friendlyFire"),
      respawnDelay: _.tryParseField(() => _.parseFloat(o["respawnDelay"]), "GameSettings.respawnDelay"),
      roundTimeLimit: _.tryParseField(() => _.parseInt(o["roundTimeLimit"], 0), "GameSettings.roundTimeLimit"),
      startingGold: _.tryParseField(() => _.parseInt(o["startingGold"], 0), "GameSettings.startingGold"),
      gravityMultiplier: _.tryParseField(() => _.parseFloat(o["gravityMultiplier"]), "GameSettings.gravityMultiplier"),
    };
  },
  toJson(obj: GameSettings): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["maxPlayers"] = obj.maxPlayers;
    result["friendlyFire"] = obj.friendlyFire;
    result["respawnDelay"] = obj.respawnDelay;
    result["roundTimeLimit"] = obj.roundTimeLimit;
    result["startingGold"] = obj.startingGold;
    result["gravityMultiplier"] = obj.gravityMultiplier;
    return result;
  },
  clone(obj: GameSettings): GameSettings {
    return {
      maxPlayers: obj.maxPlayers,
      friendlyFire: obj.friendlyFire,
      respawnDelay: obj.respawnDelay,
      roundTimeLimit: obj.roundTimeLimit,
      startingGold: obj.startingGold,
      gravityMultiplier: obj.gravityMultiplier,
    };
  },
  equals(a: GameSettings, b: GameSettings): boolean {
    return (
      a.maxPlayers === b.maxPlayers &&
      a.friendlyFire === b.friendlyFire &&
      _.equalsFloat(a.respawnDelay, b.respawnDelay) &&
      a.roundTimeLimit === b.roundTimeLimit &&
      a.startingGold === b.startingGold &&
      _.equalsFloat(a.gravityMultiplier, b.gravityMultiplier)
    );
  },
  encode(obj: GameSettings): Uint8Array {
    const encoder = _.Encoder.create();
    GameSettings._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: GameSettings, encoder: _.Encoder): void {
    encoder.pushBoundedInt(obj.maxPlayers, 0);
    encoder.pushBoolean(obj.friendlyFire);
    encoder.pushFloat(obj.respawnDelay);
    encoder.pushBoundedInt(obj.roundTimeLimit, 0);
    encoder.pushBoundedInt(obj.startingGold, 0);
    encoder.pushFloat(obj.gravityMultiplier);
  },
  encodeDiff(a: GameSettings, b: GameSettings): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, GameSettings.equals, () => GameSettings._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: GameSettings, b: GameSettings, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "maxPlayers",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiffValue(
      b,
      "friendlyFire",
      () => encoder.pushBooleanDiff(a["friendlyFire"], b["friendlyFire"]),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "respawnDelay",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "roundTimeLimit",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "startingGold",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "gravityMultiplier",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
  },
  decode(input: Uint8Array): GameSettings {
    return GameSettings._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): GameSettings {
    return {
      maxPlayers: decoder.nextBoundedInt(0),
      friendlyFire: decoder.nextBoolean(),
      respawnDelay: decoder.nextFloat(),
      roundTimeLimit: decoder.nextBoundedInt(0),
      startingGold: decoder.nextBoundedInt(0),
      gravityMultiplier: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: GameSettings, input: Uint8Array): GameSettings {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => GameSettings._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: GameSettings, decoder: _.DiffDecoder): GameSettings {
    return {
      maxPlayers: decoder.nextFieldDiff(
        obj.maxPlayers,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      friendlyFire: decoder.nextBooleanDiff(obj.friendlyFire),
      respawnDelay: decoder.nextFieldDiff(
        obj.respawnDelay,
        (x) => decoder.nextFloatDiff(x),
      ),
      roundTimeLimit: decoder.nextFieldDiff(
        obj.roundTimeLimit,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      startingGold: decoder.nextFieldDiff(
        obj.startingGold,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      gravityMultiplier: decoder.nextFieldDiff(
        obj.gravityMultiplier,
        (x) => decoder.nextFloatDiff(x),
      ),
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
  fromJson(obj: object): GameState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid GameState: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      gameId: _.tryParseField(() => _.parseString(o["gameId"]), "GameState.gameId"),
      serverTime: _.tryParseField(() => _.parseFloat(o["serverTime"]), "GameState.serverTime"),
      tickNumber: _.tryParseField(() => _.parseInt(o["tickNumber"], 0), "GameState.tickNumber"),
      round: _.tryParseField(() => _.parseInt(o["round"], 0), "GameState.round"),
      phase: _.tryParseField(() => _.parseString(o["phase"]), "GameState.phase"),
      timeRemaining: _.tryParseField(() => _.parseFloat(o["timeRemaining"]), "GameState.timeRemaining"),
      players: _.tryParseField(() => _.parseRecord(o["players"], (x) => _.parseString(x), (x) => Player.fromJson(x as Player)), "GameState.players"),
      enemies: _.tryParseField(() => _.parseRecord(o["enemies"], (x) => _.parseString(x), (x) => Enemy.fromJson(x as Enemy)), "GameState.enemies"),
      projectiles: _.tryParseField(() => _.parseRecord(o["projectiles"], (x) => _.parseString(x), (x) => Projectile.fromJson(x as Projectile)), "GameState.projectiles"),
      droppedLoot: _.tryParseField(() => _.parseRecord(o["droppedLoot"], (x) => _.parseString(x), (x) => DroppedLoot.fromJson(x as DroppedLoot)), "GameState.droppedLoot"),
      worldObjects: _.tryParseField(() => _.parseRecord(o["worldObjects"], (x) => _.parseString(x), (x) => WorldObject.fromJson(x as WorldObject)), "GameState.worldObjects"),
      teamScores: _.tryParseField(() => _.parseArray(o["teamScores"], (x) => TeamScore.fromJson(x as TeamScore)), "GameState.teamScores"),
      matchStats: _.tryParseField(() => MatchStats.fromJson(o["matchStats"] as MatchStats), "GameState.matchStats"),
      settings: _.tryParseField(() => GameSettings.fromJson(o["settings"] as GameSettings), "GameState.settings"),
      winningTeam: _.tryParseField(() => _.parseOptional(o["winningTeam"], (x) => _.parseEnum(x, Team)), "GameState.winningTeam"),
      mapName: _.tryParseField(() => _.parseString(o["mapName"]), "GameState.mapName"),
      weatherIntensity: _.tryParseField(() => _.parseFloat(o["weatherIntensity"]), "GameState.weatherIntensity"),
    };
  },
  toJson(obj: GameState): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["gameId"] = obj.gameId;
    result["serverTime"] = obj.serverTime;
    result["tickNumber"] = obj.tickNumber;
    result["round"] = obj.round;
    result["phase"] = obj.phase;
    result["timeRemaining"] = obj.timeRemaining;
    result["players"] = _.mapToObject(obj.players, (x) => Player.toJson(x));
    result["enemies"] = _.mapToObject(obj.enemies, (x) => Enemy.toJson(x));
    result["projectiles"] = _.mapToObject(obj.projectiles, (x) => Projectile.toJson(x));
    result["droppedLoot"] = _.mapToObject(obj.droppedLoot, (x) => DroppedLoot.toJson(x));
    result["worldObjects"] = _.mapToObject(obj.worldObjects, (x) => WorldObject.toJson(x));
    result["teamScores"] = obj.teamScores.map((x) => TeamScore.toJson(x));
    result["matchStats"] = MatchStats.toJson(obj.matchStats);
    result["settings"] = GameSettings.toJson(obj.settings);
    if (obj.winningTeam != null) {
      result["winningTeam"] = obj.winningTeam;
    }
    result["mapName"] = obj.mapName;
    result["weatherIntensity"] = obj.weatherIntensity;
    return result;
  },
  clone(obj: GameState): GameState {
    return {
      gameId: obj.gameId,
      serverTime: obj.serverTime,
      tickNumber: obj.tickNumber,
      round: obj.round,
      phase: obj.phase,
      timeRemaining: obj.timeRemaining,
      players: new Map([...obj.players].map(([k, v]) => [k, Player.clone(v)])),
      enemies: new Map([...obj.enemies].map(([k, v]) => [k, Enemy.clone(v)])),
      projectiles: new Map([...obj.projectiles].map(([k, v]) => [k, Projectile.clone(v)])),
      droppedLoot: new Map([...obj.droppedLoot].map(([k, v]) => [k, DroppedLoot.clone(v)])),
      worldObjects: new Map([...obj.worldObjects].map(([k, v]) => [k, WorldObject.clone(v)])),
      teamScores: obj.teamScores.map((x) => TeamScore.clone(x)),
      matchStats: MatchStats.clone(obj.matchStats),
      settings: GameSettings.clone(obj.settings),
      winningTeam: obj.winningTeam != null ? obj.winningTeam : undefined,
      mapName: obj.mapName,
      weatherIntensity: obj.weatherIntensity,
    };
  },
  equals(a: GameState, b: GameState): boolean {
    return (
      a.gameId === b.gameId &&
      _.equalsFloat(a.serverTime, b.serverTime) &&
      a.tickNumber === b.tickNumber &&
      a.round === b.round &&
      a.phase === b.phase &&
      _.equalsFloat(a.timeRemaining, b.timeRemaining) &&
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
      _.equalsFloat(a.weatherIntensity, b.weatherIntensity)
    );
  },
  encode(obj: GameState): Uint8Array {
    const encoder = _.Encoder.create();
    GameState._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: GameState, encoder: _.Encoder): void {
    encoder.pushString(obj.gameId);
    encoder.pushFloat(obj.serverTime);
    encoder.pushBoundedInt(obj.tickNumber, 0);
    encoder.pushBoundedInt(obj.round, 0);
    encoder.pushString(obj.phase);
    encoder.pushFloat(obj.timeRemaining);
    encoder.pushRecord(obj.players, (x) => encoder.pushString(x), (x) => Player._encode(x, encoder));
    encoder.pushRecord(obj.enemies, (x) => encoder.pushString(x), (x) => Enemy._encode(x, encoder));
    encoder.pushRecord(obj.projectiles, (x) => encoder.pushString(x), (x) => Projectile._encode(x, encoder));
    encoder.pushRecord(obj.droppedLoot, (x) => encoder.pushString(x), (x) => DroppedLoot._encode(x, encoder));
    encoder.pushRecord(obj.worldObjects, (x) => encoder.pushString(x), (x) => WorldObject._encode(x, encoder));
    encoder.pushArray(obj.teamScores, (x) => TeamScore._encode(x, encoder));
    MatchStats._encode(obj.matchStats, encoder);
    GameSettings._encode(obj.settings, encoder);
    encoder.pushOptional(obj.winningTeam, (x) => encoder.pushEnum(Team[x], 2));
    encoder.pushString(obj.mapName);
    encoder.pushFloat(obj.weatherIntensity);
  },
  encodeDiff(a: GameState, b: GameState): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, GameState.equals, () => GameState._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: GameState, b: GameState, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "gameId",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "serverTime",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "tickNumber",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "round",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "phase",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "timeRemaining",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "players",
      (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => Player.equals(x, y)),
      (x, y) => encoder.pushRecordDiff<string, Player>(x, y, (x, y) => Player.equals(x, y), (x) => encoder.pushString(x), (x) => Player._encode(x, encoder), (x, y) => Player._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "enemies",
      (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => Enemy.equals(x, y)),
      (x, y) => encoder.pushRecordDiff<string, Enemy>(x, y, (x, y) => Enemy.equals(x, y), (x) => encoder.pushString(x), (x) => Enemy._encode(x, encoder), (x, y) => Enemy._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "projectiles",
      (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => Projectile.equals(x, y)),
      (x, y) => encoder.pushRecordDiff<string, Projectile>(x, y, (x, y) => Projectile.equals(x, y), (x) => encoder.pushString(x), (x) => Projectile._encode(x, encoder), (x, y) => Projectile._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "droppedLoot",
      (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => DroppedLoot.equals(x, y)),
      (x, y) => encoder.pushRecordDiff<string, DroppedLoot>(x, y, (x, y) => DroppedLoot.equals(x, y), (x) => encoder.pushString(x), (x) => DroppedLoot._encode(x, encoder), (x, y) => DroppedLoot._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "worldObjects",
      (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => WorldObject.equals(x, y)),
      (x, y) => encoder.pushRecordDiff<string, WorldObject>(x, y, (x, y) => WorldObject.equals(x, y), (x) => encoder.pushString(x), (x) => WorldObject._encode(x, encoder), (x, y) => WorldObject._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "teamScores",
      (x, y) => _.equalsArray(x, y, (x, y) => TeamScore.equals(x, y)),
      (x, y) => encoder.pushArrayDiff<TeamScore>(x, y, (x, y) => TeamScore.equals(x, y), (x) => TeamScore._encode(x, encoder), (x, y) => TeamScore._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "matchStats",
      (x, y) => MatchStats.equals(x, y),
      (x, y) => MatchStats._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "settings",
      (x, y) => GameSettings.equals(x, y),
      (x, y) => GameSettings._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "winningTeam",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<Team>(x, y, (x) => encoder.pushEnum(Team[x], 2), (x, y) => encoder.pushEnumDiff(Team[x], Team[y], 2)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "mapName",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "weatherIntensity",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): GameState {
    return {
      gameId: decoder.nextString(),
      serverTime: decoder.nextFloat(),
      tickNumber: decoder.nextBoundedInt(0),
      round: decoder.nextBoundedInt(0),
      phase: decoder.nextString(),
      timeRemaining: decoder.nextFloat(),
      players: decoder.nextRecord(() => decoder.nextString(), () => Player._decode(decoder)),
      enemies: decoder.nextRecord(() => decoder.nextString(), () => Enemy._decode(decoder)),
      projectiles: decoder.nextRecord(() => decoder.nextString(), () => Projectile._decode(decoder)),
      droppedLoot: decoder.nextRecord(() => decoder.nextString(), () => DroppedLoot._decode(decoder)),
      worldObjects: decoder.nextRecord(() => decoder.nextString(), () => WorldObject._decode(decoder)),
      teamScores: decoder.nextArray(() => TeamScore._decode(decoder)),
      matchStats: MatchStats._decode(decoder),
      settings: GameSettings._decode(decoder),
      winningTeam: decoder.nextOptional(() => (Team as any)[decoder.nextEnum(2)]),
      mapName: decoder.nextString(),
      weatherIntensity: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: GameState, input: Uint8Array): GameState {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => GameState._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: GameState, decoder: _.DiffDecoder): GameState {
    return {
      gameId: decoder.nextFieldDiff(
        obj.gameId,
        (x) => decoder.nextStringDiff(x),
      ),
      serverTime: decoder.nextFieldDiff(
        obj.serverTime,
        (x) => decoder.nextFloatDiff(x),
      ),
      tickNumber: decoder.nextFieldDiff(
        obj.tickNumber,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      round: decoder.nextFieldDiff(
        obj.round,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      phase: decoder.nextFieldDiff(
        obj.phase,
        (x) => decoder.nextStringDiff(x),
      ),
      timeRemaining: decoder.nextFieldDiff(
        obj.timeRemaining,
        (x) => decoder.nextFloatDiff(x),
      ),
      players: decoder.nextFieldDiff(
        obj.players,
        (x) => decoder.nextRecordDiff<string, Player>(x, () => decoder.nextString(), () => Player._decode(decoder), (x) => Player._decodeDiff(x, decoder)),
      ),
      enemies: decoder.nextFieldDiff(
        obj.enemies,
        (x) => decoder.nextRecordDiff<string, Enemy>(x, () => decoder.nextString(), () => Enemy._decode(decoder), (x) => Enemy._decodeDiff(x, decoder)),
      ),
      projectiles: decoder.nextFieldDiff(
        obj.projectiles,
        (x) => decoder.nextRecordDiff<string, Projectile>(x, () => decoder.nextString(), () => Projectile._decode(decoder), (x) => Projectile._decodeDiff(x, decoder)),
      ),
      droppedLoot: decoder.nextFieldDiff(
        obj.droppedLoot,
        (x) => decoder.nextRecordDiff<string, DroppedLoot>(x, () => decoder.nextString(), () => DroppedLoot._decode(decoder), (x) => DroppedLoot._decodeDiff(x, decoder)),
      ),
      worldObjects: decoder.nextFieldDiff(
        obj.worldObjects,
        (x) => decoder.nextRecordDiff<string, WorldObject>(x, () => decoder.nextString(), () => WorldObject._decode(decoder), (x) => WorldObject._decodeDiff(x, decoder)),
      ),
      teamScores: decoder.nextFieldDiff(
        obj.teamScores,
        (x) => decoder.nextArrayDiff<TeamScore>(x, () => TeamScore._decode(decoder), (x) => TeamScore._decodeDiff(x, decoder)),
      ),
      matchStats: decoder.nextFieldDiff(
        obj.matchStats,
        (x) => MatchStats._decodeDiff(x, decoder),
      ),
      settings: decoder.nextFieldDiff(
        obj.settings,
        (x) => GameSettings._decodeDiff(x, decoder),
      ),
      winningTeam: decoder.nextFieldDiff(
        obj.winningTeam,
        (x) => decoder.nextOptionalDiff<Team>(x, () => (Team as any)[decoder.nextEnum(2)], (x) => (Team as any)[decoder.nextEnumDiff((Team as any)[x], 2)]),
      ),
      mapName: decoder.nextFieldDiff(
        obj.mapName,
        (x) => decoder.nextStringDiff(x),
      ),
      weatherIntensity: decoder.nextFieldDiff(
        obj.weatherIntensity,
        (x) => decoder.nextFloatDiff(x),
      ),
    };
  },
};
