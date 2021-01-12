import { BrowserClient, Hub } from "@sentry/browser";
import loglevel from "loglevel";

const log = loglevel.getLogger("torus-direct-web-sdk");

export default log;

let sentry: Hub;

export const enableErrorTracking = (): void => {
  if (process.env.NODE_ENV !== "production") return; // Always disabled in development.
  if (sentry) return; // Already setup.

  // Setup Sentry.
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) throw new Error("Sentry DSN is not set.");
  sentry = new Hub(
    new BrowserClient({
      dsn,
      release: process.env.SENTRY_RELEASE,
      sampleRate: 1,
    })
  );

  // Hook Sentry into log.error.
  const defaultFactory = log.methodFactory;
  log.methodFactory = (method, level, name) => {
    if (method === "error") {
      return (err) => {
        sentry.captureException(err);
      };
    }
    return defaultFactory(method, level, name);
  };

  // Apply changes.
  log.setLevel(log.getLevel());
};
