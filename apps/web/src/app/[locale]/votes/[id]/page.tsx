'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { useAuthStore } from '@/stores/authStore';

interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

interface Vote {
  id: string;
  title: string;
  description: string;
  municipality: string;
  status: 'active' | 'ended' | 'pending';
  options: VoteOption[];
  startDate: string;
  endDate: string;
  participantCount: number;
  creator: {
    name: string;
  };
}

function getTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'הסתיים';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} ימים`;
  return `${hours} שעות`;
}

export default function VoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const fetchVote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/votes/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setVote(data);
        // Check if user already voted
        if (data.userVote) {
          setHasVoted(true);
          setSelectedOption(data.userVote.optionId);
        }
      } else if (response.status === 404) {
        setError('ההצבעה לא נמצאה');
        setVote(null);
      } else {
        setError('שגיאה בטעינת ההצבעה');
        setVote(null);
      }
    } catch {
      setError('שגיאה בטעינת ההצבעה. בדקו את חיבור האינטרנט.');
      setVote(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchVote();
  }, [fetchVote]);

  // Handle payment success redirect - must be before early returns
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment') === 'success') {
      setHasVoted(true);
      // Clean up URL
      router.replace(`/votes/${params.id}`);
      // Refresh vote data
      fetchVote();
    }
  }, [params.id, router, fetchVote]);

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.skeletonHead}>
              <span className={`${styles.shimmer} ${styles.skBadge}`} />
              <span className={`${styles.shimmer} ${styles.skMeta}`} />
            </div>
            <span className={`${styles.shimmer} ${styles.skTitle}`} />
            <span className={`${styles.shimmer} ${styles.skStats}`} />
            <span className={`${styles.shimmer} ${styles.skCard}`} />
            <span className={`${styles.shimmer} ${styles.skCard}`} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!vote || error) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.errorContainer}>
            <span className={styles.errorIcon} aria-hidden>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
              </svg>
            </span>
            <h1>{error || 'ההצבעה לא נמצאה'}</h1>
            <p>לא ניתן לטעון את פרטי ההצבעה</p>
            <Button onClick={() => router.push('/votes')}>חזרה להצבעות</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
  const timeRemaining = getTimeRemaining(vote.endDate);
  const isActive = vote.status === 'active';

  const handleShare = async () => {
    if (typeof window === 'undefined' || !vote) return;

    const shareUrl = window.location.href;
    const shareData = {
      title: vote.title,
      text: vote.title,
      url: shareUrl,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('הקישור הועתק ללוח');
      }
    } catch (err) {
      // Ignore user-cancelled share dialogs
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Share error:', err);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !vote) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/sign-in?redirect=' + encodeURIComponent(`/votes/${params.id}`));
      return;
    }

    setSubmitting(true);
    try {
      // Create Paddle payment
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'vote_participation',
          voteId: params.id,
          optionId: selectedOption,
          voteTitle: vote.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const data = await response.json();

      // Redirect to Paddle payment page
      if (data.payment?.paymentUrl) {
        window.location.href = data.payment.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err: unknown) {
      console.error('Payment error:', err);
      alert(err instanceof Error ? err.message : 'שגיאה בתשלום');
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Back Button */}
          <button className={styles.backButton} onClick={() => router.back()}>
            <svg className={styles.backArrow} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            חזרה
          </button>

          {/* Vote Header */}
          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.statusBadge} data-status={vote.status}>
              {isActive ? `נותרו ${timeRemaining}` : 'ההצבעה הסתיימה'}
            </div>
            <span className={styles.municipality}>{vote.municipality}</span>
          </motion.div>

          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {vote.title}
          </motion.h1>

          {/* Stats */}
          <motion.div
            className={styles.stats}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.stat}>
              <span className={styles.statValue}>{totalVotes.toLocaleString('he-IL')}</span>
              <span className={styles.statLabel}>הצבעות</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>{vote.options.length}</span>
              <span className={styles.statLabel}>אפשרויות</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>{timeRemaining}</span>
              <span className={styles.statLabel}>נותרו</span>
            </div>
          </motion.div>

          <div className={styles.content}>
            {/* Description */}
            <motion.div
              className={styles.descriptionCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2>תיאור ההצעה</h2>
              <p className={styles.description}>{vote.description}</p>
              <div className={styles.creator}>
                <span>נוצר על ידי:</span>
                <strong>{vote.creator.name}</strong>
              </div>
            </motion.div>

            {/* Options */}
            <motion.div
              className={styles.optionsCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2>{hasVoted ? 'תוצאות' : 'אפשרויות להצבעה'}</h2>

              <div className={styles.options}>
                {vote.options.map((option, index) => {
                  const percentage = totalVotes > 0
                    ? Math.round((option.votes / totalVotes) * 100)
                    : 0;
                  const isSelected = selectedOption === option.id;

                  return (
                    <motion.button
                      key={option.id}
                      className={`${styles.option} ${isSelected ? styles.selected : ''} ${hasVoted ? styles.voted : ''}`}
                      onClick={() => !hasVoted && setSelectedOption(option.id)}
                      disabled={hasVoted || !isActive}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    >
                      <div className={styles.optionContent}>
                        <span className={styles.optionText}>{option.text}</span>
                        {(hasVoted || !isActive) && (
                          <span className={styles.optionVotes}>
                            {option.votes.toLocaleString('he-IL')} הצבעות
                          </span>
                        )}
                      </div>
                      {(hasVoted || !isActive) && (
                        <div className={styles.optionBar}>
                          <motion.div
                            className={styles.optionProgress}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                          />
                        </div>
                      )}
                      {(hasVoted || !isActive) && (
                        <span className={styles.optionPercentage}>{percentage}%</span>
                      )}
                      {isSelected && !hasVoted && (
                        <span className={styles.checkmark} aria-hidden>
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {isActive && !hasVoted && (
                <div className={styles.voteAction}>
                  <p className={styles.voteInfo}>
                    עלות הצבעה: <strong>₪3</strong> • נרשם בבלוקצ׳יין
                  </p>
                  <Button
                    onClick={handleVote}
                    disabled={!selectedOption || submitting}
                    size="large"
                  >
                    {submitting ? 'מעבד תשלום...' : 'הצביעו עכשיו'}
                  </Button>
                </div>
              )}

              {hasVoted && (
                <div className={styles.votedMessage}>
                  <span className={styles.votedIcon} aria-hidden>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  הצבעתכם נקלטה בהצלחה
                </div>
              )}
            </motion.div>
          </div>

          {/* Share */}
          <motion.div
            className={styles.shareSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <button className={styles.shareButton} onClick={handleShare}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" strokeLinecap="round" />
              </svg>
              שתפו את ההצבעה
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
