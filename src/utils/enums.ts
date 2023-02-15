import NodeDetailManager, { TORUS_NETWORK } from "@toruslabs/fetch-node-details";

export const LOGIN = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
  REDDIT: "reddit",
  DISCORD: "discord",
  TWITCH: "twitch",
  APPLE: "apple",
  GITHUB: "github",
  LINKEDIN: "linkedin",
  TWITTER: "twitter",
  WEIBO: "weibo",
  LINE: "line",
  EMAIL_PASSWORD: "email_password",
  PASSWORDLESS: "passwordless",
  JWT: "jwt",
  WEBAUTHN: "webauthn",
} as const;

export const AGGREGATE_VERIFIER = {
  SINGLE_VERIFIER_ID: "single_id_verifier",
  // AND_AGGREGATE_VERIFIER : "and_aggregate_verifier",
  // OR_AGGREGATE_VERIFIER : "or_aggregate_verifier",
} as const;

export const UX_MODE = {
  POPUP: "popup",
  REDIRECT: "redirect",
} as const;

export const REDIRECT_PARAMS_STORAGE_METHOD = {
  LOCAL_STORAGE: "localStorage",
  SESSION_STORAGE: "sessionStorage",
  SERVER: "server",
};

export const TORUS_METHOD = {
  TRIGGER_LOGIN: "triggerLogin",
  TRIGGER_AGGREGATE_LOGIN: "triggerAggregateLogin",
  TRIGGER_AGGREGATE_HYBRID_LOGIN: "triggerHybridAggregateLogin",
} as const;

export type LOGIN_TYPE = (typeof LOGIN)[keyof typeof LOGIN];
export type AGGREGATE_VERIFIER_TYPE = (typeof AGGREGATE_VERIFIER)[keyof typeof AGGREGATE_VERIFIER];
export type UX_MODE_TYPE = (typeof UX_MODE)[keyof typeof UX_MODE];
export type TORUS_METHOD_TYPE = (typeof TORUS_METHOD)[keyof typeof TORUS_METHOD];
export type REDIRECT_PARAMS_STORAGE_METHOD_TYPE = (typeof REDIRECT_PARAMS_STORAGE_METHOD)[keyof typeof REDIRECT_PARAMS_STORAGE_METHOD];

export const CONTRACT_MAP = {
  [TORUS_NETWORK.MAINNET]: NodeDetailManager.PROXY_ADDRESS_MAINNET,
  [TORUS_NETWORK.TESTNET]: NodeDetailManager.PROXY_ADDRESS_TESTNET,
  [TORUS_NETWORK.CYAN]: NodeDetailManager.PROXY_ADDRESS_CYAN,
  [TORUS_NETWORK.AQUA]: NodeDetailManager.PROXY_ADDRESS_AQUA,
  [TORUS_NETWORK.CELESTE]: NodeDetailManager.PROXY_ADDRESS_CELESTE,
};

export const SIGNER_MAP = {
  [TORUS_NETWORK.MAINNET]: "https://signer.tor.us",
  [TORUS_NETWORK.TESTNET]: "https://signer.tor.us",
  [TORUS_NETWORK.CYAN]: "https://signer-polygon.tor.us",
  [TORUS_NETWORK.AQUA]: "https://signer-polygon.tor.us",
  [TORUS_NETWORK.CELESTE]: "https://signer-polygon.tor.us",
};

export const SENTRY_TXNS = {
  FETCH_NODE_DETAILS: "fetchNodeDetails",
  PUB_ADDRESS_LOOKUP: "pubAddressLookup",
  FETCH_SHARES: "fetchShares",
} as const;
