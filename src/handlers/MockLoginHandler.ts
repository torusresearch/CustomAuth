import { get } from "@toruslabs/http-helpers";
import deepmerge from "deepmerge";
import log from "loglevel";

import { UX_MODE } from "../utils/enums";
import { constructURL, decodeToken, getUserId, padUrlString } from "../utils/helpers";
import { Auth0UserInfo, CreateHandlerParams, LoginWindowResponse, TorusConnectionResponse } from "../utils/interfaces";
import { PopupHandler } from "../utils/PopupHandler";
import AbstractLoginHandler from "./AbstractLoginHandler";

export default class MockLoginHandler extends AbstractLoginHandler {
  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams));
    delete clonedParams.domain;
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        client_id: this.params.clientId,
        nonce: this.nonce,
      },
      clonedParams
    );

    this.finalURL = new URL(constructURL({ baseURL: this.params.redirect_uri, query: null, hash: finalJwtParams }));
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusConnectionResponse> {
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
          userId: getUserId(userInfo, this.params.authConnection, userIdField, isUserIdCaseSensitive),
          authConnectionId: this.params.authConnectionId,
          authConnection: this.params.authConnection,
          groupedAuthConnectionId: this.params.groupedAuthConnectionId,
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
        userId: getUserId(decodedToken, this.params.authConnection, userIdField, isUserIdCaseSensitive),
        authConnectionId: this.params.authConnectionId,
        authConnection: this.params.authConnection,
        groupedAuthConnectionId: this.params.groupedAuthConnectionId,
      };
    }
    throw new Error("Access/id token not available");
  }

  handleLoginWindow(params: { locationReplaceOnRedirect?: boolean; popupFeatures?: string }): Promise<LoginWindowResponse> {
    const { id_token: idToken, access_token: accessToken } = this.params.jwtParams;
    const authConnectionWindow = new PopupHandler({ url: this.finalURL, features: params.popupFeatures });
    if (this.params.uxMode === UX_MODE.REDIRECT) {
      authConnectionWindow.redirect(params.locationReplaceOnRedirect);
    } else {
      return Promise.resolve({
        state: {},
        idToken,
        accessToken,
      });
    }
    return null;
  }
}
