import {
  ChildType,
  EnumType,
  FloatType,
  IntType,
  Modifier,
  ObjectType,
  ReferenceType,
  StringType,
  UnionType,
  codegenTypescript,
} from "../generator";

const ChatMessage = ObjectType({
  author: StringType(),
  content: StringType(),
});

const ChatList = ObjectType({
  messages: ChildType(ReferenceType("ChatMessage"), Modifier.ARRAY),
});

const Color = StringType();

const Position = ObjectType({
  x: FloatType(),
  y: FloatType(),
  z: FloatType(),
});

const Rotation = ObjectType({
  x: FloatType(),
  y: FloatType(),
  z: FloatType(),
  w: FloatType(),
});

const Size3D = ObjectType({
  width: FloatType(),
  height: FloatType(),
  depth: FloatType(),
});

const Size1D = FloatType();

const EntityEvent = EnumType(["DESTROYED"]);

const EntityState = EnumType(["IDLE", "WALK", "RUN", "JUMP", "ATTACK", "FALL", "DEATH"]);

const Component = UnionType([
  ReferenceType("Color"),
  ReferenceType("Position"),
  ReferenceType("Rotation"),
  ReferenceType("Size3D"),
  ReferenceType("Size1D"),
  ReferenceType("EntityEvent"),
  ReferenceType("EntityState"),
  ReferenceType("ChatList"),
]);

const Entity = ObjectType({
  entityId: IntType(),
  components: ChildType(ReferenceType("Component"), Modifier.ARRAY),
});

const Snapshot = ObjectType({
  entities: ChildType(ReferenceType("Entity"), Modifier.ARRAY),
});

console.log(
  codegenTypescript({
    ChatMessage,
    ChatList,
    Color,
    Position,
    Rotation,
    Size3D,
    Size1D,
    EntityEvent,
    EntityState,
    Component,
    Entity,
    Snapshot,
  }),
);
