import type { SpanContext, TransactionContext } from "@sentry/types";

interface SentryTx {
  startChild(a: SpanContext): {
    finish(): void;
  };
  finish(): void;
}
export interface Sentry {
  startTransaction(_: TransactionContext): SentryTx;
}
export default class SentryHandler {
  sentry: Sentry | null = null;

  constructor(sentry?: Sentry) {
    if (sentry) {
      this.sentry = sentry;
    }
  }

  startTransaction(context: TransactionContext): SentryTx | null {
    if (this.sentry) {
      return this.sentry.startTransaction(context);
    }
    return null;
  }

  finishTransaction(tx: SentryTx | null): void {
    if (tx) {
      tx.finish();
    }
  }
}
