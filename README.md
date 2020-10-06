[![npm](https://img.shields.io/npm/v/@apidevtools/json-schema.svg)](https://www.npmjs.com/package/@apidevtools/json-schema)
[![License](https://img.shields.io/npm/l/@apidevtools/json-schema.svg)](LICENSE)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen)](https://plant.treeware.earth/APIDevTools/json-schema)

[![Build Status](https://github.com/APIDevTools/json-schema/workflows/CI-CD/badge.svg)](https://github.com/APIDevTools/json-schema/actions)
[![Coverage Status](https://coveralls.io/repos/github/APIDevTools/json-schema/badge.svg?branch=master)](https://coveralls.io/github/APIDevTools/json-schema)
[![Dependencies](https://david-dm.org/APIDevTools/json-schema.svg)](https://david-dm.org/APIDevTools/json-schema)

[![OS and Browser Compatibility](https://apitools.dev/img/badges/ci-badges.svg)](https://github.com/APIDevTools/json-schema/actions)


This library provides core JSON Schema functionality and type definitions for [APIDevTools projects](https://apitools.dev).

> **NOTE:** This is an **internal library** that is only intended to be used by other APIDevTools projects. Using it directly is discouraged and unsupported.



Installation
--------------------------
You can install via [npm](https://docs.npmjs.com/about-npm/).

```bash
npm install @apidevtools/json-schema
```



Usage
--------------------------
When using this library in Node.js apps, you'll probably want to use **CommonJS** syntax:

```javascript
const { JsonSchema } = require("@apidevtools/json-schema");
```

When using a transpiler such as [Babel](https://babeljs.io/) or [TypeScript](https://www.typescriptlang.org/), or a bundler such as [Webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/), you can use **ECMAScript modules** syntax instead:

```javascript
import { JsonSchema } from "@apidevtools/json-schema";
```

### Populating a JSON Schema
To represent a JSON Schema, you'll need to create an instance of [the `JsonSchema` class](src/json-schema.ts), which will contain one or more [`File` objects](src/file.ts).

```javascript
const { JsonSchema, File } = require("@apidevtools/json-schema");

// This creates a JsonSchema object with one File object
let schema = new JsonSchema({
  url: "http://example.com/schema.json",
  data: {
    $schema: "https://json-schema.org/draft/2019-09/schema",
    $id: "person",
    title: "Person",
    properties: {
      name: { $ref: "types.json#/$defs/Name" },
      address: { $ref: "types.json#address" }
    }
  }
});

// Add a second file to the schema
schema.files.push(new File({
  schema,
  url: "http://example.com/types.json",
  data: {
    $defs: {
      Name: {
        title: "Name",
        properties: {
          first: { type: "string" },
          last: { type: "string" }
        }
      },
      Address: {
        $anchor: "address",
        title: "Address",
        properties: {
          street: { type: "string" },
          city: { type: "string" },
          postalCode: { type: "string" }
        }
      }
    }
  }
}));
```


### Indexing the Schema
Once you have a `JsonSchema` object and all of its `File` objects, you can "index" the schema. That is, scan the schema's files and identify all the JSON Schema resources, anchors, and references in it.

```javascript
// Index the schema that we created above 👆
schema.index();

// Now the schema's resources, anchors, and references are populated.
// Let's inspect the $refs in schema.json
let refs = [...schema.rootFile.references];

console.log(refs[0].locationInFile.path);   // /properties/name
console.log(refs[0].value);                 // types.json#/$defs/Name
console.log(refs[0].targetURI.href);        // /path/to/types.json#/$defs/Name

console.log(refs[1].locationInFile.path);   // /properties/address
console.log(refs[1].value);                 // types.json#address
console.log(refs[1].targetURI.href);        // /path/to/types.json#address
```

Note that indexing a schema can produce very different results, depending on the JSON Schema version. Calling `schema.index()` without any parameters will auto-detect the JSON Schema version via the `$schema` keyword. An error will be thrown if auto-detection fails.

An alternative is to explicitly specify the JSON Schema version when calling `schema.index()`:

```javascript
// Index the schema using Draft 4 rules
schema.index("draft-04");

// Index the schema using Draft 2019-09 rules
schema.index("2019-09");
```


### Resolving References
Once the `JsonSchema` object has been indexed, `$ref`s in the schema can be resolved.  You can call the `resolve()` method on a [`Reference` object](src/reference.ts):

```javascript
// Call the resolve() method of the references we created above 👆

console.log(refs[0].resolve().data);    // { title: "Name", properties: {...}}

console.log(refs[1].resolve().data);    // { title: "Address", properties: {...}}
```

You can also use the `JsonSchema.resolve()` method to resolve arbitrary references within the schema:

```javascript
// Resolving this reference entail traversing schema.json and types.json
let resolution = schema.resolve("http://example.com/person#/properties/name/properties/first");

// The Resolution object contains the final resolved value, as well as each resolution step along the way
console.log(resolution.data);                         // { type: "string" }
console.log(resolution.locationInFile.path);          // /$defs/Name/properties/first
console.log(`${resolution.previousStep.reference}`);  // $ref: http://example.com/types.json#/$defs/Name
```

Just like with the `index()` method, the behavior of the `resolve()` method depends on the JSON Schema version. By default, it will attempt to auto-detect the version, but you can explicitly specify it instead:

```javascript
// Resolve a reference using Draft 4 rules
refs[0].resolve("draft-04");

// Resolve a URI using Draft 2019-09 rules
schema.resolve("http://example.com/person", "2019-09");
```



Browser support
--------------------------
This library supports recent versions of every major web browser.  Older browsers may require [Babel](https://babeljs.io/) and/or [polyfills](https://babeljs.io/docs/en/next/babel-polyfill).

To use in a browser, you'll need to use a bundling tool such as [Webpack](https://webpack.js.org/), [Rollup](https://rollupjs.org/), [Parcel](https://parceljs.org/), or [Browserify](http://browserify.org/). Some bundlers may require a bit of configuration, such as setting `browser: true` in [rollup-plugin-resolve](https://github.com/rollup/rollup-plugin-node-resolve).



Contributing
--------------------------
Contributions, enhancements, and bug-fixes are welcome!  [Open an issue](https://github.com/APIDevTools/json-schema/issues) on GitHub and [submit a pull request](https://github.com/APIDevTools/json-schema/pulls).

#### Building
To build the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/APIDevTools/json-schema.git`

2. __Install dependencies__<br>
`npm install`

3. __Build the code__<br>
`npm run build`

4. __Run the tests__<br>
`npm test`



License
--------------------------
This library is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

This package is [Treeware](http://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/APIDevTools/json-schema) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.



Big Thanks To
--------------------------
Thanks to these awesome companies for their support of Open Source developers ❤

[![GitHub](https://apitools.dev/img/badges/github.svg)](https://github.com/open-source)
[![NPM](https://apitools.dev/img/badges/npm.svg)](https://www.npmjs.com/)
[![Coveralls](https://apitools.dev/img/badges/coveralls.svg)](https://coveralls.io)
[![Travis CI](https://apitools.dev/img/badges/travis-ci.svg)](https://travis-ci.com)
[![SauceLabs](https://apitools.dev/img/badges/sauce-labs.svg)](https://saucelabs.com)
