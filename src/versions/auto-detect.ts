/* eslint-disable camelcase, @typescript-eslint/naming-convention */
import { Helpers } from "../errors";
import { File } from "../file";
import { Reference } from "../reference";
import { Resolution } from "../resolution";
import { createError, toJsonSchemaDocument } from "../utils";
import { jsonSchema2019_09, jsonSchemaDraft4, JsonSchemaVersion } from "./versions";

const code = "ERR_SCHEMA_VERSION";

/**
 * Automatically detects the version of JSON Schema using the `$schema` keyword in the document.
 *
 * @see http://json-schema.org/specification-links.html
 */
export const jsonSchemaAutoDetect: JsonSchemaVersion = {
  indexFile(file: File, helpers: Helpers): void {
    let doc = toJsonSchemaDocument(file.rootResource.data);
    if (!doc) {
      // This isn't a JSON Schema document, so there's nothing to index
      return;
    }

    let version = detectJsonSchemaVersion(file);
    return version.indexFile(file, helpers);
  },

  resolveRef(ref: Reference, helpers: Helpers): Resolution {
    let version = detectJsonSchemaVersion(ref.schema.rootFile);
    return version.resolveRef(ref, helpers);
  }
};

/**
 * Detects the appropriate JSON Schema version.
 */
function detectJsonSchemaVersion(file: File): JsonSchemaVersion {
  let doc = toJsonSchemaDocument(file.rootResource.data);

  if (!doc || typeof doc.$schema !== "string") {
    // This file has no $schema defined, so check the schema's root file
    doc = toJsonSchemaDocument(file.schema.rootResource.data);

    if (!doc || typeof doc.$schema !== "string") {
      throw createError(
        Error, "Unable to determine JSON Schema version. Missing $schema keyword.", { code });
    }
  }

  switch (doc.$schema) {
    case "http://json-schema.org/draft-04/schema":
    case "http://json-schema.org/draft-04/schema#":
      return jsonSchemaDraft4;

    case "https://json-schema.org/draft/2019-09/schema":
      return jsonSchema2019_09;

    case "http://json-schema.org/schema":
    case "http://json-schema.org/schema#":
      // These $schema identifiers indicate that the latest version should be used
      return jsonSchema2019_09;

    default:
      throw createError(URIError, `Unsupported JSON Schema version: ${doc.$schema}`, {
        code,
        $schema: doc.$schema
      });
  }
}
