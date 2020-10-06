/* eslint-env browser */
/// <reference lib="dom" />

import { createURL } from "./url";

/**
 * Returns the current page URL
 */
export function getCWD(): string {
  return window.location.href;
}


/**
 * In web browsers, we allow locations to be specified as an absolute or relative URL.
 * If it's relative, then this function resolves it relative to the current web page by default.
 */
export function locationToURL(location: string | URL, cwd?: string): URL {
  if (location instanceof URL) {
    return location;
  }
  else {
    return createURL(location, cwd || getCWD());
  }
}
