"use strict";

const { File, JsonSchema } = require("../../../");
const assert = require("../../utils/assert");

describe("indexFile: files containing non-schema resources", () => {
  let testSuites = [
    { name: "plain-text file", url: "http://example.com/file.txt", data: "Lorem ipsum dolor sit amet" },
    { name: "HTML file", url: "http://example.com/file.html", data: "<h1>Hello, world!</h1>" },
    { name: "JSON file", url: "http://example.com/file.json", data: { foo: "bar" }},
    { name: "JSON array", url: "http://example.com/file.json", data: ["foo", "bar", "baz"]},
    { name: "Binary file", url: "http://example.com/file.jpg", data: new Uint8Array([0, 1, 0, 1, 1, 0]) },
    { name: "JavaScript Date", url: "http://example.com/file.js", data: new Date() },
    { name: "JavaScript RegExp", url: "http://example.com/file.js", data: /^foo$/ },
    { name: "JavaScript Map", url: "http://example.com/file.js", data: new Map([[1, "foo"], [2, "bar"]]) },
    { name: "JavaScript Set", url: "http://example.com/file.js", data: new Set([1, 2, 3]) },
  ];

  for (let { name, url, data } of testSuites) {
    describe(name, () => {
      function assertValue (file) {
        // no errors should have occurred

        assert.file(file, {
          url: new URL(url),
          path: url.split("/").slice(-1)[0],

          // The file should only have the root resource, with the original data value
          resources: [{
            uri: new URL(url),
            data,
            locationInFile: {
              tokens: [],
              path: "",
              hash: "#",
            },
          }]
        });
      }

      it("draft-04", () => {
        let file = new File({ schema: new JsonSchema(), url, data });
        file.index("draft-04");
        assertValue(file);
      });

      it("2019-09", () => {
        let file = new File({ schema: new JsonSchema(), url, data });
        file.index("2019-09");
        assertValue(file);
      });
    });
  }
});
