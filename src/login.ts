import { TORUS_NETWORK } from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { keccak256 } from "web3-utils";

import createHandler from "./handlers/HandlerFactory";
import {
  AggregateLoginParams,
  CustomAuthArgs,
  ExtraParams,
  HybridAggregateLoginParams,
  ILoginHandler,
  InitParams,
  LoginWindowResponse,
  RedirectResult,
  RedirectResultParams,
  SingleLoginParams,
  SubVerifierDetails,
  TorusAggregateLoginResponse,
  TorusHybridAggregateLoginResponse,
  TorusKey,
  TorusLoginResponse,
  TorusSubVerifierInfo,
  TorusVerifierResponse,
} from "./handlers/interfaces";
import { registerServiceWorker } from "./registerServiceWorker";
import SentryHandler from "./sentry";
import { AGGREGATE_VERIFIER, LOGIN, SENTRY_TXNS, TORUS_METHOD, UX_MODE, UX_MODE_TYPE } from "./utils/enums";
import { handleRedirectParameters, isFirefox, padUrlString } from "./utils/helpers";
import log from "./utils/loglevel";
import StorageHelper from "./utils/StorageHelper";

class CustomAuth {
  static torusNodeEndpoints = [
    "https://sapphire-dev-2-1.authnetwork.dev/sss/jrpc",
    "https://sapphire-dev-2-2.authnetwork.dev/sss/jrpc",
    "https://sapphire-dev-2-3.authnetwork.dev/sss/jrpc",
    "https://sapphire-dev-2-4.authnetwork.dev/sss/jrpc",
    "https://sapphire-dev-2-5.authnetwork.dev/sss/jrpc",
  ];

  isInitialized: boolean;

  config: {
    baseUrl: string;
    redirectToOpener: boolean;
    redirect_uri: string;
    uxMode: UX_MODE_TYPE;
    locationReplaceOnRedirect: boolean;
    popupFeatures: string;
  };

  torus: Torus;

  // nodeDetailManager: NodeDetailManager;

  storageHelper: StorageHelper;

  sentryHandler: SentryHandler;

  proxyRequestURL: string;

  constructor({
    baseUrl,
    network = TORUS_NETWORK.MAINNET,
    enableLogging = false,
    enableOneKey = false,
    redirectToOpener = false,
    redirectPathName = "redirect",
    apiKey = "torus-default",
    uxMode = UX_MODE.POPUP,
    locationReplaceOnRedirect = false,
    popupFeatures,
    metadataUrl = "https://metadata.tor.us",
    storageServerUrl = "https://broadcast-server.tor.us",
    networkUrl,
    sentry,
    proxyRequestURL,
  }: CustomAuthArgs) {
    this.proxyRequestURL = proxyRequestURL;
    this.isInitialized = false;
    const baseUri = new URL(baseUrl);
    this.config = {
      baseUrl: padUrlString(baseUri),
      get redirect_uri() {
        return `${this.baseUrl}${redirectPathName}`;
      },
      redirectToOpener,
      uxMode,
      locationReplaceOnRedirect,
      popupFeatures,
    };
    const torus = new Torus({
      enableOneKey,
      metadataHost: metadataUrl,
      network,
    });
    Torus.setAPIKey(apiKey);
    this.torus = torus;
    // this.nodeDetailManager = new NodeDetailManager({ network: networkUrl || network, proxyAddress: CONTRACT_MAP[network] });
    if (enableLogging) log.enableAll();
    else log.disableAll();
    this.storageHelper = new StorageHelper(storageServerUrl);
    this.sentryHandler = new SentryHandler(sentry, networkUrl);
  }

