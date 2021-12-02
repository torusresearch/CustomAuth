import { get } from "@toruslabs/http-helpers";
import jwtDecode from "jwt-decode";
import deepmerge from "lodash.merge";
import log from "loglevel";

import { LOGIN_TYPE, UX_MODE, UX_MODE_TYPE } from "../utils/enums";
import { constructURL, getVerifierId, padUrlString } from "../utils/helpers";
import PopupHandler from "../utils/PopupHandler";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0ClientOptions, Auth0UserInfo, LoginWindowResponse, TorusGenericObject, TorusVerifierResponse } from "./interfaces";

export default class MockLoginHandler extends AbstractLoginHandler {
  constructor(
    readonly clientId: string,
    readonly verifier: string,
    readonly redirect_uri: string,
    readonly typeOfLogin: LOGIN_TYPE,
    readonly uxMode: UX_MODE_TYPE,
    readonly redirectToOpener?: boolean,
    readonly jwtParams?: Auth0ClientOptions,
    readonly customState?: TorusGenericObject
  ) {
    super(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const clonedParams = JSON.parse(JSON.stringify(this.jwtParams));
    delete clonedParams.domain;
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        client_id: this.clientId,
        nonce: this.nonce,
      },
      clonedParams
    );

    this.finalURL = new URL(constructURL({ baseURL: this.redirect_uri, query: null, hash: finalJwtParams }));
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { idToken, accessToken } = params;
    const { domain, verifierIdField, isVerifierIdCaseSensitive, user_info_route = "userinfo" } = this.jwtParams;
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
          verifierId: getVerifierId(userInfo, this.typeOfLogin, verifierIdField, isVerifierIdCaseSensitive),
          verifier: this.verifier,
          typeOfLogin: this.typeOfLogin,
        };
      } catch (error) {
        // ignore
        log.warn(error, "Unable to get userinfo from endpoint");
      }
    }
    if (idToken) {
      const decodedToken = jwtDecode<Auth0UserInfo>(idToken);
      const { name, email, picture } = decodedToken;
      return {
        profileImage: picture,
        name,
        email,
        verifierId: getVerifierId(decodedToken, this.typeOfLogin, verifierIdField, isVerifierIdCaseSensitive),
        verifier: this.verifier,
        typeOfLogin: this.typeOfLogin,
      };
    }
    throw new Error("Access/id token not available");
  }

  handleLoginWindow(params: { locationReplaceOnRedirect?: boolean; popupFeatures?: string }): Promise<LoginWindowResponse> {
    const { id_token: idToken, access_token: accessToken } = this.jwtParams;
    const verifierWindow = new PopupHandler({ url: this.finalURL, features: params.popupFeatures });
    if (this.uxMode === UX_MODE.REDIRECT) {
      verifierWindow.redirect(params.locationReplaceOnRedirect);
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
