import * as _ from "@hpx7/delta-pack/runtime";

export type HairColor = "BLACK" | "BROWN" | "BLOND" | "RED" | "WHITE" | "OTHER";

export type Address = {
  street: string;
  zip: string;
  state: string;
};

export type EmailContact = {
  email: string;
};

export type PhoneContact = {
  phone: string;
  extension?: number | undefined;
};

export type Contact = { _type: "EmailContact" } & EmailContact | { _type: "PhoneContact" } & PhoneContact;

export type User = {
  id: string;
  name: string;
  age: number;
  weight: number;
  married: boolean;
  hairColor: HairColor;
  address?: Address | undefined;
  children: User[];
  metadata: Map<string, string>;
  preferredContact?: Contact | undefined;
};


const HairColor = {
  0: "BLACK",
  1: "BROWN",
  2: "BLOND",
  3: "RED",
  4: "WHITE",
  5: "OTHER",
  BLACK: 0,
  BROWN: 1,
  BLOND: 2,
  RED: 3,
  WHITE: 4,
  OTHER: 5,
};

export const Address = {
  default(): Address {
    return {
      street: "",
      zip: "",
      state: "",
    };
  },
  fromJson(obj: object): Address {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid Address: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      street: _.tryParseField(() => _.parseString(o["street"]), "Address.street"),
      zip: _.tryParseField(() => _.parseString(o["zip"]), "Address.zip"),
      state: _.tryParseField(() => _.parseString(o["state"]), "Address.state"),
    };
  },
  toJson(obj: Address): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["street"] = obj.street;
    result["zip"] = obj.zip;
    result["state"] = obj.state;
    return result;
  },
  clone(obj: Address): Address {
    return {
      street: obj.street,
      zip: obj.zip,
      state: obj.state,
    };
  },
  equals(a: Address, b: Address): boolean {
    return (
      a.street === b.street &&
      a.zip === b.zip &&
      a.state === b.state
    );
  },
  encode(obj: Address): Uint8Array {
    const encoder = _.Encoder.create();
    Address._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Address, encoder: _.Encoder): void {
    encoder.pushString(obj.street);
    encoder.pushString(obj.zip);
    encoder.pushString(obj.state);
  },
  encodeDiff(a: Address, b: Address): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, Address.equals, () => Address._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: Address, b: Address, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "street",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "zip",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "state",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
  },
  decode(input: Uint8Array): Address {
    return Address._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Address {
    return {
      street: decoder.nextString(),
      zip: decoder.nextString(),
      state: decoder.nextString(),
    };
  },
  decodeDiff(obj: Address, input: Uint8Array): Address {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => Address._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: Address, decoder: _.DiffDecoder): Address {
    return {
      street: decoder.nextFieldDiff(
        obj.street,
        (x) => decoder.nextStringDiff(x),
      ),
      zip: decoder.nextFieldDiff(
        obj.zip,
        (x) => decoder.nextStringDiff(x),
      ),
      state: decoder.nextFieldDiff(
        obj.state,
        (x) => decoder.nextStringDiff(x),
      ),
    };
  },
};

export const EmailContact = {
  default(): EmailContact {
    return {
      email: "",
    };
  },
  fromJson(obj: object): EmailContact {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid EmailContact: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      email: _.tryParseField(() => _.parseString(o["email"]), "EmailContact.email"),
    };
  },
  toJson(obj: EmailContact): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["email"] = obj.email;
    return result;
  },
  clone(obj: EmailContact): EmailContact {
    return {
      email: obj.email,
    };
  },
  equals(a: EmailContact, b: EmailContact): boolean {
    return (
      a.email === b.email
    );
  },
  encode(obj: EmailContact): Uint8Array {
    const encoder = _.Encoder.create();
    EmailContact._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: EmailContact, encoder: _.Encoder): void {
    encoder.pushString(obj.email);
  },
  encodeDiff(a: EmailContact, b: EmailContact): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, EmailContact.equals, () => EmailContact._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: EmailContact, b: EmailContact, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "email",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
  },
  decode(input: Uint8Array): EmailContact {
    return EmailContact._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): EmailContact {
    return {
      email: decoder.nextString(),
    };
  },
  decodeDiff(obj: EmailContact, input: Uint8Array): EmailContact {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => EmailContact._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: EmailContact, decoder: _.DiffDecoder): EmailContact {
    return {
      email: decoder.nextFieldDiff(
        obj.email,
        (x) => decoder.nextStringDiff(x),
      ),
    };
  },
};

