export * from "./createErrorHandler";
export * from "./schema-error";


/**
 * Additional information that can be added to an error when calling `handleError`
 */
export interface ErrorProps {
  code?: string;
  locationInFile?: string[];
  originalError?: Error | unknown;
  [key: string]: unknown;
}


/**
 * Helpful information and utilities that are passed to JSON Schema version implementations
 */
export interface Helpers {
  /**
   * Handles errors appropriately, based on user-specified options.
   * This may throw the error, or it may simply record the error and return.
   *
   * @param error - The error that occurred
   */
  handleError(error: Error | unknown): void;

  /**
   * Handles errors appropriately, based on user-specified options.
   * This may throw the error, or it may simply record the error and return.
   *
   * @param error - The error that occurred
   * @param props - Additional properties to add to the error when recording or re-throwing it
   */
  handleError(error: Error | unknown, props: ErrorProps): void;

  /**
   * Handles errors appropriately, based on user-specified options.
   * This may throw the error, or it may simply record the error and return.
   *
   * @param error - The error that occurred
   * @param message - A message to prepend to the original error's message
   * @param props - Additional properties to add to the error when recording or re-throwing it
   */
  handleError(error: Error | unknown, message: string, props?: ErrorProps): void;
}
