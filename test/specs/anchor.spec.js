"use strict";

const { JsonSchema, Anchor } = require("../../");
const assert = require("../utils/assert");

describe("Anchor class", () => {

  it("should create an Anchor", () => {
    let schema = new JsonSchema({ url: "https://example.com/foo/bar/schema.json" });
    let anchor = new Anchor({
      resource: schema.rootResource,
      locationInFile: ["$defs", "person"],
      name: "person",
      data: {
        $anchor: "person",
        title: "Person",
        properties: {
          name: { type: "string" },
        },
      }
    });

    assert.anchor(anchor, {
      file: schema.rootFile,
      resource: schema.rootResource,
      name: "person",
      uri: new URL("https://example.com/foo/bar/schema.json#person"),
      locationInFile: {
        tokens: ["$defs", "person"],
        path: "/$defs/person",
        hash: "#/$defs/person",
      },
      data: {
        $anchor: "person",
        title: "Person",
        properties: {
          name: { type: "string" },
        },
      }
    });
  });

  it("cannot be called without any arguments", () => {
    try {
      new Anchor();
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
      new Anchor({
        locationInFile: [],
        name: "my-anchor"
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
      new Anchor({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        name: "my-anchor"
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
      new Anchor({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        message: "$anchor must be a string, not undefined.",
        code: "ERR_INVALID_ANCHOR",
        type: "undefined",
        input: undefined,
      });
    }
  });

  it("should throw an error if the $anchor is null", () => {
    try {
      new Anchor({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
        name: null,
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        message: "$anchor must be a string, not object.",
        code: "ERR_INVALID_ANCHOR",
        type: "object",
        input: null,
      });
    }
  });

  it("should throw an error if the $anchor is not a string", () => {
    try {
      new Anchor({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
        name: 12345,
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "TypeError",
        message: "$anchor must be a string, not number.",
        code: "ERR_INVALID_ANCHOR",
        type: "number",
        input: 12345,
      });
    }
  });

  it("should throw an error if the $anchor is empty", () => {
    try {
      new Anchor({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
        name: "",
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "SyntaxError",
        message: "$anchor cannot be empty.",
        code: "ERR_INVALID_ANCHOR",
        input: "",
      });
    }
  });

  it("should throw an error if the $anchor starts with a hash", () => {
    try {
      new Anchor({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
        name: "#my-anchor",
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "SyntaxError",
        message: "$anchor cannot start with a \"#\" character.",
        code: "ERR_INVALID_ANCHOR",
        input: "#my-anchor",
      });
    }
  });

  it("should throw an error if the $anchor does not start with a letter", () => {
    try {
      new Anchor({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
        name: "-my-anchor",
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "SyntaxError",
        message: "$anchor must start with a letter.",
        code: "ERR_INVALID_ANCHOR",
        input: "-my-anchor",
      });
    }
  });

  it("should throw an error if the $anchor contains invalid characters", () => {
    try {
      new Anchor({
        resource: new JsonSchema({ path: "schema.json" }).rootResource,
        locationInFile: [],
        name: "my-awesome!-anchor",
      });
      assert.failed();
    }
    catch (error) {
      assert.error(error, {
        name: "SyntaxError",
        message: "$anchor contains illegal characters.",
        code: "ERR_INVALID_ANCHOR",
        input: "my-awesome!-anchor",
      });
    }
  });

});
