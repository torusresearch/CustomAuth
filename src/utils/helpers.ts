import DiscordHandler from "../handlers/DiscordHandler";
import FacebookHandler from "../handlers/FacebookHandler";
import GoogleHandler from "../handlers/GoogleHandler";
import { ILoginHandler } from "../handlers/interfaces";
import RedditHandler from "../handlers/RedditHandler";
import TwitchHandler from "../handlers/TwitchHandler";
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

export const createHandler = (
  typeofLogin: string,
  clientId: string,
  verifier: string,
  redirect_uri: string,
  redirectToOpener?: boolean
): ILoginHandler => {
  if (typeofLogin === LOGIN_TYPE.GOOGLE) return new GoogleHandler(clientId, verifier, redirect_uri, redirectToOpener);
  if (typeofLogin === LOGIN_TYPE.FACEBOOK) return new FacebookHandler(clientId, verifier, redirect_uri, redirectToOpener);
  if (typeofLogin === LOGIN_TYPE.TWITCH) return new TwitchHandler(clientId, verifier, redirect_uri, redirectToOpener);
  if (typeofLogin === LOGIN_TYPE.REDDIT) return new RedditHandler(clientId, verifier, redirect_uri, redirectToOpener);
  if (typeofLogin === LOGIN_TYPE.DISCORD) return new DiscordHandler(clientId, verifier, redirect_uri, redirectToOpener);
  throw new Error("Invalid login type");
};
