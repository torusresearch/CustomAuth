import { Auth0UserInfo } from "../handlers/interfaces";
import { LOGIN, LOGIN_TYPE } from "./enums";
interface CustomMessageEvent extends MessageEvent {
    error: string;
}
interface EventListener {
    (evt: CustomMessageEvent): void;
}
declare type EmitterType = {
    addEventListener(type: string, handler: EventListener): void;
    removeEventListener(type: string, handler: EventListener): void;
};
export declare function eventToPromise<T>(emitter: EmitterType): Promise<T>;
export declare const loginToConnectionMap: {
    apple: string;
    github: string;
    linkedin: string;
    twitter: string;
    weibo: string;
    line: string;
    email_password: string;
    passwordless: string;
};
export declare const padUrlString: (url: URL) => string;
export declare const broadcastChannelOptions: {
    webWorkerSupport: boolean;
};
export declare const getVerifierId: (userInfo: Auth0UserInfo, typeOfLogin: LOGIN_TYPE, verifierIdField?: string, isVerifierIdCaseSensitive?: boolean) => string;
export {};
