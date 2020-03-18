const path = require("path");

module.exports = {
  entry: "./public/index.js",
  output: {
    filename: "bundle.min.js",
    path: path.resolve(__dirname, "public")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
