import * as _ from "@hpx7/delta-pack/runtime";

export type Primitives = {
  stringField: string;
  signedIntField: number;
  unsignedIntField: number;
  boundedIntField: number;
  floatField: number;
  booleanField: boolean;
};


export const Primitives = {
  default(): Primitives {
    return {
      stringField: "",
      signedIntField: 0,
      unsignedIntField: 0,
      boundedIntField: 0,
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
      boundedIntField: _.tryParseField(() => _.parseInt(o["boundedIntField"], -10, 10), "Primitives.boundedIntField"),
      floatField: _.tryParseField(() => _.parseFloat(o["floatField"]), "Primitives.floatField"),
      booleanField: _.tryParseField(() => _.parseBoolean(o["booleanField"]), "Primitives.booleanField"),
    };
  },
  toJson(obj: Primitives): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["stringField"] = obj.stringField;
    result["signedIntField"] = obj.signedIntField;
    result["unsignedIntField"] = obj.unsignedIntField;
    result["boundedIntField"] = obj.boundedIntField;
    result["floatField"] = obj.floatField;
    result["booleanField"] = obj.booleanField;
    return result;
  },
  clone(obj: Primitives): Primitives {
    return {
      stringField: obj.stringField,
      signedIntField: obj.signedIntField,
      unsignedIntField: obj.unsignedIntField,
      boundedIntField: obj.boundedIntField,
      floatField: obj.floatField,
      booleanField: obj.booleanField,
    };
  },
  equals(a: Primitives, b: Primitives): boolean {
    return (
      a.stringField === b.stringField &&
      a.signedIntField === b.signedIntField &&
      a.unsignedIntField === b.unsignedIntField &&
      a.boundedIntField === b.boundedIntField &&
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
    encoder.pushBitPackedInt(obj.boundedIntField, -10, 10, 5);
    encoder.pushFloat(obj.floatField);
    encoder.pushBoolean(obj.booleanField);
  },
  encodeDiff(a: Primitives, b: Primitives): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.minVersion = _.getSnapshotVersion(a) ?? -1;
    encoder.pushObjectDiff(a, b, Primitives.equals, Primitives._encodeDiff);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Primitives, b: Primitives, encoder: _.DiffEncoder): void {
    const versions = _.getFieldVersions(b);
    const bRaw = _.getUnderlying(b);
    encoder.pushFieldString(versions, "stringField", a.stringField, bRaw.stringField);
    encoder.pushFieldInt(versions, "signedIntField", a.signedIntField, bRaw.signedIntField);
    encoder.pushFieldBoundedInt(versions, "unsignedIntField", a.unsignedIntField, bRaw.unsignedIntField, 0);
    encoder.pushFieldBitPackedInt(versions, "boundedIntField", a.boundedIntField, bRaw.boundedIntField, -10, 10, 5);
    encoder.pushFieldFloat(versions, "floatField", a.floatField, bRaw.floatField);
    encoder.pushBooleanDiff(a.booleanField, bRaw.booleanField);
  },
  decode(input: Uint8Array): Primitives {
    return Primitives._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Primitives {
    return {
      stringField: decoder.nextString(),
      signedIntField: decoder.nextInt(),
      unsignedIntField: decoder.nextBoundedInt(0),
      boundedIntField: (decoder.nextEnum(5) + -10),
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
      boundedIntField: decoder.nextFieldDiff(
        obj.boundedIntField,
        (x) => (decoder.nextEnumDiff((x - -10), 5) + -10),
      ),
      floatField: decoder.nextFieldDiff(
        obj.floatField,
        (x) => decoder.nextFloatDiff(x),
      ),
      booleanField: decoder.nextBooleanDiff(obj.booleanField),
    };
  },
  createSyncSession(): _.SyncSession<Primitives> {
    return new _.SyncSession(Primitives);
  },
};
