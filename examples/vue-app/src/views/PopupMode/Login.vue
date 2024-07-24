<template>
  <section class="">
    <div v-if="!privKey" class="flex flex-col items-center">
      <div class="w-full bg-white rounded-lg shadow sm:max-w-md">
        <Card class=" px-4 py-4 gird col-span-1">
          <div>
            <h6 class="text-2xl font-semibold pb-4 text-center">Login in popup mode</h6>
          </div>
          <div>
            <Select v-model="selectedVerifier" :options="Object.keys(verifierMap).map((x) => ({ name: x, value: x }))"
              :class="['w-full !h-auto group p-2']" label="Select Verifier" />
          </div>
          <div>
            <TextField v-model="login_hint" v-if="selectedVerifier === 'torus_email_passwordless'"
              placeholder="Enter an email" required :class="['w-full !h-auto group pb-2']" />
          </div>
          <div>
            <TextField v-model="login_hint" v-if="selectedVerifier === 'torus_sms_passwordless'"
              placeholder="Eg: +{cc}-{number}" required :class="['w-full !h-auto group pb-2']" />
          </div>
          <div>
            <Select v-model="selectedNetwork" :options="networkList.map((x) => ({ name: x, value: x }))"
              :class="['w-full !h-auto group p-2']" label="Select Network" />
          </div>
          <div class="my-5 flex px-6 gap-4">
            <Button @click="() => login()" class="" type="button" block size="md" pill>
              Login with Torus
            </Button>
            <Button @click="() => { }" class="" type="button" block size="md" pill variant="secondary">
              Back
            </Button>
          </div>
          <ul class="text-sm text-app-gray-700 dark:text-app-gray-200 font-normal mt-4 mb-5 px-6 text-center">
            <li>
              Please note that the verifiers listed in the example have
              <span
                class="font-semibold text-app-gray-900 dark:text-white">http://localhost:3000/serviceworker/redirect</span>
              configured as the redirect uri.
            </li>
            <li>If you use any other domains, they won't work.</li>
            <li>The verifiers listed here only work with the client id's specified in example. Please don't edit them
            </li>
            <li>The verifiers listed here are for example reference only. Please don't use them for anything other than
              testing purposes.</li>
          </ul>
          <div class="text-base text-app-gray-900 dark:text-app-gray-200 font-medium mt-4 mb-5 px-6 text-center">
            Reach out to us at
            <a class="text-app-primary-600 dark:text-app-primary-500 underline"
              href="mailto:hello@tor.us">hello@tor.us</a>
            or
            <a class="text-app-primary-600 dark:text-app-primary-500 underline" href="https://t.me/torusdev">telegram
              group</a>
            to get your verifier deployed for your client id.
          </div>

        </Card>
      </div>
    </div>
    <div v-if="privKey" class="text-start">
      <div class="dashboard-container">
        <!-- Dashboard Action Container -->
        <div class="dashboard-details-container">
          <div class="dashboard-details-btn-container">
            <h1 class="details-heading flex justify-between items-center">
              <span>CustomAuth Specific Info</span>
            </h1>
            <div v-show="isExpanded" class="mt-4 overflow-y-auto">
              <p class="btn-label">Signing</p>
              <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
                <Button @click="signMessage" :disabled="!provider" pill size="sm">Sign Test Eth Message</Button>
                <Button @click="latestBlock" :disabled="!provider" pill size="sm">Fetch Latest block</Button>
              </div>
              <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
                <Button @click="signV1Message" :disabled="!provider" pill size="sm">Sign Typed data v1 test Msg</Button>
          
              </div>
              <p class="btn-label !mb-0">Stark key pair</p>
              <p class="text-xs text-app-gray-500 mb-2">Enter HD account index to derive stark key pair from custom
                auth's private key</p>
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
                  <Button type="submit" :disabled="!signingMessage" class="disabled:cursor-not-allowed" pill size="sm">Validate
                    Stark Message</Button>
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
                If you use any other domains, they won't work. The verifiers listed here only work with the client id's
                specified in example. Please
                don't edit them. The verifiers listed here are for example reference only. Please don't use them for
                anything other than testing
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
  </section>
</template>

<script setup lang="ts">
import TorusSdk, { TorusLoginResponse, UX_MODE } from "@toruslabs/customauth";
import { getStarkHDAccount, pedersen, sign, STARKNET_NETWORKS, verify } from "@toruslabs/openlogin-starkkey";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ec } from "elliptic";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
import { ref, computed, watch, onMounted } from "vue";
import { Select, TextField, Button, Card } from "@toruslabs/vue-components";

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
import { setPrivKey, privKey } from "@/store";

const torusdirectsdk = ref<TorusSdk | null>(null);
const selectedVerifier = ref("google");
const login_hint = ref("");
const isExpanded = ref(true);
const networkList = [...Object.values(TORUS_SAPPHIRE_NETWORK), ...Object.values(TORUS_LEGACY_NETWORK)];
const selectedNetwork = ref(TORUS_LEGACY_NETWORK.TESTNET);
const loginResponse = ref<TorusLoginResponse | null>(null);
const provider = ref<SafeEventEmitterProvider | null>(null);
const signingMessage = ref<string | null>(null);
const signedMessage = ref<ec.Signature | null>(null);

