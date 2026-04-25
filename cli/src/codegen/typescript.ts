import { Type, NamedType } from "@hpx7/delta-pack";
import { dispatch } from "./visitor.js";
import { intStrategy, floatStrategy, DiffContext } from "./strategy.js";

export function codegenTypescript(schema: Record<string, Type>): string {
  const ctx = createContext(schema);
  return renderSchema(ctx);
}

// ============ Context ============

interface GeneratorContext {
  schema: Record<string, Type>;
  currentTypeName: string;
}

function createContext(schema: Record<string, Type>): GeneratorContext {
  return { schema, currentTypeName: "" };
}

// ============ Utilities ============

function ifElseChain<T>(
  items: readonly T[],
  render: (item: T, i: number, prefix: string) => string,
): string {
  return items
    .map((item, i) => render(item, i, i > 0 ? "else " : ""))
    .join("\n");
}

// ============ Main Renderer ============

function renderSchema(ctx: GeneratorContext): string {
  const types: string[] = [];
  const apis: string[] = [];

  for (const [name, type] of Object.entries(ctx.schema)) {
    ctx.currentTypeName = name;
    if (type.type === "enum") {
      types.push(renderEnumType(name, type.options));
      apis.push(renderEnumApi(name, type.options));
    } else if (type.type === "object") {
      types.push(renderObjectType(ctx, name, type.properties));
      apis.push(renderObjectApi(ctx, name, type.properties));
    } else if (type.type === "union") {
      types.push(renderUnionType(name, type.options));
      apis.push(renderUnionApi(ctx, name, type.options, type.numBits));
    }
  }

  return `import * as _ from "@hpx7/delta-pack/runtime";

${types.join("\n\n")}

${apis.join("\n")}
`;
}

// ============ Enum Renderer ============

function renderEnumType(name: string, options: readonly string[]): string {
  return `export type ${name} = ${options.map((opt) => `"${opt}"`).join(" | ")};`;
}

function renderEnumApi(name: string, options: readonly string[]): string {
  return `
const ${name} = {
  ${options.map((opt, i) => `${i}: "${opt}",`).join("\n  ")}
  ${options.map((opt, i) => `${opt}: ${i},`).join("\n  ")}
};`;
}

// ============ Object Renderer ============

function renderObjectType(
  ctx: GeneratorContext,
  name: string,
  properties: Record<string, Type>,
): string {
  const props = Object.entries(properties)
    .map(([propName, propType]) => {
      const optional = propType.type === "optional" ? "?" : "";
      return `  ${propName}${optional}: ${renderType(ctx, propType)};`;
    })
    .join("\n");

  return `export type ${name} = {
${props}
};`;
}

