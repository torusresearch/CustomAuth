/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

const pkg = require("./package.json");

const pkgName = "directWebSdk";
const libraryName = pkgName.charAt(0).toUpperCase() + pkgName.slice(1);

const packagesToInclude = ["broadcast-channel", "@toruslabs/torus.js", "@toruslabs/fetch-node-details"];

const { NODE_ENV = "production" } = process.env;

const baseConfig = {
  mode: NODE_ENV,
  devtool: NODE_ENV === "production" ? false : "source-map",
  entry: "./index.ts",
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

const babelLoaderWithPolyfills = {
  test: /\.(ts|js)x?$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: "babel-loader",
  },
};

const babelLoader = { ...babelLoaderWithPolyfills, use: { loader: "babel-loader", options: { plugins: ["@babel/transform-runtime"] } } };

const umdPolyfilledConfig = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: `${pkgName}.polyfill.umd.min.js`,
    libraryTarget: "umd",
  },
  module: {
    rules: [babelLoaderWithPolyfills],
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

module.exports = [umdPolyfilledConfig, umdConfig, cjsConfig, cjsBundledConfig];
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
