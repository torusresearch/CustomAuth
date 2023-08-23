<template>
  <div class="flex flex-col justify-center items-center text-center mt-[150px]">
    <div class="mb-3 text-xl font-medium">Verifier</div>
    <!-- <span>verifier:</span> -->
    <select v-model="selectedVerifier" class="w-full max-w-xs select select-bordered dark:border-app-gray-200">
      <option :key="login" v-for="login in Object.keys(verifierMap)" :value="login">{{ verifierMap[login].name }}</option>
    </select>
    <select v-model="selectedNetwork" class="w-full max-w-xs select select-bordered dark:border-app-gray-200 mt-4 capitalize">
      <option :key="network" v-for="network in networkList" :value="network">
        {{ network.replace("_", " ") }}
      </option>
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
    <div class="my-5 flex flex-col px-6 sm:px-0 sm:flex-row gap-4 w-full sm:w-[400px]">
      <button @click="login()" class="custom-btn">Login with Torus</button>
      <button @click="onBack" class="custom-btn">Back</button>
    </div>
    <ul class="text-sm text-app-gray-700 dark:text-app-gray-200 font-normal mt-4 mb-5 px-6">
      <li>
        Please note that the verifiers listed in the example have
        <span class="font-semibold text-app-gray-900 dark:text-white">http://localhost:3000/serviceworker/redirect</span>
        configured as the redirect uri.
      </li>
      <li>If you use any other domains, they won't work.</li>
      <li>The verifiers listed here only work with the client id's specified in example. Please don't edit them</li>
      <li>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</li>
    </ul>
    <div class="text-base text-app-gray-900 dark:text-app-gray-200 font-medium mt-4 mb-5 px-6">
      Reach out to us at
      <a class="text-app-primary-600 dark:text-app-primary-500 underline" href="mailto:hello@tor.us">hello@tor.us</a>
      or
      <a class="text-app-primary-600 dark:text-app-primary-500 underline" href="https://t.me/torusdev">telegram group</a>
      to get your verifier deployed for your client id.
    </div>
  </div>
</template>

<script lang="ts">
import TorusSdk, { UX_MODE } from "@toruslabs/customauth";
import { defineComponent } from "vue";
import { TORUS_SAPPHIRE_NETWORK, TORUS_LEGACY_NETWORK } from "@toruslabs/constants";

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
  TORUS_SMS_PASSWORDLESS,
  TWITTER,
  verifierMap,
  WEIBO,
  LOCAL_NETWORK,
} from "../../constants";
export default defineComponent({
  name: "RedirectLogin",
  data() {
    return {
      customAuthSdk: null as TorusSdk | null,
      selectedVerifier: "google",
      verifierMap,
      login_hint: "",
      networkList: [...Object.values(TORUS_SAPPHIRE_NETWORK), ...Object.values(TORUS_LEGACY_NETWORK)],
      selectedNetwork: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
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
          domain: "https://develop-passwordless.web3auth.io",
          verifierIdField: "name",
          isVerifierIdCaseSensitive: false,
          login_hint: this.login_hint,
          connection: "email",
        },
        [TORUS_SMS_PASSWORDLESS]: {
          domain: "https://develop-passwordless.web3auth.io",
          verifierIdField: "name",
          login_hint: this.login_hint,
          connection: "sms",
        },
      };
    },
  },
  // async mounted() {
  //   const customAuthSdk = new TorusSdk({
  //     baseUrl: location.origin,
  //     redirectPathName: "auth",
  //     enableLogging: true,
  //     uxMode: UX_MODE.REDIRECT,
  //     network: this.selectedNetwork,
  //     web3AuthClientId: WEB3AUTH_CLIENT_ID,
  //   });
  //   this.customAuthSdk = customAuthSdk;
  //   await customAuthSdk.init({ skipSw: true });
  // },
  methods: {
    async login() {
      const customAuthSdk = new TorusSdk({
        baseUrl: location.origin,
        redirectPathName: "auth",
        enableLogging: true,
        uxMode: UX_MODE.REDIRECT,
        network: this.selectedNetwork,
        web3AuthClientId: WEB3AUTH_CLIENT_ID,
      });
      this.customAuthSdk = customAuthSdk;
      localStorage.setItem(LOCAL_NETWORK, this.selectedNetwork);
      await customAuthSdk.init({ skipSw: true });
      if (!this.customAuthSdk) return;

      const jwtParams = this.loginToConnectionMap[this.selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier, name } = verifierMap[this.selectedVerifier];
      const webauthnRegister = name === "WebAuthn Register";
      const registerOnly = webauthnRegister ? true : false;
      const loginOnly = webauthnRegister ? "false" : "true";

      return this.customAuthSdk.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
        registerOnly,
        customState: {
          client: "great-company",
          webauthnURL: "https://d1f8-115-66-172-125.ngrok.io/",
          localhostAll: "true",
          loginOnly,
          webauthnTransports: "ble",
          credTransports: "ble",
        },
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