export const PhoneContact = {
  default(): PhoneContact {
    return {
      phone: "",
      extension: undefined,
    };
  },
  fromJson(obj: object): PhoneContact {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid PhoneContact: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      phone: _.tryParseField(() => _.parseString(o["phone"]), "PhoneContact.phone"),
      extension: _.tryParseField(() => _.parseOptional(o["extension"], (x) => _.parseInt(x, 0)), "PhoneContact.extension"),
    };
  },
  toJson(obj: PhoneContact): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["phone"] = obj.phone;
    if (obj.extension != null) {
      result["extension"] = obj.extension;
    }
    return result;
  },
  clone(obj: PhoneContact): PhoneContact {
    return {
      phone: obj.phone,
      extension: obj.extension != null ? obj.extension : undefined,
    };
  },
  equals(a: PhoneContact, b: PhoneContact): boolean {
    return (
      a.phone === b.phone &&
      _.equalsOptional(a.extension, b.extension, (x, y) => x === y)
    );
  },
  encode(obj: PhoneContact): Uint8Array {
    const encoder = _.Encoder.create();
    PhoneContact._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: PhoneContact, encoder: _.Encoder): void {
    encoder.pushString(obj.phone);
    encoder.pushOptional(obj.extension, (x) => encoder.pushBoundedInt(x, 0));
  },
  encodeDiff(a: PhoneContact, b: PhoneContact): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, PhoneContact.equals, () => PhoneContact._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: PhoneContact, b: PhoneContact, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "phone",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "extension",
      (x, y) => _.equalsOptional(x, y, (x, y) => x === y),
      (x, y) => encoder.pushOptionalDiff<number>(x, y, (x) => encoder.pushBoundedInt(x, 0), (x, y) => encoder.pushBoundedIntDiff(x, y, 0)),
    );
  },
  decode(input: Uint8Array): PhoneContact {
    return PhoneContact._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): PhoneContact {
    return {
      phone: decoder.nextString(),
      extension: decoder.nextOptional(() => decoder.nextBoundedInt(0)),
    };
  },
  decodeDiff(obj: PhoneContact, input: Uint8Array): PhoneContact {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => PhoneContact._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: PhoneContact, decoder: _.DiffDecoder): PhoneContact {
    return {
      phone: decoder.nextFieldDiff(
        obj.phone,
        (x) => decoder.nextStringDiff(x),
      ),
      extension: decoder.nextFieldDiff(
        obj.extension,
        (x) => decoder.nextOptionalDiff<number>(x, () => decoder.nextBoundedInt(0), (x) => decoder.nextBoundedIntDiff(x, 0)),
      ),
    };
  },
};

