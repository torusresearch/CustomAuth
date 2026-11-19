---
"@toruslabs/customauth": patch
---

Add optional `popupStartUrl` on popup logins. When set, the popup opens that URL first and completes a same-origin `w3a:popup_start` handshake with the opener before navigating to the identity provider. Redirect mode is unchanged.
