import * as _ from "@hathora/delta-pack/helpers";
import { Type } from "./generator";

type DeltaPackApi<T> = {
  parse: (obj: T) => T;
  encode: (obj: T) => Uint8Array;
  decode: (buf: Uint8Array) => T;
};

export function load<T>(schema: Record<string, Type>, objectName: string): DeltaPackApi<T> {
  const typeVal = schema[objectName];
  if (typeVal?.type !== "object") {
    throw new Error(`Type ${objectName} is not an object type`);
  }

  function _parse(objVal: unknown, objType: Type): unknown {
    if (objType.type === "string") {
      return _.parseString(objVal);
    } else if (objType.type === "int") {
      return _.parseInt(objVal);
    } else if (objType.type === "uint") {
      return _.parseUInt(objVal);
    } else if (objType.type === "float") {
      return _.parseFloat(objVal);
    } else if (objType.type === "boolean") {
      return _.parseBoolean(objVal);
    } else if (objType.type === "enum") {
      const enumObj = Object.fromEntries(objType.options.map((opt, i) => [opt, i]));
      return _.parseEnum(objVal, enumObj);
    } else if (objType.type === "reference") {
      const refType = schema[objType.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${objType.reference}`);
      }
      return _parse(objVal, refType);
    } else if (objType.type === "object") {
      return _.mapValues(objType.properties, (typeVal, key) => {
        const fieldVal = (objVal as any)[key];
        return _.tryParseField(() => _parse(fieldVal, typeVal), key);
      });
    } else if (objType.type === "array") {
      return _.parseArray(objVal, (elem) => _parse(elem, objType.value));
    } else if (objType.type === "record") {
      return _.parseRecord(objVal, (key) => _parse(key, objType.key), (val) => _parse(val, objType.value));
    } else if (objType.type === "union") {
      const unionType = (objVal as { type: string })?.type;
      if (typeof unionType !== "string") {
        throw new Error(`Invalid union type object: ${JSON.stringify(objVal)}`);
      }
      const optionType = objType.options.find((opt) => opt.reference === unionType);
      if (!optionType) {
        throw new Error(`Unknown union type option: ${unionType}`);
      }
      const refType = schema[optionType.reference];
      return {
        type: unionType,
        val: _parse((objVal as any).val, refType),
      };
    } else if (objType.type === "optional") {
      return _.parseOptional(objVal, (val) => _parse(val, objType.value));
    }
  }

  function _encode(objVal: unknown, objType: Type, tracker: _.Tracker): void {
    if (objType.type === "string") {
      tracker.pushString(objVal as string);
    } else if (objType.type === "int") {
      tracker.pushInt(objVal as number);
    } else if (objType.type === "uint") {
      tracker.pushUInt(objVal as number);
    } else if (objType.type === "float") {
      tracker.pushFloat(objVal as number);
    } else if (objType.type === "boolean") {
      tracker.pushBoolean(objVal as boolean);
    } else if (objType.type === "enum") {
      const enumObj = Object.fromEntries(objType.options.map((opt, i) => [opt, i]));
      tracker.pushUInt(enumObj[objVal as string]);
    } else if (objType.type === "reference") {
      const refType = schema[objType.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${objType.reference}`);
      }
      _encode(objVal, refType, tracker);
    } else if (objType.type === "object") {
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        const fieldVal = (objVal as any)[key];
        _encode(fieldVal, typeVal, tracker);
      }
    } else if (objType.type === "array") {
      const arr = objVal as unknown[];
      tracker.pushArray(
        arr,
        (elem) => _encode(elem, objType.value, tracker)
      );
    } else if (objType.type === "record") {
      const map = objVal as Map<unknown, unknown>;
      tracker.pushRecord(
        map,
        (key) => _encode(key, objType.key, tracker),
        (val) => _encode(val, objType.value, tracker)
      );
    } else if (objType.type === "union") {
      const unionObj = objVal as { type: string; val: unknown };
      const variantIndex = objType.options.findIndex((opt) => opt.reference === unionObj.type);
      if (variantIndex === -1) {
        throw new Error(`Unknown union variant: ${unionObj.type}`);
      }
      tracker.pushUInt(variantIndex);
      const refType = schema[unionObj.type];
      _encode(unionObj.val, refType, tracker);
    } else if (objType.type === "optional") {
      tracker.pushOptional(
        objVal,
        (val) => _encode(val, objType.value, tracker)
      );
    }
  }

  function _decode(objType: Type, tracker: _.Tracker): unknown {
    if (objType.type === "string") {
      return tracker.nextString();
    } else if (objType.type === "int") {
      return tracker.nextInt();
    } else if (objType.type === "uint") {
      return tracker.nextUInt();
    } else if (objType.type === "float") {
      return tracker.nextFloat();
    } else if (objType.type === "boolean") {
      return tracker.nextBoolean();
    } else if (objType.type === "enum") {
      const idx = tracker.nextUInt();
      return objType.options[idx];
    } else if (objType.type === "reference") {
      const refType = schema[objType.reference];
      if (!refType) {
        throw new Error(`Unknown reference type: ${objType.reference}`);
      }
      return _decode(refType, tracker);
    } else if (objType.type === "object") {
      const result: any = {};
      for (const [key, typeVal] of Object.entries(objType.properties)) {
        result[key] = _decode(typeVal, tracker);
      }
      return result;
    } else if (objType.type === "array") {
      const length = tracker.nextUInt();
      const arr: unknown[] = [];
      for (let i = 0; i < length; i++) {
        arr.push(_decode(objType.value, tracker));
      }
      return arr;
    } else if (objType.type === "record") {
      const size = tracker.nextUInt();
      const map = new Map();
      for (let i = 0; i < size; i++) {
        const key = _decode(objType.key, tracker);
        const val = _decode(objType.value, tracker);
        map.set(key, val);
      }
      return map;
    } else if (objType.type === "union") {
      const variantIndex = tracker.nextUInt();
      const variant = objType.options[variantIndex];
      if (!variant) {
        throw new Error(`Invalid union variant index: ${variantIndex}`);
      }
      const refType = schema[variant.reference];
      return {
        type: variant.reference,
        val: _decode(refType, tracker),
      };
    } else if (objType.type === "optional") {
      const hasValue = tracker.nextBoolean();
      if (!hasValue) {
        return undefined;
      }
      return _decode(objType.value, tracker);
    }
  }

  return {
    parse: (obj: T) => _parse(obj, typeVal) as T,
    encode: (obj: T) => {
      const tracker = new _.Tracker();
      _encode(obj, typeVal, tracker);
      return tracker.toBuffer();
    },
    decode: (buf: Uint8Array) => {
      const tracker = _.Tracker.parse(buf);
      return _decode(typeVal, tracker) as T;
    },
  };
}

