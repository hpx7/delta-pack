import { NamedType, Type, isPrimitiveOrEnum } from "./schema.js";
import { Encoder } from "./encoder.js";
import { Decoder } from "./decoder.js";
import * as helpers from "./helpers.js";

type EncoderInstance = ReturnType<typeof Encoder.create>;
type DecoderInstance = ReturnType<typeof Decoder.create>;

type Ctx = {
  enums: (readonly string[])[];
  helpers: typeof helpers;
  encode: (obj: unknown, encoder: EncoderInstance) => void;
  decode: (decoder: DecoderInstance) => unknown;
  equals: (a: unknown, b: unknown) => boolean;
  encodeDiff: (a: unknown, b: unknown, encoder: EncoderInstance) => void;
  decodeDiff: (a: unknown, decoder: DecoderInstance) => unknown;
};

export function compileEncodeDecode(rootType: NamedType): {
  encode: (obj: unknown) => Uint8Array;
  decode: (buf: Uint8Array) => unknown;
  encodeDiff: (a: unknown, b: unknown) => Uint8Array;
  decodeDiff: (a: unknown, buf: Uint8Array) => unknown;
} {
  const compiler = new JitCompiler();

  const encodeFn = new Function("obj", "encoder", "ctx", compiler.compileEncode(rootType, "obj", rootType)) as (
    obj: unknown,
    encoder: EncoderInstance,
    ctx: Ctx
  ) => void;

  const decodeFn = new Function("decoder", "ctx", `return ${compiler.compileDecodeExpr(rootType, rootType)};`) as (
    decoder: DecoderInstance,
    ctx: Ctx
  ) => unknown;

  const equalsFn = new Function("a", "b", "ctx", `return ${compiler.compileEquals(rootType, "a", "b", rootType)};`) as (
    a: unknown,
    b: unknown,
    ctx: Ctx
  ) => boolean;

  const encodeDiffFn = new Function(
    "a",
    "b",
    "encoder",
    "ctx",
    compiler.compileEncodeDiff(rootType, "a", "b", rootType)
  ) as (a: unknown, b: unknown, encoder: EncoderInstance, ctx: Ctx) => void;

  const decodeDiffFn = new Function(
    "a",
    "decoder",
    "ctx",
    `return ${compiler.compileDecodeDiffExpr(rootType, "a", rootType)};`
  ) as (a: unknown, decoder: DecoderInstance, ctx: Ctx) => unknown;

  const ctx: Ctx = {
    enums: compiler.getEnumValues(),
    helpers,
    encode: (obj, encoder) => encodeFn(obj, encoder, ctx),
    decode: (decoder) => decodeFn(decoder, ctx),
    equals: (a, b) => equalsFn(a, b, ctx),
    encodeDiff: (a, b, encoder) => encodeDiffFn(a, b, encoder, ctx),
    decodeDiff: (a, decoder) => decodeDiffFn(a, decoder, ctx),
  };

  return {
    encode: (obj) => {
      const encoder = Encoder.create();
      ctx.encode(obj, encoder);
      return encoder.toBuffer();
    },
    decode: (buf) => {
      const decoder = Decoder.create(buf);
      return ctx.decode(decoder);
    },
    encodeDiff: (a, b) => {
      const encoder = Encoder.create();
      ctx.encodeDiff(a, b, encoder);
      return encoder.toBuffer();
    },
    decodeDiff: (a, buf) => {
      const decoder = Decoder.create(buf);
      return ctx.decodeDiff(a, decoder);
    },
  };
}

class JitCompiler {
  private varCounter = 0;
  private enumIndices: Map<readonly string[], number> = new Map();

  getEnumValues(): (readonly string[])[] {
    return Array.from(this.enumIndices.keys());
  }

