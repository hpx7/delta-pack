import type { ChildType, Type } from "./generator";

export function renderDoc(doc: Record<string, Type>) {
  return `import {
  _DeepPartial,
  _NO_DIFF,
  _Reader,
  _Tracker,
  _Writer,
  diffArray,
  diffOptional,
  diffPrimitive,
  parseArray,
  parseArrayDiff,
  parseBoolean,
  parseFloat,
  parseInt,
  parseOptional,
  parseString,
  patchArray,
  patchOptional,
  validateArray,
  validateOptional,
  validatePrimitive,
  writeArray,
  writeArrayDiff,
  writeBoolean,
  writeFloat,
  writeInt,
  writeOptional,
  writeString,
} from "../helpers";

${Object.entries(doc)
  .map(([name, type]) => {
    if (type.type === "enum") {
      return `
export enum ${name} {
  ${type.options.map((option) => `${option},`).join("\n  ")}
}
    `;
    } else {
      return `export type ${name} = ${renderTypeArg(type)};`;
    }
  })
  .join("\n")}

${Object.entries(doc)
  .map(([name, type]) => {
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
  validate(obj: ${name}) {
    if (typeof obj !== "object") {
      return [\`Invalid ${name} object: \${obj}\`];
    }
    let validationErrors: string[] = [];

    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `validationErrors = ${renderValidate(childType, name, `obj.${childName}`)};
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid key: ${name}.${childName}");
    }`;
      })
      .join("\n    ")}

    return validationErrors;
  },
  encode(obj: ${name}, buf: _Writer = new _Writer()) {
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `${renderEncode(childType, name, `obj.${childName}`)};`;
      })
      .join("\n    ")}
    return buf;
  },
  encodeDiff(obj: _DeepPartial<${name}>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `tracker.push(obj.${childName} !== _NO_DIFF);
    if (obj.${childName} !== _NO_DIFF) {
      ${renderEncodeDiff(childType, name, `obj.${childName}`)};
    }`;
      })
      .join("\n    ")}
    return buf;
  },
  decode(buf: _Reader): ${name} {
    const sb = buf;
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: ${renderDecode(childType, name, `obj.${childName}`)},`;
        })
        .join("\n      ")}
    };
  },
  decodeDiff(buf: _Reader, tracker: _Tracker): _DeepPartial<${name}> {
    const sb = buf;
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: tracker.next() ? ${renderDecodeDiff(childType, name, `obj.${childName}`)} : _NO_DIFF,`;
        })
        .join("\n      ")}
    };
  },
  computeDiff(a: ${name}, b: ${name}): _DeepPartial<${name}> {
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: ${renderComputeDiff(childType, name, `a.${childName}`, `b.${childName}`)},`;
        })
        .join("\n      ")}
    };
  },
  applyDiff(obj: ${name}, diff: _DeepPartial<${name}>): ${name} {
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: diff.${childName} === _NO_DIFF ? obj.${childName} : ${renderApplyDiff(
            childType,
            name,
            `obj.${childName}`,
            `diff.${childName}`,
          )},`;
        })
        .join("\n      ")}
    };
  },
}`;
    } else if (type.type === "union") {
      return `
export const ${name} = {
  default(): ${name} {
    return {
      type: "${type.options[0].reference}",
      val: ${renderDefault(type.options[0], type.options[0].reference)},
    };
  },
  values() {
    return [${type.options.map((option) => `"${option.reference}"`).join(", ")}];
  },
  validate(obj: ${name}) {
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${reference.reference}") {
      const validationErrors = ${renderValidate(reference, reference.reference, "obj.val")};
      if (validationErrors.length > 0) {
        return validationErrors.concat("Invalid union: ${name}");
      }
      return validationErrors;
    }`;
      })
      .join("\n    ")}
    else {
      return [\`Invalid ${name} union: \${obj}\`];
    }
  },
  encode(obj: ${name}, buf: _Writer = new _Writer()) {
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${reference.reference}") {
      writeUInt8(buf, ${childName});
      ${renderEncode(reference, reference.reference, "obj.val")};
    }`;
      })
      .join("\n    ")}
    return buf;
  },
  encodeDiff(obj: _DeepPartial<${name}>, tracker: _Tracker, buf: _Writer = new _Writer()) {
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${reference.reference}") {
      writeUInt8(buf, ${i});
      writeBoolean(buf, obj.val !== _NO_DIFF);
      if (obj.val !== _NO_DIFF) {
       ${renderEncodeDiff(reference, reference.reference, "obj.val")};
      }
    }`;
      })
      .join("\n    ")}
    return buf;
  },
  decode(sb: _Reader): ${name} {
    const type = parseUInt8(sb);
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (type === ${i}) {
      return { type: "${reference.reference}", val: ${renderDecode(reference, reference.reference, "obj.val")} };
    }`;
      })
      .join("\n    ")}
    throw new Error("Invalid union");
  },
  decodeDiff(sb: _Reader, tracker: _Tracker): _DeepPartial<${name}> {
    const type = parseUInt8(sb);
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (type === ${i}) {
      return { type: "${reference.reference}", val: parseBoolean(sb) ? ${renderDecodeDiff(
          reference,
          reference.reference,
          "obj.val",
        )} : _NO_DIFF };
    }`;
      })
      .join("\n    ")}
    throw new Error("Invalid union");
  },
}`;
    }
  })
  .join("\n")}
