"use strict";

const { JsonSchema } = require("../../../../");
const assert = require("../../../utils/assert");
const path = require("../../../utils/path");

describe("resolve: circular reference to itself", () => {
  it("draft-04", () => {
    let data = {
      $schema: "http://json-schema.org/draft-04/schema",
      id: "#person",
      $ref: "schema.json#person",
      properties: {
        name: { type: "string" },
      }
    };
    let schema = new JsonSchema({ url: "schema.json", data });
    let resolution = schema.index().resolve("schema.json#/properties/name");

    assert.resolution(resolution, {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("schema.json#person", path.cwd)),
      uri: new URL("schema.json#/properties/name", path.cwd),
      data: { type: "string" },
      locationInFile: {
        tokens: ["properties", "name"],
        path: "/properties/name",
        hash: "#/properties/name",
      },
    });
  });

  it("2019-09", () => {
    let data = {
      $schema: "https://json-schema.org/draft/2019-09/schema",
      $id: "person",
      $ref: "schema.json#person",
      properties: {
        name: { type: "string" },
      }
    };
    let schema = new JsonSchema({ url: "schema.json", data });
    let resolution = schema.index().resolve("schema.json#/properties/name");

    assert.resolution(resolution, {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("person", path.cwd)),
      uri: new URL("person#/properties/name", path.cwd),
      data: { type: "string" },
      locationInFile: {
        tokens: ["properties", "name"],
        path: "/properties/name",
        hash: "#/properties/name",
      },
    });
  });
});
