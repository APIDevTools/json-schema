"use strict";

const { host } = require("@jsdevtools/host-environment");

if (host.browser) {
  /* eslint-env browser */
  module.exports = {
    cwd: new URL(window.location.href),
    basename: window.location.pathname.split("/").slice(-1)[0],
  };
}
else {
  /* eslint-env node */
  const { basename, sep } = require("path");
  const { pathToFileURL } = require("url");

  module.exports = {
    cwd: pathToFileURL(process.cwd() + sep),
    basename: basename(process.cwd()),
  };
}
