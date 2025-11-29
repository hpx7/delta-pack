import * as _ from "@hathora/delta-pack/helpers";

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
  parse(obj: CreatureState): CreatureState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid CreatureState: ${obj}`);
    }
    return {
      team: _.parseString(obj.team),
      hero: _.parseBoolean(obj.hero),
      creatureType: _.parseString(obj.creatureType),
      equippedItemType: _.parseOptional(obj.equippedItemType, (x) => _.parseString(x)),
      health: _.parseUInt(obj.health),
      maxHealth: _.parseUInt(obj.maxHealth),
      visible: _.parseBoolean(obj.visible),
      facing: _.parseString(obj.facing),
      moving: _.parseBoolean(obj.moving),
      moveType: _.parseString(obj.moveType),
      moveTargetX: _.parseOptional(obj.moveTargetX, (x) => _.parseInt(x)),
      moveTargetY: _.parseOptional(obj.moveTargetY, (x) => _.parseInt(x)),
      enemyTargetX: _.parseOptional(obj.enemyTargetX, (x) => _.parseInt(x)),
      enemyTargetY: _.parseOptional(obj.enemyTargetY, (x) => _.parseInt(x)),
      using: _.parseOptional(obj.using, (x) => _.parseString(x)),
      useDirection: _.parseOptional(obj.useDirection, (x) => _.parseString(x)),
      takingDamage: _.parseBoolean(obj.takingDamage),
      frozen: _.parseBoolean(obj.frozen),
      statusEffect: _.parseOptional(obj.statusEffect, (x) => _.parseString(x)),
      x: _.parseInt(obj.x),
      y: _.parseInt(obj.y),
    };
  },
  equals(a: CreatureState, b: CreatureState): boolean {
    return (
      a.team === b.team &&
      a.hero === b.hero &&
      a.creatureType === b.creatureType &&
      _.equalsOptional(a.equippedItemType, b.equippedItemType, (x, y) => x === y) &&
      a.health === b.health &&
      a.maxHealth === b.maxHealth &&
      a.visible === b.visible &&
      a.facing === b.facing &&
      a.moving === b.moving &&
      a.moveType === b.moveType &&
      _.equalsOptional(a.moveTargetX, b.moveTargetX, (x, y) => x === y) &&
      _.equalsOptional(a.moveTargetY, b.moveTargetY, (x, y) => x === y) &&
      _.equalsOptional(a.enemyTargetX, b.enemyTargetX, (x, y) => x === y) &&
      _.equalsOptional(a.enemyTargetY, b.enemyTargetY, (x, y) => x === y) &&
      _.equalsOptional(a.using, b.using, (x, y) => x === y) &&
      _.equalsOptional(a.useDirection, b.useDirection, (x, y) => x === y) &&
      a.takingDamage === b.takingDamage &&
      a.frozen === b.frozen &&
      _.equalsOptional(a.statusEffect, b.statusEffect, (x, y) => x === y) &&
      a.x === b.x &&
      a.y === b.y
    );
  },
  encode(obj: CreatureState): Uint8Array {
    const tracker = new _.Tracker();
    CreatureState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: CreatureState, tracker: _.Tracker): void {
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
  },
  encodeDiff(a: CreatureState, b: CreatureState): Uint8Array {
    const tracker = new _.Tracker();
    CreatureState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: CreatureState, b: CreatureState, tracker: _.Tracker): void {
    const changed = !CreatureState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.team, b.team);
    tracker.pushBooleanDiff(a.hero, b.hero);
    tracker.pushStringDiff(a.creatureType, b.creatureType);
    tracker.pushOptionalDiffPrimitive<string>(
      a.equippedItemType,
      b.equippedItemType,
      (x) => tracker.pushString(x)
    );
    tracker.pushUIntDiff(a.health, b.health);
    tracker.pushUIntDiff(a.maxHealth, b.maxHealth);
    tracker.pushBooleanDiff(a.visible, b.visible);
    tracker.pushStringDiff(a.facing, b.facing);
    tracker.pushBooleanDiff(a.moving, b.moving);
    tracker.pushStringDiff(a.moveType, b.moveType);
    tracker.pushOptionalDiffPrimitive<number>(
      a.moveTargetX,
      b.moveTargetX,
      (x) => tracker.pushInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.moveTargetY,
      b.moveTargetY,
      (x) => tracker.pushInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.enemyTargetX,
      b.enemyTargetX,
      (x) => tracker.pushInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.enemyTargetY,
      b.enemyTargetY,
      (x) => tracker.pushInt(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.using,
      b.using,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.useDirection,
      b.useDirection,
      (x) => tracker.pushString(x)
    );
    tracker.pushBooleanDiff(a.takingDamage, b.takingDamage);
    tracker.pushBooleanDiff(a.frozen, b.frozen);
    tracker.pushOptionalDiffPrimitive<string>(
      a.statusEffect,
      b.statusEffect,
      (x) => tracker.pushString(x)
    );
    tracker.pushIntDiff(a.x, b.x);
    tracker.pushIntDiff(a.y, b.y);
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
  decodeDiff(obj: CreatureState, input: Uint8Array): CreatureState {
    const tracker = _.Tracker.parse(input);
    return CreatureState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: CreatureState, tracker: _.Tracker): CreatureState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      team: tracker.nextStringDiff(obj.team),
      hero: tracker.nextBooleanDiff(obj.hero),
      creatureType: tracker.nextStringDiff(obj.creatureType),
      equippedItemType: tracker.nextOptionalDiffPrimitive<string>(
        obj.equippedItemType,
        () => tracker.nextString()
      ),
      health: tracker.nextUIntDiff(obj.health),
      maxHealth: tracker.nextUIntDiff(obj.maxHealth),
      visible: tracker.nextBooleanDiff(obj.visible),
      facing: tracker.nextStringDiff(obj.facing),
      moving: tracker.nextBooleanDiff(obj.moving),
      moveType: tracker.nextStringDiff(obj.moveType),
      moveTargetX: tracker.nextOptionalDiffPrimitive<number>(
        obj.moveTargetX,
        () => tracker.nextInt()
      ),
      moveTargetY: tracker.nextOptionalDiffPrimitive<number>(
        obj.moveTargetY,
        () => tracker.nextInt()
      ),
      enemyTargetX: tracker.nextOptionalDiffPrimitive<number>(
        obj.enemyTargetX,
        () => tracker.nextInt()
      ),
      enemyTargetY: tracker.nextOptionalDiffPrimitive<number>(
        obj.enemyTargetY,
        () => tracker.nextInt()
      ),
      using: tracker.nextOptionalDiffPrimitive<string>(
        obj.using,
        () => tracker.nextString()
      ),
      useDirection: tracker.nextOptionalDiffPrimitive<string>(
        obj.useDirection,
        () => tracker.nextString()
      ),
      takingDamage: tracker.nextBooleanDiff(obj.takingDamage),
      frozen: tracker.nextBooleanDiff(obj.frozen),
      statusEffect: tracker.nextOptionalDiffPrimitive<string>(
        obj.statusEffect,
        () => tracker.nextString()
      ),
      x: tracker.nextIntDiff(obj.x),
      y: tracker.nextIntDiff(obj.y),
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
  parse(obj: ItemState): ItemState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid ItemState: ${obj}`);
    }
    return {
      itemType: _.parseString(obj.itemType),
      potionType: _.parseOptional(obj.potionType, (x) => _.parseString(x)),
      weaponType: _.parseOptional(obj.weaponType, (x) => _.parseString(x)),
      x: _.parseInt(obj.x),
      y: _.parseInt(obj.y),
    };
  },
  equals(a: ItemState, b: ItemState): boolean {
    return (
      a.itemType === b.itemType &&
      _.equalsOptional(a.potionType, b.potionType, (x, y) => x === y) &&
      _.equalsOptional(a.weaponType, b.weaponType, (x, y) => x === y) &&
      a.x === b.x &&
      a.y === b.y
    );
  },
  encode(obj: ItemState): Uint8Array {
    const tracker = new _.Tracker();
    ItemState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ItemState, tracker: _.Tracker): void {
    tracker.pushString(obj.itemType);
    tracker.pushOptional(obj.potionType, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.weaponType, (x) => tracker.pushString(x));
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
  },
  encodeDiff(a: ItemState, b: ItemState): Uint8Array {
    const tracker = new _.Tracker();
    ItemState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ItemState, b: ItemState, tracker: _.Tracker): void {
    const changed = !ItemState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.itemType, b.itemType);
    tracker.pushOptionalDiffPrimitive<string>(
      a.potionType,
      b.potionType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.weaponType,
      b.weaponType,
      (x) => tracker.pushString(x)
    );
    tracker.pushIntDiff(a.x, b.x);
    tracker.pushIntDiff(a.y, b.y);
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
  decodeDiff(obj: ItemState, input: Uint8Array): ItemState {
    const tracker = _.Tracker.parse(input);
    return ItemState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ItemState, tracker: _.Tracker): ItemState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      itemType: tracker.nextStringDiff(obj.itemType),
      potionType: tracker.nextOptionalDiffPrimitive<string>(
        obj.potionType,
        () => tracker.nextString()
      ),
      weaponType: tracker.nextOptionalDiffPrimitive<string>(
        obj.weaponType,
        () => tracker.nextString()
      ),
      x: tracker.nextIntDiff(obj.x),
      y: tracker.nextIntDiff(obj.y),
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
  parse(obj: EffectState): EffectState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid EffectState: ${obj}`);
    }
    return {
      creatureId: _.parseOptional(obj.creatureId, (x) => _.parseInt(x)),
      effectType: _.parseString(obj.effectType),
      triggerType: _.parseOptional(obj.triggerType, (x) => _.parseString(x)),
      ellipseEffectType: _.parseOptional(obj.ellipseEffectType, (x) => _.parseString(x)),
      weaponEffectType: _.parseOptional(obj.weaponEffectType, (x) => _.parseString(x)),
      projectileType: _.parseOptional(obj.projectileType, (x) => _.parseString(x)),
      visualEffectType: _.parseOptional(obj.visualEffectType, (x) => _.parseString(x)),
      swingType: _.parseOptional(obj.swingType, (x) => _.parseString(x)),
      thrustType: _.parseOptional(obj.thrustType, (x) => _.parseString(x)),
      weaponType: _.parseOptional(obj.weaponType, (x) => _.parseString(x)),
      direction: _.parseOptional(obj.direction, (x) => _.parseString(x)),
      angle: _.parseOptional(obj.angle, (x) => _.parseInt(x)),
      radius: _.parseOptional(obj.radius, (x) => _.parseUInt(x)),
      x: _.parseInt(obj.x),
      y: _.parseInt(obj.y),
      z: _.parseOptional(obj.z, (x) => _.parseInt(x)),
    };
  },
  equals(a: EffectState, b: EffectState): boolean {
    return (
      _.equalsOptional(a.creatureId, b.creatureId, (x, y) => x === y) &&
      a.effectType === b.effectType &&
      _.equalsOptional(a.triggerType, b.triggerType, (x, y) => x === y) &&
      _.equalsOptional(a.ellipseEffectType, b.ellipseEffectType, (x, y) => x === y) &&
      _.equalsOptional(a.weaponEffectType, b.weaponEffectType, (x, y) => x === y) &&
      _.equalsOptional(a.projectileType, b.projectileType, (x, y) => x === y) &&
      _.equalsOptional(a.visualEffectType, b.visualEffectType, (x, y) => x === y) &&
      _.equalsOptional(a.swingType, b.swingType, (x, y) => x === y) &&
      _.equalsOptional(a.thrustType, b.thrustType, (x, y) => x === y) &&
      _.equalsOptional(a.weaponType, b.weaponType, (x, y) => x === y) &&
      _.equalsOptional(a.direction, b.direction, (x, y) => x === y) &&
      _.equalsOptional(a.angle, b.angle, (x, y) => x === y) &&
      _.equalsOptional(a.radius, b.radius, (x, y) => x === y) &&
      a.x === b.x &&
      a.y === b.y &&
      _.equalsOptional(a.z, b.z, (x, y) => x === y)
    );
  },
  encode(obj: EffectState): Uint8Array {
    const tracker = new _.Tracker();
    EffectState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: EffectState, tracker: _.Tracker): void {
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
  },
  encodeDiff(a: EffectState, b: EffectState): Uint8Array {
    const tracker = new _.Tracker();
    EffectState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: EffectState, b: EffectState, tracker: _.Tracker): void {
    const changed = !EffectState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushOptionalDiffPrimitive<number>(
      a.creatureId,
      b.creatureId,
      (x) => tracker.pushInt(x)
    );
    tracker.pushStringDiff(a.effectType, b.effectType);
    tracker.pushOptionalDiffPrimitive<string>(
      a.triggerType,
      b.triggerType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.ellipseEffectType,
      b.ellipseEffectType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.weaponEffectType,
      b.weaponEffectType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.projectileType,
      b.projectileType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.visualEffectType,
      b.visualEffectType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.swingType,
      b.swingType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.thrustType,
      b.thrustType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.weaponType,
      b.weaponType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.direction,
      b.direction,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.angle,
      b.angle,
      (x) => tracker.pushInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.radius,
      b.radius,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushIntDiff(a.x, b.x);
    tracker.pushIntDiff(a.y, b.y);
    tracker.pushOptionalDiffPrimitive<number>(
      a.z,
      b.z,
      (x) => tracker.pushInt(x)
    );
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
  decodeDiff(obj: EffectState, input: Uint8Array): EffectState {
    const tracker = _.Tracker.parse(input);
    return EffectState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: EffectState, tracker: _.Tracker): EffectState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      creatureId: tracker.nextOptionalDiffPrimitive<number>(
        obj.creatureId,
        () => tracker.nextInt()
      ),
      effectType: tracker.nextStringDiff(obj.effectType),
      triggerType: tracker.nextOptionalDiffPrimitive<string>(
        obj.triggerType,
        () => tracker.nextString()
      ),
      ellipseEffectType: tracker.nextOptionalDiffPrimitive<string>(
        obj.ellipseEffectType,
        () => tracker.nextString()
      ),
      weaponEffectType: tracker.nextOptionalDiffPrimitive<string>(
        obj.weaponEffectType,
        () => tracker.nextString()
      ),
      projectileType: tracker.nextOptionalDiffPrimitive<string>(
        obj.projectileType,
        () => tracker.nextString()
      ),
      visualEffectType: tracker.nextOptionalDiffPrimitive<string>(
        obj.visualEffectType,
        () => tracker.nextString()
      ),
      swingType: tracker.nextOptionalDiffPrimitive<string>(
        obj.swingType,
        () => tracker.nextString()
      ),
      thrustType: tracker.nextOptionalDiffPrimitive<string>(
        obj.thrustType,
        () => tracker.nextString()
      ),
      weaponType: tracker.nextOptionalDiffPrimitive<string>(
        obj.weaponType,
        () => tracker.nextString()
      ),
      direction: tracker.nextOptionalDiffPrimitive<string>(
        obj.direction,
        () => tracker.nextString()
      ),
      angle: tracker.nextOptionalDiffPrimitive<number>(
        obj.angle,
        () => tracker.nextInt()
      ),
      radius: tracker.nextOptionalDiffPrimitive<number>(
        obj.radius,
        () => tracker.nextUInt()
      ),
      x: tracker.nextIntDiff(obj.x),
      y: tracker.nextIntDiff(obj.y),
      z: tracker.nextOptionalDiffPrimitive<number>(
        obj.z,
        () => tracker.nextInt()
      ),
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
  parse(obj: ObjectState): ObjectState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid ObjectState: ${obj}`);
    }
    return {
      team: _.parseOptional(obj.team, (x) => _.parseString(x)),
      objectType: _.parseString(obj.objectType),
      destructibleObjectType: _.parseOptional(obj.destructibleObjectType, (x) => _.parseString(x)),
      environmentObjectType: _.parseOptional(obj.environmentObjectType, (x) => _.parseString(x)),
      interactiveObjectType: _.parseOptional(obj.interactiveObjectType, (x) => _.parseString(x)),
      active: _.parseOptional(obj.active, (x) => _.parseBoolean(x)),
      towerName: _.parseOptional(obj.towerName, (x) => _.parseString(x)),
      width: _.parseOptional(obj.width, (x) => _.parseUInt(x)),
      height: _.parseOptional(obj.height, (x) => _.parseUInt(x)),
      angle: _.parseOptional(obj.angle, (x) => _.parseInt(x)),
      durability: _.parseOptional(obj.durability, (x) => _.parseUInt(x)),
      maxDurability: _.parseOptional(obj.maxDurability, (x) => _.parseUInt(x)),
      x: _.parseInt(obj.x),
      y: _.parseInt(obj.y),
    };
  },
  equals(a: ObjectState, b: ObjectState): boolean {
    return (
      _.equalsOptional(a.team, b.team, (x, y) => x === y) &&
      a.objectType === b.objectType &&
      _.equalsOptional(a.destructibleObjectType, b.destructibleObjectType, (x, y) => x === y) &&
      _.equalsOptional(a.environmentObjectType, b.environmentObjectType, (x, y) => x === y) &&
      _.equalsOptional(a.interactiveObjectType, b.interactiveObjectType, (x, y) => x === y) &&
      _.equalsOptional(a.active, b.active, (x, y) => x === y) &&
      _.equalsOptional(a.towerName, b.towerName, (x, y) => x === y) &&
      _.equalsOptional(a.width, b.width, (x, y) => x === y) &&
      _.equalsOptional(a.height, b.height, (x, y) => x === y) &&
      _.equalsOptional(a.angle, b.angle, (x, y) => x === y) &&
      _.equalsOptional(a.durability, b.durability, (x, y) => x === y) &&
      _.equalsOptional(a.maxDurability, b.maxDurability, (x, y) => x === y) &&
      a.x === b.x &&
      a.y === b.y
    );
  },
  encode(obj: ObjectState): Uint8Array {
    const tracker = new _.Tracker();
    ObjectState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ObjectState, tracker: _.Tracker): void {
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
  },
  encodeDiff(a: ObjectState, b: ObjectState): Uint8Array {
    const tracker = new _.Tracker();
    ObjectState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ObjectState, b: ObjectState, tracker: _.Tracker): void {
    const changed = !ObjectState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushOptionalDiffPrimitive<string>(
      a.team,
      b.team,
      (x) => tracker.pushString(x)
    );
    tracker.pushStringDiff(a.objectType, b.objectType);
    tracker.pushOptionalDiffPrimitive<string>(
      a.destructibleObjectType,
      b.destructibleObjectType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.environmentObjectType,
      b.environmentObjectType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.interactiveObjectType,
      b.interactiveObjectType,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<boolean>(
      a.active,
      b.active,
      (x) => tracker.pushBoolean(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.towerName,
      b.towerName,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.width,
      b.width,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.height,
      b.height,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.angle,
      b.angle,
      (x) => tracker.pushInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.durability,
      b.durability,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.maxDurability,
      b.maxDurability,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushIntDiff(a.x, b.x);
    tracker.pushIntDiff(a.y, b.y);
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
  decodeDiff(obj: ObjectState, input: Uint8Array): ObjectState {
    const tracker = _.Tracker.parse(input);
    return ObjectState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ObjectState, tracker: _.Tracker): ObjectState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      team: tracker.nextOptionalDiffPrimitive<string>(
        obj.team,
        () => tracker.nextString()
      ),
      objectType: tracker.nextStringDiff(obj.objectType),
      destructibleObjectType: tracker.nextOptionalDiffPrimitive<string>(
        obj.destructibleObjectType,
        () => tracker.nextString()
      ),
      environmentObjectType: tracker.nextOptionalDiffPrimitive<string>(
        obj.environmentObjectType,
        () => tracker.nextString()
      ),
      interactiveObjectType: tracker.nextOptionalDiffPrimitive<string>(
        obj.interactiveObjectType,
        () => tracker.nextString()
      ),
      active: tracker.nextOptionalDiffPrimitive<boolean>(
        obj.active,
        () => tracker.nextBoolean()
      ),
      towerName: tracker.nextOptionalDiffPrimitive<string>(
        obj.towerName,
        () => tracker.nextString()
      ),
      width: tracker.nextOptionalDiffPrimitive<number>(
        obj.width,
        () => tracker.nextUInt()
      ),
      height: tracker.nextOptionalDiffPrimitive<number>(
        obj.height,
        () => tracker.nextUInt()
      ),
      angle: tracker.nextOptionalDiffPrimitive<number>(
        obj.angle,
        () => tracker.nextInt()
      ),
      durability: tracker.nextOptionalDiffPrimitive<number>(
        obj.durability,
        () => tracker.nextUInt()
      ),
      maxDurability: tracker.nextOptionalDiffPrimitive<number>(
        obj.maxDurability,
        () => tracker.nextUInt()
      ),
      x: tracker.nextIntDiff(obj.x),
      y: tracker.nextIntDiff(obj.y),
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
  parse(obj: PlayerState): PlayerState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid PlayerState: ${obj}`);
    }
    return {
      name: _.parseString(obj.name),
      team: _.parseOptional(obj.team, (x) => _.parseString(x)),
      hero: _.parseOptional(obj.hero, (x) => _.parseUInt(x)),
      cents: _.parseOptional(obj.cents, (x) => _.parseUInt(x)),
      deck: _.parseOptional(obj.deck, (x) => DeckState.parse(x as DeckState)),
      randomSlots: _.parseArray(obj.randomSlots, (x) => _.parseString(x)),
      hand: _.parseOptional(obj.hand, (x) => HandState.parse(x as HandState)),
      skills: _.parseOptional(obj.skills, (x) => SkillsState.parse(x as SkillsState)),
      restrictionZones: _.parseString(obj.restrictionZones),
    };
  },
  equals(a: PlayerState, b: PlayerState): boolean {
    return (
      a.name === b.name &&
      _.equalsOptional(a.team, b.team, (x, y) => x === y) &&
      _.equalsOptional(a.hero, b.hero, (x, y) => x === y) &&
      _.equalsOptional(a.cents, b.cents, (x, y) => x === y) &&
      _.equalsOptional(a.deck, b.deck, (x, y) => DeckState.equals(x, y)) &&
      _.equalsArray(a.randomSlots, b.randomSlots, (x, y) => x === y) &&
      _.equalsOptional(a.hand, b.hand, (x, y) => HandState.equals(x, y)) &&
      _.equalsOptional(a.skills, b.skills, (x, y) => SkillsState.equals(x, y)) &&
      a.restrictionZones === b.restrictionZones
    );
  },
  encode(obj: PlayerState): Uint8Array {
    const tracker = new _.Tracker();
    PlayerState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: PlayerState, tracker: _.Tracker): void {
    tracker.pushString(obj.name);
    tracker.pushOptional(obj.team, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.hero, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.cents, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.deck, (x) => DeckState._encode(x, tracker));
    tracker.pushArray(obj.randomSlots, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.hand, (x) => HandState._encode(x, tracker));
    tracker.pushOptional(obj.skills, (x) => SkillsState._encode(x, tracker));
    tracker.pushString(obj.restrictionZones);
  },
  encodeDiff(a: PlayerState, b: PlayerState): Uint8Array {
    const tracker = new _.Tracker();
    PlayerState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: PlayerState, b: PlayerState, tracker: _.Tracker): void {
    const changed = !PlayerState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.name, b.name);
    tracker.pushOptionalDiffPrimitive<string>(
      a.team,
      b.team,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.hero,
      b.hero,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.cents,
      b.cents,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushOptionalDiff<DeckState>(
      a.deck,
      b.deck,
      (x) => DeckState._encode(x, tracker),
      (x, y) => DeckState._encodeDiff(x, y, tracker)
    );
    tracker.pushArrayDiff<string>(
      a.randomSlots,
      b.randomSlots,
      (x, y) => x === y,
      (x) => tracker.pushString(x),
      (x, y) => tracker.pushStringDiff(x, y)
    );
    tracker.pushOptionalDiff<HandState>(
      a.hand,
      b.hand,
      (x) => HandState._encode(x, tracker),
      (x, y) => HandState._encodeDiff(x, y, tracker)
    );
    tracker.pushOptionalDiff<SkillsState>(
      a.skills,
      b.skills,
      (x) => SkillsState._encode(x, tracker),
      (x, y) => SkillsState._encodeDiff(x, y, tracker)
    );
    tracker.pushStringDiff(a.restrictionZones, b.restrictionZones);
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
  decodeDiff(obj: PlayerState, input: Uint8Array): PlayerState {
    const tracker = _.Tracker.parse(input);
    return PlayerState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: PlayerState, tracker: _.Tracker): PlayerState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      name: tracker.nextStringDiff(obj.name),
      team: tracker.nextOptionalDiffPrimitive<string>(
        obj.team,
        () => tracker.nextString()
      ),
      hero: tracker.nextOptionalDiffPrimitive<number>(
        obj.hero,
        () => tracker.nextUInt()
      ),
      cents: tracker.nextOptionalDiffPrimitive<number>(
        obj.cents,
        () => tracker.nextUInt()
      ),
      deck: tracker.nextOptionalDiff<DeckState>(
        obj.deck,
        () => DeckState._decode(tracker),
        (x) => DeckState._decodeDiff(x, tracker)
      ),
      randomSlots: tracker.nextArrayDiff<string>(
        obj.randomSlots,
        () => tracker.nextString(),
        (x) => tracker.nextStringDiff(x)
      ),
      hand: tracker.nextOptionalDiff<HandState>(
        obj.hand,
        () => HandState._decode(tracker),
        (x) => HandState._decodeDiff(x, tracker)
      ),
      skills: tracker.nextOptionalDiff<SkillsState>(
        obj.skills,
        () => SkillsState._decode(tracker),
        (x) => SkillsState._decodeDiff(x, tracker)
      ),
      restrictionZones: tracker.nextStringDiff(obj.restrictionZones),
    };
  },
};

export const SpectatorState = {
  default(): SpectatorState {
    return {
      name: "",
    };
  },
  parse(obj: SpectatorState): SpectatorState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid SpectatorState: ${obj}`);
    }
    return {
      name: _.parseString(obj.name),
    };
  },
  equals(a: SpectatorState, b: SpectatorState): boolean {
    return (
      a.name === b.name
    );
  },
  encode(obj: SpectatorState): Uint8Array {
    const tracker = new _.Tracker();
    SpectatorState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: SpectatorState, tracker: _.Tracker): void {
    tracker.pushString(obj.name);
  },
  encodeDiff(a: SpectatorState, b: SpectatorState): Uint8Array {
    const tracker = new _.Tracker();
    SpectatorState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: SpectatorState, b: SpectatorState, tracker: _.Tracker): void {
    const changed = !SpectatorState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.name, b.name);
  },
  decode(input: Uint8Array): SpectatorState {
    return SpectatorState._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): SpectatorState {
    return {
      name: tracker.nextString(),
    };
  },
  decodeDiff(obj: SpectatorState, input: Uint8Array): SpectatorState {
    const tracker = _.Tracker.parse(input);
    return SpectatorState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: SpectatorState, tracker: _.Tracker): SpectatorState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      name: tracker.nextStringDiff(obj.name),
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
  parse(obj: DeckState): DeckState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid DeckState: ${obj}`);
    }
    return {
      card1: _.parseOptional(obj.card1, (x) => _.parseString(x)),
      card2: _.parseOptional(obj.card2, (x) => _.parseString(x)),
      card3: _.parseOptional(obj.card3, (x) => _.parseString(x)),
      card4: _.parseOptional(obj.card4, (x) => _.parseString(x)),
      card5: _.parseOptional(obj.card5, (x) => _.parseString(x)),
      card6: _.parseOptional(obj.card6, (x) => _.parseString(x)),
      card7: _.parseOptional(obj.card7, (x) => _.parseString(x)),
      card8: _.parseOptional(obj.card8, (x) => _.parseString(x)),
    };
  },
  equals(a: DeckState, b: DeckState): boolean {
    return (
      _.equalsOptional(a.card1, b.card1, (x, y) => x === y) &&
      _.equalsOptional(a.card2, b.card2, (x, y) => x === y) &&
      _.equalsOptional(a.card3, b.card3, (x, y) => x === y) &&
      _.equalsOptional(a.card4, b.card4, (x, y) => x === y) &&
      _.equalsOptional(a.card5, b.card5, (x, y) => x === y) &&
      _.equalsOptional(a.card6, b.card6, (x, y) => x === y) &&
      _.equalsOptional(a.card7, b.card7, (x, y) => x === y) &&
      _.equalsOptional(a.card8, b.card8, (x, y) => x === y)
    );
  },
  encode(obj: DeckState): Uint8Array {
    const tracker = new _.Tracker();
    DeckState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: DeckState, tracker: _.Tracker): void {
    tracker.pushOptional(obj.card1, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card2, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card3, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card4, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card5, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card6, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card7, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card8, (x) => tracker.pushString(x));
  },
  encodeDiff(a: DeckState, b: DeckState): Uint8Array {
    const tracker = new _.Tracker();
    DeckState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: DeckState, b: DeckState, tracker: _.Tracker): void {
    const changed = !DeckState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushOptionalDiffPrimitive<string>(
      a.card1,
      b.card1,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card2,
      b.card2,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card3,
      b.card3,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card4,
      b.card4,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card5,
      b.card5,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card6,
      b.card6,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card7,
      b.card7,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card8,
      b.card8,
      (x) => tracker.pushString(x)
    );
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
  decodeDiff(obj: DeckState, input: Uint8Array): DeckState {
    const tracker = _.Tracker.parse(input);
    return DeckState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: DeckState, tracker: _.Tracker): DeckState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      card1: tracker.nextOptionalDiffPrimitive<string>(
        obj.card1,
        () => tracker.nextString()
      ),
      card2: tracker.nextOptionalDiffPrimitive<string>(
        obj.card2,
        () => tracker.nextString()
      ),
      card3: tracker.nextOptionalDiffPrimitive<string>(
        obj.card3,
        () => tracker.nextString()
      ),
      card4: tracker.nextOptionalDiffPrimitive<string>(
        obj.card4,
        () => tracker.nextString()
      ),
      card5: tracker.nextOptionalDiffPrimitive<string>(
        obj.card5,
        () => tracker.nextString()
      ),
      card6: tracker.nextOptionalDiffPrimitive<string>(
        obj.card6,
        () => tracker.nextString()
      ),
      card7: tracker.nextOptionalDiffPrimitive<string>(
        obj.card7,
        () => tracker.nextString()
      ),
      card8: tracker.nextOptionalDiffPrimitive<string>(
        obj.card8,
        () => tracker.nextString()
      ),
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
  parse(obj: HandState): HandState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid HandState: ${obj}`);
    }
    return {
      slot1: _.parseOptional(obj.slot1, (x) => _.parseString(x)),
      slot2: _.parseOptional(obj.slot2, (x) => _.parseString(x)),
      slot3: _.parseOptional(obj.slot3, (x) => _.parseString(x)),
      slot4: _.parseOptional(obj.slot4, (x) => _.parseString(x)),
    };
  },
  equals(a: HandState, b: HandState): boolean {
    return (
      _.equalsOptional(a.slot1, b.slot1, (x, y) => x === y) &&
      _.equalsOptional(a.slot2, b.slot2, (x, y) => x === y) &&
      _.equalsOptional(a.slot3, b.slot3, (x, y) => x === y) &&
      _.equalsOptional(a.slot4, b.slot4, (x, y) => x === y)
    );
  },
  encode(obj: HandState): Uint8Array {
    const tracker = new _.Tracker();
    HandState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: HandState, tracker: _.Tracker): void {
    tracker.pushOptional(obj.slot1, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.slot2, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.slot3, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.slot4, (x) => tracker.pushString(x));
  },
  encodeDiff(a: HandState, b: HandState): Uint8Array {
    const tracker = new _.Tracker();
    HandState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: HandState, b: HandState, tracker: _.Tracker): void {
    const changed = !HandState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushOptionalDiffPrimitive<string>(
      a.slot1,
      b.slot1,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.slot2,
      b.slot2,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.slot3,
      b.slot3,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.slot4,
      b.slot4,
      (x) => tracker.pushString(x)
    );
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
  decodeDiff(obj: HandState, input: Uint8Array): HandState {
    const tracker = _.Tracker.parse(input);
    return HandState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: HandState, tracker: _.Tracker): HandState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      slot1: tracker.nextOptionalDiffPrimitive<string>(
        obj.slot1,
        () => tracker.nextString()
      ),
      slot2: tracker.nextOptionalDiffPrimitive<string>(
        obj.slot2,
        () => tracker.nextString()
      ),
      slot3: tracker.nextOptionalDiffPrimitive<string>(
        obj.slot3,
        () => tracker.nextString()
      ),
      slot4: tracker.nextOptionalDiffPrimitive<string>(
        obj.slot4,
        () => tracker.nextString()
      ),
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
  parse(obj: SkillsState): SkillsState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid SkillsState: ${obj}`);
    }
    return {
      slot1: _.parseOptional(obj.slot1, (x) => SkillState.parse(x as SkillState)),
      slot2: _.parseOptional(obj.slot2, (x) => SkillState.parse(x as SkillState)),
      slot3: _.parseOptional(obj.slot3, (x) => SkillState.parse(x as SkillState)),
      slot4: _.parseOptional(obj.slot4, (x) => SkillState.parse(x as SkillState)),
    };
  },
  equals(a: SkillsState, b: SkillsState): boolean {
    return (
      _.equalsOptional(a.slot1, b.slot1, (x, y) => SkillState.equals(x, y)) &&
      _.equalsOptional(a.slot2, b.slot2, (x, y) => SkillState.equals(x, y)) &&
      _.equalsOptional(a.slot3, b.slot3, (x, y) => SkillState.equals(x, y)) &&
      _.equalsOptional(a.slot4, b.slot4, (x, y) => SkillState.equals(x, y))
    );
  },
  encode(obj: SkillsState): Uint8Array {
    const tracker = new _.Tracker();
    SkillsState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: SkillsState, tracker: _.Tracker): void {
    tracker.pushOptional(obj.slot1, (x) => SkillState._encode(x, tracker));
    tracker.pushOptional(obj.slot2, (x) => SkillState._encode(x, tracker));
    tracker.pushOptional(obj.slot3, (x) => SkillState._encode(x, tracker));
    tracker.pushOptional(obj.slot4, (x) => SkillState._encode(x, tracker));
  },
  encodeDiff(a: SkillsState, b: SkillsState): Uint8Array {
    const tracker = new _.Tracker();
    SkillsState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: SkillsState, b: SkillsState, tracker: _.Tracker): void {
    const changed = !SkillsState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushOptionalDiff<SkillState>(
      a.slot1,
      b.slot1,
      (x) => SkillState._encode(x, tracker),
      (x, y) => SkillState._encodeDiff(x, y, tracker)
    );
    tracker.pushOptionalDiff<SkillState>(
      a.slot2,
      b.slot2,
      (x) => SkillState._encode(x, tracker),
      (x, y) => SkillState._encodeDiff(x, y, tracker)
    );
    tracker.pushOptionalDiff<SkillState>(
      a.slot3,
      b.slot3,
      (x) => SkillState._encode(x, tracker),
      (x, y) => SkillState._encodeDiff(x, y, tracker)
    );
    tracker.pushOptionalDiff<SkillState>(
      a.slot4,
      b.slot4,
      (x) => SkillState._encode(x, tracker),
      (x, y) => SkillState._encodeDiff(x, y, tracker)
    );
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
  decodeDiff(obj: SkillsState, input: Uint8Array): SkillsState {
    const tracker = _.Tracker.parse(input);
    return SkillsState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: SkillsState, tracker: _.Tracker): SkillsState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      slot1: tracker.nextOptionalDiff<SkillState>(
        obj.slot1,
        () => SkillState._decode(tracker),
        (x) => SkillState._decodeDiff(x, tracker)
      ),
      slot2: tracker.nextOptionalDiff<SkillState>(
        obj.slot2,
        () => SkillState._decode(tracker),
        (x) => SkillState._decodeDiff(x, tracker)
      ),
      slot3: tracker.nextOptionalDiff<SkillState>(
        obj.slot3,
        () => SkillState._decode(tracker),
        (x) => SkillState._decodeDiff(x, tracker)
      ),
      slot4: tracker.nextOptionalDiff<SkillState>(
        obj.slot4,
        () => SkillState._decode(tracker),
        (x) => SkillState._decodeDiff(x, tracker)
      ),
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
  parse(obj: SkillState): SkillState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid SkillState: ${obj}`);
    }
    return {
      type: _.parseString(obj.type),
      inUse: _.parseBoolean(obj.inUse),
      cooldown: _.parseUInt(obj.cooldown),
      cooldownTotal: _.parseUInt(obj.cooldownTotal),
    };
  },
  equals(a: SkillState, b: SkillState): boolean {
    return (
      a.type === b.type &&
      a.inUse === b.inUse &&
      a.cooldown === b.cooldown &&
      a.cooldownTotal === b.cooldownTotal
    );
  },
  encode(obj: SkillState): Uint8Array {
    const tracker = new _.Tracker();
    SkillState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: SkillState, tracker: _.Tracker): void {
    tracker.pushString(obj.type);
    tracker.pushBoolean(obj.inUse);
    tracker.pushUInt(obj.cooldown);
    tracker.pushUInt(obj.cooldownTotal);
  },
  encodeDiff(a: SkillState, b: SkillState): Uint8Array {
    const tracker = new _.Tracker();
    SkillState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: SkillState, b: SkillState, tracker: _.Tracker): void {
    const changed = !SkillState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.type, b.type);
    tracker.pushBooleanDiff(a.inUse, b.inUse);
    tracker.pushUIntDiff(a.cooldown, b.cooldown);
    tracker.pushUIntDiff(a.cooldownTotal, b.cooldownTotal);
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
  decodeDiff(obj: SkillState, input: Uint8Array): SkillState {
    const tracker = _.Tracker.parse(input);
    return SkillState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: SkillState, tracker: _.Tracker): SkillState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      type: tracker.nextStringDiff(obj.type),
      inUse: tracker.nextBooleanDiff(obj.inUse),
      cooldown: tracker.nextUIntDiff(obj.cooldown),
      cooldownTotal: tracker.nextUIntDiff(obj.cooldownTotal),
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
  parse(obj: GameInfo): GameInfo {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid GameInfo: ${obj}`);
    }
    return {
      mode: _.parseOptional(obj.mode, (x) => _.parseString(x)),
      timeLimit: _.parseOptional(obj.timeLimit, (x) => _.parseUInt(x)),
      timeElapsed: _.parseOptional(obj.timeElapsed, (x) => _.parseInt(x)),
      suddenDeath: _.parseOptional(obj.suddenDeath, (x) => _.parseBoolean(x)),
      winner: _.parseOptional(obj.winner, (x) => _.parseString(x)),
    };
  },
  equals(a: GameInfo, b: GameInfo): boolean {
    return (
      _.equalsOptional(a.mode, b.mode, (x, y) => x === y) &&
      _.equalsOptional(a.timeLimit, b.timeLimit, (x, y) => x === y) &&
      _.equalsOptional(a.timeElapsed, b.timeElapsed, (x, y) => x === y) &&
      _.equalsOptional(a.suddenDeath, b.suddenDeath, (x, y) => x === y) &&
      _.equalsOptional(a.winner, b.winner, (x, y) => x === y)
    );
  },
  encode(obj: GameInfo): Uint8Array {
    const tracker = new _.Tracker();
    GameInfo._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: GameInfo, tracker: _.Tracker): void {
    tracker.pushOptional(obj.mode, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.timeLimit, (x) => tracker.pushUInt(x));
    tracker.pushOptional(obj.timeElapsed, (x) => tracker.pushInt(x));
    tracker.pushOptional(obj.suddenDeath, (x) => tracker.pushBoolean(x));
    tracker.pushOptional(obj.winner, (x) => tracker.pushString(x));
  },
  encodeDiff(a: GameInfo, b: GameInfo): Uint8Array {
    const tracker = new _.Tracker();
    GameInfo._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: GameInfo, b: GameInfo, tracker: _.Tracker): void {
    const changed = !GameInfo.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushOptionalDiffPrimitive<string>(
      a.mode,
      b.mode,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.timeLimit,
      b.timeLimit,
      (x) => tracker.pushUInt(x)
    );
    tracker.pushOptionalDiffPrimitive<number>(
      a.timeElapsed,
      b.timeElapsed,
      (x) => tracker.pushInt(x)
    );
    tracker.pushOptionalDiffPrimitive<boolean>(
      a.suddenDeath,
      b.suddenDeath,
      (x) => tracker.pushBoolean(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.winner,
      b.winner,
      (x) => tracker.pushString(x)
    );
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
  decodeDiff(obj: GameInfo, input: Uint8Array): GameInfo {
    const tracker = _.Tracker.parse(input);
    return GameInfo._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: GameInfo, tracker: _.Tracker): GameInfo {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      mode: tracker.nextOptionalDiffPrimitive<string>(
        obj.mode,
        () => tracker.nextString()
      ),
      timeLimit: tracker.nextOptionalDiffPrimitive<number>(
        obj.timeLimit,
        () => tracker.nextUInt()
      ),
      timeElapsed: tracker.nextOptionalDiffPrimitive<number>(
        obj.timeElapsed,
        () => tracker.nextInt()
      ),
      suddenDeath: tracker.nextOptionalDiffPrimitive<boolean>(
        obj.suddenDeath,
        () => tracker.nextBoolean()
      ),
      winner: tracker.nextOptionalDiffPrimitive<string>(
        obj.winner,
        () => tracker.nextString()
      ),
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
  parse(obj: DraftState): DraftState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid DraftState: ${obj}`);
    }
    return {
      timeRemaining: _.parseUInt(obj.timeRemaining),
      decks: _.parseArray(obj.decks, (x) => DraftDeckState.parse(x as DraftDeckState)),
      pairs: _.parseArray(obj.pairs, (x) => CardPairState.parse(x as CardPairState)),
    };
  },
  equals(a: DraftState, b: DraftState): boolean {
    return (
      a.timeRemaining === b.timeRemaining &&
      _.equalsArray(a.decks, b.decks, (x, y) => DraftDeckState.equals(x, y)) &&
      _.equalsArray(a.pairs, b.pairs, (x, y) => CardPairState.equals(x, y))
    );
  },
  encode(obj: DraftState): Uint8Array {
    const tracker = new _.Tracker();
    DraftState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: DraftState, tracker: _.Tracker): void {
    tracker.pushUInt(obj.timeRemaining);
    tracker.pushArray(obj.decks, (x) => DraftDeckState._encode(x, tracker));
    tracker.pushArray(obj.pairs, (x) => CardPairState._encode(x, tracker));
  },
  encodeDiff(a: DraftState, b: DraftState): Uint8Array {
    const tracker = new _.Tracker();
    DraftState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: DraftState, b: DraftState, tracker: _.Tracker): void {
    const changed = !DraftState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushUIntDiff(a.timeRemaining, b.timeRemaining);
    tracker.pushArrayDiff<DraftDeckState>(
      a.decks,
      b.decks,
      (x, y) => DraftDeckState.equals(x, y),
      (x) => DraftDeckState._encode(x, tracker),
      (x, y) => DraftDeckState._encodeDiff(x, y, tracker)
    );
    tracker.pushArrayDiff<CardPairState>(
      a.pairs,
      b.pairs,
      (x, y) => CardPairState.equals(x, y),
      (x) => CardPairState._encode(x, tracker),
      (x, y) => CardPairState._encodeDiff(x, y, tracker)
    );
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
  decodeDiff(obj: DraftState, input: Uint8Array): DraftState {
    const tracker = _.Tracker.parse(input);
    return DraftState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: DraftState, tracker: _.Tracker): DraftState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      timeRemaining: tracker.nextUIntDiff(obj.timeRemaining),
      decks: tracker.nextArrayDiff<DraftDeckState>(
        obj.decks,
        () => DraftDeckState._decode(tracker),
        (x) => DraftDeckState._decodeDiff(x, tracker)
      ),
      pairs: tracker.nextArrayDiff<CardPairState>(
        obj.pairs,
        () => CardPairState._decode(tracker),
        (x) => CardPairState._decodeDiff(x, tracker)
      ),
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
  parse(obj: DraftDeckState): DraftDeckState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid DraftDeckState: ${obj}`);
    }
    return {
      playerId: _.parseString(obj.playerId),
      card1: _.parseOptional(obj.card1, (x) => _.parseString(x)),
      card2: _.parseOptional(obj.card2, (x) => _.parseString(x)),
      card3: _.parseOptional(obj.card3, (x) => _.parseString(x)),
      card4: _.parseOptional(obj.card4, (x) => _.parseString(x)),
      card5: _.parseOptional(obj.card5, (x) => _.parseString(x)),
      card6: _.parseOptional(obj.card6, (x) => _.parseString(x)),
      card7: _.parseOptional(obj.card7, (x) => _.parseString(x)),
      card8: _.parseOptional(obj.card8, (x) => _.parseString(x)),
    };
  },
  equals(a: DraftDeckState, b: DraftDeckState): boolean {
    return (
      a.playerId === b.playerId &&
      _.equalsOptional(a.card1, b.card1, (x, y) => x === y) &&
      _.equalsOptional(a.card2, b.card2, (x, y) => x === y) &&
      _.equalsOptional(a.card3, b.card3, (x, y) => x === y) &&
      _.equalsOptional(a.card4, b.card4, (x, y) => x === y) &&
      _.equalsOptional(a.card5, b.card5, (x, y) => x === y) &&
      _.equalsOptional(a.card6, b.card6, (x, y) => x === y) &&
      _.equalsOptional(a.card7, b.card7, (x, y) => x === y) &&
      _.equalsOptional(a.card8, b.card8, (x, y) => x === y)
    );
  },
  encode(obj: DraftDeckState): Uint8Array {
    const tracker = new _.Tracker();
    DraftDeckState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: DraftDeckState, tracker: _.Tracker): void {
    tracker.pushString(obj.playerId);
    tracker.pushOptional(obj.card1, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card2, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card3, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card4, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card5, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card6, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card7, (x) => tracker.pushString(x));
    tracker.pushOptional(obj.card8, (x) => tracker.pushString(x));
  },
  encodeDiff(a: DraftDeckState, b: DraftDeckState): Uint8Array {
    const tracker = new _.Tracker();
    DraftDeckState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: DraftDeckState, b: DraftDeckState, tracker: _.Tracker): void {
    const changed = !DraftDeckState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.playerId, b.playerId);
    tracker.pushOptionalDiffPrimitive<string>(
      a.card1,
      b.card1,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card2,
      b.card2,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card3,
      b.card3,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card4,
      b.card4,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card5,
      b.card5,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card6,
      b.card6,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card7,
      b.card7,
      (x) => tracker.pushString(x)
    );
    tracker.pushOptionalDiffPrimitive<string>(
      a.card8,
      b.card8,
      (x) => tracker.pushString(x)
    );
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
  decodeDiff(obj: DraftDeckState, input: Uint8Array): DraftDeckState {
    const tracker = _.Tracker.parse(input);
    return DraftDeckState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: DraftDeckState, tracker: _.Tracker): DraftDeckState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      playerId: tracker.nextStringDiff(obj.playerId),
      card1: tracker.nextOptionalDiffPrimitive<string>(
        obj.card1,
        () => tracker.nextString()
      ),
      card2: tracker.nextOptionalDiffPrimitive<string>(
        obj.card2,
        () => tracker.nextString()
      ),
      card3: tracker.nextOptionalDiffPrimitive<string>(
        obj.card3,
        () => tracker.nextString()
      ),
      card4: tracker.nextOptionalDiffPrimitive<string>(
        obj.card4,
        () => tracker.nextString()
      ),
      card5: tracker.nextOptionalDiffPrimitive<string>(
        obj.card5,
        () => tracker.nextString()
      ),
      card6: tracker.nextOptionalDiffPrimitive<string>(
        obj.card6,
        () => tracker.nextString()
      ),
      card7: tracker.nextOptionalDiffPrimitive<string>(
        obj.card7,
        () => tracker.nextString()
      ),
      card8: tracker.nextOptionalDiffPrimitive<string>(
        obj.card8,
        () => tracker.nextString()
      ),
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
  parse(obj: CardPairState): CardPairState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid CardPairState: ${obj}`);
    }
    return {
      playerId: _.parseString(obj.playerId),
      slot1: _.parseString(obj.slot1),
      slot2: _.parseString(obj.slot2),
    };
  },
  equals(a: CardPairState, b: CardPairState): boolean {
    return (
      a.playerId === b.playerId &&
      a.slot1 === b.slot1 &&
      a.slot2 === b.slot2
    );
  },
  encode(obj: CardPairState): Uint8Array {
    const tracker = new _.Tracker();
    CardPairState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: CardPairState, tracker: _.Tracker): void {
    tracker.pushString(obj.playerId);
    tracker.pushString(obj.slot1);
    tracker.pushString(obj.slot2);
  },
  encodeDiff(a: CardPairState, b: CardPairState): Uint8Array {
    const tracker = new _.Tracker();
    CardPairState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: CardPairState, b: CardPairState, tracker: _.Tracker): void {
    const changed = !CardPairState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushStringDiff(a.playerId, b.playerId);
    tracker.pushStringDiff(a.slot1, b.slot1);
    tracker.pushStringDiff(a.slot2, b.slot2);
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
  decodeDiff(obj: CardPairState, input: Uint8Array): CardPairState {
    const tracker = _.Tracker.parse(input);
    return CardPairState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: CardPairState, tracker: _.Tracker): CardPairState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      playerId: tracker.nextStringDiff(obj.playerId),
      slot1: tracker.nextStringDiff(obj.slot1),
      slot2: tracker.nextStringDiff(obj.slot2),
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
  parse(obj: DebugBodyState): DebugBodyState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid DebugBodyState: ${obj}`);
    }
    return {
      x: _.parseInt(obj.x),
      y: _.parseInt(obj.y),
      points: _.parseArray(obj.points, (x) => Point.parse(x as Point)),
    };
  },
  equals(a: DebugBodyState, b: DebugBodyState): boolean {
    return (
      a.x === b.x &&
      a.y === b.y &&
      _.equalsArray(a.points, b.points, (x, y) => Point.equals(x, y))
    );
  },
  encode(obj: DebugBodyState): Uint8Array {
    const tracker = new _.Tracker();
    DebugBodyState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: DebugBodyState, tracker: _.Tracker): void {
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
    tracker.pushArray(obj.points, (x) => Point._encode(x, tracker));
  },
  encodeDiff(a: DebugBodyState, b: DebugBodyState): Uint8Array {
    const tracker = new _.Tracker();
    DebugBodyState._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: DebugBodyState, b: DebugBodyState, tracker: _.Tracker): void {
    const changed = !DebugBodyState.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushIntDiff(a.x, b.x);
    tracker.pushIntDiff(a.y, b.y);
    tracker.pushArrayDiff<Point>(
      a.points,
      b.points,
      (x, y) => Point.equals(x, y),
      (x) => Point._encode(x, tracker),
      (x, y) => Point._encodeDiff(x, y, tracker)
    );
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
  decodeDiff(obj: DebugBodyState, input: Uint8Array): DebugBodyState {
    const tracker = _.Tracker.parse(input);
    return DebugBodyState._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: DebugBodyState, tracker: _.Tracker): DebugBodyState {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      x: tracker.nextIntDiff(obj.x),
      y: tracker.nextIntDiff(obj.y),
      points: tracker.nextArrayDiff<Point>(
        obj.points,
        () => Point._decode(tracker),
        (x) => Point._decodeDiff(x, tracker)
      ),
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
  parse(obj: Point): Point {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Point: ${obj}`);
    }
    return {
      x: _.parseInt(obj.x),
      y: _.parseInt(obj.y),
    };
  },
  equals(a: Point, b: Point): boolean {
    return (
      a.x === b.x &&
      a.y === b.y
    );
  },
  encode(obj: Point): Uint8Array {
    const tracker = new _.Tracker();
    Point._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: Point, tracker: _.Tracker): void {
    tracker.pushInt(obj.x);
    tracker.pushInt(obj.y);
  },
  encodeDiff(a: Point, b: Point): Uint8Array {
    const tracker = new _.Tracker();
    Point._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: Point, b: Point, tracker: _.Tracker): void {
    const changed = !Point.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    tracker.pushIntDiff(a.x, b.x);
    tracker.pushIntDiff(a.y, b.y);
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
  decodeDiff(obj: Point, input: Uint8Array): Point {
    const tracker = _.Tracker.parse(input);
    return Point._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: Point, tracker: _.Tracker): Point {
    const changed = tracker.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      x: tracker.nextIntDiff(obj.x),
      y: tracker.nextIntDiff(obj.y),
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
  parse(obj: GameState): GameState {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid GameState: ${obj}`);
    }
    return {
      creatures: _.parseRecord(obj.creatures, (x) => _.parseUInt(x), (x) => CreatureState.parse(x as CreatureState)),
      items: _.parseRecord(obj.items, (x) => _.parseUInt(x), (x) => ItemState.parse(x as ItemState)),
      effects: _.parseRecord(obj.effects, (x) => _.parseUInt(x), (x) => EffectState.parse(x as EffectState)),
      objects: _.parseRecord(obj.objects, (x) => _.parseUInt(x), (x) => ObjectState.parse(x as ObjectState)),
      players: _.parseRecord(obj.players, (x) => _.parseString(x), (x) => PlayerState.parse(x as PlayerState)),
      spectators: _.parseRecord(obj.spectators, (x) => _.parseString(x), (x) => SpectatorState.parse(x as SpectatorState)),
      info: GameInfo.parse(obj.info as GameInfo),
      draft: _.parseOptional(obj.draft, (x) => DraftState.parse(x as DraftState)),
      debugBodies: _.parseOptional(obj.debugBodies, (x) => _.parseArray(x, (x) => DebugBodyState.parse(x as DebugBodyState))),
    };
  },
  equals(a: GameState, b: GameState): boolean {
    return (
      _.equalsRecord(a.creatures, b.creatures, (x, y) => x === y, (x, y) => CreatureState.equals(x, y)) &&
      _.equalsRecord(a.items, b.items, (x, y) => x === y, (x, y) => ItemState.equals(x, y)) &&
      _.equalsRecord(a.effects, b.effects, (x, y) => x === y, (x, y) => EffectState.equals(x, y)) &&
      _.equalsRecord(a.objects, b.objects, (x, y) => x === y, (x, y) => ObjectState.equals(x, y)) &&
      _.equalsRecord(a.players, b.players, (x, y) => x === y, (x, y) => PlayerState.equals(x, y)) &&
      _.equalsRecord(a.spectators, b.spectators, (x, y) => x === y, (x, y) => SpectatorState.equals(x, y)) &&
      GameInfo.equals(a.info, b.info) &&
      _.equalsOptional(a.draft, b.draft, (x, y) => DraftState.equals(x, y)) &&
      _.equalsOptional(a.debugBodies, b.debugBodies, (x, y) => _.equalsArray(x, y, (x, y) => DebugBodyState.equals(x, y)))
    );
  },
  encode(obj: GameState): Uint8Array {
    const tracker = new _.Tracker();
    GameState._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: GameState, tracker: _.Tracker): void {
    tracker.pushRecord(obj.creatures, (x) => tracker.pushUInt(x), (x) => CreatureState._encode(x, tracker));
    tracker.pushRecord(obj.items, (x) => tracker.pushUInt(x), (x) => ItemState._encode(x, tracker));
    tracker.pushRecord(obj.effects, (x) => tracker.pushUInt(x), (x) => EffectState._encode(x, tracker));
    tracker.pushRecord(obj.objects, (x) => tracker.pushUInt(x), (x) => ObjectState._encode(x, tracker));
    tracker.pushRecord(obj.players, (x) => tracker.pushString(x), (x) => PlayerState._encode(x, tracker));
    tracker.pushRecord(obj.spectators, (x) => tracker.pushString(x), (x) => SpectatorState._encode(x, tracker));
    GameInfo._encode(obj.info, tracker);
    tracker.pushOptional(obj.draft, (x) => DraftState._encode(x, tracker));
    tracker.pushOptional(obj.debugBodies, (x) => tracker.pushArray(x, (x) => DebugBodyState._encode(x, tracker)));
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
    tracker.pushRecordDiff<number, CreatureState>(
      a.creatures,
      b.creatures,
      (x, y) => CreatureState.equals(x, y),
      (x) => tracker.pushUInt(x),
      (x) => CreatureState._encode(x, tracker),
      (x, y) => CreatureState._encodeDiff(x, y, tracker)
    );
    tracker.pushRecordDiff<number, ItemState>(
      a.items,
      b.items,
      (x, y) => ItemState.equals(x, y),
      (x) => tracker.pushUInt(x),
      (x) => ItemState._encode(x, tracker),
      (x, y) => ItemState._encodeDiff(x, y, tracker)
    );
    tracker.pushRecordDiff<number, EffectState>(
      a.effects,
      b.effects,
      (x, y) => EffectState.equals(x, y),
      (x) => tracker.pushUInt(x),
      (x) => EffectState._encode(x, tracker),
      (x, y) => EffectState._encodeDiff(x, y, tracker)
    );
    tracker.pushRecordDiff<number, ObjectState>(
      a.objects,
      b.objects,
      (x, y) => ObjectState.equals(x, y),
      (x) => tracker.pushUInt(x),
      (x) => ObjectState._encode(x, tracker),
      (x, y) => ObjectState._encodeDiff(x, y, tracker)
    );
    tracker.pushRecordDiff<string, PlayerState>(
      a.players,
      b.players,
      (x, y) => PlayerState.equals(x, y),
      (x) => tracker.pushString(x),
      (x) => PlayerState._encode(x, tracker),
      (x, y) => PlayerState._encodeDiff(x, y, tracker)
    );
    tracker.pushRecordDiff<string, SpectatorState>(
      a.spectators,
      b.spectators,
      (x, y) => SpectatorState.equals(x, y),
      (x) => tracker.pushString(x),
      (x) => SpectatorState._encode(x, tracker),
      (x, y) => SpectatorState._encodeDiff(x, y, tracker)
    );
    GameInfo._encodeDiff(a.info, b.info, tracker);
    tracker.pushOptionalDiff<DraftState>(
      a.draft,
      b.draft,
      (x) => DraftState._encode(x, tracker),
      (x, y) => DraftState._encodeDiff(x, y, tracker)
    );
    tracker.pushOptionalDiff<DebugBodyState[]>(
      a.debugBodies,
      b.debugBodies,
      (x) => tracker.pushArray(x, (x) => DebugBodyState._encode(x, tracker)),
      (x, y) => tracker.pushArrayDiff<DebugBodyState>(
      x,
      y,
      (x, y) => DebugBodyState.equals(x, y),
      (x) => DebugBodyState._encode(x, tracker),
      (x, y) => DebugBodyState._encodeDiff(x, y, tracker)
    )
    );
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
      creatures: tracker.nextRecordDiff<number, CreatureState>(
        obj.creatures,
        () => tracker.nextUInt(),
        () => CreatureState._decode(tracker),
        (x) => CreatureState._decodeDiff(x, tracker)
      ),
      items: tracker.nextRecordDiff<number, ItemState>(
        obj.items,
        () => tracker.nextUInt(),
        () => ItemState._decode(tracker),
        (x) => ItemState._decodeDiff(x, tracker)
      ),
      effects: tracker.nextRecordDiff<number, EffectState>(
        obj.effects,
        () => tracker.nextUInt(),
        () => EffectState._decode(tracker),
        (x) => EffectState._decodeDiff(x, tracker)
      ),
      objects: tracker.nextRecordDiff<number, ObjectState>(
        obj.objects,
        () => tracker.nextUInt(),
        () => ObjectState._decode(tracker),
        (x) => ObjectState._decodeDiff(x, tracker)
      ),
      players: tracker.nextRecordDiff<string, PlayerState>(
        obj.players,
        () => tracker.nextString(),
        () => PlayerState._decode(tracker),
        (x) => PlayerState._decodeDiff(x, tracker)
      ),
      spectators: tracker.nextRecordDiff<string, SpectatorState>(
        obj.spectators,
        () => tracker.nextString(),
        () => SpectatorState._decode(tracker),
        (x) => SpectatorState._decodeDiff(x, tracker)
      ),
      info: GameInfo._decodeDiff(obj.info, tracker),
      draft: tracker.nextOptionalDiff<DraftState>(
        obj.draft,
        () => DraftState._decode(tracker),
        (x) => DraftState._decodeDiff(x, tracker)
      ),
      debugBodies: tracker.nextOptionalDiff<DebugBodyState[]>(
        obj.debugBodies,
        () => tracker.nextArray(() => DebugBodyState._decode(tracker)),
        (x) => tracker.nextArrayDiff<DebugBodyState>(
        x,
        () => DebugBodyState._decode(tracker),
        (x) => DebugBodyState._decodeDiff(x, tracker)
      )
      ),
    };
  },
};