function renderObjectApi(
  ctx: GeneratorContext,
  name: string,
  properties: Record<string, Type>,
): string {
  const props = Object.entries(properties);
  const p = (fn: (n: string, t: Type) => string) =>
    props.map(([n, t]) => fn(n, t)).join("\n");

  const defaultBody = p((n, t) => `      ${n}: ${renderDefault(ctx, t)},`);
  const fromJsonBody = p(
    (n, t) =>
      `      ${n}: _.tryParseField(() => ${renderFromJson(ctx, t, `o["${n}"]`)}, "${name}.${n}"),`,
  );
  const toJsonBody = p((n, t) =>
    t.type === "optional"
      ? `    if (obj.${n} != null) {\n      result["${n}"] = ${renderToJson(ctx, t, `obj.${n}`)};\n    }`
      : `    result["${n}"] = ${renderToJson(ctx, t, `obj.${n}`)};`,
  );
  const cloneBody = p(
    (n, t) => `      ${n}: ${renderClone(ctx, t, `obj.${n}`)},`,
  );
  const equalsBody = props
    .map(([n, t]) => renderEquals(ctx, t, `a.${n}`, `b.${n}`))
    .join(" &&\n      ");
  const encodeBody = p((n, t) => `    ${renderEncode(ctx, t, `obj.${n}`)};`);
  const encodeDiffBody = p(
    (n, t) => `    ${renderEncodeDiffField(ctx, t, "a", "b", n)}`,
  );
  // `bRaw` is referenced by helper calls and by inline blocks for fields read
  // via the unwrapped parent — i.e. anything other than tracked containers
  // (array/record/optional<container>), which must read through the proxy.
  // Skip the declaration when no field uses it, otherwise tsc flags it as unused.
  const usesUnwrapped = props.some(([, t]) => !needsProxyAccess(t));
  const bRawDecl = usesUnwrapped ? "\n    const bRaw = _.getUnderlying(b);" : "";
  // `versions` drives the dirty-version filter for every non-boolean field. The
  // only case where it's unused is when every field is boolean.
  const usesVersions = props.some(([, t]) => !isBooleanLike(t));
  const versionsDecl = usesVersions ? "\n    const versions = _.getFieldVersions(b);" : "";
  const decodeBody = p((n, t) => `      ${n}: ${renderDecode(ctx, t)},`);
  const decodeDiffBody = p(
    (n, t) => `      ${n}: ${renderDecodeDiffField(ctx, t, `obj.${n}`)},`,
  );

  return `
export const ${name} = {
  default(): ${name} {
    return {
${defaultBody}
    };
  },
  fromJson(obj: object): ${name} {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(\`Invalid ${name}: \${obj}\`);
    }
    const o = obj as Record<string, unknown>;
    return {
${fromJsonBody}
    };
  },
  toJson(obj: ${name}): Record<string, unknown> {
    const result: Record<string, unknown> = {};
${toJsonBody}
    return result;
  },
  clone(obj: ${name}): ${name} {
    return {
${cloneBody}
    };
  },
  equals(a: ${name}, b: ${name}): boolean {
    return (
      ${equalsBody || "true"}
    );
  },
  encode(obj: ${name}): Uint8Array {
    const encoder = _.Encoder.create();
    ${name}._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: ${name}, encoder: _.Encoder): void {
${encodeBody}
  },
  encodeDiff(a: ${name}, b: ${name}): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.minVersion = _.getSnapshotVersion(a) ?? -1;
    encoder.pushObjectDiff(a, b, ${name}.equals, ${name}._encodeDiff);
    return encoder.toBuffer();
  },
  _encodeDiff(a: ${name}, b: ${name}, encoder: _.DiffEncoder): void {${versionsDecl}${bRawDecl}
${encodeDiffBody}
  },
  decode(input: Uint8Array): ${name} {
    return ${name}._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): ${name} {
    return {
${decodeBody}
    };
  },
  decodeDiff(obj: ${name}, input: Uint8Array): ${name} {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => ${name}._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: ${name}, decoder: _.DiffDecoder): ${name} {
    return {
${decodeDiffBody}
    };
  },
  createSyncSession(): _.SyncSession<${name}> {
    return new _.SyncSession(${name});
  },
};`;
}

// ============ Union Renderer ============

function renderUnionType(name: string, options: readonly NamedType[]): string {
  return `export type ${name} = ${options.map((opt) => `{ _type: "${opt.name}" } & ${opt.name}`).join(" | ")};`;
}

