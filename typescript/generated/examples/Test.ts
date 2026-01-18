import * as _ from "@hpx7/delta-pack/runtime";

export type Enum = "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";

export type InnerInner = {
  long: number;
  enum: Enum;
  sint32: number;
};

export type Outer = {
  bool: boolean[];
  double: number;
};

export type Inner = {
  int32: number;
  innerInner: InnerInner;
  outer: Outer;
};

export type Test = {
  string: string;
  uint32: number;
  inner: Inner;
  float: number;
};


const Enum = {
  0: "ONE",
  1: "TWO",
  2: "THREE",
  3: "FOUR",
  4: "FIVE",
  ONE: 0,
  TWO: 1,
  THREE: 2,
  FOUR: 3,
  FIVE: 4,
};

export const InnerInner = {
  default(): InnerInner {
    return {
      long: 0,
      enum: "ONE",
      sint32: 0,
    };
  },
  fromJson(obj: object): InnerInner {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid InnerInner: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      long: _.tryParseField(() => _.parseInt(o["long"]), "InnerInner.long"),
      enum: _.tryParseField(() => _.parseEnum(o["enum"], Enum), "InnerInner.enum"),
      sint32: _.tryParseField(() => _.parseInt(o["sint32"]), "InnerInner.sint32"),
    };
  },
  toJson(obj: InnerInner): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["long"] = obj.long;
    result["enum"] = obj.enum;
    result["sint32"] = obj.sint32;
    return result;
  },
  clone(obj: InnerInner): InnerInner {
    return {
      long: obj.long,
      enum: obj.enum,
      sint32: obj.sint32,
    };
  },
  equals(a: InnerInner, b: InnerInner): boolean {
    return (
      a.long === b.long &&
      a.enum === b.enum &&
      a.sint32 === b.sint32
    );
  },
  encode(obj: InnerInner): Uint8Array {
    const encoder = _.Encoder.create();
    InnerInner._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: InnerInner, encoder: _.Encoder): void {
    encoder.pushInt(obj.long);
    encoder.pushEnum(Enum[obj.enum], 3);
    encoder.pushInt(obj.sint32);
  },
  encodeDiff(a: InnerInner, b: InnerInner): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, InnerInner.equals, () => InnerInner._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: InnerInner, b: InnerInner, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "long",
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "enum",
      (x, y) => x === y,
      (x, y) => encoder.pushEnumDiff(Enum[x], Enum[y], 3),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "sint32",
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
  },
  decode(input: Uint8Array): InnerInner {
    return InnerInner._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): InnerInner {
    return {
      long: decoder.nextInt(),
      enum: (Enum as any)[decoder.nextEnum(3)],
      sint32: decoder.nextInt(),
    };
  },
  decodeDiff(obj: InnerInner, input: Uint8Array): InnerInner {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => InnerInner._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: InnerInner, decoder: _.DiffDecoder): InnerInner {
    return {
      long: decoder.nextFieldDiff(
        obj.long,
        (x) => decoder.nextIntDiff(x),
      ),
      enum: decoder.nextFieldDiff(
        obj.enum,
        (x) => (Enum as any)[decoder.nextEnumDiff((Enum as any)[x], 3)],
      ),
      sint32: decoder.nextFieldDiff(
        obj.sint32,
        (x) => decoder.nextIntDiff(x),
      ),
    };
  },
};

