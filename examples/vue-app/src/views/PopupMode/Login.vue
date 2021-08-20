<template>
  <div id="app">
    <div>
      <span :style="{ marginRight: '20px' }">verifier:</span>
      <select v-model="selectedVerifier">
        <option :key="login" v-for="login in Object.keys(verifierMap)" :value="login">{{ verifierMap[login].name }}</option>
      </select>
    </div>
    <div :style="{ marginTop: '20px' }">
      <button @click="login">Login with Torus</button>
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
    <div id="console">
      <p></p>
    </div>
  </div>
</template>

<script lang="ts">
import TorusSdk, { UX_MODE } from "@toruslabs/torus-direct-web-sdk";
import Vue from "vue";

import {
  APPLE,
  AUTH_DOMAIN,
  EMAIL_PASSWORD,
  GITHUB,
  HOSTED_EMAIL_PASSWORDLESS,
  HOSTED_SMS_PASSWORDLESS,
  LINE,
  LINKEDIN,
  TWITTER,
  verifierMap,
  WEIBO,
} from "../../constants";

export default Vue.extend({
  name: "PopupLogin",
  data() {
    return {
      torusdirectsdk: null as TorusSdk | null,
      selectedVerifier: "google",
      verifierMap,
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
      };
    },
  },
  methods: {
    async login(hash: string, queryParameters: Record<string, any>) {
      try {
        if (!this.torusdirectsdk) return;
        const jwtParams = this.loginToConnectionMap[this.selectedVerifier] || {};
        const { typeOfLogin, clientId, verifier } = verifierMap[this.selectedVerifier];
        console.log(hash, queryParameters, typeOfLogin, clientId, verifier, jwtParams);
        const loginDetails = await this.torusdirectsdk.triggerLogin({
          typeOfLogin,
          verifier,
          clientId,
          jwtParams,
          hash,
          queryParameters,
        });

        // const loginDetails = await this.torusdirectsdk.triggerHybridAggregateLogin({
        //   singleLogin: {
        //     typeOfLogin,
        //     verifier,
        //     clientId,
        //     jwtParams,
        //     hash,
        //     queryParameters,
        //   },
        //   aggregateLoginParams: {
        //     aggregateVerifierType: "single_id_verifier",
        //     verifierIdentifier: "tkey-google",
        //     subVerifierDetailsArray: [
        //       {
        //         clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",
        //         typeOfLogin: "google",
        //         verifier: "torus",
        //       },
        //     ],
        //   },
        // });

        // AGGREGATE LOGIN
        // const loginDetails = await this.torusdirectsdk.triggerAggregateLogin({
        //   aggregateVerifierType: "single_id_verifier",
        //   verifierIdentifier: "tkey-google",
        //   subVerifierDetailsArray: [
        //     {
        //       clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",
        //       typeOfLogin: "google",
        //       verifier: "torus"
        //     }
        //   ]
        // });

        // AGGREGATE LOGIN - AUTH0 (Not working - Sample only)
        // const loginDetails = await torusdirectsdk.triggerAggregateLogin({
        //   aggregateVerifierType: "single_id_verifier",
        //   verifierIdentifier: "google-auth0-gooddollar",
        //   subVerifierDetailsArray: [
        //     {
        //       clientId: config.auth0ClientId,
        //       typeOfLogin: "email_password",
        //       verifier: "auth0",
        //       jwtParams: { domain: config.auth0Domain },
        //     },
        //   ],
        // });
        this.console(loginDetails);
      } catch (error) {
        console.error(error, "caught");
      }
    },
    console(...args: unknown[]): void {
      const el = document.querySelector("#console>p");
      if (el) {
        el.innerHTML = JSON.stringify(args || {}, null, 2);
      }
    },
  },
  async mounted() {
    try {
      var url = new URL(location.href);
      const queryParams: Record<string, any> = {};
      for (let key of url.searchParams.keys()) {
        queryParams[key] = url.searchParams.get(key);
      }
      const torusdirectsdk = new TorusSdk({
        uxMode: UX_MODE.POPUP,
        baseUrl: `${location.origin}/serviceworker`,
        enableLogging: true,
        network: "testnet", // details for test net
        popupFeatures: `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=500,width=500,top=100,left=100`,
      });
      // note: Due to browser restrictions on popups, you should reduce the time taken
      // between user interaction and the login popups being opened. This is highly browser dependent,
      // but the best practice for this is to separate the initialization of the SDK and
      // the user login method calls.
      // so don't use torusdirectsdk.init and torusdirectsdk.triggerLogin (or other login methods)
      // in a single function call.
      await torusdirectsdk.init();
      this.torusdirectsdk = torusdirectsdk;
    } catch (error) {
      console.error(error, "mounted caught");
    }
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#console {
  border: 1px solid black;
  height: auto;
  padding: 2px;
  bottom: 10px;
  position: absolute;
  text-align: left;
  width: calc(100% - 20px);
  border-radius: 5px;
}
#console::before {
  content: "Console :";
  position: absolute;
  top: -20px;
  font-size: 12px;
}
#console > p {
  margin: 0.5em;
  word-wrap: break-word;
}
</style>