function renderUnionApi(
  ctx: GeneratorContext,
  name: string,
  options: readonly NamedType[],
  numBits: number,
): string {
  const first = options[0]!;

  const toJsonCases = ifElseChain(
    options,
    (opt, _, p) =>
      `    ${p}if (obj._type === "${opt.name}") {\n      return { ${opt.name}: ${renderToJson(ctx, opt, "obj")} };\n    }`,
  );

  const cloneCases = ifElseChain(
    options,
    (opt, _, p) =>
      `    ${p}if (obj._type === "${opt.name}") {\n      return { _type: "${opt.name}" as const, ...${opt.name}.clone(obj) };\n    }`,
  );

  const equalsCases = ifElseChain(
    options,
    (opt, _, p) =>
      `    ${p}if (a._type === "${opt.name}" && b._type === "${opt.name}") {\n      return ${renderEquals(ctx, opt, "a", "b")};\n    }`,
  );

  const encodeCases = ifElseChain(
    options,
    (opt, i, p) =>
      `    ${p}if (obj._type === "${opt.name}") {\n      encoder.pushEnum(${i}, ${numBits});\n      ${renderEncode(ctx, opt, "obj")};\n    }`,
  );

  const encodeDiffCases = ifElseChain(
    options,
    (opt, i, p) =>
      `    ${p}if (b._type === "${opt.name}") {\n      if (a._type === "${opt.name}") {\n        ${opt.name}._encodeDiff(a, b, encoder);\n      } else {\n        encoder.pushEnum(${i}, ${numBits});\n        ${renderEncode(ctx, opt, "b")};\n      }\n    }`,
  );

  const decodeCases = ifElseChain(
    options,
    (opt, i, p) =>
      `    ${p}if (type === ${i}) {\n      return { _type: "${opt.name}", ...${renderDecode(ctx, opt)} };\n    }`,
  );

  const decodeDiffSame = ifElseChain(
    options,
    (opt, _, p) =>
      `      ${p}if (obj._type === "${opt.name}") {\n        return { _type: "${opt.name}", ...${opt.name}._decodeDiff(obj, decoder) };\n      }`,
  );

  const decodeDiffNew = ifElseChain(
    options,
    (opt, i, p) =>
      `      ${p}if (type === ${i}) {\n        return { _type: "${opt.name}", ...${renderDecode(ctx, opt)} };\n      }`,
  );

  return `
export const ${name} = {
  default(): ${name} {
    return { _type: "${first.name}", ...${first.name}.default() };
  },
  values() {
    return [${options.map((opt) => `"${opt.name}"`).join(", ")}];
  },
  fromJson(obj: object): ${name} {
    const result = _.parseUnion(obj, [${options.map((opt) => `"${opt.name}"`).join(", ")}] as const, {
${options.map((opt) => `      ${opt.name}: (x: unknown) => ${renderFromJson(ctx, opt, "x")}`).join(",\n")}
    });
    return result as ${name};
  },
  toJson(obj: ${name}): Record<string, unknown> {
${toJsonCases}
    throw new Error(\`Invalid ${name}: \${obj}\`);
  },
  clone(obj: ${name}): ${name} {
${cloneCases}
    throw new Error(\`Invalid ${name}: \${obj}\`);
  },
  equals(a: ${name}, b: ${name}): boolean {
${equalsCases}
    return false;
  },
  encode(obj: ${name}): Uint8Array {
    const encoder = _.Encoder.create();
    ${name}._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: ${name}, encoder: _.Encoder): void {
${encodeCases}
  },
  encodeDiff(a: ${name}, b: ${name}): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.minVersion = _.getSnapshotVersion(a) ?? -1;
    ${name}._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: ${name}, b: ${name}, encoder: _.DiffEncoder): void {
    encoder.pushBoolean(a._type === b._type);
${encodeDiffCases}
  },
  decode(input: Uint8Array): ${name} {
    return ${name}._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): ${name} {
    const type = decoder.nextEnum(${numBits});
${decodeCases}
    throw new Error("Invalid union");
  },
  decodeDiff(obj: ${name}, input: Uint8Array): ${name} {
    return ${name}._decodeDiff(obj, _.DiffDecoder.create(input));
  },
  _decodeDiff(obj: ${name}, decoder: _.DiffDecoder): ${name} {
    const isSameType = decoder.nextBoolean();
    if (isSameType) {
${decodeDiffSame}
      throw new Error("Invalid union diff");
    } else {
      const type = decoder.nextEnum(${numBits});
${decodeDiffNew}
      throw new Error("Invalid union diff");
    }
  },
  createSyncSession(): _.SyncSession<${name}> {
    return new _.SyncSession(${name});
  },
}`;
}

// ============ Type Helpers ============

// Returns an offset expression — `expr - offset`, or `expr` if offset is 0.
// Used for int values packed into `numBits` via pushEnum.
function intOffset(expr: string, offset: number): string {
  return offset === 0 ? expr : `(${expr} - ${offset})`;
}

