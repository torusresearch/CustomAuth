const path = require("path");
const { ProvidePlugin } = require("webpack");
module.exports = {
  devServer: {
    port: 3000, // CHANGE YOUR PORT HERE!
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    historyApiFallback: {
      rewrites: [
        { from: /serviceworker\/redirect/, to: "/serviceworker/redirect.html" },
        { from: /./, to: "/index.html" },
      ],
    },
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV !== "production") {
      config.devtool = "source-map";
    }
    // console.log(config);
    config.resolve.alias = { ...config.resolve.alias, "bn.js": path.resolve(__dirname, "node_modules/bn.js") };
    config.plugins.push(
      new ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      http: false,
      https: false,
      os: false,
      crypto: false,
      assert: false,
      stream: false,
      zlib: false,
    };
  },
};
