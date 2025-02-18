import fs from "node:fs";
import { State } from "./output2.ts";
import { Tracker, Reader, Writer } from "../helpers.ts";

function runBenchmark() {
  let testData = JSON.parse(fs.readFileSync("example/states.json", "utf8")) as State[];

  let totalEncodeTime = 0;
  let totalDecodeTime = 0;
  let totalSize = 0;

  testData.forEach((snapshot) => {
    let startEncode = performance.now();
    let encoded = encode(snapshot);
    totalEncodeTime += performance.now() - startEncode;
    totalSize += encoded.length;

    let startDecode = performance.now();
    decode(encoded);
    totalDecodeTime += performance.now() - startDecode;
  });

  console.log(`Average Encoding Time: ${(totalEncodeTime / testData.length).toFixed(3)}ms`);
  // Average Encoding Time: 0.020ms
  console.log(`Average Decoding Time: ${(totalDecodeTime / testData.length).toFixed(3)}ms`);
  // Average Decoding Time: 0.015ms
  console.log(`Average Size per Encoded Message: ${(totalSize / testData.length).toFixed(0)} bytes`);
  // Average Size per Encoded Message: 573 bytes
}

function encode(state: State) {
  const tracker = new Tracker();
  const encoded = State.encode(state, tracker).toBuffer();
  const writer = new Writer();
  tracker.encode(writer);
  writer.writeBuffer(encoded);
  return writer.toBuffer();
}

function decode(buf: Uint8Array) {
  const reader = new Reader(buf);
  const tracker = Tracker.parse(reader);
  return State.decode(reader, tracker);
}

runBenchmark();
