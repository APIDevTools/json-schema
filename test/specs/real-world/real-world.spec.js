/* eslint-env node */
"use strict";

const { JsonSchema } = require("../../../");
const { host } = require("@jsdevtools/host-environment");
const download = require("./download");
const handleError = require("./known-errors");

// How many APIs to test in "quick mode" and normal mode
const START_AT_INDEX = 0;
const MAX_APIS_TO_TEST = START_AT_INDEX + ((!host.node || process.argv.includes("--quick-test")) ? 10 : 1700);

describe("Real-world API definitions", () => {
  let realWorldAPIs = [];

  before(async function () {
    // This hook sometimes takes several seconds, due to the large download
    this.timeout(10000);

    // Download a list of over 1700 real-world OpenAPI definitions from apis.guru
    realWorldAPIs = await download.listOfAPIs();
  });

  beforeEach(function () {
    // Increase the timeouts by A LOT because:
    //   1) CI is really slow
    //   2) Some API definitions are HUGE and take a while to download
    //   3) If the download fails, we retry 2 times, which takes even more time
    //   4) Really large API definitions take longer to parse
    this.currentTest.timeout(host.ci ? 120000 : 30000);     // 2 minutes in CI, 30 seconds locally
    this.currentTest.slow(5000);
  });

  // Mocha requires us to create our tests synchronously. But the list of APIs is downloaded asynchronously.
  // So, we just create a bunch of placeholder tests, and then rename them later to reflect which API they're testing.
  for (let index = START_AT_INDEX; index < MAX_APIS_TO_TEST; index++) {
    it(title(index), async function () {  // eslint-disable-line no-loop-func
      let api = realWorldAPIs[index];
      if (!api) return;

      let { name, url } = api;
      let resourceCount = 0, anchorCount = 0, refCount = 0;
      this.test.title = title(index, name, resourceCount, anchorCount, refCount);

      let data = await download.api(url);
      if (!data) return;

      try {
        let jsonSchemaVersionNumber = getJsonSchemaVersionNumber(data);
        let schema = new JsonSchema({ url, data });

        // Index all the resources, anchors, and references in the schema
        schema.index(jsonSchemaVersionNumber);

        // Resolve all the references in the schema
        for (let resource of schema.resources) {
          anchorCount += resource.anchors.length;
          this.test.title = title(index, name, ++resourceCount, anchorCount, refCount);

          for (let references of resource.references) {
            schema.resolve(references.targetURI, jsonSchemaVersionNumber);
            this.test.title = title(index, name, resourceCount, anchorCount, ++refCount);
          }
        }
      }
      catch (error) {
        handleError(name, url, error);
      }
    });
  }
});


/**
 * Formats the test titles
 */
function title (index, name = "", resourceCount = 0, anchorCount = 0, refCount = 0) {
  return `${(index + 1).toString().padStart(4)}  ` +
    `${name.padEnd(35).slice(0, 35)}  ` +
    `resources: ${resourceCount.toString().padEnd(3)}  ` +
    `$anchors: ${anchorCount.toString().padEnd(3)}  ` +
    `$refs: ${refCount}`;
}


/**
 * Returns the JSON Schema version number that corresponds to the Swagger/OpenAPI version number
 */
function getJsonSchemaVersionNumber ({ swagger, openapi }) {
  if (swagger && swagger.startsWith("2.0")) {
    // Swagger 2.0 uses JSON Schema Draft 4
    return "draft-04";
  }
  else if (openapi && openapi.startsWith("3.0")) {
    // OpenAPI 3.0 uses JSON Schema Wright Draft 00 (a.k.a. Draft 5).
    // This library doesn't officially support Draft 5, but it's nearly identical to Draft 4.
    return "draft-04";
  }
  else if (openapi && openapi.startsWith("3.1")) {
    // OpenAPI 3.1 uses JSON Schema 2019-09
    return "2019-09";
  }
  else {
    throw new Error(`Unknown Swagger/OpenAPI version: ${swagger || openapi}`);
  }
}
