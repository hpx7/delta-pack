import { EntityState, Snapshot } from "./output3";

const snashot: Snapshot = {
  entities: [
    {
      entityId: 0,
      components: [
        { type: "Color", val: "red" },
        { type: "Position", val: { x: 0, y: 0, z: 0 } },
        { type: "Rotation", val: { x: 0, y: 0, z: 0, w: 0 } },
        { type: "EntityState", val: EntityState.IDLE },
      ],
    },
  ],
  chatList: [
    {
      author: "user1",
      content: "hello, world!",
    },
  ],
};

console.log(Snapshot.encode(snashot).toBuffer());
// Uint8Array(61) [
//   1,   0,   4,   0,   3, 114, 101, 100,   1,   0,   0,   0,
//   0,   0,   0,   0,   0,   0,   0,   0,   0,   2,   0,   0,
//   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
//   0,   0,   3,   0,   1,   5, 117, 115, 101, 114,  49,  13,
// 104, 101, 108, 108, 111,  44,  32, 119, 111, 114, 108, 100,
//  33
// ]
