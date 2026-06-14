'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './Technology.module.css';

type Accent = 'blue' | 'green' | 'purple';

interface Tech {
  key: string;
  title: string;
  description: string;
  accent: Accent;
  glyph: React.ReactNode;
}

const TECHNOLOGIES: Tech[] = [
  {
    key: 'location',
    title: 'אימות מיקום',
    description:
      'לפני שמצביעים, המכשיר מאשר שאתם נמצאים בתחום הרשות. כך כל קול שנספר באמת שייך לאנשים שחיים במקום — ולא למישהו מבחוץ.',
    accent: 'blue',
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24 4c8 0 14 6 14 14 0 9-14 26-14 26S10 27 10 18C10 10 16 4 24 4Z" stroke="currentColor" strokeWidth="2.4" fill="currentColor" fillOpacity="0.12" />
        <circle cx="24" cy="18" r="5" stroke="currentColor" strokeWidth="2.4" fill="none" />
      </svg>
    ),
  },
  {
    key: 'identity',
    title: 'זהות מאומתת',
    description:
      'כל משתתף מאומת כתושב אמיתי אחד, פעם אחת בלבד. בלי בוטים, בלי כפילויות, בלי חשבונות מזויפים — קול אחד לכל אדם.',
    accent: 'green',
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.4" fill="none" />
        <path d="M10 40c0-7.5 6.3-13 14-13s14 5.5 14 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55" />
        <path d="M31 33l3.2 3.2L41 29" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'ledger',
    title: 'רישום בלתי הפיך',
    description:
      'אחרי הספירה, כל הצבעה נחתמת ברשומה ציבורית שאי אפשר לשנות בדיעבד. כל אחד יכול לבדוק שהתוצאה שפורסמה היא בדיוק מה שהתושבים אמרו.',
    accent: 'purple',
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.1" />
        <rect x="26" y="9" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="2.2" fill="none" opacity="0.55" />
        <rect x="17.5" y="26" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.1" />
        <path d="M22 15.5h4M30 22v4M22 32.5h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Technology() {
  const reducedMotion = useReducedMotion();

  return (
    <section className={styles.technology} aria-label="הטכנולוגיה">
      <div className={styles.mesh} aria-hidden />

      <div className={styles.inner}>
        <div className={styles.header}>
          <Eyebrow>הטכנולוגיה</Eyebrow>

          <AnimatedFadeInUp>
            <Heading level={2} weight="extrabold" className={styles.headline}>
              שלוש שכבות שהופכות קול לאמין.
            </Heading>
          </AnimatedFadeInUp>

          <AnimatedFadeInUp delay={0.1}>
            <p className={styles.sub}>
              בלי מילים גדולות ובלי קסמים — שלושה מנגנונים פשוטים שעובדים יחד כדי
              שכל מספר שתַּרְאוּ מפרסם יהיה מדויק, הוגן וניתן לבדיקה.
            </p>
          </AnimatedFadeInUp>
        </div>

        <div className={styles.grid}>
          {TECHNOLOGIES.map((tech, i) => (
            <motion.div
              key={tech.key}
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard
                variant="interactive"
                glow={tech.accent}
                className={`${styles.techCard} ${styles[`accent_${tech.accent}`]}`}
              >
                <span className={styles.glyph}>{tech.glyph}</span>
                <h3 className={styles.techName}>{tech.title}</h3>
                <p className={styles.techLine}>{tech.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
