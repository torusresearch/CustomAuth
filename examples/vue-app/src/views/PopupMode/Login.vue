<template>
  <div>
    <div v-if="!loginResponse" class="flex flex-col justify-center items-center text-center mt-[150px]">
      <div class="mb-3 text-xl font-medium">Verifier</div>
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
        placeholder="Eg: +{cc}-{number}"
        required
        class="login-input mt-4 w-[320px] border-app-gray-400 !border"
      />
      <div class="my-5 flex flex-col px-6 sm:px-0 sm:flex-row gap-4 w-full sm:w-[400px]">
        <button @click="login()" class="custom-btn">Login with Torus</button>
        <button @click="logout" class="custom-btn">Back</button>
      </div>
      <ul class="text-sm text-app-gray-700 dark:text-app-gray-200 font-normal mt-4 mb-5 px-6">
        <li>
          Please note that the verifiers listed in the example have
          <span class="font-semibold text-app-gray-900 dark:text-app-gray-200">http://localhost:3000/serviceworker/redirect</span>
          configured as the redirect uri.
        </li>
        <li>If you use any other domains, they won't work.</li>
        <li>The verifiers listed here only work with the client id's specified in example. Please don't edit them</li>
        <li>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</li>
      </ul>
      <div class="text-base text-app-gray-900 dark:text-white font-medium mt-4 mb-5 px-6">
        Reach out to us at
        <a class="text-app-primary-600 dark:text-app-primary-500 underline" href="mailto:hello@tor.us">hello@tor.us</a>
        or
        <a class="text-app-primary-600 dark:text-app-primary-500 underline" href="https://t.me/torusdev">telegram group</a>
        to get your verifier deployed for your client id.
      </div>
    </div>
    <div v-if="loginResponse && loginResponse.finalKeyData.privKey" class="text-start">
      <div class="loader-container" v-if="!getPrivateKey(loginResponse)">Loading...</div>
      <div v-else class="dashboard-container">
        <!-- Dashboard Header -->
        <div class="dashboard-header w-full">
          <div class="w-full">
            <h1 class="dashboard-heading">demo-customauth.web3auth.io</h1>
            <p class="dashboard-subheading">CustomAuth Private key : {{ getPrivateKey(loginResponse) }}</p>
          </div>
          <div class="dashboard-action-container">
            <button class="dashboard-action-logout" @click.stop="logout">
              <img :src="require('@/assets/logout.svg')" alt="logout" height="18" width="18" />
              Logout
            </button>
          </div>
        </div>
        <!-- Dashboard Action Container -->
        <div class="dashboard-details-container">
          <div class="dashboard-details-btn-container">
            <h1 class="details-heading flex justify-between items-center">
              <span>CustomAuth Specific Info</span>
              <span><img alt="down" class="cursor-pointer" src="../../assets/down.svg" @click="isExpanded = !isExpanded" /></span>
            </h1>
            <div v-show="isExpanded" class="mt-4 overflow-y-auto">
              <p class="btn-label">Signing</p>
              <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
                <button class="custom-btn" @click="signMessage" :disabled="!provider">Sign Test Eth Message</button>
                <button class="custom-btn" @click="latestBlock" :disabled="!provider">Fetch Latest block</button>
              </div>
              <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
                <button class="custom-btn" @click="signV1Message" :disabled="!provider">Sign Typed data v1 test Msg</button>
              </div>
              <p class="btn-label !mb-0">Stark key pair</p>
              <p class="text-xs text-app-gray-500 mb-2">Enter HD account index to derive stark key pair from custom auth's private key</p>
              <form class="flex flex-col sm:flex-row gap-4 bottom-gutter" @submit.prevent="starkHdAccount">
                <input class="custom-input" type="number" placeholder="Index" :min="0" id="accountIndex" required />
                <button type="submit" class="custom-btn">Get Stark Key Pair</button>
              </form>
              <p class="btn-label">Sign message</p>
              <form @submit.prevent="signMessageWithStarkKey">
                <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
                  <textarea class="custom-input w-full" rows="2" placeholder="Message to encrypt" />
                </div>
                <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
                  <input class="custom-input" type="number" placeholder="Index" :min="0" id="accountIndex" required />
                  <button type="submit" class="custom-btn">Sign message with Stark key</button>
                </div>
              </form>
              <p class="btn-label">Validate message</p>
              <form class="flex flex-col sm:flex-row gap-4 bottom-gutter" @submit.prevent="validateStarkMessage">
                <input
                  class="custom-input disabled:cursor-not-allowed"
                  :disabled="!signingMessage"
                  type="number"
                  placeholder="Index"
                  :min="0"
                  id="accountIndex"
                  required
                />
                <button type="submit" :disabled="!signingMessage" class="custom-btn disabled:cursor-not-allowed">Validate Stark Message</button>
              </form>
            </div>
          </div>
          <!-- Dashboard Console Container -->
          <div class="flex flex-col flex-1 details-container">
            <p class="text-sm font-semibold text-app-gray-700 mb-2">Note:</p>
            <div class="bg-app-white shadow-md rounded-lg p-5 text-xs font-normal text-app-gray-600 mb-6">
              <p class="mb-2">
                Please note that the verifiers listed in the example have
                <span class="font-semibold text-app-gray-900">http://localhost:3000/serviceworker/redirect</span>
                configured as the redirect uri.
              </p>
              <p class="mb-2">
                If you use any other domains, they won't work. The verifiers listed here only work with the client id's specified in example. Please
                don't edit them. The verifiers listed here are for example reference only. Please don't use them for anything other than testing
                purposes.
              </p>
              <p class="mb-2">
                Reach out to us at
                <a class="text-app-primary-600 underline" href="mailto:hello@tor.us">hello@tor.us</a>
                or
                <a class="text-app-primary-600 underline" href="https://t.me/torusdev">telegram group</a>
                to get your verifier deployed for your client id.
              </p>
            </div>
            <div class="dashboard-details-console-container" id="console">
              <h1 class="console-heading"></h1>
              <pre class="console-container"></pre>
              <div class="clear-console-btn">
                <button class="custom-btn console-btn" @click="clearUiconsole">Clear console</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TorusSdk, { TorusLoginResponse, UX_MODE } from "@toruslabs/customauth";
