---
"@toruslabs/customauth": major
---

Stack upgrade to torus-scripts 9 / Vite+: Node >=24.22.0, npm >=12, Oxlint/Oxfmt, Changesets. Package `types` now point at `dist/lib.cjs/index.d.ts`. Dropped unused `@babel/runtime` peer. `@toruslabs/broadcast-channel` 13.3.0 → 14.0.0 (EMBED-586). torus.js stays on 17.2.3 until EMBED-588, so eccrypto 8, constants 17, and metadata-helpers 9 install nested under broadcast-channel.
