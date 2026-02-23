<template>
  <nav class="bg-white sticky z-50 w-full top-0 start-0 border-gray-200 dark:border-gray-600">
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
              data-testid="selectLoginProvider"
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
              data-testid="selectNetwork"
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
import { CustomAuth, LoginWindowResponse, TorusLoginResponse, TorusConnectionResponse, UX_MODE, AUTH_CONNECTION_TYPE } from "@toruslabs/customauth";
import { fetchLocalConfig } from "@toruslabs/fnd-base";
import { TorusKey } from "@toruslabs/torus.js";
import { Button, Card, Select, TextField } from "@toruslabs/vue-components";
import { computed, onMounted, ref, watch } from "vue";
import type { Hex, PublicClient, WalletClient } from "viem";

import {
  APPLE,
  AUTH_DOMAIN,
  COGNITO,
  COGNITO_AUTH_DOMAIN,
  EMAIL_PASSWORD,
  FormData,
  GITHUB,
  GOOGLE,
  LINE,
  LINKEDIN,
  networkOptions,
  REDDIT,
  sapphireDevnetVerifierMap,
  sapphireDevnetVerifierOptions,
  TELEGRAM,
  testnetVerifierMap,
  testnetVerifierOptions,
  TWITTER,
  uxModeOptions,
  TESTNET_WEB3AUTH_CLIENT_ID,
  SAPPHIRE_WEB3AUTH_CLIENT_ID,
  WEB3AUTH_EMAIL_PASSWORDLESS,
  WEB3AUTH_SMS_PASSWORDLESS,
} from "./config";
import { createViemClients, signEthMessage, signTypedData_v1 } from "./services/chainHandlers";

const { log } = console;

const formData = ref<FormData>({
  uxMode: UX_MODE.REDIRECT,
  loginProvider: GOOGLE,
  loginHint: "",
  network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
});

watch(formData.value, (newVal) => {
  console.log("formData changed to", newVal);
  localStorage.setItem("formData", JSON.stringify(newVal));
});

onMounted(() => {
  const localFormData = localStorage.getItem("formData");
  if (localFormData) {
    const parsedFormData = JSON.parse(localFormData);
    formData.value.loginHint = parsedFormData.loginHint;
    formData.value.network = parsedFormData.network;
    formData.value.loginProvider = parsedFormData.loginProvider;
    formData.value.uxMode = parsedFormData.uxMode;
  }
});

const customAuthSdk = ref<CustomAuth | null>(null);
const privKey = ref<string | undefined>("");
const userInfo = ref<(TorusConnectionResponse & LoginWindowResponse) | null>(null);
const walletClient = ref<WalletClient | null>(null);
const publicClient = ref<PublicClient | null>(null);

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
    [APPLE]: { domain: AUTH_DOMAIN },
    [GITHUB]: { domain: AUTH_DOMAIN },
    [LINKEDIN]: { domain: AUTH_DOMAIN },
    [TWITTER]: { domain: AUTH_DOMAIN },
    [LINE]: { domain: AUTH_DOMAIN },
    [COGNITO]: { domain: COGNITO_AUTH_DOMAIN, identity_provider: "Google", response_type: "token", user_info_endpoint: "userInfo" },
    [REDDIT]: { domain: AUTH_DOMAIN, connection: "Reddit", userIdField: "name", isUserIdCaseSensitive: false },
    [TELEGRAM]: {
      identity_provider: "Telegram",
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
const loadResponse = (privKeyInfo: TorusKey, localUserInfo: (TorusConnectionResponse & LoginWindowResponse) | undefined) => {
  privKey.value = privKeyInfo?.finalKeyData?.privKey || privKeyInfo?.oAuthKeyData?.privKey;
  if (localUserInfo) userInfo.value = localUserInfo;
  if (privKey.value) localStorage.setItem("privKey", privKey.value as string);
  if (userInfo.value) localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
};
const initCustomAuth = async () => {
  const { network, uxMode } = formData.value;
  console.log("initCustomAuth", network, uxMode);
  switch (uxMode) {
    case UX_MODE.REDIRECT: {
      const nodeDetails = fetchLocalConfig(network, KEY_TYPE.SECP256K1);
      customAuthSdk.value = new CustomAuth({
        baseUrl: `${window.location.origin}`,
        redirectPathName: "auth",
        enableLogging: true,
        network,
        uxMode,
        web3AuthClientId: network === TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET ? SAPPHIRE_WEB3AUTH_CLIENT_ID : TESTNET_WEB3AUTH_CLIENT_ID,
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
        web3AuthClientId: network === TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET ? SAPPHIRE_WEB3AUTH_CLIENT_ID : TESTNET_WEB3AUTH_CLIENT_ID,
        nodeDetails,
        checkCommitment: false,
      });
      await customAuthSdk.value.init();
      break;
    }
    default:
      break;
  }
};

const setClients = () => {
  if (!privKey.value) return;
  const clients = createViemClients(`0x${privKey.value}` as Hex);
  walletClient.value = clients.walletClient;
  publicClient.value = clients.publicClient;
};

const onLogin = async () => {
  const { loginProvider: selectedLoginProvider } = formData.value;

  if (!customAuthSdk.value) return;

  const jwtParams = loginToConnectionMap.value[selectedLoginProvider] || {};
  const { typeOfLogin, clientId, verifier } = verifierMap.value[selectedLoginProvider];
  console.log("logging in with ", typeOfLogin, clientId, verifier, jwtParams, formData.value.network, customAuthSdk.value);

  let data: TorusLoginResponse | undefined;
  if (formData.value.network === TORUS_LEGACY_NETWORK.TESTNET) {
    data = await customAuthSdk.value.triggerLogin({
      authConnection: typeOfLogin as AUTH_CONNECTION_TYPE,
      authConnectionId: verifier,
      clientId,
      jwtParams,
    });
  } else {
    data = await customAuthSdk.value.triggerLogin({
      authConnection: typeOfLogin as AUTH_CONNECTION_TYPE,
      authConnectionId: "web3auth",
      groupedAuthConnectionId: verifier,
      clientId,
      jwtParams,
    });
  }

  if (data) {
    loadResponse(data, data.userInfo);
  }
};

const onLogout = async () => {
  privKey.value = undefined;
  localStorage.removeItem("privKey");
};

watch(
  () => [formData.value.network, formData.value.uxMode],
  ([newNetwork, oldNetwork], [newUxMode, oldUxMode]) => {
    console.log("watch", newNetwork, oldNetwork, newUxMode, oldUxMode);
    if (oldNetwork === newNetwork && oldUxMode === newUxMode) return;
    initCustomAuth();
  }
);

watch(
  () => privKey.value,
  (newValue) => {
    if (!newValue) return;
    setClients();
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
      if (response) loadResponse(response, response.userInfo);
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
  if (!walletClient.value) return;
  const signedMessageR = await signEthMessage(walletClient.value);
  printConsole("Signed Message", signedMessageR);
};

const signV1Message = async () => {
  if (!walletClient.value) return;
  const signedMessageR = await signTypedData_v1(walletClient.value);
  printConsole("Signed V1 Message", signedMessageR);
};
</script>
