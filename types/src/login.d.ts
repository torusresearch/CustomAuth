import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { AggregateLoginParams, DirectWebSDKArgs, extraParams, HybridAggregateLoginParams, InitParams, RedirectResult, RedirectResultParams, SubVerifierDetails, TorusAggregateLoginResponse, TorusHybridAggregateLoginResponse, TorusKey, TorusLoginResponse } from "./handlers/interfaces";
import { REDIRECT_PARAMS_STORAGE_METHOD_TYPE, UX_MODE_TYPE } from "./utils/enums";
declare class DirectWebSDK {
    isInitialized: boolean;
    config: {
        baseUrl: string;
        redirectToOpener: boolean;
        redirect_uri: string;
        uxMode: UX_MODE_TYPE;
        redirectParamsStorageMethod: REDIRECT_PARAMS_STORAGE_METHOD_TYPE;
    };
    torus: Torus;
    nodeDetailManager: NodeDetailManager;
    constructor({ baseUrl, network, proxyContractAddress, enableLogging, redirectToOpener, redirectPathName, apiKey, uxMode, redirectParamsStorageMethod, }: DirectWebSDKArgs);
    init({ skipSw, skipInit }?: InitParams): Promise<void>;
    private handleRedirectCheck;
    triggerLogin(args: SubVerifierDetails): Promise<TorusLoginResponse>;
    triggerAggregateLogin(args: AggregateLoginParams): Promise<TorusAggregateLoginResponse>;
    triggerHybridAggregateLogin(args: HybridAggregateLoginParams): Promise<TorusHybridAggregateLoginResponse>;
    getTorusKey(verifier: string, verifierId: string, verifierParams: {
        verifier_id: string;
    }, idToken: string, additionalParams?: extraParams): Promise<TorusKey>;
    getRedirectResult({ replaceUrl }?: RedirectResultParams): Promise<RedirectResult>;
}
export default DirectWebSDK;
