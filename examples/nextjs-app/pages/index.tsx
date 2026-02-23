import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { KEY_TYPE, TORUS_LEGACY_NETWORK } from "@toruslabs/constants";
import { CustomAuth } from "@toruslabs/customauth";
import { fetchLocalConfig } from "@toruslabs/fnd-base";

import {
  APPLE,
  AUTH_DOMAIN,
  COGNITO,
  COGNITO_AUTH_DOMAIN,
  DEFAULT_NETWORK,
  EMAIL_PASSWORD,
  FormData,
  getVerifierMap,
  getVerifierOptions,
  GOOGLE,
  GITHUB,
  LINE,
  LINKEDIN,
  networkOptions,
  REDDIT,
  TELEGRAM,
  TWITTER,
  uxModeOptions,
  WEB3AUTH_EMAIL_PASSWORDLESS,
  WEB3AUTH_SMS_PASSWORDLESS,
} from "../lib/constants";

const ReactJsonView = dynamic(() => import("@uiw/react-json-view"), { ssr: false });

type UserInfoType = Record<string, unknown> | null;

const getDefaultFormData = (): FormData => ({
  uxMode: "redirect",
  loginProvider: GOOGLE,
  loginHint: "",
  network: DEFAULT_NETWORK,
});

const parseStoredFormData = (): FormData => {
  if (typeof window === "undefined") return getDefaultFormData();
  const stored = localStorage.getItem("formData");
  if (!stored) return getDefaultFormData();
  try {
    return JSON.parse(stored) as FormData;
  } catch {
    return getDefaultFormData();
  }
};

