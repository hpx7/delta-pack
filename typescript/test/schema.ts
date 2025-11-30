import {
  ObjectType,
  StringType,
  IntType,
  UIntType,
  FloatType,
  BooleanType,
  ArrayType,
  OptionalType,
  RecordType,
  EnumType,
  ReferenceType,
  UnionType,
  codegenTypescript,
} from "@hathora/delta-pack";
import { defineSchema } from "@hathora/delta-pack/infer";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define test schema with multiple types
const Color = EnumType(["RED", "BLUE", "GREEN", "YELLOW"]);

const Player = ObjectType({
  id: StringType(),
  name: StringType(),
  score: IntType(),
  isActive: BooleanType(),
});

// Position with quantized floats
const Position = ObjectType({
  x: FloatType({ precision: 0.1 }),
  y: FloatType({ precision: 0.1 }),
});

// Union type for different game actions
const MoveAction = ObjectType({
  x: IntType(),
  y: IntType(),
});

const AttackAction = ObjectType({
  targetId: StringType(),
  damage: UIntType(),
});

const UseItemAction = ObjectType({
  itemId: StringType(),
});

const GameAction = UnionType([
  ReferenceType("MoveAction"),
  ReferenceType("AttackAction"),
  ReferenceType("UseItemAction"),
]);

const GameState = ObjectType({
  players: ArrayType(ReferenceType("Player")),
  currentPlayer: OptionalType(StringType()),
  round: UIntType(),
  metadata: RecordType(StringType(), StringType()),
  winningColor: OptionalType(ReferenceType("Color")),
  lastAction: OptionalType(ReferenceType("GameAction")),
});

// Export schema for interpreter tests
export const schema = defineSchema({
  Color,
  Player,
  Position,
  MoveAction,
  AttackAction,
  UseItemAction,
  GameAction,
  GameState,
});

// Generate code for codegen tests
const typeDefinitions = {
  Color,
  Player,
  Position,
  MoveAction,
  AttackAction,
  UseItemAction,
  GameAction,
  GameState,
};

const generatedCode = codegenTypescript(typeDefinitions);

// Write to output file
const outputPath = join(__dirname, "generated-schema.ts");
writeFileSync(outputPath, generatedCode, "utf8");

console.log(`Generated test schema at ${outputPath}`);
