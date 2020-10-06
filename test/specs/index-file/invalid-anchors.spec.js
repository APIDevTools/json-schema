"use strict";

const { JsonSchema, jsonSchema, createErrorHandler } = require("../../../");
const assert = require("../../utils/assert");

// NOTE: JSON Schema Draft 4 does not support anchors
describe("indexFile: invalid anchors", () => {

  describe("non-string", () => {
    it("2019-09", () => {
      let person = {
        title: "Person",
        properties: {
          name: {
            $anchor: /^name$/,
            type: "string",
          },
          age: {
            $anchor: 12345,
            type: "number",
          },
          address: {
            $anchor: false,
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

  describe("empty", () => {
    it("2019-09", () => {
      let person = {
        $id: "person",
        title: "Person",
        properties: {
          name: {
            $anchor: "",
            type: "string",
          },
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
            uri: new URL("http://example.com/person"),
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
                "Error in schema.json at /properties/name/$anchor\n" +
                "  $anchor cannot be empty.",
              code: "TEST",
              input: "",
              locationInFile: {
                tokens: ["properties", "name", "$anchor"],
                path: "/properties/name/$anchor",
                hash: "#/properties/name/$anchor",
              },
              originalError: {
                name: "SyntaxError",
                code: "ERR_INVALID_ANCHOR",
                message: "$anchor cannot be empty.",
                input: "",
              }
            },
          ]
        }],
      });
    });
  });

  describe("starts with #", () => {
    it("2019-09", () => {
      let person = {
        $id: "person",
        title: "Person",
        properties: {
          name: {
            $anchor: "#name",
            type: "string",
          },
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
            uri: new URL("http://example.com/person"),
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
                "Error in schema.json at /properties/name/$anchor\n" +
                "  $anchor cannot start with a \"#\" character.",
              code: "TEST",
              input: "#name",
              locationInFile: {
                tokens: ["properties", "name", "$anchor"],
                path: "/properties/name/$anchor",
                hash: "#/properties/name/$anchor",
              },
              originalError: {
                name: "SyntaxError",
                code: "ERR_INVALID_ANCHOR",
                message: "$anchor cannot start with a \"#\" character.",
                input: "#name",
              }
            },
          ]
        }],
      });
    });
  });

  describe("starts with non-alpha character", () => {
    it("2019-09", () => {
      let person = {
        $id: "person",
        title: "Person",
        properties: {
          name: {
            $anchor: "9name",
            type: "string",
          },
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
            uri: new URL("http://example.com/person"),
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
                "Error in schema.json at /properties/name/$anchor\n" +
                "  $anchor must start with a letter.",
              code: "TEST",
              input: "9name",
              locationInFile: {
                tokens: ["properties", "name", "$anchor"],
                path: "/properties/name/$anchor",
                hash: "#/properties/name/$anchor",
              },
              originalError: {
                name: "SyntaxError",
                code: "ERR_INVALID_ANCHOR",
                message: "$anchor must start with a letter.",
                input: "9name",
              }
            },
          ]
        }],
      });
    });
  });

  describe("contains illegal characters", () => {
    it("2019-09", () => {
      let person = {
        $id: "person",
        title: "Person",
        properties: {
          name: {
            $anchor: "n@me",
            type: "string",
          },
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
            uri: new URL("http://example.com/person"),
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
                "Error in schema.json at /properties/name/$anchor\n" +
                "  $anchor contains illegal characters.",
              code: "TEST",
              input: "n@me",
              locationInFile: {
                tokens: ["properties", "name", "$anchor"],
                path: "/properties/name/$anchor",
                hash: "#/properties/name/$anchor",
              },
              originalError: {
                name: "SyntaxError",
                code: "ERR_INVALID_ANCHOR",
                message: "$anchor contains illegal characters.",
                input: "n@me",
              }
            },
          ]
        }],
      });
    });
  });

});
