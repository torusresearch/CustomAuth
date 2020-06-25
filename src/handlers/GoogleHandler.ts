import { LOGIN_TYPE } from "../utils/enums";
import { get } from "../utils/httpHelpers";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { LoginWindowResponse, TorusVerifierResponse } from "./interfaces";

export default class GoogleHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token id_token";

  private readonly SCOPE: string = "profile email openid";

  private readonly PROMPT: string = "consent select_account";

  constructor(
    readonly clientId: string,
    readonly verifier: string,
    readonly redirect_uri: string,
    readonly typeOfLogin: LOGIN_TYPE,
    readonly redirectToOpener?: boolean
  ) {
    super(clientId, verifier, redirect_uri, typeOfLogin, redirectToOpener);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    finalUrl.searchParams.append("response_type", this.RESPONSE_TYPE);
    finalUrl.searchParams.append("client_id", this.clientId);
    finalUrl.searchParams.append("state", this.state);
    finalUrl.searchParams.append("scope", this.SCOPE);
    finalUrl.searchParams.append("redirect_uri", this.redirect_uri);
    finalUrl.searchParams.append("nonce", this.nonce);
    finalUrl.searchParams.append("prompt", this.PROMPT);
    this.finalURL = finalUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { accessToken } = params;
    const userInfo = await get<{ picture: string; email: string; name: string }>("https://www.googleapis.com/userinfo/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { picture: profileImage = "", email = "", name = "" } = userInfo;
    return {
      email,
      name,
      profileImage,
      verifier: this.verifier,
      verifierId: email.toLowerCase(),
      typeOfLogin: this.typeOfLogin,
    };
  }
}
