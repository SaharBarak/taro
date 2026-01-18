# NFT System Specification

**Status:** NOT IMPLEMENTED
**Last Updated:** January 18, 2025 (v77)
**Blockchain:** Solana (via Bags.fm)

---

## Overview

When a vote concludes, the system mints commemorative NFTs for all participants. There are two types of NFTs based on participant type:
- **Verified Voter NFT** - For verified Taruu residents who voted
- **Civic Patron NFT** - For external supporters who purchased Issue Coins

## Vote Resolution Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Vote Ends  │────▶│   Freeze    │────▶│   Extract   │────▶│  Mint NFTs  │
│  (Trigger)  │     │ Issue Coin  │     │    Fees     │     │  for All    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Step 1: Vote Resolution Trigger (P2-N1)

**Trigger Conditions:**
1. Vote end time reached (`ends_at <= NOW()`)
2. Vote status is 'active'

**Implementation Options:**

**Option A: Cron Job (Recommended)**
```
GET /api/cron/resolve-votes
- Runs every 5 minutes
- Checks for votes where ends_at <= NOW() AND status = 'active'
- Triggers resolution for each qualifying vote
```

**Option B: On-Demand Check**
```
- Check on vote detail page load
- Trigger resolution if vote has ended
```

**Resolution Process:**
```typescript
async function resolveVote(voteId: string) {
  // 1. Update vote status to 'resolving'
  await updateVoteStatus(voteId, 'resolving');

  // 2. Freeze Issue Coin trading
  await freezeIssueCoin(voteId);

  // 3. Extract accumulated fees
  await extractFees(voteId);

  // 4. Mint NFTs for all participants
  await mintNFTs(voteId);

  // 5. Update vote status to 'resolved'
  await updateVoteStatus(voteId, 'resolved');
}
```

### Step 2: Issue Coin Freeze (P2-N2)

**Purpose:** Disable trading to finalize token distribution before NFT minting

**Bags.fm API Call:**
```typescript
// Freeze Issue Coin trading
await bagsService.freezeToken(issueCoinAddress);
```

**Database Update:**
```sql
UPDATE issue_coins
SET frozen = true, frozen_at = NOW()
WHERE vote_id = $1;
```

### Step 3: Fee Extraction (P2-N3)

**Purpose:** Claim accumulated trading fees from Bags.fm

**Flow:**
1. Call Bags.fm API to get claimable fees
2. Execute claim transaction
3. Convert SOL to ILS via off-ramp (if needed)
4. Allocate funds:
   - Municipality treasury: 70%
   - Platform operations: 30%

**Bags.fm API Calls:**
```typescript
// Get claimable fees
const fees = await bagsService.getClaimableFees(issueCoinAddress);

// Claim fees
const claimTx = await bagsService.claimFees(issueCoinAddress);
```

**Treasury Update:**
```sql
-- Record fee extraction
INSERT INTO treasury_transactions (
  municipality_id,
  vote_id,
  type,
  amount_sol,
  amount_ils,
  description
) VALUES (
  $1, $2, 'fee_extraction', $3, $4, 'Issue Coin fees from vote resolution'
);

-- Update treasury balance
UPDATE treasury
SET balance_sol = balance_sol + $1,
    updated_at = NOW()
WHERE municipality_id = $2;
```

### Step 4: NFT Minting (P2-N4, P2-N5)

**Participant Types:**

| Type | NFT Name | Eligibility |
|------|----------|-------------|
| Verified Voter | "Verified Voter" | Taruu residents who cast a vote |
| Civic Patron | "Civic Patron" | External wallets holding Issue Coins |

**Minting Process:**

```typescript
async function mintNFTs(voteId: string) {
  const vote = await getVote(voteId);
  const issueCoin = await getIssueCoin(voteId);

  // Get all participants
  const voters = await getVoters(voteId);
  const holders = await getIssueCoinHolders(issueCoin.address);

  // Mint Verified Voter NFTs
  for (const voter of voters) {
    await mintVerifiedVoterNFT(voter, vote, issueCoin);
  }

  // Mint Civic Patron NFTs (exclude internal voters)
  const externalHolders = holders.filter(h => !voters.includes(h));
  for (const holder of externalHolders) {
    await mintCivicPatronNFT(holder, vote, issueCoin);
  }
}
```

## NFT Metadata Structure (P2-N6)

### Common Fields

```json
{
  "name": "Taruu: [Vote Title]",
  "symbol": "TARUU",
  "description": "[Vote description summary]",
  "image": "https://cdn.taruu.co.il/nfts/[vote-id]/[type].png",
  "external_url": "https://taruu.co.il/votes/[vote-id]",
  "attributes": [
    {
      "trait_type": "Municipality",
      "value": "Kiryat Tivon"
    },
    {
      "trait_type": "Vote Date",
      "value": "2025-01-23"
    },
    {
      "trait_type": "Result",
      "value": "Approved"
    },
    {
      "trait_type": "Total Voters",
      "value": 1247
    },
    {
      "trait_type": "Total Raised",
      "value": "₪45,230"
    },
    {
      "trait_type": "Issue Name",
      "value": "Park Renovation Fund"
    }
  ]
}
```

### Verified Voter NFT

```json
{
  "name": "Taruu Verified Voter: [Vote Title]",
  "attributes": [
    ...common,
    {
      "trait_type": "Voter Type",
      "value": "Verified Resident"
    },
    {
      "trait_type": "Vote Cast",
      "value": "Yes"
    },
    {
      "trait_type": "Verification Score",
      "value": 85
    }
  ]
}
```

### Civic Patron NFT

