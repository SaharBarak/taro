'use client';

import { motion } from 'framer-motion';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading, Text } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './HowItWorks.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

type IconName =
  | 'shield'
  | 'eye'
  | 'vote'
  | 'badge'
  | 'chart'
  | 'wallet'
  | 'globe'
  | 'coin'
  | 'trend';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: IconName;
}

function Glyph({ name }: { name: IconName }) {
  const props = {
    viewBox: '0 0 24 24',
    width: 24,
    height: 24,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Zm-2.5 9 2 2 4-4" strokeWidth="1.7" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...props}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="2.6" strokeWidth="1.7" />
        </svg>
      );
    case 'vote':
      return (
        <svg {...props}>
          <path d="M5 11l7-7 4 4-7 7H5v-4Zm9-3 2 2M4 21h16" strokeWidth="1.7" />
        </svg>
      );
    case 'badge':
      return (
        <svg {...props}>
          <circle cx="12" cy="9" r="5" strokeWidth="1.7" />
          <path d="M9 13.5 7.5 21 12 18.5 16.5 21 15 13.5" strokeWidth="1.7" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          <path d="M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6" strokeWidth="1.7" />
        </svg>
      );
    case 'wallet':
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="13" rx="2.5" strokeWidth="1.7" />
          <path d="M3 9h18M16 13h2" strokeWidth="1.7" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" strokeWidth="1.7" />
          <path d="M4 12h16M12 4c2.5 2.4 2.5 13.6 0 16M12 4c-2.5 2.4-2.5 13.6 0 16" strokeWidth="1.4" />
        </svg>
      );
    case 'coin':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" strokeWidth="1.7" />
          <path d="M12 8v8M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-4m0 0h4.5" strokeWidth="1.5" />
        </svg>
      );
    case 'trend':
      return (
        <svg {...props}>
          <path d="M4 17l5-5 4 3 7-8M20 7v4m0-4h-4" strokeWidth="1.7" />
        </svg>
      );
  }
}

const residentSteps: Step[] = [
  { number: '1', title: 'אימות זהות', description: 'התחברות עם Google ואימות מיקום ב-GPS', icon: 'shield' },
  { number: '2', title: 'צפייה בהצבעות פעילות', description: 'נושאים בעיר שלך שדורשים הכרעה', icon: 'eye' },
  { number: '3', title: 'תשלום ₪3 והצבעה', description: 'בחירת העמדה שאתה מאמין בה', icon: 'vote' },
  { number: '4', title: 'תעודת מצביע מאומת', description: 'הוכחה דיגיטלית להשתתפות שלך', icon: 'badge' },
  { number: '5', title: 'מעקב אחר הקרן', description: 'רואים את הכסף נאסף בזמן אמת', icon: 'chart' },
];

const supporterSteps: Step[] = [
  { number: '1', title: 'חיבור ארנק', description: 'חיבור ארנק לתמיכה מכל מקום בעולם', icon: 'wallet' },
  { number: '2', title: 'גילוי נושאים מובילים', description: 'נושאים אזרחיים שחשובים לך', icon: 'globe' },
  { number: '3', title: 'רכישת Issue Coins', description: 'תמיכה בנושאים שאתה מאמין בהם', icon: 'coin' },
  { number: '4', title: 'מסחר לפי הסנטימנט', description: 'הערך משקף את מידת התמיכה בנושא', icon: 'trend' },
  { number: '5', title: 'תעודת תומך קהילתי', description: 'תג שמתקבל בסיום ההצבעה', icon: 'badge' },
];

function Track({
  accent,
  icon,
  title,
  badge,
  steps,
  delay,
  reduced,
}: {
  accent: 'blue' | 'purple';
  icon: IconName;
  title: string;
  badge: string;
  steps: Step[];
  delay: number;
  reduced: boolean;
}) {
  return (
    <motion.article
      className={`${styles.track} ${styles[accent]}`}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      <div className={styles.trackHeader}>
        <span className={styles.trackIcon} aria-hidden>
          <Glyph name={icon} />
        </span>
        <h3 className={styles.trackTitle}>{title}</h3>
        <span className={styles.trackBadge}>{badge}</span>
      </div>

      <ol className={styles.stepsList}>
        {steps.map((step) => (
          <li key={step.number} className={styles.stepItem}>
            <span className={styles.stepIcon} aria-hidden>
              <Glyph name={step.icon} />
            </span>
            <div className={styles.stepContent}>
              <h4 className={styles.stepTitle}>
                <span className={styles.stepNumber} aria-hidden>
                  {step.number}
                </span>
                {step.title}
              </h4>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </motion.article>
  );
}

export function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section className={styles.howItWorks} aria-labelledby="how-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <AnimatedFadeInUp>
            <Eyebrow>שני מסלולים</Eyebrow>
          </AnimatedFadeInUp>
          <Heading level={2} id="how-title" className={styles.title}>
            איך משתתפים — כתושב או כתומך
          </Heading>
          <AnimatedFadeInUp delay={0.1}>
            <Text as="p" size="lg" color="secondary" className={styles.subtitle}>
              תושב מקומי שמצביע בנושאים של העיר שלו, או תומך חיצוני שמזרים משאבים לנושא שחשוב לו.
            </Text>
          </AnimatedFadeInUp>
        </header>

        <div className={styles.tracksContainer}>
          <Track
            accent="blue"
            icon="shield"
            title="לתושבים"
            badge="מצביעים מאומתים"
            steps={residentSteps}
            delay={0.1}
            reduced={reduced}
          />
          <Track
            accent="purple"
            icon="globe"
            title="לתומכים"
            badge="תמיכה מכל העולם"
            steps={supporterSteps}
            delay={0.2}
            reduced={reduced}
          />
        </div>

        <AnimatedFadeInUp delay={0.1} className={styles.feeNote}>
          <span className={styles.feeNoteIcon} aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M12 3v18M7 7h7a3 3 0 0 1 0 6H7m0 0h8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className={styles.feeNoteContent}>
            <strong>70% מכל עמלות המסחר זורמים לקרן הקהילתית של הרשות</strong>
            <span className={styles.feeNoteSub}>30% מממנים את התחזוקה והפיתוח של הפלטפורמה</span>
          </div>
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
