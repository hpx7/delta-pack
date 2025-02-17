import * as _ from "../helpers.ts";

export type Creature = {
  team: string;
  hero: boolean;
  creatureType: string;
  equippedItemType?: string;
  health: number;
  maxHealth: number;
  visible: boolean;
  facing: string;
  moving: boolean;
  moveType: string;
  moveTargetX?: number;
  moveTargetY?: number;
  enemyTargetX?: number;
  enemyTargetY?: number;
  using?: string;
  useDirection?: string;
  takingDamage: boolean;
  frozen: boolean;
  statusEffect?: string;
  x: number;
  y: number;
  dead: boolean;
};
export type Item = {
  id: number;
  itemType: string;
  potionType?: string;
  weaponType?: string;
  x: number;
  y: number;
};
export type Effect = {
  id: number;
  creatureId?: number;
  effectType: string;
  triggerType?: string;
  ellipseEffectType?: string;
  weaponEffectType?: string;
  projectileType?: string;
  visualEffectType?: string;
  swingType?: string;
  thrustType?: string;
  weaponType?: string;
  direction?: string;
  angle?: number;
  radius?: number;
  x: number;
  y: number;
  z?: number;
};
export type Object = {
  id: number;
  team?: string;
  objectType: string;
  destructibleObjectType?: string;
  environmentObjectType?: string;
  interactiveObjectType?: string;
  active?: boolean;
  towerName?: string;
  width?: number;
  height?: number;
  angle?: number;
  durability?: number;
  maxDurability?: number;
  x: number;
  y: number;
};
export type Player = {
  id: string;
  name: string;
  team?: string;
  hero?: number;
  cents?: number;
  deck?: Deck;
  randomSlots: string[];
  hand?: Hand;
  skills?: Skills;
  restrictionZones: string;
};
export type Spectator = {
  id: string;
  name: string;
};
export type Deck = {
  card1?: string;
  card2?: string;
  card3?: string;
  card4?: string;
  card5?: string;
  card6?: string;
  card7?: string;
  card8?: string;
};
export type Hand = {
  slot1?: string;
  slot2?: string;
  slot3?: string;
  slot4?: string;
};
export type Skills = {
  slot1?: Skill;
  slot2?: Skill;
  slot3?: Skill;
  slot4?: Skill;
};
export type Skill = {
  type: string;
  inUse: boolean;
  cooldown: number;
  cooldownTotal: number;
};
export type GameInfo = {
  mode?: string;
  timeLimit?: number;
  timeElapsed?: number;
  suddenDeath?: boolean;
  winner?: string;
};
export type DraftState = {
  timeRemaining: number;
  decks: DraftDeck[];
  pairs: CardPair[];
};
export type DraftDeck = {
  playerId: string;
  card1?: string;
  card2?: string;
  card3?: string;
  card4?: string;
  card5?: string;
  card6?: string;
  card7?: string;
  card8?: string;
};
export type CardPair = {
  playerId: string;
  slot1: string;
  slot2: string;
};
export type DebugBody = {
  x: number;
  y: number;
  points: Point[];
};
export type Point = {
  x: number;
  y: number;
};
export type GameState = {
  creatures: Map<number, Creature>;
  items: Item[];
  effects: Effect[];
  objects: Object[];
  players: Player[];
  spectators: Spectator[];
  info: GameInfo;
  draft?: DraftState;
  debugBodies: DebugBody[];
};


