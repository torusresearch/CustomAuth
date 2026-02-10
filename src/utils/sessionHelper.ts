import { SESSION_SERVER_API_URL } from "@toruslabs/constants";

import log from "./loglevel";
import { StorageHelper } from "./StorageHelper";

export async function fetchDataFromBroadcastServer<T>(identifier: string, storageServerUrl?: string) {
  try {
    const storageHelper = new StorageHelper<T>(storageServerUrl || SESSION_SERVER_API_URL);
    storageHelper.init();
    const data = await storageHelper.retrieveData(identifier);
    return data;
  } catch (error: unknown) {
    log.error("fetch data from storage server error", error);
    throw new Error("Unable to retrieve data from storage server, invalid key or key expired.");
  }
}
