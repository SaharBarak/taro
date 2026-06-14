'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { RippleButton } from '@/components/ui/RippleButton';
import { Button } from '@/components/ui/Button';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import type { VoteFilter } from './types';
import styles from './VotesList.module.css';

// Number of votes revealed per "Load More" click
const PAGE_SIZE = 6;

const WHATSAPP_LINK = 'https://chat.whatsapp.com/FITvea9IVsn2Ljie1yCrAc';

// Vote types matching API response
interface VoteOption {
  id: string;
  label: string;
  description?: string;
  voteCount: number;
}

interface Vote {
  id: string;
  title: string;
  description: string;
  municipality: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'ended';
  participantCount: number;
  endDate: string;
  options: VoteOption[];
}

// Fallback mock data for development/error states
const mockVotes: Vote[] = [
  {
    id: '1',
    title: 'שדרוג גינת השכונה ברחוב הרצל',
    description:
      'הצבעה על תוכנית לשדרוג הגינה המרכזית כולל התקנת משחקי ילדים חדשים, ספסלים ותאורה.',
    municipality: 'תל אביב-יפו',
    status: 'active',
    participantCount: 1247,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    options: [
      { id: '1', label: 'בעד', voteCount: 892 },
      { id: '2', label: 'נגד', voteCount: 355 },
    ],
  },
  {
    id: '2',
    title: 'הקמת מרכז קהילתי חדש',
    description:
      'האם לאשר את בניית מרכז קהילתי חדש באזור הצפוני של העיר?',
    municipality: 'ראשון לציון',
    status: 'active',
    participantCount: 3521,
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    options: [
      { id: '1', label: 'בעד', voteCount: 2105 },
      { id: '2', label: 'נגד', voteCount: 1416 },
    ],
  },
  {
    id: '3',
    title: 'שינוי תדירות איסוף אשפה',
    description:
      'הצעה להגדלת תדירות איסוף האשפה משלוש פעמים בשבוע לחמש.',
    municipality: 'חיפה',
    status: 'completed',
    participantCount: 8934,
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    options: [
      { id: '1', label: 'בעד', voteCount: 6721 },
      { id: '2', label: 'נגד', voteCount: 2213 },
    ],
  },
  {
    id: '4',
    title: 'הוספת נתיבי אופניים חדשים',
    description:
      'תוכנית להוספת 15 ק"מ של נתיבי אופניים מוגנים ברחבי העיר.',
    municipality: 'ירושלים',
    status: 'active',
    participantCount: 2156,
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    options: [
      { id: '1', label: 'בעד', voteCount: 1823 },
      { id: '2', label: 'נגד', voteCount: 333 },
    ],
  },
];

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'פעילה';
    case 'completed':
    case 'ended':
      return 'הסתיימה';
    case 'pending':
      return 'ממתינה';
    case 'cancelled':
      return 'בוטלה';
    default:
      return status;
  }
}