function renderType(ctx: GeneratorContext, type: Type): string {
  return dispatch(type, {
    string: () => "string",
    int: () => "number",
    float: () => "number",
    boolean: () => "boolean",
    enum: (t) => t.name,
    array: (t) => {
      const elem = renderType(ctx, t.value);
      const parens = t.value.type === "array" || t.value.type === "record";
      return parens ? `(${elem})[]` : `${elem}[]`;
    },
    optional: (t) => `${renderType(ctx, t.value)} | undefined`,
    record: (t) =>
      `Map<${renderType(ctx, t.key)}, ${renderType(ctx, t.value)}>`,
    selfReference: () => ctx.currentTypeName,
    object: (t) => t.name,
    union: (t) => t.name,
  });
}

function renderDefault(ctx: GeneratorContext, type: Type): string {
  return dispatch(type, {
    string: () => '""',
    int: () => "0",
    float: () => "0.0",
    boolean: () => "false",
    enum: (t) => `"${t.options[0]}"`,
    array: () => "[]",
    optional: () => "undefined",
    record: () => "new Map()",
    selfReference: () => `${ctx.currentTypeName}.default()`,
    object: (t) => `${t.name}.default()`,
    union: (t) => `${t.name}.default()`,
  });
}

function renderFromJson(
  ctx: GeneratorContext,
  type: Type,
  key: string,
): string {
  return dispatch(type, {
    string: () => `_.parseString(${key})`,
    int: (t) =>
      t.max != null
        ? `_.parseInt(${key}, ${t.min}, ${t.max})`
        : t.min != null
          ? `_.parseInt(${key}, ${t.min})`
          : `_.parseInt(${key})`,
    float: () => `_.parseFloat(${key})`,
    boolean: () => `_.parseBoolean(${key})`,
    enum: (t) => `_.parseEnum(${key}, ${t.name})`,
    array: (t) =>
      `_.parseArray(${key}, (x) => ${renderFromJson(ctx, t.value, "x")})`,
    optional: (t) =>
      `_.parseOptional(${key}, (x) => ${renderFromJson(ctx, t.value, "x")})`,
    record: (t) =>
      `_.parseRecord(${key}, (x) => ${renderFromJson(ctx, t.key, "x")}, (x) => ${renderFromJson(ctx, t.value, "x")})`,
    selfReference: () =>
      `${ctx.currentTypeName}.fromJson(${key} as ${ctx.currentTypeName})`,
    object: (t) => `${t.name}.fromJson(${key} as ${t.name})`,
    union: (t) => `${t.name}.fromJson(${key} as ${t.name})`,
  });
}

function renderToJson(ctx: GeneratorContext, type: Type, key: string): string {
  return dispatch(type, {
    string: () => key,
    int: () => key,
    float: () => key,
    boolean: () => key,
    enum: () => key,
    array: (t) => `${key}.map((x) => ${renderToJson(ctx, t.value, "x")})`,
    optional: (t) => renderToJson(ctx, t.value, key),
    record: (t) =>
      `_.mapToObject(${key}, (x) => ${renderToJson(ctx, t.value, "x")})`,
    selfReference: () => `${ctx.currentTypeName}.toJson(${key})`,
    object: (t) => `${t.name}.toJson(${key})`,
    union: (t) => `${t.name}.toJson(${key})`,
  });
}

function renderClone(ctx: GeneratorContext, type: Type, key: string): string {
  return dispatch(type, {
    string: () => key,
    int: () => key,
    float: () => key,
    boolean: () => key,
    enum: () => key,
    array: (t) => `${key}.map((x) => ${renderClone(ctx, t.value, "x")})`,
    optional: (t) =>
      `${key} != null ? ${renderClone(ctx, t.value, key)} : undefined`,
    record: (t) =>
      `new Map([...${key}].map(([k, v]) => [k, ${renderClone(ctx, t.value, "v")}]))`,
    selfReference: () => `${ctx.currentTypeName}.clone(${key})`,
    object: (t) => `${t.name}.clone(${key})`,
    union: (t) => `${t.name}.clone(${key})`,
  });
}

