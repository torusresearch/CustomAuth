import { BrowserClient, Hub, Severity } from "@sentry/browser";

import log from "./loglevel";

let hub: Hub;

const sentry = {
  enable(): void {
    if (process.env.NODE_ENV !== "production") return; // Always disabled in development.
    if (hub) return; // Already setup.

    const dsn = process.env.SENTRY_DSN;
    if (!dsn) throw new Error("Sentry DSN is not set.");
    hub = new Hub(
      new BrowserClient({
        dsn,
        release: process.env.SENTRY_RELEASE,
        sampleRate: 1,
      })
    );

    // Intercept log functions.
    const defaultLogFactory = log.methodFactory;
    log.methodFactory = (method, level, name) => {
      switch (method) {
        case "trace":
        case "info":
          return (...msgs: unknown[]) => {
            hub.addBreadcrumb({
              category: name.toString(),
              level: method === "info" ? Severity.Info : Severity.Debug,
              data: msgs,
              timestamp: Date.now(),
            });
          };
        case "error":
          return (err) => {
            hub.captureException(err);
          };
        default:
          return defaultLogFactory(method, level, name);
      }
    };
    log.setLevel(log.getLevel());
  },
};

export default sentry;
