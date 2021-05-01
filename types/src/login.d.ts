import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { AggregateLoginParams, DirectWebSDKArgs, extraParams, HybridAggregateLoginParams, InitParams, RedirectResult, RedirectResultParams, SubVerifierDetails, TorusAggregateLoginResponse, TorusHybridAggregateLoginResponse, TorusKey, TorusLoginResponse, TorusSubVerifierInfo } from "./handlers/interfaces";
import { REDIRECT_PARAMS_STORAGE_METHOD_TYPE, UX_MODE_TYPE } from "./utils/enums";
declare class DirectWebSDK {
    isInitialized: boolean;
    config: {
        baseUrl: string;
        redirectToOpener: boolean;
        redirect_uri: string;
        uxMode: UX_MODE_TYPE;
        redirectParamsStorageMethod: REDIRECT_PARAMS_STORAGE_METHOD_TYPE;
        locationReplaceOnRedirect: boolean;
        popupFeatures: string;
    };
    torus: Torus;
    nodeDetailManager: NodeDetailManager;
    constructor({ baseUrl, network, proxyContractAddress, enableLogging, redirectToOpener, redirectPathName, apiKey, uxMode, redirectParamsStorageMethod, locationReplaceOnRedirect, popupFeatures, skipFetchingNodeDetails, }: DirectWebSDKArgs);
    init({ skipSw, skipInit, skipPrefetch }?: InitParams): Promise<void>;
    private handlePrefetchRedirectUri;
    triggerLogin(args: SubVerifierDetails & {
        registerOnly?: boolean;
    }): Promise<TorusLoginResponse>;
    triggerAggregateLogin(args: AggregateLoginParams): Promise<TorusAggregateLoginResponse>;
    triggerHybridAggregateLogin(args: HybridAggregateLoginParams): Promise<TorusHybridAggregateLoginResponse>;
    getTorusKey(verifier: string, verifierId: string, verifierParams: {
        verifier_id: string;
    }, idToken: string, additionalParams?: extraParams): Promise<TorusKey>;
    getAggregateTorusKey(verifier: string, verifierId: string, // unique identifier for user e.g. sub on jwt
    subVerifierInfoArray: TorusSubVerifierInfo[]): Promise<TorusKey>;
    getRedirectResult({ replaceUrl, clearLoginDetails }?: RedirectResultParams): Promise<RedirectResult>;
}
export default DirectWebSDK;