function renderEquals(
  ctx: GeneratorContext,
  type: Type,
  a: string,
  b: string,
): string {
  return dispatch(type, {
    string: () => `${a} === ${b}`,
    int: () => `${a} === ${b}`,
    boolean: () => `${a} === ${b}`,
    enum: () => `${a} === ${b}`,
    float: (t) => {
      const s = floatStrategy(t);
      return s.kind === "quantized"
        ? `_.equalsFloatQuantized(${a}, ${b}, ${s.precision})`
        : `_.equalsFloat(${a}, ${b})`;
    },
    array: (t) =>
      `_.equalsArray(${a}, ${b}, (x, y) => ${renderEquals(ctx, t.value, "x", "y")})`,
    optional: (t) =>
      `_.equalsOptional(${a}, ${b}, (x, y) => ${renderEquals(ctx, t.value, "x", "y")})`,
    record: (t) =>
      `_.equalsRecord(${a}, ${b}, (x, y) => x === y, (x, y) => ${renderEquals(ctx, t.value, "x", "y")})`,
    selfReference: () => `${ctx.currentTypeName}.equals(${a}, ${b})`,
    object: (t) => `${t.name}.equals(${a}, ${b})`,
    union: (t) => `${t.name}.equals(${a}, ${b})`,
  });
}

function renderEncode(ctx: GeneratorContext, type: Type, key: string): string {
  return dispatch(type, {
    string: () => `encoder.pushString(${key})`,
    int: (t) => {
      const s = intStrategy(t);
      if (s.kind === "packed") {
        return `encoder.pushBitPackedInt(${key}, ${s.offset}, ${s.max}, ${s.numBits})`;
      }
      if (s.kind === "unsigned") {
        return `encoder.pushBoundedInt(${key}, ${s.min})`;
      }
      return `encoder.pushInt(${key})`;
    },
    float: (t) => {
      const s = floatStrategy(t);
      return s.kind === "quantized"
        ? `encoder.pushFloatQuantized(${key}, ${s.precision})`
        : `encoder.pushFloat(${key})`;
    },
    boolean: () => `encoder.pushBoolean(${key})`,
    enum: (t) => `encoder.pushEnum(${t.name}[${key}], ${t.numBits})`,
    array: (t) =>
      `encoder.pushArray(${key}, (x) => ${renderEncode(ctx, t.value, "x")})`,
    optional: (t) =>
      `encoder.pushOptional(${key}, (x) => ${renderEncode(ctx, t.value, "x")})`,
    record: (t) =>
      `encoder.pushRecord(${key}, (x) => ${renderEncode(ctx, t.key, "x")}, (x) => ${renderEncode(ctx, t.value, "x")})`,
    selfReference: () => `${ctx.currentTypeName}._encode(${key}, encoder)`,
    object: (t) => `${t.name}._encode(${key}, encoder)`,
    union: (t) => `${t.name}._encode(${key}, encoder)`,
  });
}

function renderDecode(ctx: GeneratorContext, type: Type): string {
  return dispatch(type, {
    string: () => `decoder.nextString()`,
    int: (t) => {
      const s = intStrategy(t);
      if (s.kind === "packed") {
        const e = `decoder.nextEnum(${s.numBits})`;
        return s.offset === 0 ? e : `(${e} + ${s.offset})`;
      }
      if (s.kind === "unsigned") {
        return `decoder.nextBoundedInt(${s.min})`;
      }
      return `decoder.nextInt()`;
    },
    float: (t) => {
      const s = floatStrategy(t);
      return s.kind === "quantized"
        ? `decoder.nextFloatQuantized(${s.precision})`
        : `decoder.nextFloat()`;
    },
    boolean: () => `decoder.nextBoolean()`,
    enum: (t) => `(${t.name} as any)[decoder.nextEnum(${t.numBits})]`,
    array: (t) => `decoder.nextArray(() => ${renderDecode(ctx, t.value)})`,
    optional: (t) =>
      `decoder.nextOptional(() => ${renderDecode(ctx, t.value)})`,
    record: (t) =>
      `decoder.nextRecord(() => ${renderDecode(ctx, t.key)}, () => ${renderDecode(ctx, t.value)})`,
    selfReference: () => `${ctx.currentTypeName}._decode(decoder)`,
    object: (t) => `${t.name}._decode(decoder)`,
    union: (t) => `${t.name}._decode(decoder)`,
  });
}

