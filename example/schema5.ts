import {
  BooleanType,
  ChildType,
  IntType,
  Modifier,
  ObjectType,
  ReferenceType,
  StringType,
  codegenTypescript,
} from "../generator";

const Point = ObjectType({
  x: IntType(),
  y: IntType(),
});

const Creature = ObjectType({
  id: IntType(),
  team: StringType(),
  hero: BooleanType(),
  creatureType: StringType(),
  equippedItemType: ChildType(StringType(), Modifier.OPTIONAL),
  health: IntType(),
  maxHealth: IntType(),
  visible: BooleanType(),
  facing: StringType(),
  moving: BooleanType(),
  moveType: StringType(),
  moveTargetX: ChildType(IntType(), Modifier.OPTIONAL),
  moveTargetY: ChildType(IntType(), Modifier.OPTIONAL),
  enemyTargetX: ChildType(IntType(), Modifier.OPTIONAL),
  enemyTargetY: ChildType(IntType(), Modifier.OPTIONAL),
  using: ChildType(StringType(), Modifier.OPTIONAL),
  useDirection: ChildType(StringType(), Modifier.OPTIONAL),
  takingDamage: BooleanType(),
  frozen: BooleanType(),
  statusEffect: ChildType(StringType(), Modifier.OPTIONAL),
  x: IntType(),
  y: IntType(),
  dead: BooleanType(),
});

const Item = ObjectType({
  id: IntType(),
  itemType: StringType(),
  potionType: ChildType(StringType(), Modifier.OPTIONAL),
  weaponType: ChildType(StringType(), Modifier.OPTIONAL),
  x: IntType(),
  y: IntType(),
});

const Effect = ObjectType({
  id: IntType(),
  creatureId: ChildType(IntType(), Modifier.OPTIONAL),
  effectType: StringType(),
  triggerType: ChildType(StringType(), Modifier.OPTIONAL),
  ellipseEffectType: ChildType(StringType(), Modifier.OPTIONAL),
  weaponEffectType: ChildType(StringType(), Modifier.OPTIONAL),
  projectileType: ChildType(StringType(), Modifier.OPTIONAL),
  visualEffectType: ChildType(StringType(), Modifier.OPTIONAL),
  swingType: ChildType(StringType(), Modifier.OPTIONAL),
  thrustType: ChildType(StringType(), Modifier.OPTIONAL),
  weaponType: ChildType(StringType(), Modifier.OPTIONAL),
  direction: ChildType(StringType(), Modifier.OPTIONAL),
  angle: ChildType(IntType(), Modifier.OPTIONAL),
  radius: ChildType(IntType(), Modifier.OPTIONAL),
  x: IntType(),
  y: IntType(),
  z: ChildType(IntType(), Modifier.OPTIONAL),
});

const Object = ObjectType({
  id: IntType(),
  team: ChildType(StringType(), Modifier.OPTIONAL),
  objectType: StringType(),
  destructibleObjectType: ChildType(StringType(), Modifier.OPTIONAL),
  environmentObjectType: ChildType(StringType(), Modifier.OPTIONAL),
  interactiveObjectType: ChildType(StringType(), Modifier.OPTIONAL),
  active: ChildType(BooleanType(), Modifier.OPTIONAL),
  towerName: ChildType(StringType(), Modifier.OPTIONAL),
  width: ChildType(IntType(), Modifier.OPTIONAL),
  height: ChildType(IntType(), Modifier.OPTIONAL),
  angle: ChildType(IntType(), Modifier.OPTIONAL),
  durability: ChildType(IntType(), Modifier.OPTIONAL),
  maxDurability: ChildType(IntType(), Modifier.OPTIONAL),
  x: IntType(),
  y: IntType(),
});

const DebugBody = ObjectType({
  x: IntType(),
  y: IntType(),
  points: ChildType(ReferenceType("Point"), Modifier.ARRAY),
});

