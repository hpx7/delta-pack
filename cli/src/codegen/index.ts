import { Type } from "@hpx7/delta-pack";
import { codegenCsharp } from "./csharp.js";
import { codegenRust } from "./rust.js";
import { codegenTypescript } from "./typescript.js";

export interface CodegenOptions {
  namespace?: string;
  /**
   * C# only. Emit every serialized property as `partial` so consumers get the
   * source-generator-emitted dirty-bit setters (per-property change tracking).
   * Off by default — generated classes are plain auto-properties; collection
   * types (DPList/DPDict) are always-tracking regardless.
   */
  partial?: boolean;
}

export type CodegenFn = (
  schema: Record<string, Type>,
  options?: CodegenOptions,
) => string;

export const languages: Record<string, CodegenFn> = {
  typescript: codegenTypescript,
  ts: codegenTypescript,
  csharp: codegenCsharp,
  cs: codegenCsharp,
  rust: codegenRust,
  rs: codegenRust,
};

export { codegenTypescript, codegenCsharp, codegenRust };
