<template>
  <nav class="bg-white sticky top-0 z-50 w-full z-20 top-0 start-0 border-gray-200 dark:border-gray-600">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
        <img :src="`/web3auth.svg`" class="h-8" alt="W3A Logo" />
      </a>
      <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <Button v-if="isDisplay('btnLogout')" v-bind="{ block: true, size: 'xs', pill: true, variant: 'secondary' }" @click="onLogout">
          {{ $t("app.btnLogout") }}
        </Button>
        <Button v-else v-bind="{ block: true, size: 'xs', pill: true, variant: 'secondary' }" @click="() => {}">
          {{ $t("app.documentation") }}
        </Button>
      </div>
      <div id="navbar-sticky" class="items-center justify-between w-full md:flex md:w-auto md:order-1">
        <div v-if="isDisplay('appHeading')" class="max-sm:w-full">
          <h1 class="leading-tight text-3xl font-extrabold">{{ $t("app.title") }}</h1>
          <p class="leading-tight text-1xl">{{ $t("app.description") }}</p>
        </div>
      </div>
    </div>
  </nav>
  <main class="flex-1 p-1">
    <div class="relative">
      <div v-if="isDisplay('loginForm')" class="grid grid-cols-8 gap-0">
        <div class="col-span-0 sm:col-span-1 lg:col-span-2"></div>
        <Card class="h-auto px-8 py-8 col-span-8 sm:col-span-6 lg:col-span-4">
          <div class="text-3xl font-bold leading-tight text-center">{{ $t("app.greeting") }}</div>
          <div class="grid grid-cols-1 gap-2">
            <Select
              v-model="formData.uxMode"
              data-testid="selectUxMode"
              :label="$t('app.uxMode')"
              :aria-label="$t('app.uxMode')"
              :placeholder="$t('app.uxMode')"
              :options="uxModeOptions"
            />
            <Select
              v-model="formData.loginProvider"
              data-testid="selectUxMode"
              :label="$t('app.verifier')"
              :aria-label="$t('app.verifier')"
              :placeholder="$t('app.verifier')"
              :options="formData.network === TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET ? sapphireDevnetVerifierOptions : testnetVerifierOptions"
            />
            <TextField
              v-if="isDisplay('loginHintEmail')"
              v-model="formData.loginHint"
              :label="$t('app.email')"
              :aria-label="$t('app.email')"
              placeholder="Enter an email"
              required
            />
            <TextField
              v-if="isDisplay('loginHintPhone')"
              v-model="formData.loginHint"
              :label="$t('app.phone')"
              :aria-label="$t('app.phone')"
              placeholder="Eg: +{cc}-{number}"
              required
            />
            <Select
              v-model="formData.network"
              data-testid="selectUxMode"
              :label="$t('app.network')"
              :aria-label="$t('app.network')"
              :placeholder="$t('app.network')"
              :options="networkOptions"
            />
          </div>
          <div class="flex justify-center mt-5">
            <Button data-testid="loginButton" type="button" block size="md" pill :disabled="!!privKey" @click="onLogin">Connect</Button>
          </div>
          <ul class="text-sm text-app-gray-700 dark:text-app-gray-200 font-normal mt-4 mb-5 px-0">
            <li>
              Please note that the verifiers listed in the example have
              <span class="font-semibold text-app-gray-900 dark:text-white">http://localhost:3000/serviceworker/redirect</span>
              configured as the redirect uri.
            </li>
            <li>If you use any other domains, they won't work.</li>
            <li>The verifiers listed here only work with the client id's specified in example. Please don't edit them</li>
            <li>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</li>
          </ul>
          <div class="text-base text-app-gray-900 dark:text-app-gray-200 font-medium mt-4 mb-5 px-0">
            Reach out to us at
            <a class="text-app-primary-600 dark:text-app-primary-500 underline" href="mailto:hello@tor.us">hello@tor.us</a>
            or
            <a class="text-app-primary-600 dark:text-app-primary-500 underline" href="https://t.me/torusdev">telegram group</a>
            to get your verifier deployed for your client id.
          </div>
        </Card>
      </div>
      <div v-else class="grid gap-0">
        <div class="grid grid-cols-8 gap-0">
          <div class="col-span-1"></div>
          <Card class="px-4 py-4 gird col-span-2">
            <div class="mb-2">
              <Button block size="xs" pill data-testid="btnClearConsole" @click="clearUiconsole">
                {{ $t("app.btnClearConsole") }}
              </Button>
            </div>
            <div class="mb-2">
              <Button block size="xs" pill data-testid="btnUserInfo" @click="printUserInfo">
                {{ $t("app.btnUserInfo") }}
              </Button>
            </div>
            <div class="mb-2">
              <Button block size="xs" pill data-testid="btnSignMessage" @click="signMessage">
                {{ $t("app.btnSignMessage") }}
              </Button>
            </div>
            <div class="mb-2">
              <Button block size="xs" pill data-testid="btnSignV1Message" @click="signV1Message">
                {{ $t("app.btnSignV1Message") }}
              </Button>
            </div>
            <div class="mb-2">
              <Button block size="xs" pill data-testid="btnFetchLatestBlock" @click="latestBlock">
                {{ $t("app.btnFetchLatestBlock") }}
              </Button>
            </div>
            <div class="mb-2">
              <p class="btn-label !mb-0">Stark key pair</p>
              <p class="text-xs text-app-gray-500 mb-2">Enter HD account index to derive stark key pair from custom auth's private key</p>
              <form class="flex flex-col sm:flex-row gap-4 bottom-gutter" @submit.prevent="starkHdAccount">
                <TextField id="accountIndex" v-model="accountIndex" class="custom-input" type="number" placeholder="Index" :min="0" required />
                <Button type="submit" pill size="xs" @click="starkHdAccount">{{ $t("app.btnGetStarkKey") }}</Button>
              </form>
              <p class="btn-label">Sign message</p>
              <form @submit.prevent="signMessageWithStarkKey">
                <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
                  <TextArea v-model="starkMessage" class="custom-input w-full" rows="2" placeholder="Message to encrypt" />
                </div>
                <div class="flex flex-col sm:flex-row gap-4 bottom-gutter">
                  <TextField id="accountIndex" v-model="starkAccountIndex" class="custom-input" type="number" :min="0" />
                  <Button type="submit" pill size="sm">{{ $t("app.btnSignMessageStarkey") }}</Button>
                </div>
              </form>
              <p class="btn-label">Validate message</p>
              <form class="flex flex-col sm:flex-row gap-4 bottom-gutter" @submit.prevent="validateStarkMessage">
                <TextField
                  id="accountIndex"
                  v-model="validateAccountIndex"
                  class="custom-input disabled:cursor-not-allowed"
                  :disabled="!signingMessage"
                  type="number"
                  placeholder="Index"
                  :min="0"
                  required
                />
                <Button type="submit" :disabled="!signingMessage" pill size="xs">{{ $t("app.btnValidateStarkMessage") }}</Button>
              </form>
            </div>
          </Card>
          <Card id="console" class="px-4 py-4 col-span-4 overflow-y-auto">
            <ul class="text-sm text-app-gray-700 dark:text-app-gray-200 font-normal mt-4 mb-5 px-0">
              <li>
                Please note that the verifiers listed in the example have
                <span class="font-semibold text-app-gray-900 dark:text-white">http://localhost:3000/serviceworker/redirect</span>
                configured as the redirect uri.
              </li>
              <li>If you use any other domains, they won't work.</li>
              <li>The verifiers listed here only work with the client id's specified in example. Please don't edit them</li>
              <li>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</li>
              <li class="font-semibold">
                Reach out to us at
                <a class="text-app-primary-600 dark:text-app-primary-500 underline" href="mailto:hello@tor.us">hello@tor.us</a>
                or
                <a class="text-app-primary-600 dark:text-app-primary-500 underline" href="https://t.me/torusdev">telegram group</a>
                to get your verifier deployed for your client id.
              </li>
            </ul>
            <div class="text-base text-app-gray-900 dark:text-app-gray-200 font-medium mb-5 px-0"></div>
            <pre
              class="whitespace-pre-line overflow-x-auto font-normal text-base leading-6 text-black break-words overflow-y-auto max-h-screen"
            ></pre>
          </Card>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { KEY_TYPE, TORUS_LEGACY_NETWORK, TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { CustomAuth, LoginWindowResponse, TorusLoginResponse, TorusVerifierResponse, UX_MODE } from "@toruslabs/customauth";
import { fetchLocalConfig } from "@toruslabs/fnd-base";
import { getStarkHDAccount, pedersen, sign, STARKNET_NETWORKS, verify } from "@toruslabs/openlogin-starkkey";
import { TorusKey } from "@toruslabs/torus.js";
import { Button, Card, Select, TextArea, TextField } from "@toruslabs/vue-components";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ec } from "elliptic";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
import { computed, ref, watch } from "vue";

