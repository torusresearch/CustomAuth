<template>
  <div class="about">
    <h1>This is the redirected page</h1>
    <code>
      {{ loginDetails }}
    </code>
  </div>
</template>

<script lang="ts">
import TorusSdk from "@toruslabs/torus-direct-web-sdk";
import Vue from "vue";

export default Vue.extend({
  name: "Auth",
  data() {
    return {
      loginDetails: "",
    };
  },
  async mounted() {
    const torusdirectsdk = new TorusSdk({
      baseUrl: location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: "redirect",
      network: "testnet",
    });
    const loginDetails = await torusdirectsdk.getRedirectResult();
    console.log(loginDetails);
    this.loginDetails = JSON.stringify(loginDetails, null, 2);
  },
});
</script>
