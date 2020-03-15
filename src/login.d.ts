export default class DirectWebSDK {
    constructor(args: DirectWebSDKArgs);
    triggerLogin(verifier: 'facebook' | 'google' | 'reddit' | 'twitch' | 'discord'): Promise<TorusLoginResponse>;
    handleLogin(verifier: 'facebook' | 'google' | 'reddit' | 'twitch' | 'discord', verifierId: String, verifierParams: any, idToken: String): Promise<TorusKey>;
}

interface DirectWebSDKArgs {
    GOOGLE_CLIENT_ID: String;
    FACEBOOK_APP_ID: String;
    TWITCH_CLIENT_ID: String;
    REDDIT_CLIENT_ID: String;
    DISCORD_CLIENT_ID: String;
    redirect_uri: String;
    network: 'mainnet' | 'rinkeby' | 'ropsten' | 'kovan' | 'goerli';
    proxyContractAddress: String;
    enableLogging: Boolean;
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