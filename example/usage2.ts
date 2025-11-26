import fs from "node:fs";
import { State } from "./output2.ts";

function runBenchmark() {
  let testData = JSON.parse(fs.readFileSync("example/states.json", "utf8")) as State[];

  let totalEncodeTime = 0;
  let totalDecodeTime = 0;
  let totalSize = 0;

  testData.forEach((snapshot) => {
    let startEncode = performance.now();
    let encoded = State.encode(snapshot);
    totalEncodeTime += performance.now() - startEncode;
    totalSize += encoded.length;

    let startDecode = performance.now();
    State.decode(encoded);
    totalDecodeTime += performance.now() - startDecode;
  });

  console.log(`Average Encoding Time: ${(totalEncodeTime / testData.length).toFixed(3)}ms`);
  // Average Encoding Time: 0.015ms
  console.log(`Average Decoding Time: ${(totalDecodeTime / testData.length).toFixed(3)}ms`);
  // Average Decoding Time: 0.008ms
  console.log(`Average Size per Encoded Message: ${(totalSize / testData.length).toFixed(0)} bytes`);
  // Average Size per Encoded Message: 510 bytes
}

runBenchmark();
