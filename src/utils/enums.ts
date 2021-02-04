export const TORUS_NETWORK = {
  TESTNET: "testnet",
  MAINNET: "mainnet",
} as const;

export const ETHEREUM_NETWORK = {
  ROPSTEN: "ropsten",
  MAINNET: "mainnet",
} as const;

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
};

export const TORUS_METHOD = {
  TRIGGER_LOGIN: "triggerLogin",
  TRIGGER_AGGREGATE_LOGIN: "triggerAggregateLogin",
  TRIGGER_AGGREGATE_HYBRID_LOGIN: "triggerHybridAggregateLogin",
} as const;

export type TORUS_NETWORK_TYPE = typeof TORUS_NETWORK[keyof typeof TORUS_NETWORK];
export type LOGIN_TYPE = typeof LOGIN[keyof typeof LOGIN];
export type AGGREGATE_VERIFIER_TYPE = typeof AGGREGATE_VERIFIER[keyof typeof AGGREGATE_VERIFIER];
export type UX_MODE_TYPE = typeof UX_MODE[keyof typeof UX_MODE];
export type TORUS_METHOD_TYPE = typeof TORUS_METHOD[keyof typeof TORUS_METHOD];
export type REDIRECT_PARAMS_STORAGE_METHOD_TYPE = typeof REDIRECT_PARAMS_STORAGE_METHOD[keyof typeof REDIRECT_PARAMS_STORAGE_METHOD];

export const CONTRACT_MAP = {
  [TORUS_NETWORK.MAINNET]: "0x638646503746d5456209e33a2ff5e3226d698bea",
  [TORUS_NETWORK.TESTNET]: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183",
};