const loginToConnectionMap = computed((): Record<string, any> => ({
  // [GOOGLE]: { login_hint: 'hello@tor.us', prompt: 'none' },
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
    login_hint: login_hint.value,
    connection: "email",
  },
  [TORUS_SMS_PASSWORDLESS]: {
    domain: "https://develop-passwordless.web3auth.io",
    verifierIdField: "name",
    login_hint: login_hint.value,
    connection: "sms",
  },
}));
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

const login = async (hash?: string, queryParameters?: Record<string, any>) => {
  try {
    if (!torusdirectsdk.value) return;
    const privKeyInStorage = localStorage.getItem("privateKey");
    if (privKeyInStorage) {
      setPrivKey(privKeyInStorage);
    } else {
      const jwtParams = loginToConnectionMap.value[selectedVerifier.value] || {};
      const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier.value];
      console.log(hash, queryParameters, typeOfLogin, clientId, verifier, jwtParams);
      const loginDetails = await torusdirectsdk.value.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
        hash,
        queryParameters,
      });
      const privateKey = loginDetails.finalKeyData.privKey || loginDetails.oAuthKeyData.privKey;
      if (privateKey) {
        setPrivKey(privateKey);
        localStorage.setItem("privateKey", privateKey);
      }
      loginResponse.value = loginDetails;
      console.log(loginDetails);
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
      privKey: privKey.value || "",
    });
    provider.value = providerInstance;

    // const loginDetails = await torusdirectsdk.value.triggerHybridAggregateLogin({
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
    // const loginDetails = await torusdirectsdk.value.triggerAggregateLogin({
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
  } catch (error) {
    console.error(error, "caught");
  }
};

const getPrivateKey = (loginDetails: TorusLoginResponse | null): string => {
  if (!loginDetails) return "";
  return loginDetails.finalKeyData.privKey || loginDetails.oAuthKeyData.privKey;
};

const clearUiconsole = () => {
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

const signMessage = async () => {
  const signedMessage = await signEthMessage(provider.value as SafeEventEmitterProvider);
  _console(["Signed Message", signedMessage]);
};

const signV1Message = async () => {
  const signedMessage = await signTypedData_v1(provider.value as SafeEventEmitterProvider);
  _console(["Signed V1 Message", signedMessage]);
};

const latestBlock = async () => {
  const block = await fetchLatestBlock(provider.value as SafeEventEmitterProvider);
  _console(["Latest block", block]);
};

const getStarkAccount = (index: number): ec.KeyPair => {
  const account = getStarkHDAccount(getPrivateKey(loginResponse.value).padStart(64, "0"), index, STARKNET_NETWORKS.testnet);
  return account;
};

const starkHdAccount = (e: any) => {
  const accIndex = e.target[0].value;
  const account = getStarkAccount(accIndex);
  _console(["Stark Key Pair", {
    ...account,
  }]);
  return account;
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

const signMessageWithStarkKey = (e: any) => {
  e.preventDefault();
  const accIndex = e.target[1].value;
  const message = e.target[0].value;
  const keyPair: ec.KeyPair = getStarkAccount(accIndex);
  const hash = getPedersenHashRecursively(message);
  signedMessage.value = sign(keyPair, hash);
  signingMessage.value = message;
  _console(["Signed Message With Stark Key", {
    pedersenHash: hash,
    info: `Message signed successfully: TORUS STARKWARE- ${message}`,
    signedMesssage: signedMessage.value,
  }]);
};

const validateStarkMessage = (e: any) => {
  e.preventDefault();
  const signingAccountIndex = e.target[0].value;
  const keyPair = getStarkAccount(signingAccountIndex);
  const hash = getPedersenHashRecursively(signingMessage.value as string);
  const isVerified = verify(keyPair, hash, signedMessage.value as unknown as ec.Signature);
  _console(["Validate Stark Message", { verified: isVerified }]);
};

watch(selectedNetwork, (oldValue, newValue) => {
  if (oldValue === newValue) return;
  const sdk = new TorusSdk({
    uxMode: UX_MODE.POPUP,
    baseUrl: `${import.meta.env.VITE_BASE_URL}/serviceworker`,
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
  // torusdirectsdk.init();
  torusdirectsdk.value = sdk;
});

onMounted(async () => {
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
    const url = new URL(location.href);
    // const hash = url.hash.substr(1);
    const queryParams = {} as Record<string, string | null>;
    for (const key of url.searchParams.keys()) {
      queryParams[key] = url.searchParams.get(key);
    }
    // const { error, instanceParameters } = _handleRedirectParameters(hash, queryParams);
    const sdk = new TorusSdk({
      baseUrl: `${location.origin}/serviceworker`,
      enableLogging: true,
      network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET, // details for test net
      web3AuthClientId: WEB3AUTH_CLIENT_ID,
    });
    await sdk.init({ skipSw: true });
    torusdirectsdk.value = sdk;
  } catch (error) {
    console.error(error, "caught");
  }
});

const _handleRedirectParameters = (hash: string, queryParameters: Record<string, string | null>) => {
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
};

</script>

<style scoped>
@import "../RedirectMode/Auth.css";
</style>
