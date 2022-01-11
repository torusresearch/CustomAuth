<template>
  <div id="app">
    <div>
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
      <span :style="{ marginRight: '20px' }">verifier:</span>
      <select v-model="selectedVerifier">
        <option :key="login" v-for="login in Object.keys(verifierMap)" :value="login">{{ verifierMap[login].name }}</option>
      </select>
    </div>
    <div :style="{ marginTop: '20px' }">
      <button @click="login">Login with Torus</button>
    </div>
    <div v-if="loginResponse && loginResponse.privateKey">
      <span>Custom Auth Private key: {{ loginResponse.privateKey }}</span>
      <button @click="signMessage" :disabled="!provider">Sign Test Eth Message</button>
      <button @click="signV1Message" :disabled="!provider">Sign Typed data v1 test message</button>
      <button @click="latestBlock" :disabled="!provider">Fetch Latest Block</button>

      <h2>Enter HD account index to derive stark key pair from custom auth's private key</h2>
      <div :style="{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }">
        <form @submit.prevent="starkHdAccount" :style="{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }">
          <input :min="0" placeholder="Enter hd account index" id="accountIndex" type="number" required />
          <button type="submit">Get Stark Key Pair</button>
        </form>
        <br />
        <br />
        <form @submit.prevent="signMessageWithStarkKey" :style="{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }">
          <input :min="0" id="accountIndex" type="number" placeholder="Enter hd account index" required />
          <input id="message" type="textarea" placeholder="Enter message" required />
          <button type="submit">Sign Message with StarkKey</button>
        </form>
        <br />
        <br />
        <form
          @submit.prevent="validateStarkMessage"
          :style="{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }"
        >
          <input id="accountIndex" type="number" placeholder="Enter account index" required />
          <button type="submit" :disabled="!signingMessage">Validate Stark Message</button>
        </form>
      </div>
    </div>

    <div id="console" :style="{ whiteSpace: 'pre-line', height: 'auto', position: 'inherit' }"><p :style="{ whiteSpace: 'pre-line' }" /></div>
  </div>
</template>

<script lang="ts">
import TorusSdk, { TorusLoginResponse, UX_MODE } from "@toruslabs/customauth";
import { getStarkHDAccount, pedersen, sign, STARKNET_NETWORKS, verify } from "@toruslabs/openlogin-starkkey";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ec } from "elliptic";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
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
  REDDIT,
  TWITTER,
  verifierMap,
  WEIBO,
} from "../../constants";
import { fetchLatestBlock, signEthMessage, signTypedData_v1 } from "../../services/chainHandlers";
export default Vue.extend({
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
        const loginDetails: TorusLoginResponse = await this.torusdirectsdk.triggerLogin({
          typeOfLogin,
          verifier,
          clientId,
          jwtParams,
          hash,
          queryParameters,
        });

        this.provider = await EthereumPrivateKeyProvider.getProviderInstance({
          chainConfig: {
            rpcTarget: "https://polygon-rpc.com",
            chainId: "0x89",
            ticker: "matic",
            tickerName: "matic",
            displayName: "Polygon Mainnet",
            blockExplorer: "https://polygonscan.com",
          },
          privKey: loginDetails.privateKey,
        });

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
    async signMessage() {
      const signedMessage = await signEthMessage(this.provider as SafeEventEmitterProvider);
      this.console("signedMessage", signedMessage);
    },
    async signV1Message() {
      const signedMessage = await signTypedData_v1(this.provider as SafeEventEmitterProvider);
      this.console("signedMessage", signedMessage);
    },
    async latestBlock() {
      const block = await fetchLatestBlock(this.provider as SafeEventEmitterProvider);
      this.console("latest block", block);
    },
    console(...args: unknown[]): void {
      const el = document.querySelector("#console>p");
      if (el) {
        el.innerHTML = JSON.stringify(args || {}, null, 2);
      }
    },

    getStarkAccount(index: number): ec.KeyPair {
      const account = getStarkHDAccount((this.loginResponse?.privateKey as string).padStart(64, "0"), index, STARKNET_NETWORKS.testnet);
      return account;
    },

    starkHdAccount(e: any): ec.KeyPair {
      const accIndex = e.target[0].value;
      const account = this.getStarkAccount(accIndex);
      this.console({
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
      return pedersen([prefix, currentChunkHex]);
    },

    signMessageWithStarkKey(e: any) {
      e.preventDefault();
      const accIndex = e.target[0].value;
      const message = e.target[1].value;
      const keyPair: ec.KeyPair = this.getStarkAccount(accIndex);
      const hash = this.getPedersenHashRecursively(message);
      this.signedMessage = sign(keyPair, hash);
      this.signingMessage = message;
      this.console({
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
      this.console(`Message is verified: ${isVerified}`);
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
