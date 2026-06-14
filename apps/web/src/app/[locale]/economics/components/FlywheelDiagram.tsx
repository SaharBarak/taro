'use client';

import { motion } from 'framer-motion';
import { GradientText } from '@/components/ui/GradientText';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading, Text } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './FlywheelDiagram.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

type Accent = 'blue' | 'green' | 'purple';

type IconName = 'resident' | 'coin' | 'globe' | 'trade' | 'split' | 'award';

interface FlywheelStep {
  id: string;
  title: string;
  description: string;
  accent: Accent;
  icon: IconName;
}

function StepIcon({ name }: { name: IconName }) {
  switch (name) {
    case 'resident':
      return (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" strokeWidth="1.8" />
        </svg>
      );
    case 'coin':
      return (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
          <path d="M12 8v8M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-4m0 0h4.5" strokeWidth="1.6" />
        </svg>
      );
    case 'globe':
      return (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
          <path d="M4 12h16M12 4c2.5 2.4 2.5 13.6 0 16M12 4c-2.5 2.4-2.5 13.6 0 16" strokeWidth="1.5" />
        </svg>
      );
    case 'trade':
      return (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 17l5-5 4 3 7-8M20 7v4m0-4h-4" strokeWidth="1.8" />
        </svg>
      );
    case 'split':
      return (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 4v6m0 0L7 16m5-6 5 6M5 18h4m6 0h4" strokeWidth="1.8" />
        </svg>
      );
    case 'award':
      return (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="9" r="5" strokeWidth="1.8" />
          <path d="M9 13.5 7.5 21l4.5-2.5L16.5 21 15 13.5" strokeWidth="1.8" />
        </svg>
      );
  }
}

const flywheelSteps: FlywheelStep[] = [
  { id: 'local', title: 'תושב מקומי', description: 'משלם ₪3 ומצביע', accent: 'blue', icon: 'resident' },
  { id: 'coin', title: 'Issue Coin נוצר', description: 'ההצבעה נרשמת בבלוקצ\'יין', accent: 'green', icon: 'coin' },
  { id: 'external', title: 'תומך חיצוני', description: 'מזהה נושא שחשוב לו', accent: 'purple', icon: 'globe' },
  { id: 'trade', title: 'קונה Issue Coins', description: 'תמיכה שמייצרת עמלות', accent: 'green', icon: 'trade' },
  { id: 'fees', title: 'עמלות מחולקות', description: '70% לקרן הרשות, 30% לפלטפורמה', accent: 'blue', icon: 'split' },
  { id: 'result', title: 'תוצאה נקבעת', description: 'תעודה דיגיטלית לכל משתתף', accent: 'purple', icon: 'award' },
];

const revenueStreams = [
  { stream: 'יצירת הצבעה', source: '₪50 להצבעה חדשה', allocation: 'תפעול הפלטפורמה' },
  { stream: 'השתתפות בהצבעה', source: '₪3 לכל הצבעה', allocation: '70% לקרן, 30% לפלטפורמה' },
  { stream: 'עמלות מסחר', source: '1% על כל עסקה', allocation: '70% לקרן, 30% לפלטפורמה' },
  { stream: 'רכישות חיצוניות', source: 'תמיכה → Issue Coins', allocation: '100% לקופת הקרן' },
];

const sustainabilityPoints = [
  'הפלטפורמה מתקיימת מהיום הראשון',
  'הרשויות מרוויחות, לא מוציאות',
  'התושבים מצביעים — ומחזיקים תעודה בעלת ערך',
  'תומכים חיצוניים מקבלים נכס סחיר ושקוף',
];

export function FlywheelDiagram() {
  const reduced = useReducedMotion();

  return (
    <section className={styles.flywheel} aria-labelledby="flywheel-title">
      <span className={styles.aura} aria-hidden />

      <div className={styles.container}>
        <header className={styles.header}>
          <AnimatedFadeInUp>
            <Eyebrow>גלגל התנופה</Eyebrow>
          </AnimatedFadeInUp>
          <Heading level={2} id="flywheel-title" className={styles.title}>
            כל הצבעה מפעילה{' '}
            <GradientText variant="brand" animated>
              מחזור כלכלי
            </GradientText>{' '}
            שמכפיל השפעה
          </Heading>
        </header>

        {/* Flywheel ring */}
        <div className={styles.ringWrap}>
          <span className={styles.ringGlow} aria-hidden />
          <ol className={styles.steps}>
            {flywheelSteps.map((step, index) => (
              <motion.li
                key={step.id}
                className={`${styles.step} ${styles[step.accent]}`}
                initial={reduced ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.08 * index }}
              >
                <span className={styles.stepNumber} aria-hidden>
                  {index + 1}
                </span>
                <span className={styles.stepIcon} aria-hidden>
                  <StepIcon name={step.icon} />
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Result highlight */}
        <AnimatedFadeInUp delay={0.1} className={styles.resultHighlight}>
          <span className={styles.resultLabel}>התוצאה</span>
          <span className={styles.resultValue}>
            הצבעה של{' '}
            <span className={styles.resultShekel} aria-hidden>
              ₪
            </span>
            3 יכולה לרכז מאחורי הנושא משאבים אמיתיים — לא רק קול.
          </span>
        </AnimatedFadeInUp>

        {/* Revenue streams */}
        <AnimatedFadeInUp delay={0.05} className={styles.revenueSection}>
          <h3 className={styles.sectionTitle}>זרמי הכנסה</h3>
          <div className={styles.revenueTable} role="table" aria-label="זרמי הכנסה">
            <div className={`${styles.tableRow} ${styles.tableHead}`} role="row">
              <span role="columnheader">זרם</span>
              <span role="columnheader">מקור</span>
              <span role="columnheader">הקצאה</span>
            </div>
            {revenueStreams.map((item, index) => (
              <motion.div
                key={item.stream}
                className={styles.tableRow}
                role="row"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.32, ease: EASE, delay: 0.06 * index }}
              >
                <span className={styles.rowStream} role="cell">
                  {item.stream}
                </span>
                <span className={styles.rowSource} role="cell">
                  {item.source}
                </span>
                <span className={styles.rowAllocation} role="cell">
                  {item.allocation}
                </span>
              </motion.div>
            ))}
          </div>
        </AnimatedFadeInUp>

        {/* Sustainability note */}
        <AnimatedFadeInUp delay={0.05} className={styles.note}>
          <div className={styles.noteHead}>
            <span className={styles.noteIcon} aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M12 21c-4-2-7-5-7-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 7-7 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <Text as="span" size="lg" weight="bold" className={styles.noteTitle}>
              ללא תלות במשקיעים חיצוניים
            </Text>
          </div>
          <ul className={styles.noteList}>
            {sustainabilityPoints.map((point) => (
              <li key={point} className={styles.noteItem}>
                <svg className={styles.check} viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path
                    d="M20 6 9 17l-5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
