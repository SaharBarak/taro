'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heading, Text } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { formatCurrency, formatDate } from '@sync/shared';
import styles from './ArchiveList.module.css';

function VerifiedVotersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0M15.5 8.2l1 1 2-2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PatronsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3l2.5 5 5.5.8-4 3.9.95 5.5L12 16.5 7.05 18.2 8 12.7 4 8.8 9.5 8 12 3z" strokeLinejoin="round" />
    </svg>
  );
}

function MintedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="15" r="5" />
      <path d="M9 10L6 3M15 10l3-7M11 15h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface ResolvedVote {
  id: string;
  title: string;
  description: string;
  municipality: string;
  status: 'resolved';
  resolvedAt: string;
  result: {
    winningOption: string;
    totalVoters: number;
    yesPercentage: number;
  };
  nftStats: {
    verifiedVoters: number;
    civicPatrons: number;
    totalMinted: number;
  };
  fundsRaised: {
    totalILS: number;
    localContributions: number;
    externalContributions: number;
  };
}

// Mock data for development
const MOCK_RESOLVED_VOTES: ResolvedVote[] = [
  {
    id: '1',
    title: 'הקמת גינה קהילתית ברחוב הרצל',
    description: 'האם לאשר תקציב של 500,000 ש"ח להקמת גינה קהילתית חדשה?',
    municipality: 'קרית טבעון',
    status: 'resolved',
    resolvedAt: '2025-01-15T10:00:00Z',
    result: {
      winningOption: 'בעד',
      totalVoters: 234,
      yesPercentage: 78,
    },
    nftStats: {
      verifiedVoters: 180,
      civicPatrons: 45,
      totalMinted: 225,
    },
    fundsRaised: {
      totalILS: 15000,
      localContributions: 10000,
      externalContributions: 5000,
    },
  },
  {
    id: '2',
    title: 'שדרוג תאורת רחובות במרכז',
    description: 'התקנת תאורת LED חסכונית בכל הרחובות המרכזיים',
    municipality: 'קרית טבעון',
    status: 'resolved',
    resolvedAt: '2025-01-10T10:00:00Z',
    result: {
      winningOption: 'בעד',
      totalVoters: 189,
      yesPercentage: 92,
    },
    nftStats: {
      verifiedVoters: 150,
      civicPatrons: 30,
      totalMinted: 180,
    },
    fundsRaised: {
      totalILS: 8500,
      localContributions: 6000,
      externalContributions: 2500,
    },
  },
  {
    id: '3',
    title: 'הרחבת מרכז הספורט העירוני',
    description: 'בניית אגף חדש למרכז הספורט הכולל בריכה וחדר כושר',
    municipality: 'קרית טבעון',
    status: 'resolved',
    resolvedAt: '2025-01-05T10:00:00Z',
    result: {
      winningOption: 'נגד',
      totalVoters: 312,
      yesPercentage: 42,
    },
    nftStats: {
      verifiedVoters: 280,
      civicPatrons: 15,
      totalMinted: 295,
    },
    fundsRaised: {
      totalILS: 12000,
      localContributions: 11000,
      externalContributions: 1000,
    },
  },
];

