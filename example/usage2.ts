import fs, { readFileSync } from "fs";
import { State } from "./output2";
import { Reader, Writer } from "bin-serde";

function runBenchmark() {
  // Read test data from disk
  let testData = JSON.parse(fs.readFileSync("example/states.json", "utf8"));

  let totalEncodeTime = 0;
  let totalDecodeTime = 0;
  let totalSize = 0;

  testData.forEach((snapshot) => {
    let startEncode = performance.now();
    let encoded = State.encode(snapshot, new Writer()).toBuffer();
    totalEncodeTime += performance.now() - startEncode;
    totalSize += encoded.length;

    let startDecode = performance.now();
    State.decode(new Reader(encoded)); // Decoding process
    totalDecodeTime += performance.now() - startDecode;
  });

  console.log(`Average Encoding Time: ${(totalEncodeTime / testData.length).toFixed(2)}ms`);
  console.log(`Average Decoding Time: ${(totalDecodeTime / testData.length).toFixed(2)}ms`);
  console.log(`Average Size per Encoded Message: ${(totalSize / testData.length).toFixed(2)} bytes`);
}

runBenchmark();
