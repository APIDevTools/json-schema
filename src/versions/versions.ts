/* eslint-disable camelcase, @typescript-eslint/naming-convention */
import { Helpers } from "../errors";
import { File } from "../file";
import { Reference } from "../reference";
import { Resolution } from "../resolution";
import { JsonSchemaVersionInfo } from "../utils";
import { indexFile } from "./index-file";
import { resolve } from "./resolve";

/**
 * Version-specific JSON Schema functionality
 */
export interface JsonSchemaVersion {
  /**
   * Indexes the file contents. That is, it scans the file and records all JSON Schema resources,
   * anchors, and references in it.
   *
   * @param file
   * The file to index. The `File.resources` property will be populated with all JSON Schema
   * resources, anchors, and references in the file.
   *
   * @param helpers - Helpful information and utilities
   */
  indexFile(file: File, helpers: Helpers): void;

  /**
   * Resolve a reference to a value in the schema.
   *
   * @param ref - The JSON Reference to be resolved
   * @param helpers - Helpful information and utilities
   * @returns The resolved value, along with information about how it was resolved
   */
  resolveRef(ref: Reference, helpers: Helpers): Resolution;
}


/**
 * JSON Schema Draft 4
 *
 * @see https://tools.ietf.org/html/draft-zyp-json-schema-04
 * @see https://json-schema.org/draft-04/json-schema-core.html
 */
export const jsonSchemaDraft4 = createJsonSchemaVersion({
  idKeyword: "id",
  anchorKeyword: undefined,
  idAllowsHash: true,
});


/**
 * JSON Schema 2019-09 (aka "Draft 8")
 *
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-02
 * @see https://json-schema.org/draft/2019-09/json-schema-core.html
 */
export const jsonSchema2019_09 = createJsonSchemaVersion({
  idKeyword: "$id",
  anchorKeyword: "$anchor",
  idAllowsHash: false,
});


/**
 * JSON Schema Draft 8 (aka "2019-09")
 *
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-02
 * @see https://json-schema.org/draft/2019-09/json-schema-core.html
 */
export const jsonSchemaDraft8 = jsonSchema2019_09;


/**
 * Creates an object that implements a specific version of JSON Schema
 */
function createJsonSchemaVersion(version: JsonSchemaVersionInfo): JsonSchemaVersion {
  return {
    indexFile(file: File, helpers: Helpers): void {
      return indexFile(file, helpers, version);
    },

    resolveRef(ref: Reference, helpers: Helpers): Resolution {
      return resolve(ref, helpers, version);
    }
  };
}
