import { runBenchmarks } from "./run.js";

const args = process.argv.slice(2);
const mode = args.includes("--interpreter") ? "interpreter" : "codegen";
const filter = args.filter((arg) => !arg.startsWith("--"));

runBenchmarks(mode, filter.length > 0 ? filter : undefined);
