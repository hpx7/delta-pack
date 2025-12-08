import { Type, ReferenceType, isPrimitiveType } from "./schema.js";

export function codegenTypescript(schema: Record<string, Type>) {
  return renderSchema(schema);
}

function renderSchema(schema: Record<string, Type>) {
  return `import * as _ from "@hpx7/delta-pack/helpers";

${Object.entries(schema)
  .map(([name, type]) => {
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
  fromJson(obj: Record<string, unknown>): ${name} {
    if (typeof obj !== "object" || obj == null || Object.getPrototypeOf(obj) !== Object.prototype) {
      throw new Error(\`Invalid ${name}: \${obj}\`);
    }
    return {
      ${Object.entries(type.properties)
        .map(([childName, childType]) => {
          return `${childName}: _.tryParseField(() => ${renderFromJson(childType, childName, `obj["${childName}"]`)}, "${name}.${childName}"),`;
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
    const dirty = b._dirty;
    const changed = dirty == null ? !${name}.equals(a, b) : dirty.size > 0;
    tracker.pushBoolean(changed);
    if (!changed) {
      return;
    }
    ${Object.entries(type.properties)
      .map(([childName, childType]) => {
        return `// Field: ${childName}
    if (dirty != null && !dirty.has("${childName}")) {
      tracker.pushBoolean(false);
    } else {
      ${renderEncodeDiff(childType, name, `a.${childName}`, `b.${childName}`)};
    }`;
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
      type: "${type.options[0]!.reference}",
      val: ${renderDefault(type.options[0]!, type.options[0]!.reference)},
    };
  },
  values() {
    return [${type.options.map((option) => `"${option.reference}"`).join(", ")}];
  },
  fromJson(obj: Record<string, unknown>): ${name} {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(\`Invalid ${name}: \${obj}\`);
    }
    // check if it's delta-pack format: { type: "TypeName", val: ... }
    if ("type" in obj && typeof obj["type"] === "string" && "val" in obj) {
      ${type.options
        .map((reference, i) => {
          return `${i > 0 ? "else " : ""}if (obj["type"] === "${reference.reference}") {
        return {
          type: "${reference.reference}",
          val: ${renderFromJson(reference, reference.reference, `obj["val"]`)},
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
        .map((reference, i) => {
          return `${i > 0 ? "else " : ""}if (fieldName === "${reference.reference}") {
        return {
          type: "${reference.reference}",
          val: ${renderFromJson(reference, reference.reference, "fieldValue")},
        };
      }`;
        })
        .join("\n      ")}
    }
    throw new Error(\`Invalid ${name}: \${obj}\`);
  },
  toJson(obj: ${name}): Record<string, unknown> {
    ${type.options
      .map((reference, i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${reference.reference}") {
      return {
        ${reference.reference}: ${renderToJson(reference, reference.reference, "obj.val")},
      };
    }`;
      })
      .join("\n    ")}
    throw new Error(\`Invalid ${name}: \${obj}\`);
  },
  clone(obj: ${name}): ${name} {
    ${type.options
      .map((reference, i) => {
        return `${i > 0 ? "else " : ""}if (obj.type === "${reference.reference}") {
      return {
        type: "${reference.reference}",
        val: ${renderClone(reference, reference.reference, "obj.val")},
      };
    }`;
      })
      .join("\n    ")}
    throw new Error(\`Invalid ${name}: \${obj}\`);
  },
  equals(a: ${name}, b: ${name}): boolean {
    ${type.options
      .map((reference, i) => {
        return `${i > 0 ? "else " : ""}if (a.type === "${reference.reference}" && b.type === "${reference.reference}") {
      return ${renderEquals(reference, reference.reference, "a.val", "b.val")};
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
        return `${i > 0 ? "else " : ""}if (obj.type === "${reference.reference}") {
      tracker.pushUInt(${childName});
      ${renderEncode(reference, reference.reference, "obj.val")};
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
    tracker.pushBoolean(a.type === b.type);
    ${type.options
      .map((reference, i) => {
        return `${i > 0 ? "else " : ""}if (b.type === "${reference.reference}") {
      if (a.type === "${reference.reference}") {
        ${renderEncodeDiff(reference, reference.reference, "a.val", "b.val")};
      } else {
        tracker.pushUInt(${i});
        ${renderEncode(reference, reference.reference, "b.val")};
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
    ${type.options
      .map((reference, i) => {
        return `${i > 0 ? "else " : ""}if (type === ${i}) {
      return { type: "${reference.reference}", val: ${renderDecode(reference, reference.reference, "obj.val")} };
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
      ${type.options
        .map((reference, i) => {
          return `${i > 0 ? "else " : ""}if (obj.type === "${reference.reference}") {
        return {
          type: "${reference.reference}",
          val: ${renderDecodeDiff(reference, reference.reference, "obj.val")},
        };
      }`;
        })
        .join("\n      ")}
      throw new Error("Invalid union diff");
    } else {
      const type = tracker.nextUInt();
      ${type.options
        .map((reference, i) => {
          return `${i > 0 ? "else " : ""}if (type === ${i}) {
        return {
          type: "${reference.reference}",
          val: ${renderDecode(reference, reference.reference, "obj.val")},
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

  function lookup(type: ReferenceType): Type {
    const res = schema[type.reference];
    if (res != null) {
      return res;
    }
    throw new Error(`Reference ${JSON.stringify(type.reference)} not found, searched ${Object.keys(schema)}`);
  }

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
        .map((option) => `{ type: "${renderTypeArg(option, name)}"; val: ${renderTypeArg(option, name)} }`)
        .join(" | ");
    } else if (type.type === "array") {
      const elementType = renderTypeArg(type.value, name);
      // Parenthesize if element type has _dirty (array or record - objects can't be direct children)
      const needsParens = type.value.type === "array" || type.value.type === "record";
      return needsParens
        ? `(${elementType})[] & { _dirty?: Set<number> }`
        : `${elementType}[] & { _dirty?: Set<number> }`;
    } else if (type.type === "optional") {
      return `${renderTypeArg(type.value, name)} | undefined`;
    } else if (type.type === "record") {
      return `Map<${renderTypeArg(type.key, name)}, ${renderTypeArg(type.value, name)}> & { _dirty?: Set<${renderTypeArg(type.key, name)}> }`;
    } else if (type.type === "reference") {
      return type.reference;
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
      return renderDefault(lookup(type), type.reference);
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
      return renderFromJson(lookup(type), type.reference, key);
    } else if (type.type === "string") {
      return `_.parseString(${key})`;
    } else if (type.type === "int") {
      return `_.parseInt(${key})`;
    } else if (type.type === "uint") {
      return `_.parseUInt(${key})`;
    } else if (type.type === "float") {
      return `_.parseFloat(${key})`;
    } else if (type.type === "boolean") {
      return `_.parseBoolean(${key})`;
    } else if (type.type === "enum") {
      return `_.parseEnum(${key}, ${name})`;
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
      return renderToJson(lookup(type), type.reference, key);
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "uint" ||
      type.type === "float" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return `${key}`;
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
      return renderClone(lookup(type), type.reference, key);
    } else if (
      type.type === "string" ||
      type.type === "int" ||
      type.type === "uint" ||
      type.type === "float" ||
      type.type === "boolean" ||
      type.type === "enum"
    ) {
      return `${key}`;
    }
    return `${name}.clone(${key})`;
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
      return renderEquals(lookup(type), type.reference, keyA, keyB);
    } else if (type.type === "float") {
      if (type.precision) {
        return `_.equalsFloatQuantized(${keyA}, ${keyB}, ${type.precision})`;
      }
      return `_.equalsFloat(${keyA}, ${keyB})`;
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
      return renderEncode(lookup(type), type.reference, key);
    } else if (type.type === "string") {
      return `tracker.pushString(${key})`;
    } else if (type.type === "int") {
      return `tracker.pushInt(${key})`;
    } else if (type.type === "uint") {
      return `tracker.pushUInt(${key})`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `tracker.pushFloatQuantized(${key}, ${type.precision})`;
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
      return renderDecode(lookup(type), type.reference, key);
    } else if (type.type === "string") {
      return `tracker.nextString()`;
    } else if (type.type === "int") {
      return `tracker.nextInt()`;
    } else if (type.type === "uint") {
      return `tracker.nextUInt()`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `tracker.nextFloatQuantized(${type.precision})`;
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
      const valueType = renderTypeArg(type.value, name);
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
      const valueType = renderTypeArg(type.value, name);
      const encodeFn = renderEncode(type.value, name, "x");
      if (isPrimitiveType(type.value, schema)) {
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
      const keyType = renderTypeArg(type.key, name);
      const valueType = renderTypeArg(type.value, name);
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
      return renderEncodeDiff(lookup(type), type.reference, keyA, keyB);
    } else if (type.type === "string") {
      return `tracker.pushStringDiff(${keyA}, ${keyB})`;
    } else if (type.type === "int") {
      return `tracker.pushIntDiff(${keyA}, ${keyB})`;
    } else if (type.type === "uint") {
      return `tracker.pushUIntDiff(${keyA}, ${keyB})`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `tracker.pushFloatQuantizedDiff(${keyA}, ${keyB}, ${type.precision})`;
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
      const valueType = renderTypeArg(type.value, name);
      const decodeFn = renderDecode(type.value, name, "x");
      const decodeDiffFn = renderDecodeDiff(type.value, name, "x");
      return `tracker.nextArrayDiff<${valueType}>(
        ${key},
        () => ${decodeFn},
        (x) => ${decodeDiffFn}
      )`;
    } else if (type.type === "optional") {
      const valueType = renderTypeArg(type.value, name);
      const decodeFn = renderDecode(type.value, name, "x");
      if (isPrimitiveType(type.value, schema)) {
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
      const keyType = renderTypeArg(type.key, name);
      const valueType = renderTypeArg(type.value, name);
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
      return renderDecodeDiff(lookup(type), type.reference, key);
    } else if (type.type === "string") {
      return `tracker.nextStringDiff(${key})`;
    } else if (type.type === "int") {
      return `tracker.nextIntDiff(${key})`;
    } else if (type.type === "uint") {
      return `tracker.nextUIntDiff(${key})`;
    } else if (type.type === "float") {
      if (type.precision) {
        return `tracker.nextFloatQuantizedDiff(${key}, ${type.precision})`;
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