export const Outer = {
  default(): Outer {
    return {
      bool: [],
      double: 0.0,
    };
  },
  fromJson(obj: object): Outer {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Outer: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      bool: _.tryParseField(() => _.parseArray(o["bool"], (x) => _.parseBoolean(x)), "Outer.bool"),
      double: _.tryParseField(() => _.parseFloat(o["double"]), "Outer.double"),
    };
  },
  toJson(obj: Outer): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["bool"] = obj.bool.map((x) => x);
    result["double"] = obj.double;
    return result;
  },
  clone(obj: Outer): Outer {
    return {
      bool: obj.bool.map((x) => x),
      double: obj.double,
    };
  },
  equals(a: Outer, b: Outer): boolean {
    return (
      _.equalsArray(a.bool, b.bool, (x, y) => x === y) &&
      _.equalsFloat(a.double, b.double)
    );
  },
  encode(obj: Outer): Uint8Array {
    const encoder = _.Encoder.create();
    Outer._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Outer, encoder: _.Encoder): void {
    encoder.pushArray(obj.bool, (x) => encoder.pushBoolean(x));
    encoder.pushFloat(obj.double);
  },
  encodeDiff(a: Outer, b: Outer): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Outer.equals, () => Outer._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Outer, b: Outer, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "bool",
      (x, y) => _.equalsArray(x, y, (x, y) => x === y),
      (x, y) => encoder.pushArrayDiff<boolean>(x, y, (x, y) => x === y, (x) => encoder.pushBoolean(x), (_x, _y) => undefined),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "double",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
  },
  decode(input: Uint8Array): Outer {
    return Outer._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Outer {
    return {
      bool: decoder.nextArray(() => decoder.nextBoolean()),
      double: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: Outer, input: Uint8Array): Outer {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Outer._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Outer, decoder: _.DiffDecoder): Outer {
    return {
      bool: decoder.nextFieldDiff(
        obj.bool,
        (x) => decoder.nextArrayDiff<boolean>(x, () => decoder.nextBoolean(), (x) => !x),
      ),
      double: decoder.nextFieldDiff(
        obj.double,
        (x) => decoder.nextFloatDiff(x),
      ),
    };
  },
};

export const Inner = {
  default(): Inner {
    return {
      int32: 0,
      innerInner: InnerInner.default(),
      outer: Outer.default(),
    };
  },
  fromJson(obj: object): Inner {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Inner: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      int32: _.tryParseField(() => _.parseInt(o["int32"]), "Inner.int32"),
      innerInner: _.tryParseField(() => InnerInner.fromJson(o["innerInner"] as InnerInner), "Inner.innerInner"),
      outer: _.tryParseField(() => Outer.fromJson(o["outer"] as Outer), "Inner.outer"),
    };
  },
  toJson(obj: Inner): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["int32"] = obj.int32;
    result["innerInner"] = InnerInner.toJson(obj.innerInner);
    result["outer"] = Outer.toJson(obj.outer);
    return result;
  },
  clone(obj: Inner): Inner {
    return {
      int32: obj.int32,
      innerInner: InnerInner.clone(obj.innerInner),
      outer: Outer.clone(obj.outer),
    };
  },
  equals(a: Inner, b: Inner): boolean {
    return (
      a.int32 === b.int32 &&
      InnerInner.equals(a.innerInner, b.innerInner) &&
      Outer.equals(a.outer, b.outer)
    );
  },
  encode(obj: Inner): Uint8Array {
    const encoder = _.Encoder.create();
    Inner._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Inner, encoder: _.Encoder): void {
    encoder.pushInt(obj.int32);
    InnerInner._encode(obj.innerInner, encoder);
    Outer._encode(obj.outer, encoder);
  },
  encodeDiff(a: Inner, b: Inner): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Inner.equals, () => Inner._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Inner, b: Inner, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "int32",
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "innerInner",
      (x, y) => InnerInner.equals(x, y),
      (x, y) => InnerInner._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "outer",
      (x, y) => Outer.equals(x, y),
      (x, y) => Outer._encodeDiff(x, y, encoder),
    );
  },
  decode(input: Uint8Array): Inner {
    return Inner._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Inner {
    return {
      int32: decoder.nextInt(),
      innerInner: InnerInner._decode(decoder),
      outer: Outer._decode(decoder),
    };
  },
  decodeDiff(obj: Inner, input: Uint8Array): Inner {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Inner._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Inner, decoder: _.DiffDecoder): Inner {
    return {
      int32: decoder.nextFieldDiff(
        obj.int32,
        (x) => decoder.nextIntDiff(x),
      ),
      innerInner: decoder.nextFieldDiff(
        obj.innerInner,
        (x) => InnerInner._decodeDiff(x, decoder),
      ),
      outer: decoder.nextFieldDiff(
        obj.outer,
        (x) => Outer._decodeDiff(x, decoder),
      ),
    };
  },
};

export const Test = {
  default(): Test {
    return {
      string: "",
      uint32: 0,
      inner: Inner.default(),
      float: 0.0,
    };
  },
  fromJson(obj: object): Test {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Test: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      string: _.tryParseField(() => _.parseString(o["string"]), "Test.string"),
      uint32: _.tryParseField(() => _.parseInt(o["uint32"]), "Test.uint32"),
      inner: _.tryParseField(() => Inner.fromJson(o["inner"] as Inner), "Test.inner"),
      float: _.tryParseField(() => _.parseFloat(o["float"]), "Test.float"),
    };
  },
  toJson(obj: Test): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["string"] = obj.string;
    result["uint32"] = obj.uint32;
    result["inner"] = Inner.toJson(obj.inner);
    result["float"] = obj.float;
    return result;
  },
  clone(obj: Test): Test {
    return {
      string: obj.string,
      uint32: obj.uint32,
      inner: Inner.clone(obj.inner),
      float: obj.float,
    };
  },
  equals(a: Test, b: Test): boolean {
    return (
      a.string === b.string &&
      a.uint32 === b.uint32 &&
      Inner.equals(a.inner, b.inner) &&
      _.equalsFloat(a.float, b.float)
    );
  },
  encode(obj: Test): Uint8Array {
    const encoder = _.Encoder.create();
    Test._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Test, encoder: _.Encoder): void {
    encoder.pushString(obj.string);
    encoder.pushInt(obj.uint32);
    Inner._encode(obj.inner, encoder);
    encoder.pushFloat(obj.float);
  },
  encodeDiff(a: Test, b: Test): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Test.equals, () => Test._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Test, b: Test, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "string",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "uint32",
      (x, y) => x === y,
      (x, y) => encoder.pushIntDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "inner",
      (x, y) => Inner.equals(x, y),
      (x, y) => Inner._encodeDiff(x, y, encoder),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "float",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
  },
  decode(input: Uint8Array): Test {
    return Test._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Test {
    return {
      string: decoder.nextString(),
      uint32: decoder.nextInt(),
      inner: Inner._decode(decoder),
      float: decoder.nextFloat(),
    };
  },
  decodeDiff(obj: Test, input: Uint8Array): Test {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Test._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Test, decoder: _.DiffDecoder): Test {
    return {
      string: decoder.nextFieldDiff(
        obj.string,
        (x) => decoder.nextStringDiff(x),
      ),
      uint32: decoder.nextFieldDiff(
        obj.uint32,
        (x) => decoder.nextIntDiff(x),
      ),
      inner: decoder.nextFieldDiff(
        obj.inner,
        (x) => Inner._decodeDiff(x, decoder),
      ),
      float: decoder.nextFieldDiff(
        obj.float,
        (x) => decoder.nextFloatDiff(x),
      ),
    };
  },
};
