import { createErrorHandler, SchemaError } from "./errors";
import { File } from "./file";
import { getCWD, locationToURL } from "./isomorphic.node";
import { iterate } from "./iterate";
import { Reference } from "./reference";
import { Resolution } from "./resolution";
import { Resource } from "./resource";
import { compareURIs, createURL } from "./url";
import { _internal } from "./utils";
import { jsonSchema, JsonSchemaVersionNumber } from "./versions";


/**
 * The arguments that can be passed to the `JsonSchema` constructor
 */
export interface JsonSchemaArgs {
  cwd?: string;
  url?: string | URL;
  path?: string | URL;
  mediaType?: string;
  metadata?: object;
  data?: unknown;
}


/**
 * A JSON Schema that has been read from one or more files, URLs, or other sources
 */
export class JsonSchema {
  /**
   * These fields are for internal use only
   * @internal
   */
  public [_internal]: {
    cwd: string;
  };

  /**
   * The files in the schema, including the root file and any files referenced by `$ref` pointers
   */
  public files: File[] = [];

  /**
   * The root file of the schema. This is the first file that was read. All other files are
   * referenced either directly or indirectly by this file.
   */
  public rootFile!: File;

  public constructor(args: JsonSchemaArgs = {}) {
    // Determine the CWD, which we'll use to resolve relative paths/URLs
    let cwd = args.cwd || getCWD();
    this[_internal] = { cwd };

    if (args.url || args.path) {
      this.rootFile = new File({
        schema: this,
        url: args.url,
        path: args.path,
        mediaType: args.mediaType || "application/schema+json",
        metadata: args.metadata,
        data: args.data,
      });

      this.files.push(this.rootFile);
    }
  }

  /**
   * The root resource of the root file
   */
  public get rootResource(): Resource {
    return this.rootFile.rootResource;
  }

  /**
   * All of the JSON Schema resources that have URIs
   */
  public get resources(): Iterable<Resource> {
    return iterate(this.files, "resources");
  }

  /**
   * Indicates whether there are any errors in any file in the schema
   */
  public get hasErrors(): boolean {
    let result = this.errors[Symbol.iterator]().next();
    return !result.done;
  }

  /**
   * All errors in all files in the schema
   */
  public get errors(): Iterable<SchemaError> {
    return iterate(this.files, "errors");
  }

  /**
   * Determines whether the specified file is in the schema
   *
   * @param location - The absolute or relative path/URL of the file to check for
   */
  public hasFile(location: string | URL): boolean {
    return Boolean(this.getFile(location));
  }

  /**
   * Returns the specified file in the schema
   *
   * @param location - The absolute or relative path/URL of the file to return
   */
  public getFile(location: string | URL): File | undefined {
    // Resolve relative URLs against the CWD, just like the File constructor does.
    // This ensures that relative URLs always behave consistently.
    // NOTE: To find a file relative to the schema root, use resolve() instead
    let url = locationToURL(location, this[_internal].cwd);

    return this.files.find((file) => compareURIs(file.url, url));
  }

  /**
   * Determines whether the specified JSON Schema resource URI is in the schema
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

    for (let resource of this.resources) {
      if (compareURIs(resource.uri, uri)) {
        return resource;
      }
    }
  }

  /**
   * Indexes the schema's contents. That is, it scans all files and records all JSON Schema resources,
   * anchors, and references in them.
   *
   * @param versionNumber - The JSON Schema version to use. Defaults to auto-detecting.
   * @returns The same `JsonSchema` instance, to allow for chaining
   */
  public index(versionNumber?: JsonSchemaVersionNumber): this {
    for (let file of this.files) {
      file.index(versionNumber);
    }
    return this;
  }

  /**
   * Resolve a URI to a value in the schema.
   *
   * @param uri - The URI to find in the schema
   * @param versionNumber - The JSON Schema version to use. Defaults to auto-detecting.
   * @returns The resolved value, along with information about how it was resolved
   */
  public resolve(uri: string | URL, versionNumber?: JsonSchemaVersionNumber): Resolution {
    // Create a Reference that resolves the URI from the root of the schema
    let href = uri instanceof URL ? uri.href : uri;
    let ref = new Reference({
      resource: this.rootResource,
      locationInFile: [],
      value: href,
      data: { $ref: href }
    });

    let version = versionNumber ? jsonSchema[versionNumber] : jsonSchema;
    let handleError = createErrorHandler({ file: this.rootFile, code: "ERR_RESOLVE" });
    return version.resolveRef(ref, { handleError });
  }

  /**
   * Determines whether a value is a `JsonSchema` instance
   */
  public static isJsonSchema(value: unknown): value is JsonSchema {
    if (value instanceof JsonSchema) {
      return true;
    }

    // Use duck typing to support interoperability between multiple versions
    // of the @apidevtools/json-schema package
    let schema = value as JsonSchema;
    return schema &&
      typeof schema === "object" &&
      Array.isArray(schema.files) &&
      File.isFile(schema.rootFile);
  }
}
