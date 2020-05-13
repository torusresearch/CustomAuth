module.exports = {
  devServer: {
    https: false,
    host: "localhost",
    port: 3000, // CHANGE YOUR PORT HERE!
    hotOnly: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    historyApiFallback: {
      rewrites: [
        { from: /serviceworker\/sw.js/, to: "/serviceworker/sw.js" },
        { from: /serviceworker\/redirect/, to: "/serviceworker/redirect.html" },
        { from: /./, to: "/index.html" },
      ],
    },
  },
};
