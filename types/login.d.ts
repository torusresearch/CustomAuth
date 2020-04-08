declare class DirectWebSDK {
    constructor(args: DirectWebSDKArgs);
    init(): Promise<void>;
    triggerLogin(typeOfLogin: 'facebook' | 'google' | 'reddit' | 'twitch' | 'discord', verifier: String): Promise<TorusLoginResponse>;
    handleLogin(verifier: String, verifierId: String, verifierParams: any, idToken: String): Promise<TorusKey>;
}

export as namespace directWebSdk;

export = DirectWebSDK;

interface DirectWebSDKArgs {
    GOOGLE_CLIENT_ID: String;
    FACEBOOK_CLIENT_ID: String;
    TWITCH_CLIENT_ID: String;
    REDDIT_CLIENT_ID: String;
    DISCORD_CLIENT_ID: String;
    baseUrl: String;
    network?: 'mainnet' | 'rinkeby' | 'ropsten' | 'kovan' | 'goerli';
    proxyContractAddress?: String;
    enableLogging?: Boolean;
}

interface TorusKey {
    publicAddress: String;
    privateKey: String;
}

interface TorusLoginResponse extends TorusKey {
    email: String;
    name: String;
    profileImage: String;
    verifier: String;
    verifierId: String;
}