import { File } from "./file";
import { JsonSchema } from "./json-schema";
import { Pointer } from "./pointer";
import { Resource } from "./resource";
import { createURL } from "./url";
import { createError } from "./utils";

const A = 65, Z = 90, a = 97, z = 122, hash = 35;
const namePattern = /^[a-z][a-z0-9_:.-]*$/i;
const code = "ERR_INVALID_ANCHOR";

/**
 * The arguments that can be passed to the `Anchor` constructor
 */
export interface AnchorArgs {
  resource: Resource;
  locationInFile: string[];
  name: string | unknown;
  data: object;
}

/**
 * A JSON Schema anchor
 *
 * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2.3
 */
export class Anchor {
  /**
   * The JSON Schema that this anchor is part of
   */
  public schema: JsonSchema;

  /**
   * The file that contains this anchor
   */
  public file: File;

  /**
   * The JSON Schema resource that contains this anchor
   */
  public resource: Resource;

  /**
   * A pointer to the anchor's location in the file
   */
  public locationInFile: Pointer;

  /**
   * The name of this anchor (e.g. "my-anchor")
   *
   * NOTE: According to the 2019-09 spec, anchor names MUST start with a letter
   */
  public name: string;

  /**
   * The anchor object in the JSON Schema
   */
  public data: object;

  /**
   * The absolute URI of this anchor
   */
  public uri: URL;

  public constructor(args: AnchorArgs) {
    let input = args.name;

    if (typeof input !== "string") {
      let type = typeof input;
      throw createError(TypeError, `$anchor must be a string, not ${type}.`, { code, type, input });
    }

    if (input.length === 0) {
      throw createError(SyntaxError, "$anchor cannot be empty.", { code, input });
    }

    let firstChar = input.charCodeAt(0);
    if (firstChar === hash) {
      throw createError(SyntaxError, "$anchor cannot start with a \"#\" character.", { code, input });
    }
    else if (!((firstChar >= A && firstChar <= Z) || (firstChar >= a && firstChar <= z))) {
      throw createError(SyntaxError, "$anchor must start with a letter.", { code, input });
    }

    if (!namePattern.test(input)) {
      throw createError(SyntaxError, "$anchor contains illegal characters.", { code, input });
    }

    this.schema = args.resource.schema;
    this.file = args.resource.file;
    this.resource = args.resource;
    this.locationInFile = new Pointer(args.locationInFile);
    this.name = input;
    this.data = args.data;
    this.uri = createURL("#" + input, this.resource.uri);
  }

  /**
   * Returns the anchor URI
   */
  public toString(): string {
    return `${this.uri || "anchor"}`;
  }
}
