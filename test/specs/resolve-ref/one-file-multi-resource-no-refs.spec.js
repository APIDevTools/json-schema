"use strict";

const { JsonSchema } = require("../../../");
const assert = require("../../utils/assert");

describe("resolve: multiple resources in the same file", () => {
  describe("draft-04", () => {
    let person, schema;

    beforeEach("initialize the JSON Schema", () => {
      person = {
        id: "person",
        title: "Person",
        properties: {
          name: { type: "string" },
          age: {
            type: "integer",
            minimum: 0,
          },
          address: {
            id: "address",
            title: "Address",
            properties: {
              type: {
                title: "Address Type",
                type: "string",
                enum: ["home", "work", "school"],
              },
              city: { type: "string" },
              postalCode: { type: "string" }
            }
          }
        }
      };

      schema = new JsonSchema({ url: "http://example.com/schemas/schema.json", data: person });
      schema.index("draft-04");
    });

    it("should resolve the file URL", () => {
      let resolution = schema.resolve("http://example.com/schemas/schema.json", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person"),
        data: person,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve the root resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/person", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person"),
        data: person,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve a JSON Pointer in the file URL", () => {
      let resolution = schema.resolve("http://example.com/schemas/schema.json#/properties/address/properties/type/enum", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/address"),
        uri: new URL("http://example.com/schemas/address#/properties/type/enum"),
        data: person.properties.address.properties.type.enum,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type", "enum"],
          path: "/properties/address/properties/type/enum",
          hash: "#/properties/address/properties/type/enum",
        },
      });
    });

    it("should resolve a JSON Pointer in the root resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/person#/properties/address/properties/type/enum", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/address"),
        uri: new URL("http://example.com/schemas/address#/properties/type/enum"),
        data: person.properties.address.properties.type.enum,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type", "enum"],
          path: "/properties/address/properties/type/enum",
          hash: "#/properties/address/properties/type/enum",
        },
      });
    });

    it("should resolve a JSON Pointer in a sub-resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/address#/properties/type/enum", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/address"),
        uri: new URL("http://example.com/schemas/address#/properties/type/enum"),
        data: person.properties.address.properties.type.enum,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type", "enum"],
          path: "/properties/address/properties/type/enum",
          hash: "#/properties/address/properties/type/enum",
        },
      });
    });
  });

  describe("2019-09", () => {
    let person, schema;

    beforeEach("initialize the JSON Schema", () => {
      person = {
        $id: "person",
        $anchor: "person",
        title: "Person",
        properties: {
          name: { type: "string" },
          age: {
            type: "integer",
            minimum: 0,
          },
          address: {
            $id: "address",
            $anchor: "address",
            title: "Address",
            properties: {
              type: {
                $anchor: "address-type",
                title: "Address Type",
                type: "string",
                enum: ["home", "work", "school"],
              },
              city: { type: "string" },
              postalCode: { type: "string" }
            }
          }
        }
      };

      schema = new JsonSchema({ url: "http://example.com/schemas/schema.json", data: person });
      schema.index("2019-09");
    });

    it("should resolve the file URL", () => {
      let resolution = schema.resolve("http://example.com/schemas/schema.json", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person"),
        data: person,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve the root resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/person", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person"),
        data: person,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve the root anchor in the file URL", () => {
      let resolution = schema.resolve("http://example.com/schemas/schema.json#person", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person"),
        data: person,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve the root anchor in the root resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/person#person", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person"),
        data: person,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve the root anchor in a sub-resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/address#address", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/address"),
        uri: new URL("http://example.com/schemas/address"),
        data: person.properties.address,
        locationInFile: {
          tokens: ["properties", "address"],
          path: "/properties/address",
          hash: "#/properties/address",
        },
      });
    });

    it("should resolve a nested anchor in a sub-resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/address#address-type", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/address"),
        uri: new URL("http://example.com/schemas/address#address-type"),
        data: person.properties.address.properties.type,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type"],
          path: "/properties/address/properties/type",
          hash: "#/properties/address/properties/type",
        },
      });
    });

    it("should resolve a JSON Pointer in the file URL", () => {
      let resolution = schema.resolve("http://example.com/schemas/schema.json#/properties/address/properties/type/enum", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/address"),
        uri: new URL("http://example.com/schemas/address#/properties/type/enum"),
        data: person.properties.address.properties.type.enum,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type", "enum"],
          path: "/properties/address/properties/type/enum",
          hash: "#/properties/address/properties/type/enum",
        },
      });
    });

    it("should resolve a JSON Pointer in the root resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/person#/properties/address/properties/type/enum", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/address"),
        uri: new URL("http://example.com/schemas/address#/properties/type/enum"),
        data: person.properties.address.properties.type.enum,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type", "enum"],
          path: "/properties/address/properties/type/enum",
          hash: "#/properties/address/properties/type/enum",
        },
      });
    });

    it("should resolve a JSON Pointer in a sub-resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/address#/properties/type/enum", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/address"),
        uri: new URL("http://example.com/schemas/address#/properties/type/enum"),
        data: person.properties.address.properties.type.enum,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type", "enum"],
          path: "/properties/address/properties/type/enum",
          hash: "#/properties/address/properties/type/enum",
        },
      });
    });

    it("should resolve a JSON Pointer to an anchor", () => {
      let resolution = schema.resolve("http://example.com/schemas/person#/properties/address/properties/type", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/address"),
        uri: new URL("http://example.com/schemas/address#address-type"),
        data: person.properties.address.properties.type,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type"],
          path: "/properties/address/properties/type",
          hash: "#/properties/address/properties/type",
        },
      });
    });

    it("should fail to resolve a sub-resource anchor in the file URL", () => {
      try {
        schema.resolve("http://example.com/schemas/schema.json#address", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find #address in http://example.com/schemas/person",
          code: "ERR_INVALID_REF",
          value: "address",
        });
      }
    });

    it("should fail to resolve a sub-resource anchor in the root resource URI", () => {
      try {
        schema.resolve("http://example.com/schemas/person#address-type", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find #address-type in http://example.com/schemas/person",
          code: "ERR_INVALID_REF",
          value: "address-type",
        });
      }
    });

    it("should fail to resolve a root-resource anchor in the sub-resource URI", () => {
      try {
        schema.resolve("http://example.com/schemas/address#person", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find #person in http://example.com/schemas/address",
          code: "ERR_INVALID_REF",
          value: "person",
        });
      }
    });
  });
});
