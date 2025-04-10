import base64url from "base64url";
import Bowser from "bowser";

import { AUTH_CONNECTION, AUTH_CONNECTION_TYPE, REDIRECT_PARAMS_STORAGE_METHOD_TYPE } from "./enums";
import { Auth0UserInfo, TorusGenericObject } from "./interfaces";
import log from "./loglevel";
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

// These are the default connection names used by auth0
export const loginToConnectionMap: Record<string, string> = {
  [AUTH_CONNECTION.APPLE]: "apple",
  [AUTH_CONNECTION.GITHUB]: "github",
  [AUTH_CONNECTION.LINKEDIN]: "linkedin",
  [AUTH_CONNECTION.TWITTER]: "twitter",
  [AUTH_CONNECTION.LINE]: "line",
  [AUTH_CONNECTION.EMAIL_PASSWORDLESS]: "email",
  [AUTH_CONNECTION.SMS_PASSWORDLESS]: "sms",
};

export const padUrlString = (url: URL): string => (url.href.endsWith("/") ? url.href : `${url.href}/`);

/**
 * Returns a random number. Don't use for cryptographic purposes.
 * @returns a random number
 */
export const randomId = (): string => Math.random().toString(36).slice(2);

export const broadcastChannelOptions = {
  // type: 'localstorage', // (optional) enforce a type, oneOf['native', 'idb', 'localstorage', 'node']
  webWorkerSupport: false, // (optional) set this to false if you know that your channel will never be used in a WebWorker (increases performance)
};

function caseSensitiveField(field: string, isCaseSensitive?: boolean): string {
  return isCaseSensitive ? field : field.toLowerCase();
}

export const getUserId = (
  userInfo: Auth0UserInfo,
  authConnection: AUTH_CONNECTION_TYPE,
  userIdField?: string,
  isUserIdCaseSensitive = true
): string => {
  const { name, sub } = userInfo;
  if (userIdField) return caseSensitiveField(userInfo[userIdField as keyof Auth0UserInfo], isUserIdCaseSensitive);
  switch (authConnection) {
    case AUTH_CONNECTION.EMAIL_PASSWORDLESS:
    case AUTH_CONNECTION.SMS_PASSWORDLESS:
    case AUTH_CONNECTION.AUTHENTICATOR:
      return caseSensitiveField(name, isUserIdCaseSensitive);
    case AUTH_CONNECTION.GITHUB:
    case AUTH_CONNECTION.TWITTER:
    case AUTH_CONNECTION.APPLE:
    case AUTH_CONNECTION.LINKEDIN:
    case AUTH_CONNECTION.LINE:
    case AUTH_CONNECTION.WECHAT:
    case AUTH_CONNECTION.KAKAO:
    case AUTH_CONNECTION.FARCASTER:
    case AUTH_CONNECTION.CUSTOM:
      return caseSensitiveField(sub, isUserIdCaseSensitive);
    default:
      throw new Error("Invalid login type to get auth connection id");
  }
};

export const handleRedirectParameters = (
  hash: string,
  queryParameters: TorusGenericObject
): { error: string; instanceParameters: TorusGenericObject; hashParameters: TorusGenericObject } => {
  const hashParameters: TorusGenericObject = hash.split("&").reduce((result: Record<string, string>, item) => {
    const [part0, part1] = item.split("=");
    result[part0] = part1;
    return result;
  }, {});
  log.info(hashParameters, queryParameters);
  let instanceParameters: TorusGenericObject = {};
  let error = "";
  if (Object.keys(hashParameters).length > 0 && hashParameters.state) {
    instanceParameters = JSON.parse(base64url.decode(decodeURIComponent(decodeURIComponent(hashParameters.state)))) || {};
    error = hashParameters.error_description || hashParameters.error || error;
  } else if (Object.keys(queryParameters).length > 0 && queryParameters.state) {
    instanceParameters = JSON.parse(base64url.decode(decodeURIComponent(decodeURIComponent(queryParameters.state)))) || {};
    if (queryParameters.error) error = queryParameters.error;
  }
  return { error, instanceParameters, hashParameters };
};

