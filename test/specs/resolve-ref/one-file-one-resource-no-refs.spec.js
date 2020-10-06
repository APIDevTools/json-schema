"use strict";

const { JsonSchema } = require("../../../");
const assert = require("../../utils/assert");

describe("resolve: single-file, single-resource schema", () => {
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
      let resolution = schema.resolve("http://example.com/schemas/schema.json#/properties/age", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person#/properties/age"),
        data: person.properties.age,
        locationInFile: {
          tokens: ["properties", "age"],
          path: "/properties/age",
          hash: "#/properties/age",
        },
      });
    });

    it("should resolve a JSON Pointer in the root resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/person#/properties/address/properties/type/enum", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person#/properties/address/properties/type/enum"),
        data: person.properties.address.properties.type.enum,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type", "enum"],
          path: "/properties/address/properties/type/enum",
          hash: "#/properties/address/properties/type/enum",
        },
      });
    });

    it("should fail to resolve a non-existent resource", () => {
      try {
        schema.resolve("http://example.com/schemas/company", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find resource: http://example.com/schemas/company",
          code: "ERR_INVALID_REF",
          value: "http://example.com/schemas/company",
        });
      }
    });

    it("should fail to resolve a non-existent hash in a non-existing resource", () => {
      try {
        schema.resolve("http://example.com/schemas/company#department", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find resource: http://example.com/schemas/company",
          code: "ERR_INVALID_REF",
          value: "http://example.com/schemas/company",
        });
      }
    });

    it("should fail to resolve a non-existent hash", () => {
      try {
        schema.resolve("http://example.com/schemas/person#children", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find #children in http://example.com/schemas/person",
          code: "ERR_INVALID_REF",
          value: "children",
        });
      }
    });

    it("should fail to resolve a non-existent JSON Pointer", () => {
      try {
        schema.resolve("http://example.com/schemas/person#/properties/children", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find /properties/children in http://example.com/schemas/person",
          code: "ERR_INVALID_REF",
          value: "/properties/children",
        });
      }
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

    it("should resolve a nested anchor in the file URL", () => {
      let resolution = schema.resolve("http://example.com/schemas/schema.json#address", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person#address"),
        data: person.properties.address,
        locationInFile: {
          tokens: ["properties", "address"],
          path: "/properties/address",
          hash: "#/properties/address",
        },
      });
    });

    it("should resolve a nested anchor in the root resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/person#address-type", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person#address-type"),
        data: person.properties.address.properties.type,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type"],
          path: "/properties/address/properties/type",
          hash: "#/properties/address/properties/type",
        },
      });
    });

    it("should resolve a JSON Pointer in the file URL", () => {
      let resolution = schema.resolve("http://example.com/schemas/schema.json#/properties/age", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person#/properties/age"),
        data: person.properties.age,
        locationInFile: {
          tokens: ["properties", "age"],
          path: "/properties/age",
          hash: "#/properties/age",
        },
      });
    });

    it("should resolve a JSON Pointer in the root resource URI", () => {
      let resolution = schema.resolve("http://example.com/schemas/person#/properties/address/properties/type/enum", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schemas/schema.json"),
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person#/properties/address/properties/type/enum"),
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
        resource: schema.getResource("http://example.com/schemas/person"),
        uri: new URL("http://example.com/schemas/person#address-type"),
        data: person.properties.address.properties.type,
        locationInFile: {
          tokens: ["properties", "address", "properties", "type"],
          path: "/properties/address/properties/type",
          hash: "#/properties/address/properties/type",
        },
      });
    });

    it("should fail to resolve a non-existent resource", () => {
      try {
        schema.resolve("http://example.com/schemas/company", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find resource: http://example.com/schemas/company",
          code: "ERR_INVALID_REF",
          value: "http://example.com/schemas/company",
        });
      }
    });

    it("should fail to resolve a non-existent hash in a non-existing resource", () => {
      try {
        schema.resolve("http://example.com/schemas/company#department", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find resource: http://example.com/schemas/company",
          code: "ERR_INVALID_REF",
          value: "http://example.com/schemas/company",
        });
      }
    });

    it("should fail to resolve a non-existent hash", () => {
      try {
        schema.resolve("http://example.com/schemas/person#children", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find #children in http://example.com/schemas/person",
          code: "ERR_INVALID_REF",
          value: "children",
        });
      }
    });

    it("should fail to resolve a non-existent JSON Pointer", () => {
      try {
        schema.resolve("http://example.com/schemas/person#/properties/children", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find /properties/children in http://example.com/schemas/person",
          code: "ERR_INVALID_REF",
          value: "/properties/children",
        });
      }
    });
  });
});
