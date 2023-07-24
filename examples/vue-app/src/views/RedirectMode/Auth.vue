<template>
  <div class="loader-container" v-if="!getPrivateKey(loginDetails)">Loading...</div>
  <div v-else class="dashboard-container">
    <!-- Dashboard Header -->
    <div class="dashboard-header w-full">
      <div class="w-full">
        <h1 class="dashboard-heading">demo-customauth.web3auth.io</h1>
        <p class="dashboard-subheading">CustomAuth Private key : {{ getPrivateKey(loginDetails) }}</p>
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
      <div class="flex flex-col flex-1 details-container w-full">
        <p class="text-sm font-semibold text-app-gray-700 mb-2">Note:</p>
        <div class="bg-app-white shadow-md rounded-lg p-5 text-xs font-normal text-app-gray-600 mb-6">
          <p class="mb-2">
            Please note that the verifiers listed in the example have
            <span class="font-semibold text-app-gray-900">http://localhost:3000/serviceworker/redirect</span>
            configured as the redirect uri.
          </p>
          <p class="mb-2">
            If you use any other domains, they won't work. The verifiers listed here only work with the client id's specified in example. Please don't
            edit them. The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.
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
</template>

<script lang="ts">
import TorusSdk, { RedirectResult, TorusLoginResponse } from "@toruslabs/customauth";
import { getStarkHDAccount, pedersen, sign, STARKNET_NETWORKS, verify } from "@toruslabs/openlogin-starkkey";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ec } from "elliptic";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
import { defineComponent } from "vue";
import { LOCAL_NETWORK, WEB3AUTH_CLIENT_ID } from "../../constants";

import { fetchLatestBlock, signEthMessage, signTypedData_v1 } from "../../services/chainHandlers";
import { TORUS_LEGACY_NETWORK_TYPE, TORUS_NETWORK_TYPE, TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";

export default defineComponent({
  name: "Auth",
  data() {
    return {
      loginDetails: null as RedirectResult | null,
      signedMessage: null as ec.Signature | null,
      signingMessage: null as string | null,
      provider: null as SafeEventEmitterProvider | null,
      isExpanded: true,
    };
  },
  methods: {
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
    getPrivateKey(loginDetails: RedirectResult | null): string {
      if (!loginDetails) return "";
      return (loginDetails.result as TorusLoginResponse)?.finalKeyData.privKey || (loginDetails.result as TorusLoginResponse)?.oAuthKeyData.privKey;
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

    getStarkAccount(index: number): ec.KeyPair {
      const account = getStarkHDAccount(this.getPrivateKey(this.loginDetails).padStart(64, "0"), index, STARKNET_NETWORKS.testnet);
      return account;
    },

    starkHdAccount(e: any): ec.KeyPair {
      const accIndex = e.target[0].value;
      const account = this.getStarkAccount(accIndex);
      this.console("Start Key Pair", {
        ...account,
      });
      return account;
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
      const keyPair = this.getStarkAccount(accIndex);
      const hash = this.getPedersenHashRecursively(message);
      this.signedMessage = sign(keyPair, hash);
      this.signingMessage = message;
      this.console("Signed Message With Start Key", {
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
      localStorage.removeItem(LOCAL_NETWORK);
      this.$router.push("/");
    },
  },
  async mounted() {
    const network = localStorage.getItem(LOCAL_NETWORK) as TORUS_LEGACY_NETWORK_TYPE | TORUS_NETWORK_TYPE;
    const customAuthSdk = new TorusSdk({
      baseUrl: location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: "redirect",
      network: network || TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
      web3AuthClientId: WEB3AUTH_CLIENT_ID,
    });
    const loginDetails = await customAuthSdk.getRedirectResult();
    const privKey = this.getPrivateKey(loginDetails);
    const providerInstance = await EthereumPrivateKeyProvider.getProviderInstance({
      chainConfig: {
        rpcTarget: "https://polygon-rpc.com",
        chainId: "0x89",
        ticker: "matic",
        tickerName: "matic",
        displayName: "Polygon Mainnet",
        blockExplorer: "https://polygonscan.com",
      },
      privKey: privKey.padStart(64, "0"),
    });
    this.loginDetails = loginDetails;
    setTimeout(() => {
      this.provider = providerInstance.provider;
      this.console("Login Details", loginDetails);
    }, 1000);
  },
});
</script>

<style scoped>
@import "./Auth.css";
</style>
