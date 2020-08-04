import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { AggregateLoginParams, DirectWebSDKArgs, InitParams, SubVerifierDetails, TorusAggregateLoginResponse, TorusKey, TorusLoginResponse } from "./handlers/interfaces";
declare class DirectWebSDK {
    isInitialized: boolean;
    config: {
        baseUrl: string;
        redirectToOpener: boolean;
        redirect_uri: string;
    };
    torus: Torus;
    nodeDetailManager: NodeDetailManager;
    constructor({ baseUrl, network, proxyContractAddress, enableLogging, redirectToOpener, redirectPathName, apiKey, }: DirectWebSDKArgs);
    init({ skipSw }?: InitParams): Promise<void>;
    private handleRedirectCheck;
    triggerLogin({ verifier, typeOfLogin, clientId, jwtParams }: SubVerifierDetails): Promise<TorusLoginResponse>;
    triggerAggregateLogin({ aggregateVerifierType, verifierIdentifier, subVerifierDetailsArray, }: AggregateLoginParams): Promise<TorusAggregateLoginResponse>;
    getTorusKey(verifier: string, verifierId: string, verifierParams: {
        verifier_id: string;
    }, idToken: string): Promise<TorusKey>;
}
export default DirectWebSDK;
