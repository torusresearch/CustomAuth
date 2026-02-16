import { SessionManager } from "@toruslabs/session-manager";
import log from "loglevel";

export async function fetchDataFromBroadcastServer<T>(identifier: string, storageServerUrl?: string) {
  try {
    const configManager = new SessionManager<T>({
      sessionId: identifier,
      sessionServerBaseUrl: storageServerUrl,
      allowedOrigin: true,
      useLocalStorage: true,
    });

    const data = await configManager.authorizeSession();
    return data;
  } catch (error: unknown) {
    log.error("fetch data from storage server error", error);
    throw new Error("Unable to retrieve data from storage server, invalid key or key expired.");
  }
}
