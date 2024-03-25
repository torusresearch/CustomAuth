import type { Transaction, TransactionContext } from "@sentry/types";

export interface Sentry {
  startTransaction(_: TransactionContext): Transaction;
}
export default class SentryHandler {
  sentry: Sentry | null = null;

  constructor(sentry?: Sentry) {
    this.sentry = sentry;
  }

  startTransaction(context: TransactionContext): Transaction | void {
    if (this.sentry) {
      return this.sentry.startTransaction(context);
    }
  }

  finishTransaction(tx: void | Transaction): void {
    if (tx) {
      tx.finish();
    }
  }
}
