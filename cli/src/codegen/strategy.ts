import { IntType, FloatType } from "@hpx7/delta-pack";

/**
 * How an int value is packed into the binary stream.
 *
 * - `packed`:   value fits in `numBits` after subtracting `offset` (a.k.a. `min`).
 *               Emitted via `pushBitPackedInt` / `nextEnum` (the encoder validates
 *               bounds; decoder reuses `nextEnum` since the bits on the wire are
 *               identical).
 * - `unsigned`: `min >= 0` so the value is encoded as an unsigned varint, offset
 *               by `min`. Emitted via `pushBoundedInt` / `nextBoundedInt` (or, in
 *               Rust, `push_uint` / `next_uint` after manual offsetting).
 * - `signed`:   unbounded. Emitted via `pushInt` / `nextInt` (zig-zag varint).
 *
 * Each language still renders its own syntax (method names, casts, etc.), but
 * the policy choice above is shared.
 */
export type IntStrategy =
  | { kind: "packed"; offset: number; max: number; numBits: number }
  | { kind: "unsigned"; min: number }
  | { kind: "signed" };

export function intStrategy(t: IntType): IntStrategy {
  if (t.numBits != null) {
    return { kind: "packed", offset: t.min!, max: t.max!, numBits: t.numBits };
  }
  if (t.min != null && t.min >= 0) {
    return { kind: "unsigned", min: t.min };
  }
  return { kind: "signed" };
}

/**
 * How a float value is encoded.
 *
 * - `quantized`: value is divided by `precision` and encoded as a varint uint.
 * - `full`:      IEEE 754 32-bit float (4 bytes).
 *
 * Note: a truthy check on `precision` is used for byte-identical parity with
 * the pre-refactor generators — `precision === 0` is treated the same as
 * `undefined` (an invalid precision value would divide by zero at runtime).
 */
export type FloatStrategy =
  | { kind: "quantized"; precision: number }
  | { kind: "full" };

export function floatStrategy(t: FloatType): FloatStrategy {
  return t.precision
    ? { kind: "quantized", precision: t.precision }
    : { kind: "full" };
}

/**
 * Position a diff is being emitted into.
 *
 * - `value`:   A regular diff — emits its own change encoding (e.g.
 *              `pushBooleanDiff` writes a flip bit).
 * - `element`: Inside an array/optional/record update callback. Being called
 *              already implies "this element changed", so callers can skip
 *              redundant bits — e.g. boolean doesn't need to write anything
 *              (decoder flips on update).
 *
 * Object/union/self-reference behave the same in both contexts (they always
 * use their field-only `_encodeDiff` method); only boolean cares.
 */
export type DiffContext = "value" | "element";
