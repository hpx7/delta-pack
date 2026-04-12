import {
  Type,
  StringType,
  IntType,
  FloatType,
  BooleanType,
  EnumType,
  ObjectType,
  UnionType,
} from "@hpx7/delta-pack";

// The Type union in @hpx7/delta-pack exports its interfaces but not all of
// its container variants individually, so we reconstruct what we need here.
type ArrayType = Extract<Type, { type: "array" }>;
type OptionalType = Extract<Type, { type: "optional" }>;
type RecordType = Extract<Type, { type: "record" }>;

/**
 * Exhaustive handler for every `Type` variant.
 *
 * Recursion (e.g. to render an array's element type) is up to the caller —
 * the handler just decides what to do at the current node.
 *
 * `reference` is not a method: `dispatch` automatically unwraps it to the
 * referent type before calling the handler. After unwrap, a named type
 * (`object`, `union`, or `enum`) always has its `.name` populated, so the
 * handler can pull the name directly off the type value.
 */
export interface TypeHandler<T> {
  string: (t: StringType) => T;
  int: (t: IntType) => T;
  float: (t: FloatType) => T;
  boolean: (t: BooleanType) => T;
  enum: (t: EnumType) => T;
  array: (t: ArrayType) => T;
  optional: (t: OptionalType) => T;
  record: (t: RecordType) => T;
  object: (t: ObjectType) => T;
  union: (t: UnionType) => T;
  selfReference: () => T;
}

/**
 * Dispatch a `Type` to the matching handler method.
 *
 * Automatically unwraps `reference` types — every handler sees the underlying
 * named type. TypeScript's exhaustiveness check (`never`) ensures that adding
 * a new `Type` variant surfaces as a compile error at every dispatch site.
 */
export function dispatch<T>(type: Type, h: TypeHandler<T>): T {
  switch (type.type) {
    case "reference":
      return dispatch(type.ref, h);
    case "string":
      return h.string(type);
    case "int":
      return h.int(type);
    case "float":
      return h.float(type);
    case "boolean":
      return h.boolean(type);
    case "enum":
      return h.enum(type);
    case "array":
      return h.array(type);
    case "optional":
      return h.optional(type);
    case "record":
      return h.record(type);
    case "object":
      return h.object(type);
    case "union":
      return h.union(type);
    case "self-reference":
      return h.selfReference();
  }
  const _exhaustive: never = type;
  throw new Error(`Unhandled type: ${(type as { type: string }).type}`);
}