function getTimeRemaining(endDate: string | Date): string {
  const now = new Date();
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diff = end.getTime() - now.getTime();

  if (diff < 0) return 'הסתיימה';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} ימים`;
  if (hours > 0) return `${hours} שעות`;
  return 'פחות משעה';
}

function isVoteEnded(status: string): boolean {
  return status === 'completed' || status === 'ended' || status === 'cancelled';
}

function matchesFilter(status: Vote['status'], filter: VoteFilter): boolean {
  switch (filter) {
    case 'active':
      return status === 'active';
    case 'ended':
      return isVoteEnded(status);
    case 'pending':
      return status === 'pending';
    case 'all':
    default:
      return true;
  }
}

/** Status -> glow tint that the card carries (verified-green for active). */
const statusGlow: Record<string, 'green' | 'blue' | 'purple' | 'amber'> = {
  active: 'green',
  completed: 'blue',
  ended: 'blue',
  pending: 'amber',
  cancelled: 'purple',
};

/** Inline clock icon — no emoji per design system. */
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Inline verified check — carries the "verified glow" motif. */
function VerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
      <path
        d="M9 12.5l2 2 4-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.71.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5A9.42 9.42 0 0 1 18.7 5.46a9.36 9.36 0 0 1 2.76 6.66 9.42 9.42 0 0 1-9.41 9.38zM20.52 3.64A11.76 11.76 0 0 0 12.05.13C5.5.13.18 5.45.18 12a11.8 11.8 0 0 0 1.58 5.9L.08 24l6.25-1.64a11.78 11.78 0 0 0 5.72 1.46h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.23-6.15-3.41-8.31z" />
    </svg>
  );
}

interface VotesListProps {
  filter: VoteFilter;
}

export function VotesList({ filter }: VotesListProps) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredVotes = useMemo(
    () => votes.filter((vote) => matchesFilter(vote.status, filter)),
    [votes, filter]
  );

  const visibleVotes = filteredVotes.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVotes.length;

  // Reset pagination when the filter changes or votes reload
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, votes]);

  useEffect(() => {
    async function fetchVotes() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/votes');

        if (!response.ok) {
          throw new Error('Failed to fetch votes');
        }

        const data = await response.json();

        if (data.votes && data.votes.length > 0) {
          setVotes(data.votes);
          setIsUsingMockData(false);
        } else {
          // Use mock data if no votes in database yet
          setVotes(mockVotes);
          setIsUsingMockData(true);
        }
      } catch (err) {
        console.error('Error fetching votes:', err);
        // Fall back to mock data on error
        setVotes(mockVotes);
        setIsUsingMockData(true);
        setError('לא ניתן לטעון את ההצבעות. מציג נתוני הדגמה.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVotes();
  }, []);

  if (isLoading) {
    return (
      <section className={styles.votesList}>
        <div className={styles.container}>
          <div className={styles.grid} aria-busy="true" aria-label="טוען הצבעות">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonRow}>
                  <span className={`${styles.shimmer} ${styles.skBadge}`} />
                  <span className={`${styles.shimmer} ${styles.skMeta}`} />
                </div>
                <span className={`${styles.shimmer} ${styles.skTitle}`} />
                <span className={`${styles.shimmer} ${styles.skLine}`} />
                <span className={`${styles.shimmer} ${styles.skLineShort}`} />
                <span className={`${styles.shimmer} ${styles.skBar}`} />
                <div className={styles.skeletonFooter}>
                  <span className={`${styles.shimmer} ${styles.skMeta}`} />
                  <span className={`${styles.shimmer} ${styles.skPill}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.votesList}>
      <div className={styles.container}>
        {error && (
          <div className={styles.errorBanner} role="alert">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {isUsingMockData && !error && (
          <div className={styles.demoBanner}>
            <span className={styles.demoDot} aria-hidden />
            <span>מציג נתוני הדגמה — הצבעות אמיתיות יופיעו בקרוב</span>
          </div>
        )}

        {filteredVotes.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            className={styles.grid}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {visibleVotes.map((vote) => {
              const totalVotes = vote.options.reduce((sum, opt) => sum + opt.voteCount, 0);
              const leadingOption = vote.options.reduce((a, b) =>
                a.voteCount > b.voteCount ? a : b
              );
              const leadingPercentage = totalVotes > 0
                ? Math.round((leadingOption.voteCount / totalVotes) * 100)
                : 0;
              const ended = isVoteEnded(vote.status);

              return (
                <motion.div key={vote.id} variants={fadeInUp}>
                  <GlassCard variant="interactive" glow={statusGlow[vote.status] ?? 'blue'} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={`${styles.statusBadge} ${styles[vote.status]}`}>
                        {vote.status === 'active' && <span className={styles.statusDot} aria-hidden />}
                        {getStatusLabel(vote.status)}
                      </span>
                      <span className={styles.municipality}>{vote.municipality}</span>
                    </div>

                    <h3 className={styles.voteTitle}>{vote.title}</h3>

                    <p className={styles.description}>{vote.description}</p>

                    {/* Consensus bar — mirrors the hero ConsensusVisual */}
                    <div className={styles.meter}>
                      <div className={styles.meterRow}>
                        <span className={styles.leadLabel}>{leadingOption.label}</span>
                        <span className={styles.pct}>{leadingPercentage}%</span>
                      </div>
                      <div className={styles.track}>
                        <motion.div
                          className={styles.fill}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${leadingPercentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <div className={styles.verifiedRow}>
                        <span className={styles.verified}>
                          <VerifiedIcon />
                          {totalVotes.toLocaleString('he-IL')} הצבעות מאומתות
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.cardFooter}>
                      <span className={styles.timeRemaining}>
                        <ClockIcon />
                        <span>{ended ? 'הסתיימה' : getTimeRemaining(vote.endDate)}</span>
                      </span>

                      <Link href={`/votes/${vote.id}`} className={styles.cardLink}>
                        <Button variant="ghost" size="sm">
                          {!ended ? 'הצביעו' : 'צפו בתוצאות'}
                        </Button>
                      </Link>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className={styles.loadMore}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              טענו עוד הצבעות
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Composed pre-launch empty state. The live feed isn't live yet, so we surface
 * the real pilot moment (first vote in Kiryat Tivon) with a glass card, a soft
 * brand aura, and a WhatsApp CTA — beautiful, not a bare message.
 */
function EmptyState() {
  return (
    <motion.div
      className={styles.emptyState}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={styles.emptyArt} aria-hidden />
      <span className={styles.emptyAuraA} aria-hidden />
      <span className={styles.emptyAuraB} aria-hidden />

      <div className={styles.emptyInner}>
        <span className={styles.emptyBadge}>
          <span className={styles.statusDot} aria-hidden />
          הפיילוט נפתח בקרוב
        </span>

        <p className={styles.emptyDate}>
          <span className={styles.emptyDateNum}>23.01.26</span>
        </p>

        <h2 className={styles.emptyTitle}>
          ההצבעה הראשונה בקריית טבעון נפתחת ב-23.01.26
        </h2>

        <p className={styles.emptyText}>
          הצטרפו לוואטסאפ ותהיו הראשונים להצביע.
        </p>

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.emptyCta}
        >
          <RippleButton size="lg">
            <span className={styles.ctaInner}>
              <WhatsAppIcon />
              הצטרפו לוואטסאפ
            </span>
          </RippleButton>
        </a>
      </div>
    </motion.div>
  );
}
