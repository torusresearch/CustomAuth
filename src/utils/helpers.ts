import { Auth0UserInfo } from "../handlers/interfaces";
import { LOGIN_TYPE } from "./enums";

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
  [LOGIN_TYPE.GITHUB]: "github",
  [LOGIN_TYPE.LINKEDIN]: "linkedin",
  [LOGIN_TYPE.TWITTER]: "twitter",
  [LOGIN_TYPE.WEIBO]: "weibo",
  [LOGIN_TYPE.LINE]: "line",
  [LOGIN_TYPE.EMAIL_PASSWORD]: "Username-Password-Authentication",
  [LOGIN_TYPE.PASSWORDLESS]: "email",
};

export const padUrlString = (url: URL): string => {
  return url.href.endsWith("/") ? url.href : `${url.href}/`;
};

export const broadcastChannelOptions = {
  // type: 'localstorage', // (optional) enforce a type, oneOf['native', 'idb', 'localstorage', 'node']
  webWorkerSupport: false, // (optional) set this to false if you know that your channel will never be used in a WebWorker (increases performance)
};

export const getVerifierId = (userInfo: Auth0UserInfo, typeOfLogin: LOGIN_TYPE): string => {
  const { name, nickname, sub } = userInfo;
  switch (typeOfLogin) {
    case LOGIN_TYPE.GITHUB:
    case LOGIN_TYPE.TWITTER:
      return nickname;
    case LOGIN_TYPE.WEIBO:
    case LOGIN_TYPE.PASSWORDLESS:
    case LOGIN_TYPE.EMAIL_PASSWORD:
      return name;
    case LOGIN_TYPE.LINKEDIN:
    case LOGIN_TYPE.LINE:
    case LOGIN_TYPE.JWT:
      return sub;
    default:
      throw new Error("Invalid login type");
  }
};
