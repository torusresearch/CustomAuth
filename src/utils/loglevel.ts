import Sentry from "@toruslabs/loglevel-sentry";
import loglevel from "loglevel";

const logger = loglevel.getLogger("torus-direct-web-sdk");

export const sentry = new Sentry({
  dsn: "https://c806006328f941cc8e4da01bf9d3009d@o503538.ingest.sentry.io/5588794",
  release: process.env.SENTRY_RELEASE,
  sampleRate: 0.5,
});
sentry.install(logger);

export default logger;
