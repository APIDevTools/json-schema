"use strict";

const { JsonSchema } = require("../../../");
const assert = require("../../utils/assert");

describe("indexFile: auto-detect JSON Schema version", () => {
  it("should do nothing if the file isn't a JSON Schema document", () => {
    let schema = new JsonSchema({
      url: "http://example.com/schema.json",
      data: "<h1>Hello, world</h1>"
    });
    schema.index();

    assert.schema(schema, {
      files: [{
        url: new URL("http://example.com/schema.json"),
        path: "schema.json",
        resources: [{
          uri: new URL("http://example.com/schema.json"),
          data: "<h1>Hello, world</h1>",
          locationInFile: {
            tokens: [],
            path: "",
            hash: "#",
          },
        }],
      }],
    });
  });

  it("should throw an error if the file doesn't have the $schema keyword", () => {
    let person = {
      $id: "http://this.id/is/ignored",
      id: "http://this.id/is/ignored",
      title: "Person",
      properties: {
        name: { type: "string" },
        age: { type: "integer", exclusiveMinimum: 0 },
      }
    };

    let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });

    try {
      schema.index();
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "Error",
        code: "ERR_SCHEMA_VERSION",
        message: "Unable to determine JSON Schema version. Missing $schema keyword.",
      });
    }
  });

  it("should throw an error for an unsupported $schema URI", () => {
    let person = {
      $schema: "http://example.com/schema.json",
      title: "Person",
      properties: {
        name: { type: "string" },
        age: { type: "integer", exclusiveMinimum: 0 },
      }
    };

    let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });

    try {
      schema.index();
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "URIError",
        code: "ERR_SCHEMA_VERSION",
        message: "Unsupported JSON Schema version: http://example.com/schema.json",
        $schema: "http://example.com/schema.json",
      });
    }
  });

  it("should use draft-04 for http://json-schema.org/draft-04/schema", () => {
    let person = {
      $schema: "http://json-schema.org/draft-04/schema",
      id: "person",
      title: "Person",
      properties: {
        name: { type: "string" },
        age: { type: "integer", exclusiveMinimum: 0 },
      }
    };

    let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
    schema.index();

    assert.schema(schema, {
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

  it("should use draft-04 for http://json-schema.org/draft-04/schema#", () => {
    let person = {
      $schema: "http://json-schema.org/draft-04/schema#",
      id: "person",
      title: "Person",
      properties: {
        name: { type: "string" },
        age: { type: "integer", exclusiveMinimum: 0 },
      }
    };

    let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
    schema.index();

    assert.schema(schema, {
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

  it("should use 2019-09 for https://json-schema.org/draft/2019-09/schema", () => {
    let person = {
      $schema: "https://json-schema.org/draft/2019-09/schema",
      $id: "http://example.com/person",
      title: "Person",
      properties: {
        name: { type: "string" },
        age: { type: "integer", exclusiveMinimum: 0 },
      }
    };

    let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
    schema.index();

    assert.schema(schema, {
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

  it("should use 2019-09 for http://json-schema.org/schema", () => {
    let person = {
      $schema: "http://json-schema.org/schema",
      $id: "http://example.com/person",
      title: "Person",
      properties: {
        name: { type: "string" },
        age: { type: "integer", exclusiveMinimum: 0 },
      }
    };

    let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
    schema.index();

    assert.schema(schema, {
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

  it("should use 2019-09 for http://json-schema.org/schema#", () => {
    let person = {
      $schema: "http://json-schema.org/schema#",
      $id: "http://example.com/person",
      title: "Person",
      properties: {
        name: { type: "string" },
        age: { type: "integer", exclusiveMinimum: 0 },
      }
    };

    let schema = new JsonSchema({ url: "http://example.com/schema.json", data: person });
    schema.index();

    assert.schema(schema, {
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
