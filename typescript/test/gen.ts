import { codegenTypescript } from "@hpx7/delta-pack-cli/codegen";
import { schema } from "./schema.js";

console.log(codegenTypescript(schema));
