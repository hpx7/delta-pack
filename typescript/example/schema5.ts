import {
  ArrayType,
  BooleanType,
  IntType,
  ObjectType,
  OptionalType,
  RecordType,
  ReferenceType,
  StringType,
  UIntType,
  codegenTypescript,
} from "@hathora/delta-pack";

const Point = ObjectType({
  x: IntType(),
  y: IntType(),
});

const CreatureState = ObjectType({
  team: StringType(),
  hero: BooleanType(),
  creatureType: StringType(),
  equippedItemType: OptionalType(StringType()),
  health: UIntType(),
  maxHealth: UIntType(),
  visible: BooleanType(),
  facing: StringType(),
  moving: BooleanType(),
  moveType: StringType(),
  moveTargetX: OptionalType(IntType()),
  moveTargetY: OptionalType(IntType()),
  enemyTargetX: OptionalType(IntType()),
  enemyTargetY: OptionalType(IntType()),
  using: OptionalType(StringType()),
  useDirection: OptionalType(StringType()),
  takingDamage: BooleanType(),
  frozen: BooleanType(),
  statusEffect: OptionalType(StringType()),
  x: IntType(),
  y: IntType(),
});

const ItemState = ObjectType({
  itemType: StringType(),
  potionType: OptionalType(StringType()),
  weaponType: OptionalType(StringType()),
  x: IntType(),
  y: IntType(),
});

const EffectState = ObjectType({
  creatureId: OptionalType(IntType()),
  effectType: StringType(),
  triggerType: OptionalType(StringType()),
  ellipseEffectType: OptionalType(StringType()),
  weaponEffectType: OptionalType(StringType()),
  projectileType: OptionalType(StringType()),
  visualEffectType: OptionalType(StringType()),
  swingType: OptionalType(StringType()),
  thrustType: OptionalType(StringType()),
  weaponType: OptionalType(StringType()),
  direction: OptionalType(StringType()),
  angle: OptionalType(IntType()),
  radius: OptionalType(UIntType()),
  x: IntType(),
  y: IntType(),
  z: OptionalType(IntType()),
});

const ObjectState = ObjectType({
  team: OptionalType(StringType()),
  objectType: StringType(),
  destructibleObjectType: OptionalType(StringType()),
  environmentObjectType: OptionalType(StringType()),
  interactiveObjectType: OptionalType(StringType()),
  active: OptionalType(BooleanType()),
  towerName: OptionalType(StringType()),
  width: OptionalType(UIntType()),
  height: OptionalType(UIntType()),
  angle: OptionalType(IntType()),
  durability: OptionalType(UIntType()),
  maxDurability: OptionalType(UIntType()),
  x: IntType(),
  y: IntType(),
});

const DebugBodyState = ObjectType({
  x: IntType(),
  y: IntType(),
  points: ArrayType(ReferenceType(Point)),
});

const SpectatorState = ObjectType({
  name: StringType(),
});

const DeckState = ObjectType({
  card1: OptionalType(StringType()),
  card2: OptionalType(StringType()),
  card3: OptionalType(StringType()),
  card4: OptionalType(StringType()),
  card5: OptionalType(StringType()),
  card6: OptionalType(StringType()),
  card7: OptionalType(StringType()),
  card8: OptionalType(StringType()),
});

const HandState = ObjectType({
  slot1: OptionalType(StringType()),
  slot2: OptionalType(StringType()),
  slot3: OptionalType(StringType()),
  slot4: OptionalType(StringType()),
});

const SkillState = ObjectType({
  type: StringType(),
  inUse: BooleanType(),
  cooldown: UIntType(),
  cooldownTotal: UIntType(),
});

const SkillsState = ObjectType({
  slot1: OptionalType(ReferenceType(SkillState)),
  slot2: OptionalType(ReferenceType(SkillState)),
  slot3: OptionalType(ReferenceType(SkillState)),
  slot4: OptionalType(ReferenceType(SkillState)),
});

const PlayerState = ObjectType({
  name: StringType(),
  team: OptionalType(StringType()),
  hero: OptionalType(UIntType()),
  cents: OptionalType(UIntType()),
  deck: OptionalType(ReferenceType(DeckState)),
  randomSlots: ArrayType(StringType()),
  hand: OptionalType(ReferenceType(HandState)),
  skills: OptionalType(ReferenceType(SkillsState)),
  restrictionZones: StringType(),
});

const GameInfo = ObjectType({
  mode: OptionalType(StringType()),
  timeLimit: OptionalType(UIntType()),
  timeElapsed: OptionalType(IntType()),
  suddenDeath: OptionalType(BooleanType()),
  winner: OptionalType(StringType()),
});

const DraftDeckState = ObjectType({
  playerId: StringType(),
  card1: OptionalType(StringType()),
  card2: OptionalType(StringType()),
  card3: OptionalType(StringType()),
  card4: OptionalType(StringType()),
  card5: OptionalType(StringType()),
  card6: OptionalType(StringType()),
  card7: OptionalType(StringType()),
  card8: OptionalType(StringType()),
});

const CardPairState = ObjectType({
  playerId: StringType(),
  slot1: StringType(),
  slot2: StringType(),
});

const DraftState = ObjectType({
  timeRemaining: UIntType(),
  decks: ArrayType(ReferenceType(DraftDeckState)),
  pairs: ArrayType(ReferenceType(CardPairState)),
});

const GameState = ObjectType({
  creatures: RecordType(UIntType(), ReferenceType(CreatureState)),
  items: RecordType(UIntType(), ReferenceType(ItemState)),
  effects: RecordType(UIntType(), ReferenceType(EffectState)),
  objects: RecordType(UIntType(), ReferenceType(ObjectState)),
  players: RecordType(StringType(), ReferenceType(PlayerState)),
  spectators: RecordType(StringType(), ReferenceType(SpectatorState)),
  info: ReferenceType(GameInfo),
  draft: OptionalType(ReferenceType(DraftState)),
  debugBodies: OptionalType(ArrayType(ReferenceType(DebugBodyState))),
});

console.log(
  codegenTypescript({
    CreatureState,
    ItemState,
    EffectState,
    ObjectState,
    PlayerState,
    SpectatorState,
    DeckState,
    HandState,
    SkillsState,
    SkillState,
    GameInfo,
    DraftState,
    DraftDeckState,
    CardPairState,
    DebugBodyState,
    Point,
    GameState,
  }),
);
