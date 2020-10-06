"use strict";

const { JsonSchema, File, Resource } = require("../../");
const assert = require("../utils/assert");

describe("Resource class", () => {

  it("should create a Resource", () => {
    let schema = new JsonSchema({ url: "https://example.com/foo/bar/schema.json" });
    let resource = new Resource({
      file: schema.rootFile,
      uri: "https://example.com/foo/bar/resource.json",
      locationInFile: ["foo", "bar"],
      extraProperty: "ignored",
    });

    assert.resource(resource, {
      file: schema.rootFile,
      uri: new URL("https://example.com/foo/bar/resource.json"),
      locationInFile: {
        tokens: ["foo", "bar"],
        path: "/foo/bar",
        hash: "#/foo/bar",
      },
    });
  });

  it("should default the URI to the schema URL", () => {
    let schema = new JsonSchema({ url: "https://example.com/foo/bar/schema.json" });
    let resource = new Resource({ file: schema.rootFile });

    assert.resource(resource, {
      file: schema.rootFile,
      uri: new URL("https://example.com/foo/bar/schema.json"),
      locationInFile: {
        tokens: [],
        path: "",
        hash: "#",
      },
    });
  });

  it("should default the uri to the file URL", () => {
    let schema = new JsonSchema({ url: "https://example.com/foo/bar/schema.json" });
    let file = new File({ schema, url: "https://example.com/foo/bar/file.json" });
    let resource = new Resource({ file });

    assert.resource(resource, {
      file,
      uri: new URL("https://example.com/foo/bar/file.json"),
      locationInFile: {
        tokens: [],
        path: "",
        hash: "#",
      },
    });
  });

  it("cannot be called without any arguments", () => {
    try {
      new Resource();
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        message: /undefined/,
      });
    }
  });

});
