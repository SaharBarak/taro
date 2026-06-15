-- J8/B4: add free-text city to users (single-country pilot — country is implicitly ישראל).
-- Municipality stays the civic anchor; city is the human-readable, editable location
-- surfaced in the masthead chip and edited in /settings/profile.

ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
