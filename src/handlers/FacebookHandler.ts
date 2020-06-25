import { LOGIN_TYPE } from "../utils/enums";
import { get } from "../utils/httpHelpers";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { LoginWindowResponse, TorusVerifierResponse } from "./interfaces";

export default class FacebookHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token";

  private readonly SCOPE: string = "public_profile email";

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
    const finalUrl = new URL("https://www.facebook.com/v6.0/dialog/oauth");
    finalUrl.searchParams.append("response_type", this.RESPONSE_TYPE);
    finalUrl.searchParams.append("client_id", this.clientId);
    finalUrl.searchParams.append("state", this.state);
    finalUrl.searchParams.append("scope", this.SCOPE);
    finalUrl.searchParams.append("redirect_uri", this.redirect_uri);
    this.finalURL = finalUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { accessToken } = params;
    const userInfo = await get<{ name: string; id: string; picture: { data: { url?: string } }; email?: string }>(
      "https://graph.facebook.com/me?fields=name,email,picture.type(large)",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const { name = "", id, picture, email = "" } = userInfo;
    return {
      email,
      name,
      profileImage: picture.data.url || "",
      verifier: this.verifier,
      verifierId: id,
      typeOfLogin: this.typeOfLogin,
    };
  }
}
