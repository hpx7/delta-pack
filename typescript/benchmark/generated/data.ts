import GameState_state1 from "../../../examples/GameState/state1.json";
import GameState_state2 from "../../../examples/GameState/state2.json";
import GameState_state3 from "../../../examples/GameState/state3.json";
import GameState_state4 from "../../../examples/GameState/state4.json";
import GameState_state5 from "../../../examples/GameState/state5.json";
import GameState_state6 from "../../../examples/GameState/state6.json";
import Primitives_state1 from "../../../examples/Primitives/state1.json";
import Primitives_state2 from "../../../examples/Primitives/state2.json";
import Test_state1 from "../../../examples/Test/state1.json";
import User_state1 from "../../../examples/User/state1.json";
import User_state2 from "../../../examples/User/state2.json";

import GameState_schema from "../../../examples/GameState/schema.yml";
import Primitives_schema from "../../../examples/Primitives/schema.yml";
import Test_schema from "../../../examples/Test/schema.yml";
import User_schema from "../../../examples/User/schema.yml";

import GameState_proto from "../../../examples/GameState/schema.proto";
import Primitives_proto from "../../../examples/Primitives/schema.proto";
import Test_proto from "../../../examples/Test/schema.proto";
import User_proto from "../../../examples/User/schema.proto";

export const exampleData: Record<string, object[]> = {
  GameState: [GameState_state1, GameState_state2, GameState_state3, GameState_state4, GameState_state5, GameState_state6],
  Primitives: [Primitives_state1, Primitives_state2],
  Test: [Test_state1],
  User: [User_state1, User_state2],
};

export const schemas: Record<string, string> = {
  GameState: GameState_schema,
  Primitives: Primitives_schema,
  Test: Test_schema,
  User: User_schema,
};

export const protos: Record<string, string> = {
  GameState: GameState_proto,
  Primitives: Primitives_proto,
  Test: Test_proto,
  User: User_proto,
};
