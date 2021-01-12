import { BrowserClient, Hub } from "@sentry/browser";
import loglevel from "loglevel";

const dsn = process.env.SENTRY_DSN;
if (!dsn) {
  throw new Error("Sentry DSN is not set.");
}

const sentry = new Hub(
  new BrowserClient({
    dsn,
    sampleRate: 1,
  })
);

const log = loglevel.getLogger("torus-direct-web-sdk");

// Hook Sentry into log.error.
const originalFactory = log.methodFactory;
log.methodFactory = (method, level, name) => {
  if (method === "error") {
    return (err) => {
      sentry.captureException(err);
    };
  }
  return originalFactory(method, level, name);
};

log.setLevel(log.getLevel()); // Apply changes.

export default log;
