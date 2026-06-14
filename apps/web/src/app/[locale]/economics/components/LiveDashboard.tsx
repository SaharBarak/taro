'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading, Text } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './LiveDashboard.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

interface NetworkStats {
  totalRaised: number;
  activeVotes: number;
  totalVoters: number;
  municipalities: number;
  weeklyGrowth: number;
}

interface TrendingCoin {
  voteId: string;
  voteTitle: string;
  municipality: string;
  priceChange24h: number;
  volume24h: number;
  totalRaised: number;
  tokenMint?: string;
  imageUrl?: string | null;
}

export function LiveDashboard() {
  const reduced = useReducedMotion();
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, coinsRes] = await Promise.all([
          fetch('/api/stats/network'),
          fetch('/api/bags/trending?limit=5'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        if (coinsRes.ok) {
          const coinsData = await coinsRes.json();
          setCoins(coinsData.coins || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('לא הצלחנו לטעון את הנתונים כרגע.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (num: number) => new Intl.NumberFormat('he-IL').format(num);

  const formatPercent = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${(num * 100).toFixed(0)}%`;
  };

  // Pilot honesty: treat "no real activity yet" as a composed pre-launch state.
  const hasActivity = Boolean(stats && stats.totalVoters > 0) || coins.length > 0;

  const statCards = [
    { label: 'סה״כ גויס לקרנות', value: stats ? formatCurrency(stats.totalRaised) : '₪0' },
    { label: 'הצבעות פעילות', value: stats ? formatNumber(stats.activeVotes) : '0' },
    { label: 'תושבים שהצביעו', value: stats ? formatNumber(stats.totalVoters) : '0' },
    { label: 'רשויות מקומיות', value: stats ? formatNumber(stats.municipalities) : '0' },
  ];

  return (
    <section className={styles.dashboard} aria-labelledby="dashboard-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <AnimatedFadeInUp>
            <Eyebrow live>הדשבורד החי</Eyebrow>
          </AnimatedFadeInUp>
          <Heading level={2} id="dashboard-title" className={styles.title}>
            כל שקל בקרן — גלוי בזמן אמת
          </Heading>
          <AnimatedFadeInUp delay={0.1}>
            <Text as="p" size="lg" color="secondary" className={styles.subtitle}>
              נתונים חיים מכל הרשויות המקומיות ברשת. שקיפות מלאה, בלי חדרים סגורים.
            </Text>
          </AnimatedFadeInUp>
        </header>

        {loading ? (
          <div className={styles.skeletonGrid} aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.notice} role="status">
            <span className={styles.noticeIcon} aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path
                  d="M12 8v5m0 3h.01M12 3 2 20h20L12 3Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <Text as="p" size="base" weight="medium" className={styles.noticeText}>
              {error}
            </Text>
          </div>
        ) : !hasActivity ? (
          <AnimatedFadeInUp className={styles.notice}>
            <span className={`${styles.noticeIcon} ${styles.noticeIconLive}`} aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path
                  d="M3 13h4l2 5 4-12 2 5h6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className={styles.noticeBody}>
              <Text as="p" size="lg" weight="bold" className={styles.noticeTitle}>
                הדשבורד החי ייפתח עם ההצבעה הראשונה
              </Text>
              <Text as="p" size="base" color="secondary" className={styles.noticeText}>
                ברגע שהקרן הקהילתית הראשונה תיפתח — כל גיוס, כל עסקה וכל מגמה יופיעו כאן בזמן אמת.
              </Text>
            </div>
          </AnimatedFadeInUp>
        ) : (
          <>
            <div className={styles.statsGrid}>
              {statCards.map((card, index) => (
                <motion.div
                  key={card.label}
                  className={styles.statCard}
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.06 * index }}
                >
                  <span className={styles.statValue}>{card.value}</span>
                  <span className={styles.statLabel}>{card.label}</span>
                </motion.div>
              ))}
            </div>

            {coins.length > 0 && (
              <AnimatedFadeInUp delay={0.1} className={styles.trendingSection}>
                <h3 className={styles.sectionTitle}>Issue Coins מובילים</h3>
                <div className={styles.coinsList}>
                  {coins.map((coin, index) => (
                    <motion.div
                      key={coin.voteId}
                      className={styles.coinCard}
                      initial={reduced ? false : { opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ duration: 0.32, ease: EASE, delay: 0.06 * index }}
                    >
                      <div className={styles.coinIcon}>
                        {coin.imageUrl ? (
                          <Image
                            src={coin.imageUrl}
                            alt={coin.voteTitle}
                            width={40}
                            height={40}
                            unoptimized
                          />
                        ) : (
                          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                            <path
                              d="M4 21h16M6 21V9l6-4 6 4v12M10 21v-5h4v5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div className={styles.coinInfo}>
                        <span className={styles.coinTitle}>{coin.voteTitle}</span>
                        <span className={styles.coinMunicipality}>{coin.municipality}</span>
                      </div>
                      <div className={styles.coinStats}>
                        <span
                          className={`${styles.coinChange} ${
                            coin.priceChange24h >= 0 ? styles.positive : styles.negative
                          }`}
                        >
                          {formatPercent(coin.priceChange24h)}
                        </span>
                        <span className={styles.coinRaised}>
                          {formatCurrency(coin.totalRaised)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatedFadeInUp>
            )}
          </>
        )}
      </div>
    </section>
  );
}
