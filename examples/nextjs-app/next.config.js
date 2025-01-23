module.exports = {
    async redirects() {
      return [
        {
          source: '/serviceworker',
          destination: '/serviceworker/redirect.html',
          permanent: true,
        },
      ]
    },
    distDir: 'build', // Change 'build' to your desired output directory
    productionBrowserSourceMaps: true,
  }