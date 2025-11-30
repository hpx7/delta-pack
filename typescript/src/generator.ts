import { renderDoc } from "./codegen";

export type PrimitiveType = EnumType | StringType | IntType | UIntType | FloatType | BooleanType;
export type ContainerType = ArrayType | OptionalType | RecordType;
export type Type = ReferenceType | ObjectType | UnionType | ContainerType | PrimitiveType;
export type ReferenceType = {
  type: "reference";
  reference: string;
};
export interface ObjectType {
  type: "object";
  properties: Record<string, PrimitiveType | ContainerType | ReferenceType>;
}
export interface UnionType {
  type: "union";
  options: readonly ReferenceType[];
}
export interface ArrayType {
  type: "array";
  value: PrimitiveType | ContainerType | ReferenceType;
}
export interface OptionalType {
  type: "optional";
  value: PrimitiveType | ContainerType | ReferenceType;
}
export interface RecordType {
  type: "record";
  key: StringType | IntType | UIntType;
  value: PrimitiveType | ContainerType | ReferenceType;
}
export interface EnumType {
  type: "enum";
  options: readonly string[];
}
export interface StringType {
  type: "string";
}
export interface IntType {
  type: "int";
}
export interface UIntType {
  type: "uint";
}
export interface FloatType {
  type: "float";
  precision?: number;
}
export interface BooleanType {
  type: "boolean";
}

export function ReferenceType<const R extends string>(reference: R): { type: "reference"; reference: R } {
  return { type: "reference", reference };
}

export function ObjectType<const P extends Record<string, PrimitiveType | ContainerType | ReferenceType>>(
  properties: P
): { type: "object"; properties: P } {
  return { type: "object", properties };
}

export function UnionType<const O extends readonly ReferenceType[]>(options: O): { type: "union"; options: O } {
  return { type: "union", options };
}

export function ArrayType<const V extends PrimitiveType | ContainerType | ReferenceType>(
  value: V
): { type: "array"; value: V } {
  return { type: "array", value };
}

export function OptionalType<const V extends PrimitiveType | ContainerType | ReferenceType>(
  value: V
): { type: "optional"; value: V } {
  return { type: "optional", value };
}

export function RecordType<
  const K extends StringType | IntType | UIntType,
  const V extends PrimitiveType | ContainerType | ReferenceType,
>(key: K, value: V): { type: "record"; key: K; value: V } {
  return { type: "record", key, value };
}

export function EnumType<const O extends readonly string[]>(options: O): { type: "enum"; options: O } {
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
