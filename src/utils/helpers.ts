import { Auth0UserInfo, LoginDetails, TorusGenericObject } from "../handlers/interfaces";
import { LOGIN, LOGIN_TYPE, REDIRECT_PARAMS_STORAGE_METHOD, REDIRECT_PARAMS_STORAGE_METHOD_TYPE } from "./enums";
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

export const padUrlString = (url: URL): string => (url.href.endsWith("/") ? url.href : `${url.href}/`);

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

export const handleRedirectParameters = (
  hash: string,
  queryParameters: TorusGenericObject
): { error: string; instanceParameters: TorusGenericObject; hashParameters: TorusGenericObject } => {
  const hashParameters: TorusGenericObject = hash.split("&").reduce((result, item) => {
    const [part0, part1] = item.split("=");
    result[part0] = part1;
    return result;
  }, {});
  log.info(hashParameters, queryParameters);
  let instanceParameters: TorusGenericObject = {};
  let error = "";
  if (Object.keys(hashParameters).length > 0 && hashParameters.state) {
    instanceParameters = JSON.parse(atob(decodeURIComponent(decodeURIComponent(hashParameters.state)))) || {};
    error = hashParameters.error_description || hashParameters.error || error;
  } else if (Object.keys(queryParameters).length > 0 && queryParameters.state) {
    instanceParameters = JSON.parse(atob(decodeURIComponent(decodeURIComponent(queryParameters.state)))) || {};
    if (queryParameters.error) error = queryParameters.error;
  }
  return { error, instanceParameters, hashParameters };
};

export function storageAvailable(type: REDIRECT_PARAMS_STORAGE_METHOD_TYPE): boolean {
  let storage: Storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
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

const storageStatus = {
  [REDIRECT_PARAMS_STORAGE_METHOD.LOCAL_STORAGE]: storageAvailable(REDIRECT_PARAMS_STORAGE_METHOD.LOCAL_STORAGE),
  [REDIRECT_PARAMS_STORAGE_METHOD.SESSION_STORAGE]: storageAvailable(REDIRECT_PARAMS_STORAGE_METHOD.SESSION_STORAGE),
};

export function storeLoginDetails(params: LoginDetails, storageMethod: REDIRECT_PARAMS_STORAGE_METHOD_TYPE, scope: string): void {
  if (storageStatus[storageMethod]) {
    window[storageMethod].setItem(`torus_login_${scope}`, JSON.stringify(params));
  }
}

export function retrieveLoginDetails(storageMethod: REDIRECT_PARAMS_STORAGE_METHOD_TYPE, scope: string): LoginDetails {
  if (storageStatus[storageMethod]) {
    const loginDetails = window[storageMethod].getItem(`torus_login_${scope}`);
    return JSON.parse(loginDetails) as LoginDetails;
  }
  throw new Error("Unable to retrieve stored login details");
}

export function clearLoginDetailsStorage(storageMethod: REDIRECT_PARAMS_STORAGE_METHOD_TYPE, scope: string): void {
  if (storageStatus[storageMethod]) {
    window[storageMethod].removeItem(`torus_login_${scope}`);
  }
}
