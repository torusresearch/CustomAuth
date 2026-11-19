# @toruslabs/customauth

## 23.0.0

### Major Changes

- b01450f: Stack upgrade to torus-scripts 9 / Vite+: Node >=24.22.0, npm >=12, Oxlint/Oxfmt, Changesets. Package `types` now point at `dist/lib.cjs/index.d.ts`. Dropped unused `@babel/runtime` peer. Optional `@sentry/core` peer is now `^11.x`. Toruslabs runtime majors: torus.js 19, broadcast-channel 14, fetch-node-details 17, session-manager 6, eccrypto 8, constants 17, http-helpers 10, metadata-helpers 9.

  Breaking type changes: `triggerLogin` now returns `Promise<TorusLoginResponse | null>` (it always resolved to `null` in redirect mode; the type now says so). `ILoginHandler.handleLoginWindow` now returns `Promise<LoginWindowResponse | null>`. Callers must null-check the result before reading fields like `userInfo`.

  Removed `CustomAuthArgs.metadataUrl` and `CustomAuthArgs.useDkg`: torus.js 19 reads the nonce only from node responses (no legacy metadata lookup) and always generates and imports shares for new users.

### Minor Changes

- 5b23ecb: Facebook login now uses the OpenID Connect implicit flow with `response_type=id_token` and scope `openid email` on the `v27.0` dialog, and sends the Facebook `id_token` to the nodes. The flow returns no Facebook access token, so `userInfo.accessToken` is empty for Facebook, and CustomAuth no longer calls Graph `/me`. The user ID, name, email, and profile picture come from the `id_token` claims (`sub`, `name`, `email`, `picture`).

  The login fails with `Facebook login did not return an id_token` if the result has no `id_token`, with `Facebook id_token nonce mismatch` if the token `nonce` does not match the login, and with `Facebook id_token has no sub` if the token has no `sub`. `jwtParams` can no longer change `response_type`, `nonce`, or `state` for Facebook, and `openid` is always in the scope.

  `getRedirectResult` and the redirect page now remove the OAuth result from the URL as soon as they read it, also when the login fails. Log lines that printed the OAuth result are removed.

### Patch Changes

- b01450f: Security hardening from CodeQL findings: with `redirectToOpener`, the login popup now accepts `postMessage` results only from the `redirect_uri` origin. The service worker ignores cross-origin `message` events, and the redirect page parses hash params with `Object.fromEntries` and query params into a prototype-less object.
