import type { Transaction, TransactionContext } from "@sentry/types";

import { SENTRY_TXNS } from "./utils/enums";

export interface Sentry {
  startTransaction(_: TransactionContext): Transaction;
}
export default class SentryHandler {
  sentry: Sentry | null = null;

  chainUrl = "";

  constructor(sentry?: Sentry, chainUrl?: string) {
    this.sentry = sentry;
    this.chainUrl = chainUrl;
  }

  startTransaction(context: TransactionContext): Transaction | void {
    if (this.sentry) {
      if (context.name === SENTRY_TXNS.FETCH_NODE_DETAILS && this.chainUrl) {
        context.name += this.chainUrl;
      }
      return this.sentry.startTransaction(context);
    }
  }

  finishTransaction(tx: void | Transaction): void {
    if (tx) {
      tx.finish();
    }
  }
}
