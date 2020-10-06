"use strict";

const { File, JsonSchema } = require("../../../");
const assert = require("../../utils/assert");

describe("resolve: multi-file schema with $refs", () => {
  describe("draft-04", () => {
    let schema, root, person, address;

    beforeEach("initialize the JSON Schema", () => {
      root = {
        definitions: {
          person: { $ref: "person" },
          addressType: { $ref: "address#address-type" },
          homeAddress: {
            id: "home-address",
            $ref: "address",
            properties: {
              type: { const: "home" },
            },
          },
          workAddress: {
            id: "#work-address",
            $ref: "address",
            properties: {
              type: { const: "work" },
            },
          },
          schoolAddress: {
            $ref: "address",
            properties: {
              type: { const: "school" },
            },
          },
        }
      };
      person = {
        id: "person",
        title: "Person",
        properties: {
          name: { type: "string" },
          age: {
            type: "integer",
            minimum: 0,
          },
          homeAddress: { $ref: "home-address" },
          workAddress: { $ref: "schema.json#work-address" },
          schoolAddress: { $ref: "schema.json#/definitions/schoolAddress" },
        }
      };
      address = {
        id: "address",
        title: "Address",
        properties: {
          type: { $ref: "schema.json#address-type" },
          city: { type: "string" },
          postalCode: { type: "string" }
        },
        definitions: {
          addressType: {
            title: "Address Type",
            type: "string",
            enum: ["home", "work", "school"],
          }
        }
      };

      schema = new JsonSchema({ url: "http://example.com/schema.json", data: root });
      schema.files.push(new File({ url: "http://example.com/person.json", schema, data: person }));
      schema.files.push(new File({ url: "http://example.com/address.json", schema, data: address }));
      schema.index("draft-04");
    });

    it("should resolve the main file URL", () => {
      let resolution = schema.resolve("http://example.com/schema.json", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schema.json"),
        resource: schema.getResource("http://example.com/schema.json"),
        uri: new URL("http://example.com/schema.json"),
        data: root,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve a secondary file URL", () => {
      let resolution = schema.resolve("http://example.com/address.json", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/address.json"),
        resource: schema.getResource("http://example.com/address"),
        uri: new URL("http://example.com/address"),
        data: address,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve a root-resource URI", () => {
      let resolution = schema.resolve("http://example.com/person", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/person.json"),
        resource: schema.getResource("http://example.com/person"),
        uri: new URL("http://example.com/person"),
        data: person,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve a sub-resource URI", () => {
      let resolution = schema.resolve("http://example.com/home-address", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schema.json"),
        resource: schema.getResource("http://example.com/home-address"),
        uri: new URL("http://example.com/home-address"),
        data: root.definitions.homeAddress,
        locationInFile: {
          tokens: ["definitions", "homeAddress"],
          path: "/definitions/homeAddress",
          hash: "#/definitions/homeAddress",
        },
      });
    });

    it("should resolve a JSON Pointer in a file URL", () => {
      let resolution = schema.resolve("http://example.com/person.json#/properties/age", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/person.json"),
        resource: schema.getResource("http://example.com/person"),
        uri: new URL("http://example.com/person#/properties/age"),
        data: person.properties.age,
        locationInFile: {
          tokens: ["properties", "age"],
          path: "/properties/age",
          hash: "#/properties/age",
        },
      });
    });

    it("should resolve a JSON Pointer in a resource URI", () => {
      let resolution = schema.resolve("http://example.com/person#/properties/age", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/person.json"),
        resource: schema.getResource("http://example.com/person"),
        uri: new URL("http://example.com/person#/properties/age"),
        data: person.properties.age,
        locationInFile: {
          tokens: ["properties", "age"],
          path: "/properties/age",
          hash: "#/properties/age",
        },
      });
    });

    it("should resolve a JSON Pointer to a reference", () => {
      let resolution = schema.resolve("http://example.com/schema.json#/definitions/schoolAddress", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schema.json"),
        resource: schema.getResource("http://example.com/schema.json"),
        uri: new URL("http://example.com/schema.json#/definitions/schoolAddress"),
        data: root.definitions.schoolAddress,
        locationInFile: {
          tokens: ["definitions", "schoolAddress"],
          path: "/definitions/schoolAddress",
          hash: "#/definitions/schoolAddress",
        },
      });
    });

    it("should resolve a transitive JSON Pointer in a file URL", () => {
      let resolution = schema.resolve("http://example.com/schema.json#/definitions/person/properties/homeAddress/definitions/addressType", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/address.json"),
        resource: schema.getResource("http://example.com/address"),
        uri: new URL("http://example.com/address#/definitions/addressType"),
        data: address.definitions.addressType,
        locationInFile: {
          tokens: ["definitions", "addressType"],
          path: "/definitions/addressType",
          hash: "#/definitions/addressType",
        },
        previousStep: {
          file: schema.getFile("http://example.com/address.json"),
          resource: schema.getResource("http://example.com/address"),
          uri: new URL("http://example.com/address"),
          data: address,
          locationInFile: {
            tokens: [],
            path: "",
            hash: "#",
          },
          reference: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/home-address"),
            value: "address",
            targetURI: new URL("http://example.com/address"),
            data: root.definitions.homeAddress,
            locationInFile: {
              tokens: ["definitions", "homeAddress"],
              path: "/definitions/homeAddress",
              hash: "#/definitions/homeAddress",
            },
          },
          previousStep: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/home-address"),
            uri: new URL("http://example.com/home-address"),
            data: root.definitions.homeAddress,
            locationInFile: {
              tokens: ["definitions", "homeAddress"],
              path: "/definitions/homeAddress",
              hash: "#/definitions/homeAddress",
            },
            reference: {
              file: schema.getFile("http://example.com/person.json"),
              resource: schema.getResource("http://example.com/person"),
              value: "home-address",
              targetURI: new URL("http://example.com/home-address"),
              data: person.properties.homeAddress,
              locationInFile: {
                tokens: ["properties", "homeAddress"],
                path: "/properties/homeAddress",
                hash: "#/properties/homeAddress",
              },
            },
            previousStep: {
              file: schema.getFile("http://example.com/person.json"),
              resource: schema.getResource("http://example.com/person"),
              uri: new URL("http://example.com/person"),
              data: person,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
              reference: {
                file: schema.getFile("http://example.com/schema.json"),
                resource: schema.getResource("http://example.com/schema.json"),
                value: "person",
                targetURI: new URL("http://example.com/person"),
                data: root.definitions.person,
                locationInFile: {
                  tokens: ["definitions", "person"],
                  path: "/definitions/person",
                  hash: "#/definitions/person",
                },
              },
            },
          },
        },
      });
    });

    it("should resolve a transitive JSON Pointer in a resource URI", () => {
      let resolution = schema.resolve("http://example.com/person#/properties/homeAddress/definitions/addressType", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/address.json"),
        resource: schema.getResource("http://example.com/address"),
        uri: new URL("http://example.com/address#/definitions/addressType"),
        data: address.definitions.addressType,
        locationInFile: {
          tokens: ["definitions", "addressType"],
          path: "/definitions/addressType",
          hash: "#/definitions/addressType",
        },
        previousStep: {
          file: schema.getFile("http://example.com/address.json"),
          resource: schema.getResource("http://example.com/address"),
          uri: new URL("http://example.com/address"),
          data: address,
          locationInFile: {
            tokens: [],
            path: "",
            hash: "#",
          },
          reference: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/home-address"),
            value: "address",
            targetURI: new URL("http://example.com/address"),
            data: root.definitions.homeAddress,
            locationInFile: {
              tokens: ["definitions", "homeAddress"],
              path: "/definitions/homeAddress",
              hash: "#/definitions/homeAddress",
            },
          },
          previousStep: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/home-address"),
            uri: new URL("http://example.com/home-address"),
            data: root.definitions.homeAddress,
            locationInFile: {
              tokens: ["definitions", "homeAddress"],
              path: "/definitions/homeAddress",
              hash: "#/definitions/homeAddress",
            },
            reference: {
              file: schema.getFile("http://example.com/person.json"),
              resource: schema.getResource("http://example.com/person"),
              value: "home-address",
              targetURI: new URL("http://example.com/home-address"),
              data: person.properties.homeAddress,
              locationInFile: {
                tokens: ["properties", "homeAddress"],
                path: "/properties/homeAddress",
                hash: "#/properties/homeAddress",
              },
            },
          },
        },
      });
    });

    it("should resolve a transitive JSON Pointer to a reference", () => {
      let resolution = schema.resolve("http://example.com/schema.json#/definitions/person/properties/schoolAddress", "draft-04");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/person.json"),
        resource: schema.getResource("http://example.com/person"),
        uri: new URL("http://example.com/person#/properties/schoolAddress"),
        data: person.properties.schoolAddress,
        locationInFile: {
          tokens: ["properties", "schoolAddress"],
          path: "/properties/schoolAddress",
          hash: "#/properties/schoolAddress",
        },
        previousStep: {
          file: schema.getFile("http://example.com/person.json"),
          resource: schema.getResource("http://example.com/person"),
          uri: new URL("http://example.com/person"),
          data: person,
          locationInFile: {
            tokens: [],
            path: "",
            hash: "#",
          },
          reference: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/schema.json"),
            value: "person",
            targetURI: new URL("http://example.com/person"),
            data: root.definitions.person,
            locationInFile: {
              tokens: ["definitions", "person"],
              path: "/definitions/person",
              hash: "#/definitions/person",
            },
          },
        },
      });
    });
  });

  describe("2019-09", () => {
    let schema, root, person, address;

    beforeEach("initialize the JSON Schema", () => {
      root = {
        $defs: {
          person: { $ref: "person" },
          addressType: { $ref: "address#address-type" },
          homeAddress: {
            $id: "home-address",
            $anchor: "home-address",
            $ref: "address",
            properties: {
              type: { const: "home" },
            },
          },
          workAddress: {
            $anchor: "work-address",
            $ref: "address",
            properties: {
              type: { const: "work" },
            },
          },
          schoolAddress: {
            $anchor: "school-address",
            $ref: "address",
            properties: {
              type: { const: "school" },
            },
          },
        }
      };
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
          homeAddress: { $ref: "home-address" },
          workAddress: { $ref: "schema.json#work-address" },
          schoolAddress: { $ref: "schema.json#/$defs/schoolAddress" },
        }
      };
      address = {
        $id: "address",
        $anchor: "address",
        title: "Address",
        properties: {
          type: { $ref: "schema.json#address-type" },
          city: { type: "string" },
          postalCode: { type: "string" }
        },
        $defs: {
          addressType: {
            $anchor: "address-type",
            title: "Address Type",
            type: "string",
            enum: ["home", "work", "school"],
          }
        }
      };

      schema = new JsonSchema({ url: "http://example.com/schema.json", data: root });
      schema.files.push(new File({ url: "http://example.com/person.json", schema, data: person }));
      schema.files.push(new File({ url: "http://example.com/address.json", schema, data: address }));
      schema.index("2019-09");
    });

    it("should resolve the main file URL", () => {
      let resolution = schema.resolve("http://example.com/schema.json", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schema.json"),
        resource: schema.getResource("http://example.com/schema.json"),
        uri: new URL("http://example.com/schema.json"),
        data: root,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve a secondary file URL", () => {
      let resolution = schema.resolve("http://example.com/address.json", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/address.json"),
        resource: schema.getResource("http://example.com/address"),
        uri: new URL("http://example.com/address"),
        data: address,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve a root-resource URI", () => {
      let resolution = schema.resolve("http://example.com/person", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/person.json"),
        resource: schema.getResource("http://example.com/person"),
        uri: new URL("http://example.com/person"),
        data: person,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      });
    });

    it("should resolve a sub-resource URI", () => {
      let resolution = schema.resolve("http://example.com/home-address", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schema.json"),
        resource: schema.getResource("http://example.com/home-address"),
        uri: new URL("http://example.com/home-address"),
        data: root.$defs.homeAddress,
        locationInFile: {
          tokens: ["$defs", "homeAddress"],
          path: "/$defs/homeAddress",
          hash: "#/$defs/homeAddress",
        },
      });
    });

    it("should resolve an anchor in a file URL", () => {
      let resolution = schema.resolve("http://example.com/address.json#address-type", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/address.json"),
        resource: schema.getResource("http://example.com/address"),
        uri: new URL("http://example.com/address#address-type"),
        data: address.$defs.addressType,
        locationInFile: {
          tokens: ["$defs", "addressType"],
          path: "/$defs/addressType",
          hash: "#/$defs/addressType",
        },
      });
    });

    it("should resolve an anchor in a resource URI", () => {
      let resolution = schema.resolve("http://example.com/address#address-type", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/address.json"),
        resource: schema.getResource("http://example.com/address"),
        uri: new URL("http://example.com/address#address-type"),
        data: address.$defs.addressType,
        locationInFile: {
          tokens: ["$defs", "addressType"],
          path: "/$defs/addressType",
          hash: "#/$defs/addressType",
        },
      });
    });

    it("should resolve a JSON Pointer in a file URL", () => {
      let resolution = schema.resolve("http://example.com/person.json#/properties/age", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/person.json"),
        resource: schema.getResource("http://example.com/person"),
        uri: new URL("http://example.com/person#/properties/age"),
        data: person.properties.age,
        locationInFile: {
          tokens: ["properties", "age"],
          path: "/properties/age",
          hash: "#/properties/age",
        },
      });
    });

    it("should resolve a JSON Pointer in a resource URI", () => {
      let resolution = schema.resolve("http://example.com/person#/properties/age", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/person.json"),
        resource: schema.getResource("http://example.com/person"),
        uri: new URL("http://example.com/person#/properties/age"),
        data: person.properties.age,
        locationInFile: {
          tokens: ["properties", "age"],
          path: "/properties/age",
          hash: "#/properties/age",
        },
      });
    });

    it("should resolve a JSON Pointer to an anchor", () => {
      let resolution = schema.resolve("http://example.com/address#/$defs/addressType", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/address.json"),
        resource: schema.getResource("http://example.com/address"),
        uri: new URL("http://example.com/address#address-type"),
        data: address.$defs.addressType,
        locationInFile: {
          tokens: ["$defs", "addressType"],
          path: "/$defs/addressType",
          hash: "#/$defs/addressType",
        },
      });
    });

    it("should resolve a JSON Pointer to a reference", () => {
      let resolution = schema.resolve("http://example.com/schema.json#/$defs/schoolAddress", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/schema.json"),
        resource: schema.getResource("http://example.com/schema.json"),
        uri: new URL("http://example.com/schema.json#school-address"),
        data: root.$defs.schoolAddress,
        locationInFile: {
          tokens: ["$defs", "schoolAddress"],
          path: "/$defs/schoolAddress",
          hash: "#/$defs/schoolAddress",
        },
      });
    });

    it("should resolve a transitive JSON Pointer in a file URL", () => {
      let resolution = schema.resolve("http://example.com/schema.json#/$defs/person/properties/homeAddress/$defs/addressType", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/address.json"),
        resource: schema.getResource("http://example.com/address"),
        uri: new URL("http://example.com/address#address-type"),
        data: address.$defs.addressType,
        locationInFile: {
          tokens: ["$defs", "addressType"],
          path: "/$defs/addressType",
          hash: "#/$defs/addressType",
        },
        previousStep: {
          file: schema.getFile("http://example.com/address.json"),
          resource: schema.getResource("http://example.com/address"),
          uri: new URL("http://example.com/address"),
          data: address,
          locationInFile: {
            tokens: [],
            path: "",
            hash: "#",
          },
          reference: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/home-address"),
            value: "address",
            targetURI: new URL("http://example.com/address"),
            data: root.$defs.homeAddress,
            locationInFile: {
              tokens: ["$defs", "homeAddress"],
              path: "/$defs/homeAddress",
              hash: "#/$defs/homeAddress",
            },
          },
          previousStep: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/home-address"),
            uri: new URL("http://example.com/home-address"),
            data: root.$defs.homeAddress,
            locationInFile: {
              tokens: ["$defs", "homeAddress"],
              path: "/$defs/homeAddress",
              hash: "#/$defs/homeAddress",
            },
            reference: {
              file: schema.getFile("http://example.com/person.json"),
              resource: schema.getResource("http://example.com/person"),
              value: "home-address",
              targetURI: new URL("http://example.com/home-address"),
              data: person.properties.homeAddress,
              locationInFile: {
                tokens: ["properties", "homeAddress"],
                path: "/properties/homeAddress",
                hash: "#/properties/homeAddress",
              },
            },
            previousStep: {
              file: schema.getFile("http://example.com/person.json"),
              resource: schema.getResource("http://example.com/person"),
              uri: new URL("http://example.com/person"),
              data: person,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
              reference: {
                file: schema.getFile("http://example.com/schema.json"),
                resource: schema.getResource("http://example.com/schema.json"),
                value: "person",
                targetURI: new URL("http://example.com/person"),
                data: root.$defs.person,
                locationInFile: {
                  tokens: ["$defs", "person"],
                  path: "/$defs/person",
                  hash: "#/$defs/person",
                },
              },
            },
          },
        },
      });
    });

    it("should resolve a transitive JSON Pointer in a resource URI", () => {
      let resolution = schema.resolve("http://example.com/person#/properties/homeAddress/$defs/addressType", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/address.json"),
        resource: schema.getResource("http://example.com/address"),
        uri: new URL("http://example.com/address#address-type"),
        data: address.$defs.addressType,
        locationInFile: {
          tokens: ["$defs", "addressType"],
          path: "/$defs/addressType",
          hash: "#/$defs/addressType",
        },
        previousStep: {
          file: schema.getFile("http://example.com/address.json"),
          resource: schema.getResource("http://example.com/address"),
          uri: new URL("http://example.com/address"),
          data: address,
          locationInFile: {
            tokens: [],
            path: "",
            hash: "#",
          },
          reference: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/home-address"),
            value: "address",
            targetURI: new URL("http://example.com/address"),
            data: root.$defs.homeAddress,
            locationInFile: {
              tokens: ["$defs", "homeAddress"],
              path: "/$defs/homeAddress",
              hash: "#/$defs/homeAddress",
            },
          },
          previousStep: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/home-address"),
            uri: new URL("http://example.com/home-address"),
            data: root.$defs.homeAddress,
            locationInFile: {
              tokens: ["$defs", "homeAddress"],
              path: "/$defs/homeAddress",
              hash: "#/$defs/homeAddress",
            },
            reference: {
              file: schema.getFile("http://example.com/person.json"),
              resource: schema.getResource("http://example.com/person"),
              value: "home-address",
              targetURI: new URL("http://example.com/home-address"),
              data: person.properties.homeAddress,
              locationInFile: {
                tokens: ["properties", "homeAddress"],
                path: "/properties/homeAddress",
                hash: "#/properties/homeAddress",
              },
            },
          },
        },
      });
    });

    it("should resolve a transitive JSON Pointer to a reference", () => {
      let resolution = schema.resolve("http://example.com/schema.json#/$defs/person/properties/schoolAddress", "2019-09");
      assert.resolution(resolution, {
        file: schema.getFile("http://example.com/person.json"),
        resource: schema.getResource("http://example.com/person"),
        uri: new URL("http://example.com/person#/properties/schoolAddress"),
        data: person.properties.schoolAddress,
        locationInFile: {
          tokens: ["properties", "schoolAddress"],
          path: "/properties/schoolAddress",
          hash: "#/properties/schoolAddress",
        },
        previousStep: {
          file: schema.getFile("http://example.com/person.json"),
          resource: schema.getResource("http://example.com/person"),
          uri: new URL("http://example.com/person"),
          data: person,
          locationInFile: {
            tokens: [],
            path: "",
            hash: "#",
          },
          reference: {
            file: schema.getFile("http://example.com/schema.json"),
            resource: schema.getResource("http://example.com/schema.json"),
            value: "person",
            targetURI: new URL("http://example.com/person"),
            data: root.$defs.person,
            locationInFile: {
              tokens: ["$defs", "person"],
              path: "/$defs/person",
              hash: "#/$defs/person",
            },
          },
        },
      });
    });

    it("should fail to resolve an anchor in the wrong file", () => {
      try {
        schema.resolve("http://example.com/schema.json#address", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find #address in http://example.com/schema.json",
          code: "ERR_INVALID_REF",
          value: "address",
        });
      }
    });

    it("should fail to resolve an anchor in the wrong resource", () => {
      try {
        schema.resolve("http://example.com/home-address#address-type", "2019-09");
        assert.failed();
      }
      catch (error) {
        assert.error(error, {
          name: "URIError",
          message: "Cannot find #address-type in http://example.com/home-address",
          code: "ERR_INVALID_REF",
          value: "address-type",
        });
      }
    });
  });
});
