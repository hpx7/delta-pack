import type { ReferenceType, Type } from "./generator";

export function renderDoc(doc: Record<string, Type>) {
  return `import * as _ from "../helpers.ts";

${Object.entries(doc)
  .map(([name, type]) => {
    if (type.type === "enum") {
      return `
export type ${name} = ${type.options.map((option) => `"${option}"`).join(" | ")};
    `;
    } else {
      return `export type ${name} = ${renderTypeArg(type)};`;
    }
  })
  .join("\n")}

${Object.entries(doc)
  .map(([name, type]) => {
    if (type.type === "enum") {
      return `
const ${name} = {
  ${type.options.map((option, i) => `${i}: "${option}",`).join("\n  ")}
  ${type.options.map((option, i) => `${option}: ${i},`).join("\n  ")}
};`;
    } if (type.type === "object") {
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
  encode(obj: ${name}, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `${renderEncode(childType, name, `obj.${childName}`)};`;
      })
      .join("\n    ")}
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): ${name} {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: ${renderDecode(childType, name, `obj.${childName}`)},`;
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
  encodeDiff(obj: _.DeepPartial<${name}>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `tracker.pushBoolean(obj.${childName} !== _.NO_DIFF);
    if (obj.${childName} !== _.NO_DIFF) {
      ${renderEncodeDiff(childType, name, `obj.${childName}`)};
    }`;
      })
      .join("\n    ")}
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<${name}> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: tracker.nextBoolean() ? ${renderDecodeDiff(
            childType,
            name,
            `obj.${childName}`,
          )} : _.NO_DIFF,`;
        })
        .join("\n      ")}
    };
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
      type: "${lookup(type.options[0])}",
      val: ${renderDefault(type.options[0], lookup(type.options[0]))},
    };
  },
  values() {
    return [${type.options.map((option) => `"${lookup(option)}"`).join(", ")}];
  },
  validate(obj: ${name}) {
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${lookup(reference)}") {
      const validationErrors = ${renderValidate(reference, lookup(reference), "obj.val")};
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
  encode(obj: ${name}, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${lookup(reference)}") {
      tracker.pushUInt(${childName});
      ${renderEncode(reference, lookup(reference), "obj.val")};
    }`;
      })
      .join("\n    ")}
    return tracker;
  },
  decode(input: Uint8Array | _.Tracker): ${name} {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    const type = tracker.nextUInt();
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (type === ${i}) {
      return { type: "${lookup(reference)}", val: ${renderDecode(reference, lookup(reference), "obj.val")} };
    }`;
      })
      .join("\n    ")}
    throw new Error("Invalid union");
  },
  computeDiff(a: ${name}, b: ${name}): _.DeepPartial<${name}> | typeof _.NO_DIFF {
    if (a.type !== b.type) {
      return { partial: false, ...b };
    }
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (a.type === "${lookup(reference)}" && b.type === "${lookup(reference)}") {
      const valDiff = ${renderComputeDiff(reference, lookup(reference), "a.val", "b.val")};
      return valDiff === _.NO_DIFF ? _.NO_DIFF : { partial: true, type: a.type, val: valDiff };
    }`;
      })
      .join("\n    ")}
    throw new Error("Invalid union");
  },
  encodeDiff(obj: _.DeepPartial<${name}>, track?: _.Tracker) {
    const tracker = track ?? new _.Tracker();
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${lookup(reference)}") {
      tracker.pushUInt(${i});
      tracker.pushBoolean(obj.partial);
      if (obj.partial) {
        ${renderEncodeDiff(reference, lookup(reference), "obj.val")};
      } else {
        ${renderEncode(reference, lookup(reference), "obj.val")};
      }
    }`;
      })
      .join("\n    ")}
    return tracker;
  },
  decodeDiff(input: Uint8Array | _.Tracker): _.DeepPartial<${name}> {
    const tracker = input instanceof Uint8Array ? _.Tracker.parse(input) : input;
    const type = tracker.nextUInt();
    const partial = tracker.nextBoolean();
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (type === ${i}) {
      if (partial) {
        return { partial, type: "${lookup(reference)}", val: ${renderDecodeDiff(
          reference,
          lookup(reference),
          "obj.val",
        )} };
      } else {
        return { partial, type: "${lookup(reference)}", val: ${renderDecode(reference, lookup(reference), "obj.val")} };
      }
    }`;
      })
      .join("\n    ")}
    throw new Error("Invalid union");
  },
  applyDiff(obj: ${name}, diff: _.DeepPartial<${name}> | typeof _.NO_DIFF): ${name} {
    if (diff === _.NO_DIFF) {
      return obj;
    }
    if (!diff.partial) {
      return diff;
    }
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${lookup(reference)}" && diff.type === "${lookup(
          reference,
        )}") {
      obj.val = ${renderApplyDiff(reference, lookup(reference), "obj.val", "diff.val")};
    }`;
      })
      .join("\n    ")}
    return obj;
  },
}`;
    }
  })
  .join("\n")}`;

  function lookup(type: ReferenceType) {
    for (const [name, value] of Object.entries(doc)) {
      if (value === type.reference) {
        return name;
      }
    }
    throw new Error(`Reference ${JSON.stringify(type.reference)} not found, searched ${Object.keys(doc)}`);
  }

  function renderTypeArg(type: Type): string {
    if (type.type === "object") {
      return `{
  ${Object.entries(type.properties)
    .map(([name, childType]) => {
      return `${name}${childType.type === "optional" ? "?" : ""}: ${renderTypeArg(childType)};`;
    })
    .join("\n  ")}
}`;
    } else if (type.type === "union") {
      return type.options
        .map((option) => `{ type: "${renderTypeArg(option)}"; val: ${renderTypeArg(option)} }`)
        .join(" | ");
    } else if (type.type === "array") {
      return `${renderTypeArg(type.value)}[]`;
    } else if (type.type === "optional") {
      return `${renderTypeArg(type.value)}`;
    } else if (type.type === "record") {
      return `Map<${renderTypeArg(type.key)}, ${renderTypeArg(type.value)}>`;
    } else if (type.type === "reference") {
      return lookup(type);
    } else if (type.type === "int" || type.type === "uint" || type.type === "float") {
      return "number";
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
      return renderDefault(type.reference, lookup(type));
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
      return `"${type.options[0]}"`;
    }
    return `${name}.default()`;
  }

  function renderValidate(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `_.validateArray(${key}, (x) => ${renderValidate(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return `_.validateOptional(${key}, (x) => ${renderValidate(type.value, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderValidate(type.key, name, "x");
      const valueFn = renderValidate(type.value, name, "x");
      return `_.validateRecord(${key}, (x) => ${keyFn}, (x) => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderValidate(type.reference, lookup(type), key);
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

  function renderEncode(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `_.writeArray(tracker, ${key}, (x) => ${renderEncode(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return `_.writeOptional(tracker, ${key}, (x) => ${renderEncode(type.value, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderEncode(type.key, name, "x");
      const valueFn = renderEncode(type.value, name, "x");
      return `_.writeRecord(tracker, ${key}, (x) => ${keyFn}, (x) => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderEncode(type.reference, lookup(type), key);
    } else if (type.type === "string") {
      return `tracker.pushString(${key})`;
    } else if (type.type === "int") {
      return `tracker.pushInt(${key})`;
    } else if (type.type === "uint") {
      return `tracker.pushUInt(${key})`;
    } else if (type.type === "float") {
      return `tracker.pushFloat(${key})`;
    } else if (type.type === "boolean") {
      return `tracker.pushBoolean(${key})`;
    } else if (type.type === "enum") {
      return `tracker.pushUInt(${name}[${key}])`;
    }
    return `${name}.encode(${key}, tracker)`;
  }

  function renderDecode(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `_.parseArray(tracker, () => ${renderDecode(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return `_.parseOptional(tracker, () => ${renderDecode(type.value, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderDecode(type.key, name, "x");
      const valueFn = renderDecode(type.value, name, "x");
      return `_.parseRecord(tracker, () => ${keyFn}, () => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderDecode(type.reference, lookup(type), key);
    } else if (type.type === "string") {
      return `tracker.nextString()`;
    } else if (type.type === "int") {
      return `tracker.nextInt()`;
    } else if (type.type === "uint") {
      return `tracker.nextUInt()`;
    } else if (type.type === "float") {
      return `tracker.nextFloat()`;
    } else if (type.type === "boolean") {
      return `tracker.nextBoolean()`;
    } else if (type.type === "enum") {
      return `${name}[tracker.nextUInt()]`;
    }
    return `${name}.decode(tracker)`;
  }

  function renderComputeDiff(type: Type, name: string, keyA: string, keyB: string): string {
    if (type.type === "array") {
      return `_.diffArray(${keyA}, ${keyB}, (x, y) => ${renderComputeDiff(type.value, name, "x", "y")})`;
    } else if (type.type === "optional") {
      return `_.diffOptional<${renderTypeArg(type.value)}>(${keyA}, ${keyB}, (x, y) => ${renderComputeDiff(
        type.value,
        name,
        "x",
        "y",
      )})`;
    } else if (type.type === "record") {
      return `_.diffRecord(${keyA}, ${keyB}, (x, y) => ${renderComputeDiff(type.value, name, "x", "y")})`;
    } else if (type.type === "reference") {
      return renderComputeDiff(type.reference, lookup(type), keyA, keyB);
    } else if (type.type === "float") {
      return `_.diffFloat(${keyA}, ${keyB})`;
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "uint" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return `_.diffPrimitive(${keyA}, ${keyB})`;
    }
    return `${name}.computeDiff(${keyA}, ${keyB})`;
  }

  function renderEncodeDiff(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      const valueType = renderTypeArg(type.value);
      const valueFn = renderEncode(type.value, name, "x");
      const valueUpdateFn = renderEncodeDiff(type.value, name, "x");
      return `_.writeArrayDiff<${valueType}>(tracker, ${key}, (x) => ${valueFn}, (x) => ${valueUpdateFn})`;
    } else if (type.type === "optional") {
      const valueType = renderTypeArg(type.value);
      const fullFn = renderEncode(type.value, name, "x");
      const partialFn = renderEncodeDiff(type.value, name, "x");
      return `_.writeOptionalDiff<${valueType}>(tracker, ${key}!, (x) => ${fullFn}, (x) => ${partialFn})`;
    } else if (type.type === "record") {
      const keyType = renderTypeArg(type.key);
      const valueType = renderTypeArg(type.value);
      const keyFn = renderEncodeDiff(type.key, name, "x");
      const valueFn = renderEncode(type.value, name, "x");
      const valueUpdateFn = renderEncodeDiff(type.value, name, "x");
      return `_.writeRecordDiff<${keyType}, ${valueType}>(tracker, ${key}, (x) => ${keyFn}, (x) => ${valueFn}, (x) => ${valueUpdateFn})`;
    } else if (type.type === "reference") {
      return renderEncodeDiff(type.reference, lookup(type), key);
    } else if (type.type === "string") {
      return `tracker.pushString(${key})`;
    } else if (type.type === "int") {
      return `tracker.pushInt(${key})`;
    } else if (type.type === "uint") {
      return `tracker.pushUInt(${key})`;
    } else if (type.type === "float") {
      return `tracker.pushFloat(${key})`;
    } else if (type.type === "boolean") {
      return `tracker.pushBoolean(${key})`;
    } else if (type.type === "enum") {
      return `tracker.pushUInt(${name}[${key}])`;
    }
    return `${name}.encodeDiff(${key}, tracker)`;
  }

  function renderDecodeDiff(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      const valueType = renderTypeArg(type.value);
      const valueFn = renderDecode(type.value, name, "x");
      const valueUpdateFn = renderDecodeDiff(type.value, name, "x");
      return `_.parseArrayDiff<${valueType}>(tracker, () => ${valueFn}, () => ${valueUpdateFn})`;
    } else if (type.type === "optional") {
      const valueType = renderTypeArg(type.value);
      const fullFn = renderDecode(type.value, name, "x");
      const partialFn = renderDecodeDiff(type.value, name, "x");
      return `_.parseOptionalDiff<${valueType}>(tracker, () => ${fullFn}, () => ${partialFn})`;
    } else if (type.type === "record") {
      const keyType = renderTypeArg(type.key);
      const valueType = renderTypeArg(type.value);
      const keyFn = renderDecodeDiff(type.key, name, "x");
      const valueFn = renderDecode(type.value, name, "x");
      const valueUpdateFn = renderDecodeDiff(type.value, name, "x");
      return `_.parseRecordDiff<${keyType}, ${valueType}>(tracker, () => ${keyFn}, () => ${valueFn}, () => ${valueUpdateFn})`;
    } else if (type.type === "reference") {
      return renderDecodeDiff(type.reference, lookup(type), key);
    } else if (type.type === "string") {
      return `tracker.nextString()`;
    } else if (type.type === "int") {
      return `tracker.nextInt()`;
    } else if (type.type === "uint") {
      return `tracker.nextUInt()`;
    } else if (type.type === "float") {
      return `tracker.nextFloat()`;
    } else if (type.type === "boolean") {
      return `tracker.nextBoolean()`;
    } else if (type.type === "enum") {
      return `${name}[tracker.nextUInt()]`;
    }
    return `${name}.decodeDiff(tracker)`;
  }

  function renderApplyDiff(type: Type, name: string, key: string, diff: string): string {
    if (type.type === "array") {
      return `_.patchArray<${renderTypeArg(type.value)}>(${key}, ${diff}, (a, b) => ${renderApplyDiff(
        type.value,
        name,
        "a",
        "b",
      )})`;
    } else if (type.type === "optional") {
      return `_.patchOptional<${renderTypeArg(type.value)}>(${key}, ${diff}!, (a, b) => ${renderApplyDiff(
        type.value,
        name,
        "a",
        "b",
      )})`;
    } else if (type.type === "record") {
      const keyType = renderTypeArg(type.key);
      const valueType = renderTypeArg(type.value);
      return `_.patchRecord<${keyType}, ${valueType}>(${key}, ${diff}, (a, b) => ${renderApplyDiff(
        type.value,
        name,
        "a",
        "b",
      )})`;
    } else if (type.type === "reference") {
      return renderApplyDiff(type.reference, lookup(type), key, diff);
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
