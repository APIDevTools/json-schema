"use strict";

const { JsonSchema } = require("../../../");
const assert = require("../../utils/assert");
const path = require("../../utils/path");

describe("resolve: primitive values", () => {
  it("draft-04", () => {
    let data = {
      $schema: "http://json-schema.org/draft-04/schema",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        age: {
          type: "integer",
          minimum: 0,
        },
      }
    };
    let schema = new JsonSchema({ url: "schema.json", data });
    schema.index();

    // Reference to a boolean
    assert.resolution(schema.resolve("schema.json#/additionalProperties"), {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("schema.json", path.cwd)),
      uri: new URL("schema.json#/additionalProperties", path.cwd),
      data: false,
      locationInFile: {
        tokens: ["additionalProperties"],
        path: "/additionalProperties",
        hash: "#/additionalProperties",
      },
    });

    // Reference to a string
    assert.resolution(schema.resolve("schema.json#/properties/age/type"), {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("schema.json", path.cwd)),
      uri: new URL("schema.json#/properties/age/type", path.cwd),
      data: "integer",
      locationInFile: {
        tokens: ["properties", "age", "type"],
        path: "/properties/age/type",
        hash: "#/properties/age/type",
      },
    });

    // Reference to a number
    assert.resolution(schema.resolve("schema.json#/properties/age/minimum"), {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("schema.json", path.cwd)),
      uri: new URL("schema.json#/properties/age/minimum", path.cwd),
      data: 0,
      locationInFile: {
        tokens: ["properties", "age", "minimum"],
        path: "/properties/age/minimum",
        hash: "#/properties/age/minimum",
      },
    });
  });

  it("2019-09", () => {
    let data = {
      $schema: "https://json-schema.org/draft/2019-09/schema",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        age: {
          type: "integer",
          minimum: 0,
        },
      }
    };
    let schema = new JsonSchema({ url: "schema.json", data });
    schema.index();

    // Reference to a boolean
    assert.resolution(schema.resolve("schema.json#/additionalProperties"), {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("schema.json", path.cwd)),
      uri: new URL("schema.json#/additionalProperties", path.cwd),
      data: false,
      locationInFile: {
        tokens: ["additionalProperties"],
        path: "/additionalProperties",
        hash: "#/additionalProperties",
      },
    });

    // Reference to a string
    assert.resolution(schema.resolve("schema.json#/properties/age/type"), {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("schema.json", path.cwd)),
      uri: new URL("schema.json#/properties/age/type", path.cwd),
      data: "integer",
      locationInFile: {
        tokens: ["properties", "age", "type"],
        path: "/properties/age/type",
        hash: "#/properties/age/type",
      },
    });

    // Reference to a number
    assert.resolution(schema.resolve("schema.json#/properties/age/minimum"), {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("schema.json", path.cwd)),
      uri: new URL("schema.json#/properties/age/minimum", path.cwd),
      data: 0,
      locationInFile: {
        tokens: ["properties", "age", "minimum"],
        path: "/properties/age/minimum",
        hash: "#/properties/age/minimum",
      },
    });
  });
});