// Per-field diff. The shared `DiffEncoder` helpers (pushFieldString, …,
// pushFieldDiff) are the single source of truth for the dirty gate +
// value-compare + change-bit logic; this function picks which helper to call
// for each field type. Booleans skip the version gate (tracking overhead >
// comparison cost). Array/record/optional fields fall back to an inline
// if/else block — closures inside those only allocate when the field is dirty,
// so a helper-with-callbacks would force unconditional allocation.
function renderEncodeDiffField(
  ctx: GeneratorContext,
  type: Type,
  a: string,
  b: string,
  key: string,
): string {
  if (type.type === "reference") {
    return renderEncodeDiffField(ctx, type.ref, a, b, key);
  }
  // Boolean: just emit the flip bit, no version filter.
  if (type.type === "boolean") {
    return `encoder.pushBooleanDiff(${a}.${key}, bRaw.${key});`;
  }
  // Containers (array/record/optional) — inline if/else, with proxy access for
  // tracked-container reads (the plain target stays empty/stale; the proxy
  // routes reads through the tracked child).
  if (type.type === "array" || type.type === "record" || type.type === "optional") {
    const bSource = needsProxyAccess(type) ? b : "bRaw";
    const eqExpr = renderEquals(ctx, type, "aVal", "bVal");
    const diffExpr = renderEncodeDiff(ctx, type, "aVal", "bVal");
    return `if (versions !== undefined && (versions.get("${key}") ?? -1) <= encoder.minVersion) {
      encoder.pushBoolean(false);
    } else {
      const aVal = ${a}.${key}, bVal = ${bSource}.${key};
      const changed = !(${eqExpr});
      encoder.pushBoolean(changed);
      if (changed) ${diffExpr};
    }`;
  }
  // Primitives + nested objects/unions/self-refs: one-line helper call. Read
  // through `bRaw` since the proxy `set` trap keeps these in sync on the
  // unwrapped target.
  const aRef = `${a}.${key}`;
  const bRef = `bRaw.${key}`;
  const versionsArg = `versions, "${key}"`;
  return dispatch(type, {
    string: () => `encoder.pushFieldString(${versionsArg}, ${aRef}, ${bRef});`,
    int: (t) => {
      const s = intStrategy(t);
      if (s.kind === "packed") {
        return `encoder.pushFieldBitPackedInt(${versionsArg}, ${aRef}, ${bRef}, ${s.offset}, ${s.max}, ${s.numBits});`;
      }
      if (s.kind === "unsigned") {
        return `encoder.pushFieldBoundedInt(${versionsArg}, ${aRef}, ${bRef}, ${s.min});`;
      }
      return `encoder.pushFieldInt(${versionsArg}, ${aRef}, ${bRef});`;
    },
    float: (t) => {
      const s = floatStrategy(t);
      return s.kind === "quantized"
        ? `encoder.pushFieldFloatQuantized(${versionsArg}, ${aRef}, ${bRef}, ${s.precision});`
        : `encoder.pushFieldFloat(${versionsArg}, ${aRef}, ${bRef});`;
    },
    enum: (t) => `encoder.pushFieldEnum(${versionsArg}, ${aRef}, ${bRef}, ${t.name}, ${t.numBits});`,
    object: (t) =>
      `encoder.pushFieldDiff(${versionsArg}, ${aRef}, ${bRef}, ${t.name}.equals, ${t.name}._encodeDiff);`,
    selfReference: () =>
      `encoder.pushFieldDiff(${versionsArg}, ${aRef}, ${bRef}, ${ctx.currentTypeName}.equals, ${ctx.currentTypeName}._encodeDiff);`,
    union: (t) =>
      `encoder.pushFieldDiff(${versionsArg}, ${aRef}, ${bRef}, ${t.name}.equals, ${t.name}._encodeDiff);`,
    boolean: () => {
      throw new Error("boolean handled by caller");
    },
    array: () => {
      throw new Error("array handled by caller");
    },
    record: () => {
      throw new Error("record handled by caller");
    },
    optional: () => {
      throw new Error("optional handled by caller");
    },
  });
}