import {
  APPLE,
  AUTH_DOMAIN,
  COGNITO,
  COGNITO_AUTH_DOMAIN,
  EMAIL_PASSWORD,
  FormData,
  GITHUB,
  GOOGLE,
  HOSTED_EMAIL_PASSWORDLESS,
  HOSTED_SMS_PASSWORDLESS,
  LINE,
  LINKEDIN,
  LOCAL_NETWORK,
  networkOptions,
  REDDIT,
  sapphireDevnetVerifierMap,
  sapphireDevnetVerifierOptions,
  TELEGRAM,
  testnetVerifierMap,
  testnetVerifierOptions,
  TWITTER,
  uxModeOptions,
  WEB3AUTH_CLIENT_ID,
  WEB3AUTH_EMAIL_PASSWORDLESS,
  WEB3AUTH_SMS_PASSWORDLESS,
  WEIBO,
} from "./config";
import { fetchLatestBlock, signEthMessage, signTypedData_v1 } from "./services/chainHandlers";

const { log } = console;

const formData = ref<FormData>({
  uxMode: UX_MODE.REDIRECT,
  loginProvider: GOOGLE,
  loginHint: "",
  network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
  provider: null,
});

const customAuthSdk = ref<CustomAuth | null>(null);
const privKey = ref<string | undefined>("");
const userInfo = ref<(TorusVerifierResponse & LoginWindowResponse) | null>(null);
const provider = ref<SafeEventEmitterProvider | null>(null);
const signedMessage = ref<ec.Signature | null>(null);
const signingMessage = ref<string | null>(null);
const accountIndex = ref<number | undefined>(0);
const starkMessage = ref<string | undefined>("");
const starkAccountIndex = ref<number | undefined>(0);
const validateAccountIndex = ref<number | undefined>(0);