export function storageAvailable(type: REDIRECT_PARAMS_STORAGE_METHOD_TYPE): boolean {
  let storage: Storage;
  try {
    storage = window[type as "sessionStorage" | "localStorage"];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (error: unknown) {
    const e = error as { code?: number; name?: string };
    return (
      e &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

export function getPopupFeatures(): string {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const w = 1200;
  const h = 700;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : window.screen.width;

  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : window.screen.height;

  const systemZoom = 1; // No reliable estimate

  const left = Math.abs((width - w) / 2 / systemZoom + dualScreenLeft);
  const top = Math.abs((height - h) / 2 / systemZoom + dualScreenTop);
  const features = `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=${h / systemZoom},width=${w / systemZoom},top=${top},left=${left}`;
  return features;
}

export const isFirefox = (): boolean => window?.navigator?.userAgent.toLowerCase().indexOf("firefox") > -1 || false;

export function constructURL(params: { baseURL: string; query?: Record<string, unknown>; hash?: Record<string, unknown> }): string {
  const { baseURL, query, hash } = params;

  const url = new URL(baseURL);
  if (query) {
    Object.keys(query).forEach((key) => {
      url.searchParams.append(key, query[key] as string);
    });
  }
  if (hash) {
    const h = new URL(constructURL({ baseURL, query: hash })).searchParams.toString();
    url.hash = h;
  }
  return url.toString();
}

// export function are3PCSupported(): boolean {
//   const browserInfo = Bowser.parse(navigator.userAgent);
//   log.info(JSON.stringify(browserInfo), "current browser info");

//   let thirdPartyCookieSupport = true;
//   // brave
//   if ((navigator as unknown as { brave: boolean })?.brave) {
//     thirdPartyCookieSupport = false;
//   }
//   // All webkit & gecko engine instances use itp (intelligent tracking prevention -
//   // https://webkit.org/tracking-prevention/#intelligent-tracking-prevention-itp)
//   if (browserInfo.engine.name === Bowser.ENGINE_MAP.WebKit || browserInfo.engine.name === Bowser.ENGINE_MAP.Gecko) {
//     thirdPartyCookieSupport = false;
//   }

//   return thirdPartyCookieSupport;
// }

export const validateAndConstructUrl = (domain: string): URL => {
  try {
    const url = new URL(decodeURIComponent(domain));
    return url;
  } catch (error: unknown) {
    throw new Error(`${(error as Error)?.message || ""}, Note: Your jwt domain: (i.e ${domain}) must have http:// or https:// prefix`);
  }
};

export const objectToAuthDataMap = (tgAuthenticationResult: string) => {
  return JSON.parse(base64url.decode(tgAuthenticationResult)) as {
    first_name: string;
    last_name: string;
    photo_url: string;
    username: string;
    id: number;
  };
};

export function isMobileOrTablet(): boolean {
  const browser = Bowser.getParser(navigator.userAgent);
  const platform = browser.getPlatform();
  return platform.type === Bowser.PLATFORMS_MAP.tablet || platform.type === Bowser.PLATFORMS_MAP.mobile;
}

export function getTimeout(authConnection: AUTH_CONNECTION_TYPE) {
  if ((authConnection === AUTH_CONNECTION.FACEBOOK || authConnection === AUTH_CONNECTION.LINE) && isMobileOrTablet()) {
    return 1000 * 30; // 30 seconds to finish the login
  }
  return 1000 * 1; // 1 second
}

export function decodeToken<T>(token: string): { header: { alg: string; typ: string; kid?: string }; payload: T } {
  const [header, payload] = token.split(".");
  return {
    header: JSON.parse(base64url.decode(header)),
    payload: JSON.parse(base64url.decode(payload)) as T,
  };
}
