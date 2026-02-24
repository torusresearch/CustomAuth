import { KEY_TYPE, TORUS_LEGACY_NETWORK, TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { AUTH_CONNECTION_TYPE, CustomAuth, LoginWindowResponse, TorusConnectionResponse, TorusLoginResponse, UX_MODE } from "@toruslabs/customauth";
import { fetchLocalConfig } from "@toruslabs/fnd-base";
import { TorusKey } from "@toruslabs/torus.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Hex, PublicClient, WalletClient } from "viem";

import {
  APPLE,
  AUTH_DOMAIN,
  COGNITO,
  COGNITO_AUTH_DOMAIN,
  EMAIL_PASSWORD,
  FormData,
  GITHUB,
  GOOGLE,
  LINE,
  LINKEDIN,
  networkOptions,
  REDDIT,
  SAPPHIRE_WEB3AUTH_CLIENT_ID,
  sapphireDevnetVerifierMap,
  sapphireDevnetVerifierOptions,
  TELEGRAM,
  TESTNET_WEB3AUTH_CLIENT_ID,
  testnetVerifierMap,
  testnetVerifierOptions,
  TWITTER,
  uxModeOptions,
  WEB3AUTH_EMAIL_PASSWORDLESS,
  WEB3AUTH_SMS_PASSWORDLESS,
} from "./config";
import { createViemClients, signEthMessage } from "./services/chainHandlers";

type UserInfoType = TorusConnectionResponse & LoginWindowResponse;

const getDefaultFormData = (): FormData => ({
  uxMode: UX_MODE.REDIRECT,
  loginProvider: GOOGLE,
  loginHint: "",
  network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
});

const parseStoredFormData = (): FormData => {
  const stored = localStorage.getItem("formData");
  if (!stored) return getDefaultFormData();
  try {
    const parsed = JSON.parse(stored) as FormData;
    return {
      uxMode: parsed.uxMode,
      loginProvider: parsed.loginProvider,
      loginHint: parsed.loginHint ?? "",
      network: parsed.network,
    };
  } catch {
    return getDefaultFormData();
  }
};

function App() {
  const [formData, setFormData] = useState<FormData>(parseStoredFormData);
  const [customAuthSdk, setCustomAuthSdk] = useState<CustomAuth | null>(null);
  const [privKey, setPrivKey] = useState<string | undefined>(localStorage.getItem("privKey") ?? undefined);
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(() => {
    const stored = localStorage.getItem("userInfo");
    return stored ? (JSON.parse(stored) as UserInfoType) : null;
  });
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [consoleTitle, setConsoleTitle] = useState("");
  const [consoleBody, setConsoleBody] = useState("");
  const redirectResultCheckedRef = useRef(false);

  const verifierMap = useMemo(
    () => (formData.network === TORUS_LEGACY_NETWORK.TESTNET ? testnetVerifierMap : sapphireDevnetVerifierMap),
    [formData.network]
  );
  const providerOptions = formData.network === TORUS_LEGACY_NETWORK.TESTNET ? testnetVerifierOptions : sapphireDevnetVerifierOptions;

  const loginToConnectionMap = useMemo<Record<string, Record<string, string | boolean>>>(
    () => ({
      [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
      [APPLE]: { domain: AUTH_DOMAIN },
      [GITHUB]: { domain: AUTH_DOMAIN },
      [LINKEDIN]: { domain: AUTH_DOMAIN },
      [TWITTER]: { domain: AUTH_DOMAIN },
      [LINE]: { domain: AUTH_DOMAIN },
      [COGNITO]: { domain: COGNITO_AUTH_DOMAIN, identity_provider: "Google", response_type: "token", user_info_endpoint: "userInfo" },
      [REDDIT]: { domain: AUTH_DOMAIN, connection: "Reddit", userIdField: "name", isUserIdCaseSensitive: false },
      [TELEGRAM]: { identity_provider: "Telegram", origin: "https://custom-auth-beta.vercel.app/serviceworker/redirect" },
      [WEB3AUTH_EMAIL_PASSWORDLESS]: { login_hint: formData.loginHint },
      [WEB3AUTH_SMS_PASSWORDLESS]: { login_hint: formData.loginHint },
    }),
    [formData.loginHint]
  );

  const printConsole = (title: string, payload: unknown) => {
    setConsoleTitle(title);
    setConsoleBody(JSON.stringify(payload, (_, value) => (typeof value === "bigint" ? value.toString() : value), 2));
  };

  const loadResponse = (privKeyInfo: TorusKey, localUserInfo?: UserInfoType) => {
    const localPrivKey = privKeyInfo?.finalKeyData?.privKey || privKeyInfo?.oAuthKeyData?.privKey;
    if (!localPrivKey) return;
    setPrivKey(localPrivKey);
    localStorage.setItem("privKey", localPrivKey);
    if (localUserInfo) {
      setUserInfo(localUserInfo);
      localStorage.setItem("userInfo", JSON.stringify(localUserInfo));
    }
  };

  const initCustomAuth = useCallback(async () => {
    const { network, uxMode } = formData;
    const nodeDetails = fetchLocalConfig(network, KEY_TYPE.SECP256K1);
    const web3AuthClientId = network === TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET ? SAPPHIRE_WEB3AUTH_CLIENT_ID : TESTNET_WEB3AUTH_CLIENT_ID;
    const sdk =
      uxMode === UX_MODE.REDIRECT
        ? new CustomAuth({
            baseUrl: `${window.location.origin}`,
            redirectPathName: "auth",
            enableLogging: true,
            network,
            uxMode,
            web3AuthClientId,
            nodeDetails,
            checkCommitment: false,
          })
        : new CustomAuth({
            uxMode,
            baseUrl: `${window.location.origin}/serviceworker`,
            enableLogging: true,
            network,
            popupFeatures: "titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=500,width=500,top=100,left=100",
            web3AuthClientId,
            nodeDetails,
            checkCommitment: false,
          });
    await sdk.init(uxMode === UX_MODE.REDIRECT ? { skipSw: true } : undefined);
    setCustomAuthSdk(sdk);
  }, [formData]);

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    void initCustomAuth();
    redirectResultCheckedRef.current = false;
  }, [initCustomAuth]);

  useEffect(() => {
    if (!privKey) return;
    const clients = createViemClients(`0x${privKey}` as Hex);
    setWalletClient(clients.walletClient);
    setPublicClient(clients.publicClient);
  }, [privKey]);

  useEffect(() => {
    if (!customAuthSdk || formData.uxMode !== UX_MODE.REDIRECT || redirectResultCheckedRef.current || privKey) return;
    redirectResultCheckedRef.current = true;
    (async () => {
      try {
        const loginDetails = await customAuthSdk.getRedirectResult();
        const response = loginDetails?.result as TorusLoginResponse | undefined;
        if (response) loadResponse(response, response.userInfo as UserInfoType);
      } catch (error) {
        // Keep behavior permissive for demo app.
        // eslint-disable-next-line no-console
        console.error(error);
      }
    })();
  }, [customAuthSdk, formData.uxMode, privKey]);

  const onLogin = async () => {
    if (!customAuthSdk) return;
    const selected = verifierMap[formData.loginProvider];
    if (!selected) return;
    const jwtParams = loginToConnectionMap[formData.loginProvider] || {};
    const { typeOfLogin, clientId, verifier } = selected;
    const data =
      formData.network === TORUS_LEGACY_NETWORK.TESTNET
        ? await customAuthSdk.triggerLogin({
            authConnection: typeOfLogin as AUTH_CONNECTION_TYPE,
            authConnectionId: verifier,
            clientId,
            jwtParams,
          })
        : await customAuthSdk.triggerLogin({
            authConnection: typeOfLogin as AUTH_CONNECTION_TYPE,
            authConnectionId: "web3auth",
            groupedAuthConnectionId: verifier,
            clientId,
            jwtParams,
          });
    if (data) loadResponse(data, data.userInfo as UserInfoType);
  };

  const onLogout = () => {
    setPrivKey(undefined);
    setUserInfo(null);
    setWalletClient(null);
    setPublicClient(null);
    localStorage.removeItem("privKey");
    localStorage.removeItem("userInfo");
  };

  const printUserInfo = () => {
    printConsole("User Info", { userInfo, privKey, hasWalletClient: !!walletClient, hasPublicClient: !!publicClient });
  };

  const onSignMessage = async () => {
    if (!walletClient) return;
    const signed = await signEthMessage(walletClient);
    printConsole("Signed Message", signed);
  };

  const showEmailHint = formData.loginProvider === WEB3AUTH_EMAIL_PASSWORDLESS;
  const showPhoneHint = formData.loginProvider === WEB3AUTH_SMS_PASSWORDLESS;

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">CustomAuth Vite React Example</h1>

        {!privKey ? (
          <>
            <div className="row stack">
              <label>
                UX Mode
                <select value={formData.uxMode} onChange={(e) => setFormData((prev) => ({ ...prev, uxMode: e.target.value as FormData["uxMode"] }))}>
                  {uxModeOptions.map((mode) => (
                    <option value={mode} key={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Network
                <select
                  value={formData.network}
                  onChange={(e) => setFormData((prev) => ({ ...prev, network: e.target.value as FormData["network"], loginProvider: GOOGLE }))}
                >
                  {networkOptions.map((network) => (
                    <option value={network} key={network}>
                      {network}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Login Provider
                <select value={formData.loginProvider} onChange={(e) => setFormData((prev) => ({ ...prev, loginProvider: e.target.value }))}>
                  {providerOptions.map((provider) => (
                    <option value={provider} key={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </label>

              {showEmailHint && (
                <label>
                  Login Hint (email)
                  <input
                    placeholder="Enter an email"
                    value={formData.loginHint}
                    onChange={(e) => setFormData((prev) => ({ ...prev, loginHint: e.target.value }))}
                  />
                </label>
              )}

              {showPhoneHint && (
                <label>
                  Login Hint (phone)
                  <input
                    placeholder="+{cc}-{number}"
                    value={formData.loginHint}
                    onChange={(e) => setFormData((prev) => ({ ...prev, loginHint: e.target.value }))}
                  />
                </label>
              )}
            </div>

            <div className="actions">
              <button type="button" onClick={() => void onLogin()}>
                Connect
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="actions">
              <button type="button" className="secondary" onClick={() => onLogout()}>
                Logout
              </button>
              <button type="button" onClick={() => printUserInfo()}>
                User Info
              </button>
              <button type="button" onClick={() => void onSignMessage()}>
                Sign Message
              </button>
              <button type="button" className="secondary" onClick={() => printConsole("", "")}>
                Clear Console
              </button>
            </div>
          </>
        )}

        <div className="help">
          <div>Verifiers in this example are configured for `http://localhost:3000/serviceworker/redirect`.</div>
          <div>Use this app on `localhost:3000` for popup/redirect demos.</div>
        </div>
      </div>

      {privKey && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>{consoleTitle}</h3>
          <pre>{consoleBody}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
