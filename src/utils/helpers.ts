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

export const getVerifierId = (userInfo: Auth0UserInfo, typeOfLogin: LOGIN_TYPE, verifierIdField?: string): string => {
  const { name, nickname, sub } = userInfo;
  if (verifierIdField) return userInfo[verifierIdField];
  switch (typeOfLogin) {
    case LOGIN.GITHUB:
    case LOGIN.TWITTER:
      return nickname;
    case LOGIN.WEIBO:
    case LOGIN.PASSWORDLESS:
    case LOGIN.EMAIL_PASSWORD:
      return name;
    case LOGIN.APPLE:
    case LOGIN.LINKEDIN:
    case LOGIN.LINE:
    case LOGIN.JWT:
      return sub;
    default:
      throw new Error("Invalid login type");
  }
};
