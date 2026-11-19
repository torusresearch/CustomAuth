---
"@toruslabs/customauth": minor
---

Facebook login now uses the OpenID Connect implicit flow with `response_type=id_token` and scope `openid email` on the `v27.0` dialog, and sends the Facebook `id_token` to the nodes. The flow returns no Facebook access token, so `userInfo.accessToken` is empty for Facebook, and CustomAuth no longer calls Graph `/me`. The user ID, name, email, and profile picture come from the `id_token` claims (`sub`, `name`, `email`, `picture`).

The login fails with `Facebook login did not return an id_token` if the result has no `id_token`, with `Facebook id_token nonce mismatch` if the token `nonce` does not match the login, and with `Facebook id_token has no sub` if the token has no `sub`. `jwtParams` can no longer change `response_type`, `nonce`, or `state` for Facebook, and `openid` is always in the scope.

`getRedirectResult` and the redirect page now remove the OAuth result from the URL as soon as they read it, also when the login fails. Log lines that printed the OAuth result are removed.
