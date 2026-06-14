-- Paddle Payment Provider Migration
--
-- Switches the payment processor from Green Invoice to Paddle (Merchant of Record).
-- Paddle collects ILS from voters and settles fiat to the platform bank account.
-- Per-vote ILS is accrued in the treasury ledger and batch-seeded into a Bags.fm
-- bag at vote resolution.

-- New payments default to the 'paddle' provider.
ALTER TABLE payments ALTER COLUMN provider SET DEFAULT 'paddle';

-- Backfill is intentionally NOT applied: historical rows keep their original
-- provider value for audit fidelity. New rows are 'paddle'.

COMMENT ON COLUMN payments.provider IS 'Payment processor: ''paddle'' (current) or ''green_invoice'' (legacy/historical rows).';
