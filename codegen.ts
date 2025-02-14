import type { ChildType, Type } from "./generator";

export function renderDoc(doc: Record<string, Type>) {
  return `import { Writer as _Writer, Reader as _Reader } from "bin-serde";

const _NO_DIFF = Symbol("NODIFF");
type _DeepPartial<T> = T extends string | number | boolean | undefined
  ? T
  : T extends Array<infer ArrayType>
  ? Array<_DeepPartial<ArrayType> | typeof _NO_DIFF> | typeof _NO_DIFF
  : T extends { type: string; val: any }
  ? { type: T["type"]; val: _DeepPartial<T["val"] | typeof _NO_DIFF> }
  : { [K in keyof T]: _DeepPartial<T[K]> | typeof _NO_DIFF };

export class _Tracker {
  constructor(private bits: boolean[] = [], private idx = 0) {}
  push(val: boolean) {
    this.bits.push(val);
  }
  next() {
    return this.bits[this.idx++];
  }
}

function validatePrimitive(isValid: boolean, errorMessage: string) {
  return isValid ? [] : [errorMessage];
}
function validateOptional<T>(val: T | undefined, innerValidate: (x: T) => string[]) {
  if (val !== undefined) {
    return innerValidate(val);
  }
  return [];
}
function validateArray<T>(arr: T[], innerValidate: (x: T) => string[]) {
  if (!Array.isArray(arr)) {
    return ["Invalid array: " + arr];
  }
  for (let i = 0; i < arr.length; i++) {
    const validationErrors = innerValidate(arr[i]);
    if (validationErrors.length > 0) {
      return validationErrors.concat("Invalid array item at index " + i);
    }
  }
  return [];
}

function writeUInt8(buf: _Writer, x: number) {
  buf.writeUInt8(x);
}
function writeBoolean(buf: _Writer, x: boolean) {
  buf.writeUInt8(x ? 1 : 0);
}
function writeInt(buf: _Writer, x: number) {
  buf.writeVarint(x);
}
function writeFloat(buf: _Writer, x: number) {
  buf.writeFloat(x);
}
function writeString(buf: _Writer, x: string) {
  buf.writeString(x);
}
function writeOptional<T>(buf: _Writer, x: T | undefined, innerWrite: (x: T) => void) {
  writeBoolean(buf, x !== undefined);
  if (x !== undefined) {
    innerWrite(x);
  }
}
function writeArray<T>(buf: _Writer, x: T[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  for (const val of x) {
    innerWrite(val);
  }
}
function writeArrayDiff<T>(buf: _Writer, tracker: _Tracker, x: (T | typeof _NO_DIFF)[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  x.forEach((val) => {
    tracker.push(val !== _NO_DIFF);
    if (val !== _NO_DIFF) {
      innerWrite(val);
    }
  });
}

function parseUInt8(buf: _Reader): number {
  return buf.readUInt8();
}
function parseBoolean(buf: _Reader): boolean {
  return buf.readUInt8() > 0;
}
function parseInt(buf: _Reader): number {
  return buf.readVarint();
}
function parseFloat(buf: _Reader): number {
  return buf.readFloat();
}
function parseString(buf: _Reader): string {
  return buf.readString();
}
function parseOptional<T>(buf: _Reader, innerParse: (buf: _Reader) => T): T | undefined {
  return parseBoolean(buf) ? innerParse(buf) : undefined;
}
function parseArray<T>(buf: _Reader, innerParse: () => T): T[] {
  const len = buf.readUVarint();
  const arr: T[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(innerParse());
  }
  return arr;
}
function parseArrayDiff<T>(buf: _Reader, tracker: _Tracker, innerParse: () => T): (T | typeof _NO_DIFF)[] {
  const len = buf.readUVarint();
  const arr: (T | typeof _NO_DIFF)[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(tracker.next() ? innerParse() : _NO_DIFF);
  }
  return arr;
}

function diffPrimitive<T>(a: T, b: T) {
  return a === b ? _NO_DIFF : a;
}
function diffOptional<T>(
  a: T | undefined,
  b: T | undefined,
  innerDiff: (x: T, y: T) => _DeepPartial<T> | typeof _NO_DIFF
) {
  if (a !== undefined && b !== undefined) {
    return innerDiff(a, b);
  } else if (a !== undefined || b !== undefined) {
    return a;
  }
  return _NO_DIFF;
}
function diffArray<T>(a: T[], b: T[], innerDiff: (x: T, y: T) => _DeepPartial<T> | typeof _NO_DIFF) {
  const arr = a.map((val, i) => (i < b.length ? innerDiff(val, b[i]) : val));
  return a.length === b.length && arr.every((v) => v === _NO_DIFF) ? _NO_DIFF : arr;
}
function diffObj<T extends object>(obj: T) {
  return Object.values(obj).every((v) => v === _NO_DIFF) ? _NO_DIFF : obj;
}

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
}
