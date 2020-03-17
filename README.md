# torus-direct-web-sdk

This repo allows web applications to directly retrieve keys stored on the Torus Network. The attestation layer for the Torus Network is generalizable, below is an example of how to access keys via the SDK via Google.

To allow your web app to retrieve keys:

1) Install the package
``` npm i torus-direct-web-sdk ```

2) Create and serve redirect page(https://github.com/torusresearch/torus-direct-web-sdk/blob/master/examples/vue-app/public/redirect.html) through a redirect_uri via your server for specific login ( example localhost:3000/redirect)

3) Edit and serve sw.js (service worker) that bypasses the OAuth token from being relayed to the server. 

```
...

self.addEventListener('fetch', function(event) {
  try {
    const url = new URL(event.request.url)
    if (url.pathname.includes('/serviceworker/redirect') && url.href.includes(getScope())) {  // <---- edit /serviceworker/redirect to your redirect

...
              
```
4) On a parent domain register sw.js before procing login. Example in https://github.com/torusresearch/torus-direct-web-sdk/blob/master/examples/vue-app/src/App.vue:

```
  import TorusSdk from "@toruslabs/torus-direct-web-sdk";
...
 mounted() {
     const torus = new TorusSdk()
     console.log("Registering service worker")
     torus.registerServiceWorker("https://localhost:3000/") // where serviceWorker is hosted at https://localhost:3000/sw.js
  },
...

```

5) Instantiate the package with your own specific client-id 
      ```
      const torus = new TorusSdk({
        typeOfLogin: "google",
        verifier:"google-MY SPECIFIC VERIFIER",
        GOOGLE_CLIENT_ID: "MY CLIENT ID GOOGLE",
        proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
        network: "ropsten" // details for test net
      });
      ```

6) ```triggerLogin()```




Reach out to hello@tor.us to get your verifier spun up on the testnet today!