// Whether reading a field of this type via `getUnderlying(b)[key]` is unsafe
// because tracked containers replace their backing storage. Arrays and records
// keep their tracked state on a fresh internal collection that the parent's
// plain target never sees, so we must go through the proxy for those.
function needsProxyAccess(type: Type): boolean {
  if (type.type === "reference") return needsProxyAccess(type.ref);
  if (type.type === "array" || type.type === "record") return true;
  if (type.type === "optional") return needsProxyAccess(type.value);
  return false;
}

// Boolean fields skip the version filter (tracking overhead > comparison cost),
// so `versions` is unused when every field is boolean.
function isBooleanLike(type: Type): boolean {
  if (type.type === "reference") return isBooleanLike(type.ref);
  return type.type === "boolean";
}

// Encode diff for a value. In "element" context (inside array/optional/record
// update callbacks) boolean omits its flip bit since caller implies changed.
function renderEncodeDiff(
  ctx: GeneratorContext,
  type: Type,
  a: string,
  b: string,
  context: DiffContext = "value",
): string {
  return dispatch(type, {
    string: () => `encoder.pushStringDiff(${a}, ${b})`,
    int: (t) => {
      const s = intStrategy(t);
      if (s.kind === "packed") {
        return `encoder.pushBitPackedIntDiff(${a}, ${b}, ${s.offset}, ${s.max}, ${s.numBits})`;
      }
      if (s.kind === "unsigned") {
        return `encoder.pushBoundedIntDiff(${a}, ${b}, ${s.min})`;
      }
      return `encoder.pushIntDiff(${a}, ${b})`;
    },
    float: (t) => {
      const s = floatStrategy(t);
      return s.kind === "quantized"
        ? `encoder.pushFloatQuantizedDiff(${a}, ${b}, ${s.precision})`
        : `encoder.pushFloatDiff(${a}, ${b})`;
    },
    boolean: () =>
      context === "element"
        ? "undefined"
        : `encoder.pushBooleanDiff(${a}, ${b})`,
    enum: (t) =>
      `encoder.pushEnumDiff(${t.name}[${a}], ${t.name}[${b}], ${t.numBits})`,
    array: (t) => {
      const elem = renderType(ctx, t.value);
      const diffParams = t.value.type === "boolean" ? "_x, _y" : "x, y";
      return `encoder.pushArrayDiff<${elem}>(${a}, ${b}, (x, y) => ${renderEquals(ctx, t.value, "x", "y")}, (x) => ${renderEncode(ctx, t.value, "x")}, (${diffParams}) => ${renderEncodeDiff(ctx, t.value, "x", "y", "element")})`;
    },
    optional: (t) => {
      const elem = renderType(ctx, t.value);
      const diffParams = t.value.type === "boolean" ? "_x, _y" : "x, y";
      return `encoder.pushOptionalDiff<${elem}>(${a}, ${b}, (x) => ${renderEncode(ctx, t.value, "x")}, (${diffParams}) => ${renderEncodeDiff(ctx, t.value, "x", "y", "element")})`;
    },
    record: (t) => {
      const kt = renderType(ctx, t.key);
      const vt = renderType(ctx, t.value);
      const diffParams = t.value.type === "boolean" ? "_x, _y" : "x, y";
      return `encoder.pushRecordDiff<${kt}, ${vt}>(${a}, ${b}, (x, y) => ${renderEquals(ctx, t.value, "x", "y")}, (x) => ${renderEncode(ctx, t.key, "x")}, (x) => ${renderEncode(ctx, t.value, "x")}, (${diffParams}) => ${renderEncodeDiff(ctx, t.value, "x", "y", "element")})`;
    },
    // Objects/unions/self-refs use _encodeDiff (field-only; caller owns the change bit)
    object: (t) => `${t.name}._encodeDiff(${a}, ${b}, encoder)`,
    selfReference: () =>
      `${ctx.currentTypeName}._encodeDiff(${a}, ${b}, encoder)`,
    union: (t) => `${t.name}._encodeDiff(${a}, ${b}, encoder)`,
  });
}

