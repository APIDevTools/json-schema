"use strict";

const { JsonSchema, jsonSchema, createErrorHandler } = require("../../../");
const assert = require("../../utils/assert");

describe("indexFile: invalid resource IDs", () => {

  describe("non-string", () => {
    it("draft-04", () => {
      let person = {
        id: null,
        title: "Person",
        properties: {
          name: {
            id: /^name$/,
            type: "string",
          },
          age: {
            id: 12345,
            type: "number",
          },
          address: {
            id: false,
            type: "string",
          }
        }
      };

      let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
      schema.index("draft-04");

      assert.schema(schema, {
        hasErrors: false,
        files: [{
          url: new URL("http://example.com/schema.json"),
          path: "schema.json",
          resources: [{
            uri: new URL("http://example.com/schema.json"),
            data: person,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }],
        }],
      });
    });

    it("2019-09", () => {
      let person = {
        $id: null,
        title: "Person",
        properties: {
          name: {
            $id: /^name$/,
            type: "string",
          },
          age: {
            $id: 12345,
            type: "number",
          },
          address: {
            $id: false,
            type: "string",
          }
        }
      };

      let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
      schema.index("2019-09");

      assert.schema(schema, {
        hasErrors: false,
        files: [{
          url: new URL("http://example.com/schema.json"),
          path: "schema.json",
          resources: [{
            uri: new URL("http://example.com/schema.json"),
            data: person,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }],
        }],
      });
    });
  });

  describe("URI fragment", () => {
    /**
     * JSON Schema Draft 4 allows resource URIs to have fragments
     *
     * @see https://json-schema.org/draft-04/json-schema-core.html#rfc.section.7.2
     */
    it("draft-04", () => {
      let person = {
        id: "#person",
        title: "Person",
        properties: {
          name: {
            id: "#name",
            type: "string",
          },
          age: {
            id: "#age",
            type: "number",
          },
          address: {
            id: "#address",
            type: "string",
          }
        }
      };

      let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
      let handleError = createErrorHandler({ file: schema.rootFile, code: "TEST", continueOnError: true });
      jsonSchema["draft-04"].indexFile(schema.rootFile, { handleError });

      assert.schema(schema, {
        hasErrors: false,
        files: [{
          url: new URL("http://example.com/schema.json"),
          path: "schema.json",
          resources: [
            {
              uri: new URL("http://example.com/schema.json#person"),
              data: person,
              locationInFile: {
                tokens: [],
                path: "",
                hash: "#",
              },
            },
            {
              uri: new URL("http://example.com/schema.json#name"),
              data: person.properties.name,
              locationInFile: {
                tokens: ["properties", "name"],
                path: "/properties/name",
                hash: "#/properties/name",
              },
            },
            {
              uri: new URL("http://example.com/schema.json#age"),
              data: person.properties.age,
              locationInFile: {
                tokens: ["properties", "age"],
                path: "/properties/age",
                hash: "#/properties/age",
              },
            },
            {
              uri: new URL("http://example.com/schema.json#address"),
              data: person.properties.address,
              locationInFile: {
                tokens: ["properties", "address"],
                path: "/properties/address",
                hash: "#/properties/address",
              },
            },
          ],
        }],
      });
    });

    /**
     * JSON Schema 2019-09 does NOT allow resource URIs to have fragments
     *
     * @see http://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2.2
     */
    it("2019-09", () => {
      let person = {
        $id: "#person",
        title: "Person",
        properties: {
          name: {
            $id: "#name",
            type: "string",
          },
          age: {
            $id: "#age",
            type: "number",
          },
          address: {
            $id: "#address",
            type: "string",
          }
        }
      };

      let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
      let handleError = createErrorHandler({ file: schema.rootFile, code: "TEST", continueOnError: true });
      jsonSchema["2019-09"].indexFile(schema.rootFile, { handleError });

      assert.schema(schema, {
        hasErrors: true,
        files: [{
          url: new URL("http://example.com/schema.json"),
          path: "schema.json",
          resources: [{
            uri: new URL("http://example.com/schema.json"),
            data: person,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }],
          errors: [
            {
              name: "SchemaError",
              message:
                "Error in schema.json at /$id\n" +
                "  $id cannot include a fragment: #person",
              code: "TEST",
              input: "#person",
              locationInFile: {
                tokens: ["$id"],
                path: "/$id",
                hash: "#/$id",
              },
              originalError: {
                name: "URIError",
                message: "$id cannot include a fragment: #person",
                code: "ERR_INVALID_URL",
                input: "#person",
              }
            },
            {
              name: "SchemaError",
              message:
                "Error in schema.json at /properties/name/$id\n" +
                "  $id cannot include a fragment: #name",
              code: "TEST",
              input: "#name",
              locationInFile: {
                tokens: ["properties", "name", "$id"],
                path: "/properties/name/$id",
                hash: "#/properties/name/$id",
              },
              originalError: {
                name: "URIError",
                message: "$id cannot include a fragment: #name",
                code: "ERR_INVALID_URL",
                input: "#name",
              }
            },
            {
              name: "SchemaError",
              message:
                "Error in schema.json at /properties/age/$id\n" +
                "  $id cannot include a fragment: #age",
              code: "TEST",
              input: "#age",
              locationInFile: {
                tokens: ["properties", "age", "$id"],
                path: "/properties/age/$id",
                hash: "#/properties/age/$id",
              },
              originalError: {
                name: "URIError",
                message: "$id cannot include a fragment: #age",
                code: "ERR_INVALID_URL",
                input: "#age",
              }
            },
            {
              name: "SchemaError",
              message:
                "Error in schema.json at /properties/address/$id\n" +
                "  $id cannot include a fragment: #address",
              code: "TEST",
              input: "#address",
              locationInFile: {
                tokens: ["properties", "address", "$id"],
                path: "/properties/address/$id",
                hash: "#/properties/address/$id",
              },
              originalError: {
                name: "URIError",
                message: "$id cannot include a fragment: #address",
                code: "ERR_INVALID_URL",
                input: "#address",
              }
            },
          ]
        }],
      });
    });
  });

});
