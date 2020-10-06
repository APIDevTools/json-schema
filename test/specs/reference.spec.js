"use strict";

const { JsonSchema, Reference } = require("../../");
const assert = require("../utils/assert");

describe("Reference class", () => {

  it("should create a Reference", () => {
    let schema = new JsonSchema({ url: "https://example.com/foo/bar/schema.json" });
    let reference = new Reference({
      resource: schema.rootResource,
      locationInFile: ["foo", "bar"],
      value: "#/Foo/properties/bar",
      data: {
        $ref: "#/Foo/properties/bar",
        description: "Lorem ipsum dolor sit amet..."
      },
    });

    assert.reference(reference, {
      file: schema.rootFile,
      resource: schema.rootResource,
      value: "#/Foo/properties/bar",
      targetURI: new URL("https://example.com/foo/bar/schema.json#/Foo/properties/bar"),
      locationInFile: {
        tokens: ["foo", "bar"],
        path: "/foo/bar",
        hash: "#/foo/bar",
      },
      data: {
        $ref: "#/Foo/properties/bar",
        description: "Lorem ipsum dolor sit amet..."
      },
    });
  });

  it("cannot be called without any arguments", () => {
    try {
      new Reference();
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        message: /undefined/,
      });
    }
  });

  it("should throw an error if no resource is specified", () => {
    try {
      new Reference({
        locationInFile: [],
        value: "my-reference"
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        message: /undefined/,
      });
    }
  });

  it("should throw an error if no location is specified", () => {
    try {
      new Reference({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        value: "my-reference"
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        message: /undefined/,
      });
    }
  });

  it("should throw an error if no value is specified", () => {
    try {
      new Reference({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        code: "ERR_INVALID_REF",
        message: "$ref must be a string, not undefined.",
        type: "undefined",
        input: undefined,
      });
    }
  });

  it("should throw an error if the $ref is null", () => {
    try {
      new Reference({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
        value: null,
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        code: "ERR_INVALID_REF",
        message: "$ref must be a string, not object.",
        type: "object",
        input: null,
      });
    }
  });

  it("should throw an error if the $ref is not a string", () => {
    try {
      new Reference({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
        value: 12345,
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        code: "ERR_INVALID_REF",
        message: "$ref must be a string, not number.",
        type: "number",
        input: 12345,
      });
    }
  });

  it("should throw an error if the $ref is empty", () => {
    try {
      new Reference({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
        value: "",
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "SyntaxError",
        code: "ERR_INVALID_REF",
        message: "$ref cannot be empty.",
        input: "",
      });
    }
  });

});
