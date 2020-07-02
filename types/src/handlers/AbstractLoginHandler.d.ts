import { LOGIN_TYPE } from "../utils/enums";
import { ILoginHandler, LoginWindowResponse, TorusVerifierResponse } from "./interfaces";
export default abstract class AbstractLoginHandler implements ILoginHandler {
    readonly clientId: string;
    readonly verifier: string;
    readonly redirect_uri: string;
    readonly typeOfLogin: LOGIN_TYPE;
    readonly redirectToOpener?: boolean;
    protected nonce: string;
    protected finalURL: URL;
    constructor(clientId: string, verifier: string, redirect_uri: string, typeOfLogin: LOGIN_TYPE, redirectToOpener?: boolean);
    get state(): string;
    abstract getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse>;
    abstract setFinalUrl(): void;
    handleLoginWindow(): Promise<LoginWindowResponse>;
}
