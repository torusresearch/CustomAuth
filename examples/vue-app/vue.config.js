module.exports = {
  devServer: {
    https: true,
    host: "localhost",
    port: 3000, // CHANGE YOUR PORT HERE!
    hotOnly: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "max-age=3600"
    },
    historyApiFallback: {
      rewrites: [
        { from: /redirect/, to: "/redirect.html" },
        { from: /./, to: "/index.html" }
      ]
    }
  }
};
