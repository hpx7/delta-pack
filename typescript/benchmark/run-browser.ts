import { runBenchmarks } from "./run.js";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") === "interpreter" ? "interpreter" : "codegen";
const filter = params.get("filter")?.split(",").filter(Boolean);

runBenchmarks(mode, filter);
