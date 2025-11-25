import * as _ from "../helpers.ts";

export type CreatureState = {
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
};
export type ItemState = {
  itemType: string;
  potionType?: string;
  weaponType?: string;
  x: number;
  y: number;
};
export type EffectState = {
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
export type ObjectState = {
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
export type PlayerState = {
  name: string;
  team?: string;
  hero?: number;
  cents?: number;
  deck?: DeckState;
  randomSlots: string[];
  hand?: HandState;
  skills?: SkillsState;
  restrictionZones: string;
};
export type SpectatorState = {
  name: string;
};
export type DeckState = {
  card1?: string;
  card2?: string;
  card3?: string;
  card4?: string;
  card5?: string;
  card6?: string;
  card7?: string;
  card8?: string;
};
export type HandState = {
  slot1?: string;
  slot2?: string;
  slot3?: string;
  slot4?: string;
};
export type SkillsState = {
  slot1?: SkillState;
  slot2?: SkillState;
  slot3?: SkillState;
  slot4?: SkillState;
};
export type SkillState = {
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
  decks: DraftDeckState[];
  pairs: CardPairState[];
};
export type DraftDeckState = {
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
export type CardPairState = {
  playerId: string;
  slot1: string;
  slot2: string;
};
export type DebugBodyState = {
  x: number;
  y: number;
  points: Point[];
};
export type Point = {
  x: number;
  y: number;
};
export type GameState = {
  creatures: Map<number, CreatureState>;
  items: Map<number, ItemState>;
  effects: Map<number, EffectState>;
  objects: Map<number, ObjectState>;
  players: Map<string, PlayerState>;
  spectators: Map<string, SpectatorState>;
  info: GameInfo;
  draft?: DraftState;
  debugBodies?: DebugBodyState[];
};


export const CreatureState = {
  default(): CreatureState {
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
    };
  },
  validate(obj: CreatureState) {
    if (typeof obj !== "object") {
      return [`Invalid CreatureState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.team === "string", `Invalid string: ${obj.team}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.team");
    }
    validationErrors = _.validatePrimitive(typeof obj.hero === "boolean", `Invalid boolean: ${obj.hero}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.hero");
    }
    validationErrors = _.validatePrimitive(typeof obj.creatureType === "string", `Invalid string: ${obj.creatureType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.creatureType");
    }
    validationErrors = _.validateOptional(obj.equippedItemType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.equippedItemType");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.health) && obj.health >= 0, `Invalid uint: ${obj.health}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.health");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.maxHealth) && obj.maxHealth >= 0, `Invalid uint: ${obj.maxHealth}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.maxHealth");
    }
    validationErrors = _.validatePrimitive(typeof obj.visible === "boolean", `Invalid boolean: ${obj.visible}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.visible");
    }
    validationErrors = _.validatePrimitive(typeof obj.facing === "string", `Invalid string: ${obj.facing}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.facing");
    }
    validationErrors = _.validatePrimitive(typeof obj.moving === "boolean", `Invalid boolean: ${obj.moving}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.moving");
    }
    validationErrors = _.validatePrimitive(typeof obj.moveType === "string", `Invalid string: ${obj.moveType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.moveType");
    }
    validationErrors = _.validateOptional(obj.moveTargetX, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.moveTargetX");
    }
    validationErrors = _.validateOptional(obj.moveTargetY, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.moveTargetY");
    }
    validationErrors = _.validateOptional(obj.enemyTargetX, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.enemyTargetX");
    }
    validationErrors = _.validateOptional(obj.enemyTargetY, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.enemyTargetY");
    }
    validationErrors = _.validateOptional(obj.using, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.using");
    }
    validationErrors = _.validateOptional(obj.useDirection, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.useDirection");
    }
    validationErrors = _.validatePrimitive(typeof obj.takingDamage === "boolean", `Invalid boolean: ${obj.takingDamage}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.takingDamage");
    }
    validationErrors = _.validatePrimitive(typeof obj.frozen === "boolean", `Invalid boolean: ${obj.frozen}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.frozen");
    }
    validationErrors = _.validateOptional(obj.statusEffect, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.statusEffect");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CreatureState.y");
    }

    return validationErrors;
  },
  encode(obj: CreatureState) {
    return CreatureState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: CreatureState, tracker: _.Tracker) {
    tracker.pushString(obj.team);
    tracker.pushBoolean(obj.hero);
    tracker.pushString(obj.creatureType);
    tracker.pushOptional(obj.equippedItemType, (x) => tracker.pushString(x));
    tracker.pushUInt(obj.health);
    tracker.pushUInt(obj.maxHealth);
    tracker.pushBoolean(obj.visible);
    tracker.pushString(obj.facing);
    tracker.pushBoolean(obj.moving);
    tracker.pushString(obj.moveType);
    tracker.pushOptional(obj.moveTargetX, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.moveTargetY, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.enemyTargetX, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.enemyTargetY, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.using, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.useDirection, (x) => tracker.pushString(x));
    tracker.pushBoolean(obj.takingDamage);
    tracker.pushBoolean(obj.frozen);
    tracker.pushOptional(obj.statusEffect, (x) => tracker.pushString(x));
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
    return tracker;
  },
  decode(input: Uint8Array): CreatureState {
    return CreatureState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): CreatureState {
    return {
      team: tracker.nextString(),
      hero: tracker.nextBoolean(),
      creatureType: tracker.nextString(),
      equippedItemType: tracker.nextOptional(() => tracker.nextString()),
      health: tracker.nextUInt(),
      maxHealth: tracker.nextUInt(),
      visible: tracker.nextBoolean(),
      facing: tracker.nextString(),
      moving: tracker.nextBoolean(),
      moveType: tracker.nextString(),
      moveTargetX: tracker.nextOptional(() => tracker.nextInt()),
      moveTargetY: tracker.nextOptional(() => tracker.nextInt()),
      enemyTargetX: tracker.nextOptional(() => tracker.nextInt()),
      enemyTargetY: tracker.nextOptional(() => tracker.nextInt()),
      using: tracker.nextOptional(() => tracker.nextString()),
      useDirection: tracker.nextOptional(() => tracker.nextString()),
      takingDamage: tracker.nextBoolean(),
      frozen: tracker.nextBoolean(),
      statusEffect: tracker.nextOptional(() => tracker.nextString()),
      x: tracker.nextInt(),
      y: tracker.nextInt(),
    };
  },
  computeDiff(a: CreatureState, b: CreatureState): _.DeepPartial<CreatureState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<CreatureState> =  {
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
    };
    return diff.team === _.NO_DIFF && diff.hero === _.NO_DIFF && diff.creatureType === _.NO_DIFF && diff.equippedItemType === _.NO_DIFF && diff.health === _.NO_DIFF && diff.maxHealth === _.NO_DIFF && diff.visible === _.NO_DIFF && diff.facing === _.NO_DIFF && diff.moving === _.NO_DIFF && diff.moveType === _.NO_DIFF && diff.moveTargetX === _.NO_DIFF && diff.moveTargetY === _.NO_DIFF && diff.enemyTargetX === _.NO_DIFF && diff.enemyTargetY === _.NO_DIFF && diff.using === _.NO_DIFF && diff.useDirection === _.NO_DIFF && diff.takingDamage === _.NO_DIFF && diff.frozen === _.NO_DIFF && diff.statusEffect === _.NO_DIFF && diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<CreatureState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return CreatureState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<CreatureState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.team !== _.NO_DIFF);
    if (obj.team !== _.NO_DIFF) {
      tracker.pushString(obj.team);
    }
    tracker.pushBoolean(obj.hero !== _.NO_DIFF);
    if (obj.hero !== _.NO_DIFF) {
      tracker.pushBoolean(obj.hero);
    }
    tracker.pushBoolean(obj.creatureType !== _.NO_DIFF);
    if (obj.creatureType !== _.NO_DIFF) {
      tracker.pushString(obj.creatureType);
    }
    tracker.pushBoolean(obj.equippedItemType !== _.NO_DIFF);
    if (obj.equippedItemType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.equippedItemType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.health !== _.NO_DIFF);
    if (obj.health !== _.NO_DIFF) {
      tracker.pushUInt(obj.health);
    }
    tracker.pushBoolean(obj.maxHealth !== _.NO_DIFF);
    if (obj.maxHealth !== _.NO_DIFF) {
      tracker.pushUInt(obj.maxHealth);
    }
    tracker.pushBoolean(obj.visible !== _.NO_DIFF);
    if (obj.visible !== _.NO_DIFF) {
      tracker.pushBoolean(obj.visible);
    }
    tracker.pushBoolean(obj.facing !== _.NO_DIFF);
    if (obj.facing !== _.NO_DIFF) {
      tracker.pushString(obj.facing);
    }
    tracker.pushBoolean(obj.moving !== _.NO_DIFF);
    if (obj.moving !== _.NO_DIFF) {
      tracker.pushBoolean(obj.moving);
    }
    tracker.pushBoolean(obj.moveType !== _.NO_DIFF);
    if (obj.moveType !== _.NO_DIFF) {
      tracker.pushString(obj.moveType);
    }
    tracker.pushBoolean(obj.moveTargetX !== _.NO_DIFF);
    if (obj.moveTargetX !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.moveTargetX!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.moveTargetY !== _.NO_DIFF);
    if (obj.moveTargetY !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.moveTargetY!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.enemyTargetX !== _.NO_DIFF);
    if (obj.enemyTargetX !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.enemyTargetX!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.enemyTargetY !== _.NO_DIFF);
    if (obj.enemyTargetY !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.enemyTargetY!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.using !== _.NO_DIFF);
    if (obj.using !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.using!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.useDirection !== _.NO_DIFF);
    if (obj.useDirection !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.useDirection!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.takingDamage !== _.NO_DIFF);
    if (obj.takingDamage !== _.NO_DIFF) {
      tracker.pushBoolean(obj.takingDamage);
    }
    tracker.pushBoolean(obj.frozen !== _.NO_DIFF);
    if (obj.frozen !== _.NO_DIFF) {
      tracker.pushBoolean(obj.frozen);
    }
    tracker.pushBoolean(obj.statusEffect !== _.NO_DIFF);
    if (obj.statusEffect !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.statusEffect!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushInt(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushInt(obj.y);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<CreatureState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return CreatureState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<CreatureState> {
    return {
      team: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      hero: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
      creatureType: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      equippedItemType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      health: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      maxHealth: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      visible: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
      facing: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      moving: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
      moveType: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      moveTargetX: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      moveTargetY: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      enemyTargetX: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      enemyTargetY: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      using: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      useDirection: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      takingDamage: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
      frozen: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
      statusEffect: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      x: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: CreatureState, diff: _.DeepPartial<CreatureState> | typeof _.NO_DIFF): CreatureState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      team: diff.team === _.NO_DIFF ? obj.team : diff.team,
      hero: diff.hero === _.NO_DIFF ? obj.hero : diff.hero,
      creatureType: diff.creatureType === _.NO_DIFF ? obj.creatureType : diff.creatureType,
      equippedItemType: diff.equippedItemType === _.NO_DIFF ? obj.equippedItemType : _.patchOptional<string>(obj.equippedItemType, diff.equippedItemType!, (a, b) => b),
      health: diff.health === _.NO_DIFF ? obj.health : diff.health,
      maxHealth: diff.maxHealth === _.NO_DIFF ? obj.maxHealth : diff.maxHealth,
      visible: diff.visible === _.NO_DIFF ? obj.visible : diff.visible,
      facing: diff.facing === _.NO_DIFF ? obj.facing : diff.facing,
      moving: diff.moving === _.NO_DIFF ? obj.moving : diff.moving,
      moveType: diff.moveType === _.NO_DIFF ? obj.moveType : diff.moveType,
      moveTargetX: diff.moveTargetX === _.NO_DIFF ? obj.moveTargetX : _.patchOptional<number>(obj.moveTargetX, diff.moveTargetX!, (a, b) => b),
      moveTargetY: diff.moveTargetY === _.NO_DIFF ? obj.moveTargetY : _.patchOptional<number>(obj.moveTargetY, diff.moveTargetY!, (a, b) => b),
      enemyTargetX: diff.enemyTargetX === _.NO_DIFF ? obj.enemyTargetX : _.patchOptional<number>(obj.enemyTargetX, diff.enemyTargetX!, (a, b) => b),
      enemyTargetY: diff.enemyTargetY === _.NO_DIFF ? obj.enemyTargetY : _.patchOptional<number>(obj.enemyTargetY, diff.enemyTargetY!, (a, b) => b),
      using: diff.using === _.NO_DIFF ? obj.using : _.patchOptional<string>(obj.using, diff.using!, (a, b) => b),
      useDirection: diff.useDirection === _.NO_DIFF ? obj.useDirection : _.patchOptional<string>(obj.useDirection, diff.useDirection!, (a, b) => b),
      takingDamage: diff.takingDamage === _.NO_DIFF ? obj.takingDamage : diff.takingDamage,
      frozen: diff.frozen === _.NO_DIFF ? obj.frozen : diff.frozen,
      statusEffect: diff.statusEffect === _.NO_DIFF ? obj.statusEffect : _.patchOptional<string>(obj.statusEffect, diff.statusEffect!, (a, b) => b),
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
    };
  },
};

export const ItemState = {
  default(): ItemState {
    return {
      itemType: "",
      potionType: undefined,
      weaponType: undefined,
      x: 0,
      y: 0,
    };
  },
  validate(obj: ItemState) {
    if (typeof obj !== "object") {
      return [`Invalid ItemState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.itemType === "string", `Invalid string: ${obj.itemType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ItemState.itemType");
    }
    validationErrors = _.validateOptional(obj.potionType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ItemState.potionType");
    }
    validationErrors = _.validateOptional(obj.weaponType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ItemState.weaponType");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ItemState.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ItemState.y");
    }

    return validationErrors;
  },
  encode(obj: ItemState) {
    return ItemState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: ItemState, tracker: _.Tracker) {
    tracker.pushString(obj.itemType);
    tracker.pushOptional(obj.potionType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.weaponType, (x) => tracker.pushString(x));
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
    return tracker;
  },
  decode(input: Uint8Array): ItemState {
    return ItemState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ItemState {
    return {
      itemType: tracker.nextString(),
      potionType: tracker.nextOptional(() => tracker.nextString()),
      weaponType: tracker.nextOptional(() => tracker.nextString()),
      x: tracker.nextInt(),
      y: tracker.nextInt(),
    };
  },
  computeDiff(a: ItemState, b: ItemState): _.DeepPartial<ItemState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<ItemState> =  {
      itemType: _.diffPrimitive(a.itemType, b.itemType),
      potionType: _.diffOptional(a.potionType, b.potionType, (x, y) => _.diffPrimitive(x, y)),
      weaponType: _.diffOptional(a.weaponType, b.weaponType, (x, y) => _.diffPrimitive(x, y)),
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
    };
    return diff.itemType === _.NO_DIFF && diff.potionType === _.NO_DIFF && diff.weaponType === _.NO_DIFF && diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<ItemState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return ItemState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<ItemState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.itemType !== _.NO_DIFF);
    if (obj.itemType !== _.NO_DIFF) {
      tracker.pushString(obj.itemType);
    }
    tracker.pushBoolean(obj.potionType !== _.NO_DIFF);
    if (obj.potionType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.potionType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.weaponType !== _.NO_DIFF);
    if (obj.weaponType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.weaponType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushInt(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushInt(obj.y);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<ItemState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return ItemState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<ItemState> {
    return {
      itemType: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      potionType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      weaponType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      x: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: ItemState, diff: _.DeepPartial<ItemState> | typeof _.NO_DIFF): ItemState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      itemType: diff.itemType === _.NO_DIFF ? obj.itemType : diff.itemType,
      potionType: diff.potionType === _.NO_DIFF ? obj.potionType : _.patchOptional<string>(obj.potionType, diff.potionType!, (a, b) => b),
      weaponType: diff.weaponType === _.NO_DIFF ? obj.weaponType : _.patchOptional<string>(obj.weaponType, diff.weaponType!, (a, b) => b),
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
    };
  },
};

export const EffectState = {
  default(): EffectState {
    return {
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
  validate(obj: EffectState) {
    if (typeof obj !== "object") {
      return [`Invalid EffectState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.creatureId, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.creatureId");
    }
    validationErrors = _.validatePrimitive(typeof obj.effectType === "string", `Invalid string: ${obj.effectType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.effectType");
    }
    validationErrors = _.validateOptional(obj.triggerType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.triggerType");
    }
    validationErrors = _.validateOptional(obj.ellipseEffectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.ellipseEffectType");
    }
    validationErrors = _.validateOptional(obj.weaponEffectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.weaponEffectType");
    }
    validationErrors = _.validateOptional(obj.projectileType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.projectileType");
    }
    validationErrors = _.validateOptional(obj.visualEffectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.visualEffectType");
    }
    validationErrors = _.validateOptional(obj.swingType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.swingType");
    }
    validationErrors = _.validateOptional(obj.thrustType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.thrustType");
    }
    validationErrors = _.validateOptional(obj.weaponType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.weaponType");
    }
    validationErrors = _.validateOptional(obj.direction, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.direction");
    }
    validationErrors = _.validateOptional(obj.angle, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.angle");
    }
    validationErrors = _.validateOptional(obj.radius, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.radius");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.y");
    }
    validationErrors = _.validateOptional(obj.z, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: EffectState.z");
    }

    return validationErrors;
  },
  encode(obj: EffectState) {
    return EffectState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: EffectState, tracker: _.Tracker) {
    tracker.pushOptional(obj.creatureId, (x) => tracker.pushInt(x));
    tracker.pushString(obj.effectType);
    tracker.pushOptional(obj.triggerType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.ellipseEffectType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.weaponEffectType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.projectileType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.visualEffectType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.swingType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.thrustType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.weaponType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.direction, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.angle, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.radius, (x) => tracker.pushUInt(x));
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
    tracker.pushOptional(obj.z, (x) => tracker.pushInt(x));
    return tracker;
  },
  decode(input: Uint8Array): EffectState {
    return EffectState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): EffectState {
    return {
      creatureId: tracker.nextOptional(() => tracker.nextInt()),
      effectType: tracker.nextString(),
      triggerType: tracker.nextOptional(() => tracker.nextString()),
      ellipseEffectType: tracker.nextOptional(() => tracker.nextString()),
      weaponEffectType: tracker.nextOptional(() => tracker.nextString()),
      projectileType: tracker.nextOptional(() => tracker.nextString()),
      visualEffectType: tracker.nextOptional(() => tracker.nextString()),
      swingType: tracker.nextOptional(() => tracker.nextString()),
      thrustType: tracker.nextOptional(() => tracker.nextString()),
      weaponType: tracker.nextOptional(() => tracker.nextString()),
      direction: tracker.nextOptional(() => tracker.nextString()),
      angle: tracker.nextOptional(() => tracker.nextInt()),
      radius: tracker.nextOptional(() => tracker.nextUInt()),
      x: tracker.nextInt(),
      y: tracker.nextInt(),
      z: tracker.nextOptional(() => tracker.nextInt()),
    };
  },
  computeDiff(a: EffectState, b: EffectState): _.DeepPartial<EffectState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<EffectState> =  {
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
    return diff.creatureId === _.NO_DIFF && diff.effectType === _.NO_DIFF && diff.triggerType === _.NO_DIFF && diff.ellipseEffectType === _.NO_DIFF && diff.weaponEffectType === _.NO_DIFF && diff.projectileType === _.NO_DIFF && diff.visualEffectType === _.NO_DIFF && diff.swingType === _.NO_DIFF && diff.thrustType === _.NO_DIFF && diff.weaponType === _.NO_DIFF && diff.direction === _.NO_DIFF && diff.angle === _.NO_DIFF && diff.radius === _.NO_DIFF && diff.x === _.NO_DIFF && diff.y === _.NO_DIFF && diff.z === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<EffectState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return EffectState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<EffectState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.creatureId !== _.NO_DIFF);
    if (obj.creatureId !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.creatureId!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.effectType !== _.NO_DIFF);
    if (obj.effectType !== _.NO_DIFF) {
      tracker.pushString(obj.effectType);
    }
    tracker.pushBoolean(obj.triggerType !== _.NO_DIFF);
    if (obj.triggerType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.triggerType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.ellipseEffectType !== _.NO_DIFF);
    if (obj.ellipseEffectType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.ellipseEffectType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.weaponEffectType !== _.NO_DIFF);
    if (obj.weaponEffectType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.weaponEffectType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.projectileType !== _.NO_DIFF);
    if (obj.projectileType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.projectileType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.visualEffectType !== _.NO_DIFF);
    if (obj.visualEffectType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.visualEffectType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.swingType !== _.NO_DIFF);
    if (obj.swingType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.swingType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.thrustType !== _.NO_DIFF);
    if (obj.thrustType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.thrustType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.weaponType !== _.NO_DIFF);
    if (obj.weaponType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.weaponType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.direction !== _.NO_DIFF);
    if (obj.direction !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.direction!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.angle !== _.NO_DIFF);
    if (obj.angle !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.angle!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.radius !== _.NO_DIFF);
    if (obj.radius !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.radius!, (x) => tracker.pushUInt(x), (x) => tracker.pushUInt(x));
    }
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushInt(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushInt(obj.y);
    }
    tracker.pushBoolean(obj.z !== _.NO_DIFF);
    if (obj.z !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.z!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<EffectState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return EffectState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<EffectState> {
    return {
      creatureId: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      effectType: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      triggerType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      ellipseEffectType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      weaponEffectType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      projectileType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      visualEffectType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      swingType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      thrustType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      weaponType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      direction: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      angle: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      radius: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextUInt(), () => tracker.nextUInt()) : _.NO_DIFF,
      x: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      z: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
    };
  },
  applyDiff(obj: EffectState, diff: _.DeepPartial<EffectState> | typeof _.NO_DIFF): EffectState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      creatureId: diff.creatureId === _.NO_DIFF ? obj.creatureId : _.patchOptional<number>(obj.creatureId, diff.creatureId!, (a, b) => b),
      effectType: diff.effectType === _.NO_DIFF ? obj.effectType : diff.effectType,
      triggerType: diff.triggerType === _.NO_DIFF ? obj.triggerType : _.patchOptional<string>(obj.triggerType, diff.triggerType!, (a, b) => b),
      ellipseEffectType: diff.ellipseEffectType === _.NO_DIFF ? obj.ellipseEffectType : _.patchOptional<string>(obj.ellipseEffectType, diff.ellipseEffectType!, (a, b) => b),
      weaponEffectType: diff.weaponEffectType === _.NO_DIFF ? obj.weaponEffectType : _.patchOptional<string>(obj.weaponEffectType, diff.weaponEffectType!, (a, b) => b),
      projectileType: diff.projectileType === _.NO_DIFF ? obj.projectileType : _.patchOptional<string>(obj.projectileType, diff.projectileType!, (a, b) => b),
      visualEffectType: diff.visualEffectType === _.NO_DIFF ? obj.visualEffectType : _.patchOptional<string>(obj.visualEffectType, diff.visualEffectType!, (a, b) => b),
      swingType: diff.swingType === _.NO_DIFF ? obj.swingType : _.patchOptional<string>(obj.swingType, diff.swingType!, (a, b) => b),
      thrustType: diff.thrustType === _.NO_DIFF ? obj.thrustType : _.patchOptional<string>(obj.thrustType, diff.thrustType!, (a, b) => b),
      weaponType: diff.weaponType === _.NO_DIFF ? obj.weaponType : _.patchOptional<string>(obj.weaponType, diff.weaponType!, (a, b) => b),
      direction: diff.direction === _.NO_DIFF ? obj.direction : _.patchOptional<string>(obj.direction, diff.direction!, (a, b) => b),
      angle: diff.angle === _.NO_DIFF ? obj.angle : _.patchOptional<number>(obj.angle, diff.angle!, (a, b) => b),
      radius: diff.radius === _.NO_DIFF ? obj.radius : _.patchOptional<number>(obj.radius, diff.radius!, (a, b) => b),
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
      z: diff.z === _.NO_DIFF ? obj.z : _.patchOptional<number>(obj.z, diff.z!, (a, b) => b),
    };
  },
};

export const ObjectState = {
  default(): ObjectState {
    return {
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
  validate(obj: ObjectState) {
    if (typeof obj !== "object") {
      return [`Invalid ObjectState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.team, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.team");
    }
    validationErrors = _.validatePrimitive(typeof obj.objectType === "string", `Invalid string: ${obj.objectType}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.objectType");
    }
    validationErrors = _.validateOptional(obj.destructibleObjectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.destructibleObjectType");
    }
    validationErrors = _.validateOptional(obj.environmentObjectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.environmentObjectType");
    }
    validationErrors = _.validateOptional(obj.interactiveObjectType, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.interactiveObjectType");
    }
    validationErrors = _.validateOptional(obj.active, (x) => _.validatePrimitive(typeof x === "boolean", `Invalid boolean: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.active");
    }
    validationErrors = _.validateOptional(obj.towerName, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.towerName");
    }
    validationErrors = _.validateOptional(obj.width, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.width");
    }
    validationErrors = _.validateOptional(obj.height, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.height");
    }
    validationErrors = _.validateOptional(obj.angle, (x) => _.validatePrimitive(Number.isInteger(x), `Invalid int: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.angle");
    }
    validationErrors = _.validateOptional(obj.durability, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.durability");
    }
    validationErrors = _.validateOptional(obj.maxDurability, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.maxDurability");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ObjectState.y");
    }

    return validationErrors;
  },
  encode(obj: ObjectState) {
    return ObjectState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: ObjectState, tracker: _.Tracker) {
    tracker.pushOptional(obj.team, (x) => tracker.pushString(x));
    tracker.pushString(obj.objectType);
    tracker.pushOptional(obj.destructibleObjectType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.environmentObjectType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.interactiveObjectType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.active, (x) => tracker.pushBoolean(x));
    tracker.pushOptional(obj.towerName, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.width, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.height, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.angle, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.durability, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.maxDurability, (x) => tracker.pushUInt(x));
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
    return tracker;
  },
  decode(input: Uint8Array): ObjectState {
    return ObjectState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ObjectState {
    return {
      team: tracker.nextOptional(() => tracker.nextString()),
      objectType: tracker.nextString(),
      destructibleObjectType: tracker.nextOptional(() => tracker.nextString()),
      environmentObjectType: tracker.nextOptional(() => tracker.nextString()),
      interactiveObjectType: tracker.nextOptional(() => tracker.nextString()),
      active: tracker.nextOptional(() => tracker.nextBoolean()),
      towerName: tracker.nextOptional(() => tracker.nextString()),
      width: tracker.nextOptional(() => tracker.nextUInt()),
      height: tracker.nextOptional(() => tracker.nextUInt()),
      angle: tracker.nextOptional(() => tracker.nextInt()),
      durability: tracker.nextOptional(() => tracker.nextUInt()),
      maxDurability: tracker.nextOptional(() => tracker.nextUInt()),
      x: tracker.nextInt(),
      y: tracker.nextInt(),
    };
  },
  computeDiff(a: ObjectState, b: ObjectState): _.DeepPartial<ObjectState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<ObjectState> =  {
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
    return diff.team === _.NO_DIFF && diff.objectType === _.NO_DIFF && diff.destructibleObjectType === _.NO_DIFF && diff.environmentObjectType === _.NO_DIFF && diff.interactiveObjectType === _.NO_DIFF && diff.active === _.NO_DIFF && diff.towerName === _.NO_DIFF && diff.width === _.NO_DIFF && diff.height === _.NO_DIFF && diff.angle === _.NO_DIFF && diff.durability === _.NO_DIFF && diff.maxDurability === _.NO_DIFF && diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<ObjectState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return ObjectState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<ObjectState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.team !== _.NO_DIFF);
    if (obj.team !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.team!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.objectType !== _.NO_DIFF);
    if (obj.objectType !== _.NO_DIFF) {
      tracker.pushString(obj.objectType);
    }
    tracker.pushBoolean(obj.destructibleObjectType !== _.NO_DIFF);
    if (obj.destructibleObjectType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.destructibleObjectType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.environmentObjectType !== _.NO_DIFF);
    if (obj.environmentObjectType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.environmentObjectType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.interactiveObjectType !== _.NO_DIFF);
    if (obj.interactiveObjectType !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.interactiveObjectType!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.active !== _.NO_DIFF);
    if (obj.active !== _.NO_DIFF) {
      tracker.pushOptionalDiff<boolean>(obj.active!, (x) => tracker.pushBoolean(x), (x) => tracker.pushBoolean(x));
    }
    tracker.pushBoolean(obj.towerName !== _.NO_DIFF);
    if (obj.towerName !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.towerName!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.width !== _.NO_DIFF);
    if (obj.width !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.width!, (x) => tracker.pushUInt(x), (x) => tracker.pushUInt(x));
    }
    tracker.pushBoolean(obj.height !== _.NO_DIFF);
    if (obj.height !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.height!, (x) => tracker.pushUInt(x), (x) => tracker.pushUInt(x));
    }
    tracker.pushBoolean(obj.angle !== _.NO_DIFF);
    if (obj.angle !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.angle!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.durability !== _.NO_DIFF);
    if (obj.durability !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.durability!, (x) => tracker.pushUInt(x), (x) => tracker.pushUInt(x));
    }
    tracker.pushBoolean(obj.maxDurability !== _.NO_DIFF);
    if (obj.maxDurability !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.maxDurability!, (x) => tracker.pushUInt(x), (x) => tracker.pushUInt(x));
    }
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushInt(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushInt(obj.y);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<ObjectState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return ObjectState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<ObjectState> {
    return {
      team: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      objectType: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      destructibleObjectType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      environmentObjectType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      interactiveObjectType: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      active: tracker.nextBoolean() ? tracker.nextOptionalDiff<boolean>(() => tracker.nextBoolean(), () => tracker.nextBoolean()) : _.NO_DIFF,
      towerName: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      width: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextUInt(), () => tracker.nextUInt()) : _.NO_DIFF,
      height: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextUInt(), () => tracker.nextUInt()) : _.NO_DIFF,
      angle: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      durability: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextUInt(), () => tracker.nextUInt()) : _.NO_DIFF,
      maxDurability: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextUInt(), () => tracker.nextUInt()) : _.NO_DIFF,
      x: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: ObjectState, diff: _.DeepPartial<ObjectState> | typeof _.NO_DIFF): ObjectState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      team: diff.team === _.NO_DIFF ? obj.team : _.patchOptional<string>(obj.team, diff.team!, (a, b) => b),
      objectType: diff.objectType === _.NO_DIFF ? obj.objectType : diff.objectType,
      destructibleObjectType: diff.destructibleObjectType === _.NO_DIFF ? obj.destructibleObjectType : _.patchOptional<string>(obj.destructibleObjectType, diff.destructibleObjectType!, (a, b) => b),
      environmentObjectType: diff.environmentObjectType === _.NO_DIFF ? obj.environmentObjectType : _.patchOptional<string>(obj.environmentObjectType, diff.environmentObjectType!, (a, b) => b),
      interactiveObjectType: diff.interactiveObjectType === _.NO_DIFF ? obj.interactiveObjectType : _.patchOptional<string>(obj.interactiveObjectType, diff.interactiveObjectType!, (a, b) => b),
      active: diff.active === _.NO_DIFF ? obj.active : _.patchOptional<boolean>(obj.active, diff.active!, (a, b) => b),
      towerName: diff.towerName === _.NO_DIFF ? obj.towerName : _.patchOptional<string>(obj.towerName, diff.towerName!, (a, b) => b),
      width: diff.width === _.NO_DIFF ? obj.width : _.patchOptional<number>(obj.width, diff.width!, (a, b) => b),
      height: diff.height === _.NO_DIFF ? obj.height : _.patchOptional<number>(obj.height, diff.height!, (a, b) => b),
      angle: diff.angle === _.NO_DIFF ? obj.angle : _.patchOptional<number>(obj.angle, diff.angle!, (a, b) => b),
      durability: diff.durability === _.NO_DIFF ? obj.durability : _.patchOptional<number>(obj.durability, diff.durability!, (a, b) => b),
      maxDurability: diff.maxDurability === _.NO_DIFF ? obj.maxDurability : _.patchOptional<number>(obj.maxDurability, diff.maxDurability!, (a, b) => b),
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
    };
  },
};

export const PlayerState = {
  default(): PlayerState {
    return {
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
  validate(obj: PlayerState) {
    if (typeof obj !== "object") {
      return [`Invalid PlayerState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.name");
    }
    validationErrors = _.validateOptional(obj.team, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.team");
    }
    validationErrors = _.validateOptional(obj.hero, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.hero");
    }
    validationErrors = _.validateOptional(obj.cents, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.cents");
    }
    validationErrors = _.validateOptional(obj.deck, (x) => DeckState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.deck");
    }
    validationErrors = _.validateArray(obj.randomSlots, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.randomSlots");
    }
    validationErrors = _.validateOptional(obj.hand, (x) => HandState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.hand");
    }
    validationErrors = _.validateOptional(obj.skills, (x) => SkillsState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.skills");
    }
    validationErrors = _.validatePrimitive(typeof obj.restrictionZones === "string", `Invalid string: ${obj.restrictionZones}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: PlayerState.restrictionZones");
    }

    return validationErrors;
  },
  encode(obj: PlayerState) {
    return PlayerState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: PlayerState, tracker: _.Tracker) {
    tracker.pushString(obj.name);
    tracker.pushOptional(obj.team, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.hero, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.cents, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.deck, (x) => DeckState._encode(x, tracker));
    tracker.pushArray(obj.randomSlots, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.hand, (x) => HandState._encode(x, tracker));
    tracker.pushOptional(obj.skills, (x) => SkillsState._encode(x, tracker));
    tracker.pushString(obj.restrictionZones);
    return tracker;
  },
  decode(input: Uint8Array): PlayerState {
    return PlayerState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): PlayerState {
    return {
      name: tracker.nextString(),
      team: tracker.nextOptional(() => tracker.nextString()),
      hero: tracker.nextOptional(() => tracker.nextUInt()),
      cents: tracker.nextOptional(() => tracker.nextUInt()),
      deck: tracker.nextOptional(() => DeckState._decode(tracker)),
      randomSlots: tracker.nextArray(() => tracker.nextString()),
      hand: tracker.nextOptional(() => HandState._decode(tracker)),
      skills: tracker.nextOptional(() => SkillsState._decode(tracker)),
      restrictionZones: tracker.nextString(),
    };
  },
  computeDiff(a: PlayerState, b: PlayerState): _.DeepPartial<PlayerState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<PlayerState> =  {
      name: _.diffPrimitive(a.name, b.name),
      team: _.diffOptional(a.team, b.team, (x, y) => _.diffPrimitive(x, y)),
      hero: _.diffOptional(a.hero, b.hero, (x, y) => _.diffPrimitive(x, y)),
      cents: _.diffOptional(a.cents, b.cents, (x, y) => _.diffPrimitive(x, y)),
      deck: _.diffOptional(a.deck, b.deck, (x, y) => DeckState.computeDiff(x, y)),
      randomSlots: _.diffArray(a.randomSlots, b.randomSlots, (x, y) => _.diffPrimitive(x, y)),
      hand: _.diffOptional(a.hand, b.hand, (x, y) => HandState.computeDiff(x, y)),
      skills: _.diffOptional(a.skills, b.skills, (x, y) => SkillsState.computeDiff(x, y)),
      restrictionZones: _.diffPrimitive(a.restrictionZones, b.restrictionZones),
    };
    return diff.name === _.NO_DIFF && diff.team === _.NO_DIFF && diff.hero === _.NO_DIFF && diff.cents === _.NO_DIFF && diff.deck === _.NO_DIFF && diff.randomSlots === _.NO_DIFF && diff.hand === _.NO_DIFF && diff.skills === _.NO_DIFF && diff.restrictionZones === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<PlayerState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return PlayerState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<PlayerState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.name !== _.NO_DIFF);
    if (obj.name !== _.NO_DIFF) {
      tracker.pushString(obj.name);
    }
    tracker.pushBoolean(obj.team !== _.NO_DIFF);
    if (obj.team !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.team!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.hero !== _.NO_DIFF);
    if (obj.hero !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.hero!, (x) => tracker.pushUInt(x), (x) => tracker.pushUInt(x));
    }
    tracker.pushBoolean(obj.cents !== _.NO_DIFF);
    if (obj.cents !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.cents!, (x) => tracker.pushUInt(x), (x) => tracker.pushUInt(x));
    }
    tracker.pushBoolean(obj.deck !== _.NO_DIFF);
    if (obj.deck !== _.NO_DIFF) {
      tracker.pushOptionalDiff<DeckState>(obj.deck!, (x) => DeckState._encode(x, tracker), (x) => DeckState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.randomSlots !== _.NO_DIFF);
    if (obj.randomSlots !== _.NO_DIFF) {
      tracker.pushArrayDiff<string>(obj.randomSlots, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.hand !== _.NO_DIFF);
    if (obj.hand !== _.NO_DIFF) {
      tracker.pushOptionalDiff<HandState>(obj.hand!, (x) => HandState._encode(x, tracker), (x) => HandState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.skills !== _.NO_DIFF);
    if (obj.skills !== _.NO_DIFF) {
      tracker.pushOptionalDiff<SkillsState>(obj.skills!, (x) => SkillsState._encode(x, tracker), (x) => SkillsState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.restrictionZones !== _.NO_DIFF);
    if (obj.restrictionZones !== _.NO_DIFF) {
      tracker.pushString(obj.restrictionZones);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<PlayerState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return PlayerState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<PlayerState> {
    return {
      name: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      team: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      hero: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextUInt(), () => tracker.nextUInt()) : _.NO_DIFF,
      cents: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextUInt(), () => tracker.nextUInt()) : _.NO_DIFF,
      deck: tracker.nextBoolean() ? tracker.nextOptionalDiff<DeckState>(() => DeckState._decode(tracker), () => DeckState._decodeDiff(tracker)) : _.NO_DIFF,
      randomSlots: tracker.nextBoolean() ? tracker.nextArrayDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      hand: tracker.nextBoolean() ? tracker.nextOptionalDiff<HandState>(() => HandState._decode(tracker), () => HandState._decodeDiff(tracker)) : _.NO_DIFF,
      skills: tracker.nextBoolean() ? tracker.nextOptionalDiff<SkillsState>(() => SkillsState._decode(tracker), () => SkillsState._decodeDiff(tracker)) : _.NO_DIFF,
      restrictionZones: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
    };
  },
  applyDiff(obj: PlayerState, diff: _.DeepPartial<PlayerState> | typeof _.NO_DIFF): PlayerState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      name: diff.name === _.NO_DIFF ? obj.name : diff.name,
      team: diff.team === _.NO_DIFF ? obj.team : _.patchOptional<string>(obj.team, diff.team!, (a, b) => b),
      hero: diff.hero === _.NO_DIFF ? obj.hero : _.patchOptional<number>(obj.hero, diff.hero!, (a, b) => b),
      cents: diff.cents === _.NO_DIFF ? obj.cents : _.patchOptional<number>(obj.cents, diff.cents!, (a, b) => b),
      deck: diff.deck === _.NO_DIFF ? obj.deck : _.patchOptional<DeckState>(obj.deck, diff.deck!, (a, b) => DeckState.applyDiff(a, b)),
      randomSlots: diff.randomSlots === _.NO_DIFF ? obj.randomSlots : _.patchArray<string>(obj.randomSlots, diff.randomSlots, (a, b) => b),
      hand: diff.hand === _.NO_DIFF ? obj.hand : _.patchOptional<HandState>(obj.hand, diff.hand!, (a, b) => HandState.applyDiff(a, b)),
      skills: diff.skills === _.NO_DIFF ? obj.skills : _.patchOptional<SkillsState>(obj.skills, diff.skills!, (a, b) => SkillsState.applyDiff(a, b)),
      restrictionZones: diff.restrictionZones === _.NO_DIFF ? obj.restrictionZones : diff.restrictionZones,
    };
  },
};

export const SpectatorState = {
  default(): SpectatorState {
    return {
      name: "",
    };
  },
  validate(obj: SpectatorState) {
    if (typeof obj !== "object") {
      return [`Invalid SpectatorState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.name === "string", `Invalid string: ${obj.name}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: SpectatorState.name");
    }

    return validationErrors;
  },
  encode(obj: SpectatorState) {
    return SpectatorState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: SpectatorState, tracker: _.Tracker) {
    tracker.pushString(obj.name);
    return tracker;
  },
  decode(input: Uint8Array): SpectatorState {
    return SpectatorState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): SpectatorState {
    return {
      name: tracker.nextString(),
    };
  },
  computeDiff(a: SpectatorState, b: SpectatorState): _.DeepPartial<SpectatorState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<SpectatorState> =  {
      name: _.diffPrimitive(a.name, b.name),
    };
    return diff.name === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<SpectatorState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return SpectatorState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<SpectatorState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.name !== _.NO_DIFF);
    if (obj.name !== _.NO_DIFF) {
      tracker.pushString(obj.name);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<SpectatorState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return SpectatorState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<SpectatorState> {
    return {
      name: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
    };
  },
  applyDiff(obj: SpectatorState, diff: _.DeepPartial<SpectatorState> | typeof _.NO_DIFF): SpectatorState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      name: diff.name === _.NO_DIFF ? obj.name : diff.name,
    };
  },
};

export const DeckState = {
  default(): DeckState {
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
  validate(obj: DeckState) {
    if (typeof obj !== "object") {
      return [`Invalid DeckState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.card1, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DeckState.card1");
    }
    validationErrors = _.validateOptional(obj.card2, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DeckState.card2");
    }
    validationErrors = _.validateOptional(obj.card3, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DeckState.card3");
    }
    validationErrors = _.validateOptional(obj.card4, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DeckState.card4");
    }
    validationErrors = _.validateOptional(obj.card5, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DeckState.card5");
    }
    validationErrors = _.validateOptional(obj.card6, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DeckState.card6");
    }
    validationErrors = _.validateOptional(obj.card7, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DeckState.card7");
    }
    validationErrors = _.validateOptional(obj.card8, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DeckState.card8");
    }

    return validationErrors;
  },
  encode(obj: DeckState) {
    return DeckState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: DeckState, tracker: _.Tracker) {
    tracker.pushOptional(obj.card1, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card2, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card3, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card4, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card5, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card6, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card7, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card8, (x) => tracker.pushString(x));
    return tracker;
  },
  decode(input: Uint8Array): DeckState {
    return DeckState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): DeckState {
    return {
      card1: tracker.nextOptional(() => tracker.nextString()),
      card2: tracker.nextOptional(() => tracker.nextString()),
      card3: tracker.nextOptional(() => tracker.nextString()),
      card4: tracker.nextOptional(() => tracker.nextString()),
      card5: tracker.nextOptional(() => tracker.nextString()),
      card6: tracker.nextOptional(() => tracker.nextString()),
      card7: tracker.nextOptional(() => tracker.nextString()),
      card8: tracker.nextOptional(() => tracker.nextString()),
    };
  },
  computeDiff(a: DeckState, b: DeckState): _.DeepPartial<DeckState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<DeckState> =  {
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
  encodeDiff(obj: _.DeepPartial<DeckState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return DeckState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<DeckState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.card1 !== _.NO_DIFF);
    if (obj.card1 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card1!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card2 !== _.NO_DIFF);
    if (obj.card2 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card2!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card3 !== _.NO_DIFF);
    if (obj.card3 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card3!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card4 !== _.NO_DIFF);
    if (obj.card4 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card4!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card5 !== _.NO_DIFF);
    if (obj.card5 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card5!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card6 !== _.NO_DIFF);
    if (obj.card6 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card6!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card7 !== _.NO_DIFF);
    if (obj.card7 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card7!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card8 !== _.NO_DIFF);
    if (obj.card8 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card8!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<DeckState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return DeckState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<DeckState> {
    return {
      card1: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card2: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card3: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card4: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card5: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card6: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card7: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card8: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
    };
  },
  applyDiff(obj: DeckState, diff: _.DeepPartial<DeckState> | typeof _.NO_DIFF): DeckState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      card1: diff.card1 === _.NO_DIFF ? obj.card1 : _.patchOptional<string>(obj.card1, diff.card1!, (a, b) => b),
      card2: diff.card2 === _.NO_DIFF ? obj.card2 : _.patchOptional<string>(obj.card2, diff.card2!, (a, b) => b),
      card3: diff.card3 === _.NO_DIFF ? obj.card3 : _.patchOptional<string>(obj.card3, diff.card3!, (a, b) => b),
      card4: diff.card4 === _.NO_DIFF ? obj.card4 : _.patchOptional<string>(obj.card4, diff.card4!, (a, b) => b),
      card5: diff.card5 === _.NO_DIFF ? obj.card5 : _.patchOptional<string>(obj.card5, diff.card5!, (a, b) => b),
      card6: diff.card6 === _.NO_DIFF ? obj.card6 : _.patchOptional<string>(obj.card6, diff.card6!, (a, b) => b),
      card7: diff.card7 === _.NO_DIFF ? obj.card7 : _.patchOptional<string>(obj.card7, diff.card7!, (a, b) => b),
      card8: diff.card8 === _.NO_DIFF ? obj.card8 : _.patchOptional<string>(obj.card8, diff.card8!, (a, b) => b),
    };
  },
};

export const HandState = {
  default(): HandState {
    return {
      slot1: undefined,
      slot2: undefined,
      slot3: undefined,
      slot4: undefined,
    };
  },
  validate(obj: HandState) {
    if (typeof obj !== "object") {
      return [`Invalid HandState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.slot1, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: HandState.slot1");
    }
    validationErrors = _.validateOptional(obj.slot2, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: HandState.slot2");
    }
    validationErrors = _.validateOptional(obj.slot3, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: HandState.slot3");
    }
    validationErrors = _.validateOptional(obj.slot4, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: HandState.slot4");
    }

    return validationErrors;
  },
  encode(obj: HandState) {
    return HandState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: HandState, tracker: _.Tracker) {
    tracker.pushOptional(obj.slot1, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.slot2, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.slot3, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.slot4, (x) => tracker.pushString(x));
    return tracker;
  },
  decode(input: Uint8Array): HandState {
    return HandState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): HandState {
    return {
      slot1: tracker.nextOptional(() => tracker.nextString()),
      slot2: tracker.nextOptional(() => tracker.nextString()),
      slot3: tracker.nextOptional(() => tracker.nextString()),
      slot4: tracker.nextOptional(() => tracker.nextString()),
    };
  },
  computeDiff(a: HandState, b: HandState): _.DeepPartial<HandState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<HandState> =  {
      slot1: _.diffOptional(a.slot1, b.slot1, (x, y) => _.diffPrimitive(x, y)),
      slot2: _.diffOptional(a.slot2, b.slot2, (x, y) => _.diffPrimitive(x, y)),
      slot3: _.diffOptional(a.slot3, b.slot3, (x, y) => _.diffPrimitive(x, y)),
      slot4: _.diffOptional(a.slot4, b.slot4, (x, y) => _.diffPrimitive(x, y)),
    };
    return diff.slot1 === _.NO_DIFF && diff.slot2 === _.NO_DIFF && diff.slot3 === _.NO_DIFF && diff.slot4 === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<HandState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return HandState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<HandState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.slot1 !== _.NO_DIFF);
    if (obj.slot1 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.slot1!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.slot2 !== _.NO_DIFF);
    if (obj.slot2 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.slot2!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.slot3 !== _.NO_DIFF);
    if (obj.slot3 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.slot3!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.slot4 !== _.NO_DIFF);
    if (obj.slot4 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.slot4!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<HandState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return HandState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<HandState> {
    return {
      slot1: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      slot2: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      slot3: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      slot4: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
    };
  },
  applyDiff(obj: HandState, diff: _.DeepPartial<HandState> | typeof _.NO_DIFF): HandState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      slot1: diff.slot1 === _.NO_DIFF ? obj.slot1 : _.patchOptional<string>(obj.slot1, diff.slot1!, (a, b) => b),
      slot2: diff.slot2 === _.NO_DIFF ? obj.slot2 : _.patchOptional<string>(obj.slot2, diff.slot2!, (a, b) => b),
      slot3: diff.slot3 === _.NO_DIFF ? obj.slot3 : _.patchOptional<string>(obj.slot3, diff.slot3!, (a, b) => b),
      slot4: diff.slot4 === _.NO_DIFF ? obj.slot4 : _.patchOptional<string>(obj.slot4, diff.slot4!, (a, b) => b),
    };
  },
};

export const SkillsState = {
  default(): SkillsState {
    return {
      slot1: undefined,
      slot2: undefined,
      slot3: undefined,
      slot4: undefined,
    };
  },
  validate(obj: SkillsState) {
    if (typeof obj !== "object") {
      return [`Invalid SkillsState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateOptional(obj.slot1, (x) => SkillState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: SkillsState.slot1");
    }
    validationErrors = _.validateOptional(obj.slot2, (x) => SkillState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: SkillsState.slot2");
    }
    validationErrors = _.validateOptional(obj.slot3, (x) => SkillState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: SkillsState.slot3");
    }
    validationErrors = _.validateOptional(obj.slot4, (x) => SkillState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: SkillsState.slot4");
    }

    return validationErrors;
  },
  encode(obj: SkillsState) {
    return SkillsState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: SkillsState, tracker: _.Tracker) {
    tracker.pushOptional(obj.slot1, (x) => SkillState._encode(x, tracker));
    tracker.pushOptional(obj.slot2, (x) => SkillState._encode(x, tracker));
    tracker.pushOptional(obj.slot3, (x) => SkillState._encode(x, tracker));
    tracker.pushOptional(obj.slot4, (x) => SkillState._encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array): SkillsState {
    return SkillsState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): SkillsState {
    return {
      slot1: tracker.nextOptional(() => SkillState._decode(tracker)),
      slot2: tracker.nextOptional(() => SkillState._decode(tracker)),
      slot3: tracker.nextOptional(() => SkillState._decode(tracker)),
      slot4: tracker.nextOptional(() => SkillState._decode(tracker)),
    };
  },
  computeDiff(a: SkillsState, b: SkillsState): _.DeepPartial<SkillsState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<SkillsState> =  {
      slot1: _.diffOptional(a.slot1, b.slot1, (x, y) => SkillState.computeDiff(x, y)),
      slot2: _.diffOptional(a.slot2, b.slot2, (x, y) => SkillState.computeDiff(x, y)),
      slot3: _.diffOptional(a.slot3, b.slot3, (x, y) => SkillState.computeDiff(x, y)),
      slot4: _.diffOptional(a.slot4, b.slot4, (x, y) => SkillState.computeDiff(x, y)),
    };
    return diff.slot1 === _.NO_DIFF && diff.slot2 === _.NO_DIFF && diff.slot3 === _.NO_DIFF && diff.slot4 === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<SkillsState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return SkillsState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<SkillsState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.slot1 !== _.NO_DIFF);
    if (obj.slot1 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<SkillState>(obj.slot1!, (x) => SkillState._encode(x, tracker), (x) => SkillState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.slot2 !== _.NO_DIFF);
    if (obj.slot2 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<SkillState>(obj.slot2!, (x) => SkillState._encode(x, tracker), (x) => SkillState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.slot3 !== _.NO_DIFF);
    if (obj.slot3 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<SkillState>(obj.slot3!, (x) => SkillState._encode(x, tracker), (x) => SkillState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.slot4 !== _.NO_DIFF);
    if (obj.slot4 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<SkillState>(obj.slot4!, (x) => SkillState._encode(x, tracker), (x) => SkillState._encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<SkillsState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return SkillsState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<SkillsState> {
    return {
      slot1: tracker.nextBoolean() ? tracker.nextOptionalDiff<SkillState>(() => SkillState._decode(tracker), () => SkillState._decodeDiff(tracker)) : _.NO_DIFF,
      slot2: tracker.nextBoolean() ? tracker.nextOptionalDiff<SkillState>(() => SkillState._decode(tracker), () => SkillState._decodeDiff(tracker)) : _.NO_DIFF,
      slot3: tracker.nextBoolean() ? tracker.nextOptionalDiff<SkillState>(() => SkillState._decode(tracker), () => SkillState._decodeDiff(tracker)) : _.NO_DIFF,
      slot4: tracker.nextBoolean() ? tracker.nextOptionalDiff<SkillState>(() => SkillState._decode(tracker), () => SkillState._decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: SkillsState, diff: _.DeepPartial<SkillsState> | typeof _.NO_DIFF): SkillsState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      slot1: diff.slot1 === _.NO_DIFF ? obj.slot1 : _.patchOptional<SkillState>(obj.slot1, diff.slot1!, (a, b) => SkillState.applyDiff(a, b)),
      slot2: diff.slot2 === _.NO_DIFF ? obj.slot2 : _.patchOptional<SkillState>(obj.slot2, diff.slot2!, (a, b) => SkillState.applyDiff(a, b)),
      slot3: diff.slot3 === _.NO_DIFF ? obj.slot3 : _.patchOptional<SkillState>(obj.slot3, diff.slot3!, (a, b) => SkillState.applyDiff(a, b)),
      slot4: diff.slot4 === _.NO_DIFF ? obj.slot4 : _.patchOptional<SkillState>(obj.slot4, diff.slot4!, (a, b) => SkillState.applyDiff(a, b)),
    };
  },
};

export const SkillState = {
  default(): SkillState {
    return {
      type: "",
      inUse: false,
      cooldown: 0,
      cooldownTotal: 0,
    };
  },
  validate(obj: SkillState) {
    if (typeof obj !== "object") {
      return [`Invalid SkillState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.type === "string", `Invalid string: ${obj.type}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: SkillState.type");
    }
    validationErrors = _.validatePrimitive(typeof obj.inUse === "boolean", `Invalid boolean: ${obj.inUse}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: SkillState.inUse");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.cooldown) && obj.cooldown >= 0, `Invalid uint: ${obj.cooldown}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: SkillState.cooldown");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.cooldownTotal) && obj.cooldownTotal >= 0, `Invalid uint: ${obj.cooldownTotal}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: SkillState.cooldownTotal");
    }

    return validationErrors;
  },
  encode(obj: SkillState) {
    return SkillState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: SkillState, tracker: _.Tracker) {
    tracker.pushString(obj.type);
    tracker.pushBoolean(obj.inUse);
    tracker.pushUInt(obj.cooldown);
    tracker.pushUInt(obj.cooldownTotal);
    return tracker;
  },
  decode(input: Uint8Array): SkillState {
    return SkillState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): SkillState {
    return {
      type: tracker.nextString(),
      inUse: tracker.nextBoolean(),
      cooldown: tracker.nextUInt(),
      cooldownTotal: tracker.nextUInt(),
    };
  },
  computeDiff(a: SkillState, b: SkillState): _.DeepPartial<SkillState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<SkillState> =  {
      type: _.diffPrimitive(a.type, b.type),
      inUse: _.diffPrimitive(a.inUse, b.inUse),
      cooldown: _.diffPrimitive(a.cooldown, b.cooldown),
      cooldownTotal: _.diffPrimitive(a.cooldownTotal, b.cooldownTotal),
    };
    return diff.type === _.NO_DIFF && diff.inUse === _.NO_DIFF && diff.cooldown === _.NO_DIFF && diff.cooldownTotal === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<SkillState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return SkillState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<SkillState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.type !== _.NO_DIFF);
    if (obj.type !== _.NO_DIFF) {
      tracker.pushString(obj.type);
    }
    tracker.pushBoolean(obj.inUse !== _.NO_DIFF);
    if (obj.inUse !== _.NO_DIFF) {
      tracker.pushBoolean(obj.inUse);
    }
    tracker.pushBoolean(obj.cooldown !== _.NO_DIFF);
    if (obj.cooldown !== _.NO_DIFF) {
      tracker.pushUInt(obj.cooldown);
    }
    tracker.pushBoolean(obj.cooldownTotal !== _.NO_DIFF);
    if (obj.cooldownTotal !== _.NO_DIFF) {
      tracker.pushUInt(obj.cooldownTotal);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<SkillState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return SkillState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<SkillState> {
    return {
      type: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      inUse: tracker.nextBoolean() ? tracker.nextBoolean() : _.NO_DIFF,
      cooldown: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      cooldownTotal: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: SkillState, diff: _.DeepPartial<SkillState> | typeof _.NO_DIFF): SkillState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      type: diff.type === _.NO_DIFF ? obj.type : diff.type,
      inUse: diff.inUse === _.NO_DIFF ? obj.inUse : diff.inUse,
      cooldown: diff.cooldown === _.NO_DIFF ? obj.cooldown : diff.cooldown,
      cooldownTotal: diff.cooldownTotal === _.NO_DIFF ? obj.cooldownTotal : diff.cooldownTotal,
    };
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
    validationErrors = _.validateOptional(obj.timeLimit, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`));
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
  encode(obj: GameInfo) {
    return GameInfo._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: GameInfo, tracker: _.Tracker) {
    tracker.pushOptional(obj.mode, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.timeLimit, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.timeElapsed, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.suddenDeath, (x) => tracker.pushBoolean(x));
    tracker.pushOptional(obj.winner, (x) => tracker.pushString(x));
    return tracker;
  },
  decode(input: Uint8Array): GameInfo {
    return GameInfo._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): GameInfo {
    return {
      mode: tracker.nextOptional(() => tracker.nextString()),
      timeLimit: tracker.nextOptional(() => tracker.nextUInt()),
      timeElapsed: tracker.nextOptional(() => tracker.nextInt()),
      suddenDeath: tracker.nextOptional(() => tracker.nextBoolean()),
      winner: tracker.nextOptional(() => tracker.nextString()),
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
  encodeDiff(obj: _.DeepPartial<GameInfo> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return GameInfo._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<GameInfo>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.mode !== _.NO_DIFF);
    if (obj.mode !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.mode!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.timeLimit !== _.NO_DIFF);
    if (obj.timeLimit !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.timeLimit!, (x) => tracker.pushUInt(x), (x) => tracker.pushUInt(x));
    }
    tracker.pushBoolean(obj.timeElapsed !== _.NO_DIFF);
    if (obj.timeElapsed !== _.NO_DIFF) {
      tracker.pushOptionalDiff<number>(obj.timeElapsed!, (x) => tracker.pushInt(x), (x) => tracker.pushInt(x));
    }
    tracker.pushBoolean(obj.suddenDeath !== _.NO_DIFF);
    if (obj.suddenDeath !== _.NO_DIFF) {
      tracker.pushOptionalDiff<boolean>(obj.suddenDeath!, (x) => tracker.pushBoolean(x), (x) => tracker.pushBoolean(x));
    }
    tracker.pushBoolean(obj.winner !== _.NO_DIFF);
    if (obj.winner !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.winner!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<GameInfo> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return GameInfo._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<GameInfo> {
    return {
      mode: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      timeLimit: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextUInt(), () => tracker.nextUInt()) : _.NO_DIFF,
      timeElapsed: tracker.nextBoolean() ? tracker.nextOptionalDiff<number>(() => tracker.nextInt(), () => tracker.nextInt()) : _.NO_DIFF,
      suddenDeath: tracker.nextBoolean() ? tracker.nextOptionalDiff<boolean>(() => tracker.nextBoolean(), () => tracker.nextBoolean()) : _.NO_DIFF,
      winner: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
    };
  },
  applyDiff(obj: GameInfo, diff: _.DeepPartial<GameInfo> | typeof _.NO_DIFF): GameInfo {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      mode: diff.mode === _.NO_DIFF ? obj.mode : _.patchOptional<string>(obj.mode, diff.mode!, (a, b) => b),
      timeLimit: diff.timeLimit === _.NO_DIFF ? obj.timeLimit : _.patchOptional<number>(obj.timeLimit, diff.timeLimit!, (a, b) => b),
      timeElapsed: diff.timeElapsed === _.NO_DIFF ? obj.timeElapsed : _.patchOptional<number>(obj.timeElapsed, diff.timeElapsed!, (a, b) => b),
      suddenDeath: diff.suddenDeath === _.NO_DIFF ? obj.suddenDeath : _.patchOptional<boolean>(obj.suddenDeath, diff.suddenDeath!, (a, b) => b),
      winner: diff.winner === _.NO_DIFF ? obj.winner : _.patchOptional<string>(obj.winner, diff.winner!, (a, b) => b),
    };
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

    validationErrors = _.validatePrimitive(Number.isInteger(obj.timeRemaining) && obj.timeRemaining >= 0, `Invalid uint: ${obj.timeRemaining}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftState.timeRemaining");
    }
    validationErrors = _.validateArray(obj.decks, (x) => DraftDeckState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftState.decks");
    }
    validationErrors = _.validateArray(obj.pairs, (x) => CardPairState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftState.pairs");
    }

    return validationErrors;
  },
  encode(obj: DraftState) {
    return DraftState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: DraftState, tracker: _.Tracker) {
    tracker.pushUInt(obj.timeRemaining);
    tracker.pushArray(obj.decks, (x) => DraftDeckState._encode(x, tracker));
    tracker.pushArray(obj.pairs, (x) => CardPairState._encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array): DraftState {
    return DraftState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): DraftState {
    return {
      timeRemaining: tracker.nextUInt(),
      decks: tracker.nextArray(() => DraftDeckState._decode(tracker)),
      pairs: tracker.nextArray(() => CardPairState._decode(tracker)),
    };
  },
  computeDiff(a: DraftState, b: DraftState): _.DeepPartial<DraftState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<DraftState> =  {
      timeRemaining: _.diffPrimitive(a.timeRemaining, b.timeRemaining),
      decks: _.diffArray(a.decks, b.decks, (x, y) => DraftDeckState.computeDiff(x, y)),
      pairs: _.diffArray(a.pairs, b.pairs, (x, y) => CardPairState.computeDiff(x, y)),
    };
    return diff.timeRemaining === _.NO_DIFF && diff.decks === _.NO_DIFF && diff.pairs === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<DraftState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return DraftState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<DraftState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.timeRemaining !== _.NO_DIFF);
    if (obj.timeRemaining !== _.NO_DIFF) {
      tracker.pushUInt(obj.timeRemaining);
    }
    tracker.pushBoolean(obj.decks !== _.NO_DIFF);
    if (obj.decks !== _.NO_DIFF) {
      tracker.pushArrayDiff<DraftDeckState>(obj.decks, (x) => DraftDeckState._encode(x, tracker), (x) => DraftDeckState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.pairs !== _.NO_DIFF);
    if (obj.pairs !== _.NO_DIFF) {
      tracker.pushArrayDiff<CardPairState>(obj.pairs, (x) => CardPairState._encode(x, tracker), (x) => CardPairState._encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<DraftState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return DraftState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<DraftState> {
    return {
      timeRemaining: tracker.nextBoolean() ? tracker.nextUInt() : _.NO_DIFF,
      decks: tracker.nextBoolean() ? tracker.nextArrayDiff<DraftDeckState>(() => DraftDeckState._decode(tracker), () => DraftDeckState._decodeDiff(tracker)) : _.NO_DIFF,
      pairs: tracker.nextBoolean() ? tracker.nextArrayDiff<CardPairState>(() => CardPairState._decode(tracker), () => CardPairState._decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: DraftState, diff: _.DeepPartial<DraftState> | typeof _.NO_DIFF): DraftState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      timeRemaining: diff.timeRemaining === _.NO_DIFF ? obj.timeRemaining : diff.timeRemaining,
      decks: diff.decks === _.NO_DIFF ? obj.decks : _.patchArray<DraftDeckState>(obj.decks, diff.decks, (a, b) => DraftDeckState.applyDiff(a, b)),
      pairs: diff.pairs === _.NO_DIFF ? obj.pairs : _.patchArray<CardPairState>(obj.pairs, diff.pairs, (a, b) => CardPairState.applyDiff(a, b)),
    };
  },
};

export const DraftDeckState = {
  default(): DraftDeckState {
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
  validate(obj: DraftDeckState) {
    if (typeof obj !== "object") {
      return [`Invalid DraftDeckState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.playerId === "string", `Invalid string: ${obj.playerId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeckState.playerId");
    }
    validationErrors = _.validateOptional(obj.card1, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeckState.card1");
    }
    validationErrors = _.validateOptional(obj.card2, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeckState.card2");
    }
    validationErrors = _.validateOptional(obj.card3, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeckState.card3");
    }
    validationErrors = _.validateOptional(obj.card4, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeckState.card4");
    }
    validationErrors = _.validateOptional(obj.card5, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeckState.card5");
    }
    validationErrors = _.validateOptional(obj.card6, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeckState.card6");
    }
    validationErrors = _.validateOptional(obj.card7, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeckState.card7");
    }
    validationErrors = _.validateOptional(obj.card8, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DraftDeckState.card8");
    }

    return validationErrors;
  },
  encode(obj: DraftDeckState) {
    return DraftDeckState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: DraftDeckState, tracker: _.Tracker) {
    tracker.pushString(obj.playerId);
    tracker.pushOptional(obj.card1, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card2, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card3, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card4, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card5, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card6, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card7, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card8, (x) => tracker.pushString(x));
    return tracker;
  },
  decode(input: Uint8Array): DraftDeckState {
    return DraftDeckState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): DraftDeckState {
    return {
      playerId: tracker.nextString(),
      card1: tracker.nextOptional(() => tracker.nextString()),
      card2: tracker.nextOptional(() => tracker.nextString()),
      card3: tracker.nextOptional(() => tracker.nextString()),
      card4: tracker.nextOptional(() => tracker.nextString()),
      card5: tracker.nextOptional(() => tracker.nextString()),
      card6: tracker.nextOptional(() => tracker.nextString()),
      card7: tracker.nextOptional(() => tracker.nextString()),
      card8: tracker.nextOptional(() => tracker.nextString()),
    };
  },
  computeDiff(a: DraftDeckState, b: DraftDeckState): _.DeepPartial<DraftDeckState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<DraftDeckState> =  {
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
  encodeDiff(obj: _.DeepPartial<DraftDeckState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return DraftDeckState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<DraftDeckState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.playerId !== _.NO_DIFF);
    if (obj.playerId !== _.NO_DIFF) {
      tracker.pushString(obj.playerId);
    }
    tracker.pushBoolean(obj.card1 !== _.NO_DIFF);
    if (obj.card1 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card1!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card2 !== _.NO_DIFF);
    if (obj.card2 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card2!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card3 !== _.NO_DIFF);
    if (obj.card3 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card3!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card4 !== _.NO_DIFF);
    if (obj.card4 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card4!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card5 !== _.NO_DIFF);
    if (obj.card5 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card5!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card6 !== _.NO_DIFF);
    if (obj.card6 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card6!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card7 !== _.NO_DIFF);
    if (obj.card7 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card7!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    tracker.pushBoolean(obj.card8 !== _.NO_DIFF);
    if (obj.card8 !== _.NO_DIFF) {
      tracker.pushOptionalDiff<string>(obj.card8!, (x) => tracker.pushString(x), (x) => tracker.pushString(x));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<DraftDeckState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return DraftDeckState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<DraftDeckState> {
    return {
      playerId: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      card1: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card2: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card3: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card4: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card5: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card6: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card7: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
      card8: tracker.nextBoolean() ? tracker.nextOptionalDiff<string>(() => tracker.nextString(), () => tracker.nextString()) : _.NO_DIFF,
    };
  },
  applyDiff(obj: DraftDeckState, diff: _.DeepPartial<DraftDeckState> | typeof _.NO_DIFF): DraftDeckState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      playerId: diff.playerId === _.NO_DIFF ? obj.playerId : diff.playerId,
      card1: diff.card1 === _.NO_DIFF ? obj.card1 : _.patchOptional<string>(obj.card1, diff.card1!, (a, b) => b),
      card2: diff.card2 === _.NO_DIFF ? obj.card2 : _.patchOptional<string>(obj.card2, diff.card2!, (a, b) => b),
      card3: diff.card3 === _.NO_DIFF ? obj.card3 : _.patchOptional<string>(obj.card3, diff.card3!, (a, b) => b),
      card4: diff.card4 === _.NO_DIFF ? obj.card4 : _.patchOptional<string>(obj.card4, diff.card4!, (a, b) => b),
      card5: diff.card5 === _.NO_DIFF ? obj.card5 : _.patchOptional<string>(obj.card5, diff.card5!, (a, b) => b),
      card6: diff.card6 === _.NO_DIFF ? obj.card6 : _.patchOptional<string>(obj.card6, diff.card6!, (a, b) => b),
      card7: diff.card7 === _.NO_DIFF ? obj.card7 : _.patchOptional<string>(obj.card7, diff.card7!, (a, b) => b),
      card8: diff.card8 === _.NO_DIFF ? obj.card8 : _.patchOptional<string>(obj.card8, diff.card8!, (a, b) => b),
    };
  },
};

export const CardPairState = {
  default(): CardPairState {
    return {
      playerId: "",
      slot1: "",
      slot2: "",
    };
  },
  validate(obj: CardPairState) {
    if (typeof obj !== "object") {
      return [`Invalid CardPairState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(typeof obj.playerId === "string", `Invalid string: ${obj.playerId}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CardPairState.playerId");
    }
    validationErrors = _.validatePrimitive(typeof obj.slot1 === "string", `Invalid string: ${obj.slot1}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CardPairState.slot1");
    }
    validationErrors = _.validatePrimitive(typeof obj.slot2 === "string", `Invalid string: ${obj.slot2}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: CardPairState.slot2");
    }

    return validationErrors;
  },
  encode(obj: CardPairState) {
    return CardPairState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: CardPairState, tracker: _.Tracker) {
    tracker.pushString(obj.playerId);
    tracker.pushString(obj.slot1);
    tracker.pushString(obj.slot2);
    return tracker;
  },
  decode(input: Uint8Array): CardPairState {
    return CardPairState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): CardPairState {
    return {
      playerId: tracker.nextString(),
      slot1: tracker.nextString(),
      slot2: tracker.nextString(),
    };
  },
  computeDiff(a: CardPairState, b: CardPairState): _.DeepPartial<CardPairState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<CardPairState> =  {
      playerId: _.diffPrimitive(a.playerId, b.playerId),
      slot1: _.diffPrimitive(a.slot1, b.slot1),
      slot2: _.diffPrimitive(a.slot2, b.slot2),
    };
    return diff.playerId === _.NO_DIFF && diff.slot1 === _.NO_DIFF && diff.slot2 === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<CardPairState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return CardPairState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<CardPairState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.playerId !== _.NO_DIFF);
    if (obj.playerId !== _.NO_DIFF) {
      tracker.pushString(obj.playerId);
    }
    tracker.pushBoolean(obj.slot1 !== _.NO_DIFF);
    if (obj.slot1 !== _.NO_DIFF) {
      tracker.pushString(obj.slot1);
    }
    tracker.pushBoolean(obj.slot2 !== _.NO_DIFF);
    if (obj.slot2 !== _.NO_DIFF) {
      tracker.pushString(obj.slot2);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<CardPairState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return CardPairState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<CardPairState> {
    return {
      playerId: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      slot1: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
      slot2: tracker.nextBoolean() ? tracker.nextString() : _.NO_DIFF,
    };
  },
  applyDiff(obj: CardPairState, diff: _.DeepPartial<CardPairState> | typeof _.NO_DIFF): CardPairState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      playerId: diff.playerId === _.NO_DIFF ? obj.playerId : diff.playerId,
      slot1: diff.slot1 === _.NO_DIFF ? obj.slot1 : diff.slot1,
      slot2: diff.slot2 === _.NO_DIFF ? obj.slot2 : diff.slot2,
    };
  },
};

export const DebugBodyState = {
  default(): DebugBodyState {
    return {
      x: 0,
      y: 0,
      points: [],
    };
  },
  validate(obj: DebugBodyState) {
    if (typeof obj !== "object") {
      return [`Invalid DebugBodyState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validatePrimitive(Number.isInteger(obj.x), `Invalid int: ${obj.x}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DebugBodyState.x");
    }
    validationErrors = _.validatePrimitive(Number.isInteger(obj.y), `Invalid int: ${obj.y}`);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DebugBodyState.y");
    }
    validationErrors = _.validateArray(obj.points, (x) => Point.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: DebugBodyState.points");
    }

    return validationErrors;
  },
  encode(obj: DebugBodyState) {
    return DebugBodyState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: DebugBodyState, tracker: _.Tracker) {
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
    tracker.pushArray(obj.points, (x) => Point._encode(x, tracker));
    return tracker;
  },
  decode(input: Uint8Array): DebugBodyState {
    return DebugBodyState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): DebugBodyState {
    return {
      x: tracker.nextInt(),
      y: tracker.nextInt(),
      points: tracker.nextArray(() => Point._decode(tracker)),
    };
  },
  computeDiff(a: DebugBodyState, b: DebugBodyState): _.DeepPartial<DebugBodyState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<DebugBodyState> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
      points: _.diffArray(a.points, b.points, (x, y) => Point.computeDiff(x, y)),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF && diff.points === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<DebugBodyState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return DebugBodyState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<DebugBodyState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushInt(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushInt(obj.y);
    }
    tracker.pushBoolean(obj.points !== _.NO_DIFF);
    if (obj.points !== _.NO_DIFF) {
      tracker.pushArrayDiff<Point>(obj.points, (x) => Point._encode(x, tracker), (x) => Point._encodeDiff(x, tracker));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<DebugBodyState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return DebugBodyState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<DebugBodyState> {
    return {
      x: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      points: tracker.nextBoolean() ? tracker.nextArrayDiff<Point>(() => Point._decode(tracker), () => Point._decodeDiff(tracker)) : _.NO_DIFF,
    };
  },
  applyDiff(obj: DebugBodyState, diff: _.DeepPartial<DebugBodyState> | typeof _.NO_DIFF): DebugBodyState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
      points: diff.points === _.NO_DIFF ? obj.points : _.patchArray<Point>(obj.points, diff.points, (a, b) => Point.applyDiff(a, b)),
    };
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
  encode(obj: Point) {
    return Point._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: Point, tracker: _.Tracker) {
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
    return tracker;
  },
  decode(input: Uint8Array): Point {
    return Point._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): Point {
    return {
      x: tracker.nextInt(),
      y: tracker.nextInt(),
    };
  },
  computeDiff(a: Point, b: Point): _.DeepPartial<Point> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<Point> =  {
      x: _.diffPrimitive(a.x, b.x),
      y: _.diffPrimitive(a.y, b.y),
    };
    return diff.x === _.NO_DIFF && diff.y === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<Point> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return Point._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<Point>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.x !== _.NO_DIFF);
    if (obj.x !== _.NO_DIFF) {
      tracker.pushInt(obj.x);
    }
    tracker.pushBoolean(obj.y !== _.NO_DIFF);
    if (obj.y !== _.NO_DIFF) {
      tracker.pushInt(obj.y);
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<Point> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return Point._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<Point> {
    return {
      x: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
      y: tracker.nextBoolean() ? tracker.nextInt() : _.NO_DIFF,
    };
  },
  applyDiff(obj: Point, diff: _.DeepPartial<Point> | typeof _.NO_DIFF): Point {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      x: diff.x === _.NO_DIFF ? obj.x : diff.x,
      y: diff.y === _.NO_DIFF ? obj.y : diff.y,
    };
  },
};

export const GameState = {
  default(): GameState {
    return {
      creatures: new Map(),
      items: new Map(),
      effects: new Map(),
      objects: new Map(),
      players: new Map(),
      spectators: new Map(),
      info: GameInfo.default(),
      draft: undefined,
      debugBodies: undefined,
    };
  },
  validate(obj: GameState) {
    if (typeof obj !== "object") {
      return [`Invalid GameState object: ${obj}`];
    }
    let validationErrors: string[] = [];

    validationErrors = _.validateRecord(obj.creatures, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`), (x) => CreatureState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.creatures");
    }
    validationErrors = _.validateRecord(obj.items, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`), (x) => ItemState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.items");
    }
    validationErrors = _.validateRecord(obj.effects, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`), (x) => EffectState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.effects");
    }
    validationErrors = _.validateRecord(obj.objects, (x) => _.validatePrimitive(Number.isInteger(x) && x >= 0, `Invalid uint: ${x}`), (x) => ObjectState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.objects");
    }
    validationErrors = _.validateRecord(obj.players, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`), (x) => PlayerState.validate(x));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.players");
    }
    validationErrors = _.validateRecord(obj.spectators, (x) => _.validatePrimitive(typeof x === "string", `Invalid string: ${x}`), (x) => SpectatorState.validate(x));
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
    validationErrors = _.validateOptional(obj.debugBodies, (x) => _.validateArray(x, (x) => DebugBodyState.validate(x)));
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: GameState.debugBodies");
    }

    return validationErrors;
  },
  encode(obj: GameState) {
    return GameState._encode(obj, new _.Tracker()).toBuffer();
  },
  _encode(obj: GameState, tracker: _.Tracker) {
    tracker.pushRecord(obj.creatures, (x) => tracker.pushUInt(x), (x) => CreatureState._encode(x, tracker));
    tracker.pushRecord(obj.items, (x) => tracker.pushUInt(x), (x) => ItemState._encode(x, tracker));
    tracker.pushRecord(obj.effects, (x) => tracker.pushUInt(x), (x) => EffectState._encode(x, tracker));
    tracker.pushRecord(obj.objects, (x) => tracker.pushUInt(x), (x) => ObjectState._encode(x, tracker));
    tracker.pushRecord(obj.players, (x) => tracker.pushString(x), (x) => PlayerState._encode(x, tracker));
    tracker.pushRecord(obj.spectators, (x) => tracker.pushString(x), (x) => SpectatorState._encode(x, tracker));
    GameInfo._encode(obj.info, tracker);
    tracker.pushOptional(obj.draft, (x) => DraftState._encode(x, tracker));
    tracker.pushOptional(obj.debugBodies, (x) => tracker.pushArray(x, (x) => DebugBodyState._encode(x, tracker)));
    return tracker;
  },
  decode(input: Uint8Array): GameState {
    return GameState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): GameState {
    return {
      creatures: tracker.nextRecord(() => tracker.nextUInt(), () => CreatureState._decode(tracker)),
      items: tracker.nextRecord(() => tracker.nextUInt(), () => ItemState._decode(tracker)),
      effects: tracker.nextRecord(() => tracker.nextUInt(), () => EffectState._decode(tracker)),
      objects: tracker.nextRecord(() => tracker.nextUInt(), () => ObjectState._decode(tracker)),
      players: tracker.nextRecord(() => tracker.nextString(), () => PlayerState._decode(tracker)),
      spectators: tracker.nextRecord(() => tracker.nextString(), () => SpectatorState._decode(tracker)),
      info: GameInfo._decode(tracker),
      draft: tracker.nextOptional(() => DraftState._decode(tracker)),
      debugBodies: tracker.nextOptional(() => tracker.nextArray(() => DebugBodyState._decode(tracker))),
    };
  },
  computeDiff(a: GameState, b: GameState): _.DeepPartial<GameState> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<GameState> =  {
      creatures: _.diffRecord(a.creatures, b.creatures, (x, y) => CreatureState.computeDiff(x, y)),
      items: _.diffRecord(a.items, b.items, (x, y) => ItemState.computeDiff(x, y)),
      effects: _.diffRecord(a.effects, b.effects, (x, y) => EffectState.computeDiff(x, y)),
      objects: _.diffRecord(a.objects, b.objects, (x, y) => ObjectState.computeDiff(x, y)),
      players: _.diffRecord(a.players, b.players, (x, y) => PlayerState.computeDiff(x, y)),
      spectators: _.diffRecord(a.spectators, b.spectators, (x, y) => SpectatorState.computeDiff(x, y)),
      info: GameInfo.computeDiff(a.info, b.info),
      draft: _.diffOptional(a.draft, b.draft, (x, y) => DraftState.computeDiff(x, y)),
      debugBodies: _.diffOptional(a.debugBodies, b.debugBodies, (x, y) => _.diffArray(x, y, (x, y) => DebugBodyState.computeDiff(x, y))),
    };
    return diff.creatures === _.NO_DIFF && diff.items === _.NO_DIFF && diff.effects === _.NO_DIFF && diff.objects === _.NO_DIFF && diff.players === _.NO_DIFF && diff.spectators === _.NO_DIFF && diff.info === _.NO_DIFF && diff.draft === _.NO_DIFF && diff.debugBodies === _.NO_DIFF ? _.NO_DIFF : diff;
  },
  encodeDiff(obj: _.DeepPartial<GameState> | typeof _.NO_DIFF) {
    if (obj === _.NO_DIFF) {
      return new Uint8Array(0);
    }
    return GameState._encodeDiff(obj, new _.Tracker()).toBuffer();
  },
  _encodeDiff(obj: _.DeepPartial<GameState>, tracker: _.Tracker) {
    tracker.pushBoolean(obj.creatures !== _.NO_DIFF);
    if (obj.creatures !== _.NO_DIFF) {
      tracker.pushRecordDiff<number, CreatureState>(obj.creatures, (x) => tracker.pushUInt(x), (x) => CreatureState._encode(x, tracker), (x) => CreatureState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.items !== _.NO_DIFF);
    if (obj.items !== _.NO_DIFF) {
      tracker.pushRecordDiff<number, ItemState>(obj.items, (x) => tracker.pushUInt(x), (x) => ItemState._encode(x, tracker), (x) => ItemState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.effects !== _.NO_DIFF);
    if (obj.effects !== _.NO_DIFF) {
      tracker.pushRecordDiff<number, EffectState>(obj.effects, (x) => tracker.pushUInt(x), (x) => EffectState._encode(x, tracker), (x) => EffectState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.objects !== _.NO_DIFF);
    if (obj.objects !== _.NO_DIFF) {
      tracker.pushRecordDiff<number, ObjectState>(obj.objects, (x) => tracker.pushUInt(x), (x) => ObjectState._encode(x, tracker), (x) => ObjectState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.players !== _.NO_DIFF);
    if (obj.players !== _.NO_DIFF) {
      tracker.pushRecordDiff<string, PlayerState>(obj.players, (x) => tracker.pushString(x), (x) => PlayerState._encode(x, tracker), (x) => PlayerState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.spectators !== _.NO_DIFF);
    if (obj.spectators !== _.NO_DIFF) {
      tracker.pushRecordDiff<string, SpectatorState>(obj.spectators, (x) => tracker.pushString(x), (x) => SpectatorState._encode(x, tracker), (x) => SpectatorState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.info !== _.NO_DIFF);
    if (obj.info !== _.NO_DIFF) {
      GameInfo._encodeDiff(obj.info, tracker);
    }
    tracker.pushBoolean(obj.draft !== _.NO_DIFF);
    if (obj.draft !== _.NO_DIFF) {
      tracker.pushOptionalDiff<DraftState>(obj.draft!, (x) => DraftState._encode(x, tracker), (x) => DraftState._encodeDiff(x, tracker));
    }
    tracker.pushBoolean(obj.debugBodies !== _.NO_DIFF);
    if (obj.debugBodies !== _.NO_DIFF) {
      tracker.pushOptionalDiff<DebugBodyState[]>(obj.debugBodies!, (x) => tracker.pushArray(x, (x) => DebugBodyState._encode(x, tracker)), (x) => tracker.pushArrayDiff<DebugBodyState>(x, (x) => DebugBodyState._encode(x, tracker), (x) => DebugBodyState._encodeDiff(x, tracker)));
    }
    return tracker;
  },
  decodeDiff(input: Uint8Array): _.DeepPartial<GameState> | typeof _.NO_DIFF {
    if (input.length === 0) {
      return _.NO_DIFF;
    }
    return GameState._decodeDiff(_.Tracker.parse(input));
  },
  _decodeDiff(tracker: _.Tracker): _.DeepPartial<GameState> {
    return {
      creatures: tracker.nextBoolean() ? tracker.nextRecordDiff<number, CreatureState>(() => tracker.nextUInt(), () => CreatureState._decode(tracker), () => CreatureState._decodeDiff(tracker)) : _.NO_DIFF,
      items: tracker.nextBoolean() ? tracker.nextRecordDiff<number, ItemState>(() => tracker.nextUInt(), () => ItemState._decode(tracker), () => ItemState._decodeDiff(tracker)) : _.NO_DIFF,
      effects: tracker.nextBoolean() ? tracker.nextRecordDiff<number, EffectState>(() => tracker.nextUInt(), () => EffectState._decode(tracker), () => EffectState._decodeDiff(tracker)) : _.NO_DIFF,
      objects: tracker.nextBoolean() ? tracker.nextRecordDiff<number, ObjectState>(() => tracker.nextUInt(), () => ObjectState._decode(tracker), () => ObjectState._decodeDiff(tracker)) : _.NO_DIFF,
      players: tracker.nextBoolean() ? tracker.nextRecordDiff<string, PlayerState>(() => tracker.nextString(), () => PlayerState._decode(tracker), () => PlayerState._decodeDiff(tracker)) : _.NO_DIFF,
      spectators: tracker.nextBoolean() ? tracker.nextRecordDiff<string, SpectatorState>(() => tracker.nextString(), () => SpectatorState._decode(tracker), () => SpectatorState._decodeDiff(tracker)) : _.NO_DIFF,
      info: tracker.nextBoolean() ? GameInfo._decodeDiff(tracker) : _.NO_DIFF,
      draft: tracker.nextBoolean() ? tracker.nextOptionalDiff<DraftState>(() => DraftState._decode(tracker), () => DraftState._decodeDiff(tracker)) : _.NO_DIFF,
      debugBodies: tracker.nextBoolean() ? tracker.nextOptionalDiff<DebugBodyState[]>(() => tracker.nextArray(() => DebugBodyState._decode(tracker)), () => tracker.nextArrayDiff<DebugBodyState>(() => DebugBodyState._decode(tracker), () => DebugBodyState._decodeDiff(tracker))) : _.NO_DIFF,
    };
  },
  applyDiff(obj: GameState, diff: _.DeepPartial<GameState> | typeof _.NO_DIFF): GameState {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    return {
      creatures: diff.creatures === _.NO_DIFF ? obj.creatures : _.patchRecord<number, CreatureState>(obj.creatures, diff.creatures, (a, b) => CreatureState.applyDiff(a, b)),
      items: diff.items === _.NO_DIFF ? obj.items : _.patchRecord<number, ItemState>(obj.items, diff.items, (a, b) => ItemState.applyDiff(a, b)),
      effects: diff.effects === _.NO_DIFF ? obj.effects : _.patchRecord<number, EffectState>(obj.effects, diff.effects, (a, b) => EffectState.applyDiff(a, b)),
      objects: diff.objects === _.NO_DIFF ? obj.objects : _.patchRecord<number, ObjectState>(obj.objects, diff.objects, (a, b) => ObjectState.applyDiff(a, b)),
      players: diff.players === _.NO_DIFF ? obj.players : _.patchRecord<string, PlayerState>(obj.players, diff.players, (a, b) => PlayerState.applyDiff(a, b)),
      spectators: diff.spectators === _.NO_DIFF ? obj.spectators : _.patchRecord<string, SpectatorState>(obj.spectators, diff.spectators, (a, b) => SpectatorState.applyDiff(a, b)),
      info: diff.info === _.NO_DIFF ? obj.info : GameInfo.applyDiff(obj.info, diff.info),
      draft: diff.draft === _.NO_DIFF ? obj.draft : _.patchOptional<DraftState>(obj.draft, diff.draft!, (a, b) => DraftState.applyDiff(a, b)),
      debugBodies: diff.debugBodies === _.NO_DIFF ? obj.debugBodies : _.patchOptional<DebugBodyState[]>(obj.debugBodies, diff.debugBodies!, (a, b) => _.patchArray<DebugBodyState>(a, b, (a, b) => DebugBodyState.applyDiff(a, b))),
    };
  },
};
