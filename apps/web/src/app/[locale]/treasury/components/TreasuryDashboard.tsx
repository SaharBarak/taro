'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/components/ui/Typography';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { formatCurrency, formatDate, MUNICIPALITIES } from '@sync/shared';
import styles from './TreasuryDashboard.module.css';

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

const TRANSACTION_TYPE_LABELS: Record<Transaction['type'], { label: string; icon: string }> = {
  deposit: { label: 'הפקדה', icon: '📥' },
  allocation: { label: 'הקצאה', icon: '📤' },
  withdrawal: { label: 'משיכה', icon: '🏦' },
  fee_claim: { label: 'תביעת עמלות', icon: '💎' },
  token_purchase: { label: 'רכישת טוקנים', icon: '🪙' },
  nft_mint: { label: 'הנפקת NFT', icon: '🎖️' },
};

function AllocationChart({ local, external }: { local: number; external: number }) {
  const total = local + external;
  const localPercentage = total > 0 ? (local / total) * 100 : 50;
  const externalPercentage = total > 0 ? (external / total) * 100 : 50;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartBar}>
        <motion.div
          className={styles.chartSegmentLocal}
          initial={{ width: 0 }}
          animate={{ width: `${localPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.div
          className={styles.chartSegmentExternal}
          initial={{ width: 0 }}
          animate={{ width: `${externalPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: 'var(--color-primary)' }} />
          <Text size="sm">מקומי ({localPercentage.toFixed(0)}%)</Text>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: 'var(--color-secondary)' }} />
          <Text size="sm">חיצוני ({externalPercentage.toFixed(0)}%)</Text>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { label, icon } = TRANSACTION_TYPE_LABELS[transaction.type];
  const isPositive = transaction.amountILS >= 0;

  return (
    <motion.div className={styles.transactionRow} variants={fadeInUp}>
      <div className={styles.transactionIcon}>{icon}</div>
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

export function TreasuryDashboard() {
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
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <Text>טוען נתוני קרן...</Text>
          </div>
        </div>
      </section>
    );
  }

  if (!treasury) return null;

  const multiplier = treasury.localContributions > 0
    ? ((treasury.localContributions + treasury.externalContributions) / treasury.localContributions)
    : 1;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Municipality Selector */}
        <div className={styles.selectorRow}>
          <Text size="sm" weight="medium">בחר רשות:</Text>
          <select
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
        </div>

        {/* Stats Grid */}
        <motion.div
          className={styles.statsGrid}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Total Balance Card */}
          <motion.div className={styles.statCard} variants={fadeInUp}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>💰</span>
              <Text size="sm" color="secondary">יתרה כוללת</Text>
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
              <span className={styles.statIcon}>🏠</span>
              <Text size="sm" color="secondary">תרומות מקומיות</Text>
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
              <span className={styles.statIcon}>🌍</span>
              <Text size="sm" color="secondary">תמיכה חיצונית</Text>
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
              <span className={styles.statIcon}>⚡</span>
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
          className={styles.allocationSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
              <Text size="sm" color="secondary">
                {formatCurrency((treasury.totalILS * 0.7))}
              </Text>
            </div>
            <div className={styles.allocationItem}>
              <Text size="sm" weight="medium">30% תפעול הפלטפורמה</Text>
              <Text size="sm" color="secondary">
                {formatCurrency((treasury.totalILS * 0.3))}
              </Text>
            </div>
          </div>
        </motion.div>

        {/* Activity Stats */}
        <motion.div
          className={styles.activitySection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.activityGrid}>
            <div className={styles.activityCard}>
              <div className={styles.activityIcon}>📊</div>
              <div className={styles.activityValue}>{treasury.totalVotesResolved}</div>
              <Text size="sm" color="secondary">הצבעות שהסתיימו</Text>
            </div>
            <div className={styles.activityCard}>
              <div className={styles.activityIcon}>🗳️</div>
              <div className={styles.activityValue}>{treasury.activeVotes}</div>
              <Text size="sm" color="secondary">הצבעות פעילות</Text>
            </div>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          className={styles.transactionsSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Heading level={3} className={styles.sectionTitle}>
            היסטוריית תנועות
          </Heading>

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

          {treasury.transactions.length === 0 && (
            <div className={styles.emptyState}>
              <Text color="secondary">אין תנועות להצגה</Text>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
