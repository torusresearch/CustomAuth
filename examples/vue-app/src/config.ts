import { TORUS_LEGACY_NETWORK, TORUS_NETWORK_TYPE, TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { UX_MODE, UX_MODE_TYPE } from "@toruslabs/customauth";

export const GOOGLE = "google";
export const FACEBOOK = "facebook";
export const REDDIT = "reddit";
export const TELEGRAM = "telegram";
export const DISCORD = "discord";
export const TWITCH = "twitch";
export const GITHUB = "github";
export const APPLE = "apple";
export const LINKEDIN = "linkedin";
export const TWITTER = "twitter";
export const WEIBO = "weibo";
export const LINE = "line";
export const EMAIL_PASSWORD = "email_password";
export const PASSKEYS_LOGIN = "passkeys_login";
export const PASSKEYS_REGISTER = "passkeys_register";
export const COGNITO = "cognito";
export const AUTH_DOMAIN = "https://torus-test.auth0.com";
export const COGNITO_AUTH_DOMAIN = "https://torus-test.auth.ap-southeast-1.amazoncognito.com/oauth2/";
export const WEB3AUTH_EMAIL_PASSWORDLESS = "email_passwordless";
export const WEB3AUTH_SMS_PASSWORDLESS = "sms_passwordless";
export const uxModeOptions = Object.values(UX_MODE).map((x) => ({ name: x, value: x }));
export const WEB3AUTH_CLIENT_ID = "BJ6l3_kIQiy6YVL7zDlCcEAvGpGukwFgp-C_0WvNI_fAEeIaoVRLDrV5OjtbZr_zJxbyXFsXMT-yhQiUNYvZWpo";

export interface LoginProviderItem {
  name: string;
  typeOfLogin: string;
  clientId: string;
  verifier: string;
}

export const testnetVerifierMap = {
  [GOOGLE]: {
    name: "Google",
    typeOfLogin: "google",
    clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",
    verifier: "google-lrc",
  },
  [TELEGRAM]: {
    name: "Telegram",
    typeOfLogin: "telegram",
    clientId: "7696397063",
    verifier: "test-telegram-4",
  },
  [FACEBOOK]: { name: "Facebook", typeOfLogin: "facebook", clientId: "617201755556395", verifier: "facebook-lrc" },
  [REDDIT]: { name: "Reddit", typeOfLogin: "custom", clientId: "RKlRuuRoDKOItbJSoOZabDLzizvd1uKn", verifier: "torus-reddit-test" },
  [TWITCH]: { name: "Twitch", typeOfLogin: "twitch", clientId: "f5and8beke76mzutmics0zu4gw10dj", verifier: "twitch-lrc" },
  [DISCORD]: { name: "Discord", typeOfLogin: "discord", clientId: "682533837464666198", verifier: "discord-lrc" },
  [APPLE]: { name: "Apple", typeOfLogin: "apple", clientId: "m1Q0gvDfOyZsJCZ3cucSQEe9XMvl9d9L", verifier: "torus-auth0-apple-lrc" },
  [GITHUB]: { name: "Github", typeOfLogin: "github", clientId: "PC2a4tfNRvXbT48t89J5am0oFM21Nxff", verifier: "torus-auth0-github-lrc" },
  [LINKEDIN]: { name: "Linkedin", typeOfLogin: "linkedin", clientId: "59YxSgx79Vl3Wi7tQUBqQTRTxWroTuoc", verifier: "torus-auth0-linkedin-lrc" },
  [TWITTER]: { name: "Twitter", typeOfLogin: "twitter", clientId: "A7H8kkcmyFRlusJQ9dZiqBLraG2yWIsO", verifier: "torus-auth0-twitter-lrc" },
  [WEIBO]: { name: "Weibo", typeOfLogin: "weibo", clientId: "dhFGlWQMoACOI5oS5A1jFglp772OAWr1", verifier: "torus-auth0-weibo-lrc" },
  [LINE]: { name: "Line", typeOfLogin: "line", clientId: "WN8bOmXKNRH1Gs8k475glfBP5gDZr9H1", verifier: "torus-auth0-line-lrc" },
  [COGNITO]: {
    name: "Cognito",
    typeOfLogin: "custom",
    clientId: "78i338ev9lkgjst3mfeuih9tsh",
    verifier: "demo-cognito-example",
  },
  [WEB3AUTH_EMAIL_PASSWORDLESS]: {
    name: "Web3Auth Email Passwordless",
    typeOfLogin: "email_passwordless",
    clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
    verifier: "torus-auth0-email-passwordless-lrc",
  },
  [WEB3AUTH_SMS_PASSWORDLESS]: {
    name: "Web3Auth Sms Passwordless",
    typeOfLogin: "sms_passwordless",
    clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
    verifier: "torus-sms-passwordless-lrc",
  },
} as Record<string, LoginProviderItem>;

export const sapphireDevnetVerifierMap = {
  [GOOGLE]: {
    name: "Google",
    typeOfLogin: "google",
    clientId: "221898609709-qnfklddleh1m1m7bq6g8d8dakffp0n86.apps.googleusercontent.com",
    verifier: "web3auth-google-sapphire-devnet",
  },
  [TELEGRAM]: {
    name: "Telegram",
    typeOfLogin: "telegram",
    clientId: "7696397063",
    verifier: "test-telegram-4",
  },
  [FACEBOOK]: { name: "Facebook", typeOfLogin: "facebook", clientId: "226597929760394", verifier: "web3auth-facebook-sapphire-devnet" },
  [REDDIT]: {
    name: "Reddit",
    typeOfLogin: "custom",
    clientId: "XfiFWQbsZ9t5WQ4TfzHWZOpEghkNskko",
    verifier: "web3auth-auth0-reddit-sapphire-devnet",
  },
  [TWITCH]: { name: "Twitch", typeOfLogin: "twitch", clientId: "94nxxpy7inarina6kc9hyg2ao3mja2", verifier: "web3auth-twitch-sapphire-devnet" },
  [DISCORD]: { name: "Discord", typeOfLogin: "discord", clientId: "1126902533936394330", verifier: "web3auth-discord-sapphire-devnet" },
  [APPLE]: { name: "Apple", typeOfLogin: "apple", clientId: "ADG0f0EZsBHvcbu2in7W938XngxJQJrJ", verifier: "web3auth-auth0-apple-sapphire-devnet" },
  [GITHUB]: {
    name: "Github",
    typeOfLogin: "github",
    clientId: "srB1w8yWLtvD8QFqp4FgzAPHkmJ6FU5M",
    verifier: "web3auth-auth0-github-sapphire-devnet",
  },
  [LINKEDIN]: {
    name: "Linkedin",
    typeOfLogin: "linkedin",
    clientId: "gCzESkrR2LZDQS1gZIARcRzWvayFUWjv",
    verifier: "web3auth-auth0-linkedin-sapphire-devnet",
  },
  [TWITTER]: {
    name: "Twitter",
    typeOfLogin: "twitter",
    clientId: "wz4w3pdutXsbmWltyUJjq1pyaoF0GBxW",
    verifier: "web3auth-auth0-twitter-sapphire-devnet",
  },
  [WEIBO]: { name: "Weibo", typeOfLogin: "weibo", clientId: "X3BSYMr3BVZFVls6XOEMZ4VdOTW58mQZ", verifier: "web3auth-auth0-weibo-sapphire-devnet" },
  [LINE]: { name: "Line", typeOfLogin: "line", clientId: "AUDHMShLlzzS15cb9F8IjYQHBbfWO5iB", verifier: "web3auth-auth0-line-sapphire-devnet" },
  [WEB3AUTH_EMAIL_PASSWORDLESS]: {
    name: "Web3Auth Email Passwordless",
    typeOfLogin: "email_passwordless",
    clientId: "d84f6xvbdV75VTGmHiMWfZLeSPk8M07C",
    verifier: "web3auth-auth0-email-passwordless-sapphire-devnet",
  },
  [WEB3AUTH_SMS_PASSWORDLESS]: {
    name: "Web3Auth Sms Passwordless",
    typeOfLogin: "sms_passwordless",
    clientId: "4jK24VpfepWRSe5EMdd2if0RBD55pAuA",
    verifier: "web3auth-auth0-sms-passwordless-sapphire-devnet",
  },
} as Record<string, LoginProviderItem>;

export const sapphireDevnetVerifierOptions = Object.entries(sapphireDevnetVerifierMap).map(([key]) => ({ name: key, value: key }));
export const testnetVerifierOptions = Object.entries(testnetVerifierMap).map(([key]) => ({ name: key, value: key }));

export type FormData = {
  uxMode: UX_MODE_TYPE;
  loginProvider: string;
  loginHint: string;
  network: TORUS_NETWORK_TYPE;
};

export const networkList = [TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET, TORUS_LEGACY_NETWORK.TESTNET];
export const networkOptions = networkList.map((x) => ({ name: x, value: x }));
