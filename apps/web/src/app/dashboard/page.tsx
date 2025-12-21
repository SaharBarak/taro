'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import styles from './page.module.css';

interface DashboardStats {
  totalVotes: number;
  activeVotes: number;
  tokensEarned: number;
  votesCreated: number;
}

interface RecentVote {
  id: string;
  title: string;
  status: 'active' | 'ended';
  votedAt: string;
  option: string;
}

// Mock data - will be replaced with API
const mockStats: DashboardStats = {
  totalVotes: 12,
  activeVotes: 3,
  tokensEarned: 62,
  votesCreated: 1,
};

const mockRecentVotes: RecentVote[] = [
  {
    id: '1',
    title: 'הקמת גן שעשועים חדש ברובע הצפוני',
    status: 'active',
    votedAt: '2024-12-18',
    option: 'בעד',
  },
  {
    id: '2',
    title: 'שיפוץ מתחם הספורט העירוני',
    status: 'ended',
    votedAt: '2024-12-15',
    option: 'בעד עם שינויים',
  },
  {
    id: '3',
    title: 'הוספת קווי אוטובוס בשעות הערב',
    status: 'ended',
    votedAt: '2024-12-10',
    option: 'בעד',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVotes, setRecentVotes] = useState<RecentVote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Fetch dashboard data
    const fetchData = async () => {
      // TODO: Replace with actual API calls
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStats(mockStats);
      setRecentVotes(mockRecentVotes);
      setLoading(false);
    };

    if (isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>טוען...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Welcome Section */}
          <motion.div
            className={styles.welcome}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>שלום, {user?.firstName || 'משתמש'}!</h1>
            <p>ברוכים הבאים לוח הבקרה שלכם</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className={styles.statsGrid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🗳️</div>
              <div className={styles.statValue}>{stats?.totalVotes || 0}</div>
              <div className={styles.statLabel}>סה״כ הצבעות</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚡</div>
              <div className={styles.statValue}>{stats?.activeVotes || 0}</div>
              <div className={styles.statLabel}>הצבעות פעילות</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🪙</div>
              <div className={styles.statValue}>{stats?.tokensEarned || 0}</div>
              <div className={styles.statLabel}>טוקנים</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✨</div>
              <div className={styles.statValue}>{stats?.votesCreated || 0}</div>
              <div className={styles.statLabel}>הצבעות שיצרתם</div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className={styles.quickActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>פעולות מהירות</h2>
            <div className={styles.actionButtons}>
              <Button onClick={() => router.push('/votes')}>
                צפייה בהצבעות פעילות
              </Button>
              <Button variant="secondary" onClick={() => router.push('/votes/create')}>
                יצירת הצבעה חדשה
              </Button>
            </div>
          </motion.div>

          {/* Recent Votes */}
          <motion.div
            className={styles.recentVotes}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2>ההצבעות האחרונות שלכם</h2>
            {recentVotes.length === 0 ? (
              <div className={styles.emptyState}>
                <p>עדיין לא הצבעתם</p>
                <Button onClick={() => router.push('/votes')}>
                  התחילו להצביע
                </Button>
              </div>
            ) : (
              <div className={styles.votesList}>
                {recentVotes.map((vote, index) => (
                  <motion.div
                    key={vote.id}
                    className={styles.voteItem}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    onClick={() => router.push(`/votes/${vote.id}`)}
                  >
                    <div className={styles.voteInfo}>
                      <h3>{vote.title}</h3>
                      <div className={styles.voteMeta}>
                        <span className={styles.voteOption}>הצבעתם: {vote.option}</span>
                        <span className={styles.voteDate}>{vote.votedAt}</span>
                      </div>
                    </div>
                    <div className={`${styles.voteStatus} ${styles[vote.status]}`}>
                      {vote.status === 'active' ? 'פעיל' : 'הסתיים'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Token Balance Card */}
          <motion.div
            className={styles.tokenCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className={styles.tokenInfo}>
              <h2>יתרת טוקנים</h2>
              <div className={styles.tokenBalance}>{stats?.tokensEarned || 0}</div>
              <p>כל הצבעה מזכה ב-1 טוקן. ניתן להמיר טוקנים להנחות והטבות.</p>
            </div>
            <div className={styles.tokenActions}>
              <Button variant="secondary" size="small">
                היסטוריית טוקנים
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
