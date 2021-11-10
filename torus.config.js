const pkg = require("./package.json");
const packagesToInclude = ["broadcast-channel", "@toruslabs/torus.js", "@toruslabs/fetch-node-details"];

module.exports = {
  cjsBundled: true,
  bundledDeps: packagesToInclude,
  analyzerMode: "disabled",
};
