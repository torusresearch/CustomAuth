<template>
  <div id="app">
    <div class="mt-[10%]">
      <div>
        <div class="font-bold mb-3">Verifier</div>
        <!-- <span>verifier:</span> -->
        <select v-model="selectedVerifier" class="select select-bordered w-full max-w-xs">
          <option :key="login" v-for="login in Object.keys(verifierMap)" :value="login">{{ verifierMap[login].name }}</option>
        </select>
      </div>
      <input v-model="login_hint" v-if="selectedVerifier === 'torus_email_passwordless'" placeholder="Enter an email" required />
      <div :style="{ marginTop: '20px' }">
        <button @click="login" class="btn-login">Login with Torus</button>
      </div>
      <p>Please note that the verifiers listed in the example have http://localhost:3000/serviceworker/redirect configured as the redirect uri.</p>
      <p>If you use any other domains, they won't work.</p>
      <p>The verifiers listed here only work with the client id's specified in example. Please don't edit them</p>
      <p>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</p>
      <div>
        Reach out to us at
        <a href="mailto:hello@tor.us">hello@tor.us</a>
        or
        <a href="https://t.me/torusdev">telegram group</a>
        to get your verifier deployed for your client id.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TorusSdk, { UX_MODE } from "@toruslabs/customauth";
import { defineComponent } from "vue";

import {
  APPLE,
  AUTH_DOMAIN,
  WEB3AUTH_CLIENT_ID,
  COGNITO,
  COGNITO_AUTH_DOMAIN,
  EMAIL_PASSWORD,
  GITHUB,
  HOSTED_EMAIL_PASSWORDLESS,
  HOSTED_SMS_PASSWORDLESS,
  LINE,
  LINKEDIN,
  REDDIT,
  TORUS_EMAIL_PASSWORDLESS,
  TWITTER,
  verifierMap,
  WEIBO,
} from "../../constants";
export default defineComponent({
  name: "RedirectLogin",
  data() {
    return {
      torusdirectsdk: null as TorusSdk | null,
      selectedVerifier: "google",
      verifierMap,
      login_hint: "",
    };
  },
  computed: {
    loginToConnectionMap(): Record<string, any> {
      return {
        // [GOOGLE]: { login_hint: 'hello@tor.us', prompt: 'none' }, // This allows seamless login with google
        [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
        [HOSTED_EMAIL_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "", isVerifierIdCaseSensitive: false },
        [HOSTED_SMS_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "" },
        [APPLE]: { domain: AUTH_DOMAIN },
        [GITHUB]: { domain: AUTH_DOMAIN },
        [LINKEDIN]: { domain: AUTH_DOMAIN },
        [TWITTER]: { domain: AUTH_DOMAIN },
        [WEIBO]: { domain: AUTH_DOMAIN },
        [LINE]: { domain: AUTH_DOMAIN },
        [COGNITO]: { domain: COGNITO_AUTH_DOMAIN, identity_provider: "Google", response_type: "token", user_info_endpoint: "userInfo" },
        [REDDIT]: { domain: AUTH_DOMAIN, connection: "Reddit", verifierIdField: "name", isVerifierIdCaseSensitive: false },
        [TORUS_EMAIL_PASSWORDLESS]: {
          domain: "https://lrc.auth.openlogin.com",
          verifierIdField: "name",
          isVerifierIdCaseSensitive: false,
          login_hint: this.login_hint,
        },
      };
    },
  },
  async mounted() {
    const torusdirectsdk = new TorusSdk({
      baseUrl: location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: UX_MODE.REDIRECT,
      network: "testnet",
      web3AuthClientId: WEB3AUTH_CLIENT_ID,
    });
    this.torusdirectsdk = torusdirectsdk;
    await torusdirectsdk.init({ skipSw: true });
  },
  methods: {
    async login() {
      if (!this.torusdirectsdk) return;
      const jwtParams = this.loginToConnectionMap[this.selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = verifierMap[this.selectedVerifier];
      return this.torusdirectsdk.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
        customState: { client: "great-company" },
      });
    },
  },
});
</script>

<style scoped>
.btn-login {
  @apply h-12 w-60 m-2 bg-white rounded-3xl font-[#6F717A] font-medium;
  border: 1px solid #6f717a;
}
.select-menu {
  @apply bg-white h-12 w-80 rounded-3xl text-center;
  border: solid 1px;
}
</style>
