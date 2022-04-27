const packagesToInclude = ["@toruslabs/broadcast-channel", "@toruslabs/torus.js", "@toruslabs/fetch-node-details"];

module.exports = {
  cjsBundled: true,
  bundledDeps: packagesToInclude,
  analyzerMode: "disabled",
};
