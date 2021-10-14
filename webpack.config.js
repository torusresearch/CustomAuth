/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const pkg = require("./package.json");

const pkgName = "directWebSdk";
const libraryName = pkgName.charAt(0).toUpperCase() + pkgName.slice(1);

const packagesToInclude = ["broadcast-channel", "@toruslabs/torus.js", "@toruslabs/fetch-node-details"];

const { NODE_ENV = "production" } = process.env;

const baseConfig = {
  mode: NODE_ENV,
  devtool: "source-map",
  entry: "./src/index.ts",
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist"),
    library: libraryName,
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      "bn.js": path.resolve(__dirname, "node_modules/bn.js"),
      lodash: path.resolve(__dirname, "node_modules/lodash"),
      "js-sha3": path.resolve(__dirname, "node_modules/js-sha3"),
    },
  },
  module: {
    rules: [],
  },
};

const optimization = {
  optimization: {
    minimize: false,
  },
};

const babelLoader = {
  test: /\.(ts|js)x?$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: "babel-loader",
  },
};

const umdConfig = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: `${pkgName}.umd.min.js`,
    libraryTarget: "umd",
  },
  module: {
    rules: [babelLoader],
  },
};

const cjsConfig = {
  ...baseConfig,
  ...optimization,
  output: {
    ...baseConfig.output,
    filename: `${pkgName}.cjs.js`,
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [babelLoader],
  },
  externals: [...Object.keys(pkg.dependencies), /^(@babel\/runtime)/i],
  plugins: [
    new ESLintPlugin({
      extensions: ".ts",
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "disabled", // disabled static
      openAnalyzer: false,
    }),
  ],
  node: {
    ...baseConfig.node,
    Buffer: false,
  },
};

const cjsBundledConfig = {
  ...baseConfig,
  ...optimization,
  output: {
    ...baseConfig.output,
    filename: `${pkgName}-bundled.cjs.js`,
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [babelLoader],
  },
  externals: [...Object.keys(pkg.dependencies).filter((x) => !packagesToInclude.includes(x)), /^(@babel\/runtime)/i],
};

module.exports = [umdConfig, cjsConfig, cjsBundledConfig];
// module.exports = [cjsConfig];
// V5
// experiments: {
//   outputModule: true
// }

// node: {
//   global: true,
// },
// resolve: {
//   alias: { crypto: 'crypto-browserify', stream: 'stream-browserify', vm: 'vm-browserify' },
//   aliasFields: ['browser'],
// },
