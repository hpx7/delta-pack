import * as _ from "@hpx7/delta-pack/runtime";

export type Primitives = {
  stringField: string;
  signedIntField: number;
  unsignedIntField: number;
  floatField: number;
  booleanField: boolean;
};


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
    const result = Primitives._clone(obj);
    _.registerSnapshot(result, obj);
    return result;
  },
  _clone(obj: Primitives): Primitives {
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
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Primitives.equals, () => Primitives._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Primitives, b: Primitives, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "stringField",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "signedIntField",
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "unsignedIntField",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "floatField",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushBooleanDiff(a["booleanField"], b["booleanField"]);
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
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Primitives._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Primitives, decoder: _.DiffDecoder): Primitives {
    return {
      stringField: decoder.nextFieldDiff(
        obj.stringField,
        (x) => decoder.nextStringDiff(x),
      ),
      signedIntField: decoder.nextFieldDiff(
        obj.signedIntField,
        (x) => decoder.nextIntDiff(x),
      ),
      unsignedIntField: decoder.nextFieldDiff(
        obj.unsignedIntField,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      floatField: decoder.nextFieldDiff(
        obj.floatField,
        (x) => decoder.nextFloatDiff(x),
      ),
      booleanField: decoder.nextBooleanDiff(obj.booleanField),
    };
  },
};
