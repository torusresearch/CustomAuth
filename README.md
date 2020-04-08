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

This module is distributed in 6 formats

- `commonjs` build `dist/directWebSdk.cjs.js` in es5 format
- `umd` build `dist/directWebSdk.umd.js` in es5 format without polyfilling corejs
- `umd` build `dist/directWebSdk.umd.min.js` in es5 format without polyfilling corejs minified
- `umd` build `dist/directWebSdk.polyfill.umd.js` in es5 format with polyfilling corejs
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

2. Serve [service worker](public/sw.js) from `baseUrl` where baseUrl is the one passed while instantiating `TorusSdk` for specific login (example http://localhost:3000/serviceworker/). If you're already using a sw, pls ensure to port over the fetch override from [our service worker](public/sw.js)

3. For browsers where service workers are not supported or if you wish to not use service workers, create and serve [redirect page](public/redirect.html) from `baseUrl/redirect` where baseUrl is the one passed while instantiating `TorusSdk` for specific login ( example http://localhost:3000/serviceworker/)

4. At verifier's interface (where you obtain client id), please use `baseUrl/redirect` (eg: http://localhost:3000/serviceworker/redirect) as the redirect_uri where baseUrl is the one passed while instantiating `TorusSdk`

5. Instantiate the package with your own specific client-id

```js
const torus = new TorusSdk({
  baseUrl: "http://localhost:3000/serviceworker/",
  GOOGLE_CLIENT_ID: "MY CLIENT ID GOOGLE",
  proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
  network: "ropsten", // details for test net
});
await torus.init();
```

6. Trigger the login
```js
const userInfo = await torus.triggerLogin("google", "google-MY SPECIFIC VERIFIER");
```

Reach out to hello@tor.us to get your verifier spun up on the testnet today!


## Requirements
- This package requires a peer dependency of `@babel/runtime` or `@babel/runtime-corejs3`
- Node 10+