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
      config.devtool = "eval-source-map";
    }
    // console.log(config);
    config.resolve.alias = { ...config.resolve.alias, "bn.js": path.resolve(__dirname, "node_modules/bn.js") };
    config.plugins.push(
      new ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      })
    );
    config.plugins.push(
      new ProvidePlugin({
        process: "process/browser",
      })
    );
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
      assert: require.resolve("assert/"),
      stream: require.resolve("stream-browserify"),
    };
  },
};
