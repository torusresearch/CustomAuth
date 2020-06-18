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
<script src="https://cdn.jsdelivr.net/npm/@toruslabs/torus-direct-web-sdk"></script>
```

unpkg

```js
<script src="https://unpkg.com/@toruslabs/torus-direct-web-sdk"></script>
```

### Tips for NUXT

This is a plugin that works [only on the client side](https://nuxtjs.org/guide/plugins/#client-side-only). So please register it as a ssr-free plugin.

## Usage

Add [`@toruslabs/torus-direct-web-sdk`](https://www.npmjs.com/package/@toruslabs/torus-direct-web-sdk) to your project:

To allow your web app to retrieve keys:

1. Install the package
   `npm i @toruslabs/torus-direct-web-sdk`

2. If you're using `redirectToOpener`, modify the origin of postMessage from `"http://localhost:3000"` to your hosted domain in redirect.html and sw.js

3. Serve [service worker](public/sw.js) from `baseUrl` where baseUrl is the one passed while instantiating `DirectWebSdk` for specific login (example http://localhost:3000/serviceworker/). If you're already using a sw, pls ensure to port over the fetch override from [our service worker](public/sw.js)

4. For browsers where service workers are not supported or if you wish to not use service workers, create and serve [redirect page](public/redirect.html) from `baseUrl/redirect` where baseUrl is the one passed while instantiating `DirectWebSdk` for specific login ( example http://localhost:3000/serviceworker/)

5. At verifier's interface (where you obtain client id), please use `baseUrl/redirect` (eg: http://localhost:3000/serviceworker/redirect) as the redirect_uri where baseUrl is the one passed while instantiating `DirectWebSdk`

6. Instantiate the package with your own specific client-id

```js
const torus = new DirectWebSdk({
  baseUrl: "http://localhost:3000/serviceworker/",
  proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
  network: "ropsten", // details for test net
});
await torus.init();
```

7. Trigger the login

```js
const userInfo = await torus.triggerLogin({
  typeOfLogin: "google",
  verifier: "YOUR VERIFER DEPLOYED BY TORUS",
  clientId: "MY CLIENT ID GOOGLE",
});
```

8. Reach out to hello@tor.us to get your verifier spun up on the testnet today!

## Examples

Please refer to examples, [vue.js](examples/vue-app/src/App.vue), [gatsby](https://github.com/jamespfarrell/gatsby-torus-direct) for configuration

Hosted Example for testing is [here](https://vue-direct.tor.us/)

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

## Requirements

- This package requires a peer dependency of `@babel/runtime`
- Node 10+

### Note
If you are using the redirectToOpener option, you *must* update your redirect.html to [allow whitelisted URIs](https://github.com/torusresearch/serviceworker-server/blob/2d1b5e886a96d544f9fbd04f8a59cdc2d794240e/public/redirect.html#L222)
