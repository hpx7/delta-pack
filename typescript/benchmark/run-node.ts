import * as fs from "node:fs";
import * as path from "node:path";
import { runBenchmarks, generateBarChartSvg } from "./run.js";

const args = process.argv.slice(2);
const mode = args.includes("--interpreter") ? "interpreter" : "codegen";
const save = args.includes("--save");
const filter = args.filter((arg) => !arg.startsWith("--"));

const chartData = runBenchmarks(mode, filter.length > 0 ? filter : undefined);

if (chartData && save) {
  const chartsDir = path.join(import.meta.dirname, "..", "charts");
  fs.mkdirSync(chartsDir, { recursive: true });
  fs.writeFileSync(
    path.join(chartsDir, "encode.svg"),
    generateBarChartSvg("Encoding Speed (ops/s)", chartData.encodeGroups)
  );
  fs.writeFileSync(
    path.join(chartsDir, "decode.svg"),
    generateBarChartSvg("Decoding Speed (ops/s)", chartData.decodeGroups)
  );
  console.log("\nCharts written to benchmark/charts/encode.svg and benchmark/charts/decode.svg");
}