  async init({ skipSw = false, skipInit = false, skipPrefetch = false }: InitParams = {}): Promise<void> {
    this.storageHelper.init();
    if (skipInit) {
      this.isInitialized = true;
      return;
    }
    if (!skipSw) {
      const fetchSwResponse = await fetch(`${this.config.baseUrl}sw.js`, { cache: "reload" });
      if (fetchSwResponse.ok) {
        try {
          await registerServiceWorker(this.config.baseUrl);
          this.isInitialized = true;
          return;
        } catch (error) {
          log.warn(error);
        }
      } else {
        throw new Error("Service worker is not being served. Please serve it");
      }
    }
    if (!skipPrefetch) {
      // Skip the redirect check for firefox
      if (isFirefox()) {
        this.isInitialized = true;
        return;
      }
      await this.handlePrefetchRedirectUri();
      return;
    }
    this.isInitialized = true;
  }

  async triggerLogin(args: SingleLoginParams & { useTSS?: boolean }): Promise<TorusLoginResponse> {
    const { verifier, typeOfLogin, clientId, jwtParams, hash, queryParameters, customState, registerOnly, useTSS } = args;
    log.info("Verifier: ", verifier);
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    if (registerOnly && typeOfLogin !== LOGIN.WEBAUTHN) throw new Error("registerOnly flag can only be passed for webauthn");
    const loginHandler: ILoginHandler = createHandler({
      typeOfLogin,
      clientId,
      verifier,
      redirect_uri: this.config.redirect_uri,
      redirectToOpener: this.config.redirectToOpener,
      jwtParams,
      uxMode: this.config.uxMode,
      customState,
      registerOnly,
    });
    let loginParams: LoginWindowResponse;
    if (hash && queryParameters) {
      const { error, hashParameters, instanceParameters } = handleRedirectParameters(hash, queryParameters);
      if (error) throw new Error(error);
      const { access_token: accessToken, id_token: idToken, ...rest } = hashParameters;
      // State has to be last here otherwise it will be overwritten
      loginParams = { accessToken, idToken, ...rest, state: instanceParameters };
    } else {
      this.storageHelper.clearOrphanedLoginDetails();
      if (this.config.uxMode === UX_MODE.REDIRECT) {
        await this.storageHelper.storeLoginDetails({ method: TORUS_METHOD.TRIGGER_LOGIN, args }, loginHandler.nonce);
      }
      loginParams = await loginHandler.handleLoginWindow({
        locationReplaceOnRedirect: this.config.locationReplaceOnRedirect,
        popupFeatures: this.config.popupFeatures,
      });
      if (this.config.uxMode === UX_MODE.REDIRECT) return null;
    }

    const userInfo = await loginHandler.getUserInfo(loginParams);
    if (registerOnly) {
      const nodeTx = this.sentryHandler.startTransaction({
        name: SENTRY_TXNS.FETCH_NODE_DETAILS,
      });
      this.sentryHandler.finishTransaction(nodeTx);
      const lookupTx = this.sentryHandler.startTransaction({
        name: SENTRY_TXNS.PUB_ADDRESS_LOOKUP,
      });
      const torusPubKey = await this.torus.getPublicAddress(CustomAuth.torusNodeEndpoints, { verifier, verifierId: userInfo.verifierId }, true);
      this.sentryHandler.finishTransaction(lookupTx);
      const res = {
        userInfo: {
          ...userInfo,
          ...loginParams,
        },
      };
      if (typeof torusPubKey === "string") {
        throw new Error("should have returned extended pub key");
      }
      const torusKey: TorusKey = {
        pubKey: {
          pub_key_X: torusPubKey.X,
          pub_key_Y: torusPubKey.Y,
        },
        publicAddress: torusPubKey.address,
        privateKey: null,
        metadataNonce: null,
        signatures: [],
      };
      return { ...res, ...torusKey };
    }

    const torusKey = await this.getTorusKey(
      verifier,
      userInfo.verifierId,
      { verifier_id: userInfo.verifierId },
      loginParams.idToken || loginParams.accessToken,
      userInfo.extraVerifierParams,
      !!useTSS
    );
    return {
      ...torusKey,
      userInfo: {
        ...userInfo,
        ...loginParams,
      },
    };
  }

