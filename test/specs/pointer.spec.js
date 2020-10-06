"use strict";

const { Pointer } = require("../../");
const assert = require("../utils/assert");

/**
 * Note: These tests come from the JSON Pointer spec
 *
 * @see https://tools.ietf.org/html/rfc6901#section-5
 * @see https://tools.ietf.org/html/rfc6901#section-6
 */
describe("Pointer class", () => {

  let tests = [
    { path: "", hash: "#", tokens: []},
    { path: "/foo", hash: "#/foo", tokens: ["foo"]},
    { path: "/foo/0", hash: "#/foo/0", tokens: ["foo", "0"]},
    { path: "/", hash: "#/", tokens: [""]},
    { path: "/a~1b", hash: "#/a~1b", tokens: ["a/b"]},
    { path: "/c%d", hash: "#/c%25d", tokens: ["c%d"]},
    { path: "/e^f", hash: "#/e%5Ef", tokens: ["e^f"]},
    { path: "/g|h", hash: "#/g%7Ch", tokens: ["g|h"]},
    { path: "/i\\j", hash: "#/i%5Cj", tokens: ["i\\j"]},
    { path: "/k\"l", hash: "#/k%22l", tokens: ["k\"l"]},
    { path: "/ ", hash: "#/%20", tokens: [" "]},
    { path: "/m~0n", hash: "#/m~0n", tokens: ["m~n"]},
  ];

  for (let { path, hash, tokens } of tests) {
    describe(path, () => {
      it(`should create a Pointer from "${path}"`, () => {
        let pointer = new Pointer(path);
        assert.pointer(pointer, { tokens, path, hash });
      });

      it(`should create a Pointer from ${hash}`, () => {
        let pointer = new Pointer(hash);
        assert.pointer(pointer, { tokens, path, hash });
      });

      it(`should create a Pointer from [${tokens}]`, () => {
        let pointer = new Pointer(tokens);
        assert.pointer(pointer, { tokens, path, hash });
      });
    });
  }

});
