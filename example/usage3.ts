import util from "util";
import { Snapshot } from "./output3.ts";

const snashot: Snapshot = {
  entities: [
    {
      entityId: 0,
      components: [
        { type: "Color", val: "red" },
        { type: "Position", val: { x: 0, y: 0, z: 0 } },
        { type: "Rotation", val: { x: 0, y: 0, z: 0, w: 0 } },
        { type: "Size3D", val: { width: 1, height: 1, depth: 1 } },
        { type: "Size1D", val: 1 },
        { type: "EntityEvent", val: "DESTROYED" },
        { type: "EntityState", val: "IDLE" },
      ],
    },
    {
      entityId: 1,
      components: [
        {
          type: "ChatList",
          val: {
            messages: [
              { author: "user1", content: "hello, world!" },
              { author: "user2", content: "hi there" },
            ],
          },
        },
      ],
    },
  ],
};

const encoded = Snapshot.encode(snashot).toBuffer();
console.log("encoded", encoded);

const decoded = Snapshot.decode(encoded);
console.log("decoded", util.inspect(decoded, { depth: null, colors: true }));
