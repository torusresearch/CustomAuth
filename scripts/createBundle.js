/* eslint-disable import/no-extraneous-dependencies */

const browserify = require("browserify");
const fs = require("fs");
const path = require("path");

try {
  const bundler = browserify(path.resolve(__dirname, "../public/index.js"), {
    fullPaths: true
  });
  if (process.env.NODE_ENV !== "development") {
    bundler.transform("uglifyify", { global: true, keep_fnames: true });
  }

  bundler.bundle().pipe(fs.createWriteStream(path.resolve(__dirname, "../public/bundle.min.js")));
} catch (e) {
  console.log(e);
}
