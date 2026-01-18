/**
 * NFT System API Contracts
 * Zod schemas for NFT-related API endpoints
 */

import { z } from 'zod';

// === NFT Types ===

export const NftTypeSchema = z.enum(['verified_voter', 'civic_patron']);
export const NftStatusSchema = z.enum(['pending', 'minting', 'minted', 'failed']);
export const ResolutionStatusSchema = z.enum(['pending', 'resolving', 'resolved', 'failed']);

export type NftType = z.infer<typeof NftTypeSchema>;
export type NftStatus = z.infer<typeof NftStatusSchema>;
export type ResolutionStatus = z.infer<typeof ResolutionStatusSchema>;

// === NFT Metadata ===

export const NftAttributeSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const NftMetadataSchema = z.object({
  name: z.string().min(1).max(200),
  symbol: z.string().min(1).max(10),
  description: z.string().max(2000),
  image: z.string().url(),
  external_url: z.string().url().optional(),
  attributes: z.array(NftAttributeSchema),
});

export type NftAttribute = z.infer<typeof NftAttributeSchema>;
export type NftMetadata = z.infer<typeof NftMetadataSchema>;

// === Vote NFT ===

export const VoteNftSchema = z.object({
  id: z.string().uuid(),
  voteId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  walletAddress: z.string().optional(),
  type: NftTypeSchema,
  mintAddress: z.string().optional(),
  metadataUri: z.string().url().optional(),
  status: NftStatusSchema,
  mintedAt: z.string().datetime().optional(),
  mintTxHash: z.string().optional(),
  errorMessage: z.string().optional(),
  retryCount: z.number().int().nonnegative(),
  metadata: NftMetadataSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type VoteNft = z.infer<typeof VoteNftSchema>;

// === NFT Display ===

export const VoteNftDisplaySchema = z.object({
  id: z.string().uuid(),
  type: NftTypeSchema,
  voteId: z.string().uuid(),
  voteTitle: z.string(),
  municipality: z.string(),
  mintAddress: z.string().optional(),
  imageUrl: z.string().url(),
  mintedAt: z.string().datetime().optional(),
  displayName: z.string(),
});

export type VoteNftDisplay = z.infer<typeof VoteNftDisplaySchema>;

// === Resolution Status ===

export const VoteResolutionStatusSchema = z.object({
  status: ResolutionStatusSchema,
  resolvedAt: z.string().datetime().optional(),
  issueCoin: z.object({
    frozen: z.boolean(),
    frozenAt: z.string().datetime().optional(),
  }).optional(),
  fees: z.object({
    total: z.number().nonnegative(),
    claimed: z.boolean(),
    claimedAt: z.string().datetime().optional(),
  }).optional(),
  nfts: z.object({
    verifiedVoters: z.number().int().nonnegative(),
    civicPatrons: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
    minted: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
  }),
});

export type VoteResolutionStatus = z.infer<typeof VoteResolutionStatusSchema>;

// === User NFT Collection ===

export const UserNftCollectionSchema = z.object({
  nfts: z.array(VoteNftDisplaySchema),
  total: z.number().int().nonnegative(),
});

export type UserNftCollection = z.infer<typeof UserNftCollectionSchema>;

// === Resolution Results ===

export const ResolveVoteResultSchema = z.object({
  voteId: z.string().uuid(),
  title: z.string(),
  nftsMinted: z.number().int().nonnegative(),
  feesExtracted: z.number().nonnegative().optional(),
  issueCoinFrozen: z.boolean(),
});

export const ResolutionCronResultSchema = z.object({
  resolved: z.number().int().nonnegative(),
  votes: z.array(ResolveVoteResultSchema),
  errors: z.array(z.string()).optional(),
});

export type ResolveVoteResult = z.infer<typeof ResolveVoteResultSchema>;
export type ResolutionCronResult = z.infer<typeof ResolutionCronResultSchema>;

// === Mint Results ===

export const MintNftResultSchema = z.object({
  success: z.boolean(),
  nftId: z.string().uuid(),
  mintAddress: z.string().optional(),
  txHash: z.string().optional(),
  error: z.string().optional(),
});

export const BatchMintResultSchema = z.object({
  voteId: z.string().uuid(),
  total: z.number().int().nonnegative(),
  successful: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  results: z.array(MintNftResultSchema),
});

export type MintNftResult = z.infer<typeof MintNftResultSchema>;
export type BatchMintResult = z.infer<typeof BatchMintResultSchema>;

// === API Request/Response Schemas ===

// GET /api/votes/[id]/resolution
export const GetResolutionResponseSchema = VoteResolutionStatusSchema;

// GET /api/user/nfts
export const GetUserNftsRequestSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  municipality: z.string().optional(),
  type: NftTypeSchema.optional(),
});

export const GetUserNftsResponseSchema = UserNftCollectionSchema;

export type GetUserNftsRequest = z.infer<typeof GetUserNftsRequestSchema>;
export type GetUserNftsResponse = z.infer<typeof GetUserNftsResponseSchema>;

// POST /api/cron/resolve-votes
export const ResolveCronResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.string().datetime(),
  results: ResolutionCronResultSchema,
});

export type ResolveCronResponse = z.infer<typeof ResolveCronResponseSchema>;
