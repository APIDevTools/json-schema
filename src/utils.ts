/**
 * Symbol used to store fields that are only intended to be used internally
 *
 * TODO: Replace this with private class fields, once they're widely supported
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
 */
export const _internal = Symbol("internal fields");

/**
 * A plain-old JavaScript object. That is, not another known JavaScript class,
 * like Date, RegExp, Array, Map, Set, etc.
 */
export interface POJO {
  [key: string]: unknown;
}

/**
 * A JSON Schema document
 *
 * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.4.3
 */
export interface JsonSchemaDocument extends POJO {
  $schema?: string;
  $id?: string;
  id?: string;
}

/**
 * The information that's necessary to implement a specific version of JSON Schema
 */
export interface JsonSchemaVersionInfo {
  idKeyword: string;
  anchorKeyword: string | undefined;
  idAllowsHash: boolean;
}


/**
 * Creates an error with additional properties
 */
export function createError<T extends ErrorConstructor>(type: T, message: string, props?: POJO): Error {
  // eslint-disable-next-line new-cap
  let error = new type(message);
  return Object.assign(error, props);
}


/**
 * Returns the given value as a `JsonSchemaDocument`, or `undefined` if the value
 * cannot be a JSON Scheam document.
 */
export function toJsonSchemaDocument(value: unknown): JsonSchemaDocument | undefined {
  // If the value is a POJO, then assume it is a JSON Schema document
  return isPOJO(value) ? value : undefined;
}


/**
 * Determines whether the given value is a plain-old JavaScript object (POJO)
 */
export function isPOJO(value: unknown): value is POJO {
  let doc = value as POJO;
  return doc &&
    typeof doc === "object" &&
    !(doc instanceof Date) &&
    !(doc instanceof RegExp) &&
    !(doc instanceof Map) &&
    !(doc instanceof Set) &&
    !Array.isArray(doc) &&
    !ArrayBuffer.isView(doc);
}
