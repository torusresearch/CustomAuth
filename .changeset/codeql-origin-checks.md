---
"@toruslabs/customauth": patch
---

Security hardening from CodeQL findings: with `redirectToOpener`, the login popup now accepts `postMessage` results only from the `redirect_uri` origin. The service worker ignores cross-origin `message` events, and the redirect page parses hash/query params into prototype-less objects.
