<template>
  <div class="flex flex-col justify-center items-center text-center mt-[150px]">
    <div class="mb-3 text-xl font-medium">Verifier</div>
    <!-- <span>verifier:</span> -->
    <select v-model="selectedVerifier" class="w-full max-w-xs select select-bordered">
      <option :key="login" v-for="login in Object.keys(verifierMap)" :value="login">{{ verifierMap[login].name }}</option>
    </select>
    <input
      v-model="login_hint"
      v-if="selectedVerifier === 'torus_email_passwordless'"
      placeholder="Enter an email"
      required
      class="login-input mt-4 w-[320px] border-app-gray-400 !border"
    />
    <input
      v-model="login_hint"
      v-if="selectedVerifier === 'torus_sms_passwordless'"
      placeholder="Eg: (+{cc}-{number})"
      required
      class="login-input mt-4 w-[320px] border-app-gray-400 !border"
    />
    <div class="my-5 flex gap-4 w-[400px]">
      <button @click="login()" class="custom-btn">Login with Torus</button>
      <button @click="onBack" class="custom-btn">Back</button>
    </div>
    <ul class="text-sm text-app-gray-700 font-normal mt-4 mb-5">
      <li>
        Please note that the verifiers listed in the example have
        <span class="font-semibold text-app-gray-900">http://localhost:3000/serviceworker/redirect</span>
        configured as the redirect uri.
      </li>
      <li>If you use any other domains, they won't work.</li>
      <li>The verifiers listed here only work with the client id's specified in example. Please don't edit them</li>
      <li>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</li>
    </ul>
    <div class="text-base text-app-gray-900 font-medium mt-4 mb-5">
      Reach out to us at
      <a class="text-app-primary-600 underline" href="mailto:hello@tor.us">hello@tor.us</a>
      or
      <a class="text-app-primary-600 underline" href="https://t.me/torusdev">telegram group</a>
      to get your verifier deployed for your client id.
    </div>
  </div>
</template>

<script lang="ts">
import TorusSdk, { UX_MODE } from "@toruslabs/customauth";
import { defineComponent } from "vue";

import {
  APPLE,
  AUTH_DOMAIN,
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
  TORUS_SMS_PASSWORDLESS,
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
          connection: "email",
        },
        [TORUS_SMS_PASSWORDLESS]: {
          domain: "https://lrc.auth.openlogin.com",
          verifierIdField: "name",
          login_hint: this.login_hint,
          connection: "sms",
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
    onBack() {
      this.$router.push("/");
    },
  },
});
</script>

<style scoped>
@import "./Auth.css";
</style>
