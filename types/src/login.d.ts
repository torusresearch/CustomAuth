import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { AggregateLoginParams, DirectWebSDKArgs, extraParams, HybridAggregateLoginParams, InitParams, SubVerifierDetails, TorusAggregateLoginResponse, TorusHybridAggregateLoginResponse, TorusKey, TorusLoginResponse } from "./handlers/interfaces";
declare class DirectWebSDK {
    isInitialized: boolean;
    config: {
        baseUrl: string;
        redirectToOpener: boolean;
        redirect_uri: string;
    };
    torus: Torus;
    nodeDetailManager: NodeDetailManager;
    constructor({ baseUrl, network, proxyContractAddress, enableLogging, enableErrorReporter, redirectToOpener, redirectPathName, apiKey, }: DirectWebSDKArgs);
    init({ skipSw }?: InitParams): Promise<void>;
    private handleRedirectCheck;
    triggerLogin({ verifier, typeOfLogin, clientId, jwtParams, hash, queryParameters }: SubVerifierDetails): Promise<TorusLoginResponse>;
    triggerAggregateLogin({ aggregateVerifierType, verifierIdentifier, subVerifierDetailsArray, }: AggregateLoginParams): Promise<TorusAggregateLoginResponse>;
    triggerHybridAggregateLogin({ singleLogin, aggregateLoginParams }: HybridAggregateLoginParams): Promise<TorusHybridAggregateLoginResponse>;
    getTorusKey(verifier: string, verifierId: string, verifierParams: {
        verifier_id: string;
    }, idToken: string, additionalParams?: extraParams): Promise<TorusKey>;
}
export default DirectWebSDK;
