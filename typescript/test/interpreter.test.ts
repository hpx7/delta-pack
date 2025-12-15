import { describe } from "vitest";
import { load } from "@hpx7/delta-pack";
import { schema } from "./schema.js";
import { runAllSharedTests } from "./shared-api-tests.js";

// Load interpreter APIs
const apis = {
  Player: load(schema.Player),
  Position: load(schema.Position),
  Velocity: load(schema.Velocity),
  Entity: load(schema.Entity),
  MoveAction: load(schema.MoveAction),
  AttackAction: load(schema.AttackAction),
  UseItemAction: load(schema.UseItemAction),
  GameAction: load(schema.GameAction),
  GameState: load(schema.GameState),
  Inventory: load(schema.Inventory),
  PlayerRegistry: load(schema.PlayerRegistry),
};

describe("Delta Pack Interpreter - Unified API", () => {
  runAllSharedTests(apis);
});
