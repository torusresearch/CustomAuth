<template>
  <div id="app">
    <div v-if="!loginResponse">
      <div class="mt-[10%]">
        <div class="font-bold">Verifier</div>
        <select v-model="selectedVerifier" class="select-menu">
          <option :key="login" v-for="login in Object.keys(verifierMap)" :value="login">{{ verifierMap[login].name }}</option>
        </select>
        <input
          v-model="login_hint"
          v-if="selectedVerifier === 'torus_email_passwordless'"
          placeholder="Enter an email"
          required
          class="input-field"
        />
        <input
          v-model="login_hint"
          v-if="selectedVerifier === 'torus_sms_passwordless'"
          placeholder="Eg: +{cc}-{number}"
          required
          class="input-field"
        />
      </div>
      <div :style="{ marginTop: '20px' }">
        <button @click="login()" class="btn-login">Login with Torus</button>
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

    <!-- <div v-if="loginResponse && loginResponse.privateKey">
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
    </div> -->
    <div v-if="loginResponse && loginResponse.privateKey">
      <div class="flex m-6 text-left box md:rows-span-2">
        <div class="ml-6 overflow-hidden mt-7 text-ellipsis">
          <span class="text-2xl font-semibold">demo-customauth.web3auth.io</span>
          <h6 class="pb-8 overflow-hidden text-left text-ellipsis">Customauth Private key : {{ getPrivatekey(loginResponse) }}</h6>
        </div>
        <div class="ml-auto mt-7">
          <!-- <span class="pr-32">Connected ChainId : {{ ethereumPrivateKeyProvider.state.chainId }}</span> -->
          <button type="button" class="btn-logout" @click="logout">
            <img src="@/assets/logout.svg" class="pl-0 pr-3" />
            Logout
          </button>
        </div>
      </div>
      <div class="grid grid-cols-5 m-6 gap-7 height-fit">
        <div class="grid grid-cols-2 col-span-5 gap-2 p-4 text-left md:col-span-2 box">
          <!-- <div class="col-span-2 text-left">
              <div class="font-semibold"></div>
              <div class="grid grid-cols-2 gap-2">
                <button class="btn" @click="getUserInfo">Get user info</button>
                <button class="btn" @click="getEd25519Key">Get Ed25519Key</button>
              </div>
            </div> -->
          <div class="col-span-2 text-left">
            <div class="font-semibold">Signing</div>
            <div class="grid grid-cols-2 gap-2">
              <button class="btn" @click="signMessage" :disabled="!provider">Sign Test Eth Message</button>
              <button class="btn" @click="signV1Message" :disabled="!provider">Sign Typed data v1 test message</button>
              <button class="btn" @click="latestBlock" :disabled="!provider">Fetch Latest Block</button>

              <!-- <button class="btn" @click="signMessage" :disabled="!ethereumPrivateKeyProvider.provider">Sign test Eth Message</button>
                <button class="btn" @click="signV1Message" :disabled="!ethereumPrivateKeyProvider.provider">Sign Typed data v1 test message</button>
                <button class="btn" @click="latestBlock" :disabled="!ethereumPrivateKeyProvider.provider">Fetch latest block</button>
                <button class="btn" @click="switchChain" :disabled="!ethereumPrivateKeyProvider.provider">Switch to rinkeby</button>
                <button class="btn" @click="addChain" :disabled="!ethereumPrivateKeyProvider.provider">Add Rinkeby Chain</button> -->
            </div>
          </div>
          <div class="col-span-2 text-left">
            <div class="font-semibold">Stark key pair</div>
            <div class="text-[12px]">Enter HD account index to derive stark key pair from custom auth's private key</div>
            <form @submit.prevent="starkHdAccount">
              <div class="grid grid-cols-2 gap-2">
                <input class="p-4 number-input" :min="0" placeholder="Index" id="accountIndex" type="number" required />
                <button class="btn" type="submit">Get Stark Key Pair</button>
                <!-- <button class="btn" @click="latestBlock" :disabled="!provider">Fetch Latest Block</button> -->

                <!-- <button class="btn" @click="signMessage" :disabled="!ethereumPrivateKeyProvider.provider">Sign test Eth Message</button>
                <button class="btn" @click="signV1Message" :disabled="!ethereumPrivateKeyProvider.provider">Sign Typed data v1 test message</button>
                <button class="btn" @click="latestBlock" :disabled="!ethereumPrivateKeyProvider.provider">Fetch latest block</button>
                <button class="btn" @click="switchChain" :disabled="!ethereumPrivateKeyProvider.provider">Switch to rinkeby</button>
                <button class="btn" @click="addChain" :disabled="!ethereumPrivateKeyProvider.provider">Add Rinkeby Chain</button> -->
              </div>
            </form>
          </div>
          <div class="col-span-2 text-left">
            <div class="font-semibold">Sign message</div>
            <form @submit.prevent="signMessageWithStarkKey">
              <div class="grid grid-cols-1 gap-2">
                <input class="text-areas" id="message" type="textarea" placeholder="Message to encrypt" required />
              </div>
              <div class="grid grid-cols-2 gap-2 pt-2">
                <input class="p-2 btn" :min="0" id="accountIndex" type="number" placeholder="Index" required />
                <!-- <input id="message" type="textarea" placeholder="Enter message" required /> -->
                <button type="submit" class="btn">Sign Message with StarkKey</button>
              </div>
            </form>
          </div>
          <div class="col-span-2 text-left">
            <div class="font-semibold">Validate message</div>
            <!-- <form @submit.prevent="signMessageWithStarkKey"> -->
            <form @submit.prevent="validateStarkMessage">
              <!-- </form> -->
              <div class="grid grid-cols-2 gap-2 pt-2">
                <input class="p-2 btn" id="accountIndex" type="number" placeholder="Index" required />
                <button class="btn" type="submit" :disabled="!signingMessage">Validate Stark Message</button>
              </div>
            </form>
          </div>

          <!-- <div class="col-span-2 text-left">
              <div class="grid grid-cols-2 gap-2"></div>
            </div>
            <div class="col-span-2 text-left">
              <div class="grid grid-cols-2 gap-2"></div>
            </div>
            <div class="col-span-2 text-left">
              <div class="grid grid-cols-2 gap-2"></div>
            </div>
            <div class="col-span-2 text-left">
              <div class="grid grid-cols-2 gap-2"></div>
            </div>
            <div class="col-span-2 text-left">
              <div class="grid grid-cols-2 gap-2"></div>
            </div>
            <div class="col-span-2 text-left">
              <div class="grid grid-cols-2 gap-2"></div>
            </div>
            <div class="col-span-2 text-left">
              <div class="grid grid-cols-2 gap-2"></div>
            </div>
            <div class="col-span-2 text-left">
              <div class="grid grid-cols-2 gap-2"></div>
            </div> -->
        </div>
        <div class="col-span-5 md:col-span-3">
          <h6 class="text-left">Note:</h6>
          <div class="p-4 mb-2 text-xs text-left box-note">
            <p class="mb-2">
              Please note that the verifiers listed in the example have http://localhost:3000/serviceworker/redirect configured as the redirect uri.
            </p>
            <p class="mb-2">
              If you use any other domains, they won't work. The verifiers listed here only work with the client id's specified in example. Please
              don't edit them. The verifiers listed here are for example reference only. Please don't use them for anything other than testing
              purposes.
            </p>
            <p class="mb-2">Reach out to us at hello@tor.us or telegram group to get your verifier deployed for your client id.</p>
          </div>
          <div class="box-grey" id="console">
            <p style="white-space: pre-line"></p>
            <div><button class="clear-button" @click="clearUiconsole">Clear console</button></div>
          </div>
        </div>
      </div>

      <!-- <div v-if="loginDetails && loginDetails.result">
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
    <div id="console" :style="{ whiteSpace: 'pre-line', height: 'auto', position: 'inherit' }"><p :style="{ whiteSpace: 'pre-line' }" /></div> -->
    </div>
    <!-- <div id="console" :style="{ whiteSpace: 'pre-line', height: 'auto', position: 'inherit' }"><p :style="{ whiteSpace: 'pre-line' }" /></div> -->
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
  methods: {
    async login(hash?: string, queryParameters?: Record<string, any>) {
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

        const providerInstance = await EthereumPrivateKeyProvider.getProviderInstance({
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
    getPrivatekey(loginDetails: any): unknown {
      // console.log(loginDetails);
      return loginDetails.privateKey;
    },
    clearUiconsole() {
      const el = document.querySelector("#console>p");
      if (el) {
        el.innerHTML = "";
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
    logout() {
      this.$router.push("/");
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
        network: "testnet", // details for test net
        popupFeatures: `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=500,width=500,top=100,left=100`,
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
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50; */
}
.box {
  @apply bg-white;
  border: 1px solid #f3f3f4;
  border-radius: 20px;
  box-shadow: 4px 4px 20px rgba(46, 91, 255, 0.1);
}
.btn-logout {
  @apply h-12 w-32 bg-white rounded-3xl pl-6 m-2 text-sm inline-flex items-center;
  border: 1px solid #f3f3f4;
}
.number-input {
  @apply h-11 w-full m-0 bg-[#F9F9FB] rounded-3xl text-[#6F717A] text-sm lg:text-base font-medium;
}
.btn {
  @apply h-11 w-full m-0 bg-white rounded-3xl text-[#6F717A] text-sm lg:text-base font-medium;
  border: 1px solid #6f717a;
}
.height-fit {
  @apply min-h-fit;
  height: 78vh;
}
.box-grey {
  @apply overflow-hidden min-h-[65vh] max-h-[65vh] bg-[#f3f3f4] rounded-3xl relative;
  border: 1px solid #f3f3f4;
  box-shadow: 4px 4px 20px rgba(46, 91, 255, 0.1);
}
.box-note {
  @apply overflow-hidden min-h-[100px] bg-white rounded-3xl relative;
  border: 1px solid #f3f3f4;
  box-shadow: 4px 4px 20px rgba(46, 91, 255, 0.1);
}
#console {
  text-align: left;
  overflow: auto;
}
#console > p {
  @apply m-2;
}
.clear-button {
  @apply fixed right-8 bottom-2 md:right-8 md:bottom-12 w-28 h-7 bg-[#f3f3f4] rounded-md;
  border: 1px solid #0f1222;
}
.text-areas {
  @apply h-11 w-auto p-2 rounded-3xl bg-[#F9F9FB];
}
/* #console {
  border: 1px solid black;
  height: auto;
  padding: 2px;
  bottom: 10px;
  position: absolute;
  text-align: left;
  width: calc(100% - 20px);
  border-radius: 5px;
} */
/* #console::before {
  content: "Console :";
  position: absolute;
  top: -20px;
  font-size: 12px;
}
#console > p {
  margin: 0.5em;
  word-wrap: break-word;
} */
.btn-login {
  @apply h-12 w-60 m-2 bg-white rounded-3xl font-[#6F717A] font-medium;
  border: 1px solid #6f717a;
}
.select-menu {
  @apply bg-white h-12 rounded-3xl text-center;
  border: solid 1px;
}
.input-field {
  @apply bg-white h-12 rounded-3xl text-center p-2;
  border: solid 1px;
}
</style>
