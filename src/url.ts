import { createError } from "./utils";

const urlSeparatorPattern = /\//g;


/**
 * A wrapper around the `URL` constructor with added validation
 */
export function createURL(urlString: unknown, baseURL?: string | URL): URL {
  if (typeof urlString !== "string") {
    throw createError(TypeError, `Invalid URL: ${urlString}`, {
      code: "ERR_INVALID_URL",
      input: urlString
    });
  }

  return new URL(urlString, baseURL);
}


/**
 * Determines whether two URLs are equivalent. Simply comparing the `URL.href` properties isn't
 * sufficient because the `URL.href` property may include things like empty hashes that cause
 * equivalent URLs to be treated as different.
 */
export function compareURIs(a: URL, b: URL): boolean {
  // NOTE: We start by comparing the properties that are most lilely to be different (e.g. pathname)
  //       to short-circuit as early as possible.
  return a.pathname === b.pathname &&
    a.hash === b.hash &&
    a.hostname === b.hostname &&
    a.search === b.search &&
    a.port === b.port &&
    a.protocol === b.protocol;
}


/**
 * Returns the last path segment of the given URL
 *
 * @example
 *   "http://example.com/my/schema.json?v=1"    ==>   "schema.json"
 *
 */
export function basename({ pathname }: URL): string {
  let segments = pathname.split(urlSeparatorPattern).filter(Boolean);
  return String(segments[segments.length - 1]);
}
