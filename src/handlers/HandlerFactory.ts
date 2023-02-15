import { LOGIN } from "../utils/enums";
import DiscordHandler from "./DiscordHandler";
import FacebookHandler from "./FacebookHandler";
import GoogleHandler from "./GoogleHandler";
import { CreateHandlerParams, ILoginHandler } from "./interfaces";
import JwtHandler from "./JwtHandler";
import MockLoginHandler from "./MockLoginHandler";
import PasswordlessHandler from "./PasswordlessHandler";
import RedditHandler from "./RedditHandler";
import TwitchHandler from "./TwitchHandler";
import WebAuthnHandler from "./WebAuthnHandler";

const createHandler = ({
  clientId,
  redirect_uri,
  typeOfLogin,
  verifier,
  jwtParams,
  redirectToOpener,
  uxMode,
  customState,
  registerOnly,
}: CreateHandlerParams): ILoginHandler => {
  if (!verifier || !typeOfLogin || !clientId) {
    throw new Error("Invalid params");
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
      if (!domain || !login_hint) throw new Error("Invalid params");
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
      if (!domain) throw new Error("Invalid params");
      return new JwtHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    case LOGIN.WEBAUTHN:
      return new WebAuthnHandler(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState, registerOnly);
    default:
      throw new Error("Invalid login type");
  }
};

export default createHandler;
