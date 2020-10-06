import { File } from "../file";
import { JsonSchema } from "../json-schema";
import { Pointer } from "../pointer";


/**
 * The arguments that can be passed to the `SchemaError` constructor
 */
export interface SchemaErrorArgs {
  code: string;
  file: File;
  message: string;
  locationInFile?: Pointer;
  originalError?: Error | unknown;
  [key: string]: unknown;
}


/**
 * An error in a JSON Schema
 */
export class SchemaError extends Error {
  /**
   * A code that indicates the type of error (e.g. ERR_INVALID_URL)
   */
  public code!: string;

  /**
   * The JSON schema, including all files that were successfully read
   */
  public schema!: JsonSchema;

  /**
   * The file that contains or caused this error
   */
  public file!: File;

  /**
   * The location in the file where the error occurred, if known
   */
  public locationInFile?: Pointer;

  /**
   * The original error that occurred
   */
  public originalError?: Error;

  public constructor(args: SchemaErrorArgs) {
    super(args.message);
    Object.assign(this, args, {
      schema: args.file.schema
    });
    this.name = "SchemaError";
  }
}
