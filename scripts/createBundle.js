const browserify = require("browserify");
const fs = require("fs");
const path = require("path");

try {
  const bundler = browserify(path.resolve(__dirname, "../dist/index.js"), {
    fullPaths: true
  });
  // if (process.env.TORUS_BUILD_ENV !== 'development') {
  //   bundler.transform('uglifyify', { global: true, keep_fnames: true })
  // }
  // bundler.transform(
  //   envify({
  //     TORUS_BUILD_ENV: process.env.TORUS_BUILD_ENV
  //   })
  // )

  bundler.bundle().pipe(fs.createWriteStream(path.resolve(__dirname, "../dist/bundle.js")));
} catch (e) {
  console.log(e);
}