  async triggerAggregateLogin(args: AggregateLoginParams & { useTSS?: boolean }): Promise<TorusAggregateLoginResponse> {
    // This method shall break if any of the promises fail. This behaviour is intended
    const { aggregateVerifierType, verifierIdentifier, subVerifierDetailsArray, useTSS } = args;
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    if (!aggregateVerifierType || !verifierIdentifier || !Array.isArray(subVerifierDetailsArray)) {
      throw new Error("Invalid params");
    }
    if (aggregateVerifierType === AGGREGATE_VERIFIER.SINGLE_VERIFIER_ID && subVerifierDetailsArray.length !== 1) {
      throw new Error("Single id verifier can only have one sub verifier");
    }
    const userInfoPromises: Promise<TorusVerifierResponse>[] = [];
    const loginParamsArray: LoginWindowResponse[] = [];
    for (const subVerifierDetail of subVerifierDetailsArray) {
      const { clientId, typeOfLogin, verifier, jwtParams, hash, queryParameters, customState } = subVerifierDetail;
      const loginHandler: ILoginHandler = createHandler({
        typeOfLogin,
        clientId,
        verifier,
        redirect_uri: this.config.redirect_uri,
        redirectToOpener: this.config.redirectToOpener,
        jwtParams,
        uxMode: this.config.uxMode,
        customState,
      });
      // We let the user login to each verifier in a loop. Don't wait for key derivation here.!
      let loginParams: LoginWindowResponse;
      if (hash && queryParameters) {
        const { error, hashParameters, instanceParameters } = handleRedirectParameters(hash, queryParameters);
        if (error) throw new Error(error);
        const { access_token: accessToken, id_token: idToken, ...rest } = hashParameters;
        // State has to be last here otherwise it will be overwritten
        loginParams = { accessToken, idToken, ...rest, state: instanceParameters };
      } else {
        this.storageHelper.clearOrphanedLoginDetails();
        if (this.config.uxMode === UX_MODE.REDIRECT) {
          await this.storageHelper.storeLoginDetails({ method: TORUS_METHOD.TRIGGER_AGGREGATE_LOGIN, args }, loginHandler.nonce);
        }
        loginParams = await loginHandler.handleLoginWindow({
          locationReplaceOnRedirect: this.config.locationReplaceOnRedirect,
          popupFeatures: this.config.popupFeatures,
        });
        if (this.config.uxMode === UX_MODE.REDIRECT) return null;
      }
      // Fail the method even if one promise fails

      userInfoPromises.push(loginHandler.getUserInfo(loginParams));
      loginParamsArray.push(loginParams);
    }
    const _userInfoArray = await Promise.all(userInfoPromises);
    const userInfoArray = _userInfoArray.map((userInfo) => ({ ...userInfo, aggregateVerifier: verifierIdentifier }));
    const aggregateVerifierParams = { verify_params: [], sub_verifier_ids: [], verifier_id: "" };
    const aggregateIdTokenSeeds = [];
    let aggregateVerifierId = "";
    let extraVerifierParams = {};
    for (let index = 0; index < subVerifierDetailsArray.length; index += 1) {
      const loginParams = loginParamsArray[index];
      const { idToken, accessToken } = loginParams;
      const userInfo = userInfoArray[index];
      aggregateVerifierParams.verify_params.push({ verifier_id: userInfo.verifierId, idtoken: idToken || accessToken });
      aggregateVerifierParams.sub_verifier_ids.push(userInfo.verifier);
      aggregateIdTokenSeeds.push(idToken || accessToken);
      aggregateVerifierId = userInfo.verifierId; // using last because idk
      extraVerifierParams = userInfo.extraVerifierParams;
    }
    aggregateIdTokenSeeds.sort();
    const aggregateIdToken = keccak256(aggregateIdTokenSeeds.join(String.fromCharCode(29))).slice(2);
    aggregateVerifierParams.verifier_id = aggregateVerifierId;
    const torusKey = await this.getTorusKey(
      verifierIdentifier,
      aggregateVerifierId,
      aggregateVerifierParams,
      aggregateIdToken,
      extraVerifierParams,
      useTSS
    );
    return {
      ...torusKey,
      userInfo: userInfoArray.map((x, index) => ({ ...x, ...loginParamsArray[index] })),
    };
  }