  compileEncode(type: Type, expr: string, parent: NamedType): string {
    switch (type.type) {
      case "string":
        return `encoder.pushString(${expr});`;
      case "int":
        if (type.min != null && type.min >= 0) {
          return `encoder.pushBoundedInt(${expr}, ${type.min});`;
        }
        return `encoder.pushInt(${expr});`;
      case "float":
        if (type.precision) {
          return `encoder.pushFloatQuantized(${expr}, ${type.precision});`;
        }
        return `encoder.pushFloat(${expr});`;
      case "boolean":
        return `encoder.pushBoolean(${expr});`;
      case "enum": {
        const enumRef = this.getEnumRef(type.options);
        return `encoder.pushEnum(${enumRef}.indexOf(${expr}), ${type.numBits});`;
      }
      case "reference":
        return this.compileEncode(type.ref, expr, type.ref);
      case "self-reference":
        return `ctx.encode(${expr}, encoder);`;
      case "object": {
        const lines = Object.entries(type.properties).map(([key, propType]) =>
          this.compileEncode(propType, `${expr}.${key}`, parent)
        );
        return lines.join("\n");
      }
      case "array": {
        const item = this.nextVar("item");
        return `encoder.pushArray(${expr}, (${item}) => { ${this.compileEncode(type.value, item, parent)} });`;
      }
      case "record": {
        const key = this.nextVar("key");
        const val = this.nextVar("val");
        return `encoder.pushRecord(${expr}, (${key}) => { ${this.compileEncode(type.key, key, parent)} }, (${val}) => { ${this.compileEncode(type.value, val, parent)} });`;
      }
      case "union": {
        const unionVar = this.nextVar("union");
        const cases = type.options
          .map(
            (variant, i) =>
              `if (${unionVar}._type === "${variant.name}") { encoder.pushEnum(${i}, ${type.numBits}); ${this.compileEncode(variant, unionVar, variant)} }`
          )
          .join(" else ");
        return `{ const ${unionVar} = ${expr}; ${cases} }`;
      }
      case "optional": {
        const val = this.nextVar("val");
        return `encoder.pushOptional(${expr}, (${val}) => { ${this.compileEncode(type.value, val, parent)} });`;
      }
      default:
        throw new Error(`Unknown type: ${(type as Type).type}`);
    }
  }

  compileDecodeExpr(type: Type, parent: NamedType): string {
    switch (type.type) {
      case "string":
        return `decoder.nextString()`;
      case "int":
        if (type.min != null && type.min >= 0) {
          return `decoder.nextBoundedInt(${type.min})`;
        }
        return `decoder.nextInt()`;
      case "float":
        if (type.precision) {
          return `decoder.nextFloatQuantized(${type.precision})`;
        }
        return `decoder.nextFloat()`;
      case "boolean":
        return `decoder.nextBoolean()`;
      case "enum": {
        const enumRef = this.getEnumRef(type.options);
        return `${enumRef}[decoder.nextEnum(${type.numBits})]`;
      }
      case "reference":
        return this.compileDecodeExpr(type.ref, type.ref);
      case "self-reference":
        return `ctx.decode(decoder)`;
      case "object": {
        const fields = Object.entries(type.properties)
          .map(([key, propType]) => `${key}: ${this.compileDecodeExpr(propType, parent)}`)
          .join(", ");
        return `({ ${fields} })`;
      }
      case "array":
        return `decoder.nextArray(() => ${this.compileDecodeExpr(type.value, parent)})`;
      case "record":
        return `decoder.nextRecord(() => ${this.compileDecodeExpr(type.key, parent)}, () => ${this.compileDecodeExpr(type.value, parent)})`;
      case "union": {
        const idx = this.nextVar("idx");
        const cases = type.options
          .map(
            (variant, i) =>
              `${idx} === ${i} ? { _type: "${variant.name}", ...${this.compileDecodeExpr(variant, variant)} }`
          )
          .join(" : ");
        return `((${idx}) => ${cases} : null)(decoder.nextEnum(${type.numBits}))`;
      }
      case "optional":
        return `decoder.nextOptional(() => ${this.compileDecodeExpr(type.value, parent)})`;
      default:
        throw new Error(`Unknown type: ${(type as Type).type}`);
    }
  }

