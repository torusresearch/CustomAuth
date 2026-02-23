import { Injectable } from "@angular/core";
import { KEY_TYPE, TORUS_LEGACY_NETWORK, TORUS_NETWORK_TYPE, TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { AUTH_CONNECTION_TYPE, Auth0ClientOptions, CustomAuth, TorusLoginResponse, UX_MODE, UX_MODE_TYPE } from "@toruslabs/customauth";
import { fetchLocalConfig } from "@toruslabs/fnd-base";

import {
  APPLE,
  AUTH_DOMAIN,
  COGNITO,
  COGNITO_AUTH_DOMAIN,
  EMAIL_PASSWORD,
  FormData,
  GITHUB,
  LINE,
  LINKEDIN,
  REDDIT,
  SAPPHIRE_WEB3AUTH_CLIENT_ID,
  sapphireDevnetVerifierMap,
  TESTNET_WEB3AUTH_CLIENT_ID,
  testnetVerifierMap,
  TWITTER,
  WEB3AUTH_EMAIL_PASSWORDLESS,
  WEB3AUTH_SMS_PASSWORDLESS,
} from "./config";

const REDIRECT_STATE_KEY = "custom_auth_angular_state";
const LEGACY_AUTH_RESULT_KEY = "angular_custom_auth_result";
const PRIV_KEY_STORAGE_KEY = "privKey";
const USER_INFO_STORAGE_KEY = "userInfo";

type StoredLoginResult = {
  privKey?: string;
  userInfo?: unknown;
};

@Injectable({ providedIn: "root" })
export class CustomAuthService {
  private sdk: CustomAuth | null = null;
  private currentUxMode: UX_MODE_TYPE | null = null;
  private currentNetwork: TORUS_NETWORK_TYPE | null = null;

  async init(network: TORUS_NETWORK_TYPE, uxMode: UX_MODE_TYPE): Promise<void> {
    if (this.sdk && this.currentUxMode === uxMode && this.currentNetwork === network) return;

    const nodeDetails = fetchLocalConfig(network, KEY_TYPE.SECP256K1);
    if (uxMode === UX_MODE.REDIRECT) {
      this.sdk = new CustomAuth({
        baseUrl: window.location.origin,
        redirectPathName: "auth",
        enableLogging: true,
        network,
        uxMode,
        web3AuthClientId: this.getWeb3AuthClientId(network),
        nodeDetails,
        checkCommitment: false,
      });
      await this.sdk.init({ skipSw: true });
    } else {
      this.sdk = new CustomAuth({
        uxMode,
        baseUrl: `${window.location.origin}/serviceworker`,
        enableLogging: true,
        network,
        popupFeatures: "titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=500,width=500,top=100,left=100",
        web3AuthClientId: this.getWeb3AuthClientId(network),
        nodeDetails,
        checkCommitment: false,
      });
      await this.sdk.init();
    }

    this.currentUxMode = uxMode;
    this.currentNetwork = network;
  }

  getDefaultFormData(uxMode: UX_MODE_TYPE): FormData {
    return {
      uxMode,
      loginProvider: "google",
      loginHint: "",
      network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
    };
  }

  async triggerLogin(formData: FormData): Promise<TorusLoginResponse | undefined> {
    const { network, loginProvider, loginHint, uxMode } = formData;
    await this.init(network, uxMode);
    if (!this.sdk) throw new Error("CustomAuth SDK is not initialized");

    const jwtParams = this.getJwtParams(loginProvider, loginHint);
    const verifierMap = this.getVerifierMap(network);
    const { typeOfLogin, clientId, verifier } = verifierMap[loginProvider];

    if (uxMode === UX_MODE.REDIRECT) {
      localStorage.setItem(REDIRECT_STATE_KEY, JSON.stringify(formData));
    }

    if (network === TORUS_LEGACY_NETWORK.TESTNET) {
      return this.sdk.triggerLogin({
        authConnection: typeOfLogin as AUTH_CONNECTION_TYPE,
        authConnectionId: verifier,
        clientId,
        jwtParams,
      });
    }

    return this.sdk.triggerLogin({
      authConnection: typeOfLogin as AUTH_CONNECTION_TYPE,
      authConnectionId: "web3auth",
      groupedAuthConnectionId: verifier,
      clientId,
      jwtParams,
    });
  }

  async getRedirectResult(): Promise<TorusLoginResponse | undefined> {
    const redirectState = this.getRedirectState();
    await this.init(redirectState.network, UX_MODE.REDIRECT);
    const result = await this.sdk?.getRedirectResult();
    localStorage.removeItem(REDIRECT_STATE_KEY);
    return result?.result as TorusLoginResponse | undefined;
  }

  getRedirectState(): FormData {
    const raw = localStorage.getItem(REDIRECT_STATE_KEY);
    if (!raw) return this.getDefaultFormData(UX_MODE.REDIRECT);
    try {
      return JSON.parse(raw) as FormData;
    } catch {
      return this.getDefaultFormData(UX_MODE.REDIRECT);
    }
  }

  hasPendingRedirectState(): boolean {
    return !!localStorage.getItem(REDIRECT_STATE_KEY);
  }

  getVerifierMap(network: TORUS_NETWORK_TYPE) {
    return network === TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET ? sapphireDevnetVerifierMap : testnetVerifierMap;
  }

  clearPersistedSession(): void {
    localStorage.removeItem(PRIV_KEY_STORAGE_KEY);
    localStorage.removeItem(USER_INFO_STORAGE_KEY);
    localStorage.removeItem(LEGACY_AUTH_RESULT_KEY);
  }

  saveLoginResult(result: TorusLoginResponse | undefined): void {
    if (!result) return;
    const privKey = result?.finalKeyData?.privKey || result?.oAuthKeyData?.privKey;
    const userInfo = result?.userInfo;
    if (privKey) {
      localStorage.setItem(PRIV_KEY_STORAGE_KEY, privKey);
    }
    if (userInfo) {
      localStorage.setItem(USER_INFO_STORAGE_KEY, this.stringifyForStorage(userInfo));
    }
    localStorage.removeItem(LEGACY_AUTH_RESULT_KEY);
  }

  getStoredLoginResult(): StoredLoginResult | null {
    const privKey = localStorage.getItem(PRIV_KEY_STORAGE_KEY) || undefined;
    const rawUserInfo = localStorage.getItem(USER_INFO_STORAGE_KEY);
    if (!privKey && !rawUserInfo) return null;

    let userInfo: unknown;
    try {
      userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : undefined;
    } catch {
      userInfo = undefined;
    }

    return { privKey, userInfo };
  }

  stringifyForDisplay(value: unknown): string {
    return JSON.stringify(value, this.bigIntReplacer, 2);
  }

  private getWeb3AuthClientId(network: TORUS_NETWORK_TYPE): string {
    return network === TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET ? SAPPHIRE_WEB3AUTH_CLIENT_ID : TESTNET_WEB3AUTH_CLIENT_ID;
  }

  private getJwtParams(selectedLoginProvider: string, loginHint: string): Record<string, unknown> {
    const loginToConnectionMap: Record<string, Auth0ClientOptions> = {
      [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
      [APPLE]: { domain: AUTH_DOMAIN },
      [GITHUB]: { domain: AUTH_DOMAIN },
      [LINKEDIN]: { domain: AUTH_DOMAIN },
      [TWITTER]: { domain: AUTH_DOMAIN },
      [LINE]: { domain: AUTH_DOMAIN },
      [COGNITO]: {
        domain: COGNITO_AUTH_DOMAIN,
        identity_provider: "Google",
        response_type: "token",
        user_info_endpoint: "userInfo",
      },
      [REDDIT]: {
        domain: AUTH_DOMAIN,
        connection: "Reddit",
        userIdField: "name",
        isUserIdCaseSensitive: false,
      },
      [WEB3AUTH_EMAIL_PASSWORDLESS]: { login_hint: loginHint },
      [WEB3AUTH_SMS_PASSWORDLESS]: { login_hint: loginHint },
    };
    return (loginToConnectionMap[selectedLoginProvider] || {}) as Record<string, unknown>;
  }

  private stringifyForStorage(value: unknown): string {
    return JSON.stringify(value, this.bigIntReplacer);
  }

  private bigIntReplacer(_key: string, value: unknown): unknown {
    return typeof value === "bigint" ? value.toString() : value;
  }
}
