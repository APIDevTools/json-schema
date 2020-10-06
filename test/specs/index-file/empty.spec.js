"use strict";

const { File, JsonSchema } = require("../../../");
const assert = require("../../utils/assert");

describe("indexFile: empty values", () => {
  function assertEmpty (file, data) {
    // no errors should have occurred

    assert.file(file, {
      url: new URL("http://example.com/schema.json"),
      path: "schema.json",

      // The file should only have the root resource, with the expected data
      resources: [{
        uri: new URL("http://example.com/schema.json"),
        data,
        locationInFile: {
          tokens: [],
          path: "",
          hash: "#",
        },
      }]
    });
  }

  describe("empty object", () => {
    it("draft-04", () => {
      let file = new File({
        schema: new JsonSchema(),
        url: "http://example.com/schema.json",
        data: {},
      });
      file.index("draft-04");
      assertEmpty(file, {});
    });

    it("2019-09", () => {
      let file = new File({
        schema: new JsonSchema(),
        url: "http://example.com/schema.json",
        data: {},
      });
      file.index("2019-09");
      assertEmpty(file, {});
    });
  });

  describe("undefined", () => {
    it("draft-04", () => {
      let file = new File({
        schema: new JsonSchema(),
        url: "http://example.com/schema.json",
        data: undefined,
      });
      file.index("draft-04");
      assertEmpty(file, undefined);
    });

    it("2019-09", () => {
      let file = new File({
        schema: new JsonSchema(),
        url: "http://example.com/schema.json",
        data: undefined,
      });
      file.index("2019-09");
      assertEmpty(file, undefined);
    });
  });

  describe("null", () => {
    it("draft-04", () => {
      let file = new File({
        schema: new JsonSchema(),
        url: "http://example.com/schema.json",
        data: null,
      });
      file.index("draft-04");
      assertEmpty(file, null);
    });

    it("2019-09", () => {
      let file = new File({
        schema: new JsonSchema(),
        url: "http://example.com/schema.json",
        data: null,
      });
      file.index("2019-09");
      assertEmpty(file, null);
    });
  });

  describe("empty string", () => {
    it("draft-04", () => {
      let file = new File({
        schema: new JsonSchema(),
        url: "http://example.com/schema.json",
        data: "",
      });
      file.index("draft-04");
      assertEmpty(file, "");
    });

    it("2019-09", () => {
      let file = new File({
        schema: new JsonSchema(),
        url: "http://example.com/schema.json",
        data: "",
      });
      file.index("2019-09");
      assertEmpty(file, "");
    });
  });
});
