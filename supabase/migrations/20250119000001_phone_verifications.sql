-- Phone Verification Tables
--
-- Purpose: Support SMS-based phone verification for user identity.
-- Phone verification adds an additional layer of identity verification:
-- - Provides sybil resistance (harder to create multiple fake accounts)
-- - Validates users have Israeli phone numbers (+972)
-- - Tracks verification attempts for rate limiting
--
-- Tables:
-- - phone_verifications: Tracks phone verification status and attempts
--
-- Schema changes:
-- - users table: Add phone_verified, phone_verified_at columns
--
-- Why this matters:
-- - Increases trust in user identity
-- - Helps prevent abuse through rate-limited SMS
-- - Provides secondary verification alongside GPS

-- =============================================================================
-- USERS TABLE UPDATES
-- =============================================================================
-- Add columns for phone verification status

-- Phone verified status
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Phone verification timestamp
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- Index for finding users by phone verification status
CREATE INDEX IF NOT EXISTS idx_users_phone_verified
ON users(phone_verified)
WHERE phone_verified = true;

-- =============================================================================
-- PHONE VERIFICATIONS TABLE
-- =============================================================================
-- Tracks phone verification attempts and status

CREATE TABLE IF NOT EXISTS phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Phone number (E.164 format, e.g., +972501234567)
  phone TEXT NOT NULL,

  -- Verification status
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Rate limiting / attempt tracking
  attempts INTEGER DEFAULT 0,           -- Number of code verification attempts
  send_attempts INTEGER DEFAULT 0,       -- Number of SMS send attempts
  last_attempt_at TIMESTAMPTZ,           -- Last verification attempt
  last_send_at TIMESTAMPTZ,              -- Last SMS send time

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One verification record per user
  CONSTRAINT uq_phone_verifications_user UNIQUE (user_id)
);

-- Indexes for phone_verifications
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone
ON phone_verifications(phone);

CREATE INDEX IF NOT EXISTS idx_phone_verifications_user
ON phone_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_phone_verifications_verified
ON phone_verifications(verified)
WHERE verified = true;

-- Index for rate limiting queries (find recent attempts)
CREATE INDEX IF NOT EXISTS idx_phone_verifications_last_send
ON phone_verifications(last_send_at)
WHERE last_send_at IS NOT NULL;

-- Trigger to update updated_at timestamp
CREATE TRIGGER tr_phone_verifications_updated_at
  BEFORE UPDATE ON phone_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own phone verification status
CREATE POLICY "Users can read own phone verification"
  ON phone_verifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role has full access for backend verification operations
CREATE POLICY "Service role full access to phone_verifications"
  ON phone_verifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to check if user can send another verification SMS (rate limiting)
-- Returns true if allowed, false if rate limited
CREATE OR REPLACE FUNCTION can_send_phone_verification(
  p_user_id UUID,
  p_phone TEXT,
  p_max_per_hour INTEGER DEFAULT 3,
  p_max_per_day INTEGER DEFAULT 5
)
RETURNS JSONB AS $$
DECLARE
  v_last_send TIMESTAMPTZ;
  v_hourly_count INTEGER;
  v_daily_count INTEGER;
  v_phone_hourly_count INTEGER;
