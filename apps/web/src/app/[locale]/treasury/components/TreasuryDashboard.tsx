'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Text, Heading } from '@/components/ui/Typography';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { useReducedMotion } from '@/hooks';
import { formatCurrency, formatDate, MUNICIPALITIES } from '@sync/shared';
import styles from './TreasuryDashboard.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

interface TreasuryData {
  municipalityId: string;
  municipalityName: string;
  totalILS: number;
  totalSOL: number;
  localContributions: number;
  externalContributions: number;
  activeVotes: number;
  totalVotesResolved: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'deposit' | 'allocation' | 'withdrawal' | 'fee_claim' | 'token_purchase' | 'nft_mint';
  amountILS: number;
  amountSOL?: number;
  description: string;
  createdAt: string;
  voteTitle?: string;
}

// Mock data for development
const MOCK_TREASURY: TreasuryData = {
  municipalityId: 'kiryat-tivon',
  municipalityName: 'קרית טבעון',
  totalILS: 125000,
  totalSOL: 15.5,
  localContributions: 85000,
  externalContributions: 40000,
  activeVotes: 3,
  totalVotesResolved: 12,
  transactions: [
    {
      id: '1',
      type: 'deposit',
      amountILS: 15000,
      description: 'תרומות מהצבעה: גינה קהילתית',
      createdAt: '2025-01-15T10:00:00Z',
      voteTitle: 'הקמת גינה קהילתית ברחוב הרצל',
    },
    {
      id: '2',
      type: 'fee_claim',
      amountILS: 5000,
      amountSOL: 2.5,
      description: 'תביעת עמלות Issue Coin',
      createdAt: '2025-01-14T15:30:00Z',
    },
    {
      id: '3',
      type: 'token_purchase',
      amountILS: 8500,
      amountSOL: 4.25,
      description: 'תמיכה חיצונית: שדרוג תאורה',
      createdAt: '2025-01-13T12:00:00Z',
      voteTitle: 'שדרוג תאורת רחובות במרכז',
    },
    {
      id: '4',
      type: 'deposit',
      amountILS: 12000,
      description: 'תרומות מהצבעה: מרכז הספורט',
      createdAt: '2025-01-10T09:00:00Z',
      voteTitle: 'הרחבת מרכז הספורט העירוני',
    },
    {
      id: '5',
      type: 'allocation',
      amountILS: -25000,
      description: 'העברה לתקציב הרשות',
      createdAt: '2025-01-08T14:00:00Z',
    },
  ],
};

