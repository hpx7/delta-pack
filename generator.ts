import { renderDoc } from "./codegen";

export type Type =
  | ReferenceType
  | ObjectType
  | UnionType
  | ArrayType
  | OptionalType
  | RecordType
  | EnumType
  | StringType
  | IntType
  | UIntType
  | FloatType
  | BooleanType;
type ChildType = StringType | IntType | FloatType | BooleanType | ArrayType | OptionalType | RecordType | ReferenceType;
interface ReferenceType {
  type: "reference";
  reference: string;
}
interface ObjectType {
  type: "object";
  properties: Record<string, ChildType>;
}
interface UnionType {
  type: "union";
  options: ReferenceType[];
}
interface ArrayType {
  type: "array";
  value: StringType | IntType | FloatType | BooleanType | ReferenceType;
}
interface OptionalType {
  type: "optional";
  value: StringType | IntType | FloatType | BooleanType | ReferenceType;
}
interface RecordType {
  type: "record";
  key: StringType | IntType | UIntType;
  value: StringType | IntType | FloatType | BooleanType | ReferenceType;
}
interface EnumType {
  type: "enum";
  options: string[];
}
interface StringType {
  type: "string";
}
interface IntType {
  type: "int";
}
interface UIntType {
  type: "uint";
}
interface FloatType {
  type: "float";
}
interface BooleanType {
  type: "boolean";
}

export function ReferenceType(reference: string): ReferenceType {
  return { type: "reference", reference };
}

export function ObjectType(properties: Record<string, ChildType>): ObjectType {
  return { type: "object", properties };
}

export function UnionType(options: ReferenceType[]): UnionType {
  return { type: "union", options };
}

export function ArrayType(value: StringType | IntType | FloatType | BooleanType | ReferenceType): ArrayType {
  return { type: "array", value };
}

export function OptionalType(value: StringType | IntType | FloatType | BooleanType | ReferenceType): OptionalType {
  return { type: "optional", value };
}

export function RecordType(
  key: StringType | IntType | UIntType,
  value: StringType | IntType | FloatType | BooleanType | ReferenceType,
): RecordType {
  return { type: "record", key, value };
}

export function EnumType(options: string[]): EnumType {
  return { type: "enum", options };
}

export function StringType(): StringType {
  return { type: "string" };
}

export function IntType(): IntType {
  return { type: "int" };
}

export function UIntType(): UIntType {
  return { type: "uint" };
}

export function FloatType(): FloatType {
  return { type: "float" };
}

export function BooleanType(): BooleanType {
  return { type: "boolean" };
}

export function codegenTypescript(doc: Record<string, Type>) {
  return renderDoc(doc);
}