export const Contact = {
  default(): Contact {
    return { _type: "EmailContact", ...EmailContact.default() };
  },
  values() {
    return ["EmailContact", "PhoneContact"];
  },
  fromJson(obj: object): Contact {
    const result = _.parseUnion(obj, ["EmailContact", "PhoneContact"] as const, {
      EmailContact: (x: unknown) => EmailContact.fromJson(x as EmailContact),
      PhoneContact: (x: unknown) => PhoneContact.fromJson(x as PhoneContact)
    });
    return result as Contact;
  },
  toJson(obj: Contact): Record<string, unknown> {
    if (obj._type === "EmailContact") {
      return { EmailContact: EmailContact.toJson(obj) };
    }
    else if (obj._type === "PhoneContact") {
      return { PhoneContact: PhoneContact.toJson(obj) };
    }
    throw new Error(`Invalid Contact: ${obj}`);
  },
  clone(obj: Contact): Contact {
    if (obj._type === "EmailContact") {
      return { _type: "EmailContact", ...EmailContact.clone(obj) };
    }
    else if (obj._type === "PhoneContact") {
      return { _type: "PhoneContact", ...PhoneContact.clone(obj) };
    }
    throw new Error(`Invalid Contact: ${obj}`);
  },
  equals(a: Contact, b: Contact): boolean {
    if (a._type === "EmailContact" && b._type === "EmailContact") {
      return EmailContact.equals(a, b);
    }
    else if (a._type === "PhoneContact" && b._type === "PhoneContact") {
      return PhoneContact.equals(a, b);
    }
    return false;
  },
  encode(obj: Contact): Uint8Array {
    const encoder = _.Encoder.create();
    Contact._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: Contact, encoder: _.Encoder): void {
    if (obj._type === "EmailContact") {
      encoder.pushEnum(0, 1);
      EmailContact._encode(obj, encoder);
    }
    else if (obj._type === "PhoneContact") {
      encoder.pushEnum(1, 1);
      PhoneContact._encode(obj, encoder);
    }
  },
  encodeDiff(a: Contact, b: Contact): Uint8Array {
    const encoder = _.DiffEncoder.create();
    Contact._encodeDiff(a, b, encoder);
    return encoder.toBuffer();
  },
  _encodeDiff(a: Contact, b: Contact, encoder: _.DiffEncoder): void {
    encoder.pushBoolean(a._type === b._type);
    if (b._type === "EmailContact") {
      if (a._type === "EmailContact") {
        EmailContact._encodeDiff(a, b, encoder);
      } else {
        encoder.pushEnum(0, 1);
        EmailContact._encode(b, encoder);
      }
    }
    else if (b._type === "PhoneContact") {
      if (a._type === "PhoneContact") {
        PhoneContact._encodeDiff(a, b, encoder);
      } else {
        encoder.pushEnum(1, 1);
        PhoneContact._encode(b, encoder);
      }
    }
  },
  decode(input: Uint8Array): Contact {
    return Contact._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): Contact {
    const type = decoder.nextEnum(1);
    if (type === 0) {
      return { _type: "EmailContact", ...EmailContact._decode(decoder) };
    }
    else if (type === 1) {
      return { _type: "PhoneContact", ...PhoneContact._decode(decoder) };
    }
    throw new Error("Invalid union");
  },
  decodeDiff(obj: Contact, input: Uint8Array): Contact {
    return Contact._decodeDiff(obj, _.DiffDecoder.create(input));
  },
  _decodeDiff(obj: Contact, decoder: _.DiffDecoder): Contact {
    const isSameType = decoder.nextBoolean();
    if (isSameType) {
      if (obj._type === "EmailContact") {
        return { _type: "EmailContact", ...EmailContact._decodeDiff(obj, decoder) };
      }
      else if (obj._type === "PhoneContact") {
        return { _type: "PhoneContact", ...PhoneContact._decodeDiff(obj, decoder) };
      }
      throw new Error("Invalid union diff");
    } else {
      const type = decoder.nextEnum(1);
      if (type === 0) {
        return { _type: "EmailContact", ...EmailContact._decode(decoder) };
      }
      else if (type === 1) {
        return { _type: "PhoneContact", ...PhoneContact._decode(decoder) };
      }
      throw new Error("Invalid union diff");
    }
  }
}

