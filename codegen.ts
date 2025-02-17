import type { ChildType, Type } from "./generator";

export function renderDoc(doc: Record<string, Type>) {
  return `import * as _ from "../helpers.ts";

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
  encode(obj: ${name}, buf: _.Writer = new _.Writer()) {
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `${renderEncode(childType, name, `obj.${childName}`)};`;
      })
      .join("\n    ")}
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<${name}>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `tracker.push(obj.${childName} !== _.NO_DIFF);
    if (obj.${childName} !== _.NO_DIFF) {
      ${renderEncodeDiff(childType, name, `obj.${childName}`)};
    }`;
      })
      .join("\n    ")}
    return buf;
  },
  decode(buf: _.Reader): ${name} {
    const sb = buf;
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: ${renderDecode(childType, name, `obj.${childName}`)},`;
        })
        .join("\n      ")}
    };
  },
  decodeDiff(buf: _.Reader, tracker: _.Tracker): _.DeepPartial<${name}> {
    const sb = buf;
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: tracker.next() ? ${renderDecodeDiff(childType, name, `obj.${childName}`)} : _.NO_DIFF,`;
        })
        .join("\n      ")}
    };
  },
  computeDiff(a: ${name}, b: ${name}): _.DeepPartial<${name}> | typeof _.NO_DIFF {
    const diff: _.DeepPartial<${name}> =  {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: ${renderComputeDiff(childType, name, `a.${childName}`, `b.${childName}`)},`;
        })
        .join("\n      ")}
    };
    return ${Object.keys(type.properties)
      .map((childName) => `diff.${childName} === _.NO_DIFF`)
      .join(" && ")} ? _.NO_DIFF : diff;
  },
  applyDiff(obj: ${name}, diff: _.DeepPartial<${name}> | typeof _.NO_DIFF): ${name} {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `obj.${childName} = diff.${childName} === _.NO_DIFF ? obj.${childName} : ${renderApplyDiff(
          childType,
          name,
          `obj.${childName}`,
          `diff.${childName}`,
        )};`;
      })
      .join("\n    ")}
    return obj;
  },
};`;
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
  encode(obj: ${name}, buf: _.Writer = new _.Writer()) {
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${reference.reference}") {
      _.writeUInt8(buf, ${childName});
      ${renderEncode(reference, reference.reference, "obj.val")};
    }`;
      })
      .join("\n    ")}
    return buf;
  },
  encodeDiff(obj: _.DeepPartial<${name}>, tracker: _.Tracker, buf: _.Writer = new _.Writer()) {
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${reference.reference}") {
      _.writeUInt8(buf, ${i});
      _.writeBoolean(buf, obj.val !== _.NO_DIFF);
      if (obj.val !== _.NO_DIFF) {
       ${renderEncodeDiff(reference, reference.reference, "obj.val")};
      }
    }`;
      })
      .join("\n    ")}
    return buf;
  },
  decode(sb: _.Reader): ${name} {
    const type = _.parseUInt8(sb);
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (type === ${i}) {
      return { type: "${reference.reference}", val: ${renderDecode(reference, reference.reference, "obj.val")} };
    }`;
      })
      .join("\n    ")}
    throw new Error("Invalid union");
  },
  decodeDiff(sb: _.Reader, tracker: _.Tracker): _.DeepPartial<${name}> {
    const type = _.parseUInt8(sb);
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (type === ${i}) {
      return { type: "${reference.reference}", val: _.parseBoolean(sb) ? ${renderDecodeDiff(
          reference,
          reference.reference,
          "obj.val",
        )} : _.NO_DIFF };
    }`;
      })
      .join("\n    ")}
    throw new Error("Invalid union");
  },
}`;
    }
  })
  .join("\n")}`;

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
    } else if (type.type === "record") {
      return `Map<${renderTypeArg(type.key)}, ${renderTypeArg(type.value)}>`;
    } else if (type.type === "reference") {
      return type.reference;
    } else if (type.type === "int" || type.type === "uint" || type.type === "float") {
      return "number";
    }
    return type.type;
  }

  function renderDefault(type: Type | ChildType, name: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return "[]";
    } else if ("modifier" in type && type.modifier === "optional") {
      return "undefined";
    } else if (type.type === "record") {
      return "new Map()";
    } else if (type.type === "reference") {
      return renderDefault(doc[type.reference], type.reference);
    } else if (type.type === "string") {
      return '""';
    } else if (type.type === "int") {
      return "0";
    } else if (type.type === "uint") {
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
      return `_.validateArray(${key}, (x) => ${renderValidate({ ...type, modifier: undefined }, name, "x")})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `_.validateOptional(${key}, (x) => ${renderValidate({ ...type, modifier: undefined }, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderValidate(type.key, name, "x");
      const valueFn = renderValidate(type.value, name, "x");
      return `_.validateRecord(${key}, (x) => ${keyFn}, (x) => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderValidate(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `_.validatePrimitive(typeof ${key} === "string", \`Invalid string: \${${key}}\`)`;
    } else if (type.type === "int") {
      return `_.validatePrimitive(Number.isInteger(${key}), \`Invalid int: \${${key}}\`)`;
    } else if (type.type === "uint") {
      return `_.validatePrimitive(Number.isInteger(${key}) && ${key} >= 0, \`Invalid uint: \${${key}}\`)`;
    } else if (type.type === "float") {
      return `_.validatePrimitive(typeof ${key} === "number", \`Invalid float: \${${key}}\`)`;
    } else if (type.type === "boolean") {
      return `_.validatePrimitive(typeof ${key} === "boolean", \`Invalid boolean: \${${key}}\`)`;
    } else if (type.type === "enum") {
      return `_.validatePrimitive(${key} in ${name}, \`Invalid ${name}: \${${key}}\`)`;
    }
    return `${name}.validate(${key})`;
  }

  function renderEncode(type: Type | ChildType, name: string, key: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `_.writeArray(buf, ${key}, (x) => ${renderEncode({ ...type, modifier: undefined }, name, "x")})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `_.writeOptional(buf, ${key}, (x) => ${renderEncode({ ...type, modifier: undefined }, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderEncode(type.key, name, "x");
      const valueFn = renderEncode(type.value, name, "x");
      return `_.writeRecord(buf, ${key}, (x) => ${keyFn}, (x) => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderEncode(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `_.writeString(buf, ${key})`;
    } else if (type.type === "int") {
      return `_.writeInt(buf, ${key})`;
    } else if (type.type === "uint") {
      return `_.writeUInt(buf, ${key})`;
    } else if (type.type === "float") {
      return `_.writeFloat(buf, ${key})`;
    } else if (type.type === "boolean") {
      return `_.writeBoolean(buf, ${key})`;
    } else if (type.type === "enum") {
      return `_.writeUInt8(buf, ${key})`;
    }
    return `${name}.encode(${key}, buf)`;
  }

  function renderEncodeDiff(type: Type | ChildType, name: string, key: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `_.writeArrayDiff(buf, tracker, ${key}, (x) => ${renderEncodeDiff(
        { ...type, modifier: undefined },
        name,
        "x",
      )})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `_.writeOptionalDiff(tracker, ${key}, (x) => ${renderEncodeDiff(
        { ...type, modifier: undefined },
        name,
        "x",
      )})`;
    } else if (type.type === "record") {
      const keyFn = renderEncodeDiff(type.key, name, "x");
      const valueFn = renderEncodeDiff(type.value, name, "x");
      return `_.writeRecordDiff(buf, ${key}, (x) => ${keyFn}, (x) => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderEncodeDiff(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `_.writeString(buf, ${key})`;
    } else if (type.type === "int") {
      return `_.writeInt(buf, ${key})`;
    } else if (type.type === "uint") {
      return `_.writeUInt(buf, ${key})`;
    } else if (type.type === "float") {
      return `_.writeFloat(buf, ${key})`;
    } else if (type.type === "boolean") {
      return `_.writeBoolean(buf, ${key})`;
    } else if (type.type === "enum") {
      return `_.writeUInt8(buf, ${key})`;
    }
    return `${name}.encodeDiff(${key}, tracker, buf)`;
  }

  function renderDecode(type: Type | ChildType, name: string, key: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `_.parseArray(sb, () => ${renderDecode({ ...type, modifier: undefined }, name, "x")})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `_.parseOptional(sb, () => ${renderDecode({ ...type, modifier: undefined }, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderDecode(type.key, name, "x");
      const valueFn = renderDecode(type.value, name, "x");
      return `_.parseRecord(sb, () => ${keyFn}, () => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderDecode(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `_.parseString(sb)`;
    } else if (type.type === "int") {
      return `_.parseInt(sb)`;
    } else if (type.type === "uint") {
      return `_.parseUInt(sb)`;
    } else if (type.type === "float") {
      return `_.parseFloat(sb)`;
    } else if (type.type === "boolean") {
      return `_.parseBoolean(sb)`;
    } else if (type.type === "enum") {
      return `_.parseUInt8(sb)`;
    }
    return `${name}.decode(sb)`;
  }

  function renderDecodeDiff(type: Type | ChildType, name: string, key: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `_.parseArrayDiff(sb, tracker, () => ${renderDecodeDiff({ ...type, modifier: undefined }, name, "x")})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `_.parseOptionalDiff(tracker, () => ${renderDecodeDiff({ ...type, modifier: undefined }, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderDecodeDiff(type.key, name, "x");
      const valueFn = renderDecodeDiff(type.value, name, "x");
      return `_.parseRecordDiff(sb, () => ${keyFn}, () => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderDecodeDiff(doc[type.reference], type.reference, key);
    } else if (type.type === "string") {
      return `_.parseString(sb)`;
    } else if (type.type === "int") {
      return `_.parseInt(sb)`;
    } else if (type.type === "uint") {
      return `_.parseUInt(sb)`;
    } else if (type.type === "float") {
      return `_.parseFloat(sb)`;
    } else if (type.type === "boolean") {
      return `_.parseBoolean(sb)`;
    } else if (type.type === "enum") {
      return `_.parseUInt8(sb)`;
    }
    return `${name}.decodeDiff(sb, tracker)`;
  }

  function renderComputeDiff(type: Type | ChildType, name: string, keyA: string, keyB: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `_.diffArray(${keyA}, ${keyB}, (x, y) => ${renderComputeDiff(
        { ...type, modifier: undefined },
        name,
        "x",
        "y",
      )})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `_.diffOptional(${keyA}, ${keyB}, (x, y) => ${renderComputeDiff(
        { ...type, modifier: undefined },
        name,
        "x",
        "y",
      )})`;
    } else if (type.type === "record") {
      return `_.diffRecord(${keyA}, ${keyB}, (x, y) => ${renderComputeDiff(type.value, name, "x", "y")})`;
    } else if (type.type === "reference") {
      return renderComputeDiff(doc[type.reference], type.reference, keyA, keyB);
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "uint" ||
      type.type === "float" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return `_.diffPrimitive(${keyA}, ${keyB})`;
    }
    return `${name}.computeDiff(${keyA}, ${keyB})`;
  }

  function renderApplyDiff(type: Type | ChildType, name: string, key: string, diff: string): string {
    if ("modifier" in type && type.modifier === "array") {
      return `_.patchArray(${key}, ${diff}, (a, b) => ${renderApplyDiff(
        { ...type, modifier: undefined },
        name,
        "a",
        "b",
      )})`;
    } else if ("modifier" in type && type.modifier === "optional") {
      return `_.patchOptional(${key}, ${diff}, (a, b) => ${renderApplyDiff(
        { ...type, modifier: undefined },
        name,
        "a",
        "b",
      )})`;
    } else if (type.type === "record") {
      return `_.patchRecord(${key}, ${diff}, (a, b) => ${renderApplyDiff(type.value, name, "a", "b")})`;
    } else if (type.type === "reference") {
      return renderApplyDiff(doc[type.reference], type.reference, key, diff);
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "uint" ||
      type.type === "float" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return diff;
    }
    return `${name}.applyDiff(${key}, ${diff})`;
  }
}
