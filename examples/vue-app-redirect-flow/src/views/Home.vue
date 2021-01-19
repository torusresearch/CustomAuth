<template>
  <div class="home">
    <div :style="{ marginTop: '20px' }">
      <button @click="login">Login with Google</button>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import TorusSdk from "@toruslabs/torus-direct-web-sdk";

export default {
  name: "Home",
  methods: {
    async login() {
      const torusdirectsdk = new TorusSdk({
        baseUrl: location.origin,
        redirectPathName: "auth",
        enableLogging: true,
        uxMode: "redirect",
        network: "testnet"
      });
      await torusdirectsdk.init({ skipInit: true });
      await torusdirectsdk.triggerLogin({
        typeOfLogin: "google",
        verifier: "google-lrc",
        clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com"
      });
    }
  }
};
</script>