// Field diff using nextFieldDiff - reads change bit and returns old or new value
function renderDecodeDiffField(
  ctx: GeneratorContext,
  type: Type,
  key: string,
): string {
  if (type.type === "reference") {
    return renderDecodeDiffField(ctx, type.ref, key);
  }
  // Boolean: decode directly (no separate change bit)
  if (type.type === "boolean") {
    return renderDecodeDiff(ctx, type, key);
  }
  // Other primitives, enums, optionals: use nextFieldDiff
  const diffExpr = renderDecodeDiff(ctx, type, "x");
  return `decoder.nextFieldDiff(
        ${key},
        (x) => ${diffExpr},
      )`;
}

// Decode diff for a value. In "element" context (inside array/optional/record
// update callbacks) boolean flips the old value since caller implies changed.
function renderDecodeDiff(
  ctx: GeneratorContext,
  type: Type,
  key: string,
  context: DiffContext = "value",
): string {
  return dispatch(type, {
    string: () => `decoder.nextStringDiff(${key})`,
    int: (t) => {
      const s = intStrategy(t);
      if (s.kind === "packed") {
        const e = `decoder.nextEnumDiff(${intOffset(key, s.offset)}, ${s.numBits})`;
        return s.offset === 0 ? e : `(${e} + ${s.offset})`;
      }
      if (s.kind === "unsigned") {
        return `decoder.nextBoundedIntDiff(${key}, ${s.min})`;
      }
      return `decoder.nextIntDiff(${key})`;
    },
    float: (t) => {
      const s = floatStrategy(t);
      return s.kind === "quantized"
        ? `decoder.nextFloatQuantizedDiff(${key}, ${s.precision})`
        : `decoder.nextFloatDiff(${key})`;
    },
    boolean: () =>
      context === "element" ? `!${key}` : `decoder.nextBooleanDiff(${key})`,
    enum: (t) =>
      `(${t.name} as any)[decoder.nextEnumDiff((${t.name} as any)[${key}], ${t.numBits})]`,
    array: (t) => {
      const elem = renderType(ctx, t.value);
      return `decoder.nextArrayDiff<${elem}>(${key}, () => ${renderDecode(ctx, t.value)}, (x) => ${renderDecodeDiff(ctx, t.value, "x", "element")})`;
    },
    optional: (t) => {
      const elem = renderType(ctx, t.value);
      return `decoder.nextOptionalDiff<${elem}>(${key}, () => ${renderDecode(ctx, t.value)}, (x) => ${renderDecodeDiff(ctx, t.value, "x", "element")})`;
    },
    record: (t) => {
      const kt = renderType(ctx, t.key);
      const vt = renderType(ctx, t.value);
      return `decoder.nextRecordDiff<${kt}, ${vt}>(${key}, () => ${renderDecode(ctx, t.key)}, () => ${renderDecode(ctx, t.value)}, (x) => ${renderDecodeDiff(ctx, t.value, "x", "element")})`;
    },
    // Objects/unions/self-refs use _decodeDiff (field-only; caller owns the change bit)
    object: (t) => `${t.name}._decodeDiff(${key}, decoder)`,
    selfReference: () => `${ctx.currentTypeName}._decodeDiff(${key}, decoder)`,
    union: (t) => `${t.name}._decodeDiff(${key}, decoder)`,
  });
}
