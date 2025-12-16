// Metadata keys for decorator reflection
export const SCHEMA_TYPE = "deltapack:schemaType";

// A unified type that works as both a PropertyDecorator and a schema type
export type UnifiedType<T> = PropertyDecorator & T;

export function createUnifiedType<T>(schemaType: T): UnifiedType<T> {
  const decorator: PropertyDecorator = (target, propertyKey) => {
    Reflect.defineMetadata(SCHEMA_TYPE, schemaType, target, propertyKey);
  };
  return Object.assign(decorator, schemaType) as UnifiedType<T>;
}

// Strips decorator function wrapper to get plain schema object
export function stripDecorator<T>(type: T): T {
  // If it's a function (UnifiedType), extract its enumerable properties
  if (typeof type === "function") {
    const keys = Object.keys(type);
    if (keys.length === 0) return type;
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      result[key] = stripDecorator((type as Record<string, unknown>)[key]);
    }
    return result as T;
  }

  // If it's an object, recursively strip nested "value" and "key" properties
  if (typeof type === "object" && type !== null) {
    const t = type as Record<string, unknown>;
    if ("value" in t || "key" in t) {
      const result = { ...t };
      if ("value" in result) {
        result["value"] = stripDecorator(result["value"]);
      }
      if ("key" in result) {
        result["key"] = stripDecorator(result["key"]);
      }
      return result as T;
    }
  }

  return type;
}

// Decorator-mode markers (not part of PropertyType, only used internally)
export interface EnumDef {
  options: string[];
  name: string;
}

export interface ClassRef {
  __class: Function;
}

export interface EnumRef {
  __enum: EnumDef;
}
