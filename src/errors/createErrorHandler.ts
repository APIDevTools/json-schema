import { File } from "../file";
import { Pointer } from "../pointer";
import { ErrorProps, Helpers } from "./index";
import { SchemaError } from "./schema-error";


export interface ErrorHandlerOptions {
  file: File;
  code: string;
  message?: string;
  continueOnError?: boolean;
}


/**
 * Returns a function that handles errors by either recording them or re-throwing them
 */
export function createErrorHandler(options: ErrorHandlerOptions): Helpers["handleError"] {
  let { file, code } = options;
  options.message = options.message || `Error in ${file}`;

  return function handleError(error: SchemaError, arg2?: string | object, arg3?: object) {
    // Don't re-wrap errors that have already been handled.
    // (this happens if the error is caught again in a higher-level catch clause)
    if (!file.errors.includes(error)) {
      error = wrapError(error, arg2, arg3);
      file.errors.push(error);
    }

    if (!options.continueOnError) {
      throw error;
    }
  };

  /**
   * Wraps an error in a `SchemaError`
   */
  function wrapError(error: SchemaError, arg2?: string | object, arg3?: object) {
    let message = "";
    let props: ErrorProps = {};

    // Handle optional arguments and overloads
    if (typeof arg2 === "object") {
      props = arg2 as ErrorProps;
    }
    else {
      message = arg2 as string;
      if (arg3) {
        props = arg3 as ErrorProps;
      }
    }

    let locationInFile = props.locationInFile ? new Pointer(props.locationInFile) : undefined;
    let originalError = props.originalError || error.originalError || error;

    // Make sure originalError is the most deeply-nested error
    while ((originalError as ErrorProps).originalError) {
      originalError = (originalError as ErrorProps).originalError;
    }

    if (!message) {
      // Create a default error message
      message = locationInFile ? `${options.message} at ${locationInFile}` : options.message!;
    }

    message += `\n  ${error.message}`;

    return new SchemaError(Object.assign({}, originalError, error, props, {
      code, file, message, locationInFile, originalError
    }));
  }
}
