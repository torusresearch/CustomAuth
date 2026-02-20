import { type INodeDetails, TORUS_NETWORK_TYPE } from "@toruslabs/constants";
import { NodeDetailManager } from "@toruslabs/fetch-node-details";
import { utf8ToBytes } from "@toruslabs/metadata-helpers";
import { SessionManager } from "@toruslabs/session-manager";
import { keccak256, type KeyType, Torus, TorusKey } from "@toruslabs/torus.js";

import { createHandler } from "./handlers/HandlerFactory";
import { registerServiceWorker } from "./registerServiceWorker";
import SentryHandler from "./sentry";
import { SENTRY_TXNS, UX_MODE, UX_MODE_TYPE } from "./utils/enums";
import { serializeError } from "./utils/error";
import { handleRedirectParameters, isFirefox, padUrlString } from "./utils/helpers";
import {
  CustomAuthArgs,
  CustomAuthLoginParams,
  ExtraParams,
  ILoginHandler,
  InitParams,
  LoginDetails,
  LoginWindowResponse,
  RedirectResult,
  RedirectResultParams,
  TorusLoginResponse,
  VerifierParams,
} from "./utils/interfaces";
import log from "./utils/loglevel";

export class CustomAuth {
  isInitialized: boolean;

  config: {
    baseUrl: string;
    redirectToOpener: boolean;
    redirect_uri: string;
    uxMode: UX_MODE_TYPE;
    locationReplaceOnRedirect: boolean;
    popupFeatures: string;
    useDkg?: boolean;
    web3AuthClientId: string;
    web3AuthNetwork: TORUS_NETWORK_TYPE;
    keyType: KeyType;
    nodeDetails: INodeDetails;
    checkCommitment: boolean;
  };

  torus: Torus;

  nodeDetailManager: NodeDetailManager;

  sentryHandler: SentryHandler;

  private sessionManager: SessionManager<LoginDetails>;

