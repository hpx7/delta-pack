import type { ReferenceType, Type } from "./generator";

function isPrimitiveType(type: Type, doc: Record<string, Type>): boolean {
  // Resolve references
  if (type.type === "reference") {
    return isPrimitiveType(type.reference, doc);
  }

  // Check if the type itself is primitive
  return (
    type.type === "string" ||
    type.type === "int" ||
    type.type === "uint" ||
    type.type === "float" ||
    type.type === "boolean" ||
    type.type === "enum"
  );
}

export function renderDoc(doc: Record<string, Type>) {
  return `import * as _ from "@hathora/delta-pack/helpers";

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
  equals(a: ${name}, b: ${name}): boolean {
    return (
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return renderEquals(childType, name, `a.${childName}`, `b.${childName}`);
        })
        .join(" &&\n      ")}
    );
  },
  encode(obj: ${name}): Uint8Array {
    const tracker = new _.Tracker();
    ${name}._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ${name}, tracker: _.Tracker): void {
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `${renderEncode(childType, name, `obj.${childName}`)};`;
      })
      .join("\n    ")}
  },
  encodeDiff(a: ${name}, b: ${name}): Uint8Array {
    const tracker = new _.Tracker();
    ${name}._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ${name}, b: ${name}, tracker: _.Tracker): void {
    const changed = !${name}.equals(a, b);
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `${renderEncodeDiff(childType, name, `a.${childName}`, `b.${childName}`)};`;
      })
      .join("\n    ")}
  },
  decode(input: Uint8Array): ${name} {
    return ${name}._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ${name} {
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: ${renderDecode(childType, name, `obj.${childName}`)},`;
        })
        .join("\n      ")}
    };
  },
  decodeDiff(obj: ${name}, input: Uint8Array): ${name} {
    const tracker = _.Tracker.parse(input);
    return ${name}._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ${name}, tracker: _.Tracker): ${name} {
    const changed = tracker.nextBoolean();
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
  equals(a: ${name}, b: ${name}): boolean {
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (a.type === "${lookup(reference)}" && b.type === "${lookup(reference)}") {
      return ${renderEquals(reference, lookup(reference), "a.val", "b.val")};
    }`;
      })
      .join("\n    ")}
    return false;
  },
  encode(obj: ${name}): Uint8Array {
    const tracker = new _.Tracker();
    ${name}._encode(obj, tracker);
    return tracker.toBuffer();
  },
  _encode(obj: ${name}, tracker: _.Tracker): void {
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${lookup(reference)}") {
      tracker.pushUInt(${childName});
      ${renderEncode(reference, lookup(reference), "obj.val")};
    }`;
      })
      .join("\n    ")}
  },
  encodeDiff(a: ${name}, b: ${name}): Uint8Array {
    const tracker = new _.Tracker();
    ${name}._encodeDiff(a, b, tracker);
    return tracker.toBuffer();
  },
  _encodeDiff(a: ${name}, b: ${name}, tracker: _.Tracker): void {
    ${Object.entries(type.options)
      .map(([childName, reference], i) => {
        return `${i > 0 ? "else " : ""}if (b.type === "${lookup(reference)}") {
      tracker.pushBoolean(a.type === "${lookup(reference)}");
      if (a.type === "${lookup(reference)}") {
        ${renderEncodeDiff(reference, lookup(reference), "a.val", "b.val")};
      } else {
        tracker.pushUInt(${i});
        ${renderEncode(reference, lookup(reference), "b.val")};
      }
    }`;
      })
      .join("\n    ")}
  },
  decode(input: Uint8Array): ${name} {
    return ${name}._decode(_.Tracker.parse(input));
  },
  _decode(tracker: _.Tracker): ${name} {
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
  decodeDiff(obj: ${name}, input: Uint8Array): ${name} {
    const tracker = _.Tracker.parse(input);
    return ${name}._decodeDiff(obj, tracker);
  },
  _decodeDiff(obj: ${name}, tracker: _.Tracker): ${name} {
    const isSameType = tracker.nextBoolean();
    if (isSameType) {
      ${Object.entries(type.options)
        .map(([childName, reference], i) => {
          return `${i > 0 ? "else " : ""}if (obj.type === "${lookup(reference)}") {
        return {
          type: "${lookup(reference)}",
          val: ${renderDecodeDiff(reference, lookup(reference), "obj.val")},
        };
      }`;
        })
        .join("\n      ")}
      throw new Error("Invalid union diff");
    } else {
      const type = tracker.nextUInt();
      ${Object.entries(type.options)
        .map(([childName, reference], i) => {
          return `${i > 0 ? "else " : ""}if (type === ${i}) {
        return { type: "${lookup(reference)}", val: ${renderDecode(reference, lookup(reference), "obj.val")} };
      }`;
        })
        .join("\n      ")}
      throw new Error("Invalid union diff");
    }
  }
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

  function renderEquals(type: Type, name: string, keyA: string, keyB: string): string {
    if (type.type === "array") {
      return `_.equalsArray(${keyA}, ${keyB}, (x, y) => ${renderEquals(type.value, name, "x", "y")})`;
    } else if (type.type === "optional") {
      return `_.equalsOptional(${keyA}, ${keyB}, (x, y) => ${renderEquals(type.value, name, "x", "y")})`;
    } else if (type.type === "record") {
      const keyEquals = renderEquals(type.key, name, "x", "y");
      const valueEquals = renderEquals(type.value, name, "x", "y");
      return `_.equalsRecord(${keyA}, ${keyB}, (x, y) => ${keyEquals}, (x, y) => ${valueEquals})`;
    } else if (type.type === "reference") {
      return renderEquals(type.reference, lookup(type), keyA, keyB);
    } else if (type.type === "float") {
      if (type.precision) {
        return `Math.round(${keyA} / ${type.precision}) === Math.round(${keyB} / ${type.precision})`;
      }
      return `Math.abs(${keyA} - ${keyB}) < 0.00001`;
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "uint" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return `${keyA} === ${keyB}`;
    }
    return `${name}.equals(${keyA}, ${keyB})`;
  }

  function renderEncode(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `tracker.pushArray(${key}, (x) => ${renderEncode(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return `tracker.pushOptional(${key}, (x) => ${renderEncode(type.value, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderEncode(type.key, name, "x");
      const valueFn = renderEncode(type.value, name, "x");
      return `tracker.pushRecord(${key}, (x) => ${keyFn}, (x) => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderEncode(type.reference, lookup(type), key);
    } else if (type.type === "string") {
      return `tracker.pushString(${key})`;
    } else if (type.type === "int") {
      return `tracker.pushInt(${key})`;
    } else if (type.type === "uint") {
      return `tracker.pushUInt(${key})`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `tracker.pushInt(Math.round(${key} / ${type.precision}))`;
      }
      return `tracker.pushFloat(${key})`;
    } else if (type.type === "boolean") {
      return `tracker.pushBoolean(${key})`;
    } else if (type.type === "enum") {
      return `tracker.pushUInt(${name}[${key}])`;
    }
    return `${name}._encode(${key}, tracker)`;
  }

  function renderDecode(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      return `tracker.nextArray(() => ${renderDecode(type.value, name, "x")})`;
    } else if (type.type === "optional") {
      return `tracker.nextOptional(() => ${renderDecode(type.value, name, "x")})`;
    } else if (type.type === "record") {
      const keyFn = renderDecode(type.key, name, "x");
      const valueFn = renderDecode(type.value, name, "x");
      return `tracker.nextRecord(() => ${keyFn}, () => ${valueFn})`;
    } else if (type.type === "reference") {
      return renderDecode(type.reference, lookup(type), key);
    } else if (type.type === "string") {
      return `tracker.nextString()`;
    } else if (type.type === "int") {
      return `tracker.nextInt()`;
    } else if (type.type === "uint") {
      return `tracker.nextUInt()`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `tracker.nextInt() * ${type.precision}`;
      }
      return `tracker.nextFloat()`;
    } else if (type.type === "boolean") {
      return `tracker.nextBoolean()`;
    } else if (type.type === "enum") {
      return `(${name} as any)[tracker.nextUInt()]`;
    }
    return `${name}._decode(tracker)`;
  }

  function renderEncodeDiff(type: Type, name: string, keyA: string, keyB: string): string {
    if (type.type === "array") {
      const valueType = renderTypeArg(type.value);
      const equalsFn = renderEquals(type.value, name, "x", "y");
      const encodeFn = renderEncode(type.value, name, "x");
      const encodeDiffFn = renderEncodeDiff(type.value, name, "x", "y");
      return `tracker.pushArrayDiff<${valueType}>(
      ${keyA},
      ${keyB},
      (x, y) => ${equalsFn},
      (x) => ${encodeFn},
      (x, y) => ${encodeDiffFn}
    )`;
    } else if (type.type === "optional") {
      const valueType = renderTypeArg(type.value);
      const encodeFn = renderEncode(type.value, name, "x");
      if (isPrimitiveType(type.value, doc)) {
        return `tracker.pushOptionalDiffPrimitive<${valueType}>(
      ${keyA},
      ${keyB},
      (x) => ${encodeFn}
    )`;
      } else {
        const encodeDiffFn = renderEncodeDiff(type.value, name, "x", "y");
        return `tracker.pushOptionalDiff<${valueType}>(
      ${keyA},
      ${keyB},
      (x) => ${encodeFn},
      (x, y) => ${encodeDiffFn}
    )`;
      }
    } else if (type.type === "record") {
      const keyType = renderTypeArg(type.key);
      const valueType = renderTypeArg(type.value);
      const equalsFn = renderEquals(type.value, name, "x", "y");
      const encodeKeyFn = renderEncode(type.key, name, "x");
      const encodeValFn = renderEncode(type.value, name, "x");
      const encodeDiffFn = renderEncodeDiff(type.value, name, "x", "y");
      return `tracker.pushRecordDiff<${keyType}, ${valueType}>(
      ${keyA},
      ${keyB},
      (x, y) => ${equalsFn},
      (x) => ${encodeKeyFn},
      (x) => ${encodeValFn},
      (x, y) => ${encodeDiffFn}
    )`;
    } else if (type.type === "reference") {
      return renderEncodeDiff(type.reference, lookup(type), keyA, keyB);
    } else if (type.type === "string") {
      return `tracker.pushStringDiff(${keyA}, ${keyB})`;
    } else if (type.type === "int") {
      return `tracker.pushIntDiff(${keyA}, ${keyB})`;
    } else if (type.type === "uint") {
      return `tracker.pushUIntDiff(${keyA}, ${keyB})`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `tracker.pushIntDiff(Math.round(${keyA} / ${type.precision}), Math.round(${keyB} / ${type.precision}))`;
      }
      return `tracker.pushFloatDiff(${keyA}, ${keyB})`;
    } else if (type.type === "boolean") {
      return `tracker.pushBooleanDiff(${keyA}, ${keyB})`;
    } else if (type.type === "enum") {
      return `tracker.pushUIntDiff(${name}[${keyA}], ${name}[${keyB}])`;
    }
    return `${name}._encodeDiff(${keyA}, ${keyB}, tracker)`;
  }

  function renderDecodeDiff(type: Type, name: string, key: string): string {
    if (type.type === "array") {
      const valueType = renderTypeArg(type.value);
      const decodeFn = renderDecode(type.value, name, "x");
      const decodeDiffFn = renderDecodeDiff(type.value, name, "x");
      return `tracker.nextArrayDiff<${valueType}>(
        ${key},
        () => ${decodeFn},
        (x) => ${decodeDiffFn}
      )`;
    } else if (type.type === "optional") {
      const valueType = renderTypeArg(type.value);
      const decodeFn = renderDecode(type.value, name, "x");
      if (isPrimitiveType(type.value, doc)) {
        return `tracker.nextOptionalDiffPrimitive<${valueType}>(
        ${key},
        () => ${decodeFn}
      )`;
      } else {
        const decodeDiffFn = renderDecodeDiff(type.value, name, "x");
        return `tracker.nextOptionalDiff<${valueType}>(
        ${key},
        () => ${decodeFn},
        (x) => ${decodeDiffFn}
      )`;
      }
    } else if (type.type === "record") {
      const keyType = renderTypeArg(type.key);
      const valueType = renderTypeArg(type.value);
      const decodeKeyFn = renderDecode(type.key, name, "x");
      const decodeValueFn = renderDecode(type.value, name, "x");
      const decodeDiffFn = renderDecodeDiff(type.value, name, "x");
      return `tracker.nextRecordDiff<${keyType}, ${valueType}>(
        ${key},
        () => ${decodeKeyFn},
        () => ${decodeValueFn},
        (x) => ${decodeDiffFn}
      )`;
    } else if (type.type === "reference") {
      return renderDecodeDiff(type.reference, lookup(type), key);
    } else if (type.type === "string") {
      return `tracker.nextStringDiff(${key})`;
    } else if (type.type === "int") {
      return `tracker.nextIntDiff(${key})`;
    } else if (type.type === "uint") {
      return `tracker.nextUIntDiff(${key})`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `tracker.nextIntDiff(Math.round(${key} / ${type.precision})) * ${type.precision}`;
      }
      return `tracker.nextFloatDiff(${key})`;
    } else if (type.type === "boolean") {
      return `tracker.nextBooleanDiff(${key})`;
    } else if (type.type === "enum") {
      return `(${name} as any)[tracker.nextUIntDiff((${name} as any)[${key}])]`;
    }
    return `${name}._decodeDiff(${key}, tracker)`;
  }
}
