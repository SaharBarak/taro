-- Security (audit HIGH): make treasury deposits idempotent per payment as
-- defense-in-depth. The primary fix is the atomic pending→completed claim in the
-- payment webhook (only one delivery runs fulfilment), but a unique index here
-- guarantees a payment can never credit the ledger twice even via a replay path:
-- record_treasury_deposit() increments balance then INSERTs the row in one
-- function (statement) context, so a duplicate INSERT raises and rolls back the
-- whole call — the balance increment with it. The caller treats it as non-fatal.

CREATE UNIQUE INDEX IF NOT EXISTS uq_treasury_tx_payment
  ON treasury_transactions (payment_id)
  WHERE payment_id IS NOT NULL;
