import { LOGIN } from "../utils/enums";
import DiscordHandler from "./DiscordHandler";
import FacebookHandler from "./FacebookHandler";
import GoogleHandler from "./GoogleHandler";
import { CreateHandlerParams, ILoginHandler } from "./interfaces";
import JwtHandler from "./JwtHandler";
import MockLoginHandler from "./MockLoginHandler";
import PasskeysHandler from "./PasskeysHandler";
import PasswordlessHandler from "./PasswordlessHandler";
import RedditHandler from "./RedditHandler";
import TwitchHandler from "./TwitchHandler";

const createHandler = ({
  clientId,
  redirect_uri,
  typeOfLogin,
  verifier,
  jwtParams,
  redirectToOpener,
  uxMode,
  customState,
}: CreateHandlerParams): ILoginHandler => {
  if (!verifier || !typeOfLogin || !clientId) {
    throw new Error("Invalid params. Missing verifier, typeOfLogin or clientId");
  }
  const { domain, login_hint, id_token, access_token } = jwtParams || {};
  switch (typeOfLogin) {
    case LOGIN.GOOGLE:
      return new GoogleHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    case LOGIN.FACEBOOK:
      return new FacebookHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    case LOGIN.TWITCH:
      return new TwitchHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    case LOGIN.REDDIT:
      return new RedditHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    case LOGIN.DISCORD:
      return new DiscordHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    case LOGIN.PASSWORDLESS:
      if (!domain || !login_hint) throw new Error("Invalid params. Missing domain or login_hint for passwordless login");
      return new PasswordlessHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    case LOGIN.APPLE:
    case LOGIN.GITHUB:
    case LOGIN.LINKEDIN:
    case LOGIN.TWITTER:
    case LOGIN.WEIBO:
    case LOGIN.LINE:
    case LOGIN.EMAIL_PASSWORD:
    case LOGIN.JWT:
      if (id_token || access_token) {
        return new MockLoginHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
      }
      if (!domain) throw new Error("Invalid params for jwt login. Missing domain");
      return new JwtHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    case LOGIN.PASSKEYS:
      return new PasskeysHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    default:
      throw new Error("Unsupported login type");
  }
};

export default createHandler;
