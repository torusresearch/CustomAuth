module.exports = {
  async redirects() {
    return [
      {
        source: "/serviceworker",
        destination: "/serviceworker/redirect.html",
        permanent: true,
      },
    ];
  },
  distDir: ".next", // Use the default output directory for Vercel
  productionBrowserSourceMaps: true,
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: ["@toruslabs/customauth", "@toruslabs/torus.js", "@toruslabs/eccrypto"],
};