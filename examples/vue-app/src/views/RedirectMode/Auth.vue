<template>
  <div class="about">
    <h1>This is the redirected page</h1>

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
import { getStarkHDAccount, pedersen, sign, starkEc, STARKNET_NETWORKS, verify } from "@toruslabs/openlogin-starkkey";
import { ec } from "elliptic";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
import Vue from "vue";

export default Vue.extend({
  name: "Auth",
  data() {
    return {
      loginDetails: null as RedirectResult | null,
      signedMessage: null as ec.Signature | null,
      signingMessage: null as string | null,
    };
  },
  methods: {
    console(...args: unknown[]): void {
      const el = document.querySelector("#console>p");
      if (el) {
        el.innerHTML = JSON.stringify(args || {}, null, 2);
      }
    },

    getStarkAccount(index: number): { pubKey: string; privKey: string } {
      const account = getStarkHDAccount(
        ((this.loginDetails as any)?.result?.privateKey as string).padStart(64, "0"),
        index,
        STARKNET_NETWORKS.testnet
      );
      return account;
    },

    starkHdAccount(e: any): { pubKey?: string; privKey?: string } {
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
      const account = this.getStarkAccount(accIndex);
      const keyPair = starkEc.keyFromPrivate(account.privKey);
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
      const account = this.getStarkAccount(signingAccountIndex);
      const keyPair = starkEc.keyFromPublic(account.pubKey, "hex");
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
    });
    const loginDetails = await torusdirectsdk.getRedirectResult();
    console.log(loginDetails);
    this.loginDetails = loginDetails;
    this.console(loginDetails);
  },
});
</script>