  constructor({
    baseUrl,
    network,
    enableLogging = false,
    redirectToOpener = false,
    redirectPathName = "redirect",
    apiKey = "torus-default",
    uxMode = UX_MODE.POPUP,
    locationReplaceOnRedirect = false,
    popupFeatures,
    storageServerUrl = "https://session.web3auth.io",
    sentry,
    enableOneKey = false,
    web3AuthClientId,
    useDkg,
    metadataUrl = "https://metadata.tor.us",
    keyType = "secp256k1",
    serverTimeOffset = 0,
    nodeDetails,
    checkCommitment = true,
  }: CustomAuthArgs) {
    if (!web3AuthClientId) throw new Error("Please provide a valid web3AuthClientId in constructor");
    if (!network) throw new Error("Please provide a valid network in constructor");
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
      useDkg,
      web3AuthClientId,
      web3AuthNetwork: network,
      keyType,
      nodeDetails,
      checkCommitment,
    };
    const torus = new Torus({
      network,
      enableOneKey,
      serverTimeOffset,
      clientId: web3AuthClientId,
      legacyMetadataHost: metadataUrl,
      keyType,
    });
    Torus.setAPIKey(apiKey);
    this.torus = torus;
    this.nodeDetailManager = new NodeDetailManager({ network });
    if (enableLogging) log.enableAll();
    else log.disableAll();
    this.sessionManager = new SessionManager<LoginDetails>({
      sessionServerBaseUrl: storageServerUrl,
      allowedOrigin: true,
      useLocalStorage: true,
    });
    this.sentryHandler = new SentryHandler(sentry);
  }

  async init({ skipSw = false, skipInit = false, skipPrefetch = false }: InitParams = {}): Promise<void> {
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

  async triggerLogin(args: CustomAuthLoginParams): Promise<TorusLoginResponse> {
    const { authConnectionId, authConnection, clientId, jwtParams, hash, queryParameters, customState, groupedAuthConnectionId } = args;
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    const loginHandler: ILoginHandler = createHandler({
      authConnection,
      clientId,
      authConnectionId,
      groupedAuthConnectionId,
      redirect_uri: this.config.redirect_uri,
      redirectToOpener: this.config.redirectToOpener,
      jwtParams,
      uxMode: this.config.uxMode,
      customState,
      web3AuthClientId: this.config.web3AuthClientId,
      web3AuthNetwork: this.config.web3AuthNetwork,
    });

    let loginParams: LoginWindowResponse;
    if (hash && queryParameters) {
      const { error, hashParameters, instanceParameters } = handleRedirectParameters(hash, queryParameters);
      if (error) throw new Error(error);
      const { access_token: accessToken, id_token: idToken, tgAuthResult, ...rest } = hashParameters;
      // State has to be last here otherwise it will be overwritten
      loginParams = { accessToken, idToken: idToken || tgAuthResult || "", ...rest, state: instanceParameters };
    } else {
      this.sessionManager.clearOrphanedData();
      if (this.config.uxMode === UX_MODE.REDIRECT) {
        this.sessionManager.sessionId = this.getSessionId(`torus_login_${loginHandler.nonce}`);
        await this.sessionManager.createSession({ args });
      }
      loginParams = await loginHandler.handleLoginWindow({
        locationReplaceOnRedirect: this.config.locationReplaceOnRedirect,
        popupFeatures: this.config.popupFeatures,
      });
      if (this.config.uxMode === UX_MODE.REDIRECT) return null;
    }

    const userInfo = await loginHandler.getUserInfo(loginParams);

    const torusKey = await this.getTorusKey({
      authConnectionId,
      userId: userInfo.userId,
      idToken: loginParams.idToken || loginParams.accessToken,
      additionalParams: userInfo.extraConnectionParams,
      groupedAuthConnectionId,
    });

    return {
      ...torusKey,
      userInfo: {
        ...userInfo,
        ...loginParams,
      },
    };
  }

  async getTorusKey(params: {
    authConnectionId: string;
    userId: string;
    idToken: string;
    additionalParams?: ExtraParams;
    groupedAuthConnectionId?: string;
  }): Promise<TorusKey> {
    const { authConnectionId, userId, idToken, additionalParams, groupedAuthConnectionId } = params;
    const verifier = groupedAuthConnectionId || authConnectionId;
    const verifierId = userId;
    const verifierParams: VerifierParams = { verifier_id: userId };
    let aggregateIdToken = "";
    const finalIdToken = idToken;

    if (groupedAuthConnectionId) {
      verifierParams["verify_params"] = [{ verifier_id: userId, idtoken: finalIdToken }];
      verifierParams["sub_verifier_ids"] = [authConnectionId];
      aggregateIdToken = keccak256(utf8ToBytes(finalIdToken)).slice(2);
    }

    const nodeDetails = await this.sentryHandler.startSpan(
      {
        name: SENTRY_TXNS.FETCH_NODE_DETAILS,
      },
      async () => {
        if (this.config.nodeDetails) {
          return this.config.nodeDetails;
        }
        return this.nodeDetailManager.getNodeDetails({ verifier, verifierId });
      }
    );

    log.debug("torus-direct/getTorusKey", { torusNodeEndpoints: nodeDetails.torusNodeEndpoints });

    const sharesResponse = await this.sentryHandler.startSpan(
      {
        name: SENTRY_TXNS.FETCH_SHARES,
      },
      async () => {
        return this.torus.retrieveShares({
          endpoints: nodeDetails.torusNodeEndpoints,
          indexes: nodeDetails.torusIndexes,
          verifier,
          verifierParams,
          idToken: aggregateIdToken || finalIdToken,
          nodePubkeys: nodeDetails.torusNodePub,
          extraParams: {
            ...additionalParams,
          },
          useDkg: this.config.useDkg,
          checkCommitment: this.config.checkCommitment,
        });
      }
    );

    log.debug("torus-direct/getTorusKey", { retrieveShares: sharesResponse });
    return sharesResponse;
  }

  async getRedirectResult({
    replaceUrl = true,
    clearLoginDetails = true,
    storageData = undefined,
  }: RedirectResultParams = {}): Promise<RedirectResult> {
    await this.init({ skipInit: true });
    const url = new URL(window.location.href);
    const hash = url.hash.substring(1);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value: string, key: string) => {
      queryParams[key] = value;
    });

    if (!hash && Object.keys(queryParams).length === 0) {
      throw new Error("Found Empty hash and query parameters. This can happen if user reloads the page");
    }

    const { error, instanceParameters, hashParameters } = handleRedirectParameters(hash, queryParams);

    const { instanceId } = instanceParameters;

    log.info(instanceId, "instanceId");

    let loginDetails = storageData;
    if (!loginDetails) {
      try {
        this.sessionManager.sessionId = this.getSessionId(`torus_login_${instanceId}`);
        loginDetails = await this.sessionManager.authorizeSession();
      } catch (error) {
        log.error(error, "Unable to read login details from session manager");
        throw error;
      }
    }
    const { args, ...rest } = loginDetails || {};
    const storageMethodUsed = "localStorage + server";
    log.info(args, "args", storageMethodUsed);

    let result: TorusLoginResponse;

    if (error) {
      return { error, state: instanceParameters || {}, result: {}, hashParameters, args };
    }

    try {
      args.hash = hash;
      args.queryParameters = queryParams;
      result = await this.triggerLogin(args);
    } catch (err: unknown) {
      const serializedError = await serializeError(err);
      log.error(serializedError);
      if (clearLoginDetails) {
        this.sessionManager.sessionId = this.getSessionId(`torus_login_${instanceId}`);
        this.sessionManager.clearStorage();
      }
      return {
        error: `${serializedError.message || ""}`,
        state: instanceParameters || {},
        result: {},
        hashParameters,
        args,
        ...rest,
      };
    }

    if (!result)
      return {
        error: `Init parameters not found. It might be because storage is not available. Please retry the login in a different browser. Used storage method: ${storageMethodUsed}`,
        state: instanceParameters || {},
        result: {},
        hashParameters,
        args,
        ...rest,
      };

    if (replaceUrl) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: cleanUrl, url: cleanUrl }, "", cleanUrl);
    }

    if (clearLoginDetails) {
      this.sessionManager.clearStorage();
    }

    return { result, state: instanceParameters || {}, hashParameters, args, ...rest };
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
      } catch {
        resolveFn();
      }
    });
  }

  private getSessionId(key: string): string {
    // SessionManager expects a hex private key as sessionId; hashing the legacy string key keeps compatibility
    return keccak256(utf8ToBytes(key)).slice(2);
  }
}
