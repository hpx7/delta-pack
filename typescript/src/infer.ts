import type { Type } from "./schema.js";

// Depth counter to prevent infinite recursion
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];

// Infer TypeScript type from a delta-pack Type definition (similar to Zod's z.infer)
// With schema context and recursion depth limit
export type Infer<T extends Type, S extends Record<string, Type> = {}, D extends number = 10> = [D] extends [never]
  ? unknown
  : T extends { type: "string" }
    ? string
    : T extends { type: "int" }
      ? number
      : T extends { type: "uint" }
        ? number
        : T extends { type: "float" }
          ? number
          : T extends { type: "boolean" }
            ? boolean
            : T extends { type: "enum"; options: readonly (infer U)[] }
              ? U
              : T extends { type: "array"; value: infer V }
                ? V extends Type
                  ? Array<Infer<V, S, Prev[D]>> & { _dirty?: Set<number> }
                  : never
                : T extends { type: "optional"; value: infer V }
                  ? V extends Type
                    ? Infer<V, S, Prev[D]> | undefined
                    : never
                  : T extends { type: "record"; key: infer K; value: infer V }
                    ? K extends Type
                      ? V extends Type
                        ? Map<Infer<K, S, Prev[D]>, Infer<V, S, Prev[D]>> & { _dirty?: Set<Infer<K, S, Prev[D]>> }
                        : never
                      : never
                    : T extends { type: "reference"; reference: infer R }
                      ? R extends keyof S
                        ? Infer<S[R], S, Prev[D]>
                        : unknown
                      : T extends { type: "object"; properties: infer P }
                        ? InferObject<P, S, Prev[D]>
                        : T extends { type: "union"; options: readonly any[] }
                          ? InferUnion<T["options"], S, Prev[D]>
                          : unknown;

// Helper for object type inference - splits required and optional properties
type InferObject<P, S extends Record<string, Type>, D extends number> = {
  // Required properties (not optional)
  -readonly [K in keyof P as P[K] extends { type: "optional" } ? never : K]: P[K] extends Type
    ? Infer<P[K], S, D>
    : never;
} & {
  // Optional properties (with ?)
  -readonly [K in keyof P as P[K] extends { type: "optional" } ? K : never]?: P[K] extends {
    type: "optional";
    value: infer V;
  }
    ? V extends Type
      ? Infer<V, S, D>
      : never
    : never;
} & {
  _dirty?: Set<keyof P>;
};

// Helper for union type inference
type InferUnion<Options extends readonly { reference: string }[], S extends Record<string, Type>, D extends number> = {
  [K in keyof Options]: Options[K] extends { reference: infer R }
    ? R extends keyof S
      ? { type: R; val: Infer<S[R], S, D> }
      : never
    : never;
}[number];

// Helper to define a schema with const assertion
export function defineSchema<const S extends Record<string, Type>>(schema: S): S {
  return schema;
}
