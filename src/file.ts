import { Anchor } from "./anchor";
import { createErrorHandler, SchemaError } from "./errors";
import { locationToURL } from "./isomorphic.node";
import { iterate } from "./iterate";
import { JsonSchema } from "./json-schema";
import { Reference } from "./reference";
import { Resource } from "./resource";
import { basename, compareURIs, createURL } from "./url";
import { createError, _internal } from "./utils";
import { jsonSchema, JsonSchemaVersionNumber } from "./versions";


/**
 * The arguments that can be passed to the `File` constructor
 */
export interface FileArgs {
  schema: JsonSchema;
  url?: string | URL;
  path?: string | URL;
  mediaType?: string;
  metadata?: object;
  data?: unknown;
}

/**
 * Arbitrary metadata about a file
 */
export interface FileMetadata {
  [key: string]: unknown;
}

/**
 * A single schema file in a JSON Schema. This may be the root file or a file referenced by a `$ref` pointer.
 *
 * NOTE: Not all files contain a JSON Schema. In fact, not all files are even JSON.
 * A `$ref` pointer can point to any type of file, including plain text, XML, image files, etc.
 */
export class File {
  /**
   * The JSON Schema that this file is part of
   */
  public schema: JsonSchema;

  /**
   * The absolute URL of the file, parsed into its constituent parts. For filesystem files, this
   * will be a "file://" URL.
   */
  public url: URL;

  /**
   * The absolute or relative path of the file, based on the root path or URL that was provided
   * by the user. The intent is for this to be a shorter, more user-friendly path that can be
   * used in user-facing messages.
   */
  public path: string;

  /**
   * The IANA media type of the file (e.g. "application/json", "text/plain", etc.).
   * This is used to determine how to parse the file's data.
   *
   * @see https://www.iana.org/assignments/media-types/media-types.xhtml
   */
  public mediaType: string;

  /**
   * Optional, arbitrary metadata about the file, such as headers, filesystem info, etc.
   */
  public metadata: FileMetadata;

  /**
   * The JSON Schema resources contained in this file
   *
   * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.4.3.5
   */
  public resources: Resource[] = [];

  /**
   * The root resource of the file. Every file has one root resource, which may or may not
   * be a JSON Schema document.
   */
  public rootResource: Resource;

  /**
   * The errors that were encountered in this file, if any
   */
  public errors: SchemaError[] = [];

  public constructor(args: FileArgs) {
    let location = args.url || args.path;
    if (!location) {
      throw createError(URIError,
        "A file URL or path must be specified",
        { code: "ERR_INVALID_URL" }
      );
    }

    let url = locationToURL(location, args.schema[_internal].cwd);

    if (url.hash) {
      throw createError(URIError,
        `File URL cannot include a fragment: ${url.hash}`,
        { code: "ERR_INVALID_URL", input: String(location) }
      );
    }

    this.schema = args.schema;
    this.url = url;
    this.path = args.path ? String(args.path) : basename(url);
    this.mediaType = args.mediaType || "";
    this.metadata = (args.metadata || {}) as FileMetadata;
    this.rootResource = new Resource({ file: this, data: args.data });
    this.resources.push(this.rootResource);
  }

  /**
   * The file data. This can be *any* JavaScript value, but will usually be one of the following:
   *
   * - `object` if the file is a JSON Schema document that has already been parsed
   *
   * - `string` if the file is in a text-based file that has not yet been parsed.
   *    This includes JSON, YAML, HTML, SVG, CSV, plain-text, etc.
   *
   * - `ArrayBuffer` if the file contains binary data, such as an image
   */
  public get data(): unknown {
    return this.rootResource.data;
  }

  /**
   * Sets the root resource's `data` property.
   *
   * NOTE: This does *not* re-index the file or update any of its resources, references, or anchors.
   */
  public set data(data: unknown) {
    this.rootResource.data = data;
  }

  /**
   * All JSON Schema anchors in the file
   *
   * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2
   */
  public get anchors(): Iterable<Anchor> {
    return iterate(this.resources, "anchors");
  }

  /**
   * All JSON References in the file
   *
   * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2
   */
  public get references(): Iterable<Reference> {
    return iterate(this.resources, "references");
  }

  /**
   * Determines whether the specified JSON Schema resource URI is in the file
   *
   * @param uri - The canonical URI of the resource to check for
   */
  public hasResource(uri: string | URL): boolean {
    return Boolean(this.getResource(uri));
  }

  /**
   * Returns the JSON Schema resource with the specified URI
   *
   * @param uri - The canonical URI of the resource to return
   * @returns The specified Resource, if found
   */
  public getResource(uri: string | URL): Resource | undefined {
    uri = uri instanceof URL ? uri : createURL(uri);

    return this.resources.find((resource) => compareURIs(resource.uri, uri as URL));
  }

  /**
   * Indexes the file contents. That is, it scans the file and records all JSON Schema resources,
   * anchors, and references in it.
   *
   * @param versionNumber - The JSON Schema version to use. Defaults to auto-detecting.
   * @returns The same `File` instance, to allow for chaining
   */
  public index(versionNumber?: JsonSchemaVersionNumber): this {
    // Remove everything but the root resource data
    this.resources = [this.rootResource];
    this.rootResource.anchors = [];
    this.rootResource.references = [];

    // Re-index the file
    let version = versionNumber ? jsonSchema[versionNumber] : jsonSchema;
    let handleError = createErrorHandler({ file: this, code: "ERR_INDEX" });
    version.indexFile(this, { handleError });

    return this;
  }

  /**
   * Returns the file path
   */
  public toString(): string {
    return this.path || "file";
  }

  /**
   * Determines whether a value is a `File` instance
   */
  public static isFile(value: unknown): value is File {
    if (value instanceof File) {
      return true;
    }

    // Use duck typing to support interoperability between multiple versions
    // of the @apidevtools/json-schema package
    let file = value as File;
    return file &&
      typeof file === "object" &&
      typeof file.schema === "object" &&
      typeof file.path === "string" &&
      typeof file.mediaType === "string" &&
      typeof file.rootResource === "object" &&
      file.url instanceof URL &&
      Array.isArray(file.resources) &&
      Array.isArray(file.errors);
  }
}
