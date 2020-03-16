# torus-direct-web-sdk

This repo allows web applications to directly retrieve keys stored on the Torus Network. Whist the attestationi layer for the Torus Network is generalizable, one of the main ways to access keys is via Google Logins.

To allow your web app to retrieve keys:

1) Install the package
``` npm i torus-direct-web-sdk ```

2) Instantiate the package with your own specific client-id 
      ```
      import TorusSdk from "@toruslabs/torus-direct-web-sdk";

      const torus = new TorusSdk({
        typeOfLogin: "google",
        verifier:"google-MY SPECIFIC VERIFIER",
        GOOGLE_CLIENT_ID: "MY CLIENT ID GOOGLE",
        proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
        network: "ropsten" // details for test net
      });
      ```

3) ```triggerLogin()```


Reach out to hello@tor.us to get your verifier spun up on the testnet today!

