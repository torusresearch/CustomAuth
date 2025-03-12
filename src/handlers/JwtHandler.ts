import { get } from "@toruslabs/http-helpers";
import deepmerge from "deepmerge";
import log from "loglevel";

import { decodeToken, getVerifierId, loginToConnectionMap, padUrlString, validateAndConstructUrl } from "../utils/helpers";
import { AUTH0_CONNECTION_TYPE, Auth0UserInfo, CreateHandlerParams, LoginWindowResponse, TorusVerifierResponse } from "../utils/interfaces";
import AbstractLoginHandler from "./AbstractLoginHandler";

export default class JwtHandler extends AbstractLoginHandler {
  private readonly SCOPE: string = "openid profile email";

  private readonly RESPONSE_TYPE: string = "token id_token";

  private readonly PROMPT: string = "login";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const { domain } = this.params.jwtParams;
    const finalUrl = validateAndConstructUrl(domain);
    finalUrl.pathname += finalUrl.pathname.endsWith("/") ? "authorize" : "/authorize";
    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams));
    delete clonedParams.domain;
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        response_type: this.RESPONSE_TYPE,
        client_id: this.params.clientId,
        prompt: this.PROMPT,
        redirect_uri: this.params.redirect_uri,
        scope: this.SCOPE,
        connection: loginToConnectionMap[this.params.authConnection as AUTH0_CONNECTION_TYPE],
        nonce: this.nonce,
      },
      clonedParams
    );
    Object.keys(finalJwtParams).forEach((key: string) => {
      const localKey = key as keyof typeof finalJwtParams;
      if (finalJwtParams[localKey]) finalUrl.searchParams.append(localKey, finalJwtParams[localKey]);
    });
    this.finalURL = finalUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { idToken, accessToken } = params;
    const { domain, userIdField, isUserIdCaseSensitive, user_info_route = "userinfo" } = this.params.jwtParams;
    if (accessToken) {
      try {
        const domainUrl = new URL(domain);
        const userInfo = await get<Auth0UserInfo>(`${padUrlString(domainUrl)}${user_info_route}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const { picture, name, email } = userInfo;
        return {
          email,
          name,
          profileImage: picture,
          userId: getVerifierId(userInfo, this.params.authConnection, userIdField, isUserIdCaseSensitive),
          authConnectionId: this.params.authConnectionId,
          authConnection: this.params.authConnection,
        };
      } catch (error) {
        // ignore
        log.warn(error, "Unable to get userinfo from endpoint");
      }
    }
    if (idToken) {
      const decodedToken = decodeToken<Auth0UserInfo>(idToken).payload;
      const { name, email, picture } = decodedToken;
      return {
        profileImage: picture,
        name,
        email,
        userId: getVerifierId(decodedToken, this.params.authConnection, userIdField, isUserIdCaseSensitive),
        authConnectionId: this.params.authConnectionId,
        authConnection: this.params.authConnection,
      };
    }
    throw new Error("Access/id token not available");
  }
}
