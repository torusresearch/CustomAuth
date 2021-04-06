import { LOGIN_TYPE, UX_MODE_TYPE } from "../utils/enums";
import { Auth0ClientOptions, ILoginHandler, LoginWindowResponse, TorusGenericObject, TorusVerifierResponse } from "./interfaces";
declare abstract class AbstractLoginHandler implements ILoginHandler {
    readonly clientId: string;
    readonly verifier: string;
    readonly redirect_uri: string;
    readonly typeOfLogin: LOGIN_TYPE;
    readonly uxMode: UX_MODE_TYPE;
    readonly redirectToOpener?: boolean;
    readonly jwtParams?: Auth0ClientOptions;
    readonly customState?: TorusGenericObject;
    nonce: string;
    finalURL: URL;
    constructor(clientId: string, verifier: string, redirect_uri: string, typeOfLogin: LOGIN_TYPE, uxMode: UX_MODE_TYPE, redirectToOpener?: boolean, jwtParams?: Auth0ClientOptions, customState?: TorusGenericObject);
    get state(): string;
    abstract getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse>;
    abstract setFinalUrl(): void;
    handleLoginWindow(params: {
        locationReplaceOnRedirect?: boolean;
        popupFeatures?: string;
    }): Promise<LoginWindowResponse>;
}
export default AbstractLoginHandler;
