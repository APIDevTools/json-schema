"use strict";

const { JsonSchema, File } = require("../../../");
const assert = require("../../utils/assert");

describe("indexFile: multi-file schema", () => {
  it("draft-04", () => {
    let person = {
      id: "person",
      title: "Person",
      properties: {
        name: { type: "string" },
        address: { $ref: "address" }
      }
    };
    let address = {
      id: "address",
      title: "Address",
      properties: {
        type: { $ref: "address-type" },
        city: { type: "string" },
        postalCode: { type: "string" }
      }
    };
    let addressType = {
      id: "address-type",
      title: "Address Type",
      enum: ["home", "work", "school"],
    };

    let schema = new JsonSchema({ url: "http://example.com/schemas/person.json", data: person });
    schema.files.push(new File({ url: "http://example.com/schemas/address.json", schema, data: address }));
    schema.files.push(new File({ url: "http://example.com/schemas/address-type.json", schema, data: addressType }));
    schema.index("draft-04");

    assert.schema(schema, {
      files: [
        {
          url: new URL("http://example.com/schemas/person.json"),
          path: "person.json",
          resources: [{
            uri: new URL("http://example.com/schemas/person"),
            data: person,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            references: [{
              value: "address",
              targetURI: new URL("http://example.com/schemas/address"),
              locationInFile: {
                tokens: ["properties", "address"],
                path: "/properties/address",
                hash: "#/properties/address",
              },
              data: { $ref: "address" },
            }],
          }],
        },
        {
          url: new URL("http://example.com/schemas/address.json"),
          path: "address.json",
          resources: [{
            uri: new URL("http://example.com/schemas/address"),
            data: address,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            references: [{
              value: "address-type",
              targetURI: new URL("http://example.com/schemas/address-type"),
              locationInFile: {
                tokens: ["properties", "type"],
                path: "/properties/type",
                hash: "#/properties/type",
              },
              data: { $ref: "address-type" },
            }],
          }],
        },
        {
          url: new URL("http://example.com/schemas/address-type.json"),
          path: "address-type.json",
          resources: [{
            uri: new URL("http://example.com/schemas/address-type"),
            data: addressType,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }],
        },
      ],
    });
  });

  it("2019-09", () => {
    let person = {
      $id: "person",
      title: "Person",
      properties: {
        name: { type: "string" },
        address: { $ref: "address" }
      }
    };
    let address = {
      $id: "address",
      title: "Address",
      properties: {
        type: { $ref: "address-type" },
        city: { type: "string" },
        postalCode: { type: "string" }
      }
    };
    let addressType = {
      $id: "address-type",
      title: "Address Type",
      enum: ["home", "work", "school"],
    };

    let schema = new JsonSchema({ url: "http://example.com/schemas/person.json", data: person });
    schema.files.push(new File({ url: "http://example.com/schemas/address.json", schema, data: address }));
    schema.files.push(new File({ url: "http://example.com/schemas/address-type.json", schema, data: addressType }));
    schema.index("2019-09");

    assert.schema(schema, {
      files: [
        {
          url: new URL("http://example.com/schemas/person.json"),
          path: "person.json",
          resources: [{
            uri: new URL("http://example.com/schemas/person"),
            data: person,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            references: [{
              value: "address",
              targetURI: new URL("http://example.com/schemas/address"),
              locationInFile: {
                tokens: ["properties", "address"],
                path: "/properties/address",
                hash: "#/properties/address",
              },
              data: { $ref: "address" },
            }],
          }],
        },
        {
          url: new URL("http://example.com/schemas/address.json"),
          path: "address.json",
          resources: [{
            uri: new URL("http://example.com/schemas/address"),
            data: address,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            references: [{
              value: "address-type",
              targetURI: new URL("http://example.com/schemas/address-type"),
              locationInFile: {
                tokens: ["properties", "type"],
                path: "/properties/type",
                hash: "#/properties/type",
              },
              data: { $ref: "address-type" },
            }],
          }],
        },
        {
          url: new URL("http://example.com/schemas/address-type.json"),
          path: "address-type.json",
          resources: [{
            uri: new URL("http://example.com/schemas/address-type"),
            data: addressType,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }],
        },
      ],
    });
  });
});
