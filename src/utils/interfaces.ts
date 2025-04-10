import { INodeDetails, TORUS_NETWORK_TYPE } from "@toruslabs/constants";
import { Sentry } from "@toruslabs/http-helpers";
import { KeyType, TorusKey } from "@toruslabs/torus.js";

import { AUTH_CONNECTION_TYPE, UX_MODE_TYPE } from "./enums";

export type TorusGenericObject = {
  [key: string]: string;
};

export type PopupResponse = {
  hashParams: { access_token: string; id_token?: string };
  instanceParams: TorusGenericObject;
};

export interface Auth0UserInfo {
  picture: string;
  email: string;
  name: string;
  sub: string;
  nickname: string;
}

export interface ExtraParams {
  [key: string]: unknown;
}

export type PasskeyExtraParams = {
  signature?: string;
  clientDataJSON?: string;
  authenticatorData?: string;
  publicKey?: string;
  challenge?: string;
  rpOrigin?: string;
  rpId?: string;
  credId?: string;
  transports?: AuthenticatorTransport[];
  username?: string;
};

export interface LoginWindowResponse {
  accessToken: string;
  idToken?: string;
  ref?: string;
  extraParams?: string;
  extraParamsPassed?: string;
  state: TorusGenericObject;
}

export interface TorusConnectionResponse {
  email: string;
  name: string;
  profileImage: string;
  groupedAuthConnectionId?: string;
  authConnectionId: string;
  userId: string;
  authConnection: AUTH_CONNECTION_TYPE;
  ref?: string;
  extraConnectionParams?: PasskeyExtraParams;
}

export type TorusUserInfo = {
  userInfo?: TorusConnectionResponse & LoginWindowResponse;
};

export type TorusLoginResponse = TorusUserInfo & TorusKey;

export interface CustomAuthArgs {
  /**
   * baseUrl , along with redirectPathName is used to construct the uri of page
   * where user will be redirected after login.
   *
   * @remarks
   * Redirect Uri for OAuth is `baseUrl`+`redirectPathName` which means
   * that you must specify `baseUrl`+`redirectPathName` as redirect_uri at connection's
   * interface.
   *
   * Torus Direct SDK installs a service worker relative to baseUrl to capture
   * the auth redirect at `redirectPathName` path.
   *
   * For ex: While using serviceworker if baseUrl is "http://localhost:3000/serviceworker" and
   * redirectPathName is 'redirect' (which is default)
   * then user will be redirected to http://localhost:3000/serviceworker/redirect page after login
   * where service worker will capture the results and send it back to original window where login
   * was initiated.
   *
   * Using serviceworker is optional, you can skip it by passing `skipSw` param
   * in init function
   *
   * Use of serviceworker is recommended if you are using popup uxMode or
   * for browsers where service workers are not supported or if you wish to not use
   * service workers, create and serve redirect page (i.e redirect.html file which is
   * available in serviceworker folder of this package)
   *
   * In redirect uxMode, you don't have to use serviceworker or redirect.html file.
   * You can get login result by calling `getRedirectResult` on redirected page mount.
   *
   * For ex: if baseUrl is "http://localhost:3000" and `redirectPathName` is 'auth'
   * then user will be redirected to http://localhost:3000/auth page after login
   * where you can get login result by calling `getRedirectResult` on redirected page mount.
   *
   * Please refer to examples https://github.com/torusresearch/customauth/tree/master/examples
   * for more understanding.
   *
   */
  baseUrl: string;

  /**
   * Specify a custom metadata host for legacy networks
   * @defaultValue https://metadata.tor.us
   */
  metadataUrl?: string;

  /**
   * Torus Network to target options: mainnet | testnet | cyan | aqua
   */
  network: TORUS_NETWORK_TYPE;

  /**
   * This option is used to specify whether to enable logging
   *
   * @defaultValue false
   */
  enableLogging?: boolean;

  /**
   * Use one key features
   *
   * @defaultValue false
   */
  enableOneKey?: boolean;

  /**
   * For chrome extensions, the general methods for capturing auth redirects don't work.
   * So, we redirect to the window which opens the auth window.
   *
   * @defaultValue false
   */
  redirectToOpener?: boolean;

