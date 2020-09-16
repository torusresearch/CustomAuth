import { LOGIN_TYPE } from "../utils/enums";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0ClientOptions, LoginWindowResponse, TorusVerifierResponse } from "./interfaces";
export default class TwitchHandler extends AbstractLoginHandler {
    readonly clientId: string;
    readonly verifier: string;
    readonly redirect_uri: string;
    readonly typeOfLogin: LOGIN_TYPE;
    readonly redirectToOpener?: boolean;
    readonly jwtParams?: Auth0ClientOptions;
    private readonly RESPONSE_TYPE;
    private readonly SCOPE;
    constructor(clientId: string, verifier: string, redirect_uri: string, typeOfLogin: LOGIN_TYPE, redirectToOpener?: boolean, jwtParams?: Auth0ClientOptions);
    setFinalUrl(): void;
    getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse>;
}
