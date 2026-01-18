-- Vote NFTs and Resolution Tables
--
-- Purpose: Support NFT minting for vote participants after vote resolution.
-- When a vote concludes, commemorative NFTs are minted for all participants:
-- - "Verified Voter" NFT for verified Taruu residents who voted
-- - "Civic Patron" NFT for external supporters who purchased Issue Coins
--
-- Tables:
-- - vote_nfts: NFT minting records for vote participants
--
-- Schema changes:
-- - votes table: Add resolved_at, resolution_status columns
--
-- Why this matters:
-- - Commemorates civic participation with on-chain proof
-- - Differentiates resident voters from external supporters
-- - Creates collectible history of civic engagement

-- =============================================================================
-- VOTE STATUS ENUM UPDATE
-- =============================================================================
-- Add 'resolving' and 'resolved' to vote_status enum
-- This enables tracking the resolution process state machine

DO $$
BEGIN
  -- Add 'resolving' status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'resolving'
    AND enumtypid = 'vote_status'::regtype
  ) THEN
    ALTER TYPE vote_status ADD VALUE 'resolving' AFTER 'ended';
  END IF;

  -- Add 'resolved' status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'resolved'
    AND enumtypid = 'vote_status'::regtype
  ) THEN
    ALTER TYPE vote_status ADD VALUE 'resolved' AFTER 'resolving';
  END IF;

  -- Add 'failed' status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'failed'
    AND enumtypid = 'vote_status'::regtype
  ) THEN
    ALTER TYPE vote_status ADD VALUE 'failed' AFTER 'resolved';
  END IF;
END
$$;

-- =============================================================================
-- VOTES TABLE UPDATES
-- =============================================================================
-- Add columns for tracking vote resolution

-- Resolution timestamp
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Resolution status - tracks the resolution process state machine
-- Note: Using separate column from status to not break existing vote_status enum usage
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS resolution_status TEXT CHECK (resolution_status IN (
  'pending',    -- Vote ended, awaiting resolution
  'resolving',  -- Currently processing resolution
  'resolved',   -- Successfully resolved, NFTs minted
  'failed'      -- Resolution failed, needs manual intervention
));

-- Index for finding votes that need resolution
CREATE INDEX IF NOT EXISTS idx_votes_needs_resolution
ON votes(end_date, status)
WHERE status = 'active' OR status = 'ended';

-- Index for finding resolved votes
CREATE INDEX IF NOT EXISTS idx_votes_resolved
ON votes(resolved_at)
WHERE resolved_at IS NOT NULL;

-- =============================================================================
-- NFT TYPE ENUM
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nft_type') THEN
    CREATE TYPE nft_type AS ENUM ('verified_voter', 'civic_patron');
  END IF;
END
$$;

-- =============================================================================
-- VOTE NFTS TABLE
-- =============================================================================
-- Records all NFTs minted for vote participants

CREATE TABLE IF NOT EXISTS vote_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE RESTRICT,

  -- Holder identification (one of these must be set)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,      -- Internal Taruu user
  wallet_address TEXT,                                         -- External Solana wallet

  -- NFT type determines the minted NFT variety
  type nft_type NOT NULL,

  -- Blockchain data
  mint_address TEXT UNIQUE,            -- Solana NFT mint address (null until minted)
  metadata_uri TEXT,                   -- IPFS/Arweave metadata URI

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Awaiting minting
    'minting',    -- Currently being minted
    'minted',     -- Successfully minted
    'failed'      -- Minting failed
  )),

  -- Minting details
  minted_at TIMESTAMPTZ,               -- When NFT was successfully minted
  mint_tx_hash TEXT,                   -- Solana transaction hash
  error_message TEXT,                  -- Error message if minting failed
  retry_count INTEGER DEFAULT 0,       -- Number of minting retry attempts

  -- Metadata snapshot at mint time
  metadata JSONB,                      -- Snapshot of NFT metadata

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Either user_id or wallet_address must be set
  CONSTRAINT chk_nft_holder_identity CHECK (
    user_id IS NOT NULL OR wallet_address IS NOT NULL
  ),

  -- Prevent duplicate NFTs for same holder/vote combination
  CONSTRAINT uq_vote_nft_holder UNIQUE (vote_id, user_id, wallet_address)
);

-- Indexes for vote_nfts
CREATE INDEX IF NOT EXISTS idx_vote_nfts_vote ON vote_nfts(vote_id);
CREATE INDEX IF NOT EXISTS idx_vote_nfts_user ON vote_nfts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vote_nfts_wallet ON vote_nfts(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vote_nfts_type ON vote_nfts(type);
CREATE INDEX IF NOT EXISTS idx_vote_nfts_status ON vote_nfts(status) WHERE status != 'minted';
CREATE INDEX IF NOT EXISTS idx_vote_nfts_pending ON vote_nfts(vote_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_vote_nfts_mint ON vote_nfts(mint_address) WHERE mint_address IS NOT NULL;

-- Trigger to update updated_at timestamp
CREATE TRIGGER tr_vote_nfts_updated_at
  BEFORE UPDATE ON vote_nfts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE vote_nfts ENABLE ROW LEVEL SECURITY;

-- NFTs are publicly readable (users can view vote NFT galleries)
CREATE POLICY "Vote NFTs are publicly readable"
  ON vote_nfts
  FOR SELECT
  USING (true);

-- Service role has full access for backend minting operations
CREATE POLICY "Service role full access to vote_nfts"
  ON vote_nfts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get NFT counts for a vote
CREATE OR REPLACE FUNCTION get_vote_nft_stats(p_vote_id UUID)
RETURNS TABLE (
  total INTEGER,
  verified_voters INTEGER,
  civic_patrons INTEGER,
  minted INTEGER,
  pending INTEGER,
  failed INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total,
    COUNT(*) FILTER (WHERE type = 'verified_voter')::INTEGER as verified_voters,
    COUNT(*) FILTER (WHERE type = 'civic_patron')::INTEGER as civic_patrons,
    COUNT(*) FILTER (WHERE status = 'minted')::INTEGER as minted,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as failed
  FROM vote_nfts
  WHERE vote_id = p_vote_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user has NFT for a vote
CREATE OR REPLACE FUNCTION user_has_vote_nft(p_user_id UUID, p_vote_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vote_nfts
    WHERE user_id = p_user_id
    AND vote_id = p_vote_id
    AND status = 'minted'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_vote_nft_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_vote_nft_stats(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION user_has_vote_nft(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_vote_nft(UUID, UUID) TO service_role;

-- =============================================================================
-- DOCUMENTATION COMMENTS
-- =============================================================================

COMMENT ON TABLE vote_nfts IS 'NFT minting records for vote participants. Each record represents a commemorative NFT awarded after vote resolution.';
COMMENT ON COLUMN vote_nfts.type IS 'NFT type: verified_voter for Taruu residents, civic_patron for external supporters';
COMMENT ON COLUMN vote_nfts.mint_address IS 'Solana NFT mint address, null until minting is complete';
COMMENT ON COLUMN vote_nfts.metadata_uri IS 'IPFS or Arweave URI containing NFT metadata JSON';
COMMENT ON COLUMN vote_nfts.status IS 'Minting status: pending -> minting -> minted (or failed)';
COMMENT ON COLUMN vote_nfts.metadata IS 'Snapshot of NFT metadata at mint time for historical accuracy';
COMMENT ON COLUMN votes.resolved_at IS 'Timestamp when vote resolution completed and NFTs were minted';
COMMENT ON COLUMN votes.resolution_status IS 'Resolution process state: pending, resolving, resolved, or failed';
