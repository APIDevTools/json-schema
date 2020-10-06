/* eslint-disable camelcase, @typescript-eslint/naming-convention */
import { jsonSchemaAutoDetect } from "./auto-detect";
import { jsonSchema2019_09, jsonSchemaDraft4 } from "./versions";

// Export each version as a named export
export * from "./versions";

/**
 * The JSON Schema versions that are supported
 */
export type JsonSchemaVersionNumber = "draft-04" | "draft-08" | "2019-09";

/**
 * Implementations of version-specific JSON Schema functionality
 *
 * @see http://json-schema.org/specification-links.html
 */
export const jsonSchema = Object.assign({}, jsonSchemaAutoDetect, {
  /**
   * JSON Schema Draft 4
   *
   * @see https://tools.ietf.org/html/draft-zyp-json-schema-04
   * @see https://json-schema.org/draft-04/json-schema-core.html
   */
  "draft-04": jsonSchemaDraft4,

  /**
   * JSON Schema 2019-09 (aka "Draft 8")
   *
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-02
   * @see https://json-schema.org/draft/2019-09/json-schema-core.html
   */
  "draft-08": jsonSchema2019_09,

  /**
   * JSON Schema 2019-09 (aka "Draft 8")
   *
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-02
   * @see https://json-schema.org/draft/2019-09/json-schema-core.html
   */
  "2019-09": jsonSchema2019_09,

  /**
   * The latest supported version of JSON Schema
   *
   * @see http://json-schema.org/specification-links.html
   */
  latest: jsonSchema2019_09,

  /**
   * Automatically detects the version of JSON Schema using the `$schema` keyword in the document.
   *
   * @see http://json-schema.org/specification-links.html
   */
  auto: jsonSchemaAutoDetect,
});
