'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GlassCard, GradientText, RippleButton, Eyebrow } from '@/components/ui';
import { useReducedMotion } from '@/hooks';
import styles from './page.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ----------------------------- inline SVG icons ---------------------------- */

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3l7 3v5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3Z M9 12l2 2 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NoTrackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21s7-5.4 7-11a7 7 0 0 0-11.6-5.2 M5.4 7.6A7 7 0 0 0 5 10c0 5.6 7 11 7 11 M4 4l16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M5 12.5l4 4 10-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 7l10 10M17 7L7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z M12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M20 12a8 8 0 1 1-2.34-5.66 M20 4v4h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z M11 18h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------ reassurance data --------------------------- */

const DO_ITEMS = [
  'בודקים מיקום פעם אחת, בדיוק ברגע ההצבעה',
  'מוודאים שאתם נמצאים בתחום הרשות',
  'מאשרים שכל קול בשכונה הוא של תושב אמיתי',
];

const DONT_ITEMS = [
  'לא שומרים את המסלולים שלכם',
  'לא משתפים את המיקום עם אף גורם',
  'לא עוקבים אחריכם בין הצבעה להצבעה',
];

export default function VerificationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in?redirect=/verification');
    }
  }, [isLoading, isAuthenticated, router]);

  const fadeIn = (delay = 0) => ({
    initial: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: reducedMotion ? 0 : delay, ease: EASE },
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.mesh} aria-hidden />
          <div className={styles.container} aria-busy="true" aria-label="טוען">
            <div className={styles.skeletonContainer}>
              <div className={styles.skeletonHeader}>
                <div className={`${styles.skelLine} ${styles.skelTitle}`} />
                <div className={`${styles.skelLine} ${styles.skelLead}`} />
                <div className={`${styles.skelLine} ${styles.skelLeadShort}`} />
              </div>
              <div className={styles.skeletonGrid}>
                <div className={styles.skelCard} />
                <div className={styles.skelCard} />
              </div>
              <div className={styles.skelPanel} />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const verificationStatus = user?.verificationStatus;
  const phase = verificationStatus?.phase || 'not_started';
  const checkInsCompleted = verificationStatus?.checkInsCompleted || 0;
  const checkInsTotal = verificationStatus?.checkInsTotal || 0;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.mesh} aria-hidden />
        <div className={styles.container}>
          <motion.header className={styles.header} {...fadeIn()}>
            <Eyebrow>אימות תושב</Eyebrow>
            <h1 className={styles.heading}>
              מאמתים שאתם מכאן —{' '}
              <span className={styles.headingAccent}>
                <GradientText variant="green">לא עוקבים אחריכם.</GradientText>
              </span>
            </h1>
            <p className={styles.lead}>
              בדיקת מיקום חד-פעמית ברגע ההצבעה מוודאת שאתם תושבי הרשות. לא שומרים
              מסלולים, לא משתפים מיקום, לא עוקבים. זה מה שמבטיח שכל קול בשכונה הוא
              של תושב אמיתי.
            </p>
          </motion.header>

          {/* Reassurance: what we check / what we don't do */}
          <motion.div className={styles.reassureGrid} {...fadeIn(0.1)}>
            <GlassCard
              variant="static"
              glow="green"
              className={`${styles.reassureCard} ${styles.cardDo}`}
            >
              <div className={styles.reassureInner}>
                <div className={styles.reassureHead}>
                  <span className={`${styles.reassureBadge} ${styles.badgeDo}`}>
                    <ShieldCheckIcon />
                  </span>
                  <h2 className={styles.reassureTitle}>מה אנחנו בודקים</h2>
                </div>
                <ul className={styles.reassureList}>
                  {DO_ITEMS.map((item) => (
                    <li key={item} className={styles.reassureItem}>
                      <span className={`${styles.itemIcon} ${styles.itemIconDo}`}>
                        <CheckIcon />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>

            <GlassCard variant="static" className={styles.reassureCard}>
              <div className={styles.reassureInner}>
                <div className={styles.reassureHead}>
                  <span className={`${styles.reassureBadge} ${styles.badgeDont}`}>
                    <NoTrackIcon />
                  </span>
                  <h2 className={styles.reassureTitle}>מה אנחנו לא עושים</h2>
                </div>
                <ul className={styles.reassureList}>
                  {DONT_ITEMS.map((item) => (
                    <li key={item} className={styles.reassureItem}>
                      <span className={`${styles.itemIcon} ${styles.itemIconDont}`}>
                        <CrossIcon />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </motion.div>

          {/* Phase-driven state panel */}
          {phase === 'not_started' && (
            <motion.div className={styles.panel} {...fadeIn(0.2)}>
              <GlassCard variant="static" glow="blue">
                <div className={styles.panelInner}>
                  <div className={styles.panelHead}>
                    <span className={`${styles.statusIcon} ${styles.iconBlue}`}>
                      <LocationIcon />
                    </span>
                    <h2 className={styles.panelTitle}>התחילו את תהליך האימות</h2>
                  </div>
                  <p className={styles.panelText}>
                    תהליך האימות נמשך 21 יום ודורש 5-7 צ׳ק-אינים במיקום שלכם.
                    תקבלו התראות בזמנים אקראיים לביצוע צ׳ק-אין.
                  </p>

                  <div className={styles.steps}>
                    {[
                      { n: 1, title: 'התחילו את התהליך', note: 'לחצו על הכפתור למטה להתחלה' },
                      { n: 2, title: 'קבלו התראות', note: 'תקבלו 5-7 התראות בזמנים אקראיים' },
                      { n: 3, title: 'בצעו צ׳ק-אין', note: 'אשרו את המיקום שלכם באפליקציה' },
                      { n: 4, title: 'השלימו את האימות', note: 'לאחר 21 יום תוכלו להצביע' },
                    ].map((step) => (
                      <div key={step.n} className={styles.step}>
                        <span className={styles.stepNumber}>{step.n}</span>
                        <span className={styles.stepBody}>
                          <span className={styles.stepTitle}>{step.title}</span>
                          <span className={styles.stepNote}>{step.note}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.actions}>
                    <RippleButton size="lg" onClick={() => alert('Coming soon - use mobile app')}>
                      התחל אימות
                    </RippleButton>
                    <span className={styles.mobileNote}>
                      <PhoneIcon />
                      לחוויה הטובה ביותר, השתמשו באפליקציה במכשיר הנייד
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {phase === 'in_progress' && (
            <motion.div className={styles.panel} {...fadeIn(0.2)}>
              <GlassCard variant="static" glow="green">
                <div className={styles.panelInner}>
                  <div className={styles.panelHead}>
                    <span className={`${styles.statusIcon} ${styles.iconGreen}`}>
                      <ProgressIcon />
                    </span>
                    <h2 className={styles.panelTitle}>האימות בתהליך</h2>
                  </div>

                  <div className={styles.progress}>
                    <div className={styles.progressHeader}>
                      <span>התקדמות</span>
                      <span>
                        {checkInsCompleted}/{checkInsTotal} צ׳ק-אינים
                      </span>
                    </div>
                    <div
                      className={styles.progressBar}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={checkInsTotal}
                      aria-valuenow={checkInsCompleted}
                    >
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${checkInsTotal > 0 ? (checkInsCompleted / checkInsTotal) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.statusInfo}>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>ימים שנותרו</span>
                      <span className={styles.statusValue}>
                        {verificationStatus?.startedAt
                          ? Math.max(
                              0,
                              21 -
                                Math.floor(
                                  (Date.now() - new Date(verificationStatus.startedAt).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                            )
                          : 21}
                      </span>
                    </div>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>צ׳ק-אינים נותרו</span>
                      <span className={styles.statusValue}>
                        {checkInsTotal - checkInsCompleted}
                      </span>
                    </div>
                  </div>

                  <span className={styles.mobileNote}>
                    <PhoneIcon />
                    המתינו להתראה הבאה באפליקציה לביצוע צ׳ק-אין
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {phase === 'completed' && (
            <motion.div className={styles.panel} {...fadeIn(0.2)}>
              <GlassCard variant="static" glow="green" className={styles.cardDo}>
                <div className={styles.panelInner}>
                  <div className={styles.panelHead}>
                    <span className={`${styles.statusIcon} ${styles.iconGreen}`}>
                      <ShieldCheckIcon />
                    </span>
                    <h2 className={styles.panelTitle}>האימות הושלם בהצלחה!</h2>
                  </div>
                  <p className={styles.panelText}>
                    כל הכבוד! סיימתם את תהליך אימות התושבות ועכשיו תוכלו להצביע
                    על נושאים מקומיים בקהילה שלכם.
                  </p>
                  <div className={styles.actions}>
                    <RippleButton size="lg" onClick={() => router.push('/votes')}>
                      צפו בהצבעות פעילות
                    </RippleButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {phase === 'failed' && (
            <motion.div className={styles.panel} {...fadeIn(0.2)}>
              <GlassCard variant="static">
                <div className={styles.panelInner}>
                  <div className={styles.panelHead}>
                    <span className={`${styles.statusIcon} ${styles.iconRed}`}>
                      <CrossIcon />
                    </span>
                    <h2 className={styles.panelTitle}>האימות נכשל</h2>
                  </div>
                  <p className={styles.panelText}>
                    לצערנו, תהליך האימות לא הושלם בהצלחה. זה יכול לקרות אם
                    פספסתם יותר מדי צ׳ק-אינים או אם המיקום שלכם לא היה ברשות
                    הנבחרת.
                  </p>
                  <div className={styles.actions}>
                    <RippleButton size="lg" onClick={() => alert('Coming soon')}>
                      התחל מחדש
                    </RippleButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
