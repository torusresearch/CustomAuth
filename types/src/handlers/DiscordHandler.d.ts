import { LOGIN_TYPE } from "../utils/enums";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { LoginWindowResponse, TorusVerifierResponse } from "./interfaces";
export default class DiscordHandler extends AbstractLoginHandler {
    readonly clientId: string;
    readonly verifier: string;
    readonly redirect_uri: string;
    readonly typeOfLogin: LOGIN_TYPE;
    private readonly RESPONSE_TYPE;
    private readonly SCOPE;
    constructor(clientId: string, verifier: string, redirect_uri: string, typeOfLogin: LOGIN_TYPE, redirectToOpener?: boolean);
    setFinalUrl(): void;
    getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse>;
}