export const User = {
  default(): User {
    return {
      id: "",
      name: "",
      age: 0,
      weight: 0.0,
      married: false,
      hairColor: "BLACK",
      address: undefined,
      children: [],
      metadata: new Map(),
      preferredContact: undefined,
    };
  },
  fromJson(obj: object): User {
    if (typeof obj !== "object" || obj == null) {
      throw new Error(`Invalid User: ${obj}`);
    }
    const o = obj as Record<string, unknown>;
    return {
      id: _.tryParseField(() => _.parseString(o["id"]), "User.id"),
      name: _.tryParseField(() => _.parseString(o["name"]), "User.name"),
      age: _.tryParseField(() => _.parseInt(o["age"], 0), "User.age"),
      weight: _.tryParseField(() => _.parseFloat(o["weight"]), "User.weight"),
      married: _.tryParseField(() => _.parseBoolean(o["married"]), "User.married"),
      hairColor: _.tryParseField(() => _.parseEnum(o["hairColor"], HairColor), "User.hairColor"),
      address: _.tryParseField(() => _.parseOptional(o["address"], (x) => Address.fromJson(x as Address)), "User.address"),
      children: _.tryParseField(() => _.parseArray(o["children"], (x) => User.fromJson(x as User)), "User.children"),
      metadata: _.tryParseField(() => _.parseRecord(o["metadata"], (x) => _.parseString(x), (x) => _.parseString(x)), "User.metadata"),
      preferredContact: _.tryParseField(() => _.parseOptional(o["preferredContact"], (x) => Contact.fromJson(x as Contact)), "User.preferredContact"),
    };
  },
  toJson(obj: User): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    result["id"] = obj.id;
    result["name"] = obj.name;
    result["age"] = obj.age;
    result["weight"] = obj.weight;
    result["married"] = obj.married;
    result["hairColor"] = obj.hairColor;
    if (obj.address != null) {
      result["address"] = Address.toJson(obj.address);
    }
    result["children"] = obj.children.map((x) => User.toJson(x));
    result["metadata"] = _.mapToObject(obj.metadata, (x) => x);
    if (obj.preferredContact != null) {
      result["preferredContact"] = Contact.toJson(obj.preferredContact);
    }
    return result;
  },
  clone(obj: User): User {
    return {
      id: obj.id,
      name: obj.name,
      age: obj.age,
      weight: obj.weight,
      married: obj.married,
      hairColor: obj.hairColor,
      address: obj.address != null ? Address.clone(obj.address) : undefined,
      children: obj.children.map((x) => User.clone(x)),
      metadata: new Map([...obj.metadata].map(([k, v]) => [k, v])),
      preferredContact: obj.preferredContact != null ? Contact.clone(obj.preferredContact) : undefined,
    };
  },
  equals(a: User, b: User): boolean {
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.age === b.age &&
      _.equalsFloat(a.weight, b.weight) &&
      a.married === b.married &&
      a.hairColor === b.hairColor &&
      _.equalsOptional(a.address, b.address, (x, y) => Address.equals(x, y)) &&
      _.equalsArray(a.children, b.children, (x, y) => User.equals(x, y)) &&
      _.equalsRecord(a.metadata, b.metadata, (x, y) => x === y, (x, y) => x === y) &&
      _.equalsOptional(a.preferredContact, b.preferredContact, (x, y) => Contact.equals(x, y))
    );
  },
  encode(obj: User): Uint8Array {
    const encoder = _.Encoder.create();
    User._encode(obj, encoder);
    return encoder.toBuffer();
  },
  _encode(obj: User, encoder: _.Encoder): void {
    encoder.pushString(obj.id);
    encoder.pushString(obj.name);
    encoder.pushBoundedInt(obj.age, 0);
    encoder.pushFloat(obj.weight);
    encoder.pushBoolean(obj.married);
    encoder.pushEnum(HairColor[obj.hairColor], 3);
    encoder.pushOptional(obj.address, (x) => Address._encode(x, encoder));
    encoder.pushArray(obj.children, (x) => User._encode(x, encoder));
    encoder.pushRecord(obj.metadata, (x) => encoder.pushString(x), (x) => encoder.pushString(x));
    encoder.pushOptional(obj.preferredContact, (x) => Contact._encode(x, encoder));
  },
  encodeDiff(a: User, b: User): Uint8Array {
    const encoder = _.DiffEncoder.create();
    encoder.pushObjectDiff(a, b, User.equals, () => User._encodeDiff(a, b, encoder));
    return encoder.toBuffer();
  },
  _encodeDiff(a: User, b: User, encoder: _.DiffEncoder): void {
    encoder.pushFieldDiff(
      a,
      b,
      "id",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "name",
      (x, y) => x === y,
      (x, y) => encoder.pushStringDiff(x, y),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "age",
      (x, y) => x === y,
      (x, y) => encoder.pushBoundedIntDiff(x, y, 0),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "weight",
      (x, y) => _.equalsFloat(x, y),
      (x, y) => encoder.pushFloatDiff(x, y),
    );
    encoder.pushFieldDiffValue(
      b,
      "married",
      () => encoder.pushBooleanDiff(a["married"], b["married"]),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "hairColor",
      (x, y) => x === y,
      (x, y) => encoder.pushEnumDiff(HairColor[x], HairColor[y], 3),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "address",
      (x, y) => _.equalsOptional(x, y, (x, y) => Address.equals(x, y)),
      (x, y) => encoder.pushOptionalDiff<Address>(x, y, (x) => Address._encode(x, encoder), (x, y) => Address._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "children",
      (x, y) => _.equalsArray(x, y, (x, y) => User.equals(x, y)),
      (x, y) => encoder.pushArrayDiff<User>(x, y, (x, y) => User.equals(x, y), (x) => User._encode(x, encoder), (x, y) => User._encodeDiff(x, y, encoder)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "metadata",
      (x, y) => _.equalsRecord(x, y, (x, y) => x === y, (x, y) => x === y),
      (x, y) => encoder.pushRecordDiff<string, string>(x, y, (x, y) => x === y, (x) => encoder.pushString(x), (x) => encoder.pushString(x), (x, y) => encoder.pushStringDiff(x, y)),
    );
    encoder.pushFieldDiff(
      a,
      b,
      "preferredContact",
      (x, y) => _.equalsOptional(x, y, (x, y) => Contact.equals(x, y)),
      (x, y) => encoder.pushOptionalDiff<Contact>(x, y, (x) => Contact._encode(x, encoder), (x, y) => Contact._encodeDiff(x, y, encoder)),
    );
  },
  decode(input: Uint8Array): User {
    return User._decode(_.Decoder.create(input));
  },
  _decode(decoder: _.Decoder): User {
    return {
      id: decoder.nextString(),
      name: decoder.nextString(),
      age: decoder.nextBoundedInt(0),
      weight: decoder.nextFloat(),
      married: decoder.nextBoolean(),
      hairColor: (HairColor as any)[decoder.nextEnum(3)],
      address: decoder.nextOptional(() => Address._decode(decoder)),
      children: decoder.nextArray(() => User._decode(decoder)),
      metadata: decoder.nextRecord(() => decoder.nextString(), () => decoder.nextString()),
      preferredContact: decoder.nextOptional(() => Contact._decode(decoder)),
    };
  },
  decodeDiff(obj: User, input: Uint8Array): User {
    const decoder = _.DiffDecoder.create(input);
    return decoder.nextObjectDiff(obj, () => User._decodeDiff(obj, decoder));
  },
  _decodeDiff(obj: User, decoder: _.DiffDecoder): User {
    return {
      id: decoder.nextFieldDiff(
        obj.id,
        (x) => decoder.nextStringDiff(x),
      ),
      name: decoder.nextFieldDiff(
        obj.name,
        (x) => decoder.nextStringDiff(x),
      ),
      age: decoder.nextFieldDiff(
        obj.age,
        (x) => decoder.nextBoundedIntDiff(x, 0),
      ),
      weight: decoder.nextFieldDiff(
        obj.weight,
        (x) => decoder.nextFloatDiff(x),
      ),
      married: decoder.nextBooleanDiff(obj.married),
      hairColor: decoder.nextFieldDiff(
        obj.hairColor,
        (x) => (HairColor as any)[decoder.nextEnumDiff((HairColor as any)[x], 3)],
      ),
      address: decoder.nextFieldDiff(
        obj.address,
        (x) => decoder.nextOptionalDiff<Address>(x, () => Address._decode(decoder), (x) => Address._decodeDiff(x, decoder)),
      ),
      children: decoder.nextFieldDiff(
        obj.children,
        (x) => decoder.nextArrayDiff<User>(x, () => User._decode(decoder), (x) => User._decodeDiff(x, decoder)),
      ),
      metadata: decoder.nextFieldDiff(
        obj.metadata,
        (x) => decoder.nextRecordDiff<string, string>(x, () => decoder.nextString(), () => decoder.nextString(), (x) => decoder.nextStringDiff(x)),
      ),
      preferredContact: decoder.nextFieldDiff(
        obj.preferredContact,
        (x) => decoder.nextOptionalDiff<Contact>(x, () => Contact._decode(decoder), (x) => Contact._decodeDiff(x, decoder)),
      ),
    };
  },
};
