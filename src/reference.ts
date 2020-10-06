import { File } from "./file";
import { JsonSchema } from "./json-schema";
import { Pointer } from "./pointer";
import { Resolution } from "./resolution";
import { Resource } from "./resource";
import { createURL } from "./url";
import { createError } from "./utils";
import { JsonSchemaVersionNumber } from "./versions";

const code = "ERR_INVALID_REF";

/**
 * The arguments that can be passed to the `Reference` constructor
 */
export interface ReferenceArgs {
  resource: Resource;
  locationInFile: string[];
  value: string | unknown;
  data: object;
}

/**
 * A JSON reference
 *
 * @see https://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03
 * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2.4
 */
export class Reference {
  /**
   * The JSON Schema that this reference is part of
   */
  public schema: JsonSchema;

  /**
   * The file that contains this reference
   */
  public file: File;

  /**
   * The JSON Schema resource that contains this reference
   */
  public resource: Resource;

  /**
   * A pointer to the reference's location in the file
   */
  public locationInFile: Pointer;

  /**
   * The `$ref` value (e.g. "some-file.json#/Foo/properties/bar")
   */
  public value: string;

  /**
   * The reference object in the JSON Schema
   */
  public data: object;

  /**
   * The absolute URI that this reference points to
   */
  public targetURI: URL;

  public constructor(args: ReferenceArgs) {
    let input = args.value;

    if (typeof input !== "string") {
      let type = typeof input;
      throw createError(TypeError, `$ref must be a string, not ${type}.`, { code, input, type });
    }

    if (input.length === 0) {
      throw createError(SyntaxError, "$ref cannot be empty.", { code, input });
    }

    this.schema = args.resource.schema;
    this.file = args.resource.file;
    this.resource = args.resource;
    this.locationInFile = new Pointer(args.locationInFile);
    this.value = input;
    this.data = args.data;
    this.targetURI = createURL(input, this.resource.uri);
  }

  /**
   * Resolve the reference to a value in the schema.
   *
   * @param versionNumber - The JSON Schema version to use. Defaults to auto-detecting.
   * @returns The resolved value, along with information about how it was resolved
   */
  public resolve(versionNumber?: JsonSchemaVersionNumber): Resolution {
    return this.schema.resolve(this.targetURI, versionNumber);
  }

  /**
   * Returns the reference's target URI
   */
  public toString(): string {
    return `$ref: ${this.targetURI}`;
  }
}
