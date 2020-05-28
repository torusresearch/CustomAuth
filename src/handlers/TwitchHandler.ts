import { get } from "../utils/httpHelpers";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { TorusVerifierResponse } from "./interfaces";

export default class TwitchHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token";

  private readonly SCOPE: string = "user:read:email";

  constructor(readonly clientId: string, readonly verifier: string, readonly redirect_uri: string, readonly redirectToOpener?: boolean) {
    super(clientId, verifier, redirect_uri, redirectToOpener);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://id.twitch.tv/oauth2/authorize");
    finalUrl.searchParams.append("response_type", this.RESPONSE_TYPE);
    finalUrl.searchParams.append("client_id", this.clientId);
    finalUrl.searchParams.append("state", this.state);
    finalUrl.searchParams.append("scope", this.SCOPE);
    finalUrl.searchParams.append("redirect_uri", this.redirect_uri);
    finalUrl.searchParams.append("force_verify", "true");
    this.finalURL = finalUrl;
  }

  async getUserInfo(accessToken: string): Promise<TorusVerifierResponse> {
    const userInfo = await get<{ data: [{ profile_image_url: string; display_name: string; email: string; id: string }] }>(
      "https://api.twitch.tv/helix/users",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-ID": this.clientId,
        },
      }
    );
    const [{ profile_image_url: profileImage = "", display_name: name = "", email = "", id: verifierId }] = userInfo.data || [];
    return {
      profileImage,
      name,
      email,
      verifierId,
      verifier: this.verifier,
    };
  }
}
