export declare const TORUS_NETWORK: {
    readonly TESTNET: "testnet";
    readonly MAINNET: "mainnet";
};
export declare const ETHEREUM_NETWORK: {
    readonly ROPSTEN: "ropsten";
    readonly MAINNET: "mainnet";
};
export declare const LOGIN: {
    readonly GOOGLE: "google";
    readonly FACEBOOK: "facebook";
    readonly REDDIT: "reddit";
    readonly DISCORD: "discord";
    readonly TWITCH: "twitch";
    readonly APPLE: "apple";
    readonly GITHUB: "github";
    readonly LINKEDIN: "linkedin";
    readonly TWITTER: "twitter";
    readonly WEIBO: "weibo";
    readonly LINE: "line";
    readonly EMAIL_PASSWORD: "email_password";
    readonly PASSWORDLESS: "passwordless";
    readonly JWT: "jwt";
    readonly WEBAUTHN: "webauthn";
};
export declare const AGGREGATE_VERIFIER: {
    readonly SINGLE_VERIFIER_ID: "single_id_verifier";
};
export declare const UX_MODE: {
    readonly POPUP: "popup";
    readonly REDIRECT: "redirect";
};
export declare const REDIRECT_PARAMS_STORAGE_METHOD: {
    LOCAL_STORAGE: string;
    SESSION_STORAGE: string;
};
export declare const TORUS_METHOD: {
    readonly TRIGGER_LOGIN: "triggerLogin";
    readonly TRIGGER_AGGREGATE_LOGIN: "triggerAggregateLogin";
    readonly TRIGGER_AGGREGATE_HYBRID_LOGIN: "triggerHybridAggregateLogin";
};
export declare type TORUS_NETWORK_TYPE = typeof TORUS_NETWORK[keyof typeof TORUS_NETWORK];
export declare type LOGIN_TYPE = typeof LOGIN[keyof typeof LOGIN];
export declare type AGGREGATE_VERIFIER_TYPE = typeof AGGREGATE_VERIFIER[keyof typeof AGGREGATE_VERIFIER];
export declare type UX_MODE_TYPE = typeof UX_MODE[keyof typeof UX_MODE];
export declare type TORUS_METHOD_TYPE = typeof TORUS_METHOD[keyof typeof TORUS_METHOD];
export declare type REDIRECT_PARAMS_STORAGE_METHOD_TYPE = typeof REDIRECT_PARAMS_STORAGE_METHOD[keyof typeof REDIRECT_PARAMS_STORAGE_METHOD];
export declare const CONTRACT_MAP: {
    mainnet: string;
    testnet: string;
};