  /**
   * This option is used to specify the url path where user will be
   * redirected after login. Redirect Uri for OAuth is baseUrl/redirectPathName.
   *
   *
   * @defaultValue redirect
   *
   * @remarks
   * At connection's interface (where you obtain client id), please use baseUrl/redirectPathName
   * as the redirect_uri
   *
   * Torus Direct SDK installs a service worker relative to baseUrl to capture
   * the auth redirect at `redirectPathName` path.
   *
   * For ex: While using serviceworker if `baseUrl` is "http://localhost:3000/serviceworker" and
   * `redirectPathName` is 'redirect' (which is default)
   * then user will be redirected to http://localhost:3000/serviceworker/redirect page after login
   * where service worker will capture the results and send it back to original window where login
   * was initiated.
   *
   * For browsers where service workers are not supported or if you wish to not use
   * service workers,create and serve redirect page (i.e redirect.html file which is
   * available in serviceworker folder of this package)
   *
   * If you are using redirect uxMode, you can get the results directly on your `redirectPathName`
   * path using `getRedirectResult` function.
   *
   * For ex: if baseUrl is "http://localhost:3000" and `redirectPathName` is 'auth'
   * then user will be redirected to http://localhost:3000/auth page after login
   * where you can get login result by calling `getRedirectResult` on redirected page mount.
   *
   * Please refer to examples https://github.com/torusresearch/customauth/tree/master/examples
   * for more understanding.
   *
   */
  redirectPathName?: string;

  /**
   * API Key for torus to enable higher access limits
   *
   */
  apiKey?: string;
  /**
   * Two uxModes are supported:-
   * - `'popup'`: In this uxMode, a popup will be shown to user for login.
   * - `'redirect'`: In this uxMode, user will be redirected to a new window tab for login.
   *
   * @defaultValue `'popup'`
   * @remarks
   *
   * Use of `'REDIRECT'` mode is recommended in browsers where popups might get blocked.
   */
  uxMode?: UX_MODE_TYPE;

  /**
   * Whether to replace the url hash/query params from OAuth at the end of the redirect flow
   *
   * @defaultValue false
   */
  locationReplaceOnRedirect?: boolean;

  /**
   * Features of popup window. Please check https://developer.mozilla.org/en-US/docs/Web/API/Window/open#window_features
   * for further documentation.
   */
  popupFeatures?: string;
  /**
   * Specify a custom storage server url
   * @defaultValue https://session.web3auth.io
   */
  storageServerUrl?: string;

  /**
   * Get your Client ID from Web3Auth Dashboard (https://dashboard.web3auth.io)
   */
  web3AuthClientId: string;

  /**
   * Time difference (in seconds) between server and client
   * @defaultValue 0
   */
  serverTimeOffset?: number;

  sentry?: Sentry;

  keyType?: KeyType;

  /**
   * Set this flag to false to generate keys on client side
   * by default keys are generated on using dkg protocol on a distributed network
   * @defaultValue undefined
   */
  useDkg?: boolean;

  nodeDetails?: INodeDetails;

  /**
   * Set this flag to false to remove check for commitment calls.
   *
   * @defaultValue true
   */
  checkCommitment?: boolean;
}

export interface InitParams {
  /**
   * skips the installation / check for service worker
   * @defaultValue false
   */
  skipSw?: boolean;

  /**
   * skips the init function
   * @defaultValue false
   */
  skipInit?: boolean;

  /**
   * skips the prefetching of redirect url
   * @defaultValue false
   *
   */
  skipPrefetch?: boolean;
}