  async triggerHybridAggregateLogin(args: HybridAggregateLoginParams & { useTSS?: boolean }): Promise<TorusHybridAggregateLoginResponse> {
    const { singleLogin, aggregateLoginParams, useTSS } = args;
    // This method shall break if any of the promises fail. This behaviour is intended
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    if (
      !aggregateLoginParams.aggregateVerifierType ||
      !aggregateLoginParams.verifierIdentifier ||
      !Array.isArray(aggregateLoginParams.subVerifierDetailsArray)
    ) {
      throw new Error("Invalid params");
    }
    if (
      aggregateLoginParams.aggregateVerifierType === AGGREGATE_VERIFIER.SINGLE_VERIFIER_ID &&
      aggregateLoginParams.subVerifierDetailsArray.length !== 1
    ) {
      throw new Error("Single id verifier can only have one sub verifier");
    }
    const { typeOfLogin, clientId, verifier, jwtParams, hash, queryParameters, customState } = singleLogin;
    const loginHandler: ILoginHandler = createHandler({
      typeOfLogin,
      clientId,
      verifier,
      redirect_uri: this.config.redirect_uri,
      redirectToOpener: this.config.redirectToOpener,
      jwtParams,
      uxMode: this.config.uxMode,
      customState,
    });
    let loginParams: LoginWindowResponse;
    if (hash && queryParameters) {
      const { error, hashParameters, instanceParameters } = handleRedirectParameters(hash, queryParameters);
      if (error) throw new Error(error);
      const { access_token: accessToken, id_token: idToken, ...rest } = hashParameters;
      // State has to be last here otherwise it will be overwritten
      loginParams = { accessToken, idToken, ...rest, state: instanceParameters };
    } else {
      this.storageHelper.clearOrphanedLoginDetails();
      if (this.config.uxMode === UX_MODE.REDIRECT) {
        await this.storageHelper.storeLoginDetails({ method: TORUS_METHOD.TRIGGER_AGGREGATE_HYBRID_LOGIN, args }, loginHandler.nonce);
      }
      loginParams = await loginHandler.handleLoginWindow({
        locationReplaceOnRedirect: this.config.locationReplaceOnRedirect,
        popupFeatures: this.config.popupFeatures,
      });
      if (this.config.uxMode === UX_MODE.REDIRECT) return null;
    }

    const userInfo = await loginHandler.getUserInfo(loginParams);
    const torusKey1Promise = this.getTorusKey(
      verifier,
      userInfo.verifierId,
      { verifier_id: userInfo.verifierId },
      loginParams.idToken || loginParams.accessToken,
      userInfo.extraVerifierParams,
      useTSS
    );

    const { verifierIdentifier, subVerifierDetailsArray } = aggregateLoginParams;
    const aggregateVerifierParams = { verify_params: [], sub_verifier_ids: [], verifier_id: "" };
    const aggregateIdTokenSeeds = [];
    let aggregateVerifierId = "";
    for (let index = 0; index < subVerifierDetailsArray.length; index += 1) {
      const sub = subVerifierDetailsArray[index];
      const { idToken, accessToken } = loginParams;
      aggregateVerifierParams.verify_params.push({ verifier_id: userInfo.verifierId, idtoken: idToken || accessToken });
      aggregateVerifierParams.sub_verifier_ids.push(sub.verifier);
      aggregateIdTokenSeeds.push(idToken || accessToken);
      aggregateVerifierId = userInfo.verifierId; // using last because idk
    }
    aggregateIdTokenSeeds.sort();
    const aggregateIdToken = keccak256(aggregateIdTokenSeeds.join(String.fromCharCode(29))).slice(2);
    aggregateVerifierParams.verifier_id = aggregateVerifierId;
    const torusKey2Promise = this.getTorusKey(
      verifierIdentifier,
      aggregateVerifierId,
      aggregateVerifierParams,
      aggregateIdToken,
      userInfo.extraVerifierParams,
      useTSS
    );
    const [torusKey1, torusKey2] = await Promise.all([torusKey1Promise, torusKey2Promise]);
    return {
      singleLogin: {
        userInfo: { ...userInfo, ...loginParams },
        ...torusKey1,
      },
      aggregateLogins: [torusKey2],
    };
  }

