import { codegenTypescript } from "@hpx7/delta-pack";
import { schema } from "./schema";

const tsCode = codegenTypescript(schema);
console.log(tsCode);