const HomePage = () => {
  const [formData, setFormData] = useState<FormData>(getDefaultFormData);
  const [customAuthSdk, setCustomAuthSdk] = useState<any | null>(null);
  const [privKey, setPrivKey] = useState<string | undefined>(undefined);
  const [userInfo, setUserInfo] = useState<UserInfoType>(null);
  const [consoleTitle, setConsoleTitle] = useState("Console");
  const [consoleBody, setConsoleBody] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const sdkInitSeqRef = useRef(0);

  const verifierMap = useMemo(() => getVerifierMap(formData.network), [formData.network]);
  const verifierOptions = useMemo(() => getVerifierOptions(formData.network), [formData.network]);

  const loginToConnectionMap = useMemo(
    () => ({
      [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
      [APPLE]: { domain: AUTH_DOMAIN },
      [GITHUB]: { domain: AUTH_DOMAIN },
      [LINKEDIN]: { domain: AUTH_DOMAIN },
      [TWITTER]: { domain: AUTH_DOMAIN },
      [LINE]: { domain: AUTH_DOMAIN },
      [COGNITO]: { domain: COGNITO_AUTH_DOMAIN, identity_provider: "Google", response_type: "token", user_info_endpoint: "userInfo" },
      [REDDIT]: { domain: AUTH_DOMAIN, connection: "Reddit", userIdField: "name", isUserIdCaseSensitive: false },
      [TELEGRAM]: {
        identity_provider: "Telegram",
        origin: "https://custom-auth-beta.vercel.app/serviceworker/redirect",
      },
      [WEB3AUTH_EMAIL_PASSWORDLESS]: { login_hint: formData.loginHint },
      [WEB3AUTH_SMS_PASSWORDLESS]: { login_hint: formData.loginHint },
    }),
    [formData.loginHint],
  );

  const printConsole = (title: string, payload: unknown) => {
    setConsoleTitle(title);
    setConsoleBody(JSON.stringify(payload, null, 2));
  };

  const loadResponse = (response: any) => {
    const localPrivKey = response?.finalKeyData?.privKey || response?.oAuthKeyData?.privKey;
    const localUserInfo = response?.userInfo || null;
    if (localPrivKey) {
      setPrivKey(localPrivKey);
      localStorage.setItem("privKey", localPrivKey);
    }
    if (localUserInfo) {
      setUserInfo(localUserInfo);
      localStorage.setItem("userInfo", JSON.stringify(localUserInfo));
    }
  };

  const getWeb3AuthClientIdFromUrl = (fallbackClientId: string, verifierMapSnapshot: ReturnType<typeof getVerifierMap>): string => {
    const verifierToClientId = Object.values(verifierMapSnapshot).reduce<Record<string, string>>((acc, item) => {
      acc[item.verifier] = item.clientId;
      return acc;
    }, {});
    try {
      const url = new URL(window.location.href);
      const hash = url.hash.replace(/^#/, "");
      const searchState = url.searchParams.get("state");
      const stateFromHash = hash
        .split("&")
        .find((part) => part.startsWith("state="))
        ?.split("=")[1];
      const encodedState = stateFromHash || searchState;
      if (!encodedState) return fallbackClientId;
      const decodedState = decodeURIComponent(decodeURIComponent(encodedState));
      const parsed = JSON.parse(atob(decodedState)) as { verifier?: string };
      if (!parsed.verifier) return fallbackClientId;
      return verifierToClientId[parsed.verifier] || fallbackClientId;
    } catch {
      return fallbackClientId;
    }
  };

  const initSdk = async (formSnapshot: FormData) => {
    const verifierMapSnapshot = getVerifierMap(formSnapshot.network);
    const selectedProvider = formSnapshot.loginProvider;
    const selectedVerifier = verifierMapSnapshot[selectedProvider] || verifierMapSnapshot[GOOGLE];
    if (!selectedVerifier) return null;
    const nodeDetails = fetchLocalConfig(formSnapshot.network, KEY_TYPE.SECP256K1);
    const web3AuthClientId =
      formSnapshot.uxMode === "redirect" ? getWeb3AuthClientIdFromUrl(selectedVerifier.clientId, verifierMapSnapshot) : selectedVerifier.clientId;
    const sdk =
      formSnapshot.uxMode === "redirect"
        ? new CustomAuth({
            baseUrl: window.location.origin,
            redirectPathName: "auth",
            enableLogging: true,
            network: formSnapshot.network,
            web3AuthClientId,
            nodeDetails,
            checkCommitment: false,
            uxMode: formSnapshot.uxMode,
          })
        : new CustomAuth({
            baseUrl: `${window.location.origin}/serviceworker`,
            enableLogging: true,
            network: formSnapshot.network,
            web3AuthClientId,
            nodeDetails,
            checkCommitment: false,
            uxMode: formSnapshot.uxMode,
          });
    await sdk.init(formSnapshot.uxMode === "redirect" ? { skipSw: true } : { skipSw: false });
    return sdk;
  };

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData, mounted]);

  useEffect(() => {
    setMounted(true);
    const persistedFormData = parseStoredFormData();
    setFormData(persistedFormData);

    const persistedPrivKey = localStorage.getItem("privKey") || undefined;
    const persistedUserInfo = localStorage.getItem("userInfo");
    setPrivKey(persistedPrivKey);
    setUserInfo(persistedUserInfo ? (JSON.parse(persistedUserInfo) as UserInfoType) : null);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const seq = sdkInitSeqRef.current + 1;
    sdkInitSeqRef.current = seq;
    setCustomAuthSdk(null);
    const formSnapshot = { ...formData };
    void (async () => {
      const sdk = await initSdk(formSnapshot);
      if (!sdk || sdkInitSeqRef.current !== seq) return;
      setCustomAuthSdk(sdk);
      if (formSnapshot.uxMode !== "redirect") return;
      try {
        const loginDetails = await sdk.getRedirectResult();
        if (sdkInitSeqRef.current !== seq) return;
        const response = ((loginDetails as any)?.result || loginDetails) as any;
        if (response) loadResponse(response);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [isHydrated, formData.network, formData.uxMode, formData.loginProvider]);

  const onLogin = async () => {
    const selected = verifierMap[formData.loginProvider];
    if (!selected) return;
    if (!customAuthSdk) return;

    const jwtParams = loginToConnectionMap[formData.loginProvider] || {};
    if (formData.network === TORUS_LEGACY_NETWORK.TESTNET) {
      const data = await customAuthSdk.triggerLogin({
        authConnection: selected.typeOfLogin,
        authConnectionId: selected.verifier,
        clientId: selected.clientId,
        jwtParams,
      });
      if (data) loadResponse(data);
      return;
    }

    const data = await customAuthSdk.triggerLogin({
      authConnection: selected.typeOfLogin,
      authConnectionId: "web3auth",
      groupedAuthConnectionId: selected.verifier,
      clientId: selected.clientId,
      jwtParams,
    });
    if (data) loadResponse(data);
  };

  const onLogout = () => {
    setPrivKey(undefined);
    setUserInfo(null);
    localStorage.removeItem("privKey");
    localStorage.removeItem("userInfo");
    printConsole("Console", {});
  };

  const onLoadUserInfo = () => {
    printConsole("User Info", {
      network: formData.network,
      uxMode: formData.uxMode,
      loginProvider: formData.loginProvider,
      userInfo,
      privKey,
    });
  };

  const showEmailHint = formData.loginProvider === WEB3AUTH_EMAIL_PASSWORDLESS;
  const showPhoneHint = formData.loginProvider === WEB3AUTH_SMS_PASSWORDLESS;

  return (
    <div style={{ maxWidth: 860, margin: "30px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>CustomAuth Next.js Example</h1>
      <p style={{ marginTop: 0 }}>Vue-like UI and flow with network, verifier, and UX mode.</p>

      {!privKey ? (
        <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
          <label>
            UX Mode
            <select value={formData.uxMode} onChange={(e) => setFormData((prev) => ({ ...prev, uxMode: e.target.value }))} style={{ width: "100%" }}>
              {uxModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Network
            <select
              value={formData.network}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  network: e.target.value as FormData["network"],
                  loginProvider: GOOGLE,
                }))
              }
              style={{ width: "100%" }}
            >
              {networkOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Verifier
            <select
              value={formData.loginProvider}
              onChange={(e) => setFormData((prev) => ({ ...prev, loginProvider: e.target.value }))}
              style={{ width: "100%" }}
            >
              {verifierOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {verifierMap[option.value]?.name || option.name}
                </option>
              ))}
            </select>
          </label>

          {showEmailHint && (
            <label>
              Email
              <input
                placeholder="Enter an email"
                value={formData.loginHint}
                onChange={(e) => setFormData((prev) => ({ ...prev, loginHint: e.target.value }))}
                style={{ width: "100%" }}
              />
            </label>
          )}

          {showPhoneHint && (
            <label>
              Phone
              <input
                placeholder="+{cc}-{number}"
                value={formData.loginHint}
                onChange={(e) => setFormData((prev) => ({ ...prev, loginHint: e.target.value }))}
                style={{ width: "100%" }}
              />
            </label>
          )}

          <button type="button" onClick={() => void onLogin()} disabled={!customAuthSdk}>
            Connect
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button type="button" onClick={() => onLoadUserInfo()}>
            User Info
          </button>
          <button type="button" onClick={() => printConsole("Console", {})}>
            Clear Console
          </button>
          <button type="button" onClick={() => onLogout()}>
            Logout
          </button>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <p>
          Please note that the verifiers listed in the example have <strong>http://localhost:3000/serviceworker/redirect</strong> configured as the
          redirect uri.
        </p>
        <p>If you use any other domains, they won't work.</p>
      </div>

      {privKey && (
        <div style={{ marginTop: 20 }}>
          <h3>{consoleTitle}</h3>
          {mounted ? <ReactJsonView value={consoleBody ? JSON.parse(consoleBody) : {}} style={{ textAlign: "left" }} /> : <pre>{consoleBody}</pre>}
        </div>
      )}
    </div>
  );
};

export default HomePage;