  compileEquals(type: Type, a: string, b: string, parent: NamedType): string {
    switch (type.type) {
      case "string":
      case "int":
      case "boolean":
      case "enum":
        return `${a} === ${b}`;
      case "float":
        if (type.precision) {
          return `ctx.helpers.equalsFloatQuantized(${a}, ${b}, ${type.precision})`;
        }
        return `ctx.helpers.equalsFloat(${a}, ${b})`;
      case "reference":
        return this.compileEquals(type.ref, a, b, type.ref);
      case "self-reference":
        return `ctx.equals(${a}, ${b})`;
      case "object": {
        const checks = Object.entries(type.properties).map(([key, propType]) =>
          this.compileEquals(propType, `${a}.${key}`, `${b}.${key}`, parent)
        );
        return checks.length > 0 ? `(${checks.join(" && ")})` : "true";
      }
      case "array":
        return `ctx.helpers.equalsArray(${a}, ${b}, (x, y) => ${this.compileEquals(type.value, "x", "y", parent)})`;
      case "record":
        return `ctx.helpers.equalsRecord(${a}, ${b}, (x, y) => x === y, (x, y) => ${this.compileEquals(type.value, "x", "y", parent)})`;
      case "union": {
        const cases = type.options.map(
          (variant) =>
            `(${a}._type === "${variant.name}" && ${b}._type === "${variant.name}" && ${this.compileEquals(variant, a, b, variant)})`
        );
        return `(${cases.join(" || ")})`;
      }
      case "optional":
        return `ctx.helpers.equalsOptional(${a}, ${b}, (x, y) => ${this.compileEquals(type.value, "x", "y", parent)})`;
      default:
        throw new Error(`Unknown type: ${(type as Type).type}`);
    }
  }

  compileEncodeDiff(type: Type, a: string, b: string, parent: NamedType): string {
    switch (type.type) {
      case "string":
        return `encoder.pushStringDiff(${a}, ${b});`;
      case "int":
        if (type.min != null && type.min >= 0) {
          return `encoder.pushBoundedIntDiff(${a}, ${b}, ${type.min});`;
        }
        return `encoder.pushIntDiff(${a}, ${b});`;
      case "float":
        if (type.precision) {
          return `encoder.pushFloatQuantizedDiff(${a}, ${b}, ${type.precision});`;
        }
        return `encoder.pushFloatDiff(${a}, ${b});`;
      case "boolean":
        return `encoder.pushBooleanDiff(${a}, ${b});`;
      case "enum": {
        const enumRef = this.getEnumRef(type.options);
        return `encoder.pushEnumDiff(${enumRef}.indexOf(${a}), ${enumRef}.indexOf(${b}), ${type.numBits});`;
      }
      case "reference":
        return this.compileEncodeDiff(type.ref, a, b, type.ref);
      case "self-reference":
        return `ctx.encodeDiff(${a}, ${b}, encoder);`;
      case "object": {
        const eqExpr = this.compileEquals(type, a, b, parent);
        const propDiffs = Object.entries(type.properties)
          .map(
            ([key, propType]) =>
              `if (dirty != null && !dirty.has("${key}")) { encoder.pushBoolean(false); } else { ${this.compileEncodeDiff(propType, `${a}.${key}`, `${b}.${key}`, parent)} }`
          )
          .join("\n");
        return `{ const dirty = ${b}._dirty; const changed = dirty == null ? !(${eqExpr}) : dirty.size > 0; encoder.pushBoolean(changed); if (changed) { ${propDiffs} } }`;
      }
      case "array": {
        const x = this.nextVar("x");
        const y = this.nextVar("y");
        return `encoder.pushArrayDiff(${a}, ${b}, (${x}, ${y}) => ${this.compileEquals(type.value, x, y, parent)}, (${x}) => { ${this.compileEncode(type.value, x, parent)} }, (${x}, ${y}) => { ${this.compileEncodeDiff(type.value, x, y, parent)} });`;
      }
      case "record": {
        const x = this.nextVar("x");
        const y = this.nextVar("y");
        return `encoder.pushRecordDiff(${a}, ${b}, (${x}, ${y}) => ${this.compileEquals(type.value, x, y, parent)}, (${x}) => { ${this.compileEncode(type.key, x, parent)} }, (${x}) => { ${this.compileEncode(type.value, x, parent)} }, (${x}, ${y}) => { ${this.compileEncodeDiff(type.value, x, y, parent)} });`;
      }
      case "union": {
        return type.options
          .map(
            (variant, i) =>
              `if (${b}._type === "${variant.name}") { if (${a}._type === "${variant.name}") { encoder.pushBoolean(true); ${this.compileEncodeDiff(variant, a, b, variant)} } else { encoder.pushBoolean(false); encoder.pushEnum(${i}, ${type.numBits}); ${this.compileEncode(variant, b, variant)} } }`
          )
          .join(" else ");
      }
      case "optional": {
        const x = this.nextVar("x");
        const y = this.nextVar("y");
        if (isPrimitiveOrEnum(type.value)) {
          return `encoder.pushOptionalDiffPrimitive(${a}, ${b}, (${x}) => { ${this.compileEncode(type.value, x, parent)} });`;
        }
        return `encoder.pushOptionalDiff(${a}, ${b}, (${x}) => { ${this.compileEncode(type.value, x, parent)} }, (${x}, ${y}) => { ${this.compileEncodeDiff(type.value, x, y, parent)} });`;
      }
      default:
        throw new Error(`Unknown type: ${(type as Type).type}`);
    }
  }