// REGION: AUTH0 PARAMS
export interface BaseLoginOptions {
  /**
   * If you need to send custom parameters to the Authorization Server,
   * make sure to use the original parameter name.
   */
  [key: string]: unknown;
  /**
   * - `'none'`: do not prompt user for login or consent on reauthentication
   * - `'login'`: prompt user for reauthentication
   * - `'consent'`: prompt user for consent before processing request
   * - `'select_account'`: prompt user to select an account
   */
  prompt?: "none" | "login" | "consent" | "select_account" | string;
  /**
   * The space-separated list of language tags, ordered by preference.
   * For example: `'fr-CA fr en'`.
   */
  ui_locales?: string;
  /**
   * The user's email address or other identifier. When your app knows
   * which user is trying to authenticate, you can provide this parameter
   * to pre-fill the email box or select the right session for sign-in.
   *
   * This currently only affects the classic Lock experience.
   */
  login_hint?: string;
  /**
   * The default scope to be used on authentication requests.
   * The defaultScope defined in the Auth0Client is included
   * along with this scope
   */
  scope?: string;
  /**
   * The name of the connection configured for your application.
   * If null, it will redirect to the Auth0 Login Page and show
   * the Login Widget.
   */
  connection?: string;
}

export const EMAIL_FLOW = {
  link: "link",
  code: "code",
} as const;

export type EMAIL_FLOW_TYPE = (typeof EMAIL_FLOW)[keyof typeof EMAIL_FLOW];

export interface Auth0ClientOptions extends BaseLoginOptions {
  /**
   * Your Auth0 account domain such as `'example.auth0.com'`,
   * `'example.eu.auth0.com'` or , `'example.mycompany.com'`
   * (when using [custom domains](https://auth0.com/docs/custom-domains))
   */
  domain?: string;
  /**
   * The Client ID found on your Application settings page
   */
  client_id?: string;
  /**
   * The field in jwt token which maps to user id
   */
  userIdField?: string;

  /**
   * Whether the user id field is case sensitive
   * @defaultValue true
   */
  isUserIdCaseSensitive?: boolean;

  id_token?: string;

  access_token?: string;
  /**
   * The route for user info endpoint. This will be padded to domain
   * @defaultValue userinfo
   * */
  user_info_route?: string;

  /**
   * The flow type for email_passwordless login
   */
  flow_type?: EMAIL_FLOW_TYPE;
}

export interface CustomAuthLoginParams {
  authConnection: AUTH_CONNECTION_TYPE;
  authConnectionId: string;
  clientId: string;
  groupedAuthConnectionId?: string;
  jwtParams?: Auth0ClientOptions;
  hash?: string;
  queryParameters?: TorusGenericObject;
  customState?: TorusGenericObject;
}

export interface CreateHandlerParams {
  authConnection: AUTH_CONNECTION_TYPE;
  clientId: string;
  authConnectionId: string;
  redirect_uri: string;
  web3AuthClientId: string;
  web3AuthNetwork: TORUS_NETWORK_TYPE;
  groupedAuthConnectionId?: string;
  uxMode?: UX_MODE_TYPE;
  redirectToOpener?: boolean;
  jwtParams?: Auth0ClientOptions;
  customState?: TorusGenericObject;
}

export type LoginDetails = { args: CustomAuthLoginParams };

export interface RedirectResultParams {
  replaceUrl?: boolean;
  clearLoginDetails?: boolean;
  storageData?: LoginDetails;
}

export interface RedirectResult {
  result?: TorusLoginResponse | unknown;
  error?: string;
  state: Record<string, unknown>;
  hashParameters?: Record<string, string>;
  args: CustomAuthLoginParams;
}

export type AUTH0_CONNECTION_TYPE = "apple" | "github" | "linkedin" | "twitter" | "line";

export type VerifierParams = {
  verify_params?: {
    verifier_id: string;
    idtoken: string;
  }[];
  sub_verifier_ids?: string[];
  verifier_id: string;
};

export type PasskeySessionData = {
  verifier_id: string;
  signature: string;
  clientDataJSON: string;
  authenticatorData: string;
  publicKey: string;
  challenge: string;
  rpOrigin: string;
  rpId: string;
  credId: string;
  transports: AuthenticatorTransport[];
  username: string;
};

export interface ILoginHandler {
  params: CreateHandlerParams;
  nonce: string;
  finalURL: URL;
  getUserInfo(params: LoginWindowResponse, storageServerUrl?: string): Promise<TorusConnectionResponse>;
  handleLoginWindow(params: { locationReplaceOnRedirect?: boolean; popupFeatures?: string }): Promise<LoginWindowResponse>;
}