const Player = ObjectType({
  id: StringType(),
  name: StringType(),
  team: ChildType(StringType(), Modifier.OPTIONAL),
  hero: ChildType(IntType(), Modifier.OPTIONAL),
  cents: ChildType(IntType(), Modifier.OPTIONAL),
  deck: ChildType(ReferenceType("Deck"), Modifier.OPTIONAL),
  randomSlots: ChildType(StringType(), Modifier.ARRAY),
  hand: ChildType(ReferenceType("Hand"), Modifier.OPTIONAL),
  skills: ChildType(ReferenceType("Skills"), Modifier.OPTIONAL),
  restrictionZones: StringType(),
});

const Spectator = ObjectType({
  id: StringType(),
  name: StringType(),
});

const Deck = ObjectType({
  card1: ChildType(StringType(), Modifier.OPTIONAL),
  card2: ChildType(StringType(), Modifier.OPTIONAL),
  card3: ChildType(StringType(), Modifier.OPTIONAL),
  card4: ChildType(StringType(), Modifier.OPTIONAL),
  card5: ChildType(StringType(), Modifier.OPTIONAL),
  card6: ChildType(StringType(), Modifier.OPTIONAL),
  card7: ChildType(StringType(), Modifier.OPTIONAL),
  card8: ChildType(StringType(), Modifier.OPTIONAL),
});

const Hand = ObjectType({
  slot1: ChildType(StringType(), Modifier.OPTIONAL),
  slot2: ChildType(StringType(), Modifier.OPTIONAL),
  slot3: ChildType(StringType(), Modifier.OPTIONAL),
  slot4: ChildType(StringType(), Modifier.OPTIONAL),
});

const Skills = ObjectType({
  slot1: ChildType(ReferenceType("Skill"), Modifier.OPTIONAL),
  slot2: ChildType(ReferenceType("Skill"), Modifier.OPTIONAL),
  slot3: ChildType(ReferenceType("Skill"), Modifier.OPTIONAL),
  slot4: ChildType(ReferenceType("Skill"), Modifier.OPTIONAL),
});

const Skill = ObjectType({
  type: StringType(),
  inUse: BooleanType(),
  cooldown: IntType(),
  cooldownTotal: IntType(),
});

const GameInfo = ObjectType({
  mode: ChildType(StringType(), Modifier.OPTIONAL),
  timeLimit: ChildType(IntType(), Modifier.OPTIONAL),
  timeElapsed: ChildType(IntType(), Modifier.OPTIONAL),
  suddenDeath: ChildType(BooleanType(), Modifier.OPTIONAL),
  winner: ChildType(StringType(), Modifier.OPTIONAL),
});

const DraftState = ObjectType({
  timeRemaining: IntType(),
  decks: ChildType(ReferenceType("DraftDeck"), Modifier.ARRAY),
  pairs: ChildType(ReferenceType("CardPair"), Modifier.ARRAY),
});

const DraftDeck = ObjectType({
  playerId: StringType(),
  card1: ChildType(StringType(), Modifier.OPTIONAL),
  card2: ChildType(StringType(), Modifier.OPTIONAL),
  card3: ChildType(StringType(), Modifier.OPTIONAL),
  card4: ChildType(StringType(), Modifier.OPTIONAL),
  card5: ChildType(StringType(), Modifier.OPTIONAL),
  card6: ChildType(StringType(), Modifier.OPTIONAL),
  card7: ChildType(StringType(), Modifier.OPTIONAL),
  card8: ChildType(StringType(), Modifier.OPTIONAL),
});

const CardPair = ObjectType({
  playerId: StringType(),
  slot1: StringType(),
  slot2: StringType(),
});

const GameState = ObjectType({
  creatures: ChildType(ReferenceType("Creature"), Modifier.ARRAY),
  items: ChildType(ReferenceType("Item"), Modifier.ARRAY),
  effects: ChildType(ReferenceType("Effect"), Modifier.ARRAY),
  objects: ChildType(ReferenceType("Object"), Modifier.ARRAY),
  players: ChildType(ReferenceType("Player"), Modifier.ARRAY),
  spectators: ChildType(ReferenceType("Spectator"), Modifier.ARRAY),
  info: ReferenceType("GameInfo"),
  draft: ChildType(ReferenceType("DraftState"), Modifier.OPTIONAL),
  // TODO: make optional array? (empty array is easier to handle)
  debugBodies: ChildType(ReferenceType("DebugBody"), Modifier.ARRAY),
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
