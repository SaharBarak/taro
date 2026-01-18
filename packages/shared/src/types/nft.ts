/**
 * NFT System Types
 *
 * Types for the post-resolution NFT minting system.
 * When votes conclude, commemorative NFTs are minted for all participants:
 * - "Verified Voter" NFT for verified Taruu residents who voted
 * - "Civic Patron" NFT for external supporters who purchased Issue Coins
 *
 * @see specs/nft-system.md for implementation details
 */

// === NFT Types ===

/**
 * NFT type distinguishes between voter types
 */
export type NftType = 'verified_voter' | 'civic_patron';

/**
 * NFT minting status
 */
export type NftStatus = 'pending' | 'minting' | 'minted' | 'failed';

/**
 * Vote resolution status
 */
export type ResolutionStatus = 'pending' | 'resolving' | 'resolved' | 'failed';

/**
 * NFT metadata attribute (follows Metaplex standard)
 */
export interface NftAttribute {
  trait_type: string;
  value: string | number | boolean;
}

/**
 * NFT metadata structure (follows Metaplex standard)
 */
export interface NftMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: NftAttribute[];
}

/**
 * Vote NFT record from database
 */
export interface VoteNft {
  id: string;
  voteId: string;
  /** User ID if internal user, undefined for external wallet */
  userId?: string;
  /** External Solana wallet address */
  walletAddress?: string;
  /** NFT type: verified_voter or civic_patron */
  type: NftType;
  /** Solana NFT mint address (null until minted) */
  mintAddress?: string;
  /** IPFS/Arweave metadata URI */
  metadataUri?: string;
  /** Current minting status */
  status: NftStatus;
  /** When NFT was successfully minted */
  mintedAt?: Date;
  /** Solana transaction hash */
  mintTxHash?: string;
  /** Error message if minting failed */
  errorMessage?: string;
  /** Number of minting retry attempts */
  retryCount: number;
  /** Snapshot of NFT metadata */
  metadata?: NftMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * NFT display data for UI
 */
export interface VoteNftDisplay {
  id: string;
  type: NftType;
  voteId: string;
  voteTitle: string;
  municipality: string;
  mintAddress?: string;
  imageUrl: string;
  mintedAt?: Date;
  /** Display name derived from metadata */
  displayName: string;
}

/**
 * Vote resolution status with NFT stats
 */
export interface VoteResolutionStatus {
  status: ResolutionStatus;
  resolvedAt?: Date;
  issueCoin?: {
    frozen: boolean;
    frozenAt?: Date;
  };
  fees?: {
    total: number;
    claimed: boolean;
    claimedAt?: Date;
  };
  nfts: {
    verifiedVoters: number;
    civicPatrons: number;
    total: number;
    minted: number;
    pending: number;
    failed: number;
  };
}

/**
 * User's NFT collection
 */
export interface UserNftCollection {
  nfts: VoteNftDisplay[];
  total: number;
}

// === Resolution Types ===

/**
 * Vote resolution request
 */
export interface ResolveVoteRequest {
  voteId: string;
}

/**
 * Vote resolution result
 */
export interface ResolveVoteResult {
  voteId: string;
  title: string;
  nftsMinted: number;
  feesExtracted?: number;
  issueCoinFrozen: boolean;
}

/**
 * Cron job resolution results
 */
export interface ResolutionCronResult {
  resolved: number;
  votes: ResolveVoteResult[];
  errors?: string[];
}

// === NFT Minting Types ===

/**
 * NFT mint request for a single participant
 */
export interface MintNftRequest {
  voteId: string;
  /** User ID or wallet address */
  holderId: string;
  /** Whether this is an internal user or external wallet */
  isInternalUser: boolean;
  type: NftType;
}

/**
 * NFT mint result
 */
export interface MintNftResult {
  success: boolean;
  nftId: string;
  mintAddress?: string;
  txHash?: string;
  error?: string;
}

/**
 * Batch mint request for all participants of a vote
 */
export interface BatchMintRequest {
  voteId: string;
  /** Optional: specific holders to mint for (mints all if not provided) */
  holderIds?: string[];
}

/**
 * Batch mint result
 */
export interface BatchMintResult {
  voteId: string;
  total: number;
  successful: number;
  failed: number;
  results: MintNftResult[];
}

// === NFT Metadata Generation Types ===

/**
 * Input for generating NFT metadata
 */
export interface NftMetadataInput {
  vote: {
    id: string;
    title: string;
    description: string;
    municipality: string;
    endDate: Date;
    result: string;
    totalVoters: number;
    totalRaised: number;
  };
  holder: {
    type: NftType;
    voteCast?: string;
    verificationScore?: number;
    contributionSOL?: number;
    tokensHeld?: number;
  };
  issueCoin?: {
    tokenMint: string;
    tokenName: string;
  };
}