import { getStarkHDAccount, pedersen, sign, STARKNET_NETWORKS, verify } from "@toruslabs/openlogin-starkkey";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ec } from "elliptic";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
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
  TORUS_SMS_PASSWORDLESS,
  TWITTER,
  verifierMap,
  WEIBO,
} from "../../constants";
import { fetchLatestBlock, signEthMessage, signTypedData_v1 } from "../../services/chainHandlers";
import { TORUS_SAPPHIRE_NETWORK, TORUS_LEGACY_NETWORK } from "@toruslabs/constants";

export default defineComponent({
  name: "PopupLogin",
  data() {
    return {
      torusdirectsdk: null as TorusSdk | null,
      selectedVerifier: "google",
      verifierMap,
      signedMessage: null as ec.Signature | null,
      signingMessage: null as string | null,
      loginResponse: null as TorusLoginResponse | null,
      provider: null as SafeEventEmitterProvider | null,
      login_hint: "",
      isExpanded: true,
      networkList: [...Object.values(TORUS_SAPPHIRE_NETWORK), ...Object.values(TORUS_LEGACY_NETWORK)],
      selectedNetwork: TORUS_LEGACY_NETWORK.TESTNET,
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
        [REDDIT]: { domain: AUTH_DOMAIN, connection: "Reddit", verifierIdField: "name", isVerifierIdCaseSensitive: false },
        [COGNITO]: { domain: COGNITO_AUTH_DOMAIN, identity_provider: "Google", response_type: "token", user_info_endpoint: "userInfo" },
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
  methods: {
    async login(hash?: string, queryParameters?: Record<string, any>) {
      try {
        if (!this.torusdirectsdk) return;
        const jwtParams = this.loginToConnectionMap[this.selectedVerifier] || {};
        const { typeOfLogin, clientId, verifier } = verifierMap[this.selectedVerifier];
        console.log(hash, queryParameters, typeOfLogin, clientId, verifier, jwtParams, this.torusdirectsdk);
        const loginDetails: TorusLoginResponse = await this.torusdirectsdk.triggerLogin({
          typeOfLogin,
          verifier,
          clientId,
          jwtParams,
          hash,
          queryParameters,
        });

        const privateKey = loginDetails.finalKeyData.privKey || loginDetails.oAuthKeyData.privKey;

        const providerInstance = await EthereumPrivateKeyProvider.getProviderInstance({
          chainConfig: {
            rpcTarget: "https://polygon-rpc.com",
            chainId: "0x89",
            ticker: "matic",
            tickerName: "matic",
            displayName: "Polygon Mainnet",
            blockExplorer: "https://polygonscan.com",
          },
          privKey: privateKey,
        });

        this.provider = providerInstance.provider;

        this.loginResponse = loginDetails;

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
    getPrivateKey(loginDetails: TorusLoginResponse | null): string {
      if (!loginDetails) return "";
      return loginDetails.finalKeyData.privKey || loginDetails.oAuthKeyData.privKey;
    },

    clearUiconsole() {
      const el = document.querySelector("#console>pre");
      const h1 = document.querySelector("#console>h1");
      const consoleBtn = document.querySelector<HTMLElement>("#console>div.clear-console-btn");
      if (h1) {
        h1.innerHTML = "";
      }
      if (el) {
        el.innerHTML = "";
      }
      if (consoleBtn) {
        consoleBtn.style.display = "none";
      }
    },

    async signMessage() {
      const signedMessage = await signEthMessage(this.provider as SafeEventEmitterProvider);
      this.console("Signed Message", signedMessage);
    },

    async signV1Message() {
      const signedMessage = await signTypedData_v1(this.provider as SafeEventEmitterProvider);
      this.console("Signed V1 Message", signedMessage);
    },

    async latestBlock() {
      const block = await fetchLatestBlock(this.provider as SafeEventEmitterProvider);
      this.console("Latest block", block);
    },

    console(...args: unknown[]): void {
      const el = document.querySelector("#console>pre");
      const h1 = document.querySelector("#console>h1");
      const consoleBtn = document.querySelector<HTMLElement>("#console>div.clear-console-btn");
      if (h1) {
        h1.innerHTML = args[0] as string;
      }
      if (el) {
        el.innerHTML = JSON.stringify(args[1] || {}, null, 2);
      }
      if (consoleBtn) {
        consoleBtn.style.display = "block";
      }
    },

    getStarkAccount(index: number): ec.KeyPair {
      const account = getStarkHDAccount(this.getPrivateKey(this.loginResponse).padStart(64, "0"), index, STARKNET_NETWORKS.testnet);
      return account;
    },

    starkHdAccount(e: any): ec.KeyPair {
      const accIndex = e.target[0].value;
      const account = this.getStarkAccount(accIndex);
      this.console("Stark Key Pair", {
        ...account,
      });
      return account;
    },

    /**
     *
     * @param str utf 8 string to be signed
     * @param prefix hex prefix padded to 252 bits (optional)
     * @returns
     */
    getPedersenHashRecursively(str: string, prefix?: string): string {
      const TEST_MESSAGE_SUFFIX = prefix || "TORUS STARKWARE-";
      const x = Buffer.from(str, "utf8");
      const binaryStr = hexToBinary(bufferToHex(x));
      const rounds = Math.ceil(binaryStr.length / 252);
      if (rounds > 1) {
        const currentChunkHex = binaryToHex(binaryStr.substring(0, 252));
        if (prefix) {
          const hash = pedersen([prefix, currentChunkHex]);
          const pendingStr = binaryToUtf8(binaryStr.substring(252));
          return this.getPedersenHashRecursively(pendingStr.replace("\n", ""), hash);
        }
        // send again with default prefix,
        // this prefix is only relevant for this example and
        // has no relevance with starkware message encoding.
        return this.getPedersenHashRecursively(str, binaryToHex(bufferToBinary(Buffer.from(TEST_MESSAGE_SUFFIX, "utf8")).padEnd(252, "0")));
      }
      const currentChunkHex = binaryToHex(binaryStr.padEnd(252, "0"));
      return pedersen([prefix || "", currentChunkHex]);
    },

    signMessageWithStarkKey(e: any) {
      e.preventDefault();
      const accIndex = e.target[1].value;
      const message = e.target[0].value;
      const keyPair: ec.KeyPair = this.getStarkAccount(accIndex);
      const hash = this.getPedersenHashRecursively(message);
      this.signedMessage = sign(keyPair, hash);
      this.signingMessage = message;
      this.console("Signed Message With Stark Key", {
        pedersenHash: hash,
        info: `Message signed successfully: TORUS STARKWARE- ${message}`,
        signedMesssage: this.signedMessage,
      });
    },

    validateStarkMessage(e: any) {
      e.preventDefault();
      const signingAccountIndex = e.target[0].value;
      const keyPair = this.getStarkAccount(signingAccountIndex);
      const hash = this.getPedersenHashRecursively(this.signingMessage as string);
      const isVerified = verify(keyPair, hash, this.signedMessage as unknown as ec.Signature);
      this.console("Validate Stark Message", { verified: isVerified });
    },

    logout() {
      this.$router.push("/");
    },
  },
  watch: {
    selectedNetwork(oldValue, newValue) {
      if (oldValue === newValue) return;
      const torusdirectsdk = new TorusSdk({
        uxMode: UX_MODE.POPUP,
        baseUrl: `${location.origin}/serviceworker`,
        enableLogging: true,
        network: newValue, // details for test net
        popupFeatures: `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=500,width=500,top=100,left=100`,
        web3AuthClientId: WEB3AUTH_CLIENT_ID,
      });
      // note: Due to browser restrictions on popups, you should reduce the time taken
      // between user interaction and the login popups being opened. This is highly browser dependent,
      // but the best practice for this is to separate the initialization of the SDK and
      // the user login method calls.
      // so don't use torusdirectsdk.init and torusdirectsdk.triggerLogin (or other login methods)
      // in a single function call.
      torusdirectsdk.init();
      this.torusdirectsdk = torusdirectsdk;
    },
  },
  mounted() {
    try {
      const url = new URL(location.href);
      const queryParams: Record<string, any> = {};
      for (const key of url.searchParams.keys()) {
        queryParams[key] = url.searchParams.get(key);
      }
      const torusdirectsdk = new TorusSdk({
        uxMode: UX_MODE.POPUP,
        baseUrl: `${location.origin}/serviceworker`,
        enableLogging: true,
        network: this.selectedNetwork, // details for test net
        popupFeatures: `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=500,width=500,top=100,left=100`,
        web3AuthClientId: WEB3AUTH_CLIENT_ID,
      });
      // note: Due to browser restrictions on popups, you should reduce the time taken
      // between user interaction and the login popups being opened. This is highly browser dependent,
      // but the best practice for this is to separate the initialization of the SDK and
      // the user login method calls.
      // so don't use torusdirectsdk.init and torusdirectsdk.triggerLogin (or other login methods)
      // in a single function call.
      torusdirectsdk.init();
      this.torusdirectsdk = torusdirectsdk;
    } catch (error) {
      console.error(error, "mounted caught");
    }
  },
});
</script>

<style scoped>
@import "../RedirectMode/Auth.css";
</style>
