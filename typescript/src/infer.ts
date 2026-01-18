import type { NamedType, PropertyType, ClassUnionDef } from "./schema.js";

// Check if T is `any` (any is both supertype and subtype of everything)
type IsAny<T> = 0 extends 1 & T ? true : false;

// Infer instance type from ClassUnionDef (decorator mode unions)
type InferClassUnion<U> =
  U extends ClassUnionDef<string, infer V>
    ? V extends readonly (new (...args: any[]) => infer T)[]
      ? T
      : never
    : never;

// Infer TypeScript type from a delta-pack Type definition
export type Infer<T extends NamedType | ClassUnionDef, D extends number = 10> =
  IsAny<T> extends true
    ? any
    : [D] extends [never]
      ? unknown
      : T extends ClassUnionDef
        ? InferClassUnion<T>
        : T extends NamedType
          ? InferNamedType<T, D>
          : unknown;

// Helper for NamedType inference
type InferNamedType<T extends NamedType, D extends number> = T extends { type: "object"; properties: infer P }
  ? Prettify<InferObject<P, T, D>>
  : T extends { type: "union"; options: infer V }
    ? InferUnion<V, D>
    : T extends { type: "enum"; options: readonly (infer U)[] }
      ? U
      : unknown;

// Depth counter to prevent infinite recursion
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];

// Force TypeScript to expand/flatten types for better hover display
type Prettify<T> = { [K in keyof T]: T[K] } & {};

// Primitive type mapping
type PrimitiveTypeMap = {
  string: string;
  int: number;
  float: number;
  boolean: boolean;
};

// Helper for object type inference - splits required and optional properties
type InferObject<P, Parent extends NamedType, D extends number> = {
  -readonly [K in keyof P as P[K] extends { type: "optional" } ? never : K]: P[K] extends PropertyType
    ? InferProperty<P[K], Parent, D>
    : never;
} & {
  -readonly [K in keyof P as P[K] extends { type: "optional" } ? K : never]?: P[K] extends {
    type: "optional";
    value: infer V extends PropertyType;
  }
    ? InferProperty<V, Parent, D>
    : never;
};

// Helper for property type inference
type InferProperty<T extends PropertyType, Parent extends NamedType, D extends number> = [D] extends [never]
  ? unknown
  : T extends { type: infer Type extends keyof PrimitiveTypeMap }
    ? PrimitiveTypeMap[Type]
    : InferComplex<T, Parent, D>;

// Helper for complex (non-primitive) property types
type InferComplex<T, Parent extends NamedType, D extends number> = T extends {
  type: "array";
  value: infer V extends PropertyType;
}
  ? InferProperty<V, Parent, Prev[D]>[]
  : T extends { type: "optional"; value: infer V extends PropertyType }
    ? InferProperty<V, Parent, Prev[D]> | undefined
    : T extends { type: "record"; key: infer K extends PropertyType; value: infer V extends PropertyType }
      ? Map<InferProperty<K, Parent, Prev[D]>, InferProperty<V, Parent, Prev[D]>>
      : T extends { type: "reference"; ref: infer R extends NamedType }
        ? Infer<R, Prev[D]>
        : T extends { type: "self-reference" }
          ? Infer<Parent, Prev[D]>
          : unknown;

// Helper for union type inference
type InferUnion<V, D extends number> = V extends readonly [infer First extends NamedType, ...infer Rest]
  ? ({ _type: First["name"] } & Infer<First, Prev[D]>) | InferUnion<Rest, Prev[D]>
  : never;
