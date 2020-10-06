"use strict";

const { expect } = require("chai");
const { JsonSchema, File, Resource, Anchor, Reference } = require("../../");
const assert = require("../utils/assert");
const path = require("../utils/path");

describe("File class", () => {

  it("should create a File", () => {
    let file = new File({
      schema: new JsonSchema(),
      url: "https://example.com/foo/bar/schema.json",
      path: "./foo/bar/schema.json",
      mediaType: "application/json",
      metadata: {
        foo: "bar",
        biz: {
          baz: true,
        },
      },
      data: {
        type: "object",
        properties: {
          foo: {
            type: "string"
          }
        }
      },
      extraProperty: "ignored",
    });

    assert.file(file, {
      url: new URL("https://example.com/foo/bar/schema.json"),
      path: "./foo/bar/schema.json",
      mediaType: "application/json",
      metadata: {
        foo: "bar",
        biz: {
          baz: true,
        },
      },
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
      }],
    });
  });

  it("should accept the file URL as a string", () => {
    let file = new File({
      schema: new JsonSchema(),
      url: "https://example.com/foo/bar/schema.json",
    });

    assert.file(file, {
      url: new URL("https://example.com/foo/bar/schema.json"),
      path: "schema.json",
      resources: [{
        uri: new URL("https://example.com/foo/bar/schema.json"),
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      }],
    });
  });

  it("should accept the file URL as an object", () => {
    let file = new File({
      schema: new JsonSchema(),
      url: new URL("https://example.com/foo/bar/schema.json"),
    });

    assert.file(file, {
      url: new URL("https://example.com/foo/bar/schema.json"),
      path: "schema.json",
      resources: [{
        uri: new URL("https://example.com/foo/bar/schema.json"),
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      }],
    });
  });

  it("should accept the file path as a string", () => {
    let file = new File({
      schema: new JsonSchema(),
      path: "./schema.json"
    });

    assert.file(file, {
      url: new URL("schema.json", path.cwd),
      path: "./schema.json",
      resources: [{
        uri: new URL("schema.json", path.cwd),
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      }],
    });
  });

  it("should accept the file path as an object", () => {
    let file = new File({
      schema: new JsonSchema(),
      path: new URL("http://example.com/schema.json")
    });

    assert.file(file, {
      url: new URL("http://example.com/schema.json"),
      path: "http://example.com/schema.json",
      resources: [{
        uri: new URL("http://example.com/schema.json"),
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      }],
    });
  });

  it("cannot be called without any arguments", () => {
    try {
      new File();
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        message: /undefined/,
      });
    }
  });

  it("should throw an error if no path or URL is specified", () => {
    let schema = new JsonSchema();

    try {
      new File({ schema });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "URIError",
        message: "A file URL or path must be specified",
        code: "ERR_INVALID_URL",
      });
    }
  });

  it("should throw an error if the URL contains a fragment", () => {
    try {
      new File({
        schema: new JsonSchema(),
        url: "http://example.com/schema.json#/some/nested/thing"
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "URIError",
        message: "File URL cannot include a fragment: #/some/nested/thing",
        code: "ERR_INVALID_URL",
        input: "http://example.com/schema.json#/some/nested/thing",
      });
    }
  });

  it("should determine whether a value is a File instance", () => {
    expect(File.isFile(new File({ schema: new JsonSchema(), url: "http://example.com" }))).to.equal(true);
    expect(File.isFile(File)).to.equal(false);
    expect(File.isFile(File.prototype)).to.equal(false);
    expect(File.isFile({})).to.equal(false);
  });

  it("returns anchors for all resources", () => {
    let schema = new JsonSchema({ url: "http://example.com/foo/bar/resource1.json" });
    schema.rootFile.resources.push(new Resource({ file: schema.rootFile, uri: "http://example.com/foo/bar/resource2.json" }));
    schema.rootFile.resources.push(new Resource({ file: schema.rootFile, uri: "http://example.com/foo/bar/resource3.json" }));
    schema.rootFile.resources[0].anchors.push(new Anchor({ name: "anchor1", resource: schema.rootFile.resources[0], locationInFile: []}));
    schema.rootFile.resources[0].anchors.push(new Anchor({ name: "anchor2", resource: schema.rootFile.resources[0], locationInFile: []}));
    schema.rootFile.resources[1].anchors.push(new Anchor({ name: "anchor3", resource: schema.rootFile.resources[1], locationInFile: []}));
    schema.rootFile.resources[1].anchors.push(new Anchor({ name: "anchor4", resource: schema.rootFile.resources[1], locationInFile: []}));
    schema.rootFile.resources[2].anchors.push(new Anchor({ name: "anchor5", resource: schema.rootFile.resources[2], locationInFile: []}));

    // Anchors are returned as an iterator, not an array
    let anchors = schema.rootFile.anchors;
    expect(anchors).not.to.be.an("array");
    anchors = [...anchors];

    expect(anchors).to.have.lengthOf(5);
    expect(anchors[0].uri.href).to.equal("http://example.com/foo/bar/resource1.json#anchor1");
    expect(anchors[1].uri.href).to.equal("http://example.com/foo/bar/resource1.json#anchor2");
    expect(anchors[2].uri.href).to.equal("http://example.com/foo/bar/resource2.json#anchor3");
    expect(anchors[3].uri.href).to.equal("http://example.com/foo/bar/resource2.json#anchor4");
    expect(anchors[4].uri.href).to.equal("http://example.com/foo/bar/resource3.json#anchor5");
  });

  it("returns references for all resources", () => {
    let schema = new JsonSchema({ url: "http://example.com/foo/bar/resource1.json" });
    schema.rootFile.resources.push(new Resource({ file: schema.rootFile, uri: "http://example.com/foo/bar/resource2.json" }));
    schema.rootFile.resources.push(new Resource({ file: schema.rootFile, uri: "http://example.com/foo/bar/resource3.json" }));
    schema.rootFile.resources[0].references.push(new Reference({ value: "reference1", resource: schema.rootFile.resources[0], locationInFile: []}));
    schema.rootFile.resources[0].references.push(new Reference({ value: "reference2", resource: schema.rootFile.resources[0], locationInFile: []}));
    schema.rootFile.resources[1].references.push(new Reference({ value: "reference3", resource: schema.rootFile.resources[1], locationInFile: []}));
    schema.rootFile.resources[1].references.push(new Reference({ value: "reference4", resource: schema.rootFile.resources[1], locationInFile: []}));
    schema.rootFile.resources[2].references.push(new Reference({ value: "reference5", resource: schema.rootFile.resources[2], locationInFile: []}));

    // References are returned as an iterator, not an array
    let references = schema.rootFile.references;
    expect(references).not.to.be.an("array");
    references = [...references];

    expect(references).to.have.lengthOf(5);
    expect(references[0].targetURI.href).to.equal("http://example.com/foo/bar/reference1");
    expect(references[1].targetURI.href).to.equal("http://example.com/foo/bar/reference2");
    expect(references[2].targetURI.href).to.equal("http://example.com/foo/bar/reference3");
    expect(references[3].targetURI.href).to.equal("http://example.com/foo/bar/reference4");
    expect(references[4].targetURI.href).to.equal("http://example.com/foo/bar/reference5");
  });
});
