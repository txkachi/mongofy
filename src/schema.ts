export type ValidatorFn = (value: any) => boolean | string;

export type SchemaDefinition = {
  [key: string]:
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "object"
    | "array"
    | SchemaDefinition
    | { type: string; required?: boolean; validate?: ValidatorFn };
};

export class Schema {
  constructor(public definition: SchemaDefinition) {}
}

export function validateSchema(
  schema: Schema,
  data: any,
  path: string = "",
): void {
  for (const key in schema.definition) {
    const type = schema.definition[key];
    const value = data[key];
    const currentPath = path ? `${path}.${key}` : key;
    if (typeof type === "object" && "type" in type) {
      if (type.required && value == null)
        throw new Error(`Field '${currentPath}' is required.`);
      if (typeof type.validate === "function" && value != null) {
        const result = type.validate(value);
        if (result !== true)
          throw new Error(`Validation failed for '${currentPath}': ${result}`);
      }
      // type.type is the actual type string
      if (type.type === "date") {
        if (!(value instanceof Date || typeof value === "string")) {
          throw new Error(`Field '${currentPath}' must be a date.`);
        }
      } else if (type.type === "array") {
        if (!Array.isArray(value)) {
          throw new Error(`Field '${currentPath}' must be an array.`);
        }
      } else if (type.type === "object") {
        if (
          typeof value !== "object" ||
          Array.isArray(value) ||
          value === null
        ) {
          throw new Error(`Field '${currentPath}' must be an object.`);
        }
      } else if (typeof value !== type.type) {
        throw new Error(
          `Field '${currentPath}' must be of type '${type.type}'.`,
        );
      }
    } else if (typeof type === "string") {
      if (type === "date") {
        if (!(value instanceof Date || typeof value === "string")) {
          throw new Error(`Field '${currentPath}' must be a date.`);
        }
      } else if (type === "array") {
        if (!Array.isArray(value)) {
          throw new Error(`Field '${currentPath}' must be an array.`);
        }
      } else if (type === "object") {
        if (
          typeof value !== "object" ||
          Array.isArray(value) ||
          value === null
        ) {
          throw new Error(`Field '${currentPath}' must be an object.`);
        }
      } else if (typeof value !== type) {
        throw new Error(`Field '${currentPath}' must be of type '${type}'.`);
      }
    } else if (typeof type === "object") {
      if (typeof value !== "object" || value === null) {
        throw new Error(`Field '${currentPath}' must be an object.`);
      }
      validateSchema(new Schema(type), value, currentPath);
    }
  }
}
