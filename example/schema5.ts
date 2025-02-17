import {
  ArrayType,
  BooleanType,
  IntType,
  ObjectType,
  OptionalType,
  RecordType,
  StringType,
  UIntType,
  codegenTypescript,
} from "../generator";

const Point = ObjectType({
  x: IntType(),
  y: IntType(),
});

const Creature = ObjectType({
  team: StringType(),
  hero: BooleanType(),
  creatureType: StringType(),
  equippedItemType: OptionalType(StringType()),
  health: IntType(),
  maxHealth: IntType(),
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
  dead: BooleanType(),
});

const Item = ObjectType({
  id: IntType(),
  itemType: StringType(),
  potionType: OptionalType(StringType()),
  weaponType: OptionalType(StringType()),
  x: IntType(),
  y: IntType(),
});

const Effect = ObjectType({
  id: IntType(),
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
  radius: OptionalType(IntType()),
  x: IntType(),
  y: IntType(),
  z: OptionalType(IntType()),
});

const Object = ObjectType({
  id: IntType(),
  team: OptionalType(StringType()),
  objectType: StringType(),
  destructibleObjectType: OptionalType(StringType()),
  environmentObjectType: OptionalType(StringType()),
  interactiveObjectType: OptionalType(StringType()),
  active: OptionalType(BooleanType()),
  towerName: OptionalType(StringType()),
  width: OptionalType(IntType()),
  height: OptionalType(IntType()),
  angle: OptionalType(IntType()),
  durability: OptionalType(IntType()),
  maxDurability: OptionalType(IntType()),
  x: IntType(),
  y: IntType(),
});

const DebugBody = ObjectType({
  x: IntType(),
  y: IntType(),
  points: ArrayType("Point"),
});

const Player = ObjectType({
  id: StringType(),
  name: StringType(),
  team: OptionalType(StringType()),
  hero: OptionalType(IntType()),
  cents: OptionalType(IntType()),
  deck: OptionalType("Deck"),
  randomSlots: ArrayType(StringType()),
  hand: OptionalType("Hand"),
  skills: OptionalType("Skills"),
  restrictionZones: StringType(),
});

const Spectator = ObjectType({
  id: StringType(),
  name: StringType(),
});

const Deck = ObjectType({
  card1: OptionalType(StringType()),
  card2: OptionalType(StringType()),
  card3: OptionalType(StringType()),
  card4: OptionalType(StringType()),
  card5: OptionalType(StringType()),
  card6: OptionalType(StringType()),
  card7: OptionalType(StringType()),
  card8: OptionalType(StringType()),
});

const Hand = ObjectType({
  slot1: OptionalType(StringType()),
  slot2: OptionalType(StringType()),
  slot3: OptionalType(StringType()),
  slot4: OptionalType(StringType()),
});

const Skills = ObjectType({
  slot1: OptionalType("Skill"),
  slot2: OptionalType("Skill"),
  slot3: OptionalType("Skill"),
  slot4: OptionalType("Skill"),
});

const Skill = ObjectType({
  type: StringType(),
  inUse: BooleanType(),
  cooldown: IntType(),
  cooldownTotal: IntType(),
});

const GameInfo = ObjectType({
  mode: OptionalType(StringType()),
  timeLimit: OptionalType(IntType()),
  timeElapsed: OptionalType(IntType()),
  suddenDeath: OptionalType(BooleanType()),
  winner: OptionalType(StringType()),
});

const DraftState = ObjectType({
  timeRemaining: IntType(),
  decks: ArrayType("DraftDeck"),
  pairs: ArrayType("CardPair"),
});

const DraftDeck = ObjectType({
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

const CardPair = ObjectType({
  playerId: StringType(),
  slot1: StringType(),
  slot2: StringType(),
});

const GameState = ObjectType({
  creatures: RecordType(UIntType(), "Creature"),
  items: ArrayType("Item"),
  effects: ArrayType("Effect"),
  objects: ArrayType("Object"),
  players: ArrayType("Player"),
  spectators: ArrayType("Spectator"),
  info: "GameInfo",
  draft: OptionalType("DraftState"),
  // TODO: make optional array? (empty array is easier to handle)
  debugBodies: ArrayType("DebugBody"),
});

console.log(
  codegenTypescript({
    Creature,
    Item,
    Effect,
    Object,
    Player,
    Spectator,
    Deck,
    Hand,
    Skills,
    Skill,
    GameInfo,
    DraftState,
    DraftDeck,
    CardPair,
    DebugBody,
    Point,
    GameState,
  }),
);
