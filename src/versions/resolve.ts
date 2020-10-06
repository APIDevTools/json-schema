import { Anchor } from "../anchor";
import { Helpers } from "../errors";
import { Pointer } from "../pointer";
import { Reference } from "../reference";
import { Resolution } from "../resolution";
import { Resource } from "../resource";
import { compareURIs, createURL } from "../url";
import { createError, JsonSchemaVersionInfo, POJO } from "../utils";


/**
 * Resolve a URI to a value in the schema.
 */
export function resolve(ref: Reference, helpers: Helpers, version: JsonSchemaVersionInfo): Resolution {
  let resources = [...ref.schema.resources];
  return resolveInternal(ref.targetURI, resources, helpers, version);
}

/**
 * Resolve a URI to a value in one of the given JSON Schema resources
 */
export function resolveInternal(uri: URL, resources: Resource[], helpers: Helpers, version: JsonSchemaVersionInfo): Resolution {
  // Find the resource that contains this URI
  let resource = resolveResource(uri, resources, version);

  let hash = uri.hash;
  if (!hash || (version.idAllowsHash && resource.uri.hash === hash)) {
    return new Resolution({
      resource,
      uri: resource.uri,
      locationInFile: resource.locationInFile,
      data: resource.data,
    });
  }
  else if (hash.startsWith("#/")) {
    let pointer = new Pointer(hash);
    return resolvePointer(pointer, resource, resources, helpers, version);
  }
  else {
    let anchor = resolveAnchor(hash.slice(1), resource);
    return new Resolution({
      resource,
      uri: typeof (anchor.data as POJO)[version.idKeyword] === "string" ? resource.uri : anchor.uri,
      locationInFile: anchor.locationInFile,
      data: anchor.data,
    });
  }
}


/**
 * Finds the JSON Schema resource that contains a URI
 */
function resolveResource(uri: URL, resources: Resource[], version: JsonSchemaVersionInfo): Resource {
  if (uri.hash) {
    if (version.idAllowsHash) {
      // See if any resources are an exact match for the URI, including the fragment
      let resource = resources.find((res) => compareURIs(res.uri, uri));
      if (resource) {
        return resource;
      }
    }

    // Clone the URI so we can remove the hash without affecting the original
    uri = new URL(uri.href);
    uri.hash = "";
  }

  let resource = resources.find((res) => compareURIs(res.uri, uri) || compareURIs(res.file.url, uri));
  if (!resource) {
    throw createError(URIError, `Cannot find resource: ${uri}`, {
      code: "ERR_INVALID_REF",
      value: uri.href,
    });
  }

  return resource;
}


/**
 * Finds the Anchor with the specified name in the resource
 */
function resolveAnchor(name: string, resource: Resource): Anchor {
  let anchor = resource.anchors.find((a) => a.name === name);
  if (!anchor) {
    throw createError(URIError, `Cannot find #${name} in ${resource.uri}`, {
      code: "ERR_INVALID_REF",
      value: name,
    });
  }

  return anchor;
}


/**
 * Returns the object with the specified data
 */
function lookup<T extends { data: unknown }>(data: unknown, list: T[], parent: { toString(): string }): T {
  let object = list.find((obj) => obj.data === data);
  if (!object) {
    throw createError(Error, `Cannot find value in ${parent}\n  The file may need to be indexed.`, {
      code: "ERR_RESOLVE",
      value: data,
    });
  }

  return object;
}


/**
 * Resolves a JSON Pointer in a resource
 */
function resolvePointer(pointer: Pointer, resource: Resource, resources: Resource[], helpers: Helpers, version: JsonSchemaVersionInfo): Resolution {
  let { idKeyword, anchorKeyword, idAllowsHash } = version;
  let data: any = resource.data;
  let uri = resource.uri;
  let locationInURI: string[] = [];
  let locationInFile = resource.locationInFile.tokens.slice();
  let reference: Reference | undefined;
  let previousStep: Resolution | undefined;

  for (let token of pointer.tokens) {
    resolveToken(token);
  }

  // Resolve the final data value
  if (data && anchorKeyword && typeof data[anchorKeyword] === "string" && typeof data[idKeyword] !== "string") {
    // This is a named anchor, which changes the canonical URI
    let anchor = lookup(data, resource.anchors, resource);
    uri = anchor.uri;
    locationInURI = [];
  }

  if (locationInURI.length > 0) {
    if (idAllowsHash && uri.hash) {
      // The resource URI has a hash, so we can't append a JSON Pointer to it.
      // So use a JSON Pointer from the root resource instead.
      pointer = new Pointer(locationInFile);
      uri = createURL(pointer.hash, resource.file.rootResource.uri);
    }
    else {
      // Append a JSON Pointer to the URI
      pointer = new Pointer(locationInURI);
      uri = createURL(pointer.hash, uri);
    }
  }

  return new Resolution({ uri, data, resource, reference, locationInFile, previousStep });


  /**
   * Reolves a token value in `data`
   */
  function resolveToken(token: string): void {
    reference = undefined;

    if (data && token in data) {
      locationInURI.push(token);
      locationInFile.push(token);
      data = data[token];
    }
    else if (data && typeof data.$ref === "string") {
      resolveRef();
      return resolveToken(token);
    }
    else {
      throw createError(URIError, `Cannot find ${pointer} in ${resource.uri}`, {
        code: "ERR_INVALID_REF",
        value: pointer.path,
      });
    }

    if (typeof data[idKeyword] === "string") {
      // We've moved to a new resource
      resource = lookup(data, resource.file.resources, resource.file);
      uri = resource.uri;
      locationInURI = [];
    }
  }


  /**
   * Resolve the current $ref
   */
  function resolveRef(): void {
    reference = lookup(data, resource.references, resource);
    let step = resolveInternal(reference.targetURI, resources, helpers, version);

    // Add the reference, so users know what led to this step
    step.reference = reference;
    reference = undefined;

    // Add the previous step to resolution chain
    step.firstStep.previousStep = previousStep;
    previousStep = step;

    // Update state variables
    resource = step.resource;
    uri = resource.uri;
    locationInURI = step.locationInFile.tokens.slice(resource.locationInFile.tokens.length);
    locationInFile = step.locationInFile.tokens.slice();
    data = step.data;
  }
}
