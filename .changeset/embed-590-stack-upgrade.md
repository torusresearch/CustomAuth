---
"@toruslabs/customauth": major
---

Stack upgrade to torus-scripts 9 / Vite+: Node >=24.22.0, npm >=12, Oxlint/Oxfmt, Changesets. Package `types` now point at `dist/lib.cjs/index.d.ts`. Dropped unused `@babel/runtime` peer. Toruslabs runtime majors: torus.js 18, broadcast-channel 14, fetch-node-details 17, session-manager 6, eccrypto 8, constants 17, http-helpers 10, metadata-helpers 9.

Breaking type changes: `triggerLogin` now returns `Promise<TorusLoginResponse | null>` (it always resolved to `null` in redirect mode; the type now says so). `ILoginHandler.handleLoginWindow` now returns `Promise<LoginWindowResponse | null>`. Callers must null-check the result before reading fields like `userInfo`.