function VoteArchiveCard({ vote }: { vote: ResolvedVote }) {
  const isApproved = vote.result.winningOption === 'בעד';

  return (
    <motion.div variants={fadeInUp} className={styles.cardWrap}>
      <GlassCard variant="interactive" glow={isApproved ? 'green' : 'blue'} className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <span className={styles.municipality}>{vote.municipality}</span>
        <span className={`${styles.resultBadge} ${isApproved ? styles.approved : styles.rejected}`}>
          {isApproved ? 'אושר' : 'נדחה'}
        </span>
      </div>

      {/* Title */}
      <Heading level={3} className={styles.cardTitle}>
        {vote.title}
      </Heading>

      {/* Description */}
      <Text size="sm" color="secondary" className={styles.cardDescription}>
        {vote.description}
      </Text>

      {/* Result Stats */}
      <div className={styles.resultStats}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${vote.result.yesPercentage}%` }}
          />
        </div>
        <div className={styles.voteBreakdown}>
          <span>בעד: {vote.result.yesPercentage}%</span>
          <span>נגד: {100 - vote.result.yesPercentage}%</span>
        </div>
      </div>

      {/* NFT Stats */}
      <div className={styles.nftStats}>
        <div className={styles.nftStat}>
          <span className={`${styles.nftIcon} ${styles.nftIconGreen}`} aria-hidden>
            <VerifiedVotersIcon />
          </span>
          <div>
            <div className={styles.nftValue}>{vote.nftStats.verifiedVoters}</div>
            <Text size="xs" color="muted">מצביעים מאומתים</Text>
          </div>
        </div>
        <div className={styles.nftStat}>
          <span className={`${styles.nftIcon} ${styles.nftIconPurple}`} aria-hidden>
            <PatronsIcon />
          </span>
          <div>
            <div className={styles.nftValue}>{vote.nftStats.civicPatrons}</div>
            <Text size="xs" color="muted">תומכים חיצוניים</Text>
          </div>
        </div>
        <div className={styles.nftStat}>
          <span className={`${styles.nftIcon} ${styles.nftIconBlue}`} aria-hidden>
            <MintedIcon />
          </span>
          <div>
            <div className={styles.nftValue}>{vote.nftStats.totalMinted}</div>
            <Text size="xs" color="muted">NFTs</Text>
          </div>
        </div>
      </div>

      {/* Funds Raised */}
      <div className={styles.fundsSection}>
        <div className={styles.fundsHeader}>
          <Text size="sm" weight="semibold">כספים שנאספו</Text>
          <Text size="lg" weight="bold" className={styles.totalFunds}>
            {formatCurrency(vote.fundsRaised.totalILS)}
          </Text>
        </div>
        <div className={styles.fundsBreakdown}>
          <div className={styles.fundSource}>
            <span className={styles.fundDot} style={{ backgroundColor: 'var(--color-primary)' }} />
            <Text size="xs" color="secondary">
              מקומי: {formatCurrency(vote.fundsRaised.localContributions)}
            </Text>
          </div>
          <div className={styles.fundSource}>
            <span className={styles.fundDot} style={{ backgroundColor: 'var(--color-secondary)' }} />
            <Text size="xs" color="secondary">
              חיצוני: {formatCurrency(vote.fundsRaised.externalContributions)}
            </Text>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <Text size="xs" color="muted">
          הסתיים ב-{formatDate(new Date(vote.resolvedAt))}
        </Text>
        <Link href={`/votes/${vote.id}`}>
          <Button variant="outline" size="sm">
            צפייה בפרטים
          </Button>
        </Link>
      </div>
      </GlassCard>
    </motion.div>
  );
}

export function ArchiveList() {
  const [votes, setVotes] = useState<ResolvedVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');

  useEffect(() => {
    const fetchResolvedVotes = async () => {
      try {
        // Try to fetch from API
        const res = await fetch('/api/votes?status=resolved');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        // If empty or error, use mock data
        if (!data.votes || data.votes.length === 0) {
          setVotes(MOCK_RESOLVED_VOTES);
        } else {
          setVotes(data.votes);
        }
      } catch (err) {
        console.error('Error fetching resolved votes:', err);
        // Use mock data as fallback
        setVotes(MOCK_RESOLVED_VOTES);
      } finally {
        setLoading(false);
      }
    };

    fetchResolvedVotes();
  }, []);

  // Get unique municipalities for filter
  const municipalities = ['all', ...new Set(votes.map((v) => v.municipality))];

  // Apply filters
  const filteredVotes = votes.filter((vote) => {
    const resultMatch =
      filter === 'all' ||
      (filter === 'approved' && vote.result.winningOption === 'בעד') ||
      (filter === 'rejected' && vote.result.winningOption === 'נגד');

    const municipalityMatch =
      municipalityFilter === 'all' || vote.municipality === municipalityFilter;

    return resultMatch && municipalityMatch;
  });

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid} aria-busy="true" aria-label="טוען ארכיון">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonRow}>
                  <span className={`${styles.shimmer} ${styles.skMeta}`} />
                  <span className={`${styles.shimmer} ${styles.skBadge}`} />
                </div>
                <span className={`${styles.shimmer} ${styles.skTitle}`} />
                <span className={`${styles.shimmer} ${styles.skLine}`} />
                <span className={`${styles.shimmer} ${styles.skBar}`} />
                <span className={`${styles.shimmer} ${styles.skBlock}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Text size="sm" weight="medium" className={styles.filterLabel}>
              סינון לפי תוצאה:
            </Text>
            <div className={styles.filterPills}>
              {[
                { key: 'all', label: 'הכל' },
                { key: 'approved', label: 'אושר' },
                { key: 'rejected', label: 'נדחה' },
              ].map((option) => (
                <button
                  key={option.key}
                  className={`${styles.filterPill} ${filter === option.key ? styles.active : ''}`}
                  onClick={() => setFilter(option.key as typeof filter)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <Text size="sm" weight="medium" className={styles.filterLabel}>
              רשות:
            </Text>
            <select
              className={styles.select}
              value={municipalityFilter}
              onChange={(e) => setMunicipalityFilter(e.target.value)}
            >
              {municipalities.map((m) => (
                <option key={m} value={m}>
                  {m === 'all' ? 'כל הרשויות' : m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <Text size="sm" color="secondary" className={styles.resultsCount}>
          מציג {filteredVotes.length} הצבעות שהסתיימו
        </Text>

        {/* Votes Grid */}
        {filteredVotes.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden>
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
            </span>
            <Heading level={3}>לא נמצאו הצבעות</Heading>
            <Text color="secondary">
              נסו לשנות את הסינון או לחפש ברשות אחרת
            </Text>
          </div>
        ) : (
          <motion.div
            className={styles.grid}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {filteredVotes.map((vote) => (
              <VoteArchiveCard key={vote.id} vote={vote} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
