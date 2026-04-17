import GameState_state1 from "../../../examples/GameState/state1.json";
import GameState_state2 from "../../../examples/GameState/state2.json";
import GameState_state3 from "../../../examples/GameState/state3.json";
import Primitives_state1 from "../../../examples/Primitives/state1.json";
import Primitives_state2 from "../../../examples/Primitives/state2.json";
import Test_state1 from "../../../examples/Test/state1.json";
import Test_state2 from "../../../examples/Test/state2.json";
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

import GameState_avsc from "../../../examples/GameState/schema.avsc";
import Primitives_avsc from "../../../examples/Primitives/schema.avsc";
import Test_avsc from "../../../examples/Test/schema.avsc";
import User_avsc from "../../../examples/User/schema.avsc";

export const exampleData: Record<string, object[]> = {
  GameState: [GameState_state1, GameState_state2, GameState_state3],
  Primitives: [Primitives_state1, Primitives_state2],
  Test: [Test_state1, Test_state2],
  User: [User_state1, User_state2],
};

export const deltapackSchemas: Record<string, string> = {
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

export const avroSchemas: Record<string, string> = {
  GameState: GameState_avsc,
  Primitives: Primitives_avsc,
  Test: Test_avsc,
  User: User_avsc,
};
