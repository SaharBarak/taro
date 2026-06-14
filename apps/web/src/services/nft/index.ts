/**
 * NFT Minting Service
 *
 * Handles NFT minting for vote participants after vote resolution.
 * Uses Qubik blockchain service for NFT creation.
 *
 * @see specs/nft-system.md for implementation details
 */

import { qubikService } from '../qubik';
import { seedVoteBag } from '@/services/treasury/bagSeeding';
import { emailService, sendInBatches } from '@/services/email';
import {
  getIssueCoinByVoteId,
  getIssueCoinHolders,
  updateIssueCoin,
  updateVoteNft,
  bulkCreateVoteNfts,
  getVoteNftStats,
  updateVoteResolutionStatus,
  getVotesNeedingResolution,
  getVoteParticipantsWithEmails,
} from '@/lib/supabase/db';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { NftMetadata } from '@sync/shared';

// === Configuration ===

const NFT_IMAGE_CDN_URL = process.env.NFT_IMAGE_CDN_URL || 'https://cdn.taruu.co.il/nfts';
const NFT_SYMBOL = 'TARUU';

// === Types ===

interface MintResult {
  success: boolean;
  nftId: string;
  mintAddress?: string;
  txHash?: string;
  error?: string;
}

interface ResolutionResult {
  voteId: string;
  title: string;
  nftsMinted: number;
  feesExtracted?: number;
  issueCoinFrozen: boolean;
  bagSeeded: boolean;
  bagTokenMint?: string;
  errors: string[];
}

