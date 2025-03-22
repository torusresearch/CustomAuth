import { SESSION_SERVER_API_URL } from "@toruslabs/constants";
import { getPublic, sign } from "@toruslabs/eccrypto";
import { post } from "@toruslabs/http-helpers";
import { decryptData, encryptData, keccak256 } from "@toruslabs/metadata-helpers";

import { REDIRECT_PARAMS_STORAGE_METHOD, REDIRECT_PARAMS_STORAGE_METHOD_TYPE } from "./enums";
import { storageAvailable } from "./helpers";
import log from "./loglevel";

export class StorageHelper<T> {
  private currentStorageMethod: REDIRECT_PARAMS_STORAGE_METHOD_TYPE = REDIRECT_PARAMS_STORAGE_METHOD.LOCAL_STORAGE;

  private isInitialized = false;

  private storageServerUrl = SESSION_SERVER_API_URL;

  private localStorageAvailable: boolean = true;

  constructor(serverUrl: string) {
    this.storageServerUrl = serverUrl;
  }

  get storageMethodUsed(): REDIRECT_PARAMS_STORAGE_METHOD_TYPE {
    return this.currentStorageMethod;
  }

  init() {
    // const support = are3PCSupported();
    const localStorageAvailable = storageAvailable(REDIRECT_PARAMS_STORAGE_METHOD.LOCAL_STORAGE);
    this.localStorageAvailable = localStorageAvailable;
    // if (support && localStorageAvailable) {
    //   // use local storage as default for storing stuff
    //   this.currentStorageMethod = REDIRECT_PARAMS_STORAGE_METHOD.LOCAL_STORAGE;
    // } else {
    //   // use server store as default for storing stuff
    //   this.currentStorageMethod = REDIRECT_PARAMS_STORAGE_METHOD.SERVER;
    // }
    this.isInitialized = true;
  }

  async storeLoginDetails(params: T, scope: string): Promise<void> {
    if (!this.isInitialized) throw new Error("StorageHelper is not initialized");
    if (this.localStorageAvailable) window.localStorage.setItem(`torus_login_${scope}`, JSON.stringify(params));
    // if (this.currentStorageMethod === REDIRECT_PARAMS_STORAGE_METHOD.SERVER) {
    const privKey = keccak256(Buffer.from(scope, "utf8"));
    const privKeyHex = privKey.toString("hex");
    const publicKeyHex = getPublic(privKey).toString("hex");
    const encData = await encryptData(privKeyHex, params);
    const signature = (await sign(privKey, keccak256(Buffer.from(encData, "utf8")))).toString("hex");
    await post(`${this.storageServerUrl}/v2/store/set`, { key: publicKeyHex, data: encData, signature, allowedOrigin: true });
    // }
  }

  async retrieveLoginDetails(scope: string): Promise<T> {
    if (!this.isInitialized) throw new Error("StorageHelper is not initialized");
    if (this.localStorageAvailable) {
      const loginDetails = window.localStorage.getItem(`torus_login_${scope}`);
      if (loginDetails) {
        this.currentStorageMethod = REDIRECT_PARAMS_STORAGE_METHOD.LOCAL_STORAGE;
        return JSON.parse(loginDetails || "{}") as T;
      }
    }
    // if (this.currentStorageMethod === REDIRECT_PARAMS_STORAGE_METHOD.SERVER) {
    this.currentStorageMethod = REDIRECT_PARAMS_STORAGE_METHOD.SERVER;
    const privKey = keccak256(Buffer.from(scope, "utf8"));
    const privKeyHex = privKey.toString("hex");
    const publicKeyHex = getPublic(privKey).toString("hex");
    try {
      const encData: { message: string; success: boolean } = await post(`${this.storageServerUrl}/v2/store/get`, { key: publicKeyHex });
      if (encData.message) {
        const data = await decryptData<T>(privKeyHex, encData.message);
        return data;
      }
    } catch (error) {
      if ((error as Response).status === 404) {
        log.warn(error, "Session likely expired");
      } else {
        throw error;
      }
    }
    // }
  }

  clearLoginDetailsStorage(scope: string): void {
    if (!this.isInitialized) throw new Error("StorageHelper is not initialized");
    if (this.localStorageAvailable) window.localStorage.removeItem(`torus_login_${scope}`);
    // No need to clear server details cause they auto expire and scope is never re-used for different login attempts
  }

  clearOrphanedLoginDetails(): void {
    if (!this.isInitialized) throw new Error("StorageHelper is not initialized");
    if (!this.localStorageAvailable) return;
    const allStorageKeys = Object.keys(window.localStorage);
    allStorageKeys.forEach((key) => {
      if (key.startsWith("torus_login_")) {
        window.localStorage.removeItem(key);
      }
    });
    // No need to clear server details cause they auto expire and scope is never re-used for different login attempts
  }
}
