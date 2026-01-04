import { Type, isPrimitiveOrEnum } from "@hpx7/delta-pack";

export function codegenTypescript(schema: Record<string, Type>) {
  return renderSchema(schema);
}

function renderSchema(schema: Record<string, Type>) {
  // Track the current type being processed for self-reference resolution
  let currentTypeName: string;

  return `import * as _ from "@hpx7/delta-pack";

${Object.entries(schema)
  .map(([name, type]) => {
    currentTypeName = name;
    if (type.type === "enum") {
      return `
export type ${name} = ${type.options.map((option) => `"${option}"`).join(" | ")};
    `;
    } else {
      return `export type ${name} = ${renderTypeArg(type, name)};`;
    }
  })
  .join("\n")}

${Object.entries(schema)
  .map(([name, type]) => {
    currentTypeName = name;
    if (type.type === "enum") {
      return `
const ${name} = {
  ${type.options.map((option, i) => `${i}: "${option}",`).join("\n  ")}
  ${type.options.map((option, i) => `${option}: ${i},`).join("\n  ")}
};`;
    }
    if (type.type === "object") {
      return `
export const ${name} = {
  default(): ${name} {
    return {
      ${Object.entries(type.properties)
        .map(([name, childType]) => {
          return `${name}: ${renderDefault(childType, name)},`;
        })
        .join("\n      ")}
    };
  },
  fromJson(obj: object): ${name} {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(\`Invalid ${name}: \${obj}\`);
    }
    const o = obj as Record<string, unknown>;
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: _.tryParseField(() => ${renderFromJson(childType, childName, `o["${childName}"]`)}, "${name}.${childName}"),`;
        })
        .join("\n      ")}
    };
  },
  toJson(obj: ${name}): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        if (childType.type === "optional") {
          return `if (obj.${childName} != null) {
      result["${childName}"] = ${renderToJson(childType, childName, `obj.${childName}`)};
    }`;
        } else {
          return `result["${childName}"] = ${renderToJson(childType, childName, `obj.${childName}`)};`;
        }
      })
      .join("\n    ")}
    return result;
  },
  clone(obj: ${name}): ${name} {
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: ${renderClone(childType, name, `obj.${childName}`)},`;
        })
        .join("\n      ")}
    };
  },
  equals(a: ${name}, b: ${name}): boolean {
    return (
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return renderEquals(
            childType,
            name,
            `a.${childName}`,
            `b.${childName}`,
          );
        })
        .join(" &&\n      ")}
    );
  },
  encode(obj: ${name}): Uint8Array {
    const encoder = new _.Encoder();
    ${name}._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: ${name}, encoder: _.Encoder): void {
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `${renderEncode(childType, name, `obj.${childName}`)};`;
      })
      .join("\n    ")}
  },
  encodeDiff(a: ${name}, b: ${name}): Uint8Array {
    const encoder = new _.Encoder();
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
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `// Field: ${childName}
    if (dirty != null && !dirty.has("${childName}")) {
      encoder.pushBoolean(false);
    } else {
      ${renderEncodeDiff(childType, name, `a.${childName}`, `b.${childName}`)};
    }`;
      })
      .join("\n    ")}
  },
  decode(input: Uint8Array): ${name} {
    return ${name}._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): ${name} {
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: ${renderDecode(childType, name, `obj.${childName}`)},`;
        })
        .join("\n      ")}
    };
  },
  decodeDiff(obj: ${name}, input: Uint8Array): ${name} {
    const decoder = new _.Decoder(input);
    return ${name}._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: ${name}, decoder: _.Decoder): ${name} {
    const changed = decoder.nextBoolean();
    if (!changed) {
      return obj;
    }
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: ${renderDecodeDiff(childType, name, `obj.${childName}`)},`;
        })
        .join("\n      ")}
    };
  },
};`;
    } else if (type.type === "union") {
      return `
export const ${name} = {
  default(): ${name} {
    return {
      type: "${type.options[0]!.name}",
      val: ${renderDefault(type.options[0]!, type.options[0]!.name!)},
    };
  },
  values() {
    return [${type.options.map((option) => `"${option.name}"`).join(", ")}];
  },
  fromJson(obj: object): ${name} {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(\`Invalid ${name}: \${obj}\`);
    }
    // check if it's delta-pack format: { type: "TypeName", val: ... }
    if ("type" in obj && typeof (obj as Record<string, unknown>)["type"] === "string" && "val" in obj) {
      ${type.options
        .map((option, i) => {
          return `${i > 0 ? "else " : ""}if (obj["type"] === "${option.name}") {
        return {
          type: "${option.name}",
          val: ${renderFromJson(option, option.name!, `obj["val"]`)},
        };
      }`;
        })
        .join("\n      ")}
      else {
        throw new Error(\`Invalid ${name}: \${obj}\`);
      }
    }
    // check if it's protobuf format: { TypeName: ... }
    const entries = Object.entries(obj);
    if (entries.length === 1) {
      const [fieldName, fieldValue] = entries[0]!;
      ${type.options
        .map((option, i) => {
          return `${i > 0 ? "else " : ""}if (fieldName === "${option.name}") {
        return {
          type: "${option.name}",
          val: ${renderFromJson(option, option.name!, "fieldValue")},
        };
      }`;
        })
        .join("\n      ")}
    }
    throw new Error(\`Invalid ${name}: \${obj}\`);
  },
  toJson(obj: ${name}): Record<string, unknown> {
    ${type.options
      .map((option, i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${option.name}") {
      return {
        ${option.name}: ${renderToJson(option, option.name!, "obj.val")},
      };
    }`;
      })
      .join("\n    ")}
    throw new Error(\`Invalid ${name}: \${obj}\`);
  },
  clone(obj: ${name}): ${name} {
    ${type.options
      .map((option, i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${option.name}") {
      return {
        type: "${option.name}",
        val: ${renderClone(option, option.name!, "obj.val")},
      };
    }`;
      })
      .join("\n    ")}
    throw new Error(\`Invalid ${name}: \${obj}\`);
  },
  equals(a: ${name}, b: ${name}): boolean {
    ${type.options
      .map((option, i) => {
        return `${i > 0 ? "else " : ""}if (a.type === "${option.name}" && b.type === "${option.name}") {
      return ${renderEquals(option, option.name!, "a.val", "b.val")};
    }`;
      })
      .join("\n    ")}
    return false;
  },
  encode(obj: ${name}): Uint8Array {
    const encoder = new _.Encoder();
    ${name}._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: ${name}, encoder: _.Encoder): void {
    ${type.options
      .map((option, i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${option.name}") {
      encoder.pushEnum(${i}, ${type.numBits});
      ${renderEncode(option, option.name!, "obj.val")};
    }`;
      })
      .join("\n    ")}
  },
  encodeDiff(a: ${name}, b: ${name}): Uint8Array {
    const encoder = new _.Encoder();
    ${name}._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: ${name}, b: ${name}, encoder: _.Encoder): void {
    encoder.pushBoolean(a.type === b.type);
    ${type.options
      .map((option, i) => {
        return `${i > 0 ? "else " : ""}if (b.type === "${option.name}") {
      if (a.type === "${option.name}") {
        ${renderEncodeDiff(option, option.name!, "a.val", "b.val")};
      } else {
        encoder.pushEnum(${i}, ${type.numBits});
        ${renderEncode(option, option.name!, "b.val")};
      }
    }`;
      })
      .join("\n    ")}
  },
  decode(input: Uint8Array): ${name} {
    return ${name}._decode(new _.Decoder(input));
  },
  _decode(decoder: _.Decoder): ${name} {
    const type = decoder.nextEnum(${type.numBits});
    ${type.options
      .map((option, i) => {
        return `${i > 0 ? "else " : ""}if (type === ${i}) {
      return { type: "${option.name}", val: ${renderDecode(option, option.name!, "obj.val")} };
    }`;
      })
      .join("\n    ")}
    throw new Error("Invalid union");
  },
  decodeDiff(obj: ${name}, input: Uint8Array): ${name} {
    const decoder = new _.Decoder(input);
    return ${name}._decodeDiff(obj, decoder);
  },
  _decodeDiff(obj: ${name}, decoder: _.Decoder): ${name} {
    const isSameType = decoder.nextBoolean();
    if (isSameType) {
      ${type.options
        .map((option, i) => {
          return `${i > 0 ? "else " : ""}if (obj.type === "${option.name}") {
        return {
          type: "${option.name}",
          val: ${renderDecodeDiff(option, option.name!, "obj.val")},
        };
      }`;
        })
        .join("\n      ")}
      throw new Error("Invalid union diff");
    } else {
      const type = decoder.nextEnum(${type.numBits});
      ${type.options
        .map((option, i) => {
          return `${i > 0 ? "else " : ""}if (type === ${i}) {
        return {
          type: "${option.name}",
          val: ${renderDecode(option, option.name!, "obj.val")},
        };
      }`;
        })
        .join("\n      ")}
      throw new Error("Invalid union diff");
    }
  }
}`;
    }
    return "";
  })
  .join("\n")}`;

  function renderTypeArg(type: Type, name: string): string {
    if (type.type === "object") {
      return `{
  ${Object.entries(type.properties)
    .map(([name, childType]) => {
      return `${name}${childType.type === "optional" ? "?" : ""}: ${renderTypeArg(childType, name)};`;
    })
    .join("\n  ")}
} & { _dirty?: Set<keyof ${name}> }`;
    } else if (type.type === "union") {
      return type.options
        .map((option) => `{ type: "${option.name}"; val: ${option.name} }`)
        .join(" | ");
    } else if (type.type === "array") {
      const elementType = renderTypeArg(type.value, name);
      // Parenthesize if element type has _dirty (array or record - objects can't be direct children)
      const needsParens =
        type.value.type === "array" || type.value.type === "record";
      return needsParens
        ? `(${elementType})[] & { _dirty?: Set<number> }`
        : `${elementType}[] & { _dirty?: Set<number> }`;
    } else if (type.type === "optional") {
      return `${renderTypeArg(type.value, name)} | undefined`;
    } else if (type.type === "record") {
      return `Map<${renderTypeArg(type.key, name)}, ${renderTypeArg(type.value, name)}> & { _dirty?: Set<${renderTypeArg(type.key, name)}> }`;
    } else if (type.type === "reference") {
      return type.ref.name!;
    } else if (type.type === "int" || type.type === "float") {
      return "number";
    } else if (type.type === "self-reference") {
      return currentTypeName;
    }
    return type.type;
  }

  function renderDefault(type: Type, name: string): string {
    if (type.type === "array") {
      return "[]";
    } else if (type.type === "optional") {
      return "undefined";
    } else if (type.type === "record") {
      return "new Map()";
    } else if (type.type === "reference") {
      return renderDefault(type.ref, type.ref.name!);
    } else if (type.type === "string") {
      return '""';
    } else if (type.type === "int") {
      return "0";
    } else if (type.type === "float") {
      return "0.0";
    } else if (type.type === "boolean") {
      return "false";
    } else if (type.type === "enum") {
      return `"${type.options[0]}"`;
    } else if (type.type === "self-reference") {
      return `${currentTypeName}.default()`;
    }
    return `${name}.default()`;
  }

  function renderFromJson(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `_.parseArray(${key}, (x) => ${renderFromJson(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return `_.parseOptional(${key}, (x) => ${renderFromJson(type.value, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderFromJson(type.key, name, "x");
      const valueFn = renderFromJson(type.value, name, "x");
      return `_.parseRecord(${key}, (x) => ${keyFn}, (x) => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderFromJson(type.ref, type.ref.name!, key);
    } else if (type.type === "string") {
      return `_.parseString(${key})`;
    } else if (type.type === "int") {
      if (type.max != null) {
        return `_.parseInt(${key}, ${type.min}, ${type.max})`;
      }
      if (type.min != null) {
        return `_.parseInt(${key}, ${type.min})`;
      }
      return `_.parseInt(${key})`;
    } else if (type.type === "float") {
      return `_.parseFloat(${key})`;
    } else if (type.type === "boolean") {
      return `_.parseBoolean(${key})`;
    } else if (type.type === "enum") {
      return `_.parseEnum(${key}, ${name})`;
    } else if (type.type === "self-reference") {
      return `${currentTypeName}.fromJson(${key} as ${currentTypeName})`;
    }
    return `${name}.fromJson(${key} as ${name})`;
  }

  function renderToJson(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `${key}.map((x) => ${renderToJson(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return renderToJson(type.value, name, key);
    } else if (type.type === "record") {
      return `_.mapToObject(${key}, (x) => ${renderToJson(type.value, name, "x")})`;
    } else if (type.type === "reference") {
      return renderToJson(type.ref, type.ref.name!, key);
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "float" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return `${key}`;
    } else if (type.type === "self-reference") {
      return `${currentTypeName}.toJson(${key})`;
    }
    return `${name}.toJson(${key})`;
  }

  function renderClone(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `${key}.map((x) => ${renderClone(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return `${key} != null ? ${renderClone(type.value, name, key)} : undefined`;
    } else if (type.type === "record") {
      const valueFn = renderClone(type.value, name, "v");
      return `new Map([...${key}].map(([k, v]) => [k, ${valueFn}]))`;
    } else if (type.type === "reference") {
      return renderClone(type.ref, type.ref.name!, key);
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "float" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return `${key}`;
    } else if (type.type === "self-reference") {
      return `${currentTypeName}.clone(${key})`;
    }
    return `${name}.clone(${key})`;
  }

  function renderEquals(
    type: Type,
    name: string,
    keyA: string,
    keyB: string,
  ): string {
    if (type.type === "array") {
      return `_.equalsArray(${keyA}, ${keyB}, (x, y) => ${renderEquals(type.value, name, "x", "y")})`;
    } else if (type.type === "optional") {
      return `_.equalsOptional(${keyA}, ${keyB}, (x, y) => ${renderEquals(type.value, name, "x", "y")})`;
    } else if (type.type === "record") {
      const keyEquals = renderEquals(type.key, name, "x", "y");
      const valueEquals = renderEquals(type.value, name, "x", "y");
      return `_.equalsRecord(${keyA}, ${keyB}, (x, y) => ${keyEquals}, (x, y) => ${valueEquals})`;
    } else if (type.type === "reference") {
      return renderEquals(type.ref, type.ref.name!, keyA, keyB);
    } else if (type.type === "float") {
      if (type.precision) {
        return `_.equalsFloatQuantized(${keyA}, ${keyB}, ${type.precision})`;
      }
      return `_.equalsFloat(${keyA}, ${keyB})`;
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return `${keyA} === ${keyB}`;
    } else if (type.type === "self-reference") {
      return `${currentTypeName}.equals(${keyA}, ${keyB})`;
    }
    return `${name}.equals(${keyA}, ${keyB})`;
  }

  function renderEncode(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `encoder.pushArray(${key}, (x) => ${renderEncode(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return `encoder.pushOptional(${key}, (x) => ${renderEncode(type.value, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderEncode(type.key, name, "x");
      const valueFn = renderEncode(type.value, name, "x");
      return `encoder.pushRecord(${key}, (x) => ${keyFn}, (x) => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderEncode(type.ref, type.ref.name!, key);
    } else if (type.type === "string") {
      return `encoder.pushString(${key})`;
    } else if (type.type === "int") {
      if (type.min != null && type.min >= 0) {
        return `encoder.pushBoundedInt(${key}, ${type.min})`;
      }
      return `encoder.pushInt(${key})`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `encoder.pushFloatQuantized(${key}, ${type.precision})`;
      }
      return `encoder.pushFloat(${key})`;
    } else if (type.type === "boolean") {
      return `encoder.pushBoolean(${key})`;
    } else if (type.type === "enum") {
      return `encoder.pushEnum(${name}[${key}], ${type.numBits})`;
    } else if (type.type === "self-reference") {
      return `${currentTypeName}._encode(${key}, encoder)`;
    }
    return `${name}._encode(${key}, encoder)`;
  }

  function renderDecode(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `decoder.nextArray(() => ${renderDecode(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return `decoder.nextOptional(() => ${renderDecode(type.value, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderDecode(type.key, name, "x");
      const valueFn = renderDecode(type.value, name, "x");
      return `decoder.nextRecord(() => ${keyFn}, () => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderDecode(type.ref, type.ref.name!, key);
    } else if (type.type === "string") {
      return `decoder.nextString()`;
    } else if (type.type === "int") {
      if (type.min != null && type.min >= 0) {
        return `decoder.nextBoundedInt(${type.min})`;
      }
      return `decoder.nextInt()`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `decoder.nextFloatQuantized(${type.precision})`;
      }
      return `decoder.nextFloat()`;
    } else if (type.type === "boolean") {
      return `decoder.nextBoolean()`;
    } else if (type.type === "enum") {
      return `(${name} as any)[decoder.nextEnum(${type.numBits})]`;
    } else if (type.type === "self-reference") {
      return `${currentTypeName}._decode(decoder)`;
    }
    return `${name}._decode(decoder)`;
  }

  function renderEncodeDiff(
    type: Type,
    name: string,
    keyA: string,
    keyB: string,
  ): string {
    if (type.type === "array") {
      const valueType = renderTypeArg(type.value, name);
      const equalsFn = renderEquals(type.value, name, "x", "y");
      const encodeFn = renderEncode(type.value, name, "x");
      const encodeDiffFn = renderEncodeDiff(type.value, name, "x", "y");
      return `encoder.pushArrayDiff<${valueType}>(
        ${keyA},
        ${keyB},
        (x, y) => ${equalsFn},
        (x) => ${encodeFn},
        (x, y) => ${encodeDiffFn}
      )`;
    } else if (type.type === "optional") {
      const valueType = renderTypeArg(type.value, name);
      const encodeFn = renderEncode(type.value, name, "x");
      if (isPrimitiveOrEnum(type.value)) {
        return `encoder.pushOptionalDiffPrimitive<${valueType}>(
        ${keyA},
        ${keyB},
        (x) => ${encodeFn}
      )`;
      } else {
        const encodeDiffFn = renderEncodeDiff(type.value, name, "x", "y");
        return `encoder.pushOptionalDiff<${valueType}>(
        ${keyA},
        ${keyB},
        (x) => ${encodeFn},
        (x, y) => ${encodeDiffFn}
      )`;
      }
    } else if (type.type === "record") {
      const keyType = renderTypeArg(type.key, name);
      const valueType = renderTypeArg(type.value, name);
      const equalsFn = renderEquals(type.value, name, "x", "y");
      const encodeKeyFn = renderEncode(type.key, name, "x");
      const encodeValFn = renderEncode(type.value, name, "x");
      const encodeDiffFn = renderEncodeDiff(type.value, name, "x", "y");
      return `encoder.pushRecordDiff<${keyType}, ${valueType}>(
        ${keyA},
        ${keyB},
        (x, y) => ${equalsFn},
        (x) => ${encodeKeyFn},
        (x) => ${encodeValFn},
        (x, y) => ${encodeDiffFn}
      )`;
    } else if (type.type === "reference") {
      return renderEncodeDiff(type.ref, type.ref.name!, keyA, keyB);
    } else if (type.type === "string") {
      return `encoder.pushStringDiff(${keyA}, ${keyB})`;
    } else if (type.type === "int") {
      if (type.min != null && type.min >= 0) {
        return `encoder.pushBoundedIntDiff(${keyA}, ${keyB}, ${type.min})`;
      }
      return `encoder.pushIntDiff(${keyA}, ${keyB})`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `encoder.pushFloatQuantizedDiff(${keyA}, ${keyB}, ${type.precision})`;
      }
      return `encoder.pushFloatDiff(${keyA}, ${keyB})`;
    } else if (type.type === "boolean") {
      return `encoder.pushBooleanDiff(${keyA}, ${keyB})`;
    } else if (type.type === "enum") {
      return `encoder.pushEnumDiff(${name}[${keyA}], ${name}[${keyB}], ${type.numBits})`;
    } else if (type.type === "self-reference") {
      return `${currentTypeName}._encodeDiff(${keyA}, ${keyB}, encoder)`;
    }
    return `${name}._encodeDiff(${keyA}, ${keyB}, encoder)`;
  }

  function renderDecodeDiff(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      const valueType = renderTypeArg(type.value, name);
      const decodeFn = renderDecode(type.value, name, "x");
      const decodeDiffFn = renderDecodeDiff(type.value, name, "x");
      return `decoder.nextArrayDiff<${valueType}>(
        ${key},
        () => ${decodeFn},
        (x) => ${decodeDiffFn}
      )`;
    } else if (type.type === "optional") {
      const valueType = renderTypeArg(type.value, name);
      const decodeFn = renderDecode(type.value, name, "x");
      if (isPrimitiveOrEnum(type.value)) {
        return `decoder.nextOptionalDiffPrimitive<${valueType}>(
        ${key},
        () => ${decodeFn}
      )`;
      } else {
        const decodeDiffFn = renderDecodeDiff(type.value, name, "x");
        return `decoder.nextOptionalDiff<${valueType}>(
        ${key},
        () => ${decodeFn},
        (x) => ${decodeDiffFn}
      )`;
      }
    } else if (type.type === "record") {
      const keyType = renderTypeArg(type.key, name);
      const valueType = renderTypeArg(type.value, name);
      const decodeKeyFn = renderDecode(type.key, name, "x");
      const decodeValueFn = renderDecode(type.value, name, "x");
      const decodeDiffFn = renderDecodeDiff(type.value, name, "x");
      return `decoder.nextRecordDiff<${keyType}, ${valueType}>(
        ${key},
        () => ${decodeKeyFn},
        () => ${decodeValueFn},
        (x) => ${decodeDiffFn}
      )`;
    } else if (type.type === "reference") {
      return renderDecodeDiff(type.ref, type.ref.name!, key);
    } else if (type.type === "string") {
      return `decoder.nextStringDiff(${key})`;
    } else if (type.type === "int") {
      if (type.min != null && type.min >= 0) {
        return `decoder.nextBoundedIntDiff(${key}, ${type.min})`;
      }
      return `decoder.nextIntDiff(${key})`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `decoder.nextFloatQuantizedDiff(${key}, ${type.precision})`;
      }
      return `decoder.nextFloatDiff(${key})`;
    } else if (type.type === "boolean") {
      return `decoder.nextBooleanDiff(${key})`;
    } else if (type.type === "enum") {
      return `(${name} as any)[decoder.nextEnumDiff((${name} as any)[${key}], ${type.numBits})]`;
    } else if (type.type === "self-reference") {
      return `${currentTypeName}._decodeDiff(${key}, decoder)`;
    }
    return `${name}._decodeDiff(${key}, decoder)`;
  }
}
