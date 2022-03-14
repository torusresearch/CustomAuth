# Firebase X customauth Demo

## Firebase Prerequisite

- Create a firebase project and configure a web app from [Firebase Console](https://firebase.google.com/console/).

- Enable the Auth providers you would like to offer your users in the firebase console, under
  Auth > Sign-in methods.

- Copy `public/sample-config.js` to `public/config.js`:

```bash
cp public/sample-config.js public/config.js
```

Then copy and paste the Web snippet code found in the firebase console (either by clicking "Add Firebase to
your web app" button in your Project overview, or clicking the "Web setup" button in the Auth page)
in the `config.js` file.

 - `Google OAuth provider note`: You will need to ensure that the OAuth 2.0 Client ID you are using includes the Authorized redirect URI for your firebase handler `https://<firebase-project-id>.firebaseapp.com/__/auth/handler`. Navigate to `https://console.cloud.google.com/apis/credentials?authuser=1&project=<firbase-project-id>`, click on the relevant client id in the "OAuth 2.0 Client IDs" list, add `https://<firebase-project-id>.firebaseapp.com/__/auth/handler` to the "Authorized redirect URIs", and click Save.

## CustomAuth Prerequisites

- Create a custom verifier from [torus developer dashboard](https://developer.tor.us) with following configuration:

  - Make sure to add a following JWT validation fields in custom verifier window ([here](https://firebase.google.com/docs/auth/admin/verify-id-tokens#retrieve_id_tokens_on_clients) is a related, helpful Firebase doc):-

    - `aud`: firebase project id.
    - `iss`: `https://securetoken.google.com/<firebase-project-id>`

  - Use `sub` as `JWT Verifier ID` field in custom verifier window.

  - Use `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com` as JWK Endpoint in custom verifier window

- Replace `TORUS_DIRECT_SDK_VERIFIER_NAME` const in public/app.js file with your Verifier identifier

## How it works

- In app.js file, when user is succesfully logged in, it fetches user's `idToken` and `uid` inside firebase sdk's `onAuthStateChanged` callback and passes it to `getTorusKey` function of customauth for constructing user's private key.

```
  firebase.auth().onAuthStateChanged(async function(user) {
  ...
  ...

  if (user) {
     // fetch the id token of loggedIn user
     const idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);

     // Send token to torus nodes for constructing privateKey
     const { privateKey, publicAddress } = await torusdirectsdk.getTorusKey(
      TORUS_DIRECT_SDK_VERIFIER_NAME,
       firebase.auth().currentUser.uid,
       { verifier_id: firebase.auth().currentUser.uid },
       idToken,
     );
     handleSignedInUser(user, privateKey, publicAddress)
  } else {
    handleSignedOutUser();
  }
});
```

## Installation

Run:

```bash
npm install
```

## Start

Run:

```bash
npm run install
```
