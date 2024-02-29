import { OpenloginSessionManager } from "@toruslabs/openlogin-session-manager";
import log from "loglevel";

export async function fetchDataFromBroadcastServer<T>(identifier: string) {
  try {
    const configManager = new OpenloginSessionManager<T>({
      sessionId: identifier,
      sessionNamespace: "",
    });

    const data = await configManager.authorizeSession();
    return data;
  } catch (error: unknown) {
    log.error("fetch data from storage server error", error);
    throw new Error("Unable to retrieve data from storage server, invalid key or key expired.");
  }
}
