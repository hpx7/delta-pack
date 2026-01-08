import * as fs from "node:fs";
import * as path from "node:path";
import { runBenchmarks } from "./run.js";

const examplesDir = path.join(process.cwd(), "../examples");

function loadExampleData(): Record<string, object[]> {
  const data: Record<string, object[]> = {};

  for (const name of fs.readdirSync(examplesDir)) {
    const exampleDir = `${examplesDir}/${name}`;
    if (!fs.statSync(exampleDir).isDirectory()) continue;

    const stateFiles = fs
      .readdirSync(exampleDir)
      .filter((f) => f.match(/^state\d+\.json$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0]!);
        const numB = parseInt(b.match(/\d+/)![0]!);
        return numA - numB;
      });

    const states: object[] = [];
    for (const file of stateFiles) {
      const json = fs.readFileSync(`${exampleDir}/${file}`, "utf8");
      states.push(JSON.parse(json) as object);
    }

    if (states.length > 0) {
      data[name] = states;
    }
  }

  return data;
}

const filter = process.argv.slice(2);
const exampleData = loadExampleData();

if (filter.length > 0) {
  const availableExamples = Object.keys(exampleData);
  const matchingExamples = availableExamples.filter((e) =>
    filter.some((f) => e.toLowerCase().includes(f.toLowerCase()))
  );
  if (matchingExamples.length === 0) {
    console.error(`No examples match filter: ${filter.join(", ")}`);
    console.error(`Available: ${availableExamples.join(", ")}`);
    process.exit(1);
  }
}

runBenchmarks(exampleData, filter.length > 0 ? filter : undefined);
