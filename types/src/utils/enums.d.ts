export declare const ETHEREUM_NETWORK: {
    readonly TESTNET: "ropsten";
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
export declare type ETHEREUM_NETWORK_TYPE = typeof ETHEREUM_NETWORK[keyof typeof ETHEREUM_NETWORK];
export declare type LOGIN_TYPE = typeof LOGIN[keyof typeof LOGIN];
export declare type AGGREGATE_VERIFIER_TYPE = typeof AGGREGATE_VERIFIER[keyof typeof AGGREGATE_VERIFIER];