`;

  function renderTypeArg(type: Type | ChildType): string {
    if (type.type === "object") {
      return `{
  ${Object.entries(type.properties)
    .map(([name, childType]) => {
      const optionalModifier = childType.modifier === "optional" ? "?" : "";
      const arrayModifier = childType.modifier === "array" ? "[]" : "";
      return `${name}${optionalModifier}: ${renderTypeArg(childType)}${arrayModifier};`;
    })
    .join("\n  ")}
}`;
    } else if (type.type === "union") {
      return type.options
        .map((option) => `{ type: "${renderTypeArg(option)}"; val: ${renderTypeArg(option)} }`)
        .join(" | ");
    } else if (type.type === "reference") {
      return type.reference;
    } else if (type.type === "int" || type.type === "float") {
      return "number";
    }
    return type.type;
  }

  function renderDefault(type: Type | ChildType, name: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return "[]";
    } else if ("modifier" in type && type.modifier === "optional") {
      return "undefined";
    } else if (type.type === "reference") {
      return renderDefault(doc[type.reference], type.reference);
    } else if (type.type === "string") {
      return '""';
    } else if (type.type === "int") {
      return "0";
    } else if (type.type === "float") {
      return "0.0";
    } else if (type.type === "boolean") {
      return "false";
    } else if (type.type === "enum") {
      return "0";
    }
    return `${name}.default()`;
  }

  function renderValidate(type: Type | ChildType, name: string, key: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `validateArray(${key}, (x) => ${renderValidate({ ...type, modifier: undefined }, name, "x")})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `validateOptional(${key}, (x) => ${renderValidate({ ...type, modifier: undefined }, name, "x")})`;
    } else if (type.type === "reference") {
      return renderValidate(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `validatePrimitive(typeof ${key} === "string", \`Invalid string: \${ ${key} }\`)`;
    } else if (type.type === "int") {
      return `validatePrimitive(Number.isInteger(${key}), \`Invalid int: \${ ${key} }\`)`;
    } else if (type.type === "float") {
      return `validatePrimitive(typeof ${key} === "number", \`Invalid string: \${ ${key} }\`)`;
    } else if (type.type === "boolean") {
      return `validatePrimitive(typeof ${key} === "boolean", \`Invalid string: \${ ${key} }\`)`;
    } else if (type.type === "enum") {
      return `validatePrimitive(${key} in ${name}, \`Invalid ${name}: \${ ${key} }\`)`;
    }
    return `${name}.validate(${key})`;
  }

  function renderEncode(type: Type | ChildType, name: string, key: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `writeArray(buf, ${key}, (x) => ${renderEncode({ ...type, modifier: undefined }, name, "x")})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `writeOptional(buf, ${key}, (x) => ${renderEncode({ ...type, modifier: undefined }, name, "x")})`;
    } else if (type.type === "reference") {
      return renderEncode(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `writeString(buf, ${key})`;
    } else if (type.type === "int") {
      return `writeInt(buf, ${key})`;
    } else if (type.type === "float") {
      return `writeFloat(buf, ${key})`;
    } else if (type.type === "boolean") {
      return `writeBoolean(buf, ${key})`;
    } else if (type.type === "enum") {
      return `writeUInt8(buf, ${key})`;
    }
    return `${name}.encode(${key}, buf)`;
  }

  function renderEncodeDiff(type: Type | ChildType, name: string, key: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `writeArrayDiff(buf, tracker, ${key}, (x) => ${renderEncodeDiff(
        { ...type, modifier: undefined },
        name,
        "x",
      )})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `writeOptional(buf, ${key}, (x) => ${renderEncodeDiff({ ...type, modifier: undefined }, name, "x")})`;
    } else if (type.type === "reference") {
      return renderEncodeDiff(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `writeString(buf, ${key})`;
    } else if (type.type === "int") {
      return `writeInt(buf, ${key})`;
    } else if (type.type === "float") {
      return `writeFloat(buf, ${key})`;
    } else if (type.type === "boolean") {
      return `writeBoolean(buf, ${key})`;
    } else if (type.type === "enum") {
      return `writeUInt8(buf, ${key})`;
    }
    return `${name}.encodeDiff(${key}, tracker, buf)`;
  }

  function renderDecode(type: Type | ChildType, name: string, key: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `parseArray(sb, () => ${renderDecode({ ...type, modifier: undefined }, name, "x")})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `parseOptional(sb, () => ${renderDecode({ ...type, modifier: undefined }, name, "x")})`;
    } else if (type.type === "reference") {
      return renderDecode(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `parseString(sb)`;
    } else if (type.type === "int") {
      return `parseInt(sb)`;
    } else if (type.type === "float") {
      return `parseFloat(sb)`;
    } else if (type.type === "boolean") {
      return `parseBoolean(sb)`;
    } else if (type.type === "enum") {
      return `parseUInt8(sb)`;
    }
    return `${name}.decode(sb)`;
  }

  function renderDecodeDiff(type: Type | ChildType, name: string, key: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `parseArrayDiff(sb, tracker, () => ${renderDecodeDiff({ ...type, modifier: undefined }, name, "x")})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `parseOptional(sb, () => ${renderDecodeDiff({ ...type, modifier: undefined }, name, "x")})`;
    } else if (type.type === "reference") {
      return renderDecodeDiff(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `parseString(sb)`;
    } else if (type.type === "int") {
      return `parseInt(sb)`;
    } else if (type.type === "float") {
      return `parseFloat(sb)`;
    } else if (type.type === "boolean") {
      return `parseBoolean(sb)`;
    } else if (type.type === "enum") {
      return `parseUInt8(sb)`;
    }
    return `${name}.decodeDiff(sb, tracker)`;
  }

  function renderComputeDiff(type: Type | ChildType, name: string, keyA: string, keyB: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `diffArray(${keyA}, ${keyB}, (x, y) => ${renderComputeDiff(
        { ...type, modifier: undefined },
        name,
        "x",
        "y",
      )})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `diffOptional(${keyA}, ${keyB}, (x, y) => ${renderComputeDiff(
        { ...type, modifier: undefined },
        name,
        "x",
        "y",
      )})`;
    } else if (type.type === "reference") {
      return renderComputeDiff(doc[type.reference], type.reference, keyA, keyB);
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "float" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return `diffPrimitive(${keyA}, ${keyB})`;
    }
    return `${name}.computeDiff(${keyA}, ${keyB})`;
  }

  function renderApplyDiff(type: Type | ChildType, name: string, key: string, diff: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `patchArray(${key}, ${diff}, (a, b) => ${renderApplyDiff(
        { ...type, modifier: undefined },
        name,
        "a",
        "b",
      )})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `patchOptional(${key}, ${diff}, (a, b) => ${renderApplyDiff(
        { ...type, modifier: undefined },
        name,
        "a",
        "b",
      )})`;
    } else if (type.type === "reference") {
      return renderApplyDiff(doc[type.reference], type.reference, key, diff);
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "float" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return diff;
    }
    return `${name}.applyDiff(${key}, ${diff})`;
  }
}