const isDisplay = (name: string): boolean => {
  switch (name) {
    case "loginForm":
      return !privKey.value;
    case "btnLogout":
    case "appHeading":
      return !!privKey.value;
    case "loginHintEmail":
      return formData.value.loginProvider === WEB3AUTH_EMAIL_PASSWORDLESS;
    case "loginHintPhone":
      return formData.value.loginProvider === WEB3AUTH_SMS_PASSWORDLESS;

    default: {
      return true;
    }
  }
};

const verifierMap = computed(() => {
  const { network } = formData.value;
  switch (network) {
    case TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET:
      return sapphireDevnetVerifierMap;
    case TORUS_LEGACY_NETWORK.TESTNET:
      return testnetVerifierMap;
    default:
      return sapphireDevnetVerifierMap;
  }
});

const loginToConnectionMap = computed((): Record<string, Record<string, string | boolean>> => {
  const login_hint = formData.value.loginHint;
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
    [REDDIT]: { domain: AUTH_DOMAIN, connection: "Reddit", verifierIdField: "name", isVerifierIdCaseSensitive: false },
    [TELEGRAM]: {
        identity_provider: "Telegram",
        domain: "https://oauth.tg.dev/auth",
        origin: "https://custom-auth-beta.vercel.app/serviceworker/redirect",
    },
    [WEB3AUTH_EMAIL_PASSWORDLESS]: {
      login_hint,
    },
    [WEB3AUTH_SMS_PASSWORDLESS]: {
      login_hint,
    },
  };
});
const loadResponse = (privKeyInfo: TorusKey["finalKeyData"], localUserInfo: TorusVerifierResponse & LoginWindowResponse) => {
  privKey.value = privKeyInfo?.privKey;
  userInfo.value = localUserInfo;
  if (privKey.value) localStorage.setItem("privKey", privKey.value as string);
  if (userInfo.value) localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
};
const initCustomAuth = async () => {
  const { network, uxMode } = formData.value;
  switch (uxMode) {
    case UX_MODE.REDIRECT: {
      const nodeDetails = fetchLocalConfig(network, KEY_TYPE.SECP256K1);
      customAuthSdk.value = new CustomAuth({
        baseUrl: `${window.location.origin}`,
        redirectPathName: "auth",
        enableLogging: true,
        network,
        uxMode,
        web3AuthClientId: WEB3AUTH_CLIENT_ID,
        nodeDetails,
        checkCommitment: false,
      });
      await customAuthSdk.value.init({ skipSw: true });
      break;
    }
    case UX_MODE.POPUP: {
      const nodeDetails = fetchLocalConfig(network, KEY_TYPE.SECP256K1);
      customAuthSdk.value = new CustomAuth({
        uxMode,
        baseUrl: `${window.location.origin}/serviceworker`,
        enableLogging: true,
        network,
        popupFeatures: `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=500,width=500,top=100,left=100`,
        web3AuthClientId: WEB3AUTH_CLIENT_ID,
        nodeDetails,
        checkCommitment: false,
      });
      await customAuthSdk.value.init();
      break;
    }
    default:
      break;
  }
  localStorage.setItem(LOCAL_NETWORK, network);
};