BEGIN
  -- Get user's last send time and counts
  SELECT
    last_send_at,
    send_attempts
  INTO v_last_send, v_daily_count
  FROM phone_verifications
  WHERE user_id = p_user_id;

  -- Count hourly sends for this user
  SELECT COALESCE(
    (SELECT send_attempts FROM phone_verifications
     WHERE user_id = p_user_id
     AND last_send_at > NOW() - INTERVAL '1 hour'),
    0
  ) INTO v_hourly_count;

  -- Count hourly sends for this phone number (across all users)
  SELECT COUNT(*) INTO v_phone_hourly_count
  FROM phone_verifications
  WHERE phone = p_phone
  AND last_send_at > NOW() - INTERVAL '1 hour';

  -- Check rate limits
  IF v_hourly_count >= p_max_per_hour THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'hourly_limit',
      'retry_after', EXTRACT(EPOCH FROM (v_last_send + INTERVAL '1 hour' - NOW()))::INTEGER
    );
  END IF;

  IF v_phone_hourly_count >= p_max_per_hour THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'phone_hourly_limit',
      'retry_after', 3600
    );
  END IF;

  IF v_daily_count >= p_max_per_day THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'daily_limit',
      'retry_after', EXTRACT(EPOCH FROM (v_last_send + INTERVAL '1 day' - NOW()))::INTEGER
    );
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user can attempt another code verification
-- Returns true if allowed, false if rate limited
CREATE OR REPLACE FUNCTION can_verify_phone_code(
  p_user_id UUID,
  p_max_attempts INTEGER DEFAULT 5
)
RETURNS JSONB AS $$
DECLARE
  v_attempts INTEGER;
  v_last_attempt TIMESTAMPTZ;
BEGIN
  SELECT attempts, last_attempt_at
  INTO v_attempts, v_last_attempt
  FROM phone_verifications
  WHERE user_id = p_user_id;

  -- No verification record exists
  IF v_attempts IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'no_pending_verification'
    );
  END IF;

  -- Reset attempts if last attempt was more than 10 minutes ago
  IF v_last_attempt IS NOT NULL AND v_last_attempt < NOW() - INTERVAL '10 minutes' THEN
    RETURN jsonb_build_object('allowed', true);
  END IF;

  -- Check attempt limit
  IF v_attempts >= p_max_attempts THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'too_many_attempts',
      'retry_after', EXTRACT(EPOCH FROM (v_last_attempt + INTERVAL '10 minutes' - NOW()))::INTEGER
    );
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to record a verification SMS send
CREATE OR REPLACE FUNCTION record_phone_verification_send(
  p_user_id UUID,
  p_phone TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO phone_verifications (user_id, phone, send_attempts, last_send_at)
  VALUES (p_user_id, p_phone, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    phone = p_phone,
    send_attempts = phone_verifications.send_attempts + 1,
    last_send_at = NOW(),
    -- Reset verification attempts when sending new code
    attempts = 0,
    verified = false,
    verified_at = NULL,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to record a verification code attempt
CREATE OR REPLACE FUNCTION record_phone_verification_attempt(
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE phone_verifications
  SET
    attempts = attempts + 1,
    last_attempt_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark phone as verified
CREATE OR REPLACE FUNCTION mark_phone_verified(
  p_user_id UUID,
  p_phone TEXT
)
RETURNS void AS $$
BEGIN
  -- Update phone_verifications table
  UPDATE phone_verifications
  SET
    verified = true,
    verified_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Update users table
  UPDATE users
  SET
    phone = p_phone,
    phone_verified = true,
    phone_verified_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION can_send_phone_verification(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION can_send_phone_verification(UUID, TEXT, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION can_verify_phone_code(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION can_verify_phone_code(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION record_phone_verification_send(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION record_phone_verification_attempt(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION mark_phone_verified(UUID, TEXT) TO service_role;

-- =============================================================================
-- DOCUMENTATION COMMENTS
-- =============================================================================

COMMENT ON TABLE phone_verifications IS 'Tracks phone verification status and attempts. Each user has at most one record.';
COMMENT ON COLUMN phone_verifications.phone IS 'Phone number in E.164 format (e.g., +972501234567)';
COMMENT ON COLUMN phone_verifications.attempts IS 'Number of verification code attempts (resets on new code send)';
COMMENT ON COLUMN phone_verifications.send_attempts IS 'Total number of SMS codes sent (for rate limiting)';
COMMENT ON COLUMN phone_verifications.last_send_at IS 'When the last verification SMS was sent';
COMMENT ON COLUMN phone_verifications.last_attempt_at IS 'When the last code verification was attempted';
COMMENT ON COLUMN users.phone_verified IS 'Whether the user has verified their phone number';
COMMENT ON COLUMN users.phone_verified_at IS 'When the phone was verified';
