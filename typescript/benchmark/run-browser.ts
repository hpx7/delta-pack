import { runBenchmarks } from "./run.js";

// Import example data statically for browser bundling
import GameState1 from "../../examples/GameState/state1.json";
import GameState2 from "../../examples/GameState/state2.json";
import GameState3 from "../../examples/GameState/state3.json";
import GameState4 from "../../examples/GameState/state4.json";
import GameState5 from "../../examples/GameState/state5.json";
import GameState6 from "../../examples/GameState/state6.json";
import Primitives1 from "../../examples/Primitives/state1.json";
import Primitives2 from "../../examples/Primitives/state2.json";
import Test1 from "../../examples/Test/state1.json";
import User1 from "../../examples/User/state1.json";
import User2 from "../../examples/User/state2.json";

const exampleData: Record<string, object[]> = {
  GameState: [GameState1, GameState2, GameState3, GameState4, GameState5, GameState6],
  Primitives: [Primitives1, Primitives2],
  Test: [Test1],
  User: [User1, User2],
};

const filter = new URLSearchParams(window.location.search).get("filter")?.split(",").filter(Boolean);

runBenchmarks(exampleData, filter);

console.log("\n✅ Benchmarks complete!");
