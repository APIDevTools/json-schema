"use strict";

const { expect } = require("chai");
const { JsonSchema, File, Resource } = require("../../");
const assert = require("../utils/assert");
const path = require("../utils/path");

describe("JsonSchema class", () => {

  it("can be called without any arguments", () => {
    let schema = new JsonSchema();

    assert.schema(schema, {
      hasErrors: false,
      files: []
    });
  });

  it("can be called with a root file", () => {
    let schema = new JsonSchema({
      url: "https://example.com/foo/bar/schema.json",
      path: "./foo/bar/schema.json",
      mediaType: "application/json",
      data: {
        type: "object",
        properties: {
          foo: {
            type: "string"
          }
        }
      },
    });

    assert.schema(schema, {
      hasErrors: false,
      files: [
        {
          url: new URL("https://example.com/foo/bar/schema.json"),
          path: "./foo/bar/schema.json",
          mediaType: "application/json",
          resources: [{
            uri: new URL("https://example.com/foo/bar/schema.json"),
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            data: {
              type: "object",
              properties: {
                foo: {
                  type: "string"
                }
              }
            },
          }]
        }
      ]
    });
  });

  it("can be called with a root file and CWD", () => {
    let schema = new JsonSchema({
      cwd: "my/custom/cwd",
      path: "./foo/bar/schema.json",
    });

    assert.schema(schema, {
      hasErrors: false,
      files: [
        {
          url: new URL("my/custom/cwd/foo/bar/schema.json", path.cwd),
          path: "./foo/bar/schema.json",
          resources: [{
            uri: new URL("my/custom/cwd/foo/bar/schema.json", path.cwd),
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            data: undefined,
          }]
        }
      ]
    });
  });

  it("returns resources for all files", () => {
    let schema = new JsonSchema({ url: "http://example.com/foo/bar/resource1.json" });
    schema.rootFile.resources.push(new Resource({
      file: schema.rootFile,
      uri: "http://example.com/foo/bar/resource2.json",
    }));

    let file2 = new File({ schema, url: "http://example.com/foo/bar/resource3.json" });
    schema.files.push(file2);

    let file3 = new File({ schema, url: "http://example.com/foo/bar/resource4.json" });
    schema.files.push(file3);
    file3.resources.push(new Resource({
      file: file3,
      uri: "http://example.com/foo/bar/resource5.json",
    }));

    // Resources are returned as an iterator, not an array
    let resources = schema.resources;
    expect(resources).not.to.be.an("array");
    resources = [...resources];

    expect(resources).to.have.lengthOf(5);
    expect(resources[0].uri.href).to.equal("http://example.com/foo/bar/resource1.json");
    expect(resources[1].uri.href).to.equal("http://example.com/foo/bar/resource2.json");
    expect(resources[2].uri.href).to.equal("http://example.com/foo/bar/resource3.json");
    expect(resources[3].uri.href).to.equal("http://example.com/foo/bar/resource4.json");
    expect(resources[4].uri.href).to.equal("http://example.com/foo/bar/resource5.json");
  });

  it("returns errors for all files", () => {
    let schema = new JsonSchema({ path: "schema.json" });
    schema.rootFile.errors.push({ code: "ERR_ONE", message: "Error #1", schema, file: schema.rootFile });
    schema.rootFile.errors.push({ code: "ERR_TWO", message: "Error #2", schema, file: schema.rootFile });

    let file2 = new File({ schema, path: "file2.json" });
    schema.files.push(file2);
    file2.errors.push({ code: "ERR_THREE", message: "Error #3", schema, file: file2 });
    file2.errors.push({ code: "ERR_FOUR", message: "Error #4", schema, file: file2 });

    let file3 = new File({ schema, path: "file3.json" });
    schema.files.push(file3);
    file3.errors.push({ code: "ERR_FIVE", message: "Error #5", schema, file: file3 });
    file3.errors.push({ code: "ERR_SIX", message: "Error #6", schema, file: file3 });

    expect(schema.hasErrors).to.equal(true);

    // Errors are returned as an iterator, not an array
    let errors = schema.errors;
    expect(errors).not.to.be.an("array");
    errors = [...errors];

    expect(errors).to.have.lengthOf(6);
    expect(errors).to.deep.equal([
      { code: "ERR_ONE", message: "Error #1", schema, file: schema.rootFile },
      { code: "ERR_TWO", message: "Error #2", schema, file: schema.rootFile },
      { code: "ERR_THREE", message: "Error #3", schema, file: file2 },
      { code: "ERR_FOUR", message: "Error #4", schema, file: file2 },
      { code: "ERR_FIVE", message: "Error #5", schema, file: file3 },
      { code: "ERR_SIX", message: "Error #6", schema, file: file3 },
    ]);
  });

  it("should get a file by its URL", () => {
    let schema = new JsonSchema({
      url: "http://example.com/foo/bar/schema.json",
      path: "./foo/bar/schema.json",
    });

    schema.files.push(new File({
      schema,
      url: "http://example.com/foo/bar/file2.json",
      path: "./foo/bar/file2.json",
    }));

    schema.files.push(new File({
      schema,
      url: "http://example.com/foo/bar/file3.json",
      path: "./foo/bar/file3.json",
    }));

    let badURL = new URL("http://example.com/foo/bar/file4.json");
    expect(schema.hasFile(badURL)).to.equal(false);
    expect(schema.getFile(badURL)).to.equal(undefined);

    let goodURL = new URL("http://example.com/foo/bar/file2.json");
    expect(schema.hasFile(goodURL)).to.equal(true);
    expect(schema.getFile(goodURL)).to.equal(schema.files[1]);
  });

  it("should get a file by its URL", () => {
    let schema = new JsonSchema({ url: new URL("http://example.com/foo/bar/schema.json") });
    schema.files.push(new File({ schema, url: new URL("http://example.com/foo/bar/file2.json") }));
    schema.files.push(new File({ schema, url: new URL("http://example.com/foo/bar/file3.json") }));

    let badURL = "http://example.com/foo/bar/file4.json";
    expect(schema.hasFile(badURL)).to.equal(false);
    expect(schema.getFile(badURL)).to.equal(undefined);

    let goodURL = "http://example.com/foo/bar/file2.json";
    expect(schema.hasFile(goodURL)).to.equal(true);
    expect(schema.getFile(goodURL)).to.equal(schema.files[1]);
  });

  it("should get a file by its relative URL", () => {
    let schema = new JsonSchema({ url: "foo/bar/schema.json" });
    schema.files.push(new File({ schema, url: "foo/bar/file2.json" }));
    schema.files.push(new File({ schema, url: "foo/bar/file3.json" }));

    let badPath = "./foo/bar/file4.json";
    expect(schema.hasFile(badPath)).to.equal(false);
    expect(schema.getFile(badPath)).to.equal(undefined);

    let goodPath = "./foo/bar/file2.json";
    expect(schema.hasFile(goodPath)).to.equal(true);
    expect(schema.getFile(goodPath)).to.equal(schema.files[1]);
  });

  it("should get a resource by its URL", () => {
    let schema = new JsonSchema({ url: "http://example.com/foo/bar/schema.json" });
    schema.files.push(new File({ schema, url: "http://example.com/foo/bar/file2.json" }));
    schema.files.push(new File({ schema, url: "http://example.com/foo/bar/file3.json" }));

    schema.files[1].resources.push(new Resource({
      file: schema.files[1],
      uri: "http://example.com/foo/bar/resource1.json",
    }));

    schema.files[1].resources.push(new Resource({
      file: schema.files[1],
      uri: "http://example.com/foo/bar/resource2.json",
    }));

    schema.files[2].resources.push(new Resource({
      file: schema.files[2],
      uri: "http://example.com/foo/bar/resource3.json",
    }));

    schema.files[2].resources.push(new Resource({
      file: schema.files[2],
      uri: "http://example.com/foo/bar/resource4.json",
    }));

    let badURL = new URL("http://example.com/foo/bar/resource5.json");
    expect(schema.hasResource(badURL)).to.equal(false);
    expect(schema.getResource(badURL)).to.equal(undefined);

    let goodURL = new URL("http://example.com/foo/bar/resource3.json");
    expect(schema.hasResource(goodURL)).to.equal(true);
    expect(schema.getResource(goodURL)).to.equal(schema.files[2].resources[1]);
  });

  it("should index the schema's contents", () => {
    let person = {
      $schema: "http://json-schema.org/draft-04/schema#",
      id: "#person",
      title: "Person",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
        address: { $ref: "#address" },
      },
    };
    let address = {
      id: "#address",
      title: "Address",
      properties: {
        city: { type: "string" },
        postalCode: { type: "string" },
      }
    };

    let schema = new JsonSchema({ url: "schema.json", data: person });
    schema.files.push(new File({ url: "address.json", schema, data: address }));
    schema.index();

    assert.schema(schema, {
      files: [
        {
          url: new URL("schema.json", path.cwd),
          path: "schema.json",
          resources: [{
            uri: new URL("schema.json#person", path.cwd),
            data: person,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            references: [{
              value: "#address",
              targetURI: new URL("schema.json#address", path.cwd),
              data: { $ref: "#address" },
              locationInFile: {
                tokens: ["properties", "address"],
                path: "/properties/address",
                hash: "#/properties/address",
              },
            }],
          }],
        },
        {
          url: new URL("address.json", path.cwd),
          path: "address.json",
          resources: [{
            uri: new URL("address.json#address", path.cwd),
            data: address,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }]
        },
      ]
    });
  });

  it("should index the schema's contents using a specific JSON Schema version", () => {
    let person = {
      id: "#person",
      title: "Person",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
        address: { $ref: "#address" },
      },
    };
    let address = {
      id: "#address",
      title: "Address",
      properties: {
        city: { type: "string" },
        postalCode: { type: "string" },
      }
    };

    let schema = new JsonSchema({ url: "schema.json", data: person });
    schema.files.push(new File({ url: "address.json", schema, data: address }));
    schema.index("draft-04");

    assert.schema(schema, {
      files: [
        {
          url: new URL("schema.json", path.cwd),
          path: "schema.json",
          resources: [{
            uri: new URL("schema.json#person", path.cwd),
            data: person,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
            references: [{
              value: "#address",
              targetURI: new URL("schema.json#address", path.cwd),
              data: { $ref: "#address" },
              locationInFile: {
                tokens: ["properties", "address"],
                path: "/properties/address",
                hash: "#/properties/address",
              },
            }],
          }],
        },
        {
          url: new URL("address.json", path.cwd),
          path: "address.json",
          resources: [{
            uri: new URL("address.json#address", path.cwd),
            data: address,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }]
        },
      ]
    });
  });

  it("should resolve a URI in the schema", () => {
    let schema = new JsonSchema({
      url: "schema.json",
      data: {
        $schema: "http://json-schema.org/draft-04/schema#",
        id: "person",
        title: "Person",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
      }
    });

    let resolution = schema.index().resolve("schema.json#/properties/age/type");

    assert.resolution(resolution, {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("person", path.cwd)),
      uri: new URL("person#/properties/age/type", path.cwd),
      data: "integer",
      locationInFile: {
        tokens: ["properties", "age", "type"],
        path: "/properties/age/type",
        hash: "#/properties/age/type",
      },
    });
  });

  it("should resolve a URI in the schema using a specific JSON Schema version", () => {
    let schema = new JsonSchema({
      url: "schema.json",
      data: {
        id: "person",
        title: "Person",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
      }
    });

    let resolution = schema.index("draft-04").resolve("schema.json#/properties/age/type", "draft-04");

    assert.resolution(resolution, {
      file: schema.getFile("schema.json"),
      resource: schema.getResource(new URL("person", path.cwd)),
      uri: new URL("person#/properties/age/type", path.cwd),
      data: "integer",
      locationInFile: {
        tokens: ["properties", "age", "type"],
        path: "/properties/age/type",
        hash: "#/properties/age/type",
      },
    });
  });

  it("should determine whether a value is a JsonSchema instance", () => {
    expect(JsonSchema.isJsonSchema(new JsonSchema())).to.equal(true);
    expect(JsonSchema.isJsonSchema(JsonSchema)).to.equal(false);
    expect(JsonSchema.isJsonSchema(JsonSchema.prototype)).to.equal(false);
    expect(JsonSchema.isJsonSchema({})).to.equal(false);
  });
});