  async getTorusKey(
    verifier: string,
    verifierId: string,
    verifierParams: { verifier_id: string },
    idToken: string,
    additionalParams?: ExtraParams,
    useTSS?: boolean
  ): Promise<TorusKey> {
    const nodeTx = this.sentryHandler.startTransaction({
      name: SENTRY_TXNS.FETCH_NODE_DETAILS,
    });
    // const { torusNodeEndpoints, torusNodePub, torusIndexes } = await this.nodeDetailManager.getNodeDetails({ verifier, verifierId });
    this.sentryHandler.finishTransaction(nodeTx);
    log.debug("torus-direct/getTorusKey", { torusNodeEndpoints: CustomAuth.torusNodeEndpoints });

    const pubLookupTx = this.sentryHandler.startTransaction({
      name: SENTRY_TXNS.PUB_ADDRESS_LOOKUP,
    });
    this.sentryHandler.finishTransaction(pubLookupTx);

    const sharesTx = this.sentryHandler.startTransaction({
      name: SENTRY_TXNS.FETCH_SHARES,
    });
    const shares = await this.torus.retrieveShares(CustomAuth.torusNodeEndpoints, verifier, verifierParams, idToken, {
      ...additionalParams,
      ...(useTSS && { proxyRequestURL: this.proxyRequestURL }),
    });
    this.sentryHandler.finishTransaction(sharesTx);
    log.debug("torus-direct/getTorusKey", { retrieveShares: shares });

    const signatures = (shares.sessionTokensData || []).map((x) => {
      return JSON.stringify({
        data: x.token,
        sig: x.signature,
      });
    });
    return {
      publicAddress: shares.ethAddress.toString(),
      privateKey: shares.privKey.toString(),
      metadataNonce: shares.metadataNonce.toString("hex"),
      pubKey: {
        pub_key_X: shares.X,
        pub_key_Y: shares.Y,
      },
      signatures,
    };
  }

  async getAggregateTorusKey(
    verifier: string,
    verifierId: string, // unique identifier for user e.g. sub on jwt
    subVerifierInfoArray: TorusSubVerifierInfo[],
    useTSS?: boolean
  ): Promise<TorusKey> {
    const aggregateVerifierParams = { verify_params: [], sub_verifier_ids: [], verifier_id: "" };
    const aggregateIdTokenSeeds = [];
    let extraVerifierParams = {};
    for (let index = 0; index < subVerifierInfoArray.length; index += 1) {
      const userInfo = subVerifierInfoArray[index];
      aggregateVerifierParams.verify_params.push({ verifier_id: verifierId, idtoken: userInfo.idToken });
      aggregateVerifierParams.sub_verifier_ids.push(userInfo.verifier);
      aggregateIdTokenSeeds.push(userInfo.idToken);
      extraVerifierParams = userInfo.extraVerifierParams;
    }
    aggregateIdTokenSeeds.sort();
    const aggregateIdToken = keccak256(aggregateIdTokenSeeds.join(String.fromCharCode(29))).slice(2);
    aggregateVerifierParams.verifier_id = verifierId;
    return this.getTorusKey(verifier, verifierId, aggregateVerifierParams, aggregateIdToken, extraVerifierParams, useTSS);
  }

  getPostboxKeyFrom1OutOf1(privKey: string, nonce: string): string {
    return this.torus.getPostboxKeyFrom1OutOf1(privKey, nonce);
  }

