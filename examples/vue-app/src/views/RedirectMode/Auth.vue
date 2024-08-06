<template>
  <div class="dashboard-container">
    <!-- Dashboard Action Container -->
    <div class="dashboard-details-container">
      <Card class="dashboard-details-btn-container">
        <h1 class="details-heading flex justify-between items-center">
          <span>CustomAuth Specific Info</span>
        </h1>
        <div v-show="isExpanded" class="mt-4 overflow-y-auto">
          <p class="btn-label">Signing</p>
          <div class="flex flex-col sm:flex-row gap-2 bottom-gutter">
            <Button @click="signMessage" :disabled="!provider" pill size="sm">Sign Test Eth Message</Button>
            <Button @click="latestBlock" :disabled="!provider" pill size="sm">Fetch Latest block</Button>
            <Button @click="signMessage" :disabled="!provider" pill size="sm">Sign Test Eth Message</Button>
            <Button @click="latestBlock" :disabled="!provider" pill size="sm">Fetch Latest block</Button>
            <Button @click="signV1Message" :disabled="!provider" pill size="sm">Sign Typed data v1 test Msg</Button>
          </div>
          <p class="btn-label !mb-0">Stark key pair</p>
          <p class="text-xs text-app-gray-500 mb-2">Enter HD account index to derive stark key pair from custom auth's
            private key</p>
          <form class="flex flex-col sm:flex-row gap-4 bottom-gutter" @submit.prevent="starkHdAccount">
            <input class="custom-input" type="number" placeholder="Index" :min="0" id="accountIndex" required />
            <Button type="submit" pill size="sm">Get Stark Key Pair</Button>
          </form>
          <p class="btn-label">Sign message</p>
          <form @submit.prevent="signMessageWithStarkKey">
            <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
              <textarea class="custom-input w-full" rows="2" placeholder="Message to encrypt" />
            </div>
            <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
              <input class="custom-input" type="number" placeholder="Index" :min="0" id="accountIndex" required />
              <Button type="submit" pill size="sm">Sign message with Stark key</Button>
            </div>
          </form>
          <p class="btn-label">Validate message</p>
          <form class="flex flex-col sm:flex-row gap-4 bottom-gutter" @submit.prevent="validateStarkMessage">
            <input class="custom-input disabled:cursor-not-allowed" :disabled="!signingMessage" type="number"
              placeholder="Index" :min="0" id="accountIndex" required />
            <Button type="submit" :disabled="!signingMessage" class="disabled:cursor-not-allowed" pill
              size="sm">Validate
              Stark Message</Button>
          </form>
        </div>
      </Card>
      <!-- Dashboard Console Container -->
      <Card class="flex flex-col flex-1 details-container w-full">
        <p class="text-sm font-semibold text-app-gray-700 mb-2">Note:</p>
        <div class="bg-app-white rounded-lg p-5 text-xs font-normal text-app-gray-600 mb-6">
          <p class="mb-2">
            Please note that the verifiers listed in the example have
            <span class="font-semibold text-app-gray-900">http://localhost:3000/serviceworker/redirect</span>
            configured as the redirect uri.
          </p>
          <p class="mb-2">
            If you use any other domains, they won't work. The verifiers listed here only work with the client id's
            specified in example. Please don't
            edit them. The verifiers listed here are for example reference only. Please don't use them for anything
            other than testing purposes.
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
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CustomAuth, RedirectResult, TorusLoginResponse } from "@toruslabs/customauth";
import { getStarkHDAccount, pedersen, sign, STARKNET_NETWORKS, verify } from "@toruslabs/openlogin-starkkey";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ec } from "elliptic";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
import { ref } from "vue";
import { LOCAL_NETWORK, WEB3AUTH_CLIENT_ID } from "../../constants";
import { Card, Button } from "@toruslabs/vue-components";
import { fetchLatestBlock, signEthMessage, signTypedData_v1 } from "../../services/chainHandlers";
import { TORUS_LEGACY_NETWORK_TYPE, TORUS_NETWORK_TYPE, TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { setPrivKey, privKey } from "@/store";

const loginDetails = ref<RedirectResult | null>(null);
const signedMessage = ref<ec.Signature | null>(null);
const signingMessage = ref<string | null>(null);
const provider = ref<SafeEventEmitterProvider | null>(null);
const isExpanded = ref(true);

const _console = (args: unknown[]): void => {
  const el = document.querySelector("#console>pre");
  const h1 = document.querySelector("#console>h1");
  const consoleBtn = document.querySelector<HTMLElement>("#console>div.clear-console-btn");
  if (h1) {
    h1.innerHTML = args[0] as string;
  }
  if (el) {
    el.innerHTML = JSON.stringify(args[1] || {}, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2);
  }
  if (consoleBtn) {
    consoleBtn.style.display = "block";
  }
};

const setPrivateKey = (): void => {
  if (!loginDetails.value) setPrivKey("");
  const loginResponse = loginDetails.value?.result as TorusLoginResponse;
  setPrivKey(loginResponse?.finalKeyData?.privKey || loginResponse?.oAuthKeyData?.privKey);
};

const signMessage = async (): Promise<void> => {
  const signedMessage = await signEthMessage(provider.value as SafeEventEmitterProvider);
  _console(["Signed Message", signedMessage]);
};

const signV1Message = async (): Promise<void> => {
  const signedMessage = await signTypedData_v1(provider.value as SafeEventEmitterProvider);
  _console(["Signed V1 Message", signedMessage]);
};

const latestBlock = async (): Promise<void> => {
  const block = await fetchLatestBlock(provider.value as SafeEventEmitterProvider);
  _console(["Latest block", block]);
};

const getStarkAccount = (index: number): ec.KeyPair => {
  const account = getStarkHDAccount(privKey.value?.padStart(64, "0") || "", index, STARKNET_NETWORKS.testnet);
  return account;
};

const starkHdAccount = (e: any): ec.KeyPair => {
  const accIndex = e.target[0].value;
  const account = getStarkAccount(accIndex);
  _console(["Start Key Pair", {
    ...account,
  }]);
  return account;
};

const clearUiconsole = (): void => {
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
};

/**
 *
 * @param str utf 8 string to be signed
 * @param prefix hex prefix padded to 252 bits (optional)
 * @returns
 */

const getPedersenHashRecursively = (str: string, prefix?: string): string => {
  const TEST_MESSAGE_SUFFIX = prefix || "TORUS STARKWARE-";
  const x = Buffer.from(str, "utf8");
  const binaryStr = hexToBinary(bufferToHex(x));
  const rounds = Math.ceil(binaryStr.length / 252);
  if (rounds > 1) {
    const currentChunkHex = binaryToHex(binaryStr.substring(0, 252));
    if (prefix) {
      const hash = pedersen([prefix, currentChunkHex]);
      const pendingStr = binaryToUtf8(binaryStr.substring(252));
      return getPedersenHashRecursively(pendingStr.replace("\n", ""), hash);
    }
    // send again with default prefix,
    // this prefix is only relevant for this example and
    // has no relevance with starkware message encoding.
    return getPedersenHashRecursively(str, binaryToHex(bufferToBinary(Buffer.from(TEST_MESSAGE_SUFFIX, "utf8")).padEnd(252, "0")));
  }
  const currentChunkHex = binaryToHex(binaryStr.padEnd(252, "0"));
  return pedersen([prefix || "", currentChunkHex]);
};

const signMessageWithStarkKey = (e: any): void => {
  e.preventDefault();
  const accIndex = e.target[1].value;
  const message = e.target[0].value;
  const keyPair = getStarkAccount(accIndex);
  const hash = getPedersenHashRecursively(message);
  signedMessage.value = sign(keyPair, hash);
  signingMessage.value = message;
  _console(["Signed Message With Start Key", {
    pedersenHash: hash,
    info: `Message signed successfully: TORUS STARKWARE- ${message}`,
    signedMesssage: signedMessage.value,
  }]);
};

const validateStarkMessage = (e: any): void => {
  e.preventDefault();
  const signingAccountIndex = e.target[0].value;
  const keyPair = getStarkAccount(signingAccountIndex);
  const hash = getPedersenHashRecursively(signingMessage.value as string);
  const isVerified = verify(keyPair, hash, signedMessage.value as unknown as ec.Signature);
  _console(["Validate Stark Message", { verified: isVerified }]);
};

const init = async () => {
  const privKeyInStorage = localStorage.getItem("privateKey");
  if (privKeyInStorage) {
    setPrivKey(privKeyInStorage);
  } else {
    const network = localStorage.getItem(LOCAL_NETWORK) as TORUS_LEGACY_NETWORK_TYPE | TORUS_NETWORK_TYPE;
    const customAuthSdk = new CustomAuth({
      baseUrl: location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: "redirect",
      network: network || TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
      web3AuthClientId: WEB3AUTH_CLIENT_ID,
    });
    loginDetails.value = await customAuthSdk.getRedirectResult();
    console.log("Login Details", loginDetails.value);
    setPrivateKey();
  }
  const providerInstance = await EthereumPrivateKeyProvider.getProviderInstance({
    chainConfig: {
      rpcTarget: "https://polygon-rpc.com",
      chainId: "0x89",
      ticker: "matic",
      tickerName: "matic",
      displayName: "Polygon Mainnet",
      blockExplorerUrl: "https://polygonscan.com",
      chainNamespace: "eip155",
    },
    privKey: privKey.value?.padStart(64, "0") || "",
  });

  provider.value = providerInstance;

}

init();

</script>

<style scoped>
@import "./Auth.css";
</style>
