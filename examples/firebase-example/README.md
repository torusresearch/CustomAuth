# Firebase X customauth Demo

## Firebase Prerequisite

- You need to have created a Firebase Project in the
  [Firebase Console](https://firebase.google.com/console/) as well as configured a web app.

- Enable the Auth providers you would like to offer your users in the firebase console, under
  Auth > Sign-in methods.

- Copy `public/sample-config.js` to `public/config.js`:

```bash
cp public/sample-config.js public/config.js
```

Then copy and paste the Web snippet code found in the console (either by clicking "Add Firebase to
your web app" button in your Project overview, or clicking the "Web setup" button in the Auth page)
in the `config.js` file.

## customauth Prerequisite

- Create a custom verifier from [torus developer dashboard](https://developer.tor.us) with following configuration:

  - Make sure to add a following JWT validation fields in custom verifier window:-

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
