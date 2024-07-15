<template>
  <div class="grid text-center justify-center mt-[15%] w-full p-4">
    <h6 class="mb-2 text-xl sm:text-3xl font-bold dark:text-white">demo-customauth.web3auth.io</h6>
    <h6 class="pb-10 text-base font-normal text-[#595857] dark:text-gray-200">Note: Login with Redirect mode is recommended</h6>
    <div class="flex flex-col sm:flex-row gap-4">
      <router-link to="/redirectMode">
        <Button :class="['w-full !h-auto group py-3 rounded-full flex items-center justify-center']" type="button" block size="xl" pill>
              Login with Redirect Mode
        </Button>
      </router-link>
      <router-link to="/popupMode">
        <Button :class="['w-full !h-auto group py-3 rounded-full flex items-center justify-center']" type="button" block size="xl" pill>
              Login with Popup Mode (Not Recommended)
        </Button>
      </router-link>
    </div>
    <div id="console" class="mt-10">
      <p></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import TorusSdk from "@toruslabs/customauth";
import { ref, onMounted, computed } from "vue";

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
  TWITTER,
  verifierMap,
  WEIBO,
} from "./constants";
import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { Button } from "@toruslabs/vue-components";

const torusdirectsdk = ref(null as TorusSdk | null);
const selectedVerifier = ref("google");
const loginToConnectionMap = computed(() : Record<string, any> => ({
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
}));

const _login = async (hash: string, queryParameters: Record<string, any>) => {
  try {
    if (!torusdirectsdk.value) return;
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
    console.log(loginDetails);
  } catch (error) {
    console.error(error, "caught");
  }
};

const _handleRedirectParameters = (
  hash: string,
  queryParameters: Record<string, string | null>,
): {
  error: string;
  instanceParameters: Record<string, any>;
  hashParameters: Record<string, string>;
} => {
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

const _console = (...args: unknown[]) => {
  const el = document.querySelector("#console>p");
  if (el) {
    el.innerHTML = JSON.stringify(args || {}, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2);
  }
};

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
    const hash = url.hash.substr(1);
    const queryParams = {} as Record<string, string | null>;
    for (const key of url.searchParams.keys()) {
      queryParams[key] = url.searchParams.get(key);
    }
    const { error, instanceParameters } = _handleRedirectParameters(hash, queryParams);
    const torusdirectsdk = new TorusSdk({
      baseUrl: `${location.origin}/serviceworker`,
      enableLogging: true,
      network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET, // details for test net
      web3AuthClientId: WEB3AUTH_CLIENT_ID,
    });
    await torusdirectsdk.init({ skipSw: false });
    torusdirectsdk.value = torusdirectsdk;
    if (hash) {
      if (error) throw new Error(error);
      const { verifier: returnedVerifier } = instanceParameters;
      selectedVerifier.value = Object.keys(verifierMap).find((x) => verifierMap[x].verifier === returnedVerifier) as string;
      _login(hash, queryParams);
    }
  } catch (error) {
    console.error(error, "mounted caught");
  }
});

</script>

<style scoped>
@import "./views/RedirectMode/Auth.css";
</style>
