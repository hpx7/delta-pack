import { renderDoc } from "./codegen";

export type PrimitiveType = EnumType | StringType | IntType | UIntType | FloatType | BooleanType;
export type ContainerType = ArrayType | OptionalType | RecordType;
export type Type = ReferenceType | ObjectType | UnionType | ContainerType | PrimitiveType;
export type ReferenceType = {
  type: "reference";
  reference: string;
};
interface ObjectType {
  type: "object";
  properties: Record<string, PrimitiveType | ContainerType | ReferenceType>;
}
interface UnionType {
  type: "union";
  options: readonly ReferenceType[];
}
interface ArrayType {
  type: "array";
  value: PrimitiveType | ContainerType | ReferenceType;
}
interface OptionalType {
  type: "optional";
  value: PrimitiveType | ContainerType | ReferenceType;
}
interface RecordType {
  type: "record";
  key: StringType | IntType | UIntType;
  value: PrimitiveType | ContainerType | ReferenceType;
}
interface EnumType {
  type: "enum";
  options: readonly string[];
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
  precision?: number;
}
interface BooleanType {
  type: "boolean";
}

export function ReferenceType(reference: string): ReferenceType {
  return { type: "reference", reference };
}

export function ObjectType<const P extends Record<string, PrimitiveType | ContainerType | ReferenceType>>(
  properties: P
): { type: "object"; properties: P } {
  return { type: "object", properties };
}

export function UnionType<const O extends readonly ReferenceType[]>(
  options: O
): { type: "union"; options: O } {
  return { type: "union", options };
}

export function ArrayType(value: PrimitiveType | ContainerType | ReferenceType): ArrayType {
  return { type: "array", value };
}

export function OptionalType(value: PrimitiveType | ContainerType | ReferenceType): OptionalType {
  return { type: "optional", value };
}

export function RecordType(
  key: StringType | IntType | UIntType,
  value: PrimitiveType | ContainerType | ReferenceType,
): RecordType {
  return { type: "record", key, value };
}

export function EnumType<const O extends readonly string[]>(
  options: O
): { type: "enum"; options: O } {
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

export function FloatType(options?: { precision?: number }): FloatType {
  return { type: "float", precision: options?.precision };
}

export function BooleanType(): BooleanType {
  return { type: "boolean" };
}

export function codegenTypescript(doc: Record<string, Type>) {
  return renderDoc(doc);
}
