import { getPublic, sign } from "@toruslabs/eccrypto";
import { get, post } from "@toruslabs/http-helpers";
import { decryptData, encryptData, keccak256 } from "@toruslabs/metadata-helpers";

import { REDIRECT_PARAMS_STORAGE_METHOD, REDIRECT_PARAMS_STORAGE_METHOD_TYPE } from "./enums";
import { are3PCSupported, storageAvailable } from "./helpers";
import { LoginDetails } from "./interfaces";
import log from "./loglevel";

class StorageHelper {
  private currentStorageMethod: REDIRECT_PARAMS_STORAGE_METHOD_TYPE = REDIRECT_PARAMS_STORAGE_METHOD.LOCAL_STORAGE;

  private isInitialized = false;

  private storageServerUrl = "https://session.web3auth.io";

  private localStorageAvailable: boolean = true;

  constructor(serverUrl: string) {
    this.storageServerUrl = serverUrl;
  }

  get storageMethodUsed(): REDIRECT_PARAMS_STORAGE_METHOD_TYPE {
    return this.currentStorageMethod;
  }

  init() {
    const support = are3PCSupported();
    const localStorageAvailable = storageAvailable(REDIRECT_PARAMS_STORAGE_METHOD.LOCAL_STORAGE);
    this.localStorageAvailable = localStorageAvailable;
    if (support && localStorageAvailable) {
      // use local storage as default for storing stuff
      this.currentStorageMethod = REDIRECT_PARAMS_STORAGE_METHOD.LOCAL_STORAGE;
    } else {
      // use server store as default for storing stuff
      this.currentStorageMethod = REDIRECT_PARAMS_STORAGE_METHOD.SERVER;
    }
    this.isInitialized = true;
  }

  async storeLoginDetails(params: LoginDetails, scope: string): Promise<void> {
    if (!this.isInitialized) throw new Error("StorageHelper is not initialized");
    if (this.currentStorageMethod === REDIRECT_PARAMS_STORAGE_METHOD.SERVER) {
      const privKey = keccak256(Buffer.from(scope, "utf8"));
      const privKeyHex = privKey.toString("hex");
      const publicKeyHex = getPublic(privKey).toString("hex");
      const encData = await encryptData(privKeyHex, params);
      const signature = (await sign(privKey, keccak256(Buffer.from(encData, "utf8")))).toString("hex");
      await post(`${this.storageServerUrl}/store/set`, { key: publicKeyHex, data: encData, signature });
    }
    if (this.localStorageAvailable) window.localStorage.setItem(`torus_login_${scope}`, JSON.stringify(params));
  }

  async retrieveLoginDetails(scope: string): Promise<LoginDetails> {
    if (!this.isInitialized) throw new Error("StorageHelper is not initialized");
    if (this.localStorageAvailable) {
      const loginDetails = window.localStorage.getItem(`torus_login_${scope}`);
      if (loginDetails) return JSON.parse(loginDetails || "{}") as LoginDetails;
    }
    if (this.currentStorageMethod === REDIRECT_PARAMS_STORAGE_METHOD.SERVER) {
      const privKey = keccak256(Buffer.from(scope, "utf8"));
      const privKeyHex = privKey.toString("hex");
      const publicKeyHex = getPublic(privKey).toString("hex");
      try {
        const encData: { message: string; success: boolean } = await get(`${this.storageServerUrl}/store/get?key=${publicKeyHex}`);
        if (encData.message) {
          const currentLoginDetails = await decryptData<LoginDetails>(privKeyHex, encData.message);
          return currentLoginDetails;
        }
      } catch (error) {
        if ((error as Response).status === 404) {
          log.warn(error, "Session likely expired");
        } else {
          throw error;
        }
      }
    }
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

export default StorageHelper;
