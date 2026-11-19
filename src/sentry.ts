import type { Sentry } from "@toruslabs/http-helpers";

export default class SentryHandler {
  sentry: Sentry | null = null;

  constructor(sentry?: Sentry) {
    this.sentry = sentry ?? null;
  }

  startSpan<T>(context: Parameters<Sentry["startSpan"]>[0], callback: () => T): T {
    if (this.sentry) {
      return this.sentry.startSpan(context, callback);
    }
    return callback();
  }
}
