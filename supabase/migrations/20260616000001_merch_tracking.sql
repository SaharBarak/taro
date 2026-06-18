-- J6: POD fulfilment tracking. Once a paid order is handed to Printful it moves
-- to 'fulfilling'; Printful's package_shipped webhook then advances it to
-- 'shipped' and records the carrier + tracking so the thank-you page can show it.

ALTER TABLE merch_orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE merch_orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE merch_orders ADD COLUMN IF NOT EXISTS carrier TEXT;
