"use strict";

const { expect } = require("chai");
const commonJSExport = require("../../");
const { default: defaultExport } = require("../../");
const {
  JsonSchema, File, Resource, Anchor, Reference, Pointer, Resolution, SchemaError, createErrorHandler,
  jsonSchema, jsonSchema2019_09, jsonSchemaDraft4, jsonSchemaDraft8   // eslint-disable-line camelcase
} = require("../../");

describe("json-schema package exports", () => {

  it("should not have a default ESM export", () => {
    expect(defaultExport).to.equal(undefined);
  });

  it("should export the JsonSchema class", () => {
    expect(JsonSchema).to.be.a("function");
    expect(JsonSchema.name).to.equal("JsonSchema");
  });

  it("should export the File class", () => {
    expect(File).to.be.a("function");
    expect(File.name).to.equal("File");
  });

  it("should export the Resource class", () => {
    expect(Resource).to.be.a("function");
    expect(Resource.name).to.equal("Resource");
  });

  it("should export the Anchor class", () => {
    expect(Anchor).to.be.a("function");
    expect(Anchor.name).to.equal("Anchor");
  });

  it("should export the Reference class", () => {
    expect(Reference).to.be.a("function");
    expect(Reference.name).to.equal("Reference");
  });

  it("should export the Pointer class", () => {
    expect(Pointer).to.be.a("function");
    expect(Pointer.name).to.equal("Pointer");
  });

  it("should export the Resolution class", () => {
    expect(Resolution).to.be.a("function");
    expect(Resolution.name).to.equal("Resolution");
  });

  it("should export the SchemaError class", () => {
    expect(SchemaError).to.be.a("function");
    expect(SchemaError.name).to.equal("SchemaError");
  });

  it("should export the createErrorHandler function", () => {
    expect(createErrorHandler).to.be.a("function");
    expect(createErrorHandler.name).to.equal("createErrorHandler");
  });

  it("should export the jsonSchema object", () => {
    expect(jsonSchema).to.be.an("object");
    expect(jsonSchema["draft-04"]).to.equal(jsonSchemaDraft4);
    expect(jsonSchema["draft-08"]).to.equal(jsonSchemaDraft8);
    expect(jsonSchema["2019-09"]).to.equal(jsonSchema2019_09);
  });

  it("should export each JSON Schema version implementation as a named export", () => {
    assertJsonSchemaVersion(jsonSchemaDraft4);
    assertJsonSchemaVersion(jsonSchemaDraft8);
    assertJsonSchemaVersion(jsonSchema2019_09);

    function assertJsonSchemaVersion (version) {
      expect(version).to.be.an("object").with.keys(["indexFile", "resolveRef"]);
      expect(version.indexFile).to.be.a("function");
      expect(version.resolveRef).to.be.a("function");
    }
  });

  it("should not export anything else", () => {
    expect(commonJSExport).to.have.same.keys(
      "JsonSchema",
      "File",
      "Resource",
      "Anchor",
      "Reference",
      "Pointer",
      "Resolution",
      "SchemaError",
      "createErrorHandler",
      "jsonSchema",
      "jsonSchemaDraft4",
      "jsonSchemaDraft8",
      "jsonSchema2019_09",
    );
  });

});
