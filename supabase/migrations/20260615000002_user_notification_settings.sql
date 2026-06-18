-- J8/B3: persist per-user notification preferences (newVotes, voteEnding, voteResults, marketing).
-- Surfaced + edited at /settings/notifications.

ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_settings JSONB;
