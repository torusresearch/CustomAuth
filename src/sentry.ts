import type { Span, StartSpanOptions } from "@sentry/types";

export interface Sentry {
  startSpan<T>(context: StartSpanOptions, callback: (span: Span) => T): T;
}
