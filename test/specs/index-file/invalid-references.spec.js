"use strict";

const { JsonSchema, jsonSchema, createErrorHandler } = require("../../../");
const assert = require("../../utils/assert");

describe("indexFile: invalid references", () => {

  describe("non-string", () => {
    it("draft-04", () => {
      let person = {
        id: "person",
        title: "Person",
        properties: {
          name: { $ref: 12345 },
          age: { $ref: false },
          address: { $ref: /^address$/ },
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
            uri: new URL("http://example.com/person"),
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
        $id: "person",
        title: "Person",
        properties: {
          name: { $ref: 12345 },
          age: { $ref: false },
          address: { $ref: /^address$/ },
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
            uri: new URL("http://example.com/person"),
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
    it("draft-04", () => {
      let person = {
        id: "person",
        title: "Person",
        properties: {
          name: { $ref: "" },
        }
      };

      let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
      let handleError = createErrorHandler({ file: schema.rootFile, code: "TEST", continueOnError: true });
      jsonSchema["draft-04"].indexFile(schema.rootFile, { handleError });

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
                "Error in schema.json at /properties/name/$ref\n" +
                "  $ref cannot be empty.",
              code: "TEST",
              input: "",
              locationInFile: {
                tokens: ["properties", "name", "$ref"],
                path: "/properties/name/$ref",
                hash: "#/properties/name/$ref",
              },
              originalError: {
                name: "SyntaxError",
                code: "ERR_INVALID_REF",
                message: "$ref cannot be empty.",
                input: "",
              }
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
          name: { $ref: "" },
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
                "Error in schema.json at /properties/name/$ref\n" +
                "  $ref cannot be empty.",
              code: "TEST",
              input: "",
              locationInFile: {
                tokens: ["properties", "name", "$ref"],
                path: "/properties/name/$ref",
                hash: "#/properties/name/$ref",
              },
              originalError: {
                name: "SyntaxError",
                code: "ERR_INVALID_REF",
                message: "$ref cannot be empty.",
                input: "",
              }
            },
          ]
        }],
      });
    });
  });

});
