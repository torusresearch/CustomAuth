# torus-direct-web-sdk

This repo allows web applications to directly retrieve keys stored on the Torus Network. The attestation layer for the Torus Network is generalizable, below is an example of how to access keys via the SDK via Google.

To allow your web app to retrieve keys:

1. Install the package
   `npm i @toruslabs/torus-direct-web-sdk`

2. Serve [service worker](public/sw.js) from `baseUrl` where baseUrl is the one passed while instantiating `TorusSdk` for specific login (example http://localhost:3000/). If you're already using a sw, pls ensure to port over the fetch override from [our service worker](public/sw.js)

3. For browsers where service workers are not supported or if you wish to not use service workers, create and serve [redirect page](public/redirect.html) from `baseUrl/serviceworker/redirect` where baseUrl is the one passed while instantiating `TorusSdk` for specific login ( example http://localhost:3000/)

4. Instantiate the package with your own specific client-id

```js
const torus = new TorusSdk({
  baseUrl: "http://localhost:3000",
  GOOGLE_CLIENT_ID: "MY CLIENT ID GOOGLE",
  proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
  network: "ropsten", // details for test net
});
await torus.init();
```

5. Trigger the login
```js
const userInfo = await torus.triggerLogin("google", "google-MY SPECIFIC VERIFIER");
```

Reach out to hello@tor.us to get your verifier spun up on the testnet today!
