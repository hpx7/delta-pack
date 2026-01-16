import * as _ from "@hpx7/delta-pack/runtime";

export type Primitives = {
  stringField: string;
  signedIntField: number;
  unsignedIntField: number;
  floatField: number;
  booleanField: boolean;
} & { _dirty?: Set<keyof Primitives> };


export const Primitives = {
  default(): Primitives {
    return {
      stringField: "",
      signedIntField: 0,
      unsignedIntField: 0,
      floatField: 0.0,
      booleanField: false,
    };
  },
  fromJson(obj: object): Primitives {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Primitives: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      stringField: _.tryParseField(() => _.parseString(o["stringField"]), "Primitives.stringField"),
      signedIntField: _.tryParseField(() => _.parseInt(o["signedIntField"]), "Primitives.signedIntField"),
      unsignedIntField: _.tryParseField(() => _.parseInt(o["unsignedIntField"], 0), "Primitives.unsignedIntField"),
      floatField: _.tryParseField(() => _.parseFloat(o["floatField"]), "Primitives.floatField"),
      booleanField: _.tryParseField(() => _.parseBoolean(o["booleanField"]), "Primitives.booleanField"),
    };
  },
  toJson(obj: Primitives): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["stringField"] = obj.stringField;
    result["signedIntField"] = obj.signedIntField;
    result["unsignedIntField"] = obj.unsignedIntField;
    result["floatField"] = obj.floatField;
    result["booleanField"] = obj.booleanField;
    return result;
  },
  clone(obj: Primitives): Primitives {
    return {
      stringField: obj.stringField,
      signedIntField: obj.signedIntField,
      unsignedIntField: obj.unsignedIntField,
      floatField: obj.floatField,
      booleanField: obj.booleanField,
    };
  },
  equals(a: Primitives, b: Primitives): boolean {
    return (
      a.stringField === b.stringField &&
      a.signedIntField === b.signedIntField &&
      a.unsignedIntField === b.unsignedIntField &&
      _.equalsFloat(a.floatField, b.floatField) &&
      a.booleanField === b.booleanField
    );
  },
  encode(obj: Primitives): Uint8Array {
    const encoder = _.Encoder.create();
    Primitives._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Primitives, encoder: _.Encoder): void {
    encoder.pushString(obj.stringField);
    encoder.pushInt(obj.signedIntField);
    encoder.pushBoundedInt(obj.unsignedIntField, 0);
    encoder.pushFloat(obj.floatField);
    encoder.pushBoolean(obj.booleanField);
  },
  encodeDiff(a: Primitives, b: Primitives): Uint8Array {
    const encoder = _.Encoder.create();
    Primitives._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Primitives, b: Primitives, encoder: _.Encoder): void {
    const dirty = b._dirty;
    const changed = dirty == null ? !Primitives.equals(a, b) : dirty.size > 0;
    encoder.pushBoolean(changed);
    if (changed) {
      Primitives._encodeDiffFields(a, b, encoder);
    }
  },
  _encodeDiffFields(a: Primitives, b: Primitives, encoder: _.Encoder): void {
    const dirty = b._dirty;
    encoder.pushFieldDiff(
      a.stringField,
      b.stringField,
      dirty?.has("stringField") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a.signedIntField,
      b.signedIntField,
      dirty?.has("signedIntField") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
    encoder.pushFieldDiff(
      a.unsignedIntField,
      b.unsignedIntField,
      dirty?.has("unsignedIntField") ?? true,
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a.floatField,
      b.floatField,
      dirty?.has("floatField") ?? true,
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiffValue(
      dirty?.has("booleanField") ?? true,
      () => encoder.pushBooleanDiff(a.booleanField, b.booleanField),
    );
  },
  decode(input: Uint8Array): Primitives {
    return Primitives._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Primitives {
    return {
      stringField: decoder.nextString(),
      signedIntField: decoder.nextInt(),
      unsignedIntField: decoder.nextBoundedInt(0),
      floatField: decoder.nextFloat(),
      booleanField: decoder.nextBoolean(),
    };
  },
  decodeDiff(obj: Primitives, input: Uint8Array): Primitives {
    return Primitives._decodeDiff(obj, _.Decoder.create(input));
  },
  _decodeDiff(obj: Primitives, decoder: _.Decoder): Primitives {
    return decoder.nextBoolean() ? Primitives._decodeDiffFields(obj, decoder) : obj;
  },
  _decodeDiffFields(obj: Primitives, decoder: _.Decoder): Primitives {
    return {
      stringField: decoder.nextFieldDiff(obj.stringField, (x) => decoder.nextStringDiff(x)),
      signedIntField: decoder.nextFieldDiff(obj.signedIntField, (x) => decoder.nextIntDiff(x)),
      unsignedIntField: decoder.nextFieldDiff(obj.unsignedIntField, (x) => decoder.nextBoundedIntDiff(x, 0)),
      floatField: decoder.nextFieldDiff(obj.floatField, (x) => decoder.nextFloatDiff(x)),
      booleanField: decoder.nextBooleanDiff(obj.booleanField),
    };
  },
};