const setProvider = async () => {
  if (!privKey.value) return;
  provider.value = await EthereumPrivateKeyProvider.getProviderInstance({
    chainConfig: {
      rpcTarget: "https://polygon-rpc.com",
      chainId: "0x89",
      ticker: "matic",
      tickerName: "matic",
      displayName: "Polygon Mainnet",
      blockExplorerUrl: "https://polygonscan.com",
      chainNamespace: "eip155",
    },
    privKey: privKey.value,
  });
};

const onLogin = async () => {
  const { loginProvider: selectedLoginProvider } = formData.value;

  if (!customAuthSdk.value) return;

  const jwtParams = loginToConnectionMap.value[selectedLoginProvider] || {};
  const { typeOfLogin, clientId, verifier } = verifierMap.value[selectedLoginProvider];
  let privKeyInfo: TorusKey["finalKeyData"];
  let localUserInfo: TorusVerifierResponse & LoginWindowResponse;

  if (formData.value.network === TORUS_LEGACY_NETWORK.TESTNET) {
    const data = await customAuthSdk.value.triggerLogin({
      typeOfLogin,
      verifier,
      clientId,
      jwtParams,
    });
    privKeyInfo = data?.finalKeyData;
    localUserInfo = data?.userInfo;
  } else {
    const data = await customAuthSdk.value?.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
    });
    privKeyInfo = data?.finalKeyData;
    localUserInfo = data?.userInfo;
  }

  if (privKeyInfo) {
    loadResponse(privKeyInfo, localUserInfo);
  }
};

const onLogout = async () => {
  privKey.value = undefined;
  localStorage.removeItem("privKey");
};

watch(
  () => [formData.value.network, formData.value.uxMode],
  ([newValue, oldValue]) => {
    if (oldValue === newValue) return;
    initCustomAuth();
  }
);

watch(
  () => privKey.value,
  async (newValue) => {
    if (!newValue) return;
    await setProvider();
  }
);

const init = async () => {
  await initCustomAuth();
  if (localStorage.getItem("privKey")) {
    privKey.value = localStorage.getItem("privKey") as string;
    userInfo.value = JSON.parse(localStorage.getItem("userInfo") as string);
    return;
  }
  const { uxMode } = formData.value;
  try {
    if (uxMode === UX_MODE.REDIRECT) {
      const loginDetails = await customAuthSdk.value?.getRedirectResult();
      const response = loginDetails?.result as TorusLoginResponse;
      if (response) loadResponse(response.finalKeyData, response.userInfo);
    }
  } catch (error) {
    log(error);
  }
};
init();

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

const printConsole = (...args: unknown[]): void => {
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

const printUserInfo = () => {
  printConsole("User Info", { userInfo: userInfo.value, privKey: privKey.value });
};

const signMessage = async () => {
  const signedMessageR = await signEthMessage(provider.value as SafeEventEmitterProvider);
  printConsole("Signed Message", signedMessageR);
};

const signV1Message = async () => {
  const signedMessageR = await signTypedData_v1(provider.value as SafeEventEmitterProvider);
  printConsole("Signed V1 Message", signedMessageR);
};

const latestBlock = async () => {
  const block = await fetchLatestBlock(provider.value as SafeEventEmitterProvider);
  printConsole("Latest block", block);
};

const getStarkAccount = (index: number): ec.KeyPair => {
  const account = getStarkHDAccount((privKey.value as string).padStart(64, "0"), index, STARKNET_NETWORKS.testnet);
  return account;
};

const starkHdAccount = (): ec.KeyPair => {
  const account = getStarkAccount(accountIndex.value as number);
  printConsole("Stark Key Pair", {
    ...account,
  });
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

const signMessageWithStarkKey = () => {
  const accIndex = starkAccountIndex.value as number;
  const message = starkMessage.value as string;
  const keyPair: ec.KeyPair = getStarkAccount(accIndex);
  const hash = getPedersenHashRecursively(message);
  signedMessage.value = sign(keyPair, hash);
  signingMessage.value = message;
  printConsole("Signed Message With Stark Key", {
    pedersenHash: hash,
    info: `Message signed successfully: TORUS STARKWARE- ${message}`,
    signedMesssage: signedMessage.value,
  });
};

const validateStarkMessage = () => {
  const keyPair = getStarkAccount(validateAccountIndex.value as number);
  const hash = getPedersenHashRecursively(signingMessage.value as string);
  const isVerified = verify(keyPair, hash, signedMessage.value as unknown as ec.Signature);
  printConsole("Validate Stark Message", { verified: isVerified });
};
</script>