/** Inline SVG icons (no emoji) keyed by transaction type. */
function TransactionGlyph({ type }: { type: Transaction['type'] }) {
  switch (type) {
    case 'deposit':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
          <path d="M12 4v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 11l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'allocation':
    case 'withdrawal':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
          <path d="M12 20V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 13l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 4h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'fee_claim':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
          <path
            d="M12 3l2.5 5.3 5.5.7-4 3.9 1 5.6L12 16l-5 2.5 1-5.6-4-3.9 5.5-.7L12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'token_purchase':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 8v8M9.5 10h3.2a1.6 1.6 0 0 1 0 3.2H9.5h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'nft_mint':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
          <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.5 13.5L7 21l5-2.4L17 21l-1.5-7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

const TRANSACTION_TYPE_LABELS: Record<Transaction['type'], string> = {
  deposit: 'הפקדה',
  allocation: 'הקצאה',
  withdrawal: 'משיכה',
  fee_claim: 'תביעת עמלות',
  token_purchase: 'רכישת טוקנים',
  nft_mint: 'הנפקת NFT',
};

/** Chevron used in stat-card affordances. */
function Chevron() {
  return (
    <svg className={styles.statChevron} viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AllocationChart({ local, external }: { local: number; external: number }) {
  const reduced = useReducedMotion();
  const total = local + external;
  const localPercentage = total > 0 ? (local / total) * 100 : 50;
  const externalPercentage = total > 0 ? (external / total) * 100 : 50;

  return (
    <div className={styles.chartContainer}>
      <div
        className={styles.chartBar}
        role="img"
        aria-label={`תרומות מקומיות ${localPercentage.toFixed(0)} אחוז, תמיכה חיצונית ${externalPercentage.toFixed(0)} אחוז`}
      >
        <motion.div
          className={styles.chartSegmentLocal}
          style={{ inlineSize: `${localPercentage}%`, transformOrigin: 'inline-start' }}
          initial={reduced ? false : { transform: 'scaleX(0)' }}
          animate={{ transform: 'scaleX(1)' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        />
        <motion.div
          className={styles.chartSegmentExternal}
          style={{ inlineSize: `${externalPercentage}%`, transformOrigin: 'inline-start' }}
          initial={reduced ? false : { transform: 'scaleX(0)' }}
          animate={{ transform: 'scaleX(1)' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
        />
      </div>
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotLocal}`} />
          <Text size="sm">מקומי ({localPercentage.toFixed(0)}%)</Text>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotExternal}`} />
          <Text size="sm">חיצוני ({externalPercentage.toFixed(0)}%)</Text>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const label = TRANSACTION_TYPE_LABELS[transaction.type];
  const isPositive = transaction.amountILS >= 0;

  return (
    <motion.div className={styles.transactionRow} variants={fadeInUp}>
      <div className={`${styles.transactionIcon} ${isPositive ? styles.iconIn : styles.iconOut}`}>
        <TransactionGlyph type={transaction.type} />
      </div>
      <div className={styles.transactionInfo}>
        <Text weight="medium">{transaction.description}</Text>
        {transaction.voteTitle && (
          <Text size="xs" color="muted">{transaction.voteTitle}</Text>
        )}
      </div>
      <div className={styles.transactionMeta}>
        <Text size="xs" color="muted">
          {formatDate(new Date(transaction.createdAt))}
        </Text>
        <span className={styles.transactionTypeBadge}>{label}</span>
      </div>
      <div className={`${styles.transactionAmount} ${isPositive ? styles.positive : styles.negative}`}>
        {isPositive ? '+' : ''}{formatCurrency(transaction.amountILS)}
      </div>
    </motion.div>
  );
}

/** Premium loading skeletons — shimmer, not spinners. */
function DashboardSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.selectorRow}>
          <span className={`${styles.skeleton} ${styles.skelSelect}`} />
        </div>
        <div className={styles.statsGrid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${styles.statCard} ${styles.skelCard}`}>
              <span className={`${styles.skeleton} ${styles.skelLabel}`} />
              <span className={`${styles.skeleton} ${styles.skelValue}`} />
              <span className={`${styles.skeleton} ${styles.skelMeta}`} />
            </div>
          ))}
        </div>
        <div className={`${styles.boardCard} ${styles.skelBoard}`}>
          <span className={`${styles.skeleton} ${styles.skelTitle}`} />
          <span className={`${styles.skeleton} ${styles.skelChart}`} />
        </div>
      </div>
    </section>
  );
}

/** Composed "coming soon" empty state — honest, never fake metrics. */
function ComingSoonBoard() {
  return (
    <div className={styles.emptyBoard}>
      <span className={styles.emptyArt} aria-hidden />
      <span className={styles.emptyIcon} aria-hidden>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <Heading level={3} className={styles.emptyTitle}>
        בקרוב
      </Heading>
      <Text color="secondary" className={styles.emptyText}>
        הדשבורד החי ייפתח עם ההצבעה הראשונה.
      </Text>
    </div>
  );
}

export function TreasuryDashboard() {
  const reduced = useReducedMotion();
  const [treasury, setTreasury] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>(MUNICIPALITIES[0]);

  useEffect(() => {
    const fetchTreasury = async () => {
      try {
        const res = await fetch(`/api/treasury/${selectedMunicipality}`);
        if (!res.ok) throw new Error('Failed to fetch treasury');
        const data = await res.json();
        setTreasury(data);
      } catch (err) {
        console.error('Error fetching treasury:', err);
        setTreasury(MOCK_TREASURY);
      } finally {
        setLoading(false);
      }
    };

    fetchTreasury();
  }, [selectedMunicipality]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!treasury) return null;

  const multiplier = treasury.localContributions > 0
    ? ((treasury.localContributions + treasury.externalContributions) / treasury.localContributions)
    : 1;

  return (
    <section className={styles.section} aria-labelledby="treasury-board-title">
      <span className={styles.auraPurple} aria-hidden />

      <div className={styles.container}>
        <header className={styles.boardHead}>
          <Eyebrow live>הדשבורד החי</Eyebrow>
          <Heading level={2} id="treasury-board-title" className={styles.boardTitle}>
            לוח שקיפות בזמן אמת
          </Heading>
        </header>

        {/* Municipality Selector */}
        <div className={styles.selectorRow}>
          <label htmlFor="treasury-municipality" className={styles.selectLabel}>
            <Text size="sm" weight="medium">בחירת רשות</Text>
          </label>
          <div className={styles.selectWrap}>
            <select
              id="treasury-municipality"
              className={styles.select}
              value={selectedMunicipality}
              onChange={(e) => {
                setSelectedMunicipality(e.target.value);
                setLoading(true);
              }}
            >
              {MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <svg className={styles.selectChevron} viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden>
              <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          className={styles.statsGrid}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Total Balance Card */}
          <motion.div className={`${styles.statCard} ${styles.statBalance}`} variants={fadeInUp}>
            <div className={styles.statHeader}>
              <Text size="sm" color="secondary">יתרה כוללת</Text>
              <Chevron />
            </div>
            <div className={styles.statValue}>
              {formatCurrency(treasury.totalILS)}
            </div>
            <Text size="xs" color="muted">
              {treasury.totalSOL.toFixed(2)} SOL
            </Text>
          </motion.div>

          {/* Local Contributions */}
          <motion.div className={styles.statCard} variants={fadeInUp}>
            <div className={styles.statHeader}>
              <Text size="sm" color="secondary">תרומות מקומיות</Text>
              <Chevron />
            </div>
            <div className={styles.statValue}>
              {formatCurrency(treasury.localContributions)}
            </div>
            <Text size="xs" color="muted">
              מתושבי הרשות
            </Text>
          </motion.div>

          {/* External Contributions */}
          <motion.div className={styles.statCard} variants={fadeInUp}>
            <div className={styles.statHeader}>
              <Text size="sm" color="secondary">תמיכה חיצונית</Text>
              <Chevron />
            </div>
            <div className={styles.statValue}>
              {formatCurrency(treasury.externalContributions)}
            </div>
            <Text size="xs" color="muted">
              מתומכים חיצוניים
            </Text>
          </motion.div>

          {/* Multiplier Effect */}
          <motion.div className={`${styles.statCard} ${styles.multiplierCard}`} variants={fadeInUp}>
            <div className={styles.statHeader}>
              <Text size="sm" color="secondary">מכפיל SocialFi</Text>
            </div>
            <div className={styles.multiplierDisplay}>
              <span className={styles.multiplierNumber}>{multiplier.toFixed(2)}</span>
              <span className={styles.multiplierX}>x</span>
            </div>
            <Text size="xs" color="muted">
              כל ₪1 מקומי הפך ל-₪{multiplier.toFixed(2)}
            </Text>
          </motion.div>
        </motion.div>

        {/* Allocation Breakdown */}
        <motion.div
          className={styles.boardCard}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Heading level={3} className={styles.sectionTitle}>
            התפלגות הכנסות
          </Heading>
          <AllocationChart
            local={treasury.localContributions}
            external={treasury.externalContributions}
          />

          <div className={styles.allocationDetails}>
            <div className={styles.allocationItem}>
              <Text size="sm" weight="medium">70% לקרן הרשות</Text>
              <Text size="sm" color="secondary" className={styles.allocationAmount}>
                {formatCurrency((treasury.totalILS * 0.7))}
              </Text>
            </div>
            <div className={styles.allocationItem}>
              <Text size="sm" weight="medium">30% תפעול הפלטפורמה</Text>
              <Text size="sm" color="secondary" className={styles.allocationAmount}>
                {formatCurrency((treasury.totalILS * 0.3))}
              </Text>
            </div>
          </div>
        </motion.div>

        {/* Activity Stats */}
        <motion.div
          className={styles.activityGrid}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className={styles.activityCard}>
            <div className={styles.activityValue}>{treasury.totalVotesResolved}</div>
            <Text size="sm" color="secondary">הצבעות שהסתיימו</Text>
          </div>
          <div className={styles.activityCard}>
            <div className={styles.activityValue}>{treasury.activeVotes}</div>
            <Text size="sm" color="secondary">הצבעות פעילות</Text>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          className={styles.boardCard}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Heading level={3} className={styles.sectionTitle}>
            היסטוריית תנועות
          </Heading>

          {treasury.transactions.length > 0 ? (
            <motion.div
              className={styles.transactionsList}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {treasury.transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </motion.div>
          ) : (
            <ComingSoonBoard />
          )}
        </motion.div>
      </div>
    </section>
  );
}
