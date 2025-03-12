import { LOGIN } from "../utils/enums";
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

const createHandler = (params: CreateHandlerParams): ILoginHandler => {
  const { verifier, typeOfLogin, clientId, jwtParams } = params;
  if (!verifier || !typeOfLogin || !clientId) {
    throw new Error("Invalid params. Missing verifier, typeOfLogin or clientId");
  }
  const { domain, login_hint, id_token, access_token } = jwtParams || {};
  switch (typeOfLogin) {
    case LOGIN.GOOGLE:
      return new GoogleHandler(params);
    case LOGIN.TELEGRAM:
      return new TelegramHandler(params);
    case LOGIN.FACEBOOK:
      return new FacebookHandler(params);
    case LOGIN.TWITCH:
      return new TwitchHandler(params);
    case LOGIN.DISCORD:
      return new DiscordHandler(params);
    case LOGIN.EMAIL_PASSWORDLESS:
    case LOGIN.SMS_PASSWORDLESS:
      if (!login_hint) throw new Error("Invalid params. Missing login_hint for web3auth passwordless login");
      return new Web3AuthPasswordlessHandler(params);
    case LOGIN.APPLE:
    case LOGIN.GITHUB:
    case LOGIN.LINKEDIN:
    case LOGIN.TWITTER:
    case LOGIN.WEIBO:
    case LOGIN.LINE:
    case LOGIN.JWT:
    case LOGIN.REDDIT:
      if (id_token || access_token) {
        return new MockLoginHandler(params);
      }
      if (!domain) throw new Error("Invalid params for jwt login. Missing domain");
      return new JwtHandler(params);
    case LOGIN.PASSKEYS:
      return new PasskeysHandler(params);
    default:
      throw new Error("Unsupported login type");
  }
};

export default createHandler;
