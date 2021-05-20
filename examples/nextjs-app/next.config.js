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
    productionBrowserSourceMaps: true,
  }