import { LOGIN_TYPE, UX_MODE_TYPE } from "../utils/enums";
import { Auth0ClientOptions, ILoginHandler, LoginWindowResponse, TorusVerifierResponse } from "./interfaces";
declare abstract class AbstractLoginHandler implements ILoginHandler {
    readonly clientId: string;
    readonly verifier: string;
    readonly redirect_uri: string;
    readonly typeOfLogin: LOGIN_TYPE;
    readonly uxMode: UX_MODE_TYPE;
    readonly redirectToOpener?: boolean;
    readonly jwtParams?: Auth0ClientOptions;
    nonce: string;
    finalURL: URL;
    constructor(clientId: string, verifier: string, redirect_uri: string, typeOfLogin: LOGIN_TYPE, uxMode: UX_MODE_TYPE, redirectToOpener?: boolean, jwtParams?: Auth0ClientOptions);
    get state(): string;
    abstract getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse>;
    abstract setFinalUrl(): void;
    handleLoginWindow(): Promise<LoginWindowResponse>;
}
export default AbstractLoginHandler;
