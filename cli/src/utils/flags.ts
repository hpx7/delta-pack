import { ArgError } from "./errors.js";

export type Flags = Map<string, string | true>;

/** Look up a flag by any of its aliases. Returns `true` for boolean flags, `undefined` if unset. */
export function getFlag(
  flags: Flags,
  ...keys: string[]
): string | true | undefined {
  for (const key of keys) {
    const val = flags.get(key);
    if (val !== undefined) return val;
  }
  return undefined;
}

/** Look up a string-valued flag by alias. Bare flags (no value) and unset flags both return `undefined`. */
export function getString(flags: Flags, ...keys: string[]): string | undefined {
  const val = getFlag(flags, ...keys);
  return typeof val === "string" ? val : undefined;
}

/** Same as {@link getString}, but throws an {@link ArgError} with the given message if the flag is missing. */
export function requireString(
  flags: Flags,
  keys: string[],
  error: string,
): string {
  const val = getString(flags, ...keys);
  if (val === undefined) throw new ArgError(error);
  return val;
}

/** Validate that the positional schema argument is present. */
export function requireSchemaPath(
  schemaPath: string | undefined,
  command: string,
): string {
  if (!schemaPath) {
    throw new ArgError(`${command}: schema file required`);
  }
  return schemaPath;
}
