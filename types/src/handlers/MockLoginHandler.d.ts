import { LOGIN_TYPE, UX_MODE_TYPE } from "../utils/enums";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0ClientOptions, LoginWindowResponse, TorusGenericObject, TorusVerifierResponse } from "./interfaces";
export default class MockLoginHandler extends AbstractLoginHandler {
    readonly clientId: string;
    readonly verifier: string;
    readonly redirect_uri: string;
    readonly typeOfLogin: LOGIN_TYPE;
    readonly uxMode: UX_MODE_TYPE;
    readonly redirectToOpener?: boolean;
    readonly jwtParams?: Auth0ClientOptions;
    readonly customState?: TorusGenericObject;
    constructor(clientId: string, verifier: string, redirect_uri: string, typeOfLogin: LOGIN_TYPE, uxMode: UX_MODE_TYPE, redirectToOpener?: boolean, jwtParams?: Auth0ClientOptions, customState?: TorusGenericObject);
    setFinalUrl(): void;
    getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse>;
    handleLoginWindow(params: {
        locationReplaceOnRedirect?: boolean;
        popupFeatures?: string;
    }): Promise<LoginWindowResponse>;
}
