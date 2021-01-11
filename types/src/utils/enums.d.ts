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
};
export declare const AGGREGATE_VERIFIER: {
    readonly SINGLE_VERIFIER_ID: "single_id_verifier";
};
export declare type TORUS_NETWORK_TYPE = typeof TORUS_NETWORK[keyof typeof TORUS_NETWORK];
export declare type LOGIN_TYPE = typeof LOGIN[keyof typeof LOGIN];
export declare type AGGREGATE_VERIFIER_TYPE = typeof AGGREGATE_VERIFIER[keyof typeof AGGREGATE_VERIFIER];
export declare const CONTRACT_MAP: {
    mainnet: string;
    testnet: string;
};
