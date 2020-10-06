import { Anchor } from "./anchor";
import { File } from "./file";
import { JsonSchema } from "./json-schema";
import { Pointer } from "./pointer";
import { Reference } from "./reference";
import { createURL } from "./url";

/**
 * The arguments that can be passed to the `Resource` constructor
 */
export interface ResourceArgs {
  file: File;
  uri?: string | URL;
  data?: unknown;
  locationInFile?: string[];
}

/**
 * A JSON Schema resource that has a URI
 *
 * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.4.3.5
 */
export class Resource {
  /**
   * The JSON Schema that this resource is part of
   */
  public schema: JsonSchema;

  /**
   * The file that contains this resource
   */
  public file: File;

  /**
   * The base URI of the JSON Schema resource
   *
   * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2
   */
  public uri: URL;

  /**
   * A pointer to the resource's location in the file
   */
  public locationInFile: Pointer;

  /**
   * The resource data. This can be *any* JavaScript value, but will usually be one of the following:
   *
   * - `object` if the resource is a JSON Schema document that has already been parsed
   *
   * - `string` if the resource is in a text-based file that has not yet been parsed.
   *    This includes JSON, YAML, HTML, SVG, CSV, plain-text, etc.
   *
   * - `ArrayBuffer` if the resource contains binary data, such as an image
   */
  public data: unknown;

  /**
   * All anchors in the JSON Schema resource
   *
   * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2
   */
  public anchors: Anchor[] = [];

  /**
   * All references in the JSON Schema resource
   *
   * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2
   */
  public references: Reference[] = [];

  public constructor(args: ResourceArgs) {
    let { uri } = args;

    if (uri === undefined) {
      // By default, the resource's URI is its file location
      uri = args.file.url;
    }
    else if (!(uri instanceof URL)) {
      uri = createURL(uri);
    }

    this.schema = args.file.schema;
    this.file = args.file;
    this.uri = uri;
    this.locationInFile = new Pointer(args.locationInFile || []);
    this.data = args.data;
  }

  /**
   * Returns the resource URI
   */
  public toString(): string {
    return `${this.uri || "resource"}`;
  }
}
