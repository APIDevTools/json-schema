"use strict";

const { JsonSchema } = require("../../../../");
const assert = require("../../../utils/assert");
const path = require("../../../utils/path");

describe("resolve: circular cross-references between schemas", () => {
  it("draft-04", () => {
    let data = {
      $schema: "http://json-schema.org/draft-04/schema",
      definitions: {
        parent: {
          id: "#parent",
          properties: {
            name: { type: "string" },
            children: {
              type: "array",
              items: { $ref: "#child" },
            },
          },
        },
        child: {
          id: "#child",
          properties: {
            name: { type: "string" },
            parent: { $ref: "#parent" },
          }
        }
      },
    };
    let schema = new JsonSchema({ url: "schema.json", data });
    let resolution = schema.index().resolve("schema.json#/definitions/child/properties/parent/properties/name");

    assert.resolution(resolution, {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("schema.json#parent", path.cwd)),
      uri: new URL("schema.json#/definitions/parent/properties/name", path.cwd),
      data: { type: "string" },
      locationInFile: {
        tokens: ["definitions", "parent", "properties", "name"],
        path: "/definitions/parent/properties/name",
        hash: "#/definitions/parent/properties/name",
      },
      previousStep: {
        file: schema.getFile("schema.json"),
        resource: schema.getResource(new URL("schema.json#parent", path.cwd)),
        uri: new URL("schema.json#parent", path.cwd),
        data: data.definitions.parent,
        locationInFile: {
          tokens: ["definitions", "parent"],
          path: "/definitions/parent",
          hash: "#/definitions/parent",
        },
        reference: {
          file: schema.getFile("schema.json"),
          resource: schema.getResource(new URL("schema.json#child", path.cwd)),
          targetURI: new URL("schema.json#parent", path.cwd),
          value: "#parent",
          data: { $ref: "#parent" },
          locationInFile: {
            tokens: ["definitions", "child", "properties", "parent"],
            path: "/definitions/child/properties/parent",
            hash: "#/definitions/child/properties/parent",
          },
        }
      }
    });
  });

  it("2019-09", () => {
    let data = {
      $schema: "https://json-schema.org/draft/2019-09/schema",
      $defs: {
        parent: {
          $id: "parent",
          properties: {
            name: { type: "string" },
            children: {
              type: "array",
              items: { $ref: "child" },
            },
          },
        },
        child: {
          $id: "child",
          properties: {
            name: { type: "string" },
            parent: { $ref: "parent" },
          }
        }
      },
    };
    let schema = new JsonSchema({ url: "schema.json", data });
    let resolution = schema.index().resolve("schema.json#/$defs/child/properties/parent/properties/name");

    assert.resolution(resolution, {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("parent", path.cwd)),
      uri: new URL("parent#/properties/name", path.cwd),
      data: { type: "string" },
      locationInFile: {
        tokens: ["$defs", "parent", "properties", "name"],
        path: "/$defs/parent/properties/name",
        hash: "#/$defs/parent/properties/name",
      },
      previousStep: {
        file: schema.getFile("schema.json"),
        resource: schema.getResource(new URL("parent", path.cwd)),
        uri: new URL("parent", path.cwd),
        data: data.$defs.parent,
        locationInFile: {
          tokens: ["$defs", "parent"],
          path: "/$defs/parent",
          hash: "#/$defs/parent",
        },
        reference: {
          file: schema.getFile("schema.json"),
          resource: schema.getResource(new URL("child", path.cwd)),
          targetURI: new URL("parent", path.cwd),
          value: "parent",
          data: { $ref: "parent" },
          locationInFile: {
            tokens: ["$defs", "child", "properties", "parent"],
            path: "/$defs/child/properties/parent",
            hash: "#/$defs/child/properties/parent",
          },
        }
      }
    });
  });
});
