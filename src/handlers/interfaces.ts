import {
  AGGREGATE_VERIFIER_TYPE,
  LOGIN_TYPE,
  REDIRECT_PARAMS_STORAGE_METHOD_TYPE,
  TORUS_METHOD_TYPE,
  TORUS_NETWORK_TYPE,
  UX_MODE_TYPE,
} from "../utils/enums";

export type PopupResponse = { hashParams: { access_token: string; id_token?: string }; instanceParams: { verifier: string } };

export interface Auth0UserInfo {
  picture: string;
  email: string;
  name: string;
  sub: string;
  nickname: string;
}

export interface extraParams {
  [key: string]: unknown;
}

export type WebAuthnExtraParams = {
  signature?: string;
  clientDataJSON?: string;
  authenticatorData?: string;
  publicKey?: string;
  challenge?: string;
  rpOrigin?: string;
};
export interface TorusVerifierResponse {
  email: string;
  name: string;
  profileImage: string;
  verifier: string;
  verifierId: string;
  typeOfLogin: LOGIN_TYPE;
  ref?: string;
  extraVerifierParams?: WebAuthnExtraParams;
}

export type TorusGenericObject = {
  [key: string]: string;
};
export interface LoginWindowResponse {
  accessToken: string;
  idToken?: string;
  ref?: string;
  extraParams?: string;
  extraParamsPassed?: string;
}

export interface ILoginHandler {
  clientId: string;
  nonce: string;
  finalURL: URL;
  getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse>;
  handleLoginWindow(): Promise<LoginWindowResponse>;
}

export interface TorusKey {
  publicAddress: string;
  privateKey: string;
}

export interface TorusAggregateVerifierResponse {
  userInfo: (TorusVerifierResponse & LoginWindowResponse)[];
}

export interface TorusSingleVerifierResponse {
  userInfo: TorusVerifierResponse & LoginWindowResponse;
}

export type TorusLoginResponse = TorusSingleVerifierResponse & TorusKey;
export type TorusAggregateLoginResponse = TorusAggregateVerifierResponse & TorusKey;
export type TorusHybridAggregateLoginResponse = { singleLogin: TorusLoginResponse; aggregateLogins: TorusKey[] };

export interface DirectWebSDKArgs {
  baseUrl: string;
  network?: TORUS_NETWORK_TYPE;
  proxyContractAddress?: string;
  enableLogging?: boolean;
  redirectToOpener?: boolean;
  redirectPathName?: string;
  apiKey?: string;
  uxMode?: UX_MODE_TYPE;
  redirectParamsStorageMethod?: REDIRECT_PARAMS_STORAGE_METHOD_TYPE;
}

export interface InitParams {
  skipSw?: boolean;
  skipInit?: boolean;
}

// REGION: AUTH0 PARAMS
export interface BaseLoginOptions {
  /**
   * - `'page'`: displays the UI with a full page view
   * - `'popup'`: displays the UI with a popup window
   * - `'touch'`: displays the UI in a way that leverages a touch interface
   * - `'wap'`: displays the UI with a "feature phone" type interface
   */
  display?: "page" | "popup" | "touch" | "wap" | string;
  /**
   * - `'none'`: do not prompt user for login or consent on reauthentication
   * - `'login'`: prompt user for reauthentication
   * - `'consent'`: prompt user for consent before processing request
   * - `'select_account'`: prompt user to select an account
   */
  prompt?: "none" | "login" | "consent" | "select_account" | string;
  /**
   * Maximum allowable elasped time (in seconds) since authentication.
   * If the last time the user authenticated is greater than this value,
   * the user must be reauthenticated.
   */
  max_age?: string | number;
  /**
   * The space-separated list of language tags, ordered by preference.
   * For example: `'fr-CA fr en'`.
   */
  ui_locales?: string;
  /**
   * Previously issued ID Token.
   */
  id_token_hint?: string;
  /**
   * The user's email address or other identifier. When your app knows
   * which user is trying to authenticate, you can provide this parameter
   * to pre-fill the email box or select the right session for sign-in.
   *
   * This currently only affects the classic Lock experience.
   */
  login_hint?: string;
  acr_values?: string;
  /**
   * The default scope to be used on authentication requests.
   * The defaultScope defined in the Auth0Client is included
   * along with this scope
   */
  scope?: string;
  /**
   * The default audience to be used for requesting API access.
   */
  audience?: string;
  /**
   * The name of the connection configured for your application.
   * If null, it will redirect to the Auth0 Login Page and show
   * the Login Widget.
   */
  connection?: string;

  /**
   * If you need to send custom parameters to the Authorization Server,
   * make sure to use the original parameter name.
   */
  [key: string]: unknown;
}

export interface Auth0ClientOptions extends BaseLoginOptions {
  /**
   * Your Auth0 account domain such as `'example.auth0.com'`,
   * `'example.eu.auth0.com'` or , `'example.mycompany.com'`
   * (when using [custom domains](https://auth0.com/docs/custom-domains))
   */
  domain: string;
  /**
   * The Client ID found on your Application settings page
   */
  client_id?: string;
  /**
   * The default URL where Auth0 will redirect your browser to with
   * the authentication result. It must be whitelisted in
   * the "Allowed Callback URLs" field in your Auth0 Application's
   * settings. If not provided here, it should be provided in the other
   * methods that provide authentication.
   */
  redirect_uri?: string;
  /**
   * The value in seconds used to account for clock skew in JWT expirations.
   * Typically, this value is no more than a minute or two at maximum.
   * Defaults to 60s.
   */
  leeway?: number;

  /**
   * The field in jwt token which maps to verifier id
   */
  verifierIdField?: string;

  /**
   * Whether the verifier id field is case sensitive
   * @default true
   */
  isVerifierIdCaseSensitive?: boolean;
}

export interface SubVerifierDetails {
  typeOfLogin: LOGIN_TYPE;
  verifier: string;
  clientId: string;
  jwtParams?: Auth0ClientOptions;
  hash?: string;
  queryParameters?: TorusGenericObject;
}
export interface CreateHandlerParams {
  typeOfLogin: LOGIN_TYPE;
  clientId: string;
  verifier: string;
  redirect_uri: string;
  redirectToOpener?: boolean;
  jwtParams?: Auth0ClientOptions;
  uxMode?: UX_MODE_TYPE;
}

export interface AggregateLoginParams {
  aggregateVerifierType: AGGREGATE_VERIFIER_TYPE;
  verifierIdentifier: string;
  subVerifierDetailsArray: SubVerifierDetails[];
}

export interface HybridAggregateLoginParams {
  singleLogin: SubVerifierDetails;
  aggregateLoginParams: AggregateLoginParams;
}

export interface RedirectResultParams {
  replaceUrl?: boolean;
}

export type LoginDetails = { method: TORUS_METHOD_TYPE; args: unknown };
export interface RedirectResult {
  method: TORUS_METHOD_TYPE;
  result: unknown;
}
