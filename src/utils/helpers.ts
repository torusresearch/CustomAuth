import { Auth0UserInfo } from "../handlers/interfaces";
import { LOGIN, LOGIN_TYPE } from "./enums";

interface CustomMessageEvent extends MessageEvent {
  error: string;
}

interface EventListener {
  (evt: CustomMessageEvent): void;
}

type EmitterType = { addEventListener(type: string, handler: EventListener): void; removeEventListener(type: string, handler: EventListener): void };

export function eventToPromise<T>(emitter: EmitterType): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const handler = (ev: CustomMessageEvent) => {
      const { error = "", data } = ev;
      emitter.removeEventListener("message", handler);
      if (error) return reject(new Error(error));
      return resolve(data as T);
    };
    emitter.addEventListener("message", handler);
  });
}

// These are the connection names used by auth0
export const loginToConnectionMap = {
  [LOGIN.APPLE]: "apple",
  [LOGIN.GITHUB]: "github",
  [LOGIN.LINKEDIN]: "linkedin",
  [LOGIN.TWITTER]: "twitter",
  [LOGIN.WEIBO]: "weibo",
  [LOGIN.LINE]: "line",
  [LOGIN.EMAIL_PASSWORD]: "Username-Password-Authentication",
  [LOGIN.PASSWORDLESS]: "email",
};

export const padUrlString = (url: URL): string => {
  return url.href.endsWith("/") ? url.href : `${url.href}/`;
};

export const broadcastChannelOptions = {
  // type: 'localstorage', // (optional) enforce a type, oneOf['native', 'idb', 'localstorage', 'node']
  webWorkerSupport: false, // (optional) set this to false if you know that your channel will never be used in a WebWorker (increases performance)
};

function caseSensitiveField(field: string, isCaseSensitive?: boolean): string {
  return isCaseSensitive ? field : field.toLowerCase();
}

export const getVerifierId = (
  userInfo: Auth0UserInfo,
  typeOfLogin: LOGIN_TYPE,
  verifierIdField?: string,
  isVerifierIdCaseSensitive = true
): string => {
  const { name, sub } = userInfo;
  if (verifierIdField) return caseSensitiveField(userInfo[verifierIdField], isVerifierIdCaseSensitive);
  switch (typeOfLogin) {
    case LOGIN.PASSWORDLESS:
    case LOGIN.EMAIL_PASSWORD:
      return caseSensitiveField(name, isVerifierIdCaseSensitive);
    case LOGIN.WEIBO:
    case LOGIN.GITHUB:
    case LOGIN.TWITTER:
    case LOGIN.APPLE:
    case LOGIN.LINKEDIN:
    case LOGIN.LINE:
    case LOGIN.JWT:
      return caseSensitiveField(sub, isVerifierIdCaseSensitive);
    default:
      throw new Error("Invalid login type");
  }
};

export const sanitizeUrl = (url: URL): URL => {
  url.hash = "";
  url.search = "";
  url.password = "";
  url.username = "";

  return url;
};
