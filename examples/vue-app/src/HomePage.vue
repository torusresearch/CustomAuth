<template>
  <div id="app">
    <div class="mode">
      <router-link to="/redirectMode"><button>Login with Redirect Mode (Recommended)</button></router-link>
      <router-link to="/popupMode"><button>Login with Popup Mode</button></router-link>
    </div>
    <div id="console">
      <p></p>
    </div>
  </div>
</template>

<script lang="ts">
import TorusSdk from "@toruslabs/customauth";
import Vue from "vue";

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
  TWITTER,
  verifierMap,
  WEIBO,
} from "./constants";

export default Vue.extend({
  name: "HomePage",
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
        [COGNITO]: { domain: COGNITO_AUTH_DOMAIN, identity_provider: "Google", response_type: "token", user_info_endpoint: "userInfo" },
      };
    },
  },
  methods: {
    async _login(hash: string, queryParameters: Record<string, any>) {
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
    _handleRedirectParameters(
      hash: string,
      queryParameters: Record<string, string | null>
    ): {
      error: string;
      instanceParameters: Record<string, any>;
      hashParameters: Record<string, string>;
    } {
      const hashParameters = hash.split("&").reduce((result: Record<string, string>, item: string) => {
        const [part0, part1] = item.split("=");
        result[part0] = part1;
        return result;
      }, {});
      console.log(hashParameters, queryParameters);
      let instanceParameters = {};
      let error = "";
      if (!queryParameters.preopenInstanceId) {
        if (Object.keys(hashParameters).length > 0 && hashParameters.state) {
          instanceParameters = JSON.parse(atob(decodeURIComponent(decodeURIComponent(hashParameters.state)))) || {};
          error = hashParameters.error_description || hashParameters.error || error;
        } else if (Object.keys(queryParameters).length > 0 && queryParameters.state) {
          instanceParameters = JSON.parse(atob(decodeURIComponent(decodeURIComponent(queryParameters.state)))) || {};
          if (queryParameters.error) error = queryParameters.error;
        }
      }
      return { error, instanceParameters, hashParameters };
    },
  },
  async mounted() {
    /**
     * Important Note:
     * After user completes the oauth login process, user will be redirected to redirectPathName
     * which you will specify while initializing sdk. If you are using serviceworker or redirect.html
     * file provided in this package to handle the redirect result which parses the login result
     * and sends the result back to original window (i.e. where login was initiated).
     * But User might close original window before completing login process (in popup uxMode)
     * or only one window exists during login (in redirect mode), in that case
     * service worker will not able to send login result back to original window and it will
     * simply redirect to root path of app ('i.e': '/') with the login results in hash params
     * and search params.
     * So a best practice is to add a fallback handler in the root page of your app.
     * Here we are simply parsing hash params and search params to get the login results.
     * If you are using redirect uxMode (recommended) , you don't have to include this fallback handler
     * in your code.
     */
    try {
      var url = new URL(location.href);
      const hash = url.hash.substr(1);
      const queryParams = {} as Record<string, string | null>;
      for (let key of url.searchParams.keys()) {
        queryParams[key] = url.searchParams.get(key);
      }
      const { error, instanceParameters } = this._handleRedirectParameters(hash, queryParams);
      const torusdirectsdk = new TorusSdk({
        baseUrl: `${location.origin}/serviceworker`,
        enableLogging: true,
        network: "testnet", // details for test net
      });
      await torusdirectsdk.init({ skipSw: false });
      this.torusdirectsdk = torusdirectsdk;
      if (hash) {
        if (error) throw new Error(error);
        const { verifier: returnedVerifier } = instanceParameters;
        this.selectedVerifier = Object.keys(verifierMap).find((x) => verifierMap[x].verifier === returnedVerifier) as string;
        this._login(hash, queryParams);
      }
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
.mode {
  display: "flex";
  flex-direction: "row";
  justify-content: "center";
  align-items: "center";
  margin: 100;
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
}
button {
  height: 25px;
  margin: 5px;
  background: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
