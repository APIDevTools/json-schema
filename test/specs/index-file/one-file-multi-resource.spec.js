"use strict";

const { JsonSchema } = require("../../../");
const assert = require("../../utils/assert");

describe("indexFile: multiple resources in the same file", () => {
  it("draft-04", () => {
    let person = {
      id: "person",
      title: "Person",
      properties: {
        name: { type: "string" },
        address: {
          id: "address",
          title: "Address",
          properties: {
            type: {
              id: "address-type",
              title: "Address Type",
              enum: ["home", "work", "school"],
            },
            city: { type: "string" },
            postalCode: { type: "string" }
          }
        }
      }
    };

    let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
    schema.index("draft-04");

    assert.schema(schema, {
      files: [{
        url: new URL("http://example.com/schema.json"),
        path: "schema.json",
        resources: [
          {
            uri: new URL("http://example.com/person"),
            data: person,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          },
          {
            uri: new URL("http://example.com/address"),
            data: person.properties.address,
            locationInFile: {
              tokens: ["properties", "address"],
              path: "/properties/address",
              hash: "#/properties/address",
            },
          },
          {
            uri: new URL("http://example.com/address-type"),
            data: person.properties.address.properties.type,
            locationInFile: {
              tokens: ["properties", "address", "properties", "type"],
              path: "/properties/address/properties/type",
              hash: "#/properties/address/properties/type",
            },
          },
        ]
      }],
    });
  });

  it("2019-09", () => {
    let person = {
      $id: "person",
      title: "Person",
      properties: {
        name: { type: "string" },
        address: {
          $id: "address",
          title: "Address",
          properties: {
            type: {
              $id: "address-type",
              title: "Address Type",
              enum: ["home", "work", "school"],
            },
            city: { type: "string" },
            postalCode: { type: "string" }
          }
        }
      }
    };

    let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
    schema.index("2019-09");

    assert.schema(schema, {
      files: [{
        url: new URL("http://example.com/schema.json"),
        path: "schema.json",
        resources: [
          {
            uri: new URL("http://example.com/person"),
            data: person,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          },
          {
            uri: new URL("http://example.com/address"),
            data: person.properties.address,
            locationInFile: {
              tokens: ["properties", "address"],
              path: "/properties/address",
              hash: "#/properties/address",
            },
          },
          {
            uri: new URL("http://example.com/address-type"),
            data: person.properties.address.properties.type,
            locationInFile: {
              tokens: ["properties", "address", "properties", "type"],
              path: "/properties/address/properties/type",
              hash: "#/properties/address/properties/type",
            },
          },
        ]
      }],
    });
  });
});
