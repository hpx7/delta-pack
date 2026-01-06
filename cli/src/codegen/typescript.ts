import { Type, NamedType, isPrimitiveOrEnum } from "@hpx7/delta-pack";

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
      return `  ${propName}${optional}: ${renderType(ctx, propType, propName)};`;
    })
    .join("\n");

  return `export type ${name} = {
${props}
} & { _dirty?: Set<keyof ${name}> };`;
}

function renderObjectApi(
  ctx: GeneratorContext,
  name: string,
  properties: Record<string, Type>,
): string {
  const props = Object.entries(properties);
  const p = (fn: (n: string, t: Type) => string) =>
    props.map(([n, t]) => fn(n, t)).join("\n");

  const defaultBody = p((n, t) => `      ${n}: ${renderDefault(ctx, t, n)},`);
  const fromJsonBody = p(
    (n, t) =>
      `      ${n}: _.tryParseField(() => ${renderFromJson(ctx, t, n, `o["${n}"]`)}, "${name}.${n}"),`,
  );
  const toJsonBody = p((n, t) =>
    t.type === "optional"
      ? `    if (obj.${n} != null) {\n      result["${n}"] = ${renderToJson(ctx, t, n, `obj.${n}`)};\n    }`
      : `    result["${n}"] = ${renderToJson(ctx, t, n, `obj.${n}`)};`,
  );
  const cloneBody = p(
    (n, t) => `      ${n}: ${renderClone(ctx, t, n, `obj.${n}`)},`,
  );
  const equalsBody = props
    .map(([n, t]) => renderEquals(ctx, t, n, `a.${n}`, `b.${n}`))
    .join(" &&\n      ");
  const encodeBody = p((n, t) => `    ${renderEncode(ctx, t, n, `obj.${n}`)};`);
  const encodeDiffBody = p(
    (n, t) => `    // Field: ${n}
    if (dirty != null && !dirty.has("${n}")) {
      encoder.pushBoolean(false);
    } else {
      ${renderEncodeDiff(ctx, t, n, `a.${n}`, `b.${n}`)};
    }`,
  );
  const decodeBody = p((n, t) => `      ${n}: ${renderDecode(ctx, t, n)},`);
  const decodeDiffBody = p(
    (n, t) => `      ${n}: ${renderDecodeDiff(ctx, t, n, `obj.${n}`)},`,
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
    const encoder = _.Encoder.create();
    ${name}._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: ${name}, b: ${name}, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !${name}.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (!changed) {
      return;
    }
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
    return ${name}._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: ${name}, decoder: _.Decoder): ${name} {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
${decodeDiffBody}
    };
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
      `    ${p}if (obj._type === "${opt.name}") {\n      return { ${opt.name}: ${renderToJson(ctx, opt, opt.name!, "obj")} };\n    }`,
  );

  const cloneCases = ifElseChain(
    options,
    (opt, _, p) =>
      `    ${p}if (obj._type === "${opt.name}") {\n      return { _type: "${opt.name}", ...${renderClone(ctx, opt, opt.name!, "obj")} };\n    }`,
  );

  const equalsCases = ifElseChain(
    options,
    (opt, _, p) =>
      `    ${p}if (a._type === "${opt.name}" && b._type === "${opt.name}") {\n      return ${renderEquals(ctx, opt, opt.name!, "a", "b")};\n    }`,
  );

  const encodeCases = ifElseChain(
    options,
    (opt, i, p) =>
      `    ${p}if (obj._type === "${opt.name}") {\n      encoder.pushEnum(${i}, ${numBits});\n      ${renderEncode(ctx, opt, opt.name!, "obj")};\n    }`,
  );

  const encodeDiffCases = ifElseChain(
    options,
    (opt, i, p) =>
      `    ${p}if (b._type === "${opt.name}") {\n      if (a._type === "${opt.name}") {\n        ${renderEncodeDiff(ctx, opt, opt.name!, "a", "b")};\n      } else {\n        encoder.pushEnum(${i}, ${numBits});\n        ${renderEncode(ctx, opt, opt.name!, "b")};\n      }\n    }`,
  );

  const decodeCases = ifElseChain(
    options,
    (opt, i, p) =>
      `    ${p}if (type === ${i}) {\n      return { _type: "${opt.name}", ...${renderDecode(ctx, opt, opt.name!)} };\n    }`,
  );

  const decodeDiffSame = ifElseChain(
    options,
    (opt, _, p) =>
      `      ${p}if (obj._type === "${opt.name}") {\n        return { _type: "${opt.name}", ...${renderDecodeDiff(ctx, opt, opt.name!, "obj")} };\n      }`,
  );

  const decodeDiffNew = ifElseChain(
    options,
    (opt, i, p) =>
      `      ${p}if (type === ${i}) {\n        return { _type: "${opt.name}", ...${renderDecode(ctx, opt, opt.name!)} };\n      }`,
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
${options.map((opt) => `      ${opt.name}: (x: unknown) => ${renderFromJson(ctx, opt, opt.name!, "x")}`).join(",\n")}
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
    const encoder = _.Encoder.create();
    ${name}._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: ${name}, b: ${name}, encoder: _.Encoder): void {
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
    return ${name}._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: ${name}, decoder: _.Decoder): ${name} {
    const isSameType = decoder.nextBoolean();
    if (isSameType) {
${decodeDiffSame}
      throw new Error("Invalid union diff");
    } else {
      const type = decoder.nextEnum(${numBits});
${decodeDiffNew}
      throw new Error("Invalid union diff");
    }
  }
}`;
}

// ============ Type Helpers ============

function renderType(ctx: GeneratorContext, type: Type, name: string): string {
  switch (type.type) {
    case "string":
      return "string";
    case "int":
    case "float":
      return "number";
    case "boolean":
      return "boolean";
    case "enum":
      return type.name!;
    case "array": {
      const elem = renderType(ctx, type.value, name);
      const parens =
        type.value.type === "array" || type.value.type === "record";
      return parens
        ? `(${elem})[] & { _dirty?: Set<number> }`
        : `${elem}[] & { _dirty?: Set<number> }`;
    }
    case "optional":
      return `${renderType(ctx, type.value, name)} | undefined`;
    case "record":
      return `Map<${renderType(ctx, type.key, name)}, ${renderType(ctx, type.value, name)}> & { _dirty?: Set<${renderType(ctx, type.key, name)}> }`;
    case "reference":
      return type.ref.name!;
    case "self-reference":
      return ctx.currentTypeName;
    default:
      throw new Error(`Unexpected type in renderType: ${type.type}`);
  }
}

function renderDefault(
  ctx: GeneratorContext,
  type: Type,
  name: string,
): string {
  switch (type.type) {
    case "string":
      return '""';
    case "int":
      return "0";
    case "float":
      return "0.0";
    case "boolean":
      return "false";
    case "enum":
      return `"${type.options[0]}"`;
    case "array":
      return "[]";
    case "optional":
      return "undefined";
    case "record":
      return "new Map()";
    case "reference":
      return renderDefault(ctx, type.ref, type.ref.name!);
    case "self-reference":
      return `${ctx.currentTypeName}.default()`;
    default:
      return `${name}.default()`;
  }
}

function renderFromJson(
  ctx: GeneratorContext,
  type: Type,
  name: string,
  key: string,
): string {
  switch (type.type) {
    case "string":
      return `_.parseString(${key})`;
    case "int":
      return type.max != null
        ? `_.parseInt(${key}, ${type.min}, ${type.max})`
        : type.min != null
          ? `_.parseInt(${key}, ${type.min})`
          : `_.parseInt(${key})`;
    case "float":
      return `_.parseFloat(${key})`;
    case "boolean":
      return `_.parseBoolean(${key})`;
    case "enum":
      return `_.parseEnum(${key}, ${name})`;
    case "array":
      return `_.parseArray(${key}, (x) => ${renderFromJson(ctx, type.value, name, "x")})`;
    case "optional":
      return `_.parseOptional(${key}, (x) => ${renderFromJson(ctx, type.value, name, "x")})`;
    case "record":
      return `_.parseRecord(${key}, (x) => ${renderFromJson(ctx, type.key, name, "x")}, (x) => ${renderFromJson(ctx, type.value, name, "x")})`;
    case "reference":
      return renderFromJson(ctx, type.ref, type.ref.name!, key);
    case "self-reference":
      return `${ctx.currentTypeName}.fromJson(${key} as ${ctx.currentTypeName})`;
    default:
      return `${name}.fromJson(${key} as ${name})`;
  }
}

function renderToJson(
  ctx: GeneratorContext,
  type: Type,
  name: string,
  key: string,
): string {
  switch (type.type) {
    case "string":
    case "int":
    case "float":
    case "boolean":
    case "enum":
      return key;
    case "array":
      return `${key}.map((x) => ${renderToJson(ctx, type.value, name, "x")})`;
    case "optional":
      return renderToJson(ctx, type.value, name, key);
    case "record":
      return `_.mapToObject(${key}, (x) => ${renderToJson(ctx, type.value, name, "x")})`;
    case "reference":
      return renderToJson(ctx, type.ref, type.ref.name!, key);
    case "self-reference":
      return `${ctx.currentTypeName}.toJson(${key})`;
    default:
      return `${name}.toJson(${key})`;
  }
}

function renderClone(
  ctx: GeneratorContext,
  type: Type,
  name: string,
  key: string,
): string {
  switch (type.type) {
    case "string":
    case "int":
    case "float":
    case "boolean":
    case "enum":
      return key;
    case "array":
      return `${key}.map((x) => ${renderClone(ctx, type.value, name, "x")})`;
    case "optional":
      return `${key} != null ? ${renderClone(ctx, type.value, name, key)} : undefined`;
    case "record":
      return `new Map([...${key}].map(([k, v]) => [k, ${renderClone(ctx, type.value, name, "v")}]))`;
    case "reference":
      return renderClone(ctx, type.ref, type.ref.name!, key);
    case "self-reference":
      return `${ctx.currentTypeName}.clone(${key})`;
    default:
      return `${name}.clone(${key})`;
  }
}

function renderEquals(
  ctx: GeneratorContext,
  type: Type,
  name: string,
  a: string,
  b: string,
): string {
  switch (type.type) {
    case "string":
    case "int":
    case "boolean":
    case "enum":
      return `${a} === ${b}`;
    case "float":
      return type.precision
        ? `_.equalsFloatQuantized(${a}, ${b}, ${type.precision})`
        : `_.equalsFloat(${a}, ${b})`;
    case "array":
      return `_.equalsArray(${a}, ${b}, (x, y) => ${renderEquals(ctx, type.value, name, "x", "y")})`;
    case "optional":
      return `_.equalsOptional(${a}, ${b}, (x, y) => ${renderEquals(ctx, type.value, name, "x", "y")})`;
    case "record":
      return `_.equalsRecord(${a}, ${b}, (x, y) => ${renderEquals(ctx, type.key, name, "x", "y")}, (x, y) => ${renderEquals(ctx, type.value, name, "x", "y")})`;
    case "reference":
      return renderEquals(ctx, type.ref, type.ref.name!, a, b);
    case "self-reference":
      return `${ctx.currentTypeName}.equals(${a}, ${b})`;
    default:
      return `${name}.equals(${a}, ${b})`;
  }
}

function renderEncode(
  ctx: GeneratorContext,
  type: Type,
  name: string,
  key: string,
): string {
  switch (type.type) {
    case "string":
      return `encoder.pushString(${key})`;
    case "int":
      return type.min != null && type.min >= 0
        ? `encoder.pushBoundedInt(${key}, ${type.min})`
        : `encoder.pushInt(${key})`;
    case "float":
      return type.precision
        ? `encoder.pushFloatQuantized(${key}, ${type.precision})`
        : `encoder.pushFloat(${key})`;
    case "boolean":
      return `encoder.pushBoolean(${key})`;
    case "enum":
      return `encoder.pushEnum(${name}[${key}], ${type.numBits})`;
    case "array":
      return `encoder.pushArray(${key}, (x) => ${renderEncode(ctx, type.value, name, "x")})`;
    case "optional":
      return `encoder.pushOptional(${key}, (x) => ${renderEncode(ctx, type.value, name, "x")})`;
    case "record":
      return `encoder.pushRecord(${key}, (x) => ${renderEncode(ctx, type.key, name, "x")}, (x) => ${renderEncode(ctx, type.value, name, "x")})`;
    case "reference":
      return renderEncode(ctx, type.ref, type.ref.name!, key);
    case "self-reference":
      return `${ctx.currentTypeName}._encode(${key}, encoder)`;
    default:
      return `${name}._encode(${key}, encoder)`;
  }
}

function renderDecode(ctx: GeneratorContext, type: Type, name: string): string {
  switch (type.type) {
    case "string":
      return `decoder.nextString()`;
    case "int":
      return type.min != null && type.min >= 0
        ? `decoder.nextBoundedInt(${type.min})`
        : `decoder.nextInt()`;
    case "float":
      return type.precision
        ? `decoder.nextFloatQuantized(${type.precision})`
        : `decoder.nextFloat()`;
    case "boolean":
      return `decoder.nextBoolean()`;
    case "enum":
      return `(${name} as any)[decoder.nextEnum(${type.numBits})]`;
    case "array":
      return `decoder.nextArray(() => ${renderDecode(ctx, type.value, name)})`;
    case "optional":
      return `decoder.nextOptional(() => ${renderDecode(ctx, type.value, name)})`;
    case "record":
      return `decoder.nextRecord(() => ${renderDecode(ctx, type.key, name)}, () => ${renderDecode(ctx, type.value, name)})`;
    case "reference":
      return renderDecode(ctx, type.ref, type.ref.name!);
    case "self-reference":
      return `${ctx.currentTypeName}._decode(decoder)`;
    default:
      return `${name}._decode(decoder)`;
  }
}

function renderEncodeDiff(
  ctx: GeneratorContext,
  type: Type,
  name: string,
  a: string,
  b: string,
): string {
  switch (type.type) {
    case "string":
      return `encoder.pushStringDiff(${a}, ${b})`;
    case "int":
      return type.min != null && type.min >= 0
        ? `encoder.pushBoundedIntDiff(${a}, ${b}, ${type.min})`
        : `encoder.pushIntDiff(${a}, ${b})`;
    case "float":
      return type.precision
        ? `encoder.pushFloatQuantizedDiff(${a}, ${b}, ${type.precision})`
        : `encoder.pushFloatDiff(${a}, ${b})`;
    case "boolean":
      return `encoder.pushBooleanDiff(${a}, ${b})`;
    case "enum":
      return `encoder.pushEnumDiff(${name}[${a}], ${name}[${b}], ${type.numBits})`;
    case "array": {
      const t = renderType(ctx, type.value, name);
      return `encoder.pushArrayDiff<${t}>(${a}, ${b}, (x, y) => ${renderEquals(ctx, type.value, name, "x", "y")}, (x) => ${renderEncode(ctx, type.value, name, "x")}, (x, y) => ${renderEncodeDiff(ctx, type.value, name, "x", "y")})`;
    }
    case "optional": {
      const t = renderType(ctx, type.value, name);
      return isPrimitiveOrEnum(type.value)
        ? `encoder.pushOptionalDiffPrimitive<${t}>(${a}, ${b}, (x) => ${renderEncode(ctx, type.value, name, "x")})`
        : `encoder.pushOptionalDiff<${t}>(${a}, ${b}, (x) => ${renderEncode(ctx, type.value, name, "x")}, (x, y) => ${renderEncodeDiff(ctx, type.value, name, "x", "y")})`;
    }
    case "record": {
      const kt = renderType(ctx, type.key, name);
      const vt = renderType(ctx, type.value, name);
      return `encoder.pushRecordDiff<${kt}, ${vt}>(${a}, ${b}, (x, y) => ${renderEquals(ctx, type.value, name, "x", "y")}, (x) => ${renderEncode(ctx, type.key, name, "x")}, (x) => ${renderEncode(ctx, type.value, name, "x")}, (x, y) => ${renderEncodeDiff(ctx, type.value, name, "x", "y")})`;
    }
    case "reference":
      return renderEncodeDiff(ctx, type.ref, type.ref.name!, a, b);
    case "self-reference":
      return `${ctx.currentTypeName}._encodeDiff(${a}, ${b}, encoder)`;
    default:
      return `${name}._encodeDiff(${a}, ${b}, encoder)`;
  }
}

function renderDecodeDiff(
  ctx: GeneratorContext,
  type: Type,
  name: string,
  key: string,
): string {
  switch (type.type) {
    case "string":
      return `decoder.nextStringDiff(${key})`;
    case "int":
      return type.min != null && type.min >= 0
        ? `decoder.nextBoundedIntDiff(${key}, ${type.min})`
        : `decoder.nextIntDiff(${key})`;
    case "float":
      return type.precision
        ? `decoder.nextFloatQuantizedDiff(${key}, ${type.precision})`
        : `decoder.nextFloatDiff(${key})`;
    case "boolean":
      return `decoder.nextBooleanDiff(${key})`;
    case "enum":
      return `(${name} as any)[decoder.nextEnumDiff((${name} as any)[${key}], ${type.numBits})]`;
    case "array": {
      const t = renderType(ctx, type.value, name);
      return `decoder.nextArrayDiff<${t}>(${key}, () => ${renderDecode(ctx, type.value, name)}, (x) => ${renderDecodeDiff(ctx, type.value, name, "x")})`;
    }
    case "optional": {
      const t = renderType(ctx, type.value, name);
      return isPrimitiveOrEnum(type.value)
        ? `decoder.nextOptionalDiffPrimitive<${t}>(${key}, () => ${renderDecode(ctx, type.value, name)})`
        : `decoder.nextOptionalDiff<${t}>(${key}, () => ${renderDecode(ctx, type.value, name)}, (x) => ${renderDecodeDiff(ctx, type.value, name, "x")})`;
    }
    case "record": {
      const kt = renderType(ctx, type.key, name);
      const vt = renderType(ctx, type.value, name);
      return `decoder.nextRecordDiff<${kt}, ${vt}>(${key}, () => ${renderDecode(ctx, type.key, name)}, () => ${renderDecode(ctx, type.value, name)}, (x) => ${renderDecodeDiff(ctx, type.value, name, "x")})`;
    }
    case "reference":
      return renderDecodeDiff(ctx, type.ref, type.ref.name!, key);
    case "self-reference":
      return `${ctx.currentTypeName}._decodeDiff(${key}, decoder)`;
    default:
      return `${name}._decodeDiff(${key}, decoder)`;
  }
}
