<template>
  <div id="app">
    <div>
      <span :style="{ marginRight: '20px' }">verifier:</span>
      <select v-model="selectedVerifier">
        <option :key="login" v-for="login in Object.keys(verifierMap)" :value="login">{{ verifierMap[login].name }}</option>
      </select>
    </div>
    <div :style="{ marginTop: '20px' }" v-if="selectedVerifier === 'passwordless'">
      <input type="email" v-model="loginHint" placeholder="Enter your email" />
    </div>
    <div :style="{ marginTop: '20px' }">
      <button @click="login">Login with Torus</button>
    </div>
    <p>Please note that the verifiers listed in the example have http://localhost:3000/serviceworker/redirect configured as the redirect uri.</p>
    <p>If you use any other domains, they won't work.</p>
    <p>The verifiers listed here only work with the client id's specified in example. Please don't edit them</p>
    <p>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</p>
    <div>
      Reach out to us at <a href="mailto:hello@tor.us">hello@tor.us</a> or <a href="https://t.me/torusdev">telegram group</a> to get your verifier
      deployed for your client id.
    </div>
  </div>
</template>

<script lang="ts">
import TorusSdk, { UX_MODE } from "@toruslabs/torus-direct-web-sdk";
import Vue from "vue";
const GOOGLE = "google";
const FACEBOOK = "facebook";
const REDDIT = "reddit";
const DISCORD = "discord";
const TWITCH = "twitch";
const GITHUB = "github";
const APPLE = "apple";
const LINKEDIN = "linkedin";
const TWITTER = "twitter";
const WEIBO = "weibo";
const LINE = "line";
const EMAIL_PASSWORD = "email_password";
const PASSWORDLESS = "passwordless";
const HOSTED_EMAIL_PASSWORDLESS = "hosted_email_passwordless";
const HOSTED_SMS_PASSWORDLESS = "hosted_sms_passwordless";
const WEBAUTHN = "webauthn";

const AUTH_DOMAIN = "https://torus-test.auth0.com";
export default Vue.extend({
  name: "Home",
  data() {
    return {
      torusdirectsdk: null as TorusSdk | null,
      selectedVerifier: "google",
      loginHint: "",
      verifierMap: {
        [GOOGLE]: {
          name: "Google",
          typeOfLogin: "google",
          clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",
          verifier: "google-lrc",
        },
        [FACEBOOK]: { name: "Facebook", typeOfLogin: "facebook", clientId: "617201755556395", verifier: "facebook-lrc" },
        [REDDIT]: { name: "Reddit", typeOfLogin: "reddit", clientId: "YNsv1YtA_o66fA", verifier: "torus-reddit-test" },
        [TWITCH]: { name: "Twitch", typeOfLogin: "twitch", clientId: "f5and8beke76mzutmics0zu4gw10dj", verifier: "twitch-lrc" },
        [DISCORD]: { name: "Discord", typeOfLogin: "discord", clientId: "682533837464666198", verifier: "discord-lrc" },
        [EMAIL_PASSWORD]: {
          name: "Email Password",
          typeOfLogin: "email_password",
          clientId: "sqKRBVSdwa4WLkaq419U7Bamlh5vK1H7",
          verifier: "torus-auth0-email-password",
        },
        [PASSWORDLESS]: {
          name: "Passwordless",
          typeOfLogin: "passwordless",
          clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
          verifier: "torus-auth0-passwordless",
        },
        [APPLE]: { name: "Apple", typeOfLogin: "apple", clientId: "m1Q0gvDfOyZsJCZ3cucSQEe9XMvl9d9L", verifier: "torus-auth0-apple-lrc" },
        [GITHUB]: { name: "Github", typeOfLogin: "github", clientId: "PC2a4tfNRvXbT48t89J5am0oFM21Nxff", verifier: "torus-auth0-github-lrc" },
        [LINKEDIN]: { name: "Linkedin", typeOfLogin: "linkedin", clientId: "59YxSgx79Vl3Wi7tQUBqQTRTxWroTuoc", verifier: "torus-auth0-linkedin-lrc" },
        [TWITTER]: { name: "Twitter", typeOfLogin: "twitter", clientId: "A7H8kkcmyFRlusJQ9dZiqBLraG2yWIsO", verifier: "torus-auth0-twitter-lrc" },
        [WEIBO]: { name: "Weibo", typeOfLogin: "weibo", clientId: "dhFGlWQMoACOI5oS5A1jFglp772OAWr1", verifier: "torus-auth0-weibo-lrc" },
        [LINE]: { name: "Line", typeOfLogin: "line", clientId: "WN8bOmXKNRH1Gs8k475glfBP5gDZr9H1", verifier: "torus-auth0-line-lrc" },
        [HOSTED_EMAIL_PASSWORDLESS]: {
          name: "Hosted Email Passwordless",
          typeOfLogin: "jwt",
          clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
          verifier: "torus-auth0-passwordless",
        },
        [HOSTED_SMS_PASSWORDLESS]: {
          name: "Hosted SMS Passwordless",
          typeOfLogin: "jwt",
          clientId: "nSYBFalV2b1MSg5b2raWqHl63tfH3KQa",
          verifier: "torus-auth0-sms-passwordless",
        },
        [WEBAUTHN]: {
          name: "WebAuthn",
          typeOfLogin: "webauthn",
          clientId: "webauthn",
          verifier: "webauthn-lrc",
        }
      } as Record<string, any>,
    };
  },
  computed: {
    loginToConnectionMap(): Record<string, any> {
      return {
        // [GOOGLE]: { login_hint: 'hello@tor.us', prompt: 'none' }, // This allows seamless login with google
        [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
        [PASSWORDLESS]: { domain: AUTH_DOMAIN, login_hint: this.loginHint },
        [HOSTED_EMAIL_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "", isVerifierIdCaseSensitive: false },
        [HOSTED_SMS_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "" },
        [APPLE]: { domain: AUTH_DOMAIN },
        [GITHUB]: { domain: AUTH_DOMAIN },
        [LINKEDIN]: { domain: AUTH_DOMAIN },
        [TWITTER]: { domain: AUTH_DOMAIN },
        [WEIBO]: { domain: AUTH_DOMAIN },
        [LINE]: { domain: AUTH_DOMAIN },
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

      const { typeOfLogin, clientId, verifier } = this.verifierMap[this.selectedVerifier];
      return this.torusdirectsdk.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
        customState: { client: "great-company" }
      });
    }
  }
});
</script>
