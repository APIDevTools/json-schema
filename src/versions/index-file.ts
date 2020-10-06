import { Anchor } from "../anchor";
import { Helpers } from "../errors";
import { File } from "../file";
import { Reference } from "../reference";
import { Resource } from "../resource";
import { createURL } from "../url";
import { createError, isPOJO, JsonSchemaVersionInfo, POJO, toJsonSchemaDocument } from "../utils";


/**
 * Indexes the file contents. That is, it scans the file and records all JSON Schema resources,
 * anchors, and references in it.
 */
export function indexFile(file: File, helpers: Helpers, version: JsonSchemaVersionInfo): void {
  let doc = toJsonSchemaDocument(file.rootResource.data);
  if (!doc) {
    // This file doesn't contain a JSON Schema document, so there's nothing for us to do
    return;
  }

  // Crawl the resource value, finding all the anchors and references
  crawl(doc, [], file.rootResource, helpers, version);
}


/**
 * Performs a depth-first traversal of an object in a JSON Schema document, finding all anchors, references, and sub-resources
 */
function crawl(obj: POJO, locationInFile: string[], resource: Resource, helpers: Helpers, version: JsonSchemaVersionInfo): void {
  let { idKeyword, anchorKeyword, idAllowsHash } = version;

  if (typeof obj[idKeyword] === "string") {
    try {
      // The id keyword can be an absolute or relative URI. It is resolved against the current scope.
      let id = obj[idKeyword] as string;
      let uri = createURL(id, resource.uri);

      if (uri.hash && !idAllowsHash) {
        throw createError(URIError,
          `${idKeyword} cannot include a fragment: ${uri.hash}`,
          { code: "ERR_INVALID_URL", input: id }
        );
      }

      if (locationInFile.length === 0) {
        // This is the root resource. So just update the URI of the existing Resource object
        resource.file.rootResource.uri = uri;
      }
      else {
        // This object is a new resource
        resource = new Resource({
          file: resource.file,
          uri,
          data: obj,
          locationInFile,
        });

        // Add this resource to the file
        resource.file.resources.push(resource);
      }
    }
    catch (error) {
      // Hanndle the error and DON'T crawl this object. But continue crawling the rest of the document.
      helpers.handleError(error, { locationInFile: locationInFile.concat(idKeyword) });
    }
  }

  if (anchorKeyword && typeof obj[anchorKeyword] === "string") {
    try {
      let anchor = new Anchor({ resource, locationInFile, name: obj[anchorKeyword], data: obj });
      resource.anchors.push(anchor);
    }
    catch (error) {
      // Handle the error and continue processing the rest of the object
      helpers.handleError(error, { locationInFile: locationInFile.concat(anchorKeyword) });
    }
  }

  if (typeof obj.$ref === "string") {
    try {
      let reference = new Reference({ resource, locationInFile, value: obj.$ref, data: obj });
      resource.references.push(reference);
    }
    catch (error) {
      // Handle the error and continue processing the rest of the object
      helpers.handleError(error, { locationInFile: locationInFile.concat("$ref") });
    }
  }

  // NOTE: Performance is important here because this code runs on every nested object in a document.
  // Hence the old-fashioned `for` loop and re-used variables.
  let keys = Object.keys(obj);
  let i, j, key, value;

  // Loop through each property of the object
  for (i = 0; i < keys.length; i++) {
    key = keys[i];
    value = obj[key];

    if (Array.isArray(value)) {
      // This property is an array, so loop through its values
      for (j = 0; j < value.length; j++) {
        if (isPOJO(value[j])) {
          // Found an object in the array, so crawl it
          crawl(value[j], locationInFile.concat(key, j.toString()), resource, helpers, version);
        }
      }
    }
    else if (isPOJO(value)) {
      // This property is an object, so crawl it
      crawl(value, locationInFile.concat(key), resource, helpers, version);
    }
  }
}
