# Torus-direct-web-sdk

[![npm version](https://badge.fury.io/js/%40toruslabs%2Ftorus-direct-web-sdk.svg)](https://badge.fury.io/js/%40toruslabs%2Ftorus-direct-web-sdk)
![npm](https://img.shields.io/npm/dw/@toruslabs/torus-direct-web-sdk)

## Introduction

This repo allows web applications to directly retrieve keys stored on the Torus Network. The attestation layer for the Torus Network is generalizable, below is an example of how to access keys via the SDK via Google.

## Features

- Typescript compatible. Includes Type definitions
- All API's return `Promises`

## Installation

### Bundling

This module is distributed in 3 formats

- `commonjs` build `dist/directWebSdk.cjs.js` in es5 format
- `commonjs` build `dist/directWebSdk-bundled.cjs.js` in es5 format with problematic packages bundled (benfits non-webpack users)
- `umd` build `dist/directWebSdk.umd.min.js` in es5 format without polyfilling corejs minified
- `umd` build `dist/directWebSdk.polyfill.umd.min.js` in es5 format with polyfilling corejs minified

By default, the appropriate format is used for your specified usecase
You can use a different format (if you know what you're doing) by referencing the correct file

The cjs build is not polyfilled with core-js.
It is upto the user to polyfill based on the browserlist they target

### Directly in Browser

CDN's serve the non-core-js polyfilled version by default. You can use a different

jsdeliver

```js
<script src="https://cdn.jsdelivr.net/npm/@toruslabs/torus-direct-web-sdk@4"></script>
```

unpkg

```js
<script src="https://unpkg.com/@toruslabs/torus-direct-web-sdk@4"></script>
```

### Tips for NUXT

This is a plugin that works [only on the client side](https://nuxtjs.org/guide/plugins/#client-side-only). So please register it as a ssr-free plugin.

## Usage

For more in-depth documentation, please refer to docs [here](https://docs.tor.us/direct-auth/quick-start)

Add [`@toruslabs/torus-direct-web-sdk`](https://www.npmjs.com/package/@toruslabs/torus-direct-web-sdk) to your project:

To allow your web app to retrieve keys:

Install the package
   `npm i @toruslabs/torus-direct-web-sdk`
   or
   `yarn add @toruslabs/torus-direct-web-sdk`

Direct Web Sdk supports two modes of login (`uxMode: "popup"` and `uxMode: "redirect"`) (default: `popup`)

#### Popup Flow:

1. Serve [service worker](serviceworker/sw.js) from `baseUrl` where baseUrl is the one passed while instantiating `DirectWebSdk` for specific login (example http://localhost:3000/serviceworker/). If you're already using a sw, pls ensure to port over the fetch override from [our service worker](serviceworker/sw.js)

2. For browsers where service workers are not supported or if you wish to not use service workers, create and serve [redirect page](serviceworker/redirect.html) from `baseUrl/redirect` where baseUrl is the one passed while instantiating `DirectWebSdk` for specific login ( example http://localhost:3000/serviceworker/)

3. At verifier's interface (where you obtain client id), please use `baseUrl/redirect` (eg: http://localhost:3000/serviceworker/redirect) as the redirect_uri where baseUrl is the one passed while instantiating `DirectWebSdk`

4. Instantiate the package
   
```js
const torus = new DirectWebSdk({
  baseUrl: "http://localhost:3000/serviceworker/",
  network: "testnet", // details for test net
});
await torus.init();
```

5. Trigger the login with your own client id (This opens a popup of OAuth provider page)

```js
const loginDetails = await torus.triggerLogin({
  typeOfLogin: "google",
  verifier: "YOUR VERIFER DEPLOYED BY TORUS",
  clientId: "MY CLIENT ID GOOGLE",
});
```

Note: If you're using `redirectToOpener`, modify the origin of postMessage from `"http://localhost:3000"` to your hosted domain in redirect.html and sw.js

#### Redirect flow

1. At verifier's interface (where you obtain client id), please use `baseUrl/auth` (eg: http://localhost:3000/auth) as the redirect_uri where baseUrl is the one passed while instantiating `DirectWebSdk`

2. Instantiate the package
   
```js
const torus = new DirectWebSdk({
  baseUrl: "http://localhost:3000/serviceworker/",
  redirectPathName: "auth",
  network: "testnet", // details for test net
  uxMode: "redirect"
});
await torusdirectsdk.init({ skipSw: true });
```

3. Trigger the login with your client id. (This redirects the user to OAuth provider page)

```js
await torus.triggerLogin({
  typeOfLogin: "google",
  verifier: "YOUR VERIFER DEPLOYED BY TORUS",
  clientId: "MY CLIENT ID GOOGLE",
});
```

4. The OAuth login completes and the OAuth provider will redirect you to  `baseUrl/auth` with hashParams
   In this page, use the following code to get the login details

```js
const torusdirectsdk = new DirectWebSdk({
  baseUrl: location.origin,
  redirectPathName: "auth",
  uxMode: "redirect",
  network: "testnet"
});
const loginDetails = await torusdirectsdk.getRedirectResult();
```

5. Once you get the login details, you can choose to take the user anywhere else in your app
   
## Examples

Please refer to examples
- [vue](examples/vue-app/src/App.vue) for popup flow
- [react](examples/react-app/src/App.js) for popup flow
- [angular](examples/angular-app/src/app/app.component.ts) for popup flow
- [vue](examples/vue-app-redirect-flow/src/App.vue) for redirect flow
- [gatsby](https://github.com/jamespfarrell/gatsby-torus-direct) for configuration

Hosted Example for testing 
- [Popup Flow](https://vue-direct.tor.us/)
- [Redirect Flow](https://vue-redirect.tor.us/)

## Info

The following links help you create OAuth accounts with different login providers

- [Google](https://support.google.com/googleapi/answer/6158849)
- [Facebook](https://developers.facebook.com/docs/apps)
- [Reddit](https://github.com/reddit-archive/reddit/wiki/oauth2)
- [Twitch](https://dev.twitch.tv/docs/authentication/#registration)
- [Discord](https://discord.com/developers/docs/topics/oauth2)

For other verifiers,

- you'll need to create an [Auth0 account](https://auth0.com/)
- [create an application](https://auth0.com/docs/connections) for the login type you want
- Pass in the clientId, domain of the Auth0 application into the torus login request

## Best practices

- Due to browser restrictions on popups, you should reduce the time taken between user interaction and the login popups being opened. This is highly browser dependent, but the best practice for this is to separate the initialization of the SDK and the user login method calls.

## FAQ

**Question:** My Redirect page is stuck in iOS Chrome

**Answer:**
iOS Chrome doesn't support service workers. So, you need to serve a fallback html page `redirect.html`
Please check if redirect.html is being served correctly by navigating to `baseUrl/redirect#a=123`. It should show a loader

For nginx, here is a simple server configuration

```nginx
    location ~* (/serviceworker/redirect) {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header Content-Security-Policy "default-src https:; script-src https: 'unsafe-inline' 'unsafe-eval'; style-src https: 'unsafe-inline';";
            add_header X-Content-Type-Options nosniff;
            add_header X-XSS-Protection "1; mode=block";
            add_header Strict-Transport-Security "max-age=31536000; includeSubdomains; preload";
            default_type "text/html";
            alias PATH_TO_REDIRECT_HTML_FILE;
            autoindex off;
    }

```

Alternatively, you can configure your redirect url to include redirect.html by passing in an option `redirectPathName: 'redirect.html'` while instantiating the sdk.
Please remember to change the oauth redirect url to reflect this change

##

**Question:** Discord Login only works once in 30 min

**Answer:**
Torus Login requires a new token for every login attempt. Discord returns the same access token for 30 min unless it's revoked. Unfortunately, it needs to be revoked from the backend since it needs a client secret. Here's some sample code which does it

```js
const axios = require("axios").default;
const FormData = require("form-data");

const { DISCORD_CLIENT_SECRET, DISCORD_CLIENT_ID } = process.env;
const { token } = req.body;
const formData = new FormData();
formData.append("token", token);
await axios.post("https://discordapp.com/api/oauth2/token/revoke", formData, {
  headers: {
    ...formData.getHeaders(),
    Authorization: `Basic ${Buffer.from(`${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`, "binary").toString("base64")}`,
  },
});
```

##

**Question:** How to initialise web3 with private key (returned after login) ?

**Answer:**
One can use privateKeyToAccount method to initialise web3 with a privatekey. If you are supplying a hexadecimal number, it must have 0x prefix in order to be in line with other Ethereum libraries. 

```js
web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
```

## Requirements

- This package requires a peer dependency of `@babel/runtime`
- Node 10+

### Note
If you are using the redirectToOpener option, you *must* update your redirect.html to [allow whitelisted URIs](serviceworker/redirect.html#L222)
