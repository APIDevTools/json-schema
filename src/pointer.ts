
const tildePattern = /~/g;
const slashPattern = /\//g;
const encodedTildePattern = /~0/g;
const encodedSlashPattern = /~1/g;

/**
 * Characters that are allowed in a URI fragment
 *
 * @see https://tools.ietf.org/html/rfc3986#appendix-A
 */
const fragmentChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~!$&'()*+,;=:@/?";

/**
 * A JSON Pointer
 *
 * @see https://tools.ietf.org/html/rfc6901
 */
export class Pointer {
  /**
   * The tokens in the JSON Pointer path
   */
  public tokens: string[];

  public constructor(pointer: string | string[]) {
    if (Array.isArray(pointer)) {
      this.tokens = pointer.slice();
    }
    else {
      if (pointer[0] === "#") {
        // This is a URL fragment, so decode it
        pointer = decodeURIComponent(pointer.slice(1));
      }
      this.tokens = deserialize(pointer);
    }
  }

  /**
   * The JSON Pointer path (e.g. "/$defs/person/properties/first name")
   *
   * NOTE: Per the spec, the characters `~` and `/` in a token are encoded as `~0` and `~1`
   *
   * @see https://tools.ietf.org/html/rfc6901#section-3
   */
  public get path(): string {
    return serialize(this.tokens);
  }

  /**
   * The JSON Pointer path as a URL fragment (e.g. "#/$defs/person/properties/first%20name")
   *
   * @see https://tools.ietf.org/html/rfc6901#section-6
   */
  public get hash(): string {
    return "#" + encodeHash(serialize(this.tokens));
  }

  /**
   * Returns the JSON Pointer path
   */
  public toString(): string {
    return this.path || "pointer";
  }
}


/**
 * Deserializes a JSON Pointer string into an array of tokens
 *
 * @see https://tools.ietf.org/html/rfc6901#section-3
 */
function deserialize(pointer: string): string[] {
  if (pointer.length === 0) {
    return [];
  }

  // Split the pointer into tokens
  let tokens = pointer.slice(1).split("/");

  // Decode each token
  for (let i = 0; i < tokens.length; i++) {
    tokens[i] = tokens[i].replace(encodedTildePattern, "~").replace(encodedSlashPattern, "/");
  }

  return tokens;
}


/**
 * Serializes an array of tokens into a JSON Pointer string
 *
 * @see https://tools.ietf.org/html/rfc6901#section-3
 */
function serialize(tokens: string[]): string {
  if (tokens.length === 0) {
    return "";
  }

  let encoded = new Array<string>(tokens.length);

  for (let i = 0; i < tokens.length; i++) {
    encoded[i] = tokens[i].replace(tildePattern, "~0").replace(slashPattern, "~1");
  }

  return "/" + encoded.join("/");
}


/**
 * Encodes a JSON Pointer for use as a URI fragment
 */
function encodeHash(pointer: string): string {
  // NOTE: Performance is important here because it runs for every character in every pointer.
  // Hence the old-fashioned `for` loop, re-used variables, and labels
  let i, j, char;
  let encoded = "";

  /* eslint-disable no-labels */
  pointerLoop: for (i = 0; i < pointer.length; i++) {
    char = pointer[i];

    // Determine if this character is legal in a URI fragment
    for (j = 0; j < fragmentChars.length; j++) {
      if (char === fragmentChars[j]) {
        // This character is legal
        encoded += char;
        continue pointerLoop;
      }
    }

    // If we get here, then the character is NOT legal and must be encoded
    encoded += encodeURIComponent(char);
  }

  return encoded;
}
