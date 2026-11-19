---
"@toruslabs/customauth": minor
---

Facebook login now uses the OpenID Connect implicit flow (`response_type=token id_token`, scope `openid public_profile email`) on Graph API `v27.0`, and sends the Facebook `id_token` to the nodes instead of the access token. The login fails with `Facebook login did not return an id_token` if the result has no `id_token`, and with `Facebook id_token nonce mismatch` if the token `nonce` does not match the login. `jwtParams` can no longer change `response_type`, `nonce`, or `state` for Facebook, and `openid` is always in the scope.

`getRedirectResult` and the redirect page now remove the OAuth result from the URL as soon as they read it, also when the login fails. Log lines that printed the OAuth result are removed.