interface NftMetadataInput {
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
    type: 'verified_voter' | 'civic_patron';
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

// === Helper Functions ===

/**
 * Get vote by ID
 */
async function getVoteById(voteId: string) {
  const { data, error } = await supabaseAdmin
    .from('votes')
    .select('*')
    .eq('id', voteId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to get vote:', error);
    throw error;
  }
  return data;
}

/**
 * Get voters for a vote with their vote choices
 */
async function getVotersByVoteId(voteId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_votes')
    .select('user_id, option_id, created_at')
    .eq('vote_id', voteId);

  if (error) {
    console.error('Failed to get voters:', error);
    throw error;
  }
  return data || [];
}

// === NFT Metadata Generation ===

/**
 * Generate NFT metadata following Metaplex standard
 */
export function generateNftMetadata(input: NftMetadataInput): NftMetadata {
  const { vote, holder, issueCoin } = input;
  const isVerifiedVoter = holder.type === 'verified_voter';

  const name = isVerifiedVoter
    ? `Taruu Verified Voter: ${vote.title}`
    : `Taruu Civic Patron: ${vote.title}`;

  const attributes: NftMetadata['attributes'] = [
    { trait_type: 'Municipality', value: vote.municipality },
    { trait_type: 'Vote Date', value: vote.endDate.toISOString().split('T')[0] },
    { trait_type: 'Result', value: vote.result },
    { trait_type: 'Total Voters', value: vote.totalVoters },
    { trait_type: 'Total Raised', value: `₪${vote.totalRaised.toLocaleString()}` },
    { trait_type: 'Voter Type', value: isVerifiedVoter ? 'Verified Resident' : 'Civic Patron' },
  ];

  // Add type-specific attributes
  if (isVerifiedVoter) {
    if (holder.voteCast) {
      attributes.push({ trait_type: 'Vote Cast', value: holder.voteCast });
    }
    if (holder.verificationScore !== undefined) {
      attributes.push({ trait_type: 'Verification Score', value: holder.verificationScore });
    }
  } else {
    if (holder.contributionSOL !== undefined) {
      attributes.push({ trait_type: 'Contribution', value: `${holder.contributionSOL} SOL` });
    }
    if (holder.tokensHeld !== undefined) {
      attributes.push({ trait_type: 'Issue Coins Held', value: holder.tokensHeld });
    }
  }

  // Add Issue Coin info if available
  if (issueCoin) {
    attributes.push({ trait_type: 'Issue Name', value: issueCoin.tokenName });
    attributes.push({ trait_type: 'Token Mint', value: issueCoin.tokenMint });
  }

  return {
    name,
    symbol: NFT_SYMBOL,
    description: vote.description || `Commemorative NFT for participation in "${vote.title}"`,
    image: `${NFT_IMAGE_CDN_URL}/${vote.id}/${holder.type}.png`,
    external_url: `https://taruu.co.il/votes/${vote.id}`,
    attributes,
  };
}

// === NFT Minting Functions ===

/**
 * Mint a single NFT for a participant
 */
export async function mintSingleNft(
  nftId: string,
  walletAddress: string,
  metadata: NftMetadata
): Promise<MintResult> {
  try {
    // Mark as minting
    await updateVoteNft(nftId, { status: 'minting' });

    // Call Qubik to mint NFT
    const mintResult = await qubikService.mintTokens({
      walletAddress,
      amount: 1,
      reason: 'vote',
    });

    // Update NFT record with success
    await updateVoteNft(nftId, {
      status: 'minted',
      mintAddress: mintResult.txHash, // Using txHash as mint address for now
      mintTxHash: mintResult.txHash,
      metadataUri: `ipfs://placeholder/${nftId}`, // TODO: Upload to IPFS/Arweave
    });

    return {
      success: true,
      nftId,
      mintAddress: mintResult.txHash,
      txHash: mintResult.txHash,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Update NFT record with failure
    await updateVoteNft(nftId, {
      status: 'failed',
      errorMessage: message,
      retryCount: 1, // Will be incremented on retry
    });

    return {
      success: false,
      nftId,
      error: message,
    };
  }
}

/**
 * Create NFT records for all vote participants
 */
export async function createNftRecordsForVote(voteId: string): Promise<number> {
  const vote = await getVoteById(voteId);
  if (!vote) {
    throw new Error(`Vote not found: ${voteId}`);
  }

  const records: Array<{
    voteId: string;
    userId?: string;
    walletAddress?: string;
    type: 'verified_voter' | 'civic_patron';
    metadata?: Record<string, unknown>;
  }> = [];

  // Get verified voters
  const voters = await getVotersByVoteId(voteId);
  for (const voter of voters) {
    records.push({
      voteId,
      userId: voter.user_id,
      type: 'verified_voter',
      metadata: {
        voteCast: voter.option_id,
      },
    });
  }

  // Get Issue Coin holders (external supporters)
  const issueCoin = await getIssueCoinByVoteId(voteId);
  if (issueCoin) {
    const holders = await getIssueCoinHolders(issueCoin.id, { residentsOnly: false });

    for (const holder of holders) {
      // Skip holders who are also voters (they get Verified Voter NFT)
      if (holder.user_id && voters.some((v) => v.user_id === holder.user_id)) {
        continue;
      }

      // External wallet holders get Civic Patron NFT
      if (holder.wallet_address && !holder.is_local_resident) {
        records.push({
          voteId,
          walletAddress: holder.wallet_address,
          type: 'civic_patron',
          metadata: {
            tokensHeld: holder.token_amount,
            investedILS: holder.invested_ils,
          },
        });
      }
    }
  }

  // Bulk create NFT records
  if (records.length > 0) {
    await bulkCreateVoteNfts(records);
  }

  return records.length;
}

// === Vote Resolution Functions ===

/**
 * Email results to every participant after resolution (best-effort).
 * Winning option = highest vote count among the vote's options.
 */
async function sendResolutionEmails(voteId: string, voteTitle: string): Promise<void> {
  const { data: options, error } = await supabaseAdmin
    .from('vote_options')
    .select('id, text, votes')
    .eq('vote_id', voteId);

  if (error || !options?.length) {
    console.warn('No options found for resolution emails:', voteId);
    return;
  }

  const winning = options.reduce((max, opt) => (opt.votes > max.votes ? opt : max), options[0]);
  const optionText = new Map(options.map((o) => [o.id, o.text]));
  const participants = await getVoteParticipantsWithEmails(voteId);
  const totalParticipants = participants.length;

  await sendInBatches(participants, (p) =>
    emailService.sendVoteResultsEmail({
      to: p.email,
      firstName: p.first_name || 'משתתפ/ת',
      voteTitle,
      voteId,
      winningOption: winning.text,
      totalParticipants,
      userVotedFor: optionText.get(p.option_id) || '',
      userWon: p.option_id === winning.id,
    })
  );
}

/**
 * Freeze Issue Coin for a vote (disable trading)
 */
export async function freezeIssueCoin(voteId: string): Promise<boolean> {
  const issueCoin = await getIssueCoinByVoteId(voteId);
  if (!issueCoin) {
    return true; // No issue coin to freeze
  }

  try {
    // Update database to mark as frozen
    await updateIssueCoin(issueCoin.id, {
      isFrozen: true,
      tradingEnabled: false,
    });

    // TODO: Call Bags.fm API to freeze trading (if supported)
    // await bagsService.freezeToken(issueCoin.token_mint);

    return true;
  } catch (error) {
    console.error('Failed to freeze Issue Coin:', error);
    return false;
  }
}

/**
 * Resolve a single vote: freeze Issue Coin, create NFT records, prepare for minting
 */
export async function resolveVote(voteId: string): Promise<ResolutionResult> {
  const errors: string[] = [];

  // Get vote details
  const vote = await getVoteById(voteId);
  if (!vote) {
    throw new Error(`Vote not found: ${voteId}`);
  }

  // Update status to resolving
  await updateVoteResolutionStatus(voteId, 'resolving');

  // Step 1: Seed the vote's Bags.fm bag from the accrued ILS (created at resolution)
  let bagSeeded = false;
  let bagTokenMint: string | undefined;
  try {
    const seed = await seedVoteBag(voteId);
    bagSeeded = seed.seeded;
    bagTokenMint = seed.tokenMint;
    if (!seed.seeded && seed.reason && seed.reason !== 'no_accrued_funds' && seed.reason !== 'bag_already_exists') {
      errors.push(`Bag not seeded: ${seed.reason}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Failed to seed bag: ${message}`);
  }

  // Step 2: A freshly seeded bag stays tradable (that is the post-vote SocialFi
  // artifact). Only legacy coins that existed *during* the vote get frozen here.
  let frozen = false;
  if (!bagSeeded) {
    frozen = await freezeIssueCoin(voteId);
    if (!frozen) {
      errors.push('Failed to freeze Issue Coin');
    }
  }

  // Step 3: Create NFT records for all participants
  try {
    await createNftRecordsForVote(voteId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Failed to create NFT records: ${message}`);
  }

  // Step 4: Email results to all participants (best-effort)
  try {
    await sendResolutionEmails(voteId, vote.title);
  } catch (emailError) {
    console.warn('Resolution emails failed (non-fatal):', emailError);
  }

  // Step 5: Get NFT stats
  const stats = await getVoteNftStats(voteId);

  // Step 6: Update vote status to resolved
  if (errors.length === 0) {
    await updateVoteResolutionStatus(voteId, 'resolved', new Date());
  } else {
    await updateVoteResolutionStatus(voteId, 'failed');
  }

  return {
    voteId,
    title: vote.title,
    nftsMinted: stats.minted,
    issueCoinFrozen: frozen,
    bagSeeded,
    bagTokenMint,
    errors,
  };
}

/**
 * Process all votes that need resolution
 */
export async function processVoteResolutions(): Promise<{
  resolved: number;
  votes: ResolutionResult[];
  errors: string[];
}> {
  const results: ResolutionResult[] = [];
  const errors: string[] = [];

  // Get votes that need resolution
  const votesToResolve = await getVotesNeedingResolution();

  for (const vote of votesToResolve) {
    try {
      const result = await resolveVote(vote.id);
      results.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Failed to resolve vote ${vote.id}: ${message}`);
    }
  }

  return {
    resolved: results.length,
    votes: results,
    errors,
  };
}