  async getRedirectResult({ replaceUrl = true, clearLoginDetails = true, useTSS = false }: RedirectResultParams = {}): Promise<RedirectResult> {
    await this.init({ skipInit: true });
    const url = new URL(window.location.href);
    const hash = url.hash.substring(1);
    const queryParams = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    if (replaceUrl) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(null, "", cleanUrl);
    }

    if (!hash && Object.keys(queryParams).length === 0) {
      throw new Error("Unable to fetch result from OAuth login");
    }

    const { error, instanceParameters, hashParameters } = handleRedirectParameters(hash, queryParams);

    const { instanceId } = instanceParameters;

    log.info(instanceId, "instanceId");

    const { args, method, ...rest } = await this.storageHelper.retrieveLoginDetails(instanceId);
    log.info(args, method);

    if (clearLoginDetails) {
      this.storageHelper.clearLoginDetailsStorage(instanceId);
    }

    if (error) {
      return { error, state: instanceParameters || {}, method, result: {}, hashParameters, args };
    }

    let result: unknown;

    try {
      if (method === TORUS_METHOD.TRIGGER_LOGIN) {
        const methodArgs = args as SubVerifierDetails & { registerOnly?: boolean; useTSS?: boolean };
        methodArgs.hash = hash;
        methodArgs.queryParameters = queryParams;
        methodArgs.useTSS = useTSS;
        result = await this.triggerLogin(methodArgs);
      } else if (method === TORUS_METHOD.TRIGGER_AGGREGATE_LOGIN) {
        const methodArgs = args as AggregateLoginParams & { useTSS?: boolean };
        methodArgs.subVerifierDetailsArray.forEach((x) => {
          x.hash = hash;
          x.queryParameters = queryParams;
        });
        methodArgs.useTSS = useTSS;
        result = await this.triggerAggregateLogin(methodArgs);
      } else if (method === TORUS_METHOD.TRIGGER_AGGREGATE_HYBRID_LOGIN) {
        const methodArgs = args as HybridAggregateLoginParams & { useTSS?: boolean };
        methodArgs.singleLogin.hash = hash;
        methodArgs.singleLogin.queryParameters = queryParams;
        methodArgs.useTSS = useTSS;
        result = await this.triggerHybridAggregateLogin(methodArgs);
      }
    } catch (err) {
      log.error(err);
      return {
        error: `Could not get result from torus nodes \n ${err?.message || ""}`,
        state: instanceParameters || {},
        method,
        result: {},
        hashParameters,
        args,
        ...rest,
      };
    }

    if (!result)
      return {
        error: "Unsupported method type",
        state: instanceParameters || {},
        method,
        result: {},
        hashParameters,
        args,
        ...rest,
      };

    return { method, result, state: instanceParameters || {}, hashParameters, args, ...rest };
  }

  private async handlePrefetchRedirectUri(): Promise<void> {
    if (!document) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const redirectHtml = document.createElement("link");
      redirectHtml.href = this.config.redirect_uri;
      if (window.location.origin !== new URL(this.config.redirect_uri).origin) redirectHtml.crossOrigin = "anonymous";
      redirectHtml.type = "text/html";
      redirectHtml.rel = "prefetch";
      const resolveFn = () => {
        this.isInitialized = true;
        resolve();
      };
      try {
        if (redirectHtml.relList && redirectHtml.relList.supports) {
          if (redirectHtml.relList.supports("prefetch")) {
            redirectHtml.onload = resolveFn;
            redirectHtml.onerror = () => {
              reject(new Error(`Please serve redirect.html present in serviceworker folder of this package on ${this.config.redirect_uri}`));
            };
            document.head.appendChild(redirectHtml);
          } else {
            // Link prefetch is not supported. pass through
            resolveFn();
          }
        } else {
          // Link prefetch is not detectable. pass through
          resolveFn();
        }
      } catch (err) {
        resolveFn();
      }
    });
  }
}

export default CustomAuth;
