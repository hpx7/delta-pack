import { renderDoc } from "./codegen";

export type Type = ObjectType | UnionType | EnumType | StringType | IntType | FloatType | BooleanType;
export enum Modifier {
  OPTIONAL = "optional",
  ARRAY = "array",
}
export type ChildType = (StringType | IntType | FloatType | BooleanType | RecordType | ReferenceType) & {
  modifier?: Modifier;
};
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
interface RecordType {
  type: "record";
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

export function ChildType(
  type: StringType | IntType | FloatType | BooleanType | RecordType | ReferenceType,
  modifier?: Modifier,
): ChildType {
  return { ...type, modifier };
}

export function UnionType(options: ReferenceType[]): UnionType {
  return { type: "union", options };
}

export function RecordType(value: StringType | IntType | FloatType | BooleanType | ReferenceType): RecordType {
  return { type: "record", value };
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

export function FloatType(): FloatType {
  return { type: "float" };
}

export function BooleanType(): BooleanType {
  return { type: "boolean" };
}

export function codegenTypescript(doc: Record<string, Type>) {
  return renderDoc(doc);
}
