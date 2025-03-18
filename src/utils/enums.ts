export const AUTH_CONNECTION = {
  // start - byoa
  GOOGLE: "google",
  TELEGRAM: "telegram",
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
  EMAIL_PASSWORDLESS: "email_passwordless",
  SMS_PASSWORDLESS: "sms_passwordless",
  KAKAO: "kakao",
  WECHAT: "wechat",
  FARCASTER: "farcaster",
  // end - byoa
  CUSTOM: "custom",
  PASSKEYS: "passkeys",
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

export type AUTH_CONNECTION_TYPE = (typeof AUTH_CONNECTION)[keyof typeof AUTH_CONNECTION];
export type UX_MODE_TYPE = (typeof UX_MODE)[keyof typeof UX_MODE];
export type REDIRECT_PARAMS_STORAGE_METHOD_TYPE = (typeof REDIRECT_PARAMS_STORAGE_METHOD)[keyof typeof REDIRECT_PARAMS_STORAGE_METHOD];

export const SENTRY_TXNS = {
  FETCH_NODE_DETAILS: "fetchNodeDetails",
  PUB_ADDRESS_LOOKUP: "pubAddressLookup",
  FETCH_SHARES: "fetchShares",
} as const;
