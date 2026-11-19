# @toruslabs/customauth

## 23.0.0

### Major Changes

- 1946549: Stack upgrade to torus-scripts 9 / Vite+: Node >=24.22.0, npm >=12, Oxlint/Oxfmt, Changesets. Package `types` now point at `dist/lib.cjs/index.d.ts`. Dropped unused `@babel/runtime` peer. Toruslabs runtime majors: torus.js 19, broadcast-channel 14, fetch-node-details 17, session-manager 6, eccrypto 8, constants 17, http-helpers 10, metadata-helpers 9.

  Breaking type changes: `triggerLogin` now returns `Promise<TorusLoginResponse | null>` (it always resolved to `null` in redirect mode; the type now says so). `ILoginHandler.handleLoginWindow` now returns `Promise<LoginWindowResponse | null>`. Callers must null-check the result before reading fields like `userInfo`.

  Removed `CustomAuthArgs.metadataUrl` and `CustomAuthArgs.useDkg`: torus.js 19 reads the nonce only from node responses (no legacy metadata lookup) and always generates and imports shares for new users.

### Patch Changes

- 5118c91: Security hardening from CodeQL findings: with `redirectToOpener`, the login popup now accepts `postMessage` results only from the `redirect_uri` origin. The service worker ignores cross-origin `message` events, and the redirect page parses hash params with `Object.fromEntries` and query params into a prototype-less object.
