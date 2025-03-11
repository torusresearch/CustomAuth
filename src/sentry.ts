import type { Span, StartSpanOptions } from "@sentry/core";

export interface Sentry {
  startSpan<T>(context: StartSpanOptions, callback: (span: Span) => T): T;
}

export default class SentryHandler {
  sentry: Sentry | null = null;

  constructor(sentry?: Sentry) {
    this.sentry = sentry;
  }

  startSpan<T>(context: StartSpanOptions, callback: (span: Span) => T): T {
    if (this.sentry) {
      return this.sentry.startSpan(context, callback);
    }
    return callback(null);
  }
}