```json
{
  "name": "Taruu Civic Patron: [Vote Title]",
  "attributes": [
    ...common,
    {
      "trait_type": "Voter Type",
      "value": "Civic Patron"
    },
    {
      "trait_type": "Contribution",
      "value": "0.5 SOL"
    },
    {
      "trait_type": "Issue Coins Held",
      "value": 1500
    }
  ]
}
```

## API Endpoints

### POST /api/cron/resolve-votes

**Purpose:** Scheduled job to resolve ended votes

**Authentication:** Bearer token (CRON_SECRET)

**Response (200):**
```json
{
  "resolved": 3,
  "votes": [
    {
      "id": "uuid",
      "title": "Park Renovation",
      "nftsMinted": 1247
    }
  ]
}
```

### GET /api/votes/[id]/resolution

**Purpose:** Get resolution status for a vote

**Response (200):**
```json
{
  "status": "resolved",
  "resolvedAt": "2025-01-24T00:00:00.000Z",
  "issueCoin": {
    "frozen": true,
    "frozenAt": "2025-01-24T00:00:00.000Z"
  },
  "fees": {
    "total": 2.5,
    "claimed": true,
    "claimedAt": "2025-01-24T00:01:00.000Z"
  },
  "nfts": {
    "verifiedVoters": 1200,
    "civicPatrons": 47,
    "total": 1247
  }
}
```

### GET /api/user/nfts

**Purpose:** Get user's NFT collection

**Response (200):**
```json
{
  "nfts": [
    {
      "id": "uuid",
      "type": "verified_voter",
      "voteId": "uuid",
      "voteTitle": "Park Renovation",
      "municipality": "Kiryat Tivon",
      "mintAddress": "...",
      "imageUrl": "https://...",
      "mintedAt": "2025-01-24T00:02:00.000Z"
    }
  ],
  "total": 5
}
```

## Database Schema

### vote_nfts table
```sql
CREATE TABLE vote_nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID NOT NULL REFERENCES votes(id),
  user_id UUID REFERENCES users(id), -- null for external holders
  wallet_address TEXT, -- for external holders
  type TEXT NOT NULL, -- 'verified_voter' or 'civic_patron'
  mint_address TEXT UNIQUE,
  metadata_uri TEXT,
  minted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vote_nfts_vote ON vote_nfts(vote_id);
CREATE INDEX idx_vote_nfts_user ON vote_nfts(user_id);
CREATE INDEX idx_vote_nfts_wallet ON vote_nfts(wallet_address);
```

### votes table updates
```sql
ALTER TABLE votes ADD COLUMN resolved_at TIMESTAMPTZ;
ALTER TABLE votes ADD COLUMN resolution_status TEXT; -- 'pending', 'resolving', 'resolved', 'failed'
```

## UI Components

### Trophy Room (Mobile - P2-B19)

Location: `apps/mobile/app/(tabs)/trophy-room.tsx`

**Features:**
- Grid display of user's NFTs
- Filter by municipality, date
- Tap to view full details
- Share to social media

### Victory Wall (Web - P2-B20)

Location: `apps/web/src/app/[locale]/votes/archive/page.tsx`

**Features:**
- Searchable archive of all resolved votes
- Display winning option, total voters, funds raised
- Link to Issue Coin history
- NFT gallery view

### Multiplier Dashboard (Web - P2-B21)

Location: `apps/web/src/app/[locale]/treasury/page.tsx`

**Features:**
- Municipality treasury balance
- Local funds raised (ILS)
- SocialFi multiplier (Issue Coin contributions)
- Combined fund total
- Allocation breakdown (70% municipality, 30% platform)

### External Supporter Flow (Web - P2-B22)

Location: `apps/web/src/app/[locale]/support/page.tsx`

**Features:**
- Wallet connect button (Phantom, Solflare)
- Active votes with Issue Coin purchase
- Trading interface (buy/sell Issue Coins)
- Portfolio view (owned Issue Coins)
- NFT preview for upcoming resolution

## Implementation Files

| File | Purpose |
|------|---------|
| `apps/web/src/services/nft/index.ts` | NFT minting service |
| `apps/web/src/app/api/cron/resolve-votes/route.ts` | Vote resolution cron |
| `apps/web/src/app/api/votes/[id]/resolution/route.ts` | Resolution status |
| `apps/web/src/app/api/user/nfts/route.ts` | User NFT collection |
| `packages/shared/src/types/nft.ts` | TypeScript types |
| `packages/shared/src/contracts/nft.ts` | Zod schemas |
| `packages/api-client/src/nft.ts` | API client methods |
| `supabase/migrations/xxx_vote_nfts.sql` | Database migration |
| `apps/mobile/app/(tabs)/trophy-room.tsx` | Mobile NFT gallery |
| `apps/web/src/app/[locale]/votes/archive/page.tsx` | Vote archive |
| `apps/web/src/app/[locale]/treasury/page.tsx` | Treasury dashboard |
| `apps/web/src/app/[locale]/support/page.tsx` | External supporter flow |

## Environment Variables

```env
# NFT Metadata Storage (Arweave or IPFS)
ARWEAVE_WALLET_KEY=...
# OR
PINATA_API_KEY=...
PINATA_SECRET_KEY=...

# NFT Image CDN
NFT_IMAGE_CDN_URL=https://cdn.taruu.co.il/nfts
```

## Error Handling

| Error | Action |
|-------|--------|
| Freeze failed | Retry 3 times, then mark as 'failed', alert admin |
| Fee claim failed | Retry 3 times, continue with NFT minting |
| NFT mint failed | Queue for retry, continue with other participants |

## Vote Status Transitions

```
active -> resolving -> resolved
                   \-> failed (if unrecoverable error)
```

---

*Last Updated: January 18, 2025*