  compileDecodeDiffExpr(type: Type, a: string, parent: NamedType): string {
    switch (type.type) {
      case "string":
        return `decoder.nextStringDiff(${a})`;
      case "int":
        if (type.min != null && type.min >= 0) {
          return `decoder.nextBoundedIntDiff(${a}, ${type.min})`;
        }
        return `decoder.nextIntDiff(${a})`;
      case "float":
        if (type.precision) {
          return `decoder.nextFloatQuantizedDiff(${a}, ${type.precision})`;
        }
        return `decoder.nextFloatDiff(${a})`;
      case "boolean":
        return `decoder.nextBooleanDiff(${a})`;
      case "enum": {
        const enumRef = this.getEnumRef(type.options);
        return `${enumRef}[decoder.nextEnumDiff(${enumRef}.indexOf(${a}), ${type.numBits})]`;
      }
      case "reference":
        return this.compileDecodeDiffExpr(type.ref, a, type.ref);
      case "self-reference":
        return `ctx.decodeDiff(${a}, decoder)`;
      case "object": {
        const fields = Object.entries(type.properties)
          .map(([key, propType]) => `${key}: ${this.compileDecodeDiffExpr(propType, `${a}.${key}`, parent)}`)
          .join(", ");
        return `(decoder.nextBoolean() ? ({ ${fields} }) : ${a})`;
      }
      case "array": {
        const x = this.nextVar("x");
        return `decoder.nextArrayDiff(${a}, () => ${this.compileDecodeExpr(type.value, parent)}, (${x}) => ${this.compileDecodeDiffExpr(type.value, x, parent)})`;
      }
      case "record": {
        const x = this.nextVar("x");
        return `decoder.nextRecordDiff(${a}, () => ${this.compileDecodeExpr(type.key, parent)}, () => ${this.compileDecodeExpr(type.value, parent)}, (${x}) => ${this.compileDecodeDiffExpr(type.value, x, parent)})`;
      }
      case "union": {
        const sameTypeCases = type.options
          .map(
            (variant) =>
              `${a}._type === "${variant.name}" ? { _type: "${variant.name}", ...${this.compileDecodeDiffExpr(variant, a, variant)} }`
          )
          .join(" : ");
        const newTypeCases = type.options
          .map(
            (variant, i) => `t === ${i} ? { _type: "${variant.name}", ...${this.compileDecodeExpr(variant, variant)} }`
          )
          .join(" : ");
        return `(decoder.nextBoolean() ? (${sameTypeCases} : null) : ((t) => ${newTypeCases} : null)(decoder.nextEnum(${type.numBits})))`;
      }
      case "optional": {
        if (isPrimitiveOrEnum(type.value)) {
          return `decoder.nextOptionalDiffPrimitive(${a}, () => ${this.compileDecodeExpr(type.value, parent)})`;
        }
        const x = this.nextVar("x");
        return `decoder.nextOptionalDiff(${a}, () => ${this.compileDecodeExpr(type.value, parent)}, (${x}) => ${this.compileDecodeDiffExpr(type.value, x, parent)})`;
      }
      default:
        throw new Error(`Unknown type: ${(type as Type).type}`);
    }
  }

  private nextVar(prefix = "v"): string {
    return `${prefix}${this.varCounter++}`;
  }

  private getEnumRef(options: readonly string[]): string {
    let idx = this.enumIndices.get(options);
    if (idx === undefined) {
      idx = this.enumIndices.size;
      this.enumIndices.set(options, idx);
    }
    return `ctx.enums[${idx}]`;
  }
}