export const Creature = {
  default(): Creature {
    return {
      team: "",
      hero: false,
      creatureType: "",
      equippedItemType: undefined,
      health: 0,
      maxHealth: 0,
      visible: false,
      facing: "",
      moving: false,
      moveType: "",
      moveTargetX: undefined,
      moveTargetY: undefined,
      enemyTargetX: undefined,
      enemyTargetY: undefined,
      using: undefined,
      useDirection: undefined,
      takingDamage: false,
      frozen: false,
      statusEffect: undefined,
      x: 0,
      y: 0,
      dead: false,
    };
  },
  validate(obj: Creature) {
    if (typeof obj !== "object") {
      return [`Invalid Creature object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.team === "string", `Invalid string: ${obj.team}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.team");
    }
    validationErrors = _.validatePrimitive(typeof obj.hero === "boolean", `Invalid boolean: ${obj.hero}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.hero");
    }
    validationErrors = _.validatePrimitive(typeof obj.creatureType === "string", `Invalid string: ${obj.creatureType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.creatureType");
    }
    validationErrors = _.validateOptional(obj.equippedItemType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.equippedItemType");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.health), `Invalid int: ${obj.health}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.health");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.maxHealth), `Invalid int: ${obj.maxHealth}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.maxHealth");
    }
    validationErrors = _.validatePrimitive(typeof obj.visible === "boolean", `Invalid boolean: ${obj.visible}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.visible");
    }
    validationErrors = _.validatePrimitive(typeof obj.facing === "string", `Invalid string: ${obj.facing}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.facing");
    }
    validationErrors = _.validatePrimitive(typeof obj.moving === "boolean", `Invalid boolean: ${obj.moving}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.moving");
    }
    validationErrors = _.validatePrimitive(typeof obj.moveType === "string", `Invalid string: ${obj.moveType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.moveType");
    }
    validationErrors = _.validateOptional(obj.moveTargetX, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.moveTargetX");
    }
    validationErrors = _.validateOptional(obj.moveTargetY, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.moveTargetY");
    }
    validationErrors = _.validateOptional(obj.enemyTargetX, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.enemyTargetX");
    }
    validationErrors = _.validateOptional(obj.enemyTargetY, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.enemyTargetY");
    }
    validationErrors = _.validateOptional(obj.using, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.using");
    }
    validationErrors = _.validateOptional(obj.useDirection, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.useDirection");
    }
    validationErrors = _.validatePrimitive(typeof obj.takingDamage === "boolean", `Invalid boolean: ${obj.takingDamage}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.takingDamage");
    }
    validationErrors = _.validatePrimitive(typeof obj.frozen === "boolean", `Invalid boolean: ${obj.frozen}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.frozen");
    }
    validationErrors = _.validateOptional(obj.statusEffect, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.statusEffect");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.y");
    }
    validationErrors = _.validatePrimitive(typeof obj.dead === "boolean", `Invalid boolean: ${obj.dead}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Creature.dead");
    }

    return validationErrors;
  },
  encode(obj: Creature, buf: _.Writer = new _.Writer()) {
    _.writeString(buf, obj.team);
    _.writeBoolean(buf, obj.hero);
    _.writeString(buf, obj.creatureType);
    _.writeOptional(buf, obj.equippedItemType, (x) => _.writeString(buf, x));
    _.writeInt(buf, obj.health);
    _.writeInt(buf, obj.maxHealth);
    _.writeBoolean(buf, obj.visible);
    _.writeString(buf, obj.facing);
    _.writeBoolean(buf, obj.moving);
    _.writeString(buf, obj.moveType);
    _.writeOptional(buf, obj.moveTargetX, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.moveTargetY, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.enemyTargetX, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.enemyTargetY, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.using, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.useDirection, (x) => _.writeString(buf, x));
    _.writeBoolean(buf, obj.takingDamage);
    _.writeBoolean(buf, obj.frozen);
    _.writeOptional(buf, obj.statusEffect, (x) => _.writeString(buf, x));
    _.writeInt(buf, obj.x);
    _.writeInt(buf, obj.y);
    _.writeBoolean(buf, obj.dead);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Creature>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.team !== _.NO_DIFF);
    if (obj.team !== _.NO_DIFF) {
      _.writeString(buf, obj.team);
    }
    tracker.push(obj.hero !== _.NO_DIFF);
    if (obj.hero !== _.NO_DIFF) {
      _.writeBoolean(buf, obj.hero);
    }
    tracker.push(obj.creatureType !== _.NO_DIFF);
    if (obj.creatureType !== _.NO_DIFF) {
      _.writeString(buf, obj.creatureType);
    }
    tracker.push(obj.equippedItemType !== _.NO_DIFF);
    if (obj.equippedItemType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.equippedItemType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.health !== _.NO_DIFF);
    if (obj.health !== _.NO_DIFF) {
      _.writeInt(buf, obj.health);
    }
    tracker.push(obj.maxHealth !== _.NO_DIFF);
    if (obj.maxHealth !== _.NO_DIFF) {
      _.writeInt(buf, obj.maxHealth);
    }
    tracker.push(obj.visible !== _.NO_DIFF);
    if (obj.visible !== _.NO_DIFF) {
      _.writeBoolean(buf, obj.visible);
    }
    tracker.push(obj.facing !== _.NO_DIFF);
    if (obj.facing !== _.NO_DIFF) {
      _.writeString(buf, obj.facing);
    }
    tracker.push(obj.moving !== _.NO_DIFF);
    if (obj.moving !== _.NO_DIFF) {
      _.writeBoolean(buf, obj.moving);
    }
    tracker.push(obj.moveType !== _.NO_DIFF);
    if (obj.moveType !== _.NO_DIFF) {
      _.writeString(buf, obj.moveType);
    }
    tracker.push(obj.moveTargetX !== _.NO_DIFF);
    if (obj.moveTargetX !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.moveTargetX, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.moveTargetY !== _.NO_DIFF);
    if (obj.moveTargetY !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.moveTargetY, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.enemyTargetX !== _.NO_DIFF);
    if (obj.enemyTargetX !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.enemyTargetX, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.enemyTargetY !== _.NO_DIFF);
    if (obj.enemyTargetY !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.enemyTargetY, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.using !== _.NO_DIFF);
    if (obj.using !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.using, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.useDirection !== _.NO_DIFF);
    if (obj.useDirection !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.useDirection, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.takingDamage !== _.NO_DIFF);
    if (obj.takingDamage !== _.NO_DIFF) {
      _.writeBoolean(buf, obj.takingDamage);
    }
    tracker.push(obj.frozen !== _.NO_DIFF);
    if (obj.frozen !== _.NO_DIFF) {
      _.writeBoolean(buf, obj.frozen);
    }
    tracker.push(obj.statusEffect !== _.NO_DIFF);
    if (obj.statusEffect !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.statusEffect, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeInt(buf, obj.y);
    }
    tracker.push(obj.dead !== _.NO_DIFF);
    if (obj.dead !== _.NO_DIFF) {
      _.writeBoolean(buf, obj.dead);
    }
    return buf;
  },
  decode(buf: _.Reader): Creature {
    const sb = buf;
    return {
      team: _.parseString(sb),
      hero: _.parseBoolean(sb),
      creatureType: _.parseString(sb),
      equippedItemType: _.parseOptional(sb, () => _.parseString(sb)),
      health: _.parseInt(sb),
      maxHealth: _.parseInt(sb),
      visible: _.parseBoolean(sb),
      facing: _.parseString(sb),
      moving: _.parseBoolean(sb),
      moveType: _.parseString(sb),
      moveTargetX: _.parseOptional(sb, () => _.parseInt(sb)),
      moveTargetY: _.parseOptional(sb, () => _.parseInt(sb)),
      enemyTargetX: _.parseOptional(sb, () => _.parseInt(sb)),
      enemyTargetY: _.parseOptional(sb, () => _.parseInt(sb)),
      using: _.parseOptional(sb, () => _.parseString(sb)),
      useDirection: _.parseOptional(sb, () => _.parseString(sb)),
      takingDamage: _.parseBoolean(sb),
      frozen: _.parseBoolean(sb),
      statusEffect: _.parseOptional(sb, () => _.parseString(sb)),
      x: _.parseInt(sb),
      y: _.parseInt(sb),
      dead: _.parseBoolean(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Creature> {
    const sb = buf;
    return {
      team: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      hero: tracker.next() ? _.parseBoolean(sb) : _.NO_DIFF,
      creatureType: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      equippedItemType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      health: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      maxHealth: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      visible: tracker.next() ? _.parseBoolean(sb) : _.NO_DIFF,
      facing: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      moving: tracker.next() ? _.parseBoolean(sb) : _.NO_DIFF,
      moveType: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      moveTargetX: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      moveTargetY: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      enemyTargetX: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      enemyTargetY: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      using: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      useDirection: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      takingDamage: tracker.next() ? _.parseBoolean(sb) : _.NO_DIFF,
      frozen: tracker.next() ? _.parseBoolean(sb) : _.NO_DIFF,
      statusEffect: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      x: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      dead: tracker.next() ? _.parseBoolean(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Creature, b: Creature): _.DeepPartial<Creature> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Creature> =  {
      team: _.diffPrimitive(a.team, b.team),
      hero: _.diffPrimitive(a.hero, b.hero),
      creatureType: _.diffPrimitive(a.creatureType, b.creatureType),
      equippedItemType: _.diffOptional(a.equippedItemType, b.equippedItemType, (x, y) => _.diffPrimitive(x, y)),
      health: _.diffPrimitive(a.health, b.health),
      maxHealth: _.diffPrimitive(a.maxHealth, b.maxHealth),
      visible: _.diffPrimitive(a.visible, b.visible),
      facing: _.diffPrimitive(a.facing, b.facing),
      moving: _.diffPrimitive(a.moving, b.moving),
      moveType: _.diffPrimitive(a.moveType, b.moveType),
      moveTargetX: _.diffOptional(a.moveTargetX, b.moveTargetX, (x, y) => _.diffPrimitive(x, y)),
      moveTargetY: _.diffOptional(a.moveTargetY, b.moveTargetY, (x, y) => _.diffPrimitive(x, y)),
      enemyTargetX: _.diffOptional(a.enemyTargetX, b.enemyTargetX, (x, y) => _.diffPrimitive(x, y)),
      enemyTargetY: _.diffOptional(a.enemyTargetY, b.enemyTargetY, (x, y) => _.diffPrimitive(x, y)),
      using: _.diffOptional(a.using, b.using, (x, y) => _.diffPrimitive(x, y)),
      useDirection: _.diffOptional(a.useDirection, b.useDirection, (x, y) => _.diffPrimitive(x, y)),
      takingDamage: _.diffPrimitive(a.takingDamage, b.takingDamage),
      frozen: _.diffPrimitive(a.frozen, b.frozen),
      statusEffect: _.diffOptional(a.statusEffect, b.statusEffect, (x, y) => _.diffPrimitive(x, y)),
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
      dead: _.diffPrimitive(a.dead, b.dead),
    };
    return diff.team === _.NO_DIFF && diff.hero === _.NO_DIFF && diff.creatureType === _.NO_DIFF && diff.equippedItemType === _.NO_DIFF && diff.health === _.NO_DIFF && diff.maxHealth === _.NO_DIFF && diff.visible === _.NO_DIFF && diff.facing === _.NO_DIFF && diff.moving === _.NO_DIFF && diff.moveType === _.NO_DIFF && diff.moveTargetX === _.NO_DIFF && diff.moveTargetY === _.NO_DIFF && diff.enemyTargetX === _.NO_DIFF && diff.enemyTargetY === _.NO_DIFF && diff.using === _.NO_DIFF && diff.useDirection === _.NO_DIFF && diff.takingDamage === _.NO_DIFF && diff.frozen === _.NO_DIFF && diff.statusEffect === _.NO_DIFF && diff.x === _.NO_DIFF && diff.y === _.NO_DIFF && diff.dead === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Creature, diff: _.DeepPartial<Creature> | typeof _.NO_DIFF): Creature {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.team = diff.team === _.NO_DIFF ? obj.team : diff.team;
    obj.hero = diff.hero === _.NO_DIFF ? obj.hero : diff.hero;
    obj.creatureType = diff.creatureType === _.NO_DIFF ? obj.creatureType : diff.creatureType;
    obj.equippedItemType = diff.equippedItemType === _.NO_DIFF ? obj.equippedItemType : _.patchOptional(obj.equippedItemType, diff.equippedItemType, (a, b) => b);
    obj.health = diff.health === _.NO_DIFF ? obj.health : diff.health;
    obj.maxHealth = diff.maxHealth === _.NO_DIFF ? obj.maxHealth : diff.maxHealth;
    obj.visible = diff.visible === _.NO_DIFF ? obj.visible : diff.visible;
    obj.facing = diff.facing === _.NO_DIFF ? obj.facing : diff.facing;
    obj.moving = diff.moving === _.NO_DIFF ? obj.moving : diff.moving;
    obj.moveType = diff.moveType === _.NO_DIFF ? obj.moveType : diff.moveType;
    obj.moveTargetX = diff.moveTargetX === _.NO_DIFF ? obj.moveTargetX : _.patchOptional(obj.moveTargetX, diff.moveTargetX, (a, b) => b);
    obj.moveTargetY = diff.moveTargetY === _.NO_DIFF ? obj.moveTargetY : _.patchOptional(obj.moveTargetY, diff.moveTargetY, (a, b) => b);
    obj.enemyTargetX = diff.enemyTargetX === _.NO_DIFF ? obj.enemyTargetX : _.patchOptional(obj.enemyTargetX, diff.enemyTargetX, (a, b) => b);
    obj.enemyTargetY = diff.enemyTargetY === _.NO_DIFF ? obj.enemyTargetY : _.patchOptional(obj.enemyTargetY, diff.enemyTargetY, (a, b) => b);
    obj.using = diff.using === _.NO_DIFF ? obj.using : _.patchOptional(obj.using, diff.using, (a, b) => b);
    obj.useDirection = diff.useDirection === _.NO_DIFF ? obj.useDirection : _.patchOptional(obj.useDirection, diff.useDirection, (a, b) => b);
    obj.takingDamage = diff.takingDamage === _.NO_DIFF ? obj.takingDamage : diff.takingDamage;
    obj.frozen = diff.frozen === _.NO_DIFF ? obj.frozen : diff.frozen;
    obj.statusEffect = diff.statusEffect === _.NO_DIFF ? obj.statusEffect : _.patchOptional(obj.statusEffect, diff.statusEffect, (a, b) => b);
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    obj.dead = diff.dead === _.NO_DIFF ? obj.dead : diff.dead;
    return obj;
  },
};

export const Item = {
  default(): Item {
    return {
      id: 0,
      itemType: "",
      potionType: undefined,
      weaponType: undefined,
      x: 0,
      y: 0,
    };
  },
  validate(obj: Item) {
    if (typeof obj !== "object") {
      return [`Invalid Item object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Item.id");
    }
    validationErrors = _.validatePrimitive(typeof obj.itemType === "string", `Invalid string: ${obj.itemType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Item.itemType");
    }
    validationErrors = _.validateOptional(obj.potionType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Item.potionType");
    }
    validationErrors = _.validateOptional(obj.weaponType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Item.weaponType");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Item.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Item.y");
    }

    return validationErrors;
  },
  encode(obj: Item, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.id);
    _.writeString(buf, obj.itemType);
    _.writeOptional(buf, obj.potionType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.weaponType, (x) => _.writeString(buf, x));
    _.writeInt(buf, obj.x);
    _.writeInt(buf, obj.y);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Item>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      _.writeInt(buf, obj.id);
    }
    tracker.push(obj.itemType !== _.NO_DIFF);
    if (obj.itemType !== _.NO_DIFF) {
      _.writeString(buf, obj.itemType);
    }
    tracker.push(obj.potionType !== _.NO_DIFF);
    if (obj.potionType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.potionType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.weaponType !== _.NO_DIFF);
    if (obj.weaponType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.weaponType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeInt(buf, obj.y);
    }
    return buf;
  },
  decode(buf: _.Reader): Item {
    const sb = buf;
    return {
      id: _.parseInt(sb),
      itemType: _.parseString(sb),
      potionType: _.parseOptional(sb, () => _.parseString(sb)),
      weaponType: _.parseOptional(sb, () => _.parseString(sb)),
      x: _.parseInt(sb),
      y: _.parseInt(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Item> {
    const sb = buf;
    return {
      id: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      itemType: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      potionType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      weaponType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      x: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Item, b: Item): _.DeepPartial<Item> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Item> =  {
      id: _.diffPrimitive(a.id, b.id),
      itemType: _.diffPrimitive(a.itemType, b.itemType),
      potionType: _.diffOptional(a.potionType, b.potionType, (x, y) => _.diffPrimitive(x, y)),
      weaponType: _.diffOptional(a.weaponType, b.weaponType, (x, y) => _.diffPrimitive(x, y)),
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
    };
    return diff.id === _.NO_DIFF && diff.itemType === _.NO_DIFF && diff.potionType === _.NO_DIFF && diff.weaponType === _.NO_DIFF && diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Item, diff: _.DeepPartial<Item> | typeof _.NO_DIFF): Item {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.id = diff.id === _.NO_DIFF ? obj.id : diff.id;
    obj.itemType = diff.itemType === _.NO_DIFF ? obj.itemType : diff.itemType;
    obj.potionType = diff.potionType === _.NO_DIFF ? obj.potionType : _.patchOptional(obj.potionType, diff.potionType, (a, b) => b);
    obj.weaponType = diff.weaponType === _.NO_DIFF ? obj.weaponType : _.patchOptional(obj.weaponType, diff.weaponType, (a, b) => b);
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    return obj;
  },
};

export const Effect = {
  default(): Effect {
    return {
      id: 0,
      creatureId: undefined,
      effectType: "",
      triggerType: undefined,
      ellipseEffectType: undefined,
      weaponEffectType: undefined,
      projectileType: undefined,
      visualEffectType: undefined,
      swingType: undefined,
      thrustType: undefined,
      weaponType: undefined,
      direction: undefined,
      angle: undefined,
      radius: undefined,
      x: 0,
      y: 0,
      z: undefined,
    };
  },
  validate(obj: Effect) {
    if (typeof obj !== "object") {
      return [`Invalid Effect object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.id");
    }
    validationErrors = _.validateOptional(obj.creatureId, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.creatureId");
    }
    validationErrors = _.validatePrimitive(typeof obj.effectType === "string", `Invalid string: ${obj.effectType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.effectType");
    }
    validationErrors = _.validateOptional(obj.triggerType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.triggerType");
    }
    validationErrors = _.validateOptional(obj.ellipseEffectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.ellipseEffectType");
    }
    validationErrors = _.validateOptional(obj.weaponEffectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.weaponEffectType");
    }
    validationErrors = _.validateOptional(obj.projectileType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.projectileType");
    }
    validationErrors = _.validateOptional(obj.visualEffectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.visualEffectType");
    }
    validationErrors = _.validateOptional(obj.swingType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.swingType");
    }
    validationErrors = _.validateOptional(obj.thrustType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.thrustType");
    }
    validationErrors = _.validateOptional(obj.weaponType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.weaponType");
    }
    validationErrors = _.validateOptional(obj.direction, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.direction");
    }
    validationErrors = _.validateOptional(obj.angle, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.angle");
    }
    validationErrors = _.validateOptional(obj.radius, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.radius");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.y");
    }
    validationErrors = _.validateOptional(obj.z, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Effect.z");
    }

    return validationErrors;
  },
  encode(obj: Effect, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.id);
    _.writeOptional(buf, obj.creatureId, (x) => _.writeInt(buf, x));
    _.writeString(buf, obj.effectType);
    _.writeOptional(buf, obj.triggerType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.ellipseEffectType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.weaponEffectType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.projectileType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.visualEffectType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.swingType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.thrustType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.weaponType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.direction, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.angle, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.radius, (x) => _.writeInt(buf, x));
    _.writeInt(buf, obj.x);
    _.writeInt(buf, obj.y);
    _.writeOptional(buf, obj.z, (x) => _.writeInt(buf, x));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Effect>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      _.writeInt(buf, obj.id);
    }
    tracker.push(obj.creatureId !== _.NO_DIFF);
    if (obj.creatureId !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.creatureId, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.effectType !== _.NO_DIFF);
    if (obj.effectType !== _.NO_DIFF) {
      _.writeString(buf, obj.effectType);
    }
    tracker.push(obj.triggerType !== _.NO_DIFF);
    if (obj.triggerType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.triggerType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.ellipseEffectType !== _.NO_DIFF);
    if (obj.ellipseEffectType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.ellipseEffectType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.weaponEffectType !== _.NO_DIFF);
    if (obj.weaponEffectType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.weaponEffectType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.projectileType !== _.NO_DIFF);
    if (obj.projectileType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.projectileType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.visualEffectType !== _.NO_DIFF);
    if (obj.visualEffectType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.visualEffectType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.swingType !== _.NO_DIFF);
    if (obj.swingType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.swingType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.thrustType !== _.NO_DIFF);
    if (obj.thrustType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.thrustType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.weaponType !== _.NO_DIFF);
    if (obj.weaponType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.weaponType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.direction !== _.NO_DIFF);
    if (obj.direction !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.direction, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.angle !== _.NO_DIFF);
    if (obj.angle !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.angle, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.radius !== _.NO_DIFF);
    if (obj.radius !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.radius, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeInt(buf, obj.y);
    }
    tracker.push(obj.z !== _.NO_DIFF);
    if (obj.z !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.z, (x) => _.writeInt(buf, x));
    }
    return buf;
  },
  decode(buf: _.Reader): Effect {
    const sb = buf;
    return {
      id: _.parseInt(sb),
      creatureId: _.parseOptional(sb, () => _.parseInt(sb)),
      effectType: _.parseString(sb),
      triggerType: _.parseOptional(sb, () => _.parseString(sb)),
      ellipseEffectType: _.parseOptional(sb, () => _.parseString(sb)),
      weaponEffectType: _.parseOptional(sb, () => _.parseString(sb)),
      projectileType: _.parseOptional(sb, () => _.parseString(sb)),
      visualEffectType: _.parseOptional(sb, () => _.parseString(sb)),
      swingType: _.parseOptional(sb, () => _.parseString(sb)),
      thrustType: _.parseOptional(sb, () => _.parseString(sb)),
      weaponType: _.parseOptional(sb, () => _.parseString(sb)),
      direction: _.parseOptional(sb, () => _.parseString(sb)),
      angle: _.parseOptional(sb, () => _.parseInt(sb)),
      radius: _.parseOptional(sb, () => _.parseInt(sb)),
      x: _.parseInt(sb),
      y: _.parseInt(sb),
      z: _.parseOptional(sb, () => _.parseInt(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Effect> {
    const sb = buf;
    return {
      id: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      creatureId: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      effectType: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      triggerType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      ellipseEffectType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      weaponEffectType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      projectileType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      visualEffectType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      swingType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      thrustType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      weaponType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      direction: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      angle: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      radius: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      x: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      z: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
    };
  },
  computeDiff(a: Effect, b: Effect): _.DeepPartial<Effect> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Effect> =  {
      id: _.diffPrimitive(a.id, b.id),
      creatureId: _.diffOptional(a.creatureId, b.creatureId, (x, y) => _.diffPrimitive(x, y)),
      effectType: _.diffPrimitive(a.effectType, b.effectType),
      triggerType: _.diffOptional(a.triggerType, b.triggerType, (x, y) => _.diffPrimitive(x, y)),
      ellipseEffectType: _.diffOptional(a.ellipseEffectType, b.ellipseEffectType, (x, y) => _.diffPrimitive(x, y)),
      weaponEffectType: _.diffOptional(a.weaponEffectType, b.weaponEffectType, (x, y) => _.diffPrimitive(x, y)),
      projectileType: _.diffOptional(a.projectileType, b.projectileType, (x, y) => _.diffPrimitive(x, y)),
      visualEffectType: _.diffOptional(a.visualEffectType, b.visualEffectType, (x, y) => _.diffPrimitive(x, y)),
      swingType: _.diffOptional(a.swingType, b.swingType, (x, y) => _.diffPrimitive(x, y)),
      thrustType: _.diffOptional(a.thrustType, b.thrustType, (x, y) => _.diffPrimitive(x, y)),
      weaponType: _.diffOptional(a.weaponType, b.weaponType, (x, y) => _.diffPrimitive(x, y)),
      direction: _.diffOptional(a.direction, b.direction, (x, y) => _.diffPrimitive(x, y)),
      angle: _.diffOptional(a.angle, b.angle, (x, y) => _.diffPrimitive(x, y)),
      radius: _.diffOptional(a.radius, b.radius, (x, y) => _.diffPrimitive(x, y)),
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
      z: _.diffOptional(a.z, b.z, (x, y) => _.diffPrimitive(x, y)),
    };
    return diff.id === _.NO_DIFF && diff.creatureId === _.NO_DIFF && diff.effectType === _.NO_DIFF && diff.triggerType === _.NO_DIFF && diff.ellipseEffectType === _.NO_DIFF && diff.weaponEffectType === _.NO_DIFF && diff.projectileType === _.NO_DIFF && diff.visualEffectType === _.NO_DIFF && diff.swingType === _.NO_DIFF && diff.thrustType === _.NO_DIFF && diff.weaponType === _.NO_DIFF && diff.direction === _.NO_DIFF && diff.angle === _.NO_DIFF && diff.radius === _.NO_DIFF && diff.x === _.NO_DIFF && diff.y === _.NO_DIFF && diff.z === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Effect, diff: _.DeepPartial<Effect> | typeof _.NO_DIFF): Effect {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.id = diff.id === _.NO_DIFF ? obj.id : diff.id;
    obj.creatureId = diff.creatureId === _.NO_DIFF ? obj.creatureId : _.patchOptional(obj.creatureId, diff.creatureId, (a, b) => b);
    obj.effectType = diff.effectType === _.NO_DIFF ? obj.effectType : diff.effectType;
    obj.triggerType = diff.triggerType === _.NO_DIFF ? obj.triggerType : _.patchOptional(obj.triggerType, diff.triggerType, (a, b) => b);
    obj.ellipseEffectType = diff.ellipseEffectType === _.NO_DIFF ? obj.ellipseEffectType : _.patchOptional(obj.ellipseEffectType, diff.ellipseEffectType, (a, b) => b);
    obj.weaponEffectType = diff.weaponEffectType === _.NO_DIFF ? obj.weaponEffectType : _.patchOptional(obj.weaponEffectType, diff.weaponEffectType, (a, b) => b);
    obj.projectileType = diff.projectileType === _.NO_DIFF ? obj.projectileType : _.patchOptional(obj.projectileType, diff.projectileType, (a, b) => b);
    obj.visualEffectType = diff.visualEffectType === _.NO_DIFF ? obj.visualEffectType : _.patchOptional(obj.visualEffectType, diff.visualEffectType, (a, b) => b);
    obj.swingType = diff.swingType === _.NO_DIFF ? obj.swingType : _.patchOptional(obj.swingType, diff.swingType, (a, b) => b);
    obj.thrustType = diff.thrustType === _.NO_DIFF ? obj.thrustType : _.patchOptional(obj.thrustType, diff.thrustType, (a, b) => b);
    obj.weaponType = diff.weaponType === _.NO_DIFF ? obj.weaponType : _.patchOptional(obj.weaponType, diff.weaponType, (a, b) => b);
    obj.direction = diff.direction === _.NO_DIFF ? obj.direction : _.patchOptional(obj.direction, diff.direction, (a, b) => b);
    obj.angle = diff.angle === _.NO_DIFF ? obj.angle : _.patchOptional(obj.angle, diff.angle, (a, b) => b);
    obj.radius = diff.radius === _.NO_DIFF ? obj.radius : _.patchOptional(obj.radius, diff.radius, (a, b) => b);
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    obj.z = diff.z === _.NO_DIFF ? obj.z : _.patchOptional(obj.z, diff.z, (a, b) => b);
    return obj;
  },
};

export const Object = {
  default(): Object {
    return {
      id: 0,
      team: undefined,
      objectType: "",
      destructibleObjectType: undefined,
      environmentObjectType: undefined,
      interactiveObjectType: undefined,
      active: undefined,
      towerName: undefined,
      width: undefined,
      height: undefined,
      angle: undefined,
      durability: undefined,
      maxDurability: undefined,
      x: 0,
      y: 0,
    };
  },
  validate(obj: Object) {
    if (typeof obj !== "object") {
      return [`Invalid Object object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.id), `Invalid int: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.id");
    }
    validationErrors = _.validateOptional(obj.team, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.team");
    }
    validationErrors = _.validatePrimitive(typeof obj.objectType === "string", `Invalid string: ${obj.objectType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.objectType");
    }
    validationErrors = _.validateOptional(obj.destructibleObjectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.destructibleObjectType");
    }
    validationErrors = _.validateOptional(obj.environmentObjectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.environmentObjectType");
    }
    validationErrors = _.validateOptional(obj.interactiveObjectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.interactiveObjectType");
    }
    validationErrors = _.validateOptional(obj.active, (x) => _.validatePrimitive(typeof x === "boolean", `Invalid boolean: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.active");
    }
    validationErrors = _.validateOptional(obj.towerName, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.towerName");
    }
    validationErrors = _.validateOptional(obj.width, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.width");
    }
    validationErrors = _.validateOptional(obj.height, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.height");
    }
    validationErrors = _.validateOptional(obj.angle, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.angle");
    }
    validationErrors = _.validateOptional(obj.durability, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.durability");
    }
    validationErrors = _.validateOptional(obj.maxDurability, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.maxDurability");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Object.y");
    }

    return validationErrors;
  },
  encode(obj: Object, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.id);
    _.writeOptional(buf, obj.team, (x) => _.writeString(buf, x));
    _.writeString(buf, obj.objectType);
    _.writeOptional(buf, obj.destructibleObjectType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.environmentObjectType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.interactiveObjectType, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.active, (x) => _.writeBoolean(buf, x));
    _.writeOptional(buf, obj.towerName, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.width, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.height, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.angle, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.durability, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.maxDurability, (x) => _.writeInt(buf, x));
    _.writeInt(buf, obj.x);
    _.writeInt(buf, obj.y);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Object>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      _.writeInt(buf, obj.id);
    }
    tracker.push(obj.team !== _.NO_DIFF);
    if (obj.team !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.team, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.objectType !== _.NO_DIFF);
    if (obj.objectType !== _.NO_DIFF) {
      _.writeString(buf, obj.objectType);
    }
    tracker.push(obj.destructibleObjectType !== _.NO_DIFF);
    if (obj.destructibleObjectType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.destructibleObjectType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.environmentObjectType !== _.NO_DIFF);
    if (obj.environmentObjectType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.environmentObjectType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.interactiveObjectType !== _.NO_DIFF);
    if (obj.interactiveObjectType !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.interactiveObjectType, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.active !== _.NO_DIFF);
    if (obj.active !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.active, (x) => _.writeBoolean(buf, x));
    }
    tracker.push(obj.towerName !== _.NO_DIFF);
    if (obj.towerName !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.towerName, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.width !== _.NO_DIFF);
    if (obj.width !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.width, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.height !== _.NO_DIFF);
    if (obj.height !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.height, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.angle !== _.NO_DIFF);
    if (obj.angle !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.angle, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.durability !== _.NO_DIFF);
    if (obj.durability !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.durability, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.maxDurability !== _.NO_DIFF);
    if (obj.maxDurability !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.maxDurability, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeInt(buf, obj.y);
    }
    return buf;
  },
  decode(buf: _.Reader): Object {
    const sb = buf;
    return {
      id: _.parseInt(sb),
      team: _.parseOptional(sb, () => _.parseString(sb)),
      objectType: _.parseString(sb),
      destructibleObjectType: _.parseOptional(sb, () => _.parseString(sb)),
      environmentObjectType: _.parseOptional(sb, () => _.parseString(sb)),
      interactiveObjectType: _.parseOptional(sb, () => _.parseString(sb)),
      active: _.parseOptional(sb, () => _.parseBoolean(sb)),
      towerName: _.parseOptional(sb, () => _.parseString(sb)),
      width: _.parseOptional(sb, () => _.parseInt(sb)),
      height: _.parseOptional(sb, () => _.parseInt(sb)),
      angle: _.parseOptional(sb, () => _.parseInt(sb)),
      durability: _.parseOptional(sb, () => _.parseInt(sb)),
      maxDurability: _.parseOptional(sb, () => _.parseInt(sb)),
      x: _.parseInt(sb),
      y: _.parseInt(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Object> {
    const sb = buf;
    return {
      id: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      team: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      objectType: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      destructibleObjectType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      environmentObjectType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      interactiveObjectType: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      active: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseBoolean(sb)) : _.NO_DIFF,
      towerName: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      width: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      height: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      angle: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      durability: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      maxDurability: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      x: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Object, b: Object): _.DeepPartial<Object> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Object> =  {
      id: _.diffPrimitive(a.id, b.id),
      team: _.diffOptional(a.team, b.team, (x, y) => _.diffPrimitive(x, y)),
      objectType: _.diffPrimitive(a.objectType, b.objectType),
      destructibleObjectType: _.diffOptional(a.destructibleObjectType, b.destructibleObjectType, (x, y) => _.diffPrimitive(x, y)),
      environmentObjectType: _.diffOptional(a.environmentObjectType, b.environmentObjectType, (x, y) => _.diffPrimitive(x, y)),
      interactiveObjectType: _.diffOptional(a.interactiveObjectType, b.interactiveObjectType, (x, y) => _.diffPrimitive(x, y)),
      active: _.diffOptional(a.active, b.active, (x, y) => _.diffPrimitive(x, y)),
      towerName: _.diffOptional(a.towerName, b.towerName, (x, y) => _.diffPrimitive(x, y)),
      width: _.diffOptional(a.width, b.width, (x, y) => _.diffPrimitive(x, y)),
      height: _.diffOptional(a.height, b.height, (x, y) => _.diffPrimitive(x, y)),
      angle: _.diffOptional(a.angle, b.angle, (x, y) => _.diffPrimitive(x, y)),
      durability: _.diffOptional(a.durability, b.durability, (x, y) => _.diffPrimitive(x, y)),
      maxDurability: _.diffOptional(a.maxDurability, b.maxDurability, (x, y) => _.diffPrimitive(x, y)),
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
    };
    return diff.id === _.NO_DIFF && diff.team === _.NO_DIFF && diff.objectType === _.NO_DIFF && diff.destructibleObjectType === _.NO_DIFF && diff.environmentObjectType === _.NO_DIFF && diff.interactiveObjectType === _.NO_DIFF && diff.active === _.NO_DIFF && diff.towerName === _.NO_DIFF && diff.width === _.NO_DIFF && diff.height === _.NO_DIFF && diff.angle === _.NO_DIFF && diff.durability === _.NO_DIFF && diff.maxDurability === _.NO_DIFF && diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Object, diff: _.DeepPartial<Object> | typeof _.NO_DIFF): Object {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.id = diff.id === _.NO_DIFF ? obj.id : diff.id;
    obj.team = diff.team === _.NO_DIFF ? obj.team : _.patchOptional(obj.team, diff.team, (a, b) => b);
    obj.objectType = diff.objectType === _.NO_DIFF ? obj.objectType : diff.objectType;
    obj.destructibleObjectType = diff.destructibleObjectType === _.NO_DIFF ? obj.destructibleObjectType : _.patchOptional(obj.destructibleObjectType, diff.destructibleObjectType, (a, b) => b);
    obj.environmentObjectType = diff.environmentObjectType === _.NO_DIFF ? obj.environmentObjectType : _.patchOptional(obj.environmentObjectType, diff.environmentObjectType, (a, b) => b);
    obj.interactiveObjectType = diff.interactiveObjectType === _.NO_DIFF ? obj.interactiveObjectType : _.patchOptional(obj.interactiveObjectType, diff.interactiveObjectType, (a, b) => b);
    obj.active = diff.active === _.NO_DIFF ? obj.active : _.patchOptional(obj.active, diff.active, (a, b) => b);
    obj.towerName = diff.towerName === _.NO_DIFF ? obj.towerName : _.patchOptional(obj.towerName, diff.towerName, (a, b) => b);
    obj.width = diff.width === _.NO_DIFF ? obj.width : _.patchOptional(obj.width, diff.width, (a, b) => b);
    obj.height = diff.height === _.NO_DIFF ? obj.height : _.patchOptional(obj.height, diff.height, (a, b) => b);
    obj.angle = diff.angle === _.NO_DIFF ? obj.angle : _.patchOptional(obj.angle, diff.angle, (a, b) => b);
    obj.durability = diff.durability === _.NO_DIFF ? obj.durability : _.patchOptional(obj.durability, diff.durability, (a, b) => b);
    obj.maxDurability = diff.maxDurability === _.NO_DIFF ? obj.maxDurability : _.patchOptional(obj.maxDurability, diff.maxDurability, (a, b) => b);
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    return obj;
  },
};

export const Player = {
  default(): Player {
    return {
      id: "",
      name: "",
      team: undefined,
      hero: undefined,
      cents: undefined,
      deck: undefined,
      randomSlots: [],
      hand: undefined,
      skills: undefined,
      restrictionZones: "",
    };
  },
  validate(obj: Player) {
    if (typeof obj !== "object") {
      return [`Invalid Player object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.id === "string", `Invalid string: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.id");
    }
    validationErrors = _.validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.name");
    }
    validationErrors = _.validateOptional(obj.team, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.team");
    }
    validationErrors = _.validateOptional(obj.hero, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.hero");
    }
    validationErrors = _.validateOptional(obj.cents, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.cents");
    }
    validationErrors = _.validateOptional(obj.deck, (x) => Deck.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.deck");
    }
    validationErrors = _.validateArray(obj.randomSlots, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.randomSlots");
    }
    validationErrors = _.validateOptional(obj.hand, (x) => Hand.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.hand");
    }
    validationErrors = _.validateOptional(obj.skills, (x) => Skills.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.skills");
    }
    validationErrors = _.validatePrimitive(typeof obj.restrictionZones === "string", `Invalid string: ${obj.restrictionZones}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Player.restrictionZones");
    }

    return validationErrors;
  },
  encode(obj: Player, buf: _.Writer = new _.Writer()) {
    _.writeString(buf, obj.id);
    _.writeString(buf, obj.name);
    _.writeOptional(buf, obj.team, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.hero, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.cents, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.deck, (x) => Deck.encode(x, buf));
    _.writeArray(buf, obj.randomSlots, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.hand, (x) => Hand.encode(x, buf));
    _.writeOptional(buf, obj.skills, (x) => Skills.encode(x, buf));
    _.writeString(buf, obj.restrictionZones);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Player>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      _.writeString(buf, obj.id);
    }
    tracker.push(obj.name !== _.NO_DIFF);
    if (obj.name !== _.NO_DIFF) {
      _.writeString(buf, obj.name);
    }
    tracker.push(obj.team !== _.NO_DIFF);
    if (obj.team !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.team, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.hero !== _.NO_DIFF);
    if (obj.hero !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.hero, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.cents !== _.NO_DIFF);
    if (obj.cents !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.cents, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.deck !== _.NO_DIFF);
    if (obj.deck !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.deck, (x) => Deck.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.randomSlots !== _.NO_DIFF);
    if (obj.randomSlots !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.randomSlots, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.hand !== _.NO_DIFF);
    if (obj.hand !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.hand, (x) => Hand.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.skills !== _.NO_DIFF);
    if (obj.skills !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.skills, (x) => Skills.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.restrictionZones !== _.NO_DIFF);
    if (obj.restrictionZones !== _.NO_DIFF) {
      _.writeString(buf, obj.restrictionZones);
    }
    return buf;
  },
  decode(buf: _.Reader): Player {
    const sb = buf;
    return {
      id: _.parseString(sb),
      name: _.parseString(sb),
      team: _.parseOptional(sb, () => _.parseString(sb)),
      hero: _.parseOptional(sb, () => _.parseInt(sb)),
      cents: _.parseOptional(sb, () => _.parseInt(sb)),
      deck: _.parseOptional(sb, () => Deck.decode(sb)),
      randomSlots: _.parseArray(sb, () => _.parseString(sb)),
      hand: _.parseOptional(sb, () => Hand.decode(sb)),
      skills: _.parseOptional(sb, () => Skills.decode(sb)),
      restrictionZones: _.parseString(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Player> {
    const sb = buf;
    return {
      id: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      name: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      team: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      hero: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      cents: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      deck: tracker.next() ? _.parseOptionalDiff(tracker, () => Deck.decodeDiff(sb, tracker)) : _.NO_DIFF,
      randomSlots: tracker.next() ? _.parseArrayDiff(sb, tracker, () => _.parseString(sb)) : _.NO_DIFF,
      hand: tracker.next() ? _.parseOptionalDiff(tracker, () => Hand.decodeDiff(sb, tracker)) : _.NO_DIFF,
      skills: tracker.next() ? _.parseOptionalDiff(tracker, () => Skills.decodeDiff(sb, tracker)) : _.NO_DIFF,
      restrictionZones: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Player, b: Player): _.DeepPartial<Player> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Player> =  {
      id: _.diffPrimitive(a.id, b.id),
      name: _.diffPrimitive(a.name, b.name),
      team: _.diffOptional(a.team, b.team, (x, y) => _.diffPrimitive(x, y)),
      hero: _.diffOptional(a.hero, b.hero, (x, y) => _.diffPrimitive(x, y)),
      cents: _.diffOptional(a.cents, b.cents, (x, y) => _.diffPrimitive(x, y)),
      deck: _.diffOptional(a.deck, b.deck, (x, y) => Deck.computeDiff(x, y)),
      randomSlots: _.diffArray(a.randomSlots, b.randomSlots, (x, y) => _.diffPrimitive(x, y)),
      hand: _.diffOptional(a.hand, b.hand, (x, y) => Hand.computeDiff(x, y)),
      skills: _.diffOptional(a.skills, b.skills, (x, y) => Skills.computeDiff(x, y)),
      restrictionZones: _.diffPrimitive(a.restrictionZones, b.restrictionZones),
    };
    return diff.id === _.NO_DIFF && diff.name === _.NO_DIFF && diff.team === _.NO_DIFF && diff.hero === _.NO_DIFF && diff.cents === _.NO_DIFF && diff.deck === _.NO_DIFF && diff.randomSlots === _.NO_DIFF && diff.hand === _.NO_DIFF && diff.skills === _.NO_DIFF && diff.restrictionZones === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Player, diff: _.DeepPartial<Player> | typeof _.NO_DIFF): Player {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.id = diff.id === _.NO_DIFF ? obj.id : diff.id;
    obj.name = diff.name === _.NO_DIFF ? obj.name : diff.name;
    obj.team = diff.team === _.NO_DIFF ? obj.team : _.patchOptional(obj.team, diff.team, (a, b) => b);
    obj.hero = diff.hero === _.NO_DIFF ? obj.hero : _.patchOptional(obj.hero, diff.hero, (a, b) => b);
    obj.cents = diff.cents === _.NO_DIFF ? obj.cents : _.patchOptional(obj.cents, diff.cents, (a, b) => b);
    obj.deck = diff.deck === _.NO_DIFF ? obj.deck : _.patchOptional(obj.deck, diff.deck, (a, b) => Deck.applyDiff(a, b));
    obj.randomSlots = diff.randomSlots === _.NO_DIFF ? obj.randomSlots : _.patchArray(obj.randomSlots, diff.randomSlots, (a, b) => b);
    obj.hand = diff.hand === _.NO_DIFF ? obj.hand : _.patchOptional(obj.hand, diff.hand, (a, b) => Hand.applyDiff(a, b));
    obj.skills = diff.skills === _.NO_DIFF ? obj.skills : _.patchOptional(obj.skills, diff.skills, (a, b) => Skills.applyDiff(a, b));
    obj.restrictionZones = diff.restrictionZones === _.NO_DIFF ? obj.restrictionZones : diff.restrictionZones;
    return obj;
  },
};

export const Spectator = {
  default(): Spectator {
    return {
      id: "",
      name: "",
    };
  },
  validate(obj: Spectator) {
    if (typeof obj !== "object") {
      return [`Invalid Spectator object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.id === "string", `Invalid string: ${obj.id}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Spectator.id");
    }
    validationErrors = _.validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Spectator.name");
    }

    return validationErrors;
  },
  encode(obj: Spectator, buf: _.Writer = new _.Writer()) {
    _.writeString(buf, obj.id);
    _.writeString(buf, obj.name);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Spectator>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.id !== _.NO_DIFF);
    if (obj.id !== _.NO_DIFF) {
      _.writeString(buf, obj.id);
    }
    tracker.push(obj.name !== _.NO_DIFF);
    if (obj.name !== _.NO_DIFF) {
      _.writeString(buf, obj.name);
    }
    return buf;
  },
  decode(buf: _.Reader): Spectator {
    const sb = buf;
    return {
      id: _.parseString(sb),
      name: _.parseString(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Spectator> {
    const sb = buf;
    return {
      id: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      name: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Spectator, b: Spectator): _.DeepPartial<Spectator> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Spectator> =  {
      id: _.diffPrimitive(a.id, b.id),
      name: _.diffPrimitive(a.name, b.name),
    };
    return diff.id === _.NO_DIFF && diff.name === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Spectator, diff: _.DeepPartial<Spectator> | typeof _.NO_DIFF): Spectator {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.id = diff.id === _.NO_DIFF ? obj.id : diff.id;
    obj.name = diff.name === _.NO_DIFF ? obj.name : diff.name;
    return obj;
  },
};

export const Deck = {
  default(): Deck {
    return {
      card1: undefined,
      card2: undefined,
      card3: undefined,
      card4: undefined,
      card5: undefined,
      card6: undefined,
      card7: undefined,
      card8: undefined,
    };
  },
  validate(obj: Deck) {
    if (typeof obj !== "object") {
      return [`Invalid Deck object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.card1, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Deck.card1");
    }
    validationErrors = _.validateOptional(obj.card2, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Deck.card2");
    }
    validationErrors = _.validateOptional(obj.card3, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Deck.card3");
    }
    validationErrors = _.validateOptional(obj.card4, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Deck.card4");
    }
    validationErrors = _.validateOptional(obj.card5, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Deck.card5");
    }
    validationErrors = _.validateOptional(obj.card6, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Deck.card6");
    }
    validationErrors = _.validateOptional(obj.card7, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Deck.card7");
    }
    validationErrors = _.validateOptional(obj.card8, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Deck.card8");
    }

    return validationErrors;
  },
  encode(obj: Deck, buf: _.Writer = new _.Writer()) {
    _.writeOptional(buf, obj.card1, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card2, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card3, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card4, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card5, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card6, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card7, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card8, (x) => _.writeString(buf, x));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Deck>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.card1 !== _.NO_DIFF);
    if (obj.card1 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card1, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card2 !== _.NO_DIFF);
    if (obj.card2 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card2, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card3 !== _.NO_DIFF);
    if (obj.card3 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card3, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card4 !== _.NO_DIFF);
    if (obj.card4 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card4, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card5 !== _.NO_DIFF);
    if (obj.card5 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card5, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card6 !== _.NO_DIFF);
    if (obj.card6 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card6, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card7 !== _.NO_DIFF);
    if (obj.card7 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card7, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card8 !== _.NO_DIFF);
    if (obj.card8 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card8, (x) => _.writeString(buf, x));
    }
    return buf;
  },
  decode(buf: _.Reader): Deck {
    const sb = buf;
    return {
      card1: _.parseOptional(sb, () => _.parseString(sb)),
      card2: _.parseOptional(sb, () => _.parseString(sb)),
      card3: _.parseOptional(sb, () => _.parseString(sb)),
      card4: _.parseOptional(sb, () => _.parseString(sb)),
      card5: _.parseOptional(sb, () => _.parseString(sb)),
      card6: _.parseOptional(sb, () => _.parseString(sb)),
      card7: _.parseOptional(sb, () => _.parseString(sb)),
      card8: _.parseOptional(sb, () => _.parseString(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Deck> {
    const sb = buf;
    return {
      card1: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card2: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card3: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card4: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card5: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card6: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card7: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card8: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
    };
  },
  computeDiff(a: Deck, b: Deck): _.DeepPartial<Deck> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Deck> =  {
      card1: _.diffOptional(a.card1, b.card1, (x, y) => _.diffPrimitive(x, y)),
      card2: _.diffOptional(a.card2, b.card2, (x, y) => _.diffPrimitive(x, y)),
      card3: _.diffOptional(a.card3, b.card3, (x, y) => _.diffPrimitive(x, y)),
      card4: _.diffOptional(a.card4, b.card4, (x, y) => _.diffPrimitive(x, y)),
      card5: _.diffOptional(a.card5, b.card5, (x, y) => _.diffPrimitive(x, y)),
      card6: _.diffOptional(a.card6, b.card6, (x, y) => _.diffPrimitive(x, y)),
      card7: _.diffOptional(a.card7, b.card7, (x, y) => _.diffPrimitive(x, y)),
      card8: _.diffOptional(a.card8, b.card8, (x, y) => _.diffPrimitive(x, y)),
    };
    return diff.card1 === _.NO_DIFF && diff.card2 === _.NO_DIFF && diff.card3 === _.NO_DIFF && diff.card4 === _.NO_DIFF && diff.card5 === _.NO_DIFF && diff.card6 === _.NO_DIFF && diff.card7 === _.NO_DIFF && diff.card8 === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Deck, diff: _.DeepPartial<Deck> | typeof _.NO_DIFF): Deck {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.card1 = diff.card1 === _.NO_DIFF ? obj.card1 : _.patchOptional(obj.card1, diff.card1, (a, b) => b);
    obj.card2 = diff.card2 === _.NO_DIFF ? obj.card2 : _.patchOptional(obj.card2, diff.card2, (a, b) => b);
    obj.card3 = diff.card3 === _.NO_DIFF ? obj.card3 : _.patchOptional(obj.card3, diff.card3, (a, b) => b);
    obj.card4 = diff.card4 === _.NO_DIFF ? obj.card4 : _.patchOptional(obj.card4, diff.card4, (a, b) => b);
    obj.card5 = diff.card5 === _.NO_DIFF ? obj.card5 : _.patchOptional(obj.card5, diff.card5, (a, b) => b);
    obj.card6 = diff.card6 === _.NO_DIFF ? obj.card6 : _.patchOptional(obj.card6, diff.card6, (a, b) => b);
    obj.card7 = diff.card7 === _.NO_DIFF ? obj.card7 : _.patchOptional(obj.card7, diff.card7, (a, b) => b);
    obj.card8 = diff.card8 === _.NO_DIFF ? obj.card8 : _.patchOptional(obj.card8, diff.card8, (a, b) => b);
    return obj;
  },
};

export const Hand = {
  default(): Hand {
    return {
      slot1: undefined,
      slot2: undefined,
      slot3: undefined,
      slot4: undefined,
    };
  },
  validate(obj: Hand) {
    if (typeof obj !== "object") {
      return [`Invalid Hand object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.slot1, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Hand.slot1");
    }
    validationErrors = _.validateOptional(obj.slot2, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Hand.slot2");
    }
    validationErrors = _.validateOptional(obj.slot3, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Hand.slot3");
    }
    validationErrors = _.validateOptional(obj.slot4, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Hand.slot4");
    }

    return validationErrors;
  },
  encode(obj: Hand, buf: _.Writer = new _.Writer()) {
    _.writeOptional(buf, obj.slot1, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.slot2, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.slot3, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.slot4, (x) => _.writeString(buf, x));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Hand>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.slot1 !== _.NO_DIFF);
    if (obj.slot1 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.slot1, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.slot2 !== _.NO_DIFF);
    if (obj.slot2 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.slot2, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.slot3 !== _.NO_DIFF);
    if (obj.slot3 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.slot3, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.slot4 !== _.NO_DIFF);
    if (obj.slot4 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.slot4, (x) => _.writeString(buf, x));
    }
    return buf;
  },
  decode(buf: _.Reader): Hand {
    const sb = buf;
    return {
      slot1: _.parseOptional(sb, () => _.parseString(sb)),
      slot2: _.parseOptional(sb, () => _.parseString(sb)),
      slot3: _.parseOptional(sb, () => _.parseString(sb)),
      slot4: _.parseOptional(sb, () => _.parseString(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Hand> {
    const sb = buf;
    return {
      slot1: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      slot2: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      slot3: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      slot4: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
    };
  },
  computeDiff(a: Hand, b: Hand): _.DeepPartial<Hand> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Hand> =  {
      slot1: _.diffOptional(a.slot1, b.slot1, (x, y) => _.diffPrimitive(x, y)),
      slot2: _.diffOptional(a.slot2, b.slot2, (x, y) => _.diffPrimitive(x, y)),
      slot3: _.diffOptional(a.slot3, b.slot3, (x, y) => _.diffPrimitive(x, y)),
      slot4: _.diffOptional(a.slot4, b.slot4, (x, y) => _.diffPrimitive(x, y)),
    };
    return diff.slot1 === _.NO_DIFF && diff.slot2 === _.NO_DIFF && diff.slot3 === _.NO_DIFF && diff.slot4 === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Hand, diff: _.DeepPartial<Hand> | typeof _.NO_DIFF): Hand {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.slot1 = diff.slot1 === _.NO_DIFF ? obj.slot1 : _.patchOptional(obj.slot1, diff.slot1, (a, b) => b);
    obj.slot2 = diff.slot2 === _.NO_DIFF ? obj.slot2 : _.patchOptional(obj.slot2, diff.slot2, (a, b) => b);
    obj.slot3 = diff.slot3 === _.NO_DIFF ? obj.slot3 : _.patchOptional(obj.slot3, diff.slot3, (a, b) => b);
    obj.slot4 = diff.slot4 === _.NO_DIFF ? obj.slot4 : _.patchOptional(obj.slot4, diff.slot4, (a, b) => b);
    return obj;
  },
};

export const Skills = {
  default(): Skills {
    return {
      slot1: undefined,
      slot2: undefined,
      slot3: undefined,
      slot4: undefined,
    };
  },
  validate(obj: Skills) {
    if (typeof obj !== "object") {
      return [`Invalid Skills object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.slot1, (x) => Skill.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Skills.slot1");
    }
    validationErrors = _.validateOptional(obj.slot2, (x) => Skill.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Skills.slot2");
    }
    validationErrors = _.validateOptional(obj.slot3, (x) => Skill.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Skills.slot3");
    }
    validationErrors = _.validateOptional(obj.slot4, (x) => Skill.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Skills.slot4");
    }

    return validationErrors;
  },
  encode(obj: Skills, buf: _.Writer = new _.Writer()) {
    _.writeOptional(buf, obj.slot1, (x) => Skill.encode(x, buf));
    _.writeOptional(buf, obj.slot2, (x) => Skill.encode(x, buf));
    _.writeOptional(buf, obj.slot3, (x) => Skill.encode(x, buf));
    _.writeOptional(buf, obj.slot4, (x) => Skill.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Skills>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.slot1 !== _.NO_DIFF);
    if (obj.slot1 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.slot1, (x) => Skill.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.slot2 !== _.NO_DIFF);
    if (obj.slot2 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.slot2, (x) => Skill.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.slot3 !== _.NO_DIFF);
    if (obj.slot3 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.slot3, (x) => Skill.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.slot4 !== _.NO_DIFF);
    if (obj.slot4 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.slot4, (x) => Skill.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _.Reader): Skills {
    const sb = buf;
    return {
      slot1: _.parseOptional(sb, () => Skill.decode(sb)),
      slot2: _.parseOptional(sb, () => Skill.decode(sb)),
      slot3: _.parseOptional(sb, () => Skill.decode(sb)),
      slot4: _.parseOptional(sb, () => Skill.decode(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Skills> {
    const sb = buf;
    return {
      slot1: tracker.next() ? _.parseOptionalDiff(tracker, () => Skill.decodeDiff(sb, tracker)) : _.NO_DIFF,
      slot2: tracker.next() ? _.parseOptionalDiff(tracker, () => Skill.decodeDiff(sb, tracker)) : _.NO_DIFF,
      slot3: tracker.next() ? _.parseOptionalDiff(tracker, () => Skill.decodeDiff(sb, tracker)) : _.NO_DIFF,
      slot4: tracker.next() ? _.parseOptionalDiff(tracker, () => Skill.decodeDiff(sb, tracker)) : _.NO_DIFF,
    };
  },
  computeDiff(a: Skills, b: Skills): _.DeepPartial<Skills> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Skills> =  {
      slot1: _.diffOptional(a.slot1, b.slot1, (x, y) => Skill.computeDiff(x, y)),
      slot2: _.diffOptional(a.slot2, b.slot2, (x, y) => Skill.computeDiff(x, y)),
      slot3: _.diffOptional(a.slot3, b.slot3, (x, y) => Skill.computeDiff(x, y)),
      slot4: _.diffOptional(a.slot4, b.slot4, (x, y) => Skill.computeDiff(x, y)),
    };
    return diff.slot1 === _.NO_DIFF && diff.slot2 === _.NO_DIFF && diff.slot3 === _.NO_DIFF && diff.slot4 === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Skills, diff: _.DeepPartial<Skills> | typeof _.NO_DIFF): Skills {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.slot1 = diff.slot1 === _.NO_DIFF ? obj.slot1 : _.patchOptional(obj.slot1, diff.slot1, (a, b) => Skill.applyDiff(a, b));
    obj.slot2 = diff.slot2 === _.NO_DIFF ? obj.slot2 : _.patchOptional(obj.slot2, diff.slot2, (a, b) => Skill.applyDiff(a, b));
    obj.slot3 = diff.slot3 === _.NO_DIFF ? obj.slot3 : _.patchOptional(obj.slot3, diff.slot3, (a, b) => Skill.applyDiff(a, b));
    obj.slot4 = diff.slot4 === _.NO_DIFF ? obj.slot4 : _.patchOptional(obj.slot4, diff.slot4, (a, b) => Skill.applyDiff(a, b));
    return obj;
  },
};

export const Skill = {
  default(): Skill {
    return {
      type: "",
      inUse: false,
      cooldown: 0,
      cooldownTotal: 0,
    };
  },
  validate(obj: Skill) {
    if (typeof obj !== "object") {
      return [`Invalid Skill object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.type === "string", `Invalid string: ${obj.type}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Skill.type");
    }
    validationErrors = _.validatePrimitive(typeof obj.inUse === "boolean", `Invalid boolean: ${obj.inUse}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Skill.inUse");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.cooldown), `Invalid int: ${obj.cooldown}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Skill.cooldown");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.cooldownTotal), `Invalid int: ${obj.cooldownTotal}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Skill.cooldownTotal");
    }

    return validationErrors;
  },
  encode(obj: Skill, buf: _.Writer = new _.Writer()) {
    _.writeString(buf, obj.type);
    _.writeBoolean(buf, obj.inUse);
    _.writeInt(buf, obj.cooldown);
    _.writeInt(buf, obj.cooldownTotal);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Skill>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.type !== _.NO_DIFF);
    if (obj.type !== _.NO_DIFF) {
      _.writeString(buf, obj.type);
    }
    tracker.push(obj.inUse !== _.NO_DIFF);
    if (obj.inUse !== _.NO_DIFF) {
      _.writeBoolean(buf, obj.inUse);
    }
    tracker.push(obj.cooldown !== _.NO_DIFF);
    if (obj.cooldown !== _.NO_DIFF) {
      _.writeInt(buf, obj.cooldown);
    }
    tracker.push(obj.cooldownTotal !== _.NO_DIFF);
    if (obj.cooldownTotal !== _.NO_DIFF) {
      _.writeInt(buf, obj.cooldownTotal);
    }
    return buf;
  },
  decode(buf: _.Reader): Skill {
    const sb = buf;
    return {
      type: _.parseString(sb),
      inUse: _.parseBoolean(sb),
      cooldown: _.parseInt(sb),
      cooldownTotal: _.parseInt(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Skill> {
    const sb = buf;
    return {
      type: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      inUse: tracker.next() ? _.parseBoolean(sb) : _.NO_DIFF,
      cooldown: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      cooldownTotal: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Skill, b: Skill): _.DeepPartial<Skill> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Skill> =  {
      type: _.diffPrimitive(a.type, b.type),
      inUse: _.diffPrimitive(a.inUse, b.inUse),
      cooldown: _.diffPrimitive(a.cooldown, b.cooldown),
      cooldownTotal: _.diffPrimitive(a.cooldownTotal, b.cooldownTotal),
    };
    return diff.type === _.NO_DIFF && diff.inUse === _.NO_DIFF && diff.cooldown === _.NO_DIFF && diff.cooldownTotal === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Skill, diff: _.DeepPartial<Skill> | typeof _.NO_DIFF): Skill {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.type = diff.type === _.NO_DIFF ? obj.type : diff.type;
    obj.inUse = diff.inUse === _.NO_DIFF ? obj.inUse : diff.inUse;
    obj.cooldown = diff.cooldown === _.NO_DIFF ? obj.cooldown : diff.cooldown;
    obj.cooldownTotal = diff.cooldownTotal === _.NO_DIFF ? obj.cooldownTotal : diff.cooldownTotal;
    return obj;
  },
};

export const GameInfo = {
  default(): GameInfo {
    return {
      mode: undefined,
      timeLimit: undefined,
      timeElapsed: undefined,
      suddenDeath: undefined,
      winner: undefined,
    };
  },
  validate(obj: GameInfo) {
    if (typeof obj !== "object") {
      return [`Invalid GameInfo object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.mode, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameInfo.mode");
    }
    validationErrors = _.validateOptional(obj.timeLimit, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameInfo.timeLimit");
    }
    validationErrors = _.validateOptional(obj.timeElapsed, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameInfo.timeElapsed");
    }
    validationErrors = _.validateOptional(obj.suddenDeath, (x) => _.validatePrimitive(typeof x === "boolean", `Invalid boolean: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameInfo.suddenDeath");
    }
    validationErrors = _.validateOptional(obj.winner, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameInfo.winner");
    }

    return validationErrors;
  },
  encode(obj: GameInfo, buf: _.Writer = new _.Writer()) {
    _.writeOptional(buf, obj.mode, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.timeLimit, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.timeElapsed, (x) => _.writeInt(buf, x));
    _.writeOptional(buf, obj.suddenDeath, (x) => _.writeBoolean(buf, x));
    _.writeOptional(buf, obj.winner, (x) => _.writeString(buf, x));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<GameInfo>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.mode !== _.NO_DIFF);
    if (obj.mode !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.mode, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.timeLimit !== _.NO_DIFF);
    if (obj.timeLimit !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.timeLimit, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.timeElapsed !== _.NO_DIFF);
    if (obj.timeElapsed !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.timeElapsed, (x) => _.writeInt(buf, x));
    }
    tracker.push(obj.suddenDeath !== _.NO_DIFF);
    if (obj.suddenDeath !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.suddenDeath, (x) => _.writeBoolean(buf, x));
    }
    tracker.push(obj.winner !== _.NO_DIFF);
    if (obj.winner !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.winner, (x) => _.writeString(buf, x));
    }
    return buf;
  },
  decode(buf: _.Reader): GameInfo {
    const sb = buf;
    return {
      mode: _.parseOptional(sb, () => _.parseString(sb)),
      timeLimit: _.parseOptional(sb, () => _.parseInt(sb)),
      timeElapsed: _.parseOptional(sb, () => _.parseInt(sb)),
      suddenDeath: _.parseOptional(sb, () => _.parseBoolean(sb)),
      winner: _.parseOptional(sb, () => _.parseString(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<GameInfo> {
    const sb = buf;
    return {
      mode: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      timeLimit: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      timeElapsed: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseInt(sb)) : _.NO_DIFF,
      suddenDeath: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseBoolean(sb)) : _.NO_DIFF,
      winner: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
    };
  },
  computeDiff(a: GameInfo, b: GameInfo): _.DeepPartial<GameInfo> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<GameInfo> =  {
      mode: _.diffOptional(a.mode, b.mode, (x, y) => _.diffPrimitive(x, y)),
      timeLimit: _.diffOptional(a.timeLimit, b.timeLimit, (x, y) => _.diffPrimitive(x, y)),
      timeElapsed: _.diffOptional(a.timeElapsed, b.timeElapsed, (x, y) => _.diffPrimitive(x, y)),
      suddenDeath: _.diffOptional(a.suddenDeath, b.suddenDeath, (x, y) => _.diffPrimitive(x, y)),
      winner: _.diffOptional(a.winner, b.winner, (x, y) => _.diffPrimitive(x, y)),
    };
    return diff.mode === _.NO_DIFF && diff.timeLimit === _.NO_DIFF && diff.timeElapsed === _.NO_DIFF && diff.suddenDeath === _.NO_DIFF && diff.winner === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: GameInfo, diff: _.DeepPartial<GameInfo> | typeof _.NO_DIFF): GameInfo {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.mode = diff.mode === _.NO_DIFF ? obj.mode : _.patchOptional(obj.mode, diff.mode, (a, b) => b);
    obj.timeLimit = diff.timeLimit === _.NO_DIFF ? obj.timeLimit : _.patchOptional(obj.timeLimit, diff.timeLimit, (a, b) => b);
    obj.timeElapsed = diff.timeElapsed === _.NO_DIFF ? obj.timeElapsed : _.patchOptional(obj.timeElapsed, diff.timeElapsed, (a, b) => b);
    obj.suddenDeath = diff.suddenDeath === _.NO_DIFF ? obj.suddenDeath : _.patchOptional(obj.suddenDeath, diff.suddenDeath, (a, b) => b);
    obj.winner = diff.winner === _.NO_DIFF ? obj.winner : _.patchOptional(obj.winner, diff.winner, (a, b) => b);
    return obj;
  },
};

export const DraftState = {
  default(): DraftState {
    return {
      timeRemaining: 0,
      decks: [],
      pairs: [],
    };
  },
  validate(obj: DraftState) {
    if (typeof obj !== "object") {
      return [`Invalid DraftState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.timeRemaining), `Invalid int: ${obj.timeRemaining}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftState.timeRemaining");
    }
    validationErrors = _.validateArray(obj.decks, (x) => DraftDeck.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftState.decks");
    }
    validationErrors = _.validateArray(obj.pairs, (x) => CardPair.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftState.pairs");
    }

    return validationErrors;
  },
  encode(obj: DraftState, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.timeRemaining);
    _.writeArray(buf, obj.decks, (x) => DraftDeck.encode(x, buf));
    _.writeArray(buf, obj.pairs, (x) => CardPair.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<DraftState>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.timeRemaining !== _.NO_DIFF);
    if (obj.timeRemaining !== _.NO_DIFF) {
      _.writeInt(buf, obj.timeRemaining);
    }
    tracker.push(obj.decks !== _.NO_DIFF);
    if (obj.decks !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.decks, (x) => DraftDeck.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.pairs !== _.NO_DIFF);
    if (obj.pairs !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.pairs, (x) => CardPair.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _.Reader): DraftState {
    const sb = buf;
    return {
      timeRemaining: _.parseInt(sb),
      decks: _.parseArray(sb, () => DraftDeck.decode(sb)),
      pairs: _.parseArray(sb, () => CardPair.decode(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<DraftState> {
    const sb = buf;
    return {
      timeRemaining: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      decks: tracker.next() ? _.parseArrayDiff(sb, tracker, () => DraftDeck.decodeDiff(sb, tracker)) : _.NO_DIFF,
      pairs: tracker.next() ? _.parseArrayDiff(sb, tracker, () => CardPair.decodeDiff(sb, tracker)) : _.NO_DIFF,
    };
  },
  computeDiff(a: DraftState, b: DraftState): _.DeepPartial<DraftState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<DraftState> =  {
      timeRemaining: _.diffPrimitive(a.timeRemaining, b.timeRemaining),
      decks: _.diffArray(a.decks, b.decks, (x, y) => DraftDeck.computeDiff(x, y)),
      pairs: _.diffArray(a.pairs, b.pairs, (x, y) => CardPair.computeDiff(x, y)),
    };
    return diff.timeRemaining === _.NO_DIFF && diff.decks === _.NO_DIFF && diff.pairs === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: DraftState, diff: _.DeepPartial<DraftState> | typeof _.NO_DIFF): DraftState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.timeRemaining = diff.timeRemaining === _.NO_DIFF ? obj.timeRemaining : diff.timeRemaining;
    obj.decks = diff.decks === _.NO_DIFF ? obj.decks : _.patchArray(obj.decks, diff.decks, (a, b) => DraftDeck.applyDiff(a, b));
    obj.pairs = diff.pairs === _.NO_DIFF ? obj.pairs : _.patchArray(obj.pairs, diff.pairs, (a, b) => CardPair.applyDiff(a, b));
    return obj;
  },
};

export const DraftDeck = {
  default(): DraftDeck {
    return {
      playerId: "",
      card1: undefined,
      card2: undefined,
      card3: undefined,
      card4: undefined,
      card5: undefined,
      card6: undefined,
      card7: undefined,
      card8: undefined,
    };
  },
  validate(obj: DraftDeck) {
    if (typeof obj !== "object") {
      return [`Invalid DraftDeck object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.playerId === "string", `Invalid string: ${obj.playerId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeck.playerId");
    }
    validationErrors = _.validateOptional(obj.card1, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeck.card1");
    }
    validationErrors = _.validateOptional(obj.card2, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeck.card2");
    }
    validationErrors = _.validateOptional(obj.card3, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeck.card3");
    }
    validationErrors = _.validateOptional(obj.card4, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeck.card4");
    }
    validationErrors = _.validateOptional(obj.card5, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeck.card5");
    }
    validationErrors = _.validateOptional(obj.card6, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeck.card6");
    }
    validationErrors = _.validateOptional(obj.card7, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeck.card7");
    }
    validationErrors = _.validateOptional(obj.card8, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeck.card8");
    }

    return validationErrors;
  },
  encode(obj: DraftDeck, buf: _.Writer = new _.Writer()) {
    _.writeString(buf, obj.playerId);
    _.writeOptional(buf, obj.card1, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card2, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card3, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card4, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card5, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card6, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card7, (x) => _.writeString(buf, x));
    _.writeOptional(buf, obj.card8, (x) => _.writeString(buf, x));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<DraftDeck>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.playerId !== _.NO_DIFF);
    if (obj.playerId !== _.NO_DIFF) {
      _.writeString(buf, obj.playerId);
    }
    tracker.push(obj.card1 !== _.NO_DIFF);
    if (obj.card1 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card1, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card2 !== _.NO_DIFF);
    if (obj.card2 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card2, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card3 !== _.NO_DIFF);
    if (obj.card3 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card3, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card4 !== _.NO_DIFF);
    if (obj.card4 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card4, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card5 !== _.NO_DIFF);
    if (obj.card5 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card5, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card6 !== _.NO_DIFF);
    if (obj.card6 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card6, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card7 !== _.NO_DIFF);
    if (obj.card7 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card7, (x) => _.writeString(buf, x));
    }
    tracker.push(obj.card8 !== _.NO_DIFF);
    if (obj.card8 !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.card8, (x) => _.writeString(buf, x));
    }
    return buf;
  },
  decode(buf: _.Reader): DraftDeck {
    const sb = buf;
    return {
      playerId: _.parseString(sb),
      card1: _.parseOptional(sb, () => _.parseString(sb)),
      card2: _.parseOptional(sb, () => _.parseString(sb)),
      card3: _.parseOptional(sb, () => _.parseString(sb)),
      card4: _.parseOptional(sb, () => _.parseString(sb)),
      card5: _.parseOptional(sb, () => _.parseString(sb)),
      card6: _.parseOptional(sb, () => _.parseString(sb)),
      card7: _.parseOptional(sb, () => _.parseString(sb)),
      card8: _.parseOptional(sb, () => _.parseString(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<DraftDeck> {
    const sb = buf;
    return {
      playerId: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      card1: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card2: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card3: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card4: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card5: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card6: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card7: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
      card8: tracker.next() ? _.parseOptionalDiff(tracker, () => _.parseString(sb)) : _.NO_DIFF,
    };
  },
  computeDiff(a: DraftDeck, b: DraftDeck): _.DeepPartial<DraftDeck> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<DraftDeck> =  {
      playerId: _.diffPrimitive(a.playerId, b.playerId),
      card1: _.diffOptional(a.card1, b.card1, (x, y) => _.diffPrimitive(x, y)),
      card2: _.diffOptional(a.card2, b.card2, (x, y) => _.diffPrimitive(x, y)),
      card3: _.diffOptional(a.card3, b.card3, (x, y) => _.diffPrimitive(x, y)),
      card4: _.diffOptional(a.card4, b.card4, (x, y) => _.diffPrimitive(x, y)),
      card5: _.diffOptional(a.card5, b.card5, (x, y) => _.diffPrimitive(x, y)),
      card6: _.diffOptional(a.card6, b.card6, (x, y) => _.diffPrimitive(x, y)),
      card7: _.diffOptional(a.card7, b.card7, (x, y) => _.diffPrimitive(x, y)),
      card8: _.diffOptional(a.card8, b.card8, (x, y) => _.diffPrimitive(x, y)),
    };
    return diff.playerId === _.NO_DIFF && diff.card1 === _.NO_DIFF && diff.card2 === _.NO_DIFF && diff.card3 === _.NO_DIFF && diff.card4 === _.NO_DIFF && diff.card5 === _.NO_DIFF && diff.card6 === _.NO_DIFF && diff.card7 === _.NO_DIFF && diff.card8 === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: DraftDeck, diff: _.DeepPartial<DraftDeck> | typeof _.NO_DIFF): DraftDeck {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.playerId = diff.playerId === _.NO_DIFF ? obj.playerId : diff.playerId;
    obj.card1 = diff.card1 === _.NO_DIFF ? obj.card1 : _.patchOptional(obj.card1, diff.card1, (a, b) => b);
    obj.card2 = diff.card2 === _.NO_DIFF ? obj.card2 : _.patchOptional(obj.card2, diff.card2, (a, b) => b);
    obj.card3 = diff.card3 === _.NO_DIFF ? obj.card3 : _.patchOptional(obj.card3, diff.card3, (a, b) => b);
    obj.card4 = diff.card4 === _.NO_DIFF ? obj.card4 : _.patchOptional(obj.card4, diff.card4, (a, b) => b);
    obj.card5 = diff.card5 === _.NO_DIFF ? obj.card5 : _.patchOptional(obj.card5, diff.card5, (a, b) => b);
    obj.card6 = diff.card6 === _.NO_DIFF ? obj.card6 : _.patchOptional(obj.card6, diff.card6, (a, b) => b);
    obj.card7 = diff.card7 === _.NO_DIFF ? obj.card7 : _.patchOptional(obj.card7, diff.card7, (a, b) => b);
    obj.card8 = diff.card8 === _.NO_DIFF ? obj.card8 : _.patchOptional(obj.card8, diff.card8, (a, b) => b);
    return obj;
  },
};

export const CardPair = {
  default(): CardPair {
    return {
      playerId: "",
      slot1: "",
      slot2: "",
    };
  },
  validate(obj: CardPair) {
    if (typeof obj !== "object") {
      return [`Invalid CardPair object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.playerId === "string", `Invalid string: ${obj.playerId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CardPair.playerId");
    }
    validationErrors = _.validatePrimitive(typeof obj.slot1 === "string", `Invalid string: ${obj.slot1}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CardPair.slot1");
    }
    validationErrors = _.validatePrimitive(typeof obj.slot2 === "string", `Invalid string: ${obj.slot2}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CardPair.slot2");
    }

    return validationErrors;
  },
  encode(obj: CardPair, buf: _.Writer = new _.Writer()) {
    _.writeString(buf, obj.playerId);
    _.writeString(buf, obj.slot1);
    _.writeString(buf, obj.slot2);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<CardPair>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.playerId !== _.NO_DIFF);
    if (obj.playerId !== _.NO_DIFF) {
      _.writeString(buf, obj.playerId);
    }
    tracker.push(obj.slot1 !== _.NO_DIFF);
    if (obj.slot1 !== _.NO_DIFF) {
      _.writeString(buf, obj.slot1);
    }
    tracker.push(obj.slot2 !== _.NO_DIFF);
    if (obj.slot2 !== _.NO_DIFF) {
      _.writeString(buf, obj.slot2);
    }
    return buf;
  },
  decode(buf: _.Reader): CardPair {
    const sb = buf;
    return {
      playerId: _.parseString(sb),
      slot1: _.parseString(sb),
      slot2: _.parseString(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<CardPair> {
    const sb = buf;
    return {
      playerId: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      slot1: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
      slot2: tracker.next() ? _.parseString(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: CardPair, b: CardPair): _.DeepPartial<CardPair> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<CardPair> =  {
      playerId: _.diffPrimitive(a.playerId, b.playerId),
      slot1: _.diffPrimitive(a.slot1, b.slot1),
      slot2: _.diffPrimitive(a.slot2, b.slot2),
    };
    return diff.playerId === _.NO_DIFF && diff.slot1 === _.NO_DIFF && diff.slot2 === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: CardPair, diff: _.DeepPartial<CardPair> | typeof _.NO_DIFF): CardPair {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.playerId = diff.playerId === _.NO_DIFF ? obj.playerId : diff.playerId;
    obj.slot1 = diff.slot1 === _.NO_DIFF ? obj.slot1 : diff.slot1;
    obj.slot2 = diff.slot2 === _.NO_DIFF ? obj.slot2 : diff.slot2;
    return obj;
  },
};

export const DebugBody = {
  default(): DebugBody {
    return {
      x: 0,
      y: 0,
      points: [],
    };
  },
  validate(obj: DebugBody) {
    if (typeof obj !== "object") {
      return [`Invalid DebugBody object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DebugBody.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DebugBody.y");
    }
    validationErrors = _.validateArray(obj.points, (x) => Point.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DebugBody.points");
    }

    return validationErrors;
  },
  encode(obj: DebugBody, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.x);
    _.writeInt(buf, obj.y);
    _.writeArray(buf, obj.points, (x) => Point.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<DebugBody>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeInt(buf, obj.y);
    }
    tracker.push(obj.points !== _.NO_DIFF);
    if (obj.points !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.points, (x) => Point.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _.Reader): DebugBody {
    const sb = buf;
    return {
      x: _.parseInt(sb),
      y: _.parseInt(sb),
      points: _.parseArray(sb, () => Point.decode(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<DebugBody> {
    const sb = buf;
    return {
      x: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      points: tracker.next() ? _.parseArrayDiff(sb, tracker, () => Point.decodeDiff(sb, tracker)) : _.NO_DIFF,
    };
  },
  computeDiff(a: DebugBody, b: DebugBody): _.DeepPartial<DebugBody> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<DebugBody> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
      points: _.diffArray(a.points, b.points, (x, y) => Point.computeDiff(x, y)),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF && diff.points === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: DebugBody, diff: _.DeepPartial<DebugBody> | typeof _.NO_DIFF): DebugBody {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    obj.points = diff.points === _.NO_DIFF ? obj.points : _.patchArray(obj.points, diff.points, (a, b) => Point.applyDiff(a, b));
    return obj;
  },
};

export const Point = {
  default(): Point {
    return {
      x: 0,
      y: 0,
    };
  },
  validate(obj: Point) {
    if (typeof obj !== "object") {
      return [`Invalid Point object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Point.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: Point.y");
    }

    return validationErrors;
  },
  encode(obj: Point, buf: _.Writer = new _.Writer()) {
    _.writeInt(buf, obj.x);
    _.writeInt(buf, obj.y);
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<Point>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      _.writeInt(buf, obj.x);
    }
    tracker.push(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      _.writeInt(buf, obj.y);
    }
    return buf;
  },
  decode(buf: _.Reader): Point {
    const sb = buf;
    return {
      x: _.parseInt(sb),
      y: _.parseInt(sb),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<Point> {
    const sb = buf;
    return {
      x: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
      y: tracker.next() ? _.parseInt(sb) : _.NO_DIFF,
    };
  },
  computeDiff(a: Point, b: Point): _.DeepPartial<Point> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Point> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: Point, diff: _.DeepPartial<Point> | typeof _.NO_DIFF): Point {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.x = diff.x === _.NO_DIFF ? obj.x : diff.x;
    obj.y = diff.y === _.NO_DIFF ? obj.y : diff.y;
    return obj;
  },
};

export const GameState = {
  default(): GameState {
    return {
      creatures: new Map(),
      items: [],
      effects: [],
      objects: [],
      players: [],
      spectators: [],
      info: GameInfo.default(),
      draft: undefined,
      debugBodies: [],
    };
  },
  validate(obj: GameState) {
    if (typeof obj !== "object") {
      return [`Invalid GameState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateRecord(obj.creatures, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`), (x) => Creature.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.creatures");
    }
    validationErrors = _.validateArray(obj.items, (x) => Item.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.items");
    }
    validationErrors = _.validateArray(obj.effects, (x) => Effect.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.effects");
    }
    validationErrors = _.validateArray(obj.objects, (x) => Object.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.objects");
    }
    validationErrors = _.validateArray(obj.players, (x) => Player.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.players");
    }
    validationErrors = _.validateArray(obj.spectators, (x) => Spectator.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.spectators");
    }
    validationErrors = GameInfo.validate(obj.info);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.info");
    }
    validationErrors = _.validateOptional(obj.draft, (x) => DraftState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.draft");
    }
    validationErrors = _.validateArray(obj.debugBodies, (x) => DebugBody.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.debugBodies");
    }

    return validationErrors;
  },
  encode(obj: GameState, buf: _.Writer = new _.Writer()) {
    _.writeRecord(buf, obj.creatures, (x) => _.writeUInt(buf, x), (x) => Creature.encode(x, buf));
    _.writeArray(buf, obj.items, (x) => Item.encode(x, buf));
    _.writeArray(buf, obj.effects, (x) => Effect.encode(x, buf));
    _.writeArray(buf, obj.objects, (x) => Object.encode(x, buf));
    _.writeArray(buf, obj.players, (x) => Player.encode(x, buf));
    _.writeArray(buf, obj.spectators, (x) => Spectator.encode(x, buf));
    GameInfo.encode(obj.info, buf);
    _.writeOptional(buf, obj.draft, (x) => DraftState.encode(x, buf));
    _.writeArray(buf, obj.debugBodies, (x) => DebugBody.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<GameState>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    tracker.push(obj.creatures !== _.NO_DIFF);
    if (obj.creatures !== _.NO_DIFF) {
      _.writeRecordDiff(buf, obj.creatures, (x) => _.writeUInt(buf, x), (x) => Creature.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.items !== _.NO_DIFF);
    if (obj.items !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.items, (x) => Item.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.effects !== _.NO_DIFF);
    if (obj.effects !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.effects, (x) => Effect.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.objects !== _.NO_DIFF);
    if (obj.objects !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.objects, (x) => Object.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.players !== _.NO_DIFF);
    if (obj.players !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.players, (x) => Player.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.spectators !== _.NO_DIFF);
    if (obj.spectators !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.spectators, (x) => Spectator.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.info !== _.NO_DIFF);
    if (obj.info !== _.NO_DIFF) {
      GameInfo.encodeDiff(obj.info, tracker, buf);
    }
    tracker.push(obj.draft !== _.NO_DIFF);
    if (obj.draft !== _.NO_DIFF) {
      _.writeOptionalDiff(tracker, obj.draft, (x) => DraftState.encodeDiff(x, tracker, buf));
    }
    tracker.push(obj.debugBodies !== _.NO_DIFF);
    if (obj.debugBodies !== _.NO_DIFF) {
      _.writeArrayDiff(buf, tracker, obj.debugBodies, (x) => DebugBody.encodeDiff(x, tracker, buf));
    }
    return buf;
  },
  decode(buf: _.Reader): GameState {
    const sb = buf;
    return {
      creatures: _.parseRecord(sb, () => _.parseUInt(sb), () => Creature.decode(sb)),
      items: _.parseArray(sb, () => Item.decode(sb)),
      effects: _.parseArray(sb, () => Effect.decode(sb)),
      objects: _.parseArray(sb, () => Object.decode(sb)),
      players: _.parseArray(sb, () => Player.decode(sb)),
      spectators: _.parseArray(sb, () => Spectator.decode(sb)),
      info: GameInfo.decode(sb),
      draft: _.parseOptional(sb, () => DraftState.decode(sb)),
      debugBodies: _.parseArray(sb, () => DebugBody.decode(sb)),
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<GameState> {
    const sb = buf;
    return {
      creatures: tracker.next() ? _.parseRecordDiff(sb, () => _.parseUInt(sb), () => Creature.decodeDiff(sb, tracker)) : _.NO_DIFF,
      items: tracker.next() ? _.parseArrayDiff(sb, tracker, () => Item.decodeDiff(sb, tracker)) : _.NO_DIFF,
      effects: tracker.next() ? _.parseArrayDiff(sb, tracker, () => Effect.decodeDiff(sb, tracker)) : _.NO_DIFF,
      objects: tracker.next() ? _.parseArrayDiff(sb, tracker, () => Object.decodeDiff(sb, tracker)) : _.NO_DIFF,
      players: tracker.next() ? _.parseArrayDiff(sb, tracker, () => Player.decodeDiff(sb, tracker)) : _.NO_DIFF,
      spectators: tracker.next() ? _.parseArrayDiff(sb, tracker, () => Spectator.decodeDiff(sb, tracker)) : _.NO_DIFF,
      info: tracker.next() ? GameInfo.decodeDiff(sb, tracker) : _.NO_DIFF,
      draft: tracker.next() ? _.parseOptionalDiff(tracker, () => DraftState.decodeDiff(sb, tracker)) : _.NO_DIFF,
      debugBodies: tracker.next() ? _.parseArrayDiff(sb, tracker, () => DebugBody.decodeDiff(sb, tracker)) : _.NO_DIFF,
    };
  },
  computeDiff(a: GameState, b: GameState): _.DeepPartial<GameState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<GameState> =  {
      creatures: _.diffRecord(a.creatures, b.creatures, (x, y) => Creature.computeDiff(x, y)),
      items: _.diffArray(a.items, b.items, (x, y) => Item.computeDiff(x, y)),
      effects: _.diffArray(a.effects, b.effects, (x, y) => Effect.computeDiff(x, y)),
      objects: _.diffArray(a.objects, b.objects, (x, y) => Object.computeDiff(x, y)),
      players: _.diffArray(a.players, b.players, (x, y) => Player.computeDiff(x, y)),
      spectators: _.diffArray(a.spectators, b.spectators, (x, y) => Spectator.computeDiff(x, y)),
      info: GameInfo.computeDiff(a.info, b.info),
      draft: _.diffOptional(a.draft, b.draft, (x, y) => DraftState.computeDiff(x, y)),
      debugBodies: _.diffArray(a.debugBodies, b.debugBodies, (x, y) => DebugBody.computeDiff(x, y)),
    };
    return diff.creatures === _.NO_DIFF && diff.items === _.NO_DIFF && diff.effects === _.NO_DIFF && diff.objects === _.NO_DIFF && diff.players === _.NO_DIFF && diff.spectators === _.NO_DIFF && diff.info === _.NO_DIFF && diff.draft === _.NO_DIFF && diff.debugBodies === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  applyDiff(obj: GameState, diff: _.DeepPartial<GameState> | typeof _.NO_DIFF): GameState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    obj.creatures = diff.creatures === _.NO_DIFF ? obj.creatures : _.patchRecord(obj.creatures, diff.creatures, (a, b) => Creature.applyDiff(a, b));
    obj.items = diff.items === _.NO_DIFF ? obj.items : _.patchArray(obj.items, diff.items, (a, b) => Item.applyDiff(a, b));
    obj.effects = diff.effects === _.NO_DIFF ? obj.effects : _.patchArray(obj.effects, diff.effects, (a, b) => Effect.applyDiff(a, b));
    obj.objects = diff.objects === _.NO_DIFF ? obj.objects : _.patchArray(obj.objects, diff.objects, (a, b) => Object.applyDiff(a, b));
    obj.players = diff.players === _.NO_DIFF ? obj.players : _.patchArray(obj.players, diff.players, (a, b) => Player.applyDiff(a, b));
    obj.spectators = diff.spectators === _.NO_DIFF ? obj.spectators : _.patchArray(obj.spectators, diff.spectators, (a, b) => Spectator.applyDiff(a, b));
    obj.info = diff.info === _.NO_DIFF ? obj.info : GameInfo.applyDiff(obj.info, diff.info);
    obj.draft = diff.draft === _.NO_DIFF ? obj.draft : _.patchOptional(obj.draft, diff.draft, (a, b) => DraftState.applyDiff(a, b));
    obj.debugBodies = diff.debugBodies === _.NO_DIFF ? obj.debugBodies : _.patchArray(obj.debugBodies, diff.debugBodies, (a, b) => DebugBody.applyDiff(a, b));
    return obj;
  },
};
