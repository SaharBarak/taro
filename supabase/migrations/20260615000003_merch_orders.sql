-- J6: persist merch orders. The storefront/cart/checkout UI existed but orders
-- were built in memory and never saved; the Green Invoice webhook only logged.
-- This table is the source of truth: checkout inserts (status 'pending'), the
-- webhook flips it to 'paid' (idempotent), and the thank-you page reads it back.

CREATE TABLE IF NOT EXISTS merch_orders (
  id            UUID PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  items         JSONB NOT NULL,
  subtotal_ils  INTEGER NOT NULL,
  shipping_ils  INTEGER NOT NULL,
  total_ils     INTEGER NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'ILS',
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','paid','fulfilling','shipped','cancelled','failed')),
  shipping      JSONB NOT NULL,
  payment_id    TEXT,
  pod_order_id  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_merch_orders_user ON merch_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_merch_orders_status ON merch_orders(status);
