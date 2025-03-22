import { AUTH_CONNECTION } from "../utils/enums";
import { CreateHandlerParams, ILoginHandler } from "../utils/interfaces";
import DiscordHandler from "./DiscordHandler";
import FacebookHandler from "./FacebookHandler";
import GoogleHandler from "./GoogleHandler";
import JwtHandler from "./JwtHandler";
import MockLoginHandler from "./MockLoginHandler";
import PasskeysHandler from "./PasskeysHandler";
import TelegramHandler from "./TelegramHandler";
import TwitchHandler from "./TwitchHandler";
import Web3AuthPasswordlessHandler from "./Web3AuthPasswordlessHandler";

export const createHandler = (params: CreateHandlerParams): ILoginHandler => {
  const { authConnectionId, authConnection, clientId, jwtParams } = params;
  if (!authConnectionId || !authConnection || !clientId) {
    throw new Error("Invalid params. Missing authConnectionId, authConnection or clientId");
  }
  const { domain, login_hint, id_token, access_token } = jwtParams || {};
  switch (authConnection) {
    case AUTH_CONNECTION.GOOGLE:
      return new GoogleHandler(params);
    case AUTH_CONNECTION.TELEGRAM:
      return new TelegramHandler(params);
    case AUTH_CONNECTION.FACEBOOK:
      return new FacebookHandler(params);
    case AUTH_CONNECTION.TWITCH:
      return new TwitchHandler(params);
    case AUTH_CONNECTION.DISCORD:
      return new DiscordHandler(params);
    case AUTH_CONNECTION.EMAIL_PASSWORDLESS:
    case AUTH_CONNECTION.SMS_PASSWORDLESS:
      if (!login_hint) throw new Error("Invalid params. Missing login_hint for web3auth passwordless login");
      return new Web3AuthPasswordlessHandler(params);
    case AUTH_CONNECTION.APPLE:
    case AUTH_CONNECTION.GITHUB:
    case AUTH_CONNECTION.LINKEDIN:
    case AUTH_CONNECTION.TWITTER:
    case AUTH_CONNECTION.WEIBO:
    case AUTH_CONNECTION.LINE:
    case AUTH_CONNECTION.CUSTOM:
    case AUTH_CONNECTION.REDDIT:
    case AUTH_CONNECTION.WECHAT:
    case AUTH_CONNECTION.KAKAO:
    case AUTH_CONNECTION.FARCASTER:
    case AUTH_CONNECTION.AUTHENTICATOR:
      if (id_token || access_token) {
        return new MockLoginHandler(params);
      }
      if (!domain) throw new Error("Invalid params for jwt login. Missing domain");
      return new JwtHandler(params);
    case AUTH_CONNECTION.PASSKEYS:
      return new PasskeysHandler(params);
    default:
      throw new Error("Unsupported login type");
  }
};
