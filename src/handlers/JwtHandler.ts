import deepmerge from "deepmerge";
import jwtDecode from "jwt-decode";

import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0ClientOptions, TorusVerifierResponse } from "./interfaces";

export default class JwtHandler extends AbstractLoginHandler {
  constructor(
    readonly clientId: string,
    readonly verifier: string,
    readonly redirect_uri: string,
    readonly redirectToOpener?: boolean,
    readonly jwtParams?: Auth0ClientOptions
  ) {
    super(clientId, verifier, redirect_uri, redirectToOpener);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL(this.redirect_uri);
    const jwtParams = deepmerge({ client_id: this.clientId, prompt: "login", redirect_uri: this.redirect_uri }, this.jwtParams);
    finalUrl.searchParams.append("auth0Login", window.btoa(JSON.stringify({ appState: this.state })));
    finalUrl.searchParams.append("auth0Params", window.btoa(JSON.stringify(jwtParams)));
    this.finalURL = finalUrl;
  }

  async getUserInfo(accessToken: string): Promise<TorusVerifierResponse> {
    const decodedToken: { name: string; email: string; picture: string } = jwtDecode(accessToken);
    const { name, email, picture } = decodedToken;
    return {
      profileImage: picture,
      name,
      email,
      verifierId: email.toLowerCase(),
      verifier: this.verifier,
    };
  }
}
