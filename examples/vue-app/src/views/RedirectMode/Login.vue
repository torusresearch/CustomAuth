<template>
  <section class="">
    <div class="flex flex-col items-center">

      <div class="w-full bg-white rounded-lg shadow sm:max-w-md">
        <Card class=" px-4 py-4 gird col-span-1">
          <div>
            <h6 class="text-2xl font-semibold pb-4 text-center">Login in popup mode</h6>
          </div>
          <div>
            <Select v-model="store.selectedVerifier"
              :options="Object.keys(verifierMap).map((x) => ({ name: x, value: x }))"
              :class="['w-full !h-auto group pb-2']" label="Select Verifier" />
          </div>
          <div>
            <TextField v-model="login_hint" v-if="store.selectedVerifier === 'torus_email_passwordless'"
              placeholder="Enter an email" required :class="['w-full !h-auto group pb-2']" />
          </div>
          <div>
            <TextField v-model="login_hint" v-if="store.selectedVerifier === 'torus_sms_passwordless'"
              placeholder="Eg: +{cc}-{number}" required :class="['w-full !h-auto group pb-2']" />
          </div>
          <div>
            <Select v-model="selectedNetwork" :options="networkList.map((x) => ({ name: x, value: x }))"
              :class="['w-full !h-auto group pb-2']" label="Select Network" />
          </div>
          <div class="my-5 flex px-6 gap-4">
            <Button @click="login" class="" type="button" block size="md" pill>
              Login with Torus
            </Button>
            <Button @click="onBack" class="" type="button" block size="md" pill variant="secondary">
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
  </section>
</template>

<script setup lang="ts">
import TorusSdk, { Auth0ClientOptions, UX_MODE } from "@toruslabs/customauth";
import { ref } from "vue";
import { TORUS_SAPPHIRE_NETWORK, TORUS_LEGACY_NETWORK } from "@toruslabs/constants";
import { Select, TextField, Button, Card } from "@toruslabs/vue-components";
import { store } from "@/store";

import { useRouter } from "vue-router";
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
  LOCAL_NETWORK,
} from "../../constants";
const router = useRouter();

const customAuthSdk = ref(null as TorusSdk | null);
const selectedVerifier = ref("google" as string);
const login_hint = ref("");
const networkList = ref([...Object.values(TORUS_SAPPHIRE_NETWORK), ...Object.values(TORUS_LEGACY_NETWORK)]);
const selectedNetwork = ref(TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET);

const loginToConnectionMap: Record<string, Object> = {
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
};

const login = async () => {
  customAuthSdk.value = new TorusSdk({
    baseUrl: location.origin,
    redirectPathName: "auth",
    enableLogging: true,
    uxMode: UX_MODE.REDIRECT,
    network: selectedNetwork.value,
    web3AuthClientId: WEB3AUTH_CLIENT_ID,
  });
  localStorage.setItem(LOCAL_NETWORK, selectedNetwork.value);
  await customAuthSdk.value.init({ skipSw: true });
  if (!customAuthSdk.value) return;

  const jwtParams = (loginToConnectionMap[selectedVerifier.value] || {}) as Auth0ClientOptions;
  const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier.value];

  return customAuthSdk.value.triggerLogin({
    typeOfLogin,
    verifier,
    clientId,
    jwtParams,
    customState: {
      client: "great-company",
      webauthnURL: "https://d1f8-115-66-172-125.ngrok.io/",
      localhostAll: "true",
      webauthnTransports: "ble",
      credTransports: "ble",
    },
  });
};

const onBack = () => {
  router.push("/");
};

</script>