/* eslint-env node */
/// <reference types="node" />
/// <reference lib="dom" />

import * as path from "path";
import { pathToFileURL } from "url";

// Tests whether a string is an absolute URL
const absoluteUrlPattern = /^(\w{2,}):\/\//;


/**
 * Returns the current working directory as a "file://" URL
 */
export function getCWD(): string {
  return process.cwd();
}


/**
 * In Node.js, we allow file locations to be specified as a filesystem path or as a URL.
 * This function disambiguates those and returns a parsed "file://" or "http(s)://" URL.
 */
export function locationToURL(location: string | URL, cwd?: string): URL {
  if (location instanceof URL) {
    return location;
  }
  else if (absoluteUrlPattern.test(location)) {
    // Looks like the location is a URL, so parse it to ensure it's valid
    return new URL(location);
  }
  else {
    // Looks like this is a local filesystem path
    let absolutePath = path.resolve(cwd || getCWD(), location);
    return pathToFileURL(absolutePath);
  }
}
