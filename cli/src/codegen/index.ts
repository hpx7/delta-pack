import { Type } from "@hpx7/delta-pack";
import { codegenCsharp } from "./csharp.js";
import { codegenTypescript } from "./typescript.js";

export type CodegenFn = (
  schema: Record<string, Type>,
  namespace?: string,
) => string;

export const languages: Record<string, CodegenFn> = {
  typescript: codegenTypescript,
  ts: codegenTypescript,
  csharp: codegenCsharp,
  cs: codegenCsharp,
};

export { codegenTypescript, codegenCsharp };
