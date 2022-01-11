<template>
  <div class="about">
    <h1>This is the redirected page</h1>

    <button @click="signMessage" :disabled="!provider">Sign Test Eth Message</button>
    <button @click="signV1Message" :disabled="!provider">Sign Typed data v1 test message</button>
    <button @click="latestBlock" :disabled="!provider">Fetch Latest Block</button>

    <div v-if="loginDetails && loginDetails.result">
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
import TorusSdk, { RedirectResult } from "@toruslabs/customauth";
import { getStarkHDAccount, pedersen, sign, STARKNET_NETWORKS, verify } from "@toruslabs/openlogin-starkkey";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ec } from "elliptic";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
import Vue from "vue";

import { fetchLatestBlock, signEthMessage, signTypedData_v1 } from "../../services/chainHandlers";
export default Vue.extend({
  name: "Auth",
  data() {
    return {
      loginDetails: null as RedirectResult | null,
      signedMessage: null as ec.Signature | null,
      signingMessage: null as string | null,
      provider: null as SafeEventEmitterProvider | null,
    };
  },
  methods: {
    console(...args: unknown[]): void {
      const el = document.querySelector("#console>p");
      if (el) {
        el.innerHTML = JSON.stringify(args || {}, null, 2);
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
    getStarkAccount(index: number): ec.KeyPair {
      const account = getStarkHDAccount(
        ((this.loginDetails as any)?.result?.privateKey as string).padStart(64, "0"),
        index,
        STARKNET_NETWORKS.testnet
      );
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
      const keyPair = this.getStarkAccount(accIndex);
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
    const torusdirectsdk = new TorusSdk({
      baseUrl: location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: "redirect",
      network: "testnet",
      skipFetchingNodeDetails: true,
    });
    const loginDetails = await torusdirectsdk.getRedirectResult();
    this.provider = await EthereumPrivateKeyProvider.getProviderInstance({
      chainConfig: {
        rpcTarget: "https://polygon-rpc.com",
        chainId: "0x89",
        ticker: "matic",
        tickerName: "matic",
        displayName: "Polygon Mainnet",
        blockExplorer: "https://polygonscan.com",
      },
      privKey: ((loginDetails as any)?.result?.privateKey as string).padStart(64, "0"),
    });
    console.log(loginDetails);
    this.loginDetails = loginDetails;

    this.console(loginDetails);
  },
});
</script>
